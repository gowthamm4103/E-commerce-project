// ─── API Service Layer ──────────────────────────────────────────────
// Centralizes all HTTP calls to the Express.js backend.
// Every component should import from here instead of using fetch directly.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Token management ───────────────────────────────────────────────
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// ─── User session management ────────────────────────────────────────
export const setUserSession = (userData: Record<string, unknown>): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(userData));
};

export const getUserSession = (): Record<string, unknown> | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('user');
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
};

export const removeUserSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
};

// ─── Base fetch helper ──────────────────────────────────────────────
// Callback for authentication errors - can be set by components to handle auth failures
let onAuthError: (() => void) | null = null;

export const setAuthErrorHandler = (handler: () => void) => {
  onAuthError = handler;
};

export const clearAuthErrorHandler = () => {
  onAuthError = null;
};

async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Log warning for debugging - token is missing
    console.warn('API Warning: No authentication token found in localStorage. Request may fail if endpoint requires authentication.');
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    // Handle authentication errors
    if (res.status === 401) {
      // Clear invalid token
      removeToken();
      // Notify the app about auth failure
      if (onAuthError) {
        onAuthError();
      }
    }
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}

// ─── Auth API ───────────────────────────────────────────────────────
export const authAPI = {
  registerCustomer: (body: {
    name: string; email: string; password: string;
    contact: string; dateOfBirth?: string; parentId?: string;
  }) => apiFetch<{ success: boolean; user: any; token: string }>('/auth/register/customer', {
    method: 'POST', body: JSON.stringify(body),
  }),

  registerBrandOwner: (body: {
    name: string; email: string; password: string; contact: string;
    brandName?: string; legalBusinessName?: string; businessRegNo?: string;
    gstNo?: string; businessAddress?: any;
  }) => apiFetch<{ success: boolean; user: any; token: string; replacedCustomer?: any }>('/auth/register/brand-owner', {
    method: 'POST', body: JSON.stringify(body),
  }),

  login: (body: { userId?: string; email?: string; password: string }) =>
    apiFetch<{ success: boolean; user: any; token: string }>('/auth/login', {
      method: 'POST', body: JSON.stringify(body),
    }),

  forgotPassword: (email: string) =>
    apiFetch('/auth/forgot-password', {
      method: 'POST', body: JSON.stringify({ email }),
    }),

  getProfile: () => apiFetch<{ success: boolean; user: any }>('/auth/profile'),

  updateProfile: (body: any) =>
    apiFetch<{ success: boolean; user: any }>('/auth/profile', {
      method: 'PUT', body: JSON.stringify(body),
    }),

  updateKYC: (body: any) =>
    apiFetch('/auth/kyc', { method: 'PUT', body: JSON.stringify(body) }),

  updateBankAccount: (body: any) =>
    apiFetch('/auth/bank-account', { method: 'PUT', body: JSON.stringify(body) }),
};

// ─── Products API ───────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<{ success: boolean; products: any[]; count: number }>(`/products${query}`);
  },

  getById: (id: string) =>
    apiFetch<{ success: boolean; product: any }>(`/products/${id}`),

  getByCategory: (category: string) =>
    apiFetch<{ success: boolean; products: any[]; count: number }>(`/products/category/${category}`),

  // Brand owner methods
  getMyProducts: () =>
    apiFetch<{ success: boolean; products: any[] }>('/products/my/products'),

  create: (body: any) =>
    apiFetch<{ success: boolean; message: string; changeRequest: any }>('/products', {
      method: 'POST', body: JSON.stringify(body),
    }),

  update: (id: string, body: any) =>
    apiFetch<{ success: boolean; message: string; changeRequest: any }>(`/products/${id}`, {
      method: 'PUT', body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string; changeRequest: any }>(`/products/${id}`, { method: 'DELETE' }),

  updateStock: (id: string, quantity: number, action: 'add' | 'set') =>
    apiFetch<{ success: boolean; message: string; changeRequest: any }>(`/products/${id}/stock`, {
      method: 'PATCH', body: JSON.stringify({ quantity, action }),
    }),

  getMyChangeRequests: (params?: { status?: string; entityType?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.entityType) q.set('entityType', params.entityType);
    return apiFetch<{ success: boolean; requests: any[] }>(`/products/my/change-requests?${q.toString()}`);
  },
};

