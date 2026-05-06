const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

// Brand owner routes
router.get('/my/products', auth, requireRole('brand_owner'), productController.getMyProducts);
router.get('/my/change-requests', auth, requireRole('brand_owner'), productController.getMyChangeRequests);
router.post('/', auth, requireRole('brand_owner'), productController.createProduct);
router.put('/:id', auth, requireRole('brand_owner'), productController.updateProduct);
router.delete('/:id', auth, requireRole('brand_owner'), productController.deleteProduct);
router.patch('/:id/stock', auth, requireRole('brand_owner'), productController.updateStock);

module.exports = router;
