'use client';
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, Download, Printer, Check, Loader2 } from 'lucide-react';
import { invoicesAPI, productsAPI } from '../lib/api';

interface InvoiceItem {
  id: number;
  productName: string;
  mrp: number;
  price: number;
  discount: number;
  quantity: number;
  tax: number;
  amount: number;
}

interface Props {
  user: any;
  onClose: () => void;
}

export default function CreateInvoice({ user, onClose }: Props) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', address: '', contact: '' });
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [upiId, setUpiId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Generate invoice number
  useEffect(() => {
    setInvoiceNumber(`INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  }, []);

  // Default due date
  useEffect(() => {
    if (invoiceDate) {
      const d = new Date(invoiceDate);
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split('T')[0]);
    }
  }, [invoiceDate]);

  // Load products from backend
  useEffect(() => {
    (async () => {
      try {
        const data = await productsAPI.getAll();
        setProducts(data.products || []);
      } catch { /* ignore */ }
    })();
  }, []);

  const handleAddItem = () => {
    setItems([...items, {
      id: Date.now(), productName: '', mrp: 0, price: 0,
      discount: 0, quantity: 1, tax: 0, amount: 0,
    }]);
  };

  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    const it = updated[index];
    const base = parseFloat(String(it.price)) * parseFloat(String(it.quantity));
    const disc = parseFloat(String(it.discount)) || 0;
    const tax = parseFloat(String(it.tax)) || 0;
    it.amount = parseFloat((base - disc + tax).toFixed(2));
    setItems(updated);
  };

  const handleProductSelect = (product: any, index: number) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productName: product.name,
      mrp: parseFloat(product.price) || parseFloat(product.mrp) || 0,
      price: parseFloat(product.sellingPrice) || parseFloat(product.price) || 0,
      tax: parseFloat(String(product.gstPercentage)?.replace('%', '')) || 0,
      discount: 0, quantity: 1,
    } as any;
    const it = updated[index];
    it.amount = parseFloat((it.price * it.quantity + it.tax).toFixed(2));
    setItems(updated);
    setShowProductSearch(false);
    setSearchQuery('');
  };

  const calcSubtotal = () => items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);
  const calcTotalTax = () => items.reduce((s, i) => s + (i.tax || 0), 0).toFixed(2);
  const calcTotalDiscount = () => items.reduce((s, i) => s + (i.discount || 0), 0).toFixed(2);
  const calcTotal = () => items.reduce((s, i) => s + (i.amount || 0), 0).toFixed(2);

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brandName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validate = () => {
    if (!customerInfo.name || !customerInfo.address || !customerInfo.contact) {
      alert('Please fill in all customer information'); return false;
    }
    if (!invoiceDate || !dueDate) { alert('Please select invoice and due date'); return false; }
    if (items.length === 0) { alert('Please add at least one item'); return false; }
    if (!termsAccepted) { alert('Please accept Terms & Conditions'); return false; }
    if (!paymentMethod) { alert('Please select a payment method'); return false; }
    return true;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      await invoicesAPI.create({
        invoiceNumber,
        customerName: customerInfo.name,
        customerAddress: customerInfo.address,
        customerContact: customerInfo.contact,
        invoiceDate, dueDate,
        items: items.map(i => ({
          productName: i.productName, mrp: i.mrp, price: i.price,
          quantity: i.quantity, discount: i.discount, tax: i.tax, amount: i.amount,
        })),
        notes: invoiceNotes,
        paymentMethod, paymentStatus, upiId,
      });
      setInvoiceGenerated(true);
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-6xl my-8">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Create Invoice</h2>
          <button onClick={onClose} className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {!invoiceGenerated ? (
            <div className="space-y-6">
              {/* Invoice Number */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                <input type="text" value={invoiceNumber} readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 font-semibold" />
              </div>

              {/* Customer Info */}
              <div className="pb-2">
                <h3 className="text-lg font-semibold mb-4">Customer Information (Bill To)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                    <input type="text" value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter customer name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email/Phone *</label>
                    <input type="text" value={customerInfo.contact}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, contact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email or phone number" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Address *</label>
                    <textarea value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2} placeholder="Enter billing address" />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="pb-2">
                <h3 className="text-lg font-semibold mb-4">Invoice Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date *</label>
                    <input type="date" value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                    <input type="date" value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="pb-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Product Details</h3>
                  <button onClick={handleAddItem}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Plus size={16} className="mr-2" /> Add Item
                  </button>
                </div>
                {items.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No items added yet. Click &quot;Add Item&quot; to start.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Item Name', 'MRP', 'Price', 'Qty', 'Discount', 'Tax', 'Amount', 'Action'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item, idx) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <div className="relative">
                                <input type="text" value={item.productName}
                                  onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                                  onFocus={() => { setShowProductSearch(true); setSelectedItemIndex(idx); }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Search product" />
                                {showProductSearch && selectedItemIndex === idx && (
                                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    <div className="p-2">
                                      <input type="text" value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Search by name or SKU" />
                                    </div>
                                    {filteredProducts.map(p => (
                                      <div key={p._id || p.id}
                                        onClick={() => handleProductSelect(p, idx)}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                        <div className="font-medium">{p.name}</div>
                                        <div className="text-sm text-gray-500">
                                          {p.brandName} - ₹{p.price} - SKU: {p.sku}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" value={item.mrp}
                                onChange={(e) => handleItemChange(idx, 'mrp', e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md" />
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" value={item.price}
                                onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md" />
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded-md" min="1" />
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" value={item.discount}
                                onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md" />
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" value={item.tax}
                                onChange={(e) => handleItemChange(idx, 'tax', e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md" />
                            </td>
                            <td className="px-4 py-3 font-semibold">₹{item.amount}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleRemoveItem(idx)} className="text-red-600 hover:text-red-800">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="pb-2">
                <h3 className="text-lg font-semibold mb-4">Invoice Notes (Optional)</h3>
                <textarea value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3} placeholder="Enter any additional notes" />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-semibold">₹{calcSubtotal()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Total Discount:</span><span className="font-semibold text-red-600">-₹{calcTotalDiscount()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Total Tax:</span><span className="font-semibold">₹{calcTotalTax()}</span></div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total Amount:</span><span className="text-green-600">₹{calcTotal()}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="pb-2">
                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Payment Method</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status *</label>
                    <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                    </select>
                  </div>
                  {paymentMethod === 'UPI' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID (Optional)</label>
                      <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter UPI ID" />
                    </div>
                  )}
                </div>
              </div>

              {/* T&C */}
              <div className="flex items-start">
                <input type="checkbox" id="terms" checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1" />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I accept the Terms &amp; Conditions for invoice generation *
                </label>
              </div>
            </div>
          ) : (
            /* Invoice Preview */
            <div id="invoice-preview" className="bg-white p-8 border rounded-lg">
              <div className="border-b pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-blue-600">INVOICE</h1>
                    <p className="text-gray-600 mt-2">Invoice #: {invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <p className="text-gray-600">Brand Owner</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <p className="font-semibold">{customerInfo.name}</p>
                  <p className="text-gray-600">{customerInfo.address}</p>
                  <p className="text-gray-600">{customerInfo.contact}</p>
                </div>
                <div className="text-right">
                  <p className="mb-1"><span className="font-semibold">Invoice Date:</span> {new Date(invoiceDate).toLocaleDateString()}</p>
                  <p><span className="font-semibold">Due Date:</span> {new Date(dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      {['Item', 'MRP', 'Price', 'Qty', 'Discount', 'Tax', 'Amount'].map(h => (
                        <th key={h} className={`px-4 py-2 ${h === 'Item' ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-3">{item.productName}</td>
                        <td className="px-4 py-3 text-right">₹{item.mrp}</td>
                        <td className="px-4 py-3 text-right">₹{item.price}</td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">₹{item.discount}</td>
                        <td className="px-4 py-3 text-right">₹{item.tax}</td>
                        <td className="px-4 py-3 text-right font-semibold">₹{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-6">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between"><span>Subtotal:</span><span>₹{calcSubtotal()}</span></div>
                  <div className="flex justify-between text-red-600"><span>Discount:</span><span>-₹{calcTotalDiscount()}</span></div>
                  <div className="flex justify-between"><span>Tax:</span><span>₹{calcTotalTax()}</span></div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span><span className="text-blue-600">₹{calcTotal()}</span>
                  </div>
                </div>
              </div>

              {invoiceNotes && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Notes:</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{invoiceNotes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-semibold">Payment Method:</span> {paymentMethod}</p>
                    <p><span className="font-semibold">Payment Status:</span> {paymentStatus}</p>
                    {upiId && <p><span className="font-semibold">UPI ID:</span> {upiId}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Thank you for your business!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          {!invoiceGenerated ? (
            <>
              <button onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={handleGenerate} disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50">
                {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Check size={16} className="mr-2" />}
                {saving ? 'Saving...' : 'Generate Invoice'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setInvoiceGenerated(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Edit Invoice</button>
              <button onClick={() => window.print()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                <Printer size={16} className="mr-2" /> Print
              </button>
              <button onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                <Download size={16} className="mr-2" /> Download PDF
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-preview, #invoice-preview * { visibility: visible; }
          #invoice-preview { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
