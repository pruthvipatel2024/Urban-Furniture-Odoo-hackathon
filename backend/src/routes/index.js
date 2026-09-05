const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const contactRoutes = require('./contact.routes');
const productRoutes = require('./product.routes');
const accountRoutes = require('./account.routes');
const journalRoutes = require('./journal.routes');
const salesRoutes = require('./sales.routes');
const invoiceRoutes = require('./invoice.routes');
const purchaseRoutes = require('./purchase.routes');
const billRoutes = require('./bill.routes');
const paymentRoutes = require('./payment.routes');
const budgetRoutes = require('./budget.routes');
const reportRoutes = require('./report.routes');
const dashboardRoutes = require('./dashboard.routes');
const auditRoutes = require('./audit.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/contacts', contactRoutes);
router.use('/products', productRoutes);
router.use('/accounts', accountRoutes);
router.use('/journals', journalRoutes);
router.use('/sales-orders', salesRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/purchase-orders', purchaseRoutes);
router.use('/bills', billRoutes);
router.use('/payments', paymentRoutes);
router.use('/budgets', budgetRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit', auditRoutes);

module.exports = router;
