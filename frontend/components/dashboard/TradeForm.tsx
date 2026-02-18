'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { Trade, TradeFormData } from '@/types';
import { tradeService } from '@/services/api.service';
import { toast } from '@/hooks';
import { cn, ASSETS, EXCHANGES, STRATEGIES } from '@/lib/utils';

const tradeSchema = z.object({
  assetName: z.string().min(1, 'Asset required').max(20),
  assetCategory: z.enum(['crypto', 'forex', 'stocks', 'commodities', 'indices']),
  positionType: z.enum(['long', 'short']),
  entryPrice: z.coerce.number().positive('Must be positive'),
  exitPrice: z.coerce.number().positive().nullable().optional(),
  quantity: z.coerce.number().positive('Must be positive'),
  leverage: z.coerce.number().min(1).max(125),
  stopLoss: z.coerce.number().positive().nullable().optional(),
  takeProfit: z.coerce.number().positive().nullable().optional(),
  fees: z.coerce.number().min(0),
  status: z.enum(['open', 'closed', 'cancelled']),
  tradeNotes: z.string().max(1000).optional().default(''),
  strategy: z.enum(['breakout', 'trend_following', 'mean_reversion', 'scalping', 'arbitrage', 'dca', 'other']),
  exchange: z.string().max(50).optional().default(''),
  tradeDate: z.string(),
  sentiment: z.enum(['bullish', 'bearish', 'neutral']),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

interface TradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTrade?: Trade | null;
}

export default function TradeForm({ isOpen, onClose, onSuccess, editTrade }: TradeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!editTrade;

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      assetCategory: 'crypto',
      positionType: 'long',
      leverage: 1,
      fees: 0,
      status: 'open',
      strategy: 'other',
      sentiment: 'bullish',
      tradeDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (editTrade) {
      reset({
        ...editTrade,
        tradeDate: editTrade.tradeDate ? new Date(editTrade.tradeDate).toISOString().slice(0, 10) : '',
        exitPrice: editTrade.exitPrice ?? undefined,
        stopLoss: editTrade.stopLoss ?? undefined,
        takeProfit: editTrade.takeProfit ?? undefined,
      });
    } else {
      reset({
        assetCategory: 'crypto',
        positionType: 'long',
        leverage: 1,
        fees: 0,
        status: 'open',
        strategy: 'other',
        sentiment: 'bullish',
        tradeDate: new Date().toISOString().slice(0, 10),
      });
    }
  }, [editTrade, reset]);

  const positionType = watch('positionType');
  const status = watch('status');
  const entryPrice = watch('entryPrice');
  const exitPrice = watch('exitPrice');
  const quantity = watch('quantity');
  const leverage = watch('leverage');

  // Live P&L calculation
  const calcPnL = () => {
    if (!entryPrice || !exitPrice || !quantity) return null;
    const priceDiff = positionType === 'long' ? exitPrice - entryPrice : entryPrice - exitPrice;
    return priceDiff * quantity * (leverage || 1);
  };
  const livePnL = calcPnL();

  const onSubmit = async (values: TradeFormValues) => {
    setIsLoading(true);
    try {
      if (isEditing && editTrade) {
        await tradeService.updateTrade(editTrade._id, values as Partial<TradeFormData>);
        toast.success('Trade updated successfully');
      } else {
        await tradeService.createTrade(values as TradeFormData);
        toast.success('Trade created successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save trade');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl glass-card border border-white/10 shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-semibold">
              {isEditing ? 'Edit Trade' : 'New Trade Log'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isEditing ? `Editing ${editTrade?.assetName}` : 'Record a new position'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Position Type */}
          <div className="grid grid-cols-2 gap-3">
            {(['long', 'short'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue('positionType', type)}
                className={cn(
                  'flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-200',
                  positionType === type
                    ? type === 'long'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'border-border/50 text-muted-foreground hover:bg-white/5'
                )}
              >
                {type === 'long' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Asset + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Asset *</label>
              <input
                {...register('assetName')}
                list="assets-list"
                placeholder="BTC, ETH..."
                className="input-dark w-full uppercase"
              />
              <datalist id="assets-list">
                {ASSETS.map((a) => <option key={a} value={a} />)}
              </datalist>
              {errors.assetName && <p className="text-red-400 text-xs mt-1">{errors.assetName.message}</p>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Category</label>
              <select {...register('assetCategory')} className="input-dark w-full">
                {['crypto', 'forex', 'stocks', 'commodities', 'indices'].map((c) => (
                  <option key={c} value={c} className="bg-background">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Entry Price *</label>
              <input {...register('entryPrice')} type="number" step="any" placeholder="0.00" className="input-dark w-full font-mono" />
              {errors.entryPrice && <p className="text-red-400 text-xs mt-1">{errors.entryPrice.message}</p>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Exit Price {status === 'closed' ? '*' : '(optional)'}
              </label>
              <input {...register('exitPrice')} type="number" step="any" placeholder="0.00" className="input-dark w-full font-mono" />
            </div>
          </div>

          {/* Quantity + Leverage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Quantity *</label>
              <input {...register('quantity')} type="number" step="any" placeholder="1.0" className="input-dark w-full font-mono" />
              {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity.message}</p>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Leverage (1-125x)</label>
              <input {...register('leverage')} type="number" min="1" max="125" placeholder="1" className="input-dark w-full font-mono" />
            </div>
          </div>

          {/* Live P&L preview */}
          {livePnL !== null && (
            <div className={cn(
              'flex items-center justify-between px-4 py-3 rounded-xl border font-mono text-sm',
              livePnL >= 0
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            )}>
              <span className="text-xs text-muted-foreground">Estimated P&L</span>
              <span className="font-bold">
                {livePnL >= 0 ? '+' : ''}${livePnL.toFixed(2)}
              </span>
            </div>
          )}

          {/* Stop Loss + Take Profit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Stop Loss</label>
              <input {...register('stopLoss')} type="number" step="any" placeholder="Optional" className="input-dark w-full font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Take Profit</label>
              <input {...register('takeProfit')} type="number" step="any" placeholder="Optional" className="input-dark w-full font-mono" />
            </div>
          </div>

          {/* Strategy + Status + Sentiment */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Strategy</label>
              <select {...register('strategy')} className="input-dark w-full">
                {STRATEGIES.map((s) => (
                  <option key={s.value} value={s.value} className="bg-background">{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
              <select {...register('status')} className="input-dark w-full">
                <option value="open" className="bg-background">Open</option>
                <option value="closed" className="bg-background">Closed</option>
                <option value="cancelled" className="bg-background">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Sentiment</label>
              <select {...register('sentiment')} className="input-dark w-full">
                <option value="bullish" className="bg-background">🐂 Bullish</option>
                <option value="bearish" className="bg-background">🐻 Bearish</option>
                <option value="neutral" className="bg-background">😐 Neutral</option>
              </select>
            </div>
          </div>

          {/* Exchange + Date + Fees */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Exchange</label>
              <input {...register('exchange')} list="exchanges-list" placeholder="Binance..." className="input-dark w-full" />
              <datalist id="exchanges-list">
                {EXCHANGES.map((e) => <option key={e} value={e} />)}
              </datalist>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Trade Date</label>
              <input {...register('tradeDate')} type="date" className="input-dark w-full" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Fees ($)</label>
              <input {...register('fees')} type="number" step="any" placeholder="0.00" className="input-dark w-full font-mono" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Trade Notes</label>
            <textarea
              {...register('tradeNotes')}
              rows={3}
              placeholder="Entry reasoning, market conditions, lessons learned..."
              className="input-dark w-full resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border/60 text-sm text-muted-foreground hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isLoading ? 'Saving...' : isEditing ? 'Update Trade' : 'Create Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
