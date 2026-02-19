/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// ─── Base URL ─────────────────────────────────────────────────────────────────
const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL || 'https://tradeboard-x-2.onrender.com';

// ─── Axios instance ───────────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Refresh queue ────────────────────────────────────────────────────────────
let isRefreshing = false;

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token as string);
    }
  });
  failedQueue = [];
}

// ─── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: unknown): Promise<any> => {
    const axiosError = error as AxiosError;

    if (!axiosError?.config || !axiosError.response) {
      return Promise.reject(error);
    }

    const originalRequest = axiosError.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (axiosError.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<any>((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // ─── Use separate axios instance for refresh to avoid infinite loop ─────
      const refreshClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
      const response = await refreshClient.post<{ data: { accessToken: string } }>('/auth/refresh', {});

      const newToken = response.data?.data?.accessToken;
      if (!newToken) {
        throw new Error('No accessToken returned from refresh endpoint');
      }

      // ─── Save new token ───────────────────────────────────────────────
      localStorage.setItem('accessToken', newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);
      return apiClient(originalRequest);

    } catch (refreshError: unknown) {
      processQueue(refreshError, null);
      localStorage.removeItem('accessToken');

      // ─── Redirect to login only after refresh fails ────────────────
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }

      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;