'use client';

import { useState } from 'react';
import { useTrades, useDebounce } from '@/hooks';
import TradeTable from '@/components/dashboard/TradeTable';
import TradeForm from '@/components/dashboard/TradeForm';
import { Trade, TradeFilters } from '@/types';
import { Plus, Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TradesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const { trades, meta, isLoading, filters, updateFilters, changePage, refetch } = useTrades({
    ...(debouncedSearch && { search: debouncedSearch }),
  });

  const handleEdit = (trade: Trade) => {
    setEditTrade(trade);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditTrade(null);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Trade Logs</h2>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} total trades` : 'Manage all your positions'}
          </p>
        </div>
        <button
          onClick={() => { setEditTrade(null); setFormOpen(true); }}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
        >
          <Plus className="h-4 w-4" />
          New Trade
        </button>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by asset, notes, exchange..."
              className="input-dark w-full pl-9 pr-9"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
              showFilters
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'border-border/60 text-muted-foreground hover:text-foreground hover:bg-white/5'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 block">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => updateFilters({ status: e.target.value as any })}
                className="input-dark w-full"
              >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 block">Position</label>
              <select
                value={filters.positionType || ''}
                onChange={(e) => updateFilters({ positionType: e.target.value as any })}
                className="input-dark w-full"
              >
                <option value="">All</option>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 block">Sort By</label>
              <select
                value={filters.sortBy || 'tradeDate'}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="input-dark w-full"
              >
                <option value="tradeDate">Date</option>
                <option value="profitLoss">P&L</option>
                <option value="entryPrice">Entry Price</option>
                <option value="assetName">Asset</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 block">Order</label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => updateFilters({ sortOrder: e.target.value as any })}
                className="input-dark w-full"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <TradeTable
          trades={trades}
          isLoading={isLoading}
          onEdit={handleEdit}
          onRefresh={refetch}
        />

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <p className="text-xs text-muted-foreground font-mono">
              Page {meta.page} of {meta.totalPages} ({meta.total} trades)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => changePage(meta.page - 1)}
                disabled={!meta.hasPrevPage}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => changePage(page)}
                  className={cn(
                    'h-7 w-7 rounded-lg text-xs font-mono transition-all',
                    meta.page === page
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => changePage(meta.page + 1)}
                disabled={!meta.hasNextPage}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trade form modal */}
      <TradeForm
        isOpen={formOpen}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
        editTrade={editTrade}
      />
    </div>
  );
}
