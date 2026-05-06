'use client';

import React, { useState, useRef, useContext, useEffect } from 'react';
import { X, Heart, Star, Share2, Instagram, Filter } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { productsAPI } from '../lib/api';
import ShareProductModal from './ShareProductModal';
import ProductFilter from './ProductFilter';
import type { PageName, Product } from '../types';
import Header from './Header';
import Footer from './Footer';

interface CategoryPageProps {
  category: string;
  setCurrentPage: (page: PageName) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNavigateToSignup?: () => void;
  hideHeader?: boolean;
  currentPage?: PageName;
}

const CategoryPage = ({ category, setCurrentPage, searchQuery, setSearchQuery, onNavigateToSignup, hideHeader = false, currentPage = "all" }: CategoryPageProps) => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  
  // State for the intermediate selection modal (Quick Add)
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  
  const [activeProductSlide, setActiveProductSlide] = useState(0);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Products from API
  const [productsData, setProductsData] = useState<any[]>([]);
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsAPI.getAll();
        setProductsData(data.products || []);
      } catch {
        // fallback: import static data
        const mod = await import('../data/products');
        setProductsData(mod.default || []);
      }
    };
    loadProducts();
  }, []);
  
  const [filters, setFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    discount: '',
    minPrice: '',
    maxPrice: ''
  });
  
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const companyDropdownRef = useRef(null);
  
  // Delivery State
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<{estimatedDays: string; deliveryCharge: string; returnAvailable: boolean} | null>(null);
  const [pincodeChecked, setPincodeChecked] = useState(false);

  const checkDeliveryAvailability = (pincode) => {
    if (!pincode || pincode.length < 6) {
      alert('Please enter a valid pincode');
      return;
    }
    setDeliveryInfo({
      estimatedDays: '3-5',
      deliveryCharge: 'FREE',
      returnAvailable: true
    });
    setPincodeChecked(true);
  };
  
  // Update this line at the top of your component
  const { addToCart, addToWishlist, removeFromWishlist, wishlistItems, isLoggedIn } = React.useContext(CartContext); 
  
  // --- Helper Functions ---
  
  const calculateGSTInclusivePrice = (price, category) => {
    let gstRate = 0.18; 
    if (category === 'Clothing') {
      gstRate = price <= 2500 ? 0.05 : 0.18;
    }
    return Math.round(price * (1 + gstRate));
  };
  
  const calculateCredits = (price) => {
    return (price / 100).toFixed(2);
  };
  
  const getGSTRate = (price, category) => {
    if (category === 'Clothing') {
      if (price <= 2500) return 0.05;
      else return 0.18;
    } else {
      return 0.18;
    }
  };
  
  // --- Filter Logic ---
  
  const getFilteredProducts = () => {
    let products: any[] = [];
    
    if (category === 'all') {
      products = productsData;
    } else if (category === 'accessories') {
      products = productsData.filter(p => p.category === 'Accessories');
    } else if (category === 'mens') {
      products = productsData.filter(p => p.category === 'Clothing' && 
        (p.subCategory?.includes('Shirt') || p.subCategory?.includes('Jeans') || 
         p.subCategory?.includes('Pants') || p.subCategory?.includes('Jacket')));
    } else if (category === 'womens') {
      products = productsData.filter(p => p.category === 'Clothing' && 
        (p.subCategory?.includes('Dress') || p.subCategory?.includes('Skirt') || 
         p.subCategory?.includes('Blouse')));
    } else if (category === 'children') {
      products = productsData.filter(p => p.category === 'Clothing' && 
        (p.subCategory?.toLowerCase().includes('kid') || p.subCategory?.toLowerCase().includes('child') ||
         p.subCategory?.toLowerCase().includes('boy') || p.subCategory?.toLowerCase().includes('girl') ||
         p.occasion?.toLowerCase().includes('kids')));
    }
    
    if (filters.categories.length > 0) {
      products = products.filter(p => 
        filters.categories.some(cat => p.subCategory?.toLowerCase().includes(cat.toLowerCase()))
      );
    }
    
    if (filters.brands.length > 0) {
      products = products.filter(p => 
        filters.brands.includes(p.brandName?.toLowerCase())
      );
    }
    
    if (filters.colors.length > 0) {
      products = products.filter(p => 
        p.colors && filters.colors.some(color => 
          p.colors.toLowerCase().includes(color.toLowerCase())
        )
      );
    }
    
    if (filters.sizes.length > 0) {
      products = products.filter(p => 
        p.sizes && filters.sizes.some(size => 
          p.sizes.toLowerCase().includes(size.toLowerCase())
        )
      );
    }
    
    if (filters.discount) {
      const minDiscount = parseInt(filters.discount);
      products = products.filter(p => {
        const originalPrice = p.discountedPrice || p.price * 1.2; 
        const discount = Math.round((1 - p.price / originalPrice) * 100);
        return discount >= minDiscount;
      });
    }
    
    if (filters.minPrice) {
      products = products.filter(p => p.price >= parseInt(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      products = products.filter(p => p.price <= parseInt(filters.maxPrice));
    }
    
    return products;
  };
  
  const filteredProducts = getFilteredProducts().filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // --- Handlers ---
  
  const getPageTitle = () => {
    switch(category) {
      case 'all': return 'All Products';
      case 'mens': return "Men's Fashion";
      case 'womens': return "Women's Fashion";
      case 'accessories': return 'Accessories';
      case 'children': return "Children's Fashion";
      default: return 'Products';
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
  };
  
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      if (filterType === 'discount' || filterType === 'minPrice' || filterType === 'maxPrice') {
        return { ...prev, [filterType]: value };
      } else {
        const updatedValues = [...prev[filterType]];
        if (updatedValues.includes(value)) {
          return { ...prev, [filterType]: updatedValues.filter(v => v !== value) };
        } else {
          return { ...prev, [filterType]: [...updatedValues, value] };
        }
      }
    });
  };
  
  const clearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      colors: [],
      sizes: [],
      discount: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  // Opens the intermediate selection modal (Unselects previous choices)
  const initiateAddToCart = (product) => {
    if (!isLoggedIn || (typeof isLoggedIn === 'function' && !isLoggedIn())) {
      onNavigateToSignup?.();
      return;
    }
    setSelectedProduct(product);
    // Requirement: Unselect previously
    setSelectedSize('');
    setSelectedColor('');
    setSelectionModalOpen(true);
  };

  const handleAddToCart = (product) => {
    // This is used inside the main modal
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }
    addToCart(product, selectedSize, selectedColor);
    setProductModalOpen(false);
    setSelectionModalOpen(false);
    alert('Product added to cart!');
  };
  
  // Handles "Done" button in selection modal
  const handleSelectionDone = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select both size and color to proceed.');
      return;
    }
    // Close modal and add
    setSelectionModalOpen(false);
    addToCart(selectedProduct, selectedSize, selectedColor);
    alert('Product added to cart!');
    // Reset
    setSelectedSize('');
    setSelectedColor('');
  };
  
  // UPDATED: Silent Wishlist Add (No alerts, no questions)
  // UPDATED: Toggle Wishlist Function
