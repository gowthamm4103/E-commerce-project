const Referral = require('../models/Referral');
const Product = require('../models/Product');
const User = require('../models/User');

// ─── Configuration ────────────────────────────────────────────────────
const REFERRAL_EXPIRY_DAYS = 7;
const COMMISSION_RATE = 0.05; // 5% fixed

// ═══════════════════════════════════════════════════════════════════════
//  REFERRAL TRACKING (Guest clicks the link with userId as ref)
// ═══════════════════════════════════════════════════════════════════════

// Track when a guest user clicks a referral link (ref=userId)
exports.trackReferralClick = async (req, res) => {
  try {
    const { referrerUserId, productId, guestSessionId } = req.body;

    if (!referrerUserId || !productId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Referrer userId and productId are required' 
      });
    }

    // Get or create guest session ID
    const sessionId = guestSessionId || require('crypto').randomBytes(16).toString('hex');

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Check if referrer exists
    const referrer = await User.findOne({ userId: referrerUserId });
    if (!referrer) {
      return res.status(404).json({ success: false, error: 'Referrer not found' });
    }

    // Prevent self-referral
    if (req.userId && req.userId === referrerUserId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot refer yourself' 
      });
    }

    const expiresAt = new Date(Date.now() + REFERRAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    // Check if this guest already has a referral for the same product (last click wins)
    let referral = await Referral.findOne({
      guestSessionId: sessionId,
      productId: product._id,
      referrerUserId,
      converted: false,
      expiresAt: { $gt: new Date() },
    });

    if (referral) {
      // Update existing referral
      referral.clickedAt = new Date();
      referral.expiresAt = expiresAt;
      await referral.save();
    } else {
      // Create new referral
      referral = new Referral({
        referrerUserId,
        referrerEmail: referrer.email,
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        guestSessionId: sessionId,
        clickedAt: new Date(),
        expiresAt,
        source: 'direct',
      });
      await referral.save();
    }

    return res.status(200).json({
      success: true,
      guestSessionId: sessionId,
      referral: {
        referrerUserId,
        productId: product._id,
        productName: referral.productName,
        productPrice: referral.productPrice,
        expiresAt: referral.expiresAt,
        commissionRate: COMMISSION_RATE,
      },
    });
  } catch (error) {
    console.error('Track referral click error:', error);
    return res.status(500).json({ success: false, error: 'Failed to track referral click' });
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  GET ACTIVE REFERRALS FOR GUEST SESSION
// ═══════════════════════════════════════════════════════════════════════

// Get all active referrals for a guest session
exports.getActiveReferrals = async (req, res) => {
  try {
    const { guestSessionId } = req.query;

    if (!guestSessionId) {
      return res.status(400).json({ success: false, error: 'Guest session ID is required' });
    }

    const activeReferrals = await Referral.find({
      guestSessionId,
      converted: false,
      expiresAt: { $gt: new Date() },
    }).populate('referrerUserId', 'userId name email');

    const referrals = activeReferrals.map(r => ({
      referrerUserId: r.referrerUserId,
      productId: r.productId,
      productName: r.productName,
      productPrice: r.productPrice,
      expiresAt: r.expiresAt,
      commissionRate: COMMISSION_RATE,
    }));

    return res.status(200).json({
      success: true,
      referrals,
    });
  } catch (error) {
    console.error('Get active referrals error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch active referrals' });
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  VALIDATE REFERRAL FOR CHECKOUT
// ═══════════════════════════════════════════════════════════════════════

// Validate if a referral can be applied to an order
exports.validateReferral = async (req, res) => {
  try {
    const { guestSessionId, cartItems } = req.body;

    if (!guestSessionId || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Guest session ID and cart items are required' 
      });
    }

    // Get active referrals for this guest
    const activeReferrals = await Referral.find({
      guestSessionId,
      converted: false,
      expiresAt: { $gt: new Date() },
    });

    if (activeReferrals.length === 0) {
      return res.status(200).json({
        success: true,
        hasReferral: false,
        commissions: [],
        totalCommission: 0,
      });
    }

    // Check if user is logged in (guest checkout only)
    if (req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Referral commissions are only available for guest checkout. Please log out to use referral.',
      });
    }

    // Match cart items with referrals and calculate commissions
    const commissions = [];
    let totalCommission = 0;

    for (const referral of activeReferrals) {
      // Find matching product in cart
      const matchingCartItem = cartItems.find(item => {
        const itemId = item._id || item.id || item.productId;
        return itemId === referral.productId.toString();
      });

      if (matchingCartItem) {
        const quantity = matchingCartItem.quantity || 1;
        const commission = Math.round(referral.productPrice * quantity * COMMISSION_RATE);
        
        commissions.push({
          productId: referral.productId,
          productName: referral.productName,
          productPrice: referral.productPrice,
          quantity,
          commissionAmount: commission,
          commissionRate: COMMISSION_RATE,
          referrerUserId: referral.referrerUserId,
        });

        totalCommission += commission;
      }
    }

    return res.status(200).json({
      success: true,
      hasReferral: commissions.length > 0,
      commissions,
      totalCommission,
    });
  } catch (error) {
    console.error('Validate referral error:', error);
    return res.status(500).json({ success: false, error: 'Failed to validate referral' });
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  PROCESS REFERRAL COMMISSION (Called after successful order)
// ═══════════════════════════════════════════════════════════════════════

exports.processReferralCommission = async (req, res) => {
  try {
    const { orderId, guestSessionId, commissions } = req.body;

    if (!orderId || !guestSessionId || !commissions || commissions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order ID, guest session ID, and commissions are required' 
      });
    }

    // Check if user is logged in (should have been validated before order)
    if (req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Cannot process referral commission for logged-in users',
      });
    }

    const processedCommissions = [];

    for (const commissionData of commissions) {
      const { productId, commissionAmount, referrerUserId } = commissionData;

      // Find the referral
      const referral = await Referral.findOne({
        referrerUserId,
        productId,
        guestSessionId,
        converted: false,
      });

      if (!referral) continue;

      // Mark referral as converted
      referral.converted = true;
      referral.convertedAt = new Date();
      referral.orderId = orderId;

      // Add commission record
      const commissionRecord = {
        orderId,
        productId,
        productName: referral.productName,
        productPrice: referral.productPrice,
        quantity: commissionData.quantity || 1,
        commissionAmount,
        commissionRate: COMMISSION_RATE,
        status: 'pending', // Pending for 7 days (cancellation window)
      };

      referral.commissions.push(commissionRecord);
      referral.totalCommissionEarned += commissionAmount;

      await referral.save();

      // Add commission to referrer's wallet/income
      const referrer = await User.findOne({ userId: referrerUserId });
      if (referrer) {
        referrer.referralIncome = (referrer.referralIncome || 0) + commissionAmount;
        referrer.totalReferrals = (referrer.totalReferrals || 0) + 1;
        await referrer.save();
      }

      processedCommissions.push({
        referrerUserId,
        productId,
        commissionAmount,
        status: 'pending',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Referral commissions processed successfully',
      commissions: processedCommissions,
    });
  } catch (error) {
    console.error('Process referral commission error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process referral commission' });
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  GET REFERRER'S COMMISSION HISTORY
// ═══════════════════════════════════════════════════════════════════════

