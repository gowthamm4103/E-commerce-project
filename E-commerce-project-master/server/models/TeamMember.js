const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['standard_member', 'premium_member'], 
    default: 'standard_member' 
  },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  ownerId: { type: String, required: true }, // Brand owner who created this member
}, { timestamps: true });

teamMemberSchema.index({ ownerId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
