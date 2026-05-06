export const getGSTRate = (price: number, category: string): number => {
  if (category === 'Clothing') {
    return price <= 2500 ? 0.05 : 0.18;
  }
  return 0.18;
};

export const calculateGSTInclusivePrice = (price: number, category: string): number => {
  const gstRate = getGSTRate(price, category);
  return Math.round(price * (1 + gstRate));
};

export const calculateGSTBreakdown = (items: Array<{ price: number; quantity: number; category: string }>) => {
  const gst5 = items.reduce((total, item) => {
    const gstRate = getGSTRate(item.price, item.category);
    return gstRate === 0.05 ? total + Math.round(item.price * item.quantity * gstRate) : total;
  }, 0);

  const gst18 = items.reduce((total, item) => {
    const gstRate = getGSTRate(item.price, item.category);
    return gstRate === 0.18 ? total + Math.round(item.price * item.quantity * gstRate) : total;
  }, 0);

  return { gst5, gst18 };
};