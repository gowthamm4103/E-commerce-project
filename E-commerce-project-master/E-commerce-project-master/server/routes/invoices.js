const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, requireRole('brand_owner'), invoiceController.getInvoices);
router.post('/', auth, requireRole('brand_owner'), invoiceController.createInvoice);
router.get('/:id', auth, requireRole('brand_owner'), invoiceController.getInvoiceById);
router.put('/:id', auth, requireRole('brand_owner'), invoiceController.updateInvoice);
router.delete('/:id', auth, requireRole('brand_owner'), invoiceController.deleteInvoice);

module.exports = router;
