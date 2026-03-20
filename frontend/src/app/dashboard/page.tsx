'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">
        Welcome back
      </h1>
      <p className="text-gray-400 text-sm mb-8">{user?.email}</p>

      {/* Stat cards - data wired in later */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Subscription',   value: 'Active',   color: 'text-green-400' },
          { label: 'Draws Entered',  value: '-',        color: 'text-white' },
          { label: 'Total Winnings', value: '£0.00',    color: 'text-white' },
        ].map((card) => (
          <div key={card.label} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}