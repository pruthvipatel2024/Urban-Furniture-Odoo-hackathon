const express = require('express');
const router = express.Router();
const PurchaseController = require('../controllers/purchase.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdminOrAccountant } = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/', PurchaseController.getPurchaseOrders);
router.get('/:id', PurchaseController.getPurchaseOrderById);
router.post('/', isAdminOrAccountant, PurchaseController.createPurchaseOrder);
router.post('/:id/confirm', isAdminOrAccountant, PurchaseController.confirmPurchaseOrder);
router.post('/:id/cancel', isAdminOrAccountant, PurchaseController.cancelPurchaseOrder);

module.exports = router;
