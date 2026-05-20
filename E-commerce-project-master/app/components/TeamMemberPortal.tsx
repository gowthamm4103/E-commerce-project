"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  X,
  Check,
  AlertCircle,
  CheckCircle,
  Package,
  LogOut,
  ArrowLeft,
  Eye,
  RefreshCw,
  Lock,
  User,
  Upload,
} from "lucide-react";
import { businessAPI } from "../lib/api";

interface TeamMemberPortalProps {
  onBack: () => void;
  brandName?: string;
}

interface TeamMemberData {
  _id: string;
  name: string;
  email: string;
  role: "standard_member" | "premium_member";
  ownerId: string;
  isActive: boolean;
}

interface ProductData {
  _id: string;
  name: string;
  brandName?: string;
  category?: string;
  subCategory?: string;
  mrp?: number;
  sellingPrice?: number;
  price?: number;
  stockQuantity?: number;
  description?: string;
  fullDescription?: string;
  shortDescription?: string;
  keyFeatures?: string;
  addedBy?: string;
  status?: string;
  images?: string[];
  sku?: string;
  hsnCode?: string;
  gstPercentage?: string;
  countryOfOrigin?: string;
  primaryFabric?: string;
  fitType?: string;
  weight?: string;
  packageDimensions?: string;
  warehouseLocation?: string;
  colors?: string;
  sizes?: string;
  skuCodes?: { size: string; color: string; sku: string }[];
  sizeChartImage?: string | null;
  sizeGuide?: string;
  fabricComposition?: string;
  fabricWeight?: string;
  fabricTransparency?: string;
  fabricProperties?: string;
  modelHeight?: string;
  modelWearingSize?: string;
  fitNote?: string;
  stylingTips?: string;
  washMethod?: string;
  washTemperature?: string;
  bleach?: string;
  dryMethod?: string;
  ironingDetails?: string;
  specialCare?: string;
  videoLink?: string;
  instagramLink?: string;
  deliveryAvailability?: string;
  codOption?: string;
  sellerAddress?: string;
  returnPolicy?: string;
  manufacturerDetails?: string;
  packerDetails?: string;
  [key: string]: any;
}

