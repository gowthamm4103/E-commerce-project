const mongoose = require('mongoose');

// Referral Commission Schema
const referralCommissionSchema = new mongoose.Schema({
  orderId: { type: String, required: true, ref: 'Order' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  productPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  commissionAmount: { type: Number, required: true },
  commissionRate: { type: Number, default: 0.05 }, // 5% fixed
  status: { 
    type: String, 
    enum: ['pending', 'credited', 'cancelled'], 
    default: 'pending' 
  },
  creditedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: String,
}, { _id: false });

const referralSchema = new mongoose.Schema({
  // The referrer's userId (used directly in referral links: /product/{productId}?ref={userId})
  referrerUserId: { type: String, required: true, index: true },
  
  // The referrer's email (for self-referral prevention)
  referrerEmail: { type: String },
  
  // The product being referred
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  productName: String,
  productPrice: Number,
  
  // The guest user who clicked the link (tracked via session/cookie)
  guestSessionId: { type: String, index: true }, // Unique session ID for guest
  
  // Click tracking
  clickedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }, // Referral expiry (default: 7 days)
  
  // Conversion tracking
  converted: { type: Boolean, default: false },
  convertedAt: { type: Date },
  orderId: { type: String },
  
  // Commission details (populated after conversion)
  commissions: [referralCommissionSchema],
  totalCommissionEarned: { type: Number, default: 0 },
  
  // Metadata
  source: { type: String, enum: ['whatsapp', 'facebook', 'twitter', 'email', 'native', 'copy'], default: 'copy' },
  
}, { timestamps: true });

// Index for cleanup queries
referralSchema.index({ expiresAt: 1 });

// Auto-expire referrals that are not converted
referralSchema.methods.isExpired = function() {
  return !this.converted && new Date() > this.expiresAt;
};

// Calculate commission for a product
referralSchema.statics.calculateCommission = function(productPrice, quantity) {
  const commissionRate = 0.05; // 5% fixed
  return Math.round(productPrice * quantity * commissionRate);
};

module.exports = mongoose.model('Referral', referralSchema);