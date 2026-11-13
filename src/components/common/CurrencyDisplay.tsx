import React from 'react';
import { formatCurrency } from '../../services/currencyService';

interface CurrencyDisplayProps {
  amountUSD: number;
  currencyCode: string;
  className?: string;
  showOriginalUSD?: boolean;
  prefix?: string;
  suffix?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amountUSD,
  currencyCode,
  className = 'font-bold text-forest-900 dark:text-gold-400',
  showOriginalUSD = false,
  prefix = '',
  suffix = '',
}) => {
  const formatted = formatCurrency(amountUSD, currencyCode);

  return (
    <span className="inline-flex items-baseline gap-1">
      {prefix && <span className="text-xs font-normal text-gray-500">{prefix}</span>}
      <span className={className}>{formatted}</span>
      {suffix && <span className="text-xs font-normal text-gray-500">{suffix}</span>}
      {showOriginalUSD && currencyCode !== 'USD' && (
        <span className="text-xs text-gray-400 font-normal">
          (~${Math.round(amountUSD).toLocaleString()} USD)
        </span>
      )}
    </span>
  );
};
