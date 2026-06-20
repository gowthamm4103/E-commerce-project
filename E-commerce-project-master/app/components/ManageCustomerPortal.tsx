'use client';

import React, { useState, useEffect, useRef } from 'react';

import { Check, Copy, X, ArrowLeft, Edit, Eye, LayoutDashboard, Users, Wallet, DollarSign, FileText, Banknote, Store } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';

import PortalSetupStep1 from './PortalSetupStep1';
import PortalSetupStep2 from './PortalSetupStep2';
import PortalSetupStep3 from './PortalSetupStep3';
import PortalSetupStep4 from './PortalSetupStep4';
import type { UserData, PageName } from '../types';
import { mlmAPI, portalsAPI } from '../lib/api';

interface ManageCustomerPortalProps {
  user: UserData;
  onLogout: () => void;
  onSwitchToDashboard: () => void;
  onNavigateToTab?: (tab: string) => void;
  // Sidebar state props for persistence across navigation
  isSidebarOpen?: boolean;
  isSidebarCollapsed?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
  setIsSidebarCollapsed?: (collapsed: boolean) => void;
}

const ManageCustomerPortal = ({ 
  user, 
  onLogout, 
  onSwitchToDashboard, 
  onNavigateToTab,
  isSidebarOpen: sidebarOpenProp,
  isSidebarCollapsed: sidebarCollapsedProp,
  setIsSidebarOpen,
  setIsSidebarCollapsed
}: ManageCustomerPortalProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use props if provided, otherwise use local state for sidebar
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(true);
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState(false);
  
  const isSidebarOpen = sidebarOpenProp ?? internalSidebarOpen;
  const isSidebarCollapsed = sidebarCollapsedProp ?? internalSidebarCollapsed;
  const handleSetSidebarOpen = setIsSidebarOpen ?? setInternalSidebarOpen;
  const handleSetSidebarCollapsed = setIsSidebarCollapsed ?? setInternalSidebarCollapsed;
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [portalData, setPortalData] = useState<any>(null);
  const [setupStep, setSetupStep] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const companyDropdownRef = React.useRef(null);
  
  // Function to refresh portal data
  const refreshPortalData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await portalsAPI.getMyPortals();
      console.log('Portal API response (refresh):', res);
      if (res.success && res.portals && res.portals.length > 0) {
        setPortalData(res.portals[0]);
      } else {
        setPortalData(null);
      }
    } catch (err) {
      console.error('Failed to refresh portal data:', err);
      setPortalData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load user data and portal data from API
  React.useEffect(() => {
    if (user.userId) {
      mlmAPI.getUserById(user.userId).then(res => {
        if (res.user) setUserData(res.user);
      }).catch((err) => {
        console.error('Failed to load user data:', err);
      });
      
      // Load portal data
      const loadPortalData = async () => {
        try {
          const res = await portalsAPI.getMyPortals();
          console.log('Portal API response:', res);
          // Get the first (and only) portal for this user
          if (res.success && res.portals && res.portals.length > 0) {
            const portal = res.portals[0];
            console.log('Portal data loaded:', {
              brandTagline: portal.brandTagline || '',
              facebookUrl: portal.facebookUrl || '',
              linkedInUrl: portal.linkedInUrl || '',
              instagramUrl: portal.instagramUrl || '',
              twitterUrl: portal.twitterUrl || ''
            });
            setPortalData(portal);
          } else {
            console.log('No portals found for user');
            setPortalData(null);
          }
        } catch (err) {
          console.error('Failed to load portal data:', err);
          setPortalData(null);
        }
      };
      loadPortalData();
    }
  }, [user.userId]);
  
  // Generate referral link — portal URL format: /{userId}/portal/{brandname}
  const portalUrlPath = portalData?.url || user.userId;
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/${user.userId}/portal/${portalUrlPath}`;
  
  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSetupPortal = () => {
    setSetupStep(1);
  };
  
  const handleSetupStepContinue = () => {
    setSetupStep(prev => prev + 1);
  };
  
  const handleSetupStepBack = () => {
    setSetupStep(prev => prev - 1);
  };
  
  const handlePublishPortal = async () => {
    setSetupStep(0);
    // Reload portal data from API to ensure we have the latest saved data
    try {
      const res = await portalsAPI.getMyPortals();
      console.log('Portal data after publish:', res);
      if (res.success && res.portals && res.portals.length > 0) {
        const savedPortal = res.portals[0];
        console.log('Saved portal values:', {
          brandTagline: savedPortal.brandTagline,
          facebookUrl: savedPortal.facebookUrl,
          linkedInUrl: savedPortal.linkedInUrl,
          instagramUrl: savedPortal.instagramUrl,
          twitterUrl: savedPortal.twitterUrl
        });
        setPortalData(savedPortal);
        // Show success message
        alert("Portal successfully customized!");
      } else {
        alert("Portal published but could not load saved data. Please refresh the page.");
      }
    } catch (err) {
      console.error('Failed to reload portal data after publish:', err);
      alert("Portal published but encountered an error loading data. Please refresh the page.");
    }
    // Redirect to dashboard after publishing
    onSwitchToDashboard();
  };
  
  const handlePreviewPortal = () => {
    // Open the portal in a new tab for preview - directly to login page
    if (portalData) {
      window.open(`${window.location.origin}/${user.userId}/portal/${portalData.url}?preview=true`, '_blank');
    } else {
      alert("Please set up your portal first");
    }
  };
  
  const renderSetupStep = () => {
    switch (setupStep) {
      case 1:
        return (
          <PortalSetupStep1
            onContinue={handleSetupStepContinue}
            onBack={() => setSetupStep(0)}
            parentInfo={{
              parentId: user.userId as string,
              parentName: user.name as string
            }}
            portalData={portalData || {}}
            setPortalData={setPortalData}
          />
        );
      case 2:
        return (
          <PortalSetupStep2
            onContinue={handleSetupStepContinue}
            onBack={handleSetupStepBack}
            portalData={portalData || {}}
            setPortalData={setPortalData}
          />
        );
      case 3:
        return (
          <PortalSetupStep3
            onContinue={handleSetupStepContinue}
            onBack={handleSetupStepBack}
            portalData={portalData || {}}
            setPortalData={setPortalData}
          />
        );
      case 4:
        return (
          <PortalSetupStep4
            onPublish={handlePublishPortal}
            onBack={handleSetupStepBack}
            portalData={portalData || {}}
            user={user}
          />
        );
      default:
        return null;
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header Section - Title on left, Back button on right */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Manage Customer Portal</h2>
              <button
                onClick={onSwitchToDashboard}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </button>
            </div>
            
            {portalData ? (
              <div className="space-y-6">
                {/* Portal Details Section - Two columns with vertical divider */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Section - Brand Name and Tagline */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">Brand Name</label>
                      <p className="text font-medium text-gray-500">{portalData.brandName || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">Brand Tagline</label>
                      <p className="text-gray-500">{portalData.brandTagline || 'Not set'}</p>
                    </div>
                  </div>
                  
                  {/* Right Section - Portal URL and Dates */}
                  <div className="space-y-4 md:border-l md:border-gray-200 md:pl-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">Portal URL</label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {`${window.location.origin}/${user.userId}/portal/${portalData.url}`}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/${user.userId}/portal/${portalData.url}`);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="text-blue-600 hover:text-blue-600 flex-shrink-0 cursor-pointer"
                          title="Copy URL"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <div className="flex-1 pr-2 border-r border-gray-200">
                        <label className="block text-sm font-bold text-gray-800 mb-1">Created Date</label>
                        <p className="text-sm text-gray-700">
                          {portalData.createdAt ? new Date(portalData.createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </p>
                      </div>
                      <div className="flex-1 pl-2">
                        <label className="block text-sm font-bold text-gray-800 mb-1">Last Updated Date</label>
                        <p className="text-sm text-gray-700">
                          {portalData.updatedAt ? new Date(portalData.updatedAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Horizontal Divider */}
                <hr className="border-gray-200" />
                
                {/* Social Media Links Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Facebook */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-800 mb-1">Facebook</p>
                      <p className="text-sm text-gray-600 truncate">
                        {portalData.facebookUrl ? (
                          <a href={portalData.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {portalData.facebookUrl}
                          </a>
                        ) : 'Not configured'}
                      </p>
                    </div>
                    
                    {/* Instagram */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-800 mb-1">Instagram</p>
                      <p className="text-sm text-gray-600 truncate">
                        {portalData.instagramUrl ? (
                          <a href={portalData.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {portalData.instagramUrl}
                          </a>
                        ) : 'Not configured'}
                      </p>
                    </div>
                    
                    {/* LinkedIn */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-800 mb-1">LinkedIn</p>
                      <p className="text-sm text-gray-600 truncate">
                        {portalData.linkedInUrl ? (
                          <a href={portalData.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {portalData.linkedInUrl}
                          </a>
                        ) : 'Not configured'}
                      </p>
                    </div>
                    
                    {/* X (Twitter) */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-800 mb-1">X (Twitter)</p>
                      <p className="text-sm text-gray-600 truncate">
                        {portalData.twitterUrl ? (
                          <a href={portalData.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {portalData.twitterUrl}
                          </a>
                        ) : 'Not configured'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - Bottom Left */}
                <div className="flex justify-start gap-4 pt-4">
                  <button
                    onClick={() => setSetupStep(1)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    Edit Portal
                  </button>
                  <button
                    onClick={handlePreviewPortal}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 transition-colors"
                  >
                    Preview Portal
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">No Portal Created Yet</h3>
                <p className="text-gray-600 mb-6">Create your personalized portal to start building your brand and expanding your network.</p>
                <button
                  onClick={handleSetupPortal}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Set Up Portal
                </button>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
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
          setCurrentPage={() => {}}
          setShowAuth={() => {}}
          showSecondaryHeader={false}
          secondaryTitle=""
          onMenuClick={() => {}}
          currentPage="customerDashboard"
        />
      
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isOpen={isSidebarOpen}
        onToggle={() => handleSetSidebarCollapsed(!isSidebarCollapsed)}
        onClose={() => handleSetSidebarOpen(false)}
        items={[
          {
            id: 'dashboard',
            icon: <LayoutDashboard size={20} />,
            label: 'Dashboard',
            onClick: () => {
              if (onNavigateToTab) {
                onNavigateToTab('profile');
              } else {
                onSwitchToDashboard();
              }
            },
            isActive: false
          },
          {
            id: 'ewallet',
            icon: <Wallet size={20} />,
            label: 'E-Wallet',
            onClick: () => {
              if (onNavigateToTab) {
                onNavigateToTab('ewallet');
              } else {
                onSwitchToDashboard();
              }
            },
            isActive: false
          },
          {
            id: 'incomewallet',
            icon: <DollarSign size={20} />,
            label: 'Income Wallet',
            onClick: () => {
              if (onNavigateToTab) {
                onNavigateToTab('incomewallet');
              } else {
                onSwitchToDashboard();
              }
            },
            isActive: false
          },
          {
            id: 'kyc',
            icon: <FileText size={20} />,
            label: 'KYC Verification',
            onClick: () => {
              if (onNavigateToTab) {
                onNavigateToTab('kyc');
              } else {
                onSwitchToDashboard();
              }
            },
            isActive: false
          },
          {
            id: 'bank',
            icon: <Banknote size={20} />,
            label: 'Add Bank Account',
            onClick: () => {
              if (onNavigateToTab) {
                onNavigateToTab('bank');
              } else {
                onSwitchToDashboard();
              }
            },
            isActive: false
          },
          {
            id: 'portal',
            icon: <Store size={20} />,
            label: 'Manage Customer Portal',
            onClick: () => setActiveTab('overview'),
            isActive: activeTab === 'overview'
          }
        ]}
      />
      
      {/* Main Content */}
      <div className={`px-4 py-8 transition-all duration-300 ${isSidebarOpen && !isSidebarCollapsed ? 'md:ml-64' : isSidebarOpen ? 'md:ml-16' : ''}`}>
        <div className="max-w-8xl mx-auto">
        {setupStep > 0 ? (
          <div className="max-w-8xl mx-auto px-4 py-8">
            {renderSetupStep()}
          </div>
        ) : (
          renderTabContent()
        )}
        </div>
      </div>
      
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Profile Information</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <p className="text-gray-900">{user.userId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Link</label>
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

// Team Portal Data Management Class


export default ManageCustomerPortal;