const { Op } = require('sequelize');
const { Budget, AnalyticAccount, CustomerInvoice, VendorBill, Contact, sequelize } = require('../models');
const ApiResponse = require('../utils/response');
const { logAudit } = require('../middleware/audit.middleware');
const { toFixedNumber, add, subtract, multiply, divide } = require('../utils/decimal');

async function computeBudgetMetrics(budget) {
  const planned = Number(budget.planned_amount || 0);
  let achieved = 0;

  if (budget.analytic_account_id) {
    const analytic = budget.analyticAccount || await AnalyticAccount.findByPk(budget.analytic_account_id);
    const dateFilter = {
      invoice_date: {
        [Op.between]: [budget.period_start, budget.period_end],
      },
    };

    if (analytic && analytic.type === 'income') {
      const invoices = await CustomerInvoice.findAll({
        where: {
          ...dateFilter,
          analytic_account_id: budget.analytic_account_id,
        },
      });
      for (const inv of invoices) {
        achieved = add(achieved, Number(inv.total_amount || 0));
      }
    } else if (analytic && analytic.type === 'expense') {
      const bills = await VendorBill.findAll({
        where: {
          ...dateFilter,
          analytic_account_id: budget.analytic_account_id,
        },
      });
      for (const b of bills) {
        achieved = add(achieved, Number(b.total_amount || 0));
      }
    }
  }

  const achievedAmount = toFixedNumber(achieved);
  const achievedPercent = planned > 0 ? toFixedNumber(multiply(divide(achievedAmount, planned), 100)) : 0;
  const amountToAchieve = toFixedNumber(Math.max(0, subtract(planned, achievedAmount)));

  const budgetObj = budget.toJSON ? budget.toJSON() : { ...budget };
  return {
    ...budgetObj,
    achieved_amount: achievedAmount,
    achieved_percentage: achievedPercent,
    amount_to_achieve: amountToAchieve,
  };
}

