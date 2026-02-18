'use client';

import { Menu, Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

const MOCK_PRICES = [
  { symbol: 'BTC', price: '67,234.50', change: '+2.34%', positive: true },
  { symbol: 'ETH', price: '3,421.88', change: '+1.12%', positive: true },
  { symbol: 'SOL', price: '178.92', change: '-0.87%', positive: false },
  { symbol: 'BNB', price: '456.23', change: '+0.45%', positive: true },
  { symbol: 'AVAX', price: '38.76', change: '-1.23%', positive: false },
];

export default function Header({ onMenuClick, title = 'Dashboard' }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-card/60 backdrop-blur-xl">
      {/* Price Ticker */}
      <div className="border-b border-white/[0.04] bg-black/20">
        <div className="flex items-center h-7 px-4 overflow-hidden">
          <div className="ticker-container flex-1">
            <div className="ticker-scroll flex items-center gap-8">
              {[...MOCK_PRICES, ...MOCK_PRICES].map((item, i) => (
                <span key={i} className="flex items-center gap-2 text-xs whitespace-nowrap">
                  <span className="text-muted-foreground font-mono">{item.symbol}</span>
                  <span className="text-foreground font-mono font-medium">${item.price}</span>
                  <span className={`font-mono text-[10px] ${item.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.change}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <span className="ml-4 text-[10px] text-muted-foreground/50 font-mono whitespace-nowrap">
            LIVE PRICES
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-sm text-muted-foreground border border-border/50 hover:border-border transition-colors min-w-[160px]">
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs">Quick search...</span>
            <kbd className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border font-mono">⌘K</kbd>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400" />
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.slice(0, 1).toUpperCase()}
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
