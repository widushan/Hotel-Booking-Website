// Currency configuration for the application
export const CURRENCY_CONFIG = {
  // Indian Rupees
  'inr': {
    symbol: '₹',
    name: 'Indian Rupee',
    stripeCode: 'inr',
    position: 'before' // symbol position relative to amount
  },
  // US Dollars
  'usd': {
    symbol: '$',
    name: 'US Dollar',
    stripeCode: 'usd',
    position: 'before'
  },
  // Euro
  'eur': {
    symbol: '€',
    name: 'Euro',
    stripeCode: 'eur',
    position: 'before'
  },
  // British Pound
  'gbp': {
    symbol: '£',
    name: 'British Pound',
    stripeCode: 'gbp',
    position: 'before'
  },
  // Sri Lankan Rupee
  'lkr': {
    symbol: 'Rs.',
    name: 'Sri Lankan Rupee',
    stripeCode: 'lkr',
    position: 'before'
  },
  // Singapore Dollar
  'sgd': {
    symbol: 'S$',
    name: 'Singapore Dollar',
    stripeCode: 'sgd',
    position: 'before'
  }
};

// Get current currency from environment or default to INR
export const getCurrentCurrency = () => {
  const currency = process.env.CURRENCY || 'inr';
  return CURRENCY_CONFIG[currency.toLowerCase()] || CURRENCY_CONFIG['inr'];
};

// Format amount with currency symbol
export const formatCurrency = (amount, currency = null) => {
  const curr = currency || getCurrentCurrency();
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
  
  return curr.position === 'before' 
    ? `${curr.symbol}${formattedAmount}`
    : `${formattedAmount}${curr.symbol}`;
};

// Get Stripe currency code
export const getStripeCurrencyCode = (currency = null) => {
  const curr = currency || getCurrentCurrency();
  return curr.stripeCode;
}; 