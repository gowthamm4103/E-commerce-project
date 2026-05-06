'use client';

import React, { useState, useRef, useContext } from 'react';
import { Menu, X, Package } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import type { PageName } from '../types';
import Header from './Header';
import Footer from './Footer';

interface OrderHistoryPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const OrderHistoryPage = ({ setCurrentPage, onNavigateToSignup, hideHeader = false }: OrderHistoryPageProps): JSX.Element => {
  const { orders } = React.useContext(CartContext);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
  
  // Calculate GST-inclusive total for an order
  const calculateGSTInclusiveOrderTotal = (items) => {
    return items.reduce((total, item) => {
      const inclusivePrice = calculateGSTInclusivePrice(item.price, item.category);
      return total + (inclusivePrice * item.quantity);
    }, 0);
  };
  
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-700 bg-green-100 border border-green-200';
      case 'processing': return 'text-blue-700 bg-blue-100 border border-blue-200';
      case 'cancelled': return 'text-red-700 bg-red-100 border border-red-200';
      default: return 'text-gray-700 bg-gray-100 border border-gray-200';
    }
  };
  
  const calculateCreditsUsed = (order) => {
    if (order.paymentMethod === 'credits') {
      return Math.ceil(order.total / 100);
    }
    return 0;
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
  
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
        * { font-family: 'Assistant', sans-serif; }
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
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order History</h2>
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
      
      {/* Full width container */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-gray-200">
            
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-base font-medium text-gray-700 cursor-pointer outline-none"
            >
              <option value="all">All Orders</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table Header for visual clarity on Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white-100 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-t-lg mb-0">
          <div className="col-span-5 text-left">Product Details</div>
          <div className="col-span-2 text-center">Order Date</div>
          <div className="col-span-3 text-center">Status</div>
          <div className="col-span-2 text-right">Total Amount</div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
            <Package size={80} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
              {filter === 'all' 
                ? "You haven't placed any orders yet. Start exploring our collection." 
                : `You don't have any ${filter} orders.`}
            </p>
            <button 
              onClick={() => setCurrentPage('landing')}
              className="px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredOrders.map((order) => {
              const creditsUsed = calculateCreditsUsed(order);
              const totalCredits = order.items.reduce((sum, item) => sum + (item.credits * item.quantity), 0);
              const inclusiveOrderTotal = calculateGSTInclusiveOrderTotal(order.items);
              
              return (
                <div key={order.id} className="bg-white border-b md:border border-gray-200 hover:bg-gray-10 transition-colors group">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 md:px-6 py-4">
                    
                    {/* 1. Left Column: Product Details (Text Left) */}
                    <div className="md:col-span-5 flex items-center gap-4 text-left">
                      <img 
                        src={order.items?.[0]?.images?.[0] || '/api/placeholder/400/500'} 
                        alt={order.items?.[0]?.name || 'Product'} 
                        className="w-16 h-16 object-cover rounded border border-gray-200 bg-gray-100"
                      />
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{order.items?.[0]?.name || 'Product'}</h3>
                        {/* Horizontal Text for ID */}
                        <p className="text-sm text-gray-500 font-medium">
                          Order ID: <span className="text-gray-400">{order.id}</span>
                        </p>
                        {order.items.length > 1 && (
                          <p className="text-xs text-blue-600 mt-0.5">+{order.items.length - 1} more items</p>
                        )}
                      </div>
                    </div>

                    {/* 2. Center Column 1: Date (Text Center) */}
                    <div className="md:col-span-2 flex md:block justify-between items-center text-center">
                       <p className="text-xs text-gray-400 font-bold uppercase md:hidden">Date</p>
                       <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                        {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {/* 3. Center Column 2: Status (Text Center) */}
                    <div className="md:col-span-3 flex md:block justify-between items-center text-center">
                       <p className="text-xs text-gray-400 font-bold uppercase md:hidden">Status</p>
                       <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* 4. Right Column: Amount (Text Right) */}
                    <div className="md:col-span-2 flex md:block justify-between items-center md:items-end text-right flex-col md:flex-row gap-2">
                       <div>
                          <p className="text-sm font-bold text-gray-900 text-lg">₹{inclusiveOrderTotal}</p>
                          {/*<p className="text-xs text-gray-500">({totalCredits} Credits)</p>*/}
                          <p className="text-xs text-gray-500">(Incl. taxes)</p>
                          {creditsUsed > 0 && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">
                              Paid with Credits
                            </span>
                          )}
                       </div>
                       
                       <button 
                          onClick={() => setCurrentPage('orderTracking')}
                          className="md:opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap"
                        >
                          View Details &rarr;
                        </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {!hideHeader && <Footer />}
    </div>
  );
};

// Order Tracking Page Component

export default OrderHistoryPage;
