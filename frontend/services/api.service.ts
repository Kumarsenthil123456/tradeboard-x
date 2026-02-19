import apiClient from '@/lib/api';
import { TradeFormData, TradeFilters, ApiResponse, Trade, DashboardAnalytics, User } from '@/types';

// ===== AUTH SERVICES =====
export const authService = {
  getMe: () => apiClient.get<ApiResponse<{ user: User }>>('/auth/me'),
};

// ===== TRADE SERVICES =====
export const tradeService = {
  getTrades: (filters: TradeFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    return apiClient.get<ApiResponse<Trade[]>>(`/trades?${params.toString()}`);
  },

  getTradeById: (id: string) =>
    apiClient.get<ApiResponse<{ trade: Trade }>>(`/trades/${id}`),

  createTrade: (data: TradeFormData) =>
    apiClient.post<ApiResponse<{ trade: Trade }>>('/trades', data),

  updateTrade: (id: string, data: Partial<TradeFormData>) =>
    apiClient.patch<ApiResponse<{ trade: Trade }>>(`/trades/${id}`, data),

  deleteTrade: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/trades/${id}`),

  bulkDelete: (ids: string[]) =>
    apiClient.delete<ApiResponse<{ deletedCount: number }>>('/trades/bulk', { data: { ids } }),
};

// ===== ANALYTICS SERVICES =====
export const analyticsService = {
  getDashboard: (period: string = '30d') =>
    apiClient.get<ApiResponse<DashboardAnalytics>>(`/analytics/dashboard?period=${period}`),
};

// ===== USER SERVICES =====
export const userService = {
  getProfile: () =>
    apiClient.get<ApiResponse<{ user: User }>>('/users/profile'),

  updateProfile: (data: Partial<User>) =>
    apiClient.patch<ApiResponse<{ user: User }>>('/users/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.patch<ApiResponse<null>>('/users/change-password', {
      currentPassword,
      newPassword,
    }),

  getAllUsers: (page = 1, limit = 20, search = '') =>
    apiClient.get<ApiResponse<{ users: User[]; total: number; page: number }>>(
      `/users/all?page=${page}&limit=${limit}&search=${search}`
    ),
};
