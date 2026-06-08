const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const admin = require('../controllers/adminController');

// All admin routes require auth + admin role (admins are separate from tree users)
router.use(auth, requireRole('admin'));

// ─── Users ──────────────────────────────────────────────────────────
router.get('/users/stats', admin.getUserStats);
router.get('/users', admin.getAllUsers);
router.get('/users/:userId', admin.getUserById);

// ─── Coupons ────────────────────────────────────────────────────────
router.get('/coupons/analytics', admin.getCouponAnalytics);
router.get('/coupons', admin.getAllCoupons);
router.put('/coupons/:id/approve', admin.approveCoupon);
router.put('/coupons/:id/reject', admin.rejectCoupon);
router.put('/coupons/:id/toggle-status', admin.toggleCouponStatus);
router.put('/coupons/:id', admin.updateCoupon);
router.delete('/coupons/:id', admin.deleteCoupon);

// ─── Invoices ───────────────────────────────────────────────────────
router.get('/invoices/analytics', admin.getInvoiceAnalytics);
router.get('/invoices', admin.getAllInvoices);
router.put('/invoices/:id', admin.updateInvoice);
router.delete('/invoices/:id', admin.deleteInvoice);

// ─── Change Requests (Product & Coupon approval workflow) ───────────
router.get('/change-requests/stats', admin.getChangeRequestStats);
router.get('/change-requests', admin.getChangeRequests);
router.get('/change-requests/:id', admin.getChangeRequestById);
router.put('/change-requests/:id/approve', admin.approveChangeRequest);
router.put('/change-requests/:id/reject', admin.rejectChangeRequest);

// ─── Orders ─────────────────────────────────────────────────────────
router.get('/orders/stats', admin.getOrderStats);
router.get('/orders', admin.getAllOrders);
router.get('/orders/:orderId', admin.getOrderById);
router.put('/orders/:orderId/status', admin.updateOrderStatus);

module.exports = router;
