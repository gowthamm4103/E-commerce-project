'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { portalsAPI, mlmAPI } from '../lib/api';

import PortalLogin from './PortalLogin';
import PortalRegistration from './PortalRegistration';
import CustomerDashboard from './CustomerDashboard';
import TeamMemberPortal from './TeamMemberPortal';

const CustomerPortalLanding = ({ portalUrl, directToLogin = false }: { portalUrl: string; directToLogin?: boolean }): JSX.Element => {
  const router = useRouter();
  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<string>(directToLogin ? 'login' : 'landing');
  const [params, setParams] = useState<any>({});

  useEffect(() => {
    // Load portal data from API
    portalsAPI.getByUrl(portalUrl).then(async (res) => {
      if (res.portal) {
        try {
          const userRes = await mlmAPI.getUserById(res.portal.userId);
          if (userRes.user) {
            setPortalData({
              ...res.portal,
              ownerName: userRes.user.name,
              ownerId: res.portal.userId,
              user: {
                userId: res.portal.userId,
                name: userRes.user.name,
                email: userRes.user.email,
                userType: userRes.user.userType || 'customer'
              }
            });
          } else {
            setError("Portal owner not found");
          }
        } catch {
          setError("Portal owner not found");
        }
      } else {
        setError("Portal not found");
      }
      setLoading(false);
    }).catch(() => {
      setError("Portal not found");
      setLoading(false);
    });
  }, [portalUrl]);

  const switchView = (newView: string, newParams: any = {}) => {
    setView(newView);
    setParams(newParams);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Portal Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate view based on the current view state
  switch (view) {
    case 'landing':
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center min-h-screen">
              <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  {portalData.logo && (
                    <img src={portalData.logo} alt="Portal Logo" className="h-12 mr-3" />
                  )}
                  <h1 className="text-3xl font-bold text-gray-800">
                    {portalData.brandName || "ENGINEERS"}
                  </h1>
                </div>
                <p className="text-gray-600 mb-6">{portalData.brandMessage || "Welcome to our customer portal"}</p>
                
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={() => switchView('register')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition transform hover:scale-105"
                  >
                    Register
                  </button>
                  <button
                    onClick={() => switchView('login')}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition transform hover:scale-105"
                  >
                    Login
                  </button>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-400">or</span>
                    </div>
                  </div>
                  <button
                    onClick={() => switchView('teamLogin')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition transform hover:scale-105"
                  >
                    Team Member Login
                  </button>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                <p>Powered by ENGINEERS</p>
              </div>
            </div>
          </div>
        </div>
      );
    case 'login':
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <PortalLogin 
            onSwitchView={switchView} 
            parentInfo={{
              parentId: portalData.ownerId,
              parentName: portalData.ownerName
            }}
            successMessage={params.successMessage}
            isPortal={true}
            portalBrandName={portalData.brandName || "ENGINEERS"}
            portalLogo={portalData.logo}
            portalTagline={portalData.brandTagline || ''}
            portalSocialLinks={{
              facebook: portalData.facebookUrl,
              linkedin: portalData.linkedInUrl,
              instagram: portalData.instagramUrl,
              twitter: portalData.twitterUrl
            }}
          />
        </div>
      );
    case 'register':
      return (
        <PortalRegistration 
          onSwitchView={switchView} 
          parentInfo={{
            parentId: portalData.ownerId,
            parentName: portalData.ownerName
          }}
          isPortal={true}
          portalBrandName={portalData.brandName || "ENGINEERS"}
          portalLogo={portalData.logo}
          portalTagline={portalData.brandTagline || ''}
          portalSocialLinks={{
            facebook: portalData.facebookUrl,
            linkedin: portalData.linkedInUrl,
            instagram: portalData.instagramUrl,
            twitter: portalData.twitterUrl
          }}
        />
      );
    case 'customerDashboard':
      return (
        <CustomerDashboard 
          user={params}
          onLogout={() => router.push(`/portal/${portalUrl}`)}
        />
      );
    case 'teamLogin':
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <TeamMemberPortal onBack={() => switchView('landing')} />
        </div>
      );
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center min-h-screen">
              <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
                <button
                  onClick={() => switchView('landing')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Back to Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      );
  }
}



export default CustomerPortalLanding;
