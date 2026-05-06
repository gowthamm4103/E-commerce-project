'use client';

import React, { useState, useEffect } from 'react';

import { portalsAPI } from '../lib/api';

import PortalLogin from './PortalLogin';
import PortalRegistration from './PortalRegistration';

const PortalView = ({ portalId, onSwitchView }: { portalId: string | null; onSwitchView: (view: string, data?: unknown) => void }): JSX.Element => {
const [portal, setPortal] = useState<any>(null);
const [portalOwner, setPortalOwner] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [view, setView] = useState('landing'); // 'landing', 'login', 'registration'

useEffect(() => {
  if (!portalId) { setLoading(false); return; }
  portalsAPI.getByUrl(portalId).then((res) => {
    if (res.portal) {
      setPortal(res.portal);
      setPortalOwner({ id: res.portal.userId, name: res.portal.ownerName || 'Owner' });
    }
    setLoading(false);
  }).catch(() => setLoading(false));
}, [portalId]);

if (loading) {
return (
<div className="flex items-center justify-center min-h-screen bg-gray-100">
<div className="text-center">
<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
<p className="mt-4 text-gray-600">Loading portal...</p>
</div>
</div>
);
}

if (!portal) {
return (
<div className="flex items-center justify-center min-h-screen bg-gray-100">
<div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
<h1 className="text-2xl font-bold text-gray-800 mb-4">Portal Not Found</h1>
<p className="text-gray-600 mb-6">The portal you're looking for doesn't exist or has been removed.</p>
<button
onClick={() => onSwitchView('login')}
className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
>
Go to Login
</button>
</div>
</div>
);
}

// Portal owner info loaded from API above

if (view === 'landing') {
return (
<div className="min-h-screen bg-gray-50">
<header className="bg-white shadow-sm">
<div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
<div className="flex items-center">
{portal.logo ? (
<img src={portal.logo} alt="Logo" className="h-10 mr-4" />
) : (
<div className="h-10 w-10 bg-gray-200 rounded mr-4 flex items-center justify-center">
<span className="text-gray-500 text-xs">No Logo</span>
</div>
)}
<h1 className="text-xl font-bold">{portal.brandName}</h1>
</div>
<div className="flex space-x-4">
<button
onClick={() => setView('login')}
className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
>
Login
</button>
<button
onClick={() => setView('registration')}
className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
>
Register
</button>
</div>
</div>
</header>

<main className="max-w-6xl mx-auto px-4 py-12">
<div className="text-center mb-12">
<h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to {portal.brandName}</h2>
<p className="text-xl text-gray-600 max-w-3xl mx-auto">{portal.brandMessage}</p>
</div>

<div className="grid md:grid-cols-3 gap-8">
<div className="bg-white p-6 rounded-lg shadow-md">
<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
</svg>
</div>
<h3 className="text-lg font-semibold text-center mb-2">Quality Products</h3>
<p className="text-gray-600 text-center">Access our wide range of high-quality products designed to meet your needs.</p>
</div>

<div className="bg-white p-6 rounded-lg shadow-md">
<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
</svg>
</div>
<h3 className="text-lg font-semibold text-center mb-2">Great Earnings</h3>
<p className="text-gray-600 text-center">Join our network and start earning through our referral program.</p>
</div>

<div className="bg-white p-6 rounded-lg shadow-md">
<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
</svg>
</div>
<h3 className="text-lg font-semibold text-center mb-2">Community</h3>
<p className="text-gray-600 text-center">Become part of a growing community of entrepreneurs and customers.</p>
</div>
</div>
</main>

<footer className="bg-gray-800 text-white py-8 mt-12">
<div className="max-w-6xl mx-auto px-4 text-center">
<p>&copy; {new Date().getFullYear()} {portal.brandName}. All rights reserved.</p>
</div>
</footer>
</div>
);
}

if (view === 'login') {
return (
<PortalLogin
onSwitchView={onSwitchView}
parentInfo={{
parentId: portalOwner.id,
parentName: portalOwner.name
}}
/>
);
}

if (view === 'registration') {
return (
<PortalRegistration
onSwitchView={onSwitchView}
parentInfo={{
parentId: portalOwner.id,
parentName: portalOwner.name
}}
/>
);
}
}



export default PortalView;
