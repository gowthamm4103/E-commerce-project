'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Eye, Download, Search, Filter, Calendar,
  DollarSign, FileText, TrendingUp, Users, CreditCard,
  Check, XCircle, Clock, AlertCircle, ChevronDown, ChevronUp,
  Edit, Trash2, Send, RefreshCw, BarChart3, PieChart, Printer,
} from 'lucide-react';
import { adminAPI } from '../lib/api';

/* ──────────────────── types ──────────────────── */
interface InvoiceItem {
  productName: string;
  description?: string;
  mrp?: number;
  price: number;
  quantity: number;
  discount?: number;
  tax?: number;
  amount: number;
}

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  ownerId: string;
  brandName?: string;
  customerName?: string;
  customerAddress?: string;
  customerContact?: string;
  invoiceDate?: string;
  dueDate?: string;
  items?: InvoiceItem[];
  notes?: string;
  adminNotes?: string;
  subtotal?: number;
  totalDiscount?: number;
  totalTax?: number;
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus: string;
  upiId?: string;
  updatedBy?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface InvoiceAnalytics {
  totalInvoices: number;
  totalRevenue: number;
  paidAmount: number;
  pendingAmount: number;
  overdueInvoices: number;
  topBrands: { brandName: string; revenue: number; invoiceCount: number }[];
  statusCounts: { paid: number; pending: number; partial: number };
}

