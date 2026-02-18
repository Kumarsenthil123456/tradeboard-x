'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { AxiosError } from 'axios';
import { TRADING_STYLES } from '@/lib/utils';

const registerSchema = z.object({
  username: z.string().min(3, 'Min 3 chars').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 chars').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Must include uppercase, lowercase, and number'
  ),
  confirmPassword: z.string(),
  tradingStyle: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { tradingStyle: 'day_trader' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        tradingStyle: data.tradingStyle,
      });
      toast.success('Account created! Welcome to TradeBoard X');
      router.push('/dashboard');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      toast.error(axiosErr.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
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
            <h1 className="text-2xl font-bold mb-1">Create account</h1>
            <p className="text-sm text-muted-foreground">Start your trading intelligence journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Username</label>
              <input {...register('username')} placeholder="traderx99" className="input-dark w-full" />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <input {...register('email')} type="email" placeholder="trader@example.com" className="input-dark w-full" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  className="input-dark w-full pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" placeholder="••••••••" className="input-dark w-full" />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Trading Style</label>
              <select {...register('tradingStyle')} className="input-dark w-full">
                {TRADING_STYLES.map((s) => (
                  <option key={s.value} value={s.value} className="bg-background">{s.label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] disabled:opacity-50 mt-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isLoading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
