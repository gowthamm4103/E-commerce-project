"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { X, Heart, Star, Share2, Play, Instagram } from "lucide-react";
import { CartContext } from "../context/CartContext";
import productsData from "../data/products";
import type { PageName, UserType } from "../types";
import Header from "./Header";
import Footer from "./Footer";
import ShareProductModal from "./ShareProductModal";

interface LandingPageProps {
  setCurrentPage: (page: PageName) => void;
  setUserType?: (t: UserType) => void;
  setIsLoggedIn?: (v: boolean) => void;
  setShowAuth?: (v: boolean) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean; // Added prop to hide header/footer when embedded
  currentPage?: PageName;
}

const LandingPage = ({
  setCurrentPage,
  setUserType,
  setIsLoggedIn,
  setShowAuth,
  onNavigateToSignup,
  hideHeader = false, // Default to false
  currentPage = "landing",
}: LandingPageProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [activeProductSlide, setActiveProductSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);

  const calculateGSTInclusivePrice = (price, category) => {
    let gstRate = 0.18;
    if (category === "Clothing") {
      gstRate = price <= 2500 ? 0.05 : 0.18;
    }
    return Math.round(price * (1 + gstRate));
  };

  const calculateCredits = (price) => {
    return (price / 100).toFixed(2);
  };

  // Add this function to handle checking delivery availability
  const checkDeliveryAvailability = (pincode) => {
    if (!pincode || pincode.length < 6) {
      alert("Please enter a valid pincode");
      return;
    }

    // Here you would typically make an API call to check delivery availability
    // For now, I'm just showing a mock response
    setDeliveryInfo({
      estimatedDays: "3-5",
      deliveryCharge: "FREE",
      returnAvailable: true,
    });

    setPincodeChecked(true);
  };

  // Refs for dropdown handling
  const companyDropdownRef = useRef(null);

  const { addToCart, addToWishlist, isLoggedIn } = React.useContext(CartContext);

  // Check login status on mount and when it changes
  useEffect(() => {
    const checkLoginStatus = () => {
      if (typeof isLoggedIn === 'function') {
        setUserIsLoggedIn(isLoggedIn());
      } else {
        setUserIsLoggedIn(!!isLoggedIn);
      }
    };
    
    checkLoginStatus();
    // Also check periodically in case login state changes
    const interval = setInterval(checkLoginStatus, 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Auto-scroll products
  useEffect(() => {
    const productContainer = document.getElementById("product-container");
    if (productContainer) {
      const scrollAmount = 1;
      const interval = setInterval(() => {
        if (
          productContainer.scrollLeft >=
          productContainer.scrollWidth - productContainer.clientWidth
        ) {
          productContainer.scrollLeft = 0;
        } else {
          productContainer.scrollLeft += scrollAmount;
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, []);

  const handleAddToCart = (product) => {
    if (!isLoggedIn || (typeof isLoggedIn === 'function' && !isLoggedIn())) {
      onNavigateToSignup?.();
      return;
    }
    if (!selectedSize || !selectedColor) {
      alert("Please select size and color");
      return;
    }

    addToCart(product, selectedSize, selectedColor);
    setProductModalOpen(false);
    alert("Product added to cart!");
  };

  const handleAddToWishlist = (product) => {
    if (!isLoggedIn || (typeof isLoggedIn === 'function' && !isLoggedIn())) {
      onNavigateToSignup?.();
      return;
    }
    if (!selectedSize || !selectedColor) {
      alert("Please select size and color");
      return;
    }

    addToWishlist(product, selectedSize, selectedColor);
    alert("Product added to wishlist!");
  };

  const handleShareProduct = (product) => {
    setSelectedProduct(product);
    setShareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>

      {/* Conditionally render Header */}
      {!hideHeader && (
        <Header
          setCurrentPage={setCurrentPage}
          setShowAuth={setShowAuth}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isCompanyDropdownOpen={isCompanyDropdownOpen}
          setIsCompanyDropdownOpen={setIsCompanyDropdownOpen}
          companyDropdownRef={companyDropdownRef}
          onNavigateToSignup={onNavigateToSignup}
          currentPage={currentPage}
        />
      )}

      {/* Hero Section with Video */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">
                Welcome to ENGINEERS Fashion
              </h2>
              <p className="text-gray-600 mb-6">
                Discover premium fashion. Connect customers and brand owners in
                a network built for the future of fashion.
              </p>
              {!userIsLoggedIn && (
                <div className="flex space-x-4">
                  <button 
                    onClick={() => onNavigateToSignup?.()}
                    className="px-5 py-2 text-sm font-bold text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors tracking-wide"
                  >
                    Start Now
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <div className="relative aspect-video bg-gray-200 flex items-center justify-center">
                  <img
                    src="/api/placeholder/600/400"
                    alt="Video"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>0:00 / 1:05</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            Top Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6 gap-4">
            <a
              href="#category1"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("category1");
              }}
              className="cursor-pointer relative"
            >
              <div className="aspect-square overflow-hidden mx-auto rounded-lg bg-gray-100"></div>
              <div className="mt-4 px-2">
                <h4 className="text-slate-900 text-sm font-semibold">
                  Up To 40% OFF
                </h4>
                <p className="mt-1 text-xs text-slate-600 font-medium">
                  Engineers fashion
                </p>
              </div>
            </a>

            <a
              href="#category2"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("category2");
              }}
              className="cursor-pointer relative"
            >
              <div className="aspect-square overflow-hidden mx-auto rounded-lg bg-gray-100"></div>
              <div className="mt-4 px-2">
                <h4 className="text-slate-900 text-sm font-semibold">
                  Fresh Looks
                </h4>
                <p className="mt-1 text-xs text-slate-600 font-medium">
                  Engineers fashion
                </p>
              </div>
            </a>

            <a
              href="#category3"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("category3");
              }}
              className="cursor-pointer relative"
            >
              <div className="aspect-square overflow-hidden mx-auto rounded-lg bg-gray-100"></div>
              <div className="mt-4 px-2">
                <h4 className="text-slate-900 text-sm font-semibold">
                  Up To 30% OFF
                </h4>
                <p className="mt-1 text-xs text-slate-600 font-medium">
                  Engineers fashion
                </p>
              </div>
            </a>

            <a
              href="#category4"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("category4");
              }}
              className="cursor-pointer relative"
            >
              <div className="aspect-square overflow-hidden mx-auto rounded-lg bg-gray-100"></div>
              <div className="mt-4 px-2">
                <h4 className="text-slate-900 text-sm font-semibold">
                  Exclusive Fashion
                </h4>
                <p className="mt-1 text-xs text-slate-600 font-medium">
                  Engineers fashion
                </p>
              </div>
            </a>

            <a
              href="#category5"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("category5");
              }}
              className="cursor-pointer relative"
            >
              <div className="aspect-square overflow-hidden mx-auto rounded-lg bg-gray-100"></div>
              <div className="mt-4 px-2">
                <h4 className="text-slate-900 text-sm font-semibold">
                  Top Picks for Less
                </h4>
                <p className="mt-1 text-xs text-slate-600 font-medium">
                  Engineers fashion
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>
      
      {/* Category Links Section */}
      <section className="py-2 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white-50 to-white-100">
      <div className="max-w-8xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Men */}
            <a
              href="#men"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("mens");
              }}
              className="group cursor-pointer relative block overflow-hidden rounded-xl"
            >
              <div className="relative h-[400px] bg-gradient-to-br from-grey-800 to-grey-600 overflow-hidden rounded-xl">
                {/* Placeholder for poster image — replace src with your image later */}
                <img
                  src="/men-category.jpg"
                  alt="Men's Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-3xl font-bold text-white mb-2">Men</h3>
                  {/*<p className="text-white/80 text-sm mb-3">Explore shirts, jeans, formal wear & more</p>
                  <span className="inline-flex items-center text-white text-sm font-semibold group-hover:underline">
                    Shop Now
                    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span> */}
                </div>
              </div>
            </a>

            {/* Women */}
            <a
              href="#women"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("womens");
              }}
              className="group cursor-pointer relative block overflow-hidden rounded-xl"
            >
              <div className="relative h-[400px] bg-gradient-to-br from-grey-800 to-grey-500 overflow-hidden rounded-xl">
                <img
                  src="/women-category.jpg"
                  alt="Women's Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-3xl font-bold text-white mb-2">Women</h3>
                  {/*<p className="text-white/80 text-sm mb-3">Discover dresses, tops, ethnic wear & more</p>
                  <span className="inline-flex items-center text-white text-sm font-semibold group-hover:underline">
                    Shop Now
                    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>*/}
                </div>
              </div>
            </a>

            {/* Accessories */}
            <a
              href="#accessories"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("accessories" as any);
              }}
              className="group cursor-pointer relative block overflow-hidden rounded-xl"
            >
              <div className="relative h-[400px] bg-gradient-to-br from-grey-700 to-grey-400 overflow-hidden rounded-xl">
                <img
                  src="/accessories-category.jpg"
                  alt="Accessories Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-3xl font-bold text-white mb-2">Accessories</h3>
                  {/*<p className="text-white/80 text-sm mb-3">Fun & comfortable clothing for kids</p>
                  <span className="inline-flex items-center text-white text-sm font-semibold group-hover:underline">
                    Shop Now
                    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>*/}
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Top Brands Section max-w-8xl mx-auto*/}
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Explore Brands</h2>
          <a
            href="/see-all-brands"
            className="group inline-flex items-center text-lg font-semibold text-slate-900 hover:text-slate-600 transition-all"
          >
            View all
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
        <div className="mx-auto max-w-[1400px] px-6 md:px-8 lg:px-16 xl:px-24 pb-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* First Column */}
            <div className="flex flex-col gap-6">
              {/* Brand Item 1 */}
              <a
                className="group relative block overflow-hidden rounded-[8px] transition-transform hover:scale-105 h-[230px] w-full"
                href="/brands/nike"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="relative flex h-full w-full items-center justify-center p-3 pb-5">
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-lg">
                    Brand
                  </h3>
                </div>
              </a>

              {/* Brand Item 2 */}
              <a
                className="group relative block overflow-hidden rounded-[8px] transition-transform hover:scale-105 h-[396px] w-full"
                href="/brands/adidas"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="relative flex h-full w-full items-center justify-center p-3 pb-5">
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-lg">
                    Brand
                  </h3>
                </div>
              </a>

              {/* Brand Item 3 */}
              <a
                className="group relative block overflow-hidden rounded-[8px] transition-transform hover:scale-105 h-[330px] w-full"
                href="/brands/puma"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="relative flex h-full w-full items-center justify-center p-3 pb-5">
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-lg">
                    Brand
                  </h3>
                </div>
              </a>
            </div>

            {/* Second Column */}
            <div className="flex flex-col gap-6">
              {/* Brand Item 4 */}
              <a
                className="group relative block overflow-hidden rounded-[8px] transition-transform hover:scale-105 h-[396px] w-full"
                href="/brands/reebok"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="relative flex h-full w-full items-center justify-center p-3 pb-5">
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-lg">
                    Brand
                  </h3>
                </div>
              </a>

              {/* Brand Item 5 */}
              <a
                className="group relative block overflow-hidden rounded-[8px] transition-transform hover:scale-105 h-[330px] w-full"
                href="/brands/new-balance"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="relative flex h-full w-full items-center justify-center p-3 pb-5">
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-lg">
                    Brand
                  </h3>
                </div>
              </a>

              {/* Brand Item 6 */}
              <a
                className="group relative block overflow-hidden rounded-[8px] transition-transform hover:scale-105 h-[230px] w-full"
                href="/brands/converse"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="relative flex h-full w-full items-center justify-center p-3 pb-5">
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-lg">
                    Brand
                  </h3>
                </div>
              </a>
            </div>

            {/* Third Column */}
            <div className="flex flex-col gap-6">
              {/* Brand Item 7 */}
              <a
                className="group relative block overflow-hidden rounded-[8px] transition-transform hover:scale-105 h-[330px] w-full"
                href="/brands/vans"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="relative flex h-full w-full items-center justify-center p-3 pb-5">
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-lg">
                    Brand
                  </h3>
                </div>
              </a>

              {/* Brand Item 8 */}
              <a
                className="group relative block overflow-hidden rounded-[8px] transition-transform hover:scale-105 h-[230px] w-full"
                href="/brands/fila"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="relative flex h-full w-full items-center justify-center p-3 pb-5">
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-lg">
                    Brand
                  </h3>
                </div>
              </a>

              {/* Brand Item 9 */}
              <a
                className="group relative block overflow-hidden rounded-[8px] transition-transform hover:scale-105 h-[396px] w-full"
                href="/brands/under-armour"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="relative flex h-full w-full items-center justify-center p-3 pb-5">
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-lg">
                    Brand
                  </h3>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Men's Popular Categories */}
      <section className="py- px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-8xl mx-auto">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Men's Popular Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {/* Category 1: Men - Shirts */}
            <a
              href="#category1"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("category1");
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3 bg-slate-100">
                {/*<div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-900 rounded-sm">
                  Men
                </div>*/}
              </div>
              <div>
                <h4 className="text-slate-900 text-sm font-semibold leading-tight">
                  T-Shirts
                </h4>
              </div>
            </a>

            {/* Category 2: Men - Shirts */}
            <a
              href="#category2"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("category2");
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3 bg-slate-100">
                {/*<div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-900 rounded-sm">
                  Men
                </div>*/}
              </div>
              <div>
                <h4 className="text-slate-900 text-sm font-semibold leading-tight">
                  Casual Shirts
                </h4>
              </div>
            </a>

            {/* Category 3: Men - Pants */}
            <a
              href="#category3"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("category3");
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3 bg-slate-100"></div>
              <div>
                <h4 className="text-slate-900 text-sm font-semibold leading-tight">
                  Formal Shirts
                </h4>
              </div>
            </a>

            {/* Category 4: Men - */}
            <a
              href="#category4"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("category4");
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3 bg-slate-100"></div>
              <div>
                <h4 className="text-slate-900 text-sm font-semibold leading-tight">
                  Sweatshirts
                </h4>
              </div>
            </a>

            {/* Category 5: Men - Matching Sets */}
            <a
              href="#category5"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("category5");
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3 bg-slate-100"></div>
              <div>
                <h4 className="text-slate-900 text-sm font-semibold leading-tight">
                  Casual Trousers
                </h4>
              </div>
            </a>

            {/* Category 6: Men - Leggings */}
            <a
              href="#category6"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("category6");
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3 bg-slate-100"></div>
              <div>
                <h4 className="text-slate-900 text-sm font-semibold leading-tight">
                  Formal Trousers
                </h4>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Women's Popular Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-8xl mx-auto">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Women's Popular Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {/* Category 1: Women - Dresses */}
            <a
              href="#women-category1"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("women-category1");
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3 bg-slate-100">
                {/*<div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-900 rounded-sm">
            Women
          </div>*/}
              </div>
              <div>
                <h4 className="text-slate-900 text-sm font-semibold leading-tight">
                  Dresses
                </h4>
              </div>
            </a>

            {/* Category 2: Women - Kurti's & Tops */}
            <a
              href="#women-category2"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("women-category2");
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3 bg-slate-100"></div>
              <div>
                <h4 className="text-slate-900 text-sm font-semibold leading-tight">
                  Kurti's & Tops
                </h4>
              </div>
            </a>

            {/* Category 3: Women - Kurta's & Suits */}
            <a
              href="#women-category3"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("women-category3");
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3 bg-slate-100"></div>
              <div>
                <h4 className="text-slate-900 text-sm font-semibold leading-tight">
                  Kurta's & Suits
                </h4>
              </div>
            </a>

            {/* Category 4: Women - Tshirts */}
            <a
              href="#women-category4"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("women-category4");
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3 bg-slate-100"></div>
              <div>
                <h4 className="text-slate-900 text-sm font-semibold leading-tight">
                  Tshirts
                </h4>
              </div>
            </a>

            {/* Category 5: Women - Jeans */}
            <a
              href="#women-category5"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("women-category5");
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3 bg-slate-100"></div>
              <div>
                <h4 className="text-slate-900 text-sm font-semibold leading-tight">
                  Jeans
                </h4>
              </div>
            </a>

            {/* Category 6: Women - Trousers & Capris */}
            <a
              href="#women-category6"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("women-category6");
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3 bg-slate-100"></div>
              <div>
                <h4 className="text-slate-900 text-sm font-semibold leading-tight">
                  Trousers & Capris
                </h4>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Join Us Section
      <div className="bg-gradient-to-r from-gray-50 via-white to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
         <div className="max-w-8xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Us Today</h2>
          <p className="text-lg text-gray-600 mb-8">Experience the future of our innovative solutions. Sign up now for exclusive access.</p>
           <button 
              onClick={() => setShowAuth(true)}
              className="py-3 px-8 text-sm font-bold text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors tracking-wide"
              >
              Get Started
            </button>
           </div>
      </div> */}

      {/* Products Section rounded-lg shadow-md */}
      <section id="products" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <h3 className="text-2xl font-bold text-black mb-8 text-center">
            Featured Products
          </h3>
          <div className="relative">
            <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        #product-container::-webkit-scrollbar {
        display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        #product-container {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
        }
      `}</style>

            <div
              id="product-container"
              className="flex space-x-4 overflow-x-auto pb-4"
            >
              {productsData.map((product) => {
                // Calculate GST-inclusive price
                const calculateGSTInclusivePrice = (price, category) => {
                  // Get GST rate based on price and category
                  let gstRate = 0.18; // Default 18%
                  if (category === "Clothing") {
                    gstRate = price <= 2500 ? 0.05 : 0.18;
                  }

                  // Calculate GST-inclusive price
                  return Math.round(price * (1 + gstRate));
                };

                // Calculate credits based on price (1/100th of the price)
                const calculateCredits = (price) => {
                  return (price / 100).toFixed(2);
                };

                const inclusivePrice = calculateGSTInclusivePrice(
                  product.price,
                  product.category,
                );
                const inclusiveDiscountedPrice = product.discountedPrice
                  ? calculateGSTInclusivePrice(
                      product.discountedPrice,
                      product.category,
                    )
                  : null;
                const credits = calculateCredits(inclusivePrice);

                return (
                  <div
                    key={product._id || product.id}
                    className="flex-shrink-0 w-64 bg-white overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={product.images?.[0] || "/api/placeholder/400/500"}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setSelectedSize(
                            product.sizes
                              ? product.sizes.split(",")[0].trim()
                              : "",
                          );
                          setSelectedColor(
                            product.colors
                              ? product.colors.split(",")[0].trim()
                              : "",
                          );
                          setProductModalOpen(true);
                        }}
                        className="absolute inset-0 flex items-center justify-center transition-all"
                      ></button>
                      {product.discountedPrice &&
                        product.price < product.discountedPrice && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
                            {Math.round(
                              (1 - inclusivePrice / inclusiveDiscountedPrice) *
                                100,
                            )}
                            % OFF
                          </div>
                        )}
                      {product.videoLink && (
                        <div className="absolute bottom-2 right-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white p-1 rounded-full">
                          <Instagram size={16} />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-sm text-gray-500 mb-1 font-semibold">
                        {product.brandName}
                      </p>
                      <h4 className="font-semibold mb-2">{product.name}</h4>

                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={
                                i < Math.floor(product.rating || 4)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1 font-semibold">
                          ({product.reviews || 100})
                        </span>
                      </div>

                      <div className="flex items-center mb-3">
                        <span className="font-bold text-lg">
                          ₹{inclusivePrice}
                        </span>
                        <span className="text-xs text-gray-500 ml-1 font-semibold">
                          {" "}
                          ({credits})
                        </span>
                        {product.discountedPrice &&
                          product.price < product.discountedPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ₹{inclusiveDiscountedPrice}
                            </span>
                          )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setSelectedSize(
                              product.sizes
                                ? product.sizes.split(",")[0].trim()
                                : "",
                            );
                            setSelectedColor(
                              product.colors
                                ? product.colors.split(",")[0].trim()
                                : "",
                            );
                            setProductModalOpen(true);
                          }}
                          className="flex-1 px-3 py-1.5 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50 transition-colors font-semibold"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSize(
                              product.sizes
                                ? product.sizes.split(",")[0].trim()
                                : "",
                            );
                            setSelectedColor(
                              product.colors
                                ? product.colors.split(",")[0].trim()
                                : "",
                            );
                            handleAddToWishlist(product);
                          }}
                          className="p-1.5 border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          <Heart size={16} />
                        </button>
                        <button
                          onClick={() => handleShareProduct(product)}
                          className="p-1.5 border border-green-600 text-green-600 rounded hover:bg-green-50 transition-colors"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Conditionally render Footer */}
      {!hideHeader && <Footer />}

      {/* Product Details Modal Revome this - /60 backdrop-blur-sm transition-opacity */}
      {productModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="relative">
                    <img
                      src={
                        selectedProduct.images?.[activeProductSlide] ||
                        "/api/placeholder/400/500"
                      }
                      alt={selectedProduct.name}
                      className="w-full h-80 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                      {selectedProduct.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveProductSlide(index)}
                          className={`w-2 h-2 rounded-full ${index === activeProductSlide ? "bg-blue-600" : "bg-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    {selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/api/placeholder/400/500"}
                        alt={`${selectedProduct.name} ${index + 1}`}
                        className={`w-20 h-20 object-cover rounded cursor-pointer ${index === activeProductSlide ? "ring-2 ring-blue-600" : ""}`}
                        onClick={() => setActiveProductSlide(index)}
                      />
                    ))}
                  </div>

                  {selectedProduct.videoLink && (
                    <div className="mt-4">
                      <h4 className="font-bold mb-2">Product Video</h4>
                      <div className="relative">
                        <div className="bg-gray-200 rounded-lg overflow-hidden h-50 flex items-center justify-center">
                          <div className="text-center">
                            <div className="bg-gradient-to-r from-pink-500 to-orange-400 bg-opacity-80 rounded-full p-3 inline-block mb-2">
                              <Instagram size={24} className="text-white" />
                            </div>
                            <p className="text-white font-semibold">
                              View on Instagram
                            </p>
                          </div>
                        </div>
                        <a
                          href={selectedProduct.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center"
                        ></a>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2 font-semibold">
                    {selectedProduct.brandName}
                  </p>
                  <h4 className="text-xl font-bold mb-4">
                    {selectedProduct.name}
                  </h4>

                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={
                            i < Math.floor(selectedProduct.rating || 4)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2 font-semibold">
                      ({selectedProduct.reviews || 100} reviews)
                    </span>
                  </div>

                  <div className="flex items-center mb-4">
                    {(() => {
                      // Calculate GST-inclusive price
                      const calculateGSTInclusivePrice = (price, category) => {
                        // Get GST rate based on price and category
                        let gstRate = 0.18; // Default 18%
                        if (category === "Clothing") {
                          gstRate = price <= 2500 ? 0.05 : 0.18;
                        }

                        // Calculate GST-inclusive price
                        return Math.round(price * (1 + gstRate));
                      };

                      // Calculate credits based on price (1/100th of the price)
                      const calculateCredits = (price) => {
                        return (price / 100).toFixed(2);
                      };

                      const inclusivePrice = calculateGSTInclusivePrice(
                        selectedProduct.price,
                        selectedProduct.category,
                      );
                      const inclusiveDiscountedPrice =
                        selectedProduct.discountedPrice
                          ? calculateGSTInclusivePrice(
                              selectedProduct.discountedPrice,
                              selectedProduct.category,
                            )
                          : null;
                      const credits = calculateCredits(inclusivePrice);

                      return (
                        <>
                          <div className="flex items-center mb-2">
                            <span className="text-2xl font-bold">
                              ₹{inclusivePrice}
                            </span>
                            <span className="text-sm text-gray-500 ml-2 font-semibold">
                              ({credits})
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              (Inclusive of all taxes)
                            </span>
                          </div>
                          {selectedProduct.discountedPrice &&
                            selectedProduct.price <
                              selectedProduct.discountedPrice && (
                              <span className="text-lg text-gray-500 line-through ml-3">
                                ₹{inclusiveDiscountedPrice}
                              </span>
                            )}
                          {selectedProduct.discountedPrice &&
                            selectedProduct.price <
                              selectedProduct.discountedPrice && (
                              <span className="ml-3 bg-red-100 text-red-600 text-sm px-2 py-1 rounded font-bold">
                                {Math.round(
                                  (1 -
                                    inclusivePrice / inclusiveDiscountedPrice) *
                                    100,
                                )}
                                % OFF
                              </span>
                            )}
                        </>
                      );
                    })()}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-bold mb-2">Fit</p>
                    <p className="text-sm text-gray-600 font-semibold">
                      {selectedProduct.fitType}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-bold mb-2">Type</p>
                    <p className="text-sm text-gray-600 font-semibold">
                      {selectedProduct.type}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-bold mb-2">Available Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors &&
                        selectedProduct.colors
                          .split(",")
                          .map((color, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedColor(color.trim())}
                              className={`px-3 py-1 border rounded text-sm transition-colors font-semibold ${
                                selectedColor === color.trim()
                                  ? "border-blue-600 bg-blue-50 text-blue-600"
                                  : "border-gray-300 hover:bg-gray-100"
                              }`}
                            >
                              {color.trim()}
                            </button>
                          ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-bold mb-2">Select Size</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes &&
                        selectedProduct.sizes.split(",").map((size, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedSize(size.trim())}
                            className={`px-3 py-1 border rounded text-sm transition-colors font-semibold ${
                              selectedSize === size.trim()
                                ? "border-blue-600 bg-blue-50 text-blue-600"
                                : "border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {size.trim()}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-bold mb-2">Offers</p>
                    <p className="text-sm text-green-600 font-semibold">
                      {selectedProduct.offer}
                    </p>
                  </div>

                  <div className="flex space-x-3 mt-3">
                    <button
                      onClick={() => handleAddToWishlist(selectedProduct)}
                      className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <Heart size={18} className="mr-2" />
                      <span className="text-sm font-bold">Wishlist</span>
                    </button>
                    <button
                      onClick={() => handleShareProduct(selectedProduct)}
                      className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <Share2 size={18} className="mr-2" />
                      <span className="text-sm font-bold">Share</span>
                    </button>
                  </div>
                  <div className="flex space-x-3 mt-3">
                    <button
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="flex-1 py-2 border border-gray-300 bg-gray-800 rounded hover:bg-transparent hover:text-slate-900 text-white text-sm font-medium cursor-pointer transition-all duration-300"
                    >
                      <span className="text-sm font-bold">Buy now</span>
                    </button>
                    <button
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <span className="text-sm font-bold">Add to cart</span>
                    </button>
                  </div>

                  {/* Delivery Pincode Section */}
                  <div className="mt-4 p-3 border border-gray-300 rounded">
                    <p className="text-sm font-bold mb-2">Delivery Pincode:</p>
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="Enter a Pincode"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-semibold focus:outline-none focus:border-green-500"
                        onChange={(e) => setDeliveryPincode(e.target.value)}
                        value={deliveryPincode || ""}
                        disabled={pincodeChecked}
                      />
                      <button
                        className={`ml-2 px-2.5 py-1 rounded text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                          pincodeChecked
                            ? "bg-slate-700 hover:bg-slate-700 text-white"
                            : "bg-slate-700 hover:bg-slate-700 text-white"
                        }`}
                        onClick={() => {
                          if (pincodeChecked) {
                            // If pincode was already checked, allow changing it
                            setPincodeChecked(false);
                            setDeliveryInfo(null);
                            // Clear the pincode to allow user to enter a new one
                            setDeliveryPincode("");
                          } else {
                            // Check the pincode
                            checkDeliveryAvailability(deliveryPincode);
                          }
                        }}
                      >
                        {pincodeChecked ? "Change" : "Check"}
                      </button>
                    </div>
                    {deliveryInfo && (
                      <div className="mt-3 text-sm">
                        <p className="text-green-600 font-medium mb-1">
                          <span className="font-bold">Estimation:</span>{" "}
                          {deliveryInfo.estimatedDays || "3-5"} business days
                        </p>
                        <p className="text-gray-600 font-medium mb-1">
                          <span className="font-bold">Delivery charge:</span>{" "}
                          {deliveryInfo.deliveryCharge || "FREE"}
                        </p>
                        <p className="text-gray-600 font-medium mb-2">
                          <span className="font-bold">
                            Return and Exchange:
                          </span>{" "}
                          Available
                        </p>
                        <div className="bg-blue-50 p-2 rounded mt-2">
                          <p className="text-xs font-semibold text-blue-700">
                            Return a product and get the amount back as credits!
                            Use them anytime for your next purchase and no
                            expiry, no rush.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-bold mb-3">Product Details</h5>
                    <p className="text-sm text-gray-600 font-medium">
                      {selectedProduct.shortDescription}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold mb-3">Material & Care</h5>
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      Material: {selectedProduct.material}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      Care: {selectedProduct.washMethod}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold mb-3">Size & Fit</h5>
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      Fit: {selectedProduct.fitType}
                    </p>
                    <button className="text-sm text-blue-600 hover:underline font-bold">
                      Size Chart
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t pt-6">
                <h5 className="font-bold mb-3">Additional Information</h5>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span>{" "}
                    {selectedProduct.category} / {selectedProduct.subCategory}
                  </div>
                  <div>
                    <span className="font-medium">SKU:</span>{" "}
                    {selectedProduct.sku}
                  </div>
                  <div>
                    <span className="font-medium">HSN Code:</span>{" "}
                    {selectedProduct.hsnCode}
                  </div>
                  <div>
                    <span className="font-medium">Stock:</span>{" "}
                    {selectedProduct.stockQuantity} units
                  </div>
                  <div>
                    <span className="font-medium">Package Dimensions:</span>{" "}
                    {selectedProduct.packageDimensions}
                  </div>
                  <div>
                    <span className="font-medium">Weight:</span>{" "}
                    {selectedProduct.weight}
                  </div>
                  <div>
                    <span className="font-medium">Delivery Availability:</span>{" "}
                    {selectedProduct.deliveryAvailability}
                  </div>
                  <div>
                    <span className="font-medium">COD Option:</span>{" "}
                    {selectedProduct.codOption}
                  </div>
                  <div>
                    <span className="font-medium">Country of Origin:</span>{" "}
                    {selectedProduct.countryOfOrigin}
                  </div>
                  <div>
                    <span className="font-medium">Credits:</span>{" "}
                    <span className="text-gray-600 font-semibold">
                      {(() => {
                        const calculateGSTInclusivePrice = (
                          price,
                          category,
                        ) => {
                          let gstRate = 0.18;
                          if (category === "Clothing") {
                            gstRate = price <= 2500 ? 0.05 : 0.18;
                          }
                          return Math.round(price * (1 + gstRate));
                        };

                        const calculateCredits = (price) => {
                          return (price / 100).toFixed(2);
                        };

                        const inclusivePrice = calculateGSTInclusivePrice(
                          selectedProduct.price,
                          selectedProduct.category,
                        );
                        return calculateCredits(inclusivePrice);
                      })()}{" "}
                      Credits
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t pt-6">
                <h5 className="font-bold mb-3">Full Description</h5>
                <p className="text-sm text-gray-600 font-medium">
                  {selectedProduct.fullDescription}
                </p>
              </div>

              <div className="mt-6 border-t pt-6">
                <h5 className="font-bold mb-3">Key Features</h5>
                <p className="text-sm text-gray-600 font-medium">
                  {selectedProduct.keyFeatures}
                </p>
              </div>

              <div className="mt-6 border-t pt-6">
                <h5 className="font-bold mb-3">Return Policy</h5>
                <p className="text-sm text-gray-600 font-medium">
                  {selectedProduct.returnPolicy}
                </p>
              </div>

              <div className="mt-6 border-t pt-6">
                <h5 className="font-bold mb-3">Customer Reviews & Ratings</h5>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2 font-semibold">
                        John Doe
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      Great product! Exactly as described and fits perfectly.
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                        <Star size={14} />
                      </div>
                      <span className="text-sm text-gray-500 ml-2 font-semibold">
                        Jane Smith
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      Good quality product. The material is soft and
                      comfortable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Product Modal */}
      {selectedProduct && (
  <ShareProductModal
    product={selectedProduct}
    isOpen={shareModalOpen}
    onClose={() => setShareModalOpen(false)}
  />
)}
    </div>
  );
};

export default LandingPage;