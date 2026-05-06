'use client';

import React, { useState, useEffect } from 'react';


interface PortalSetupStep2Props {
  onContinue: (data?: unknown) => void;
  onBack: () => void;
  portalData: Record<string, unknown>;
  setPortalData: (data: Record<string, unknown>) => void;
}

const PortalSetupStep2 = ({ onContinue, onBack, portalData, setPortalData }: PortalSetupStep2Props): JSX.Element => {
  const [brandName, setBrandName] = useState(portalData.brandName || "");
  const [portalUrl, setPortalUrl] = useState(portalData.url || "");
  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    // Generate portal URL based on brand name
    if (brandName && !portalData.url) {
      const generatedUrl = brandName.toLowerCase().replace(/\s+/g, '-');
      setPortalUrl(generatedUrl);
    }
  }, [brandName, portalData.url]);

  const handleContinue = () => {
    if (!brandName.trim()) {
      alert("Please enter a brand name");
      return;
    }

    if (!portalUrl.trim()) {
      alert("Please enter a portal URL");
      return;
    }

    setPortalData({
      ...portalData,
      brandName,
      url: portalUrl
    });

    onContinue();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 2: Portal Setup</h2>
      
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
            <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 text-sm">
              .../portal/
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
            This URL will be used to access your personalized portal.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Your Portal URL</h3>
          <div className="flex items-center bg-white p-3 rounded-lg">
            <input
              type="text"
              value={`${window.location.origin}/.../portal/${portalUrl}`}
              readOnly
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/portal/${portalUrl}`);
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



export default PortalSetupStep2;
