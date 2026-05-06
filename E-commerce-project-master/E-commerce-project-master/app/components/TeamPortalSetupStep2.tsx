'use client';

import React, { useState } from 'react';


interface TeamPortalSetupStep2Props {
  onContinue: (data?: unknown) => void;
  portalData: Record<string, unknown>;
  setPortalData: (data: Record<string, unknown>) => void;
  onBack: () => void;
}

const TeamPortalSetupStep2 = ({ onContinue, portalData, setPortalData, onBack }: TeamPortalSetupStep2Props): JSX.Element => {
  const [logo, setLogo] = useState(portalData.logo || null);
  const [favicon, setFavicon] = useState(portalData.favicon || null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert("Logo size must be less than 500 KB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFavicon(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    setPortalData({
      ...portalData,
      logo,
      favicon
    });

    onContinue();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 2: Logo and Branding Customization</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo Upload</label>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            <div>
              <input
                type="file"
                id="logo-upload"
                accept="image/png, image/jpg, image/jpeg, image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <label
                htmlFor="logo-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG (Max: 500 KB)</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Favicon Upload</label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {favicon ? (
                <img src={favicon} alt="Favicon" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            <div>
              <input
                type="file"
                id="favicon-upload"
                accept="image/svg+xml, image/png, image/x-icon"
                onChange={handleFaviconUpload}
                className="hidden"
              />
              <label
                htmlFor="favicon-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
              <p className="text-xs text-gray-500 mt-1">SVG, PNG, ICO (16×16 pixels)</p>
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
          onClick={handleContinue}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}



export default TeamPortalSetupStep2;
