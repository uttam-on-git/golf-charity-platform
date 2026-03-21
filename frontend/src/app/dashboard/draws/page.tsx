'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface Draw {
  id: string;
  month: string;
  winning_numbers: number[];
  status: string;
  jackpot_rolled_over: boolean;
  prize_pool_total: number;
}

interface Winning {
  id: string;
  match_type: string;
  prize_amount: number;
  payment_status: string;
  draws: { month: string; winning_numbers: number[] };
}

export default function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [winnings, setWinnings] = useState<Winning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [drawsRes, winningsRes] = await Promise.all([
        api.get('/draws'),
        api.get('/draws/me/winnings'),
      ]);
      setDraws(drawsRes.data.data || []);
      setWinnings(winningsRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const matchLabel: Record<string, string> = {
    '5_match': '5 Match',
    '4_match': '4 Match',
    '3_match': '3 Match',
  };

  if (loading) {
    return <p className="text-gray-500 text-sm animate-pulse">Loading...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">Monthly Draws</h1>
      <p className="text-gray-400 text-sm mb-8">
        Draws happen once a month. Match 3, 4, or all 5 numbers to win.
      </p>

      {/* My winnings */}
      {winnings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-white font-semibold mb-3">My Winnings</h2>
          <div className="space-y-3">
            {winnings.map((w) => (
              <div
                key={w.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-white text-sm font-medium">
                    {matchLabel[w.match_type]}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {w.draws?.month} · Numbers: {w.draws?.winning_numbers?.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">
                    £{w.prize_amount?.toFixed(2) || '-'}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    w.payment_status === 'paid'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {w.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past draws */}
      <h2 className="text-white font-semibold mb-3">Past Draws</h2>
      {draws.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <p className="text-gray-500 text-sm">No draws published yet.</p>
          <p className="text-gray-600 text-xs mt-1">
            Check back after the first monthly draw!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {draws.map((draw) => (
            <div
              key={draw.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-semibold">{draw.month}</p>
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                  Published
                </span>
              </div>

              {/* Winning numbers */}
              <div className="flex gap-2 mb-3">
                {draw.winning_numbers?.map((n) => (
                  <div
                    key={n}
                    className="w-9 h-9 rounded-full bg-green-500 text-black text-sm font-bold flex items-center justify-center"
                  >
                    {n}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Prize pool: £{draw.prize_pool_total?.toFixed(2)}</span>
                {draw.jackpot_rolled_over && (
                  <span className="text-yellow-400">Jackpot rolled over</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}