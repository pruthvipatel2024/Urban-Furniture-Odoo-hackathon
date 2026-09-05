const express = require('express');
const router = express.Router();
const JournalController = require('../controllers/journal.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdminOrAccountant } = require('../middleware/role.middleware');

router.use(authenticate, isAdminOrAccountant);

router.get('/', JournalController.getJournals);
router.post('/', JournalController.createJournal);
router.put('/:id', JournalController.updateJournal);
router.get('/entries', JournalController.getJournalEntries);
router.post('/entries', JournalController.createManualEntry);

module.exports = router;
