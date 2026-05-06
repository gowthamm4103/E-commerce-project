'use client';

import React, { useState, useEffect } from 'react';
import { authAPI, setToken, mlmAPI } from '../lib/api';

interface BrandOwnerRegistrationProps {
  onSwitchView: (view: string, data?: unknown) => void;
  onTreeUpdate?: () => void;
}

const BrandOwnerRegistration = ({ onSwitchView, onTreeUpdate }: BrandOwnerRegistrationProps) => {
  const [formData, setFormData] = useState<{
    name: string; email: string; password: string; contact: string;
    legalBusinessName: string; brandName: string; businessRegNo: string;
    gstNo: string; streetAddress: string; city: string; state: string;
    postalCode: string; country: string;
    gstCertificate: File | null; registrationCertificate: File | null;
  }>({
    name: "", email: "", password: "", contact: "",
    legalBusinessName: "", brandName: "", businessRegNo: "", gstNo: "",
    streetAddress: "", city: "", state: "", postalCode: "", country: "India",
    gstCertificate: null, registrationCertificate: null
  });
  const [parentInfo, setParentInfo] = useState<{ parentId: string; parentName: string; willReplace: boolean; replacingCustomerInfo?: { id: string; name: string } | null }>({ parentId: "", parentName: "", willReplace: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  useEffect(() => { updateParentInfo(); }, []);

  const updateParentInfo = async () => {
    try {
      const data = await mlmAPI.getNextParentInfo('brand_owner');
      if (data.parentInfo) {
        setParentInfo({
          parentId: data.parentInfo.parentId,
          parentName: data.parentInfo.parentName,
          willReplace: !!data.parentInfo.willReplace,
          replacingCustomerInfo: data.parentInfo.replacingCustomerInfo || null
        });
      }
    } catch {
      // fallback
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files?.[0]) setFormData(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    if (!agreeToTerms) { setError("Please agree to Terms and Conditions"); setLoading(false); return; }

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() ||
      !formData.contact.trim() || !formData.legalBusinessName.trim() ||
      !formData.brandName.trim() || !formData.businessRegNo.trim() || !formData.gstNo.trim() ||
      !formData.streetAddress.trim() || !formData.city.trim() ||
      !formData.state.trim() || !formData.postalCode.trim() ||
      !formData.gstCertificate || !formData.registrationCertificate) {
      setError("All fields are mandatory including Business Address and Business Proof Documents");
      setLoading(false);
      return;
    }

    try {
      const result = await authAPI.registerBrandOwner({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        contact: formData.contact,
        brandName: formData.brandName,
        legalBusinessName: formData.legalBusinessName,
        businessRegNo: formData.businessRegNo,
        gstNo: formData.gstNo,
        businessAddress: {
          streetAddress: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      });

      if (result.success && result.user) {
        setToken(result.token);
        alert(`✅ Brand Owner Registration Successful!\n\nYour User ID: ${result.user.userId}\nYour Name: ${formData.name}\nBrand: ${formData.brandName}`);

        if (onTreeUpdate) onTreeUpdate();

        setFormData({
          name: "", email: "", password: "", contact: "",
          legalBusinessName: "", brandName: "", businessRegNo: "", gstNo: "",
          streetAddress: "", city: "", state: "", postalCode: "", country: "India",
          gstCertificate: null, registrationCertificate: null
        });
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ENGINEERS</h1>
          <p className="text-gray-600 text-medium">Brand Owner Registration</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium"
              type="text" placeholder="Parent ID" value={parentInfo.parentId} readOnly />
            <input className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium"
              type="text" placeholder="Parent Name" value={parentInfo.parentName} readOnly />
          </div>

          <div className="p-3 bg-purple-50 border border-purple-300 rounded-lg text-sm">
            <div className="font-semibold text-purple-800">🤖 Auto-Assigned (BFS: Founder/Brand Owner Only)</div>
            <div className="text-purple-700 text-xs mt-1">Next placement: {parentInfo.parentId} - {parentInfo.parentName}</div>
            {parentInfo.willReplace && parentInfo.replacingCustomerInfo && (
              <div className="mt-2 p-2 bg-amber-100 border border-amber-300 rounded text-xs">
                <div className="font-medium text-amber-800">⚠️ Customer Replacement</div>
                <div className="text-amber-700 mt-1">Customer {parentInfo.replacingCustomerInfo.id} ({parentInfo.replacingCustomerInfo.name}) will be moved under your LEFT leg.</div>
              </div>
            )}
            <div className="text-purple-600 text-xs mt-2 font-medium">💰 Brand owners earn DIRECT income only (no indirect income)</div>
          </div>

          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
            type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleInputChange} required />
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
            type="email" name="email" placeholder="Business Email *" value={formData.email} onChange={handleInputChange} required />
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
            type="password" name="password" placeholder="Enter password *" value={formData.password} onChange={handleInputChange} required />
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
            type="tel" name="contact" placeholder="Business Contact *" value={formData.contact} onChange={handleInputChange} required />
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
            type="text" name="legalBusinessName" placeholder="Legal Business Name *" value={formData.legalBusinessName} onChange={handleInputChange} required />
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
            type="text" name="brandName" placeholder="Brand Name *" value={formData.brandName} onChange={handleInputChange} required />
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
            type="text" name="businessRegNo" placeholder="Business Registration Number *" value={formData.businessRegNo} onChange={handleInputChange} required />
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
            type="text" name="gstNo" placeholder="GST Number *" value={formData.gstNo} onChange={handleInputChange} required />

          <div className="space-y-4">
            <input type="text" name="streetAddress" placeholder="Street Address *" value={formData.streetAddress} onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
            <input type="text" name="city" placeholder="City *" value={formData.city} onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
            <input type="text" name="state" placeholder="State / Province *" value={formData.state} onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
            <input type="text" name="postalCode" placeholder="Postal Code *" value={formData.postalCode} onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
            <input type="text" name="country" value={formData.country || "India"} readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
          </div>

          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-3">Upload Business Proof *</div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">GST Certificate</label>
                <div className="relative">
                  <input type="file" id="gstCertificate" name="gstCertificate" onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.jpg,.jpeg,.png" required />
                  <div className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm flex items-center justify-between">
                    <span>{formData.gstCertificate ? (formData.gstCertificate as File).name : "Choose file..."}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Registration Certificate (MSME, UDYAM, or Incorporation)</label>
                <div className="relative">
                  <input type="file" id="registrationCertificate" name="registrationCertificate" onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.jpg,.jpeg,.png" required />
                  <div className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm flex items-center justify-between">
                    <span>{formData.registrationCertificate ? (formData.registrationCertificate as File).name : "Choose file..."}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <input type="checkbox" id="terms-brand" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500" />
            <label htmlFor="terms-brand" className="text-sm text-gray-700">
              Agree to our <span className="text-purple-600 underline cursor-pointer">Terms and Conditions</span>
            </label>
          </div>

          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium disabled:opacity-50 transition transform hover:scale-105"
            onClick={handleRegister} disabled={loading}>
            {loading ? "Registering..." : "Register as Brand Owner"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Want to register as a customer?{" "}
          <button onClick={() => onSwitchView('customer')} className="text-purple-600 hover:underline font-semibold">Click here</button>
        </p>
      </div>
    </div>
  );
};

export default BrandOwnerRegistration;