const DashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/response');

class DashboardController {
  /**
   * GET /api/dashboard/summary
   */
  static async getSummary(req, res, next) {
    try {
      const summary = await DashboardService.getSummary();
      return ApiResponse.success(res, 'Dashboard metrics calculated dynamically from database', summary);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DashboardController;
