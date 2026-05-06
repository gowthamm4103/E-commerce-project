const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ─── Get Wishlist ───────────────────────────────────────────────────
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.userId, items: [] });
      await wishlist.save();
    }

    const populatedItems = [];
    for (const item of wishlist.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        populatedItems.push({
          ...product.toObject(),
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        });
      }
    }

    return res.json({ success: true, wishlistItems: populatedItems });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch wishlist.' });
  }
};

// ─── Add to Wishlist ────────────────────────────────────────────────
exports.addToWishlist = async (req, res) => {
  try {
    const { productId, selectedSize, selectedColor } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    let wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.userId, items: [] });
    }

    const exists = wishlist.items.some(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (!exists) {
      wishlist.items.push({ productId, selectedSize: selectedSize || '', selectedColor: selectedColor || '' });
      await wishlist.save();
    }

    const populatedItems = [];
    for (const item of wishlist.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        populatedItems.push({
          ...prod.toObject(),
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        });
      }
    }

    return res.json({ success: true, wishlistItems: populatedItems });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to add to wishlist.' });
  }
};

// ─── Remove from Wishlist ───────────────────────────────────────────
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId, selectedSize, selectedColor } = req.body;

    const wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, error: 'Wishlist not found.' });
    }

    wishlist.items = wishlist.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.selectedSize === (selectedSize || '') &&
          item.selectedColor === (selectedColor || '')
        )
    );

    await wishlist.save();

    const populatedItems = [];
    for (const item of wishlist.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        populatedItems.push({
          ...prod.toObject(),
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        });
      }
    }

    return res.json({ success: true, wishlistItems: populatedItems });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to remove from wishlist.' });
  }
};

// ─── Move to Cart ───────────────────────────────────────────────────
exports.moveToCart = async (req, res) => {
  try {
    const { productId, selectedSize, selectedColor } = req.body;

    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ userId: req.userId });
    if (wishlist) {
      wishlist.items = wishlist.items.filter(
        (item) =>
          !(
            item.productId.toString() === productId &&
            item.selectedSize === (selectedSize || '') &&
            item.selectedColor === (selectedColor || '')
          )
      );
      await wishlist.save();
    }

    // Add to cart
    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += 1;
    } else {
      cart.items.push({ productId, selectedSize, selectedColor, quantity: 1 });
    }

    await cart.save();

    return res.json({ success: true, message: 'Moved to cart successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to move to cart.' });
  }
};

// ─── Move to Wishlist (from Cart) ───────────────────────────────────
exports.moveToWishlist = async (req, res) => {
  try {
    const { productId, selectedSize, selectedColor } = req.body;

    // Remove from cart
    const cart = await Cart.findOne({ userId: req.userId });
    if (cart) {
      cart.items = cart.items.filter(
        (item) =>
          !(
            item.productId.toString() === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          )
      );
      await cart.save();
    }

    // Add to wishlist
    let wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.userId, items: [] });
    }

    const exists = wishlist.items.some(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedSize === (selectedSize || '') &&
        item.selectedColor === (selectedColor || '')
    );

    if (!exists) {
      wishlist.items.push({ productId, selectedSize: selectedSize || '', selectedColor: selectedColor || '' });
      await wishlist.save();
    }

    return res.json({ success: true, message: 'Moved to wishlist successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to move to wishlist.' });
  }
};
