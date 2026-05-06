'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, Gift } from 'lucide-react';
import type { Product } from '../types';
import { getUserSession, getToken } from '../lib/api';

interface ShareProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ShareProductModal = ({ product, isOpen, onClose }: ShareProductModalProps): JSX.Element | null => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{ userId?: string; name?: string } | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = getToken();
    const user = getUserSession();
    setIsLoggedIn(!!token);
    setUserData(user);
  }, []);

  useEffect(() => {
    if (product && isOpen) {
      if (isLoggedIn && userData?.userId) {
        // Generate share URL with user ID as referral code
        const baseUrl = window.location.origin;
        const productId = product._id || product.id;
        const referralUrl = `${baseUrl}/product/${productId}?ref=${userData.userId}`;
        setShareUrl(referralUrl);
      } else {
        // For non-logged-in users, show basic share URL without referral
        const baseUrl = window.location.origin;
        const productId = product._id || product.id;
        const productUrl = `${baseUrl}/product/${productId}`;
        setShareUrl(productUrl);
      }
    }
  }, [product, isOpen, isLoggedIn, userData]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleShare = async (platform: string) => {
    if (!product) return;
    
    const shareText = `Check out this ${product.name} from ${product.brandName || product.brand} - Only ₹${product.price}!`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareLink = '';
    
    switch(platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(`Check out ${product.name}`)}&body=${encodedText}%20${encodedUrl}`;
        break;
      default:
        // Native share API for mobile
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
          try {
            await navigator.share({
              title: product.name,
              text: shareText,
              url: shareUrl
            });
            return;
          } catch (err) {
            console.log('Error sharing:', err);
          }
        }
        return;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
  };
  
  if (!isOpen || !product) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Share Product</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={product.images?.[0] || '/api/placeholder/400/500'} 
            alt={product.name} 
            className="w-16 h-16 object-cover rounded"
          />
          <div>
            <h4 className="font-semibold">{product.name}</h4>
            <p className="text-sm text-gray-500">{product.brandName || product.brand}</p>
            <p className="font-bold">₹{product.price}</p>
          </div>
        </div>
        
        {/* Referral Commission Info (for logged-in users) */}
        {isLoggedIn && userData?.userId && (
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <Gift size={16} className="text-green-600" />
              <span className="text-sm font-semibold text-green-800">Share. Earn. Repeat.</span>
            </div>
            <p className="text-xs font-medium text-green-700">
              Get 5% commission every time someone buys through your referral link!
            </p>
          </div>
        )}
        
        {/* Warning for non-logged-in users */}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isLoggedIn ? 'Referral Link' : 'Share Link'}
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
            />
            <button 
              onClick={handleCopyLink}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <Check size={16} />
              ) : (
                <Copy size={16} />
              )}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Share via</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleShare('whatsapp')}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
              <span className="text-sm">WhatsApp</span>
            </button>
            <button 
              onClick={() => handleShare('facebook')}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 bg-blue-600 rounded-full"></div>
              <span className="text-sm">Facebook</span>
            </button>
            <button 
              onClick={() => handleShare('twitter')}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 bg-sky-500 rounded-full"></div>
              <span className="text-sm">Twitter</span>
            </button>
            <button 
              onClick={() => handleShare('email')}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">@</span>
              </div>
              <span className="text-sm">Email</span>
            </button>
          </div>
        </div>
        
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <button 
            onClick={() => handleShare('native')}
            className="w-full mt-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
          >
            More Options
          </button>
        )}
      </div>
    </div>
  );
};

export default ShareProductModal;