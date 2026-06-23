'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CartProvider } from '../context/CartContext';
import { SidebarProvider } from '../context/SidebarContext';
import { getUserSession, removeUserSession, removeToken, getToken, setUserSession } from '../lib/api';
import Header from './Header';
import Footer from './Footer';
import LandingPage from './LandingPage';
import CategoryPage from './CategoryPage';
import ShoppingCartPage from './ShoppingCartPage';
import WishlistPage from './WishlistPage';
import CheckoutPage from './CheckoutPage';
import OrderSummaryPage from './OrderSummaryPage';
import OrderHistoryPage from './OrderHistoryPage';
import OrderTrackingPage from './OrderTrackingPage';
import AboutUsPage from './AboutUsPage';
import NewsPage from './NewsPage';
import EntrepreneursPage from './EntrepreneursPage';
import BrandOwnersPage from './BrandOwnersPage';
import FoundersPage from './FoundersPage';
import DocumentsPage from './DocumentsPage';
import BankingsPage from './BankingsPage';
import LegalsPage from './LegalsPage';
import ServicesPage from './ServicesPage';
import ContactUsPage from './ContactUsPage';
import TreeVisualization from './TreeVisualization';
import CustomerDashboard from './CustomerDashboard';
import BrandOwnerDashboard from './BrandOwnerDashboard';
import AdminDashboard from './AdminDashboard';
import CustomerPortalLanding from './CustomerPortalLanding';
import TeamPortalLanding from './TeamPortalLanding';
import type { PageName, UserType, UserData } from '../types';

// AuthApp stub — replace with your real auth implementation
const AuthApp = ({
  onSwitchView,
  onLoginSuccess,
}: {
  onSwitchView: (view: string) => void;
  onLoginSuccess: (userData: UserData) => void;
}): JSX.Element => <div>Auth App (not implemented)</div>;

const CATEGORY_PAGES: PageName[] = ['mens', 'womens', 'accessories', 'all'];

// ─── Page ↔ URL mapping ────────────────────────────────────────────────────
const PAGE_TO_URL: Record<string, string> = {
  landing:               '/',
  mens:                  '/men',
  womens:                '/women',
  accessories:           '/accessories',
  all:                   '/shop',
  cart:                  '/cart',
  checkout:              '/checkout',
  orderSummary:          '/order-summary',
  orderHistory:          '/orders',
  orderTracking:         '/order-tracking',
  wishlist:              '/wishlist',
  customerDashboard:     '/dashboard',
  brandOwnerDashboard:   '/brand-dashboard',
  founderDashboard:      '/founder-dashboard',
  adminDashboard:        '/admin-dashboard',
  services:              '/services',
  contact:               '/contact',
  aboutus:               '/about',
  news:                  '/news',
  entrepreneurs:         '/entrepreneurs',
  brandowners:           '/brand-owners',
  founders:              '/founders',
  documents:             '/documents',
  bankings:              '/bankings',
  legals:                '/legals',
  tree:                  '/tree',
};

const URL_TO_PAGE: Record<string, PageName> = {};
for (const [page, url] of Object.entries(PAGE_TO_URL)) {
  URL_TO_PAGE[url] = page as PageName;
}

// Parse path that may include userId prefix: /{userId}/{pagePath}
const parsePathWithUserId = (path: string): { userId: string | null; pagePath: string } => {
  // Match patterns like /CUST001/men, /BRAND001/dashboard, /ADMIN001/admin-dashboard
  const match = path.match(/^\/((?:CUST|BRAND|FOUND|ADMIN)\d+)(\/.*)?$/);
  if (match) {
    return { userId: match[1], pagePath: match[2] || '/' };
  }
  return { userId: null, pagePath: path };
};

