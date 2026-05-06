'use client';

import React, { useState, useRef } from 'react';
import type { PageName } from '../types';
import Header from './Header';
import Footer from './Footer';

interface LegalsPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const LegalsPage = ({ setCurrentPage, onNavigateToSignup, hideHeader = false }: LegalsPageProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef(null);
  
  const legalDocuments = [
    { title: "Privacy Policy", description: "How we collect, use, and protect your information" },
    { title: "Terms of Service", description: "Rules and guidelines for using our platform" },
    { title: "Return Policy", description: "Our return and refund policy for customers" },
    { title: "Shipping Policy", description: "Information about shipping and delivery" },
    { title: "Cookie Policy", description: "How we use cookies and tracking technologies" },
    { title: "Disclaimer", description: "Legal disclaimers and limitations" }
  ];
  
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
        * { font-family: 'Assistant', sans-serif; }
      `}</style>
      
      {!hideHeader && (
      <Header 
        setCurrentPage={setCurrentPage} 
        setShowAuth={() => {}} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isCompanyDropdownOpen={isCompanyDropdownOpen}
        setIsCompanyDropdownOpen={setIsCompanyDropdownOpen}
        companyDropdownRef={companyDropdownRef}
        onNavigateToSignup={onNavigateToSignup}
      />
      )}
      
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Legal Information</h1>
          <p className="text-xl text-gray-600">Important legal documents and policies</p>
        </div>
      </section>
      
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {legalDocuments.map((doc, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{doc.title}</h3>
                <p className="text-gray-600 mb-4">{doc.description}</p>
                <button className="text-blue-600 hover:text-blue-800 font-medium">Read More →</button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {!hideHeader && <Footer />}
    </div>
  );
};

// Services Page Component

export default LegalsPage;
