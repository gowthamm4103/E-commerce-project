const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

// GST helper (same logic as frontend)
const getGSTRate = (price, category) => {
  if (category === 'Clothing') {
    return price <= 2500 ? 0.05 : 0.18;
  }
  return 0.18;
};

// ─── Place Order ────────────────────────────────────────────────────
exports.placeOrder = async (req, res) => {
  try {
    const { deliveryDetails, paymentMethod, couponCode, items: clientItems } = req.body;

    // Try server-side cart first, fall back to client-provided items
    let cartSource = [];
    const cart = await Cart.findOne({ userId: req.userId });

    if (cart && cart.items.length > 0) {
      cartSource = cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      }));
    } else if (clientItems && clientItems.length > 0) {
      // Use items sent from the client (covers offline-to-online cart scenario)
      cartSource = clientItems.map(item => ({
        productId: item._id || item.id || item.productId,
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize || '',
        selectedColor: item.selectedColor || '',
      }));
    } else {
      return res.status(400).json({ success: false, error: 'Cart is empty.' });
    }

    // Build order items with product details
    const orderItems = [];
    let subtotal = 0;
    let totalGST = 0;

    for (const item of cartSource) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const itemSubtotal = product.price * item.quantity;
      const gstRate = getGSTRate(product.price, product.category);
      const itemGST = Math.round(itemSubtotal * gstRate);

      subtotal += itemSubtotal;
      totalGST += itemGST;

      orderItems.push({
        productId: product._id,
        name: product.name,
        brandName: product.brandName,
        price: product.price,
        category: product.category,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        images: product.images,
      });

      // Reduce stock
      product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
      await product.save();
    }

    const total = subtotal + totalGST;

    const order = new Order({
      userId: req.userId,
      items: orderItems,
      subtotal,
      discount: 0,
      gst: totalGST,
      total,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Processing',
      deliveryDetails: deliveryDetails || {},
      paymentMethod: paymentMethod || 'card',
      couponCode: couponCode || null,
      trackingStages: [
        { name: 'Order Placed', completed: true, date: new Date().toISOString() },
        { name: 'Arrived at Courier Warehouse', completed: false, date: '' },
        { name: 'Out for Delivery', completed: false, date: '' },
        { name: 'Products Delivered', completed: false, date: '' },
      ],
    });

    await order.save();

    // Clear server-side cart if it exists
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // Update user's direct parent income for MLM
    const user = await User.findOne({ userId: req.userId });
    if (user && user.directParentId) {
      const parent = await User.findOne({ userId: user.directParentId });
      if (parent) {
        parent.directIncome += subtotal * 0.05;
        parent.totalSales += subtotal;
        await parent.save();
      }
    }

    // ═══════════════════════════════════════════════════════════════
    //  AUTO-GENERATE INVOICES (one per brand owner)
    // ═══════════════════════════════════════════════════════════════
    try {
      // Group order items by brand owner (product.ownerId)
      const itemsByOwner = {};
      for (const item of orderItems) {
        const product = await Product.findById(item.productId).lean();
        const ownerId = (product && product.ownerId) ? product.ownerId : 'platform';
        if (!itemsByOwner[ownerId]) {
          itemsByOwner[ownerId] = [];
        }
        itemsByOwner[ownerId].push({ ...item, gstRate: getGSTRate(item.price, item.category) });
      }

      // Build customer info from delivery details
      const dd = deliveryDetails || {};
      const customerName = [dd.firstName, dd.lastName].filter(Boolean).join(' ') || 'Customer';
      const customerAddress = [dd.address, dd.city, dd.state, dd.zipCode].filter(Boolean).join(', ');
      const customerContact = dd.phone || dd.email || '';
      const invoiceDateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const dueDateStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      for (const [ownerId, ownerItems] of Object.entries(itemsByOwner)) {
        // Build invoice items matching the Invoice model's invoiceItemSchema
        const invoiceItems = ownerItems.map((item) => {
          const lineSubtotal = item.price * item.quantity;
          const lineTax = Math.round(lineSubtotal * item.gstRate);
          const lineAmount = lineSubtotal + lineTax;
          return {
            productName: item.name || '',
            description: [item.selectedSize, item.selectedColor].filter(Boolean).join(' / ') || '',
            mrp: item.price || 0,
            price: item.price || 0,
            quantity: item.quantity || 1,
            discount: 0,
            tax: lineTax,
            amount: lineAmount,
          };
        });

        const invSubtotal = invoiceItems.reduce((s, i) => s + (i.price * i.quantity), 0);
        const invTotalTax = invoiceItems.reduce((s, i) => s + i.tax, 0);
        const invTotalAmount = invoiceItems.reduce((s, i) => s + i.amount, 0);

        const invoiceNumber = `INV-${order.orderId}-${ownerId.substring(0, 6).toUpperCase()}`;

        const invoice = new Invoice({
          invoiceNumber,
          ownerId,
          orderId: order.orderId,
          source: 'auto',
          customerName,
          customerAddress,
          customerContact,
          invoiceDate: invoiceDateStr,
          dueDate: dueDateStr,
          items: invoiceItems,
          notes: `Auto-generated from Order ${order.orderId}`,
          subtotal: invSubtotal,
          totalDiscount: 0,
          totalTax: invTotalTax,
          totalAmount: invTotalAmount,
          paymentMethod: paymentMethod || 'card',
          paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
          upiId: '',
        });

        await invoice.save();
      }
    } catch (invoiceErr) {
      // Invoice auto-generation should not block the order response
      console.error('Auto-invoice generation error (non-blocking):', invoiceErr);
    }

    return res.status(201).json({
      success: true,
      order: {
        id: order.orderId,
        orderId: order.orderId,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        gst: order.gst,
        total: order.total,
        deliveryDate: order.deliveryDate,
        status: order.status,
        deliveryDetails: order.deliveryDetails,
        paymentMethod: order.paymentMethod,
        trackingStages: order.trackingStages,
        date: order.createdAt,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Place order error:', error);
    return res.status(500).json({ success: false, error: 'Failed to place order.' });
  }
};

// ─── Get All Orders ─────────────────────────────────────────────────
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.userId };
    if (status && status !== 'all') {
      filter.status = { $regex: status, $options: 'i' };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      id: order.orderId,
      orderId: order.orderId,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      gst: order.gst,
      total: order.total,
      deliveryDate: order.deliveryDate,
      status: order.status,
      deliveryDetails: order.deliveryDetails,
      paymentMethod: order.paymentMethod,
      trackingStages: order.trackingStages,
      date: order.createdAt,
      createdAt: order.createdAt,
    }));

    return res.json({ success: true, orders: formattedOrders });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch orders.' });
  }
};

// ─── Get Order by ID ────────────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, userId: req.userId });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    return res.json({
      success: true,
      order: {
        id: order.orderId,
        orderId: order.orderId,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        gst: order.gst,
        total: order.total,
        deliveryDate: order.deliveryDate,
        status: order.status,
        deliveryDetails: order.deliveryDetails,
        paymentMethod: order.paymentMethod,
        trackingStages: order.trackingStages,
        date: order.createdAt,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch order.' });
  }
};

// ─── Get Latest Order ───────────────────────────────────────────────
exports.getLatestOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!order) {
      return res.json({ success: true, order: null });
    }

    return res.json({
      success: true,
      order: {
        id: order.orderId,
        orderId: order.orderId,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        gst: order.gst,
        total: order.total,
        deliveryDate: order.deliveryDate,
        status: order.status,
        deliveryDetails: order.deliveryDetails,
        paymentMethod: order.paymentMethod,
        trackingStages: order.trackingStages,
        date: order.createdAt,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch latest order.' });
  }
};
