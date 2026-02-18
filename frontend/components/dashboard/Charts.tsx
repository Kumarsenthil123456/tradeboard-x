'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { DailyPnL, AssetBreakdown, StrategyStats } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

// ===== P&L Area Chart =====
interface PnLChartProps { data: DailyPnL[]; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="glass-card px-3 py-2 text-xs font-mono border border-white/10">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className={value >= 0 ? 'text-emerald-400' : 'text-red-400'}>
        {value >= 0 ? '+' : ''}{formatCurrency(value)}
      </p>
      {payload[1] && <p className="text-muted-foreground">Trades: {payload[1].value}</p>}
    </div>
  );
};

export function PnLChart({ data }: PnLChartProps) {
  const formatted = data.map((d) => ({
    date: d._id,
    pnl: d.dailyPnL,
    trades: d.trades,
  }));

  const isPositive = formatted.reduce((acc, d) => acc + d.pnl, 0) >= 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formatted} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
            <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="pnl"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth={2}
          fill="url(#pnlGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ===== Asset Breakdown Bar Chart =====
interface AssetChartProps { data: AssetBreakdown[]; }

export function AssetBarChart({ data }: AssetChartProps) {
  const formatted = data.slice(0, 8).map((d) => ({
    asset: d._id,
    pnl: d.totalPnL,
    trades: d.totalTrades,
    winRate: d.totalTrades > 0 ? Math.round((d.wins / d.totalTrades) * 100) : 0,
  }));

  const AssetTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-card px-3 py-2 text-xs font-mono border border-white/10">
        <p className="text-foreground font-semibold mb-1">{label}</p>
        <p className={payload[0].value >= 0 ? 'text-emerald-400' : 'text-red-400'}>
          P&L: {payload[0].value >= 0 ? '+' : ''}{formatCurrency(payload[0].value)}
        </p>
        <p className="text-muted-foreground">Win Rate: {payload[0].payload.winRate}%</p>
        <p className="text-muted-foreground">Trades: {payload[0].payload.trades}</p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={formatted} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="asset" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} />
        <Tooltip content={<AssetTooltip />} />
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
          {formatted.map((entry, i) => (
            <Cell key={i} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ===== Strategy Pie Chart =====
interface StrategyChartProps { data: StrategyStats[]; }

const STRATEGY_COLORS = ['#00E5FF', '#10b981', '#7C3AED', '#FFB800', '#FF4B4B', '#06b6d4', '#f59e0b'];

export function StrategyPieChart({ data }: StrategyChartProps) {
  const formatted = data.map((d, i) => ({
    name: d._id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value: d.count,
    pnl: d.pnl,
    winRate: d.count > 0 ? Math.round((d.wins / d.count) * 100) : 0,
    color: STRATEGY_COLORS[i % STRATEGY_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={formatted}
          cx="50%"
          cy="45%"
          innerRadius="50%"
          outerRadius="75%"
          dataKey="value"
          paddingAngle={3}
        >
          {formatted.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="glass-card px-3 py-2 text-xs font-mono border border-white/10">
                <p className="text-foreground font-semibold">{d.name}</p>
                <p className="text-muted-foreground">{d.value} trades</p>
                <p className={d.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  P&L: {d.pnl >= 0 ? '+' : ''}{formatCurrency(d.pnl)}
                </p>
                <p className="text-cyan-400">Win rate: {d.winRate}%</p>
              </div>
            );
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: 11, color: 'hsl(215 20% 55%)' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
