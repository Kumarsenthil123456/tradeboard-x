'use client';

import { useState } from 'react';
import { useAnalytics } from '@/hooks';
import StatsCards from '@/components/dashboard/StatsCards';
import { PnLChart, AssetBarChart, StrategyPieChart } from '@/components/dashboard/Charts';
import { cn, formatDate, formatPnL, getPnLColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, RefreshCw, Calendar } from 'lucide-react';

const PERIODS = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y', value: '1y' },
  { label: 'All', value: 'all' },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState('30d');
  const { analytics, isLoading, refetch } = useAnalytics(period);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Overview</h2>
          <p className="text-sm text-muted-foreground">Your trading performance at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/50">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  period === p.value
                    ? 'bg-cyan-500 text-black shadow'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={refetch}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards summary={analytics?.summary || {
        totalTrades: 0, totalPnL: 0, winningTrades: 0, losingTrades: 0,
        openTrades: 0, closedTrades: 0, avgProfit: 0, avgLoss: 0,
        bestTrade: 0, worstTrade: 0, totalLong: 0, totalShort: 0,
        winRate: 0, profitFactor: null,
      }} isLoading={isLoading} />

      {/* Charts grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* P&L Chart - 2 cols */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Daily P&L</h3>
              <p className="text-xs text-muted-foreground">Cumulative performance over time</p>
            </div>
          </div>
          <div className="h-48">
            {analytics?.dailyPnL && analytics.dailyPnL.length > 0 ? (
              <PnLChart data={analytics.dailyPnL} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No closed trades in this period
              </div>
            )}
          </div>
        </div>

        {/* Strategy Pie */}
        <div className="glass-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">By Strategy</h3>
            <p className="text-xs text-muted-foreground">Trade distribution</p>
          </div>
          <div className="h-48">
            {analytics?.strategyStats && analytics.strategyStats.length > 0 ? (
              <StrategyPieChart data={analytics.strategyStats} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset breakdown chart + Recent trades */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Asset P&L Chart */}
        <div className="glass-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Asset Performance</h3>
            <p className="text-xs text-muted-foreground">P&L by asset (top 8)</p>
          </div>
          <div className="h-52">
            {analytics?.assetBreakdown && analytics.assetBreakdown.length > 0 ? (
              <AssetBarChart data={analytics.assetBreakdown} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No closed trades
              </div>
            )}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Recent Trades</h3>
              <p className="text-xs text-muted-foreground">Latest 5 positions</p>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3 w-20 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                  </div>
                  <div className="skeleton h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : analytics?.recentTrades?.length ? (
            <div className="space-y-2">
              {analytics.recentTrades.map((trade) => (
                <div key={trade._id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <div className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold',
                    'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400'
                  )}>
                    {trade.assetName.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-mono font-semibold">{trade.assetName}</span>
                      {trade.positionType === 'long' ? (
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      ${trade.entryPrice?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {trade.status === 'closed' ? (
                      <p className={cn('text-sm font-mono font-bold', getPnLColor(trade.profitLoss))}>
                        {formatPnL(trade.profitLoss)}
                      </p>
                    ) : (
                      <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-medium">
                        Open
                      </span>
                    )}
                    <p className="text-[10px] text-muted-foreground">{formatDate(trade.tradeDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No trades yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
