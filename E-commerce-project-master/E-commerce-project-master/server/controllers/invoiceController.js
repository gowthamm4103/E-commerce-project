const Invoice = require('../models/Invoice');

// ─── Get Invoices ───────────────────────────────────────────────────
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ ownerId: req.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, invoices });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch invoices.' });
  }
};

// ─── Create Invoice ─────────────────────────────────────────────────
exports.createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber, customerName, customerAddress, customerContact,
      invoiceDate, dueDate, items, notes,
      paymentMethod, paymentStatus, upiId
    } = req.body;

    if (!invoiceNumber) {
      return res.status(400).json({ success: false, error: 'Invoice number is required.' });
    }

    // Calculate totals from items
    const subtotal = (items || []).reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 1);
    }, 0);

    const totalDiscount = (items || []).reduce((sum, item) => {
      return sum + (parseFloat(item.discount) || 0);
    }, 0);

    const totalTax = (items || []).reduce((sum, item) => {
      return sum + (parseFloat(item.tax) || 0);
    }, 0);

    const totalAmount = (items || []).reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0);
    }, 0);

    const invoice = new Invoice({
      invoiceNumber,
      ownerId: req.userId,
      customerName: customerName || '',
      customerAddress: customerAddress || '',
      customerContact: customerContact || '',
      invoiceDate: invoiceDate || '',
      dueDate: dueDate || '',
      items: items || [],
      notes: notes || '',
      subtotal,
      totalDiscount,
      totalTax,
      totalAmount,
      paymentMethod: paymentMethod || '',
      paymentStatus: paymentStatus || 'Pending',
      upiId: upiId || '',
    });

    await invoice.save();
    return res.status(201).json({ success: true, invoice });
  } catch (error) {
    console.error('Create invoice error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create invoice.' });
  }
};

// ─── Get Invoice by ID ──────────────────────────────────────────────
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }
    if (invoice.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }
    return res.json({ success: true, invoice });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch invoice.' });
  }
};

// ─── Update Invoice ─────────────────────────────────────────────────
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }
    if (invoice.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }

    const allowedFields = [
      'customerName', 'customerAddress', 'customerContact',
      'invoiceDate', 'dueDate', 'items', 'notes',
      'paymentMethod', 'paymentStatus', 'upiId'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        invoice[field] = req.body[field];
      }
    });

    // Recalculate totals if items updated
    if (req.body.items) {
      invoice.subtotal = req.body.items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 1);
      }, 0);
      invoice.totalDiscount = req.body.items.reduce((sum, item) => {
        return sum + (parseFloat(item.discount) || 0);
      }, 0);
      invoice.totalTax = req.body.items.reduce((sum, item) => {
        return sum + (parseFloat(item.tax) || 0);
      }, 0);
      invoice.totalAmount = req.body.items.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0);
    }

    await invoice.save();
    return res.json({ success: true, invoice });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update invoice.' });
  }
};

// ─── Delete Invoice ─────────────────────────────────────────────────
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }
    if (invoice.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }
    await Invoice.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Invoice deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete invoice.' });
  }
};