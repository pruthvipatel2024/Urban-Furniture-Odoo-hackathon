const ReportService = require('../services/report.service');
const ApiResponse = require('../utils/response');

class ReportController {
  /**
   * GET /api/reports/profit-loss
   */
  static async getProfitAndLoss(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await ReportService.getProfitAndLoss({ startDate, endDate });
      return ApiResponse.success(res, 'Profit & Loss report generated successfully', report);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/reports/balance-sheet
   */
  static async getBalanceSheet(req, res, next) {
    try {
      const { asOfDate } = req.query;
      const report = await ReportService.getBalanceSheet({ asOfDate });
      return ApiResponse.success(res, 'Balance Sheet generated successfully', report);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/reports/stock
   */
  static async getStockReport(req, res, next) {
    try {
      const report = await ReportService.getStockReport();
      return ApiResponse.success(res, 'Stock Valuation report generated successfully', report);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/reports/budget
   */
  static async getBudgetReport(req, res, next) {
    try {
      const report = await ReportService.getBudgetReport();
      return ApiResponse.success(res, 'Budget vs Actual report generated successfully', report);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/reports/trial-balance
   */
  static async getTrialBalance(req, res, next) {
    try {
      const { asOfDate } = req.query;
      const report = await ReportService.getTrialBalance({ asOfDate });
      return ApiResponse.success(res, 'Trial Balance report generated successfully', report);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ReportController;
