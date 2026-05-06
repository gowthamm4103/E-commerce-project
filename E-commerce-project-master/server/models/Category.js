const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  parentCategory: { type: String, default: '' },
  subCategories: [{ type: String }],
  ownerId: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
