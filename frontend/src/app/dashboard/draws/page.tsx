'use client';

import { useEffect, useMemo, useState } from 'react';

import { SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
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

const matchLabel: Record<string, string> = {
  '5_match': '5 Match',
  '4_match': '4 Match',
  '3_match': '3 Match',
};

function formatMonth(month?: string) {
  if (!month) return 'TBD';
  return new Date(`${month}-01`).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

export default function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [winnings, setWinnings] = useState<Winning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [drawsRes, winningsRes] = await Promise.all([
        api.get('/draws'),
        api.get('/draws/me/winnings'),
      ]);
      setDraws(drawsRes.data.data || []);
      setWinnings(winningsRes.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load draw data');
    } finally {
      setLoading(false);
    }
  };

  const totalWinnings = useMemo(
    () => winnings.reduce((sum, item) => sum + (item.prize_amount || 0), 0),
    [winnings],
  );

  const latestDraw = draws[0];

  if (loading) {
    return <p className="text-zinc-500 text-sm animate-pulse">Loading draw history...</p>;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Draws</h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Review published draw results, your winnings, and the latest prize pool activity.
        </p>
      </header>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard
          label="Total Winnings"
          value={totalWinnings.toFixed(2)}
          suffix="paid out"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          label="Winning Entries"
          value={String(winnings.length)}
          suffix="recorded"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          }
        />
        <StatCard
          label="Latest Published Draw"
          value={latestDraw ? formatMonth(latestDraw.month) : 'No draws'}
          suffix={latestDraw ? `${latestDraw.winning_numbers?.join(' • ')}` : 'Check back soon'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.15fr] gap-4 md:gap-6">
        <SectionCard
          title="Your Winning History"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
              <path d="M8 21h8" />
              <path d="M12 17v4" />
              <path d="M7 4h10" />
              <path d="M17 4v5a5 5 0 0 1-10 0V4" />
            </svg>
          }
        >
          {winnings.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
              No winning entries yet. Your future matches will appear here as soon as a draw lands.
            </div>
          ) : (
            <div className="space-y-3">
              {winnings.map((item) => (
                <div key={item.id} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl p-4 hover:border-[#2a2a2a] transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{matchLabel[item.match_type] ?? item.match_type}</p>
                      <p className="text-xs text-zinc-500 mt-1">{formatMonth(item.draws?.month)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#10b981]">{item.prize_amount?.toFixed(2) ?? '0.00'}</p>
                      <span className={`text-[11px] px-2 py-1 rounded-full border ${item.payment_status === 'paid' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'}`}>
                        {item.payment_status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {item.draws?.winning_numbers?.map((number) => (
                      <div key={`${item.id}-${number}`} className="w-8 h-8 rounded-full bg-[#141414] border border-[#2a2a2a] flex items-center justify-center text-xs font-semibold text-zinc-100">
                        {number}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Published Draws"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
          }
          action={<span className="text-xs text-zinc-500">{draws.length} published</span>}
        >
          {draws.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
              No draws have been published yet.
            </div>
          ) : (
            <div className="space-y-3">
              {draws.map((draw) => (
                <div key={draw.id} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl p-4 hover:border-[#2a2a2a] transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{formatMonth(draw.month)}</p>
                      <p className="text-xs text-zinc-500 mt-1">Prize pool {draw.prize_pool_total?.toFixed(2) ?? '0.00'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {draw.jackpot_rolled_over ? (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                          Jackpot rolled over
                        </span>
                      ) : null}
                      <span className="text-[11px] px-2 py-1 rounded-full bg-[#141414] text-zinc-300 border border-[#2a2a2a]">
                        {draw.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {draw.winning_numbers?.map((number) => (
                      <div key={`${draw.id}-${number}`} className="w-9 h-9 rounded-full bg-[#10b981] text-[#0a0a0a] font-bold text-sm flex items-center justify-center">
                        {number}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
