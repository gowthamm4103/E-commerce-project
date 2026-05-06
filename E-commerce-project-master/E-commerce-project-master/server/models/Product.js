const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brandName: { type: String, required: true },
  price: { type: Number, required: true },
  credits: { type: String, default: '0' },
  discountedPrice: { type: Number, default: 0 },
  offer: { type: String, default: '' },
  category: { type: String, required: true }, // 'Clothing', 'Accessories'
  subCategory: { type: String, default: '' },
  stockQuantity: { type: Number, default: 0 },
  sku: { type: String, default: '' },
  hsnCode: { type: String, default: '' },
  fitType: { type: String, default: '' },
  type: { type: String, default: '' },
  colors: { type: String, default: '' },
  sizes: { type: String, default: '' },
  material: { type: String, default: '' },
  pattern: { type: String, default: '' },
  neckType: { type: String, default: '' },
  sleeveType: { type: String, default: '' },
  occasion: { type: String, default: '' },
  length: { type: String, default: '' },
  closureType: { type: String, default: '' },
  stretchability: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  fullDescription: { type: String, default: '' },
  keyFeatures: { type: String, default: '' },
  washMethod: { type: String, default: '' },
  ironingDetails: { type: String, default: '' },
  images: [{ type: String }],
  videoLink: { type: String, default: '' },
  instagramLink: { type: String, default: '' },
  packageDimensions: { type: String, default: '' },
  weight: { type: String, default: '' },
  deliveryAvailability: { type: String, default: 'Pan India' },
  codOption: { type: mongoose.Schema.Types.Mixed, default: true },
  sellerAddress: { type: String, default: '' },
  returnPolicy: { type: String, default: '' },
  manufacturerDetails: { type: String, default: '' },
  countryOfOrigin: { type: String, default: 'India' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  // Brand owner who created this product (null for platform products)
  ownerId: { type: String, default: null },
  // Team member who added this product (null if added by brand owner directly)
  addedBy: { type: String, default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Text index for search
productSchema.index({ name: 'text', brandName: 'text', category: 'text', subCategory: 'text', type: 'text' });

module.exports = mongoose.model('Product', productSchema);
