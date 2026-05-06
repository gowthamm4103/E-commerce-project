'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Plus, Edit, Trash2, Copy, Check, AlertCircle,
  Tag, Calendar, Users, ShoppingCart, Percent, DollarSign,
  Filter, Search, Loader2
} from 'lucide-react';
import { couponsAPI } from '../lib/api';

interface CouponData {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount: number;
  minPurchaseAmount: number;
  expiryDate: string;
  usageLimit: number;
  usagePerCustomer: number;
  usageCount: number;
  appliesTo: 'entire' | 'products' | 'category';
  specificProducts: string[];
  specificCategories: string[];
  customerEligibility: string;
  status: 'active' | 'inactive' | 'draft' | 'expired';
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface CouponForm {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  maxDiscountAmount: string;
  minPurchaseAmount: string;
  expiryDate: string;
  usageLimit: string;
  usagePerCustomer: string;
  appliesTo: 'entire' | 'products' | 'category';
  specificProducts: string[];
  specificCategories: string[];
  customerEligibility: string;
  status: 'active' | 'inactive';
}

interface Props {
  user: any;
}

const defaultForm: CouponForm = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  maxDiscountAmount: '',
  minPurchaseAmount: '',
  expiryDate: '',
  usageLimit: '',
  usagePerCustomer: '1',
  appliesTo: 'entire',
  specificProducts: [],
  specificCategories: [],
  customerEligibility: '',
  status: 'active',
};

