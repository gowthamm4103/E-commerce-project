const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

// ─── Get Financial Data ─────────────────────────────────────────────
exports.getFinancialData = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.json({
      success: true,
      financialData: {
        directIncome: user.directIncome,
        indirectIncome: user.indirectIncome,
        incomeWallet: user.directIncome + user.indirectIncome,
        eWallet: user.eWallet,
        creditWallet: user.creditWallet,
        franchiseATurnover: user.franchiseATurnover,
        franchiseBTurnover: user.franchiseBTurnover,
        totalPayout: user.directIncome + user.indirectIncome,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch financial data.' });
  }
};

// ─── Add Money to E-Wallet ──────────────────────────────────────────
exports.addToEWallet = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount.' });
    }

    const user = await User.findOne({ userId: req.userId });
    user.eWallet += Number(amount);
    await user.save();

    const transaction = new WalletTransaction({
      userId: req.userId,
      walletType: 'eWallet',
      transactionType: 'credit',
      amount: Number(amount),
      description: `Added via ${paymentMethod || 'payment'}`,
      balanceAfter: user.eWallet,
    });
    await transaction.save();

    return res.json({
      success: true,
      eWallet: user.eWallet,
      transactionId: transaction._id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to add money.' });
  }
};

// ─── Withdraw from Income Wallet ────────────────────────────────────
exports.withdrawFromIncomeWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount.' });
    }

    const user = await User.findOne({ userId: req.userId });
    const incomeWallet = user.directIncome + user.indirectIncome;

    if (amount > incomeWallet) {
      return res.status(400).json({ success: false, error: 'Insufficient balance.' });
    }

    // Calculate tax (same logic as frontend)
    let tax = 0;
    if (amount > 10000 && amount <= 50000) tax = amount * 0.05;
    else if (amount > 50000 && amount <= 100000) tax = amount * 0.10;
    else if (amount > 100000) tax = amount * 0.15;

    const creditedAmount = amount - tax;

    // Create withdrawal record
    const withdrawalId = 'WDR' + Math.floor(Math.random() * 1000000);
    const withdrawal = {
      withdrawalId,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      amount,
      tax,
      creditedAmount,
      status: 'Processing',
      expectedCreditDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      expectedCreditTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleTimeString(),
    };

    user.withdrawalHistory.push(withdrawal);
    // Deduct from income wallet by reducing the direct/indirect income tracking
    user.incomeWallet = incomeWallet - amount;
    await user.save();

    const transaction = new WalletTransaction({
      userId: req.userId,
      walletType: 'incomeWallet',
      transactionType: 'debit',
      amount,
      description: `Withdrawal - Tax: ₹${tax.toFixed(2)}`,
      balanceAfter: incomeWallet - amount,
      referenceId: withdrawalId,
    });
    await transaction.save();

    return res.json({
      success: true,
      withdrawal,
      incomeWallet: incomeWallet - amount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to process withdrawal.' });
  }
};

// ─── Get Wallet Transactions ────────────────────────────────────────
exports.getWalletTransactions = async (req, res) => {
  try {
    const { walletType } = req.query;
    const filter = { userId: req.userId };
    if (walletType) filter.walletType = walletType;

    const transactions = await WalletTransaction.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, transactions });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch transactions.' });
  }
};

// ─── Get Credit History ─────────────────────────────────────────────
exports.getCreditHistory = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    return res.json({ success: true, creditHistory: user.creditHistory || [] });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch credit history.' });
  }
};

// ─── Get Withdrawal History ─────────────────────────────────────────
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    return res.json({ success: true, withdrawalHistory: user.withdrawalHistory || [] });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch withdrawal history.' });
  }
};
