"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import type { PageName, UserData } from "../types";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Check,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Package,
  AlertTriangle,
  XCircle,
  Eye,
  Star,
  Copy,
  Wallet,
  Menu,
  User,
  Lock,
  Shield,
  Coins,
  Trophy,
  Instagram,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Store,
  Tag,
  Settings,
  MessageSquare,
  LogOut,
  Award,
  MoreVertical,
} from "lucide-react";
import { walletAPI, mlmAPI, authAPI, productsAPI, businessAPI } from "../lib/api";
import ManageTeamPortal from "./ManageTeamPortal";
import CategoryPage from "./CategoryPage";
import ShoppingCartPage from "./ShoppingCartPage";
import WishlistPage from "./WishlistPage";
import CheckoutPage from "./CheckoutPage";
import OrderSummaryPage from "./OrderSummaryPage";
import OrderHistoryPage from "./OrderHistoryPage";
import OrderTrackingPage from "./OrderTrackingPage";
import LandingPage from "./LandingPage";
import CreateInvoice from "./CreateInvoice";
import CouponManagement from "./CouponManagement";
import ManageBusiness from "./ManageBusiness";
import AboutUsPage from "./AboutUsPage";
import NewsPage from "./NewsPage";
import EntrepreneursPage from "./EntrepreneursPage";
import BrandOwnersPage from "./BrandOwnersPage";
import FoundersPage from "./FoundersPage";
import DocumentsPage from "./DocumentsPage";
import BankingsPage from "./BankingsPage";
import LegalsPage from "./LegalsPage";
import ServicesPage from "./ServicesPage";
import ContactUsPage from "./ContactUsPage";
import TeamMemberPortal from "./TeamMemberPortal";

interface BrandOwnerDashboardProps {
  setCurrentPage: (page: PageName) => void;
  currentPage?: PageName;
  onNavigateToSignup?: () => void;
  user?: UserData | null;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}
