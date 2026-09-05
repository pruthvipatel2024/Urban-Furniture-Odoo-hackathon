const { Budget, AnalyticAccount } = require('../models');
const ApiResponse = require('../utils/response');
const { logAudit } = require('../middleware/audit.middleware');
const { toFixedNumber } = require('../utils/decimal');

class BudgetController {
  /**
   * GET /api/budgets
   */
  static async getBudgets(req, res, next) {
    try {
      const budgets = await Budget.findAll({
        include: [{ model: AnalyticAccount, as: 'analyticAccount' }],
        order: [['period_start', 'DESC']],
      });

      return ApiResponse.success(res, 'Budgets retrieved successfully', budgets);
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
        include: [{ model: AnalyticAccount, as: 'analyticAccount' }],
      });

      if (!budget) {
        return ApiResponse.notFound(res, `Budget with ID ${req.params.id} not found.`);
      }

      return ApiResponse.success(res, 'Budget retrieved successfully', budget);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/budgets
   */
  static async createBudget(req, res, next) {
    try {
      const { name, period_start, period_end, responsible_person, planned_amount, analytic_account_id } = req.body;

      if (!name || !period_start || !period_end || planned_amount === undefined) {
        return ApiResponse.badRequest(res, 'Budget name, period start, period end, and planned amount are required.');
      }

      if (new Date(period_end) < new Date(period_start)) {
        return ApiResponse.badRequest(res, 'Period end date must be on or after period start date.');
      }

      const budget = await Budget.create({
        name,
        period_start,
        period_end,
        responsible_person,
        planned_amount: toFixedNumber(planned_amount),
        analytic_account_id: analytic_account_id || null,
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

      return ApiResponse.created(res, 'Budget created successfully', fullBudget);
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

      const oldVal = budget.toJSON();
      const { name, period_start, period_end, responsible_person, planned_amount, analytic_account_id } = req.body;

      if (name) budget.name = name;
      if (period_start) budget.period_start = period_start;
      if (period_end) budget.period_end = period_end;
      if (responsible_person !== undefined) budget.responsible_person = responsible_person;
      if (planned_amount !== undefined) budget.planned_amount = toFixedNumber(planned_amount);
      if (analytic_account_id !== undefined) budget.analytic_account_id = analytic_account_id;

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

      return ApiResponse.success(res, 'Budget updated successfully', fullBudget);
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

      if (!['income', 'expense'].includes(type)) {
        return ApiResponse.badRequest(res, 'Type must be "income" or "expense".');
      }

      const account = await AnalyticAccount.create({ name, type });

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
}

module.exports = BudgetController;
