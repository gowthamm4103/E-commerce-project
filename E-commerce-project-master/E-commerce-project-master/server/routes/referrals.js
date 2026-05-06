const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const referralController = require('../controllers/referralController');

// ═══════════════════════════════════════════════════════════════════════
//  REFERRAL ROUTES
//  Note: Referral links use userId directly: /product/{productId}?ref={userId}
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/referrals/track
 * @desc    Track when a guest user clicks a referral link (userId as ref)
 * @access  Public (guest users)
 * @body    { referrerUserId: string, productId: string, guestSessionId?: string }
 */
router.post('/track', referralController.trackReferralClick);

/**
 * @route   GET /api/referrals/active
 * @desc    Get all active referrals for a guest session
 * @access  Public (guest users)
 * @query   guestSessionId: string
 */
router.get('/active', referralController.getActiveReferrals);

/**
 * @route   POST /api/referrals/validate
 * @desc    Validate if a referral can be applied to an order (guest checkout only)
 * @access  Public (but rejects if user is logged in)
 * @body    { guestSessionId: string, cartItems: array }
 */
router.post('/validate', referralController.validateReferral);

/**
 * @route   POST /api/referrals/process
 * @desc    Process referral commission after successful order
 * @access  Public (but rejects if user is logged in)
 * @body    { orderId: string, guestSessionId: string, commissions: array }
 */
router.post('/process', referralController.processReferralCommission);

/**
 * @route   GET /api/referrals/commissions
 * @desc    Get referrer's commission history
 * @access  Private (registered users only)
 * @query   status?: string, page?: number, limit?: number
 */
router.get('/commissions', auth, referralController.getReferrerCommissions);

/**
 * @route   POST /api/referrals/credit
 * @desc    Credit a pending commission (after 7 days)
 * @access  Private (registered users only)
 * @body    { referrerUserId: string, productId: string }
 */
router.post('/credit', auth, referralController.creditCommission);

/**
 * @route   POST /api/referrals/cancel
 * @desc    Cancel a commission (if order is cancelled within 7 days)
 * @access  Private (admin only - would need admin middleware)
 * @body    { orderId: string }
 */
router.post('/cancel', auth, referralController.cancelCommission);

/**
 * @route   POST /api/referrals/cleanup
 * @desc    Clean up expired referrals (scheduled task)
 * @access  Public (should be protected in production)
 */
router.post('/cleanup', referralController.cleanupExpiredReferrals);

module.exports = router;