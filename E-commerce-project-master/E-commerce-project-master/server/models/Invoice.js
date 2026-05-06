const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  productName: { type: String, default: '' },
  description: { type: String, default: '' },
  mrp: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true }, // brand owner userId
  orderId: { type: String, default: '' },    // linked order (auto-generated invoices)
  source: { type: String, enum: ['manual', 'auto'], default: 'manual' }, // how the invoice was created
  customerName: { type: String, default: '' },
  customerAddress: { type: String, default: '' },
  customerContact: { type: String, default: '' },
  invoiceDate: { type: String, default: '' },
  dueDate: { type: String, default: '' },
  items: [invoiceItemSchema],
  notes: { type: String, default: '' },
  subtotal: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Partially Paid', 'Overdue'], default: 'Pending' },
  upiId: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  updatedBy: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
