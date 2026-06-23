'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  isCollapsed: boolean;
  onToggle: () => void;
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  items,
  isCollapsed,
  onToggle,
  isOpen,
  onClose
}) => {
  // If not open in mobile mode, don't render
  if (!isOpen && typeof window !== 'undefined' && window.innerWidth < 768) {
    return null;
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - integrated into layout, sits below header */}
      <aside
        className={`
          bg-white shadow-md
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex-shrink-0
        `}
        style={{ height: 'calc(100vh - 64px)' }}
      >
        {/* Toggle Button */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <button
            onClick={onToggle}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
          {!isCollapsed && (
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-1 px-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    item.onClick();
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      onClose?.();
                    }
                  }}
                  className={`
                    w-full flex items-center px-3 py-3 rounded-md text-sm font-medium
                    transition-colors duration-150
                    ${item.isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="ml-3 whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
