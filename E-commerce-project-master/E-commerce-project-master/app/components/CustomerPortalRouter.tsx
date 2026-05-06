'use client';

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import CustomerPortalLanding from './CustomerPortalLanding';

const CustomerPortalRouter = (): JSX.Element => {
  const router = useRouter();
  const [portalUrl, setPortalUrl] = useState("");

  useEffect(() => {
    // Extract portal URL from current path
    const currentPath = window.location.pathname;
    
    // Check if we're on a portal page
    if (currentPath.startsWith('/portal/')) {
      const url = currentPath.replace('/portal/', '');
      if (url) {
        setPortalUrl(url);
      } else {
        // Redirect to home if no portal URL is provided
        router.push('/');
      }
    }
  }, []);

  // Render the CustomerPortalLanding component with the portal URL
  return <CustomerPortalLanding portalUrl={portalUrl} />;
}



export default CustomerPortalRouter;
