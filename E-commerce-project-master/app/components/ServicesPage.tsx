'use client';

import React, { useState, useRef, useContext } from 'react';
import { Heart, Star, Share2, User, Upload, CheckCircle, Eye, Package, CreditCard, MapPin, Calendar, Truck, Home } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import type { PageName } from '../types';
import Header from './Header';
import Footer from './Footer';

interface ServicesPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const ServicesPage = ({ setCurrentPage, onNavigateToSignup, hideHeader = false }: ServicesPageProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState('customers');
  const companyDropdownRef = useRef(null);
  
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
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
      
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-8xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Services</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the comprehensive range of services we offer to enhance your fashion experience, whether you're a customer, brand owner, or entrepreneur.
            </p>
          </div>
        </div>
      </section>
      
      {/* Service Tabs */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveServiceTab('customers')}
              className={`px-6 py-3 font-semibold text-lg border-b-2 transition-colors ${
                activeServiceTab === 'customers' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              For Customers
            </button>
            <button
              onClick={() => setActiveServiceTab('brandowners')}
              className={`px-6 py-3 font-semibold text-lg border-b-2 transition-colors ${
                activeServiceTab === 'brandowners' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              For Brand Owners
            </button>
            <button
              onClick={() => setActiveServiceTab('entrepreneurs')}
              className={`px-6 py-3 font-semibold text-lg border-b-2 transition-colors ${
                activeServiceTab === 'entrepreneurs' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              For Entrepreneurs
            </button>
          </div>
          
          {/* Services for Customers */}
          {activeServiceTab === 'customers' && (
            <div className="py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Services for Our Customers</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Service 1 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Package size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Express Delivery</h3>
                  <p className="text-gray-600 mb-4">
                    Get your favorite fashion items delivered within 24-48 hours in major cities. Track your order in real-time.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Same day delivery in select cities</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Real-time order tracking</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Free delivery on orders above ₹999</span>
                    </li>
                  </ul>
                </div>
                
                {/* Service 2 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <User size={24} className="text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Personal Styling</h3>
                  <p className="text-gray-600 mb-4">
                    Get personalized fashion advice from our expert stylists. Book a virtual consultation to find your perfect look.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>One-on-one virtual consultations</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Personalized style recommendations</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Wardrobe planning assistance</span>
                    </li>
                  </ul>
                </div>
                
                {/* Service 3 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Truck size={24} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Easy Returns & Exchanges</h3>
                  <p className="text-gray-600 mb-4">
                    Hassle-free returns and exchanges within 7 days. Our simple process ensures your satisfaction with every purchase.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>7-day return policy</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Free pickup for returns</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Instant refunds to original payment method</span>
                    </li>
                  </ul>
                </div>
                
                {/* Service 4 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <Star size={24} className="text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Premium Membership</h3>
                  <p className="text-gray-600 mb-4">
                    Join our exclusive membership program for early access to new collections, special discounts, and VIP treatment.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Early access to sales and new arrivals</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Exclusive member-only discounts</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Free styling sessions</span>
                    </li>
                  </ul>
                </div>
                
                {/* Service 5 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Heart size={24} className="text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Gift Wrapping & Messages</h3>
                  <p className="text-gray-600 mb-4">
                    Make your gifts special with our premium gift wrapping service and personalized message cards.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Premium gift wrapping options</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Personalized message cards</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Direct shipping to recipient</span>
                    </li>
                  </ul>
                </div>
                
                {/* Service 6 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Calendar size={24} className="text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Try Before You Buy</h3>
                  <p className="text-gray-600 mb-4">
                    Select items can be tried at home before making a purchase decision. No commitment, no pressure.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Try up to 5 items at home</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>7-day trial period</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Free pickup for returns</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Services for Brand Owners */}
          {activeServiceTab === 'brandowners' && (
            <div className="py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Services for Brand Owners</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Brand Service 1 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Share2 size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Marketing & Promotion</h3>
                  <p className="text-gray-600 mb-4">
                    Leverage our marketing expertise to increase brand visibility and reach millions of potential customers.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Social media campaigns</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Email marketing</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Influencer collaborations</span>
                    </li>
                  </ul>
                </div>
                
                {/* Brand Service 2 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Package size={24} className="text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Logistics & Warehousing</h3>
                  <p className="text-gray-600 mb-4">
                    Streamline your operations with our end-to-end logistics solutions, from warehousing to last-mile delivery.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Warehousing facilities</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Inventory management</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Pan India delivery network</span>
                    </li>
                  </ul>
                </div>
                
                {/* Brand Service 3 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <CreditCard size={24} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Payment Solutions</h3>
                  <p className="text-gray-600 mb-4">
                    Secure and flexible payment options for your customers with our integrated payment gateway solutions.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Multiple payment options</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Secure transactions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Quick settlement process</span>
                    </li>
                  </ul>
                </div>
                
                {/* Brand Service 4 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <Eye size={24} className="text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Analytics & Insights</h3>
                  <p className="text-gray-600 mb-4">
                    Make data-driven decisions with our comprehensive analytics dashboard that provides valuable customer insights.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Sales analytics</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Customer behavior insights</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Market trend analysis</span>
                    </li>
                  </ul>
                </div>
                
                {/* Brand Service 5 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Upload size={24} className="text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Product Catalog Management</h3>
                  <p className="text-gray-600 mb-4">
                    Easy-to-use tools to manage your product listings, update inventory, and showcase your collections effectively.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Bulk product upload</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Real-time inventory sync</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Product customization options</span>
                    </li>
                  </ul>
                </div>
                
                {/* Brand Service 6 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <User size={24} className="text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Customer Support</h3>
                  <p className="text-gray-600 mb-4">
                    Dedicated customer support team to handle queries, returns, and feedback for your brand.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>24/7 customer support</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Multi-channel support</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Feedback management</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Services for Entrepreneurs */}
          {activeServiceTab === 'entrepreneurs' && (
            <div className="py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Services for Entrepreneurs</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Entrepreneur Service 1 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Home size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Franchise Opportunities</h3>
                  <p className="text-gray-600 mb-4">
                    Partner with us to open an Engineers Fashion franchise in your area with comprehensive support and training.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Low investment requirement</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Complete training program</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Ongoing operational support</span>
                    </li>
                  </ul>
                </div>
                
                {/* Entrepreneur Service 2 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <User size={24} className="text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Business Consultation</h3>
                  <p className="text-gray-600 mb-4">
                    Expert guidance on starting and scaling your fashion business, from business planning to execution.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Business model development</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Financial planning assistance</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Growth strategy development</span>
                    </li>
                  </ul>
                </div>
                
                {/* Entrepreneur Service 3 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Upload size={24} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Supplier Network</h3>
                  <p className="text-gray-600 mb-4">
                    Connect with verified suppliers and manufacturers to source quality materials for your fashion products.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Verified supplier database</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Negotiated bulk pricing</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Quality assurance support</span>
                    </li>
                  </ul>
                </div>
                
                {/* Entrepreneur Service 4 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <Star size={24} className="text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Mentorship Program</h3>
                  <p className="text-gray-600 mb-4">
                    Learn from industry experts and successful entrepreneurs through our exclusive mentorship program.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>One-on-one mentorship sessions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Industry expert connections</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Regular networking events</span>
                    </li>
                  </ul>
                </div>
                
                {/* Entrepreneur Service 5 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <CreditCard size={24} className="text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Funding Assistance</h3>
                  <p className="text-gray-600 mb-4">
                    Get connected with investors and financial institutions to secure funding for your fashion startup.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Investor pitch preparation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Business plan development</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Financial modeling assistance</span>
                    </li>
                  </ul>
                </div>
                
                {/* Entrepreneur Service 6 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <MapPin size={24} className="text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Retail Space Solutions</h3>
                  <p className="text-gray-600 mb-4">
                    Find perfect retail space for your fashion business with our location scouting and lease negotiation services.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Prime location identification</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Lease negotiation support</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Store design consultation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-8xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied customers, brand owners, and entrepreneurs who are already benefiting from our services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setCurrentPage('landing')}
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Explore Products
            </button>
            <button 
              onClick={() => setCurrentPage('customerRegistration')}
              className="px-8 py-3 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
            >
              Register as Customer
            </button>
            <button 
              onClick={() => setCurrentPage('brandOwnerRegistration')}
              className="px-8 py-3 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white hover:text-purple-600 transition-colors font-semibold"
            >
              Register as Brand Owner
            </button>
          </div>
        </div>
      </section>
      
      {!hideHeader && <Footer />}
    </div>
  );
};

// Contact Us Page Component

export default ServicesPage;
