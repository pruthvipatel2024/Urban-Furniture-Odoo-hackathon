const express = require('express');
const router = express.Router();
const BillController = require('../controllers/bill.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdminOrAccountant } = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/', BillController.getBills);
router.get('/:id', BillController.getBillById);
router.post('/generate-from-po', isAdminOrAccountant, BillController.convertPOToBill);

module.exports = router;
