/**
 * Referral System Utilities
 * Handles guest session management and referral tracking via localStorage
 * 
 * Referral links format: /product/{productId}?ref={referrerUserId}
 */

// Configuration
const REFERRAL_STORAGE_KEY = 'referral_data';
const GUEST_SESSION_STORAGE_KEY = 'guest_session_id';
const REFERRAL_EXPIRY_DAYS = 7;

export interface ReferralData {
  referrerUserId: string;  // The userId of the referrer
  productId: string;
  productName: string;
  productPrice: number;
  clickedAt: string;
  expiresAt: string;
  commissionRate: number;
}

export interface CommissionData {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  commissionAmount: number;
  commissionRate: number;
  referrerUserId: string;
}

/**
 * Generate a unique guest session ID if one doesn't exist
 */
export const getOrCreateGuestSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : generateUUID();
    localStorage.setItem(GUEST_SESSION_STORAGE_KEY, sessionId);
  }
  
  return sessionId;
};

/**
 * Fallback UUID generator for browsers that don't support crypto.randomUUID
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Store referral data when a guest clicks a referral link
 * Uses referrerUserId as the key identifier
 */
export const storeReferralData = (referral: ReferralData): void => {
  if (typeof window === 'undefined') return;
  
  const guestSessionId = getOrCreateGuestSessionId();
  
  // Get existing referrals
  const existingReferrals = getStoredReferrals();
  
  // Check if we already have a referral for this product (last click wins)
  const existingIndex = existingReferrals.findIndex(
    r => r.productId === referral.productId
  );
  
  if (existingIndex >= 0) {
    // Replace with new referral (last click wins)
    existingReferrals[existingIndex] = referral;
  } else {
    existingReferrals.push(referral);
  }
  
  // Store updated referrals
  localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify({
    guestSessionId,
    referrals: existingReferrals,
    updatedAt: new Date().toISOString(),
  }));
};

/**
 * Get all stored referrals for the current guest session
 */
export const getStoredReferrals = (): ReferralData[] => {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    const now = new Date();
    
    // Filter out expired referrals
    return parsed.referrals?.filter((r: ReferralData) => {
      return new Date(r.expiresAt) > now;
    }) || [];
  } catch {
    return [];
  }
};

/**
 * Get guest session ID from storage
 */
export const getGuestSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  const data = localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (!data) return getOrCreateGuestSessionId();
  
  try {
    const parsed = JSON.parse(data);
    return parsed.guestSessionId || getOrCreateGuestSessionId();
  } catch {
    return getOrCreateGuestSessionId();
  }
};

/**
 * Get referral for a specific product
 */
export const getReferralForProduct = (productId: string): ReferralData | null => {
  const referrals = getStoredReferrals();
  return referrals.find(r => r.productId === productId) || null;
};

/**
 * Check if there are any active referrals
 */
export const hasActiveReferrals = (): boolean => {
  return getStoredReferrals().length > 0;
};

/**
 * Clear referral data (used after successful order or if user logs in)
 */
export const clearReferralData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
};

/**
 * Clear only the referral for a specific product
 */
export const clearReferralForProduct = (productId: string): void => {
  if (typeof window === 'undefined') return;
  
  const data = localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (!data) return;
  
  try {
    const parsed = JSON.parse(data);
    parsed.referrals = parsed.referrals?.filter(
      (r: ReferralData) => r.productId !== productId
    ) || [];
    
    if (parsed.referrals.length === 0) {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
    } else {
      localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {
    // Ignore errors
  }
};

/**
 * Calculate commission for a product with quantity
 */
export const calculateCommission = (price: number, quantity: number): number => {
  const commissionRate = 0.05; // 5% fixed
  return Math.round(price * quantity * commissionRate);
};

/**
 * Check if a referral link is valid (not expired)
 */
export const isReferralValid = (referral: ReferralData): boolean => {
  return new Date(referral.expiresAt) > new Date();
};

/**
 * Parse referral (userId) from URL query parameters
 */
export const parseReferralFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('ref');
  } catch {
    // Handle relative URLs
    const match = url.match(/[?&]ref=([^&]+)/);
    return match ? match[1] : null;
  }
};

/**
 * Check if user is a guest (not logged in)
 */
export const isGuestUser = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !localStorage.getItem('token');
};

/**
 * Get referral data ready for checkout validation
 */
export const getReferralsForCheckout = (): { guestSessionId: string; referrals: ReferralData[] } => {
  const guestSessionId = getGuestSessionId();
  const referrals = getStoredReferrals();
  
  return { guestSessionId, referrals };
};

/**
 * Create referral data from URL (when guest clicks referral link)
 */
export const createReferralFromUrl = (
  url: string, 
  productId: string, 
  productName: string, 
  productPrice: number
): ReferralData | null => {
  const referrerUserId = parseReferralFromUrl(url);
  if (!referrerUserId) return null;
  
  const expiresAt = new Date(Date.now() + REFERRAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  return {
    referrerUserId,
    productId,
    productName,
    productPrice,
    clickedAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    commissionRate: 0.05,
  };
};