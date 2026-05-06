'use client';

import React, { useState, useRef, useContext } from 'react';
import { Menu, X, Package, Download, CheckCircle2, Truck, Home } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import type { PageName } from '../types';
import Header from './Header';
import Footer from './Footer';

interface OrderTrackingPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const OrderTrackingPage = ({ setCurrentPage, onNavigateToSignup, hideHeader = false }: OrderTrackingPageProps): JSX.Element => {
  const { orders } = React.useContext(CartContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Get most recent order for tracking
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
  
  // Calculate GST breakdown by rate for an order
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
  
  // Calculate GST-inclusive total for an order
  const calculateGSTInclusiveOrderTotal = (items) => {
    return items.reduce((total, item) => {
      const inclusivePrice = calculateGSTInclusivePrice(item.price, item.category);
      return total + (inclusivePrice * item.quantity);
    }, 0);
  };
  
  // Calculate GST-inclusive original total for an order
  const calculateGSTInclusiveOriginalTotal = (items) => {
    return items.reduce((total, item) => {
      const inclusiveOriginalPrice = calculateGSTInclusivePrice(item.originalPrice, item.category);
      return total + (inclusiveOriginalPrice * item.quantity);
    }, 0);
  };
  
  // Calculate GST-inclusive discount for an order
  const calculateGSTInclusiveDiscount = (items) => {
    return calculateGSTInclusiveOriginalTotal(items) - calculateGSTInclusiveOrderTotal(items);
  };
  
  // Calculate credits used for an order
  const calculateCreditsUsed = (order) => {
    if (order.paymentMethod === 'credits') {
      return Math.ceil(order.total / 100); // 1 Credit = ₹100
    }
    return 0;
  };
  
  // Mock tracking stages
  const trackingStages = [
    { 
      name: 'Order Placed', 
      completed: true, 
      date: new Date(latestOrder?.date || Date.now()).toLocaleDateString(),
      icon: <Package size={20} />
    },
    { 
      name: 'Arrived at Courier Warehouse', 
      completed: latestOrder?.status !== 'Processing' ? false : true, 
      date: latestOrder?.status !== 'Processing' ? '' : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      icon: <Home size={20} />
    },
    { 
      name: 'Out for Delivery', 
      completed: latestOrder?.status === 'Completed' ? true : false, 
      date: latestOrder?.status === 'Completed' ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString() : '',
      icon: <Truck size={20} />
    },
    { 
      name: 'Products Delivered', 
      completed: latestOrder?.status === 'Completed' ? true : false, 
      date: latestOrder?.status === 'Completed' ? new Date(latestOrder.deliveryDate).toLocaleDateString() : '',
      icon: <CheckCircle2 size={20} />
    }
  ];
  
  const { gst5, gst18 } = latestOrder ? calculateGSTBreakdown(latestOrder.items) : { gst5: 0, gst18: 0 };
  const creditsUsed = latestOrder ? calculateCreditsUsed(latestOrder) : 0;
  const inclusiveOrderTotal = latestOrder ? calculateGSTInclusiveOrderTotal(latestOrder.items) : 0;
  const inclusiveOriginalTotal = latestOrder ? calculateGSTInclusiveOriginalTotal(latestOrder.items) : 0;
  const inclusiveDiscount = latestOrder ? calculateGSTInclusiveDiscount(latestOrder.items) : 0;
  
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
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Tracking</h2>
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-semibold">
                <Download size={18} />
                Download Invoice
              </button>
            </div>
            
            {/* Order Information Grid */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Information</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="font-semibold">{latestOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Placed Date</p>
                  <p className="font-semibold">
                    {new Date(latestOrder.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Delivered Date</p>
                  <p className="font-semibold">
                    {latestOrder.status === 'Completed' 
                      ? new Date(latestOrder.deliveryDate).toLocaleDateString()
                      : 'Expected in 7 days'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Number of Items</p>
                  <p className="font-semibold">{latestOrder.items.length}</p>
                </div>
              </div>
              
              {latestOrder.paymentMethod === 'credits' && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                    <span className="text-purple-800 font-semibold">
                      Paid with {creditsUsed} Credits
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Order Tracking Section */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Tracking</h2>
              
              <div className="relative">
                <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-gray-300"></div>
                
                <div className="space-y-6">
                  {trackingStages.map((stage, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                        stage.completed ? 'bg-slate-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {stage.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${stage.completed ? 'text-gray-800' : 'text-gray-500'}`}>
                          {stage.name}
                        </h3>
                        {stage.date && (
                          <p className="text-sm text-gray-600">{stage.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Items from Order */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Items from this Order</h2>
              
              <div className="space-y-4">
  {latestOrder.items.map((item, index) => {
    const inclusivePrice = calculateGSTInclusivePrice(item.price, item.category);
    // Calculate credits based on the new formula (price/10)
    const itemCredits = (inclusivePrice / 10).toFixed(2);
    
    return (
      <div key={index} className="flex gap-4 border-b last:border-b-0">
        <img 
          src={item.images?.[0] || '/api/placeholder/400/500'} 
          alt={item.name} 
          className="w-16 h-20 object-cover rounded"
        />
        <div className="flex-1">
              <h3 className="font-semibold text-sm">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.brand}</p>
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
              
              <div className="flex items-center justify-between mt-1 mb-2">
                <div className="flex items-center gap-2">
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
            
            {/* Billing Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Price Details</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total MRP (Inclusive of all taxes)</span>
                  <span className="font-semibold">₹{inclusiveOrderTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-green-600">-₹{inclusiveDiscount}</span>
                </div>
                {latestOrder.paymentMethod === 'credits' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credits Used</span>
                    <span className="font-semibold text-purple-600">{creditsUsed} Credits</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>₹{inclusiveOrderTotal}</span>
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

// Category Page Component with GST-inclusive pricing

export default OrderTrackingPage;
