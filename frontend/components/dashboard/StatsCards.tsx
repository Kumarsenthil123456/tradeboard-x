'use client';

import { TrendingUp, TrendingDown, Activity, Target, BarChart2, Zap } from 'lucide-react';
import { cn, formatCurrency, formatPercentage, formatPnL } from '@/lib/utils';
import { AnalyticsSummary } from '@/types';

interface StatsCardsProps {
  summary: AnalyticsSummary;
  isLoading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="skeleton h-9 w-9 rounded-xl" />
        <div className="skeleton h-5 w-16 rounded" />
      </div>
      <div className="skeleton h-7 w-28 rounded mb-1.5" />
      <div className="skeleton h-4 w-20 rounded" />
    </div>
  );
}

export default function StatsCards({ summary, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const isProfitable = summary.totalPnL >= 0;

  const cards = [
    {
      label: 'Total P&L',
      value: formatPnL(summary.totalPnL),
      sub: `${summary.closedTrades} closed trades`,
      icon: isProfitable ? TrendingUp : TrendingDown,
      iconClass: isProfitable ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10',
      valueClass: isProfitable ? 'text-emerald-400' : 'text-red-400',
      change: summary.profitFactor ? `${summary.profitFactor}x PF` : null,
      changeClass: 'text-muted-foreground',
    },
    {
      label: 'Win Rate',
      value: `${summary.winRate}%`,
      sub: `${summary.winningTrades}W / ${summary.losingTrades}L`,
      icon: Target,
      iconClass: 'text-cyan-400 bg-cyan-400/10',
      valueClass: summary.winRate >= 50 ? 'text-cyan-400' : 'text-amber-400',
      change: summary.winRate >= 60 ? '🔥 Hot streak' : null,
      changeClass: 'text-amber-400',
    },
    {
      label: 'Total Trades',
      value: summary.totalTrades.toString(),
      sub: `${summary.openTrades} open · ${summary.closedTrades} closed`,
      icon: Activity,
      iconClass: 'text-violet-400 bg-violet-400/10',
      valueClass: 'text-foreground',
      change: null,
      changeClass: '',
    },
    {
      label: 'Best Trade',
      value: formatCurrency(summary.bestTrade),
      sub: `Worst: ${formatCurrency(summary.worstTrade)}`,
      icon: Zap,
      iconClass: 'text-amber-400 bg-amber-400/10',
      valueClass: summary.bestTrade > 0 ? 'text-emerald-400' : 'text-muted-foreground',
      change: null,
      changeClass: '',
    },
    {
      label: 'Avg Profit',
      value: formatCurrency(summary.avgProfit || 0),
      sub: `Per winning trade`,
      icon: BarChart2,
      iconClass: 'text-emerald-400 bg-emerald-400/10',
      valueClass: 'text-emerald-400',
      change: null,
      changeClass: '',
    },
    {
      label: 'Avg Loss',
      value: formatCurrency(Math.abs(summary.avgLoss || 0)),
      sub: `Per losing trade`,
      icon: TrendingDown,
      iconClass: 'text-red-400 bg-red-400/10',
      valueClass: 'text-red-400',
      change: null,
      changeClass: '',
    },
    {
      label: 'Long Trades',
      value: summary.totalLong.toString(),
      sub: `${summary.totalTrades > 0 ? ((summary.totalLong / summary.totalTrades) * 100).toFixed(0) : 0}% of total`,
      icon: TrendingUp,
      iconClass: 'text-emerald-400 bg-emerald-400/10',
      valueClass: 'text-foreground',
      change: null,
      changeClass: '',
    },
    {
      label: 'Short Trades',
      value: summary.totalShort.toString(),
      sub: `${summary.totalTrades > 0 ? ((summary.totalShort / summary.totalTrades) * 100).toFixed(0) : 0}% of total`,
      icon: TrendingDown,
      iconClass: 'text-red-400 bg-red-400/10',
      valueClass: 'text-foreground',
      change: null,
      changeClass: '',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="glass-card-hover p-5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', card.iconClass)}>
                <Icon className="h-4 w-4" />
              </div>
              {card.change && (
                <span className={cn('text-xs font-medium', card.changeClass)}>{card.change}</span>
              )}
            </div>
            <p className={cn('text-2xl font-bold font-mono mb-0.5', card.valueClass)}>
              {card.value}
            </p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
