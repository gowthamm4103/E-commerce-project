'use client';

import React, { useState } from 'react';

import { authAPI, setToken } from '../lib/api';

interface PortalLoginProps {
  onSwitchView: (view: string, data?: unknown) => void;
  parentInfo?: unknown;
  successMessage?: string;
  isPortal?: boolean;
  portalBrandName?: string;
  portalLogo?: string | null;
}

const PortalLogin = ({ onSwitchView, parentInfo, successMessage, isPortal = false, portalBrandName = "", portalLogo = null }: PortalLoginProps): JSX.Element => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await authAPI.login({ userId: credentials.username, password: credentials.password });

      if (!result.success || !result.user) {
        setError('Invalid User ID or Password');
        return;
      }

      setToken(result.token);

      const { userType } = result.user;
      if (userType === 'customer') {
        onSwitchView('customerDashboard', result.user);
      } else if (userType === 'brand_owner') {
        onSwitchView('brandOwnerDashboard', result.user);
      } else if (userType === 'founder') {
        onSwitchView('customerDashboard', result.user);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${!isPortal ? 'flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4' : ''}`}>
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {isPortal && portalLogo && (
              <img src={portalLogo} alt="Portal Logo" className="h-12 mr-3" />
            )}
            <h1 className="text-3xl font-bold text-gray-800">
              {isPortal ? portalBrandName : "ENGINEERS"}
            </h1>
          </div>
          <p className="text-gray-600 text-sm">Portal Login</p>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Login</h2>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="text"
            name="username"
            placeholder="User ID"
            value={credentials.username}
            onChange={handleInputChange}
          />

          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleInputChange}
          />

          <button
            className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 rounded-lg hover:from-gray-800 hover:to-black font-medium disabled:opacity-50 transition transform hover:scale-105"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => alert("Password reset functionality would be implemented here")}
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            Forgot Password?
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Are you not a member yet?{" "}
          <button
            onClick={() => onSwitchView('register', { parentInfo: parentInfo })}
            className="text-blue-600 hover:underline font-semibold"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}



export default PortalLogin;