// ─── Cart API ───────────────────────────────────────────────────────
export const cartAPI = {
  get: () => apiFetch<{ success: boolean; cartItems: any[] }>('/cart'),

  add: (productId: string, selectedSize: string, selectedColor: string, quantity?: number) =>
    apiFetch<{ success: boolean; cartItems: any[] }>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, selectedSize, selectedColor, quantity: quantity || 1 }),
    }),

  remove: (productId: string, selectedSize: string, selectedColor: string) =>
    apiFetch<{ success: boolean; cartItems: any[] }>('/cart/remove', {
      method: 'POST',
      body: JSON.stringify({ productId, selectedSize, selectedColor }),
    }),

  updateQuantity: (productId: string, selectedSize: string, selectedColor: string, quantity: number) =>
    apiFetch<{ success: boolean; cartItems: any[] }>('/cart/update-quantity', {
      method: 'POST',
      body: JSON.stringify({ productId, selectedSize, selectedColor, quantity }),
    }),

  clear: () =>
    apiFetch<{ success: boolean; cartItems: any[] }>('/cart/clear', { method: 'DELETE' }),
};

// ─── Wishlist API ───────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => apiFetch<{ success: boolean; wishlistItems: any[] }>('/wishlist'),

  add: (productId: string, selectedSize?: string, selectedColor?: string) =>
    apiFetch<{ success: boolean; wishlistItems: any[] }>('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId, selectedSize: selectedSize || '', selectedColor: selectedColor || '' }),
    }),

  remove: (productId: string, selectedSize?: string, selectedColor?: string) =>
    apiFetch<{ success: boolean; wishlistItems: any[] }>('/wishlist/remove', {
      method: 'POST',
      body: JSON.stringify({ productId, selectedSize: selectedSize || '', selectedColor: selectedColor || '' }),
    }),

  moveToCart: (productId: string, selectedSize: string, selectedColor: string) =>
    apiFetch('/wishlist/move-to-cart', {
      method: 'POST',
      body: JSON.stringify({ productId, selectedSize, selectedColor }),
    }),

  moveToWishlist: (productId: string, selectedSize: string, selectedColor: string) =>
    apiFetch('/wishlist/move-to-wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId, selectedSize, selectedColor }),
    }),
};

// ─── Orders API ─────────────────────────────────────────────────────
export const ordersAPI = {
  place: (body: { deliveryDetails: any; paymentMethod: string; couponCode?: string; items?: any[] }) =>
    apiFetch<{ success: boolean; order: any }>('/orders', {
      method: 'POST', body: JSON.stringify(body),
    }),

  getAll: (status?: string) => {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    return apiFetch<{ success: boolean; orders: any[] }>(`/orders${query}`);
  },

  getById: (orderId: string) =>
    apiFetch<{ success: boolean; order: any }>(`/orders/${orderId}`),

  getLatest: () =>
    apiFetch<{ success: boolean; order: any | null }>('/orders/latest'),
};

