const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdminOrAccountant } = require('../middleware/role.middleware');

router.use(authenticate, isAdminOrAccountant);

router.get('/profit-loss', ReportController.getProfitAndLoss);
router.get('/balance-sheet', ReportController.getBalanceSheet);
router.get('/stock', ReportController.getStockReport);
router.get('/budget', ReportController.getBudgetReport);
router.get('/trial-balance', ReportController.getTrialBalance);

module.exports = router;
