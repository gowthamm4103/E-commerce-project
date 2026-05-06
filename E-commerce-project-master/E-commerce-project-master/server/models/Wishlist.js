const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  selectedSize: { type: String, default: '' },
  selectedColor: { type: String, default: '' },
}, { _id: false });

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [wishlistItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
