import axios from 'axios';
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

// ─── Base URL ────────────────────────────────────────────────────────────────
const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL || 'https://tradeboard-x-2.onrender.com';

// ─── Axios instance ──────────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Refresh queue types ─────────────────────────────────────────────────────
interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else if (token) {
      item.resolve(token);
    }
  });

  failedQueue = [];
};

// ─── Request interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ─── Response interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (!error.config || !error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing → queue request
    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
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
      const refreshClient = axios.create({
        baseURL: API_BASE_URL,
        withCredentials: true,
      });

      const response = await refreshClient.post<{
        data: { accessToken: string };
      }>('/auth/refresh', {});

      const newToken = response.data?.data?.accessToken;

      if (!newToken) {
        throw new Error('No accessToken returned from refresh endpoint');
      }

      // Save token
      localStorage.setItem('accessToken', newToken);

      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      localStorage.removeItem('accessToken');

      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/auth')
      ) {
        window.location.href = '/auth/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
