const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoice.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdminOrAccountant } = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/', InvoiceController.getInvoices);
router.get('/:id', InvoiceController.getInvoiceById);
router.post('/generate-from-so', isAdminOrAccountant, InvoiceController.convertSOToInvoice);

module.exports = router;
