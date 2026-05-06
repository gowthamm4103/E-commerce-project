const Product = require('../models/Product');
const ChangeRequest = require('../models/ChangeRequest');

// ─── Get All Products ───────────────────────────────────────────────
exports.getAllProducts = async (req, res) => {
  try {
    const { category, subCategory, search, minPrice, maxPrice, brand, color, size, sort } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = { $regex: subCategory, $options: 'i' };
    if (brand) filter.brandName = { $regex: brand, $options: 'i' };
    if (color) filter.colors = { $regex: color, $options: 'i' };
    if (size) filter.sizes = { $regex: size, $options: 'i' };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const products = await Product.find(filter).sort(sortOption);

    return res.json({ success: true, products, count: products.length });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch products.' });
  }
};

// ─── Get Product by ID ──────────────────────────────────────────────
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch product.' });
  }
};

// ─── Get Products by Category ───────────────────────────────────────
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    let filter = { isActive: true };

    if (category === 'mens') {
      filter.category = 'Clothing';
      filter.subCategory = { $in: [/Shirt/i, /Jeans/i, /Pants/i, /Jacket/i] };
    } else if (category === 'womens') {
      filter.category = 'Clothing';
      filter.subCategory = { $in: [/Dress/i, /Skirt/i, /Blouse/i] };
    } else if (category === 'accessories') {
      filter.category = 'Accessories';
    }
    // 'all' → no extra filter

    const products = await Product.find(filter);
    return res.json({ success: true, products, count: products.length });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch products.' });
  }
};

// ─── Create Product (Brand Owner) → Submits change request ──────────
exports.createProduct = async (req, res) => {
  try {
    const payload = { ...req.body, ownerId: req.userId };

    const cr = new ChangeRequest({
      entityType: 'product',
      actionType: 'create',
      entityId: null,
      payload,
      previousData: null,
      ownerId: req.userId,
      ownerName: req.user?.name || '',
      summary: `Add new product: ${payload.name || 'Untitled'}`,
    });
    await cr.save();

    return res.status(201).json({
      success: true,
      message: 'Product creation request submitted for admin approval.',
      changeRequest: cr,
    });
  } catch (error) {
    console.error('Create product request error:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit product creation request.' });
  }
};

// ─── Update Product → Submits change request ───────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    if (product.ownerId && product.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this product.' });
    }

    const cr = new ChangeRequest({
      entityType: 'product',
      actionType: 'update',
      entityId: product._id,
      payload: req.body,
      previousData: product.toObject(),
      ownerId: req.userId,
      ownerName: req.user?.name || '',
      summary: `Update product: ${product.name}`,
    });
    await cr.save();

    return res.json({
      success: true,
      message: 'Product update request submitted for admin approval.',
      changeRequest: cr,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to submit product update request.' });
  }
};

// ─── Delete Product → Submits change request ───────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    if (product.ownerId && product.ownerId !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this product.' });
    }

    const cr = new ChangeRequest({
      entityType: 'product',
      actionType: 'delete',
      entityId: product._id,
      payload: {},
      previousData: product.toObject(),
      ownerId: req.userId,
      ownerName: req.user?.name || '',
      summary: `Delete product: ${product.name}`,
    });
    await cr.save();

    return res.json({
      success: true,
      message: 'Product deletion request submitted for admin approval.',
      changeRequest: cr,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to submit product deletion request.' });
  }
};

// ─── Get Brand Owner Products ───────────────────────────────────────
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ ownerId: req.userId, isActive: true });
    return res.json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch your products.' });
  }
};

// ─── Update Stock → Submits change request ──────────────────────────
exports.updateStock = async (req, res) => {
  try {
    const { quantity, action } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    const newQty = action === 'add' ? product.stockQuantity + Number(quantity) : Number(quantity);

    const cr = new ChangeRequest({
      entityType: 'product',
      actionType: 'update',
      entityId: product._id,
      payload: { stockQuantity: newQty },
      previousData: { stockQuantity: product.stockQuantity, name: product.name },
      ownerId: req.userId,
      ownerName: req.user?.name || '',
      summary: `Update stock for ${product.name}: ${product.stockQuantity} → ${newQty}`,
    });
    await cr.save();

    return res.json({
      success: true,
      message: 'Stock update request submitted for admin approval.',
      changeRequest: cr,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to submit stock update request.' });
  }
};

// ─── Get my change requests ─────────────────────────────────────────
exports.getMyChangeRequests = async (req, res) => {
  try {
    const { status, entityType } = req.query;
    const filter = { ownerId: req.userId };
    if (status && status !== 'all') filter.status = status;
    if (entityType && entityType !== 'all') filter.entityType = entityType;

    const requests = await ChangeRequest.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch change requests.' });
  }
};
