'use client';

import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/api.service';
import { User } from '@/types';
import { toast } from '@/hooks';
import {
    Users, Search, RefreshCw, ChevronLeft, ChevronRight,
    Shield, User as UserIcon, Mail, Calendar, Activity
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await userService.getAllUsers(page, 10, search);
            if (data.success && data.data) {
                setUsers(data.data.users);
                setTotal(data.data.total);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const totalPages = Math.ceil(total / 10);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-violet-400" />
                        Admin Panel
                    </h2>
                    <p className="text-sm text-muted-foreground">User management and platform oversight</p>
                </div>
                <button
                    onClick={() => fetchUsers()}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                    <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: total, icon: Users, color: 'text-cyan-400 bg-cyan-400/10' },
                    { label: 'Active Today', value: users.filter(u => u.isActive).length, icon: Activity, color: 'text-emerald-400 bg-emerald-400/10' },
                    { label: 'Platform Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-violet-400 bg-violet-400/10' },
                    { label: 'New Signups', value: 'Recent', icon: UserIcon, color: 'text-amber-400 bg-amber-400/10' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-5">
                        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center mb-3', stat.color)}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                        <p className="text-2xl font-bold font-mono">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search users by name or email..."
                        className="input-dark w-full pl-9"
                    />
                </div>
            </div>

            {/* User Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="px-6 py-4 text-left text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">User</th>
                                <th className="px-6 py-4 text-left text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Role</th>
                                <th className="px-6 py-4 text-left text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Trading Style</th>
                                <th className="px-6 py-4 text-left text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Joined At</th>
                                <th className="px-6 py-4 text-left text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-6 py-4">
                                            <div className="skeleton h-12 w-full rounded-lg" />
                                        </td>
                                    </tr>
                                ))
                            ) : users.length > 0 ? (
                                users.map((u) => (
                                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                                                    {u.username.slice(0, 1).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{u.username}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {u.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                'text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border',
                                                u.role === 'admin'
                                                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                            )}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs capitalize text-muted-foreground">
                                            {u.tradingStyle?.replace('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(u.createdAt)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                'h-2 w-2 rounded-full inline-block mr-2',
                                                u.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'
                                            )} />
                                            <span className="text-xs">{u.isActive ? 'Active' : 'Banned'}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
                        <p className="text-xs text-muted-foreground">
                            Showing page {page} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                                className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
