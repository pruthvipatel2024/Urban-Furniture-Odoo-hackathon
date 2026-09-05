const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contact.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin, isAdminOrAccountant } = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/', isAdminOrAccountant, ContactController.getContacts);
router.post('/', isAdminOrAccountant, ContactController.createContact);
router.get('/:id', ContactController.getContactById);
router.put('/:id', isAdminOrAccountant, ContactController.updateContact);
router.delete('/:id', isAdmin, ContactController.archiveContact);
router.get('/:id/ledger-history', ContactController.getContactLedgerHistory);

module.exports = router;
