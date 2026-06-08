const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ChangeRequest = require('../models/ChangeRequest');

// ═══════════════════════════════════════════════════════════════════
//  USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (type && type !== 'all') {
      filter.userType = type;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { userId: regex },
        { mobile: regex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Admin getAllUsers error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/users/:userId
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId })
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Gather additional stats
    const orderCount = await Order.countDocuments({ userId: user.userId });
    const totalSpent = await Order.aggregate([
      { $match: { userId: user.userId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      success: true,
      data: {
        ...user,
        orderCount,
        totalSpent: totalSpent[0]?.total || 0,
      },
    });
  } catch (err) {
    console.error('Admin getUserById error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/users/stats
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ userType: 'customer' });
    const totalBrandOwners = await User.countDocuments({ userType: 'brand_owner' });
    const totalFounders = await User.countDocuments({ userType: 'founder' });
    const kycVerified = await User.countDocuments({ 'kycData.verified': true });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalBrandOwners,
        totalFounders,
        kycVerified,
      },
    });
  } catch (err) {
    console.error('Admin getUserStats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  COUPON MANAGEMENT (Admin – across all brand owners)
// ═══════════════════════════════════════════════════════════════════

// GET /api/admin/coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const { approvalStatus, status, search } = req.query;
    const filter = {};

    if (approvalStatus && approvalStatus !== 'all') {
      filter.approvalStatus = approvalStatus;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ code: regex }];
    }

    const coupons = await Coupon.find(filter).sort({ createdAt: -1 }).lean();

    // Populate brand owner name for each coupon
    const ownerIds = [...new Set(coupons.map((c) => c.ownerId))];
    const owners = await User.find({ userId: { $in: ownerIds } })
      .select('userId name')
      .lean();
    const ownerMap = {};
    owners.forEach((o) => (ownerMap[o.userId] = o.name));

    const enriched = coupons.map((c) => ({
      ...c,
      brandName: ownerMap[c.ownerId] || `Brand ${c.ownerId}`,
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Admin getAllCoupons error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/admin/coupons/:id/approve
exports.approveCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found.' });
    }

    coupon.approvalStatus = 'approved';
    coupon.approvedBy = req.user.name || 'Admin';
    coupon.approvedDate = new Date();
    await coupon.save();

    res.json({ success: true, data: coupon });
  } catch (err) {
    console.error('Admin approveCoupon error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/admin/coupons/:id/reject
exports.rejectCoupon = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Rejection reason is required.' });
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found.' });
    }

    coupon.approvalStatus = 'rejected';
    coupon.rejectedBy = req.user.name || 'Admin';
    coupon.rejectedDate = new Date();
    coupon.rejectionReason = reason;
    await coupon.save();

    res.json({ success: true, data: coupon });
  } catch (err) {
    console.error('Admin rejectCoupon error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/admin/coupons/:id
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found.' });
    }
    res.json({ success: true, data: coupon });
  } catch (err) {
    console.error('Admin updateCoupon error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/admin/coupons/:id/toggle-status
exports.toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found.' });
    }

    coupon.status = coupon.status === 'active' ? 'inactive' : 'active';
    await coupon.save();

    res.json({ success: true, data: coupon });
  } catch (err) {
    console.error('Admin toggleCouponStatus error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/admin/coupons/:id
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found.' });
    }
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    console.error('Admin deleteCoupon error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/coupons/analytics
exports.getCouponAnalytics = async (req, res) => {
  try {
    const allCoupons = await Coupon.find().lean();

    const totalRedemptions = allCoupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
    const totalDiscountGiven = allCoupons.reduce((sum, c) => {
      const avg =
        c.discountType === 'percentage'
          ? parseFloat(c.maxDiscountAmount || 100)
          : parseFloat(c.maxDiscountAmount || 0);
      return sum + avg * (c.usageCount || 0);
    }, 0);
    const totalRevenueImpact = totalDiscountGiven * 3;

    const topCoupons = allCoupons
      .filter((c) => c.approvalStatus === 'approved')
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5)
      .map((c) => ({
        code: c.code,
        redemptions: c.usageCount || 0,
        discount:
          c.discountType === 'percentage'
            ? `${c.discountPercentage}%`
            : `₹${c.maxDiscountAmount}`,
      }));

    const pending = allCoupons.filter((c) => c.approvalStatus === 'pending').length;
    const approved = allCoupons.filter((c) => c.approvalStatus === 'approved').length;
    const rejected = allCoupons.filter((c) => c.approvalStatus === 'rejected').length;
    const active = allCoupons.filter((c) => c.status === 'active').length;
    const inactive = allCoupons.filter((c) => c.status === 'inactive').length;
    const expired = allCoupons.filter(
      (c) => c.expiryDate && new Date(c.expiryDate) < new Date()
    ).length;

    res.json({
      success: true,
      data: {
        totalRedemptions,
        totalDiscountGiven,
        totalRevenueImpact,
        topCoupons,
        statusCounts: { pending, approved, rejected },
        activeCounts: { active, inactive, expired },
        totalCoupons: allCoupons.length,
      },
    });
  } catch (err) {
    console.error('Admin getCouponAnalytics error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  INVOICE MANAGEMENT (Admin – across all brand owners)
// ═══════════════════════════════════════════════════════════════════

// GET /api/admin/invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const { paymentStatus, search, dateFrom, dateTo } = req.query;
    const filter = {};

    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { invoiceNumber: regex },
        { 'customerInfo.name': regex },
      ];
    }
    if (dateFrom || dateTo) {
      filter.invoiceDate = {};
      if (dateFrom) filter.invoiceDate.$gte = new Date(dateFrom);
      if (dateTo) filter.invoiceDate.$lte = new Date(dateTo);
    }

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 }).lean();

    // Populate brand owner name
    const ownerIds = [...new Set(invoices.map((i) => i.ownerId))];
    const owners = await User.find({ userId: { $in: ownerIds } })
      .select('userId name')
      .lean();
    const ownerMap = {};
    owners.forEach((o) => (ownerMap[o.userId] = o.name));

    const enriched = invoices.map((inv) => ({
      ...inv,
      brandName: ownerMap[inv.ownerId] || `Brand ${inv.ownerId}`,
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Admin getAllInvoices error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/admin/invoices/:id
exports.updateInvoice = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, adminNotes } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }

    if (paymentStatus) invoice.paymentStatus = paymentStatus;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (adminNotes !== undefined) invoice.adminNotes = adminNotes;
    invoice.updatedBy = req.user.name || 'Admin';
    await invoice.save();

    res.json({ success: true, data: invoice });
  } catch (err) {
    console.error('Admin updateInvoice error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/admin/invoices/:id
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }
    res.json({ success: true, message: 'Invoice deleted.' });
  } catch (err) {
    console.error('Admin deleteInvoice error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/invoices/analytics
exports.getInvoiceAnalytics = async (req, res) => {
  try {
    const allInvoices = await Invoice.find().lean();

    const totalInvoices = allInvoices.length;
    const totalRevenue = allInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount || 0),
      0
    );
    const paidAmount = allInvoices
      .filter((inv) => inv.paymentStatus === 'Paid')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const pendingAmount = allInvoices
      .filter((inv) => inv.paymentStatus === 'Pending')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const overdueInvoices = allInvoices.filter(
      (inv) => inv.paymentStatus !== 'Paid' && new Date(inv.dueDate) < new Date()
    ).length;

    // Top brands by revenue
    const brandRevenue = {};
    allInvoices.forEach((inv) => {
      const key = inv.ownerId || 'Unknown';
      if (!brandRevenue[key]) brandRevenue[key] = { ownerId: key, revenue: 0, invoiceCount: 0 };
      brandRevenue[key].revenue += inv.totalAmount || 0;
      brandRevenue[key].invoiceCount += 1;
    });

    const ownerIds = Object.keys(brandRevenue);
    const owners = await User.find({ userId: { $in: ownerIds } })
      .select('userId name')
      .lean();
    const ownerMap = {};
    owners.forEach((o) => (ownerMap[o.userId] = o.name));

    const topBrands = Object.values(brandRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((b) => ({
        brandName: ownerMap[b.ownerId] || `Brand ${b.ownerId}`,
        revenue: b.revenue,
        invoiceCount: b.invoiceCount,
      }));

    const paidCount = allInvoices.filter((i) => i.paymentStatus === 'Paid').length;
    const pendingCount = allInvoices.filter((i) => i.paymentStatus === 'Pending').length;
    const partialCount = allInvoices.filter((i) => i.paymentStatus === 'Partially Paid').length;

    res.json({
      success: true,
      data: {
        totalInvoices,
        totalRevenue,
        paidAmount,
        pendingAmount,
        overdueInvoices,
        topBrands,
        statusCounts: { paid: paidCount, pending: pendingCount, partial: partialCount },
      },
    });
  } catch (err) {
    console.error('Admin getInvoiceAnalytics error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  CHANGE REQUEST MANAGEMENT (Product & Coupon approval workflow)
// ═══════════════════════════════════════════════════════════════════

// GET /api/admin/change-requests
exports.getChangeRequests = async (req, res) => {
  try {
    const { status, entityType, search } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (entityType && entityType !== 'all') filter.entityType = entityType;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ summary: regex }, { ownerName: regex }];
    }

    const requests = await ChangeRequest.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: requests });
  } catch (err) {
    console.error('Admin getChangeRequests error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/change-requests/:id
exports.getChangeRequestById = async (req, res) => {
  try {
    const cr = await ChangeRequest.findById(req.params.id).lean();
    if (!cr) return res.status(404).json({ success: false, error: 'Request not found.' });
    res.json({ success: true, data: cr });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/admin/change-requests/:id/approve
exports.approveChangeRequest = async (req, res) => {
  try {
    const cr = await ChangeRequest.findById(req.params.id);
    if (!cr) return res.status(404).json({ success: false, error: 'Request not found.' });
    if (cr.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Request already processed.' });
    }

    // Apply the change
    if (cr.entityType === 'product') {
      if (cr.actionType === 'create') {
        const product = new Product(cr.payload);
        await product.save();
      } else if (cr.actionType === 'update') {
        await Product.findByIdAndUpdate(cr.entityId, cr.payload, { new: true });
      } else if (cr.actionType === 'delete') {
        await Product.findByIdAndUpdate(cr.entityId, { isActive: false });
      }
    } else if (cr.entityType === 'coupon') {
      if (cr.actionType === 'create') {
        const coupon = new Coupon(cr.payload);
        await coupon.save();
      } else if (cr.actionType === 'update') {
        const coupon = await Coupon.findById(cr.entityId);
        if (coupon) {
          Object.keys(cr.payload).forEach((key) => {
            if (key === 'code') {
              coupon[key] = cr.payload[key].toUpperCase();
            } else {
              coupon[key] = cr.payload[key];
            }
          });
          await coupon.save();
        }
      } else if (cr.actionType === 'delete') {
        await Coupon.findByIdAndDelete(cr.entityId);
      }
    }

    cr.status = 'approved';
    cr.reviewedBy = req.user?.name || 'Admin';
    cr.reviewedAt = new Date();
    await cr.save();

    res.json({ success: true, message: 'Change request approved and applied.', data: cr });
  } catch (err) {
    console.error('Admin approveChangeRequest error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/admin/change-requests/:id/reject
exports.rejectChangeRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const cr = await ChangeRequest.findById(req.params.id);
    if (!cr) return res.status(404).json({ success: false, error: 'Request not found.' });
    if (cr.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Request already processed.' });
    }

    cr.status = 'rejected';
    cr.reviewedBy = req.user?.name || 'Admin';
    cr.reviewedAt = new Date();
    cr.rejectionReason = reason || '';
    await cr.save();

    res.json({ success: true, message: 'Change request rejected.', data: cr });
  } catch (err) {
    console.error('Admin rejectChangeRequest error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/change-requests/stats
exports.getChangeRequestStats = async (req, res) => {
  try {
    const pending = await ChangeRequest.countDocuments({ status: 'pending' });
    const approved = await ChangeRequest.countDocuments({ status: 'approved' });
    const rejected = await ChangeRequest.countDocuments({ status: 'rejected' });
    const productRequests = await ChangeRequest.countDocuments({ entityType: 'product', status: 'pending' });
    const couponRequests = await ChangeRequest.countDocuments({ entityType: 'coupon', status: 'pending' });

    res.json({
      success: true,
      data: { pending, approved, rejected, productRequests, couponRequests },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  ORDER MANAGEMENT (Admin – across all orders)
// ═══════════════════════════════════════════════════════════════════

// GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status, search, dateFrom, dateTo } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.deliveryStatus = status;
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { orderId: regex },
        { 'customerInfo.name': regex },
        { 'customerInfo.email': regex },
        { 'customerInfo.phone': regex },
      ];
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    // Enrich with customer and brand names
    const userIds = [...new Set(orders.map((o) => o.userId))];
    const users = await User.find({ userId: { $in: userIds } })
      .select('userId name email')
      .lean();
    const userMap = {};
    users.forEach((u) => (userMap[u.userId] = u));

    const enriched = orders.map((order) => {
      const user = userMap[order.userId] || {};
      // Get brand name from first item's brandId
      const brandId = order.items?.[0]?.brandId || order.brandId;
      return {
        _id: order._id,
        orderId: order.orderId,
        customerId: order.userId,
        customerName: user.name || order.customerInfo?.name || 'N/A',
        customerEmail: user.email || order.customerInfo?.email || 'N/A',
        customerPhone: order.customerInfo?.phone || 'N/A',
        brandName: brandId || 'N/A',
        brandId: brandId,
        items: order.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode || item.productId,
          category: item.category || 'N/A',
          subCategory: item.subCategory || 'N/A',
          skuCode: item.skuCode || 'N/A',
          sellingPrice: item.sellingPrice || 0,
          mrpPrice: item.mrpPrice || item.sellingPrice || 0,
          quantity: item.quantity || 1,
          size: item.size,
          colour: item.colour,
        })),
        sellingPriceTotal: order.sellingPriceTotal || order.totalAmount || 0,
        mrpTotal: order.mrpTotal || order.totalAmount || 0,
        deliveryCharge: order.deliveryCharge || 0,
        grandTotal: order.grandTotal || order.totalAmount || 0,
        deliveryAddress: order.deliveryAddress || { name: '', phone: '', address: '', city: '', state: '', pincode: '' },
        paymentMethod: order.paymentMethod || 'N/A',
        paymentStatus: order.paymentStatus || 'Pending',
        orderDate: order.orderDate || order.createdAt,
        expectedDeliveryDate: order.expectedDeliveryDate,
        deliveryStatus: order.deliveryStatus || 'Order Placed',
        createdAt: order.createdAt,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Admin getAllOrders error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/orders/:orderId
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).lean();
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    console.error('Admin getOrderById error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/admin/orders/:orderId/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { deliveryStatus: status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    console.error('Admin updateOrderStatus error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/orders/stats
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pending = await Order.countDocuments({ deliveryStatus: 'Order Placed' });
    const outForDelivery = await Order.countDocuments({ deliveryStatus: 'Out for Delivery' });
    const delivered = await Order.countDocuments({ deliveryStatus: 'Product Delivered' });

    const revenueData = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    res.json({
      success: true,
      data: { totalOrders, totalRevenue, pending, outForDelivery, delivered },
    });
  } catch (err) {
    console.error('Admin getOrderStats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