// ─── Coupons API ────────────────────────────────────────────────────
export const couponsAPI = {
  validate: (code: string, purchaseAmount: number) =>
    apiFetch<{ success: boolean; coupon: any }>('/coupons/validate', {
      method: 'POST', body: JSON.stringify({ code, purchaseAmount }),
    }),

  getAll: () => apiFetch<{ success: boolean; coupons: any[] }>('/coupons'),

  create: (body: any) =>
    apiFetch<{ success: boolean; message: string; changeRequest: any }>('/coupons', {
      method: 'POST', body: JSON.stringify(body),
    }),

  update: (id: string, body: any) =>
    apiFetch<{ success: boolean; message: string; changeRequest: any }>(`/coupons/${id}`, {
      method: 'PUT', body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string; changeRequest: any }>(`/coupons/${id}`, { method: 'DELETE' }),
};

// ─── Invoices API ───────────────────────────────────────────────────
export const invoicesAPI = {
  getAll: () => apiFetch<{ success: boolean; invoices: any[] }>('/invoices'),

  create: (body: any) =>
    apiFetch<{ success: boolean; invoice: any }>('/invoices', {
      method: 'POST', body: JSON.stringify(body),
    }),

  getById: (id: string) =>
    apiFetch<{ success: boolean; invoice: any }>(`/invoices/${id}`),

  update: (id: string, body: any) =>
    apiFetch<{ success: boolean; invoice: any }>(`/invoices/${id}`, {
      method: 'PUT', body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch(`/invoices/${id}`, { method: 'DELETE' }),
};

// ─── Business API ───────────────────────────────────────────────────
export const businessAPI = {
  // Store details
  getStoreDetails: () =>
    apiFetch<{ success: boolean; business: any }>('/business/store'),

  updateStoreDetails: (body: any) =>
    apiFetch<{ success: boolean; business: any }>('/business/store', {
      method: 'PUT', body: JSON.stringify(body),
    }),

  // Overview
  getOverview: () =>
    apiFetch<{ success: boolean; overview: any }>('/business/overview'),

  // Categories
  getCategories: () =>
    apiFetch<{ success: boolean; categories: any[] }>('/business/categories'),

  createCategory: (body: any) =>
    apiFetch<{ success: boolean; category: any }>('/business/categories', {
      method: 'POST', body: JSON.stringify(body),
    }),

  updateCategory: (id: string, body: any) =>
    apiFetch<{ success: boolean; category: any }>(`/business/categories/${id}`, {
      method: 'PUT', body: JSON.stringify(body),
    }),

  deleteCategory: (id: string) =>
    apiFetch(`/business/categories/${id}`, { method: 'DELETE' }),

  // Team members
  getTeamMembers: () =>
    apiFetch<{ success: boolean; members: any[] }>('/business/team'),

  createTeamMember: (body: any) =>
    apiFetch<{ success: boolean; member: any }>('/business/team', {
      method: 'POST', body: JSON.stringify(body),
    }),

  updateTeamMember: (id: string, body: any) =>
    apiFetch<{ success: boolean; member: any }>(`/business/team/${id}`, {
      method: 'PUT', body: JSON.stringify(body),
    }),

  deleteTeamMember: (id: string) =>
    apiFetch(`/business/team/${id}`, { method: 'DELETE' }),

  // Team member login (email-only authentication)
  teamMemberLogin: (body: { email: string }) =>
    apiFetch<{ success: boolean; member: any; token: string }>('/business/team/login', {
      method: 'POST', body: JSON.stringify(body),
    }),

  // Team member product operations
  teamMemberGetProducts: () =>
    apiFetch<{ success: boolean; products: any[] }>('/business/team/products'),

  teamMemberAddProduct: (body: any) =>
    apiFetch<{ success: boolean; message: string; changeRequest: any }>('/business/team/products', {
      method: 'POST', body: JSON.stringify(body),
    }),

  teamMemberEditProduct: (id: string, body: any) =>
    apiFetch<{ success: boolean; message: string; changeRequest: any }>(`/business/team/products/${id}`, {
      method: 'PUT', body: JSON.stringify(body),
    }),

  // Inventory (admin-level)
  getInventoryAll: () =>
    apiFetch<{ success: boolean; brands: any[] }>('/business/inventory/all'),

  updateStock: (body: any) =>
    apiFetch('/business/inventory/update-stock', {
      method: 'POST', body: JSON.stringify(body),
    }),

  syncAll: () =>
    apiFetch('/business/inventory/sync-all', { method: 'POST' }),

  exportInventory: () =>
    fetch(`${API_BASE}/business/inventory/export`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    }),
};

// ─── Wallet API ─────────────────────────────────────────────────────
export const walletAPI = {
  getFinancialData: () =>
    apiFetch<{ success: boolean; financialData: any }>('/wallet/financial-data'),

  addToEWallet: (amount: number, paymentMethod: string) =>
    apiFetch('/wallet/ewallet/add', {
      method: 'POST', body: JSON.stringify({ amount, paymentMethod }),
    }),

  withdrawFromIncome: (amount: number) =>
    apiFetch('/wallet/income/withdraw', {
      method: 'POST', body: JSON.stringify({ amount }),
    }),

  getTransactions: (walletType?: string) => {
    const query = walletType ? `?walletType=${walletType}` : '';
    return apiFetch<{ success: boolean; transactions: any[] }>(`/wallet/transactions${query}`);
  },

  getCreditHistory: () =>
    apiFetch<{ success: boolean; creditHistory: any[] }>('/wallet/credit-history'),

  getWithdrawalHistory: () =>
    apiFetch<{ success: boolean; withdrawalHistory: any[] }>('/wallet/withdrawal-history'),
};

// ─── MLM API ────────────────────────────────────────────────────────
export const mlmAPI = {
  getTree: () =>
    apiFetch<{ success: boolean; tree: any[] }>('/mlm/tree'),

  getHierarchy: (userId?: string) =>
    apiFetch<{ success: boolean; hierarchy: any }>(`/mlm/hierarchy${userId ? '/' + userId : ''}`),

  getFranchise: (side: 'A' | 'B') =>
    apiFetch<{ success: boolean; franchise: any }>(`/mlm/franchise/${side}`),

  getNextParentInfo: (userType: string) =>
    apiFetch<{ success: boolean; parentInfo: any }>(`/mlm/next-parent?userType=${userType}`),

  getUserById: (userId: string) =>
    apiFetch<{ success: boolean; user: any }>(`/mlm/user/${userId}`),

  runConsolidation: () =>
    apiFetch('/mlm/consolidation', { method: 'POST' }),
};

// ─── Portals API ────────────────────────────────────────────────────
export const portalsAPI = {
  create: (body: any) =>
    apiFetch<{ success: boolean; portal: any }>('/portals', {
      method: 'POST', body: JSON.stringify(body),
    }),

  getMyPortals: () =>
    apiFetch<{ success: boolean; portals: any[] }>('/portals/my'),

  getByUrl: (url: string) =>
    apiFetch<{ success: boolean; portal: any }>(`/portals/url/${url}`),

  update: (id: string, body: any) =>
    apiFetch<{ success: boolean; portal: any }>(`/portals/${id}`, {
      method: 'PUT', body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch(`/portals/${id}`, { method: 'DELETE' }),
};

// ─── Referrals API ──────────────────────────────────────────────────
// Note: Referral links use userId directly: /product/{productId}?ref={userId}
export const referralsAPI = {
  // Track when a guest clicks a referral link (userId as ref)
  track: (referrerUserId: string, productId: string, guestSessionId?: string) =>
    apiFetch<{ success: boolean; guestSessionId: string; referral: any }>(
      '/referrals/track',
      { method: 'POST', body: JSON.stringify({ referrerUserId, productId, guestSessionId }) }
    ),

  getActive: (guestSessionId: string) =>
    apiFetch<{ success: boolean; referrals: any[] }>(
      `/referrals/active?guestSessionId=${encodeURIComponent(guestSessionId)}`
    ),

  validate: (guestSessionId: string, cartItems: any[]) =>
    apiFetch<{ success: boolean; hasReferral: boolean; commissions: any[]; totalCommission: number }>(
      '/referrals/validate',
      { method: 'POST', body: JSON.stringify({ guestSessionId, cartItems }) }
    ),

  process: (orderId: string, guestSessionId: string, commissions: any[]) =>
    apiFetch<{ success: boolean; commissions: any[] }>(
      '/referrals/process',
      { method: 'POST', body: JSON.stringify({ orderId, guestSessionId, commissions }) }
    ),

  getCommissions: (status?: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    return apiFetch<{ success: boolean; commissions: any[]; pagination: any }>(
      `/referrals/commissions?${params.toString()}`
    );
  },

  credit: (referrerUserId: string, productId: string) =>
    apiFetch<{ success: boolean; commissionAmount: number }>(
      '/referrals/credit',
      { method: 'POST', body: JSON.stringify({ referrerUserId, productId }) }
    ),
};

// ─── Admin API ──────────────────────────────────────────────────────
export const adminAPI = {
  // Users
  users: {
    getAll: (params?: { type?: string; search?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.type) q.set('type', params.type);
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/admin/users?${q.toString()}`);
    },
    getById: (userId: string) =>
      apiFetch<{ success: boolean; data: any }>(`/admin/users/${userId}`),
    getStats: () =>
      apiFetch<{ success: boolean; data: any }>('/admin/users/stats'),
  },

  // Coupons
  coupons: {
    getAll: (params?: { approvalStatus?: string; status?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.approvalStatus) q.set('approvalStatus', params.approvalStatus);
      if (params?.status) q.set('status', params.status);
      if (params?.search) q.set('search', params.search);
      return apiFetch<{ success: boolean; data: any[] }>(`/admin/coupons?${q.toString()}`);
    },
    approve: (id: string) =>
      apiFetch<{ success: boolean; data: any }>(`/admin/coupons/${id}/approve`, { method: 'PUT' }),
    reject: (id: string, reason: string) =>
      apiFetch<{ success: boolean; data: any }>(`/admin/coupons/${id}/reject`, {
        method: 'PUT', body: JSON.stringify({ reason }),
      }),
    update: (id: string, body: any) =>
      apiFetch<{ success: boolean; data: any }>(`/admin/coupons/${id}`, {
        method: 'PUT', body: JSON.stringify(body),
      }),
    toggleStatus: (id: string) =>
      apiFetch<{ success: boolean; data: any }>(`/admin/coupons/${id}/toggle-status`, { method: 'PUT' }),
    delete: (id: string) =>
      apiFetch(`/admin/coupons/${id}`, { method: 'DELETE' }),
    getAnalytics: () =>
      apiFetch<{ success: boolean; data: any }>('/admin/coupons/analytics'),
  },

  // Invoices
  invoices: {
    getAll: (params?: { paymentStatus?: string; search?: string; dateFrom?: string; dateTo?: string }) => {
      const q = new URLSearchParams();
      if (params?.paymentStatus) q.set('paymentStatus', params.paymentStatus);
      if (params?.search) q.set('search', params.search);
      if (params?.dateFrom) q.set('dateFrom', params.dateFrom);
      if (params?.dateTo) q.set('dateTo', params.dateTo);
      return apiFetch<{ success: boolean; data: any[] }>(`/admin/invoices?${q.toString()}`);
    },
    update: (id: string, body: any) =>
      apiFetch<{ success: boolean; data: any }>(`/admin/invoices/${id}`, {
        method: 'PUT', body: JSON.stringify(body),
      }),
    delete: (id: string) =>
      apiFetch(`/admin/invoices/${id}`, { method: 'DELETE' }),
    getAnalytics: () =>
      apiFetch<{ success: boolean; data: any }>('/admin/invoices/analytics'),
  },

  // Change Requests (Product & Coupon approval workflow)
  changeRequests: {
    getAll: (params?: { status?: string; entityType?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.entityType) q.set('entityType', params.entityType);
      if (params?.search) q.set('search', params.search);
      return apiFetch<{ success: boolean; data: any[] }>(`/admin/change-requests?${q.toString()}`);
    },
    getById: (id: string) =>
      apiFetch<{ success: boolean; data: any }>(`/admin/change-requests/${id}`),
    approve: (id: string) =>
      apiFetch<{ success: boolean; data: any }>(`/admin/change-requests/${id}/approve`, { method: 'PUT' }),
    reject: (id: string, reason: string) =>
      apiFetch<{ success: boolean; data: any }>(`/admin/change-requests/${id}/reject`, {
        method: 'PUT', body: JSON.stringify({ reason }),
      }),
    getStats: () =>
      apiFetch<{ success: boolean; data: any }>('/admin/change-requests/stats'),
  },

  // Orders
  orders: {
    getAll: (params?: { status?: string; search?: string; dateFrom?: string; dateTo?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.search) q.set('search', params.search);
      if (params?.dateFrom) q.set('dateFrom', params.dateFrom);
      if (params?.dateTo) q.set('dateTo', params.dateTo);
      return apiFetch<{ success: boolean; data: any[] }>(`/admin/orders?${q.toString()}`);
    },
    getById: (orderId: string) =>
      apiFetch<{ success: boolean; data: any }>(`/admin/orders/${orderId}`),
    updateStatus: (orderId: string, status: string) =>
      apiFetch<{ success: boolean; data: any }>(`/admin/orders/${orderId}/status`, {
        method: 'PUT', body: JSON.stringify({ status }),
      }),
    getStats: () =>
      apiFetch<{ success: boolean; data: any }>('/admin/orders/stats'),
  },
};
