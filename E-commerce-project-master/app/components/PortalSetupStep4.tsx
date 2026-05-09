'use client';

import React from 'react';
import { portalsAPI } from '../lib/api';
import type { UserData } from '../types';

interface PortalSetupStep4Props {
  onPublish: (data?: unknown) => void;
  onBack: () => void;
  portalData: Record<string, unknown>;
  user: UserData;
}

const PortalSetupStep4 = ({ onPublish, onBack, portalData, user }: PortalSetupStep4Props): JSX.Element => {
  const handlePublish = async () => {
    try {
      const payload = { 
        ...portalData, 
        portalType: 'customer',
        brandTagline: portalData.brandTagline,
        facebookUrl: portalData.facebookUrl,
        linkedInUrl: portalData.linkedInUrl,
        instagramUrl: portalData.instagramUrl,
        twitterUrl: portalData.twitterUrl
      };
      
      console.log('=== Sending Portal Data to API ===');
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('brandTagline:', payload.brandTagline);
      console.log('facebookUrl:', payload.facebookUrl);
      console.log('linkedInUrl:', payload.linkedInUrl);
      console.log('instagramUrl:', payload.instagramUrl);
      console.log('twitterUrl:', payload.twitterUrl);
      
      const result = await portalsAPI.create(payload);
      
      if (result.success) {
        console.log('Portal created successfully:', result.portal);
        // Don't show alert here - let handlePublishPortal show a comprehensive success message
        onPublish();
      } else {
        console.error('Portal creation failed:', result);
        alert("Failed to create portal. Please try again.");
      }
    } catch (err) {
      console.error('Failed to create portal:', err);
      alert("An error occurred while creating the portal. Please try again.");
    }
  };

  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  const portalUrl = `${domain}/${user.userId}/portal/${portalData.url}`;

  return (
    <div className="bg-white p-8 rounded-xl shadow-xl">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
            4
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Preview & Publish</h2>
        </div>
        <p className="text-gray-600 ml-11">Review your portal configuration before publishing</p>
      </div>
      
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Portal Configuration Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brand Name */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Brand Name</div>
              <div className="font-semibold text-gray-800">{portalData.brandName as string || 'Not set'}</div>
            </div>

            {/* Brand Tagline */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Brand Tagline</div>
              <div className="font-medium text-gray-700 text-sm">{portalData.brandTagline as string || 'Not set'}</div>
            </div>

            {/* Brand URL */}
            <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Portal URL</div>
              <div className="flex items-center">
                <div className="font-mono text-sm text-blue-600 truncate flex-1">{portalUrl}</div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(portalUrl);
                    alert("URL copied to clipboard!");
                  }}
                  className="ml-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Social Media</div>
              <div className="space-y-1">
                {portalData.facebookUrl ? (
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    <span className="text-gray-600">Facebook configured</span>
                  </div>
                ) : null}
                {portalData.linkedInUrl ? (
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-blue-700 rounded-full mr-2"></span>
                    <span className="text-gray-600">LinkedIn configured</span>
                  </div>
                ) : null}
                {portalData.instagramUrl ? (
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-pink-600 rounded-full mr-2"></span>
                    <span className="text-gray-600">Instagram configured</span>
                  </div>
                ) : null}
                {portalData.twitterUrl ? (
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-gray-900 rounded-full mr-2"></span>
                    <span className="text-gray-600">X (Twitter) configured</span>
                  </div>
                ) : null}
                {!portalData.facebookUrl && !portalData.linkedInUrl && !portalData.instagramUrl && !portalData.twitterUrl && (
                  <div className="text-sm text-gray-400 italic">No social media links configured</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important Note</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Once published, your portal will be accessible at the configured URL. You can edit these settings later from the Manage Customer Portal page.</p>
              </div>
            </div>
          </div>
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
          onClick={handlePublish}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center shadow-lg hover:shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save and Publish
        </button>
      </div>
    </div>
  );
}

export default PortalSetupStep4;