'use client';

import axios from 'axios';
import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import api from '@/lib/axios';

interface Score {
  id: string;
  score: number;
  played_at: string;
  created_at: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [score, setScore] = useState('');
  const [playedAt, setPlayedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.error;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }

    if (err instanceof Error && err.message.trim()) {
      return err.message;
    }

    return fallback;
  };

  const fetchScores = useCallback(async () => {
    setFetching(true);
    try {
      const res = await api.get('/scores');
      setScores(Array.isArray(res.data?.data) ? res.data.data : []);
      setError('');
    } catch (err: unknown) {
      setScores([]);
      setError(getErrorMessage(err, 'Failed to load scores'));
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    void fetchScores();
  }, [fetchScores]);

  const handleAdd = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/scores', {
        score: parseInt(score, 10),
        played_at: playedAt,
      });
      setScore('');
      setPlayedAt('');
      await fetchScores();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to add score'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await api.delete(`/scores/${id}`);
      await fetchScores();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete score'));
    }
  };

  const averageScore = useMemo(() => {
    if (!scores.length) return '0.0';
    const total = scores.reduce((sum, item) => sum + item.score, 0);
    return (total / scores.length).toFixed(1);
  }, [scores]);

  const latestScore = scores[0];
  const bestScore = scores.length ? Math.max(...scores.map((item) => item.score)) : 0;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">My Scores</h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Track your last 5 Stableford scores. When you add a sixth score, the oldest round is removed automatically.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard
          label="Stored Scores"
          value={String(scores.length)}
          suffix="of 5"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          }
        />
        <StatCard
          label="Latest Round"
          value={latestScore ? String(latestScore.score) : '--'}
          suffix={latestScore ? formatDate(latestScore.played_at) : 'No rounds yet'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
        />
        <StatCard
          label="Average / Best"
          value={averageScore}
          suffix={bestScore ? `Best ${bestScore}` : 'Waiting for rounds'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_1.2fr] gap-4 md:gap-6">
        <SectionCard
          title="Add New Score"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          }
        >
          {error ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleAdd} className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium block mb-2">
                Stableford Score
              </label>
              <input
                type="number"
                min={1}
                max={45}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Enter a score between 1 and 45"
                className="w-full bg-[#0a0a0a] border border-[#1e1e1e] text-zinc-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition"
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium block mb-2">
                Date Played
              </label>
              <input
                type="date"
                value={playedAt}
                onChange={(e) => setPlayedAt(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#1e1e1e] text-zinc-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10b981] hover:bg-[#0fb172] disabled:opacity-50 text-[#0a0a0a] font-semibold rounded-xl py-3 text-sm transition-all"
            >
              {loading ? 'Adding score...' : 'Add Score'}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Stored Rounds"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400" aria-hidden="true">
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
          }
          action={<span className="text-xs text-zinc-500">{scores.length}/5 stored</span>}
        >
          {fetching ? (
            <p className="text-zinc-500 text-sm animate-pulse">Loading scores...</p>
          ) : scores.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
              No scores yet. Add your first round to start building your draw numbers.
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl px-4 py-3 flex items-center justify-between hover:border-[#2a2a2a] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500 w-5">{index + 1}</span>
                    <div className="w-11 h-11 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center text-zinc-100 font-bold shrink-0">
                      {item.score}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-100">Round submitted</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{formatDate(item.played_at)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
