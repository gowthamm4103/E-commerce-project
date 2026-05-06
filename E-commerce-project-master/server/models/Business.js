const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, unique: true },
  storeName: { type: String, default: '' },
  brandName: { type: String, default: '' },
  dbaName: { type: String, default: '' },
  businessType: { type: String, default: '' },
  gstin: { type: String, default: '' },
  cin: { type: String, default: '' },
  storeAddress: { type: String, default: '' },
  phone: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  email: { type: String, default: '' },
  instagram: { type: String, default: '' },
  youtube: { type: String, default: '' },
  whatsappGroup: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  pinterest: { type: String, default: '' },
  facebook: { type: String, default: '' },
  twitter: { type: String, default: '' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);
