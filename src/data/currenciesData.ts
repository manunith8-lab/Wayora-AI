import { CurrencyConfig } from '../types/travel';

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateToUSD: 1.0,
    flag: '🇺🇸',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    rateToUSD: 86.4,
    flag: '🇮🇳',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateToUSD: 0.92,
    flag: '🇪🇺',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateToUSD: 0.79,
    flag: '🇬🇧',
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    name: 'UAE Dirham',
    rateToUSD: 3.67,
    flag: '🇦🇪',
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR ',
    name: 'Saudi Riyal',
    rateToUSD: 3.75,
    flag: '🇸🇦',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    rateToUSD: 152.8,
    flag: '🇯🇵',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    rateToUSD: 7.24,
    flag: '🇨🇳',
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    rateToUSD: 1.38,
    flag: '🇨🇦',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    rateToUSD: 1.54,
    flag: '🇦🇺',
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    rateToUSD: 1.34,
    flag: '🇸🇬',
  },
};

export const EXCHANGE_RATE_LAST_UPDATED = '2026-11-03 12:00 UTC (Live Central FX)';
