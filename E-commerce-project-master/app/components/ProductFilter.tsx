'use client';

import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import productsData from '../data/products';

interface FilterState {
  [key: string]: string | string[] | number | boolean;
}

interface ProductFilterProps {
  filters: FilterState;
  handleFilterChange: (key: string, value: string | string[] | boolean) => void;
  clearFilters: () => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  applyFilters: () => void;
}

const ProductFilter = ({ filters, handleFilterChange, clearFilters, isFilterOpen, setIsFilterOpen, applyFilters }: ProductFilterProps) => {
  // Discount options now defined within the component
  const discountOptions = [
    { id: '10', label: '10% and above' },
    { id: '20', label: '20% and above' },
    { id: '30', label: '30% and above' },
    { id: '40', label: '40% and above' },
    { id: '50', label: '50% and above' }
  ];
  
  // Extract unique categories from productsData
  const [productCategories, setProductCategories] = useState([]);
  const [productBrands, setProductBrands] = useState([]);
  const [productColors, setProductColors] = useState([]);
  const [productSizes, setProductSizes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Extract filter options from productsData
  useEffect(() => {
    // Extract unique categories and subcategories
    const categoriesMap = new Map();
    productsData.forEach(product => {
      if (product.category && product.subCategory) {
        const key = `${product.category}-${product.subCategory}`;
        if (!categoriesMap.has(key)) {
          categoriesMap.set(key, {
            id: key,
            name: product.subCategory,
            category: product.category,
            count: 0
          });
        }
        categoriesMap.get(key).count++;
      }
    });
    setProductCategories(Array.from(categoriesMap.values()));
    
    // Extract unique brands
    const brandsMap = new Map();
    productsData.forEach(product => {
      if (product.brandName) {
        if (!brandsMap.has(product.brandName)) {
          brandsMap.set(product.brandName, {
            id: product.brandName.toLowerCase(),
            name: product.brandName,
            count: 0
          });
        }
        brandsMap.get(product.brandName).count++;
      }
    });
    setProductBrands(Array.from(brandsMap.values()));
    
    // Extract unique colors
    const colorsSet = new Set();
    productsData.forEach(product => {
      if (product.colors) {
        const colorList = product.colors.split(',').map(c => c.trim());
        colorList.forEach(color => {
          if (color) {
            colorsSet.add(color);
          }
        });
      }
    });
    setProductColors(Array.from(colorsSet));
    
    // Extract unique sizes
    const sizesMap = new Map();
    productsData.forEach(product => {
      if (product.sizes) {
        const sizeList = product.sizes.split(',').map(s => s.trim());
        sizeList.forEach(size => {
          if (size) {
            if (!sizesMap.has(size)) {
              sizesMap.set(size, {
                id: size.toLowerCase(),
                name: size,
                count: 0
              });
            }
            sizesMap.get(size).count++;
          }
        });
      }
    });
    setProductSizes(Array.from(sizesMap.values()));
  }, []);
  
  // Count active filters
  const activeFilterCount = 
    filters.categories.length + 
    filters.brands.length + 
    filters.colors.length + 
    filters.sizes.length + 
    (filters.discount ? 1 : 0) + 
    (filters.minPrice ? 1 : 0) + 
    (filters.maxPrice ? 1 : 0);
  
  // Get filtered categories based on search term
  const filteredCategories = productCategories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get color hex value based on color name
  const getColorHex = (colorName) => {
    const colorMap = {
      'Black': '#000000',
      'Blue': '#1E40AF',
      'Purple': '#7C3AED',
      'Orange': '#F97316',
      'Pink': '#EC4899',
      'Yellow': '#EAB308',
      'Red': '#DC2626',
      'Green': '#16A34A',
      'White': '#FFFFFF',
      'Grey': '#6B7280',
      'Navy': '#1E3A8A',
      'Brown': '#92400E',
      'Tan': '#D97706',
      'Rose Gold': '#E11D48',
      'Silver': '#9CA3AF',
      'Gold': '#F59E0B',
      'Floral': '#EC4899'
    };
    return colorMap[colorName] || '#6B7280';
  };
  
  // Size ordering for better UX
  const getOrderedSizes = () => {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40'];
    const ordered = [];
    const remaining = [];
    
    productSizes.forEach(size => {
      const index = sizeOrder.indexOf(size.name);
      if (index !== -1) {
        ordered[index] = size;
      } else {
        remaining.push(size);
      }
    });
    
    return [...ordered.filter(Boolean), ...remaining];
  };
  
  return (
    <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Filters</h3>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear All
            </button>
          </div>
        </div>
        
        {/* Search within filters */}
        <div className="mb-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search filters..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="absolute right-2 top-2.5 text-gray-400" />
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center justify-between">
            Categories
            <button 
              onClick={() => {
                const allCategoryIds = filteredCategories.map(c => c.id);
                if (filters.categories.length === allCategoryIds.length) {
                  handleFilterChange('categories', '');
                } else {
                  allCategoryIds.forEach(id => handleFilterChange('categories', id));
                }
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              {filters.categories.length === filteredCategories.length ? 'Deselect All' : 'Select All'}
            </button>
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {filteredCategories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={filters.categories.includes(category.id)}
                  onChange={() => handleFilterChange('categories', category.id)}
                />
                <span className="text-sm">{category.name}</span>
                <span className="text-xs text-gray-500 ml-auto">({category.count})</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Brands */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center justify-between">
            Brands
            <button 
              onClick={() => {
                const allBrandIds = productBrands.map(b => b.id);
                if (filters.brands.length === allBrandIds.length) {
                  handleFilterChange('brands', '');
                } else {
                  allBrandIds.forEach(id => handleFilterChange('brands', id));
                }
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              {filters.brands.length === productBrands.length ? 'Deselect All' : 'Select All'}
            </button>
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {productBrands.map((brand) => (
              <label key={brand.id} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={filters.brands.includes(brand.id)}
                  onChange={() => handleFilterChange('brands', brand.id)}
                />
                <span className="text-sm">{brand.name}</span>
                <span className="text-xs text-gray-500 ml-auto">({brand.count})</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Sizes */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center justify-between">
            Sizes
            <button 
              onClick={() => {
                const allSizeIds = productSizes.map(s => s.id);
                if (filters.sizes.length === allSizeIds.length) {
                  handleFilterChange('sizes', '');
                } else {
                  allSizeIds.forEach(id => handleFilterChange('sizes', id));
                }
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              {filters.sizes.length === productSizes.length ? 'Deselect All' : 'Select All'}
            </button>
          </h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {getOrderedSizes().map((size) => (
              <button
                key={size.id}
                className={`px-3 py-1 border rounded text-sm transition-colors font-medium ${
                  filters.sizes.includes(size.id) 
                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => handleFilterChange('sizes', size.id)}
              >
                {size.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {filters.sizes.map((sizeId, index) => {
              const size = productSizes.find(s => s.id === sizeId);
              return size ? (
                <span 
                  key={index} 
                  className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1"
                >
                  {size.name}
                  <button 
                    onClick={() => handleFilterChange('sizes', sizeId)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
        
        {/* Colors - Updated to Checkbox Format */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center justify-between">
            Colors
            <button 
              onClick={() => {
                const allColorIds = productColors.map(c => c); // Colors are strings, so map to themselves
                if (filters.colors.length === allColorIds.length) {
                  handleFilterChange('colors', '');
                } else {
                  allColorIds.forEach(color => handleFilterChange('colors', color));
                }
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              {filters.colors.length === productColors.length ? 'Deselect All' : 'Select All'}
            </button>
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {productColors.map((color, index) => (
              <label key={index} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={filters.colors.includes(color)}
                  onChange={() => handleFilterChange('colors', color)}
                />
                <span 
                  className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                  style={{ backgroundColor: getColorHex(color) }}
                />
                <span className="text-sm">{color}</span>
              </label>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {filters.colors.map((color, index) => (
              <span 
                key={index} 
                className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1"
              >
                <span 
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: getColorHex(color) }}
                />
                {color}
                <button 
                  onClick={() => handleFilterChange('colors', color)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
        
        {/* Discount */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Discount</h4>
          <div className="space-y-2">
            {discountOptions.map((option) => (
              <label key={option.id} className="flex items-center">
                <input 
                  type="radio" 
                  name="discount"
                  className="mr-2"
                  checked={filters.discount === option.id}
                  onChange={() => handleFilterChange('discount', option.id)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Price Range */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Price Range</h4>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="Min"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
            <span>-</span>
            <input 
              type="number" 
              placeholder="Max"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>
        </div>
        
        {/* Apply Filters Button */}
        <div className="flex gap-2">
          <button 
            onClick={applyFilters}
            className="w-full py-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
          >
            Apply Filters
          </button>
          <button 
            onClick={() => setIsFilterOpen(false)}
            className="md:hidden py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Wishlist Page Component

export default ProductFilter;
