const express = require('express');
const router = express.Router();
const SalesController = require('../controllers/sales.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdminOrAccountant } = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/', SalesController.getSalesOrders);
router.get('/:id', SalesController.getSalesOrderById);
router.post('/', SalesController.createSalesOrder);
router.post('/:id/confirm', isAdminOrAccountant, SalesController.confirmSalesOrder);
router.post('/:id/cancel', isAdminOrAccountant, SalesController.cancelSalesOrder);

module.exports = router;
