'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Define the pages where sidebar should be visible
export const SIDEBAR_PAGES = [
  'customerDashboard',
  'brandOwnerDashboard',
  'manageCustomerPortal',
  'manageTeamPortal'
] as const;

export type SidebarPage = typeof SIDEBAR_PAGES[number];

// Check if a page should show the sidebar
export function shouldShowSidebar(pageName: string): boolean {
  return SIDEBAR_PAGES.includes(pageName as SidebarPage);
}

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  setIsOpen: (open: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarState | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
  currentPage: string;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children, currentPage }) => {
  const showSidebar = shouldShowSidebar(currentPage);
  
  // Initialize state from localStorage only for sidebar pages
  const getInitialState = (key: string, defaultValue: boolean): boolean => {
    if (!showSidebar) return defaultValue;
    try {
      const saved = localStorage.getItem(`sidebar_${key}`);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [isOpen, setIsOpenState] = useState<boolean>(() => getInitialState('isOpen', true));
  const [isCollapsed, setIsCollapsedState] = useState<boolean>(() => getInitialState('isCollapsed', false));

  // Persist state to localStorage
  useEffect(() => {
    if (showSidebar) {
      try {
        localStorage.setItem('sidebar_isOpen', JSON.stringify(isOpen));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [isOpen, showSidebar]);

  useEffect(() => {
    if (showSidebar) {
      try {
        localStorage.setItem('sidebar_isCollapsed', JSON.stringify(isCollapsed));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [isCollapsed, showSidebar]);

  // Reset to default when navigating to a non-sidebar page
  useEffect(() => {
    if (!showSidebar) {
      setIsOpenState(false);
    }
  }, [showSidebar]);

  const setIsOpen = (open: boolean) => {
    if (showSidebar) {
      setIsOpenState(open);
    }
  };

  const setIsCollapsed = (collapsed: boolean) => {
    if (showSidebar) {
      setIsCollapsedState(collapsed);
    }
  };

  const toggleCollapse = () => {
    if (showSidebar) {
      setIsCollapsedState(prev => !prev);
    }
  };

  return (
    <SidebarContext.Provider value={{ isOpen, isCollapsed, setIsOpen, setIsCollapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
};

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}