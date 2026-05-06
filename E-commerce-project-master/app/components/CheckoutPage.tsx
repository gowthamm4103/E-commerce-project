'use client';

import React, { useState, useRef, useContext, useEffect } from 'react';
import { CreditCard, ArrowLeft, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { referralsAPI, getToken } from '../lib/api';
import { 
  getStoredReferrals, 
  getGuestSessionId, 
  calculateCommission,
  isGuestUser,
  clearReferralData,
  type CommissionData 
} from '../utils/referralUtils';
import type { PageName } from '../types';
import Header from './Header';
import Footer from './Footer';

interface CheckoutPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const CheckoutPage = ({ setCurrentPage, onNavigateToSignup, hideHeader = false }: CheckoutPageProps): JSX.Element => {
  const { cartItems, placeOrder } = useContext(CartContext);
  
  const [deliveryDetails, setDeliveryDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef(null);
  const [userCredits] = useState(50);
  const [activeTab, setActiveTab] = useState('delivery');
  const [showQRCode, setShowQRCode] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const [otherServices, setOtherServices] = useState({
    brandOwnerUsername: '',
    brandOwnerPassword: '',
    orderType: 'instore',
    fulfillmentBy: 'brandOwner'
  });

  // Referral state
  const [referralCommissions, setReferralCommissions] = useState<CommissionData[]>([]);
  const [totalReferralCommission, setTotalReferralCommission] = useState(0);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [referralProcessed, setReferralProcessed] = useState(false);
  
  // Check if user is guest on mount
  useEffect(() => {
    setIsGuest(isGuestUser());
  }, []);

  // Validate referrals when cart changes
  useEffect(() => {
    if (cartItems.length > 0 && isGuest) {
      validateReferrals();
    } else {
      setReferralCommissions([]);
      setTotalReferralCommission(0);
    }
  }, [cartItems, isGuest]);
  
  const validateReferrals = async () => {
    if (!isGuest || cartItems.length === 0) return;
    
    setReferralLoading(true);
    setReferralError(null);
    
    try {
      const guestSessionId = getGuestSessionId();
      const storedReferrals = getStoredReferrals();
      
      if (storedReferrals.length === 0) {
        setReferralCommissions([]);
        setTotalReferralCommission(0);
        return;
      }
      
      const response = await referralsAPI.validate(guestSessionId, cartItems);
      
      if (response.success && response.hasReferral) {
        setReferralCommissions(response.commissions);
        setTotalReferralCommission(response.totalCommission);
      } else if (response.success && !response.hasReferral) {
        setReferralCommissions([]);
        setTotalReferralCommission(0);
      }
    } catch (err) {
      console.error('Error validating referrals:', err);
      // Don't block checkout on referral validation error
    } finally {
      setReferralLoading(false);
    }
  };
  
  // Calculate GST-inclusive price
  const calculateGSTInclusivePrice = (price: number, category: string): number => {
    let gstRate = 0.18;
    if (category === 'Clothing') {
      gstRate = price <= 2500 ? 0.05 : 0.18;
    }
    return Math.round(price * (1 + gstRate));
  };
  
  // Calculate GST-inclusive total
  const calculateGSTInclusiveTotal = (): number => {
    return cartItems.reduce((total, item) => {
      const inclusivePrice = calculateGSTInclusivePrice(item.price, item.category);
      return total + (inclusivePrice * item.quantity);
    }, 0);
  };
  
  // Calculate GST-inclusive original total
  const calculateGSTInclusiveOriginalTotal = (): number => {
    return cartItems.reduce((total, item) => {
      const inclusiveOriginalPrice = calculateGSTInclusivePrice(item.originalPrice, item.category);
      return total + (inclusiveOriginalPrice * item.quantity);
    }, 0);
  };
  
  // Calculate GST-inclusive discount
  const calculateGSTInclusiveDiscount = (): number => {
    return calculateGSTInclusiveOriginalTotal() - calculateGSTInclusiveTotal();
  };
  
  const calculateTotalCredits = () => {
    return Math.ceil(calculateGSTInclusiveTotal() / 100);
  };
  
  const canPayWithCredits = userCredits >= calculateTotalCredits();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  const handleOtherServicesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOtherServices(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayWithServices = () => {
    if (!otherServices.brandOwnerUsername || !otherServices.brandOwnerPassword) {
      alert('Please fill in all brand owner details');
      return;
    }
    setShowQRCode(true);
  };

  const handleScanComplete = () => {
    setShowQRCode(false);
    setShowSuccessPopup(true);
    processOrderAndReferral();
    setTimeout(() => {
      setShowSuccessPopup(false);
      setCurrentPage('orderSummary');
    }, 3000);
  };

  const processOrderAndReferral = async () => {
    const orderId = `ORD${Date.now()}`;
    
    // Process referral commissions if applicable
    if (referralCommissions.length > 0 && isGuest && !referralProcessed) {
      try {
        const guestSessionId = getGuestSessionId();
        const commissionsToProcess = referralCommissions.map(c => ({
          productId: c.productId,
          referrerUserId: c.referrerUserId,
          commissionAmount: c.commissionAmount,
          quantity: c.quantity,
        }));
        
        await referralsAPI.process(orderId, guestSessionId, commissionsToProcess);
        setReferralProcessed(true);
        clearReferralData();
      } catch (err) {
        console.error('Error processing referral commissions:', err);
        // Don't block order placement on referral processing error
      }
    }
    
    placeOrder(deliveryDetails, paymentMethod);
  };

  const handleCompletePurchase = () => {
    // Check if user logged in (referral not allowed)
    if (!isGuestUser() && referralCommissions.length > 0) {
      setReferralError('Referral commissions are only available for guest checkout. Please log out to use referral benefits.');
      return;
    }
    
    if (activeTab === 'delivery') {
      if (!deliveryDetails.firstName || !deliveryDetails.lastName || 
          !deliveryDetails.email || !deliveryDetails.phone || 
          !deliveryDetails.address || !deliveryDetails.city || 
          !deliveryDetails.state || !deliveryDetails.zipCode) {
        alert('Please fill in all delivery details');
        return;
      }
      processOrderAndReferral();
      setCurrentPage('orderSummary');
    } else {
      handlePayWithServices();
    }
  };
  
  // Get referral info for a specific product in cart
  const getReferralForProduct = (productId: string) => {
    return referralCommissions.find(c => c.productId === productId);
  };
  
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
        * {
          font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>
      
      {!hideHeader && <Header 
        setCurrentPage={setCurrentPage} 
        setShowAuth={() => {}} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isCompanyDropdownOpen={isCompanyDropdownOpen}
        setIsCompanyDropdownOpen={setIsCompanyDropdownOpen}
        companyDropdownRef={companyDropdownRef}
      />}
      
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-2 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Checkout</h2>
          </div>
        </div>
      </div>
      
      <div className="max-w-8xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Summary */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Cart Summary</h2>
              
              {/* Referral Commission Banner */}
              {referralCommissions.length > 0 && isGuest && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Gift className="text-green-600 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-800 text-sm">
                        Referral Commission Applied!
                      </h4>
                      <p className="text-xs text-green-700 mt-1">
                        {referralCommissions.length} product{referralCommissions.length > 1 ? 's' : ''} eligible for 5% commission
                      </p>
                      <ul className="text-xs text-green-700 mt-2 space-y-1">
                        {referralCommissions.map((commission, idx) => (
                          <li key={idx}>
                            • {commission.productName} (Qty: {commission.quantity}) → ₹{commission.commissionAmount} commission
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-green-600 mt-2 font-semibold">
                        Total Commission: ₹{totalReferralCommission} (will be credited after 7 days)
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Warning for logged-in users with referrals */}
              {!isGuest && referralCommissions.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-800 text-sm">
                        Logged In - Referral Not Applicable
                      </h4>
                      <p className="text-xs text-yellow-700 mt-1">
                        Referral commissions are only available for guest checkout. 
                        Please log out if you want to earn referral commission.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const inclusivePrice = calculateGSTInclusivePrice(item.price, item.category);
                  const itemCredits = (inclusivePrice / 10).toFixed(2);
                  const referral = getReferralForProduct(item._id || String(item.id));
                  
                  return (
                    <div key={`${item._id || item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 pb-4 border-b">
                      <img 
                        src={item.images?.[0] || '/api/placeholder/400/500'} 
                        alt={item.name} 
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold">₹{inclusivePrice * item.quantity}</span>
                          <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white ml-1">
                            {itemCredits} Credits
                          </span>
                          {referral && isGuest && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle size={12} />
                              +₹{referral.commissionAmount} commission
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total MRP (Inclusive of all taxes)</span>
                  <span className="font-semibold">₹{calculateGSTInclusiveTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-green-600">-₹{calculateGSTInclusiveDiscount()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>₹{calculateGSTInclusiveTotal()}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCompletePurchase}
                className="w-full py-3 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
              >
                Complete Purchase
              </button>
            </div>
            
            {/* Delivery & Service Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Delivery & Service</h2>
              
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('delivery')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'delivery'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Delivery Details
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'services'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Other Services
                </button>
              </div>
              
              {activeTab === 'delivery' ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input 
                        type="text" 
                        name="firstName"
                        value={deliveryDetails.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={deliveryDetails.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={deliveryDetails.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={deliveryDetails.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea 
                      name="address"
                      value={deliveryDetails.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input 
                        type="text" 
                        name="city"
                        value={deliveryDetails.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input 
                        type="text" 
                        name="state"
                        value={deliveryDetails.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                      <input 
                        type="text" 
                        name="zipCode"
                        value={deliveryDetails.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Owner Username</label>
                    <input 
                      type="text" 
                      name="brandOwnerUsername"
                      value={otherServices.brandOwnerUsername}
                      onChange={handleOtherServicesChange}
                      placeholder="Enter username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Owner Password</label>
                    <input 
                      type="password" 
                      name="brandOwnerPassword"
                      value={otherServices.brandOwnerPassword}
                      onChange={handleOtherServicesChange}
                      placeholder="Enter password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                      <span className="text-gray-700">Instore Pickup</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fulfillment By</label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                      <span className="text-gray-700">Brand Owner</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handlePayWithServices}
                    className="w-full py-3 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
                  >
                    Pay Now
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Payment Section */}
          <div className="md:col-span-1">
            {activeTab === 'delivery' ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Method</h2>
                
                <div className="space-y-3 mb-6">
                  <button 
                    onClick={() => handlePaymentMethodChange('card')}
                    className={`w-full flex items-center gap-3 p-3 border rounded-md ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  >
                    <CreditCard size={20} />
                    <span className="font-medium">Card Payment</span>
                  </button>
                  
                  <button 
                    onClick={() => handlePaymentMethodChange('upi')}
                    className={`w-full flex items-center gap-3 p-3 border rounded-md ${paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  >
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">U</div>
                    <span className="font-medium">UPI</span>
                  </button>
                  
                  <button 
                    onClick={() => handlePaymentMethodChange('wallet')}
                    className={`w-full flex items-center gap-3 p-3 border rounded-md ${paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  >
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">W</div>
                    <span className="font-medium">Platform Wallet</span>
                  </button>
                  
                  <button 
                    onClick={() => handlePaymentMethodChange('credits')}
                    className={`w-full flex items-center gap-3 p-3 border rounded-md ${paymentMethod === 'credits' ? 'border-blue-500 bg-blue-50' : canPayWithCredits ? 'border-gray-300' : 'border-gray-200 opacity-50 cursor-not-allowed'}`}
                    disabled={!canPayWithCredits}
                  >
                    <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">C</div>
                    <div className="flex-1 text-left">
                      <span className="font-medium">Credits</span>
                      {!canPayWithCredits && (
                        <p className="text-xs text-red-500">Insufficient credits</p>
                      )}
                    </div>
                  </button>
                </div>
                
                {paymentMethod === 'card' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input 
                          type="text" 
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'upi' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                      <input 
                        type="text" 
                        placeholder="yourname@upi"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'wallet' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Available Balance</label>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800 font-semibold">₹5,000</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'credits' && (
                  <div className="space-y-4 mb-6">
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600 font-medium">Available Credits:</span>
                        <span className="font-semibold text-purple-800">{userCredits}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600 font-medium">Credits Required:</span>
                        <span className="font-semibold text-purple-800">{(calculateGSTInclusiveTotal() / 10).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-medium">Credits Remaining:</span>
                        <span className="font-semibold text-purple-800">{(userCredits - (calculateGSTInclusiveTotal() / 10)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setCurrentPage('cart')}
                    className="flex-1 py-3 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button 
                    onClick={handleCompletePurchase}
                    className="flex-1 py-3 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">QR Code Payment</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    For Other Services, payment is processed through QR code scanning
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
              <h3 className="text-lg font-bold text-white text-center">Scan to Pay</h3>
            </div>
            
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="w-56 h-56 bg-gray-200 border-2 border-gray-300 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <p className="font-semibold">QR Code</p>
                    <p className="text-sm">Amount: ₹{calculateGSTInclusiveTotal()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="font-bold">₹{calculateGSTInclusiveTotal()}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowQRCode(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleScanComplete}
                  className="flex-1 py-3 bg-slate-800 text-white rounded-lg font-semibold"
                >
                  I've Paid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Order Placed Successfully!</h3>
            {referralCommissions.length > 0 && (
              <p className="text-sm text-gray-600 mb-2">
                Referral commission of ₹{totalReferralCommission} will be credited after 7 days.
              </p>
            )}
            <p className="text-gray-600">Your order has been placed successfully.</p>
          </div>
        </div>
      )}
      
      {!hideHeader && <Footer />}
    </div>
  );
};

export default CheckoutPage;