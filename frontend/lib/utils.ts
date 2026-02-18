import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number, decimals = 2): string => {
  const abs = Math.abs(value);
  const prefix = value >= 0 ? '+' : '-';
  if (abs >= 1_000_000) return `${prefix}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${prefix}$${(abs / 1_000).toFixed(2)}K`;
  return `${prefix}$${abs.toFixed(decimals)}`;
};

export const formatPnL = (value: number): string => {
  if (value >= 0) return `+$${value.toFixed(2)}`;
  return `-$${Math.abs(value).toFixed(2)}`;
};

export const formatPercentage = (value: number): string => {
  if (value >= 0) return `+${value.toFixed(2)}%`;
  return `${value.toFixed(2)}%`;
};

export const formatNumber = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toString();
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getPnLColor = (value: number): string => {
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-red-400';
  return 'text-muted-foreground';
};

export const getPnLBg = (value: number): string => {
  if (value > 0) return 'bg-emerald-500/10 text-emerald-400';
  if (value < 0) return 'bg-red-500/10 text-red-400';
  return 'bg-muted/50 text-muted-foreground';
};

export const getAssetIcon = (asset: string): string => {
  const icons: Record<string, string> = {
    BTC: '₿', ETH: 'Ξ', SOL: '◎', ADA: '₳',
    DOT: '●', AVAX: '△', MATIC: '⬡', BNB: 'Ⓑ',
  };
  return icons[asset.toUpperCase()] || asset.slice(0, 1);
};

export const ASSETS = [
  'BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'AVAX', 'DOT', 'MATIC',
  'LINK', 'UNI', 'ATOM', 'LTC', 'XRP', 'DOGE', 'SHIB',
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AAPL', 'TSLA', 'NVDA',
  'GOLD', 'SILVER', 'OIL',
];

export const EXCHANGES = [
  'Binance', 'Coinbase', 'Bybit', 'OKX', 'Kraken',
  'Bitfinex', 'dYdX', 'GMX', 'Interactive Brokers', 'TD Ameritrade',
];

export const STRATEGIES = [
  { value: 'breakout', label: 'Breakout' },
  { value: 'trend_following', label: 'Trend Following' },
  { value: 'mean_reversion', label: 'Mean Reversion' },
  { value: 'scalping', label: 'Scalping' },
  { value: 'arbitrage', label: 'Arbitrage' },
  { value: 'dca', label: 'DCA' },
  { value: 'other', label: 'Other' },
];

export const TRADING_STYLES = [
  { value: 'scalper', label: 'Scalper' },
  { value: 'day_trader', label: 'Day Trader' },
  { value: 'swing_trader', label: 'Swing Trader' },
  { value: 'position_trader', label: 'Position Trader' },
  { value: 'hodler', label: 'HODLer' },
];

export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
