'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Check, XCircle, Edit, Trash2, Eye, Download, Filter, Search,
  TrendingUp, DollarSign, Tag, Users, Calendar, AlertCircle,
  Clock, BarChart3, PieChart, Activity, Bell, Shield, FileText,
  CheckCircle, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';
import { adminAPI } from '../lib/api';

/* ──────────────────── types ──────────────────── */
interface CouponData {
  _id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  discountPercentage?: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  minOrderAmount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usagePerCustomer?: number;
  usageCount?: number;
  appliesTo?: string;
  customerEligibility?: string;
  status: string;
  approvalStatus: string;
  ownerId: string;
  brandName?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface Analytics {
  totalRedemptions: number;
  totalDiscountGiven: number;
  totalRevenueImpact: number;
  topCoupons: { code: string; redemptions: number; discount: string }[];
  statusCounts: { pending: number; approved: number; rejected: number };
  activeCounts: { active: number; inactive: number; expired: number };
  totalCoupons: number;
}

/* ──────────────────── main component ──────────────────── */
export default function AdminCouponDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const [allCoupons, setAllCoupons] = useState<CouponData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  // Modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponData | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRedemptions: 0, totalDiscountGiven: 0, totalRevenueImpact: 0,
    topCoupons: [], statusCounts: { pending: 0, approved: 0, rejected: 0 },
    activeCounts: { active: 0, inactive: 0, expired: 0 }, totalCoupons: 0,
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    discountType: 'percentage',
    discountPercentage: '',
    maxDiscountAmount: '',
    minOrderAmount: '',
    expiryDate: '',
    usageLimit: '',
    usagePerCustomer: '',
    status: 'active',
  });

  /* ── fetch ── */
  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.coupons.getAll({ search: searchQuery || undefined });
      if (res.success) setAllCoupons(res.data);
    } catch (err) { console.error('Failed to load coupons:', err); }
    finally { setLoading(false); }
  }, [searchQuery]);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await adminAPI.coupons.getAnalytics();
      if (res.success) setAnalytics(res.data);
    } catch (err) { console.error('Failed to load analytics:', err); }
  }, []);

  useEffect(() => { loadCoupons(); loadAnalytics(); }, [loadCoupons, loadAnalytics]);

  /* ── derived ── */
  const pendingCoupons = allCoupons.filter((c) => c.approvalStatus === 'pending');
  const approvedCoupons = allCoupons.filter((c) => c.approvalStatus === 'approved');
  const rejectedCoupons = allCoupons.filter((c) => c.approvalStatus === 'rejected');

  const isExpired = (d?: string) => d ? new Date(d) < new Date() : false;

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getApprovalColor = (s: string) => {
    switch (s) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCoupons = (): CouponData[] => {
    let coupons: CouponData[];
    switch (activeTab) {
      case 'pending': coupons = pendingCoupons; break;
      case 'approved': coupons = approvedCoupons; break;
      case 'rejected': coupons = rejectedCoupons; break;
      default: coupons = allCoupons;
    }
    return coupons.filter((c) => {
      const matchSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.brandName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterStatus === 'all' || c.status === filterStatus;
      return matchSearch && matchFilter;
    });
  };

  /* ── actions ── */
  const handleApprove = async () => {
    if (!selectedCoupon) return;
    try {
      await adminAPI.coupons.approve(selectedCoupon._id);
      setShowApprovalModal(false);
      setSelectedCoupon(null);
      loadCoupons();
      loadAnalytics();
    } catch (err) { console.error(err); alert('Failed to approve coupon'); }
  };

  const handleReject = async () => {
    if (!selectedCoupon || !rejectionReason) { alert('Please provide a reason'); return; }
    try {
      await adminAPI.coupons.reject(selectedCoupon._id, rejectionReason);
      setShowRejectModal(false);
      setSelectedCoupon(null);
      setRejectionReason('');
      loadCoupons();
      loadAnalytics();
    } catch (err) { console.error(err); alert('Failed to reject coupon'); }
  };

  const handleEdit = async () => {
    if (!selectedCoupon) return;
    try {
      await adminAPI.coupons.update(selectedCoupon._id, editForm);
      setShowEditModal(false);
      setSelectedCoupon(null);
      loadCoupons();
      loadAnalytics();
    } catch (err) { console.error(err); alert('Failed to update coupon'); }
  };

  const handleToggleStatus = async (coupon: CouponData) => {
    try {
      await adminAPI.coupons.toggleStatus(coupon._id);
      loadCoupons();
    } catch (err) { console.error(err); alert('Failed to toggle status'); }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;
    try {
      await adminAPI.coupons.delete(selectedCoupon._id);
      setShowDeleteConfirm(false);
      setSelectedCoupon(null);
      loadCoupons();
      loadAnalytics();
    } catch (err) { console.error(err); alert('Failed to delete coupon'); }
  };

  const openEditModal = (c: CouponData) => {
    setSelectedCoupon(c);
    setEditForm({
      discountType: c.discountType,
      discountPercentage: String(c.discountPercentage || c.discountValue || ''),
      maxDiscountAmount: String(c.maxDiscountAmount || ''),
      minOrderAmount: String(c.minOrderAmount || c.minPurchaseAmount || ''),
      expiryDate: c.expiryDate || '',
      usageLimit: String(c.usageLimit || ''),
      usagePerCustomer: String(c.usagePerCustomer || ''),
      status: c.status,
    });
    setShowEditModal(true);
  };

  const exportCSV = () => {
    const rows = [
      ['Coupon Code', 'Brand', 'Discount Type', 'Discount Value', 'Min Order', 'Expiry Date', 'Status', 'Approval', 'Usage'],
      ...allCoupons.map((c) => [
        c.code, c.brandName || '', c.discountType,
        c.discountType === 'percentage' ? `${c.discountPercentage || c.discountValue}%` : `₹${c.maxDiscountAmount}`,
        `₹${c.minOrderAmount || c.minPurchaseAmount || 0}`,
        c.expiryDate || 'No Expiry', c.status, c.approvalStatus, String(c.usageCount || 0),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `coupons_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  /* ──────────────────── render helpers ──────────────────── */
  const renderCouponsList = () => {
    const coupons = filteredCoupons();
    return (
      <div>
        {/* Search & Filter */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by coupon code or brand..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

        {loading ? (
          <div className="flex justify-center py-12"><RefreshCw size={32} className="animate-spin text-gray-400" /></div>
        ) : coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div key={coupon._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold">{coupon.code}</h3>
                      <p className="text-sm text-indigo-100">{coupon.brandName}</p>
                    </div>
                    <Tag size={20} />
                  </div>
                  {coupon.description && <p className="text-sm text-indigo-100">{coupon.description}</p>}
                </div>

                <div className="p-4">
                  {/* Discount */}
                  <div className="mb-3 p-3 bg-green-50 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-700">
                        <DollarSign size={16} className="mr-1" />
                        <span className="font-semibold">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountPercentage || coupon.discountValue}% OFF`
                            : `₹${coupon.maxDiscountAmount || coupon.discountValue} OFF`}
                        </span>
                      </div>
                      {coupon.maxDiscountAmount && coupon.discountType === 'percentage' && (
                        <span className="text-xs text-green-600">Max: ₹{coupon.maxDiscountAmount}</span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Order:</span>
                      <span className="font-medium">₹{coupon.minOrderAmount || coupon.minPurchaseAmount || 0}</span>
                    </div>
                    {coupon.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className={`font-medium ${isExpired(coupon.expiryDate) ? 'text-red-600' : ''}`}>
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usage:</span>
                      <span className="font-medium">{coupon.usagePerCustomer || 1}/customer</span>
                    </div>
                    {coupon.usageLimit ? (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Limit:</span>
                        <span className="font-medium">{coupon.usageCount || 0}/{coupon.usageLimit}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon.status)}`}>
                      {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalColor(coupon.approvalStatus)}`}>
                      {coupon.approvalStatus.charAt(0).toUpperCase() + coupon.approvalStatus.slice(1)}
                    </span>
                    {isExpired(coupon.expiryDate) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>
                    )}
                  </div>

                  {/* Expanded */}
                  {expandedCard === coupon._id && (
                    <div className="mb-3 p-3 bg-gray-50 rounded text-xs space-y-1">
                      {coupon.approvedBy && <div><span className="font-medium">Approved by:</span> {coupon.approvedBy}</div>}
                      {coupon.approvedDate && <div><span className="font-medium">Approved on:</span> {new Date(coupon.approvedDate).toLocaleString()}</div>}
                      {coupon.rejectedBy && <div><span className="font-medium">Rejected by:</span> {coupon.rejectedBy}</div>}
                      {coupon.rejectionReason && <div><span className="font-medium">Reason:</span> {coupon.rejectionReason}</div>}
                      {coupon.customerEligibility && <div><span className="font-medium">Eligibility:</span> {coupon.customerEligibility}</div>}
                    </div>
                  )}

                  <button onClick={() => setExpandedCard(expandedCard === coupon._id ? null : coupon._id)}
                    className="w-full text-xs text-blue-600 hover:text-blue-800 mb-3 flex items-center justify-center">
                    {expandedCard === coupon._id
                      ? <>Show Less <ChevronUp size={14} className="ml-1" /></>
                      : <>Show More <ChevronDown size={14} className="ml-1" /></>}
                  </button>

                  {/* Actions by tab */}
                  {activeTab === 'pending' && (
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => { setSelectedCoupon(coupon); setShowApprovalModal(true); }}
                        className="flex items-center justify-center px-2 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs">
                        <Check size={14} className="mr-1" /> Approve
                      </button>
                      <button onClick={() => { setSelectedCoupon(coupon); setShowRejectModal(true); }}
                        className="flex items-center justify-center px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs">
                        <XCircle size={14} className="mr-1" /> Reject
                      </button>
                      <button onClick={() => openEditModal(coupon)}
                        className="flex items-center justify-center px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs">
                        <Edit size={14} className="mr-1" /> Edit
                      </button>
                    </div>
                  )}
                  {activeTab === 'approved' && (
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => openEditModal(coupon)}
                        className="flex items-center justify-center px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs">
                        <Edit size={14} className="mr-1" /> Edit
                      </button>
                      <button onClick={() => handleToggleStatus(coupon)}
                        className={`flex items-center justify-center px-2 py-2 text-white rounded-md text-xs ${coupon.status === 'active' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        <RefreshCw size={14} className="mr-1" />
                        {coupon.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => { setSelectedCoupon(coupon); setShowDeleteConfirm(true); }}
                        className="flex items-center justify-center px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs">
                        <Trash2 size={14} className="mr-1" /> Delete
                      </button>
                    </div>
                  )}
                  {(activeTab === 'rejected' || activeTab === 'all') && (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => openEditModal(coupon)}
                        className="flex items-center justify-center px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs">
                        <Edit size={14} className="mr-1" /> Edit
                      </button>
                      <button onClick={() => { setSelectedCoupon(coupon); setShowDeleteConfirm(true); }}
                        className="flex items-center justify-center px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs">
                        <Trash2 size={14} className="mr-1" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <Tag size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No coupons found</p>
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Total Redemptions', value: analytics.totalRedemptions.toLocaleString(), sub: 'All-time coupon usage', icon: <Activity size={24} />, grad: 'from-blue-500 to-blue-600' },
          { title: 'Total Discount Given', value: `₹${analytics.totalDiscountGiven.toLocaleString()}`, sub: 'Total savings for customers', icon: <DollarSign size={24} />, grad: 'from-green-500 to-green-600' },
          { title: 'Revenue Impact', value: `₹${analytics.totalRevenueImpact.toLocaleString()}`, sub: 'Generated revenue', icon: <TrendingUp size={24} />, grad: 'from-purple-500 to-purple-600' },
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

      {/* Top Coupons */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 flex items-center"><TrendingUp size={20} className="mr-2" /> Top Performing Coupons</h3>
        {analytics.topCoupons.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coupon Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redemptions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.topCoupons.map((c, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-800' : i === 1 ? 'bg-gray-100 text-gray-800' : i === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                      #{i + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{c.code}</td>
                  <td className="px-6 py-4">{c.redemptions}</td>
                  <td className="px-6 py-4">{c.discount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-gray-500 text-center py-8">No redemptions yet</p>}
      </div>

      {/* Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 flex items-center"><PieChart size={20} className="mr-2" /> Approval Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-600">Pending</span><span className="font-bold text-yellow-600">{analytics.statusCounts.pending}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Approved</span><span className="font-bold text-green-600">{analytics.statusCounts.approved}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Rejected</span><span className="font-bold text-red-600">{analytics.statusCounts.rejected}</span></div>
            <div className="flex justify-between pt-3 border-t"><span className="text-gray-600 font-semibold">Total</span><span className="font-bold text-blue-600">{analytics.totalCoupons}</span></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 flex items-center"><BarChart3 size={20} className="mr-2" /> Active vs Inactive</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-600">Active</span><span className="font-bold text-green-600">{analytics.activeCounts.active}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Inactive</span><span className="font-bold text-gray-600">{analytics.activeCounts.inactive}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Expired</span><span className="font-bold text-red-600">{analytics.activeCounts.expired}</span></div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={exportCSV} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Download size={20} className="mr-2" /> Export Report to CSV
        </button>
      </div>
    </div>
  );

  /* ──────────────────── main render ──────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Coupon Management</h1>
            <p className="text-gray-600">Manage and monitor all coupon activities</p>
          </div>
          <button onClick={() => { loadCoupons(); loadAnalytics(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm font-medium">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Pending</p><p className="text-2xl font-bold text-yellow-600">{pendingCoupons.length}</p></div>
              <Clock className="text-yellow-600" size={32} />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Approved</p><p className="text-2xl font-bold text-green-600">{approvedCoupons.length}</p></div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Rejected</p><p className="text-2xl font-bold text-red-600">{rejectedCoupons.length}</p></div>
              <XCircle className="text-red-600" size={32} />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold text-blue-600">{allCoupons.length}</p></div>
              <Tag className="text-blue-600" size={32} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b">
            <nav className="flex flex-wrap -mb-px">
              {[
                { key: 'pending', label: `Pending (${pendingCoupons.length})` },
                { key: 'approved', label: `Approved (${approvedCoupons.length})` },
                { key: 'rejected', label: `Rejected (${rejectedCoupons.length})` },
                { key: 'all', label: `All (${allCoupons.length})` },
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
            {activeTab === 'analytics' ? renderAnalytics() : renderCouponsList()}
          </div>
        </div>

        {/* ── Approval Modal ── */}
        {showApprovalModal && selectedCoupon && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="text-green-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold">Approve Coupon</h3>
              </div>
              <p className="text-gray-700 mb-2">Approve <span className="font-semibold">{selectedCoupon.code}</span>?</p>
              <div className="p-3 bg-gray-50 rounded text-sm mb-6">
                <p><span className="font-medium">Brand:</span> {selectedCoupon.brandName}</p>
                <p><span className="font-medium">Discount:</span> {selectedCoupon.discountType === 'percentage' ? `${selectedCoupon.discountPercentage || selectedCoupon.discountValue}%` : `₹${selectedCoupon.maxDiscountAmount || selectedCoupon.discountValue}`}</p>
                <p><span className="font-medium">Min Order:</span> ₹{selectedCoupon.minOrderAmount || selectedCoupon.minPurchaseAmount || 0}</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowApprovalModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Approve</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Reject Modal ── */}
        {showRejectModal && selectedCoupon && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="flex items-center mb-4">
                <XCircle className="text-red-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold">Reject Coupon</h3>
              </div>
              <p className="text-gray-700 mb-4">Rejecting: <span className="font-semibold">{selectedCoupon.code}</span></p>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection <span className="text-red-500">*</span></label>
              <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3}
                placeholder="Provide a reason..." />
              <div className="flex justify-end space-x-3 mt-4">
                <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={handleReject} disabled={!rejectionReason} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">Reject</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Modal ── */}
        {showEditModal && selectedCoupon && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-2xl my-8">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
                <h3 className="text-lg font-semibold">Edit Coupon</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                    <input type="text" value={selectedCoupon.code} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                    <select value={editForm.discountType} onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Flat Amount</option>
                    </select>
                  </div>
                  {editForm.discountType === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
                      <input type="number" value={editForm.discountPercentage} onChange={(e) => setEditForm({ ...editForm, discountPercentage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" max="100" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount (₹)</label>
                    <input type="number" value={editForm.maxDiscountAmount} onChange={(e) => setEditForm({ ...editForm, maxDiscountAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Order (₹)</label>
                    <input type="number" value={editForm.minOrderAmount} onChange={(e) => setEditForm({ ...editForm, minOrderAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input type="date" value={editForm.expiryDate} onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                    <input type="number" value={editForm.usageLimit} onChange={(e) => setEditForm({ ...editForm, usageLimit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Per Customer</label>
                    <input type="number" value={editForm.usagePerCustomer} onChange={(e) => setEditForm({ ...editForm, usagePerCustomer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={handleEdit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update Coupon</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Modal ── */}
        {showDeleteConfirm && selectedCoupon && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="text-red-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold">Delete Coupon</h3>
              </div>
              <p className="text-gray-700 mb-6">Permanently delete <span className="font-semibold">{selectedCoupon.code}</span>? This cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
