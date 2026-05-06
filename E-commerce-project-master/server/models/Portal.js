const mongoose = require('mongoose');

const portalSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  portalType: { type: String, enum: ['customer', 'team'], required: true },
  url: { type: String, required: true, unique: true },
  brandName: { type: String, default: '' },
  logo: { type: String, default: null },
  description: { type: String, default: '' },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Portal', portalSchema);
