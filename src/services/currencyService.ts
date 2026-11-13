import { CURRENCIES, EXCHANGE_RATE_LAST_UPDATED } from '../data/currenciesData';

export function convertFromUSD(amountInUSD: number, targetCurrencyCode: string): number {
  const currency = CURRENCIES[targetCurrencyCode] || CURRENCIES.USD;
  return amountInUSD * currency.rateToUSD;
}

export function formatCurrency(
  amountInUSD: number, 
  targetCurrencyCode: string, 
  options: { showSymbol?: boolean; round?: boolean } = {}
): string {
  const currency = CURRENCIES[targetCurrencyCode] || CURRENCIES.USD;
  const converted = amountInUSD * currency.rateToUSD;
  const showSymbol = options.showSymbol ?? true;
  const round = options.round ?? true;

  const formattedNumber = round
    ? Math.round(converted).toLocaleString()
    : converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return showSymbol ? `${currency.symbol}${formattedNumber}` : formattedNumber;
}

export function getExchangeRateInfo(currencyCode: string) {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return {
    code: currency.code,
    symbol: currency.symbol,
    rate: currency.rateToUSD,
    lastUpdated: EXCHANGE_RATE_LAST_UPDATED,
  };
}
