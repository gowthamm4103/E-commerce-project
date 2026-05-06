const Coupon = require('../models/Coupon');
const ChangeRequest = require('../models/ChangeRequest');

// ─── Get Coupons ────────────────────────────────────────────────────
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ ownerId: req.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, coupons });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch coupons.' });
  }
};

// ─── Create Coupon → Submits change request ────────────────────────
exports.createCoupon = async (req, res) => {
  try {
    const {
      code, description, discountType, discountValue, maxDiscountAmount,
      minPurchaseAmount, expiryDate, usageLimit, usagePerCustomer,
      appliesTo, specificProducts, specificCategories, customerEligibility,
      status, approvalStatus
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ success: false, error: 'Code, discount type, and discount value are required.' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Coupon code already exists.' });
    }

    const payload = {
      code: code.toUpperCase(),
      description: description || '',
      discountType,
      discountValue,
      maxDiscountAmount: maxDiscountAmount || 0,
      minPurchaseAmount: minPurchaseAmount || 0,
      expiryDate: expiryDate || '',
      usageLimit: usageLimit || 0,
      usagePerCustomer: usagePerCustomer || 1,
      appliesTo: appliesTo || 'entire',
      specificProducts: specificProducts || [],
      specificCategories: specificCategories || [],
      customerEligibility: customerEligibility || '',
      status: status || 'active',
      approvalStatus: 'pending',
      ownerId: req.userId,
    };

    const cr = new ChangeRequest({
      entityType: 'coupon',
      actionType: 'create',
      entityId: null,
      payload,
      previousData: null,
      ownerId: req.userId,
      ownerName: req.user?.name || '',
      summary: `Add new coupon: ${payload.code}`,
    });
    await cr.save();

    return res.status(201).json({
      success: true,
      message: 'Coupon creation request submitted for admin approval.',
      changeRequest: cr,
    });
  } catch (error) {
    console.error('Create coupon request error:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit coupon creation request.' });
  }
};

// ─── Update Coupon → Submits change request ────────────────────────
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found.' });
    }
    if (coupon.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }

    const cr = new ChangeRequest({
      entityType: 'coupon',
      actionType: 'update',
      entityId: coupon._id,
      payload: req.body,
      previousData: coupon.toObject(),
      ownerId: req.userId,
      ownerName: req.user?.name || '',
      summary: `Update coupon: ${coupon.code}`,
    });
    await cr.save();

    return res.json({
      success: true,
      message: 'Coupon update request submitted for admin approval.',
      changeRequest: cr,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to submit coupon update request.' });
  }
};

// ─── Delete Coupon → Submits change request ────────────────────────
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found.' });
    }
    if (coupon.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }

    const cr = new ChangeRequest({
      entityType: 'coupon',
      actionType: 'delete',
      entityId: coupon._id,
      payload: {},
      previousData: coupon.toObject(),
      ownerId: req.userId,
      ownerName: req.user?.name || '',
      summary: `Delete coupon: ${coupon.code}`,
    });
    await cr.save();

    return res.json({
      success: true,
      message: 'Coupon deletion request submitted for admin approval.',
      changeRequest: cr,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to submit coupon deletion request.' });
  }
};

// ─── Validate Coupon (public) ───────────────────────────────────────
exports.validateCoupon = async (req, res) => {
  try {
    const { code, purchaseAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'active' });

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid or expired coupon code.' });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      coupon.status = 'expired';
      await coupon.save();
      return res.status(400).json({ success: false, error: 'Coupon has expired.' });
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, error: 'Coupon usage limit reached.' });
    }

    if (purchaseAmount && purchaseAmount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum purchase of ₹${coupon.minPurchaseAmount} required.`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((purchaseAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to validate coupon.' });
  }
};