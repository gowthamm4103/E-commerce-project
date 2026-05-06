const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { auth } = require('../middleware/auth');

router.get('/financial-data', auth, walletController.getFinancialData);
router.post('/ewallet/add', auth, walletController.addToEWallet);
router.post('/income/withdraw', auth, walletController.withdrawFromIncomeWallet);
router.get('/transactions', auth, walletController.getWalletTransactions);
router.get('/credit-history', auth, walletController.getCreditHistory);
router.get('/withdrawal-history', auth, walletController.getWithdrawalHistory);

module.exports = router;
