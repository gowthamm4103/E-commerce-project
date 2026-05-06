'use client';

import React, { useState, useEffect } from 'react';
import type { UserData } from '../types';

interface TwoFactorAuthSetupProps {
  user: UserData;
  onVerificationSuccess: () => void;
  onSkip: () => void;
  onBackToLogin: () => void;
}

const TwoFactorAuthSetup = ({ user, onVerificationSuccess, onSkip, onBackToLogin }: TwoFactorAuthSetupProps): JSX.Element => {
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
        onVerificationSuccess();
      } else {
        setError("Invalid verification code. Please try again.");
        setIsVerifying(false);
      }
    }, 1000);
  };

  const handleResendCode = () => {
    if (resendAttempts >= 2) {
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
    onSkip();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        {/*<div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ENGINEERS</h1>
          <p className="text-gray-600 font-semibold text-sm">Welcome to Engineers Ecom Pvt Ltd</p>
        </div>*/}

        <div className="bg-white p-10 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
            Enable Two-Factor Authentication (2FA)
          </h2>

          <p className="text-gray-600 text-sm mb-6 text-center">
            You will be required to enter your password and a verification code every time you sign in.
          </p>

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
                
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-semibold transition"
                  onClick={handleSkip}
                >
                  Skip Now
                </button>
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
                
                <button
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-semibold transition"
                  onClick={handleSkip}
                >
                  Skip Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSkipModal && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
  {/* Added 'relative' class to position the button inside */}
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

// Modified Login component to handle 2FA as a separate view


export default TwoFactorAuthSetup;