class BudgetController {
  /**
   * GET /api/budgets
   */
  static async getBudgets(req, res, next) {
    try {
      const budgets = await Budget.findAll({
        include: [
          { model: AnalyticAccount, as: 'analyticAccount' },
          { model: Budget, as: 'originalBudget', attributes: ['id', 'name', 'status'] },
          { model: Budget, as: 'revisedBudget', attributes: ['id', 'name', 'status'] },
        ],
        order: [['period_start', 'DESC'], ['id', 'DESC']],
      });

      const enriched = await Promise.all(budgets.map(computeBudgetMetrics));

      return ApiResponse.success(res, 'Budgets retrieved successfully', enriched);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/budgets/:id
   */
  static async getBudgetById(req, res, next) {
    try {
      const budget = await Budget.findByPk(req.params.id, {
        include: [
          { model: AnalyticAccount, as: 'analyticAccount' },
          { model: Budget, as: 'originalBudget', attributes: ['id', 'name', 'status', 'planned_amount'] },
          { model: Budget, as: 'revisedBudget', attributes: ['id', 'name', 'status', 'planned_amount'] },
        ],
      });

      if (!budget) {
        return ApiResponse.notFound(res, `Budget with ID ${req.params.id} not found.`);
      }

      const enriched = await computeBudgetMetrics(budget);
      return ApiResponse.success(res, 'Budget retrieved successfully', enriched);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/budgets
   */
  static async createBudget(req, res, next) {
    try {
      const { name, period_start, period_end, responsible_person, planned_amount, analytic_account_id, status } = req.body;

      if (!name || !period_start || !period_end || planned_amount === undefined) {
        return ApiResponse.badRequest(res, 'Budget name, period start, period end, and planned amount are required.');
      }

      if (new Date(period_end) < new Date(period_start)) {
        return ApiResponse.badRequest(res, 'Period end date must be on or after period start date.');
      }

      const budget = await Budget.create({
        name: name.trim(),
        period_start,
        period_end,
        responsible_person: responsible_person || null,
        planned_amount: toFixedNumber(planned_amount),
        analytic_account_id: analytic_account_id || null,
        status: status || 'draft',
      });

      await logAudit({
        req,
        action: 'CREATE_BUDGET',
        entity: 'Budget',
        entityId: budget.id,
        newValue: budget.toJSON(),
      });

      const fullBudget = await Budget.findByPk(budget.id, {
        include: [{ model: AnalyticAccount, as: 'analyticAccount' }],
      });

      const enriched = await computeBudgetMetrics(fullBudget);
      return ApiResponse.created(res, 'Budget created successfully', enriched);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/budgets/:id
   */
  static async updateBudget(req, res, next) {
    try {
      const budget = await Budget.findByPk(req.params.id);
      if (!budget) {
        return ApiResponse.notFound(res, `Budget with ID ${req.params.id} not found.`);
      }

      if (budget.status === 'revised' || budget.status === 'cancelled') {
        return ApiResponse.badRequest(res, `Cannot modify budget in "${budget.status}" state.`);
      }

      const oldVal = budget.toJSON();
      const { name, period_start, period_end, responsible_person, planned_amount, analytic_account_id, status } = req.body;

      if (name) budget.name = name.trim();
      if (period_start) budget.period_start = period_start;
      if (period_end) budget.period_end = period_end;
      if (responsible_person !== undefined) budget.responsible_person = responsible_person;
      if (planned_amount !== undefined) budget.planned_amount = toFixedNumber(planned_amount);
      if (analytic_account_id !== undefined) budget.analytic_account_id = analytic_account_id;
      if (status) budget.status = status;

      await budget.save();

      await logAudit({
        req,
        action: 'UPDATE_BUDGET',
        entity: 'Budget',
        entityId: budget.id,
        oldValue: oldVal,
        newValue: budget.toJSON(),
      });

      const fullBudget = await Budget.findByPk(budget.id, {
        include: [{ model: AnalyticAccount, as: 'analyticAccount' }],
      });

      const enriched = await computeBudgetMetrics(fullBudget);
      return ApiResponse.success(res, 'Budget updated successfully', enriched);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/budgets/:id/confirm
   */
  static async confirmBudget(req, res, next) {
    try {
      const budget = await Budget.findByPk(req.params.id);
      if (!budget) {
        return ApiResponse.notFound(res, `Budget with ID ${req.params.id} not found.`);
      }

      if (budget.status !== 'draft') {
        return ApiResponse.badRequest(res, `Only draft budgets can be confirmed. Current status: ${budget.status}`);
      }

      budget.status = 'confirmed';
      await budget.save();

      await logAudit({
        req,
        action: 'CONFIRM_BUDGET',
        entity: 'Budget',
        entityId: budget.id,
      });

      const fullBudget = await Budget.findByPk(budget.id, {
        include: [{ model: AnalyticAccount, as: 'analyticAccount' }],
      });
      const enriched = await computeBudgetMetrics(fullBudget);
      return ApiResponse.success(res, 'Budget confirmed successfully', enriched);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/budgets/:id/cancel
   */
  static async cancelBudget(req, res, next) {
    try {
      const budget = await Budget.findByPk(req.params.id);
      if (!budget) {
        return ApiResponse.notFound(res, `Budget with ID ${req.params.id} not found.`);
      }

      if (budget.status === 'cancelled') {
        return ApiResponse.badRequest(res, 'Budget is already cancelled.');
      }

      budget.status = 'cancelled';
      await budget.save();

      await logAudit({
        req,
        action: 'CANCEL_BUDGET',
        entity: 'Budget',
        entityId: budget.id,
      });

      const fullBudget = await Budget.findByPk(budget.id, {
        include: [{ model: AnalyticAccount, as: 'analyticAccount' }],
      });
      const enriched = await computeBudgetMetrics(fullBudget);
      return ApiResponse.success(res, 'Budget cancelled successfully', enriched);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/budgets/:id/revise
   */
  static async reviseBudget(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const originalBudget = await Budget.findByPk(req.params.id, { transaction: t });
      if (!originalBudget) {
        await t.rollback();
        return ApiResponse.notFound(res, `Budget with ID ${req.params.id} not found.`);
      }

      if (originalBudget.status !== 'confirmed') {
        await t.rollback();
        return ApiResponse.badRequest(res, `Only confirmed budgets can be revised. Current status: ${originalBudget.status}`);
      }

      const rawNewAmount = req.body.newPlannedAmount !== undefined ? req.body.newPlannedAmount : req.body.new_planned_amount;
      const plannedAmount = rawNewAmount !== undefined ? toFixedNumber(rawNewAmount) : Number(originalBudget.planned_amount);

      // Revised budget name: Project A -> Project A Revised
      let newName = originalBudget.name.trim();
      if (!newName.endsWith('Revised')) {
        newName = `${newName} Revised`;
      }

      // 1. Create the new active budget
      const revisedBudget = await Budget.create({
        name: newName,
        period_start: originalBudget.period_start,
        period_end: originalBudget.period_end,
        responsible_person: originalBudget.responsible_person,
        planned_amount: plannedAmount,
        analytic_account_id: originalBudget.analytic_account_id,
        status: 'confirmed',
        revision_of_id: originalBudget.id,
      }, { transaction: t });

      // 2. Update original budget to 'revised' and link to new budget
      originalBudget.status = 'revised';
      originalBudget.revised_budget_id = revisedBudget.id;
      await originalBudget.save({ transaction: t });

      await t.commit();

      await logAudit({
        req,
        action: 'REVISE_BUDGET',
        entity: 'Budget',
        entityId: originalBudget.id,
        newValue: {
          originalBudgetId: originalBudget.id,
          revisedBudgetId: revisedBudget.id,
          newPlannedAmount: plannedAmount,
        },
      });

      const fullRevised = await Budget.findByPk(revisedBudget.id, {
        include: [
          { model: AnalyticAccount, as: 'analyticAccount' },
          { model: Budget, as: 'originalBudget', attributes: ['id', 'name', 'status', 'planned_amount'] },
        ],
      });

      const enriched = await computeBudgetMetrics(fullRevised);
      return ApiResponse.created(res, 'Budget revised successfully. New active budget created.', enriched);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }

  /**
   * GET /api/budgets/:id/transactions
   * Drill-down popup data showing all contributing invoices/bills for this budget period and analytic account
   */
  static async getBudgetTransactions(req, res, next) {
    try {
      const budget = await Budget.findByPk(req.params.id, {
        include: [{ model: AnalyticAccount, as: 'analyticAccount' }],
      });

      if (!budget) {
        return ApiResponse.notFound(res, `Budget with ID ${req.params.id} not found.`);
      }

      if (!budget.analytic_account_id || !budget.analyticAccount) {
        return ApiResponse.success(res, 'No analytic account assigned to this budget', {
          budget: budget.name,
          type: 'none',
          records: [],
          totalAchieved: 0,
        });
      }

      const dateFilter = {
        invoice_date: {
          [Op.between]: [budget.period_start, budget.period_end],
        },
      };

      let records = [];
      let totalAchieved = 0;

      if (budget.analyticAccount.type === 'income') {
        const invoices = await CustomerInvoice.findAll({
          where: {
            ...dateFilter,
            analytic_account_id: budget.analytic_account_id,
          },
          include: [{ model: Contact, as: 'customer', attributes: ['id', 'name', 'email', 'mobile'] }],
          order: [['invoice_date', 'DESC']],
        });

        records = invoices.map((inv) => {
          const amt = Number(inv.total_amount || 0);
          totalAchieved = add(totalAchieved, amt);
          return {
            id: inv.id,
            type: 'Sales Invoice',
            number: inv.invoice_number || `INV-${inv.id}`,
            date: inv.invoice_date,
            partner: inv.customer ? inv.customer.name : 'Unknown Customer',
            analyticAccount: budget.analyticAccount.name,
            amount: amt,
            amountPaid: Number(inv.amount_paid || 0),
            status: inv.payment_status,
          };
        });
      } else {
        const bills = await VendorBill.findAll({
          where: {
            ...dateFilter,
            analytic_account_id: budget.analytic_account_id,
          },
          include: [{ model: Contact, as: 'vendor', attributes: ['id', 'name', 'email', 'mobile'] }],
          order: [['invoice_date', 'DESC']],
        });

        records = bills.map((b) => {
          const amt = Number(b.total_amount || 0);
          totalAchieved = add(totalAchieved, amt);
          return {
            id: b.id,
            type: 'Vendor Bill',
            number: b.bill_number || `BILL-${b.id}`,
            date: b.invoice_date,
            partner: b.vendor ? b.vendor.name : 'Unknown Vendor',
            analyticAccount: budget.analyticAccount.name,
            amount: amt,
            amountPaid: Number(b.amount_paid || 0),
            status: b.payment_status,
          };
        });
      }

      return ApiResponse.success(res, 'Contributing budget transactions retrieved', {
        budget: budget.name,
        analyticAccount: budget.analyticAccount.name,
        type: budget.analyticAccount.type,
        period: `${budget.period_start} to ${budget.period_end}`,
        totalAchieved: toFixedNumber(totalAchieved),
        records,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/budgets/:id
   */
  static async deleteBudget(req, res, next) {
    try {
      const budget = await Budget.findByPk(req.params.id);
      if (!budget) {
        return ApiResponse.notFound(res, `Budget with ID ${req.params.id} not found.`);
      }

      await budget.destroy();

      await logAudit({
        req,
        action: 'DELETE_BUDGET',
        entity: 'Budget',
        entityId: req.params.id,
      });

      return ApiResponse.success(res, `Budget "${budget.name}" deleted successfully`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/budgets/analytic-accounts
   */
  static async getAnalyticAccounts(req, res, next) {
    try {
      const accounts = await AnalyticAccount.findAll({
        include: [{ model: Budget, as: 'budgets', attributes: ['id', 'name', 'status', 'planned_amount'] }],
        order: [['name', 'ASC']],
      });
      return ApiResponse.success(res, 'Analytic Accounts retrieved successfully', accounts);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/budgets/analytic-accounts
   */
  static async createAnalyticAccount(req, res, next) {
    try {
      const { name, type } = req.body;

      if (!name || !type) {
        return ApiResponse.badRequest(res, 'Name and type (income, expense) are required.');
      }

      const cleanType = type.toLowerCase().trim();
      if (!['income', 'expense'].includes(cleanType)) {
        return ApiResponse.badRequest(res, 'Type must be "income" or "expense".');
      }

      const account = await AnalyticAccount.create({ name: name.trim(), type: cleanType });

      await logAudit({
        req,
        action: 'CREATE_ANALYTIC_ACCOUNT',
        entity: 'AnalyticAccount',
        entityId: account.id,
        newValue: account.toJSON(),
      });

      return ApiResponse.created(res, 'Analytic Account created successfully', account);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/budgets/analytic-accounts/:id
   */
  static async updateAnalyticAccount(req, res, next) {
    try {
      const account = await AnalyticAccount.findByPk(req.params.id);
      if (!account) {
        return ApiResponse.notFound(res, `Analytic Account with ID ${req.params.id} not found.`);
      }

      const { name, type } = req.body;
      const oldVal = account.toJSON();

      if (name) account.name = name.trim();
      if (type) {
        const cleanType = type.toLowerCase().trim();
        if (!['income', 'expense'].includes(cleanType)) {
          return ApiResponse.badRequest(res, 'Type must be "income" or "expense".');
        }
        account.type = cleanType;
      }

      await account.save();

      await logAudit({
        req,
        action: 'UPDATE_ANALYTIC_ACCOUNT',
        entity: 'AnalyticAccount',
        entityId: account.id,
        oldValue: oldVal,
        newValue: account.toJSON(),
      });

      return ApiResponse.success(res, 'Analytic Account updated successfully', account);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BudgetController;

