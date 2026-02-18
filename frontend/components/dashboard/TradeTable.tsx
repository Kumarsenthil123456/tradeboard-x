'use client';

import { useState } from 'react';
import { Trade } from '@/types';
import { cn, formatCurrency, formatDate, formatPercentage, getPnLColor } from '@/lib/utils';
import { 
  TrendingUp, TrendingDown, Edit2, Trash2, ChevronUp, ChevronDown, 
  MoreHorizontal, Eye, ArrowUpDown
} from 'lucide-react';
import { tradeService } from '@/services/api.service';
import { toast } from '@/hooks';

interface TradeTableProps {
  trades: Trade[];
  isLoading: boolean;
  onEdit: (trade: Trade) => void;
  onRefresh: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    cancelled: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', styles[status])}>
      {status === 'open' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 inline-block animate-pulse" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function TradeSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-white/[0.04]">
          {Array.from({ length: 8 }).map((_, j) => (
            <td key={j} className="px-4 py-4">
              <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function TradeTable({ trades, isLoading, onEdit, onRefresh }: TradeTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (trade: Trade) => {
    if (!confirm(`Delete ${trade.assetName} trade? This cannot be undone.`)) return;
    setDeletingId(trade._id);
    try {
      await tradeService.deleteTrade(trade._id);
      toast.success('Trade deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete trade');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isLoading && trades.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-foreground mb-2">No trades yet</h3>
        <p className="text-muted-foreground text-sm">Create your first trade to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Asset', 'Position', 'Entry', 'Exit', 'Quantity', 'P&L', 'Status', 'Date', ''].map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TradeSkeleton />
          ) : (
            trades.map((trade) => (
              <>
                <tr
                  key={trade._id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === trade._id ? null : trade._id)}
                >
                  {/* Asset */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold',
                        'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400'
                      )}>
                        {trade.assetName.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground font-mono">{trade.assetName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{trade.assetCategory}</p>
                      </div>
                    </div>
                  </td>

                  {/* Position */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      {trade.positionType === 'long' ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                      )}
                      <span className={cn(
                        'text-xs font-semibold uppercase',
                        trade.positionType === 'long' ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {trade.positionType}
                      </span>
                      {trade.leverage > 1 && (
                        <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1 rounded">
                          {trade.leverage}x
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Entry */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-mono text-foreground">
                      ${trade.entryPrice.toLocaleString()}
                    </span>
                  </td>

                  {/* Exit */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-mono text-muted-foreground">
                      {trade.exitPrice ? `$${trade.exitPrice.toLocaleString()}` : '—'}
                    </span>
                  </td>

                  {/* Quantity */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-mono text-foreground">{trade.quantity}</span>
                  </td>

                  {/* P&L */}
                  <td className="px-4 py-4">
                    {trade.status === 'closed' ? (
                      <div>
                        <p className={cn('text-sm font-mono font-semibold', getPnLColor(trade.profitLoss))}>
                          {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                        </p>
                        <p className={cn('text-xs font-mono', getPnLColor(trade.profitLossPercentage))}>
                          {trade.profitLossPercentage >= 0 ? '+' : ''}{trade.profitLossPercentage.toFixed(2)}%
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge status={trade.status} />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4">
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatDate(trade.tradeDate)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(trade)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(trade)}
                        disabled={deletingId === trade._id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                        {expandedId === trade._id ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded row */}
                {expandedId === trade._id && (
                  <tr className="bg-white/[0.015]">
                    <td colSpan={9} className="px-6 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        {[
                          { label: 'Strategy', value: trade.strategy.replace(/_/g, ' ') },
                          { label: 'Exchange', value: trade.exchange || '—' },
                          { label: 'Fees', value: `$${trade.fees}` },
                          { label: 'Sentiment', value: trade.sentiment },
                          { label: 'Stop Loss', value: trade.stopLoss ? `$${trade.stopLoss}` : '—' },
                          { label: 'Take Profit', value: trade.takeProfit ? `$${trade.takeProfit}` : '—' },
                          { label: 'Closed At', value: trade.closedAt ? formatDate(trade.closedAt) : '—' },
                          { label: 'Created', value: formatDate(trade.createdAt) },
                        ].map((item) => (
                          <div key={item.label}>
                            <p className="text-muted-foreground/60 uppercase tracking-wide text-[10px]">{item.label}</p>
                            <p className="text-foreground font-mono capitalize mt-0.5">{item.value}</p>
                          </div>
                        ))}
                        {trade.tradeNotes && (
                          <div className="col-span-2 sm:col-span-4">
                            <p className="text-muted-foreground/60 uppercase tracking-wide text-[10px] mb-1">Notes</p>
                            <p className="text-foreground text-xs leading-relaxed">{trade.tradeNotes}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
