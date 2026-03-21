'use client';

import { useEffect, useEffectEvent, useMemo, useState } from 'react';

import { SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import api from '@/lib/axios';

interface Stats {
  total_users: number;
  active_subscribers: number;
  total_prize_pool: number;
  total_charity_contributions: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useEffectEvent(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void fetchStats();
  }, []);

  const cards = useMemo(
    () => [
      {
        label: 'Total Users',
        value: String(stats?.total_users ?? 0),
        suffix: 'registered',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        label: 'Active Subscribers',
        value: String(stats?.active_subscribers ?? 0),
        suffix: 'currently live',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        ),
      },
      {
        label: 'Prize Pool Total',
        value: `${stats?.total_prize_pool?.toFixed(2) ?? '0.00'}`,
        suffix: 'awarded to draws',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
          </svg>
        ),
      },
      {
        label: 'Charity Contributions',
        value: `${stats?.total_charity_contributions?.toFixed(2) ?? '0.00'}`,
        suffix: 'estimated total',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        ),
      },
    ],
    [stats],
  );

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Admin Overview</h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Monitor the platform, track subscriptions, and stay on top of overall draw performance.
        </p>
      </header>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-zinc-500 text-sm animate-pulse">Loading admin stats...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
            {cards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <SectionCard
            title="Operations Snapshot"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5">
                <div className="text-sm text-zinc-500 mb-2">Conversion health</div>
                <div className="text-white font-semibold text-lg tracking-tight">
                  {stats?.total_users ? `${Math.round(((stats.active_subscribers ?? 0) / stats.total_users) * 100)}%` : '0%'}
                </div>
                <p className="text-xs text-zinc-500 mt-2">Active subscribers versus total accounts.</p>
              </div>
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5">
                <div className="text-sm text-zinc-500 mb-2">Prize-to-charity ratio</div>
                <div className="text-white font-semibold text-lg tracking-tight">90 / 10</div>
                <p className="text-xs text-zinc-500 mt-2">Current platform split based on your admin stats endpoint.</p>
              </div>
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5">
                <div className="text-sm text-zinc-500 mb-2">Recommended next step</div>
                <div className="text-white font-semibold text-lg tracking-tight">Review pending draws</div>
                <p className="text-xs text-zinc-500 mt-2">Use Draw Control to simulate and publish safely.</p>
              </div>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
