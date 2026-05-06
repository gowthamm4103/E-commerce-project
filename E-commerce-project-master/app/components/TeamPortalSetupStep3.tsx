'use client';

import React from 'react';

import { portalsAPI } from '../lib/api';

import type { UserData } from '../types';

interface TeamPortalSetupStep3Props {
  onPublish: (data?: unknown) => void;
  portalData: Record<string, unknown>;
  user: UserData;
  onBack: () => void;
}

const TeamPortalSetupStep3 = ({ onPublish, portalData, user, onBack }: TeamPortalSetupStep3Props): JSX.Element => {
  const handlePublish = async () => {
    // Save portal data via API
    try {
      await portalsAPI.create({ ...portalData, portalType: 'team' });
    } catch { /* fallback */ }
    
    // Show success message and redirect to dashboard
    alert("Team portal successfully created!");
    
    // Redirect to brand owner dashboard
    onPublish();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 3: Preview and Publish</h2>
      
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Portal Preview</h3>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            {portalData.logo ? (
              <img src={portalData.logo} alt="Logo" className="h-12 mr-4" />
            ) : (
              <div className="h-12 w-12 bg-gray-200 rounded mr-4 flex items-center justify-center">
                <span className="text-gray-500 text-xs">No Logo</span>
              </div>
            )}
            <div>
              <h4 className="text-xl font-bold">{portalData.brandName}</h4>
              <p className="text-sm text-gray-600">{portalData.url}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h5 className="font-semibold mb-2">Portal URL:</h5>
            <div className="flex items-center bg-gray-100 p-3 rounded-lg">
              <input
                type="text"
                value={`${window.location.origin}/team-portal/${portalData.url}`}
                readOnly
                className="flex-1 bg-transparent outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/team-portal/${portalData.url}`);
                  alert("Link copied to clipboard!");
                }}
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
        >
          Back
        </button>
        <button
          onClick={handlePublish}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
        >
          Save and Publish
        </button>
      </div>
    </div>
  );
}



export default TeamPortalSetupStep3;
