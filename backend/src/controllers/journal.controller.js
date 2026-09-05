const { Journal, JournalEntry, JournalItem, ChartOfAccount, User, Contact } = require('../models');
const ApiResponse = require('../utils/response');
const AccountingService = require('../services/accounting.service');
const { logAudit } = require('../middleware/audit.middleware');

class JournalController {
  /**
   * GET /api/journals
   */
  static async getJournals(req, res, next) {
    try {
      const journals = await Journal.findAll({
        include: [{ model: ChartOfAccount, as: 'defaultAccount' }],
        order: [['name', 'ASC']],
      });

      return ApiResponse.success(res, 'Journals retrieved successfully', journals);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/journals
   */
  static async createJournal(req, res, next) {
    try {
      const { name, type, default_account_id } = req.body;

      if (!name || !type) {
        return ApiResponse.badRequest(res, 'Journal name and type (sales, purchase, bank, cash) are required.');
      }

      if (!['sales', 'purchase', 'bank', 'cash'].includes(type)) {
        return ApiResponse.badRequest(res, 'Type must be "sales", "purchase", "bank", or "cash".');
      }

      const journal = await Journal.create({
        name: name.trim(),
        type,
        default_account_id: default_account_id || null,
      });

      await logAudit({
        req,
        action: 'CREATE_JOURNAL',
        entity: 'Journal',
        entityId: journal.id,
        newValue: journal.toJSON(),
      });

      const response = await Journal.findByPk(journal.id, {
        include: [{ model: ChartOfAccount, as: 'defaultAccount' }],
      });

      return ApiResponse.created(res, 'Journal created successfully', response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/journals/:id
   */
  static async updateJournal(req, res, next) {
    try {
      const { id } = req.params;
      const { name, type, default_account_id } = req.body;

      const journal = await Journal.findByPk(id);
      if (!journal) {
        return ApiResponse.notFound(res, 'Journal not found');
      }

      if (type && !['sales', 'purchase', 'bank', 'cash'].includes(type)) {
        return ApiResponse.badRequest(res, 'Type must be "sales", "purchase", "bank", or "cash".');
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (type !== undefined) updateData.type = type;
      if (default_account_id !== undefined) updateData.default_account_id = default_account_id || null;

      await journal.update(updateData);

      await logAudit({
        req,
        action: 'UPDATE_JOURNAL',
        entity: 'Journal',
        entityId: journal.id,
        newValue: journal.toJSON(),
      });

      const response = await Journal.findByPk(journal.id, {
        include: [{ model: ChartOfAccount, as: 'defaultAccount' }],
      });

      return ApiResponse.success(res, 'Journal updated successfully', response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/journals/entries (Stream all accounting journal entries)
   */
  static async getJournalEntries(req, res, next) {
    try {
      const { journalId, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where = {};
      if (journalId) {
        where.journal_id = journalId;
      }

      const { count, rows } = await JournalEntry.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['entry_date', 'DESC'], ['id', 'DESC']],
        include: [
          { model: Journal, as: 'journal' },
          { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'role'] },
          {
            model: JournalItem,
            as: 'items',
            include: [
              { model: ChartOfAccount, as: 'account' },
              { model: Contact, as: 'partner', attributes: ['id', 'name', 'email', 'mobile'] },
            ],
          },
        ],
      });

      return ApiResponse.success(res, 'Journal entries retrieved successfully', {
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        entries: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/journals/entries (Manual Balanced Double-Entry)
   */
  static async createManualEntry(req, res, next) {
    try {
      const { journalId, entryDate, reference, items } = req.body;

      if (!journalId || !reference || !items) {
        return ApiResponse.badRequest(res, 'Journal ID, reference, and line items are required.');
      }

      const entry = await AccountingService.createJournalEntry({
        journalId,
        entryDate: entryDate || new Date(),
        reference,
        items,
        userId: req.user.id,
      });

      await logAudit({
        req,
        action: 'CREATE_MANUAL_JOURNAL_ENTRY',
        entity: 'JournalEntry',
        entityId: entry.id,
        newValue: { journalId, reference, itemsCount: items.length },
      });

      const fullEntry = await JournalEntry.findByPk(entry.id, {
        include: [
          { model: Journal, as: 'journal' },
          { model: JournalItem, as: 'items', include: [{ model: ChartOfAccount, as: 'account' }] },
        ],
      });

      return ApiResponse.created(res, 'Balanced journal entry posted successfully', fullEntry);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = JournalController;
