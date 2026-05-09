'use client';

import React, { useState, useEffect } from 'react';

interface PortalSetupStep1Props {
  onContinue: (data?: unknown) => void;
  onBack: () => void;
  parentInfo?: { parentId: string; parentName: string; [key: string]: any };
  portalData: Record<string, unknown>;
  setPortalData: (data: Record<string, unknown>) => void;
}

const PortalSetupStep1 = ({ onContinue, onBack, parentInfo, portalData, setPortalData }: PortalSetupStep1Props): JSX.Element => {
  const [brandName, setBrandName] = useState<string>(portalData.brandName as string || parentInfo?.parentName || '');
  const [urlPath, setUrlPath] = useState('');
  const domain = typeof window !== 'undefined' ? window.location.origin : '';

  // Generate URL path from brand name
  useEffect(() => {
    if (brandName && !portalData.url) {
      const generatedPath = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setUrlPath(generatedPath);
    }
  }, [brandName, portalData.url]);

  const handleContinue = () => {
    if (!brandName.trim()) {
      alert("Please enter a brand name");
      return;
    }

    if (!urlPath.trim()) {
      alert("Please enter a URL path");
      return;
    }

    setPortalData({
      ...portalData,
      brandName,
      url: urlPath
    });

    onContinue();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-xl">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
            1
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Brand Setup</h2>
        </div>
        <p className="text-gray-600 ml-11">Configure your brand identity and portal URL</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Enter your brand name"
          />
          <p className="text-xs text-gray-500 mt-1">
            This name will be displayed in your portal header and login pages.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand URL <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 text-sm truncate max-w-[200px]">
              {domain}/.../portal/
            </span>
            <input
              type="text"
              value={urlPath}
              onChange={(e) => {
                // Allow only alphanumeric characters and hyphens
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                setUrlPath(value);
              }}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="your-brand"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Customize the URL path to create your unique portal address. Only letters, numbers, and hyphens are allowed.
          </p>
        </div>

        {urlPath && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Your Complete Portal URL</h3>
            <div className="flex items-center bg-white p-3 rounded-lg border border-blue-200">
              <input
                type="text"
                value={`${domain}/${parentInfo?.parentId}/portal/${urlPath}`}
                readOnly
                className="flex-1 bg-transparent outline-none text-sm text-gray-700"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${domain}/${parentInfo?.parentId}/portal/${urlPath}`);
                  alert("Link copied to clipboard!");
                }}
                className="ml-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <button
          onClick={handleContinue}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center"
        >
          Continue
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default PortalSetupStep1;