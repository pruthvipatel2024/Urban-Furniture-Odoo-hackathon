const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/audit.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');

router.use(authenticate, isAdmin);

router.get('/', AuditController.getAuditLogs);

module.exports = router;
