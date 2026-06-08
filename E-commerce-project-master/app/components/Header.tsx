"use client";

import React, { useState, useEffect, useContext } from "react";
import {
  Shield,
  Instagram,
  Lock,
  Package,
  Tag,
  Coins,
  Trophy,
  Settings,
  CheckCircle,
  MessageSquare,
  Search,
  User,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LogOut,
  X,
  Menu,
  Star,
} from "lucide-react";
import { CartContext } from "../context/CartContext";
import { authAPI, setUserSession, getUserSession } from "../lib/api";
import type { PageName, UserData } from "../types";
import TwoFactorAuthSetup from "./TwoFactorAuthSetup";

interface HeaderProps {
  setCurrentPage: (page: PageName) => void;
  setShowAuth?: (show: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  isCompanyDropdownOpen?: boolean;
  setIsCompanyDropdownOpen?: (open: boolean) => void;
  companyDropdownRef?: React.RefObject<HTMLDivElement | null>;
  user?: UserData | null;
  onLogout?: () => void;
  onProfileClick?: () => void;
  showSecondaryHeader?: boolean;
  secondaryTitle?: string;
  onMenuClick?: (option: string) => void;
  onPortalClick?: () => void;
  onNavigateToSignup?: () => void;
  currentPage?: PageName;
  hasPortal?: boolean;
}

const Header = ({
  setCurrentPage,
  setShowAuth,
  searchQuery,
  setSearchQuery,
  isCompanyDropdownOpen: isCompanyDropdownOpenProp,
  setIsCompanyDropdownOpen: setIsCompanyDropdownOpenProp,
  companyDropdownRef: companyDropdownRefProp,
  user,
  onLogout,
  onProfileClick,
  showSecondaryHeader = false,
  secondaryTitle = "",
  onMenuClick,
  onPortalClick,
  onNavigateToSignup,
  hasPortal = false,
  currentPage = "landing",
}: HeaderProps): JSX.Element => {
  const { cartItems, wishlistItems } = useContext(CartContext);

  // Internal fallback state for company dropdown (when not provided via props)
  const [internalCompanyDropdownOpen, setInternalCompanyDropdownOpen] = useState(false);
  const internalCompanyDropdownRef = React.useRef<HTMLDivElement | null>(null);

  const isCompanyDropdownOpen = isCompanyDropdownOpenProp ?? internalCompanyDropdownOpen;
  const setIsCompanyDropdownOpen = setIsCompanyDropdownOpenProp ?? setInternalCompanyDropdownOpen;
  const companyDropdownRef = companyDropdownRefProp ?? internalCompanyDropdownRef;

  // States for menu drawer
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuSection, setActiveMenuSection] = useState("menu");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showChangePhoneModal, setShowChangePhoneModal] = useState(false);
  const [showSkip2FAModal, setShowSkip2FAModal] = useState(false);

  // New states for additional menu sections
  const [notificationSettings, setNotificationSettings] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    accountAlerts: true,
    recommendations: false,
  });

  // Profile states
  const [userAvatar, setUserAvatar] = useState(user?.avatar || "");
  const [userName, setUserName] = useState(user?.name || "");
  const [userMobile, setUserMobile] = useState(user?.mobile || "");
  const [userEmail, setUserEmail] = useState(user?.email || "");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2FA states
  const [phoneNumber, setPhoneNumber] = useState(user?.mobile || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Profile save states
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState("");
  const [profileSaveError, setProfileSaveError] = useState("");

  // Feedback states
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

  // Countdown timer for OTP
  useEffect(() => {
    if (codeSent && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [codeSent, countdown]);

  // Close company dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef?.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen?.(false);
      }
    };
    if (isCompanyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isCompanyDropdownOpen, companyDropdownRef, setIsCompanyDropdownOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery?.trim()) {
      setCurrentPage("all");
    }
  };

  const handleMenuClick = () => {
    setIsMenuOpen(true);
    setActiveMenuSection("menu");
  };

  const handleProfileClick = () => {
    setActiveMenuSection("profile");
  };

  const handlePasswordClick = () => {
    setActiveMenuSection("password");
  };

  const handle2FAClick = () => {
    setShow2FAModal(true);
  };

  // New handlers for menu items
  const handleOrdersClick = () => {
    setActiveMenuSection("orders");
  };

  const handleBrandsClick = () => {
    setActiveMenuSection("brands");
  };

  const handleCreditsClick = () => {
    setActiveMenuSection("credits");
  };

  const handleChallengesClick = () => {
    setActiveMenuSection("challenges");
  };

  const handleSettingsClick = () => {
    setActiveMenuSection("settings");
  };

  const handleFeedbackClick = () => {
    setActiveMenuSection("feedback");
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
  };

  const handleConfirmLogout = () => {
    onLogout?.();
    setShowLogoutConfirmation(false);
    setIsMenuOpen(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const handleBackToMenu = () => {
    setActiveMenuSection("menu");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileSaveMessage("");
    setProfileSaveError("");
    try {
      const result = await authAPI.updateProfile({ name: userName, contact: userMobile });
      if (result.success) {
        // Update localStorage session
        const session = getUserSession();
        if (session) {
          setUserSession({ ...session, name: userName, mobile: userMobile, contact: userMobile });
        }
        setProfileSaveMessage("Profile updated successfully!");
        setTimeout(() => setProfileSaveMessage(""), 3000);
      }
    } catch (err: unknown) {
      setProfileSaveError(err instanceof Error ? err.message : "Failed to update profile");
      setTimeout(() => setProfileSaveError(""), 3000);
    } finally {
      setProfileSaving(false);
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
    onLogout(); // Log out after password change
  };

  const handleSendVerificationCode = () => {
    // In a real app, this would send an OTP to the phone number
    setCodeSent(true);
    setCountdown(60);
  };

  const handleVerifyCode = () => {
    // In a real app, this would verify the OTP
    alert("Phone number verified successfully");
    setShowPhoneVerification(false);
    setCodeSent(false);
    setActiveMenuSection("2fa");
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
    setActiveMenuSection("2fa");
  };

  const handleFeedbackSubmit = () => {
    // In a real app, this would submit the feedback
    alert("Thank you for your feedback");
    setShowFeedbackModal(false);
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
  };

  // Handler for notification settings
  const handleNotificationChange = (setting) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const renderMenuDrawer = () => {
    return (
      <div className={`fixed inset-0 z-50 ${isMenuOpen ? "block" : "hidden"}`}>
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        ></div>
        <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-white to-gray-50 shadow-2xl overflow-y-auto transform transition-transform duration-300">
          {activeMenuSection === "menu" && renderMenuContent()}
          {activeMenuSection === "profile" && renderProfileContent()}
          {activeMenuSection === "password" && renderPasswordContent()}
          {activeMenuSection === "2fa" && render2FAContent()}
          {activeMenuSection === "orders" && renderOrdersContent()}
          {activeMenuSection === "brands" && renderBrandsContent()}
          {activeMenuSection === "credits" && renderCreditsContent()}
          {activeMenuSection === "challenges" && renderChallengesContent()}
          {activeMenuSection === "settings" && renderSettingsContent()}
          {activeMenuSection === "feedback" && renderFeedbackContent()}
        </div>
      </div>
    );
  };

  const renderMenuContent = () => {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold">Menu</h2>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {/*<div className="mb-8 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-xl text-gray-800">Welcome Back</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Manage your account, settings, and preferences all in one place.
            </p>
          </div>*/}

            {/* User Profile Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="relative group">
                  {userAvatar ? (
                    <div className="relative">
                      <img
                        src={userAvatar}
                        alt="User Avatar"
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-200 shadow-lg"
                      />
                      {/*<div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>*/}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center ring-4 ring-blue-200 shadow-lg">
                        <User size={48} className="text-white" />
                      </div>
                      {/* <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>*/}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    {userName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    View and manage your profile
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Options */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center mb-4">
                {/*<div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </div>
              <h4 className="font-semibold text-lg text-gray-800">Quick Actions</h4>*/}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleProfileClick}
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200 mb-3">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-700">
                    Your Profile
                  </span>
                </button>

                <button
                  onClick={handlePasswordClick}
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200 mb-3">
                    <Lock size={24} className="text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Password</span>
                </button>

                <button
                  onClick={handle2FAClick}
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200 mb-3">
                    <Shield size={24} className="text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-700">
                    Two-Factor Authentication
                  </span>
                </button>

                <button
                  onClick={handleOrdersClick}
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors duration-200 mb-3">
                    <Package size={24} className="text-teal-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Orders</span>
                </button>

                <button
                  onClick={handleBrandsClick}
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors duration-200 mb-3">
                    <Tag size={24} className="text-indigo-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Brands</span>
                </button>

                <button
                  onClick={handleCreditsClick}
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors duration-200 mb-3">
                    <Coins size={24} className="text-yellow-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Credits</span>
                </button>

                <button
                  onClick={handleChallengesClick}
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="p-3 bg-rose-100 rounded-lg group-hover:bg-rose-200 transition-colors duration-200 mb-3">
                    <Trophy size={24} className="text-rose-600" />
                  </div>
                  <span className="font-semibold text-gray-700">
                    Challenges
                  </span>
                </button>

                <button
                  onClick={handleSettingsClick}
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors duration-200 mb-3">
                    <Settings size={24} className="text-slate-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Settings</span>
                </button>

                <button
                  onClick={handleFeedbackClick}
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-200 mb-3">
                    <MessageSquare size={24} className="text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Feedback</span>
                </button>
              </div>
            </div>

            {/* Logout Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <button
                onClick={handleLogoutClick}
                className="flex items-center w-full p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-200 mr-4">
                  <LogOut size={24} className="text-red-600" />
                </div>
                <span className="font-semibold text-gray-700">Logout</span>
              </button>
            </div>

            {/* Menu Benefits
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 shadow-sm mb-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h4 className="font-semibold text-lg text-gray-800">Menu Benefits</h4>
            </div>
            <p className="text-gray-600 mb-3">
              Access all your account features and settings from one convenient location.
            </p>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <p className="text-gray-600">
                <span className="font-semibold">Quick Access:</span> Navigate to any section of your account with just one click.
              </p>
            </div>
          </div> */}

            {/* <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-sm text-blue-800 font-medium">Need help? Contact our support team for assistance</p>
            </div>
          </div>
           */}
          </div>
        </div>
      </div>
    );
  };

  // New render functions for the additional menu sections
  const renderOrdersContent = () => {
    const orderMenuItems = [
      {
        label: "Order History",
        description: "View all your past and current orders",
        page: "orderHistory" as PageName,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
        color: "from-teal-50 to-cyan-50",
        hoverColor: "hover:from-teal-100 hover:to-cyan-100",
        iconBg: "bg-teal-100",
        iconColor: "text-teal-600",
      },
      {
        label: "Order Tracking",
        description: "Track your order delivery status",
        page: "orderTracking" as PageName,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        color: "from-blue-50 to-indigo-50",
        hoverColor: "hover:from-blue-100 hover:to-indigo-100",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        label: "Shopping Cart",
        description: "View items in your shopping cart",
        page: "cart" as PageName,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        ),
        color: "from-purple-50 to-pink-50",
        hoverColor: "hover:from-purple-100 hover:to-pink-100",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
      {
        label: "Order Summary",
        description: "View your latest order summary",
        page: "orderSummary" as PageName,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        color: "from-orange-50 to-amber-50",
        hoverColor: "hover:from-orange-100 hover:to-amber-100",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
      },
    ];

    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Package size={24} />
            </div>
            <h2 className="text-xl font-bold">My Orders</h2>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-200 shadow-sm">
              <div className="flex items-center mb-2">
                <div className="p-3 bg-teal-100 rounded-full mr-3">
                  <Package className="text-teal-600" size={28} />
                </div>
                <h3 className="font-bold text-xl text-gray-800">
                  Orders & Cart
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Manage your orders, track deliveries, and view your cart from here.
              </p>
            </div>

            <div className="space-y-4">
              {orderMenuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setCurrentPage(item.page);
                  }}
                  className={`w-full flex items-center p-4 rounded-xl bg-gradient-to-r ${item.color} ${item.hoverColor} transition-all duration-200 shadow-sm hover:shadow-md group text-left`}
                >
                  <div className={`p-3 ${item.iconBg} rounded-lg group-hover:scale-110 transition-transform duration-200 mr-4 ${item.iconColor}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 block">{item.label}</span>
                    <span className="text-sm text-gray-500">{item.description}</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50">
          <button
            onClick={handleBackToMenu}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            <span>Back to Menu</span>
          </button>
        </div>
      </div>
    );
  };

  const renderBrandsContent = () => {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Tag size={24} />
            </div>
            <h2 className="text-xl font-bold">Select Your Favourite Brands</h2>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-indigo-100 rounded-full mr-3">
                  <Tag className="text-indigo-600" size={28} />
                </div>
                <h3 className="font-bold text-xl text-gray-800">
                  Brand Selection
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Choose from our curated selection of premium brands. We're
                constantly adding new brands to enhance your shopping
                experience.
              </p>

              <button
                onClick={() => {
                  /* Add explore brands functionality */
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mt-6"
              >
                <Tag size={20} />
                <span>Explore All Brands</span>
              </button>
            </div>

            {/* Brand Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-indigo-200 hover:border-indigo-400 hover:scale-[1.02]">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center mb-3">
                    <Tag size={32} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Engineers</h3>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-indigo-200 hover:border-indigo-400 hover:scale-[1.02]">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-3">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800">Designers</h3>
                </div>
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 mb-6">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-indigo-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <p className="text-sm text-indigo-700 font-medium">
                  More brands coming soon!
                </p>
              </div>
            </div>

            {/* Additional Information Card */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Brand Benefits
                </h4>
              </div>
              <p className="text-gray-600 mb-3">
                Discover exclusive offers and products from your favorite
                brands.
              </p>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <p className="text-gray-600">
                  <span className="font-semibold">Exclusive Access:</span> Get
                  early access to new collections and special promotions from
                  your selected brands.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - No border line */}
        <div className="p-6 bg-gray-50">
          <button
            onClick={handleBackToMenu}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            <span>Back to Menu</span>
          </button>
        </div>
      </div>
    );
  };

  const renderCreditsContent = () => {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Coins size={24} />
            </div>
            <h2 className="text-xl font-bold">My Credits</h2>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 p-8 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-yellow-100 rounded-full mr-3">
                  <Coins className="text-yellow-600" size={28} />
                </div>
                <h3 className="font-bold text-xl text-gray-800">
                  Credits Balance
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Earn and redeem credits for exclusive rewards and discounts on
                your purchases.
              </p>

              <div className="flex items-center justify-between mt-6 mb-6 p-4 bg-white rounded-xl border border-yellow-200">
                <span className="text-lg font-semibold text-gray-700">
                  Available Credits
                </span>
                <div className="flex items-center">
                  <Coins size={24} className="text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-800">0</span>
                </div>
              </div>

              <button
                onClick={() => {
                  /* Add earn credits functionality */
                }}
                className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>Earn More Credits</span>
              </button>
            </div>

            {/* How to Earn Credits */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  How to Earn Credits
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <CheckCircle
                    size={20}
                    className="text-green-500 mr-3 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <h5 className="font-medium text-gray-800">
                      Complete Challenges
                    </h5>
                    <p className="text-sm text-gray-600">
                      Participate in special challenges to earn bonus credits
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <CheckCircle
                    size={20}
                    className="text-green-500 mr-3 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <h5 className="font-medium text-gray-800">
                      Make Purchases
                    </h5>
                    <p className="text-sm text-gray-600">
                      Earn credits with every purchase you make
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <CheckCircle
                    size={20}
                    className="text-green-500 mr-3 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <h5 className="font-medium text-gray-800">Refer Friends</h5>
                    <p className="text-sm text-gray-600">
                      Invite friends and earn credits when they join
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <CheckCircle
                    size={20}
                    className="text-green-500 mr-3 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <h5 className="font-medium text-gray-800">Write Reviews</h5>
                    <p className="text-sm text-gray-600">
                      Share your experience and earn credits
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Credits Benefits */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 shadow-sm mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Credits Benefits
                </h4>
              </div>
              <p className="text-gray-600 mb-3">
                Use your credits to unlock exclusive rewards and discounts.
              </p>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
                <p className="text-gray-600">
                  <span className="font-semibold">Redeem for Discounts:</span>{" "}
                  Exchange your credits for discounts on future purchases and
                  exclusive products.
                </p>
              </div>
            </div>

            {/* Notice */}
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-yellow-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <p className="text-sm text-yellow-800 font-medium">
                  Credits can be redeemed for discounts on future purchases!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - No border line */}
        <div className="p-6 bg-gray-50">
          <button
            onClick={handleBackToMenu}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            <span>Back to Menu</span>
          </button>
        </div>
      </div>
    );
  };

  const renderChallengesContent = () => {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Trophy size={24} />
            </div>
            <h2 className="text-xl font-bold">Challenges</h2>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 p-8 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-rose-100 rounded-full mr-3">
                  <Trophy className="text-rose-600" size={28} />
                </div>
                <h3 className="font-bold text-xl text-gray-800">
                  Challenge Rewards
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Participate in exciting challenges to earn credits and unlock
                exclusive rewards. Test your skills and compete with others!
              </p>

              <button
                onClick={() => {
                  /* Add explore challenges functionality */
                }}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mt-6"
              >
                <Trophy size={20} />
                <span>Explore Challenges</span>
              </button>
            </div>

            {/* Prize Credits */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  My Prize Credits
                </h3>
                <div className="flex items-center">
                  <Coins size={24} className="text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-800">0</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Complete your first challenge to earn credits
              </p>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Trophy size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Challenges Available
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  Exciting challenges and credit rewards are on the way! Visit
                  this page again soon to find out what's new.
                </p>

                <button
                  onClick={() => {
                    /* Add browse products functionality */
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>Check Back Later</span>
                </button>
              </div>
            </div>

            {/* Challenge Benefits */}
            <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200 shadow-sm mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-pink-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Challenge Benefits
                </h4>
              </div>
              <p className="text-gray-600 mb-3">
                Participating in challenges offers more than just credits.
              </p>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-rose-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
                <p className="text-gray-600">
                  <span className="font-semibold">Exclusive Rewards:</span>{" "}
                  Complete challenges to unlock special rewards, limited edition
                  items, and bonus credits.
                </p>
              </div>
            </div>

            {/* Notice */}
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-rose-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <p className="text-sm text-rose-800 font-medium">
                  New challenges are added regularly. Check back often for more
                  opportunities to earn credits!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - No border line */}
        <div className="p-6 bg-gray-50">
          <button
            onClick={handleBackToMenu}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            <span>Back to Menu</span>
          </button>
        </div>
      </div>
    );
  };

  const renderSettingsContent = () => {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold">Settings</h2>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 p-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-slate-100 rounded-full mr-3">
                  <svg
                    className="w-6 h-6 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-800">
                  Account Settings
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Manage your account preferences and notification settings to
                customize your experience.
              </p>

              <button
                onClick={() => {
                  /* Add save settings functionality */
                }}
                className="w-full bg-gradient-to-r from-slate-600 to-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mt-6"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span>Save All Settings</span>
              </button>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Manage Notifications
                </h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-600 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      ></path>
                    </svg>
                    <div>
                      <label
                        htmlFor="orderUpdates"
                        className="font-medium text-gray-800"
                      >
                        Order Updates
                      </label>
                      <p className="text-xs text-gray-500">
                        Get notified about your order status
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="orderUpdates"
                      checked={notificationSettings.orderUpdates}
                      onChange={() => handleNotificationChange("orderUpdates")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-600 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <div>
                      <label
                        htmlFor="promotions"
                        className="font-medium text-gray-800"
                      >
                        Promotions and Deals
                      </label>
                      <p className="text-xs text-gray-500">
                        Special offers and discounts
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="promotions"
                      checked={notificationSettings.promotions}
                      onChange={() => handleNotificationChange("promotions")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-600 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <div>
                      <label
                        htmlFor="newsletter"
                        className="font-medium text-gray-800"
                      >
                        Newsletter
                      </label>
                      <p className="text-xs text-gray-500">
                        Weekly updates and news
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={notificationSettings.newsletter}
                      onChange={() => handleNotificationChange("newsletter")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-600 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      ></path>
                    </svg>
                    <div>
                      <label
                        htmlFor="accountAlerts"
                        className="font-medium text-gray-800"
                      >
                        Account Alerts
                      </label>
                      <p className="text-xs text-gray-500">
                        Security and login notifications
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="accountAlerts"
                      checked={notificationSettings.accountAlerts}
                      onChange={() => handleNotificationChange("accountAlerts")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-600 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      ></path>
                    </svg>
                    <div>
                      <label
                        htmlFor="recommendations"
                        className="font-medium text-gray-800"
                      >
                        Product Recommendations
                      </label>
                      <p className="text-xs text-gray-500">
                        Personalized product suggestions
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="recommendations"
                      checked={notificationSettings.recommendations}
                      onChange={() =>
                        handleNotificationChange("recommendations")
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Settings Benefits */}
            <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 shadow-sm mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Settings Benefits
                </h4>
              </div>
              <p className="text-gray-600 mb-3">
                Customize your experience with personalized settings.
              </p>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-slate-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
                <p className="text-gray-600">
                  <span className="font-semibold">
                    Personalized Experience:
                  </span>{" "}
                  Tailor your notifications and preferences to match your needs
                  and interests.
                </p>
              </div>
            </div>

            {/* Notice */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-slate-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <p className="text-sm text-slate-800 font-medium">
                  You can change these settings anytime from your account
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - No border line */}
        <div className="p-6 bg-gray-50">
          <button
            onClick={handleBackToMenu}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            <span>Back to Menu</span>
          </button>
        </div>
      </div>
    );
  };

  const renderProfileContent = () => {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <User size={24} />
            </div>
            <h2 className="text-xl font-bold">Your Profile</h2>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {/*<div className="mb-8 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full mr-3">
                <User className="text-blue-600" size={28} />
              </div>
              <h3 className="font-bold text-xl text-gray-800">Profile Information</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Manage your personal information and social media connections to enhance your experience.
            </p>
            
            <button 
              onClick={() =>
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mt-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Save Profile</span>
            </button>
          </div>*/}

            {/* Avatar Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col items-center">
                {userAvatar ? (
                  <div className="relative mb-4">
                    <img
                      src={userAvatar}
                      alt="User Avatar"
                      className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-200 shadow-lg"
                    />
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative mb-4">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center ring-4 ring-blue-200 shadow-lg">
                      <User size={48} className="text-white" />
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center mb-4">
                {/*<div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>*/}
                <h4 className="font-bold text-xl text-gray-800">
                  Personal Information
                </h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userMobile}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Lock size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <Lock size={12} className="mr-1" />
                    Mobile number cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Accounts */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-pink-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Connect Social Media
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-5">
                Stay connected with your customers
              </p>

              <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-all duration-200 bg-white">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
                    <Instagram size={24} className="text-white" />
                  </div>
                  <span className="font-semibold ml-4 text-gray-700">
                    Instagram
                  </span>
                </div>
                <button className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                  Connect
                </button>
              </div>
            </div>

            {/* Profile Benefits
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 shadow-sm mb-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h4 className="font-semibold text-lg text-gray-800">Profile Benefits</h4>
            </div>
            <p className="text-gray-600 mb-3">
              Complete your profile to unlock exclusive features and personalized experiences.
            </p>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <p className="text-gray-600">
                <span className="font-semibold">Personalized Experience:</span> A complete profile helps us tailor your experience and provide relevant recommendations.
              </p>
            </div>
          </div> */}

            {/* Notice
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-sm text-blue-800 font-medium">Your profile information is secure and will never be shared without your consent</p>
            </div>
          </div> */}

            {/* Save Profile Button */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              {profileSaveMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium flex items-center">
                  <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                  {profileSaveMessage}
                </div>
              )}
              {profileSaveError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                  {profileSaveError}
                </div>
              )}
              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileSaving ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer - No border line */}
        <div className="p-6 bg-gray-50">
          <button
            onClick={handleBackToMenu}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            <span>Back to Menu</span>
          </button>
        </div>
      </div>
    );
  };

  const renderPasswordContent = () => {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Lock size={24} />
            </div>
            <h2 className="text-xl font-bold">Password Security</h2>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 rounded-full mr-3">
                  <Lock className="text-purple-600" size={28} />
                </div>
                <h3 className="font-bold text-xl text-gray-800">Stay Secure</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Regularly updating your password enhances security and protects
                your account from unauthorized access.
              </p>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mt-6"
              >
                <Lock size={20} />
                <span>Change Password</span>
              </button>
            </div>

            {/* Additional Information Card */}
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Password Best Practices
                </h4>
              </div>
              <p className="text-gray-600 mb-3">
                Creating strong passwords is essential for protecting your
                account.
              </p>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
                <p className="text-gray-600">
                  <span className="font-semibold">Strong Password Tips:</span>{" "}
                  Use a mix of uppercase, lowercase, numbers, and special
                  characters. Avoid using personal information or common words.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - No border line */}
        <div className="p-6 bg-gray-50">
          <button
            onClick={handleBackToMenu}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            <span>Back to Menu</span>
          </button>
        </div>

        {/* Password Change Modal - No border line */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
              <div className="flex justify-between items-center p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Change Password
                  </h3>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="px-6 pb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                        placeholder="Enter current password"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                        placeholder="Enter new password"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                        placeholder="Confirm new password"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const render2FAContent = () => {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold">Two-Factor Authentication</h2>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-full mr-3">
                  <Shield className="text-green-600" size={28} />
                </div>
                <h3 className="font-bold text-xl text-gray-800">
                  Extra Layer of Security
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Protect your account with two-factor authentication. You'll need
                both your password and a verification code to sign in.
              </p>

              <button
                onClick={() => setShowPhoneVerification(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mt-6"
              >
                <Shield size={20} />
                <span>Enable 2FA</span>
              </button>
            </div>

            {/* Combined Security Information Card */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Secure Your Account
                </h4>
              </div>
              <p className="text-gray-600 mb-3">
                2FA adds an additional layer of security to your account by
                requiring more than just a password to sign in.
              </p>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
                <p className="text-gray-600">
                  <span className="font-semibold">Peace of Mind:</span> Even if
                  someone has your password, they won't be able to access your
                  account without the verification code.
                </p>
              </div>
            </div>

            {/* 2FA Benefits */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-sm mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  2FA Benefits
                </h4>
              </div>
              <p className="text-gray-600 mb-3">
                Two-factor authentication provides enhanced security for your
                account.
              </p>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
                <p className="text-gray-600">
                  <span className="font-semibold">Enhanced Protection:</span>{" "}
                  2FA significantly reduces the risk of unauthorized access to
                  your account, even if your password is compromised.
                </p>
              </div>
            </div>

            {/* Notice */}
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <p className="text-sm text-green-800 font-medium">
                  Enable 2FA to keep your account secure from unauthorized
                  access
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - No border line */}
        <div className="p-6 bg-gray-50">
          <button
            onClick={handleBackToMenu}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            <span>Back to Menu</span>
          </button>
        </div>

        {/* Phone Verification Modal - No border line */}
        {showPhoneVerification && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
              <div className="flex justify-between items-center p-6 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Phone Verification
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowPhoneVerification(false);
                    setCodeSent(false);
                    setPhoneNumber("");
                    setVerificationCode("");
                  }}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="px-6 pb-6">
                {!codeSent ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex">
                        <div className="bg-gray-100 px-4 py-2 border-2 border-r-0 border-gray-200 rounded-l-xl flex items-center font-semibold text-gray-700">
                          +91
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) =>
                            setPhoneNumber(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="Enter 10 digit number"
                          maxLength={10}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-r-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        We'll send a verification code to this number
                      </p>
                    </div>

                    <button
                      onClick={handleSendVerificationCode}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        ></path>
                      </svg>
                      <span>Send Verification Code</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center mb-1">
                        <svg
                          className="w-5 h-5 text-green-600 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        <p className="text-sm font-medium text-green-800">
                          Verification code sent
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        to:{" "}
                        <span className="font-bold text-gray-800">
                          +91 {phoneNumber}
                        </span>
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-bold text-gray-700">
                        Verification Code
                      </label>
                      <button
                        onClick={handleChangePhoneNumber}
                        className="text-green-600 text-sm font-semibold hover:underline flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                        Change Number
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) =>
                          setVerificationCode(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="Enter 6 digit code"
                        maxLength={6}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-center text-lg tracking-widest font-semibold"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          ></path>
                        </svg>
                      </div>
                    </div>

                    <div className="text-center">
                      {countdown > 0 ? (
                        <p className="text-sm text-gray-500">
                          Resend code in{" "}
                          <span className="font-bold text-green-600">
                            {countdown}s
                          </span>
                        </p>
                      ) : (
                        <button
                          onClick={handleSendVerificationCode}
                          className="text-green-600 text-sm font-semibold hover:underline flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            ></path>
                          </svg>
                          Resend Verification Code
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleVerifyCode}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        ></path>
                      </svg>
                      <span>Verify & Enable 2FA</span>
                    </button>

                    <div className="text-center pt-1">
                      <button
                        onClick={handleSkip2FA}
                        className="text-gray-500 text-sm hover:text-gray-700 font-semibold flex items-center justify-center mx-auto"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        I'll do this later
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Change Phone Modal - No border line */}
        {showChangePhoneModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
              <div className="flex justify-between items-center p-6 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Change Phone Number
                  </h3>
                </div>
                <button
                  onClick={() => setShowChangePhoneModal(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="px-6 pb-6">
                <p className="text-gray-600 mb-4">
                  Do you want to proceed with changing your phone number? You'll
                  need to enter a new number and verify it.
                </p>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> You'll need to verify the new phone
                      number before it can be used for two-factor
                      authentication.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowChangePhoneModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleConfirmChangePhone}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span>Yes, Change</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skip 2FA Modal - No border line */}
        {showSkip2FAModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Skip 2FA Setup?
                  </h3>
                </div>
                <button
                  onClick={() => setShowSkip2FAModal(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="px-6 pb-6">
                <p className="mb-4 text-gray-600">
                  Are you sure you want to skip two-factor authentication?
                </p>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
                  <p className="text-sm text-amber-800">
                    <strong>Security Notice:</strong> Two-factor authentication
                    significantly enhances your account security by requiring
                    both your password and a verification code.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSkip2FAModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                  >
                    Enable Now
                  </button>
                  <button
                    onClick={handleConfirmSkip2FA}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  >
                    Skip for Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFeedbackContent = () => {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold">Share Your Feedback</h2>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-orange-100 rounded-full mr-3">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    ></path>
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-800">
                  We Value Your Feedback
                </h3>
              </div>
              {/* <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-100 rounded-full mr-3">
                <span className="text-lg">👋</span>
              </div>
              <h3 className="font-bold text-xl text-gray-800">Hey, {userName}!</h3>
            </div>*/}
              <p className="text-gray-600 leading-relaxed">
                Your feedback helps us improve and serve you better. We
                appreciate you taking the time to share your thoughts with us.
              </p>

              <button
                onClick={() => {
                  /* Add learn more functionality */
                }}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mt-6"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>Learn More</span>
              </button>
            </div>

            {/* Rating Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <Star className="text-amber-600" size={20} />
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Rate Your Experience
                </h4>
              </div>
              <p className="text-gray-600 text-sm mb-5">
                Click stars to rate from 1 (Poor) to 5 (Excellent)
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">
                    Ease of Use
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setRatings({ ...ratings, easeOfUse: star })
                        }
                        className="transition-all duration-200 hover:scale-110"
                      >
                        {star <= ratings.easeOfUse ? (
                          <Star
                            size={16}
                            className="fill-amber-400 text-amber-400"
                          />
                        ) : (
                          <Star
                            size={16}
                            className="text-gray-300 hover:text-amber-400"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">
                    Features & Capabilities
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setRatings({ ...ratings, features: star })
                        }
                        className="transition-all duration-200 hover:scale-110"
                      >
                        {star <= ratings.features ? (
                          <Star
                            size={16}
                            className="fill-amber-400 text-amber-400"
                          />
                        ) : (
                          <Star
                            size={16}
                            className="text-gray-300 hover:text-amber-400"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">
                    Performance
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setRatings({ ...ratings, performance: star })
                        }
                        className="transition-all duration-200 hover:scale-110"
                      >
                        {star <= ratings.performance ? (
                          <Star
                            size={16}
                            className="fill-amber-400 text-amber-400"
                          />
                        ) : (
                          <Star
                            size={16}
                            className="text-gray-300 hover:text-amber-400"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">
                    Customer Support
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setRatings({ ...ratings, customerSupport: star })
                        }
                        className="transition-all duration-200 hover:scale-110"
                      >
                        {star <= ratings.customerSupport ? (
                          <Star
                            size={16}
                            className="fill-amber-400 text-amber-400"
                          />
                        ) : (
                          <Star
                            size={16}
                            className="text-gray-300 hover:text-amber-400"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">
                    Value for Money
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setRatings({ ...ratings, valueForMoney: star })
                        }
                        className="transition-all duration-200 hover:scale-110"
                      >
                        {star <= ratings.valueForMoney ? (
                          <Star
                            size={16}
                            className="fill-amber-400 text-amber-400"
                          />
                        ) : (
                          <Star
                            size={16}
                            className="text-gray-300 hover:text-amber-400"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">
                    Overall Experience
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setRatings({ ...ratings, overallExperience: star })
                        }
                        className="transition-all duration-200 hover:scale-110"
                      >
                        {star <= ratings.overallExperience ? (
                          <Star
                            size={16}
                            className="fill-amber-400 text-amber-400"
                          />
                        ) : (
                          <Star
                            size={16}
                            className="text-gray-300 hover:text-amber-400"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation Rating */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Would you recommend us?
                </h4>
              </div>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRecommendationRating(star)}
                    className="transition-all duration-200 hover:scale-110 p-1"
                  >
                    {star <= recommendationRating ? (
                      <Star
                        size={28}
                        className="fill-amber-400 text-amber-400"
                      />
                    ) : (
                      <Star
                        size={28}
                        className="text-gray-300 hover:text-amber-400"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Comments */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Additional Comments
                </h4>
              </div>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share any suggestions or thoughts to help us improve your experience..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 resize-none"
                rows={5}
              />
            </div>

            {/* Feedback Benefits */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    ></path>
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Why Your Feedback Matters
                </h4>
              </div>
              <p className="text-gray-600 mb-3">
                Your feedback helps us create a better experience for you and
                all our users.
              </p>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
                <p className="text-gray-600">
                  <span className="font-semibold">Continuous Improvement:</span>{" "}
                  We use your feedback to identify areas for improvement and
                  implement changes that enhance your experience.
                </p>
              </div>
            </div>

            {/* Notice */}
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 mb-6">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-orange-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <p className="text-sm text-orange-800 font-medium">
                  Thank you for taking the time to share your feedback with us!
                </p>
              </div>
            </div>

            <button
              onClick={handleFeedbackSubmit}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
              <span>Submit Feedback</span>
            </button>
          </div>
        </div>

        {/* Footer - No border line */}
        <div className="p-6 bg-gray-50">
          <button
            onClick={handleBackToMenu}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            <span>Back to Menu</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 bg-white z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Left Section - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold text-black">ENGINEERS</div>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6 text-sm font-bold">
                <a
                  href="/men"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage("mens");
                  }}
                  className="text-gray-800 hover:text-black uppercase tracking-wide hover:underline transition-colors"
                >
                  Men
                </a>

                <a
                  href="/women"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage("womens");
                  }}
                  className="text-gray-800 hover:text-black uppercase tracking-wide hover:underline transition-colors"
                >
                  Women
                </a>

                <a
                  href="/accessories"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage("accessories");
                  }}
                  className="text-gray-800 hover:text-black uppercase tracking-wide hover:underline transition-colors"
                >
                  Accessories
                </a>

                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage("landing");
                  }}
                  className="text-gray-800 hover:text-black uppercase tracking-wide hover:underline transition-colors"
                >
                  Home
                </a>

              {/* Company dropdown - visible only on Home page (landing) and only before login */}
                {currentPage === 'landing' && !user && (
                  <div className="relative" ref={companyDropdownRef}>
                    <button 
                      onClick={() => setIsCompanyDropdownOpen?.(!isCompanyDropdownOpen)}
                      className="text-gray-800 hover:text-black uppercase tracking-wide font-bold flex items-center space-x-1 transition-colors"
                    >
                      <span>Company</span>
                      {isCompanyDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isCompanyDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-white shadow-lg rounded-md z-50 border border-gray-100 py-1">
                        <button onClick={() => { setCurrentPage('aboutus'); setIsCompanyDropdownOpen?.(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-semibold text-gray-700">About Us</button>
                        <button onClick={() => { setCurrentPage('news'); setIsCompanyDropdownOpen?.(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-semibold text-gray-700">News</button>
                        <button onClick={() => { setCurrentPage('entrepreneurs'); setIsCompanyDropdownOpen?.(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-semibold text-gray-700">Entrepreneurs</button>
                        <button onClick={() => { setCurrentPage('brandowners'); setIsCompanyDropdownOpen?.(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-semibold text-gray-700">Brand Owners</button>
                        <button onClick={() => { setCurrentPage('founders'); setIsCompanyDropdownOpen?.(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-semibold text-gray-700">Founders</button>
                        <button onClick={() => { setCurrentPage('documents'); setIsCompanyDropdownOpen?.(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-semibold text-gray-700">Documents</button>
                        <button onClick={() => { setCurrentPage('bankings'); setIsCompanyDropdownOpen?.(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-semibold text-gray-700">Bankings</button>
                        <button onClick={() => { setCurrentPage('legals'); setIsCompanyDropdownOpen?.(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-semibold text-gray-700">Legals</button>
                        <button onClick={() => { setCurrentPage('services'); setIsCompanyDropdownOpen?.(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-semibold text-gray-700">Services</button>
                        <button onClick={() => { setCurrentPage('contact'); setIsCompanyDropdownOpen?.(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-semibold text-gray-700">Contact Us</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Search, Icons, and Menu Button */}
            <div className="flex items-center gap-4">
              {/* Notification Icon - only visible when user is logged in */}
              {user && (
              <div className="flex flex-col items-center justify-center gap-0.5 cursor-pointer">
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="cursor-pointer fill-[#333] inline w-5 h-5"
                    viewBox="0 0 371.263 371.263"
                  >
                    <path
                      d="M305.402 234.794v-70.54c0-52.396-33.533-98.085-79.702-115.151.539-2.695.838-5.449.838-8.204C226.539 18.324 208.215 0 185.64 0s-40.899 18.324-40.899 40.899c0 2.695.299 5.389.778 7.964-15.868 5.629-30.539 14.551-43.054 26.647-23.593 22.755-36.587 53.354-36.587 86.169v73.115c0 2.575-2.096 4.731-4.731 4.731-22.096 0-40.959 16.647-42.995 37.845-1.138 11.797 2.755 23.533 10.719 32.276 7.904 8.683 19.222 13.713 31.018 13.713h72.217c2.994 26.887 25.869 47.905 53.534 47.905s50.54-21.018 53.534-47.905h72.217c11.797 0 23.114-5.03 31.018-13.713 7.904-8.743 11.797-20.479 10.719-32.276-2.036-21.198-20.958-37.845-42.995-37.845a4.704 4.704 0 0 1-4.731-4.731zM185.64 23.952c9.341 0 16.946 7.605 16.946 16.946 0 .778-.12 1.497-.24 2.275-4.072-.599-8.204-1.018-12.336-1.138-7.126-.24-14.132.24-21.078 1.198-.12-.778-.24-1.497-.24-2.275.002-9.401 7.607-17.006 16.948-17.006zm0 323.358c-14.431 0-26.527-10.3-29.342-23.952h58.683c-2.813 13.653-14.909 23.952-29.341 23.952zm143.655-67.665c.479 5.15-1.138 10.12-4.551 13.892-3.533 3.773-8.204 5.868-13.353 5.868H59.89c-5.15 0-9.82-2.096-13.294-5.868-3.473-3.772-5.09-8.743-4.611-13.892.838-9.042 9.282-16.168 19.162-16.168 15.809 0 28.683-12.874 28.683-28.683v-73.115c0-26.228 10.419-50.719 29.282-68.923 18.024-17.425 41.498-26.887 66.528-26.887 1.198 0 2.335 0 3.533.06 50.839 1.796 92.277 45.929 92.277 98.325v70.54c0 15.809 12.874 28.683 28.683 28.683 9.88 0 18.264 7.126 19.162 16.168z"
                      data-original="#000000"
                    />
                  </svg>
                  <span className="absolute left-auto -ml-1 top-0 rounded-full bg-red-500 px-1 py-0 text-xs text-white">
                    0
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-slate-900">
                  Notifications
                </span>
              </div>
              )}

              {/* Search Icon */}
              <form
                onSubmit={handleSearch}
                className="hidden md:flex items-center border border-gray-300 rounded-md px-4 py-2 gap-2 w-72"
              >
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search Products..."
                  className="outline-none text-sm flex-1 bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {/* Set Up Portal Button - Show only on dashboard pages for logged-in customer, founder and brand owner who haven't set up portal yet */}
              {user &&
                  (user.userType === "customer" ||
                    user.userType === "founder" ||
                    user.userType === "brand_owner") &&
                (currentPage === "customerDashboard" ||
                  currentPage === "founderDashboard" ||
                  currentPage === "brandOwnerDashboard") &&
                !hasPortal && (
                  <button
                    onClick={onPortalClick}
                    className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-green-500 rounded hover:from-green-700 hover:to-green-600 transition-all duration-300 ease-in-out hover:scale-105"
                  >
                    {user.userType === "brand_owner"
                      ? "Portal Set Up"
                      : "Set Up Portal"}
                  </button>
                )}

              {/* Wishlist Icon */}
              <div
                className="flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                onClick={() => {
                  if (!user) {
                    onNavigateToSignup?.();
                  } else {
                    setCurrentPage("wishlist");
                  }
                }}
              >
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="cursor-pointer fill-[#333] inline w-5 h-5"
                    viewBox="0 0 64 64"
                  >
                    <path
                      d="M45.5 4A18.53 18.53 0 0 0 32 9.86 18.5 18.5 0 0 0 0 22.5C0 40.92 29.71 59 31 59.71a2 2 0 0 0 2.06 0C34.29 59 64 40.92 64 22.5A18.52 18.52 0 0 0 45.5 4ZM32 55.64C26.83 52.34 4 36.92 4 22.5a14.5 14.5 0 0 1 26.36-8.33 2 2 0 0 0 3.27 0A14.5 14.5 0 0 1 60 22.5c0 14.41-22.83 29.83-28 33.14Z"
                      data-original="#000000"
                    />
                  </svg>
                  <span className="absolute left-auto -ml-1 top-0 rounded-full bg-red-500 px-1 py-0 text-xs text-white">
                    {wishlistItems.length}
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-slate-900">
                  Wishlist
                </span>
              </div>

              {/* Cart Icon */}
              <div
                className="flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                onClick={() => {
                  if (!user) {
                    onNavigateToSignup?.();
                  } else {
                    setCurrentPage("cart");
                  }
                }}
              >
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    className="cursor-pointer fill-[#333] inline"
                    viewBox="0 0 512 512"
                  >
                    <path
                      d="M164.96 300.004h.024c.02 0 .04-.004.059-.004H437a15.003 15.003 0 0 0 14.422-10.879l60-210a15.003 15.003 0 0 0-2.445-13.152A15.006 15.006 0 0 0 497 60H130.367l-10.722-48.254A15.003 15.003 0 0 0 105 0H15C6.715 0 0 6.715 0 15s6.715 15 15 15h77.969c1.898 8.55 51.312 230.918 54.156 243.71C131.184 280.64 120 296.536 120 315c0 24.812 20.188 45 45 45h272c8.285 0 15-6.715 15-15s-6.715-15-15-15H165c-8.27 0-15-6.73-15-15 0-8.258 6.707-14.977 14.96-14.996zM477.114 90l-51.43 180H177.032l-40-180zM150 405c0 24.813 20.188 45 45 45s45-20.188 45-45-20.188-45-45-45-45 20.188-45 45zm45-15c8.27 0 15 6.73 15 15s-6.73 15-15 15-15-6.73-15-15 6.73-15 15-15zm167 15c0 24.813 20.188 45 45 45s45-20.188 45-45-20.188-45-45-45-45 20.188-45 45zm45-15c8.27 0 15 6.73 15 15s-6.73 15-15 15-15-6.73-15-15 6.73-15 15-15zm0 0"
                      data-original="#000000"
                    ></path>
                  </svg>
                  <span className="absolute left-auto -ml-1 top-0 rounded-full bg-red-500 px-1 py-0 text-xs text-white">
                    {cartItems.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-slate-900">
                  Cart
                </span>
              </div>


              {/* Login/Sign Up pre-login | Dashboard icon + Menu button post-login */}
              {user ? (
                <div className="flex items-center gap-2">
                  {/* Dashboard Icon - navigates to dashboard from non-dashboard pages */}
                  {currentPage !== "customerDashboard" && currentPage !== "brandOwnerDashboard" && currentPage !== "founderDashboard" && currentPage !== "adminDashboard" && (
                    <button
                      onClick={() => {
                        if (user.userType === "customer") {
                          setCurrentPage("customerDashboard");
                        } else if (user.userType === "brand_owner") {
                          setCurrentPage("brandOwnerDashboard");
                        } else if (user.userType === "founder") {
                          setCurrentPage("founderDashboard");
                        } else if (user.userType === "admin") {
                          setCurrentPage("adminDashboard");
                        }
                      }}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      title="Dashboard"
                    >
                      <img src="/dashboard.png" alt="Dashboard" className="w-7 h-7 object-contain" />
                    </button>
                  )}
                  {/* Menu (hamburger) button - only visible on dashboard pages */}
                  {(currentPage === 'customerDashboard' || currentPage === 'brandOwnerDashboard' || currentPage === 'founderDashboard' || currentPage === 'adminDashboard') && (
                  <button
                    onClick={handleMenuClick}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  >
                    <Menu size={24} />
                  </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={onNavigateToSignup}
                  className="px-5 py-2 text-sm font-bold text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors uppercase tracking-wide"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Menu Drawer - only rendered when user is logged in */}
      {user && renderMenuDrawer()}

      {/* 2FA Modal - Uses TwoFactorAuthSetup component in modal mode */}
      {show2FAModal && user && (
        <TwoFactorAuthSetup
          user={user}
          isModal={true}
          onClose={() => setShow2FAModal(false)}
          onVerificationSuccess={() => {
            setShow2FAModal(false);
            // Optionally show a success message or refresh user data
          }}
          onSkip={() => setShow2FAModal(false)}
          onBackToLogin={() => setShow2FAModal(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
            <div className="flex justify-between items-center p-6 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4 4m4-4H3a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Confirm Logout
                </h3>
              </div>
              <button
                onClick={() => setShowLogoutConfirmation(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="px-6 pb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to logout from your account?
              </p>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    ></path>
                  </svg>
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> You'll need to login again to access
                    your account.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancelLogout}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4 4m4-4H3a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <span>Yes, Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
