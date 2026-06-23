'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Wallet, Award, ChevronDown, ChevronRight, Check, Copy, X, Plus, LayoutDashboard, CreditCard, DollarSign, FileText, Banknote, Store } from 'lucide-react';
import Header from './Header';
import Sidebar, { SidebarItem } from './Sidebar';
import { useSidebar } from '../context/SidebarContext';
import { walletAPI, mlmAPI, authAPI, setAuthErrorHandler, clearAuthErrorHandler, getToken } from '../lib/api';
import type { PageName, UserData } from '../types';
import CategoryPage from './CategoryPage';
import ShoppingCartPage from './ShoppingCartPage';
import WishlistPage from './WishlistPage';
import CheckoutPage from './CheckoutPage';
import OrderSummaryPage from './OrderSummaryPage';
import OrderHistoryPage from './OrderHistoryPage';
import OrderTrackingPage from './OrderTrackingPage';
import LandingPage from './LandingPage';
import ManageCustomerPortal from './ManageCustomerPortal';
import AboutUsPage from './AboutUsPage';
import NewsPage from './NewsPage';
import EntrepreneursPage from './EntrepreneursPage';
import BrandOwnersPage from './BrandOwnersPage';
import FoundersPage from './FoundersPage';
import DocumentsPage from './DocumentsPage';
import BankingsPage from './BankingsPage';
import LegalsPage from './LegalsPage';
import ServicesPage from './ServicesPage';
import ContactUsPage from './ContactUsPage';

interface CustomerDashboardProps {
  user: UserData;
  onLogout: () => void;
  onNavigateToSignup?: () => void;
  setCurrentPage?: (page: PageName) => void;  // used by Header for nav links, cart, wishlist
  currentPage?: PageName;                      // controls which page body renders
}

