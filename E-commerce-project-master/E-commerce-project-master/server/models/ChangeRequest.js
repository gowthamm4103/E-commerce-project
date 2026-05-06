const mongoose = require('mongoose');

const changeRequestSchema = new mongoose.Schema({
  // What type of entity: 'product' or 'coupon'
  entityType: { type: String, enum: ['product', 'coupon'], required: true },

  // What action: 'create', 'update', 'delete'
  actionType: { type: String, enum: ['create', 'update', 'delete'], required: true },

  // The ID of the existing entity (for update/delete). Null for create.
  entityId: { type: mongoose.Schema.Types.ObjectId, default: null },

  // The full payload of changes (for create: full object, for update: changed fields, for delete: empty)
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Snapshot of the entity BEFORE the change (for update/delete — so admin can compare)
  previousData: { type: mongoose.Schema.Types.Mixed, default: null },

  // Brand owner who submitted the request
  ownerId: { type: String, required: true },
  ownerName: { type: String, default: '' },

  // Status tracking
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: String, default: '' },
  reviewedAt: { type: Date },
  rejectionReason: { type: String, default: '' },

  // Human-readable summary
  summary: { type: String, default: '' },
}, { timestamps: true });

changeRequestSchema.index({ status: 1, createdAt: -1 });
changeRequestSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.model('ChangeRequest', changeRequestSchema);
