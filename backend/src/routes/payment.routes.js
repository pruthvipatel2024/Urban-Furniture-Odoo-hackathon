const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', PaymentController.getPayments);
router.get('/:id', PaymentController.getPaymentById);
router.post('/', PaymentController.recordPayment);

module.exports = router;
