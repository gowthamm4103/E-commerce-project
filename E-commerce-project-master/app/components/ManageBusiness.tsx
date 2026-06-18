'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, ShoppingCart, FileText, Tag, BarChart2, Settings,
  Upload, Download, Search, Filter, Plus, Edit, Trash2, Share2,
  Copy, Check, X, ChevronDown, AlertTriangle, TrendingUp, TrendingDown,
  DollarSign, Percent, Users, Archive, RefreshCw, ExternalLink,
  Box, Layers, FileSpreadsheet, Calendar, Store, Phone, Mail,
  MessageCircle, Globe, Loader2
} from 'lucide-react';
import {
  businessAPI, couponsAPI, invoicesAPI, productsAPI, ordersAPI
} from '../lib/api';
import CreateInvoice from './CreateInvoice';

/* ─── TYPES ──────────────────────────────────────────────────────── */
interface Props {
  user: any;
}

type Section =
  | 'overview' | 'products' | 'orders' | 'invoices'
  | 'coupons' | 'categories' | 'team' | 'store' | 'reports';

const TABS: { id: Section; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'store', label: 'Store Details', icon: Store },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
];

/* ─── COMPONENT ──────────────────────────────────────────────────── */
export default function ManageBusiness({ user }: Props) {
  const [section, setSection] = useState<Section>('overview');
  const [loading, setLoading] = useState(true);

  // Overview
  const [overview, setOverview] = useState<any>(null);

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState('');

  // Invoices
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  // Coupons
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'percentage', discountValue: '', minimumPurchase: '',
    maxDiscount: '', validFrom: '', validUntil: '', usageLimit: '',
  });

  // Categories
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', parentCategory: '' });

  // Team Members
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', email: '', role: 'Standard Member' });

  // Store details
  const [storeDetails, setStoreDetails] = useState<any>({
    storeName: '', brandName: '', dbaName: '', businessType: '',
    gstin: '', cin: '', storeAddress: '', phone: '', whatsapp: '',
    email: '', instagram: '', youtube: '', whatsappGroup: '',
    linkedin: '', pinterest: '', facebook: '', twitter: '',
    logo: '', favicon: '',
  });

  // Stock modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockOp, setStockOp] = useState<'add' | 'set'>('add');
  const [stockQty, setStockQty] = useState('');

  // Reports
  const [reportType, setReportType] = useState('');
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);

  /* ─── DATA LOADING ──────────────────────────────────────────────── */
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, prodRes, orderRes, invRes, coupRes, catRes, teamRes, storeRes] = await Promise.allSettled([
        businessAPI.getOverview(),
        productsAPI.getMyProducts(),
        ordersAPI.getAll(),
        invoicesAPI.getAll(),
        couponsAPI.getAll(),
        businessAPI.getCategories(),
        businessAPI.getTeamMembers(),
        businessAPI.getStoreDetails(),
      ]);

      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.overview);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.products || []);
      if (orderRes.status === 'fulfilled') setOrders(orderRes.value.orders || []);
      if (invRes.status === 'fulfilled') setInvoices(invRes.value.invoices || []);
      if (coupRes.status === 'fulfilled') setCoupons(coupRes.value.coupons || []);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.categories || []);
      if (teamRes.status === 'fulfilled') setTeamMembers(teamRes.value.members || []);
      if (storeRes.status === 'fulfilled' && storeRes.value.business) {
        setStoreDetails(storeRes.value.business);
      }
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ─── HELPERS ───────────────────────────────────────────────────── */
  const handleStockOperation = async () => {
    if (!selectedProduct || !stockQty) { alert('Fill in quantity'); return; }
    try {
      await productsAPI.updateStock(selectedProduct._id || selectedProduct.id, parseInt(stockQty), stockOp);
      alert(`Stock ${stockOp === 'add' ? 'added' : 'set'} successfully!`);
      setShowStockModal(false);
      setSelectedProduct(null);
      setStockQty('');
      await loadAll();
    } catch (err: any) { alert(err.message || 'Failed'); }
  };

  const handleAddCoupon = async () => {
    if (!couponForm.code || !couponForm.discountValue) { alert('Fill required fields'); return; }
    try {
      await couponsAPI.create({
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue: parseFloat(couponForm.discountValue),
        minPurchaseAmount: parseFloat(couponForm.minimumPurchase) || 0,
        maxDiscountAmount: parseFloat(couponForm.maxDiscount) || 0,
        expiryDate: couponForm.validUntil || '',
        usageLimit: parseInt(couponForm.usageLimit) || 0,
      });
      alert('Coupon created!');
      setShowCouponModal(false);
      setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minimumPurchase: '', maxDiscount: '', validFrom: '', validUntil: '', usageLimit: '' });
      await loadAll();
    } catch (err: any) { alert(err.message || 'Failed'); }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try { await couponsAPI.delete(id); await loadAll(); } catch { }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name) { alert('Enter category name'); return; }
    try {
      await businessAPI.createCategory(categoryForm);
      alert('Category added!');
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '', parentCategory: '' });
      await loadAll();
    } catch (err: any) { alert(err.message || 'Failed'); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await businessAPI.deleteCategory(id); await loadAll(); } catch { }
  };

  const handleAddTeamMember = async () => {
    if (!teamForm.name || !teamForm.email) { alert('Fill required fields'); return; }
    try {
      await businessAPI.createTeamMember(teamForm);
      alert('Team member added!');
      setShowTeamModal(false);
      setTeamForm({ name: '', email: '', role: 'Standard Member' });
      await loadAll();
    } catch (err: any) { alert(err.message || 'Failed'); }
  };

  const handleToggleTeamStatus = async (m: any) => {
    try {
      await businessAPI.updateTeamMember(m._id, { isActive: !m.isActive });
      await loadAll();
    } catch { }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Remove this member?')) return;
    try { await businessAPI.deleteTeamMember(id); await loadAll(); } catch { }
  };

  const handleSaveStoreDetails = async () => {
    try {
      await businessAPI.updateStoreDetails(storeDetails);
      alert('Store details saved!');
    } catch (err: any) { alert(err.message || 'Failed'); }
  };

  const handleGenerateReport = () => {
    if (!reportType || !reportDateFrom || !reportDateTo) { alert('Select report type and dates'); return; }
    setGeneratingReport(true);
    setTimeout(() => {
      let data: any[] = [];
      if (reportType === 'orders') data = orders;
      else if (reportType === 'invoices') data = invoices;
      else if (reportType === 'inventory') data = products;
      else if (reportType === 'coupons') data = coupons;

      const blob = new Blob([JSON.stringify({ type: reportType, dateFrom: reportDateFrom, dateTo: reportDateTo, data }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${reportType}_report_${reportDateFrom}_to_${reportDateTo}.json`;
      a.click();
      setGeneratingReport(false);
      alert('Report generated!');
    }, 1500);
  };

  const generateShareText = () => {
    if (!selectedProduct) return '';
    return `🛍️ *${selectedProduct.name}*\n\nBrand: ${selectedProduct.brandName || 'N/A'}\nPrice: ₹${selectedProduct.price || selectedProduct.mrp || 0}\nStock: ${selectedProduct.stockQuantity || 0}\n\nOrder now!`;
  };

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.brandName?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
    const matchCat = !filterCategory || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  /* ─── LOADING STATE ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-3 text-gray-600">Loading business data...</span>
      </div>
    );
  }

  /* ─── SECTION RENDERERS ─────────────────────────────────────────── */

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Business Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total Products', value: overview?.totalProducts ?? products.length, color: 'from-blue-500 to-blue-600', icon: Package },
          { label: 'Amount Received', value: `₹${(overview?.amountReceived ?? 0).toFixed(2)}`, color: 'from-green-500 to-green-600', icon: DollarSign },
          { label: 'Total Orders', value: overview?.totalOrders ?? orders.length, color: 'from-purple-500 to-purple-600', icon: ShoppingCart },
          { label: 'Low Stock Alerts', value: overview?.lowStockAlerts ?? 0, color: 'from-orange-500 to-orange-600', icon: AlertTriangle },
          { label: 'Total Invoices', value: overview?.totalInvoices ?? invoices.length, color: 'from-yellow-500 to-yellow-600', icon: FileText },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-r ${card.color} rounded-lg shadow-md p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">{card.label}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <card.icon size={40} className="opacity-80" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Wallet Balance</p>
            <p className="text-2xl font-bold text-gray-900">₹{(overview?.walletBalance ?? 0).toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">GST Payable</p>
            <p className="text-2xl font-bold text-gray-900">₹{(overview?.gstPayable ?? 0).toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Pending Payments</p>
            <p className="text-2xl font-bold text-gray-900">{overview?.pendingPayments ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Products &amp; Accessories</h2>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, brand, or SKU..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Categories</option>
            {[...new Set(products.map(p => p.category).filter(Boolean))].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Image', 'Product', 'Category', 'Price', 'MRP', 'Stock', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(item => (
                <tr key={item._id || item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.brandName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.category}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{item.sellingPrice || item.price || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">₹{item.mrp || item.price || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(item.stockQuantity || 0) < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {item.stockQuantity || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => { setSelectedProduct(item); setStockOp('add'); setShowStockModal(true); }}
                        className="text-blue-600 hover:text-blue-900" title="Stock In"><TrendingUp size={16} /></button>
                      <button onClick={() => { setSelectedProduct(item); setStockOp('set'); setShowStockModal(true); }}
                        className="text-orange-600 hover:text-orange-900" title="Set Stock"><TrendingDown size={16} /></button>
                      <button onClick={() => { setSelectedProduct(item); setShowShareModal(true); }}
                        className="text-green-600 hover:text-green-900" title="Share"><Share2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">No products found.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['pending', 'confirmed', 'delivered', 'cancelled'].map(s => (
          <div key={s} className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 capitalize">{s}</p>
            <p className="text-2xl font-bold">{orders.filter(o => o.status === s).length}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID', 'Date', 'Amount', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.slice(0, 20).map(order => (
                <tr key={order._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.orderId || order._id?.slice(-8)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{order.totalAmount || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="text-center py-12 text-gray-500">No orders yet.</div>}
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
        <button onClick={() => setShowCreateInvoice(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <Plus size={16} className="mr-2" /> Create Invoice
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">{invoices.filter(i => i.paymentStatus === 'Paid').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-orange-600">{invoices.filter(i => i.paymentStatus === 'Pending').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{invoices.filter(i => i.paymentStatus === 'Overdue').length}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Invoice #', 'Customer', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map(inv => (
                <tr key={inv._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{inv.customerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{inv.totalAmount || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      inv.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                      inv.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>{inv.paymentStatus}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button onClick={async () => {
                      if (!confirm('Are you sure you want to delete this invoice?')) return;
                      try {
                        await invoicesAPI.delete(inv._id);
                        await loadAll();
                      } catch (err: any) {
                        if (err.message === 'Invoice not found.') {
                          alert('This invoice has already been deleted or no longer exists.');
                        } else {
                          alert(err.message || 'Failed to delete invoice');
                        }
                      }
                    }}
                      className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && <div className="text-center py-12 text-gray-500">No invoices. Create your first!</div>}
        </div>
      </div>
    </div>
  );

  const renderCoupons = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Coupons</h2>
        <button onClick={() => setShowCouponModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <Plus size={16} className="mr-2" /> Create Coupon
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4"><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{coupons.length}</p></div>
        <div className="bg-white rounded-lg shadow-md p-4"><p className="text-sm text-gray-600">Active</p><p className="text-2xl font-bold text-green-600">{coupons.filter(c => c.status === 'active').length}</p></div>
        <div className="bg-white rounded-lg shadow-md p-4"><p className="text-sm text-gray-600">Inactive</p><p className="text-2xl font-bold text-red-600">{coupons.filter(c => c.status !== 'active').length}</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.length > 0 ? coupons.map(c => (
          <div key={c._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{c.code}</h3>
                <p className="text-sm text-gray-600">{c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.status}</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              {c.minPurchaseAmount > 0 && <p>Min Purchase: ₹{c.minPurchaseAmount}</p>}
              {c.expiryDate && <p>Expires: {new Date(c.expiryDate).toLocaleDateString()}</p>}
              <p>Used: {c.usageCount || 0} / {c.usageLimit || '∞'}</p>
            </div>
            <button onClick={() => handleDeleteCoupon(c._id)}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"><Trash2 size={16} /></button>
          </div>
        )) : (
          <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow-md">
            <Tag size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No coupons yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <button onClick={() => setShowCategoryModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <Plus size={16} className="mr-2" /> Add Category
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Description', 'Parent', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(cat => (
                <tr key={cat._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{cat.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{cat.parentCategory || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && <div className="text-center py-12 text-gray-500">No categories. Add your first!</div>}
        </div>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
        <button onClick={() => setShowTeamModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <Plus size={16} className="mr-2" /> Add Team Member
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4"><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{teamMembers.length}</p></div>
        <div className="bg-white rounded-lg shadow-md p-4"><p className="text-sm text-gray-600">Active</p><p className="text-2xl font-bold text-green-600">{teamMembers.filter(m => m.isActive).length}</p></div>
        <div className="bg-white rounded-lg shadow-md p-4"><p className="text-sm text-gray-600">Inactive</p><p className="text-2xl font-bold text-red-600">{teamMembers.filter(m => !m.isActive).length}</p></div>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map(m => (
                <tr key={m._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{m.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{m.role}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${m.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {m.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button onClick={() => handleToggleTeamStatus(m)} className="text-orange-600 hover:text-orange-900 mr-3">
                      {m.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDeleteTeamMember(m._id)} className="text-red-600 hover:text-red-900">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teamMembers.length === 0 && <div className="text-center py-12 text-gray-500">No team members yet.</div>}
        </div>
      </div>
    </div>
  );

  const renderStore = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Store &amp; Brand Details</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={(e) => { e.preventDefault(); handleSaveStoreDetails(); }} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'storeName', label: 'Store Name', ph: 'Enter store name' },
                { key: 'brandName', label: 'Brand Name', ph: 'Enter brand name' },
                { key: 'dbaName', label: 'DBA Name', ph: 'Doing Business As' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                  <input type="text" value={storeDetails[f.key] || ''}
                    onChange={(e) => setStoreDetails({ ...storeDetails, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={f.ph} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                <select value={storeDetails.businessType || ''}
                  onChange={(e) => setStoreDetails({ ...storeDetails, businessType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Business Type</option>
                  {['partnership', 'proprietorship', 'llp', 'private_limited', 'public_limited', 'not_registered'].map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[{ key: 'gstin', label: 'GSTIN' }, { key: 'cin', label: 'CIN' }].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                  <input type="text" value={storeDetails[f.key] || ''}
                    onChange={(e) => setStoreDetails({ ...storeDetails, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter ${f.label}`} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                <textarea value={storeDetails.storeAddress || ''}
                  onChange={(e) => setStoreDetails({ ...storeDetails, storeAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3}
                  placeholder="Enter complete store address" />
              </div>
              {[
                { key: 'phone', label: 'Phone', type: 'tel' },
                { key: 'whatsapp', label: 'WhatsApp', type: 'tel' },
                { key: 'email', label: 'Email', type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                  <input type={f.type} value={storeDetails[f.key] || ''}
                    onChange={(e) => setStoreDetails({ ...storeDetails, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter ${f.label.toLowerCase()}`} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['instagram', 'youtube', 'whatsappGroup', 'linkedin', 'facebook', 'twitter'].map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                  <input type="url" value={storeDetails[key] || ''}
                    onChange={(e) => setStoreDetails({ ...storeDetails, [key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`${key} URL`} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Store Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Generate Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Type</option>
              <option value="orders">Orders</option>
              <option value="invoices">Invoices</option>
              <option value="inventory">Inventory</option>
              <option value="coupons">Coupons</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <input type="date" value={reportDateFrom} onChange={(e) => setReportDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <input type="date" value={reportDateTo} onChange={(e) => setReportDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-end">
            <button onClick={handleGenerateReport} disabled={generatingReport}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center">
              {generatingReport ? <><RefreshCw size={16} className="mr-2 animate-spin" /> Generating...</> : <><Download size={16} className="mr-2" /> Generate</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── MAIN RENDER ───────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Manage Business</h1>
            <button onClick={loadAll} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <RefreshCw size={16} className="inline mr-2" /> Sync Data
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setSection(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  section === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}>
                <tab.icon size={16} className="mr-2" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-8xl mx-auto px-4 py-8">
        {section === 'overview' && renderOverview()}
        {section === 'products' && renderProducts()}
        {section === 'orders' && renderOrders()}
        {section === 'invoices' && renderInvoices()}
        {section === 'coupons' && renderCoupons()}
        {section === 'categories' && renderCategories()}
        {section === 'team' && renderTeam()}
        {section === 'store' && renderStore()}
        {section === 'reports' && renderReports()}
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────── */}

      {/* Stock Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{stockOp === 'add' ? 'Add Stock' : 'Set Stock'}</h3>
              <button onClick={() => setShowStockModal(false)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium">Product: {selectedProduct.name}</p>
              <p className="text-sm text-gray-600">Current Stock: {selectedProduct.stockQuantity || 0}</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" min="1" />
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowStockModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={handleStockOperation} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {stockOp === 'add' ? 'Add Stock' : 'Set Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Share Product</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <pre className="text-sm whitespace-pre-wrap">{generateShareText()}</pre>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => { navigator.clipboard.writeText(generateShareText()); alert('Copied!'); }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center">
                <Copy size={16} className="mr-2" /> Copy
              </button>
              <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(generateShareText())}`, '_blank')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center">
                <MessageCircle size={16} className="mr-2" /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Create Coupon</h3>
              <button onClick={() => setShowCouponModal(false)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'code', label: 'Coupon Code *', ph: 'e.g., SAVE20' },
                { key: 'discountValue', label: 'Discount Value *', ph: '20', type: 'number' },
                { key: 'minimumPurchase', label: 'Min Purchase', ph: '500', type: 'number' },
                { key: 'maxDiscount', label: 'Max Discount (₹)', ph: '200', type: 'number' },
                { key: 'usageLimit', label: 'Usage Limit', ph: '100', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                  <input type={f.type || 'text'} value={(couponForm as any)[f.key]}
                    onChange={(e) => setCouponForm({ ...couponForm, [f.key]: f.key === 'code' ? e.target.value.toUpperCase() : e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={f.ph} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <select value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
                <input type="date" value={couponForm.validFrom} onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                <input type="date" value={couponForm.validUntil} onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowCouponModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={handleAddCoupon} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
                <select value={categoryForm.parentCategory} onChange={(e) => setCategoryForm({ ...categoryForm, parentCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">None (Top Level)</option>
                  {categories.filter(c => !c.parentCategory).map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={handleAddCategory} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Member Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Team Member</h3>
              <button onClick={() => setShowTeamModal(false)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input type="text" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" value={teamForm.email} onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select value={teamForm.role} onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Standard Member">Standard Member</option>
                  <option value="Premium Member">Premium Member</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowTeamModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={handleAddTeamMember} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoice && (
        <CreateInvoice user={user} onClose={() => { setShowCreateInvoice(false); loadAll(); }} />
      )}
    </div>
  );
}
