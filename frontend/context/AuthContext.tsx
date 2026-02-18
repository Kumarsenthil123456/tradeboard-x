'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '@/types';
import apiClient from '@/lib/api';
import { AxiosError } from 'axios';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const { data } = await apiClient.get('/auth/me');
      if (data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: data.data.user, accessToken: token },
        });
      }
    } catch {
      localStorage.removeItem('accessToken');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (credentials: LoginCredentials) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.data });
    }
  };

  const register = async (registerData: RegisterData) => {
    const { data } = await apiClient.post('/auth/register', registerData);
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.data });
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Logout even if API fails
    } finally {
      localStorage.removeItem('accessToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const refreshUser = async () => {
    try {
      const { data } = await apiClient.get('/auth/me');
      if (data.success) {
        dispatch({ type: 'UPDATE_USER', payload: data.data.user });
      }
    } catch {
      // Silently fail
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