/* ──────────────────── main ──────────────────── */
export default function AdminInvoiceDashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [allInvoices, setAllInvoices] = useState<InvoiceData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<InvoiceAnalytics>({
    totalInvoices: 0, totalRevenue: 0, paidAmount: 0, pendingAmount: 0,
    overdueInvoices: 0, topBrands: [], statusCounts: { paid: 0, pending: 0, partial: 0 },
  });

  // Edit form
  const [editForm, setEditForm] = useState({ paymentStatus: '', paymentMethod: '', notes: '' });

  /* ── fetch ── */
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.invoices.getAll({
        search: searchQuery || undefined,
        paymentStatus: filterPaymentStatus !== 'all' ? filterPaymentStatus : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      if (res.success) setAllInvoices(res.data);
    } catch (err) { console.error('Failed to load invoices:', err); }
    finally { setLoading(false); }
  }, [searchQuery, filterPaymentStatus, dateFrom, dateTo]);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await adminAPI.invoices.getAnalytics();
      if (res.success) setAnalytics(res.data);
    } catch (err) { console.error('Failed to load analytics:', err); }
  }, []);

  useEffect(() => { loadInvoices(); loadAnalytics(); }, [loadInvoices, loadAnalytics]);

  /* ── helpers ── */
  const isOverdue = (inv: InvoiceData) => {
    if (inv.paymentStatus === 'Paid') return false;
    return inv.dueDate ? new Date(inv.dueDate) < new Date() : false;
  };

  const getPaymentColor = (s: string) => {
    switch (s) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Partially Paid': return 'bg-blue-100 text-blue-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = (): InvoiceData[] => {
    let invoices = allInvoices;
    switch (activeTab) {
      case 'paid': invoices = invoices.filter((i) => i.paymentStatus === 'Paid'); break;
      case 'pending': invoices = invoices.filter((i) => i.paymentStatus === 'Pending'); break;
      case 'overdue': invoices = invoices.filter((i) => isOverdue(i)); break;
    }
    return invoices;
  };

  /* ── actions ── */
  const handleUpdate = async () => {
    if (!selectedInvoice) return;
    try {
      await adminAPI.invoices.update(selectedInvoice._id, {
        paymentStatus: editForm.paymentStatus,
        paymentMethod: editForm.paymentMethod,
        adminNotes: editForm.notes,
      });
      setShowEditModal(false);
      setSelectedInvoice(null);
      loadInvoices();
      loadAnalytics();
    } catch (err) { console.error(err); alert('Failed to update invoice'); }
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;
    try {
      await adminAPI.invoices.delete(selectedInvoice._id);
      setShowDeleteConfirm(false);
      setSelectedInvoice(null);
      loadInvoices();
      loadAnalytics();
    } catch (err) { console.error(err); alert('Failed to delete invoice'); }
  };

  const openEditModal = (inv: InvoiceData) => {
    setSelectedInvoice(inv);
    setEditForm({
      paymentStatus: inv.paymentStatus,
      paymentMethod: inv.paymentMethod || '',
      notes: inv.adminNotes || '',
    });
    setShowEditModal(true);
  };

  const exportCSV = () => {
    const rows = [
      ['Invoice #', 'Brand', 'Customer', 'Date', 'Due', 'Amount', 'Status', 'Method'],
      ...allInvoices.map((inv) => [
        inv.invoiceNumber, inv.brandName || '', inv.customerName || '',
        inv.invoiceDate || '', inv.dueDate || '',
        `₹${inv.totalAmount || 0}`, inv.paymentStatus, inv.paymentMethod || '',
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `invoices_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  /* ──────────────────── sub-renders ──────────────────── */
  const renderInvoicesList = () => {
    const invoices = filteredInvoices();
    return (
      <div>
        {/* Search & Filter */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by invoice #, customer, or brand..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><RefreshCw size={32} className="animate-spin text-gray-400" /></div>
        ) : invoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((invoice) => (
              <div key={invoice._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
                {/* Header */}
                <div className={`p-4 text-white ${
                  isOverdue(invoice) ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  invoice.paymentStatus === 'Paid' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold">#{invoice.invoiceNumber}</h3>
                      <p className="text-sm opacity-90">{invoice.brandName}</p>
                    </div>
                    <FileText size={20} />
                  </div>
                  <p className="text-sm opacity-90">{invoice.customerName}</p>
                </div>

                <div className="p-4">
                  {/* Amount */}
                  <div className="mb-3 p-3 bg-green-50 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Amount</span>
                      <span className="text-xl font-bold text-green-700">₹{(invoice.totalAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice Date:</span>
                      <span className="font-medium">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className={`font-medium ${isOverdue(invoice) ? 'text-red-600' : ''}`}>
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment:</span>
                      <span className="font-medium">{invoice.paymentMethod || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{invoice.items?.length || 0} items</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentColor(invoice.paymentStatus)}`}>
                      {invoice.paymentStatus}
                    </span>
                    {isOverdue(invoice) && <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>}
                  </div>

                  {/* Expanded */}
                  {expandedCard === invoice._id && (
                    <div className="mb-3 p-3 bg-gray-50 rounded text-xs space-y-1">
                      <div><span className="font-medium">Customer Contact:</span> {invoice.customerContact || 'N/A'}</div>
                      <div><span className="font-medium">Address:</span> {invoice.customerAddress || 'N/A'}</div>
                      {invoice.notes && <div><span className="font-medium">Notes:</span> {invoice.notes}</div>}
                      {invoice.adminNotes && <div><span className="font-medium">Admin Notes:</span> {invoice.adminNotes}</div>}
                      {invoice.updatedBy && <div><span className="font-medium">Updated by:</span> {invoice.updatedBy}</div>}
                    </div>
                  )}

                  <button onClick={() => setExpandedCard(expandedCard === invoice._id ? null : invoice._id)}
                    className="w-full text-xs text-blue-600 hover:text-blue-800 mb-3 flex items-center justify-center">
                    {expandedCard === invoice._id
                      ? <>Show Less <ChevronUp size={14} className="ml-1" /></>
                      : <>Show More <ChevronDown size={14} className="ml-1" /></>}
                  </button>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { setSelectedInvoice(invoice); setShowInvoicePreview(true); }}
                      className="flex items-center justify-center px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs">
                      <Eye size={14} className="mr-1" /> View
                    </button>
                    <button onClick={() => openEditModal(invoice)}
                      className="flex items-center justify-center px-2 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs">
                      <Edit size={14} className="mr-1" /> Edit
                    </button>
                    <button onClick={() => { setSelectedInvoice(invoice); setShowDeleteConfirm(true); }}
                      className="flex items-center justify-center px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs">
                      <Trash2 size={14} className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Total Revenue', value: `₹${analytics.totalRevenue.toLocaleString()}`, sub: `${analytics.totalInvoices} invoices`, icon: <DollarSign size={24} />, grad: 'from-blue-500 to-blue-600' },
          { title: 'Paid Amount', value: `₹${analytics.paidAmount.toLocaleString()}`, sub: 'Successfully collected', icon: <Check size={24} />, grad: 'from-green-500 to-green-600' },
          { title: 'Pending Amount', value: `₹${analytics.pendingAmount.toLocaleString()}`, sub: 'Awaiting payment', icon: <Clock size={24} />, grad: 'from-yellow-500 to-yellow-600' },
        ].map((c) => (
          <div key={c.title} className={`bg-gradient-to-r ${c.grad} p-6 rounded-lg text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{c.title}</h3>{c.icon}
            </div>
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-sm opacity-80 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 flex items-center"><AlertCircle size={20} className="mr-2 text-red-600" /> Overdue Invoices</h3>
          <p className="text-4xl font-bold text-red-600">{analytics.overdueInvoices}</p>
          <p className="text-sm text-gray-600 mt-2">Requires immediate attention</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 flex items-center"><PieChart size={20} className="mr-2" /> Payment Distribution</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-gray-600">Paid</span><span className="font-bold text-green-600">{analytics.statusCounts.paid}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Pending</span><span className="font-bold text-yellow-600">{analytics.statusCounts.pending}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Partially Paid</span><span className="font-bold text-blue-600">{analytics.statusCounts.partial}</span></div>
          </div>
        </div>
      </div>

      {/* Top Brands */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 flex items-center"><TrendingUp size={20} className="mr-2" /> Top Brands by Revenue</h3>
        {analytics.topBrands.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.topBrands.map((b, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      i === 0 ? 'bg-yellow-100 text-yellow-800' : i === 1 ? 'bg-gray-100 text-gray-800' :
                      i === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                    }`}>#{i + 1}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">{b.brandName}</td>
                  <td className="px-6 py-4 text-green-600 font-bold">₹{b.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4">{b.invoiceCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-gray-500 text-center py-8">No data available</p>}
      </div>

      <div className="flex justify-end">
        <button onClick={exportCSV} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Download size={20} className="mr-2" /> Export Report
        </button>
      </div>
    </div>
  );

  /* ──────────────────── main render ──────────────────── */
  const paidCount = allInvoices.filter((i) => i.paymentStatus === 'Paid').length;
  const pendingCount = allInvoices.filter((i) => i.paymentStatus === 'Pending').length;
  const overdueCount = allInvoices.filter((i) => isOverdue(i)).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Invoice Management</h1>
            <p className="text-gray-600">Monitor and manage all invoices across the platform</p>
          </div>
          <button onClick={() => { loadInvoices(); loadAnalytics(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm font-medium">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold text-blue-600">{allInvoices.length}</p></div>
              <FileText className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Paid</p><p className="text-2xl font-bold text-green-600">{paidCount}</p></div>
              <Check className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Pending</p><p className="text-2xl font-bold text-yellow-600">{pendingCount}</p></div>
              <Clock className="text-yellow-600" size={32} />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Overdue</p><p className="text-2xl font-bold text-red-600">{overdueCount}</p></div>
              <AlertCircle className="text-red-600" size={32} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b">
            <nav className="flex flex-wrap -mb-px">
              {[
                { key: 'all', label: `All (${allInvoices.length})` },
                { key: 'paid', label: `Paid (${paidCount})` },
                { key: 'pending', label: `Pending (${pendingCount})` },
                { key: 'overdue', label: `Overdue (${overdueCount})` },
                { key: 'analytics', label: 'Analytics' },
              ].map((t) => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {activeTab === 'analytics' ? renderAnalytics() : renderInvoicesList()}
          </div>
        </div>

        {/* ── Edit Modal ── */}
        {showEditModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Invoice</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <select value={editForm.paymentStatus} onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select value={editForm.paymentMethod} onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                  <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3} placeholder="Add admin notes..." />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Modal ── */}
        {showDeleteConfirm && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="text-red-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold">Delete Invoice</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Permanently delete invoice <span className="font-semibold">#{selectedInvoice.invoiceNumber}</span>? This cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Invoice Preview Modal ── */}
        {showInvoicePreview && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-4xl my-8">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold">Invoice Preview</h3>
                <button onClick={() => setShowInvoicePreview(false)} className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"><X size={20} /></button>
              </div>

              <div className="p-8">
                {/* Invoice header */}
                <div className="border-b pb-6 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-blue-600">INVOICE</h1>
                      <p className="text-gray-600 mt-2">Invoice #: {selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-semibold">{selectedInvoice.brandName}</h2>
                      <p className="text-gray-600">Brand Owner</p>
                    </div>
                  </div>
                </div>

                {/* Bill-to / dates */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Bill To:</h3>
                    <p className="font-semibold">{selectedInvoice.customerName}</p>
                    <p className="text-gray-600">{selectedInvoice.customerAddress}</p>
                    <p className="text-gray-600">{selectedInvoice.customerContact}</p>
                  </div>
                  <div className="text-right">
                    <p className="mb-1"><span className="font-semibold">Invoice Date:</span> {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="font-semibold">Due Date:</span> {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                    <p className="mt-2">
                      <span className="font-semibold">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getPaymentColor(selectedInvoice.paymentStatus)}`}>{selectedInvoice.paymentStatus}</span>
                    </p>
                  </div>
                </div>

                {/* Items table */}
                <div className="mb-6">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-right">Qty</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item, i) => (
                        <tr key={i} className="border-b">
                          <td className="px-4 py-3">{item.productName}</td>
                          <td className="px-4 py-3 text-right">₹{item.price}</td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-semibold">₹{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="flex justify-end mb-6">
                  <div className="w-64 space-y-2">
                    {selectedInvoice.subtotal !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span><span>₹{selectedInvoice.subtotal}</span>
                      </div>
                    )}
                    {selectedInvoice.totalDiscount ? (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Discount:</span><span>-₹{selectedInvoice.totalDiscount}</span>
                      </div>
                    ) : null}
                    {selectedInvoice.totalTax ? (
                      <div className="flex justify-between text-sm">
                        <span>Tax:</span><span>₹{selectedInvoice.totalTax}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Total:</span><span className="text-blue-600">₹{selectedInvoice.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Notes:</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedInvoice.notes}</p>
                  </div>
                )}
                {selectedInvoice.adminNotes && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Admin Notes:</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedInvoice.adminNotes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t">
                <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  <Printer size={16} className="mr-2" /> Print
                </button>
                <button onClick={() => setShowInvoicePreview(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