// Brand Owner Dashboard Component
function BrandOwnerDashboard({
  setCurrentPage,
  onNavigateToSignup,
  currentPage,
  user,
  onLogout,
  onNavigate,
}: BrandOwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showTeamPortal, setShowTeamPortal] = useState(false);
  const [showTeamMemberPortal, setShowTeamMemberPortal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [kycData, setKycData] = useState<{pan: string; aadhaar: string; address: string; panPhoto: string | ArrayBuffer | null; aadhaarPhoto: string | ArrayBuffer | null}>({
    pan: "",
    aadhaar: "",
    address: "",
    panPhoto: null,
    aadhaarPhoto: null,
  });
  const [bankData, setBankData] = useState<{[key: string]: any}>({
    accountNumber: "",
    ifsc: "",
    bankName: "",
    accountHolder: "",
    passbookPhoto: null,
    accountType: "",
    bankAddress: "",
    bankCountry: "India",
  });
  const [products, setProducts] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockUpdateType, setStockUpdateType] = useState("add");
  const [variantTab, setVariantTab] = useState("stock");
  const [productForm, setProductForm] = useState<{[key: string]: any; images: string[]}>({
    name: "",
    brandName: "",
    price: "",
    discountedPrice: "",
    offer: "",
    category: "",
    subCategory: "",
    stockQuantity: "",
    sku: "",
    hsnCode: "",
    fitType: "",
    type: "",
    sizes: "",
    colors: "",
    material: "",
    pattern: "",
    neckType: "",
    sleeveType: "",
    occasion: "",
    length: "",
    closureType: "",
    stretchability: "",
    shortDescription: "",
    fullDescription: "",
    keyFeatures: "",
    washMethod: "",
    ironingDetails: "",
    images: [] as string[],
    videoLink: "",
    instagramLink: "",
    packageDimensions: "",
    weight: "",
    deliveryAvailability: "",
    codOption: "",
    sellerAddress: "",
    returnPolicy: "",
    gstPercentage: "",
    manufacturerDetails: "",
    countryOfOrigin: "",
    credits: "",
    sellingPrice: "",
    primaryFabric: "",
    warehouseLocation: "",
    colorInput: "",
    sizeInput: "",
    skuCodes: [] as any[],
    sizeChartImage: null as string | null,
    sizeGuide: "",
    fabricComposition: "",
    fabricWeight: "",
    fabricTransparency: "",
    fabricProperties: "",
    modelHeight: "",
    modelWearingSize: "",
    fitNote: "",
    stylingTips: "",
    washTemperature: "",
    bleach: "",
    dryMethod: "",
    specialCare: "",
    packerDetails: "",
    gender: "",
    secondaryMaterial: "",
    finish: "",
    bagType: "",
    compartments: "",
    metalType: "",
    gemstoneType: "",
    plating: "",
    watchType: "",
    bandMaterial: "",
    waterResistance: "",
    dimensions: "",
    adjustability: "",
    description: "",
    authCertificate: null,
    warranty: "",
    storage: "",
    packageWeight: "",
    packagingType: "",
    tags: "",
    mrp: "",
    gstRate: 0,
    gstInclusivePrice: "",
  });
  const [accessories, setAccessories] = useState<any[]>([]);
  const [editingAccessory, setEditingAccessory] = useState<any>(null);
  const [accessoryForm, setAccessoryForm] = useState({
    name: "",
    brandName: "",
    price: "",
    discountedPrice: "",
    offer: "",
    category: "",
    subCategory: "",
    stockQuantity: "",
    sku: "",
    hsnCode: "",
    // Accessory-specific fields
    accessoryType: "",
    material: "",
    color: "",
    size: "",
    dimensions: "",
    weight: "",
    // Common fields
    shortDescription: "",
    fullDescription: "",
    keyFeatures: "",
    careInstructions: "",
    images: [] as string[],
    videoLink: "",
    instagramLink: "",
    packageDimensions: "",
    deliveryAvailability: "",
    codOption: "",
    sellerAddress: "",
    returnPolicy: "",
    gstPercentage: "",
    manufacturerDetails: "",
    countryOfOrigin: "",
    // Additional accessory-specific fields
    warranty: "",
    authenticityCertificate: null,
    specialFeatures: "",
    credits: "",
  });

  // E-Wallet related states
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  // Income Wallet related states
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [showWithdrawalConfirmation, setShowWithdrawalConfirmation] =
    useState(false);
  const [currentWithdrawal, setCurrentWithdrawal] = useState<any>(null);

  // Team member related states
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showAddTeamMemberForm, setShowAddTeamMemberForm] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    email: "",
    password: "",
    role: "standard_member",
    isActive: true,
  });
  const [editingTeamMember, setEditingTeamMember] = useState<any>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamSuccess, setTeamSuccess] = useState<string | null>(null);

  // Add these state variables
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{type: string; text: string} | null>(null);

  // New Menu Drawer State Variables
  const [activeMenuSection, setActiveMenuSection] = useState<string | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showChangePhoneModal, setShowChangePhoneModal] = useState(false);
  const [showSkip2FAModal, setShowSkip2FAModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // Profile Form States
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState(user?.name || "");
  const [userMobile, setUserMobile] = useState<string>(String(user?.mobile || ""));
  const [userEmail, setUserEmail] = useState(user?.email || "");

  // Security States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2FA States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Feedback Form States
  const [ratings, setRatings] = useState({
    easeOfUse: 0,
    features: 0,
    performance: 0,
    customerSupport: 0,
    valueForMoney: 0,
    overallExperience: 0,
  });
  const [recommendationRating, setRecommendationRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: true,
    accountAlerts: true,
    recommendations: true,
  });

  // Invoice Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Category and Sub-category Management States
  const [isAddingNewSubCategory, setIsAddingNewSubCategory] = useState(false);
  const [newSubCategoryInput, setNewSubCategoryInput] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Custom Sub-categories by Category
  const [customSubCategories, setCustomSubCategories] = useState<{[key: string]: string[]}>({});

  // Handler for adding new sub-category
  const handleAddNewSubCategory = () => {
    if (newSubCategoryInput && newSubCategoryInput.trim() && productForm.category) {
      const newSubCategory = newSubCategoryInput.trim();
      setCustomSubCategories(prev => ({
        ...prev,
        [productForm.category]: [...(prev[productForm.category] || []), newSubCategory]
      }));
      setProductForm({ ...productForm, subCategory: newSubCategory });
      setIsAddingNewSubCategory(false);
      setNewSubCategoryInput('');
    }
  };

  // Handler for adding new category
  const handleAddNewCategory = () => {
    if (newCategoryName && newCategoryName.trim()) {
      const newCategory = newCategoryName.trim();
      if (!customCategories.includes(newCategory)) {
        setCustomCategories([...customCategories, newCategory]);
        setProductForm({ ...productForm, category: newCategory });
      }
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    }
  };

  const companyDropdownRef = React.useRef(null);

  // Get user data from API
  const [userData, setUserData] = useState<any>(null);

  // Generate referral link
  const referralLink = `${window.location.origin}?ref=${user?.userId || ''}`;

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setTeamLoading(true);
        const res = await businessAPI.getTeamMembers();
        if (res.success) {
          setTeamMembers(res.members || []);
        }
      } catch {
        // Fallback to localStorage if API fails
        const savedMembers = JSON.parse(
          localStorage.getItem("teamMembers") || "[]",
        );
        setTeamMembers(savedMembers);
      } finally {
        setTeamLoading(false);
      }
    };
    loadTeamMembers();
  }, []);

  // Add these functions
  const handleDuplicateProduct = (product) => {
    const duplicatedProduct = {
      ...product,
      id: Date.now().toString(),
      name: `${product.name} (Copy)`,
      status: "draft",
      stockQuantity: 0,
      skuCodes: product.skuCodes
        ? product.skuCodes.map((sku) => ({ ...sku, stock: 0 }))
        : [],
      lastUpdated: new Date().toISOString(),
      lastSynced: null,
    };

    setProducts([...products, duplicatedProduct]);
    alert("Product duplicated successfully!");
  };

  const checkLowStockAlerts = () => {
    const alerts = products
      .filter(
        (product) =>
          (product.stockQuantity || 0) < (product.lowStockThreshold || 10),
      )
      .map((product) => ({
        id: product._id || product.id,
        name: product.name,
        currentStock: product.stockQuantity || 0,
        threshold: product.lowStockThreshold || 10,
      }));

    setLowStockAlerts(alerts);

    if (alerts.length > 0) {
      alert(`${alerts.length} products are running low on stock!`);
    }
  };

  // Call this function when the component mounts or when products change
  useEffect(() => {
    checkLowStockAlerts();
  }, [products]);

  const handleSaveTeamMember = async () => {
    if (!newTeamMember.name || !newTeamMember.email || !newTeamMember.password) {
      setTeamError("Name, email, and password are required.");
      return;
    }
    try {
      setTeamLoading(true);
      setTeamError(null);
      const res = await businessAPI.createTeamMember({
        name: newTeamMember.name,
        email: newTeamMember.email,
        password: newTeamMember.password,
        role: newTeamMember.role,
      });
      if (res.success) {
        setTeamMembers([...teamMembers, res.member]);
        setTeamSuccess(`Team member created! Their Member ID is: ${res.member.memberId}`);
        setNewTeamMember({
          name: "",
          email: "",
          password: "",
          role: "standard_member",
          isActive: true,
        });
        setActiveTab("team");
      }
    } catch (err: any) {
      setTeamError(err?.message || "Failed to create team member.");
    } finally {
      setTeamLoading(false);
    }
  };

  const handleEditTeamMember = (member) => {
    setEditingTeamMember(member);
    setActiveTab("editTeamMember");
  };

  const handleUpdateTeamMember = async () => {
    if (editingTeamMember) {
      try {
        setTeamLoading(true);
        setTeamError(null);
        const memberId = editingTeamMember._id || editingTeamMember.id;
        const res = await businessAPI.updateTeamMember(memberId, {
          name: editingTeamMember.name,
          role: editingTeamMember.role,
          isActive: editingTeamMember.isActive,
        });
        if (res.success) {
          setTeamMembers(teamMembers.map((m) =>
            (m._id || m.id) === memberId ? res.member : m
          ));
          setTeamSuccess("Team member updated successfully.");
          setEditingTeamMember(null);
          setActiveTab("team");
        }
      } catch (err: any) {
        setTeamError(err?.message || "Failed to update team member.");
      } finally {
        setTeamLoading(false);
      }
    }
  };

  const handleToggleTeamMemberStatus = async (id: string) => {
    const member = teamMembers.find((m) => (m._id || m.id) === id);
    if (!member) return;
    try {
      const res = await businessAPI.updateTeamMember(id, { isActive: !member.isActive });
      if (res.success) {
        setTeamMembers(teamMembers.map((m) =>
          (m._id || m.id) === id ? res.member : m
        ));
      }
    } catch (err: any) {
      setTeamError(err?.message || "Failed to toggle member status.");
    }
    setActionMenuOpen(null);
  };

  const handleDeleteTeamMember = (id: string) => {
    const member = teamMembers.find((m) => (m._id || m.id) === id);
    if (member) {
      setMemberToDelete(member);
      setShowDeleteConfirmation(true);
    }
  };

  const confirmDeleteTeamMember = async () => {
    if (memberToDelete) {
      try {
        const memberId = memberToDelete._id || memberToDelete.id;
        await businessAPI.deleteTeamMember(memberId);
        setTeamMembers(teamMembers.filter((m) => (m._id || m.id) !== memberId));
        setTeamSuccess("Team member removed successfully.");
      } catch (err: any) {
        setTeamError(err?.message || "Failed to remove team member.");
      }
      setMemberToDelete(null);
      setShowDeleteConfirmation(false);
      setActionMenuOpen(null);
    }
  };

  // Financial data - in a real app, this would come from an API
  const [financialData, setFinancialData] = useState({
    directIncome: 0,
    indirectIncome: 0,
    incomeWallet: 0,
    eWallet: 0, // Starting with 0 as requested
    totalPayout: 0,
  });

  // Calculate tax based on Indian tax rules
  const calculateTax = (amount) => {
    if (amount <= 10000) {
      return 0;
    } else if (amount > 10000 && amount <= 50000) {
      return amount * 0.05; // 5% tax
    } else if (amount > 50000 && amount <= 100000) {
      return amount * 0.1; // 10% tax
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
        id: "WDR" + Math.floor(Math.random() * 1000000),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        amount: amount,
        tax: tax,
        creditedAmount: creditedAmount,
        status: "Processing",
        expectedCreditDate: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toLocaleDateString(), // 3 days from now
        expectedCreditTime: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toLocaleTimeString(),
      };

      // Update withdrawal history
      setWithdrawalHistory([withdrawal, ...withdrawalHistory]);

      // Update income wallet balance
      setFinancialData((prev) => ({
        ...prev,
        incomeWallet: prev.incomeWallet - amount,
      }));

      // Update income wallet via API
      walletAPI.withdrawFromIncome(amount).catch(() => {});

      // Set current withdrawal for confirmation
      setCurrentWithdrawal(withdrawal);

      // Show confirmation screen
      setShowWithdrawalConfirmation(true);

      // Reset withdrawal amount
      setWithdrawalAmount("");
    }
  };

  // Handle withdrawal amount change
  const handleWithdrawalAmountChange = (e) => {
    const value = e.target.value;
    if (
      value === "" ||
      (parseFloat(value) > 0 && parseFloat(value) <= financialData.incomeWallet)
    ) {
      setWithdrawalAmount(value);
    }
  };

  // Get expected credit timeline
  const getExpectedCreditTimeline = () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) return null;

    const expectedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    return {
      day: expectedDate.toLocaleDateString("en-US", { weekday: "long" }),
      date: expectedDate.toLocaleDateString(),
      time: expectedDate.toLocaleTimeString(),
    };
  };

  // Load data when component mounts
  React.useEffect(() => {
    const loadData = async () => {
      if (!user?.userId) return;
      try {
        // Load user data from API
        const userRes = await mlmAPI.getUserById(user.userId);
        if (userRes.user) {
          setUserData(userRes.user);
          const ud = userRes.user;
          
          // Load KYC and bank data if available
          if (ud.kycVerified) {
            setKycData({
              pan: "XXXXXX1234",
              aadhaar: "XXXXXX5678",
              address: "123 Main Street, City, State",
              panPhoto: ud.kycData?.panPhoto || null,
              aadhaarPhoto: ud.kycData?.aadhaarPhoto || null,
            });
          }

          if (ud.bankAccount) {
            setBankData({
              ...ud.bankAccount,
              passbookPhoto: ud.bankAccount.passbookPhoto || null,
            });
          }

          // Load withdrawal history if available
          if (ud.withdrawalHistory) {
            setWithdrawalHistory(ud.withdrawalHistory);
          }
        }

        // Load products from API
        const productsRes = await productsAPI.getMyProducts();
        setProducts(productsRes.products || []);

        // Load financial data
        const finRes = await walletAPI.getFinancialData();
        if (finRes.financialData) {
          const data = finRes.financialData;
          setFinancialData({
            directIncome: data.directIncome || 0,
            indirectIncome: data.indirectIncome || 0,
            incomeWallet: data.incomeWallet || 0,
            eWallet: 0, // Force eWallet to be 0 on initial load
            totalPayout: data.totalPayout || 0,
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    
    loadData();
  }, [user?.userId]);

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKYCSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateKYC(kycData);
      alert("KYC verification submitted successfully!");
      setKycData({
        pan: "XXXXXX1234",
        aadhaar: "XXXXXX5678",
        address: kycData.address,
        panPhoto: kycData.panPhoto,
        aadhaarPhoto: kycData.aadhaarPhoto,
      });
    } catch {
      alert("Error submitting KYC verification");
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateBankAccount(bankData);
      alert("Bank account added successfully!");
    } catch {
      alert("Error adding bank account");
    }
  };

  const handleFileUpload = (e, fileType) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fileType === "panPhoto") {
          setKycData({ ...kycData, panPhoto: reader.result });
        } else if (fileType === "aadhaarPhoto") {
          setKycData({ ...kycData, aadhaarPhoto: reader.result });
        } else if (fileType === "passbookPhoto") {
          setBankData({ ...bankData, passbookPhoto: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageUpload = (e) => {
    const files: File[] = Array.from(e.target.files);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((images: unknown[]) => {
      setProductForm({
        ...productForm,
        images: [...productForm.images, ...(images as string[])],
      });
    });
  };

  const removeProductImage = (index) => {
    setProductForm({
      ...productForm,
      images: productForm.images.filter((_, i) => i !== index),
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (editingProduct) {
      // Submit update request for admin approval (no local update until approved)
      try {
        const result = await productsAPI.update(editingProduct._id || editingProduct.id, productForm);
        alert(result.message || "Product update request submitted for admin approval.");
      } catch (error: any) {
        alert(error.message || "Failed to submit product update request.");
        return;
      }
    } else {
      // Submit new product request for admin approval (no local add until approved)
      try {
        const result = await productsAPI.create(productForm);
        alert(result.message || "Product creation request submitted for admin approval.");
      } catch (error: any) {
        alert(error.message || "Failed to submit product creation request.");
        return;
      }
    }

    // Reset form and go back to products list
    resetProductForm();
    setActiveTab("products");
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      brandName: "",
      price: "",
      discountedPrice: "",
      offer: "",
      category: "",
      subCategory: "",
      stockQuantity: "",
      sku: "",
      hsnCode: "",
      fitType: "",
      type: "",
      colors: "",
      sizes: "",
      material: "",
      pattern: "",
      neckType: "",
      sleeveType: "",
      occasion: "",
      length: "",
      closureType: "",
      stretchability: "",
      shortDescription: "",
      fullDescription: "",
      keyFeatures: "",
      washMethod: "",
      ironingDetails: "",
      images: [] as string[],
      videoLink: "",
      instagramLink: "",
      packageDimensions: "",
      weight: "",
      deliveryAvailability: "",
      codOption: "",
      sellerAddress: "",
      returnPolicy: "",
      gstPercentage: "",
      manufacturerDetails: "",
      countryOfOrigin: "",
      credits: "",
      sellingPrice: "",
      primaryFabric: "",
      warehouseLocation: "",
      colorInput: "",
      sizeInput: "",
      skuCodes: [],
      sizeChartImage: null,
      sizeGuide: "",
      fabricComposition: "",
      fabricWeight: "",
      fabricTransparency: "",
      fabricProperties: "",
      modelHeight: "",
      modelWearingSize: "",
      fitNote: "",
      stylingTips: "",
      washTemperature: "",
      bleach: "",
      dryMethod: "",
      specialCare: "",
      packerDetails: "",
      gender: "",
      secondaryMaterial: "",
      finish: "",
      bagType: "",
      compartments: "",
      metalType: "",
      gemstoneType: "",
      plating: "",
      watchType: "",
      bandMaterial: "",
      waterResistance: "",
      dimensions: "",
      adjustability: "",
      description: "",
      authCertificate: null,
      warranty: "",
      storage: "",
      packageWeight: "",
      packagingType: "",
      tags: "",
      mrp: "",
      gstRate: 0,
      gstInclusivePrice: "",
    });
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm(product);
    setActiveTab("addproduct");
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm("Are you sure you want to request deletion of this product?")) {
      // Submit delete request for admin approval (no local removal until approved)
      try {
        const result = await productsAPI.delete(productId);
        alert(result.message || "Product deletion request submitted for admin approval.");
      } catch (error: any) {
        alert(error.message || "Failed to submit product deletion request.");
      }
    }
  };

  const handleAccessorySubmit = async (e) => {
    e.preventDefault();

    if (editingAccessory) {
      // Submit update request for admin approval (no local update until approved)
      try {
        const result = await productsAPI.update(editingAccessory.id, { ...accessoryForm, category: 'accessories' });
        alert(result.message || "Accessory update request submitted for admin approval.");
      } catch (error: any) {
        alert(error.message || "Failed to submit accessory update request.");
        return;
      }
    } else {
      // Submit new accessory request for admin approval (no local add until approved)
      try {
        const result = await productsAPI.create({ ...accessoryForm, category: 'accessories' });
        alert(result.message || "Accessory creation request submitted for admin approval.");
      } catch (error: any) {
        alert(error.message || "Failed to submit accessory creation request.");
        return;
      }
    }

    // Reset form and go back to products list
    resetAccessoryForm();
    setActiveTab("products");
  };

  const resetAccessoryForm = () => {
    setAccessoryForm({
      name: "",
      brandName: "",
      price: "",
      discountedPrice: "",
      offer: "",
      category: "",
      subCategory: "",
      stockQuantity: "",
      sku: "",
      hsnCode: "",
      accessoryType: "",
      material: "",
      color: "",
      size: "",
      dimensions: "",
      weight: "",
      shortDescription: "",
      fullDescription: "",
      keyFeatures: "",
      careInstructions: "",
      images: [] as string[],
      videoLink: "",
      instagramLink: "",
      packageDimensions: "",
      deliveryAvailability: "",
      codOption: "",
      sellerAddress: "",
      returnPolicy: "",
      gstPercentage: "",
      manufacturerDetails: "",
      countryOfOrigin: "",
      warranty: "",
      authenticityCertificate: null,
      specialFeatures: "",
      credits: "",
    });
    setEditingAccessory(null);
  };

  const handlePortalClick = () => {
    setShowTeamPortal(true);
  };

  const handleBackToDashboard = () => {
    setShowTeamPortal(false);
  };

  if (showTeamPortal) {
    return (
      <ManageTeamPortal
        user={user!}
        onLogout={onLogout || (() => {})}
        onSwitchToDashboard={handleBackToDashboard}
      />
    );
  }

  if (showTeamMemberPortal) {
    return (
      <TeamMemberPortal
        onBack={() => setShowTeamMemberPortal(false)}
      />
    );
  }

  // E-Wallet functions
  const handleAddMoney = () => {
    const amount = parseFloat(paymentAmount as string);
    if (amount >= 10 && amount <= 50000) {
      setShowPaymentGateway(true);
    } else {
      alert("Please enter an amount between ₹10 and ₹50,000");
    }
  };

  const processPayment = () => {
    // In a real app, this would integrate with a payment gateway
    // For demo purposes, we'll simulate a successful payment
    setTimeout(() => {
      const newTransactionId = "TXN" + Math.floor(Math.random() * 1000000);
      setTransactionId(newTransactionId);

      // Update eWallet balance
      setFinancialData((prev) => ({
        ...prev,
        eWallet: prev.eWallet + parseFloat(paymentAmount),
      }));

      // Update eWallet via API
      walletAPI.addToEWallet(parseFloat(paymentAmount), paymentMethod).catch(() => {});

      // Show success message
      setShowPaymentGateway(false);
      setPaymentSuccess(true);
      setPaymentAmount("");

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
                {paymentMethod === "upi" && <div className="mr-3"></div>}
                {paymentMethod === "card" && <div className="mr-3"></div>}
                {paymentMethod === "netbanking" && <div className="mr-3"></div>}
                <div className="font-medium capitalize">
                  {paymentMethod === "upi"
                    ? "UPI"
                    : paymentMethod === "card"
                      ? "Credit/Debit Card"
                      : "Net Banking"}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 p-3 bg-yellow-50 rounded-md">
            <div className="text-sm text-yellow-800">
              This is a demo payment gateway. In a real application, this would
              connect to an actual payment service provider.
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Amount (₹)
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount between ₹10 to ₹50,000"
              min="10"
              max="50000"
            />
            <div className="text-xs text-gray-500 mt-1">
              Minimum: ₹10, Maximum: ₹50,000
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Payment Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                  className="mr-3"
                />
                <div>UPI</div>
              </label>
              <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="mr-3"
                />
                <div>Credit/Debit Card</div>
              </label>
              <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="netbanking"
                  checked={paymentMethod === "netbanking"}
                  onChange={() => setPaymentMethod("netbanking")}
                  className="mr-3"
                />
                <div className="w-8 h-8 bg-blue-500 rounded-full mr-3"></div>
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

  // Add this sync function
  const handleSyncToPlatform = async () => {
    setSyncing(true);
    setSyncMessage(null);

    try {
      // Products are already saved to the database via productsAPI
      // This sync refreshes the local state from the DB to ensure consistency
      const result = await productsAPI.getMyProducts();
      if (result && result.products) {
        setProducts(result.products);
      }

      // Update last synced timestamp for each product
      const updatedProducts = products.map((product) => ({
        ...product,
        lastSynced: new Date().toISOString(),
      }));
      setProducts(updatedProducts);

      setSyncMessage({
        type: "success",
        text: `Successfully synced ${products.length} products to platform inventory`,
      });
    } catch (error) {
      console.error("Sync error:", error);
      setSyncMessage({
        type: "error",
        text: "Failed to sync products. Please try again.",
      });
    } finally {
      setSyncing(false);

      // Clear message after 5 seconds
      setTimeout(() => {
        setSyncMessage(null);
      }, 5000);
    }
  };

  const categorySubCategories = {
    "Men's Clothing": [
      "T-Shirts",
      "Casual Shirts",
      "Formal Shirts",
      "Sweatshirts",
      "Sweaters",
      "Jackets",
      "Blazers & Coats",
      "Suits",
      "Rain Jackets",
      "Kurtas & Kurta Sets",
      "Sherwanis",
      "Nehru Jackets",
      "Dhotis",
      "Jeans",
      "Casual Trousers",
      "Formal Trousers",
      "Shorts",
      "Track Pants & Joggers",
      "Briefs & Trunks",
      "Boxers",
      "Vests",
      "Sleepwear & Loungewear",
      "Thermals",
    ],
    "Women's Clothing": [
      "Kurtas & Suits",
      "Kurtis, Tunics & Tops",
      "Sarees",
      "Leggings, Salwars & Churidars",
      "Skirts & Palazzos",
      "Dress Materials",
      "Lehenga Cholis",
      "Dupattas & Shawls",
      "Jackets",
      "Dresses",
      "Tops",
      "Tshirts",
      "Jeans",
      "Trousers & Capris",
      "Shorts & Skirts",
      "Co-ords",
      "Playsuits",
      "Jumpsuits",
      "Shrugs",
      "Sweaters & Sweatshirts",
      "Jackets & Coats",
      "Blazers & Waistcoats",
    ],
    "Ethnic Wear": [
      "Ethnic Jackets",
      "Ethnic Suit Sets",
      "Kurtas",
      "Pyjamas & Churidars",
      "Sherwani Sets",
      "Stoles",
      "Co-ord Sets",
      "Dresses & Gowns",
      "Kurta Suit Sets",
      "Kurta-Bottom Set",
      "Kurtas",
      "Kurtis & Tunics",
      "Lehenga Choli Sets",
      "Salwars & Churidars",
      "Sarees",
    ],
    "Western Wear": [
      "Jeans",
      "Shirts",
      "Shorts & 3/4ths",
      "Suit Sets",
      "Track Pants",
      "Tracksuits",
      "Trousers & Pants",
      "Tshirts",
      "Dresses",
      "Jeans & Jeggings",
      "Tops",
      "Trousers & Pants",
      "Tshirts",
      "Track Pants",
      "Shirts",
      "Leggings",
    ],
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Brand Owner Dashboard</h2>

            {/* Financial Overview - REAL TIME DATA */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">Total Payout</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{financialData.totalPayout}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Total earnings from direct income
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">
                    Income Wallet
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{financialData.incomeWallet}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Available for withdrawal
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">E-Wallet</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{financialData.eWallet}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Available for purchases
                  </div>
                </div>
              </div>
            </div>

            {/* User Status - REAL TIME DATA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KYC Status
                </label>
                <div className="flex items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userData?.kycVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {userData?.kycVerified ? "Verified" : "Not Verified"}
                  </span>
                  {!userData?.kycVerified && (
                    <button
                      onClick={() => setActiveTab("kyc")}
                      className="ml-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Verify Now
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account
                </label>
                <div className="flex items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userData?.bankAccount
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {userData?.bankAccount ? "Added" : "Not Added"}
                  </span>
                  {!userData?.bankAccount && (
                    <button
                      onClick={() => setActiveTab("bank")}
                      className="ml-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Add Now
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Product Statistics - REAL TIME DATA */}
            <div className="mb-8 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Product Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">
                    Total Products
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {products.length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Products uploaded
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">
                    Product Views
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {products.reduce((sum, p) => sum + (p.views || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Total product views
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <button
                onClick={() => setActiveTab("products")}
                className="p-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all shadow-md"
              >
                <div className="text-lg font-semibold">Manage Products</div>
                <div className="text-sm opacity-90 mt-1">
                  Add, edit, or remove products
                </div>
              </button>
              <button
                onClick={() => setActiveTab("team")}
                className="p-4 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all shadow-md"
              >
                <div className="text-lg font-semibold">Manage Team Members</div>
                <div className="text-sm opacity-90 mt-1">
                  Add or remove team members
                </div>
              </button>
              <button
                onClick={() => setActiveTab("ewallet")}
                className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
              >
                <div className="text-lg font-semibold">E-Wallet</div>
                <div className="text-sm opacity-90 mt-1">
                  Add money to wallet
                </div>
              </button>
              <button
                onClick={() => setActiveTab("incomewallet")}
                className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
              >
                <div className="text-lg font-semibold">Income Wallet</div>
                <div className="text-sm opacity-90 mt-1">Withdraw earnings</div>
              </button>
              <button
                onClick={() => setActiveTab("kyc")}
                className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
              >
                <div className="text-lg font-semibold">KYC Verification</div>
                <div className="text-sm opacity-90 mt-1">
                  Complete your verification
                </div>
              </button>
              <button
                onClick={() => setActiveTab("bank")}
                className="p-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all shadow-md"
              >
                <div className="text-lg font-semibold">
                  Bank Account Verification
                </div>
                <div className="text-sm opacity-90 mt-1">
                  Verify your bank details
                </div>
              </button>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md"
              >
                <div className="text-lg font-semibold">Create Invoice</div>
                <div className="text-sm opacity-90 mt-1">
                  Generate customer invoices
                </div>
              </button>
              <button
                onClick={() => setActiveTab("coupons")}
                className="p-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-md"
              >
                <div className="text-lg font-semibold">Manage Coupons</div>
                <div className="text-sm opacity-90 mt-1">
                  Create and manage discount coupons
                </div>
              </button>
              <button
                onClick={() => setActiveTab("manageBusiness")}
                className="p-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-md"
              >
                <div className="flex items-center">
                  <Store size={24} className="mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Business</div>
                    <div className="text-sm opacity-90">
                      Complete business management
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case "ewallet":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">E-Wallet</h2>

            {/* Success Message */}
            {paymentSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <Check className="text-green-600 mr-2" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Payment Successful!
                    </h3>
                    <p className="text-green-700">
                      ₹{paymentAmount} has been added to your E-Wallet.
                    </p>
                    <p className="text-green-700 text-sm">
                      Transaction ID: {transactionId}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Balance Card - Changed to blue theme like financial overview */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Available Balance
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      ₹{financialData.eWallet}
                    </div>
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
              <h3 className="text-lg font-semibold mb-4">
                Recent Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Transaction ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
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
                        <td
                          colSpan={5}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                        >
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

      case "incomewallet":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Income Wallet</h2>

            {/* Withdrawal Confirmation Modal */}
            {showWithdrawalConfirmation && currentWithdrawal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Withdrawal Request Initiated
                    </h3>
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
                      <h3 className="text-lg font-semibold text-green-800">
                        Request Successful!
                      </h3>
                    </div>
                    <p className="text-green-700">
                      Your withdrawal request has been initiated successfully.
                    </p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Request ID:</span>
                      <span className="font-medium">
                        {currentWithdrawal.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Withdrawal Amount:</span>
                      <span className="font-medium">
                        ₹{currentWithdrawal.amount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Deducted:</span>
                      <span className="font-medium">
                        ₹{currentWithdrawal.tax}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credited Amount:</span>
                      <span className="font-medium text-green-600">
                        ₹{currentWithdrawal.creditedAmount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Expected Credit Date:
                      </span>
                      <span className="font-medium">
                        {currentWithdrawal.expectedCreditDate}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-md mb-4">
                    <p className="text-sm text-yellow-800">
                      The amount will be credited to your bank account within 3
                      business days.
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
                    <div className="text-sm text-gray-500 mb-1">
                      Available Balance
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      ₹{financialData.incomeWallet}
                    </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Amount (₹)
                </label>
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
                    Credited Amount: ₹
                    {(
                      parseFloat(withdrawalAmount) -
                      calculateTax(parseFloat(withdrawalAmount))
                    ).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Expected Credit Timeline */}
              {withdrawalAmount && parseFloat(withdrawalAmount) > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Expected Credit Timeline:</p>
                    <p>
                      {getExpectedCreditTimeline()?.day},{" "}
                      {getExpectedCreditTimeline()?.date} at{" "}
                      {getExpectedCreditTimeline()?.time}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleWithdrawalRequest}
                disabled={
                  !withdrawalAmount ||
                  parseFloat(withdrawalAmount) <= 0 ||
                  parseFloat(withdrawalAmount) > financialData.incomeWallet
                }
                className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  withdrawalAmount &&
                  parseFloat(withdrawalAmount) > 0 &&
                  parseFloat(withdrawalAmount) <= financialData.incomeWallet
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Proceed with Withdrawal
              </button>
            </div>

            {/* Tax Information */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Tax Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Up to ₹10,000:</span>
                  <span className="font-medium">No Tax</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">₹10,001 to ₹50,000:</span>
                  <span className="font-medium">5% Tax</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">₹50,001 to ₹100,000:</span>
                  <span className="font-medium">10% Tax</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Above ₹100,000:</span>
                  <span className="font-medium">15% Tax</span>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Withdrawal History</h3>
              {withdrawalHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Request ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date & Time
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Tax Deducted
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Credited Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
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
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                withdrawal.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : withdrawal.status === "Processing"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
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
                  <p className="text-center text-gray-500">
                    No withdrawal history found
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "products":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    resetProductForm();
                    setActiveTab("addproduct");
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={20} className="mr-2" />
                  Add Product
                </button>
                <button
                  onClick={() => {
                    resetProductForm();
                    setActiveTab("addaccessory");
                  }}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Plus size={20} className="mr-2" />
                  Add Accessory
                </button>
                <button
                  onClick={handleSyncToPlatform}
                  disabled={syncing}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {syncing ? (
                    <>
                      <RefreshCw size={20} className="mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="mr-2" />
                      Sync to Platform
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowBulkOperations(!showBulkOperations)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <Package size={20} className="mr-2" />
                  Bulk Operations
                </button>
              </div>
            </div>

            {/* Sync Status Message */}
            {syncMessage && (
              <div
                className={`mb-4 p-3 rounded-md ${
                  syncMessage.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex items-center">
                  {syncMessage.type === "success" ? (
                    <CheckCircle size={20} className="mr-2" />
                  ) : (
                    <AlertCircle size={20} className="mr-2" />
                  )}
                  <span className="text-sm">{syncMessage.text}</span>
                </div>
              </div>
            )}

            {/* Bulk Operations Panel */}
            {showBulkOperations && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">Bulk Operations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Import/Export
                    </h4>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                        Export Products
                      </button>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                        Import Products
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Bulk Updates
                    </h4>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                        Update Prices
                      </button>
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                        Update Stock
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Filters and Search */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Categories</option>
                    <option value="Men's Clothing">Men's Clothing</option>
                    <option value="Women's Clothing">Women's Clothing</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Status
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Stock</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Apply Filters
                </button>
              </div>
            </div>

            {products.length > 0 ? (
              <>
                {/* Product Statistics */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <Package className="text-blue-600 mr-2" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Total Products</p>
                        <p className="text-xl font-semibold">
                          {products.length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="text-green-600 mr-2" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">In Stock</p>
                        <p className="text-xl font-semibold">
                          {
                            products.filter((p) => (p.stockQuantity || 0) > 0)
                              .length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <AlertTriangle
                        className="text-yellow-600 mr-2"
                        size={20}
                      />
                      <div>
                        <p className="text-sm text-gray-600">Low Stock</p>
                        <p className="text-xl font-semibold">
                          {
                            products.filter(
                              (p) =>
                                (p.stockQuantity || 0) > 0 &&
                                (p.stockQuantity || 0) < 10,
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <XCircle className="text-red-600 mr-2" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Out of Stock</p>
                        <p className="text-xl font-semibold">
                          {
                            products.filter((p) => (p.stockQuantity || 0) === 0)
                              .length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product._id || product.id}
                      className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${product.status === "draft" ? "opacity-75" : ""}`}
                    >
                      {product.images && product.images.length > 0 ? (
                        <div className="relative">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                          {/* Product Status Badges */}
                          <div className="absolute top-2 left-2 flex flex-col space-y-1">
                            {product.status === "draft" && (
                              <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded">
                                Draft
                              </span>
                            )}
                            {product.featured && (
                              <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                                Featured
                              </span>
                            )}
                            {product.newProduct && (
                              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                                New
                              </span>
                            )}
                            {product.onSale && (
                              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                                Sale
                              </span>
                            )}
                            {(product.stockQuantity || 0) === 0 && (
                              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                                Out of Stock
                              </span>
                            )}
                            {(product.stockQuantity || 0) > 0 &&
                              (product.stockQuantity || 0) < 10 && (
                                <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                                  Low Stock
                                </span>
                              )}
                          </div>
                          {/* Last Synced Badge */}
                          {product.lastSynced && (
                            <span className="absolute top-2 right-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                              Synced
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">
                            {product.name}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {/* Rating Display */}
                            {product.rating && (
                              <div className="flex items-center">
                                <Star
                                  size={14}
                                  className="text-yellow-500 fill-current"
                                />
                                <span className="text-xs ml-1">
                                  {product.rating}
                                </span>
                              </div>
                            )}
                            {/* View Count */}
                            {product.viewCount && (
                              <div className="flex items-center text-gray-500">
                                <Eye size={14} className="mr-1" />
                                <span className="text-xs">
                                  {product.viewCount}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {product.brandName && (
                          <p className="text-sm text-gray-600 mb-2">
                            {product.brandName}
                          </p>
                        )}

                        {/* SEO URL Slug */}
                        {product.slug && (
                          <p className="text-xs text-gray-500 mb-2 truncate">
                            URL: /products/{product.slug}
                          </p>
                        )}

                        {/* Pricing Information */}
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <p>
                            <span className="font-medium">MRP:</span> ₹
                            {product.price || product.mrp}
                          </p>
                          {product.sellingPrice && (
                            <p>
                              <span className="font-medium">
                                Selling Price:
                              </span>{" "}
                              ₹{product.sellingPrice}
                            </p>
                          )}
                          {product.gstInclusivePrice && (
                            <p>
                              <span className="font-medium">
                                GST Inclusive:
                              </span>{" "}
                              ₹{product.gstInclusivePrice}
                            </p>
                          )}
                          {product.offer && (
                            <p>
                              <span className="font-medium">Offer:</span>{" "}
                              {product.offer}
                            </p>
                          )}
                          {product.credits && (
                            <p>
                              <span className="font-medium">Credits:</span>{" "}
                              {product.credits}
                            </p>
                          )}
                        </div>

                        {/* Product Classification */}
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <p>
                            <span className="font-medium">Category:</span>{" "}
                            {product.category}
                          </p>
                          {product.subCategory && (
                            <p>
                              <span className="font-medium">Sub-Category:</span>{" "}
                              {product.subCategory}
                            </p>
                          )}
                          {product.gender && (
                            <p>
                              <span className="font-medium">Gender:</span>{" "}
                              {product.gender}
                            </p>
                          )}
                          {product.occasion && (
                            <p>
                              <span className="font-medium">Occasion:</span>{" "}
                              {product.occasion}
                            </p>
                          )}
                        </div>

                        {/* Inventory Information */}
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <p>
                            <span className="font-medium">Stock:</span>{" "}
                            {product.stockQuantity || 0}
                          </p>
                          {product.sku && (
                            <p>
                              <span className="font-medium">SKU:</span>{" "}
                              {product.sku}
                            </p>
                          )}
                          {product.hsnCode && (
                            <p>
                              <span className="font-medium">HSN Code:</span>{" "}
                              {product.hsnCode}
                            </p>
                          )}
                          {product.gstPercentage && (
                            <p>
                              <span className="font-medium">GST:</span>{" "}
                              {product.gstPercentage}
                            </p>
                          )}
                        </div>

                        {/* Product Variants */}
                        <div className="mb-3 p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600">
                            {product.colors && (
                              <p className="mb-1">
                                <span className="font-medium">Colors:</span>{" "}
                                {product.colors}
                              </p>
                            )}
                            {product.sizes && (
                              <p className="mb-1">
                                <span className="font-medium">Sizes:</span>{" "}
                                {product.sizes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Product Status and Actions */}
                        <div className="mb-3 p-2 bg-gray-50 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Status</span>
                            <select
                              value={product.status || "draft"}
                              onChange={(e) => {
                                const updatedProducts = products.map((p) =>
                                  (p._id || p.id) === (product._id || product.id)
                                    ? { ...p, status: e.target.value }
                                    : p,
                                );
                                setProducts(updatedProducts);
                              }}
                              className="text-xs px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-4 text-xs">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={product.featured || false}
                                onChange={(e) => {
                                  const updatedProducts = products.map((p) =>
                                    (p._id || p.id) === (product._id || product.id)
                                      ? { ...p, featured: e.target.checked }
                                      : p,
                                  );
                                  setProducts(updatedProducts);
                                }}
                                className="mr-1"
                              />
                              Featured
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={product.newProduct || false}
                                onChange={(e) => {
                                  const updatedProducts = products.map((p) =>
                                    (p._id || p.id) === (product._id || product.id)
                                      ? { ...p, newProduct: e.target.checked }
                                      : p,
                                  );
                                  setProducts(updatedProducts);
                                }}
                                className="mr-1"
                              />
                              New
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={product.onSale || false}
                                onChange={(e) => {
                                  const updatedProducts = products.map((p) =>
                                    (p._id || p.id) === (product._id || product.id)
                                      ? { ...p, onSale: e.target.checked }
                                      : p,
                                  );
                                  setProducts(updatedProducts);
                                }}
                                className="mr-1"
                              />
                              On Sale
                            </label>
                          </div>
                        </div>

                        {/* Stock Management Section */}
                        <div className="mb-3 p-2 bg-gray-50 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              Stock & Variants
                            </span>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowStockModal(true);
                                setStockUpdateType("add");
                                setVariantTab("stock");
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <Edit size={12} className="mr-1" />
                              Manage
                            </button>
                          </div>
                          <div className="text-xs text-gray-600">
                            <p>Total Stock: {product.stockQuantity || 0}</p>
                            {product.lastUpdated && (
                              <p>
                                Last Updated:{" "}
                                {new Date(
                                  product.lastUpdated,
                                ).toLocaleDateString()}
                              </p>
                            )}
                            {product.stockHistory &&
                              product.stockHistory.length > 0 && (
                                <p>
                                  History: {product.stockHistory.length} updates
                                </p>
                              )}
                          </div>
                        </div>

                        {/* SEO and Marketing */}
                        <details className="mb-3">
                          <summary className="text-sm font-medium cursor-pointer text-blue-600">
                            SEO & Marketing
                          </summary>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            {product.metaTitle && (
                              <p>
                                <span className="font-medium">Meta Title:</span>{" "}
                                {product.metaTitle}
                              </p>
                            )}
                            {product.metaDescription && (
                              <p>
                                <span className="font-medium">
                                  Meta Description:
                                </span>{" "}
                                {product.metaDescription}
                              </p>
                            )}
                            {product.tags && (
                              <p>
                                <span className="font-medium">Tags:</span>{" "}
                                {product.tags}
                              </p>
                            )}
                            {product.socialImage && (
                              <p>
                                <span className="font-medium">
                                  Social Image:
                                </span>{" "}
                                Available
                              </p>
                            )}
                          </div>
                        </details>

                        {/* Product Relationships */}
                        {product.relatedProducts &&
                          product.relatedProducts.length > 0 && (
                            <details className="mb-3">
                              <summary className="text-sm font-medium cursor-pointer text-blue-600">
                                Related Products
                              </summary>
                              <div className="mt-2 text-sm text-gray-600">
                                <p>
                                  Related: {product.relatedProducts.length}{" "}
                                  products
                                </p>
                              </div>
                            </details>
                          )}

                        {/* Reviews and Ratings */}
                        {product.reviews && product.reviews.length > 0 && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Reviews
                            </summary>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>Total Reviews: {product.reviews.length}</p>
                              <p>Average Rating: {product.rating}</p>
                            </div>
                          </details>
                        )}

                        {/* Analytics */}
                        {product.analytics && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Analytics
                            </summary>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p>Views: {product.analytics.views || 0}</p>
                              <p>
                                Add to Cart: {product.analytics.addToCart || 0}
                              </p>
                              <p>
                                Purchases: {product.analytics.purchases || 0}
                              </p>
                              <p>
                                Conversion Rate:{" "}
                                {product.analytics.conversionRate || 0}%
                              </p>
                            </div>
                          </details>
                        )}

                        {/* Material & Fabric Details */}
                        {(product.primaryFabric ||
                          product.material ||
                          product.fabricComposition) && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Material Details
                            </summary>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {product.primaryFabric && (
                                <p>
                                  <span className="font-medium">
                                    Primary Fabric:
                                  </span>{" "}
                                  {product.primaryFabric}
                                </p>
                              )}
                              {product.material && (
                                <p>
                                  <span className="font-medium">Material:</span>{" "}
                                  {product.material}
                                </p>
                              )}
                              {product.secondaryMaterial && (
                                <p>
                                  <span className="font-medium">
                                    Secondary Material:
                                  </span>{" "}
                                  {product.secondaryMaterial}
                                </p>
                              )}
                              {product.fabricComposition && (
                                <p>
                                  <span className="font-medium">
                                    Fabric Composition:
                                  </span>{" "}
                                  {product.fabricComposition}
                                </p>
                              )}
                              {product.fabricWeight && (
                                <p>
                                  <span className="font-medium">
                                    Fabric Weight:
                                  </span>{" "}
                                  {product.fabricWeight}
                                </p>
                              )}
                              {product.fabricTransparency && (
                                <p>
                                  <span className="font-medium">
                                    Transparency:
                                  </span>{" "}
                                  {product.fabricTransparency}
                                </p>
                              )}
                              {product.fabricProperties && (
                                <p>
                                  <span className="font-medium">
                                    Properties:
                                  </span>{" "}
                                  {product.fabricProperties}
                                </p>
                              )}
                              {product.finish && (
                                <p>
                                  <span className="font-medium">Finish:</span>{" "}
                                  {product.finish}
                                </p>
                              )}
                            </div>
                          </details>
                        )}

                        {/* SKU Codes Section */}
                        {product.skuCodes && product.skuCodes.length > 0 && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              SKU Codes
                            </summary>
                            <div className="mt-2 overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th
                                      scope="col"
                                      className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Size
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Color
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      SKU
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Stock
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {product.skuCodes.map((sku, index) => (
                                    <tr key={index}>
                                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                                        {sku.size}
                                      </td>
                                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                                        {sku.color}
                                      </td>
                                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                                        {sku.sku}
                                      </td>
                                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                                        {sku.stock || 0}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </details>
                        )}

                        {/* Product Specifications */}
                        <details className="mb-3">
                          <summary className="text-sm font-medium cursor-pointer text-blue-600">
                            Specifications
                          </summary>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            {product.fitType && (
                              <p>
                                <span className="font-medium">Fit:</span>{" "}
                                {product.fitType}
                              </p>
                            )}
                            {product.type && (
                              <p>
                                <span className="font-medium">Type:</span>{" "}
                                {product.type}
                              </p>
                            )}
                            {product.pattern && (
                              <p>
                                <span className="font-medium">Pattern:</span>{" "}
                                {product.pattern}
                              </p>
                            )}
                            {product.neckType && (
                              <p>
                                <span className="font-medium">Neck Type:</span>{" "}
                                {product.neckType}
                              </p>
                            )}
                            {product.sleeveType && (
                              <p>
                                <span className="font-medium">
                                  Sleeve Type:
                                </span>{" "}
                                {product.sleeveType}
                              </p>
                            )}
                            {product.length && (
                              <p>
                                <span className="font-medium">Length:</span>{" "}
                                {product.length}
                              </p>
                            )}
                            {product.closureType && (
                              <p>
                                <span className="font-medium">
                                  Closure Type:
                                </span>{" "}
                                {product.closureType}
                              </p>
                            )}
                            {product.stretchability && (
                              <p>
                                <span className="font-medium">
                                  Stretchability:
                                </span>{" "}
                                {product.stretchability}
                              </p>
                            )}
                            {product.adjustability && (
                              <p>
                                <span className="font-medium">
                                  Adjustability:
                                </span>{" "}
                                {product.adjustability}
                              </p>
                            )}

                            {/* Accessory Specific Details */}
                            {product.bagType && (
                              <p>
                                <span className="font-medium">Bag Type:</span>{" "}
                                {product.bagType}
                              </p>
                            )}
                            {product.compartments && (
                              <p>
                                <span className="font-medium">
                                  Compartments:
                                </span>{" "}
                                {product.compartments}
                              </p>
                            )}
                            {product.metalType && (
                              <p>
                                <span className="font-medium">Metal Type:</span>{" "}
                                {product.metalType}
                              </p>
                            )}
                            {product.gemstoneType && (
                              <p>
                                <span className="font-medium">Gemstone:</span>{" "}
                                {product.gemstoneType}
                              </p>
                            )}
                            {product.plating && (
                              <p>
                                <span className="font-medium">Plating:</span>{" "}
                                {product.plating}
                              </p>
                            )}
                            {product.watchType && (
                              <p>
                                <span className="font-medium">Watch Type:</span>{" "}
                                {product.watchType}
                              </p>
                            )}
                            {product.bandMaterial && (
                              <p>
                                <span className="font-medium">
                                  Band Material:
                                </span>{" "}
                                {product.bandMaterial}
                              </p>
                            )}
                            {product.waterResistance && (
                              <p>
                                <span className="font-medium">
                                  Water Resistance:
                                </span>{" "}
                                {product.waterResistance}
                              </p>
                            )}
                          </div>
                        </details>

                        {/* Dimensions & Weight */}
                        <details className="mb-3">
                          <summary className="text-sm font-medium cursor-pointer text-blue-600">
                            Dimensions & Weight
                          </summary>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            {product.weight && (
                              <p>
                                <span className="font-medium">Weight:</span>{" "}
                                {product.weight}
                              </p>
                            )}
                            {product.dimensions && (
                              <p>
                                <span className="font-medium">Dimensions:</span>{" "}
                                {product.dimensions}
                              </p>
                            )}
                            {product.packageDimensions && (
                              <p>
                                <span className="font-medium">
                                  Package Dimensions:
                                </span>{" "}
                                {product.packageDimensions}
                              </p>
                            )}
                            {product.packageWeight && (
                              <p>
                                <span className="font-medium">
                                  Package Weight:
                                </span>{" "}
                                {product.packageWeight}
                              </p>
                            )}
                            {product.packagingType && (
                              <p>
                                <span className="font-medium">
                                  Packaging Type:
                                </span>{" "}
                                {product.packagingType}
                              </p>
                            )}
                          </div>
                        </details>

                        {/* Model Information */}
                        {(product.modelHeight ||
                          product.modelWearingSize ||
                          product.fitNote) && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Model Information
                            </summary>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {product.modelHeight && (
                                <p>
                                  <span className="font-medium">
                                    Model Height:
                                  </span>{" "}
                                  {product.modelHeight}
                                </p>
                              )}
                              {product.modelWearingSize && (
                                <p>
                                  <span className="font-medium">
                                    Model Wearing:
                                  </span>{" "}
                                  {product.modelWearingSize}
                                </p>
                              )}
                              {product.fitNote && (
                                <p>
                                  <span className="font-medium">Fit Note:</span>{" "}
                                  {product.fitNote}
                                </p>
                              )}
                            </div>
                          </details>
                        )}

                        {/* Size Chart */}
                        {(product.sizeChartImage || product.sizeGuide) && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Size Guide
                            </summary>
                            <div className="mt-2">
                              {product.sizeChartImage && (
                                <img
                                  src={product.sizeChartImage}
                                  alt="Size Chart"
                                  className="w-32 h-auto object-cover rounded border mb-2"
                                />
                              )}
                              {product.sizeGuide && (
                                <p className="text-sm text-gray-600">
                                  {product.sizeGuide}
                                </p>
                              )}
                            </div>
                          </details>
                        )}

                        {/* Descriptions */}
                        {(product.shortDescription ||
                          product.fullDescription ||
                          product.keyFeatures ||
                          product.stylingTips) && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Descriptions
                            </summary>
                            <div className="mt-2 text-sm text-gray-600">
                              {product.shortDescription && (
                                <p className="mb-2">
                                  {product.shortDescription}
                                </p>
                              )}
                              {product.fullDescription && (
                                <p className="mb-2">
                                  {product.fullDescription}
                                </p>
                              )}
                              {product.keyFeatures && (
                                <div className="mb-2">
                                  <p className="font-medium">Key Features:</p>
                                  <p>{product.keyFeatures}</p>
                                </div>
                              )}
                              {product.stylingTips && (
                                <div>
                                  <p className="font-medium">Styling Tips:</p>
                                  <p>{product.stylingTips}</p>
                                </div>
                              )}
                            </div>
                          </details>
                        )}

                        {/* Care Instructions */}
                        {(product.washMethod ||
                          product.washTemperature ||
                          product.bleach ||
                          product.dryMethod ||
                          product.ironingDetails ||
                          product.specialCare ||
                          product.storage) && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Care Instructions
                            </summary>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {product.washMethod && (
                                <p>
                                  <span className="font-medium">
                                    Wash Method:
                                  </span>{" "}
                                  {product.washMethod}
                                </p>
                              )}
                              {product.washTemperature && (
                                <p>
                                  <span className="font-medium">
                                    Temperature:
                                  </span>{" "}
                                  {product.washTemperature}
                                </p>
                              )}
                              {product.bleach && (
                                <p>
                                  <span className="font-medium">Bleach:</span>{" "}
                                  {product.bleach}
                                </p>
                              )}
                              {product.dryMethod && (
                                <p>
                                  <span className="font-medium">
                                    Dry Method:
                                  </span>{" "}
                                  {product.dryMethod}
                                </p>
                              )}
                              {product.ironingDetails && (
                                <p>
                                  <span className="font-medium">Ironing:</span>{" "}
                                  {product.ironingDetails}
                                </p>
                              )}
                              {product.specialCare && (
                                <p>
                                  <span className="font-medium">
                                    Special Care:
                                  </span>{" "}
                                  {product.specialCare}
                                </p>
                              )}
                              {product.storage && (
                                <p>
                                  <span className="font-medium">Storage:</span>{" "}
                                  {product.storage}
                                </p>
                              )}
                            </div>
                          </details>
                        )}

                        {/* Media */}
                        {(product.videoLink || product.instagramLink) && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Media
                            </summary>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {product.videoLink && (
                                <p>
                                  <span className="font-medium">Video:</span>
                                  <a
                                    href={product.videoLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline ml-1"
                                  >
                                    Watch Video
                                  </a>
                                </p>
                              )}
                              {product.instagramLink && (
                                <p>
                                  <span className="font-medium">
                                    Instagram:
                                  </span>
                                  <a
                                    href={product.instagramLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline ml-1"
                                  >
                                    View on Instagram
                                  </a>
                                </p>
                              )}
                            </div>
                          </details>
                        )}

                        {/* Logistics */}
                        <details className="mb-3">
                          <summary className="text-sm font-medium cursor-pointer text-blue-600">
                            Logistics
                          </summary>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            {product.warehouseLocation && (
                              <p>
                                <span className="font-medium">Warehouse:</span>{" "}
                                {product.warehouseLocation}
                              </p>
                            )}
                            {product.deliveryAvailability && (
                              <p>
                                <span className="font-medium">Delivery:</span>{" "}
                                {product.deliveryAvailability}
                              </p>
                            )}
                            {product.codOption && (
                              <p>
                                <span className="font-medium">COD:</span>{" "}
                                {product.codOption}
                              </p>
                            )}
                            {product.returnPolicy && (
                              <p>
                                <span className="font-medium">
                                  Return Policy:
                                </span>{" "}
                                {product.returnPolicy}
                              </p>
                            )}
                            {product.shippingClass && (
                              <p>
                                <span className="font-medium">
                                  Shipping Class:
                                </span>{" "}
                                {product.shippingClass}
                              </p>
                            )}
                            {product.freeShipping && (
                              <p>
                                <span className="font-medium">
                                  Free Shipping:
                                </span>{" "}
                                {product.freeShipping ? "Yes" : "No"}
                              </p>
                            )}
                          </div>
                        </details>

                        {/* Pricing Strategy */}
                        {(product.tieredPricing ||
                          product.volumeDiscount ||
                          product.specialPricing) && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Pricing Strategy
                            </summary>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {product.tieredPricing && (
                                <p>
                                  <span className="font-medium">
                                    Tiered Pricing:
                                  </span>{" "}
                                  Available
                                </p>
                              )}
                              {product.volumeDiscount && (
                                <p>
                                  <span className="font-medium">
                                    Volume Discount:
                                  </span>{" "}
                                  {product.volumeDiscount}
                                </p>
                              )}
                              {product.specialPricing && (
                                <p>
                                  <span className="font-medium">
                                    Special Pricing:
                                  </span>{" "}
                                  {product.specialPricing}
                                </p>
                              )}
                            </div>
                          </details>
                        )}

                        {/* Tax Management */}
                        {(product.taxClass ||
                          product.taxExempt ||
                          product.regionSpecificTax) && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Tax Management
                            </summary>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {product.taxClass && (
                                <p>
                                  <span className="font-medium">
                                    Tax Class:
                                  </span>{" "}
                                  {product.taxClass}
                                </p>
                              )}
                              {product.taxExempt && (
                                <p>
                                  <span className="font-medium">
                                    Tax Exempt:
                                  </span>{" "}
                                  {product.taxExempt ? "Yes" : "No"}
                                </p>
                              )}
                              {product.regionSpecificTax && (
                                <p>
                                  <span className="font-medium">
                                    Region Specific Tax:
                                  </span>{" "}
                                  Available
                                </p>
                              )}
                            </div>
                          </details>
                        )}

                        {/* Product Customization */}
                        {(product.customTextFields ||
                          product.productOptions ||
                          product.personalization) && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Customization
                            </summary>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {product.customTextFields && (
                                <p>
                                  <span className="font-medium">
                                    Custom Text:
                                  </span>{" "}
                                  Available
                                </p>
                              )}
                              {product.productOptions && (
                                <p>
                                  <span className="font-medium">
                                    Product Options:
                                  </span>{" "}
                                  Available
                                </p>
                              )}
                              {product.personalization && (
                                <p>
                                  <span className="font-medium">
                                    Personalization:
                                  </span>{" "}
                                  {product.personalization}
                                </p>
                              )}
                            </div>
                          </details>
                        )}

                        {/* Product Lifecycle */}
                        {(product.launchDate ||
                          product.endOfLife ||
                          product.seasonal) && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Product Lifecycle
                            </summary>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {product.launchDate && (
                                <p>
                                  <span className="font-medium">
                                    Launch Date:
                                  </span>{" "}
                                  {new Date(
                                    product.launchDate,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                              {product.endOfLife && (
                                <p>
                                  <span className="font-medium">
                                    End of Life:
                                  </span>{" "}
                                  {new Date(
                                    product.endOfLife,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                              {product.seasonal && (
                                <p>
                                  <span className="font-medium">Seasonal:</span>{" "}
                                  {product.seasonal}
                                </p>
                              )}
                            </div>
                          </details>
                        )}

                        {/* Multi-channel Integration */}
                        {(product.marketplaceSync ||
                          product.channelPricing ||
                          product.channelInventory) && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Multi-channel
                            </summary>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {product.marketplaceSync && (
                                <p>
                                  <span className="font-medium">
                                    Marketplace Sync:
                                  </span>{" "}
                                  {product.marketplaceSync.join(", ")}
                                </p>
                              )}
                              {product.channelPricing && (
                                <p>
                                  <span className="font-medium">
                                    Channel Pricing:
                                  </span>{" "}
                                  Available
                                </p>
                              )}
                              {product.channelInventory && (
                                <p>
                                  <span className="font-medium">
                                    Channel Inventory:
                                  </span>{" "}
                                  Available
                                </p>
                              )}
                            </div>
                          </details>
                        )}

                        {/* Compliance */}
                        <details className="mb-3">
                          <summary className="text-sm font-medium cursor-pointer text-blue-600">
                            Compliance
                          </summary>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            {product.countryOfOrigin && (
                              <p>
                                <span className="font-medium">
                                  Country of Origin:
                                </span>{" "}
                                {product.countryOfOrigin}
                              </p>
                            )}
                            {product.manufacturerDetails && (
                              <p>
                                <span className="font-medium">
                                  Manufacturer:
                                </span>{" "}
                                {product.manufacturerDetails}
                              </p>
                            )}
                            {product.packerDetails && (
                              <p>
                                <span className="font-medium">Packer:</span>{" "}
                                {product.packerDetails}
                              </p>
                            )}
                            {product.sellerAddress && (
                              <p>
                                <span className="font-medium">
                                  Seller Address:
                                </span>{" "}
                                {product.sellerAddress}
                              </p>
                            )}
                            {product.certifications && (
                              <p>
                                <span className="font-medium">
                                  Certifications:
                                </span>{" "}
                                {product.certifications.join(", ")}
                              </p>
                            )}
                          </div>
                        </details>

                        {/* Additional Information */}
                        {(product.tags ||
                          product.authCertificate ||
                          product.warranty) && (
                          <details className="mb-3">
                            <summary className="text-sm font-medium cursor-pointer text-blue-600">
                              Additional Info
                            </summary>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {product.tags && (
                                <p>
                                  <span className="font-medium">Tags:</span>{" "}
                                  {product.tags}
                                </p>
                              )}
                              {product.authCertificate && (
                                <p>
                                  <span className="font-medium">
                                    Authenticity:
                                  </span>
                                  <span className="text-green-600 ml-1">
                                    Certificate Available
                                  </span>
                                </p>
                              )}
                              {product.warranty && (
                                <p>
                                  <span className="font-medium">Warranty:</span>{" "}
                                  {product.warranty}
                                </p>
                              )}
                            </div>
                          </details>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id || product.id)}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(product)}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                          >
                            <Copy size={16} className="mr-1" />
                            Duplicate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-8 border border-gray-200 rounded-lg bg-gray-50 text-center">
                <p className="text-gray-500 mb-4">No products added yet</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      resetProductForm();
                      setActiveTab("addproduct");
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Your First Product
                  </button>
                  <button
                    onClick={() => {
                      resetProductForm();
                      setActiveTab("addaccessory");
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Add Your First Accessory
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Stock & Variant Management Modal */}
            {showStockModal && selectedProduct && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Manage Product</h3>
                    <button
                      onClick={() => setShowStockModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Product:{" "}
                      <span className="font-medium">
                        {selectedProduct.name}
                      </span>
                    </p>

                    {/* Tab Navigation */}
                    <div className="flex border-b mb-4">
                      <button
                        onClick={() => setVariantTab("stock")}
                        className={`px-4 py-2 text-sm font-medium ${
                          variantTab === "stock"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Stock Management
                      </button>
                      <button
                        onClick={() => setVariantTab("colors")}
                        className={`px-4 py-2 text-sm font-medium ${
                          variantTab === "colors"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Colors
                      </button>
                      <button
                        onClick={() => setVariantTab("sizes")}
                        className={`px-4 py-2 text-sm font-medium ${
                          variantTab === "sizes"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Sizes
                      </button>
                      <button
                        onClick={() => setVariantTab("seo")}
                        className={`px-4 py-2 text-sm font-medium ${
                          variantTab === "seo"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        SEO
                      </button>
                      <button
                        onClick={() => setVariantTab("pricing")}
                        className={`px-4 py-2 text-sm font-medium ${
                          variantTab === "pricing"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Pricing
                      </button>
                    </div>

                    {/* Stock Management Tab */}
                    {variantTab === "stock" && (
                      <div>
                        <p className="text-sm text-gray-600 mb-4">
                          Current Total Stock:{" "}
                          <span className="font-medium">
                            {selectedProduct.stockQuantity || 0}
                          </span>
                        </p>

                        {/* Toggle between Add and Set Stock */}
                        <div className="mb-4">
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="stockUpdateType"
                                value="add"
                                checked={stockUpdateType === "add"}
                                onChange={() => setStockUpdateType("add")}
                                className="mr-2"
                              />
                              <span className="text-sm">
                                Add to existing stock
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="stockUpdateType"
                                value="set"
                                checked={stockUpdateType === "set"}
                                onChange={() => setStockUpdateType("set")}
                                className="mr-2"
                              />
                              <span className="text-sm">
                                Set new stock quantity
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* Low Stock Alert */}
                        <div className="mb-4 p-3 bg-yellow-50 rounded-md">
                          <div className="flex items-center">
                            <AlertTriangle
                              size={16}
                              className="text-yellow-600 mr-2"
                            />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">
                                Low Stock Alert
                              </p>
                              <p className="text-xs text-yellow-700">
                                Notify when stock falls below:
                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    selectedProduct.lowStockThreshold || 10
                                  }
                                  onChange={(e) =>
                                    setSelectedProduct({
                                      ...selectedProduct,
                                      lowStockThreshold:
                                        parseInt(e.target.value) || 10,
                                    })
                                  }
                                  className="w-16 ml-2 px-2 py-1 border border-yellow-300 rounded text-sm"
                                />
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedProduct.skuCodes &&
                        selectedProduct.skuCodes.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium">
                              {stockUpdateType === "add"
                                ? "Add Stock by SKU:"
                                : "Set Stock by SKU:"}
                            </p>
                            {selectedProduct.skuCodes.map((sku, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <div className="flex-1 text-xs text-gray-600">
                                  {sku.size} - {sku.color} ({sku.sku})
                                  <span className="ml-1 text-gray-500">
                                    (Current: {sku.stock || 0})
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder={
                                    stockUpdateType === "add" ? "Add" : "Set"
                                  }
                                  value={
                                    stockUpdateType === "add"
                                      ? sku.addStock || ""
                                      : sku.newStock || ""
                                  }
                                  onChange={(e) => {
                                    const updatedSkus = [
                                      ...selectedProduct.skuCodes,
                                    ];
                                    if (stockUpdateType === "add") {
                                      updatedSkus[index].addStock =
                                        e.target.value;
                                    } else {
                                      updatedSkus[index].newStock =
                                        e.target.value;
                                    }
                                    setSelectedProduct({
                                      ...selectedProduct,
                                      skuCodes: updatedSkus,
                                    });
                                  }}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                {stockUpdateType === "add" && (
                                  <div className="text-xs text-gray-500 w-16">
                                    New:{" "}
                                    {(sku.stock || 0) +
                                      (parseInt(sku.addStock) || 0)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {stockUpdateType === "add"
                                ? "Stock to Add"
                                : "New Stock Quantity"}
                            </label>
                            <input
                              type="number"
                              min="0"
                              placeholder={
                                stockUpdateType === "add"
                                  ? "Enter quantity to add"
                                  : "Enter new total quantity"
                              }
                              value={
                                stockUpdateType === "add"
                                  ? selectedProduct.addStock || ""
                                  : selectedProduct.newStock || ""
                              }
                              onChange={(e) => {
                                if (stockUpdateType === "add") {
                                  setSelectedProduct({
                                    ...selectedProduct,
                                    addStock: e.target.value,
                                  });
                                } else {
                                  setSelectedProduct({
                                    ...selectedProduct,
                                    newStock: e.target.value,
                                  });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {stockUpdateType === "add" && (
                              <p className="text-xs text-gray-500 mt-1">
                                New total:{" "}
                                {(selectedProduct.stockQuantity || 0) +
                                  (parseInt(selectedProduct.addStock) || 0)}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Stock History Preview */}
                        <div className="mt-4 p-2 bg-gray-50 rounded">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Update Summary:
                          </p>
                          <p className="text-xs text-gray-600">
                            {stockUpdateType === "add"
                              ? `Adding ${
                                  selectedProduct.skuCodes
                                    ? selectedProduct.skuCodes.reduce(
                                        (sum, sku) =>
                                          sum + (parseInt(sku.addStock) || 0),
                                        0,
                                      )
                                    : parseInt(selectedProduct.addStock) || 0
                                } units to existing stock`
                              : `Setting new stock quantity to ${
                                  selectedProduct.skuCodes
                                    ? selectedProduct.skuCodes.reduce(
                                        (sum, sku) =>
                                          sum + (parseInt(sku.newStock) || 0),
                                        0,
                                      )
                                    : parseInt(selectedProduct.newStock) || 0
                                } units`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Colors Tab */}
                    {variantTab === "colors" && (
                      <div>
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Current Colors:
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(selectedProduct.colors
                              ? selectedProduct.colors.split(", ")
                              : []
                            ).map((color, index) => (
                              <div
                                key={index}
                                className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                              >
                                <span className="text-sm">{color}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const colors =
                                      selectedProduct.colors.split(", ");
                                    colors.splice(index, 1);
                                    setSelectedProduct({
                                      ...selectedProduct,
                                      colors: colors.join(", "),
                                    });
                                  }}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add New Color:
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedProduct.newColorInput || ""}
                              onChange={(e) =>
                                setSelectedProduct({
                                  ...selectedProduct,
                                  newColorInput: e.target.value,
                                })
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter color name"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  selectedProduct.newColorInput &&
                                  selectedProduct.newColorInput.trim()
                                ) {
                                  const colors = selectedProduct.colors
                                    ? selectedProduct.colors.split(", ")
                                    : [];
                                  if (
                                    !colors.includes(
                                      selectedProduct.newColorInput.trim(),
                                    )
                                  ) {
                                    const newColors = [
                                      ...colors,
                                      selectedProduct.newColorInput.trim(),
                                    ].join(", ");
                                    setSelectedProduct({
                                      ...selectedProduct,
                                      colors: newColors,
                                      newColorInput: "",
                                    });
                                  }
                                }
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Generate SKUs for new color */}
                        {selectedProduct.sizes && selectedProduct.colors && (
                          <div className="mt-4 p-2 bg-blue-50 rounded">
                            <p className="text-xs text-blue-700 mb-2">
                              New SKUs will be generated for the new color with
                              existing sizes
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                const sizes = selectedProduct.sizes.split(", ");
                                const colors =
                                  selectedProduct.colors.split(", ");
                                const brandPrefix = selectedProduct.brandName
                                  ? selectedProduct.brandName
                                      .substring(0, 3)
                                      .toUpperCase()
                                  : "BRD";
                                const categoryPrefix = selectedProduct.category
                                  ? selectedProduct.category
                                      .substring(0, 3)
                                      .toUpperCase()
                                  : "CAT";

                                const existingSkus =
                                  selectedProduct.skuCodes || [];
                                const existingSkuKeys = new Set(
                                  existingSkus.map(
                                    (sku) => `${sku.size}-${sku.color}`,
                                  ),
                                );

                                const newSkuCodes = [...existingSkus];

                                sizes.forEach((size) => {
                                  colors.forEach((color) => {
                                    const skuKey = `${size}-${color}`;
                                    if (!existingSkuKeys.has(skuKey)) {
                                      const colorCode = color
                                        .substring(0, 3)
                                        .toUpperCase();
                                      const sizeCode = size.toUpperCase();
                                      const skuCode = `${brandPrefix}-${categoryPrefix}-${colorCode}-${sizeCode}`;
                                      newSkuCodes.push({
                                        size: size,
                                        color: color,
                                        sku: skuCode,
                                        stock: 0,
                                      });
                                    }
                                  });
                                });

                                setSelectedProduct({
                                  ...selectedProduct,
                                  skuCodes: newSkuCodes,
                                });
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                              Generate SKUs for All Variants
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sizes Tab */}
                    {variantTab === "sizes" && (
                      <div>
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Current Sizes:
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(selectedProduct.sizes
                              ? selectedProduct.sizes.split(", ")
                              : []
                            ).map((size, index) => (
                              <div
                                key={index}
                                className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                              >
                                <span className="text-sm">{size}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const sizes =
                                      selectedProduct.sizes.split(", ");
                                    sizes.splice(index, 1);
                                    setSelectedProduct({
                                      ...selectedProduct,
                                      sizes: sizes.join(", "),
                                    });
                                  }}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add New Size:
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedProduct.newSizeInput || ""}
                              onChange={(e) =>
                                setSelectedProduct({
                                  ...selectedProduct,
                                  newSizeInput: e.target.value,
                                })
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter size (e.g., XL, 42)"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  selectedProduct.newSizeInput &&
                                  selectedProduct.newSizeInput.trim()
                                ) {
                                  const sizes = selectedProduct.sizes
                                    ? selectedProduct.sizes.split(", ")
                                    : [];
                                  if (
                                    !sizes.includes(
                                      selectedProduct.newSizeInput.trim(),
                                    )
                                  ) {
                                    const newSizes = [
                                      ...sizes,
                                      selectedProduct.newSizeInput.trim(),
                                    ].join(", ");
                                    setSelectedProduct({
                                      ...selectedProduct,
                                      sizes: newSizes,
                                      newSizeInput: "",
                                    });
                                  }
                                }
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Generate SKUs for new size */}
                        {selectedProduct.sizes && selectedProduct.colors && (
                          <div className="mt-4 p-2 bg-blue-50 rounded">
                            <p className="text-xs text-blue-700 mb-2">
                              New SKUs will be generated for the new size with
                              existing colors
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                const sizes = selectedProduct.sizes.split(", ");
                                const colors =
                                  selectedProduct.colors.split(", ");
                                const brandPrefix = selectedProduct.brandName
                                  ? selectedProduct.brandName
                                      .substring(0, 3)
                                      .toUpperCase()
                                  : "BRD";
                                const categoryPrefix = selectedProduct.category
                                  ? selectedProduct.category
                                      .substring(0, 3)
                                      .toUpperCase()
                                  : "CAT";

                                const existingSkus =
                                  selectedProduct.skuCodes || [];
                                const existingSkuKeys = new Set(
                                  existingSkus.map(
                                    (sku) => `${sku.size}-${sku.color}`,
                                  ),
                                );

                                const newSkuCodes = [...existingSkus];

                                sizes.forEach((size) => {
                                  colors.forEach((color) => {
                                    const skuKey = `${size}-${color}`;
                                    if (!existingSkuKeys.has(skuKey)) {
                                      const colorCode = color
                                        .substring(0, 3)
                                        .toUpperCase();
                                      const sizeCode = size.toUpperCase();
                                      const skuCode = `${brandPrefix}-${categoryPrefix}-${colorCode}-${sizeCode}`;
                                      newSkuCodes.push({
                                        size: size,
                                        color: color,
                                        sku: skuCode,
                                        stock: 0,
                                      });
                                    }
                                  });
                                });

                                setSelectedProduct({
                                  ...selectedProduct,
                                  skuCodes: newSkuCodes,
                                });
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                              Generate SKUs for All Variants
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SEO Tab */}
                    {variantTab === "seo" && (
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product URL Slug
                          </label>
                          <input
                            type="text"
                            value={selectedProduct.slug || ""}
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                slug: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="product-url-slug"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            URL: /products/
                            {selectedProduct.slug || "product-url-slug"}
                          </p>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Title
                          </label>
                          <input
                            type="text"
                            value={selectedProduct.metaTitle || ""}
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                metaTitle: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="SEO Meta Title"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Recommended: 50-60 characters. Current:{" "}
                            {selectedProduct.metaTitle
                              ? selectedProduct.metaTitle.length
                              : 0}
                          </p>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Description
                          </label>
                          <textarea
                            value={selectedProduct.metaDescription || ""}
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                metaDescription: e.target.value,
                              })
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="SEO Meta Description"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Recommended: 150-160 characters. Current:{" "}
                            {selectedProduct.metaDescription
                              ? selectedProduct.metaDescription.length
                              : 0}
                          </p>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Social Media Image
                          </label>
                          <div className="flex items-center space-x-4 mb-2">
                            <input
                              type="file"
                              id="social-image"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setSelectedProduct({
                                      ...selectedProduct,
                                      socialImage: reader.result,
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor="social-image"
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer"
                            >
                              Upload Social Image
                            </label>
                          </div>
                          {selectedProduct.socialImage && (
                            <div className="mt-2">
                              <img
                                src={selectedProduct.socialImage}
                                alt="Social Media"
                                className="w-32 h-auto object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedProduct({
                                    ...selectedProduct,
                                    socialImage: null,
                                  })
                                }
                                className="mt-2 text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove Social Image
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Tags
                          </label>
                          <input
                            type="text"
                            value={selectedProduct.tags || ""}
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                tags: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="tag1, tag2, tag3"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Separate tags with commas
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pricing Tab */}
                    {variantTab === "pricing" && (
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pricing Strategy
                          </label>
                          <select
                            value={
                              selectedProduct.pricingStrategy || "standard"
                            }
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                pricingStrategy: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="standard">Standard Pricing</option>
                            <option value="tiered">Tiered Pricing</option>
                            <option value="volume">Volume Discount</option>
                            <option value="membership">
                              Membership Pricing
                            </option>
                          </select>
                        </div>

                        {selectedProduct.pricingStrategy === "tiered" && (
                          <div className="mb-4 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Tiered Pricing
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Min Qty"
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <span>-</span>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Max Qty"
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Price"
                                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <button className="px-2 py-1 bg-red-500 text-white rounded text-sm">
                                  <X size={14} />
                                </button>
                              </div>
                              <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                                Add Tier
                              </button>
                            </div>
                          </div>
                        )}

                        {selectedProduct.pricingStrategy === "volume" && (
                          <div className="mb-4 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Volume Discount
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Min Qty"
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <span>%</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  placeholder="Discount"
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <button className="px-2 py-1 bg-red-500 text-white rounded text-sm">
                                  <X size={14} />
                                </button>
                              </div>
                              <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                                Add Discount
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedProduct.freeShipping || false}
                              onChange={(e) =>
                                setSelectedProduct({
                                  ...selectedProduct,
                                  freeShipping: e.target.checked,
                                })
                              }
                              className="mr-2"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Free Shipping
                            </span>
                          </label>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Shipping Class
                          </label>
                          <select
                            value={selectedProduct.shippingClass || "standard"}
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                shippingClass: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="standard">Standard Shipping</option>
                            <option value="express">Express Shipping</option>
                            <option value="overnight">
                              Overnight Shipping
                            </option>
                            <option value="international">
                              International Shipping
                            </option>
                            <option value="local">Local Pickup</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tax Class
                          </label>
                          <select
                            value={selectedProduct.taxClass || "standard"}
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                taxClass: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="standard">Standard Tax</option>
                            <option value="reduced">Reduced Tax</option>
                            <option value="zero">Zero Tax</option>
                            <option value="exempt">Tax Exempt</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={() => setShowStockModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const updatedProduct = { ...selectedProduct };

                        // Initialize stock history if it doesn't exist
                        if (!updatedProduct.stockHistory) {
                          updatedProduct.stockHistory = [];
                        }

                        // Handle stock updates
                        if (variantTab === "stock") {
                          updatedProduct.stockHistory.push({
                            date: new Date().toISOString(),
                            previousStock: updatedProduct.stockQuantity || 0,
                            updateType: stockUpdateType,
                          });

                          if (
                            updatedProduct.skuCodes &&
                            updatedProduct.skuCodes.length > 0
                          ) {
                            updatedProduct.skuCodes =
                              updatedProduct.skuCodes.map((sku) => {
                                const updatedSku = { ...sku };
                                if (stockUpdateType === "add") {
                                  updatedSku.stock =
                                    (sku.stock || 0) +
                                    (parseInt(sku.addStock) || 0);
                                  delete updatedSku.addStock;
                                } else {
                                  updatedSku.stock =
                                    parseInt(sku.newStock) || 0;
                                  delete updatedSku.newStock;
                                }
                                return updatedSku;
                              });

                            updatedProduct.stockQuantity =
                              updatedProduct.skuCodes.reduce(
                                (sum, sku) => sum + (parseInt(sku.stock) || 0),
                                0,
                              );
                          } else {
                            if (stockUpdateType === "add") {
                              updatedProduct.stockQuantity =
                                (updatedProduct.stockQuantity || 0) +
                                (parseInt(updatedProduct.addStock) || 0);
                              delete updatedProduct.addStock;
                            } else {
                              updatedProduct.stockQuantity =
                                parseInt(updatedProduct.newStock) || 0;
                              delete updatedProduct.newStock;
                            }
                          }
                        }

                        // Clean up temporary inputs
                        delete updatedProduct.newColorInput;
                        delete updatedProduct.newSizeInput;

                        // Add last updated timestamp
                        updatedProduct.lastUpdated = new Date().toISOString();

                        // Update the product in the products array
                        const updatedProducts = products.map((p) =>
                          (p._id || p.id) === (updatedProduct._id || updatedProduct.id) ? updatedProduct : p,
                        );
                        setProducts(updatedProducts);

                        // Close the modal
                        setShowStockModal(false);

                        // Show success message
                        alert(
                          `${
                            variantTab === "stock"
                              ? `Stock ${stockUpdateType === "add" ? "added" : "updated"}`
                              : variantTab === "colors"
                                ? "Colors updated"
                                : variantTab === "sizes"
                                  ? "Sizes updated"
                                  : variantTab === "seo"
                                    ? "SEO details updated"
                                    : "Pricing updated"
                          } successfully!`,
                        );
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {variantTab === "stock"
                        ? stockUpdateType === "add"
                          ? "Add Stock"
                          : "Update Stock"
                        : "Update Product"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'addproduct':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingProduct ? 'Edit Fashion Product' : 'Add New Fashion Product'}
              </h2>
              <button
                onClick={() => {
                  resetProductForm();
                  setActiveTab('products');
                }}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                <X size={20} className="mr-2" />
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="space-y-6">
  {/* Basic Information Section */}
  <div className="border-b pb-4">
    <h4 className="text-md font-medium text-gray-900 mb-3">Basic Product Information</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name / Title *</label>
        <input 
          type="text" 
          value={productForm.name}
          onChange={(e) => setProductForm({...productForm, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter product name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
        <input 
          type="text" 
          value={productForm.brandName}
          onChange={(e) => setProductForm({...productForm, brandName: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter brand name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
        <select 
          value={productForm.category}
          onChange={(e) => {
            setProductForm({
              ...productForm, 
              category: e.target.value, 
              subCategory: '' // Reset subcategory when category changes
            });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Category</option>
          <option value="Men's Clothing">Men's Clothing</option>
          <option value="Women's Clothing">Women's Clothing</option>
          <option value="Ethnic Wear">Ethnic Wear</option>
          <option value="Western Wear">Western Wear</option>
        </select>
      </div>
      
      {/* --- UPDATED SUB-CATEGORY SECTION --- */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Category *</label>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Combined Dropdown (Predefined + Custom) */}
          <div className="md:col-span-8">
            <select 
              value={productForm.subCategory}
              onChange={(e) => setProductForm({...productForm, subCategory: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!productForm.category}
            >
              <option value="">{productForm.category ? "Select Sub-Category" : "Select Category First"}</option>
              {productForm.category && [
                ...(categorySubCategories[productForm.category] || []),
                ...(customSubCategories[productForm.category] || [])
              ].map((sub, index) => (
                <option key={`${sub}-${index}`} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Add New Button */}
          <div className="md:col-span-4 flex items-end">
            <button
              type="button"
              onClick={() => {
                if(!productForm.category) {
                  alert("Please select a Category first.");
                  return;
                }
                setIsAddingNewSubCategory(!isAddingNewSubCategory);
              }}
              disabled={!productForm.category}
              className="w-full px-3 py-2 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center"
            >
              {isAddingNewSubCategory ? 'Cancel' : '+ Add New Sub-category'}
            </button>
          </div>
        </div>

        {/* Conditional Input Field for New Sub-category */}
        {isAddingNewSubCategory && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200 flex items-center space-x-2">
            <input
              type="text"
              value={newSubCategoryInput}
              onChange={(e) => setNewSubCategoryInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Type new sub-category name..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddNewSubCategory()}
            />
            <button
              type="button"
              onClick={handleAddNewSubCategory}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingNewSubCategory(false);
                setNewSubCategoryInput('');
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Discard
            </button>
          </div>
        )}
      </div>
      {/* --- END UPDATED SECTION --- */}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product MRP (₹) *</label>
        <input 
          type="number" 
          value={productForm.price}
          onChange={(e) => {
            const price = e.target.value;
            setProductForm({
              ...productForm, 
              price: price,
              // If Selling Price is empty, default it to MRP for now, or calculate GST inclusive
              sellingPrice: productForm.sellingPrice || price
            });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter MRP"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹) *</label>
        <input 
          type="number" 
          value={productForm.sellingPrice || productForm.price}
          onChange={(e) => setProductForm({...productForm, sellingPrice: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Selling Price"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">GST Inclusive Price (₹) *</label>
        <input 
          type="text" 
          value={productForm.sellingPrice || productForm.price || '0.00'}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
          placeholder="Auto-calculated"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%) *</label>
        <select 
          value={productForm.gstPercentage}
          onChange={(e) => setProductForm({...productForm, gstPercentage: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select GST</option>
          <option value="0%">0%</option>
          <option value="5%">5%</option>
          <option value="12%">12%</option>
          <option value="18%">18%</option>
          <option value="28%">28%</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code *</label>
        <input 
          type="text" 
          value={productForm.hsnCode}
          onChange={(e) => setProductForm({...productForm, hsnCode: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Auto-generated based on norms"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Country of Origin *</label>
        <input 
          type="text" 
          value={productForm.countryOfOrigin}
          onChange={(e) => setProductForm({...productForm, countryOfOrigin: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., India"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Material / Fabric *</label>
        <select 
          value={productForm.primaryFabric || ''}
          onChange={(e) => setProductForm({...productForm, primaryFabric: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Fabric</option>
          <option value="Cotton">Cotton</option>
          <option value="Silk">Silk</option>
          <option value="Linen">Linen</option>
          <option value="Wool">Wool</option>
          <option value="Polyester">Polyester</option>
          <option value="Rayon">Rayon</option>
          <option value="Nylon">Nylon</option>
          <option value="Viscose">Viscose</option>
          <option value="Acrylic">Acrylic</option>
          <option value="Spandex">Spandex</option>
          <option value="Denim">Denim</option>
          <option value="Velvet">Velvet</option>
          <option value="Chiffon">Chiffon</option>
          <option value="Georgette">Georgette</option>
          <option value="Satin">Satin</option>
          <option value="Crepe">Crepe</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fit / Pattern *</label>
        <select 
          value={productForm.fitType}
          onChange={(e) => setProductForm({...productForm, fitType: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Fit</option>
          <option value="Regular Fit">Regular Fit</option>
          <option value="Slim Fit">Slim Fit</option>
          <option value="Oversized">Oversized</option>
          <option value="Skinny Fit">Skinny Fit</option>
          <option value="Relaxed Fit">Relaxed Fit</option>
          <option value="Loose Fit">Loose Fit</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
        <input 
          type="number" 
          value={productForm.stockQuantity}
          onChange={(e) => setProductForm({...productForm, stockQuantity: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter total stock"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Weight (grams/kg) *</label>
        <input 
          type="text" 
          value={productForm.weight}
          onChange={(e) => setProductForm({...productForm, weight: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 500g"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (L×W×H) *</label>
        <input 
          type="text" 
          value={productForm.packageDimensions}
          onChange={(e) => setProductForm({...productForm, packageDimensions: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 30x20x5 cm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse / Pickup Location *</label>
        <textarea 
          value={productForm.warehouseLocation}
          onChange={(e) => setProductForm({...productForm, warehouseLocation: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter warehouse location"
          required
        />
      </div>
      <div className="md:col-span-2">
         <label className="block text-sm font-medium text-gray-700 mb-2">Product Description *</label>
         <textarea 
           value={productForm.fullDescription}
           onChange={(e) => setProductForm({...productForm, fullDescription: e.target.value})}
           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
           rows={4}
           placeholder="Detailed product description"
           required
         />
      </div>
    </div>
  </div>
  
  {/* Color Variants Section */}
  <div className="border-b pb-4">
    <h4 className="text-md font-medium text-gray-900 mb-3">Color and Size Availability *</h4>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
        <div className="flex items-center space-x-2 mb-2">
          <input 
            type="text" 
            value={productForm.colorInput || ''}
            onChange={(e) => setProductForm({...productForm, colorInput: e.target.value})}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter color name"
          />
          <button 
            type="button"
            onClick={() => {
              if (productForm.colorInput && productForm.colorInput.trim()) {
                const colors = productForm.colors ? productForm.colors.split(', ') : [];
                if (!colors.includes(productForm.colorInput.trim())) {
                  setProductForm({
                    ...productForm, 
                    colors: [...colors, productForm.colorInput.trim()].join(', '),
                    colorInput: ''
                  });
                }
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(productForm.colors ? productForm.colors.split(', ') : []).map((color, index) => (
            <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
              <span className="text-sm">{color}</span>
              <button 
                type="button"
                onClick={() => {
                  const colors = productForm.colors.split(', ');
                  colors.splice(index, 1);
                  setProductForm({...productForm, colors: colors.join(', ')});
                }}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
        <div className="flex items-center space-x-2 mb-2">
          <input 
            type="text" 
            value={productForm.sizeInput || ''}
            onChange={(e) => setProductForm({...productForm, sizeInput: e.target.value})}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter size (e.g., S, M, L)"
          />
          <button 
            type="button"
            onClick={() => {
              if (productForm.sizeInput && productForm.sizeInput.trim()) {
                const sizes = productForm.sizes ? productForm.sizes.split(', ') : [];
                if (!sizes.includes(productForm.sizeInput.trim())) {
                  setProductForm({
                    ...productForm, 
                    sizes: [...sizes, productForm.sizeInput.trim()].join(', '),
                    sizeInput: ''
                  });
                }
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(productForm.sizes ? productForm.sizes.split(', ') : []).map((size, index) => (
            <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
              <span className="text-sm">{size}</span>
              <button 
                type="button"
                onClick={() => {
                  const sizes = productForm.sizes.split(', ');
                  sizes.splice(index, 1);
                  setProductForm({...productForm, sizes: sizes.join(', ')});
                }}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* SKU Code Generation <p className="text-xs text-gray-500 mb-2">Platform auto-generates SKU codes based on size and color combinations</p> */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">SKU Codes *</label>
      
      {/* Generate SKU Codes Button */}
      <button 
        type="button"
        onClick={() => {
          // Generate SKU codes based on size and color combinations
          if (productForm.sizes && productForm.colors) {
            const sizes = productForm.sizes.split(', ');
            const colors = productForm.colors.split(', ');
            const brandPrefix = productForm.brandName ? productForm.brandName.substring(0, 3).toUpperCase() : 'BRD';
            const categoryPrefix = productForm.subCategory ? productForm.subCategory.substring(0, 3).toUpperCase() : 'CAT';
            
            const skuCodes: { size: string; color: string; sku: string }[] = [];
            sizes.forEach(size => {
              colors.forEach(color => {
                const colorCode = color.substring(0, 3).toUpperCase();
                const sizeCode = size.toUpperCase();
                const skuCode = `${brandPrefix}-${categoryPrefix}-${colorCode}-${sizeCode}`;
                skuCodes.push({
                  size: size,
                  color: color,
                  sku: skuCode
                });
              });
            });
            
            setProductForm({
              ...productForm,
              skuCodes: skuCodes
            });
          }
        }}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mb-3"
      >
        Generate SKU Codes
      </button>
      
      {/* Display SKU Codes Table */}
      {productForm.skuCodes && productForm.skuCodes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU Code
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productForm.skuCodes.map((sku, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sku.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sku.color}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sku.sku}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
  </div>
  
  {/* Size Chart Section */}
  <div className="border-b pb-4">
    <h4 className="text-md font-medium text-gray-900 mb-3">Size Availability *</h4>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Size Chart Image</label>
        <div className="flex items-center space-x-4 mb-2">
          <input 
            type="file" 
            id="size-chart"
            accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProductForm({...productForm, sizeChartImage: reader.result});
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />
          <label 
            htmlFor="size-chart"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer flex items-center"
          >
            <Upload size={16} className="mr-2" />
            Upload Size Chart
          </label>
        </div>
        {productForm.sizeChartImage && (
          <div className="mt-2">
            <img 
              src={productForm.sizeChartImage} 
              alt="Size Chart"
              className="w-64 h-auto object-cover rounded border"
            />
            <button 
              type="button"
              onClick={() => setProductForm({...productForm, sizeChartImage: null})}
              className="mt-2 text-red-500 hover:text-red-700"
            >
              Remove Size Chart
            </button>
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Size Guide Text</label>
        <textarea 
          value={productForm.sizeGuide || ''}
          onChange={(e) => setProductForm({...productForm, sizeGuide: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Enter size guide information"
        />
      </div>
    </div>
  </div>
  
  {/* Fabric Details Section */}
  <div className="border-b pb-4">
    <h4 className="text-md font-medium text-gray-900 mb-3">Fabric Details</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Composition</label>
        <input 
          type="text" 
          value={productForm.fabricComposition || ''}
          onChange={(e) => setProductForm({...productForm, fabricComposition: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 80% Cotton, 20% Polyester"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Weight</label>
        <input 
          type="text" 
          value={productForm.fabricWeight || ''}
          onChange={(e) => setProductForm({...productForm, fabricWeight: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Light, Medium, Heavy"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Transparency</label>
        <select 
          value={productForm.fabricTransparency || ''}
          onChange={(e) => setProductForm({...productForm, fabricTransparency: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Transparency</option>
          <option value="Opaque">Opaque</option>
          <option value="Semi-Transparent">Semi-Transparent</option>
          <option value="Transparent">Transparent</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Properties</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {["Breathable", "Water Resistant", "UV Protection", "Wrinkle Free", 
            "Quick Dry", "Anti-Pilling", "Hypoallergenic", "Eco-Friendly"].map((property) => (
            <label key={property} className="flex items-center">
              <input 
                type="checkbox" 
                checked={productForm.fabricProperties && productForm.fabricProperties.includes(property)}
                onChange={(e) => {
                  const properties = productForm.fabricProperties ? productForm.fabricProperties.split(', ') : [];
                  if (e.target.checked) {
                    properties.push(property);
                  } else {
                    const index = properties.indexOf(property);
                    if (index > -1) {
                      properties.splice(index, 1);
                    }
                  }
                  setProductForm({...productForm, fabricProperties: properties.join(', ')});
                }}
                className="mr-2"
              />
              <span className="text-sm">{property}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  </div>
  
  {/* Model Information Section */}
  <div className="border-b pb-4">
    <h4 className="text-md font-medium text-gray-900 mb-3">Model Information</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Model Height</label>
        <input 
          type="text" 
          value={productForm.modelHeight || ''}
          onChange={(e) => setProductForm({...productForm, modelHeight: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 5'7&quot; (170 cm)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Model Wearing Size</label>
        <input 
          type="text" 
          value={productForm.modelWearingSize || ''}
          onChange={(e) => setProductForm({...productForm, modelWearingSize: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., M, L, 38"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Fit Note</label>
        <textarea 
          value={productForm.fitNote || ''}
          onChange={(e) => setProductForm({...productForm, fitNote: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Any special notes about the fit of the garment"
        />
      </div>
    </div>
  </div>
  
  {/* Descriptions Section */}
  <div className="border-b pb-4">
    <h4 className="text-md font-medium text-gray-900 mb-3">Descriptions</h4>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
        <textarea 
          value={productForm.shortDescription}
          onChange={(e) => setProductForm({...productForm, shortDescription: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Brief product description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Key Features / Highlights</label>
        <textarea 
          value={productForm.keyFeatures}
          onChange={(e) => setProductForm({...productForm, keyFeatures: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="List key features of product"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Styling Tips</label>
        <textarea 
          value={productForm.stylingTips || ''}
          onChange={(e) => setProductForm({...productForm, stylingTips: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Provide styling tips for this product"
        />
      </div>
    </div>
  </div>
  
  {/* Care Instructions Section */}
  <div className="border-b pb-4">
    <h4 className="text-md font-medium text-gray-900 mb-3">Care Instructions *</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Wash Method</label>
        <select 
          value={productForm.washMethod}
          onChange={(e) => setProductForm({...productForm, washMethod: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Wash Method</option>
          <option value="Machine Wash">Machine Wash</option>
          <option value="Hand Wash">Hand Wash</option>
          <option value="Dry Clean Only">Dry Clean Only</option>
          <option value="Do Not Wash">Do Not Wash</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Wash Temperature</label>
        <select 
          value={productForm.washTemperature || ''}
          onChange={(e) => setProductForm({...productForm, washTemperature: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Temperature</option>
          <option value="Cold Water">Cold Water</option>
          <option value="Warm Water">Warm Water</option>
          <option value="Hot Water">Hot Water</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bleach</label>
        <select 
          value={productForm.bleach || ''}
          onChange={(e) => setProductForm({...productForm, bleach: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Option</option>
          <option value="Do Not Bleach">Do Not Bleach</option>
          <option value="Non-Chlorine Bleach">Non-Chlorine Bleach</option>
          <option value="Chlorine Bleach">Chlorine Bleach</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dry Method</label>
        <select 
          value={productForm.dryMethod || ''}
          onChange={(e) => setProductForm({...productForm, dryMethod: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Dry Method</option>
          <option value="Tumble Dry Low">Tumble Dry Low</option>
          <option value="Tumble Dry Medium">Tumble Dry Medium</option>
          <option value="Tumble Dry High">Tumble Dry High</option>
          <option value="Do Not Tumble Dry">Do Not Tumble Dry</option>
          <option value="Line Dry">Line Dry</option>
          <option value="Drip Dry">Drip Dry</option>
          <option value="Flat Dry">Flat Dry</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ironing Details</label>
        <select 
          value={productForm.ironingDetails}
          onChange={(e) => setProductForm({...productForm, ironingDetails: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Ironing Option</option>
          <option value="Do Not Iron">Do Not Iron</option>
          <option value="Iron Low Heat">Iron Low Heat</option>
          <option value="Iron Medium Heat">Iron Medium Heat</option>
          <option value="Iron High Heat">Iron High Heat</option>
          <option value="Steam Iron">Steam Iron</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Special Care</label>
        <input 
          type="text" 
          value={productForm.specialCare || ''}
          onChange={(e) => setProductForm({...productForm, specialCare: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any special care instructions"
        />
      </div>
    </div>
  </div>
  
  {/* Media Section */}
  <div className="border-b pb-4">
    <h4 className="text-md font-medium text-gray-900 mb-3">Media</h4>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>
        <p className="text-xs text-gray-500 mb-2">Min 3–5 images (Front, back, sides, close-up details, fabric texture)</p>
        <div className="flex items-center space-x-4 mb-2">
          <input 
            type="file" 
            id="product-images"
            accept="image/*"
            multiple
            onChange={handleProductImageUpload}
            className="hidden"
            required
          />
          <label 
            htmlFor="product-images"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer flex items-center"
          >
            <Upload size={16} className="mr-2" />
            Upload Images
          </label>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {productForm.images.map((image, idx) => (
            <div key={idx} className="relative">
              <img 
                src={image} 
                alt={`Product ${idx + 1}`}
                className="w-full h-24 object-cover rounded border"
              />
              <button 
                type="button"
                onClick={() => removeProductImage(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Video Link</label>
        <input 
          type="url" 
          value={productForm.videoLink}
          onChange={(e) => setProductForm({...productForm, videoLink: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/video"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Video Link</label>
        <input 
          type="url" 
          value={productForm.instagramLink}
          onChange={(e) => setProductForm({...productForm, instagramLink: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://instagram.com/..."
        />
      </div>
    </div>
  </div>
  
  {/* Logistics Section */}
  <div className="border-b pb-4">
    <h4 className="text-md font-medium text-gray-900 mb-3">Logistics</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Availability</label>
        <select 
          value={productForm.deliveryAvailability}
          onChange={(e) => setProductForm({...productForm, deliveryAvailability: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Option</option>
          <option value="Pan India">Pan India</option>
          <option value="Metro Cities">Metro Cities</option>
          <option value="Select Cities">Select Cities</option>
          <option value="International">International</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">COD Option</label>
        <select 
          value={productForm.codOption}
          onChange={(e) => setProductForm({...productForm, codOption: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Option</option>
          <option value="Available">Available</option>
          <option value="Not Available">Not Available</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Seller Address</label>
        <textarea 
          value={productForm.sellerAddress}
          onChange={(e) => setProductForm({...productForm, sellerAddress: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Enter seller address"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy</label>
        <textarea 
          value={productForm.returnPolicy}
          onChange={(e) => setProductForm({...productForm, returnPolicy: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Enter return policy details"
        />
      </div>
    </div>
  </div>
  
  {/* Compliance Section */}
  <div>
    <h4 className="text-md font-medium text-gray-900 mb-3">Compliance</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer Details *</label>
        <textarea 
          value={productForm.manufacturerDetails}
          onChange={(e) => setProductForm({...productForm, manufacturerDetails: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Enter manufacturer or importer details"
          required
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Packer Details *</label>
        <textarea 
          value={productForm.packerDetails}
          onChange={(e) => setProductForm({...productForm, packerDetails: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Enter packer details"
          required
        />
      </div>
    </div>
  </div>
  
  <div className="flex justify-end space-x-3 pt-4">
    <button 
      type="button"
      onClick={() => {
        resetProductForm();
        setActiveTab('products');
      }}
      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
    >
      Cancel
    </button>
    <button 
      type="submit"
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      {editingProduct ? 'Update Product' : 'Add Product'}
    </button>
  </div>
            </form>
          </div>
        ); 
      
      case "kyc":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">KYC Verification</h2>
            {userData?.kycVerified ? (
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center">
                  <Check className="text-green-600 mr-2" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      KYC Verified
                    </h3>
                    <p className="text-green-700">
                      Your KYC has been successfully verified.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleKYCSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={kycData.pan}
                      onChange={(e) =>
                        setKycData({ ...kycData, pan: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your PAN number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Card Photo
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        id="pan-photo"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "panPhoto")}
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
                          <span className="text-sm text-green-600">
                            Photo uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setKycData({ ...kycData, panPhoto: null })
                            }
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      value={kycData.aadhaar}
                      onChange={(e) =>
                        setKycData({ ...kycData, aadhaar: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your Aadhar number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhar Card Photo
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        id="aadhaar-photo"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "aadhaarPhoto")}
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
                          <span className="text-sm text-green-600">
                            Photo uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setKycData({ ...kycData, aadhaarPhoto: null })
                            }
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={kycData.address}
                      onChange={(e) =>
                        setKycData({ ...kycData, address: e.target.value })
                      }
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
                    <label
                      htmlFor="kyc-terms"
                      className="ml-2 text-sm text-gray-700"
                    >
                      I agree to terms and conditions for KYC verification
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

      case "bank":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Bank Account</h2>
            {userData?.bankAccount ? (
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center">
                  <Check className="text-green-600 mr-2" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Bank Account Added
                    </h3>
                    <p className="text-green-700">
                      Your bank account has been successfully added.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">
                      Account Number:
                    </span>
                    <p className="font-medium">
                      XXXXXX{userData.bankAccount.accountNumber.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">IFSC Code:</span>
                    <p className="font-medium">{userData.bankAccount.ifsc}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Bank Name:</span>
                    <p className="font-medium">
                      {userData.bankAccount.bankName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Account Holder:
                    </span>
                    <p className="font-medium">
                      {userData.bankAccount.accountHolder}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBankSubmit}>
                <div className="space-y-4">
                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankData.accountNumber}
                      onChange={(e) =>
                        setBankData({
                          ...bankData,
                          accountNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your account number"
                      required
                    />
                  </div>

                  {/* Bank Account Type - Radio Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Account Type
                    </label>
                    <div className="flex space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="accountType"
                          value="Checking"
                          checked={bankData.accountType === "Checking"}
                          onChange={(e) =>
                            setBankData({
                              ...bankData,
                              accountType: e.target.value,
                            })
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Checking
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="accountType"
                          value="Savings"
                          checked={bankData.accountType === "Savings"}
                          onChange={(e) =>
                            setBankData({
                              ...bankData,
                              accountType: e.target.value,
                            })
                          }
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Savings
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankData.bankName}
                      onChange={(e) =>
                        setBankData({ ...bankData, bankName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your bank name"
                      required
                    />
                  </div>

                  {/* Bank Address - Text Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Address
                    </label>
                    <input
                      type="text"
                      value={bankData.bankAddress}
                      onChange={(e) =>
                        setBankData({
                          ...bankData,
                          bankAddress: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter bank address"
                      required
                    />
                  </div>

                  {/* IFSC Code (Existing) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={bankData.ifsc}
                      onChange={(e) =>
                        setBankData({ ...bankData, ifsc: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your IFSC code"
                      required
                    />
                  </div>

                  {/* Account Holder Name (Existing) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={bankData.accountHolder}
                      onChange={(e) =>
                        setBankData({
                          ...bankData,
                          accountHolder: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter account holder name"
                      required
                    />
                  </div>

                  {/* Bank Country - Dropdown (India Default) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Country
                    </label>
                    <select
                      value={bankData.bankCountry || "India"}
                      onChange={(e) =>
                        setBankData({
                          ...bankData,
                          bankCountry: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Bank Passbook Photo (Existing) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Passbook Photo
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        id="passbook-photo"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "passbookPhoto")}
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
                          <span className="text-sm text-green-600">
                            Photo uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setBankData({ ...bankData, passbookPhoto: null })
                            }
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
                    <label
                      htmlFor="bank-terms"
                      className="ml-2 text-sm text-gray-700"
                    >
                      I agree to the terms and conditions for adding bank
                      account
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

      case 'addaccessory':
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {editingProduct ? 'Edit Accessory' : 'Add New Accessory'}
        </h2>
        <button
          onClick={() => {
            resetProductForm();
            setActiveTab('products');
          }}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          <X size={20} className="mr-2" />
          Cancel
        </button>
      </div>
      
      <form onSubmit={handleProductSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Accessory Name *</label>
              <input 
                type="text" 
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter accessory name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
              <input 
                type="text" 
                value={productForm.brandName}
                onChange={(e) => setProductForm({...productForm, brandName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter brand name"
                required
              />
            </div>
            
            {/* --- UPDATED CATEGORY SECTION (With Custom Logic) --- */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <div className="flex items-center gap-2">
                <select 
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  
                  <optgroup label="Predefined Categories">
                    <option value="Bags">Bags</option>
                    <option value="Belts">Belts</option>
                    <option value="Hats">Hats</option>
                    <option value="Scarves">Scarves</option>
                    <option value="Gloves">Gloves</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Sunglasses">Sunglasses</option>
                    <option value="Watches">Watches</option>
                    <option value="Wallets">Wallets</option>
                    <option value="Ties">Ties</option>
                    <option value="Other">Other</option>
                  </optgroup>

                  {customCategories.length > 0 && (
                    <optgroup label="Your Categories">
                      {customCategories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                    </optgroup>
                  )}
                </select>

                <button 
                  type="button"
                  onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                  className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 flex items-center"
                  title="Create new category"
                >
                  <Plus size={18} />
                  <span className="ml-1 hidden sm:inline">New</span>
                </button>
              </div>

              {showNewCategoryInput && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new category name"
                  />
                  <button 
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {/* --- REVERTED SUB-CATEGORY SECTION (No Button) --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Category</label>
              <input 
                type="text" 
                value={productForm.subCategory}
                onChange={(e) => setProductForm({...productForm, subCategory: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Handbags, Belts, Sunglasses"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model/Style Code</label>
              <input 
                type="text" 
                value={productForm.sku}
                onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter model or style code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select 
                value={productForm.gender || ''}
                onChange={(e) => setProductForm({...productForm, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
                <option value="Kids">Kids</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Suitable Usage</label>
              <input 
                type="text" 
                value={productForm.occasion}
                onChange={(e) => setProductForm({...productForm, occasion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Casual, Formal, Party, Travel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code *</label>
              <input 
                type="text" 
                value={productForm.hsnCode}
                onChange={(e) => setProductForm({...productForm, hsnCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter HSN code"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Material Details Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Material Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Material *</label>
              <input 
                type="text" 
                value={productForm.material}
                onChange={(e) => setProductForm({...productForm, material: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Leather, Canvas, Metal"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Material</label>
              <input 
                type="text" 
                value={productForm.secondaryMaterial || ''}
                onChange={(e) => setProductForm({...productForm, secondaryMaterial: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Polyester Lining, Brass Hardware"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors *</label>
              <div className="flex items-center space-x-2 mb-2">
                <input 
                  type="text" 
                  value={productForm.colorInput || ''}
                  onChange={(e) => setProductForm({...productForm, colorInput: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter color name"
                />
                <button 
                  type="button"
                  onClick={() => {
                    if (productForm.colorInput && productForm.colorInput.trim()) {
                      const colors = productForm.colors ? productForm.colors.split(', ') : [];
                      if (!colors.includes(productForm.colorInput.trim())) {
                        setProductForm({
                          ...productForm, 
                          colors: [...colors, productForm.colorInput.trim()].join(', '),
                          colorInput: ''
                        });
                      }
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(productForm.colors ? productForm.colors.split(', ') : []).map((color, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-sm">{color}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        const colors = productForm.colors.split(', ');
                        colors.splice(index, 1);
                        setProductForm({...productForm, colors: colors.join(', ')});
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Finish/Texture</label>
              <input 
                type="text" 
                value={productForm.finish || ''}
                onChange={(e) => setProductForm({...productForm, finish: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Matte, Glossy, Polished, Textured"
              />
            </div>
          </div>
        </div>

        {/* Accessory-Specific Details Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Accessory-Specific Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productForm.category === 'Bags' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bag Type</label>
                  <select 
                    value={productForm.bagType || ''}
                    onChange={(e) => setProductForm({...productForm, bagType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Bag Type</option>
                    <option value="Handbag">Handbag</option>
                    <option value="Backpack">Backpack</option>
                    <option value="Clutch">Clutch</option>
                    <option value="Tote">Tote</option>
                    <option value="Crossbody">Crossbody</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Closure Type</label>
                  <input 
                    type="text" 
                    value={productForm.closureType}
                    onChange={(e) => setProductForm({...productForm, closureType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Zipper, Magnetic, Button"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Compartments</label>
                  <input 
                    type="text" 
                    value={productForm.compartments || ''}
                    onChange={(e) => setProductForm({...productForm, compartments: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1 main compartment, 2 side pockets"
                  />
                </div>
              </>
            )}
            
            {productForm.category === 'Jewelry' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Metal Type</label>
                  <select 
                    value={productForm.metalType || ''}
                    onChange={(e) => setProductForm({...productForm, metalType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Metal Type</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Stainless Steel">Stainless Steel</option>
                    <option value="Brass">Brass</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gemstone Type</label>
                  <input 
                    type="text" 
                    value={productForm.gemstoneType || ''}
                    onChange={(e) => setProductForm({...productForm, gemstoneType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Diamond, Ruby, None"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plating</label>
                  <input 
                    type="text" 
                    value={productForm.plating || ''}
                    onChange={(e) => setProductForm({...productForm, plating: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 18K Gold Plated, Rhodium Plated"
                  />
                </div>
              </>
            )}
            
            {productForm.category === 'Watches' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Watch Type</label>
                  <select 
                    value={productForm.watchType || ''}
                    onChange={(e) => setProductForm({...productForm, watchType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Watch Type</option>
                    <option value="Analog">Analog</option>
                    <option value="Digital">Digital</option>
                    <option value="Smartwatch">Smartwatch</option>
                    <option value="Chronograph">Chronograph</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Band Material</label>
                  <input 
                    type="text" 
                    value={productForm.bandMaterial || ''}
                    onChange={(e) => setProductForm({...productForm, bandMaterial: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Leather, Stainless Steel, Silicone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Water Resistance</label>
                  <input 
                    type="text" 
                    value={productForm.waterResistance || ''}
                    onChange={(e) => setProductForm({...productForm, waterResistance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 30m, 50m, 100m"
                  />
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Size & Dimensions Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Size & Dimensions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions *</label>
              <input 
                type="text" 
                value={productForm.dimensions || ''}
                onChange={(e) => setProductForm({...productForm, dimensions: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 30cm x 20cm x 5cm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight *</label>
              <input 
                type="text" 
                value={productForm.weight}
                onChange={(e) => setProductForm({...productForm, weight: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 250g"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adjustability</label>
              <select 
                value={productForm.adjustability || ''}
                onChange={(e) => setProductForm({...productForm, adjustability: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Option</option>
                <option value="Adjustable">Adjustable</option>
                <option value="Fixed">Fixed</option>
                <option value="One Size">One Size</option>
                <option value="Multiple Sizes">Multiple Sizes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size Options *</label>
              <div className="flex items-center space-x-2 mb-2">
                <input 
                  type="text" 
                  value={productForm.sizeInput || ''}
                  onChange={(e) => setProductForm({...productForm, sizeInput: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter size (e.g., S, M, L, One Size)"
                />
                <button 
                  type="button"
                  onClick={() => {
                    if (productForm.sizeInput && productForm.sizeInput.trim()) {
                      const sizes = productForm.sizes ? productForm.sizes.split(', ') : [];
                      if (!sizes.includes(productForm.sizeInput.trim())) {
                        setProductForm({
                          ...productForm, 
                          sizes: [...sizes, productForm.sizeInput.trim()].join(', '),
                          sizeInput: ''
                        });
                      }
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(productForm.sizes ? productForm.sizes.split(', ') : []).map((size, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-sm">{size}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        const sizes = productForm.sizes.split(', ');
                        sizes.splice(index, 1);
                        setProductForm({...productForm, sizes: sizes.join(', ')});
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* SKU Code Generation Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">SKU Code Generation</h4>
          <button 
            type="button"
            onClick={() => {
              if (productForm.sizes && productForm.colors) {
                const sizes = productForm.sizes.split(', ');
                const colors = productForm.colors.split(', ');
                const brandPrefix = productForm.brandName ? productForm.brandName.substring(0, 3).toUpperCase() : 'BRD';
                const categoryPrefix = productForm.category ? productForm.category.substring(0, 3).toUpperCase() : 'ACC';
                
                const skuCodes: { size: string; color: string; sku: string }[] = [];
                sizes.forEach(size => {
                  colors.forEach(color => {
                    const colorCode = color.substring(0, 3).toUpperCase();
                    const sizeCode = size.toUpperCase();
                    const skuCode = `${brandPrefix}-${categoryPrefix}-${colorCode}-${sizeCode}`;
                    skuCodes.push({
                      size: size,
                      color: color,
                      sku: skuCode
                    });
                  });
                });
                
                setProductForm({
                  ...productForm,
                  skuCodes: skuCodes
                });
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mb-3"
          >
            Generate SKU Codes
          </button>
          
          {productForm.skuCodes && productForm.skuCodes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU Code</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productForm.skuCodes.map((sku, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sku.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sku.color}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sku.sku}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Images Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Product Images</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Image *</label>
              <p className="text-xs text-gray-500 mb-2">Upload a clear image of the accessory</p>
              <div className="flex items-center space-x-4 mb-2">
                <input 
                  type="file" 
                  id="primary-image"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProductForm({
                          ...productForm,
                          images: productForm.images.length > 0 
                            ? [reader.result as string, ...productForm.images.slice(1)]
                            : [reader.result as string]
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <label 
                  htmlFor="primary-image"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer flex items-center"
                >
                  <Upload size={16} className="mr-2" />
                  Upload Primary Image
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
              <p className="text-xs text-gray-500 mb-2">Upload images showing different angles, details, and usage</p>
              <div className="flex items-center space-x-4 mb-2">
                <input 
                  type="file" 
                  id="additional-images"
                  accept="image/*"
                  multiple
                  onChange={handleProductImageUpload}
                  className="hidden"
                />
                <label 
                  htmlFor="additional-images"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer flex items-center"
                >
                  <Upload size={16} className="mr-2" />
                  Upload Additional Images
                </label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {productForm.images.map((image, idx) => (
                  <div key={idx} className="relative">
                    <img 
                      src={image} 
                      alt={`Accessory ${idx + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button 
                      type="button"
                      onClick={() => removeProductImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {productForm.images && productForm.images.length < 3 && (
                <p className="text-xs text-red-500 mt-2">Please upload at least 3 images</p>
              )}
            </div>
          </div>
        </div>

        {/* Video Links Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Video Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Video Link</label>
              <input 
                type="url" 
                value={productForm.videoLink}
                onChange={(e) => setProductForm({...productForm, videoLink: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/video"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Video Link</label>
              <input 
                type="url" 
                value={productForm.instagramLink}
                onChange={(e) => setProductForm({...productForm, instagramLink: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </div>

        {/* Return Policy Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Return Policy</h4>
          <div>
            <textarea 
              value={productForm.returnPolicy}
              onChange={(e) => setProductForm({...productForm, returnPolicy: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter return policy details"
            />
          </div>
        </div>

        {/* Seller Information Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Seller Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Seller Address *</label>
              <textarea 
                value={productForm.sellerAddress}
                onChange={(e) => setProductForm({...productForm, sellerAddress: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Enter seller address"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer / Importer Details *</label>
              <textarea 
                value={productForm.manufacturerDetails}
                onChange={(e) => setProductForm({...productForm, manufacturerDetails: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Enter manufacturer or importer details"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Packer Details *</label>
              <textarea 
                value={productForm.packerDetails}
                onChange={(e) => setProductForm({...productForm, packerDetails: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Enter packer details"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Pricing & Inventory Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Pricing & Inventory</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product MRP (₹) *</label>
              <input 
                type="number" 
                value={productForm.mrp}
                onChange={(e) => {
                  setProductForm({
                    ...productForm, 
                    mrp: e.target.value
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter MRP"
                required
              />
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹) *</label>
                <input 
                  type="number" 
                  value={productForm.price}
                  onChange={(e) => {
                    const sellingPrice = e.target.value;
                    const gstRate = productForm.gstRate || 0;
                    const gstInclusivePrice = sellingPrice && !isNaN(parseFloat(sellingPrice)) && parseFloat(sellingPrice) > 0 
                      ? (parseFloat(sellingPrice) * (1 + parseFloat(gstRate) / 100)).toFixed(2) 
                      : '';
                    const credits = sellingPrice && !isNaN(parseFloat(sellingPrice)) && parseFloat(sellingPrice) > 0 
                      ? (parseFloat(sellingPrice) / 100).toFixed(2) 
                      : '';
                    setProductForm({
                      ...productForm, 
                      price: sellingPrice,
                      gstInclusivePrice: gstInclusivePrice,
                      credits: credits
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter selling price"
                  required
                />
              </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GST Inclusive Price (₹) *</label>
              <div className="flex items-center">
                <input 
                  type="text" 
                  value={productForm.gstInclusivePrice || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                  placeholder="Auto-generated based on selling price and GST rate"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GST Percentage</label>
              <select 
                value={productForm.gstPercentage}
                onChange={(e) => setProductForm({...productForm, gstPercentage: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select GST</option>
                <option value="0%">0%</option>
                <option value="5%">5%</option>
                <option value="12%">12%</option>
                <option value="18%">18%</option>
                <option value="28%">28%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
              <div className="flex items-center">
                <input 
                  type="text" 
                  value={productForm.credits ? `${productForm.credits} Credits` : ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                  placeholder="Credits will be calculated automatically"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
              <input 
                type="text" 
                value={productForm.offer}
                onChange={(e) => setProductForm({...productForm, offer: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 20% OFF"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
              <input 
                type="number" 
                value={productForm.stockQuantity}
                onChange={(e) => setProductForm({...productForm, stockQuantity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter stock quantity"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse / Pickup Location *</label>
              <textarea 
                value={productForm.warehouseLocation}
                onChange={(e) => setProductForm({...productForm, warehouseLocation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter warehouse location"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Description Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Description</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Description *</label>
              <textarea 
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter product description"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
              <textarea 
                value={productForm.shortDescription}
                onChange={(e) => setProductForm({...productForm, shortDescription: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Brief description of the accessory"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
              <textarea 
                value={productForm.fullDescription}
                onChange={(e) => setProductForm({...productForm, fullDescription: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Detailed description of the accessory"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Features</label>
              <textarea 
                value={productForm.keyFeatures}
                onChange={(e) => setProductForm({...productForm, keyFeatures: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="List key features of the accessory"
              />
            </div>
          </div>
        </div>
        
        {/* Authenticity & Warranty Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Authenticity & Warranty</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Authenticity Certificate</label>
              <div className="flex items-center space-x-4 mb-2">
                <input 
                  type="file" 
                  id="auth-certificate"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProductForm({...productForm, authCertificate: reader.result});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <label 
                  htmlFor="auth-certificate"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer flex items-center"
                >
                  <Upload size={16} className="mr-2" />
                  Upload Certificate
                </label>
              </div>
              {productForm.authCertificate && (
                <div className="flex items-center">
                  <span className="text-sm text-green-600">Certificate uploaded</span>
                  <button 
                    type="button"
                    onClick={() => setProductForm({...productForm, authCertificate: null})}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Details</label>
              <textarea 
                value={productForm.warranty || ''}
                onChange={(e) => setProductForm({...productForm, warranty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Enter warranty details"
              />
            </div>
          </div>
        </div>
        
        {/* Care Instructions Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Care Instructions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cleaning Method *</label>
              <input 
                type="text" 
                value={productForm.washMethod}
                onChange={(e) => setProductForm({...productForm, washMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dry clean only, Wipe with damp cloth"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Storage Instructions</label>
              <input 
                type="text" 
                value={productForm.storage || ''}
                onChange={(e) => setProductForm({...productForm, storage: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Keep in dust bag, Store in dry place"
              />
            </div>
          </div>
        </div>
        
        {/* Logistics Section */}
        <div className="border-b pb-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Logistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package Weight</label>
              <input 
                type="text" 
                value={productForm.packageWeight || ''}
                onChange={(e) => setProductForm({...productForm, packageWeight: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 300g"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package Dimensions</label>
              <input 
                type="text" 
                value={productForm.packageDimensions}
                onChange={(e) => setProductForm({...productForm, packageDimensions: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 25x15x5 cm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Packaging Type</label>
              <select 
                value={productForm.packagingType || ''}
                onChange={(e) => setProductForm({...productForm, packagingType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Packaging Type</option>
                <option value="Box">Box</option>
                <option value="Pouch">Pouch</option>
                <option value="Dust Bag">Dust Bag</option>
                <option value="Gift Box">Gift Box</option>
                <option value="Polybag">Polybag</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">COD Option</label>
              <select 
                value={productForm.codOption}
                onChange={(e) => setProductForm({...productForm, codOption: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Option</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Additional Information Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Additional Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country of Origin *</label>
              <input 
                type="text" 
                value={productForm.countryOfOrigin}
                onChange={(e) => setProductForm({...productForm, countryOfOrigin: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., India"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Tags</label>
              <input 
                type="text" 
                value={productForm.tags || ''}
                onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., leather, handcrafted, formal, gift"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button 
            type="button"
            onClick={() => {
              resetProductForm();
              setActiveTab('products');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editingProduct ? 'Update Accessory' : 'Add Accessory'}
          </button>
        </div>
      </form>
    </div>
  ); 
      
      case "team":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Team Members</h2>
              {teamMembers.length > 0 && (
                <button
                  onClick={() => { setTeamError(null); setTeamSuccess(null); setActiveTab("addTeamMember"); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Team Member
                </button>
              )}
            </div>

            {/* Success / Error Messages */}
            {teamSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="text-green-800 text-sm">{teamSuccess}</span>
                </div>
                <button onClick={() => setTeamSuccess(null)} className="text-green-600 hover:text-green-800"><X size={16} /></button>
              </div>
            )}
            {teamError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-600" />
                  <span className="text-red-800 text-sm">{teamError}</span>
                </div>
                <button onClick={() => setTeamError(null)} className="text-red-600 hover:text-red-800"><X size={16} /></button>
              </div>
            )}

            {/* Role Information Banner */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Team Member Roles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium mt-0.5">Premium</span>
                  <div>
                    <span className="text-blue-800">Can add products and edit <strong>any</strong> product of the brand. Cannot delete products.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium mt-0.5">Standard</span>
                  <div>
                    <span className="text-blue-800">Can add products and edit <strong>only their own</strong> products. Cannot delete products.</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">All product changes by team members require admin approval before going live.</p>
            </div>

            {/* Team Member Portal Access */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Team Member Portal</h3>
                <p className="text-xs text-gray-500 mt-0.5">Team members can log in here to manage products using their Member ID and password.</p>
              </div>
              <button
                onClick={() => setShowTeamMemberPortal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2 whitespace-nowrap"
              >
                <User size={16} />
                Open Team Login
              </button>
            </div>

            {teamLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="animate-spin mx-auto h-8 w-8 text-blue-600 mb-3" />
                <p className="text-gray-600">Loading team members...</p>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No Team Members Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Add your first team member to start managing your team.
                </p>
                <button
                  onClick={() => { setTeamError(null); setTeamSuccess(null); setActiveTab("addTeamMember"); }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add First Team Member
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Member ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamMembers.map((member) => (
                      <tr key={member._id || member.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                          {member.memberId || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.role === "premium_member"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {member.role === "premium_member" ? "Premium Member" : "Standard Member"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActionMenuOpen(
                                  actionMenuOpen === (member._id || member.id)
                                    ? null
                                    : (member._id || member.id),
                                )
                              }
                              className="p-1 rounded-full hover:bg-gray-100"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {actionMenuOpen === (member._id || member.id) && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      handleEditTeamMember(member);
                                      setActionMenuOpen(null);
                                    }}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleToggleTeamMemberStatus(member._id || member.id);
                                    }}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    {member.isActive
                                      ? "Deactivate"
                                      : "Activate"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteTeamMember(member._id || member.id);
                                    }}
                                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "addTeamMember":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add Team Member</h2>
              <button
                onClick={() => setActiveTab("team")}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </button>
            </div>

            {teamError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600" />
                <span className="text-red-800 text-sm">{teamError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTeamMember();
              }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Member Name *
                </label>
                <input
                  type="text"
                  value={newTeamMember.name}
                  onChange={(e) =>
                    setNewTeamMember({ ...newTeamMember, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team member name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Member Email *
                </label>
                <input
                  type="email"
                  value={newTeamMember.email}
                  onChange={(e) =>
                    setNewTeamMember({
                      ...newTeamMember,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team member email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login Password *
                </label>
                <input
                  type="password"
                  value={newTeamMember.password}
                  onChange={(e) =>
                    setNewTeamMember({
                      ...newTeamMember,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Create a login password for this member"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  The member will use their Member ID and this password to log in.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Member Role *
                </label>
                <select
                  value={newTeamMember.role}
                  onChange={(e) =>
                    setNewTeamMember({ ...newTeamMember, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard_member">Standard Member</option>
                  <option value="premium_member">Premium Member</option>
                </select>
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                  {newTeamMember.role === "premium_member" ? (
                    <span><strong>Premium Member:</strong> Can add new products and edit <strong>any</strong> product of the brand. Cannot delete products.</span>
                  ) : (
                    <span><strong>Standard Member:</strong> Can add new products and edit <strong>only the products they added</strong>. Cannot delete products.</span>
                  )}
                  <br />
                  <span className="text-blue-600 mt-1 inline-block">All product changes require admin approval before going live.</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("team")}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={teamLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {teamLoading ? "Creating..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        );

      case "editTeamMember":
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Team Member</h2>
              <button
                onClick={() => setActiveTab("team")}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </button>
            </div>

            {teamError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600" />
                <span className="text-red-800 text-sm">{teamError}</span>
              </div>
            )}

            {editingTeamMember?.memberId && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Member ID: </span>
                <span className="text-sm font-mono font-medium text-gray-900">{editingTeamMember.memberId}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateTeamMember();
              }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Member Name
                </label>
                <input
                  type="text"
                  value={editingTeamMember?.name || ""}
                  onChange={(e) =>
                    setEditingTeamMember({
                      ...editingTeamMember,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team member name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Member Email
                </label>
                <input
                  type="email"
                  value={editingTeamMember?.email || ""}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                  placeholder="Enter team member email"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Member Role
                </label>
                <select
                  value={editingTeamMember?.role || "standard_member"}
                  onChange={(e) =>
                    setEditingTeamMember({
                      ...editingTeamMember,
                      role: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard_member">Standard Member</option>
                  <option value="premium_member">Premium Member</option>
                </select>
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                  {editingTeamMember?.role === "premium_member" ? (
                    <span><strong>Premium Member:</strong> Can add new products and edit <strong>any</strong> product of the brand. Cannot delete products.</span>
                  ) : (
                    <span><strong>Standard Member:</strong> Can add new products and edit <strong>only the products they added</strong>. Cannot delete products.</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="member-status"
                    checked={editingTeamMember?.isActive ?? true}
                    onChange={(e) =>
                      setEditingTeamMember({
                        ...editingTeamMember,
                        isActive: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="member-status"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("team")}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={teamLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {teamLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        );

      case "coupons":
        return <CouponManagement user={user} />;

      case "manageBusiness":
        return (
          <ManageBusiness user={user} />
        );

      default:
        return null;
    }
  };
  const handleSetCurrentPage = (page: PageName) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
  };

  // Menu Drawer Handler Functions
  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    setActiveMenuSection(null);
  };

  const handleBackToMenu = () => {
    setActiveMenuSection(null);
  };

  const handleMenuItemClick = (section) => {
    setActiveMenuSection(section);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    // In a real app, this would call an API to change the password
    alert("Password changed successfully");
    setShowPasswordModal(false);
    if (onLogout) onLogout(); // Log out after password change
  };

  const handleNotificationChange = (key) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Convenience wrappers for menu items
  const handleProfileClick = () => handleMenuItemClick("profile");
  const handlePasswordClick = () => handleMenuItemClick("password");
  const handle2FAClick = () => handleMenuItemClick("2fa");
  const handleOrdersClick = () => handleMenuItemClick("orders");
  const handleBrandsClick = () => handleMenuItemClick("brands");
  const handleCreditsClick = () => handleMenuItemClick("credits");
  const handleChallengesClick = () => handleMenuItemClick("challenges");
  const handleSettingsClick = () => handleMenuItemClick("settings");
  const handleFeedbackClick = () => handleMenuItemClick("feedback");
  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
    setIsMenuOpen(false);
  };

  const handleSendVerificationCode = () => {
    if (phoneNumber.length === 10) {
      setCodeSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      alert("Please enter a valid 10-digit phone number");
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      alert("2FA enabled successfully!");
      setShowPhoneVerification(false);
      setPhoneNumber("");
      setVerificationCode("");
      setCodeSent(false);
    } else {
      alert("Please enter a valid 6-digit code");
    }
  };

  const handleChangePhoneNumber = () => {
    setShowChangePhoneModal(true);
  };

  const handleConfirmChangePhone = () => {
    setShowChangePhoneModal(false);
    setCodeSent(false);
    setPhoneNumber("");
    setVerificationCode("");
  };

  const handleSkip2FA = () => {
    setShowSkip2FAModal(true);
  };

  const handleConfirmSkip2FA = () => {
    setShowSkip2FAModal(false);
    setShowPhoneVerification(false);
    setPhoneNumber("");
  };

  const handleFeedbackSubmit = () => {
    alert("Thank you for your feedback! We appreciate your input.");
    setRatings({
      easeOfUse: 0,
      features: 0,
      performance: 0,
      customerSupport: 0,
      valueForMoney: 0,
      overallExperience: 0,
    });
    setRecommendationRating(0);
    setFeedbackText("");
    setActiveMenuSection(null);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirmation(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  // Menu Drawer Render Function
  const renderMenuDrawer = () => {
    if (!isMenuOpen) return null;

    const menuItems = [
      { tab: "dashboard", label: "Dashboard" },
      { tab: "team", label: "Manage Team Members" },
      { tab: "products", label: "Manage Products" },
      { tab: "addproduct", label: "Add Product" },
      { tab: "addaccessory", label: "Add Accessory" },
      { tab: "ewallet", label: "E-Wallet" },
      { tab: "incomewallet", label: "Income Wallet" },
      { tab: "kyc", label: "KYC Verification" },
      { tab: "bank", label: "Add Bank Account" },
      { tab: "coupons", label: "Manage Coupons" },
      { tab: "manageBusiness", label: "Manage Business" },
    ];

    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsMenuOpen(false)}></div>
        <div className="relative flex flex-col w-64 bg-white h-full shadow-xl">
          <div className="flex items-center justify-between p-4">
            <div className="text-lg font-semibold">Menu</div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {menuItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => {
                  setActiveTab(item.tab);
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium ${
                  activeTab === item.tab
                    ? "bg-blue-100 text-blue-700 border-r-4 border-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        setCurrentPage={handleSetCurrentPage} // KEEP ONLY THIS
        setShowAuth={() => {}}
        showSecondaryHeader={currentPage === 'brandOwnerDashboard' || !currentPage}
        secondaryTitle="Brand Owner Dashboard"
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        onPortalClick={handlePortalClick}
        currentPage={currentPage}
      />

      {/* Menu Drawer */}
      {renderMenuDrawer()}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Logout</h3>
              <button
                onClick={handleCancelLogout}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Header with Menu - only on dashboard page */}
      {(currentPage === 'brandOwnerDashboard' || !currentPage) && (
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <div className="flex items-center space-x-4">
                <div className="text-1xl text-gray-600">
                  Welcome, <span className="font-semibold">{user?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 py-8">
        {currentPage === "landing" && (
          <LandingPage
            setCurrentPage={setCurrentPage}
            onNavigateToSignup={onNavigateToSignup}
            hideHeader={true}
            currentPage={currentPage}
          />
        )}
        {currentPage === "cart" && (
          <ShoppingCartPage
            setCurrentPage={setCurrentPage}
            onNavigateToSignup={onNavigateToSignup}
            hideHeader={true}
          />
        )}
        {currentPage === "checkout" && (
          <CheckoutPage
            setCurrentPage={setCurrentPage}
            onNavigateToSignup={onNavigateToSignup}
            hideHeader={true}
          />
        )}
        {currentPage === "orderSummary" && (
          <OrderSummaryPage
            setCurrentPage={setCurrentPage}
            onNavigateToSignup={onNavigateToSignup}
            hideHeader={true}
          />
        )}
        {currentPage === "orderHistory" && (
          <OrderHistoryPage
            setCurrentPage={setCurrentPage}
            onNavigateToSignup={onNavigateToSignup}
            hideHeader={true}
          />
        )}
        {currentPage === "orderTracking" && (
          <OrderTrackingPage
            setCurrentPage={setCurrentPage}
            onNavigateToSignup={onNavigateToSignup}
            hideHeader={true}
          />
        )}
        {currentPage === "wishlist" && (
          <WishlistPage
            setCurrentPage={setCurrentPage}
            onNavigateToSignup={onNavigateToSignup}
            hideHeader={true}
          />
        )}
        {(currentPage === "mens" ||
          currentPage === "womens" ||
          currentPage === "accessories" ||
          currentPage === "all") && (
          <CategoryPage
            category={currentPage}
            setCurrentPage={setCurrentPage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onNavigateToSignup={onNavigateToSignup}
            hideHeader={true}
          />
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
        {(currentPage === "brandOwnerDashboard" ||
          currentPage === "customerDashboard" ||
          !currentPage) &&
          renderTabContent()}
      </div>

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
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Brand Name
                </label>
                <p className="text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  User ID
                </label>
                <p className="text-gray-900">{user?.userId}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Referral Link
                </label>
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
                <p className="text-xs text-gray-500 mt-1">
                  Share this link to register new users under you
                </p>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p>
                Are you sure you want to remove{" "}
                <span className="font-semibold">{memberToDelete?.name}</span>{" "}
                from your team?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTeamMember}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddMoneyModal && renderAddMoneyModal()}
      {showPaymentGateway && renderPaymentGateway()}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateInvoice user={user} onClose={() => setShowInvoiceModal(false)} />
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default BrandOwnerDashboard;
