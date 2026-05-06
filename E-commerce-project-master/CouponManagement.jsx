import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Copy, Check, AlertCircle, Tag, Calendar, Users, ShoppingCart, Percent, DollarSign, Filter, Search } from 'lucide-react';

function CouponManagement({ user }) {
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [couponForm, setCouponForm] = useState({
    couponCode: '',
    expiryDate: '',
    usagePerCustomer: '1',
    description: '',
    discountType: 'percentage',
    discountPercentage: '',
    maxDiscountAmount: '',
    appliesTo: 'entire',
    specificProducts: [],
    specificCategories: [],
    minOrderAmount: '',
    customerEligibility: '',
    usageLimit: '',
    status: 'active'
  });

  // Load coupons from localStorage on component mount
  useEffect(() => {
    const savedCoupons = JSON.parse(localStorage.getItem(`coupons_${user.userId}`) || '[]');
    setCoupons(savedCoupons);
  }, [user.userId]);

  // Save coupons to localStorage whenever they change
  useEffect(() => {
    if (coupons.length > 0 || coupons.length === 0) {
      localStorage.setItem(`coupons_${user.userId}`, JSON.stringify(coupons));
    }
  }, [coupons, user.userId]);

  const resetForm = () => {
    setCouponForm({
      couponCode: '',
      expiryDate: '',
      usagePerCustomer: '1',
      description: '',
      discountType: 'percentage',
      discountPercentage: '',
      maxDiscountAmount: '',
      appliesTo: 'entire',
      specificProducts: [],
      specificCategories: [],
      minOrderAmount: '',
      customerEligibility: '',
      usageLimit: '',
      status: 'active'
    });
    setEditingCoupon(null);
  };

  const handleSubmitCoupon = (e, isDraft = false) => {
    e.preventDefault();
    
    // Validation
    if (!couponForm.couponCode || couponForm.couponCode.length > 16) {
      alert('Coupon code is required and must be max 16 characters');
      return;
    }
    
    if (!couponForm.description) {
      alert('Description is required');
      return;
    }
    
    if (couponForm.discountType === 'percentage' && !couponForm.discountPercentage) {
      alert('Discount percentage is required');
      return;
    }
    
    if (couponForm.discountType === 'flat' && !couponForm.maxDiscountAmount) {
      alert('Max discount amount is required');
      return;
    }
    
    if (!couponForm.minOrderAmount) {
      alert('Minimum order amount is required');
      return;
    }

    const newCoupon = {
      ...couponForm,
      id: editingCoupon ? editingCoupon.id : Date.now().toString(),
      createdDate: editingCoupon ? editingCoupon.createdDate : new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      status: isDraft ? 'draft' : couponForm.status,
      approvalStatus: isDraft ? 'draft' : (editingCoupon?.approvalStatus || 'pending'),
      usedCount: editingCoupon?.usedCount || 0,
      brandId: user.userId
    };

    if (editingCoupon) {
      setCoupons(coupons.map(c => c.id === editingCoupon.id ? newCoupon : c));
      alert('Coupon updated successfully!');
    } else {
      setCoupons([...coupons, newCoupon]);
      alert(isDraft ? 'Coupon saved as draft!' : 'Coupon submitted for approval!');
    }
    
    setShowCouponModal(false);
    resetForm();
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      couponCode: coupon.couponCode,
      expiryDate: coupon.expiryDate,
      usagePerCustomer: coupon.usagePerCustomer,
      description: coupon.description,
      discountType: coupon.discountType,
      discountPercentage: coupon.discountPercentage,
      maxDiscountAmount: coupon.maxDiscountAmount,
      appliesTo: coupon.appliesTo,
      specificProducts: coupon.specificProducts || [],
      specificCategories: coupon.specificCategories || [],
      minOrderAmount: coupon.minOrderAmount,
      customerEligibility: coupon.customerEligibility,
      usageLimit: coupon.usageLimit,
      status: coupon.status
    });
    setShowCouponModal(true);
  };

  const handleDeleteCoupon = (coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteCoupon = () => {
    setCoupons(coupons.filter(c => c.id !== couponToDelete.id));
    setShowDeleteConfirmation(false);
    setCouponToDelete(null);
    alert('Coupon deleted successfully!');
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesStatus = filterStatus === 'all' || coupon.status === filterStatus;
    const matchesSearch = coupon.couponCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          coupon.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowCouponModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" />
          Create Coupon
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by code or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      {filteredCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map(coupon => (
            <div key={coupon.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <Tag size={20} />
                    <h3 className="text-lg font-bold">{coupon.couponCode}</h3>
                  </div>
                  <button
                    onClick={() => handleCopyCode(coupon.couponCode)}
                    className="p-1 rounded hover:bg-blue-400 transition-colors"
                  >
                    {copiedCode === coupon.couponCode ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-sm text-blue-100">{coupon.description}</p>
              </div>
              
              <div className="p-4">
                {/* Discount Info */}
                <div className="mb-3 p-2 bg-green-50 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-700">
                      {coupon.discountType === 'percentage' ? (
                        <>
                          <Percent size={16} className="mr-1" />
                          <span className="font-semibold">{coupon.discountPercentage}% OFF</span>
                        </>
                      ) : (
                        <>
                          <DollarSign size={16} className="mr-1" />
                          <span className="font-semibold">₹{coupon.maxDiscountAmount} OFF</span>
                        </>
                      )}
                    </div>
                    {coupon.maxDiscountAmount && coupon.discountType === 'percentage' && (
                      <span className="text-xs text-green-600">Max: ₹{coupon.maxDiscountAmount}</span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <ShoppingCart size={14} className="mr-2" />
                    <span>Min Order: ₹{coupon.minOrderAmount}</span>
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

                  {coupon.usageLimit && (
                    <div className="text-gray-600">
                      <span>Total Limit: {coupon.usageLimit} uses</span>
                      <span className="ml-2 text-xs">({coupon.usedCount || 0} used)</span>
                    </div>
                  )}

                  {coupon.appliesTo !== 'entire' && (
                    <div className="text-gray-600 text-xs">
                      Applies to: {coupon.appliesTo === 'products' ? 'Specific Products' : 'Specific Category'}
                    </div>
                  )}

                  {coupon.customerEligibility && (
                    <div className="text-gray-600 text-xs">
                      Eligibility: {coupon.customerEligibility}
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon.status)}`}>
                    {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(coupon.approvalStatus)}`}>
                    {coupon.approvalStatus === 'draft' ? 'Draft' : 
                     coupon.approvalStatus === 'pending' ? 'Pending Approval' : 
                     coupon.approvalStatus === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                  {isExpired(coupon.expiryDate) && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Expired
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEditCoupon(coupon)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(coupon)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
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
          <button
            onClick={() => {
              resetForm();
              setShowCouponModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Your First Coupon
          </button>
        </div>
      )}

      {/* Create/Edit Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-6xl my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button
                onClick={() => {
                  setShowCouponModal(false);
                  resetForm();
                }}
                className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={couponForm.couponCode}
                  onChange={(e) => setCouponForm({...couponForm, couponCode: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DEAL50"
                  maxLength={16}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Max 16 characters, alphanumeric</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({...couponForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Get upto 20% off on orders above ₹1499. Max discount ₹1200."
                  required
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountType"
                      value="percentage"
                      checked={couponForm.discountType === 'percentage'}
                      onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-sm">Percentage</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountType"
                      value="flat"
                      checked={couponForm.discountType === 'flat'}
                      onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-sm">Flat Amount</span>
                  </label>
                </div>
              </div>

              {/* Discount Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {couponForm.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Percentage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={couponForm.discountPercentage}
                      onChange={(e) => setCouponForm({...couponForm, discountPercentage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="20"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                )}
                
                {couponForm.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Discount Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={couponForm.maxDiscountAmount}
                      onChange={(e) => setCouponForm({...couponForm, maxDiscountAmount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1200"
                      min="0"
                    />
                  </div>
                )}
                
                {couponForm.discountType === 'flat' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={couponForm.maxDiscountAmount}
                      onChange={(e) => setCouponForm({...couponForm, maxDiscountAmount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1200"
                      min="0"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Min Order Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={couponForm.minOrderAmount}
                  onChange={(e) => setCouponForm({...couponForm, minOrderAmount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1499"
                  min="0"
                  required
                />
              </div>

              {/* Applies To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applies To <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="appliesTo"
                      value="entire"
                      checked={couponForm.appliesTo === 'entire'}
                      onChange={(e) => setCouponForm({...couponForm, appliesTo: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-sm">Entire Order</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="appliesTo"
                      value="products"
                      checked={couponForm.appliesTo === 'products'}
                      onChange={(e) => setCouponForm({...couponForm, appliesTo: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-sm">Specific Products</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="appliesTo"
                      value="category"
                      checked={couponForm.appliesTo === 'category'}
                      onChange={(e) => setCouponForm({...couponForm, appliesTo: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-sm">Specific Category</span>
                  </label>
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage per Customer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={couponForm.usagePerCustomer}
                    onChange={(e) => setCouponForm({...couponForm, usagePerCustomer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({...couponForm, usageLimit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={couponForm.expiryDate}
                  onChange={(e) => setCouponForm({...couponForm, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
              </div>

              {/* Customer Eligibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Eligibility
                </label>
                <input
                  type="text"
                  value={couponForm.customerEligibility}
                  onChange={(e) => setCouponForm({...couponForm, customerEligibility: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="First-time customers only"
                />
                <p className="text-xs text-gray-500 mt-1">Optional - specify any eligibility conditions</p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={couponForm.status}
                  onChange={(e) => setCouponForm({...couponForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </form>

            <div className="sticky bottom-0 border-t px-6 py-4 flex justify-end space-x-3 rounded-b-lg p-6 border-b border-gray-200">
              <button
                onClick={() => {
                  setShowCouponModal(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleSubmitCoupon(e, true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save as Draft
              </button>
              <button
                onClick={(e) => handleSubmitCoupon(e, false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingCoupon ? 'Update Coupon' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="text-red-600 mr-3" size={24} />
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the coupon <span className="font-semibold">{couponToDelete?.couponCode}</span>? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCoupon}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CouponManagement;