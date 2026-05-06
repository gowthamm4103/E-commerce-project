'use client';

import React, { useState } from 'react';
import { authAPI } from '../lib/api';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword = ({ onBackToLogin }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResetPassword = async () => {
    setLoading(true);
    setMessage("");

    try {
      await authAPI.forgotPassword(email);
      setMessage("Password reset instructions have been sent to your email.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to send reset email.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ENGINEERS</h1>
          <p className="text-gray-600 text-sm">Welcome to Engineers Ecom Pvt Ltd</p>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Forgot Password</h2>

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {message}
          </div>
        )}

        <div className="space-y-6">
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="email"
            placeholder="Enter E-mail address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 rounded-lg hover:from-gray-800 hover:to-black font-medium disabled:opacity-50 transition transform hover:scale-105"
            onClick={handleResetPassword}
            disabled={loading}
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{" "}
          <button
            onClick={onBackToLogin}
            className="text-blue-600 hover:underline font-semibold"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;