const Business = require('../models/Business');
const Category = require('../models/Category');
const TeamMember = require('../models/TeamMember');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const Coupon = require('../models/Coupon');
const ChangeRequest = require('../models/ChangeRequest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ═══════════════════════════════════════════════════════════════════
//  STORE DETAILS
// ═══════════════════════════════════════════════════════════════════

exports.getStoreDetails = async (req, res) => {
  try {
    let business = await Business.findOne({ ownerId: req.userId });
    if (!business) {
      business = new Business({ ownerId: req.userId });
      await business.save();
    }
    return res.json({ success: true, business });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch store details.' });
  }
};

exports.updateStoreDetails = async (req, res) => {
  try {
    let business = await Business.findOne({ ownerId: req.userId });
    if (!business) {
      business = new Business({ ownerId: req.userId });
    }

    const allowedFields = [
      'storeName', 'brandName', 'dbaName', 'businessType', 'gstin', 'cin',
      'storeAddress', 'phone', 'whatsapp', 'email', 'instagram', 'youtube',
      'whatsappGroup', 'linkedin', 'pinterest', 'facebook', 'twitter',
      'logo', 'favicon'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    await business.save();
    return res.json({ success: true, business });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update store details.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  OVERVIEW / FINANCIAL DATA
// ═══════════════════════════════════════════════════════════════════

exports.getOverview = async (req, res) => {
  try {
    const products = await Product.find({ ownerId: req.userId });
    const orders = await Order.find({ 'items.ownerId': req.userId });
    const invoices = await Invoice.find({ ownerId: req.userId });
    const coupons = await Coupon.find({ ownerId: req.userId });

    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed');
    const amountReceived = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const gstPayable = amountReceived * 0.18;

    const lowStockAlerts = products.filter(p => (p.stockQuantity || 0) < (p.lowStockThreshold || 10));

    const orderStatusCounts = {
      new: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipmentReady: orders.filter(o => o.status === 'shipment_ready').length,
      inTransit: orders.filter(o => o.status === 'in_transit').length,
      completed: completedOrders.length,
      returned: orders.filter(o => o.status === 'returned').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    return res.json({
      success: true,
      overview: {
        totalProducts: products.length,
        amountReceived,
        gstPayable,
        walletBalance: amountReceived - gstPayable,
        totalOrders: orders.length,
        orderStatusCounts,
        lowStockAlerts: lowStockAlerts.length,
        lowStockProducts: lowStockAlerts.slice(0, 10),
        pendingPayments: orderStatusCounts.confirmed + orderStatusCounts.shipmentReady,
        totalInvoices: invoices.length,
        totalCoupons: coupons.length,
      }
    });
  } catch (error) {
    console.error('Overview error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch overview.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  CATEGORIES
// ═══════════════════════════════════════════════════════════════════

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ ownerId: req.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch categories.' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory, subCategories } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Category name is required.' });
    }

    const category = new Category({
      name,
      description: description || '',
      parentCategory: parentCategory || '',
      subCategories: subCategories || [],
      ownerId: req.userId,
    });

    await category.save();
    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create category.' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }
    if (category.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }

    ['name', 'description', 'parentCategory', 'subCategories'].forEach(field => {
      if (req.body[field] !== undefined) category[field] = req.body[field];
    });

    await category.save();
    return res.json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update category.' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }
    if (category.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }
    await Category.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete category.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  TEAM MEMBERS
// ═══════════════════════════════════════════════════════════════════

exports.getTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find({ ownerId: req.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, members });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch team members.' });
  }
};

exports.createTeamMember = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    // Check for existing member with same email under this owner
    const existing = await TeamMember.findOne({ ownerId: req.userId, email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'A team member with this email already exists.' });
    }

    // Generate memberId: TM + ownerId + sequential number
    const memberCount = await TeamMember.countDocuments({ ownerId: req.userId });
    const memberId = `TM-${req.userId}-${String(memberCount + 1).padStart(3, '0')}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const validRole = ['standard_member', 'premium_member'].includes(role) ? role : 'standard_member';

    const member = new TeamMember({
      memberId,
      name,
      email,
      password: hashedPassword,
      role: validRole,
      permissions: permissions || [],
      ownerId: req.userId,
    });

    await member.save();
    // Don't return password
    const memberObj = member.toObject();
    delete memberObj.password;
    return res.status(201).json({ success: true, member: memberObj });
  } catch (error) {
    console.error('Create team member error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add team member.' });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Team member not found.' });
    }
    if (member.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }

    ['name', 'email', 'role', 'permissions', 'isActive'].forEach(field => {
      if (req.body[field] !== undefined) member[field] = req.body[field];
    });

    await member.save();
    return res.json({ success: true, member });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update team member.' });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Team member not found.' });
    }
    if (member.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }
    await TeamMember.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Team member removed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to remove team member.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  INVENTORY (Admin-level: aggregate all brand owner products)
// ═══════════════════════════════════════════════════════════════════

exports.getInventoryAll = async (req, res) => {
  try {
    const User = require('../models/User');
    const brandOwners = await User.find({ userType: 'brand_owner' });

    const brands = [];
    for (const bo of brandOwners) {
      const products = await Product.find({ ownerId: bo.userId });
      if (products.length === 0) continue;

      brands.push({
        brandId: bo.userId,
        brandName: bo.brandName || bo.name,
        brandOwnerName: bo.name,
        userId: bo.userId,
        products: products.map(p => ({
          id: p._id.toString(),
          name: p.name,
          category: p.category || '',
          subCategory: p.subCategory || '',
          mrp: p.mrp || p.price || 0,
          sellingPrice: p.sellingPrice || p.price || 0,
          totalStock: p.stockQuantity || 0,
          lastUpdated: p.updatedAt || p.createdAt,
          skuCodes: p.skuCodes || [{ sku: p.sku || 'N/A', size: '-', color: '-', quantity: p.stockQuantity || 0 }],
        })),
      });
    }

    return res.json({ success: true, brands });
  } catch (error) {
    console.error('Inventory all error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch inventory.' });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { productId, updateType, value } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    if (updateType === 'add') {
      product.stockQuantity = (product.stockQuantity || 0) + value;
    } else if (updateType === 'set') {
      product.stockQuantity = value;
    }

    await product.save();
    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update stock.' });
  }
};

exports.syncAll = async (req, res) => {
  try {
    const User = require('../models/User');
    const brandOwners = await User.find({ userType: 'brand_owner' });
    return res.json({
      success: true,
      data: { syncedBrands: brandOwners.length }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to sync.' });
  }
};

exports.exportInventory = async (req, res) => {
  try {
    const User = require('../models/User');
    const brandOwners = await User.find({ userType: 'brand_owner' });
    const rows = ['Brand,Product,Category,SubCategory,MRP,SellingPrice,Stock'];

    for (const bo of brandOwners) {
      const products = await Product.find({ ownerId: bo.userId });
      for (const p of products) {
        rows.push(`"${bo.brandName || bo.name}","${p.name}","${p.category || ''}","${p.subCategory || ''}",${p.mrp || 0},${p.sellingPrice || p.price || 0},${p.stockQuantity || 0}`);
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-export.csv');
    return res.send(rows.join('\n'));
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to export.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  TEAM MEMBER LOGIN
// ═══════════════════════════════════════════════════════════════════

exports.teamMemberLogin = async (req, res) => {
  try {
    const { memberId, password } = req.body;
    if (!memberId || !password) {
      return res.status(400).json({ success: false, error: 'Member ID and password are required.' });
    }

    const member = await TeamMember.findOne({ memberId, isActive: true });
    if (!member) {
      return res.status(401).json({ success: false, error: 'Invalid member ID or password.' });
    }

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid member ID or password.' });
    }

    const token = jwt.sign(
      { userId: member.ownerId, memberId: member.memberId, memberRole: member.role },
      process.env.JWT_SECRET || 'engineers_secret_key',
      { expiresIn: '7d' }
    );

    const memberObj = member.toObject();
    delete memberObj.password;

    return res.json({ success: true, member: memberObj, token });
  } catch (error) {
    console.error('Team member login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  TEAM MEMBER PRODUCT OPERATIONS
//  standard_member: can add products, can edit only their own products
//  premium_member: can add products, can edit any product of the brand
//  Neither can delete — only brand owner can delete
//  All changes go through ChangeRequest for admin approval
// ═══════════════════════════════════════════════════════════════════

exports.teamMemberAddProduct = async (req, res) => {
  try {
    const payload = { ...req.body, ownerId: req.userId, addedBy: req.memberId };

    const cr = new ChangeRequest({
      entityType: 'product',
      actionType: 'create',
      entityId: null,
      payload,
      previousData: null,
      ownerId: req.userId,
      ownerName: `Team: ${req.memberId}`,
      summary: `[${req.memberId}] Add new product: ${payload.name || 'Untitled'}`,
    });
    await cr.save();

    return res.status(201).json({
      success: true,
      message: 'Product creation request submitted for admin approval.',
      changeRequest: cr,
    });
  } catch (error) {
    console.error('Team member add product error:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit product creation request.' });
  }
};

exports.teamMemberEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    // Must belong to the same brand owner
    if (product.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to edit this product.' });
    }

    // standard_member can only edit products they added
    if (req.memberRole === 'standard_member' && product.addedBy !== req.memberId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Standard members can only edit products they added.' 
      });
    }

    // premium_member can edit any product of their brand owner — no extra check needed

    const cr = new ChangeRequest({
      entityType: 'product',
      actionType: 'update',
      entityId: product._id,
      payload: req.body,
      previousData: product.toObject(),
      ownerId: req.userId,
      ownerName: `Team: ${req.memberId}`,
      summary: `[${req.memberId}] Update product: ${product.name}`,
    });
    await cr.save();

    return res.json({
      success: true,
      message: 'Product update request submitted for admin approval.',
      changeRequest: cr,
    });
  } catch (error) {
    console.error('Team member edit product error:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit product update request.' });
  }
};

exports.teamMemberGetProducts = async (req, res) => {
  try {
    // Get all products belonging to the brand owner
    const products = await Product.find({ ownerId: req.userId });
    return res.json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch products.' });
  }
};