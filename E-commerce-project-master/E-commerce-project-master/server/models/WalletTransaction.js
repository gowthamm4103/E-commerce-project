const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  walletType: { type: String, enum: ['eWallet', 'incomeWallet', 'creditWallet'], required: true },
  transactionType: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  balanceAfter: { type: Number, default: 0 },
  referenceId: { type: String, default: null }, // order id, withdrawal id, etc
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
