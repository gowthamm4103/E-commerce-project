'use client';

import React, { useState, useEffect, useRef } from 'react';

import { Check, Copy, X, Menu, LayoutDashboard, ArrowLeft } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import { portalsAPI } from '../lib/api';

import TeamPortalSetupStep1 from './TeamPortalSetupStep1';
import TeamPortalSetupStep2 from './TeamPortalSetupStep2';
import TeamPortalSetupStep3 from './TeamPortalSetupStep3';
import type { UserData, PageName } from '../types';
import { mlmAPI } from '../lib/api';

interface ManageTeamPortalProps {
  user: UserData;
  onLogout: () => void;
  onSwitchToDashboard: () => void;
}

const ManageTeamPortal = ({ user, onLogout, onSwitchToDashboard }: ManageTeamPortalProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [portalData, setPortalData] = useState<any>(null);
  const [setupStep, setSetupStep] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const companyDropdownRef = React.useRef(null);

  // Load user data from API
  React.useEffect(() => {
    if (user.userId) {
      mlmAPI.getUserById(user.userId).then(res => {
        if (res.user) setUserData(res.user);
      }).catch(() => {});
    }
  }, [user.userId]);
  
  // Generate referral link
  const referralLink = `${window.location.origin}?ref=${user.userId}`;
  
  // Load portal data when component mounts
  React.useEffect(() => {
    portalsAPI.getMyPortals().then(res => {
      const teamPortal = res.portals?.find((p: any) => p.portalType === 'team');
      if (teamPortal) setPortalData(teamPortal);
    }).catch(() => {});
  }, [user.userId]);
  
  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSetupPortal = () => {
    setSetupStep(1);
  };
  
  const handleSetupStepContinue = (data) => {
    setPortalData(prev => ({ ...prev, ...data }));
    setSetupStep(prev => prev + 1);
  };
  
  const handleSetupStepBack = () => {
    setSetupStep(prev => Math.max(1, prev - 1));
  };
  
  const handlePublishPortal = () => {
    alert("Team portal successfully created!");
    setSetupStep(0);
    // Reload portal data from API
    portalsAPI.getMyPortals().then(res => {
      const teamPortal = res.portals?.find((p: any) => p.portalType === 'team');
      if (teamPortal) setPortalData(teamPortal);
    }).catch(() => {});
    // Redirect to dashboard after publishing
    onSwitchToDashboard();
  };

  const renderSetupStep = () => {
    switch (setupStep) {
      case 1:
        return (
          <TeamPortalSetupStep1
            onContinue={handleSetupStepContinue}
            onBack={() => setSetupStep(0)}
            parentInfo={{
              parentId: user.userId,
              parentName: user.name
            }}
          />
        );
      case 2:
        return (
          <TeamPortalSetupStep2
            onContinue={handleSetupStepContinue}
            onBack={handleSetupStepBack}
            portalData={portalData || {}}
            setPortalData={setPortalData}
          />
        );
      case 3:
        return (
          <TeamPortalSetupStep3
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
    // If in setup mode, render setup step
    if (setupStep > 0) {
      return renderSetupStep();
    }
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Team Portal</h2>
              <button
                onClick={onSwitchToDashboard}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            
            {portalData ? (
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Portal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Brand Name</span>
                      <p className="font-medium">{portalData.brandName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Portal URL</span>
                      <div className="flex items-center">
                        <p className="font-medium mr-2">{window.location.origin}/team-portal/{portalData.url}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/team-portal/${portalData.url}`);
                            alert("Link copied to clipboard!");
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Last Updated</span>
                      <p className="font-medium">{new Date(portalData.updatedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Created</span>
                      <p className="font-medium">{new Date(portalData.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={() => setSetupStep(1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Portal
                  </button>
                  <button
                    onClick={() => window.open(`${window.location.origin}/team-portal/${portalData.url}`, '_blank')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
                <h3 className="text-xl font-semibold mb-2">No Team Portal Created Yet</h3>
                <p className="text-gray-600 mb-6">Create your personalized team portal to start building your brand.</p>
                <button
                  onClick={handleSetupPortal}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Set Up Team Portal
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
        />
      
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onClose={() => setIsSidebarOpen(false)}
        items={[
          {
            id: 'overview',
            icon: <LayoutDashboard size={20} />,
            label: 'Portal Overview',
            onClick: () => {
              setActiveTab('overview');
              setSetupStep(0);
            },
            isActive: activeTab === 'overview' && setupStep === 0
          },
          {
            id: 'dashboard',
            icon: <ArrowLeft size={20} />,
            label: 'Back to Dashboard',
            onClick: () => onSwitchToDashboard(),
            isActive: false
          }
        ]}
      />
      
      {/* Main Content */}
      <div className={`px-4 py-8 transition-all duration-300 ${isSidebarOpen && !isSidebarCollapsed ? 'md:ml-64' : isSidebarOpen ? 'md:ml-16' : ''}`}>
        <div className="max-w-8xl mx-auto">
        {renderTabContent()}
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



export default ManageTeamPortal;
