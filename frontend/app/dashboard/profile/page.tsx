'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/api.service';
import { toast } from '@/hooks';
import { Loader2, User, Lock, Save, Shield } from 'lucide-react';
import { TRADING_STYLES } from '@/lib/utils';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  bio: z.string().max(200).optional(),
  tradingStyle: z.enum(['scalper', 'day_trader', 'swing_trader', 'position_trader', 'hodler']),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      bio: user?.bio || '',
      tradingStyle: user?.tradingStyle || 'day_trader',
    },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileLoading(true);
    try {
      const res = await userService.updateProfile(data);
      if (res.data.success) {
        updateUser(res.data.data!.user);
        toast.success('Profile updated');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordLoading(true);
    try {
      await userService.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-xl font-bold">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      {/* User summary card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_20px_rgba(0,229,255,0.3)]">
            {user?.username?.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold">{user?.username}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'text-xs px-2 py-0.5 rounded font-medium',
                user?.role === 'admin'
                  ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              )}>
                {user?.role === 'admin' ? '⚡ Admin' : '👤 Trader'}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {user?.tradingStyle?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border/50">
        {[
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'security', label: 'Security', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.key ? 'bg-card text-foreground shadow border border-white/[0.06]' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold mb-5">Edit Profile</h3>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Username</label>
              <input {...profileForm.register('username')} className="input-dark w-full" />
              {profileForm.formState.errors.username && (
                <p className="text-red-400 text-xs mt-1">{profileForm.formState.errors.username.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Bio</label>
              <textarea
                {...profileForm.register('bio')}
                rows={3}
                placeholder="Tell traders about yourself..."
                className="input-dark w-full resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Trading Style</label>
              <select {...profileForm.register('tradingStyle')} className="input-dark w-full">
                {TRADING_STYLES.map((s) => (
                  <option key={s.value} value={s.value} className="bg-background">{s.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50"
            >
              {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Security Form */}
      {activeTab === 'security' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-semibold">Change Password</h3>
          </div>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Current Password</label>
              <input {...passwordForm.register('currentPassword')} type="password" className="input-dark w-full" />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-red-400 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">New Password</label>
              <input {...passwordForm.register('newPassword')} type="password" className="input-dark w-full" />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-400 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Confirm New Password</label>
              <input {...passwordForm.register('confirmPassword')} type="password" className="input-dark w-full" />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50"
            >
              {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
