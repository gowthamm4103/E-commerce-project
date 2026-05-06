const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register/customer', authController.registerCustomer);
router.post('/register/brand-owner', authController.registerBrandOwner);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/kyc', auth, authController.updateKYC);
router.put('/bank-account', auth, authController.updateBankAccount);

module.exports = router;
