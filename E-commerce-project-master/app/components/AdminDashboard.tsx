'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Filter, Download, Shield, CreditCard, Phone,
  Mail, Calendar, MapPin, ArrowUpDown, Eye, X, Package, Building2,
  RefreshCw, ChevronLeft, ChevronRight, LogOut, LayoutDashboard,
  Tag, FileText, ClipboardCheck, Check, XCircle, Clock,
  Trash2, Menu as MenuIcon,
} from 'lucide-react';
import { adminAPI } from '../lib/api';

/* ══════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════ */
interface Props {
  user: { userId?: string; name?: string; email?: string; userType?: string | null };
  onLogout: () => void;
}

interface UserData {
  _id: string; userId: string; name: string; email: string; mobile?: string; userType: string;
  kycData?: { verified?: boolean; pan?: string; aadhaar?: string; address?: string; businessAddress?: string };
  bankDetails?: { accountNumber?: string; accountHolder?: string; ifsc?: string; bankName?: string };
  brandName?: string; businessRegNo?: string; gstNo?: string; dateOfBirth?: string;
  createdAt?: string; orderCount?: number; totalSpent?: number;
  [key: string]: unknown;
}

interface ChangeRequestData {
  _id: string; entityType: string; actionType: string; entityId?: string;
  payload: any; previousData?: any; ownerId: string; ownerName: string;
  status: string; summary: string; reviewedBy?: string; reviewedAt?: string;
  rejectionReason?: string; createdAt?: string;
}

interface CouponData {
  _id: string; code: string; description?: string; discountType: string;
  discountValue: number; maxDiscountAmount?: number; minPurchaseAmount?: number;
  expiryDate?: string; usageLimit?: number; usageCount?: number; status: string;
  approvalStatus: string; ownerId: string; brandName?: string; createdAt?: string;
}

interface InvoiceData {
  _id: string; invoiceNumber: string; ownerId: string; brandName?: string;
  customerName?: string; invoiceDate?: string; dueDate?: string;
  totalAmount?: number; paymentStatus: string; paymentMethod?: string;
  adminNotes?: string; createdAt?: string;
  orderId?: string; source?: string;
  items?: { productName: string; price: number; quantity: number; amount: number }[];
}

type AdminTab = 'overview' | 'users' | 'changeRequests' | 'coupons' | 'invoices';

/* ══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════ */
const StatCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div><p className="text-sm font-medium text-gray-500">{label}</p><h3 className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</h3></div>
      <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>{icon}</div>
    </div>
  </div>
);

