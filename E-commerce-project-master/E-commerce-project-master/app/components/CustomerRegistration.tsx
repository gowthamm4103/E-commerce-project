'use client';

import React, { useState, useEffect } from 'react';
import { authAPI, setToken, mlmAPI } from '../lib/api';

interface CustomerRegistrationProps {
  onSwitchView: (view: string, data?: unknown) => void;
  onTreeUpdate?: () => void;
}

const CustomerRegistration = ({ onSwitchView, onTreeUpdate }: CustomerRegistrationProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    dateOfBirth: ""
  });
  const [parentInfo, setParentInfo] = useState({ parentId: "", parentName: "" });
  const [isManualParent, setIsManualParent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  useEffect(() => {
    updateParentInfo();
  }, []);

  const updateParentInfo = async () => {
    try {
      const data = await mlmAPI.getNextParentInfo('customer');
      if (data.parentInfo) {
        setParentInfo({ parentId: data.parentInfo.parentId, parentName: data.parentInfo.parentName });
        setIsManualParent(false);
      }
    } catch {
      // fallback
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleParentIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newParentId = e.target.value.trim().toUpperCase();
    setIsManualParent(true);

    if (newParentId === "") {
      updateParentInfo();
      return;
    }

    try {
      const data = await mlmAPI.getUserById(newParentId);
      if (data.user) {
        setParentInfo({ parentId: newParentId, parentName: data.user.name });
      } else {
        setParentInfo({ parentId: newParentId, parentName: "" });
      }
    } catch {
      setParentInfo({ parentId: newParentId, parentName: "" });
    }
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

    if (isManualParent && !parentInfo.parentName) {
      setError("Invalid Parent ID. Please enter a valid User ID.");
      setLoading(false);
      return;
    }

    try {
      const result = await authAPI.registerCustomer({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        contact: formData.contact,
        dateOfBirth: formData.dateOfBirth,
        parentId: isManualParent ? parentInfo.parentId : undefined,
      });

      if (result.success && result.user) {
        setToken(result.token);
        alert(`Customer Registration Successful!\n\nYour User ID: ${result.user.userId}\nYour Name: ${formData.name}`);

        if (onTreeUpdate) onTreeUpdate();

        setFormData({ name: "", email: "", password: "", contact: "", dateOfBirth: "" });
        setAgreeToTerms(false);
        setTimeout(updateParentInfo, 500);
      } else {
        setError("Registration failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ENGINEERS</h1>
          <p className="text-gray-600 text-medium">Customer Registration</p>
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
                className="w-full px-4 py-3 border border-blue-300 rounded-lg bg-white text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                type="text"
                placeholder="Parent ID"
                value={parentInfo.parentId}
                onChange={handleParentIdChange}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Parent Name</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium"
                type="text"
                placeholder="Auto-filled"
                value={parentInfo.parentName}
                readOnly
              />
            </div>
          </div>

          <div className={`p-3 border rounded-lg text-sm ${isManualParent ? 'bg-amber-50 border-amber-300' : 'bg-blue-50 border-blue-300'}`}>
            <div className={`font-semibold ${isManualParent ? 'text-amber-800' : 'text-blue-800'}`}>
              {isManualParent ? "✏️ Manual Parent Selection" : "🤖 Auto-Assigned (BFS Allocation)"}
            </div>
            <div className={`text-xs mt-1 ${isManualParent ? 'text-amber-700' : 'text-blue-700'}`}>
              {isManualParent
                ? parentInfo.parentName
                  ? `You selected: ${parentInfo.parentId} - ${parentInfo.parentName}`
                  : `Validating: ${parentInfo.parentId}...`
                : `Next available: ${parentInfo.parentId} - ${parentInfo.parentName}`}
            </div>
            {isManualParent && (
              <div className="text-xs mt-2 text-amber-600 font-medium">
                💡 For 3+ direct referrals: Enter sponsor's ID - you'll be their DIRECT child, placed in their subtree
              </div>
            )}
          </div>

          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="text" name="name" placeholder="Enter Your Full Name *"
            value={formData.name} onChange={handleInputChange} required
          />
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="email" name="email" placeholder="Enter valid email *"
            value={formData.email} onChange={handleInputChange} required
          />
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="password" name="password" placeholder="Enter password *"
            value={formData.password} onChange={handleInputChange} required
          />
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            type="tel" name="contact" placeholder="Enter valid contact *"
            value={formData.contact} onChange={handleInputChange} required
          />
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-600"
            type="date" name="dateOfBirth" placeholder="Date of Birth"
            value={formData.dateOfBirth} onChange={handleInputChange}
          />

          <div className="flex items-start space-x-2">
            <input
              type="checkbox" id="terms" checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              Agree to our <span className="text-blue-600 underline cursor-pointer">Terms and Conditions</span>
            </label>
          </div>

          <button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium disabled:opacity-50 transition transform hover:scale-105"
            onClick={handleRegister} disabled={loading}
          >
            {loading ? "Registering..." : "Register as Customer"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Want to register as a brand owner?{" "}
          <button onClick={() => onSwitchView('brandOwner')} className="text-purple-600 hover:underline font-semibold">
            Click here
          </button>
        </p>
      </div>
    </div>
  );
};

export default CustomerRegistration;