const CustomerDashboard = ({ user, onLogout, onNavigateToSignup, setCurrentPage: setCurrentPageProp, currentPage: currentPageProp }: CustomerDashboardProps) => {
  // Internal page state - use prop if provided, otherwise manage locally
  const [internalPage, setInternalPage] = useState<PageName>('customerDashboard');
  const currentPage = currentPageProp || internalPage;
  const setCurrentPage = setCurrentPageProp || setInternalPage;

  // Portal management state
  const [showPortalManagement, setShowPortalManagement] = useState(false);
  const [hasPortal, setHasPortal] = useState(false);
  const [portalRefreshKey, setPortalRefreshKey] = useState(0); // Used to trigger portal status refresh

  const [activeTab, setActiveTab] = useState('profile');
  const { isOpen: isSidebarOpen, isCollapsed: isSidebarCollapsed, setIsOpen: setIsSidebarOpen, setIsCollapsed: setIsSidebarCollapsed } = useSidebar();
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [kycData, setKycData] = useState<{pan: string; aadhaar: string; address: string; panPhoto: string | ArrayBuffer | null; aadhaarPhoto: string | ArrayBuffer | null}>({
    pan: '',
    aadhaar: '',
    address: '',
    panPhoto: null,
    aadhaarPhoto: null
  });
  const [bankData, setBankData] = useState<{accountNumber: string; ifsc: string; bankName: string; accountHolder: string; passbookPhoto: string | ArrayBuffer | null}>({
    accountNumber: '',
    ifsc: '',
    bankName: '',
    accountHolder: '',
    passbookPhoto: null
  });
  const [franchiseA, setFranchiseA] = useState<any>(null);
  const [franchiseB, setFranchiseB] = useState<any>(null);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  
  // E-Wallet related states
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  
  // Income Wallet related states
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [showWithdrawalConfirmation, setShowWithdrawalConfirmation] = useState(false);
  const [currentWithdrawal, setCurrentWithdrawal] = useState<any>(null);
  
  // Credit Wallet related states
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [showCreditDetails, setShowCreditDetails] = useState(false);
  
  const companyDropdownRef = React.useRef(null);
  
  // Get user data from API
  const [userData, setUserData] = useState<any>(null);
  
  // Generate referral link
  const referralLink = `${window.location.origin}?ref=${user.userId}`;
  
  // Financial data - in a real app, this would come from an API
  const [financialData, setFinancialData] = useState({
    directIncome: 0,
    indirectIncome: 0,
    incomeWallet: 0,
    eWallet: 0,  // Explicitly starting with 0
    creditWallet: 0,  // New credit wallet
    franchiseAPurchaseValue: 0,
    franchiseBPurchaseValue: 0,
    franchiseATurnover: 0,  // Track turnover for Franchise A
    franchiseBTurnover: 0   // Track turnover for Franchise B
  });
  
  // Calculate Reward Credits based on turnover
  const calculateRewardCredits = (turnover) => {
    let credits = 0;
    let remainingTurnover = turnover;
    
    // First slab: ₹0 to ₹200,000 = 10 credits
    if (remainingTurnover > 0) {
      const firstSlab = Math.min(remainingTurnover, 200000);
      if (firstSlab >= 200000) {
        credits += 10;
        remainingTurnover -= 200000;
      } else {
        return 0; // Not enough for first slab
      }
    }
    
    // Second slab: ₹200,001 to ₹700,000 = 15 credits
    if (remainingTurnover > 0) {
      const secondSlab = Math.min(remainingTurnover, 500000);
      if (secondSlab >= 500000) {
        credits += 15;
        remainingTurnover -= 500000;
      } else {
        return credits; // Return credits earned so far
      }
    }
    
    // Third slab: ₹700,001 to ₹1,700,000 = 20 credits
    if (remainingTurnover > 0) {
      const thirdSlab = Math.min(remainingTurnover, 1000000);
      if (thirdSlab >= 1000000) {
        credits += 20;
        remainingTurnover -= 1000000;
      } else {
        return credits; // Return credits earned so far
      }
    }
    
    // Fourth slab: Every additional ₹2,000,000 = 25 credits
    if (remainingTurnover > 0) {
      const fourthSlabCredits = Math.floor(remainingTurnover / 2000000) * 25;
      credits += fourthSlabCredits;
    }
    
    return credits;
  };
  
  // Calculate tax based on Indian tax rules
  const calculateTax = (amount) => {
    if (amount <= 10000) {
      return 0;
    } else if (amount > 10000 && amount <= 50000) {
      return amount * 0.05; // 5% tax
    } else if (amount > 50000 && amount <= 100000) {
      return amount * 0.10; // 10% tax
    } else {
      return amount * 0.15; // 15% tax
    }
  };
  
  // Handle withdrawal request
  const handleWithdrawalRequest = () => {
    const amount = parseFloat(withdrawalAmount);
    if (amount > 0 && amount <= financialData.incomeWallet) {
      const tax = calculateTax(amount);
      const creditedAmount = amount - tax;
      
      // Create withdrawal record
      const withdrawal = {
        id: 'WDR' + Math.floor(Math.random() * 1000000),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        amount: amount,
        tax: tax,
        creditedAmount: creditedAmount,
        status: 'Processing',
        expectedCreditDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 3 days from now
        expectedCreditTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleTimeString()
      };
      
      // Update withdrawal history
      setWithdrawalHistory([withdrawal, ...withdrawalHistory]);
      
      // Update income wallet balance
      setFinancialData(prev => ({
        ...prev,
        incomeWallet: prev.incomeWallet - amount
      }));
      
      // Update income wallet via API
      walletAPI.withdrawFromIncome(amount).catch(() => {});
      
      // Set current withdrawal for confirmation
      setCurrentWithdrawal(withdrawal);
      
      // Show confirmation screen
      setShowWithdrawalConfirmation(true);
      
      // Reset withdrawal amount
      setWithdrawalAmount('');
    }
  };
  
  // Handle withdrawal amount change
  const handleWithdrawalAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseFloat(value) > 0 && parseFloat(value) <= financialData.incomeWallet)) {
      setWithdrawalAmount(value);
    }
  };
  
  // Get expected credit timeline
  const getExpectedCreditTimeline = () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) return null;
    
    const expectedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    return {
      day: expectedDate.toLocaleDateString('en-US', { weekday: 'long' }),
      date: expectedDate.toLocaleDateString(),
      time: expectedDate.toLocaleTimeString()
    };
  };
  
  // Load portal status
  React.useEffect(() => {
    const loadPortalStatus = async () => {
      // Check if token exists before making API calls
      const token = getToken();
      if (!token) {
        console.warn('No authentication token found. Portal status unavailable.');
        setHasPortal(false);
        return;
      }

      try {
        const { portalsAPI } = await import('../lib/api');
        const res = await portalsAPI.getMyPortals();
        console.log('Portal status check:', res);
        if (res.success && res.portals && res.portals.length > 0) {
          setHasPortal(true);
        } else {
          setHasPortal(false);
        }
      } catch (err) {
        console.error('Failed to load portal status:', err);
        // If API fails, assume no portal
        setHasPortal(false);
      }
    };
    loadPortalStatus();
  }, [user.userId, portalRefreshKey]);

  // Set up auth error handler
  React.useEffect(() => {
    const handleAuthError = () => {
      console.error('Authentication failed. Please login again.');
      // Optionally redirect to login or show a message
      if (onLogout) {
        onLogout();
      }
    };
    
    setAuthErrorHandler(handleAuthError);
    
    return () => {
      clearAuthErrorHandler();
    };
  }, [onLogout]);

  // Load data when component mounts
  React.useEffect(() => {
    const loadData = async () => {
      // Check if token exists before making API calls
      const token = getToken();
      if (!token) {
        console.warn('No authentication token found. Some features may be unavailable.');
        return;
      }

      try {
        // Load user data from API
        const userRes = await mlmAPI.getUserById(user?.userId || '');
        if (userRes.user) {
          setUserData(userRes.user);
          const ud = userRes.user;
          
          // Load KYC and bank data if available
          if (ud.kycVerified) {
            setKycData({
              pan: 'XXXXXX1234',
              aadhaar: 'XXXXXX5678',
              address: '123 Main Street, City, State',
              panPhoto: ud.kycData?.panPhoto || null,
              aadhaarPhoto: ud.kycData?.aadhaarPhoto || null
            });
          }
          
          if (ud.bankAccount) {
            setBankData({
              ...ud.bankAccount,
              passbookPhoto: ud.bankAccount.passbookPhoto || null
            });
          }
        }
        
        // Load franchise data
        const [franchiseARes, franchiseBRes] = await Promise.all([
          mlmAPI.getFranchise('A'),
          mlmAPI.getFranchise('B'),
        ]);
        setFranchiseA(franchiseARes.franchise);
        setFranchiseB(franchiseBRes.franchise);
        
        // Load hierarchy data
        const hierarchyRes = await mlmAPI.getHierarchy(user.userId);
        setHierarchy(hierarchyRes.hierarchy);
        
        // Load financial data
        const finRes = await walletAPI.getFinancialData();
        if (finRes.financialData) {
          const data = finRes.financialData;
          setFinancialData({
            directIncome: data.directIncome || 0,
            indirectIncome: data.indirectIncome || 0,
            incomeWallet: data.incomeWallet || 0,
            eWallet: data.eWallet || 0,
            creditWallet: data.creditWallet || 0,
            franchiseAPurchaseValue: data.franchiseAPurchaseValue || 0,
            franchiseBPurchaseValue: data.franchiseBPurchaseValue || 0,
            franchiseATurnover: data.franchiseATurnover || 0,
            franchiseBTurnover: data.franchiseBTurnover || 0
          });
        }
        
        // Load credit history
        const creditRes = await walletAPI.getCreditHistory();
        setCreditHistory(creditRes.creditHistory || []);
        
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    
    loadData();
  }, [user.userId]);
  
  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleKYCSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateKYC(kycData);
      alert('KYC verification submitted successfully!');
      // Reload hierarchy
      const hierarchyRes = await mlmAPI.getHierarchy(user.userId);
      setHierarchy(hierarchyRes.hierarchy);
    } catch {
      alert('Error submitting KYC verification');
    }
  };
  
  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateBankAccount(bankData);
      alert('Bank account added successfully!');
      // Reload hierarchy
      const hierarchyRes = await mlmAPI.getHierarchy(user.userId);
      setHierarchy(hierarchyRes.hierarchy);
    } catch {
      alert('Error adding bank account');
    }
  };
  
  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fileType === 'panPhoto') {
          setKycData({...kycData, panPhoto: reader.result});
        } else if (fileType === 'aadhaarPhoto') {
          setKycData({...kycData, aadhaarPhoto: reader.result});
        } else if (fileType === 'passbookPhoto') {
          setBankData({...bankData, passbookPhoto: reader.result});
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const toggleNodeExpansion = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleSwitchToPortal = () => {
    setShowPortalManagement(true);
  };
  
  // E-Wallet functions
  const handleAddMoney = () => {
    if (Number(paymentAmount) >= 10 && Number(paymentAmount) <= 50000) {
      setShowPaymentGateway(true);
    } else {
      alert('Please enter an amount between ₹10 and ₹50,000');
    }
  };
  
  const processPayment = () => {
    // In a real app, this would integrate with a payment gateway
    // For demo purposes, we'll simulate a successful payment
    setTimeout(() => {
      const newTransactionId = 'TXN' + Math.floor(Math.random() * 1000000);
      setTransactionId(newTransactionId);
      
      // Update the eWallet balance
      setFinancialData(prev => ({
        ...prev,
        eWallet: prev.eWallet + parseFloat(paymentAmount)
      }));
      
      // Update eWallet via API
      walletAPI.addToEWallet(parseFloat(paymentAmount), paymentMethod).catch(() => {});
      
      // Show success message
      setShowPaymentGateway(false);
      setPaymentSuccess(true);
      setPaymentAmount('');
      
      // Hide success message after 5 seconds
      setTimeout(() => setPaymentSuccess(false), 5000);
    }, 2000);
  };
  
  const renderPaymentGateway = () => {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Complete Payment</h3>
            <button 
              onClick={() => setShowPaymentGateway(false)}
              className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Amount to Pay</div>
            <div className="text-2xl font-bold">₹{paymentAmount}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Payment Method</div>
            <div className="bg-gray-100 p-3 rounded-md">
              <div className="flex items-center">
                {paymentMethod === 'upi' && <div className=" mr-3"></div>}
                {paymentMethod === 'card' && <div className=" mr-3"></div>}
                {paymentMethod === 'netbanking' && <div className=" mr-3"></div>}
                <div className="font-medium capitalize">{paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking'}</div>
              </div>
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-yellow-50 rounded-md">
            <div className="text-sm text-yellow-800">
              This is a demo payment gateway. In a real application, this would connect to an actual payment service provider.
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowPaymentGateway(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              onClick={processPayment}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderAddMoneyModal = () => {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add Money to E-Wallet</h3>
            <button 
              onClick={() => setShowAddMoneyModal(false)}
              className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter Amount (₹)</label>
            <input 
              type="number" 
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount between ₹10 to ₹50,000"
              min="10"
              max="50000"
            />
            <div className="text-xs text-gray-500 mt-1">Minimum: ₹10, Maximum: ₹50,000</div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Method</label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="mr-3"
                />
                <div>UPI</div>
              </label>
              <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mr-3"
                />
                <div>Credit/Debit Card</div>
              </label>
              <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="netbanking"
                  checked={paymentMethod === 'netbanking'}
                  onChange={() => setPaymentMethod('netbanking')}
                  className="mr-3"
                />
                <div>Net Banking</div>
              </label>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowAddMoneyModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddMoney}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Money
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderHierarchyNode = (node, level = 0) => {
    const isExpanded = expandedNodes[node.id] || false;
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className="ml-4">
        <div className="flex items-center mb-2">
          <div className="flex items-center p-2 border rounded-lg bg-white shadow-sm">
            {hasChildren && (
              <button 
                onClick={() => toggleNodeExpansion(node.id)}
                className="mr-2 text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            <div>
              <div className="font-medium">{node.name}</div>
              <div className="text-sm text-gray-500">ID: {node.id}</div>
              <div className="text-xs">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  node.kycVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {node.kycVerified ? 'KYC Verified' : 'KYC Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-4 border-l-2 border-gray-200 pl-4">
            {node.children.map(child => renderHierarchyNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            
            {/* Financial Overview */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">Total Payout</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{financialData.directIncome + financialData.indirectIncome}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Direct: ₹{financialData.directIncome} | Indirect: ₹{financialData.indirectIncome}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">Income Wallet</div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{financialData.incomeWallet}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Available for withdrawal</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">E-Wallet</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{financialData.eWallet}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Available for purchases</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">Credit Wallet</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{financialData.creditWallet}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Reward Credits earned</div>
                </div>
              </div>
            </div>
            
            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userData?.kycVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {userData?.kycVerified ? 'Verified' : 'Not Verified'}
                  </span>
                  {!userData?.kycVerified && (
                    <button 
                      onClick={() => setActiveTab('kyc')}
                      className="ml-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Verify Now
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userData?.bankAccount 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {userData?.bankAccount ? 'Added' : 'Not Added'}
                  </span>
                  {!userData?.bankAccount && (
                    <button 
                      onClick={() => setActiveTab('bank')}
                      className="ml-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Add Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'ewallet':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">E-Wallet</h2>
            
            {/* Success Message */}
            {paymentSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <Check className="text-green-600 mr-2" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
                    <p className="text-green-700">₹{paymentAmount} has been added to your E-Wallet.</p>
                    <p className="text-green-700 text-sm">Transaction ID: {transactionId}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Wallet Balance Card - Changed to blue theme like financial overview */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Available Balance</div>
                    <div className="text-3xl font-bold text-blue-600">₹{financialData.eWallet}</div>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <Wallet size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add Money Button - Changed to blue theme */}
            <button 
              onClick={() => setShowAddMoneyModal(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
            >
              <Plus size={20} className="mr-2" />
              Add Money
            </button>
            
            {/* Transaction History */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentSuccess ? (
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date().toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transactionId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Wallet Top-up
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          +₹{paymentAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Success
                          </span>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'incomewallet':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Income Wallet</h2>
            
            {/* Withdrawal Confirmation Modal */}
            {showWithdrawalConfirmation && currentWithdrawal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Withdrawal Request Initiated</h3>
                    <button 
                      onClick={() => setShowWithdrawalConfirmation(false)}
                      className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="mb-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Check className="text-green-600 mr-2" size={24} />
                      <h3 className="text-lg font-semibold text-green-800">Request Successful!</h3>
                    </div>
                    <p className="text-green-700">Your withdrawal request has been initiated successfully.</p>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Request ID:</span>
                      <span className="font-medium">{currentWithdrawal.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Withdrawal Amount:</span>
                      <span className="font-medium">₹{currentWithdrawal.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Deducted:</span>
                      <span className="font-medium">₹{currentWithdrawal.tax}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credited Amount:</span>
                      <span className="font-medium text-green-600">₹{currentWithdrawal.creditedAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Credit Date:</span>
                      <span className="font-medium">{currentWithdrawal.expectedCreditDate}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-md mb-4">
                    <p className="text-sm text-yellow-800">
                      The amount will be credited to your bank account within 3 business days.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setShowWithdrawalConfirmation(false)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
            
            {/* Wallet Balance Card */}
            <div className="mb-8 p-4 bg-green-50 rounded-lg">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Available Balance</div>
                    <div className="text-3xl font-bold text-green-600">₹{financialData.incomeWallet}</div>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <Wallet size={24} className="text-green-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Withdrawal Form */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Request Withdrawal</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter Amount (₹)</label>
                <input 
                  type="number" 
                  value={withdrawalAmount}
                  onChange={handleWithdrawalAmountChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount to withdraw"
                  min="1"
                  max={financialData.incomeWallet}
                />
                {withdrawalAmount && parseFloat(withdrawalAmount) > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Tax: ₹{calculateTax(parseFloat(withdrawalAmount))} | 
                    Credited Amount: ₹{(parseFloat(withdrawalAmount) - calculateTax(parseFloat(withdrawalAmount))).toFixed(2)}
                  </div>
                )}
              </div>
              
              {/* Expected Credit Timeline */}
              {withdrawalAmount && parseFloat(withdrawalAmount) > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Expected Credit Timeline:</p>
                    <p>{getExpectedCreditTimeline()?.day}, {getExpectedCreditTimeline()?.date} at {getExpectedCreditTimeline()?.time}</p>
                  </div>
                </div>
              )}
              
              <button 
                onClick={handleWithdrawalRequest}
                disabled={!withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || parseFloat(withdrawalAmount) > financialData.incomeWallet}
                className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  withdrawalAmount && parseFloat(withdrawalAmount) > 0 && parseFloat(withdrawalAmount) <= financialData.incomeWallet
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Proceed with Withdrawal
              </button>
            </div>
            
            {/* Transaction History */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Withdrawal History</h3>
              {withdrawalHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Request ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tax Deducted
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credited Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {withdrawalHistory.map((withdrawal) => (
                        <tr key={withdrawal.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {withdrawal.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {withdrawal.date} {withdrawal.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{withdrawal.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{withdrawal.tax}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            ₹{withdrawal.creditedAmount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              withdrawal.status === 'Completed' 
                                ? 'bg-green-100 text-green-800' 
                                : withdrawal.status === 'Processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {withdrawal.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-center text-gray-500">No withdrawal history found</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'creditwallet':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Credit Wallet</h2>
            
            {/* Credit Wallet Balance Card */}
            <div className="mb-8 p-4 bg-purple-50 rounded-lg">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Available Credits</div>
                    <div className="text-3xl font-bold text-purple-600">{financialData.creditWallet}</div>
                    <div className="text-xs text-gray-500 mt-1">Reward Credits earned from franchise performance</div>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <Award size={24} className="text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Franchise Performance */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Franchise A (Left Side)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Turnover:</span>
                    <span className="font-medium">₹{financialData.franchiseATurnover.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credits Earned:</span>
                    <span className="font-medium">{calculateRewardCredits(financialData.franchiseATurnover)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Threshold:</span>
                    <span className="font-medium">
                      {financialData.franchiseATurnover < 200000 
                        ? `₹${(200000 - financialData.franchiseATurnover).toLocaleString()} to reach 10 credits`
                        : financialData.franchiseATurnover < 700000
                        ? `₹${(700000 - financialData.franchiseATurnover).toLocaleString()} to reach 25 credits`
                        : financialData.franchiseATurnover < 1700000
                        ? `₹${(1700000 - financialData.franchiseATurnover).toLocaleString()} to reach 45 credits`
                        : `₹${(Math.ceil(financialData.franchiseATurnover / 2000000) * 2000000 - financialData.franchiseATurnover).toLocaleString()} to reach next level`
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Franchise B (Right Side)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Turnover:</span>
                    <span className="font-medium">₹{financialData.franchiseBTurnover.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credits Earned:</span>
                    <span className="font-medium">{calculateRewardCredits(financialData.franchiseBTurnover)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Threshold:</span>
                    <span className="font-medium">
                      {financialData.franchiseBTurnover < 200000 
                        ? `₹${(200000 - financialData.franchiseBTurnover).toLocaleString()} to reach 10 credits`
                        : financialData.franchiseBTurnover < 700000
                        ? `₹${(700000 - financialData.franchiseBTurnover).toLocaleString()} to reach 25 credits`
                        : financialData.franchiseBTurnover < 1700000
                        ? `₹${(1700000 - financialData.franchiseBTurnover).toLocaleString()} to reach 45 credits`
                        : `₹${(Math.ceil(financialData.franchiseBTurnover / 2000000) * 2000000 - financialData.franchiseBTurnover).toLocaleString()} to reach next level`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            
            {/* Credit History */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Credit History</h3>
                <button 
                  onClick={() => setShowCreditDetails(!showCreditDetails)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showCreditDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {creditHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Franchise
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Turnover
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credits Earned
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Credits
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {creditHistory.map((credit, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {credit.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {credit.franchise}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{credit.turnover.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                            +{credit.creditsEarned}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                            {credit.totalCredits}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-center text-gray-500">No credit history found</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'kyc':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">KYC Verification</h2>
            {userData?.kycVerified ? (
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center">
                  <Check className="text-green-600 mr-2" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">KYC Verified</h3>
                    <p className="text-green-700">Your KYC has been successfully verified.</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleKYCSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                    <input 
                      type="text" 
                      value={kycData.pan}
                      onChange={(e) => setKycData({...kycData, pan: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your PAN number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card Photo</label>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="file" 
                        id="pan-photo"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'panPhoto')}
                        className="hidden"
                      />
                      <label 
                        htmlFor="pan-photo"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer"
                      >
                        Choose File
                      </label>
                      {kycData.panPhoto && (
                        <div className="flex items-center">
                          <span className="text-sm text-green-600">Photo uploaded</span>
                          <button 
                            type="button"
                            onClick={() => setKycData({...kycData, panPhoto: null})}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
                    <input 
                      type="text" 
                      value={kycData.aadhaar}
                      onChange={(e) => setKycData({...kycData, aadhaar: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your Aadhaar number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card Photo</label>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="file" 
                        id="aadhaar-photo"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'aadhaarPhoto')}
                        className="hidden"
                      />
                      <label 
                        htmlFor="aadhaar-photo"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer"
                      >
                        Choose File
                      </label>
                      {kycData.aadhaarPhoto && (
                        <div className="flex items-center">
                          <span className="text-sm text-green-600">Photo uploaded</span>
                          <button 
                            type="button"
                            onClick={() => setKycData({...kycData, aadhaarPhoto: null})}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea 
                      value={kycData.address}
                      onChange={(e) => setKycData({...kycData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter your address"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="kyc-terms"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      required
                    />
                    <label htmlFor="kyc-terms" className="ml-2 text-sm text-gray-700">
                      I agree to the terms and conditions for KYC verification
                    </label>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Submit KYC Verification
                  </button>
                </div>
              </form>
            )}
          </div>
        );
        
      case 'bank':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Bank Account</h2>
            {userData?.bankAccount ? (
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center">
                  <Check className="text-green-600 mr-2" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Bank Account Added</h3>
                    <p className="text-green-700">Your bank account has been successfully added.</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Account Number:</span>
                    <p className="font-medium">XXXXXX{userData.bankAccount.accountNumber.slice(-4)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">IFSC Code:</span>
                    <p className="font-medium">{userData.bankAccount.ifsc}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Bank Name:</span>
                    <p className="font-medium">{userData.bankAccount.bankName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Account Holder:</span>
                    <p className="font-medium">{userData.bankAccount.accountHolder}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBankSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                    <input 
                      type="text" 
                      value={bankData.accountNumber}
                      onChange={(e) => setBankData({...bankData, accountNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your account number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                    <input 
                      type="text" 
                      value={bankData.ifsc}
                      onChange={(e) => setBankData({...bankData, ifsc: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your IFSC code"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                    <input 
                      type="text" 
                      value={bankData.bankName}
                      onChange={(e) => setBankData({...bankData, bankName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your bank name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                    <input 
                      type="text" 
                      value={bankData.accountHolder}
                      onChange={(e) => setBankData({...bankData, accountHolder: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter account holder name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Passbook Photo</label>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="file" 
                        id="passbook-photo"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'passbookPhoto')}
                        className="hidden"
                      />
                      <label 
                        htmlFor="passbook-photo"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer"
                      >
                        Choose File
                      </label>
                      {bankData.passbookPhoto && (
                        <div className="flex items-center">
                          <span className="text-sm text-green-600">Photo uploaded</span>
                          <button 
                            type="button"
                            onClick={() => setBankData({...bankData, passbookPhoto: null})}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="bank-terms"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      required
                    />
                    <label htmlFor="bank-terms" className="ml-2 text-sm text-gray-700">
                      I agree to the terms and conditions for adding bank account
                    </label>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add Bank Account
                  </button>
                </div>
              </form>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  // If portal management is active, render it instead of dashboard
  if (showPortalManagement) {
    return (
      <ManageCustomerPortal
        user={user}
        onLogout={onLogout}
        onSwitchToDashboard={() => {
          setShowPortalManagement(false);
          setPortalRefreshKey(prev => prev + 1); // Trigger portal status refresh
        }}
        onNavigateToTab={(tab: string) => {
          setShowPortalManagement(false);
          setPortalRefreshKey(prev => prev + 1); // Trigger portal status refresh
          setActiveTab(tab);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen ${currentPage === 'landing' ? 'bg-white' : 'bg-gray-50'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>
      
      <Header 
        user={user}
        onLogout={onLogout}
        onProfileClick={() => setShowProfileModal(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isCompanyDropdownOpen={isCompanyDropdownOpen}
        setIsCompanyDropdownOpen={setIsCompanyDropdownOpen}
        companyDropdownRef={companyDropdownRef}
        setCurrentPage={setCurrentPage || (() => {})}
        setShowAuth={() => {}}
        showSecondaryHeader={false}
        secondaryTitle=""
        onMenuClick={() => {}}
        onPortalClick={handleSwitchToPortal}
        currentPage={currentPage}
        hasPortal={hasPortal}
      />

      {/* Sidebar and Main Content Layout */}
      <div className="flex">
        {/* Sidebar - Only show on actual dashboard pages, not on shopping pages */}
        {(currentPage === 'customerDashboard' || currentPage === 'founderDashboard' || !currentPage) && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onClose={() => setIsSidebarOpen(false)}
            items={[
              {
                id: 'profile',
                icon: <LayoutDashboard size={20} />,
                label: 'Dashboard',
                onClick: () => setActiveTab('profile'),
                isActive: activeTab === 'profile'
              },
              {
                id: 'ewallet',
                icon: <CreditCard size={20} />,
                label: 'E-Wallet',
                onClick: () => setActiveTab('ewallet'),
                isActive: activeTab === 'ewallet'
              },
              {
                id: 'incomewallet',
                icon: <DollarSign size={20} />,
                label: 'Income Wallet',
                onClick: () => setActiveTab('incomewallet'),
                isActive: activeTab === 'incomewallet'
              },
              {
                id: 'kyc',
                icon: <FileText size={20} />,
                label: 'KYC Verification',
                onClick: () => setActiveTab('kyc'),
                isActive: activeTab === 'kyc'
              },
              {
                id: 'bank',
                icon: <Banknote size={20} />,
                label: 'Add Bank Account',
                onClick: () => setActiveTab('bank'),
                isActive: activeTab === 'bank'
              },
              ...(hasPortal ? [{
                id: 'portal',
                icon: <Store size={20} />,
                label: 'Manage Customer Portal',
                onClick: () => handleSwitchToPortal(),
                isActive: showPortalManagement
              }] : [])
            ]}
          />
        )}
        
        {/* Main Content */}
        <div className={`flex-1 overflow-x-hidden ${currentPage === 'landing' ? 'px-0' : 'px-4'}`} style={{ paddingTop: currentPage === 'landing' ? '0px' : '16px' }}>
          <div className="max-w-8xl mx-auto">
        {currentPage === 'landing' && (
          <LandingPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} currentPage={currentPage} />
        )}
        {currentPage === 'cart' && (
          <ShoppingCartPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />
        )}
        {currentPage === 'checkout' && (
          <CheckoutPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />
        )}
        {currentPage === 'orderSummary' && (
          <OrderSummaryPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />
        )}
        {currentPage === 'orderHistory' && (
          <OrderHistoryPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />
        )}
        {currentPage === 'orderTracking' && (
          <OrderTrackingPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />
        )}
        {currentPage === 'wishlist' && (
          <WishlistPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />
        )}
        {(currentPage === 'mens' || currentPage === 'womens' || currentPage === 'accessories' || currentPage === 'all') && (
          <CategoryPage category={currentPage} setCurrentPage={setCurrentPage} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />
        )}
        {currentPage === 'services' && <ServicesPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />}
        {currentPage === 'contact' && <ContactUsPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />}
        {currentPage === 'aboutus' && <AboutUsPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />}
        {currentPage === 'news' && <NewsPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />}
        {currentPage === 'entrepreneurs' && <EntrepreneursPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />}
        {currentPage === 'brandowners' && <BrandOwnersPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />}
        {currentPage === 'founders' && <FoundersPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />}
        {currentPage === 'documents' && <DocumentsPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />}
        {currentPage === 'bankings' && <BankingsPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />}
        {currentPage === 'legals' && <LegalsPage setCurrentPage={setCurrentPage} onNavigateToSignup={onNavigateToSignup} hideHeader={true} />}
        {(currentPage === 'customerDashboard' || currentPage === 'founderDashboard' || !currentPage) && renderTabContent()}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showAddMoneyModal && renderAddMoneyModal()}
      {showPaymentGateway && renderPaymentGateway()}
      
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Profile Information</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">User Name</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">User ID</label>
                <p className="text-gray-900">{user.userId}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Referral Link</label>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    value={referralLink} 
                    readOnly 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm"
                  />
                  <button 
                    onClick={handleCopyReferralLink}
                    className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}



export default CustomerDashboard;