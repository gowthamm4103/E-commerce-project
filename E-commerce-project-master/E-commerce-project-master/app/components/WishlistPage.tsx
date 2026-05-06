"use client";

import React, { useState, useRef, useContext } from "react";
import { X, Heart } from "lucide-react";
import { CartContext } from "../context/CartContext";
import type { PageName } from "../types";
import Header from "./Header";
import Footer from "./Footer";

interface WishlistPageProps {
  setCurrentPage: (page: PageName) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
}

const WishlistPage = ({
  setCurrentPage,
  onNavigateToSignup,
  hideHeader = false,
}: WishlistPageProps): JSX.Element => {
  const { wishlistItems, removeFromWishlist, moveToCart } =
    React.useContext(CartContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef(null);

  // State for "Move to Cart" Modal
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState<any>(null);
  const [tempSize, setTempSize] = useState("");
  const [tempColor, setTempColor] = useState("");

  // Mock Delivery Info
  const deliveryInfo = {
    estimatedDays: "3-5",
    deliveryCharge: "FREE",
    sellerName: "Official Store",
  };

  // Helper Functions (Must match CategoryPage for consistency)
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

  // Handler to open the modal for a specific item
  const handleMoveToCartClick = (item) => {
    setSelectedWishlistItem(item);
    // Pre-fill with the specific size/color saved in the wishlist
    setTempSize(item.selectedSize);
    setTempColor(item.selectedColor);
    setSelectionModalOpen(true);
  };

  // Confirm move to cart from modal
  const handleConfirmMoveToCart = () => {
    if (!tempSize || !tempColor) {
      alert("Please select size and color");
      return;
    }
    // Move with the (potentially modified) size/color
    moveToCart(selectedWishlistItem._id || selectedWishlistItem.id, tempSize, tempColor);
    setSelectionModalOpen(false);
    // Optional: You might want to remove from wishlist here automatically or leave it
    // For this implementation, we assume moveToCart handles the logic or we leave it in wishlist until removed manually
    alert("Moved to Cart successfully!");
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
          showSecondaryHeader={true}
          secondaryTitle="My Wishlist"
        />
      )}

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Wishlist</h2>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 py-8">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center min-h-[50vh]">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added anything to your wishlist yet.
            </p>
            <button
              onClick={() => setCurrentPage("landing")}
              className="px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              // Price Calculations
              const sellingPrice = calculateGSTInclusivePrice(
                item.price,
                item.category,
              );
              const mrp = item.originalPrice
                ? calculateGSTInclusivePrice(item.originalPrice, item.category)
                : Math.round(sellingPrice * 1.2);

              const credits = calculateCredits(sellingPrice);
              const discountPercent =
                mrp > sellingPrice
                  ? Math.round(((mrp - sellingPrice) / mrp) * 100)
                  : 0;

              return (
                <div
                  key={`${item._id || item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative">
                    <img
                      src={item.images?.[0] || "/api/placeholder/400/500"}
                      alt={item.name}
                      className="w-full h-64 object-cover rounded-t-lg"
                    />
                    <button
                      onClick={() =>
                        removeFromWishlist(
                          item._id || item.id,
                          item.selectedSize,
                          item.selectedColor,
                        )
                      }
                      className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 font-medium">
                        {item.brand || item.brandName}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-semibold text-gray-700">
                          Size: {item.selectedSize}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-semibold text-gray-700">
                          Color: {item.selectedColor}
                        </span>
                      </div>

                      <div className="flex items-center mb-1">
                        <span className="font-bold text-lg text-gray-900">
                          ₹{sellingPrice}
                        </span>
                        <span className="text-sm text-gray-400 line-through ml-2">
                          ₹{mrp}
                        </span>
                        {discountPercent > 0 && (
                          <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded font-bold">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {/* Requirement: Swap Credits and Offer Place */}
                      <div className="flex flex-col gap-1 mb-4">
                        {/* Offer is now near the price (Small text) */}
                        {item.offer && (
                          <p className="text-xs text-gray-500 truncate italic">
                            Offer: {item.offer}
                          </p>
                        )}
                        {/* Credits are now in the prominent block area (Large Badge) */}
                        <div className="flex items-center">
                          <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded border border-green-200">
                            {credits} Credits
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMoveToCartClick(item)}
                      className="w-full py-2.5 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors font-semibold shadow-sm active:scale-95 transform duration-150"
                    >
                      MOVE TO CART
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!hideHeader && <Footer />}

      {/* MYNTRA STYLE MOVE TO CART MODAL */}
      {selectionModalOpen && selectedWishlistItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold line-clamp-1">
                  {selectedWishlistItem.name}
                </h3>
                <p className="text-xs text-gray-500 font-semibold">
                  {selectedWishlistItem.brand || selectedWishlistItem.brandName}
                </p>
              </div>
              <button
                onClick={() => setSelectionModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto">
              <div className="flex gap-4 mb-6">
                <img
                  src={selectedWishlistItem.images?.[0] || '/api/placeholder/400/500'}
                  alt={selectedWishlistItem.name}
                  className="w-24 h-32 object-cover rounded border border-gray-200"
                />
                <div className="flex-1">
                  {/* Price Summary inside Modal */}
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹
                      {calculateGSTInclusivePrice(
                        selectedWishlistItem.price,
                        selectedWishlistItem.category,
                      )}
                    </span>
                    <span className="text-sm text-gray-400 line-through mb-1">
                      ₹
                      {selectedWishlistItem.originalPrice ||
                        Math.round(
                          calculateGSTInclusivePrice(
                            selectedWishlistItem.price,
                            selectedWishlistItem.category,
                          ) * 1.2,
                        )}
                    </span>
                  </div>
                  {/* Offer in Modal */}
                  {selectedWishlistItem.offer && (
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      {selectedWishlistItem.offer}
                    </p>
                  )}
                  {/* Credits in Modal */}
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded font-bold">
                    {calculateCredits(
                      calculateGSTInclusivePrice(
                        selectedWishlistItem.price,
                        selectedWishlistItem.category,
                      ),
                    )}{" "}
                    Credit
                  </span>
                </div>
              </div>

              {/* Seller & Delivery Info Block */}
              <div className="bg-gray-50 rounded p-3 mb-4 border border-gray-100">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-500 font-semibold">Sold By</span>
                  <span className="text-gray-800 font-bold">
                    {selectedWishlistItem.seller || deliveryInfo.sellerName}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-semibold">Delivery</span>
                  <div className="text-right">
                    <span className="text-green-700 font-bold block">
                      {deliveryInfo.estimatedDays} Business Days
                    </span>
                    <span className="text-gray-500 text-[10px]">
                      Free Delivery
                    </span>
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-4">
                <p className="text-sm font-bold mb-2">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {selectedWishlistItem.sizes &&
                    selectedWishlistItem.sizes.split(",").map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setTempSize(size.trim())}
                        className={`w-10 h-10 flex items-center justify-center border text-sm rounded font-semibold transition-colors ${
                          tempSize === size.trim()
                            ? "border-slate-800 bg-slate-800 text-white"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {size.trim()}
                      </button>
                    ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-4">
                <p className="text-sm font-bold mb-2">Select Color</p>
                <div className="flex flex-wrap gap-2">
                  {selectedWishlistItem.colors &&
                    selectedWishlistItem.colors
                      .split(",")
                      .map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setTempColor(color.trim())}
                          className={`px-3 py-1 text-xs border rounded font-semibold transition-colors ${
                            tempColor === color.trim()
                              ? "border-slate-800 bg-slate-800 text-white"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {color.trim()}
                        </button>
                      ))}
                </div>
              </div>
            </div>

            {/* Modal Footer / Action Button */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={handleConfirmMoveToCart}
                className="w-full py-3 bg-pink-500 text-white font-bold rounded hover:bg-pink-600 transition-colors shadow-md active:scale-95 transform duration-150"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Header Component

export default WishlistPage;