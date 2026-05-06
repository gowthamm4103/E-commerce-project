"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  cartAPI,
  wishlistAPI,
  ordersAPI,
  getToken,
} from "../lib/api";

// Cart Context
export const CartContext = React.createContext<any>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Check if user is logged in
  const isLoggedIn = () => !!getToken();

  // Fetch cart from API on mount / login
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const data = await cartAPI.get();
      setCartItems(data.cartItems || []);
    } catch {
      // not logged in or error — keep local state
    }
  }, []);

  // Fetch wishlist from API
  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const data = await wishlistAPI.get();
      setWishlistItems(data.wishlistItems || []);
    } catch {
      // silent
    }
  }, []);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const data = await ordersAPI.getAll();
      setOrders(data.orders || []);
    } catch {
      // silent
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchCart();
    fetchWishlist();
    fetchOrders();
  }, [fetchCart, fetchWishlist, fetchOrders]);

  // Expose a refresh method so login flow can trigger reload
  const refreshAll = () => {
    fetchCart();
    fetchWishlist();
    fetchOrders();
  };

  // Function to calculate GST rate based on product price and category
  const getGSTRate = (price: number, category: string) => {
    if (category === "Clothing") {
      return price <= 2500 ? 0.05 : 0.18;
    }
    return 0.18;
  };

  const addToCart = async (product: any, selectedSize: string, selectedColor: string) => {
    // Optimistic local update
    const existingItem = cartItems.find(
      (item: any) =>
        (item._id === product._id || item.id === product.id) &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor,
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((item: any) =>
          (item._id === product._id || item.id === product.id) &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCartItems([
        ...cartItems,
        { ...product, quantity: 1, selectedSize, selectedColor },
      ]);
    }

    // Persist to backend
    if (isLoggedIn()) {
      try {
        const productId = product._id || product.id;
        const data = await cartAPI.add(productId, selectedSize, selectedColor);
        setCartItems(data.cartItems || []);
      } catch {
        // keep optimistic update
      }
    }
  };

  const removeFromCart = async (productId: any, selectedSize: string, selectedColor: string) => {
    setCartItems(
      cartItems.filter(
        (item: any) =>
          !(
            (item._id === productId || item.id === productId) &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          ),
      ),
    );

    if (isLoggedIn()) {
      try {
        const id = typeof productId === 'object' ? productId : productId;
        const data = await cartAPI.remove(String(id), selectedSize, selectedColor);
        setCartItems(data.cartItems || []);
      } catch { /* keep optimistic */ }
    }
  };

  const updateQuantity = async (productId: any, selectedSize: string, selectedColor: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor);
      return;
    }

    setCartItems(
      cartItems.map((item: any) =>
        (item._id === productId || item.id === productId) &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
          ? { ...item, quantity }
          : item,
      ),
    );

    if (isLoggedIn()) {
      try {
        const data = await cartAPI.updateQuantity(String(productId), selectedSize, selectedColor, quantity);
        setCartItems(data.cartItems || []);
      } catch { /* keep optimistic */ }
    }
  };

  const moveToWishlist = async (productId: any, selectedSize: string, selectedColor: string) => {
    const item = cartItems.find(
      (item: any) =>
        (item._id === productId || item.id === productId) &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor,
    );

    if (item) {
      setCartItems(cartItems.filter((i: any) =>
        !((i._id === productId || i.id === productId) && i.selectedSize === selectedSize && i.selectedColor === selectedColor)
      ));
      if (!wishlistItems.find((w: any) =>
        (w._id === productId || w.id === productId) && w.selectedSize === selectedSize && w.selectedColor === selectedColor
      )) {
        setWishlistItems([...wishlistItems, item]);
      }

      if (isLoggedIn()) {
        try {
          await wishlistAPI.moveToWishlist(String(productId), selectedSize, selectedColor);
          await fetchCart();
          await fetchWishlist();
        } catch { /* keep optimistic */ }
      }
    }
  };

  const addToWishlist = async (product: any, selectedSize?: string, selectedColor?: string) => {
    const pid = product._id || product.id;
    const sz = selectedSize || '';
    const cl = selectedColor || '';

    if (!wishlistItems.find((item: any) =>
      (item._id === pid || item.id === pid) && item.selectedSize === sz && item.selectedColor === cl
    )) {
      setWishlistItems([
        ...wishlistItems,
        { ...product, quantity: 1, selectedSize: sz, selectedColor: cl },
      ]);
    }

    if (isLoggedIn()) {
      try {
        const data = await wishlistAPI.add(String(pid), sz, cl);
        setWishlistItems(data.wishlistItems || []);
      } catch { /* keep optimistic */ }
    }
  };

  const removeFromWishlist = async (productId: any, selectedSize?: string, selectedColor?: string) => {
    const sz = selectedSize || '';
    const cl = selectedColor || '';
    setWishlistItems(
      wishlistItems.filter(
        (item: any) =>
          !(
            (item._id === productId || item.id === productId) &&
            item.selectedSize === sz &&
            item.selectedColor === cl
          ),
      ),
    );

    if (isLoggedIn()) {
      try {
        const data = await wishlistAPI.remove(String(productId), sz, cl);
        setWishlistItems(data.wishlistItems || []);
      } catch { /* keep optimistic */ }
    }
  };

  const moveToCart = async (productId: any, selectedSize: string, selectedColor: string) => {
    const item = wishlistItems.find(
      (item: any) =>
        (item._id === productId || item.id === productId) &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor,
    );

    if (item) {
      setWishlistItems(wishlistItems.filter((i: any) =>
        !((i._id === productId || i.id === productId) && i.selectedSize === selectedSize && i.selectedColor === selectedColor)
      ));
      if (!cartItems.find((c: any) =>
        (c._id === productId || c.id === productId) && c.selectedSize === selectedSize && c.selectedColor === selectedColor
      )) {
        setCartItems([...cartItems, item]);
      }

      if (isLoggedIn()) {
        try {
          await wishlistAPI.moveToCart(String(productId), selectedSize, selectedColor);
          await fetchCart();
          await fetchWishlist();
        } catch { /* keep optimistic */ }
      }
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0,
    );
  };

  const calculateOriginalTotal = () => {
    return cartItems.reduce(
      (total: number, item: any) =>
        total + (item.originalPrice || item.price) * item.quantity,
      0,
    );
  };

  const calculateDiscount = () => {
    return calculateOriginalTotal() - calculateTotal();
  };

  const calculateGST = () => {
    return cartItems.reduce((totalGST: number, item: any) => {
      const gstRate = getGSTRate(item.price, item.category);
      return totalGST + Math.round(item.price * item.quantity * gstRate);
    }, 0);
  };

  const calculateFinalTotal = () => {
    return calculateTotal() + calculateGST();
  };

  const placeOrder = async (deliveryDetails?: any, paymentMethod?: string) => {
    // Build local order as fallback
    const localOrder = {
      id: `ORD${Date.now()}`,
      date: new Date().toISOString(),
      status: "Processing",
      items: [...cartItems],
      deliveryDetails,
      paymentMethod: paymentMethod || 'card',
      subtotal: calculateTotal(),
      discount: calculateDiscount(),
      gst: calculateGST(),
      total: calculateFinalTotal(),
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (isLoggedIn()) {
      try {
        const data = await ordersAPI.place({
          deliveryDetails,
          paymentMethod: paymentMethod || 'card',
          items: cartItems,
        });
        const apiOrder = data.order;
        setOrders((prev: any[]) => [...prev, apiOrder]);
        setCartItems([]);
        return apiOrder;
      } catch {
        // fallback to local
        setOrders((prev: any[]) => [...prev, localOrder]);
        setCartItems([]);
        return localOrder;
      }
    }

    setOrders((prev: any[]) => [...prev, localOrder]);
    setCartItems([]);
    return localOrder;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        orders,
        isLoggedIn,
        addToCart,
        removeFromCart,
        updateQuantity,
        moveToWishlist,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        calculateTotal,
        calculateOriginalTotal,
        calculateDiscount,
        calculateGST,
        calculateFinalTotal,
        placeOrder,
        refreshAll,
        fetchCart,
        fetchWishlist,
        fetchOrders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Share Product Modal Component

export default CartProvider;
