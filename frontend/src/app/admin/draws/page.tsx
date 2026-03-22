'use client';

import { useEffect, useMemo, useState } from 'react';

import { SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import api from '@/lib/axios';

interface DrawResult {
  winning_numbers: number[];
  winners: { user_id: string; match_type: string }[];
  jackpot_rolled_over: boolean;
  active_contributors: number;
  base_prize_pool_total: number;
  jackpot_carry_in: number;
  prize_pool_total: number;
}

interface Draw {
  id: string;
  month: string;
  status: string;
  winning_numbers: number[];
  jackpot_rolled_over: boolean;
  prize_pool_total: number;
}

interface PrizePoolPreview {
  active_contributors: number;
  base_prize_pool_total: number;
  jackpot_carry_in: number;
  prize_pool_total: number;
}

const matchLabel: Record<string, string> = {
  '5_match': '5 Match',
  '4_match': '4 Match',
  '3_match': '3 Match',
};

function formatMonth(month: string) {
  return new Date(`${month}-01`).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

export default function AdminDrawsPage() {
  const [mode, setMode] = useState<'random' | 'algorithmic'>('random');
  const [simulation, setSimulation] = useState<DrawResult | null>(null);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [prizePoolPreview, setPrizePoolPreview] = useState<PrizePoolPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void Promise.all([fetchDraws(), fetchPrizePoolPreview()]);
  }, []);

  const fetchDraws = async () => {
    try {
      const res = await api.get('/draws/admin/all');
      setDraws(res.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load draws');
    }
  };

  const fetchPrizePoolPreview = async () => {
    try {
      const res = await api.get('/draws/admin/pool-preview');
      setPrizePoolPreview((res.data?.data as PrizePoolPreview | null) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prize pool preview');
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    setSimulation(null);
    setError('');
    try {
      const res = await api.post('/draws/simulate', { mode });
      setSimulation(res.data.data);
      setPrizePoolPreview((res.data?.data as DrawResult | null) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRunDraw = async () => {
    if (!confirm('Run the official draw for this month?')) return;
    setRunning(true);
    setError('');
    try {
      await api.post('/draws/run', { mode });
      await Promise.all([fetchDraws(), fetchPrizePoolPreview()]);
      setSimulation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Draw run failed');
    } finally {
      setRunning(false);
    }
  };

  const handlePublish = async (id: string) => {
    setError('');
    try {
      await api.post(`/draws/${id}/publish`);
      await fetchDraws();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed');
    }
  };

  const draftCount = useMemo(() => draws.filter((draw) => draw.status === 'draft').length, [draws]);
  const publishedCount = useMemo(() => draws.filter((draw) => draw.status === 'published').length, [draws]);
  const livePoolTotal = prizePoolPreview?.prize_pool_total ?? 0;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Draw Control</h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Simulate outcomes, run official draws, and publish results using the same visual system as the player dashboard.
        </p>
      </header>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard
          label="Draw Mode"
          value={mode === 'random' ? 'Random' : 'Algorithmic'}
          suffix="selected"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 3h5v5" />
              <path d="M4 20 21 3" />
              <path d="M21 16v5h-5" />
              <path d="m15 15 6 6" />
              <path d="M4 4h5v5" />
              <path d="m9 9-6-6" />
            </svg>
          }
        />
        <StatCard
          label="Draft Draws"
          value={String(draftCount)}
          suffix="awaiting publish"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Auto Prize Pool"
          value={livePoolTotal.toFixed(2)}
          suffix="current monthly total"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4 md:gap-6">
        <SectionCard
          title="Run Monthly Draw"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
              <path d="M12 2v20" />
              <path d="m19 9-7-7-7 7" />
            </svg>
          }
        >
          <div className="space-y-5">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block font-medium">Draw mode</label>
              <div className="flex gap-3">
                {(['random', 'algorithmic'] as const).map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => setMode(entry)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition ${mode === entry ? 'bg-[#10b981] text-[#0a0a0a]' : 'bg-[#0a0a0a] border border-[#1e1e1e] text-zinc-300 hover:border-[#2a2a2a]'}`}
                  >
                    {entry}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block font-medium">Prize pool source</label>
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-2">Active members</p>
                    <p className="text-lg font-semibold text-white">{prizePoolPreview?.active_contributors ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-2">Base pool</p>
                    <p className="text-lg font-semibold text-white">{(prizePoolPreview?.base_prize_pool_total ?? 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-2">Jackpot carry-in</p>
                    <p className="text-lg font-semibold text-white">{(prizePoolPreview?.jackpot_carry_in ?? 0).toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-[#10b981]/20 bg-[#10b981]/10 px-4 py-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-zinc-200">Calculated draw total</span>
                  <span className="text-xl font-semibold text-[#8ef0c6]">{livePoolTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSimulate}
                disabled={loading}
                className="flex-1 rounded-xl bg-[#0a0a0a] border border-[#1e1e1e] py-3 text-sm font-medium text-white transition hover:border-[#2a2a2a] disabled:opacity-50"
              >
                {loading ? 'Simulating...' : 'Simulate'}
              </button>
              <button
                type="button"
                onClick={handleRunDraw}
                disabled={running}
                className="flex-1 rounded-xl bg-[#10b981] py-3 text-sm font-semibold text-[#0a0a0a] transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {running ? 'Running...' : 'Run Draw'}
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Simulation Preview"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          }
        >
          {!simulation ? (
            <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
              Run a simulation to preview winning numbers and potential winners before publishing.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-100">
                Preview only. Nothing has been saved yet.
              </div>

              <div className="flex gap-2 flex-wrap">
                {simulation.winning_numbers.map((number) => (
                  <div key={number} className="w-10 h-10 rounded-full bg-[#10b981] text-[#0a0a0a] font-bold text-sm flex items-center justify-center">
                    {number}
                  </div>
                ))}
              </div>

              <div className="text-sm text-zinc-400">Projected winners: {simulation.winners.length}</div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-2">Base pool</p>
                  <p className="text-white font-semibold">{simulation.base_prize_pool_total.toFixed(2)}</p>
                </div>
                <div className="rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-2">Carry-in</p>
                  <p className="text-white font-semibold">{simulation.jackpot_carry_in.toFixed(2)}</p>
                </div>
                <div className="rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-2">Total pool</p>
                  <p className="text-white font-semibold">{simulation.prize_pool_total.toFixed(2)}</p>
                </div>
              </div>

              {simulation.winners.length > 0 ? (
                <div className="space-y-2">
                  {simulation.winners.map((winner, index) => (
                    <div key={`${winner.user_id}-${index}`} className="flex items-center justify-between rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3 text-sm">
                      <span className="text-zinc-300">{winner.user_id.slice(0, 8)}...</span>
                      <span className="text-[#10b981] font-medium">{matchLabel[winner.match_type]}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {simulation.jackpot_rolled_over ? (
                <div className="text-xs text-yellow-300 uppercase tracking-[0.2em]">Jackpot would roll over</div>
              ) : null}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-8 md:mt-10">
        <SectionCard
          title="All Draws"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
          }
          action={<span className="text-xs text-zinc-500">{draws.length} total / {publishedCount} published</span>}
        >
          {draws.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
              No draws yet.
            </div>
          ) : (
            <div className="space-y-3">
              {draws.map((draw) => (
                <div key={draw.id} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-white font-medium">{formatMonth(draw.month)}</p>
                    <p className="text-xs text-zinc-500 mt-1">Prize pool {draw.prize_pool_total?.toFixed(2) ?? '0.00'}</p>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {draw.winning_numbers?.map((number) => (
                        <div key={number} className="w-8 h-8 rounded-full bg-[#10b981] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">
                          {number}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-start md:self-center">
                    {draw.jackpot_rolled_over ? (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                        Rolled over
                      </span>
                    ) : null}
                    {draw.status === 'draft' ? (
                      <button
                        type="button"
                        onClick={() => void handlePublish(draw.id)}
                        className="rounded-lg bg-[#10b981] px-3 py-2 text-xs font-semibold text-[#0a0a0a] transition hover:bg-emerald-400"
                      >
                        Publish
                      </button>
                    ) : (
                      <span className="text-xs bg-[#10b981]/10 text-[#10b981] px-2.5 py-1 rounded-full border border-[#10b981]/20">
                        Published
                      </span>
                    )}
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
