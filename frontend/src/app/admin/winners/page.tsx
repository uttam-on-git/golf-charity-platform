'use client';

import { useEffect, useMemo, useState } from 'react';

import { SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import api from '@/lib/axios';

interface Winner {
  id: string;
  match_type: string;
  prize_amount: number;
  verified: boolean;
  payment_status: string;
  profiles?: { full_name?: string | null } | null;
  draws?: { month?: string | null } | null;
}

const matchLabel: Record<string, string> = {
  '5_match': '5 Match',
  '4_match': '4 Match',
  '3_match': '3 Match',
};

function formatMonth(month?: string | null) {
  if (!month) return 'Unknown month';
  return new Date(`${month}-01`).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchWinners();
  }, []);

  const fetchWinners = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/winners');
      setWinners(res.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load winners');
    } finally {
      setLoading(false);
    }
  };

  const updateWinner = async (winner: Winner, nextVerified: boolean, nextPaymentStatus: string) => {
    setSavingId(winner.id);
    setError('');
    try {
      await api.patch(`/admin/winners/${winner.id}/verify`, {
        verified: nextVerified,
        payment_status: nextPaymentStatus,
      });
      await fetchWinners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update winner');
    } finally {
      setSavingId(null);
    }
  };

  const verifiedCount = useMemo(
    () => winners.filter((winner) => winner.verified).length,
    [winners],
  );
  const paidCount = useMemo(
    () => winners.filter((winner) => winner.payment_status === 'paid').length,
    [winners],
  );
  const totalPayout = useMemo(
    () => winners.reduce((sum, winner) => sum + (winner.prize_amount || 0), 0),
    [winners],
  );

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Winners</h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Review payouts, verify winning records, and track payment completion for published draws.
        </p>
      </header>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard
          label="Total Winners"
          value={String(winners.length)}
          suffix="records"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          }
        />
        <StatCard
          label="Verified"
          value={String(verifiedCount)}
          suffix="approved"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          }
        />
        <StatCard
          label="Total Payout"
          value={`${totalPayout.toFixed(2)}`}
          suffix={`${paidCount} paid`}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
      </div>

      <SectionCard
        title="Winner Queue"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
            <path d="M8 21h8" />
            <path d="M12 17v4" />
            <path d="M7 4h10" />
            <path d="M17 4v5a5 5 0 0 1-10 0V4" />
          </svg>
        }
        action={<span className="text-xs text-zinc-500">{winners.length} entries</span>}
      >
        {loading ? (
          <p className="text-zinc-500 text-sm animate-pulse">Loading winners...</p>
        ) : winners.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
            No winners recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {winners.map((winner) => {
              const busy = savingId === winner.id;
              return (
                <div key={winner.id} className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-white font-medium">{winner.profiles?.full_name ?? 'Unknown winner'}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                        {matchLabel[winner.match_type] ?? winner.match_type}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">{formatMonth(winner.draws?.month)}</p>
                    <p className="text-sm text-zinc-300 mt-3">Payout {winner.prize_amount?.toFixed(2) ?? '0.00'}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:justify-end">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${winner.verified ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-[#141414] text-zinc-300 border-[#2a2a2a]'}`}>
                      {winner.verified ? 'Verified' : 'Pending verification'}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${winner.payment_status === 'paid' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'}`}>
                      {winner.payment_status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void updateWinner(winner, true, winner.payment_status === 'paid' ? 'paid' : 'pending')}
                        className="rounded-lg border border-[#1e1e1e] bg-[#141414] px-3 py-2 text-xs font-medium text-white transition hover:border-[#2a2a2a] disabled:opacity-50"
                      >
                        {busy ? 'Saving...' : 'Verify'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void updateWinner(winner, true, 'paid')}
                        className="rounded-lg bg-[#10b981] px-3 py-2 text-xs font-semibold text-[#0a0a0a] transition hover:bg-emerald-400 disabled:opacity-50"
                      >
                        Mark Paid
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
