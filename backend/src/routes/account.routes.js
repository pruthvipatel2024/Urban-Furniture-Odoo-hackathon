const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/account.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin, isAdminOrAccountant } = require('../middleware/role.middleware');

router.use(authenticate, isAdminOrAccountant);

router.get('/', AccountController.getAccounts);
router.get('/:id', AccountController.getAccountById);
router.post('/', AccountController.createAccount);
router.put('/:id', AccountController.updateAccount);
router.delete('/:id', isAdmin, AccountController.archiveAccount);
router.get('/:id/ledger', AccountController.getAccountLedger);

module.exports = router;
