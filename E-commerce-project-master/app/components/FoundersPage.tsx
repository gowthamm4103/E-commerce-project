'use client';

import React, { useState, useRef } from 'react';
import type { PageName } from '../types';
import Header from './Header';
import Footer from './Footer';

interface FoundersPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const FoundersPage = ({ setCurrentPage, onNavigateToSignup, hideHeader = false }: FoundersPageProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef(null);
  const [showFullTeam, setShowFullTeam] = useState(false);
  
  const founders = [
    {
      name: "Name",
      title: "Designation",
      bio: "Bio"
    },
    {
      name: "Name",
      title: "Designation",
      bio: "Bio"
    },
    {
      name: "Name",
      title: "Designation",
      bio: "Bio"
    }
  ];
  
  const leadershipTeam = [
    {
      name: "Name",
      title: "Designation",
      bio: ""
    },
    {
      name: "Name",
      title: "Designation",
      bio: ""
    },
    {
      name: "Name",
      title: "Designation",
      bio: ""
    },
    {
      name: "Name",
      title: "Designation",
      bio: ""
    },
    {
      name: "Name",
      title: "Designation",
      bio: ""
    },
    {
      name: "Name",
      title: "Designation",
      bio: ""
    }
  ];
  
  const displayTeam = showFullTeam ? [...founders, ...leadershipTeam] : founders;
  
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Founders & Leadership</h1>
          <p className="text-xl text-gray-600">Meet the team driving innovation and strategy at our platform</p>
        </div>
      </section>
      
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayTeam.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.title}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <button 
              onClick={() => setShowFullTeam(!showFullTeam)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
            >
              {showFullTeam ? 'Show Founders Only' : 'View Full Team'}
            </button>
            <button className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              Explore Careers
            </button>
          </div>
        </div>
      </section>
      
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Join Our Team</h2>
          <p className="text-xl text-gray-600 mb-8">
            We're always looking for talented individuals who share our passion for innovation and excellence.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Meaningful Work</h3>
              <p className="text-gray-600">Make a real impact on the future of e-commerce</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Growth Opportunities</h3>
              <p className="text-gray-600">Continuous learning and professional development</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Great Culture</h3>
              <p className="text-gray-600">Collaborative environment with work-life balance</p>
            </div>
          </div>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View Open Positions
          </button>
        </div>
      </section>
      
      {!hideHeader && <Footer />}
    </div>
  );
};

// Documents Page Component

export default FoundersPage;
