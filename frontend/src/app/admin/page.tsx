'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import api from '@/lib/axios';

interface Stats {
  total_users: number;
  active_subscribers: number;
  total_prize_pool: number;
  total_charity_contributions: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = useEffectEvent(async () => {
    const res = await api.get('/admin/stats');
    setStats(res.data.data);
  });

  useEffect(() => {
    void fetchStats();
  }, []);

  const cards = stats ? [
    { label: 'Total Users',              value: stats.total_users },
    { label: 'Active Subscribers',       value: stats.active_subscribers },
    { label: 'Total Prize Pool',         value: `£${stats.total_prize_pool?.toFixed(2)}` },
    { label: 'Charity Contributions',    value: `£${stats.total_charity_contributions?.toFixed(2)}` },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
      <p className="text-gray-400 text-sm mb-8">Platform at a glance</p>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-white">{card.value ?? '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