const FashionWebApp = (): JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();

  // Resolve initial page from the current URL path
  const resolvePageFromPath = (path: string): PageName => {
    const { pagePath } = parsePathWithUserId(path);
    return URL_TO_PAGE[pagePath] || 'landing';
  };

  // Check if current URL is a portal URL (customer portal or team portal)
  const getPortalUrl = (path: string): { type: 'customer' | 'team'; url: string } | null => {
    const customerMatch = path.match(/^\/(?:(?:CUST|BRAND|FOUND|ADMIN)\d+\/)?portal\/(.+)$/);
    if (customerMatch) return { type: 'customer', url: customerMatch[1] };
    const teamMatch = path.match(/^\/team-portal\/(.+)$/);
    if (teamMatch) return { type: 'team', url: teamMatch[1] };
    return null;
  };

  const [currentPage, setCurrentPageState] = useState<PageName>(() => resolvePageFromPath(pathname));
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [portalInfo, setPortalInfo] = useState<{ type: 'customer' | 'team'; url: string } | null>(() => getPortalUrl(pathname));

  // Build URL with userId prefix when logged in
  const buildUrl = useCallback((page: PageName, userId?: string): string => {
    const baseUrl = PAGE_TO_URL[page] || '/';
    if (userId) {
      return `/${userId}${baseUrl}`;
    }
    return baseUrl;
  }, []);

  // Wrapper that also updates the browser URL
  const setCurrentPage = useCallback((page: PageName) => {
    setPortalInfo(null); // Clear portal state when navigating to a normal page
    setCurrentPageState(page);
    const url = buildUrl(page, currentUser?.userId);
    // Shallow update — no full navigation, just URL bar change
    window.history.pushState(null, '', url);
  }, [currentUser, buildUrl]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const portal = getPortalUrl(path);
      if (portal) {
        setPortalInfo(portal);
      } else {
        setPortalInfo(null);
        const page = resolvePageFromPath(path);
        setCurrentPageState(page);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Restore user session from localStorage on mount
  useEffect(() => {
    const savedUser = getUserSession();
    const token = getToken();
    if (savedUser && savedUser.userType) {
      // Check if token exists - if not, the session is invalid
      if (!token) {
        console.warn('User session found but no authentication token. Please log in again.');
        removeUserSession();
        return;
      }
      setCurrentUser(savedUser as UserData);
      setUserType(savedUser.userType as UserType);
      setIsLoggedIn(true);
      // Resolve page from URL
      const currentPath = window.location.pathname;
      // Check if it's a portal URL — if so, keep portal state and don't touch URL
      const portal = getPortalUrl(currentPath);
      if (portal) {
        setPortalInfo(portal);
        return;
      }
      const page = resolvePageFromPath(currentPath);
      setCurrentPageState(page);
      // Update URL to include userId if not already there
      const { userId: pathUserId } = parsePathWithUserId(currentPath);
      if (!pathUserId && savedUser.userId) {
        const url = `/${savedUser.userId}${PAGE_TO_URL[page] || '/'}`;
        window.history.replaceState(null, '', url);
      }
    }
  }, []);

  const handleLoginSuccess = (userData: UserData): void => {
    setCurrentUser(userData);
    setUserType(userData.userType);
    setIsLoggedIn(true);
    setShowAuth(false);
    // Save user session to localStorage for persistence
    setUserSession(userData);
    if (userData.userType === 'customer') {
      setCurrentPageState('customerDashboard');
      window.history.pushState(null, '', `/${userData.userId}/dashboard`);
    } else if (userData.userType === 'brand_owner') {
      setCurrentPageState('brandOwnerDashboard');
      window.history.pushState(null, '', `/${userData.userId}/brand-dashboard`);
    } else if (userData.userType === 'founder') {
      setCurrentPageState('founderDashboard');
      window.history.pushState(null, '', `/${userData.userId}/founder-dashboard`);
    } else if (userData.userType === 'admin') {
      setCurrentPageState('adminDashboard');
      window.history.pushState(null, '', `/${userData.userId}/admin-dashboard`);
    } else {
      setCurrentPageState('landing');
      window.history.pushState(null, '', '/');
    }
  };
  

  const handleLogout = (): void => {
    removeUserSession();
    removeToken();
    setCurrentUser(null);
    setUserType(null);
    setIsLoggedIn(false);
    setPortalInfo(null);
    setCurrentPageState('landing');
    window.history.pushState(null, '', '/');
  };

  const handleNavigateToSignup = (): void => router.push('/signup');

  const renderPage = () => {
    // Portal URL takes highest priority — always show portal page
    if (portalInfo) {
      if (portalInfo.type === 'team') {
        return <TeamPortalLanding portalUrl={portalInfo.url} />;
      }
      return <CustomerPortalLanding portalUrl={portalInfo.url} />;
    }

    if (showAuth) {
      return (
        <AuthApp
          onSwitchView={(view) => {
            if (view === 'home') { setShowAuth(false); setCurrentPage('landing'); }
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }

   if (isLoggedIn && userType === 'customer' && currentUser) {
  return (
    <CustomerDashboard
      user={currentUser}
      onLogout={handleLogout}
      setCurrentPage={setCurrentPage}
      onNavigateToSignup={handleNavigateToSignup}
      currentPage={currentPage}
    />
  );
}
    if (userType === 'brand_owner' && currentUser) {
  return (
    <BrandOwnerDashboard
      setCurrentPage={setCurrentPage}
      currentPage={currentPage}
      user={currentUser}
      onLogout={handleLogout}
      onNavigateToSignup={handleNavigateToSignup}
    />
  );
}
    if (userType === 'founder' && currentUser) {
      // Founders are tree users — same UI as customer dashboard with higher privilege
      return (
        <CustomerDashboard
          user={currentUser}
          onLogout={handleLogout}
          setCurrentPage={setCurrentPage}
          onNavigateToSignup={handleNavigateToSignup}
          currentPage={currentPage}
        />
      );
    }
    if (userType === 'admin' && currentUser) {
      return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
    }
    if (currentPage === 'tree') {
      return <TreeVisualization onRunConsolidation={() => {}} />;
    }

    if (currentPage === 'cart') return <ShoppingCartPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'checkout') return <CheckoutPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'orderSummary') return <OrderSummaryPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'orderHistory') return <OrderHistoryPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'orderTracking') return <OrderTrackingPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'wishlist') return <WishlistPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;

    if (CATEGORY_PAGES.includes(currentPage)) {
      return (
        <CategoryPage
          category={currentPage}
          setCurrentPage={setCurrentPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNavigateToSignup={handleNavigateToSignup}
          currentPage={currentPage}
        />
      );
    }

    if (currentPage === 'services') return <ServicesPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'contact') return <ContactUsPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'aboutus') return <AboutUsPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'news') return <NewsPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'entrepreneurs') return <EntrepreneursPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'brandowners') return <BrandOwnersPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'founders') return <FoundersPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'documents') return <DocumentsPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'bankings') return <BankingsPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;
    if (currentPage === 'legals') return <LegalsPage setCurrentPage={setCurrentPage} onNavigateToSignup={handleNavigateToSignup} />;

    // Default — landing
    return (
      <LandingPage
        setCurrentPage={setCurrentPage}
        setUserType={setUserType}
        setIsLoggedIn={setIsLoggedIn}
        setShowAuth={setShowAuth}
        onNavigateToSignup={handleNavigateToSignup}
        currentPage={currentPage}
      />
    );
  };

  // Determine the current page name for sidebar visibility
  const getSidebarPageName = (): string => {
    if (portalInfo) {
      return portalInfo.type === 'team' ? 'manageTeamPortal' : 'manageCustomerPortal';
    }
    return currentPage;
  };

  return (
    <CartProvider>
      <SidebarProvider currentPage={getSidebarPageName()}>
        <div className="min-h-screen bg-white">{renderPage()}</div>
      </SidebarProvider>
    </CartProvider>
  );
};

export default FashionWebApp;
