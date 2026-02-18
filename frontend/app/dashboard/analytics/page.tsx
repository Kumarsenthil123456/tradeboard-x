'use client';

import { useState } from 'react';
import { useAnalytics } from '@/hooks';
import { PnLChart, AssetBarChart, StrategyPieChart } from '@/components/dashboard/Charts';
import { cn, formatCurrency, formatPnL } from '@/lib/utils';
import { RefreshCw, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';

const PERIODS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year', value: '1y' },
  { label: 'All Time', value: 'all' },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const { analytics, isLoading, refetch } = useAnalytics(period);
  const s = analytics?.summary;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Analytics</h2>
          <p className="text-sm text-muted-foreground">Deep performance analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/50 rounded-xl p-1 border border-border/50 gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  period === p.value ? 'bg-cyan-500 text-black' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={refetch} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total P&L', value: s ? formatPnL(s.totalPnL) : '$0.00', icon: TrendingUp, positive: !s || s.totalPnL >= 0, sub: `${s?.closedTrades || 0} closed` },
          { label: 'Win Rate', value: s ? `${s.winRate}%` : '0%', icon: Target, positive: !s || s.winRate >= 50, sub: `${s?.winningTrades || 0}W / ${s?.losingTrades || 0}L` },
          { label: 'Profit Factor', value: s?.profitFactor ? `${s.profitFactor}x` : 'N/A', icon: Activity, positive: true, sub: 'Avg profit / avg loss' },
          { label: 'Best Trade', value: s ? formatCurrency(s.bestTrade) : '$0.00', icon: TrendingUp, positive: true, sub: s ? `Worst: ${formatCurrency(s.worstTrade)}` : '' },
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon className={cn('h-4 w-4', metric.positive ? 'text-emerald-400' : 'text-red-400')} />
                <span className={cn('text-[10px] font-mono uppercase tracking-wider', metric.positive ? 'text-emerald-400/60' : 'text-red-400/60')}>
                  {metric.positive ? '▲' : '▼'}
                </span>
              </div>
              <p className={cn('text-2xl font-bold font-mono', metric.positive ? 'text-emerald-400' : 'text-red-400')}>
                {metric.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
              <p className="text-xs text-muted-foreground/60">{metric.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-1">P&L Timeline</h3>
        <p className="text-xs text-muted-foreground mb-4">Daily realized profit & loss</p>
        <div className="h-56">
          {analytics?.dailyPnL && analytics.dailyPnL.length > 0 ? (
            <PnLChart data={analytics.dailyPnL} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Close some trades to see P&L data
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Asset Performance</h3>
          <p className="text-xs text-muted-foreground mb-4">P&L breakdown by asset</p>
          <div className="h-56">
            {analytics?.assetBreakdown && analytics.assetBreakdown.length > 0 ? (
              <AssetBarChart data={analytics.assetBreakdown} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Strategy Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Trade distribution by strategy</p>
          <div className="h-56">
            {analytics?.strategyStats && analytics.strategyStats.length > 0 ? (
              <StrategyPieChart data={analytics.strategyStats} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Asset breakdown table */}
      {analytics?.assetBreakdown && analytics.assetBreakdown.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold">Asset Performance Table</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Asset', 'Total Trades', 'Win Rate', 'Total P&L', 'Avg P&L'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analytics.assetBreakdown.map((asset) => {
                const winRate = asset.totalTrades > 0 ? ((asset.wins / asset.totalTrades) * 100).toFixed(1) : '0';
                const avgPnL = asset.totalTrades > 0 ? asset.totalPnL / asset.totalTrades : 0;
                return (
                  <tr key={asset._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                          {asset._id.slice(0, 2)}
                        </div>
                        <span className="font-mono font-semibold">{asset._id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-mono text-muted-foreground">{asset.totalTrades}</td>
                    <td className="px-5 py-3">
                      <span className={cn('text-sm font-mono', parseFloat(winRate) >= 50 ? 'text-emerald-400' : 'text-red-400')}>
                        {winRate}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('text-sm font-mono font-bold', asset.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {asset.totalPnL >= 0 ? '+' : ''}${asset.totalPnL.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('text-sm font-mono', avgPnL >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {avgPnL >= 0 ? '+' : ''}${avgPnL.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
