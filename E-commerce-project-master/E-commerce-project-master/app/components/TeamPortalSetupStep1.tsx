'use client';

import React, { useState, useEffect } from 'react';


interface TeamPortalSetupStep1Props {
  onContinue: (data?: unknown) => void;
  parentInfo?: unknown;
  onBack: () => void;
}

const TeamPortalSetupStep1 = ({ onContinue, parentInfo, onBack }: TeamPortalSetupStep1Props): JSX.Element => {
  const [brandName, setBrandName] = useState("");
  const [portalUrl, setPortalUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    // Generate portal URL based on brand name
    if (brandName) {
      const generatedUrl = brandName.toLowerCase().replace(/\s+/g, '-');
      setPortalUrl(generatedUrl);
    }
  }, [brandName]);

  const handleContinue = () => {
    if (!brandName.trim()) {
      alert("Please enter a brand name");
      return;
    }

    if (!portalUrl.trim()) {
      alert("Please enter a portal URL");
      return;
    }

    onContinue({
      brandName,
      url: portalUrl
    });
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Step 1: Setup Team Portal</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Enter your brand name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Portal URL</label>
          <div className="flex items-center">
            <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
              {window.location.origin}/team-portal/
            </span>
            <input
              type="text"
              value={portalUrl}
              onChange={(e) => {
                setPortalUrl(e.target.value);
                setUrlError("");
              }}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="your-portal-url"
            />
          </div>
          {urlError && <p className="text-red-500 text-sm mt-1">{urlError}</p>}
          <p className="text-sm text-gray-600 mt-2">
            This URL will be used to access your team portal.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Your Portal URL</h3>
          <div className="flex items-center bg-white p-3 rounded-lg">
            <input
              type="text"
              value={`${window.location.origin}/team-portal/${portalUrl}`}
              readOnly
              className="flex-1 bg-transparent outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/team-portal/${portalUrl}`);
                alert("Link copied to clipboard!");
              }}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Copy Link
            </button>
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
          onClick={handleContinue}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}



export default TeamPortalSetupStep1;
