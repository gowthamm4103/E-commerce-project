export const calculateCredits = (price: number): string => {
  return (price / 100).toFixed(2);
};

export const calculateCreditsUsed = (total: number): number => {
  return Math.ceil(total / 100);
};