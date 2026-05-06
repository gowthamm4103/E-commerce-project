const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ─── Get Cart ───────────────────────────────────────────────────────
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
      await cart.save();
    }

    // Populate product details
    const populatedItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        populatedItems.push({
          ...product.toObject(),
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        });
      }
    }

    return res.json({ success: true, cartItems: populatedItems });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch cart.' });
  }
};

// ─── Add to Cart ────────────────────────────────────────────────────
exports.addToCart = async (req, res) => {
  try {
    const { productId, selectedSize, selectedColor, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
    }

    // Check if item already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, selectedSize, selectedColor, quantity });
    }

    await cart.save();

    // Return populated cart
    const populatedItems = [];
    for (const item of cart.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        populatedItems.push({
          ...prod.toObject(),
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        });
      }
    }

    return res.json({ success: true, cartItems: populatedItems });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add to cart.' });
  }
};

// ─── Remove from Cart ───────────────────────────────────────────────
exports.removeFromCart = async (req, res) => {
  try {
    const { productId, selectedSize, selectedColor } = req.body;

    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found.' });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        )
    );

    await cart.save();

    // Return populated cart
    const populatedItems = [];
    for (const item of cart.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        populatedItems.push({
          ...prod.toObject(),
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        });
      }
    }

    return res.json({ success: true, cartItems: populatedItems });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to remove from cart.' });
  }
};

// ─── Update Quantity ────────────────────────────────────────────────
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, selectedSize, selectedColor, quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found.' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) =>
          !(
            item.productId.toString() === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          )
      );
    } else {
      const index = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );
      if (index >= 0) {
        cart.items[index].quantity = quantity;
      }
    }

    await cart.save();

    const populatedItems = [];
    for (const item of cart.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        populatedItems.push({
          ...prod.toObject(),
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        });
      }
    }

    return res.json({ success: true, cartItems: populatedItems });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update quantity.' });
  }
};

// ─── Clear Cart ─────────────────────────────────────────────────────
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.userId },
      { $set: { items: [] } }
    );
    return res.json({ success: true, cartItems: [] });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to clear cart.' });
  }
};
