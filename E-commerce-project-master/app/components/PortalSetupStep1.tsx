'use client';

import React from 'react';


interface PortalSetupStep1Props {
  onContinue: (data?: unknown) => void;
  onBack: () => void;
  parentInfo?: { parentId: string; parentName: string; [key: string]: any };
}

const PortalSetupStep1 = ({ onContinue, onBack, parentInfo }: PortalSetupStep1Props): JSX.Element => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 1: Portal Sign Up and Sign In</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Your Portal Registration Link</h3>
        <div className="flex items-center bg-gray-100 p-4 rounded-lg">
          <input
            type="text"
            value={`${window.location.origin}/${parentInfo.parentId}/portal/${parentInfo.parentId}`}
            readOnly
            className="flex-1 bg-transparent outline-none"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/${parentInfo.parentId}/portal/${parentInfo.parentId}`);
              alert("Link copied to clipboard!");
            }}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Copy Link
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Share this link with others to register as your direct referrals.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Preview of Portal Registration Page</h3>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Parent ID *</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium"
                type="text"
                value={parentInfo.parentId}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Parent Name</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium"
                type="text"
                value={parentInfo.parentName}
                readOnly
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 italic">
            The above fields will be pre-filled and non-editable for users registering through your portal.
          </p>
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
          onClick={onContinue}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}



export default PortalSetupStep1;
