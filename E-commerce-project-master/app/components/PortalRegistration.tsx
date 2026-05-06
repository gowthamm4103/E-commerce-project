'use client';

import React, { useState } from 'react';

import { authAPI, setToken } from '../lib/api';

interface PortalRegistrationProps {
  onSwitchView: (view: string, data?: unknown) => void;
  parentInfo?: unknown;
  isPortal?: boolean;
  portalBrandName?: string;
  portalLogo?: string | null;
}

const PortalRegistration = ({ onSwitchView, parentInfo, isPortal = false, portalBrandName = "", portalLogo = null }: PortalRegistrationProps): JSX.Element => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    dateOfBirth: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    if (!agreeToTerms) {
      setError("Please agree to Terms and Conditions");
      setLoading(false);
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.contact.trim()) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const result = await authAPI.registerCustomer({
        name:        formData.name,
        email:       formData.email,
        password:    formData.password,
        contact:     formData.contact,
        dateOfBirth: formData.dateOfBirth,
        parentId:    (parentInfo as any)?.parentId,
      });

      if (result.success) {
        setToken(result.token);
        onSwitchView('login', {
          successMessage: `Registration successful! Your User ID is: ${result.user?.userId}. Please login with your credentials.`,
          parentInfo,
        });
      } else {
        setError('Registration failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${!isPortal ? 'flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4' : ''}`}>
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
          <p className="text-gray-600 text-sm">
            {isPortal ? "Customer Portal Registration" : "Portal Registration"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Parent ID *</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium"
                type="text"
                placeholder="Parent ID"
                value={parentInfo.parentId}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Parent Name</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium"
                type="text"
                placeholder="Parent Name"
                value={parentInfo.parentName}
                readOnly
              />
            </div>
          </div>

          {isPortal && (
            <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg text-sm">
              <div className="font-semibold text-blue-800">
                🌐 Portal Registration
              </div>
              <div className="text-xs mt-1 text-blue-700">
                You're registering through {parentInfo.parentName}'s portal. You'll be placed as their direct child.
              </div>
            </div>
          )}

          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="text"
            name="name"
            placeholder="Enter Your Full Name *"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="email"
            name="email"
            placeholder="Enter valid email *"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="password"
            name="password"
            placeholder="Enter password *"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="tel"
            name="contact"
            placeholder="Enter valid contact *"
            value={formData.contact}
            onChange={handleInputChange}
            required
          />

          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-600"
            type="date"
            name="dateOfBirth"
            placeholder="Date of Birth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
          />

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              Agree to our <span className="text-blue-600 underline cursor-pointer">Terms and Conditions</span>
            </label>
          </div>

          <button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium disabled:opacity-50 transition transform hover:scale-105"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <button
            onClick={() => onSwitchView('login', { parentInfo: parentInfo })}
            className="text-blue-600 hover:underline font-semibold"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}



export default PortalRegistration;
