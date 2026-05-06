const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // e.g. CUST001, BRAND001, FOUND001
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
  contact: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  userType: { type: String, enum: ['customer', 'brand_owner', 'founder', 'admin'], required: true },
  firebaseUid: { type: String, default: null },

  // KYC
  kycVerified: { type: Boolean, default: false },
  kycData: {
    pan: { type: String, default: '' },
    aadhaar: { type: String, default: '' },
    address: { type: String, default: '' },
    panPhoto: { type: String, default: null },
    aadhaarPhoto: { type: String, default: null },
  },

  // Bank account
  bankAccount: {
    accountNumber: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountHolder: { type: String, default: '' },
    passbookPhoto: { type: String, default: null },
  },

  // Brand owner specific
  brandName: { type: String, default: '' },
  legalBusinessName: { type: String, default: '' },
  businessRegNo: { type: String, default: '' },
  gstNo: { type: String, default: '' },
  businessAddress: {
    streetAddress: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'India' },
  },
  businessEmail: { type: String, default: '' },
  businessPhone: { type: String, default: '' },
  businessWebsite: { type: String, default: '' },
  socialMediaLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },

  // Wallets
  eWallet: { type: Number, default: 0 },
  incomeWallet: { type: Number, default: 0 },
  creditWallet: { type: Number, default: 0 },

  // MLM tree references
  directParentId: { type: String, default: null },
  logicalParentId: { type: String, default: null },
  leftChildId: { type: String, default: null },
  rightChildId: { type: String, default: null },
  level: { type: Number, default: 0 },
  directReferrals: [{ type: String }],

  // Income tracking
  directIncome: { type: Number, default: 0 },
  indirectIncome: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  leftSubtreeSales: { type: Number, default: 0 },
  rightSubtreeSales: { type: Number, default: 0 },
  carryForwardLeft: { type: Number, default: 0 },
  carryForwardRight: { type: Number, default: 0 },
  franchiseATurnover: { type: Number, default: 0 },
  franchiseBTurnover: { type: Number, default: 0 },

  // Credit history
  creditHistory: [{
    date: String,
    amount: Number,
    reason: String,
    franchise: String,
    turnover: Number,
    creditsEarned: Number,
    totalCredits: Number,
  }],

  // Withdrawal history
  withdrawalHistory: [{
    withdrawalId: String,
    date: String,
    time: String,
    amount: Number,
    tax: Number,
    creditedAmount: Number,
    status: { type: String, enum: ['Processing', 'Completed', 'Failed'], default: 'Processing' },
    expectedCreditDate: String,
    expectedCreditTime: String,
  }],

  // Team members (for brand owners)
  teamMembers: [{
    memberId: String,
    name: String,
    email: String,
    role: String,
    status: { type: String, default: 'active' },
    joinedAt: { type: Date, default: Date.now },
  }],

}, { timestamps: true });

// Auto-generate userId before saving
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.userId) {
    const prefix = this.userType === 'brand_owner' ? 'BRAND' : this.userType === 'founder' ? 'FOUND' : this.userType === 'admin' ? 'ADMIN' : 'CUST';
    const count = await mongoose.model('User').countDocuments({ userType: this.userType });
    this.userId = `${prefix}${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
