import { calculateGSTInclusivePrice } from './gst';

export const calculateDiscountPercentage = (sellingPrice: number, mrp: number): number => {
  if (mrp <= sellingPrice) return 0;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
};

export const calculateMRP = (price: number, discountedPrice: number | undefined, category: string): number => {
  const sellingPrice = calculateGSTInclusivePrice(price, category);
  
  if (discountedPrice && discountedPrice > price) {
    return calculateGSTInclusivePrice(discountedPrice, category);
  }
  
  return Math.round(sellingPrice * 1.2);
};