'use client';

import React, { useState, useEffect } from 'react';

interface PortalSetupStep2Props {
  onContinue: (data?: unknown) => void;
  onBack: () => void;
  portalData: Record<string, unknown>;
  setPortalData: (data: Record<string, unknown>) => void;
}

const PortalSetupStep2 = ({ onContinue, onBack, portalData, setPortalData }: PortalSetupStep2Props): JSX.Element => {
  const [brandTagline, setBrandTagline] = useState<string>(portalData.brandTagline as string || '');
  const brandName = portalData.brandName as string || '';

  // Auto-generate tagline when brand name changes
  useEffect(() => {
    if (brandName && !portalData.brandTagline) {
      const defaultTagline = `Welcome to ${brandName} Fashion`;
      setBrandTagline(defaultTagline.slice(0, 30));
    }
  }, [brandName, portalData.brandTagline]);

  const handleTaglineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 30) {
      setBrandTagline(value);
    }
  };

  const handleContinue = () => {
    if (!brandTagline.trim()) {
      alert("Please enter a brand tagline");
      return;
    }

    setPortalData({
      ...portalData,
      brandTagline
    });

    onContinue();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-xl">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
            2
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Brand Details</h2>
        </div>
        <p className="text-gray-600 ml-11">Customize your brand tagline</p>
      </div>
      
      <div className="space-y-8">
        {/* Brand Tagline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Tagline <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={brandTagline}
              onChange={handleTaglineChange}
              maxLength={30}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Welcome to your brand"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              {brandTagline.length}/30
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This tagline will be displayed on your portal login and registration pages.
          </p>
          {brandName && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Preview:</span> "{brandTagline || `Welcome to ${brandName} Fashion`}"
              </p>
            </div>
          )}
        </div>
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

export default PortalSetupStep2;
