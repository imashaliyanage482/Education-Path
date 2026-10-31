export const formatCurrencyLKR = (amount: number): string => {
  if (amount === 0) {
    return 'Free (State Funded)';
  }
  return `LKR ${amount.toLocaleString('en-US')}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
