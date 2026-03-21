'use client';

import { useEffect, useMemo, useState } from 'react';

import { SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import api from '@/lib/axios';

interface User {
  id: string;
  full_name: string;
  email?: string;
  role: string;
  subscriptions: { status: string; plan: string }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const activeCount = useMemo(
    () => users.filter((user) => user.subscriptions?.[0]?.status === 'active').length,
    [users],
  );
  const adminCount = useMemo(() => users.filter((user) => user.role === 'admin').length, [users]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Users</h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Review account roles, subscription status, and overall member activity.
        </p>
      </header>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard
          label="Total Accounts"
          value={String(users.length)}
          suffix="loaded"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Active Subscribers"
          value={String(activeCount)}
          suffix="current"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="Admins"
          value={String(adminCount)}
          suffix="with elevated access"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 3 7 4v5c0 5-3.5 8.74-7 10-3.5-1.26-7-5-7-10V7l7-4Z" />
            </svg>
          }
        />
      </div>

      <SectionCard
        title="User Directory"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
            <path d="M3 5h18" />
            <path d="M3 12h18" />
            <path d="M3 19h18" />
          </svg>
        }
        action={<span className="text-xs text-zinc-500">{users.length} records</span>}
        className="overflow-hidden"
      >
        {loading ? (
          <p className="text-zinc-500 text-sm animate-pulse">Loading users...</p>
        ) : users.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e] text-left">
                  <th className="px-4 py-3 text-zinc-500 font-medium">Member</th>
                  <th className="px-4 py-3 text-zinc-500 font-medium">Role</th>
                  <th className="px-4 py-3 text-zinc-500 font-medium">Subscription</th>
                  <th className="px-4 py-3 text-zinc-500 font-medium">Plan</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const sub = user.subscriptions?.[0];
                  return (
                    <tr key={user.id} className="border-b border-[#1e1e1e] last:border-b-0 hover:bg-[#0f0f0f] transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-zinc-100 font-medium">{user.full_name || 'Unnamed user'}</div>
                          <div className="text-xs text-zinc-500 mt-1">{user.email ?? user.id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${user.role === 'admin' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-[#141414] text-zinc-300 border-[#2a2a2a]'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${sub?.status === 'active' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>
                          {sub?.status || 'none'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-400 capitalize">{sub?.plan || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
