const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin, isAdminOrAccountant } = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', isAdminOrAccountant, ProductController.createProduct);
router.put('/:id', isAdminOrAccountant, ProductController.updateProduct);
router.delete('/:id', isAdmin, ProductController.archiveProduct);
router.post('/:id/adjust-stock', isAdminOrAccountant, ProductController.adjustStock);

module.exports = router;
