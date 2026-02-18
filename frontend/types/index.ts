// ===== USER TYPES =====
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string | null;
  bio: string;
  tradingStyle: 'scalper' | 'day_trader' | 'swing_trader' | 'position_trader' | 'hodler';
  preferredAssets: string[];
  isActive: boolean;
  lastLogin: string | null;
  tradesCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ===== AUTH TYPES =====
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  tradingStyle?: string;
}

// ===== TRADE TYPES =====
export type PositionType = 'long' | 'short';
export type TradeStatus = 'open' | 'closed' | 'cancelled';
export type AssetCategory = 'crypto' | 'forex' | 'stocks' | 'commodities' | 'indices';
export type Strategy = 'breakout' | 'trend_following' | 'mean_reversion' | 'scalping' | 'arbitrage' | 'dca' | 'other';

export interface Trade {
  _id: string;
  user: string;
  assetName: string;
  assetCategory: AssetCategory;
  positionType: PositionType;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  leverage: number;
  stopLoss: number | null;
  takeProfit: number | null;
  fees: number;
  status: TradeStatus;
  profitLoss: number;
  profitLossPercentage: number;
  tradeNotes: string;
  strategy: Strategy;
  exchange: string;
  tags: string[];
  tradeDate: string;
  closedAt: string | null;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  isWin?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TradeFormData {
  assetName: string;
  assetCategory: AssetCategory;
  positionType: PositionType;
  entryPrice: number;
  exitPrice?: number | null;
  quantity: number;
  leverage: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  fees: number;
  status: TradeStatus;
  tradeNotes: string;
  strategy: Strategy;
  exchange: string;
  tradeDate: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

// ===== ANALYTICS TYPES =====
export interface AnalyticsSummary {
  totalTrades: number;
  totalPnL: number;
  winningTrades: number;
  losingTrades: number;
  openTrades: number;
  closedTrades: number;
  avgProfit: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  totalLong: number;
  totalShort: number;
  winRate: number;
  profitFactor: number | null;
}

export interface AssetBreakdown {
  _id: string;
  totalTrades: number;
  totalPnL: number;
  wins: number;
}

export interface DailyPnL {
  _id: string;
  dailyPnL: number;
  trades: number;
}

export interface StrategyStats {
  _id: string;
  count: number;
  pnl: number;
  wins: number;
}

export interface DashboardAnalytics {
  summary: AnalyticsSummary;
  assetBreakdown: AssetBreakdown[];
  dailyPnL: DailyPnL[];
  strategyStats: StrategyStats[];
  recentTrades: Trade[];
}

// ===== API TYPES =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field: string; message: string }[];
  meta?: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TradeFilters {
  page?: number;
  limit?: number;
  status?: TradeStatus | '';
  assetName?: string;
  positionType?: PositionType | '';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  strategy?: Strategy | '';
}
