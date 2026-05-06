'use client';

import React, { useState, useRef } from 'react';
import type { PageName } from '../types';
import Header from './Header';
import Footer from './Footer';

interface BankingsPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const BankingsPage = ({ setCurrentPage, onNavigateToSignup, hideHeader = false }: BankingsPageProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef(null);
  
  // State for the upload feature
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle'); // Reset status when a new file is selected
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    setUploadStatus('uploading');

    // Simulate a secure upload process
    setTimeout(() => {
      // In a real app, you would use fetch or Axios to send the file to your server
      console.log('Uploading file:', selectedFile.name);
      
      // Simulate a successful upload
      setUploadStatus('success');
      setSelectedFile(null); // Clear the file input after successful upload
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset the actual file input
    }, 2000); // Simulate a 2-second upload time
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
        * { font-family: 'Assistant', sans-serif; }
      `}</style>
      
      {!hideHeader && (
      <Header 
        setCurrentPage={setCurrentPage} 
        setShowAuth={() => {}} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isCompanyDropdownOpen={isCompanyDropdownOpen}
        setIsCompanyDropdownOpen={setIsCompanyDropdownOpen}
        companyDropdownRef={companyDropdownRef}
        onNavigateToSignup={onNavigateToSignup}
      />
      )}
      
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Banking & Wallet Top-up</h1>
          <p className="text-xl text-gray-600">Secure payment processing and wallet management</p>
        </div>
      </section>
      
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-800">Security Notice</h3>
                <p className="text-red-700 mt-1">
                  For your security, never share sensitive credentials or banking details outside of our secure in-app upload system. 
                  Our team will never ask for your password or full banking information.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Wallet Top-up</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Verified Bank Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Name</p>
                    <p className="font-semibold">Platform Services Pvt. Ltd.</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                    <p className="font-semibold">National Banking Corporation</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Number</p>
                    <p className="font-semibold">XXXX-XXXX-XX12</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">IFSC Code</p>
                    <p className="font-semibold">NBC0000123</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Top-up Process</h3>
                <ol className="space-y-4">
                  <li className="flex">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</span>
                    <div>
                      <p className="font-medium">Transfer funds to the verified bank account</p>
                      <p className="text-sm text-gray-600">Use your preferred banking method to transfer funds to our verified account</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">2</span>
                    <div>
                      <p className="font-medium">Upload payment proof</p>
                      <p className="text-sm text-gray-600">Take a screenshot or photo of the transaction confirmation and upload it through our secure portal</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">3</span>
                    <div>
                      <p className="font-medium">Admin verification</p>
                      <p className="text-sm text-gray-600">Our admin team will verify your payment proof within 24 hours</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">4</span>
                    <div>
                      <p className="font-medium">Balance update</p>
                      <p className="text-sm text-gray-600">Once verified, your wallet balance will be updated automatically</p>
                    </div>
                  </li>
                </ol>
              </div>
              
              {/* Secure Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                
                {uploadStatus === 'idle' && (
                  <>
                    <p className="text-lg font-medium text-gray-800 mb-2">Upload Payment Screenshot</p>
                    <p className="text-sm text-gray-600 mb-4">PNG, JPG, or PDF (MAX. 5MB)</p>
                    {selectedFile && (
                      <p className="text-sm text-blue-600 font-medium mb-4">Selected file: {selectedFile.name}</p>
                    )}
                    <button 
                      onClick={triggerFileSelect}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Select File
                    </button>
                  </>
                )}

                {uploadStatus === 'uploading' && (
                  <>
                    <p className="text-lg font-medium text-gray-800 mb-4">Uploading Securely...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </>
                )}

                {uploadStatus === 'success' && (
                  <>
                    <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-medium text-green-800">Upload Successful!</p>
                    <p className="text-sm text-green-600">Your payment proof has been submitted for verification.</p>
                  </>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, application/pdf"
                style={{ display: 'none' }}
              />

              {/* Upload Button (only visible when a file is selected and not uploading) */}
              {selectedFile && uploadStatus === 'idle' && (
                 <div className="mt-6 text-center">
                    <button 
                      onClick={handleUpload}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Upload Screenshot
                    </button>
                 </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {!hideHeader && <Footer />}
    </div>
  );
};

// Legals Page Component

export default BankingsPage;