export default function TeamMemberPortal({ onBack, brandName }: TeamMemberPortalProps) {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [memberData, setMemberData] = useState<TeamMemberData | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Login form
  const [email, setEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Product management
  const [products, setProducts] = useState<ProductData[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [activeView, setActiveView] = useState<"list" | "add" | "edit" | "addaccessory">("list");
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Accessory form state
  const [newAccessory, setNewAccessory] = useState<{ [key: string]: any; images: string[] }>({
    name: "",
    brandName: "",
    category: "",
    subCategory: "",
    material: "",
    color: "",
    size: "",
    dimensions: "",
    weight: "",
    price: "",
    mrp: "",
    sellingPrice: "",
    stockQuantity: "",
    sku: "",
    hsnCode: "",
    shortDescription: "",
    fullDescription: "",
    keyFeatures: "",
    careInstructions: "",
    images: [] as string[],
    videoLink: "",
    instagramLink: "",
    packageDimensions: "",
    deliveryAvailability: "",
    codOption: "",
    sellerAddress: "",
    returnPolicy: "",
    gstPercentage: "",
    manufacturerDetails: "",
    countryOfOrigin: "",
    warranty: "",
    specialFeatures: "",
    colorInput: "",
    sizeInput: "",
    skuCodes: [] as any[],
    gender: "",
    occasion: "",
    finish: "",
    bagType: "",
    compartments: "",
    metalType: "",
    gemstoneType: "",
    plating: "",
    watchType: "",
    bandMaterial: "",
    waterResistance: "",
    adjustability: "",
    secondaryMaterial: "",
    packagingType: "",
    tags: "",
    warehouseLocation: "",
  });

  const getEmptyAccessoryForm = () => ({
    name: "",
    brandName: "",
    category: "",
    subCategory: "",
    material: "",
    color: "",
    size: "",
    dimensions: "",
    weight: "",
    price: "",
    mrp: "",
    sellingPrice: "",
    stockQuantity: "",
    sku: "",
    hsnCode: "",
    shortDescription: "",
    fullDescription: "",
    keyFeatures: "",
    careInstructions: "",
    images: [] as string[],
    videoLink: "",
    instagramLink: "",
    packageDimensions: "",
    deliveryAvailability: "",
    codOption: "",
    sellerAddress: "",
    returnPolicy: "",
    gstPercentage: "",
    manufacturerDetails: "",
    countryOfOrigin: "",
    warranty: "",
    specialFeatures: "",
    colorInput: "",
    sizeInput: "",
    skuCodes: [] as any[],
    gender: "",
    occasion: "",
    finish: "",
    bagType: "",
    compartments: "",
    metalType: "",
    gemstoneType: "",
    plating: "",
    watchType: "",
    bandMaterial: "",
    waterResistance: "",
    adjustability: "",
    secondaryMaterial: "",
    packagingType: "",
    tags: "",
    warehouseLocation: "",
  });

  // New product form — mirrors BrandOwnerDashboard productForm
  const [newProduct, setNewProduct] = useState<{ [key: string]: any; images: string[] }>({
    name: "",
    brandName: "",
    price: "",
    discountedPrice: "",
    offer: "",
    category: "",
    subCategory: "",
    stockQuantity: "",
    sku: "",
    hsnCode: "",
    fitType: "",
    type: "",
    sizes: "",
    colors: "",
    material: "",
    pattern: "",
    neckType: "",
    sleeveType: "",
    occasion: "",
    length: "",
    closureType: "",
    stretchability: "",
    shortDescription: "",
    fullDescription: "",
    keyFeatures: "",
    washMethod: "",
    ironingDetails: "",
    images: [] as string[],
    videoLink: "",
    instagramLink: "",
    packageDimensions: "",
    weight: "",
    deliveryAvailability: "",
    codOption: "",
    sellerAddress: "",
    returnPolicy: "",
    gstPercentage: "",
    manufacturerDetails: "",
    countryOfOrigin: "",
    credits: "",
    sellingPrice: "",
    primaryFabric: "",
    warehouseLocation: "",
    colorInput: "",
    sizeInput: "",
    skuCodes: [] as any[],
    sizeChartImage: null as string | null,
    sizeGuide: "",
    fabricComposition: "",
    fabricWeight: "",
    fabricTransparency: "",
    fabricProperties: "",
    modelHeight: "",
    modelWearingSize: "",
    fitNote: "",
    stylingTips: "",
    washTemperature: "",
    bleach: "",
    dryMethod: "",
    specialCare: "",
    packerDetails: "",
    gender: "",
    secondaryMaterial: "",
    finish: "",
    bagType: "",
    compartments: "",
    metalType: "",
    gemstoneType: "",
    plating: "",
    watchType: "",
    bandMaterial: "",
    waterResistance: "",
    dimensions: "",
    adjustability: "",
    description: "",
    authCertificate: null,
    warranty: "",
    storage: "",
    packageWeight: "",
    packagingType: "",
    tags: "",
    mrp: "",
    gstRate: 0,
    gstInclusivePrice: "",
  });

  const getEmptyProductForm = () => ({
    name: "",
    brandName: "",
    price: "",
    discountedPrice: "",
    offer: "",
    category: "",
    subCategory: "",
    stockQuantity: "",
    sku: "",
    hsnCode: "",
    fitType: "",
    type: "",
    sizes: "",
    colors: "",
    material: "",
    pattern: "",
    neckType: "",
    sleeveType: "",
    occasion: "",
    length: "",
    closureType: "",
    stretchability: "",
    shortDescription: "",
    fullDescription: "",
    keyFeatures: "",
    washMethod: "",
    ironingDetails: "",
    images: [] as string[],
    videoLink: "",
    instagramLink: "",
    packageDimensions: "",
    weight: "",
    deliveryAvailability: "",
    codOption: "",
    sellerAddress: "",
    returnPolicy: "",
    gstPercentage: "",
    manufacturerDetails: "",
    countryOfOrigin: "",
    credits: "",
    sellingPrice: "",
    primaryFabric: "",
    warehouseLocation: "",
    colorInput: "",
    sizeInput: "",
    skuCodes: [] as any[],
    sizeChartImage: null as string | null,
    sizeGuide: "",
    fabricComposition: "",
    fabricWeight: "",
    fabricTransparency: "",
    fabricProperties: "",
    modelHeight: "",
    modelWearingSize: "",
    fitNote: "",
    stylingTips: "",
    washTemperature: "",
    bleach: "",
    dryMethod: "",
    specialCare: "",
    packerDetails: "",
    gender: "",
    secondaryMaterial: "",
    finish: "",
    bagType: "",
    compartments: "",
    metalType: "",
    gemstoneType: "",
    plating: "",
    watchType: "",
    bandMaterial: "",
    waterResistance: "",
    dimensions: "",
    adjustability: "",
    description: "",
    authCertificate: null,
    warranty: "",
    storage: "",
    packageWeight: "",
    packagingType: "",
    tags: "",
    mrp: "",
    gstRate: 0,
    gstInclusivePrice: "",
  });

  const categorySubCategories: { [key: string]: string[] } = {
    "Men's Clothing": [
      "T-Shirts", "Casual Shirts", "Formal Shirts", "Sweatshirts", "Sweaters",
      "Jackets", "Blazers & Coats", "Suits", "Rain Jackets",
      "Kurtas & Kurta Sets", "Sherwanis", "Nehru Jackets", "Dhotis",
      "Jeans", "Casual Trousers", "Formal Trousers", "Shorts",
      "Track Pants & Joggers", "Briefs & Trunks", "Boxers", "Vests",
      "Sleepwear & Loungewear", "Thermals",
    ],
    "Women's Clothing": [
      "Kurtas & Suits", "Kurtis, Tunics & Tops", "Sarees",
      "Leggings, Salwars & Churidars", "Skirts & Palazzos", "Dress Materials",
      "Lehenga Cholis", "Dupattas & Shawls", "Jackets", "Dresses", "Tops",
      "Tshirts", "Jeans", "Trousers & Capris", "Shorts & Skirts", "Co-ords",
      "Playsuits", "Jumpsuits", "Shrugs", "Sweaters & Sweatshirts",
      "Jackets & Coats", "Blazers & Waistcoats",
    ],
    "Ethnic Wear": [
      "Ethnic Jackets", "Ethnic Suit Sets", "Kurtas", "Pyjamas & Churidars",
      "Sherwani Sets", "Stoles", "Co-ord Sets", "Dresses & Gowns",
      "Kurta Suit Sets", "Kurta-Bottom Set", "Kurtis & Tunics",
      "Lehenga Choli Sets", "Salwars & Churidars", "Sarees",
    ],
    "Western Wear": [
      "Jeans", "Shirts", "Shorts & 3/4ths", "Suit Sets", "Track Pants",
      "Tracksuits", "Trousers & Pants", "Tshirts", "Dresses",
      "Jeans & Jeggings", "Tops", "Trousers & Pants", "Tshirts",
      "Track Pants", "Shirts", "Leggings",
    ],
  };

  // Image upload helpers
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    const readers = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((images) => {
      setNewProduct({ ...newProduct, images: [...newProduct.images, ...images] });
    });
  };

  const removeProductImage = (index: number) => {
    setNewProduct({
      ...newProduct,
      images: newProduct.images.filter((_: string, i: number) => i !== index),
    });
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingProduct) return;
    const files: File[] = Array.from(e.target.files || []);
    const readers = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((images) => {
      setEditingProduct({
        ...editingProduct,
        images: [...(editingProduct.images || []), ...images],
      });
    });
  };

  const removeEditImage = (index: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      images: (editingProduct.images || []).filter((_: string, i: number) => i !== index),
    });
  };

  // Check for existing team member session
  useEffect(() => {
    const savedToken = localStorage.getItem("teamMemberToken");
    const savedMember = localStorage.getItem("teamMemberData");
    if (savedToken && savedMember) {
      try {
        const parsed = JSON.parse(savedMember);
        setToken(savedToken);
        setMemberData(parsed);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem("teamMemberToken");
        localStorage.removeItem("teamMemberData");
      }
    }
  }, []);

  // Load products when logged in
  useEffect(() => {
    if (isLoggedIn && token) {
      loadProducts();
    }
  }, [isLoggedIn, token]);

  const handleLogin = async () => {
    if (!email) {
      setLoginError("Email is required.");
      return;
    }
    try {
      setLoginLoading(true);
      setLoginError(null);

      // Temporarily set the token header for this request
      const originalToken = localStorage.getItem("token");

      const res = await businessAPI.teamMemberLogin({ email });

      if (res.success) {
        // Store team member session separately
        localStorage.setItem("teamMemberToken", res.token);
        localStorage.setItem("teamMemberData", JSON.stringify(res.member));

        // Restore original user token so brand owner session isn't affected
        if (originalToken) {
          localStorage.setItem("token", originalToken);
        }

        setToken(res.token);
        setMemberData(res.member);
        setIsLoggedIn(true);
      }
    } catch (err: any) {
      setLoginError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teamMemberToken");
    localStorage.removeItem("teamMemberData");
    setIsLoggedIn(false);
    setMemberData(null);
    setToken(null);
    setProducts([]);
    setEmail("");
  };

  const loadProducts = async () => {
    if (!token) return;
    try {
      setProductsLoading(true);
      // Temporarily swap token for team member token
      const originalToken = localStorage.getItem("token");
      localStorage.setItem("token", token);

      const res = await businessAPI.teamMemberGetProducts();

      // Restore original token
      if (originalToken) {
        localStorage.setItem("token", originalToken);
      } else {
        localStorage.removeItem("token");
      }

      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to load products.");
    } finally {
      setProductsLoading(false);
    }
  };

  // Accessory image upload helpers
  const handleAccessoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    const readers = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((images) => {
      setNewAccessory({ ...newAccessory, images: [...newAccessory.images, ...images] });
    });
  };

  const removeAccessoryImage = (index: number) => {
    setNewAccessory({
      ...newAccessory,
      images: newAccessory.images.filter((_: string, i: number) => i !== index),
    });
  };

  const handleAddAccessory = async () => {
    if (!newAccessory.name) {
      setErrorMessage("Accessory name is required.");
      return;
    }
    try {
      setProductsLoading(true);
      setErrorMessage(null);

      const originalToken = localStorage.getItem("token");
      localStorage.setItem("token", token!);

      const { colorInput, sizeInput, ...accessoryData } = newAccessory;
      const res = await businessAPI.teamMemberAddProduct({
        ...accessoryData,
        category: 'accessories',
        mrp: parseFloat(newAccessory.mrp) || 0,
        sellingPrice: parseFloat(newAccessory.sellingPrice) || 0,
        price: parseFloat(newAccessory.price) || 0,
        stockQuantity: parseInt(newAccessory.stockQuantity) || 0,
      });

      if (originalToken) {
        localStorage.setItem("token", originalToken);
      } else {
        localStorage.removeItem("token");
      }

      if (res.success) {
        setSuccessMessage("Accessory creation request submitted for admin approval!");
        setNewAccessory(getEmptyAccessoryForm());
        setActiveView("list");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit accessory.");
    } finally {
      setProductsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name) {
      setErrorMessage("Product name is required.");
      return;
    }
    try {
      setProductsLoading(true);
      setErrorMessage(null);

      const originalToken = localStorage.getItem("token");
      localStorage.setItem("token", token!);

      // Send all form fields (backend passes entire req.body to ChangeRequest payload)
      const { colorInput, sizeInput, ...productData } = newProduct;
      const res = await businessAPI.teamMemberAddProduct({
        ...productData,
        mrp: parseFloat(newProduct.mrp) || 0,
        sellingPrice: parseFloat(newProduct.sellingPrice) || 0,
        price: parseFloat(newProduct.mrp) || 0,
        stockQuantity: parseInt(newProduct.stockQuantity) || 0,
      });

      if (originalToken) {
        localStorage.setItem("token", originalToken);
      } else {
        localStorage.removeItem("token");
      }

      if (res.success) {
        setSuccessMessage("Product creation request submitted for admin approval!");
        setNewProduct(getEmptyProductForm());
        setActiveView("list");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit product.");
    } finally {
      setProductsLoading(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;
    try {
      setProductsLoading(true);
      setErrorMessage(null);

      const originalToken = localStorage.getItem("token");
      localStorage.setItem("token", token!);

      // Send all product fields
      const { _id, addedBy, status, ...editData } = editingProduct;
      const res = await businessAPI.teamMemberEditProduct(editingProduct._id, editData);

      if (originalToken) {
        localStorage.setItem("token", originalToken);
      } else {
        localStorage.removeItem("token");
      }

      if (res.success) {
        setSuccessMessage("Product update request submitted for admin approval!");
        setEditingProduct(null);
        setActiveView("list");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit product update.");
    } finally {
      setProductsLoading(false);
    }
  };

  const canEditProduct = (product: ProductData): boolean => {
    if (!memberData) return false;
    if (memberData.role === "premium_member") return true;
    // standard_member can only edit their own
    return product.addedBy === memberData.email;
  };

  const getRoleBadge = () => {
    if (!memberData) return null;
    const isPremium = memberData.role === "premium_member";
    return (
      <span
        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
          isPremium
            ? "bg-purple-100 text-purple-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {isPremium ? "Premium Member" : "Standard Member"}
      </span>
    );
  };

  // ═══════════════════════════════════════════
  //  LOGIN SCREEN
  // ═══════════════════════════════════════════
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              {brandName ? (
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{brandName}</h2>
              ) : (
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <User size={28} className="text-gray-600" />
                </div>
              )}
              {/*<h2 className="text-2xl font-bold text-gray-900">Team Member Login</h2>*/}
              <p className="text-gray-600 text-medium mt-3">Welcome to Team Member Portal</p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm">{loginError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Email ID
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Enter your email ID"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 rounded-lg hover:from-gray-800 hover:to-black font-medium disabled:opacity-50 transition transform hover:scale-105"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} className="animate-spin" /> Logging in...
                  </span>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            <p className="text-gray-500 text-center text-medium mt-4">
              Enter the email address shared by your brand owner
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  PRODUCT MANAGEMENT DASHBOARD
  // ═══════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white shadow-xs">
        <div className="max-w-8xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900">
                  {memberData?.name || "Team Member"}
                </h1>
                {getRoleBadge()}
              </div>
              <p className="text-xs text-gray-500">
                {memberData?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              <span className="text-green-800 text-sm">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">
              <X size={16} />
            </button>
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-red-600" />
              <span className="text-red-800 text-sm">{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-600 hover:text-red-800">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Role info banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            {memberData?.role === "premium_member" ? (
              <span>
                As a <strong>Premium Member</strong>, you have permission to add new products and accessories, as well as edit <strong>all</strong> products and accessories within the brand.
                However, only the brand owner can delete products.
              </span>
            ) : (
              <span>
                As a <strong>Standard Member</strong>, you can add new products and accessories, and edit <strong>only the products and accessories created by you</strong>.
                However, product deletion is restricted to the brand owner only.
              </span>
            )}
            <span className="block text-xs text-blue-600 mt-1">
              All product and accessory changes require admin approval before going live on the platform.
            </span>
          </div>
        </div>

        {/* View switcher */}
        {activeView === "list" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Products</h2>
              <div className="flex gap-2">
                <button
                  onClick={loadProducts}
                  disabled={productsLoading}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                >
                  <RefreshCw size={14} className={productsLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setActiveView("add");
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Product
                </button>
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setNewAccessory(getEmptyAccessoryForm());
                    setActiveView("addaccessory");
                  }}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Accessory
                </button>
              </div>
            </div>

            {productsLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="animate-spin mx-auto h-8 w-8 text-blue-600 mb-3" />
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Products Yet</h3>
                <p className="text-gray-500 mb-4">Start adding products for the brand.</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setActiveView("add")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add First Product
                  </button>
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setNewAccessory(getEmptyAccessoryForm());
                      setActiveView("addaccessory");
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add First Accessory
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          MRP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Selling Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Added By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {product.category || "—"}
                            {product.subCategory ? ` / ${product.subCategory}` : ""}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            ₹{product.mrp || product.price || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            ₹{product.sellingPrice || product.price || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {product.stockQuantity || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {product.addedBy ? (
                              <span className="font-mono text-xs">{product.addedBy}</span>
                            ) : (
                              <span className="text-gray-400">Brand Owner</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {canEditProduct(product) ? (
                              <button
                                onClick={() => {
                                  setEditingProduct({ ...product });
                                  setErrorMessage(null);
                                  setSuccessMessage(null);
                                  setActiveView("edit");
                                }}
                                className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-400 text-xs">
                                <Eye size={14} />
                                View Only
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Add Product Form */}
        {activeView === "add" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Fashion Product</h2>
              <button
                onClick={() => { setNewProduct(getEmptyProductForm()); setActiveView("list"); }}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <X size={16} className="mr-1" /> Cancel
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddProduct(); }} className="space-y-6">
              {/* ───── Basic Product Information ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Basic Product Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter product name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
                    <input type="text" value={newProduct.brandName} onChange={(e) => setNewProduct({ ...newProduct, brandName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter brand name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value, subCategory: "" })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Category</option>
                      {Object.keys(categorySubCategories).map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Category *</label>
                    <select value={newProduct.subCategory} onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Sub-Category</option>
                      {categorySubCategories[newProduct.category]?.map((sub: string) => (<option key={sub} value={sub}>{sub}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product MRP (₹) *</label>
                    <input type="number" value={newProduct.mrp} onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter MRP" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹) *</label>
                    <input type="number" value={newProduct.sellingPrice} onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter Selling Price" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Inclusive Price (₹) *</label>
                    <input type="text" value={newProduct.sellingPrice || newProduct.mrp || "0.00"} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed" placeholder="Auto-calculated" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%) *</label>
                    <select value={newProduct.gstPercentage} onChange={(e) => setNewProduct({ ...newProduct, gstPercentage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select GST</option>
                      <option value="0%">0%</option>
                      <option value="5%">5%</option>
                      <option value="12%">12%</option>
                      <option value="18%">18%</option>
                      <option value="28%">28%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code *</label>
                    <input type="text" value={newProduct.hsnCode} onChange={(e) => setNewProduct({ ...newProduct, hsnCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Auto-generated based on norms" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country of Origin *</label>
                    <input type="text" value={newProduct.countryOfOrigin} onChange={(e) => setNewProduct({ ...newProduct, countryOfOrigin: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., India" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material / Fabric *</label>
                    <select value={newProduct.primaryFabric || ""} onChange={(e) => setNewProduct({ ...newProduct, primaryFabric: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Fabric</option>
                      {["Cotton","Silk","Linen","Wool","Polyester","Rayon","Nylon","Viscose","Acrylic","Spandex","Denim","Velvet","Chiffon","Georgette","Satin","Crepe"].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fit / Pattern *</label>
                    <select value={newProduct.fitType} onChange={(e) => setNewProduct({ ...newProduct, fitType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Fit</option>
                      {["Regular Fit","Slim Fit","Oversized","Skinny Fit","Relaxed Fit","Loose Fit"].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input type="number" value={newProduct.stockQuantity} onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter total stock" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (grams/kg) *</label>
                    <input type="text" value={newProduct.weight} onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 500g" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (L×W×H) *</label>
                    <input type="text" value={newProduct.packageDimensions} onChange={(e) => setNewProduct({ ...newProduct, packageDimensions: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 30x20x5 cm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse / Pickup Location *</label>
                    <textarea value={newProduct.warehouseLocation} onChange={(e) => setNewProduct({ ...newProduct, warehouseLocation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter warehouse location" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Description *</label>
                    <textarea value={newProduct.fullDescription} onChange={(e) => setNewProduct({ ...newProduct, fullDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} placeholder="Detailed product description" required />
                  </div>
                </div>
              </div>

              {/* ───── Color and Size Availability ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Color and Size Availability *</h4>
                <div className="space-y-4">
                  {/* Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input type="text" value={newProduct.colorInput || ""} onChange={(e) => setNewProduct({ ...newProduct, colorInput: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter color name" />
                      <button type="button" onClick={() => {
                        if (newProduct.colorInput && newProduct.colorInput.trim()) {
                          const colors = newProduct.colors ? newProduct.colors.split(", ") : [];
                          if (!colors.includes(newProduct.colorInput.trim())) {
                            setNewProduct({ ...newProduct, colors: [...colors, newProduct.colorInput.trim()].join(", "), colorInput: "" });
                          }
                        }
                      }} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(newProduct.colors ? newProduct.colors.split(", ") : []).map((color: string, index: number) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                          <span className="text-sm">{color}</span>
                          <button type="button" onClick={() => { const colors = newProduct.colors.split(", "); colors.splice(index, 1); setNewProduct({ ...newProduct, colors: colors.join(", ") }); }} className="ml-2 text-red-500 hover:text-red-700"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Sizes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input type="text" value={newProduct.sizeInput || ""} onChange={(e) => setNewProduct({ ...newProduct, sizeInput: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter size (e.g., S, M, L)" />
                      <button type="button" onClick={() => {
                        if (newProduct.sizeInput && newProduct.sizeInput.trim()) {
                          const sizes = newProduct.sizes ? newProduct.sizes.split(", ") : [];
                          if (!sizes.includes(newProduct.sizeInput.trim())) {
                            setNewProduct({ ...newProduct, sizes: [...sizes, newProduct.sizeInput.trim()].join(", "), sizeInput: "" });
                          }
                        }
                      }} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(newProduct.sizes ? newProduct.sizes.split(", ") : []).map((size: string, index: number) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                          <span className="text-sm">{size}</span>
                          <button type="button" onClick={() => { const sizes = newProduct.sizes.split(", "); sizes.splice(index, 1); setNewProduct({ ...newProduct, sizes: sizes.join(", ") }); }} className="ml-2 text-red-500 hover:text-red-700"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* SKU Code Generation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU Codes *</label>
                    <button type="button" onClick={() => {
                      if (newProduct.sizes && newProduct.colors) {
                        const sizes = newProduct.sizes.split(", ");
                        const colors = newProduct.colors.split(", ");
                        const brandPrefix = newProduct.brandName ? newProduct.brandName.substring(0, 3).toUpperCase() : "BRD";
                        const categoryPrefix = newProduct.subCategory ? newProduct.subCategory.substring(0, 3).toUpperCase() : "CAT";
                        const skuCodes: { size: string; color: string; sku: string }[] = [];
                        sizes.forEach((size: string) => {
                          colors.forEach((color: string) => {
                            const colorCode = color.substring(0, 3).toUpperCase();
                            const sizeCode = size.toUpperCase();
                            skuCodes.push({ size, color, sku: `${brandPrefix}-${categoryPrefix}-${colorCode}-${sizeCode}` });
                          });
                        });
                        setNewProduct({ ...newProduct, skuCodes });
                      }
                    }} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mb-3">Generate SKU Codes</button>
                    {newProduct.skuCodes && newProduct.skuCodes.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50"><tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU Code</th>
                          </tr></thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {newProduct.skuCodes.map((sku: any, index: number) => (
                              <tr key={index}>
                                <td className="px-6 py-4 text-sm text-gray-900">{sku.size}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{sku.color}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{sku.sku}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ───── Size Chart ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Size Availability *</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size Chart Image</label>
                    <div className="flex items-center space-x-4 mb-2">
                      <input type="file" id="tm-size-chart" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setNewProduct({ ...newProduct, sizeChartImage: reader.result as string }); reader.readAsDataURL(file); } }} className="hidden" />
                      <label htmlFor="tm-size-chart" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer flex items-center"><Upload size={16} className="mr-2" />Upload Size Chart</label>
                    </div>
                    {newProduct.sizeChartImage && (
                      <div className="mt-2">
                        <img src={newProduct.sizeChartImage} alt="Size Chart" className="w-64 h-auto object-cover rounded border" />
                        <button type="button" onClick={() => setNewProduct({ ...newProduct, sizeChartImage: null })} className="mt-2 text-red-500 hover:text-red-700">Remove Size Chart</button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size Guide Text</label>
                    <textarea value={newProduct.sizeGuide || ""} onChange={(e) => setNewProduct({ ...newProduct, sizeGuide: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Enter size guide information" />
                  </div>
                </div>
              </div>

              {/* ───── Fabric Details ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Fabric Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Composition</label>
                    <input type="text" value={newProduct.fabricComposition || ""} onChange={(e) => setNewProduct({ ...newProduct, fabricComposition: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 80% Cotton, 20% Polyester" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Weight</label>
                    <input type="text" value={newProduct.fabricWeight || ""} onChange={(e) => setNewProduct({ ...newProduct, fabricWeight: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Light, Medium, Heavy" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Transparency</label>
                    <select value={newProduct.fabricTransparency || ""} onChange={(e) => setNewProduct({ ...newProduct, fabricTransparency: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Transparency</option>
                      <option value="Opaque">Opaque</option>
                      <option value="Semi-Transparent">Semi-Transparent</option>
                      <option value="Transparent">Transparent</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Properties</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {["Breathable","Water Resistant","UV Protection","Wrinkle Free","Quick Dry","Anti-Pilling","Hypoallergenic","Eco-Friendly"].map((property) => (
                        <label key={property} className="flex items-center">
                          <input type="checkbox" checked={newProduct.fabricProperties ? newProduct.fabricProperties.includes(property) : false} onChange={(e) => {
                            const properties = newProduct.fabricProperties ? newProduct.fabricProperties.split(", ") : [];
                            if (e.target.checked) { properties.push(property); } else { const idx = properties.indexOf(property); if (idx > -1) properties.splice(idx, 1); }
                            setNewProduct({ ...newProduct, fabricProperties: properties.join(", ") });
                          }} className="mr-2" />
                          <span className="text-sm">{property}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ───── Model Information ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Model Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Height</label>
                    <input type="text" value={newProduct.modelHeight || ""} onChange={(e) => setNewProduct({ ...newProduct, modelHeight: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={`e.g., 5'7" (170 cm)`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Wearing Size</label>
                    <input type="text" value={newProduct.modelWearingSize || ""} onChange={(e) => setNewProduct({ ...newProduct, modelWearingSize: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., M, L, 38" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fit Note</label>
                    <textarea value={newProduct.fitNote || ""} onChange={(e) => setNewProduct({ ...newProduct, fitNote: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Any special notes about the fit of the garment" />
                  </div>
                </div>
              </div>

              {/* ───── Descriptions ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Descriptions</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                    <textarea value={newProduct.shortDescription} onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Brief product description" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Key Features / Highlights</label>
                    <textarea value={newProduct.keyFeatures} onChange={(e) => setNewProduct({ ...newProduct, keyFeatures: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="List key features of product" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Styling Tips</label>
                    <textarea value={newProduct.stylingTips || ""} onChange={(e) => setNewProduct({ ...newProduct, stylingTips: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Provide styling tips for this product" />
                  </div>
                </div>
              </div>

              {/* ───── Care Instructions ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Care Instructions *</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wash Method</label>
                    <select value={newProduct.washMethod} onChange={(e) => setNewProduct({ ...newProduct, washMethod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Wash Method</option>
                      <option value="Machine Wash">Machine Wash</option>
                      <option value="Hand Wash">Hand Wash</option>
                      <option value="Dry Clean Only">Dry Clean Only</option>
                      <option value="Do Not Wash">Do Not Wash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wash Temperature</label>
                    <select value={newProduct.washTemperature || ""} onChange={(e) => setNewProduct({ ...newProduct, washTemperature: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Temperature</option>
                      <option value="Cold Water">Cold Water</option>
                      <option value="Warm Water">Warm Water</option>
                      <option value="Hot Water">Hot Water</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bleach</label>
                    <select value={newProduct.bleach || ""} onChange={(e) => setNewProduct({ ...newProduct, bleach: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Option</option>
                      <option value="Do Not Bleach">Do Not Bleach</option>
                      <option value="Non-Chlorine Bleach">Non-Chlorine Bleach</option>
                      <option value="Chlorine Bleach">Chlorine Bleach</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dry Method</label>
                    <select value={newProduct.dryMethod || ""} onChange={(e) => setNewProduct({ ...newProduct, dryMethod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Dry Method</option>
                      <option value="Tumble Dry Low">Tumble Dry Low</option>
                      <option value="Tumble Dry Medium">Tumble Dry Medium</option>
                      <option value="Tumble Dry High">Tumble Dry High</option>
                      <option value="Do Not Tumble Dry">Do Not Tumble Dry</option>
                      <option value="Line Dry">Line Dry</option>
                      <option value="Drip Dry">Drip Dry</option>
                      <option value="Flat Dry">Flat Dry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ironing Details</label>
                    <select value={newProduct.ironingDetails} onChange={(e) => setNewProduct({ ...newProduct, ironingDetails: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Ironing Option</option>
                      <option value="Do Not Iron">Do Not Iron</option>
                      <option value="Iron Low Heat">Iron Low Heat</option>
                      <option value="Iron Medium Heat">Iron Medium Heat</option>
                      <option value="Iron High Heat">Iron High Heat</option>
                      <option value="Steam Iron">Steam Iron</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Care</label>
                    <input type="text" value={newProduct.specialCare || ""} onChange={(e) => setNewProduct({ ...newProduct, specialCare: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Any special care instructions" />
                  </div>
                </div>
              </div>

              {/* ───── Media ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Media</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>
                    <p className="text-xs text-gray-500 mb-2">Min 3–5 images (Front, back, sides, close-up details, fabric texture)</p>
                    <div className="flex items-center space-x-4 mb-2">
                      <input type="file" id="tm-product-images" accept="image/*" multiple onChange={handleProductImageUpload} className="hidden" />
                      <label htmlFor="tm-product-images" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer flex items-center"><Upload size={16} className="mr-2" />Upload Images</label>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {newProduct.images.map((image: string, idx: number) => (
                        <div key={idx} className="relative">
                          <img src={image} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover rounded border" />
                          <button type="button" onClick={() => removeProductImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Video Link</label>
                    <input type="url" value={newProduct.videoLink} onChange={(e) => setNewProduct({ ...newProduct, videoLink: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/video" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Video Link</label>
                    <input type="url" value={newProduct.instagramLink} onChange={(e) => setNewProduct({ ...newProduct, instagramLink: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://instagram.com/..." />
                  </div>
                </div>
              </div>

              {/* ───── Logistics ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Logistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Availability</label>
                    <select value={newProduct.deliveryAvailability} onChange={(e) => setNewProduct({ ...newProduct, deliveryAvailability: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Option</option>
                      <option value="Pan India">Pan India</option>
                      <option value="Metro Cities">Metro Cities</option>
                      <option value="Select Cities">Select Cities</option>
                      <option value="International">International</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">COD Option</label>
                    <select value={newProduct.codOption} onChange={(e) => setNewProduct({ ...newProduct, codOption: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Option</option>
                      <option value="Available">Available</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seller Address</label>
                    <textarea value={newProduct.sellerAddress} onChange={(e) => setNewProduct({ ...newProduct, sellerAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Enter seller address" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy</label>
                    <textarea value={newProduct.returnPolicy} onChange={(e) => setNewProduct({ ...newProduct, returnPolicy: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Enter return policy details" />
                  </div>
                </div>
              </div>

              {/* ───── Compliance ───── */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Compliance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer Details *</label>
                    <textarea value={newProduct.manufacturerDetails} onChange={(e) => setNewProduct({ ...newProduct, manufacturerDetails: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Enter manufacturer or importer details" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Packer Details *</label>
                    <textarea value={newProduct.packerDetails} onChange={(e) => setNewProduct({ ...newProduct, packerDetails: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Enter packer details" required />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setNewProduct(getEmptyProductForm()); setActiveView("list"); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={productsLoading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{productsLoading ? "Submitting..." : "Submit for Approval"}</button>
              </div>
              <p className="text-xs text-gray-400 text-center">This product will be submitted for admin approval before it appears on the platform.</p>
            </form>
          </div>
        )}

        {/* Edit Product Form */}
        {activeView === "edit" && editingProduct && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Fashion Product</h2>
              <button onClick={() => { setEditingProduct(null); setActiveView("list"); }} className="flex items-center gap-1 text-gray-600 hover:text-gray-900"><X size={16} className="mr-1" /> Cancel</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleEditProduct(); }} className="space-y-6">
              {/* ───── Basic Product Information ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Basic Product Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input type="text" value={editingProduct.name || ""} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
                    <input type="text" value={editingProduct.brandName || ""} onChange={(e) => setEditingProduct({ ...editingProduct, brandName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select value={editingProduct.category || ""} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value, subCategory: "" })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Category</option>
                      {Object.keys(categorySubCategories).map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Category *</label>
                    <select value={editingProduct.subCategory || ""} onChange={(e) => setEditingProduct({ ...editingProduct, subCategory: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Sub-Category</option>
                      {categorySubCategories[editingProduct.category || ""]?.map((sub: string) => (<option key={sub} value={sub}>{sub}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product MRP (₹) *</label>
                    <input type="number" value={editingProduct.mrp || ""} onChange={(e) => setEditingProduct({ ...editingProduct, mrp: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹) *</label>
                    <input type="number" value={editingProduct.sellingPrice || ""} onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%) *</label>
                    <select value={editingProduct.gstPercentage || ""} onChange={(e) => setEditingProduct({ ...editingProduct, gstPercentage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select GST</option>
                      <option value="0%">0%</option>
                      <option value="5%">5%</option>
                      <option value="12%">12%</option>
                      <option value="18%">18%</option>
                      <option value="28%">28%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code *</label>
                    <input type="text" value={editingProduct.hsnCode || ""} onChange={(e) => setEditingProduct({ ...editingProduct, hsnCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country of Origin *</label>
                    <input type="text" value={editingProduct.countryOfOrigin || ""} onChange={(e) => setEditingProduct({ ...editingProduct, countryOfOrigin: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material / Fabric *</label>
                    <select value={editingProduct.primaryFabric || ""} onChange={(e) => setEditingProduct({ ...editingProduct, primaryFabric: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Fabric</option>
                      {["Cotton","Silk","Linen","Wool","Polyester","Rayon","Nylon","Viscose","Acrylic","Spandex","Denim","Velvet","Chiffon","Georgette","Satin","Crepe"].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fit / Pattern *</label>
                    <select value={editingProduct.fitType || ""} onChange={(e) => setEditingProduct({ ...editingProduct, fitType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Fit</option>
                      {["Regular Fit","Slim Fit","Oversized","Skinny Fit","Relaxed Fit","Loose Fit"].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input type="number" value={editingProduct.stockQuantity || ""} onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (grams/kg) *</label>
                    <input type="text" value={editingProduct.weight || ""} onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (L×W×H) *</label>
                    <input type="text" value={editingProduct.packageDimensions || ""} onChange={(e) => setEditingProduct({ ...editingProduct, packageDimensions: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse / Pickup Location *</label>
                    <textarea value={editingProduct.warehouseLocation || ""} onChange={(e) => setEditingProduct({ ...editingProduct, warehouseLocation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Description *</label>
                    <textarea value={editingProduct.fullDescription || ""} onChange={(e) => setEditingProduct({ ...editingProduct, fullDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} required />
                  </div>
                </div>
              </div>

              {/* ───── Color and Size Availability ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Color and Size Availability *</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input type="text" value={editingProduct.colorInput || ""} onChange={(e) => setEditingProduct({ ...editingProduct, colorInput: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter color name" />
                      <button type="button" onClick={() => {
                        if (editingProduct.colorInput && editingProduct.colorInput.trim()) {
                          const colors = editingProduct.colors ? editingProduct.colors.split(", ") : [];
                          if (!colors.includes(editingProduct.colorInput.trim())) {
                            setEditingProduct({ ...editingProduct, colors: [...colors, editingProduct.colorInput.trim()].join(", "), colorInput: "" });
                          }
                        }
                      }} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(editingProduct.colors ? editingProduct.colors.split(", ") : []).map((color: string, index: number) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                          <span className="text-sm">{color}</span>
                          <button type="button" onClick={() => { const colors = editingProduct.colors.split(", "); colors.splice(index, 1); setEditingProduct({ ...editingProduct, colors: colors.join(", ") }); }} className="ml-2 text-red-500 hover:text-red-700"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input type="text" value={editingProduct.sizeInput || ""} onChange={(e) => setEditingProduct({ ...editingProduct, sizeInput: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter size (e.g., S, M, L)" />
                      <button type="button" onClick={() => {
                        if (editingProduct.sizeInput && editingProduct.sizeInput.trim()) {
                          const sizes = editingProduct.sizes ? editingProduct.sizes.split(", ") : [];
                          if (!sizes.includes(editingProduct.sizeInput.trim())) {
                            setEditingProduct({ ...editingProduct, sizes: [...sizes, editingProduct.sizeInput.trim()].join(", "), sizeInput: "" });
                          }
                        }
                      }} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(editingProduct.sizes ? editingProduct.sizes.split(", ") : []).map((size: string, index: number) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                          <span className="text-sm">{size}</span>
                          <button type="button" onClick={() => { const sizes = editingProduct.sizes.split(", "); sizes.splice(index, 1); setEditingProduct({ ...editingProduct, sizes: sizes.join(", ") }); }} className="ml-2 text-red-500 hover:text-red-700"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU Codes *</label>
                    <button type="button" onClick={() => {
                      if (editingProduct.sizes && editingProduct.colors) {
                        const sizes = (editingProduct.sizes || "").split(", ").filter(Boolean);
                        const colors = (editingProduct.colors || "").split(", ").filter(Boolean);
                        const brandPrefix = editingProduct.brandName ? editingProduct.brandName.substring(0, 3).toUpperCase() : "BRD";
                        const categoryPrefix = editingProduct.subCategory ? editingProduct.subCategory.substring(0, 3).toUpperCase() : "CAT";
                        const skuCodes: { size: string; color: string; sku: string }[] = [];
                        sizes.forEach((size: string) => { colors.forEach((color: string) => {
                          skuCodes.push({ size, color, sku: `${brandPrefix}-${categoryPrefix}-${color.substring(0,3).toUpperCase()}-${size.toUpperCase()}` });
                        }); });
                        setEditingProduct({ ...editingProduct, skuCodes });
                      }
                    }} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mb-3">Generate SKU Codes</button>
                    {editingProduct.skuCodes && editingProduct.skuCodes.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50"><tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU Code</th>
                          </tr></thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {editingProduct.skuCodes.map((sku: any, index: number) => (
                              <tr key={index}>
                                <td className="px-6 py-4 text-sm text-gray-900">{sku.size}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{sku.color}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{sku.sku}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ───── Size Chart ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Size Availability *</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size Chart Image</label>
                    <div className="flex items-center space-x-4 mb-2">
                      <input type="file" id="tm-edit-size-chart" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setEditingProduct({ ...editingProduct, sizeChartImage: reader.result as string }); reader.readAsDataURL(file); } }} className="hidden" />
                      <label htmlFor="tm-edit-size-chart" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer flex items-center"><Upload size={16} className="mr-2" />Upload Size Chart</label>
                    </div>
                    {editingProduct.sizeChartImage && (
                      <div className="mt-2">
                        <img src={editingProduct.sizeChartImage} alt="Size Chart" className="w-64 h-auto object-cover rounded border" />
                        <button type="button" onClick={() => setEditingProduct({ ...editingProduct, sizeChartImage: null })} className="mt-2 text-red-500 hover:text-red-700">Remove Size Chart</button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size Guide Text</label>
                    <textarea value={editingProduct.sizeGuide || ""} onChange={(e) => setEditingProduct({ ...editingProduct, sizeGuide: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                  </div>
                </div>
              </div>

              {/* ───── Fabric Details ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Fabric Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Composition</label>
                    <input type="text" value={editingProduct.fabricComposition || ""} onChange={(e) => setEditingProduct({ ...editingProduct, fabricComposition: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 80% Cotton, 20% Polyester" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Weight</label>
                    <input type="text" value={editingProduct.fabricWeight || ""} onChange={(e) => setEditingProduct({ ...editingProduct, fabricWeight: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Light, Medium, Heavy" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Transparency</label>
                    <select value={editingProduct.fabricTransparency || ""} onChange={(e) => setEditingProduct({ ...editingProduct, fabricTransparency: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Transparency</option>
                      <option value="Opaque">Opaque</option>
                      <option value="Semi-Transparent">Semi-Transparent</option>
                      <option value="Transparent">Transparent</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Properties</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {["Breathable","Water Resistant","UV Protection","Wrinkle Free","Quick Dry","Anti-Pilling","Hypoallergenic","Eco-Friendly"].map((property) => (
                        <label key={property} className="flex items-center">
                          <input type="checkbox" checked={editingProduct.fabricProperties ? editingProduct.fabricProperties.includes(property) : false} onChange={(e) => {
                            const properties = editingProduct.fabricProperties ? editingProduct.fabricProperties.split(", ") : [];
                            if (e.target.checked) { properties.push(property); } else { const idx = properties.indexOf(property); if (idx > -1) properties.splice(idx, 1); }
                            setEditingProduct({ ...editingProduct, fabricProperties: properties.join(", ") });
                          }} className="mr-2" />
                          <span className="text-sm">{property}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ───── Model Information ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Model Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Height</label>
                    <input type="text" value={editingProduct.modelHeight || ""} onChange={(e) => setEditingProduct({ ...editingProduct, modelHeight: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={`e.g., 5'7" (170 cm)`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Wearing Size</label>
                    <input type="text" value={editingProduct.modelWearingSize || ""} onChange={(e) => setEditingProduct({ ...editingProduct, modelWearingSize: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., M, L, 38" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fit Note</label>
                    <textarea value={editingProduct.fitNote || ""} onChange={(e) => setEditingProduct({ ...editingProduct, fitNote: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                  </div>
                </div>
              </div>

              {/* ───── Descriptions ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Descriptions</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                    <textarea value={editingProduct.shortDescription || ""} onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Key Features / Highlights</label>
                    <textarea value={editingProduct.keyFeatures || ""} onChange={(e) => setEditingProduct({ ...editingProduct, keyFeatures: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Styling Tips</label>
                    <textarea value={editingProduct.stylingTips || ""} onChange={(e) => setEditingProduct({ ...editingProduct, stylingTips: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                  </div>
                </div>
              </div>

              {/* ───── Care Instructions ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Care Instructions *</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wash Method</label>
                    <select value={editingProduct.washMethod || ""} onChange={(e) => setEditingProduct({ ...editingProduct, washMethod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Wash Method</option>
                      <option value="Machine Wash">Machine Wash</option>
                      <option value="Hand Wash">Hand Wash</option>
                      <option value="Dry Clean Only">Dry Clean Only</option>
                      <option value="Do Not Wash">Do Not Wash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wash Temperature</label>
                    <select value={editingProduct.washTemperature || ""} onChange={(e) => setEditingProduct({ ...editingProduct, washTemperature: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Temperature</option>
                      <option value="Cold Water">Cold Water</option>
                      <option value="Warm Water">Warm Water</option>
                      <option value="Hot Water">Hot Water</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bleach</label>
                    <select value={editingProduct.bleach || ""} onChange={(e) => setEditingProduct({ ...editingProduct, bleach: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Option</option>
                      <option value="Do Not Bleach">Do Not Bleach</option>
                      <option value="Non-Chlorine Bleach">Non-Chlorine Bleach</option>
                      <option value="Chlorine Bleach">Chlorine Bleach</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dry Method</label>
                    <select value={editingProduct.dryMethod || ""} onChange={(e) => setEditingProduct({ ...editingProduct, dryMethod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Dry Method</option>
                      <option value="Tumble Dry Low">Tumble Dry Low</option>
                      <option value="Tumble Dry Medium">Tumble Dry Medium</option>
                      <option value="Tumble Dry High">Tumble Dry High</option>
                      <option value="Do Not Tumble Dry">Do Not Tumble Dry</option>
                      <option value="Line Dry">Line Dry</option>
                      <option value="Drip Dry">Drip Dry</option>
                      <option value="Flat Dry">Flat Dry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ironing Details</label>
                    <select value={editingProduct.ironingDetails || ""} onChange={(e) => setEditingProduct({ ...editingProduct, ironingDetails: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Ironing Option</option>
                      <option value="Do Not Iron">Do Not Iron</option>
                      <option value="Iron Low Heat">Iron Low Heat</option>
                      <option value="Iron Medium Heat">Iron Medium Heat</option>
                      <option value="Iron High Heat">Iron High Heat</option>
                      <option value="Steam Iron">Steam Iron</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Care</label>
                    <input type="text" value={editingProduct.specialCare || ""} onChange={(e) => setEditingProduct({ ...editingProduct, specialCare: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Any special care instructions" />
                  </div>
                </div>
              </div>

              {/* ───── Media ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Media</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>
                    <p className="text-xs text-gray-500 mb-2">Min 3–5 images (Front, back, sides, close-up details, fabric texture)</p>
                    <div className="flex items-center space-x-4 mb-2">
                      <input type="file" id="tm-edit-product-images" accept="image/*" multiple onChange={handleEditImageUpload} className="hidden" />
                      <label htmlFor="tm-edit-product-images" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer flex items-center"><Upload size={16} className="mr-2" />Upload Images</label>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {(editingProduct.images || []).map((image: string, idx: number) => (
                        <div key={idx} className="relative">
                          <img src={image} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover rounded border" />
                          <button type="button" onClick={() => removeEditImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Video Link</label>
                    <input type="url" value={editingProduct.videoLink || ""} onChange={(e) => setEditingProduct({ ...editingProduct, videoLink: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/video" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Video Link</label>
                    <input type="url" value={editingProduct.instagramLink || ""} onChange={(e) => setEditingProduct({ ...editingProduct, instagramLink: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://instagram.com/..." />
                  </div>
                </div>
              </div>

              {/* ───── Logistics ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Logistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Availability</label>
                    <select value={editingProduct.deliveryAvailability || ""} onChange={(e) => setEditingProduct({ ...editingProduct, deliveryAvailability: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Option</option>
                      <option value="Pan India">Pan India</option>
                      <option value="Metro Cities">Metro Cities</option>
                      <option value="Select Cities">Select Cities</option>
                      <option value="International">International</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">COD Option</label>
                    <select value={editingProduct.codOption || ""} onChange={(e) => setEditingProduct({ ...editingProduct, codOption: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Option</option>
                      <option value="Available">Available</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seller Address</label>
                    <textarea value={editingProduct.sellerAddress || ""} onChange={(e) => setEditingProduct({ ...editingProduct, sellerAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy</label>
                    <textarea value={editingProduct.returnPolicy || ""} onChange={(e) => setEditingProduct({ ...editingProduct, returnPolicy: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                  </div>
                </div>
              </div>

              {/* ───── Compliance ───── */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Compliance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer Details *</label>
                    <textarea value={editingProduct.manufacturerDetails || ""} onChange={(e) => setEditingProduct({ ...editingProduct, manufacturerDetails: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Packer Details *</label>
                    <textarea value={editingProduct.packerDetails || ""} onChange={(e) => setEditingProduct({ ...editingProduct, packerDetails: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} required />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setEditingProduct(null); setActiveView("list"); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={productsLoading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{productsLoading ? "Submitting..." : "Submit Changes for Approval"}</button>
              </div>
              <p className="text-xs text-gray-400 text-center">Your edits will be submitted for admin approval before being applied.</p>
            </form>
          </div>
        )}

        {/* Add Accessory Form */}
        {activeView === "addaccessory" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Accessory</h2>
              <button
                onClick={() => { setNewAccessory(getEmptyAccessoryForm()); setActiveView("list"); }}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <X size={16} className="mr-1" /> Cancel
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddAccessory(); }} className="space-y-6">
              {/* ───── Basic Accessory Information ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Basic Accessory Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Accessory Name *</label>
                    <input type="text" value={newAccessory.name} onChange={(e) => setNewAccessory({ ...newAccessory, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter accessory name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
                    <input type="text" value={newAccessory.brandName} onChange={(e) => setNewAccessory({ ...newAccessory, brandName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter brand name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select value={newAccessory.category} onChange={(e) => setNewAccessory({ ...newAccessory, category: e.target.value, subCategory: "" })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Category</option>
                      <option value="accessories">Accessories</option>
                      <option value="Bags">Bags</option>
                      <option value="Jewellery">Jewellery</option>
                      <option value="Watches">Watches</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Category *</label>
                    <select value={newAccessory.subCategory} onChange={(e) => setNewAccessory({ ...newAccessory, subCategory: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Sub-Category</option>
                      {newAccessory.category === "accessories" && <>
                        <option value="Sunglasses">Sunglasses</option>
                        <option value="Belts">Belts</option>
                        <option value="Wallets">Wallets</option>
                        <option value="Hats & Caps">Hats & Caps</option>
                        <option value="Scarves">Scarves</option>
                        <option value="Gloves">Gloves</option>
                        <option value="Hair Accessories">Hair Accessories</option>
                      </>}
                      {newAccessory.category === "Bags" && <>
                        <option value="Handbags">Handbags</option>
                        <option value="Shoulder Bags">Shoulder Bags</option>
                        <option value="Clutches">Clutches</option>
                        <option value="Tote Bags">Tote Bags</option>
                        <option value="Backpacks">Backpacks</option>
                        <option value="Crossbody Bags">Crossbody Bags</option>
                        <option value="Wallets & Pouches">Wallets & Pouches</option>
                      </>}
                      {newAccessory.category === "Jewellery" && <>
                        <option value="Necklaces">Necklaces</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Bracelets">Bracelets</option>
                        <option value="Rings">Rings</option>
                        <option value="Anklets">Anklets</option>
                        <option value="Brooches">Brooches</option>
                        <option value="Jewellery Sets">Jewellery Sets</option>
                      </>}
                      {newAccessory.category === "Watches" && <>
                        <option value="Analog Watches">Analog Watches</option>
                        <option value="Digital Watches">Digital Watches</option>
                        <option value="Smart Watches">Smart Watches</option>
                        <option value="Luxury Watches">Luxury Watches</option>
                        <option value="Sports Watches">Sports Watches</option>
                        <option value="Fashion Watches">Fashion Watches</option>
                      </>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product MRP (₹) *</label>
                    <input type="number" value={newAccessory.mrp} onChange={(e) => setNewAccessory({ ...newAccessory, mrp: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter MRP" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹) *</label>
                    <input type="number" value={newAccessory.sellingPrice} onChange={(e) => setNewAccessory({ ...newAccessory, sellingPrice: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter Selling Price" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%) *</label>
                    <select value={newAccessory.gstPercentage} onChange={(e) => setNewAccessory({ ...newAccessory, gstPercentage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select GST</option>
                      <option value="0%">0%</option>
                      <option value="5%">5%</option>
                      <option value="12%">12%</option>
                      <option value="18%">18%</option>
                      <option value="28%">28%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code *</label>
                    <input type="text" value={newAccessory.hsnCode} onChange={(e) => setNewAccessory({ ...newAccessory, hsnCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Auto-generated based on norms" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country of Origin *</label>
                    <input type="text" value={newAccessory.countryOfOrigin} onChange={(e) => setNewAccessory({ ...newAccessory, countryOfOrigin: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., India" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                    <input type="text" value={newAccessory.material} onChange={(e) => setNewAccessory({ ...newAccessory, material: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Leather, Metal, Fabric" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                    <input type="text" value={newAccessory.color} onChange={(e) => setNewAccessory({ ...newAccessory, color: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter color" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size / Dimensions *</label>
                    <input type="text" value={newAccessory.size} onChange={(e) => setNewAccessory({ ...newAccessory, size: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Free Size, One Size" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (grams) *</label>
                    <input type="text" value={newAccessory.weight} onChange={(e) => setNewAccessory({ ...newAccessory, weight: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 150g" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input type="number" value={newAccessory.stockQuantity} onChange={(e) => setNewAccessory({ ...newAccessory, stockQuantity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter total stock" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Description *</label>
                    <textarea value={newAccessory.fullDescription} onChange={(e) => setNewAccessory({ ...newAccessory, fullDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} placeholder="Detailed accessory description" required />
                  </div>
                </div>
              </div>

              {/* ───── Category-Specific Fields ───── */}
              {newAccessory.category === "Bags" && (
                <div className="border-b pb-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Bag Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bag Type</label>
                      <select value={newAccessory.bagType || ""} onChange={(e) => setNewAccessory({ ...newAccessory, bagType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Type</option>
                        <option value="Handbag">Handbag</option>
                        <option value="Shoulder Bag">Shoulder Bag</option>
                        <option value="Tote">Tote</option>
                        <option value="Clutch">Clutch</option>
                        <option value="Backpack">Backpack</option>
                        <option value="Crossbody">Crossbody</option>
                        <option value="Satchel">Satchel</option>
                        <option value="Hobo">Hobo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Compartments</label>
                      <input type="text" value={newAccessory.compartments || ""} onChange={(e) => setNewAccessory({ ...newAccessory, compartments: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 3 compartments, 1 zip pocket" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Closure Type</label>
                      <select value={newAccessory.finish || ""} onChange={(e) => setNewAccessory({ ...newAccessory, finish: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Closure</option>
                        <option value="Zipper">Zipper</option>
                        <option value="Magnetic">Magnetic</option>
                        <option value="Buckle">Buckle</option>
                        <option value="Drawstring">Drawstring</option>
                        <option value="Flap">Flap</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Strap Type</label>
                      <input type="text" value={newAccessory.secondaryMaterial || ""} onChange={(e) => setNewAccessory({ ...newAccessory, secondaryMaterial: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Adjustable, Detachable" />
                    </div>
                  </div>
                </div>
              )}

              {newAccessory.category === "Jewellery" && (
                <div className="border-b pb-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Jewellery Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Metal Type</label>
                      <select value={newAccessory.metalType || ""} onChange={(e) => setNewAccessory({ ...newAccessory, metalType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Metal</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Rose Gold">Rose Gold</option>
                        <option value="White Gold">White Gold</option>
                        <option value="Brass">Brass</option>
                        <option value="Stainless Steel">Stainless Steel</option>
                        <option value="Alloy">Alloy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gemstone Type</label>
                      <select value={newAccessory.gemstoneType || ""} onChange={(e) => setNewAccessory({ ...newAccessory, gemstoneType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Gemstone</option>
                        <option value="Diamond">Diamond</option>
                        <option value="Ruby">Ruby</option>
                        <option value="Sapphire">Sapphire</option>
                        <option value="Emerald">Emerald</option>
                        <option value="Pearl">Pearl</option>
                        <option value="Cubic Zirconia">Cubic Zirconia</option>
                        <option value="No Gemstone">No Gemstone</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plating</label>
                      <select value={newAccessory.plating || ""} onChange={(e) => setNewAccessory({ ...newAccessory, plating: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Plating</option>
                        <option value="Gold Plated">Gold Plated</option>
                        <option value="Rhodium Plated">Rhodium Plated</option>
                        <option value="Silver Plated">Silver Plated</option>
                        <option value="Rose Gold Plated">Rose Gold Plated</option>
                        <option value="No Plating">No Plating</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
                      <input type="text" value={newAccessory.occasion || ""} onChange={(e) => setNewAccessory({ ...newAccessory, occasion: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Wedding, Daily Wear, Party" />
                    </div>
                  </div>
                </div>
              )}

              {newAccessory.category === "Watches" && (
                <div className="border-b pb-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Watch Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Watch Type</label>
                      <select value={newAccessory.watchType || ""} onChange={(e) => setNewAccessory({ ...newAccessory, watchType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Type</option>
                        <option value="Analog">Analog</option>
                        <option value="Digital">Digital</option>
                        <option value="Smart Watch">Smart Watch</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Band Material</label>
                      <select value={newAccessory.bandMaterial || ""} onChange={(e) => setNewAccessory({ ...newAccessory, bandMaterial: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Material</option>
                        <option value="Leather">Leather</option>
                        <option value="Metal">Metal</option>
                        <option value="Silicone">Silicone</option>
                        <option value="Fabric">Fabric</option>
                        <option value="Rubber">Rubber</option>
                        <option value="Ceramic">Ceramic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Water Resistance</label>
                      <input type="text" value={newAccessory.waterResistance || ""} onChange={(e) => setNewAccessory({ ...newAccessory, waterResistance: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 30m, 50m, 100m" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dial Diameter</label>
                      <input type="text" value={newAccessory.dimensions || ""} onChange={(e) => setNewAccessory({ ...newAccessory, dimensions: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 40mm" />
                    </div>
                  </div>
                </div>
              )}

              {/* ───── Descriptions ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Descriptions</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                    <textarea value={newAccessory.shortDescription} onChange={(e) => setNewAccessory({ ...newAccessory, shortDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Brief accessory description" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Key Features / Highlights</label>
                    <textarea value={newAccessory.keyFeatures} onChange={(e) => setNewAccessory({ ...newAccessory, keyFeatures: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="List key features" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Features</label>
                    <textarea value={newAccessory.specialFeatures || ""} onChange={(e) => setNewAccessory({ ...newAccessory, specialFeatures: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Any special features" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Care Instructions</label>
                    <textarea value={newAccessory.careInstructions || ""} onChange={(e) => setNewAccessory({ ...newAccessory, careInstructions: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Care and maintenance instructions" />
                  </div>
                </div>
              </div>

              {/* ───── Media ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Media</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>
                    <p className="text-xs text-gray-500 mb-2">Min 3–5 images (Front, back, sides, close-up details)</p>
                    <div className="flex items-center space-x-4 mb-2">
                      <input type="file" id="tm-accessory-images" accept="image/*" multiple onChange={handleAccessoryImageUpload} className="hidden" />
                      <label htmlFor="tm-accessory-images" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer flex items-center"><Upload size={16} className="mr-2" />Upload Images</label>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {newAccessory.images.map((image: string, idx: number) => (
                        <div key={idx} className="relative">
                          <img src={image} alt={`Accessory ${idx + 1}`} className="w-full h-24 object-cover rounded border" />
                          <button type="button" onClick={() => removeAccessoryImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Video Link</label>
                    <input type="url" value={newAccessory.videoLink} onChange={(e) => setNewAccessory({ ...newAccessory, videoLink: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/video" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Video Link</label>
                    <input type="url" value={newAccessory.instagramLink} onChange={(e) => setNewAccessory({ ...newAccessory, instagramLink: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://instagram.com/..." />
                  </div>
                </div>
              </div>

              {/* ───── Logistics ───── */}
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Logistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Availability</label>
                    <select value={newAccessory.deliveryAvailability} onChange={(e) => setNewAccessory({ ...newAccessory, deliveryAvailability: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Option</option>
                      <option value="Pan India">Pan India</option>
                      <option value="Metro Cities">Metro Cities</option>
                      <option value="Select Cities">Select Cities</option>
                      <option value="International">International</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">COD Option</label>
                    <select value={newAccessory.codOption} onChange={(e) => setNewAccessory({ ...newAccessory, codOption: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Option</option>
                      <option value="Available">Available</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seller Address</label>
                    <textarea value={newAccessory.sellerAddress} onChange={(e) => setNewAccessory({ ...newAccessory, sellerAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Enter seller address" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy</label>
                    <textarea value={newAccessory.returnPolicy} onChange={(e) => setNewAccessory({ ...newAccessory, returnPolicy: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Enter return policy details" />
                  </div>
                </div>
              </div>

              {/* ───── Compliance ───── */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Compliance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer Details *</label>
                    <textarea value={newAccessory.manufacturerDetails} onChange={(e) => setNewAccessory({ ...newAccessory, manufacturerDetails: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Enter manufacturer or importer details" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Warranty</label>
                    <input type="text" value={newAccessory.warranty || ""} onChange={(e) => setNewAccessory({ ...newAccessory, warranty: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 6 months, 1 year" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setNewAccessory(getEmptyAccessoryForm()); setActiveView("list"); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={productsLoading} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">{productsLoading ? "Submitting..." : "Submit for Approval"}</button>
              </div>
              <p className="text-xs text-gray-400 text-center">This accessory will be submitted for admin approval before it appears on the platform.</p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
