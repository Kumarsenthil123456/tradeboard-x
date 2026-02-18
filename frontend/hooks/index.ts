'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { tradeService, analyticsService } from '@/services/api.service';
import { Trade, TradeFilters, DashboardAnalytics, PaginationMeta } from '@/types';
import { AxiosError } from 'axios';

// ===== USE TRADES HOOK =====
export function useTrades(initialFilters: TradeFilters = {}) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TradeFilters>({
    page: 1,
    limit: 10,
    sortBy: 'tradeDate',
    sortOrder: 'desc',
    ...initialFilters,
  });

  const fetchTrades = useCallback(async (currentFilters: TradeFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await tradeService.getTrades(currentFilters);
      if (data.success) {
        setTrades(data.data as Trade[]);
        setMeta(data.meta || null);
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setError(axiosErr.response?.data?.message || 'Failed to fetch trades');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades(filters);
  }, [filters, fetchTrades]);

  const updateFilters = useCallback((newFilters: Partial<TradeFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const changePage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const refetch = useCallback(() => {
    fetchTrades(filters);
  }, [filters, fetchTrades]);

  return { trades, meta, isLoading, error, filters, updateFilters, changePage, refetch };
}

// ===== USE ANALYTICS HOOK =====
export function useAnalytics(period: string = '30d') {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (p: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await analyticsService.getDashboard(p);
      if (data.success) setAnalytics(data.data as DashboardAnalytics);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setError(axiosErr.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  const refetch = useCallback(() => fetchAnalytics(period), [period, fetchAnalytics]);

  return { analytics, isLoading, error, refetch };
}

// ===== USE DEBOUNCE HOOK =====
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ===== USE TOAST HOOK =====
type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: string; message: string; type: ToastType }

let toastListeners: Array<(toast: Toast) => void> = [];

export const toast = {
  success: (message: string) => emitToast(message, 'success'),
  error: (message: string) => emitToast(message, 'error'),
  info: (message: string) => emitToast(message, 'info'),
  warning: (message: string) => emitToast(message, 'warning'),
};

function emitToast(message: string, type: ToastType) {
  const id = Math.random().toString(36).slice(2);
  toastListeners.forEach((l) => l({ id, message, type }));
}

export function useToastListener(handler: (toast: Toast) => void) {
  useEffect(() => {
    toastListeners.push(handler);
    return () => { toastListeners = toastListeners.filter((l) => l !== handler); };
  }, [handler]);
}