const handleAddToWishlist = (product) => {
  if (!isLoggedIn || (typeof isLoggedIn === 'function' && !isLoggedIn())) {
    onNavigateToSignup?.();
    return;
  }
  // Check if this product is already in the wishlist
  const pid = product._id || product.id;
  const existingItem = wishlistItems.find((item) => (item._id || item.id) === pid);

  if (existingItem) {
    // If it exists, remove it (Toggle OFF)
    removeFromWishlist(existingItem._id || existingItem.id, existingItem.selectedSize, existingItem.selectedColor);
  } else {
    // If it doesn't exist, add it (Toggle ON)
    let sizeToUse = selectedSize;
    let colorToUse = selectedColor;

    // Default to first available if not selected
    if (!sizeToUse && product.sizes) {
      sizeToUse = product.sizes.split(',')[0].trim();
    }
    if (!colorToUse && product.colors) {
      colorToUse = product.colors.split(',')[0].trim();
    }

    addToWishlist(product, sizeToUse, colorToUse);
  }
};
  
  const handleShareProduct = (product) => {
    setSelectedProduct(product);
    setShareModalOpen(true);
  };
  
  // --- Render ---

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');
        * { font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
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
      
      {/* Category Header */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-8xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{getPageTitle()}</h1>
          <p className="text-gray-600 text-lg">
            {category === 'all' 
              ? 'Explore our complete collection of fashion products' 
              : `Discover our latest ${category === 'mens' ? "men's" : category === 'womens' ? "women's" : ''} fashion collection`}
          </p>
        </div>
      </section>
      
      {/* Products Grid with Filter */}
      <section className="py-12">
        <div className="max-w-8xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filter Section */}
            <ProductFilter 
              filters={filters}
              handleFilterChange={handleFilterChange}
              clearFilters={clearFilters}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              applyFilters={() => {}}
            />
            
            {/* Products Section */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {filteredProducts.length} Products Found
                </h2>
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md"
                >
                  <Filter size={18} />
                  <span>Filters</span>
                </button>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                  <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => {
                    const sellingPrice = calculateGSTInclusivePrice(product.price, product.category);
                    // Calculate MRP (Higher price)
                    const mrp = product.discountedPrice && product.discountedPrice > product.price 
                        ? calculateGSTInclusivePrice(product.discountedPrice, product.category)
                        : Math.round(sellingPrice * 1.2);
                    
                    const credits = calculateCredits(sellingPrice);
                    const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
                    
                    return (
                      <div key={product._id || product.id} className="bg-white overflow-hidden group transition-shadow">
                        <div className="relative">
                          <img 
                            src={product.images?.[0] || '/api/placeholder/400/500'} 
                            alt={product.name} 
                            className="w-full h-64 object-cover"
                          />
                          <button 
                            onClick={() => {
                              setSelectedProduct(product);
                              // Requirement: Unselect previously
                              setSelectedSize('');
                              setSelectedColor('');
                              setActiveProductSlide(0);
                              setProductModalOpen(true);
                            }}
                            className="absolute inset-0 flex items-center justify-center transition-all"
                          ></button>
                          {/* 
                          {discountPercent > 0 && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
                              {discountPercent}% OFF
                            </div>
                          )}*/}
                        </div>
                        
                        <div className="p-4">
                          <p className="text-sm text-gray-500 mb-1 font-semibold">{product.brandName}</p>
                          <h4 className="font-semibold mb-2">{product.name}</h4>
                          
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < Math.floor(product.rating || 4) ? "currentColor" : "none"} />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 ml-1 font-semibold">({product.reviews || 100})</span>
                          </div>

                          <div className="flex items-center flex-nowrap gap-1 mb-1">
                            <span className="font-bold text-lg text-gray-900 whitespace-nowrap">
                                ₹{sellingPrice}
                            </span>
                            {/*<span className="text-sm text-gray-400 line-through whitespace-nowrap">
                                MRP ₹{mrp}
                           </span>*/}
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap">
                               {credits} credit
                            </span>
                               {discountPercent > 0 && (
                           <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap">
                               {discountPercent}% OFF
                           </span>
                             )}
                           </div>
                          
                          {/* Requirement: Price Update (MRP + Selling Price + Credits)
                          <div className="flex flex-col mb-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-gray-500 line-through">MRP: ₹ {mrp}</span>
                              <span className="font-bold text-lg text-gray-900">₹ {sellingPrice}</span>
                              <span className="text-xs text-green-600 font-semibold bg-green-50 px-1 rounded">
                                {credits} Credit
                              </span>
                            </div>
                          </div>*/}
                          
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedProduct(product);
                                setSelectedSize('');
                                setSelectedColor('');
                                setActiveProductSlide(0);
                                setProductModalOpen(true);
                              }}
                              className="flex-1 px-3 py-1.5 border border-slate-300 text-slate-600 text-sm rounded hover:bg-slate-20 transition-colors font-bold"
                            >
                              View Details
                            </button>
                            {/* Silent Wishlist Button */}
                            <button 
                             onClick={() => handleAddToWishlist(product)}
                             className="p-1.5 border border-slate-100 text-red-600 rounded hover:bg-slate-20 transition-colors font-bold"
                            >
                           <Heart 
                            size={16} 
                            // If in wishlist, fill it with current color (Red). Otherwise, empty outline.
                            fill={wishlistItems.some((item) => (item._id || item.id) === (product._id || product.id)) ? 'currentColor' : 'none'}
                            />
                             </button>
                            <button 
                              onClick={() => handleShareProduct(product)}
                              className="p-1.5 border border-slate-100 text-green-600 rounded hover:bg-slate-20 transition-colors font-bold"
                            >
                              <Share2 size={16} />
                            </button>
                          </div>
                          {/* Grid "Add to Cart" triggers the Modal */}
                          <button 
                            onClick={() => initiateAddToCart(product)}
                            className="w-full mt-2 px-3 py-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {!hideHeader && <Footer />}
      
      {/* MAIN PRODUCT DETAILS MODAL */}
      {productModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                <button onClick={() => setProductModalOpen(false)} className="p-1">
                  <X size={20} />
                </button>
              </div>
             
             <div className="grid md:grid-cols-2 gap-6">
               {/* Left Column: Images */}
               <div>
                 <div className="relative">
                   <img 
                     src={selectedProduct.images?.[activeProductSlide] || '/api/placeholder/400/500'} 
                     alt={selectedProduct.name} 
                     className="w-full h-80 object-cover rounded-lg"
                   />
                   <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                     {selectedProduct.images.map((_, index) => (
                       <button 
                         key={index}
                         onClick={() => setActiveProductSlide(index)}
                         className={`w-2 h-2 rounded-full ${index === activeProductSlide ? 'bg-blue-600' : 'bg-gray-300'}`}
                       />
                     ))}
                   </div>
                 </div>
                 
                 <div className="flex space-x-2 mt-4">
                   {selectedProduct.images.map((image, index) => (
                     <img 
                       key={index}
                       src={image} 
                       alt={`${selectedProduct.name} ${index + 1}`}
                       className={`w-20 h-20 object-cover rounded cursor-pointer ${index === activeProductSlide ? 'ring-2 ring-blue-600' : ''}`}
                       onClick={() => setActiveProductSlide(index)}
                     />
                   ))}
                 </div>

                 {/* RESTORED: Product Video Section */}
                 {selectedProduct.videoLink && (
                   <div className="mt-4">
                     <h4 className="font-bold mb-2">Product Video</h4>
                     <div className="relative">
                       <div className="bg-gray-200 rounded-lg overflow-hidden h-48 flex items-center justify-center group cursor-pointer border border-gray-300">
                         <div className="bg-gradient-to-r from-pink-500 to-orange-400 bg-opacity-90 rounded-full p-3 inline-block mb-2 shadow-md transform group-hover:scale-110 transition-transform">
                           <Instagram size={24} className="text-white" />
                         </div>
                         <div className="absolute bottom-4 w-full text-center pointer-events-none">
                           {/*<p className="text-gray-800 font-semibold text-sm">View on Instagram</p>*/}
                         </div>
                       </div>
                       <a 
                         href={selectedProduct.videoLink} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="absolute inset-0"
                       ></a>
                     </div>
                   </div>
                 )}
               </div>
               
               {/* Right Column: Details */}
               <div>
                 <p className="text-sm text-gray-500 mb-2 font-semibold">{selectedProduct.brandName}</p>
                 <h4 className="text-xl font-bold mb-4">{selectedProduct.name}</h4>
                 
                 <div className="flex items-center mb-4">
                   <div className="flex text-yellow-400">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} size={16} fill={i < Math.floor(selectedProduct.rating || 4) ? "currentColor" : "none"} />
                     ))}
                   </div>
                   <span className="text-sm text-gray-500 ml-2 font-semibold">({selectedProduct.reviews || 100} reviews)</span>
                 </div>
                 
                 {/* Requirement: Price Display */}
                 <div className="mb-4 p-1">
                   {(() => {
                     const sellingPrice = calculateGSTInclusivePrice(selectedProduct.price, selectedProduct.category);
                     const mrp = selectedProduct.discountedPrice && selectedProduct.discountedPrice > selectedProduct.price 
                        ? calculateGSTInclusivePrice(selectedProduct.discountedPrice, selectedProduct.category)
                        : Math.round(sellingPrice * 1.2);
                     const credits = calculateCredits(sellingPrice);
                     const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

                     return (
                       <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2">
                          
                           <span className="text-2xl font-bold text-gray-900">₹{sellingPrice}</span>
                           <span className="text-sm font-medium text-gray-300 line-through">MRP ₹{mrp}</span>
                           {discountPercent > 0 && (
                             <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap">
                               {discountPercent}% OFF
                             </span>
                           )}
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap">
                                {credits} Credit
                           </span>
                           <span className="text-xs text-gray-500">Inclusive of all taxes</span>
                         </div>
                       </div>
                     );
                   })()}
                 </div>
                 
                 <div className="mb-4">
                   <p className="text-sm font-bold mb-2">Fit</p>
                   <p className="text-sm text-gray-600 font-semibold">{selectedProduct.fitType}</p>
                 </div>
                 
                 {/* Requirement: Available Colors Unselected */}
                 <div className="mb-4">
                   <p className="text-sm font-bold mb-2">Available Colors</p>
                   <div className="flex flex-wrap gap-2">
                     {selectedProduct.colors && selectedProduct.colors.split(',').map((color, index) => (
                       <button 
                         key={index}
                         onClick={() => setSelectedColor(color.trim())}
                         className={`px-3 py-1 border rounded text-sm transition-colors font-semibold ${
                           selectedColor === color.trim() 
                             ? 'border-black bg-gray-900 text-white shadow-md transform scale-105' 
                             : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:text-black'
                         }`}
                       >
                         {color.trim()}
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* Requirement: Select Size Unselected & Size Chart */}
                 <div className="mb-4">
                   <div className="flex justify-between items-center mb-2">
                     <p className="text-sm font-bold">Select Size</p>
                     <button className="text-sm text-blue-600 hover:underline font-bold" onClick={() => alert('Opening Size Chart...')}>Size Chart</button>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {selectedProduct.sizes && selectedProduct.sizes.split(',').map((size, index) => (
                       <button 
                      key={index}
                      onClick={() => setSelectedSize(size.trim())}
                      className={`w-10 h-10 flex items-center justify-center border text-sm font-bold rounded-md transition-all duration-200 ${
                        selectedSize === size.trim() 
                          ? 'border-black bg-gray-900 text-white shadow-md transform scale-105' 
                          : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:text-black'
                      }`}
                    >
                         {size.trim()}
                       </button>
                     ))}
                   </div>
                 </div>
                 
                 <div className="mb-4">
                   <p className="text-sm font-bold mb-2">Offers</p>
                   <p className="text-sm text-green-600 font-semibold">{selectedProduct.offer}</p>
                 </div>
                 
                 <div className="flex space-x-3 mt-3">
                   {/* Silent Wishlist Button in Modal */}
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
                     onClick={() => { if(!selectedSize || !selectedColor) { alert('Please select size and color'); return; } handleAddToCart(selectedProduct); }}
                     className="flex-1 py-2 border border-gray-300 bg-slate-800 rounded hover:bg-transparent hover:text-slate-900 text-white text-sm font-medium cursor-pointer transition-all duration-300"
                   >
                     <span className="text-sm font-bold">Buy now</span>
                   </button>
                   <button 
                     onClick={() => { if(!selectedSize || !selectedColor) { alert('Please select size and color'); return; } handleAddToCart(selectedProduct); }}
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
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-semibold focus:outline-none focus:border-slate-200"
                      onChange={(e) => setDeliveryPincode(e.target.value)}
                      value={deliveryPincode || ''}
                      disabled={pincodeChecked}
                    />
                  <button 
                    className={`ml-2 px-2.5 py-1 rounded text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${pincodeChecked 
                     ? 'bg-slate-700 hover:bg-slate-700 text-white' 
                     : 'bg-slate-700 hover:bg-slate-700 text-white'}`}
                    onClick={() => {
                      if (pincodeChecked) {
                       setPincodeChecked(false); setDeliveryInfo(null); setDeliveryPincode('');
                      } else { checkDeliveryAvailability(deliveryPincode); }
                    }}
                   >
                     {pincodeChecked ? 'Change' : 'Check'}
                 </button>
                </div>
                {deliveryInfo && (
                  <div className="mt-3 text-sm">
                    <p className="text-green-600 font-medium mb-1"><span className="font-bold">Estimation:</span> {deliveryInfo.estimatedDays || '3-5'} business days</p>
                    <p className="text-gray-600 font-medium mb-1"><span className="font-bold">Delivery charge:</span> {deliveryInfo.deliveryCharge || 'FREE'}</p>
                    <p className="text-gray-600 font-medium mb-2"><span className="font-bold">Return and Exchange:</span> Available</p>
                    <div className="bg-blue-50 p-2 rounded mt-2">
                      <p className="text-xs font-semibold text-blue-600">Return a product and get the amount back as credits! Use them anytime for your next purchase and no expiry, no rush.</p>
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
                   <p className="text-sm text-gray-600 font-medium">{selectedProduct.shortDescription}</p>
                 </div>
                 <div>
                   <h5 className="font-bold mb-3">Material & Care</h5>
                   <p className="text-sm text-gray-600 mb-2 font-medium">Material: {selectedProduct.material}</p>
                   <p className="text-sm text-gray-600 font-medium">Care: {selectedProduct.washMethod}</p>
                 </div>
                 <div>
                   <h5 className="font-bold mb-3">Size & Fit</h5>
                   <p className="text-sm text-gray-600 mb-2 font-medium">Fit: {selectedProduct.fitType}</p>
                   <button className="text-sm text-blue-600 hover:underline font-bold" onClick={() => alert('Size Chart View')}>Size Chart</button>
                 </div>
               </div>
             </div>
             
             <div className="mt-6 border-t pt-6">
               <h5 className="font-bold mb-3">Additional Information</h5>
               <div className="grid md:grid-cols-2 gap-4 text-sm">
                 <div><span className="font-medium">Category:</span> {selectedProduct.category} / {selectedProduct.subCategory}</div>
                 <div><span className="font-medium">SKU:</span> {selectedProduct.sku}</div>
                 <div><span className="font-medium">HSN Code:</span> {selectedProduct.hsnCode}</div>
                 <div><span className="font-medium">Stock:</span> {selectedProduct.stockQuantity} units</div>
                 <div><span className="font-medium">Package Dimensions:</span> {selectedProduct.packageDimensions}</div>
                 <div><span className="font-medium">Weight:</span> {selectedProduct.weight}</div>
                 <div><span className="font-medium">Delivery Availability:</span> {selectedProduct.deliveryAvailability}</div>
                 <div><span className="font-medium">COD Option:</span> {selectedProduct.codOption}</div>
                 <div><span className="font-medium">Country of Origin:</span> {selectedProduct.countryOfOrigin}</div>
               </div>
             </div>
             
             <div className="mt-6 border-t pt-6">
               <h5 className="font-bold mb-3">Full Description</h5>
               <p className="text-sm text-gray-600 font-medium">{selectedProduct.fullDescription}</p>
             </div>
             
             <div className="mt-6 border-t pt-6">
               <h5 className="font-bold mb-3">Key Features</h5>
               <p className="text-sm text-gray-600 font-medium">{selectedProduct.keyFeatures}</p>
             </div>
             
             <div className="mt-6 border-t pt-6">
               <h5 className="font-bold mb-3">Return Policy</h5>
               <p className="text-sm text-gray-600 font-medium">{selectedProduct.returnPolicy}</p>
             </div>
             
             {/* Requirement: Customer Questions Section */}
             <div className="mt-6 border-t pt-6">
               <div className="flex justify-between items-center mb-4">
                 <h5 className="font-bold mb-0">Customer Questions</h5>
                 <button className="text-blue-600 text-sm font-bold hover:underline">View all questions</button>
               </div>
               <div className="space-y-4 mb-6">
                 <div className="bg-gray-50 p-3 rounded">
                   <p className="text-sm font-semibold text-gray-800">Q: Is this material 100% cotton?</p>
                   <p className="text-sm text-gray-600 mt-1">A: Yes, it is made of 100% premium cotton.</p>
                 </div>
               </div>
               <button 
                 className="w-full py-2 border border-slate-200 text-slate-600 rounded font-bold text-sm hover:bg-slate-50 transition-colors"
                 onClick={() => alert('Open Question Form Modal')}
               >
                 Ask a Question
               </button>
             </div>

             <div className="mt-6 border-t pt-6">
               <h5 className="font-bold mb-3">Customer Reviews & Ratings</h5>
               <div className="space-y-4">
                 <div className="border-b pb-4">
                   <div className="flex items-center mb-2">
                     <div className="flex text-yellow-400">
                       {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                     </div>
                     <span className="text-sm text-gray-500 ml-2 font-semibold">John Doe</span>
                   </div>
                   <p className="text-sm text-gray-600 font-medium">Great product! Exactly as described and fits perfectly.</p>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     )}
     
     {/* SELECTION MODAL */}
     {selectionModalOpen && selectedProduct && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-5xl max-h-[65vh] overflow-hidden shadow-2xl animate-fade-in-up flex flex-col md:flex-row h-auto md:h-[600px]">
          
          {/* LEFT COLUMN: Product Image */}
          <div className="w-full md:w-1/2 h-64 md:h-full bg-gray-100 relative">
            <img 
              src={selectedProduct.images?.[0] || '/api/placeholder/400/500'} 
              alt={selectedProduct.name} 
              className="w-full h-full object-cover"
            />
            
            {/* Close Button on Image */}
            <button 
              onClick={() => setSelectionModalOpen(false)} 
              className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
            >
              <X size={20} className="text-gray-800" />
            </button>
          </div>

          {/* RIGHT COLUMN: Product Details & Selection */}
          <div className="w-full md:w-1/2 flex flex-col h-full">
            
            {/* Scrollable Content Area */}
            <div className="overflow-y-auto p-6 pb-4">
              
              {/* Header */}
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 mb-1">{selectedProduct.brandName}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(selectedProduct.rating || 4) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1 font-semibold">({selectedProduct.reviews || 100})</span>
            </div>
    
                {/* Price Block - Myntra Style */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    Rs. {calculateGSTInclusivePrice(selectedProduct.price, selectedProduct.category)}
                  </span>
                  <span className="text-sm font-medium text-gray-300 line-through">
                    MRP ₹{
                      selectedProduct.discountedPrice && selectedProduct.discountedPrice > selectedProduct.price 
                      ? calculateGSTInclusivePrice(selectedProduct.discountedPrice, selectedProduct.category)
                      : Math.round(calculateGSTInclusivePrice(selectedProduct.price, selectedProduct.category) * 1.2)
                    }
                  </span>
                  <span className="text-sm font-bold text-red-500">
                {(() => {
                  const sellingPrice = calculateGSTInclusivePrice(selectedProduct.price, selectedProduct.category);
                  const mrp = selectedProduct.discountedPrice && selectedProduct.discountedPrice > selectedProduct.price 
                    ? calculateGSTInclusivePrice(selectedProduct.discountedPrice, selectedProduct.category)
                    : Math.round(sellingPrice * 1.2);
                  const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
                  return `(${discountPercent}% OFF)`;
                })()}
              </span>
                </div>
              </div>

              {/* Select Size Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-bold text-gray-900 tracking-wide">Select Size</p>
                  <button className="text-sm text-blue-600 hover:underline font-bold">Size Chart</button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {selectedProduct.sizes && selectedProduct.sizes.split(',').map((size, index) => (
                    <button 
                      key={index}
                      onClick={() => setSelectedSize(size.trim())}
                      className={`w-10 h-10 flex items-center justify-center border text-sm font-bold rounded-md transition-all duration-200 ${
                        selectedSize === size.trim() 
                          ? 'border-black bg-gray-900 text-white shadow-md transform scale-105' 
                          : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:text-black'
                      }`}
                    >
                      {size.trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Color Section */}
              <div className="mb-6">
                 <p className="text-sm font-bold text-gray-900 tracking-wide mb-3">Select Color</p>
                 <div className="flex flex-wrap gap-3">
                   {selectedProduct.colors && selectedProduct.colors.split(',').map((color, index) => (
                     <button 
                       key={index}
                       onClick={() => setSelectedColor(color.trim())}
                       className={`px-4 py-2 text-xs font-bold border rounded transition-all ${
                         selectedColor === color.trim()
                           ? 'border-black bg-gray-900 text-white shadow-md transform scale-105'
                           : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:text-black'
                       }`}
                     >
                       {color.trim()}
                     </button>
                   ))}
                 </div>
              </div>
              
              {/* Offer Strip */}
              {selectedProduct.offer && (
                <div className="bg-green-50 border-green-500 p-3 mb-4">
                  <p className="text-xs font-bold text-gray-800">
                    <span className="text-green-600">OFFER:</span> {selectedProduct.offer}
                  </p>
                </div>
              )}

              {/* Delivery Info - Clean Text Style */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Seller</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedProduct.brandName || "RetailNet Official"}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-gray-400 uppercase">Delivery</p>
                   <p className="text-sm font-semibold text-green-700">{deliveryInfo?.estimatedDays || '3-5'} Business Days</p>
                </div>
              </div>
            </div>

            {/* Footer / Sticky Action Button */}
            <div className="p-4 border-t border-gray-200 bg-white shrink-0">
              <button 
                onClick={handleSelectionDone}
                className="w-full py-3.5 w-full mt-2 px-3 py-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      </div>
    )}
     
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

// About Us Page Component

export default CategoryPage;