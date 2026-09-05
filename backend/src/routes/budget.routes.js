const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budget.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin, isAdminOrAccountant } = require('../middleware/role.middleware');

router.use(authenticate, isAdminOrAccountant);

router.get('/', BudgetController.getBudgets);
router.get('/analytic-accounts', BudgetController.getAnalyticAccounts);
router.post('/analytic-accounts', BudgetController.createAnalyticAccount);
router.get('/:id', BudgetController.getBudgetById);
router.get('/:id/transactions', BudgetController.getBudgetTransactions);
router.post('/', BudgetController.createBudget);
router.put('/:id', BudgetController.updateBudget);
router.post('/:id/confirm', BudgetController.confirmBudget);
router.post('/:id/cancel', BudgetController.cancelBudget);
router.post('/:id/revise', BudgetController.reviseBudget);
router.delete('/:id', isAdmin, BudgetController.deleteBudget);

module.exports = router;