const DetailField: React.FC<{ label: string; value?: string | number | null; icon?: React.ReactNode; children?: React.ReactNode }> = ({ label, value, icon, children }) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">{label} {icon}</span>
    <span className="text-sm font-medium text-gray-900 truncate">{children || value || 'N/A'}</span>
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export default function AdminDashboard({ user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ─── Users state ─────────────────────────────────────
  const [users, setUsers] = useState<UserData[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [userLoading, setUserLoading] = useState(false);
  const [userPagination, setUserPagination] = useState({ total: 0, page: 1, limit: 50, pages: 0 });
  const [userStats, setUserStats] = useState({ totalUsers: 0, totalCustomers: 0, totalBrandOwners: 0, totalFounders: 0, kycVerified: 0 });
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userDetail, setUserDetail] = useState<UserData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userSort, setUserSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'createdAt', dir: 'desc' });

  // ─── Change Requests state ──────────────────────────
  const [changeRequests, setChangeRequests] = useState<ChangeRequestData[]>([]);
  const [crLoading, setCrLoading] = useState(false);
  const [crFilter, setCrFilter] = useState('pending');
  const [crEntityFilter, setCrEntityFilter] = useState('all');
  const [crSearch, setCrSearch] = useState('');
  const [crStats, setCrStats] = useState({ pending: 0, approved: 0, rejected: 0, productRequests: 0, couponRequests: 0 });
  const [selectedCR, setSelectedCR] = useState<ChangeRequestData | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [crActionLoading, setCrActionLoading] = useState(false);

  // ─── Coupons state ──────────────────────────────────
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFilter, setCouponFilter] = useState('all');
  const [couponSearch, setCouponSearch] = useState('');

  // ─── Invoices state ─────────────────────────────────
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceFilter, setInvoiceFilter] = useState('all');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  // ─── Logout confirmation ────────────────────────────
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /* ════════════════════════════════════════════════════════════════
     DATA FETCHING
     ════════════════════════════════════════════════════════════════ */

  const fetchUsers = useCallback(async (page = 1) => {
    setUserLoading(true);
    try {
      const res = await adminAPI.users.getAll({
        type: userFilter !== 'all' ? userFilter : undefined,
        search: userSearch || undefined, page, limit: 50,
      });
      if (res.success) { setUsers(res.data); setUserPagination(res.pagination); }
    } catch (err) { console.error('Failed to fetch users:', err); }
    finally { setUserLoading(false); }
  }, [userFilter, userSearch]);

  const fetchUserStats = useCallback(async () => {
    try {
      const res = await adminAPI.users.getStats();
      if (res.success) setUserStats(res.data);
    } catch (err) { console.error('Failed to fetch user stats:', err); }
  }, []);

  const fetchChangeRequests = useCallback(async () => {
    setCrLoading(true);
    try {
      const res = await adminAPI.changeRequests.getAll({
        status: crFilter !== 'all' ? crFilter : undefined,
        entityType: crEntityFilter !== 'all' ? crEntityFilter : undefined,
        search: crSearch || undefined,
      });
      if (res.success) setChangeRequests(res.data);
    } catch (err) { console.error('Failed to fetch change requests:', err); }
    finally { setCrLoading(false); }
  }, [crFilter, crEntityFilter, crSearch]);

  const fetchCRStats = useCallback(async () => {
    try {
      const res = await adminAPI.changeRequests.getStats();
      if (res.success) setCrStats(res.data);
    } catch (err) { console.error('Failed to fetch CR stats:', err); }
  }, []);

  const fetchCoupons = useCallback(async () => {
    setCouponLoading(true);
    try {
      const res = await adminAPI.coupons.getAll({
        approvalStatus: couponFilter !== 'all' ? couponFilter : undefined,
        search: couponSearch || undefined,
      });
      if (res.success) setCoupons(res.data);
    } catch (err) { console.error('Failed to fetch coupons:', err); }
    finally { setCouponLoading(false); }
  }, [couponFilter, couponSearch]);

  const fetchInvoices = useCallback(async () => {
    setInvoiceLoading(true);
    try {
      const res = await adminAPI.invoices.getAll({
        paymentStatus: invoiceFilter !== 'all' ? invoiceFilter : undefined,
        search: invoiceSearch || undefined,
      });
      if (res.success) setInvoices(res.data);
    } catch (err) { console.error('Failed to fetch invoices:', err); }
    finally { setInvoiceLoading(false); }
  }, [invoiceFilter, invoiceSearch]);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'overview') { fetchUserStats(); fetchCRStats(); }
    if (activeTab === 'users') { fetchUsers(); fetchUserStats(); }
    if (activeTab === 'changeRequests') { fetchChangeRequests(); fetchCRStats(); }
    if (activeTab === 'coupons') { fetchCoupons(); }
    if (activeTab === 'invoices') { fetchInvoices(); }
  }, [activeTab, fetchUsers, fetchUserStats, fetchChangeRequests, fetchCRStats, fetchCoupons, fetchInvoices]);

  /* ════════════════════════════════════════════════════════════════
     ACTIONS
     ════════════════════════════════════════════════════════════════ */

  const handleApproveCR = async (id: string) => {
    setCrActionLoading(true);
    try {
      const res = await adminAPI.changeRequests.approve(id);
      if (res.success) {
        alert('Change request approved and applied successfully.');
        setSelectedCR(null);
        fetchChangeRequests();
        fetchCRStats();
      }
    } catch (err: any) { alert(err.message || 'Failed to approve.'); }
    finally { setCrActionLoading(false); }
  };

  const handleRejectCR = async (id: string) => {
    if (!rejectReason.trim()) { alert('Please provide a rejection reason.'); return; }
    setCrActionLoading(true);
    try {
      const res = await adminAPI.changeRequests.reject(id, rejectReason);
      if (res.success) {
        alert('Change request rejected.');
        setSelectedCR(null);
        setRejectReason('');
        fetchChangeRequests();
        fetchCRStats();
      }
    } catch (err: any) { alert(err.message || 'Failed to reject.'); }
    finally { setCrActionLoading(false); }
  };

  const handleApproveCoupon = async (id: string) => {
    try { await adminAPI.coupons.approve(id); fetchCoupons(); } catch (err: any) { alert(err.message || 'Failed.'); }
  };

  const handleRejectCoupon = async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try { await adminAPI.coupons.reject(id, reason); fetchCoupons(); } catch (err: any) { alert(err.message || 'Failed.'); }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon permanently?')) return;
    try { await adminAPI.coupons.delete(id); fetchCoupons(); } catch (err: any) { alert(err.message || 'Failed.'); }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Delete this invoice permanently?')) return;
    try { await adminAPI.invoices.delete(id); fetchInvoices(); } catch (err: any) { alert(err.message || 'Failed.'); }
  };

  const openUserDetail = async (u: UserData) => {
    setSelectedUser(u);
    setDetailLoading(true);
    try { const res = await adminAPI.users.getById(u.userId); if (res.success) setUserDetail(res.data); }
    catch { setUserDetail(null); }
    finally { setDetailLoading(false); }
  };

  const exportUsersCSV = () => {
    const rows = [
      ['User ID', 'Name', 'Email', 'Phone', 'Type', 'KYC', 'Created'],
      ...users.map((u) => [u.userId, u.name, u.email, u.mobile || '', u.userType, u.kycData?.verified ? 'Yes' : 'No', u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '']),
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const sortedUsers = [...users].sort((a, b) => {
    const vA = (a as any)[userSort.key]; const vB = (b as any)[userSort.key];
    const sA = typeof vA === 'string' ? vA.toLowerCase() : vA ?? '';
    const sB = typeof vB === 'string' ? vB.toLowerCase() : vB ?? '';
    if (sA < sB) return userSort.dir === 'asc' ? -1 : 1;
    if (sA > sB) return userSort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  /* ════════════════════════════════════════════════════════════════
     SIDEBAR TABS
     ════════════════════════════════════════════════════════════════ */
  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'changeRequests', label: 'Requests', icon: <ClipboardCheck size={20} />, badge: crStats.pending },
    { id: 'coupons', label: 'Coupons', icon: <Tag size={20} /> },
    { id: 'invoices', label: 'Invoices', icon: <FileText size={20} /> },
  ];

  /* ════════════════════════════════════════════════════════════════
     RENDER SECTIONS
     ════════════════════════════════════════════════════════════════ */

  // ─── OVERVIEW ────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Users</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Total Users" value={userStats.totalUsers} icon={<Users size={20} />} color="blue" />
          <StatCard label="Customers" value={userStats.totalCustomers} icon={<Users size={20} />} color="indigo" />
          <StatCard label="Brand Owners" value={userStats.totalBrandOwners} icon={<Building2 size={20} />} color="purple" />
          <StatCard label="Founders" value={userStats.totalFounders} icon={<Shield size={20} />} color="amber" />
          <StatCard label="KYC Verified" value={userStats.kycVerified} icon={<Shield size={20} />} color="green" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Approval Requests</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Pending" value={crStats.pending} icon={<Clock size={20} />} color="amber" />
          <StatCard label="Approved" value={crStats.approved} icon={<Check size={20} />} color="green" />
          <StatCard label="Rejected" value={crStats.rejected} icon={<XCircle size={20} />} color="red" />
          <StatCard label="Product Requests" value={crStats.productRequests} icon={<Package size={20} />} color="blue" />
          <StatCard label="Coupon Requests" value={crStats.couponRequests} icon={<Tag size={20} />} color="purple" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([
            { label: 'Review Requests', tab: 'changeRequests' as AdminTab, icon: <ClipboardCheck size={20} />, color: 'amber', count: crStats.pending },
            { label: 'Manage Users', tab: 'users' as AdminTab, icon: <Users size={20} />, color: 'blue', count: userStats.totalUsers },
            { label: 'View Coupons', tab: 'coupons' as AdminTab, icon: <Tag size={20} />, color: 'purple', count: 0 },
            { label: 'View Invoices', tab: 'invoices' as AdminTab, icon: <FileText size={20} />, color: 'green', count: 0 },
          ]).map((action) => (
            <button key={action.label} onClick={() => setActiveTab(action.tab)}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-left">
              <div className={`p-2 rounded-lg bg-${action.color}-50 text-${action.color}-600 w-fit mb-3`}>{action.icon}</div>
              <p className="font-semibold text-gray-800">{action.label}</p>
              {action.count > 0 && <p className={`text-sm text-${action.color}-600 mt-1`}>{action.count} items</p>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── USERS ───────────────────────────────────────────
  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button onClick={exportUsersCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={userStats.totalUsers} icon={<Users size={20} />} color="blue" />
        <StatCard label="Customers" value={userStats.totalCustomers} icon={<Users size={20} />} color="indigo" />
        <StatCard label="Brand Owners" value={userStats.totalBrandOwners} icon={<Building2 size={20} />} color="purple" />
        <StatCard label="Founders" value={userStats.totalFounders} icon={<Shield size={20} />} color="amber" />
        <StatCard label="KYC Verified" value={userStats.kycVerified} icon={<Shield size={20} />} color="green" />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg w-full lg:w-96">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search by Name, ID, Email..." className="bg-transparent border-none outline-none text-sm w-full"
            value={userSearch} onChange={(e) => setUserSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
            <option value="all">All Users</option>
            <option value="customer">Customers</option>
            <option value="brand_owner">Brand Owners</option>
            <option value="founder">Founders</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => setUserSort(p => ({ key: 'userId', dir: p.key === 'userId' && p.dir === 'asc' ? 'desc' : 'asc' }))}>
                  <span className="flex items-center gap-1">User ID <ArrowUpDown size={14} /></span></th>
                <th className="p-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => setUserSort(p => ({ key: 'name', dir: p.key === 'name' && p.dir === 'asc' ? 'desc' : 'asc' }))}>
                  <span className="flex items-center gap-1">Name <ArrowUpDown size={14} /></span></th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">KYC / Bank</th>
                <th className="p-4 font-semibold text-right cursor-pointer hover:bg-gray-100" onClick={() => setUserSort(p => ({ key: 'createdAt', dir: p.key === 'createdAt' && p.dir === 'asc' ? 'desc' : 'asc' }))}>
                  <span className="flex items-center gap-1 justify-end">Joined <ArrowUpDown size={14} /></span></th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500"><RefreshCw size={20} className="animate-spin inline mr-2" />Loading...</td></tr>
              ) : sortedUsers.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No users found.</td></tr>
              ) : sortedUsers.map((u) => (
                <tr key={u.userId} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{u.userId}</td>
                  <td className="p-4"><div className="font-medium text-gray-900">{u.name}</div><div className="text-xs text-gray-500">{u.email}</div></td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.userType === 'customer' ? 'bg-blue-100 text-blue-800' : u.userType === 'brand_owner' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'}`}>
                      {u.userType === 'brand_owner' ? 'Brand Owner' : u.userType === 'founder' ? 'Founder' : 'Customer'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-1 text-xs mb-1"><Phone size={12} className="text-gray-400" /> {u.mobile || 'N/A'}</div>
                    <div className="flex items-center gap-1 text-xs"><Mail size={12} className="text-gray-400" /> {u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium ${u.kycData?.verified ? 'text-green-600' : 'text-red-500'}`}>KYC: {u.kycData?.verified ? '✓' : '✗'}</span><br />
                    <span className={`text-xs font-medium ${u.bankDetails ? 'text-green-600' : 'text-red-500'}`}>Bank: {u.bankDetails ? '✓' : '✗'}</span>
                  </td>
                  <td className="p-4 text-right text-xs text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => openUserDetail(u)} className="p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:text-blue-600 transition text-gray-600"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t flex justify-between items-center text-xs text-gray-500">
          <span>Showing {users.length} of {userPagination.total} (Page {userPagination.page}/{userPagination.pages || 1})</span>
          <div className="flex gap-2">
            <button onClick={() => fetchUsers(userPagination.page - 1)} disabled={userPagination.page <= 1} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1"><ChevronLeft size={14} /> Prev</button>
            <button onClick={() => fetchUsers(userPagination.page + 1)} disabled={userPagination.page >= userPagination.pages} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1">Next <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── CHANGE REQUESTS ────────────────────────────────
  const renderChangeRequests = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Approval Requests</h2>
      <p className="text-gray-500">Review product and coupon changes submitted by brand owners.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Pending" value={crStats.pending} icon={<Clock size={20} />} color="amber" />
        <StatCard label="Approved" value={crStats.approved} icon={<Check size={20} />} color="green" />
        <StatCard label="Rejected" value={crStats.rejected} icon={<XCircle size={20} />} color="red" />
        <StatCard label="Product Requests" value={crStats.productRequests} icon={<Package size={20} />} color="blue" />
        <StatCard label="Coupon Requests" value={crStats.couponRequests} icon={<Tag size={20} />} color="purple" />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg w-full lg:w-80">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search requests..." className="bg-transparent border-none outline-none text-sm w-full"
            value={crSearch} onChange={(e) => setCrSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchChangeRequests()} />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none" value={crFilter} onChange={(e) => setCrFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none" value={crEntityFilter} onChange={(e) => setCrEntityFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="product">Products</option>
            <option value="coupon">Coupons</option>
          </select>
          <button onClick={() => { fetchChangeRequests(); fetchCRStats(); }} className="p-2 border rounded-lg hover:bg-gray-50">
            <RefreshCw size={18} className={crLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {crLoading ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm border"><RefreshCw size={20} className="animate-spin inline mr-2" />Loading...</div>
        ) : changeRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm border">No requests found.</div>
        ) : changeRequests.map((cr) => (
          <div key={cr._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${cr.entityType === 'product' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{cr.entityType}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${cr.actionType === 'create' ? 'bg-green-100 text-green-800' : cr.actionType === 'update' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{cr.actionType}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${cr.status === 'pending' ? 'bg-amber-100 text-amber-800' : cr.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{cr.status}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{cr.summary}</h3>
                <p className="text-sm text-gray-500">By <span className="font-medium">{cr.ownerName || cr.ownerId}</span> • {cr.createdAt ? new Date(cr.createdAt).toLocaleString() : 'N/A'}</p>
                {cr.status === 'rejected' && cr.rejectionReason && <p className="text-sm text-red-600 mt-1">Rejection: {cr.rejectionReason}</p>}
                {cr.status !== 'pending' && cr.reviewedBy && <p className="text-xs text-gray-400 mt-1">Reviewed by {cr.reviewedBy}{cr.reviewedAt ? ` on ${new Date(cr.reviewedAt).toLocaleString()}` : ''}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => { setSelectedCR(cr); setRejectReason(''); }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1"><Eye size={16} /> View</button>
                {cr.status === 'pending' && (
                  <>
                    <button onClick={() => handleApproveCR(cr._id)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-1"><Check size={16} /> Approve</button>
                    <button onClick={() => { setSelectedCR(cr); setRejectReason(''); }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center gap-1"><XCircle size={16} /> Reject</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── COUPONS ─────────────────────────────────────────
  const renderCoupons = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Coupon Management</h2>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg w-full lg:w-80">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search coupons..." className="bg-transparent border-none outline-none text-sm w-full"
            value={couponSearch} onChange={(e) => setCouponSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchCoupons()} />
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none" value={couponFilter} onChange={(e) => setCouponFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={fetchCoupons} className="p-2 border rounded-lg hover:bg-gray-50"><RefreshCw size={18} className={couponLoading ? 'animate-spin' : ''} /></button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-4 font-semibold">Code</th>
                <th className="p-4 font-semibold">Discount</th>
                <th className="p-4 font-semibold">Brand Owner</th>
                <th className="p-4 font-semibold">Min Order</th>
                <th className="p-4 font-semibold">Usage</th>
                <th className="p-4 font-semibold">Approval</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {couponLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500"><RefreshCw size={20} className="animate-spin inline mr-2" />Loading...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No coupons found.</td></tr>
              ) : coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-mono font-bold text-gray-900">{c.code}</td>
                  <td className="p-4">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.maxDiscountAmount || c.discountValue}`}</td>
                  <td className="p-4 text-gray-600">{c.brandName || c.ownerId}</td>
                  <td className="p-4">₹{c.minPurchaseAmount || 0}</td>
                  <td className="p-4">{c.usageCount || 0}/{c.usageLimit || '∞'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : c.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{c.approvalStatus}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {c.approvalStatus === 'pending' && (
                        <>
                          <button onClick={() => handleApproveCoupon(c._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><Check size={16} /></button>
                          <button onClick={() => handleRejectCoupon(c._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject"><XCircle size={16} /></button>
                        </>
                      )}
                      <button onClick={() => handleDeleteCoupon(c._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── INVOICES ────────────────────────────────────────
  const renderInvoices = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Invoice Management</h2>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg w-full lg:w-80">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search invoices..." className="bg-transparent border-none outline-none text-sm w-full"
            value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchInvoices()} />
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none" value={invoiceFilter} onChange={(e) => setInvoiceFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
          <button onClick={fetchInvoices} className="p-2 border rounded-lg hover:bg-gray-50"><RefreshCw size={18} className={invoiceLoading ? 'animate-spin' : ''} /></button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-4 font-semibold">Invoice #</th>
                <th className="p-4 font-semibold">Brand</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold">Payment</th>
                <th className="p-4 font-semibold">Source</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoiceLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500"><RefreshCw size={20} className="animate-spin inline mr-2" />Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No invoices found.</td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-mono font-medium text-gray-900">{inv.invoiceNumber}</td>
                  <td className="p-4 text-gray-600">{inv.brandName || inv.ownerId}</td>
                  <td className="p-4 text-gray-600">{inv.customerName || 'N/A'}</td>
                  <td className="p-4 text-xs text-gray-500">{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-4 text-right font-semibold">₹{(inv.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inv.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : inv.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>{inv.paymentStatus}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inv.source === 'order' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}>{inv.source === 'order' ? 'Order' : 'Manual'}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setSelectedInvoice(inv)} className="p-1.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded" title="View"><Eye size={16} /></button>
                      <button onClick={() => handleDeleteInvoice(inv._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════
     MAIN RENDER
     ════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white flex flex-col transition-all duration-300 min-h-screen sticky top-0`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-lg font-bold truncate">Admin Panel</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-700 rounded"><MenuIcon size={20} /></button>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
          </div>
        )}

        <nav className="flex-1 py-4 space-y-1 px-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              {tab.icon}
              {sidebarOpen && <span className="flex-1 text-left">{tab.label}</span>}
              {sidebarOpen && tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-gray-700">
          <button onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-[1400px] mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'changeRequests' && renderChangeRequests()}
          {activeTab === 'coupons' && renderCoupons()}
          {activeTab === 'invoices' && renderInvoices()}
        </div>
      </main>

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {selectedUser.name}
                  <span className={`text-xs px-2 py-0.5 rounded ${selectedUser.userType === 'customer' ? 'bg-blue-100 text-blue-800' : selectedUser.userType === 'brand_owner' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'}`}>
                    {selectedUser.userType === 'brand_owner' ? 'Brand Owner' : selectedUser.userType === 'founder' ? 'Founder' : 'Customer'}
                  </span>
                </h2>
                <p className="text-sm text-gray-500">ID: {selectedUser.userId}</p>
              </div>
              <button onClick={() => { setSelectedUser(null); setUserDetail(null); }} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="flex justify-center py-12"><RefreshCw size={32} className="animate-spin text-gray-400" /></div>
              ) : (
                <>
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DetailField label="Email" value={selectedUser.email} icon={<Mail size={14} className="text-gray-400" />} />
                    <DetailField label="Phone" value={selectedUser.mobile} icon={<Phone size={14} className="text-gray-400" />} />
                    <DetailField label="Joined" value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'} icon={<Calendar size={14} className="text-gray-400" />} />
                    <DetailField label="Address" value={selectedUser.kycData?.address} icon={<MapPin size={14} className="text-gray-400" />} />
                    {selectedUser.userType === 'brand_owner' && (
                      <>
                        <DetailField label="Brand" value={selectedUser.brandName} icon={<Building2 size={14} className="text-gray-400" />} />
                        <DetailField label="GST" value={selectedUser.gstNo} />
                      </>
                    )}
                  </section>
                  <section className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                    <DetailField label="KYC Status">
                      {selectedUser.kycData?.verified ? <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Verified</span> : <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Pending</span>}
                    </DetailField>
                    <DetailField label="PAN" value={selectedUser.kycData?.pan} />
                    <DetailField label="Aadhaar" value={selectedUser.kycData?.aadhaar} />
                    <DetailField label="Bank">{selectedUser.bankDetails ? <span className="text-green-600 text-xs">{selectedUser.bankDetails.bankName} - {selectedUser.bankDetails.accountNumber}</span> : <span className="text-red-500 text-xs">Not added</span>}</DetailField>
                  </section>
                  {userDetail && (
                    <section className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center"><p className="text-xs text-blue-600 mb-1">Orders</p><p className="text-2xl font-bold text-blue-800">{userDetail.orderCount || 0}</p></div>
                      <div className="bg-green-50 p-4 rounded-lg text-center"><p className="text-xs text-green-600 mb-1">Total Spent</p><p className="text-2xl font-bold text-green-800">₹{(userDetail.totalSpent || 0).toLocaleString('en-IN')}</p></div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center"><p className="text-xs text-purple-600 mb-1">Type</p><p className="text-lg font-bold text-purple-800">{selectedUser.userType === 'brand_owner' ? 'Brand Owner' : selectedUser.userType === 'founder' ? 'Founder' : 'Customer'}</p></div>
                    </section>
                  )}
                </>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button onClick={() => { setSelectedUser(null); setUserDetail(null); }} className="px-6 py-2 bg-white border rounded-lg hover:bg-gray-100 font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Request Detail Modal */}
      {selectedCR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <div><h2 className="text-xl font-bold text-gray-800">Change Request Details</h2><p className="text-sm text-gray-500">{selectedCR.summary}</p></div>
              <button onClick={() => setSelectedCR(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-xs text-gray-500">Type</span><p className="font-medium capitalize">{selectedCR.entityType}</p></div>
                <div><span className="text-xs text-gray-500">Action</span><p className="font-medium capitalize">{selectedCR.actionType}</p></div>
                <div><span className="text-xs text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedCR.status === 'pending' ? 'bg-amber-100 text-amber-800' : selectedCR.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{selectedCR.status}</span>
                </div>
                <div><span className="text-xs text-gray-500">By</span><p className="font-medium">{selectedCR.ownerName} ({selectedCR.ownerId})</p></div>
                <div><span className="text-xs text-gray-500">Submitted</span><p className="text-sm">{selectedCR.createdAt ? new Date(selectedCR.createdAt).toLocaleString() : 'N/A'}</p></div>
                {selectedCR.entityId && <div><span className="text-xs text-gray-500">Entity ID</span><p className="text-xs font-mono">{selectedCR.entityId}</p></div>}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Payload Data</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(selectedCR.payload, null, 2)}</pre>
                </div>
              </div>

              {selectedCR.previousData && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Previous Data</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg max-h-40 overflow-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(selectedCR.previousData, null, 2)}</pre>
                  </div>
                </div>
              )}

              {selectedCR.status === 'rejected' && selectedCR.rejectionReason && (
                <div className="bg-red-50 p-3 rounded-lg"><p className="text-sm text-red-700"><strong>Rejection Reason:</strong> {selectedCR.rejectionReason}</p></div>
              )}

              {selectedCR.status === 'pending' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Rejection Reason (required to reject)</label>
                  <textarea className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-300" rows={3} placeholder="Enter reason..."
                    value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-between">
              <button onClick={() => setSelectedCR(null)} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 font-medium text-sm">Close</button>
              {selectedCR.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleRejectCR(selectedCR._id)} disabled={crActionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50 flex items-center gap-1"><XCircle size={16} /> Reject</button>
                  <button onClick={() => handleApproveCR(selectedCR._id)} disabled={crActionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50 flex items-center gap-1"><Check size={16} /> Approve</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Invoice {selectedInvoice.invoiceNumber}</h2>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Brand" value={selectedInvoice.brandName || selectedInvoice.ownerId} />
                <DetailField label="Customer" value={selectedInvoice.customerName} />
                <DetailField label="Date" value={selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString() : 'N/A'} />
                <DetailField label="Due Date" value={selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'} />
                <DetailField label="Amount">₹{(selectedInvoice.totalAmount || 0).toLocaleString('en-IN')}</DetailField>
                <DetailField label="Payment Status">{selectedInvoice.paymentStatus}</DetailField>
                <DetailField label="Payment Method" value={selectedInvoice.paymentMethod} />
                <DetailField label="Source">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedInvoice.source === 'order' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}>{selectedInvoice.source === 'order' ? 'Auto (Order)' : 'Manual'}</span>
                </DetailField>
                {selectedInvoice.orderId && <DetailField label="Order ID" value={selectedInvoice.orderId} />}
              </div>
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Items</h3>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50"><th className="p-2 text-left">Product</th><th className="p-2 text-right">Price</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Total</th></tr></thead>
                    <tbody>
                      {selectedInvoice.items.map((item, i) => (
                        <tr key={i} className="border-t"><td className="p-2">{item.productName}</td><td className="p-2 text-right">₹{item.price}</td><td className="p-2 text-right">{item.quantity}</td><td className="p-2 text-right font-medium">₹{item.amount}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {selectedInvoice.adminNotes && <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-sm"><strong>Admin Notes:</strong> {selectedInvoice.adminNotes}</p></div>}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setSelectedInvoice(null)} className="px-6 py-2 bg-white border rounded-lg hover:bg-gray-100 font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
            <LogOut size={40} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Logout</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to log out of the admin panel?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
              <button onClick={() => { setShowLogoutConfirm(false); onLogout(); }} className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
