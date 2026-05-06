'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { portalsAPI, mlmAPI } from '../lib/api';
import TeamMemberPortal from './TeamMemberPortal';

const TeamPortalLanding = ({ portalUrl }: { portalUrl: string }): JSX.Element => {
  const router = useRouter();
  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load portal data — try team portal first, then fall back to regular portal
    portalsAPI.getByUrl(portalUrl).then(async (res) => {
      if (res.portal) {
        try {
          const userRes = await mlmAPI.getUserById(res.portal.userId);
          if (userRes.user) {
            setPortalData({
              ...res.portal,
              ownerName: userRes.user.name,
              ownerId: res.portal.userId,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Team Portal Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Portal branding header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center">
          {portalData?.logo && (
            <img src={portalData.logo} alt="Portal Logo" className="h-8 mr-3" />
          )}
          <h1 className="text-xl font-bold text-gray-800">
            {portalData?.brandName || "Team Portal"}
          </h1>
        </div>
      </div>

      {/* Team Member Portal (login + product management) */}
      <TeamMemberPortal onBack={() => router.push('/')} />
    </div>
  );
};

export default TeamPortalLanding;
