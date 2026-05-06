"use client";

import React, { useState, useRef } from "react";
import type { PageName } from "../types";
import Header from "./Header";
import Footer from "./Footer";

interface EntrepreneursPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const EntrepreneursPage = ({
  setCurrentPage,
  onNavigateToSignup,
  hideHeader = false,
}: EntrepreneursPageProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const companyDropdownRef = useRef(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I get started as an entrepreneur on the platform?",
      answer:
        "Getting started is simple. First, sign up for an entrepreneur account. Then, browse our catalog of partner brands and select products you'd like to promote. Once approved, you'll receive unique referral links and can start promoting through your social channels or other methods.",
    },
    {
      question: "How and when do I receive my commissions?",
      answer:
        "Commissions are calculated in real-time and credited to your wallet. You can track all your earnings through the analytics dashboard. Payouts are processed monthly once you reach the minimum threshold of ₹1,000. You can choose to receive payments via bank transfer or use the balance for platform purchases.",
    },
    {
      question: "Are there any fees to join as an entrepreneur?",
      answer:
        "No, joining as an entrepreneur is completely free. There are no hidden charges or membership fees. You only earn when you make sales, so there's no financial risk in getting started.",
    },
    {
      question: "What kind of support can I expect as an entrepreneur?",
      answer:
        "We provide comprehensive support including training materials, real-time analytics, exclusive promotional access, and a dedicated creator support team. You'll also have access to a community of fellow entrepreneurs where you can share tips and strategies.",
    },
    {
      question: "Can I promote products from multiple brands?",
      answer:
        "Yes, you can promote products from any of our partner brands. In fact, we encourage diversifying your portfolio to maximize your earning potential. You can select products that best align with your audience's interests.",
    },
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            For Entrepreneurs
          </h1>
          <p className="text-xl text-gray-600">
            Turn your influence into income with our creator platform
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Start earning in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your entrepreneur account and complete your profile
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Choose Products
              </h3>
              <p className="text-gray-600">
                Select products from partner brands that align with your
                audience
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Promote & Earn
              </h3>
              <p className="text-gray-600">
                Share referral links or create content to earn commissions
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Entrepreneur Benefits
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-green-500 mr-3 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">Trainings and suppot</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-green-500 mr-3 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Real-time analytics dashboard
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-green-500 mr-3 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Exclusive promotional access
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-green-500 mr-3 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Dedicated creator support team
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-green-500 mr-3 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Flexible income structure
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-green-500 mr-3 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Community of fellow entrepreneurs
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Success Stories
              </h2>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full mr-4 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                      JD
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Name</h3>
                      <p className="text-sm text-gray-600">
                        Fashion Influencer
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "I've been able to turn my passion for fashion into a
                    sustainable income stream. The platform's analytics help me
                    understand what resonates with my audience."
                  </p>
                  <p className="text-blue-600 font-semibold mt-2">
                    Earned ₹45,000 last month
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full mr-4 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                      EB
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Name</h3>
                      <p className="text-sm text-gray-600">Entrepreneur</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "The platform has opened up new revenue streams for my
                    content. I love how easy it is to find products that align
                    with my tech-focused audience."
                  </p>
                  <p className="text-blue-600 font-semibold mt-2">
                    Earned ₹62,000 last month
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="text-lg font-medium text-gray-800">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedFaq === index ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of entrepreneurs turning their influence into income
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Join Now
            </button>
            <button className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {!hideHeader && <Footer />}
    </div>
  );
};

// Brand Owners Page Component

export default EntrepreneursPage;
