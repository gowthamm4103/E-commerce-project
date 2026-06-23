'use client';

import React, { useState } from 'react';
import { authAPI, setToken } from '../lib/api';

interface LoginProps {
  onSwitchView: (view: string, data?: unknown) => void;
}

const Login = ({ onSwitchView }: LoginProps): JSX.Element => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await authAPI.login({
        userId: credentials.username,
        password: credentials.password,
      });

      if (!result.success || !result.user) {
        setError("Invalid User ID or Password");
        setLoading(false);
        return;
      }

      // Validate and store the JWT token
      if (!result.token || typeof result.token !== 'string' || result.token.trim() === '') {
        setError("Login successful but no authentication token received. Please contact support.");
        setLoading(false);
        return;
      }
      setToken(result.token.trim());

      onSwitchView('twoFactorAuth', { user: result.user });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ENGINEERS</h1>
          <p className="text-gray-600 text-medium">Welcome to Engineers Ecom Pvt Ltd</p>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Login</h2>

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
            onClick={() => onSwitchView('forgot')}
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            Forgot Password?
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Are you not a member yet?{" "}
          <button
            onClick={() => onSwitchView('customer')}
            className="text-blue-600 hover:underline font-semibold"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;