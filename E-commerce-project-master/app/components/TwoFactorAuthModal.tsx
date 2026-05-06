'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userMobile?: string;
  onEnable2FA?: () => void;
}

const TwoFactorAuthModal = ({ 
  isOpen, 
  onClose, 
  userMobile = '',
  onEnable2FA 
}: TwoFactorAuthModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState(userMobile || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      setIsValidCode(true);
    } else {
      setIsValidCode(false);
    }
  }, [verificationCode]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPhoneNumber(userMobile || '');
      setVerificationCode('');
      setIsCodeSent(false);
      setCountdown(0);
      setResendAttempts(0);
      setIsVerifying(false);
      setError('');
      setSuccess('');
      setShowSkipModal(false);
      setIsValidCode(false);
    }
  }, [isOpen, userMobile]);

  const handleSendVerificationCode = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsCodeSent(true);
    setCountdown(60);
    setError('');
    setVerificationCode('');
    
    // In a real app, this would send an actual SMS
    console.log(`Sending verification code to +91 ${phoneNumber}`);
  };

  const handleVerifyCode = () => {
    if (!isValidCode) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    setError('');
    
    // Simulate API call to verify code
    setTimeout(() => {
      if (verificationCode.length === 6) {
        setSuccess('2FA enabled successfully!');
        setIsVerifying(false);
        
        // Close modal after success
        setTimeout(() => {
          if (onEnable2FA) onEnable2FA();
          onClose();
        }, 1500);
      } else {
        setError('Invalid verification code. Please try again.');
        setIsVerifying(false);
      }
    }, 1000);
  };

  const handleResendCode = () => {
    if (resendAttempts >= 2) {
      setError('Maximum resend attempts reached. Please try again later.');
      return;
    }

    setResendAttempts(prev => prev + 1);
    setCountdown(60);
    setError('');
    
    console.log(`Resending verification code to +91 ${phoneNumber}`);
  };

  const handleChangePhoneNumber = () => {
    setIsCodeSent(false);
    setVerificationCode('');
    setError('');
  };

  const handleSkip = () => {
    setShowSkipModal(true);
  };

  const confirmSkip = () => {
    setShowSkipModal(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="text-green-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Two-Factor Authentication
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium flex items-center">
                <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Info Card */}
            <div className="mb-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                  <Shield className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Extra Layer of Security</h3>
                  <p className="text-sm text-gray-600">
                    Protect your account with two-factor authentication. You'll need both your password and a verification code to sign in.
                  </p>
                </div>
              </div>
            </div>

            {!isCodeSent ? (
              /* Phone Number Input Step */
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Enter your phone number to receive a verification code.
                  </p>
                  
                  <div className="flex space-x-2">
                    <div className="w-20 px-3 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium flex items-center justify-center">
                      +91
                    </div>
                    <input
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                      type="tel"
                      placeholder="Enter mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
                    onClick={handleSendVerificationCode}
                  >
                    <Shield size={18} />
                    <span>Get Code</span>
                  </button>
                  
                  <button
                    className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    onClick={handleSkip}
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              /* Verification Code Step */
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Enter the 6-digit code sent to your phone.
                  </p>
                  
                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-800">
                      +91 {phoneNumber}
                    </span>
                    <button
                      className="text-green-600 hover:text-green-700 text-sm font-semibold hover:underline transition-all"
                      onClick={handleChangePhoneNumber}
                    >
                      Change
                    </button>
                  </div>

                  <input
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-center text-2xl tracking-widest font-mono"
                    type="text"
                    placeholder="• • • • • •"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Didn't receive the code?</span>
                  <button
                    className={`font-semibold transition-all ${
                      countdown > 0 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-green-600 hover:text-green-700 hover:underline'
                    }`}
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                  >
                    {countdown > 0 ? (
                      <span className="flex items-center">
                        <RefreshCw size={14} className="mr-1 animate-spin" />
                        Resend in {countdown}s
                      </span>
                    ) : (
                      'Resend Code'
                    )}
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    onClick={handleVerifyCode}
                    disabled={!isValidCode || isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        <span>Verify & Enable 2FA</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    onClick={handleSkip}
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {/* Security Info */}
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                  <Shield className="text-blue-600" size={16} />
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
                <AlertCircle className="text-yellow-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Skip 2FA Setup?</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Two-factor authentication helps keep your account secure. Are you sure you want to skip this security feature for now?
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
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TwoFactorAuthModal;