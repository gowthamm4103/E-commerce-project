const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  brandName: String,
  price: Number,
  category: String,
  quantity: { type: Number, required: true },
  selectedSize: String,
  selectedColor: String,
  images: [String],
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  total: { type: Number, required: true },
  deliveryDate: { type: String },
  status: { type: String, enum: ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Completed', 'Cancelled'], default: 'Processing' },

  // Delivery details
  deliveryDetails: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
  },

  paymentMethod: { type: String, default: 'card' },

  // Tracking info
  trackingStages: [{
    name: String,
    completed: { type: Boolean, default: false },
    date: String,
  }],

  // Coupon applied
  couponCode: { type: String, default: null },
  couponDiscount: { type: Number, default: 0 },

}, { timestamps: true });

// Auto-generate orderId
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderId) {
    this.orderId = `ORD${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
