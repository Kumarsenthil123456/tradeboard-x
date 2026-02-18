'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Loader2, Eye, EyeOff, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AxiosError } from 'axios';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // ✅ FIX: Inline error state shows exact server message instead of generic toast
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(data);
      router.push('/dashboard');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;

      // ✅ FIX: Log full error to console for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('[login] status:', axiosErr.response?.status);
        console.error('[login] data:', axiosErr.response?.data);
        console.error('[login] full error:', axiosErr);
      }

      // ✅ FIX: Map status codes to user-friendly messages
      let message = 'Login failed. Please try again.';

      if (!axiosErr.response) {
        // No response = backend not running or CORS blocked
        message = 'Cannot connect to server. Make sure the backend is running on port 5000.';
      } else {
        switch (axiosErr.response.status) {
          case 400:
            message = axiosErr.response.data?.message || 'Please fill in all fields.';
            break;
          case 401:
            message = 'Invalid email or password.';
            break;
          case 409:
            message = axiosErr.response.data?.message || 'Account already exists.';
            break;
          case 429:
            message = 'Too many attempts. Please wait a few minutes.';
            break;
          case 500:
            message = 'Server error. Check the backend terminal for details.';
            break;
          default:
            message = axiosErr.response.data?.message || message;
        }
      }

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />
      <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-black font-display tracking-widest">TRADEBOARD X</p>
            <p className="text-[10px] text-cyan-400 font-mono tracking-[0.3em]">AI INTELLIGENCE</p>
          </div>
        </div>

        <div className="glass-card p-8 border border-white/[0.08]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your trading dashboard</p>
          </div>

          {/* ✅ FIX: Inline error banner — always visible, shows exact message */}
          {errorMessage && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm animate-fade-in">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="trader@example.com"
                className="input-dark w-full"
                autoComplete="email"
                onChange={() => setErrorMessage(null)}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-dark w-full pr-10"
                  autoComplete="current-password"
                  onChange={() => setErrorMessage(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            No account?{' '}
            <Link href="/auth/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Create one free
            </Link>
          </p>
        </div>

        {/* ✅ FIX: Dev helper panel — only shown in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-xs font-mono">
            <p className="text-yellow-400 font-semibold mb-2">🛠 Dev Panel</p>
            <p className="text-muted-foreground">
              API: <span className="text-cyan-400">{process.env.NEXT_PUBLIC_API_URL || '⚠️ NEXT_PUBLIC_API_URL not set'}</span>
            </p>
            <p className="text-muted-foreground mt-1">
              Backend health:{' '}
              <a href="http://localhost:5000/health" target="_blank" className="text-cyan-400 underline">
                localhost:5000/health
              </a>
            </p>
            <p className="text-muted-foreground mt-1">
              Demo: <span className="text-cyan-400">demo@tradeboard.x</span> / <span className="text-cyan-400">Demo123!</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
