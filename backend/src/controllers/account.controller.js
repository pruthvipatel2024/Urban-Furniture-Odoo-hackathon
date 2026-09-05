const { Op } = require('sequelize');
const { ChartOfAccount, JournalItem, JournalEntry, Journal } = require('../models');
const ApiResponse = require('../utils/response');
const { logAudit } = require('../middleware/audit.middleware');
const { add, subtract } = require('../utils/decimal');

const { sequelize } = require('../config/database');

class AccountController {
  /**
   * GET /api/accounts
   */
  static async getAccounts(req, res, next) {
    try {
      const { type, search, includeArchived = 'false' } = req.query;
      const where = {};

      if (includeArchived !== 'true') {
        where.is_archived = false;
      }
      if (type && ['asset', 'liability', 'expense', 'income', 'capital'].includes(type)) {
        where.account_type = type;
      }
      if (search) {
        where.account_name = { [Op.like]: `%${search}%` };
      }

      const accounts = await ChartOfAccount.findAll({
        where,
        order: [['account_type', 'ASC'], ['account_name', 'ASC']],
      });

      // Grouped aggregation on JournalItem to prevent duplicate account rows
      const journalSums = await JournalItem.findAll({
        attributes: [
          'account_id',
          [sequelize.fn('SUM', sequelize.col('debit')), 'total_debit'],
          [sequelize.fn('SUM', sequelize.col('credit')), 'total_credit']
        ],
        group: ['account_id'],
        raw: true
      });

      const sumsMap = new Map();
      for (const item of journalSums) {
        sumsMap.set(Number(item.account_id), {
          total_debit: Number(item.total_debit || 0),
          total_credit: Number(item.total_credit || 0),
        });
      }

      const enrichedAccounts = accounts.map(acc => {
        const sums = sumsMap.get(acc.id) || { total_debit: 0, total_credit: 0 };
        const debit = sums.total_debit;
        const credit = sums.total_credit;
        let current_balance = 0;

        // Assets and Expenses increase on Debit; Liabilities, Income, Capital increase on Credit
        if (['asset', 'expense'].includes(acc.account_type)) {
          current_balance = subtract(debit, credit);
        } else {
          current_balance = subtract(credit, debit);
        }

        const json = acc.toJSON();
        return {
          ...json,
          total_debit: debit,
          total_credit: credit,
          current_balance,
        };
      });

      return ApiResponse.success(res, 'Chart of Accounts retrieved successfully', enrichedAccounts);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/accounts/:id
   */
  static async getAccountById(req, res, next) {
    try {
      const account = await ChartOfAccount.findByPk(req.params.id);
      if (!account) {
        return ApiResponse.notFound(res, `Account with ID ${req.params.id} not found.`);
      }

      return ApiResponse.success(res, 'Account retrieved successfully', account);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/accounts
   */
  static async createAccount(req, res, next) {
    try {
      const account_name = req.body.account_name || req.body.name;
      const account_type = (req.body.account_type || req.body.type || '').trim().toLowerCase();

      if (!account_name || !account_type) {
        return ApiResponse.badRequest(res, 'Account name and type (asset, liability, expense, income, capital) are required.');
      }

      if (!['asset', 'liability', 'expense', 'income', 'capital'].includes(account_type)) {
        return ApiResponse.badRequest(res, 'Account type must be "asset", "liability", "expense", "income", or "capital".');
      }

      const existing = await ChartOfAccount.findOne({
        where: { account_name: account_name.trim() },
      });

      if (existing) {
        return ApiResponse.conflict(res, `An account named "${account_name}" already exists.`);
      }

      const account = await ChartOfAccount.create({
        account_name: account_name.trim(),
        account_type,
        is_archived: false,
      });

      await logAudit({
        req,
        action: 'CREATE_ACCOUNT',
        entity: 'ChartOfAccount',
        entityId: account.id,
        newValue: account.toJSON(),
      });

      return ApiResponse.created(res, 'Account created successfully', account);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/accounts/:id
   */
  static async updateAccount(req, res, next) {
    try {
      const account = await ChartOfAccount.findByPk(req.params.id);
      if (!account) {
        return ApiResponse.notFound(res, `Account with ID ${req.params.id} not found.`);
      }

      const oldVal = account.toJSON();
      const account_name = req.body.account_name || req.body.name;
      const account_type = req.body.account_type || req.body.type;

      if (account_name && typeof account_name === 'string' && account_name.trim()) {
        account.account_name = account_name.trim();
      }
      if (account_type && typeof account_type === 'string' && account_type.trim()) {
        const normType = account_type.trim().toLowerCase();
        if (['asset', 'liability', 'expense', 'income', 'capital'].includes(normType)) {
          account.account_type = normType;
        }
      }

      await account.save();

      await logAudit({
        req,
        action: 'UPDATE_ACCOUNT',
        entity: 'ChartOfAccount',
        entityId: account.id,
        oldValue: oldVal,
        newValue: account.toJSON(),
      });

      return ApiResponse.success(res, 'Account updated successfully', account);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/accounts/:id (Archive)
   */
  static async archiveAccount(req, res, next) {
    try {
      const account = await ChartOfAccount.findByPk(req.params.id);
      if (!account) {
        return ApiResponse.notFound(res, `Account with ID ${req.params.id} not found.`);
      }

      account.is_archived = true;
      await account.save();

      await logAudit({
        req,
        action: 'ARCHIVE_ACCOUNT',
        entity: 'ChartOfAccount',
        entityId: account.id,
      });

      return ApiResponse.success(res, `Account "${account.account_name}" archived successfully`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/accounts/:id/ledger (Drilldown ledger)
   */
  static async getAccountLedger(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const account = await ChartOfAccount.findByPk(req.params.id);

      if (!account) {
        return ApiResponse.notFound(res, `Account with ID ${req.params.id} not found.`);
      }

      const entryDateFilter = {};
      if (startDate && endDate) {
        entryDateFilter.entry_date = { [Op.between]: [startDate, endDate] };
      } else if (startDate) {
        entryDateFilter.entry_date = { [Op.gte]: startDate };
      } else if (endDate) {
        entryDateFilter.entry_date = { [Op.lte]: endDate };
      }

      const items = await JournalItem.findAll({
        where: { account_id: account.id },
        include: [
          {
            model: JournalEntry,
            as: 'journalEntry',
            where: Object.keys(entryDateFilter).length > 0 ? entryDateFilter : undefined,
            include: [{ model: Journal, as: 'journal' }],
          },
        ],
        order: [[{ model: JournalEntry, as: 'journalEntry' }, 'entry_date', 'ASC'], ['id', 'ASC']],
      });

      let runningBalance = 0;
      let totalDebits = 0;
      let totalCredits = 0;

      const ledgerEntries = items.map((item) => {
        const debit = Number(item.debit);
        const credit = Number(item.credit);

        totalDebits = add(totalDebits, debit);
        totalCredits = add(totalCredits, credit);

        // Assets and Expenses increase on Debit; Liabilities, Income, Capital increase on Credit
        if (['asset', 'expense'].includes(account.account_type)) {
          runningBalance = add(runningBalance, subtract(debit, credit));
        } else {
          runningBalance = add(runningBalance, subtract(credit, debit));
        }

        return {
          id: item.id,
          entryDate: item.journalEntry ? item.journalEntry.entry_date : null,
          reference: item.journalEntry ? item.journalEntry.reference : null,
          journalName: item.journalEntry?.journal?.name || 'General',
          description: item.description,
          debit,
          credit,
          runningBalance,
        };
      });

      return ApiResponse.success(res, `Ledger for ${account.account_name}`, {
        account: {
          id: account.id,
          name: account.account_name,
          type: account.account_type,
        },
        summary: {
          totalDebits,
          totalCredits,
          closingBalance: runningBalance,
        },
        entries: ledgerEntries,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AccountController;
