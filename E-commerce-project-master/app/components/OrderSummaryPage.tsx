'use client';

import React, { useState, useRef, useContext } from 'react';
import { Menu, X, CheckCircle, Package } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import type { PageName } from '../types';
import Header from './Header';
import Footer from './Footer';

interface OrderSummaryPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const OrderSummaryPage = ({ setCurrentPage, onNavigateToSignup, hideHeader = false }: OrderSummaryPageProps): JSX.Element => {
  const { orders } = React.useContext(CartContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Get most recent order
  const latestOrder = orders.length > 0 ? orders[orders.length - 1] : null;
  
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
  
  // Function to calculate GST rate based on product price and category
  const getGSTRate = (price, category) => {
    // For clothing items
    if (category === 'Clothing') {
      // Clothes up to ₹2,500 per piece → 5% GST
      if (price <= 2500) {
        return 0.05; // 5%
      }
      // Clothes above ₹2,500 per piece → 18% GST
      else {
        return 0.18; // 18%
      }
    }
    // For accessories and other items
    else {
      // For accessories like watches and handbags, using 18% GST
      // This can be adjusted based on specific GST rules for accessories
      return 0.18; // 18%
    }
  };
  
  // Calculate GST breakdown by rate for order
  const calculateGSTBreakdown = (items) => {
    const gst5 = items.reduce(
      (total, item) => {
        const gstRate = getGSTRate(item.price, item.category);
        return gstRate === 0.05 ? total + Math.round(item.price * item.quantity * gstRate) : total;
      },
      0
    );
    
    const gst18 = items.reduce(
      (total, item) => {
        const gstRate = getGSTRate(item.price, item.category);
        return gstRate === 0.18 ? total + Math.round(item.price * item.quantity * gstRate) : total;
      },
      0
    );
    
    return { gst5, gst18 };
  };
  
  // Calculate credits used if payment was made with credits
  const calculateCreditsUsed = () => {
    if (latestOrder && latestOrder.paymentMethod === 'credits') {
      return Math.ceil(latestOrder.total / 100); // 1 Credit = ₹100
    }
    return 0;
  };
  
  // Calculate overall GST rate for order
  const getOverallGSTRate = (items) => {
    const hasGST5 = items.some(item => getGSTRate(item.price, item.category) === 0.05);
    const hasGST18 = items.some(item => getGSTRate(item.price, item.category) === 0.18);
    
    if (hasGST5 && hasGST18) {
      return 'Mixed (5% & 18%)';
    } else if (hasGST5) {
      return '5%';
    } else if (hasGST18) {
      return '18%';
    }
    return '0%';
  };
  
  // Calculate GST-inclusive total for order
  const calculateGSTInclusiveOrderTotal = (items) => {
    return items.reduce((total, item) => {
      const inclusivePrice = calculateGSTInclusivePrice(item.price, item.category);
      return total + (inclusivePrice * item.quantity);
    }, 0);
  };
  
  // Calculate GST-inclusive original total for order
  const calculateGSTInclusiveOriginalTotal = (items) => {
    return items.reduce((total, item) => {
      const inclusiveOriginalPrice = calculateGSTInclusivePrice(item.originalPrice, item.category);
      return total + (inclusiveOriginalPrice * item.quantity);
    }, 0);
  };
  
  // Calculate GST-inclusive discount for order
  const calculateGSTInclusiveDiscount = (items) => {
    return calculateGSTInclusiveOriginalTotal(items) - calculateGSTInclusiveOrderTotal(items);
  };
  
  // Function to handle menu clicks
  const handleMenuClick = (option) => {
    setIsMenuOpen(false);
    if (option === 'cart') {
      setCurrentPage('cart');
    } else if (option === 'orderSummary') {
      setCurrentPage('orderSummary');
    } else if (option === 'orderHistory') {
      setCurrentPage('orderHistory');
    } else if (option === 'orderTracking') {
      setCurrentPage('orderTracking');
    }
  };
  
  const { gst5, gst18 } = latestOrder ? calculateGSTBreakdown(latestOrder.items) : { gst5: 0, gst18: 0 };
  const overallGSTRate = latestOrder ? getOverallGSTRate(latestOrder.items) : '0%';
  const inclusiveOrderTotal = latestOrder ? calculateGSTInclusiveOrderTotal(latestOrder.items) : 0;
  const inclusiveOriginalTotal = latestOrder ? calculateGSTInclusiveOriginalTotal(latestOrder.items) : 0;
  const inclusiveDiscount = latestOrder ? calculateGSTInclusiveDiscount(latestOrder.items) : 0;
  
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>
      
      {/* Main Header - without menu and cart icons */}
      {!hideHeader && <Header 
        setCurrentPage={setCurrentPage} 
        setShowAuth={() => {}} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isCompanyDropdownOpen={isCompanyDropdownOpen}
        setIsCompanyDropdownOpen={setIsCompanyDropdownOpen}
        companyDropdownRef={companyDropdownRef}
      />}
      
      {/* Secondary Header with Menu Icon but No Cart Icon */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Menu Icon - Click to Open Menu */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2 rounded-md hover:bg-gray-100 transition-colors mb-6"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
            </div>
            {/* Right side is empty - no cart icon or continue shopping button */}
          </div>
        </div>
      </div>
      
      {/* Menu Dropdown */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsMenuOpen(false)}>
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
      
      <div className="max-w-8xl mx-auto px-4 py-8">
        {latestOrder ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
              <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Order Details */}
              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Order Details</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Delivery Date</p>
                      <p className="font-semibold">
                        {new Date(latestOrder.deliveryDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order ID</p>
                      <p className="font-semibold">{latestOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                      <p className="font-semibold capitalize">
                        {latestOrder.paymentMethod === 'credits' ? `Credits (${calculateCreditsUsed()} credits)` : latestOrder.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                      <p className="font-semibold">
                        {latestOrder.deliveryDetails.address}, {latestOrder.deliveryDetails.city}, {latestOrder.deliveryDetails.state} - {latestOrder.deliveryDetails.zipCode}
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 mb-3">Items in this Order</h3>
                  <div className="space-y-4">
  {latestOrder.items.map((item, index) => {
    const inclusivePrice = calculateGSTInclusivePrice(item.price, item.category);
    // Calculate credits based on the new formula (price/10)
    const itemCredits = (inclusivePrice / 10).toFixed(2);
    
    return (
      <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0 mb-1">
        <img 
          src={item.images?.[0] || '/api/placeholder/400/500'} 
          alt={item.name} 
          className="w-16 h-20 object-cover rounded"
        />
        <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.brand}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800">
                  Size: {item.selectedSize}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800">
                  Color: {item.selectedColor}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800">
                  Qty: {item.quantity}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <div className="flex items-center gap-2 mt-1">
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
              </div>
            </div>
      </div>
    );
  })}
</div>
                </div>
              </div>
              
              {/* Billing Details */}
              <div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Price Details</h2>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total price(Inclusive of all taxes)</span>
                      <span className="font-semibold">₹{inclusiveOrderTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-semibold">FREE</span>
                    </div>
                    {latestOrder.paymentMethod === 'credits' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Credits Used</span>
                        <span className="font-semibold text-purple-600">{calculateCreditsUsed()} Credits</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>₹{inclusiveOrderTotal}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setCurrentPage('orderTracking')}
                      className="flex-1 mt-2 py-3 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
                    >
                      Track Order
                    </button>
                    <button 
                      onClick={() => setCurrentPage('landing')}
                      className="flex-1 mt-2 py-3 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button 
              onClick={() => setCurrentPage('landing')}
              className="px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
      
      {!hideHeader && <Footer />}
    </div>
  );
};

// Order History Page Component

export default OrderSummaryPage;