exports.getReferrerCommissions = async (req, res) => {
  try {
    const referrerUserId = req.userId;

    if (!referrerUserId) {
      return res.status(401).json({ success: false, error: 'User must be logged in' });
    }

    const { status, page = 1, limit = 20 } = req.query;

    const query = { referrerUserId };
    if (status && status !== 'all') {
      query['commissions.status'] = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const referrals = await Referral.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReferrals = await Referral.countDocuments(query);

    // Flatten commissions for easier display
    const allCommissions = [];
    for (const referral of referrals) {
      for (const commission of referral.commissions) {
        allCommissions.push({
          ...commission.toObject(),
          productName: referral.productName,
          createdAt: referral.createdAt,
        });
      }
    }

    return res.status(200).json({
      success: true,
      commissions: allCommissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalReferrals,
        pages: Math.ceil(totalReferrals / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get referrer commissions error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch commissions' });
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  CREDIT COMMISSION (After cancellation window expires)
// ═══════════════════════════════════════════════════════════════════════

exports.creditCommission = async (req, res) => {
  try {
    const { referrerUserId, productId } = req.body;

    const referral = await Referral.findOne({ referrerUserId, productId, converted: true });
    if (!referral) {
      return res.status(404).json({ success: false, error: 'Referral not found' });
    }

    const commission = referral.commissions.find(
      c => c.productId.toString() === productId && c.status === 'pending'
    );

    if (!commission) {
      return res.status(404).json({ success: false, error: 'Commission not found' });
    }

    // Check if 7 days have passed since order
    const orderDate = new Date(referral.convertedAt);
    const daysPassed = (new Date() - orderDate) / (1000 * 60 * 60 * 24);

    if (daysPassed < 7) {
      return res.status(400).json({ 
        success: false, 
        error: 'Commission can only be credited after 7 days' 
      });
    }

    // Credit the commission
    commission.status = 'credited';
    commission.creditedAt = new Date();

    // Add to referrer's wallet
    const referrer = await User.findOne({ userId: referrerUserId });
    if (referrer) {
      referrer.walletBalance = (referrer.walletBalance || 0) + commission.commissionAmount;
      referrer.creditedCommission = (referrer.creditedCommission || 0) + commission.commissionAmount;
      await referrer.save();
    }

    await referral.save();

    return res.status(200).json({
      success: true,
      message: 'Commission credited successfully',
      commissionAmount: commission.commissionAmount,
    });
  } catch (error) {
    console.error('Credit commission error:', error);
    return res.status(500).json({ success: false, error: 'Failed to credit commission' });
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  CANCEL COMMISSION (If order is cancelled within 7 days)
// ═══════════════════════════════════════════════════════════════════════

exports.cancelCommission = async (req, res) => {
  try {
    const { orderId } = req.body;

    const referrals = await Referral.find({ orderId, converted: true });

    for (const referral of referrals) {
      for (const commission of referral.commissions) {
        if (commission.orderId === orderId && commission.status === 'pending') {
          commission.status = 'cancelled';
          commission.cancelledAt = new Date();
          commission.cancellationReason = 'Order cancelled within 7 days';

          // Deduct from referrer's referral income
          const referrer = await User.findOne({ userId: referral.referrerUserId });
          if (referrer) {
            referrer.referralIncome = Math.max(0, (referrer.referralIncome || 0) - commission.commissionAmount);
            await referrer.save();
          }
        }
      }
      await referral.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Commission cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel commission error:', error);
    return res.status(500).json({ success: false, error: 'Failed to cancel commission' });
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  CLEANUP EXPIRED REFERRALS (Scheduled task)
// ═══════════════════════════════════════════════════════════════════════

exports.cleanupExpiredReferrals = async (req, res) => {
  try {
    const result = await Referral.deleteMany({
      converted: false,
      expiresAt: { $lt: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: `Cleaned up ${result.deletedCount} expired referrals`,
    });
  } catch (error) {
    console.error('Cleanup expired referrals error:', error);
    return res.status(500).json({ success: false, error: 'Failed to cleanup expired referrals' });
  }
};