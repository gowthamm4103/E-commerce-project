'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Download, RefreshCw, Eye, Edit, Plus,
  AlertCircle, CheckCircle, X, ChevronDown, ChevronUp,
  Package, TrendingUp, TrendingDown, Loader2
} from 'lucide-react';
import { businessAPI } from '../lib/api';

/* ─── TYPES ──────────────────────────────────────────────────────── */
interface SkuCode {
  sku: string;
  size: string;
  color: string;
  quantity: number;
}

interface ProductData {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  mrp: number;
  sellingPrice: number;
  totalStock: number;
  lastUpdated: string;
  skuCodes: SkuCode[];
}

interface BrandData {
  brandId: string;
  brandName: string;
  brandOwnerName: string;
  userId: string;
  products: ProductData[];
}

/* ─── COMPONENT ──────────────────────────────────────────────────── */
export default function InventoryDashboard() {
  const [inventoryData, setInventoryData] = useState<BrandData[]>([]);
  const [filteredData, setFilteredData] = useState<BrandData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('brandName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  // Stock update modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<any>(null);
  const [stockUpdateType, setStockUpdateType] = useState<'add' | 'set'>('add');
  const [stockUpdateValue, setStockUpdateValue] = useState('');

  // Detail modals
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [selectedBrandDetails, setSelectedBrandDetails] = useState<BrandData | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<any>(null);

  /* ─── DATA LOADING ──────────────────────────────────────────────── */
  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await businessAPI.getInventoryAll();
      setInventoryData(data.brands || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setSyncMessage({ type: 'error', text: 'Failed to fetch inventory data.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventoryData(); }, [fetchInventoryData]);

  /* ─── FILTERS ───────────────────────────────────────────────────── */
  useEffect(() => {
    let filtered = [...inventoryData];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.brandName.toLowerCase().includes(q) ||
        b.brandOwnerName.toLowerCase().includes(q) ||
        b.userId.toLowerCase().includes(q) ||
        b.products.some(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      );
    }

    if (selectedBrand !== 'all') {
      filtered = filtered.filter(b => b.brandId === selectedBrand);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.map(b => ({
        ...b,
        products: b.products.filter(p => p.category === selectedCategory),
      })).filter(b => b.products.length > 0);
    }

    if (selectedSubCategory !== 'all') {
      filtered = filtered.map(b => ({
        ...b,
        products: b.products.filter(p => p.subCategory === selectedSubCategory),
      })).filter(b => b.products.length > 0);
    }

    if (stockStatusFilter !== 'all') {
      filtered = filtered.map(b => ({
        ...b,
        products: b.products.filter(p => {
          if (stockStatusFilter === 'in-stock') return p.totalStock > 0;
          if (stockStatusFilter === 'low-stock') return p.totalStock > 0 && p.totalStock < 50;
          if (stockStatusFilter === 'out-of-stock') return p.totalStock === 0;
          return true;
        }),
      })).filter(b => b.products.length > 0);
    }

    filtered.sort((a, b) => {
      let aV: any, bV: any;
      if (sortBy === 'brandName') { aV = a.brandName; bV = b.brandName; }
      else if (sortBy === 'brandOwner') { aV = a.brandOwnerName; bV = b.brandOwnerName; }
      else {
        aV = a.products.reduce((s, p) => s + p.totalStock, 0);
        bV = b.products.reduce((s, p) => s + p.totalStock, 0);
      }
      return sortOrder === 'asc' ? (aV > bV ? 1 : -1) : (aV < bV ? 1 : -1);
    });

    setFilteredData(filtered);
  }, [inventoryData, searchQuery, selectedBrand, selectedCategory, selectedSubCategory, stockStatusFilter, sortBy, sortOrder]);

  /* ─── DERIVED ───────────────────────────────────────────────────── */
  const brands = inventoryData.map(b => ({ id: b.brandId, name: b.brandName }));
  const categories = [...new Set(inventoryData.flatMap(b => b.products.map(p => p.category)))];
  const subCategories = [...new Set(inventoryData.flatMap(b => b.products.map(p => p.subCategory)))];
  const totalStock = filteredData.reduce((t, b) => t + b.products.reduce((s, p) => s + p.totalStock, 0), 0);
  const totalProducts = filteredData.reduce((t, b) => t + b.products.length, 0);
  const lowStockItems = filteredData.reduce((c, b) => c + b.products.filter(p => p.totalStock > 0 && p.totalStock < 50).length, 0);

  /* ─── ACTIONS ───────────────────────────────────────────────────── */
  const toggleBrand = (id: string) => setExpandedBrands(p => ({ ...p, [id]: !p[id] }));
  const toggleProduct = (id: string) => setExpandedProducts(p => ({ ...p, [id]: !p[id] }));

  const handleStockUpdateClick = (brand: BrandData, product: ProductData, skuIndex: number) => {
    const sku = product.skuCodes[skuIndex];
    setSelectedStockItem({
      brandId: brand.brandId, brandName: brand.brandName,
      brandOwnerName: brand.brandOwnerName, userId: brand.userId,
      productId: product.id, productName: product.name,
      category: product.category, subCategory: product.subCategory,
      sku: sku.sku, size: sku.size, color: sku.color,
      currentQuantity: sku.quantity,
    });
    setStockUpdateType('add');
    setStockUpdateValue('');
    setShowStockModal(true);
  };

  const processStockUpdate = async () => {
    if (!selectedStockItem || !stockUpdateValue) return;
    const val = parseInt(stockUpdateValue);
    if (isNaN(val) || val < 0) { alert('Enter a valid positive number'); return; }
    try {
      await businessAPI.updateStock({
        productId: selectedStockItem.productId,
        updateType: stockUpdateType,
        value: val,
      });
      setShowStockModal(false);
      setSyncMessage({ type: 'success', text: `Stock updated for ${selectedStockItem.productName}` });
      setTimeout(() => setSyncMessage(null), 3000);
      await fetchInventoryData();
    } catch {
      setSyncMessage({ type: 'error', text: 'Failed to update stock.' });
    }
  };

  const syncAll = async () => {
    setSyncing(true);
    try {
      const result = await businessAPI.syncAll();
      await fetchInventoryData();
      setSyncMessage({ type: 'success', text: `Sync completed: ${(result as any).data?.syncedBrands || 0} brands updated` });
    } catch {
      setSyncMessage({ type: 'error', text: 'Failed to sync.' });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const exportData = async () => {
    try {
      const res = await businessAPI.exportInventory();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSyncMessage({ type: 'success', text: 'Exported successfully' });
      setTimeout(() => setSyncMessage(null), 3000);
    } catch {
      setSyncMessage({ type: 'error', text: 'Failed to export.' });
    }
  };

  /* ─── RENDER ────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Real-Time Inventory Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor and manage inventory across all brands</p>
            </div>
            <div className="flex flex-wrap items-center space-x-2 mt-4 md:mt-0">
              <button onClick={fetchInventoryData}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                <RefreshCw size={20} className="mr-2" /> Refresh
              </button>
              <button onClick={syncAll} disabled={syncing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                {syncing ? <><RefreshCw size={20} className="mr-2 animate-spin" /> Syncing...</> : <><RefreshCw size={20} className="mr-2" /> Sync</>}
              </button>
              <button onClick={exportData}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                <Download size={20} className="mr-2" /> Export
              </button>
            </div>
          </div>

          {/* Sync Message */}
          {syncMessage && (
            <div className={`mb-4 p-3 rounded-md ${syncMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
              <div className="flex items-center">
                {syncMessage.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                <span className="text-sm">{syncMessage.text}</span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center"><Package className="text-blue-600 mr-2" size={20} /><div><p className="text-sm text-gray-600">Total Brands</p><p className="text-xl font-semibold">{filteredData.length}</p></div></div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center"><Package className="text-green-600 mr-2" size={20} /><div><p className="text-sm text-gray-600">Total Products</p><p className="text-xl font-semibold">{totalProducts}</p></div></div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center"><Package className="text-yellow-600 mr-2" size={20} /><div><p className="text-sm text-gray-600">Total Stock</p><p className="text-xl font-semibold">{totalStock}</p></div></div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center"><TrendingUp className="text-purple-600 mr-2" size={20} /><div><p className="text-sm text-gray-600">Low Stock Items</p><p className="text-xl font-semibold">{lowStockItems}</p></div></div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search brands, products..." />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Brands</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
              <select value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All</option>
                {subCategories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
              <select value={stockStatusFilter} onChange={(e) => setStockStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="brandName">Brand Name</option>
              <option value="brandOwner">Brand Owner</option>
              <option value="totalStock">Total Stock</option>
            </select>
            <button onClick={() => setSortOrder(s => s === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded-md border border-gray-300 hover:bg-gray-100">
              {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Inventory Data */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="ml-3 text-gray-600">Loading inventory data...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">No inventory data found</p>
            <button onClick={() => { setSearchQuery(''); setSelectedBrand('all'); setSelectedCategory('all'); setSelectedSubCategory('all'); setStockStatusFilter('all'); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Reset Filters</button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredData.map(brand => (
              <div key={brand.brandId} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Brand Header */}
                <div className="p-4 bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleBrand(brand.brandId)}>
                  <div className="flex items-center">
                    <div className="mr-3">
                      {expandedBrands[brand.brandId] ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{brand.brandName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>Owner: {brand.brandOwnerName}</span>
                        <span>ID: {brand.userId}</span>
                        <span>Products: {brand.products.length}</span>
                        <span>Stock: {brand.products.reduce((s, p) => s + p.totalStock, 0)}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedBrandDetails(brand); setShowBrandModal(true); }}
                    className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200" title="View Details"><Eye size={16} /></button>
                </div>

                {/* Products */}
                {expandedBrands[brand.brandId] && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="space-y-4">
                      {brand.products.map(product => (
                        <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="p-3 bg-gray-50 cursor-pointer flex justify-between items-center"
                            onClick={() => toggleProduct(product.id)}>
                            <div className="flex items-center">
                              <div className="mr-3">
                                {expandedProducts[product.id] ? <ChevronUp size={16} className="text-gray-600" /> : <ChevronDown size={16} className="text-gray-600" />}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{product.name}</h4>
                                <div className="flex flex-wrap items-center gap-x-4 text-sm text-gray-600 mt-1">
                                  <span>{product.category} / {product.subCategory}</span>
                                  <span>MRP: ₹{product.mrp}</span>
                                  <span>SP: ₹{product.sellingPrice}</span>
                                  <span>Stock: {product.totalStock}</span>
                                </div>
                              </div>
                            </div>
                            <button onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProductDetails({ ...product, brandName: brand.brandName, brandOwnerName: brand.brandOwnerName, userId: brand.userId });
                              setShowProductModal(true);
                            }} className="p-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"><Eye size={14} /></button>
                          </div>

                          {/* SKU table */}
                          {expandedProducts[product.id] && (
                            <div className="p-3 border-t border-gray-200">
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      {['SKU', 'Size', 'Color', 'Quantity', 'Actions'].map(h => (
                                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {product.skuCodes.map((sku, idx) => (
                                      <tr key={idx}>
                                        <td className="px-3 py-2 text-sm text-gray-900">{sku.sku}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900">{sku.size}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900">{sku.color}</td>
                                        <td className="px-3 py-2 text-sm">
                                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            sku.quantity === 0 ? 'bg-red-100 text-red-800' : sku.quantity < 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                          }`}>{sku.quantity}</span>
                                        </td>
                                        <td className="px-3 py-2 text-sm">
                                          <button onClick={() => handleStockUpdateClick(brand, product, idx)}
                                            className="p-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200" title="Update Stock">
                                            <Edit size={14} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Color / Size summaries */}
                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(['color', 'size'] as const).map(dim => (
                                  <div key={dim}>
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">{dim.charAt(0).toUpperCase() + dim.slice(1)}-wise Quantity</h5>
                                    <div className="space-y-1">
                                      {Object.entries(
                                        product.skuCodes.reduce((acc: Record<string, number>, s) => {
                                          acc[s[dim]] = (acc[s[dim]] || 0) + s.quantity;
                                          return acc;
                                        }, {})
                                      ).map(([key, qty]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                          <span className="text-gray-600">{key}:</span>
                                          <span className={`font-medium ${(qty as number) === 0 ? 'text-red-600' : (qty as number) < 50 ? 'text-yellow-600' : 'text-green-600'}`}>{qty as number}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────── */}

      {/* Stock Update Modal */}
      {showStockModal && selectedStockItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Update Stock</h3>
              <button onClick={() => setShowStockModal(false)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <p><span className="text-gray-500">Brand:</span> <span className="font-medium">{selectedStockItem.brandName}</span></p>
              <p><span className="text-gray-500">Product:</span> <span className="font-medium">{selectedStockItem.productName}</span></p>
              <p><span className="text-gray-500">SKU:</span> <span className="font-medium">{selectedStockItem.sku}</span></p>
              <p><span className="text-gray-500">Variant:</span> <span className="font-medium">{selectedStockItem.size} / {selectedStockItem.color}</span></p>
              <p><span className="text-gray-500">Current Qty:</span> <span className="font-medium">{selectedStockItem.currentQuantity}</span></p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Type</label>
                <div className="flex space-x-4">
                  {([{ v: 'add', l: 'Add to existing' }, { v: 'set', l: 'Set new quantity' }] as const).map(o => (
                    <label key={o.v} className="flex items-center">
                      <input type="radio" name="stockType" value={o.v} checked={stockUpdateType === o.v}
                        onChange={() => setStockUpdateType(o.v)} className="mr-2" />
                      <span className="text-sm">{o.l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {stockUpdateType === 'add' ? 'Quantity to Add' : 'New Quantity'}
                </label>
                <input type="number" min="0" value={stockUpdateValue}
                  onChange={(e) => setStockUpdateValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {stockUpdateType === 'add' && stockUpdateValue && (
                  <p className="text-xs text-gray-500 mt-1">New total: {selectedStockItem.currentQuantity + parseInt(stockUpdateValue)}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowStockModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={processStockUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update Stock</button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Details Modal */}
      {showBrandModal && selectedBrandDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Brand Details</h3>
              <button onClick={() => setShowBrandModal(false)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm mb-4">
              <p><strong>Brand:</strong> {selectedBrandDetails.brandName}</p>
              <p><strong>Owner:</strong> {selectedBrandDetails.brandOwnerName}</p>
              <p><strong>ID:</strong> {selectedBrandDetails.userId}</p>
              <p><strong>Products:</strong> {selectedBrandDetails.products.length}</p>
              <p><strong>Total Stock:</strong> {selectedBrandDetails.products.reduce((s, p) => s + p.totalStock, 0)}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Product', 'Category', 'MRP', 'SP', 'Stock'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedBrandDetails.products.map(p => (
                    <tr key={p.id}>
                      <td className="px-3 py-2 text-sm">{p.name}</td>
                      <td className="px-3 py-2 text-sm">{p.category}</td>
                      <td className="px-3 py-2 text-sm">₹{p.mrp}</td>
                      <td className="px-3 py-2 text-sm">₹{p.sellingPrice}</td>
                      <td className="px-3 py-2 text-sm">{p.totalStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowBrandModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {showProductModal && selectedProductDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Product Details</h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm mb-4">
              <p><strong>Brand:</strong> {selectedProductDetails.brandName}</p>
              <p><strong>Owner:</strong> {selectedProductDetails.brandOwnerName}</p>
              <p><strong>Product:</strong> {selectedProductDetails.name}</p>
              <p><strong>Category:</strong> {selectedProductDetails.category} / {selectedProductDetails.subCategory}</p>
              <p><strong>MRP:</strong> ₹{selectedProductDetails.mrp}</p>
              <p><strong>Selling Price:</strong> ₹{selectedProductDetails.sellingPrice}</p>
              <p><strong>Total Stock:</strong> {selectedProductDetails.totalStock}</p>
            </div>
            {selectedProductDetails.skuCodes && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['SKU', 'Size', 'Color', 'Qty'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedProductDetails.skuCodes.map((sku: SkuCode, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-sm">{sku.sku}</td>
                        <td className="px-3 py-2 text-sm">{sku.size}</td>
                        <td className="px-3 py-2 text-sm">{sku.color}</td>
                        <td className="px-3 py-2 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            sku.quantity === 0 ? 'bg-red-100 text-red-800' : sku.quantity < 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>{sku.quantity}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowProductModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
