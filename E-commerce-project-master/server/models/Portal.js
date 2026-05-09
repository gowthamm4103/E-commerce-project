const mongoose = require('mongoose');

const portalSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  portalType: { type: String, enum: ['customer', 'team'], required: true },
  url: { type: String, required: true, unique: true },
  brandName: { type: String, default: '' },
  logo: { type: String, default: null },
  description: { type: String, default: '' },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  // New fields for guided setup flow
  theme: { type: String, enum: ['black', 'white'], default: 'white' },
  brandTagline: { type: String, default: '' },
  facebookUrl: { type: String, default: '' },
  linkedInUrl: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  twitterUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Portal', portalSchema);