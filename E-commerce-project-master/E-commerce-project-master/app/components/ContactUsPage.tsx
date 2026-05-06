'use client';

import React, { useState, useRef } from 'react';
import { X, ChevronDown, Search, CheckCircle, MapPin, Clock, Phone, Mail, MessageCircle, HelpCircle } from 'lucide-react';
import type { PageName } from '../types';
import Header from './Header';
import Footer from './Footer';

interface ContactUsPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const ContactUsPage = ({ setCurrentPage, onNavigateToSignup, hideHeader = false }: ContactUsPageProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'system', text: 'Hello! How can I help you today?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [userName] = useState('User'); // This would come from user context/auth state
  const companyDropdownRef = useRef(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: ''
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };
  
  const handleSendMessage = () => {
    if (currentMessage.trim() === '') return;
    
    // Add user message to chat
    const newMessage = { sender: 'user', text: currentMessage };
    setChatMessages(prev => [...prev, newMessage]);
    
    // Clear input
    setCurrentMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { 
        sender: 'system', 
        text: 'Thank you for your message. Our team will get back to you soon. Is there anything else I can help with?' 
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };
  
  const contactMethods = [
    {
      icon: <Phone size={24} />,
      title: "Phone Support",
      details: "+91 63816 61272",
      description: "Available 24/7 for your assistance"
    },
    {
      icon: <Mail size={24} />,
      title: "Email Support",
      details: "support@engineersfashion.com",
      description: "We respond within 24 hours"
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Live Chat",
      details: "Available on website",
      description: ""
    },
    {
      icon: <MapPin size={24} />,
      title: "Corporate Office",
      details: "123 Fashion Street, Coimatore",
      description: "Coimbatore 400001, India"
    }
  ];
  
  const faqs = [
    {
      question: "How to become an Entrepreneur?",
      answer: "To become an entrepreneur, click on 'Register as Entrepreneur' and complete the registration process. You'll need to provide your business details and complete verification."
    },
    {
      question: "How to become a Brand Owner?",
      answer: "Click on 'Register as Brand Owner' and complete the registration process. Our team will review and approve your application within 48 hours."
    },
    {
      question: "What is the Set Up Portal feature?",
      answer: "The Set Up Portal allows you to create a personalized promotional space for your brand. You can customize the appearance, add products, and manage your brand presence."
    },
    {
      question: "Ways to add money to the E-wallet?",
      answer: "You can add money to your e-wallet through online payments, offline deposits, or by contacting support for assistance with top-ups."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order by clicking on 'Order Tracking' in your account dashboard. Enter your order ID to get real-time updates."
    },
    {
      question: "What is your return policy?",
      answer: "We offer 7-day return policy. Products must be unused with all tags intact. Free pickup is available for returns."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach us via phone, email, or live chat. Our support team is available 24/7 for your assistance."
    }
  ];
  
  const helpCategories = [
    {
      title: "Getting Started",
      questions: [
        "How to create an account?",
        "How to complete profile verification?",
        "How to navigate the dashboard?"
      ]
    },
    {
      title: "Brand Owner/Partner",
      questions: [
        "How to register as a brand owner?",
        "What documents are needed for verification?",
        "How to list products on the platform?"
      ]
    },
    {
      title: "Portal",
      questions: [
        "How to set up my brand portal?",
        "How to customize portal appearance?",
        "How to manage portal content?"
      ]
    },
    {
      title: "Wallet & Payments",
      questions: [
        "How to add money to e-wallet?",
        "How to withdraw earnings?",
        "What payment methods are accepted?"
      ]
    }
  ];
  
  // Mock chat history data
  const chatHistory = [
    {
      id: 1,
      date: "2023-06-15",
      time: "10:30 AM",
      summary: "Wallet top-up issue",
      category: "wallet",
      messages: [
        { sender: 'user', text: 'I\'m having trouble adding money to my wallet' },
        { sender: 'system', text: 'I understand you\'re having issues with wallet top-up. Let me help you with that.' }
      ]
    },
    {
      id: 2,
      date: "2023-06-10",
      time: "2:45 PM",
      summary: "Brand owner registration",
      category: "brand_owner",
      messages: [
        { sender: 'user', text: 'How do I register as a brand owner?' },
        { sender: 'system', text: 'To register as a brand owner, click on the "Register as Brand Owner" button and follow the steps.' }
      ]
    },
    {
      id: 3,
      date: "2023-06-05",
      time: "9:15 AM",
      summary: "Portal setup assistance",
      category: "portal",
      messages: [
        { sender: 'user', text: 'I need help setting up my portal' },
        { sender: 'system', text: 'I can guide you through the portal setup process. Let\'s start with the basics.' }
      ]
    }
  ];
  
  const filteredHistory = historyFilter === 'all' 
    ? chatHistory 
    : chatHistory.filter(chat => chat.category === historyFilter);
  
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
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're here to help! Reach out to us through any of the following channels and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>
      
      {/* Tab Navigation */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-wrap justify-start mb-8 border-b border-gray-200">
         {['home', 'chat', 'help', 'history'].map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`px-6 py-3 font-semibold text-lg border-b-2 transition-colors ${
               activeTab === tab
                 ? 'text-blue-600 border-blue-600'
                 : 'text-gray-500 border-transparent hover:text-gray-700'
           }`}
        >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
         ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div>
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Hello, {userName} 👋</h2>
              <p className="text-lg text-gray-600 mb-6">How can we assist you today?</p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <button 
                  onClick={() => setActiveTab('chat')}
                  className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow flex items-center"
                >
                  <MessageCircle className="text-blue-600 mr-3" size={24} />
                  <span className="font-medium">Chat with Us</span>
                </button>
                
                <button className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow flex items-center">
                  <Clock className="text-blue-600 mr-3" size={24} />
                  <span className="font-medium">Recent Chats</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('help')}
                  className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow flex items-center"
                >
                  <HelpCircle className="text-blue-600 mr-3" size={24} />
                  <span className="font-medium">FAQ</span>
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {faqs.slice(0, 4).map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">{faq.question}</h4>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <h3 className="text-lg font-semibold">AI Assistant</h3>
                <p className="text-sm opacity-90">We're here to help with onboarding, account management, and more</p>
              </div>
              
              <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}>
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Send
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Talk to Human Support
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Help Tab */}
        {activeTab === 'help' && (
          <div>
            <div className="mb-8">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search for help..."
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {helpCategories.map((category, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{category.title}</h3>
                  <ul className="space-y-3">
                    {category.questions.map((question, qIndex) => (
                      <li key={qIndex} className="cursor-pointer hover:text-blue-600">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details key={index} className="bg-white rounded-lg shadow-md">
                    <summary className="p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 pr-8">{faq.question}</h3>
                        <ChevronDown size={20} className="text-gray-500" />
                      </div>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Chat History</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filter by:</span>
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="entrepreneur">Entrepreneur Queries</option>
                  <option value="brand_owner">Brand Owner Support</option>
                  <option value="wallet">Wallet Issues</option>
                  <option value="portal">Portal Assistance</option>
                  <option value="general">General Support</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredHistory.map((chat) => (
                <div key={chat.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{chat.summary}</h4>
                      <p className="text-sm text-gray-600">{chat.date} at {chat.time}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Full Conversation
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700">
                      {chat.messages[0].sender === 'user' ? 'You: ' : 'Support: '}
                      {chat.messages[0].text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Contact Methods - Only show on Home tab */}
      {activeTab === 'home' && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-8xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Get in Touch</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{method.title}</h3>
                  <p className="text-gray-900 font-medium mb-1">{method.details}</p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Contact Form - Only show on Home tab */}
      {activeTab === 'home' && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Send us a Message</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <X size={24} className="text-red-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle size={24} className="text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Message Sent Successfully!</h3>
                    <p className="text-green-700">We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Related</option>
                  <option value="return">Return & Refund</option>
                  <option value="payment">Payment Issue</option>
                  <option value="technical">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea 
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us how we can help you..."
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </section>
      )}
      
      {!hideHeader && <Footer />}
    </div>
  );
};

// Landing Page Component

export default ContactUsPage;
