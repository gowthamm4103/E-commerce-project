const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, default: '' },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number, default: 0 },
  minPurchaseAmount: { type: Number, default: 0 },
  minOrderAmount: { type: Number, default: 0 },
  expiryDate: { type: String, default: '' },
  usageLimit: { type: Number, default: 0 },         // 0 = unlimited
  usagePerCustomer: { type: Number, default: 1 },
  usageCount: { type: Number, default: 0 },
  appliesTo: { type: String, enum: ['entire', 'products', 'category'], default: 'entire' },
  specificProducts: [{ type: String }],
  specificCategories: [{ type: String }],
  customerEligibility: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive', 'draft', 'expired'], default: 'active' },
  approvalStatus: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: String, default: '' },
  approvedDate: { type: Date },
  rejectedBy: { type: String, default: '' },
  rejectedDate: { type: Date },
  rejectionReason: { type: String, default: '' },
  ownerId: { type: String, required: true }, // brand owner userId who created it
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