export default function CouponManagement({ user }: Props) {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<CouponData | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState<CouponForm>({ ...defaultForm });

  // ─── Fetch coupons from backend ───────────────────────────────────
  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const data = await couponsAPI.getAll();
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  // ─── Helpers ──────────────────────────────────────────────────────
  const resetForm = () => { setForm({ ...defaultForm }); setEditingCoupon(null); };

  const isExpired = (d: string) => d ? new Date(d) < new Date() : false;

  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const approvalColor = (s: string) => {
    switch (s) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ─── Submit (create / update) ─────────────────────────────────────
  const handleSubmit = async (isDraft = false) => {
    if (!form.code || form.code.length > 16) {
      alert('Coupon code is required and must be max 16 characters');
      return;
    }
    if (!form.description) { alert('Description is required'); return; }
    if (form.discountType === 'percentage' && !form.discountValue) {
      alert('Discount percentage is required'); return;
    }
    if (form.discountType === 'fixed' && !form.maxDiscountAmount) {
      alert('Discount amount is required'); return;
    }
    if (!form.minPurchaseAmount) { alert('Minimum order amount is required'); return; }

    const body = {
      code: form.code,
      description: form.description,
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue) || 0,
      maxDiscountAmount: parseFloat(form.maxDiscountAmount) || 0,
      minPurchaseAmount: parseFloat(form.minPurchaseAmount) || 0,
      expiryDate: form.expiryDate,
      usageLimit: parseInt(form.usageLimit) || 0,
      usagePerCustomer: parseInt(form.usagePerCustomer) || 1,
      appliesTo: form.appliesTo,
      specificProducts: form.specificProducts,
      specificCategories: form.specificCategories,
      customerEligibility: form.customerEligibility,
      status: isDraft ? 'draft' : form.status,
      approvalStatus: isDraft ? 'draft' : (editingCoupon?.approvalStatus || 'pending'),
    };

    try {
      setSaving(true);
      if (editingCoupon) {
        const result = await couponsAPI.update(editingCoupon._id, body);
        alert(result.message || 'Coupon update request submitted for admin approval.');
      } else {
        const result = await couponsAPI.create(body);
        alert(result.message || (isDraft ? 'Coupon saved as draft!' : 'Coupon creation request submitted for admin approval!'));
      }
      setShowModal(false);
      resetForm();
      await fetchCoupons();
    } catch (err: any) {
      alert(err.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c: CouponData) => {
    setEditingCoupon(c);
    setForm({
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      discountValue: String(c.discountValue || ''),
      maxDiscountAmount: String(c.maxDiscountAmount || ''),
      minPurchaseAmount: String(c.minPurchaseAmount || ''),
      expiryDate: c.expiryDate || '',
      usageLimit: String(c.usageLimit || ''),
      usagePerCustomer: String(c.usagePerCustomer || '1'),
      appliesTo: c.appliesTo || 'entire',
      specificProducts: c.specificProducts || [],
      specificCategories: c.specificCategories || [],
      customerEligibility: c.customerEligibility || '',
      status: c.status === 'draft' ? 'active' : (c.status as 'active' | 'inactive'),
    });
    setShowModal(true);
  };

  const handleDelete = (c: CouponData) => { setCouponToDelete(c); setShowDeleteConfirm(true); };

  const confirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      const result = await couponsAPI.delete(couponToDelete._id);
      alert(result.message || 'Coupon deletion request submitted for admin approval.');
      setShowDeleteConfirm(false);
      setCouponToDelete(null);
      await fetchCoupons();
    } catch (err: any) {
      alert(err.message || 'Failed to submit coupon deletion request');
    }
  };

  // ─── Filtered list ────────────────────────────────────────────────
  const filteredCoupons = coupons.filter(c => {
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ─── Render ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-3 text-gray-600">Loading coupons...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" /> Create Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by code or description..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      {filteredCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map(coupon => (
            <div key={coupon._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <Tag size={20} />
                    <h3 className="text-lg font-bold">{coupon.code}</h3>
                  </div>
                  <button onClick={() => handleCopyCode(coupon.code)}
                    className="p-1 rounded hover:bg-blue-400 transition-colors">
                    {copiedCode === coupon.code ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-sm text-blue-100">{coupon.description}</p>
              </div>

              <div className="p-4">
                <div className="mb-3 p-2 bg-green-50 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-700">
                      {coupon.discountType === 'percentage' ? (
                        <><Percent size={16} className="mr-1" /><span className="font-semibold">{coupon.discountValue}% OFF</span></>
                      ) : (
                        <><DollarSign size={16} className="mr-1" /><span className="font-semibold">₹{coupon.discountValue} OFF</span></>
                      )}
                    </div>
                    {coupon.maxDiscountAmount > 0 && coupon.discountType === 'percentage' && (
                      <span className="text-xs text-green-600">Max: ₹{coupon.maxDiscountAmount}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <ShoppingCart size={14} className="mr-2" />
                    <span>Min Order: ₹{coupon.minPurchaseAmount}</span>
                  </div>
                  {coupon.expiryDate && (
                    <div className="flex items-center text-gray-600">
                      <Calendar size={14} className="mr-2" />
                      <span className={isExpired(coupon.expiryDate) ? 'text-red-600' : ''}>
                        {isExpired(coupon.expiryDate) ? 'Expired: ' : 'Expires: '}
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Users size={14} className="mr-2" />
                    <span>Usage: {coupon.usagePerCustomer} per customer</span>
                  </div>
                  {coupon.usageLimit > 0 && (
                    <div className="text-gray-600">
                      Total Limit: {coupon.usageLimit} uses
                      <span className="ml-2 text-xs">({coupon.usageCount || 0} used)</span>
                    </div>
                  )}
                  {coupon.appliesTo !== 'entire' && (
                    <div className="text-gray-600 text-xs">
                      Applies to: {coupon.appliesTo === 'products' ? 'Specific Products' : 'Specific Category'}
                    </div>
                  )}
                  {coupon.customerEligibility && (
                    <div className="text-gray-600 text-xs">Eligibility: {coupon.customerEligibility}</div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(coupon.status)}`}>
                    {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${approvalColor(coupon.approvalStatus)}`}>
                    {coupon.approvalStatus === 'draft' ? 'Draft' :
                     coupon.approvalStatus === 'pending' ? 'Pending Approval' :
                     coupon.approvalStatus === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                  {isExpired(coupon.expiryDate) && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button onClick={() => handleEdit(coupon)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                    <Edit size={14} className="mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDelete(coupon)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                    <Trash2 size={14} className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 border border-gray-200 rounded-lg bg-gray-50 text-center">
          <Tag size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">No coupons found</p>
          <button onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Create Your First Coupon
          </button>
        </div>
      )}

      {/* ─── Create / Edit Modal ────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-6xl my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code <span className="text-red-500">*</span></label>
                <input type="text" value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DEAL50" maxLength={16} />
                <p className="text-xs text-gray-500 mt-1">Max 16 characters, alphanumeric</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2} placeholder="Get upto 20% off on orders above ₹1499. Max discount ₹1200." />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type <span className="text-red-500">*</span></label>
                <div className="flex space-x-4">
                  {(['percentage', 'fixed'] as const).map(t => (
                    <label key={t} className="flex items-center">
                      <input type="radio" name="discountType" value={t}
                        checked={form.discountType === t}
                        onChange={() => setForm({ ...form, discountType: t })} className="mr-2" />
                      <span className="text-sm">{t === 'percentage' ? 'Percentage' : 'Flat Amount'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Discount Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {form.discountType === 'percentage' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage <span className="text-red-500">*</span></label>
                      <input type="number" value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="20" min="0" max="100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount Amount (₹)</label>
                      <input type="number" value={form.maxDiscountAmount}
                        onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1200" min="0" />
                    </div>
                  </>
                )}
                {form.discountType === 'fixed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Amount (₹) <span className="text-red-500">*</span></label>
                    <input type="number" value={form.maxDiscountAmount}
                      onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1200" min="0" />
                  </div>
                )}
              </div>

              {/* Min Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Amount (₹) <span className="text-red-500">*</span></label>
                <input type="number" value={form.minPurchaseAmount}
                  onChange={(e) => setForm({ ...form, minPurchaseAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1499" min="0" />
              </div>

              {/* Applies To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Applies To <span className="text-red-500">*</span></label>
                <div className="flex flex-col space-y-2">
                  {([{ v: 'entire', l: 'Entire Order' }, { v: 'products', l: 'Specific Products' }, { v: 'category', l: 'Specific Category' }] as const).map(o => (
                    <label key={o.v} className="flex items-center">
                      <input type="radio" name="appliesTo" value={o.v}
                        checked={form.appliesTo === o.v}
                        onChange={() => setForm({ ...form, appliesTo: o.v })} className="mr-2" />
                      <span className="text-sm">{o.l}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Usage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usage per Customer</label>
                  <input type="number" value={form.usagePerCustomer}
                    onChange={(e) => setForm({ ...form, usagePerCustomer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Usage Limit</label>
                  <input type="number" value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000" min="1" />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input type="date" value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]} />
              </div>

              {/* Customer Eligibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Eligibility</label>
                <input type="text" value={form.customerEligibility}
                  onChange={(e) => setForm({ ...form, customerEligibility: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="First-time customers only" />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Status</label>
                <select value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 border-t px-6 py-4 flex justify-end space-x-3 bg-white rounded-b-lg">
              <button onClick={() => { setShowModal(false); resetForm(); }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={() => handleSubmit(true)} disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button onClick={() => handleSubmit(false)} disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="text-red-600 mr-3" size={24} />
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{couponToDelete?.code}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
