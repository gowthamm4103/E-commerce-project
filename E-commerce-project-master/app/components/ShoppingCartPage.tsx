'use client';

import React, { useState, useRef, useContext } from 'react';
import { X, Plus, ShoppingCart, Minus } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import type { PageName } from '../types';
import Header from './Header';
import Footer from './Footer';
import productsData from '../data/products';

interface ShoppingCartPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const ShoppingCartPage = ({ setCurrentPage, onNavigateToSignup, hideHeader = false }: ShoppingCartPageProps)=> {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    moveToWishlist,
    calculateTotal,
    calculateOriginalTotal,
    calculateDiscount,
    calculateGST,
    calculateFinalTotal
  } = useContext(CartContext);
  
  // Function to calculate GST-inclusive price
  const calculateGSTInclusivePrice = (price, category) => {
    // Get GST rate based on price and category
    let gstRate = 0.18; // Default 18%
    if (category === 'Clothing') {
      gstRate = price <= 2500 ? 0.05 : 0.18;
    }
    
    // Calculate GST-inclusive price
    return Math.round(price * (1 + gstRate));
  };
  
  // Function to calculate GST-inclusive total for cart
  const calculateGSTInclusiveTotal = () => {
    return cartItems.reduce((total, item) => {
      const inclusivePrice = calculateGSTInclusivePrice(item.price, item.category);
      return total + (inclusivePrice * item.quantity);
    }, 0);
  };
  
  // Function to calculate GST-inclusive original total
  const calculateGSTInclusiveOriginalTotal = () => {
    return cartItems.reduce((total, item) => {
      const inclusiveOriginalPrice = calculateGSTInclusivePrice(item.originalPrice, item.category);
      return total + (inclusiveOriginalPrice * item.quantity);
    }, 0);
  };
  
  // Function to calculate GST-inclusive discount
  const calculateGSTInclusiveDiscount = () => {
    return calculateGSTInclusiveOriginalTotal() - calculateGSTInclusiveTotal();
  };
  
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef(null);
  
  const handleRemoveClick = (item) => {
    setItemToRemove(item);
    setShowRemoveModal(true);
  };
  
 const confirmRemove = (moveToWishlistOption) => {
  if (!itemToRemove) return;  // add this guard
  if (moveToWishlistOption) {
    moveToWishlist(itemToRemove._id || itemToRemove.id, itemToRemove.selectedSize, itemToRemove.selectedColor);
  } else {
    removeFromCart(itemToRemove._id || itemToRemove.id, itemToRemove.selectedSize, itemToRemove.selectedColor);
  }
  setShowRemoveModal(false);
  setItemToRemove(null);
};
  
  const handleMenuClick = (option) => {
    setIsMenuOpen(false);
    if (option === 'orderSummary') {
      setCurrentPage('orderSummary');
    } else if (option === 'orderHistory') {
      setCurrentPage('orderHistory');
    } else if (option === 'orderTracking') {
      setCurrentPage('orderTracking');
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>
      
      {!hideHeader && (
        <Header
          setCurrentPage={setCurrentPage}
          setShowAuth={() => {}}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isCompanyDropdownOpen={isCompanyDropdownOpen}
          setIsCompanyDropdownOpen={setIsCompanyDropdownOpen}
          companyDropdownRef={companyDropdownRef}
          onNavigateToSignup={onNavigateToSignup}
          showSecondaryHeader={true}
          secondaryTitle="Shopping Cart"
          onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        />
      )}
      
      {/* Menu Dropdown */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-opacity-50 z-50" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-white w-64 h-full shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Orders</h3>
                <button onClick={() => setIsMenuOpen(false)} className="p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => handleMenuClick('orderSummary')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded font-semibold"
                >
                  Order Summary
                </button>
                <button 
                  onClick={() => handleMenuClick('orderHistory')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded font-semibold"
                >
                  Order History
                </button>
                <button 
                  onClick={() => handleMenuClick('orderTracking')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded font-semibold"
                >
                  Order Tracking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Shopping Cart</h2>
          </div>
        </div>
      </div>
      
      <div className="max-w-8xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center min-h-[50vh]">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <button 
              onClick={() => setCurrentPage('landing')}
              className="px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Cart Items ({cartItems.length})</h2>
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const inclusivePrice = calculateGSTInclusivePrice(item.price, item.category);
                  const inclusiveOriginalPrice = calculateGSTInclusivePrice(item.originalPrice, item.category);
                  const discountPercentage = Math.round((1 - inclusivePrice / inclusiveOriginalPrice) * 100);
                  const itemCredits = (inclusivePrice / 10).toFixed(2);
                  
                  return (
                    <div key={`${item._id || item.id}-${item.selectedSize}-${item.selectedColor}`} className="bg-white border border-gray-200 rounded p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <img 
                          src={item.images?.[0] || '/api/placeholder/400/500'} 
                          alt={item.name} 
                          className="w-full md:w-24 h-32 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          
                          {/* Badges: Size, Color, Qty */}
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                              Size: {item.selectedSize}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                              Color: {item.selectedColor}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          
                          {/* Price & Credits */}
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <div className="flex items-center flex-wrap">
                              <span className="font-bold text-lg">₹{inclusivePrice}</span>
                              {item.originalPrice > item.price && (
                                <span className="text-sm text-gray-500 line-through ml-2">₹{inclusiveOriginalPrice}</span>
                              )}
                              {item.originalPrice > item.price && (
                                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-bold">
                                  {discountPercentage}% OFF
                                </span>
                              )}
                              <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white ml-1 shadow-lg">
                                {itemCredits * item.quantity} Credits
                              </span>
                            </div>
                            
                            <div className="flex items-center border border-gray-300 rounded">
                              <button 
                                onClick={() => updateQuantity(item._id || item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                                className="px-3 py-4 hover:bg-red-100 transition-colors duration-200 flex items-center justify-center disabled:opacity-40"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-4 py-2 min-w-[10px] text-center font-medium">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item._id || item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                                className="px-3 py-4 hover:bg-green-100 transition-colors duration-200 flex items-center justify-center disabled:opacity-40"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                          
                          {/* UPDATED: Brand Name moved here (Below everything else) */}
                          <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleRemoveClick(item)}
                              className="px-3 py-1 border border-red-300 text-red-600 text-sm rounded hover:bg-red-50 transition-colors font-semibold"
                            >
                              Remove
                            </button>
                            <button 
                              onClick={() => moveToWishlist(item._id || item.id, item.selectedSize, item.selectedColor)}
                              className="px-3 py-1 border border-blue-300 text-blue-600 text-sm rounded hover:bg-blue-50 transition-colors font-semibold"
                            >
                              Move to Wishlist
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
        
              {/* Order Summary */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total MRP (Inclusive of all taxes)</span>
                    <div className="flex items-center">
                      <span className="font-semibold">₹{calculateGSTInclusiveTotal()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <div className="flex items-center">
                      <span className="font-semibold text-green-600">-₹{calculateGSTInclusiveDiscount()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <div className="flex items-center">
                      <span>₹{calculateGSTInclusiveTotal()}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setCurrentPage('checkout')}
                  className="w-full mt-2 py-3 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          
            {/* Right Sidebar - Recommendations */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">You may also like</h3>
              <div className="space-y-4">
                {productsData.slice(0, 3).map((product) => {
                  const inclusivePrice = calculateGSTInclusivePrice(product.price, product.category);
                  
                  return (
                    <div key={product._id || product.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="flex gap-3">
                        <img 
                          src={product.images?.[0] || '/api/placeholder/400/500'} 
                          alt={product.name} 
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{product.name}</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold">₹{inclusivePrice}</span>
                              <span className="text-xs text-gray-500 ml-1">(Incl. taxes)</span>
                            </div>
                            <button className="text-blue-600 text-sm hover:underline font-semibold">
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Remove Confirmation Modal */}
      {showRemoveModal && itemToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Remove Item</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove "{itemToRemove.name}" from your cart?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => confirmRemove(false)}
                className="flex-1 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors font-semibold"
              >
                Remove
              </button>
              <button 
                onClick={() => confirmRemove(true)}
                className="flex-1 py-2 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors font-semibold"
              >
                Move to Wishlist
              </button>
              <button 
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!hideHeader && <Footer />}
    </div>
  );
};

// Checkout Page Component

export default ShoppingCartPage;