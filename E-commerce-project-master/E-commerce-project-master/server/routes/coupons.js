const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { auth, requireRole } = require('../middleware/auth');

// Public
router.post('/validate', couponController.validateCoupon);

// Brand owner routes
router.get('/', auth, requireRole('brand_owner'), couponController.getCoupons);
router.post('/', auth, requireRole('brand_owner'), couponController.createCoupon);
router.put('/:id', auth, requireRole('brand_owner'), couponController.updateCoupon);
router.delete('/:id', auth, requireRole('brand_owner'), couponController.deleteCoupon);

module.exports = router;
