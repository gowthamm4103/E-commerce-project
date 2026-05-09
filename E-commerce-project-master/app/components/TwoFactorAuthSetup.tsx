'use client';

import React, { useState, useEffect } from 'react';
import type { UserData } from '../types';

interface TwoFactorAuthSetupProps {
  user: UserData;
  onVerificationSuccess: () => void;
  onSkip: () => void;
  onBackToLogin: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

const TwoFactorAuthSetup = ({ 
  user, 
  onVerificationSuccess, 
  onSkip, 
  onBackToLogin,
  isModal = false,
  onClose
}: TwoFactorAuthSetupProps): JSX.Element => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Validate verification code format
  useEffect(() => {
    // Simple validation: check if code is 6 digits
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      setIsValidCode(true);
    } else {
      setIsValidCode(false);
    }
  }, [verificationCode]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isModal && onClose) {
      setPhoneNumber("");
      setVerificationCode("");
      setIsPhoneVerified(false);
      setIsCodeSent(false);
      setResendAttempts(0);
      setCountdown(0);
      setIsVerifying(false);
      setError("");
      setShowSkipModal(false);
      setIsValidCode(false);
      setShowSuccessMessage(false);
    }
  }, [isModal, onClose]);

  const handleSendVerificationCode = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsCodeSent(true);
    setCountdown(60);
    setError("");
    setVerificationCode("");
    
    // In a real app, this would send an actual SMS
    console.log(`Sending verification code to +91 ${phoneNumber}`);
  };

  const handleVerifyCode = () => {
    if (!isValidCode) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    setError("");
    
    // Simulate API call to verify code
    setTimeout(() => {
      // In a real app, this would verify the code with a backend service
      // For demo purposes, we'll accept any 6-digit code
      if (verificationCode.length === 6) {
        if (isModal) {
          setShowSuccessMessage(true);
          setIsVerifying(false);
          // Close modal after showing success message
          setTimeout(() => {
            onVerificationSuccess();
            onClose?.();
          }, 1500);
        } else {
          onVerificationSuccess();
        }
      } else {
        setError("Invalid verification code. Please try again.");
        setIsVerifying(false);
      }
    }, 1000);
  };

  const handleResendCode = () => {
    if (resendAttempts >= 2) {
      if (isModal) {
        setError("Maximum resend attempts reached. Please try again later.");
        return;
      }
      onBackToLogin();
      return;
    }

    setResendAttempts(prev => prev + 1);
    setCountdown(60);
    setError("");
    
    // In a real app, this would resend the SMS
    console.log(`Resending verification code to +91 ${phoneNumber}`);
  };

  const handleChangePhoneNumber = () => {
    setIsPhoneVerified(false);
    setIsCodeSent(false);
    setVerificationCode("");
    setError("");
  };

  const handleSkip = () => {
    setShowSkipModal(true);
  };

  const confirmSkip = () => {
    setShowSkipModal(false);
    if (isModal) {
      onClose?.();
    } else {
      onSkip();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (isModal && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  // Render the form content
  const renderFormContent = () => (
    <>
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          2FA enabled successfully!
        </div>
      )}

      {!isCodeSent ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Phone Number Verification</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your phone number to receive a verification code.
            </p>
            
            <div className="flex space-x-2">
              <div className="w-20 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium flex items-center justify-center">
                +91
              </div>
              <input
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                type="tel"
                placeholder="Enter mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-green-500 rounded hover:from-green-700 hover:to-green-600 transition-all duration-300 ease-in-out hover:scale-105"
              onClick={handleSendVerificationCode}
            >
              Get Code
            </button>
            
            {!isModal && (
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-semibold transition"
                onClick={handleSkip}
              >
                Skip Now
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-700">Phone Number Verification</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the verification code sent by text to the below phone number:
            </p>
            
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-800">
                +91 {phoneNumber}
              </div>
              <button
                className="text-blue-600 hover:underline text-sm"
                onClick={handleChangePhoneNumber}
              >
                Change
              </button>
            </div>

            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-center text-lg"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
            />
          </div>

          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-gray-600">Didn't receive the code?</span>
            <button
              className="text-blue-600 hover:underline disabled:text-gray-400"
              onClick={handleResendCode}
              disabled={countdown > 0}
            >
              {countdown > 0 ? `Resend (${countdown}s)` : 'Resend'}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              className="flex-1 text font-semibold text-white bg-gradient-to-r from-green-600 to-green-500 rounded hover:from-green-700 hover:to-green-600 transition-all duration-300 ease-in-out hover:scale-105"
              onClick={handleVerifyCode}
              disabled={!isValidCode || isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
            
            {!isModal && (
              <button
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-semibold transition"
                onClick={handleSkip}
              >
                Skip Now
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );

  // Modal mode - render as a modal dialog
  if (isModal) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Two-Factor Authentication
                </h2>
              </div>
              <button
                onClick={() => onClose?.()}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Info Card */}
              <div className="mb-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Extra Layer of Security</h3>
                    <p className="text-sm text-gray-600">
                      Protect your account with two-factor authentication. You'll need both your password and a verification code to sign in.
                    </p>
                  </div>
                </div>
              </div>

              {renderFormContent()}

              {/* Security Info */}
              <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Why enable 2FA?</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Even if someone has your password, they won't be able to access your account without the verification code.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skip Confirmation Modal */}
        {showSkipModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Skip 2FA Setup?</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Two-factor authentication helps keep your account secure. Are you sure you want to close without enabling 2FA?
              </p>

              <div className="flex space-x-3">
                <button
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                  onClick={() => setShowSkipModal(false)}
                >
                  Go Back
                </button>
                <button
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  onClick={confirmSkip}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Full-page mode (login flow)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white p-10 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
            Enable Two-Factor Authentication (2FA)
          </h2>

          <p className="text-gray-600 text-sm mb-6 text-center">
            You will be required to enter your password and a verification code every time you sign in.
          </p>

          {renderFormContent()}
        </div>
      </div>

      {showSkipModal && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white p-15 rounded-lg shadow-xl max-w-150 w-150 relative">
            
            {/* Cancel Icon Button */}
            <button
              onClick={() => setShowSkipModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors focus:outline-none"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-medium mb-4">Are you sure you want to skip 2FA?</h3>
            <p className="text-gray-600 mb-6">
              2FA helps keep your account secure, even if your password is compromised.
            </p>
            <div className="flex space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-semibold transition"
                onClick={() => setShowSkipModal(false)}
              >
                Enabled now
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                onClick={confirmSkip}
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TwoFactorAuthSetup;