// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  brandName: string;
  price: number;
  credits: string;
  discountedPrice: number;
  offer: string;
  category: string;
  subCategory: string;
  stockQuantity: number;
  sku: string;
  hsnCode: string;
  fitType: string;
  type: string;
  colors: string;
  sizes: string;
  material: string;
  pattern: string;
  neckType: string;
  sleeveType: string;
  occasion: string;
  length: string;
  closureType: string;
  stretchability: string;
  shortDescription: string;
  fullDescription: string;
  keyFeatures: string;
  washMethod: string;
  ironingDetails: string;
  images: string[];
  videoLink: string;
  packageDimensions: string;
  weight: string;
  deliveryAvailability: string;
  codOption: boolean;
  returnPolicy: string;
  manufacturerDetails: string;
  countryOfOrigin: string;
  rating?: number;
  reviewCount?: number;
  [key: string]: unknown;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  deliveryDate: string;
  shippingAddress?: ShippingAddress;
  paymentMethod?: string;
  status?: string;
  createdAt?: string;
}

export interface CartContextType {
  cartItems: CartItem[];
  wishlistItems: Product[];
  orders: Order[];
  addToCart: (product: Product, selectedSize: string, selectedColor: string) => void;
  removeFromCart: (productId: number, selectedSize: string, selectedColor: string) => void;
  updateQuantity: (productId: number, selectedSize: string, selectedColor: string, quantity: number) => void;
  moveToWishlist: (productId: number, selectedSize: string, selectedColor: string) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  moveToCart: (product: Product) => void;
  calculateTotal: () => number;
  calculateOriginalTotal: () => number;
  calculateDiscount: () => number;
  calculateGST: () => number;
  calculateFinalTotal: () => number;
  placeOrder: (shippingAddress?: ShippingAddress, paymentMethod?: string) => Order;
}

export type PageName =
  | 'landing' | 'customerDashboard' | 'brandOwnerDashboard'
  | 'cart' | 'checkout' | 'orderSummary' | 'orderHistory' | 'orderTracking'
  | 'wishlist' | 'mens' | 'womens' | 'accessories' | 'all'
  | 'services' | 'tree' | 'contact' | 'aboutus' | 'news'
  | 'entrepreneurs' | 'brandowners' | 'founders'
  | 'documents' | 'bankings' | 'legals';

export type UserType = 'customer' | 'brand_owner' | 'founder' | null;

export interface UserData {
  userId?: string;
  name?: string;
  email?: string;
  userType: UserType;
  [key: string]: unknown;
}
