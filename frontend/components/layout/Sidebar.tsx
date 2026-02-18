'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, TrendingUp, User, Settings, LogOut, 
  ChevronRight, Zap, BarChart2, Shield, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/trades', icon: TrendingUp, label: 'Trade Logs' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

const adminItems = [
  { href: '/dashboard/admin', icon: Shield, label: 'Admin Panel' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 z-50 flex flex-col',
          'bg-card/80 backdrop-blur-xl border-r border-white/[0.06]',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold font-display tracking-wider text-foreground">
                TRADEBOARD
              </p>
              <p className="text-[10px] text-cyan-400 font-mono tracking-[0.3em]">X — INTELLIGENCE</p>
            </div>
          </Link>
        </div>

        {/* Live indicator */}
        <div className="px-4 py-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-medium">Markets Open</span>
            </div>
            <Activity className="h-3 w-3 ml-auto text-muted-foreground/50" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/50 px-3 mb-2 uppercase">
            Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-400'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive && 'text-cyan-400')} />
                    {item.label}
                    {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {user?.role === 'admin' && (
            <>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/50 px-3 mt-6 mb-2 uppercase">
                Admin
              </p>
              <ul className="space-y-1">
                {adminItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-violet-500/10 text-violet-400'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.username?.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            {user?.role === 'admin' && (
              <span className="text-[10px] bg-violet-500/20 text-violet-400 border border-violet-500/30 px-1.5 py-0.5 rounded font-medium">
                ADMIN
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
