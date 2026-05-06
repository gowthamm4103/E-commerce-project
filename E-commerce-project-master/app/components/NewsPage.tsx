'use client';

import React, { useState, useRef } from 'react';
import type { PageName } from '../types';
import Header from './Header';
import Footer from './Footer';

interface NewsPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const NewsPage = ({ setCurrentPage, onNavigateToSignup, hideHeader = false }: NewsPageProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const companyDropdownRef = useRef(null);

  const allNewsItems = [
    {
      title: "Platform Analytics Dashboard Update: Real-Time Insights Now Live",
      date: "June 5, 2024",
      excerpt: "Our enhanced analytics dashboard now provides real-time insights, conversion tracking, and detailed audience demographics for all brand owners and entrepreneurs.",
      category: "Platform Enhancement",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop"
    },
    {
      title: "New Brand Integrations: Fashion Forward",
      date: "June 15, 2024",
      excerpt: "We're excited to welcome 15 new fashion brands to our platform, expanding our catalog with trendy and sustainable options.",
      category: "Brand Onboarding",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop"
    },
    {
      title: "Summer Rewards Program Enhanced",
      date: "June 12, 2024",
      excerpt: "Earn double points on all purchases this summer with our improved rewards program featuring tiered benefits and exclusive perks.",
      category: "Rewards",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop"
    },
    {
      title: "Creator Competition: Win Exclusive Partnerships",
      date: "June 10, 2024",
      excerpt: "Top-performing entrepreneurs this month will secure exclusive partnerships with premium brands and earn bonus commissions.",
      category: "Competition",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop"
    },
  ];

  const categories = ['All', 'Brand Onboarding', 'Rewards', 'Competition', 'Platform Enhancement'];

  const filteredNewsItems = selectedCategory === 'All' 
    ? allNewsItems 
    : allNewsItems.filter(item => item.category === selectedCategory);

  const featuredArticle = filteredNewsItems[0];
  const otherNewsItems = filteredNewsItems.slice(1);

  // --- Sub-Component for Category Filter ---
  const CategoryFilter = () => (
    <div className="flex flex-wrap justify-center gap-3 mb-10">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === cat
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );

  // --- Sub-Component for the Featured Article ---
  const FeaturedArticle = ({ article }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12 flex flex-col md:flex-row">
      <div className="md:w-1/2">
        <img src={article.image} alt={article.title} className="w-full h-64 md:h-full object-cover" />
      </div>
      <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">{article.category}</span>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{article.title}</h2>
        <p className="text-gray-600 mb-6">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{article.date}</p>
          <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            Read Full Story →
          </button>
        </div>
      </div>
    </div>
  );
  
  // --- Sub-Component for the list of other news ---
  const NewsList = ({ items }) => (
    <div className="space-y-6">
      {items.map((item, index) => (
        <article key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row gap-6 hover:shadow-lg transition-shadow">
          <img src={item.image} alt={item.title} className="w-full sm:w-48 h-48 sm:h-auto object-cover rounded-lg" />
          <div className="flex-1">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">{item.category}</span>
            <h3 className="text-xl font-bold text-gray-800 mt-1 mb-2">{item.title}</h3>
            <p className="text-gray-600 mb-4">{item.excerpt}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{item.date}</p>
              <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                Learn More →
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">News & Announcements</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest platform enhancements, brand integrations, and opportunities for growth.
          </p>
        </div>
      </section>
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CategoryFilter />
        
        {featuredArticle && <FeaturedArticle article={featuredArticle} />}
        
        {otherNewsItems.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">More Updates</h2>
            <NewsList items={otherNewsItems} />
          </section>
        )}
      </main>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Announcement Templates</h2>
          <p className="text-lg text-gray-600 mb-8">
            Create professional announcements with our ready-to-use templates for brand announcements, promotional campaigns, and reward events.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-stretch gap-4">
              <div className="bg-gray-50 p-6 rounded-lg text-center flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Product Launch</h3>
                <p className="text-sm text-gray-600">Create engaging announcements for new products.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center flex-1">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Promotional Campaign</h3>
                <p className="text-sm text-gray-600">Design compelling offers and discount campaigns.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center flex-1">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Reward Event</h3>
                <p className="text-sm text-gray-600">Announce special rewards and loyalty updates.</p>
              </div>
          </div>
        </div>
      </section>
      
      {!hideHeader && <Footer />}
    </div>
  );
};

// Entrepreneurs Page Component

export default NewsPage;
