'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import api from '@/lib/axios';

interface Score {
  id: string;
  score: number;
  played_at: string;
  created_at: string;
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
    fetchScores();
  }, [fetchScores]);

  const handleAdd = async (e: React.FormEvent) => {
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

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-white mb-1">My Scores</h1>
      <p className="text-gray-400 text-sm mb-8">
        Track your last 5 Stableford scores. Oldest is auto-removed when you add a 6th.
      </p>

      {/* Add score form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">Add New Score</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Stableford Score (1–45)
            </label>
            <input
              type="number"
              min={1}
              max={45}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 32"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Date Played</label>
            <input
              type="date"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold rounded-lg py-2.5 text-sm transition"
          >
            {loading ? 'Adding...' : 'Add Score'}
          </button>
        </form>
      </div>

      {/* Scores list */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Your Scores</h2>
          <span className="text-xs text-gray-500">{scores.length}/5 stored</span>
        </div>

        {fetching ? (
          <p className="text-gray-500 text-sm animate-pulse">Loading...</p>
        ) : scores.length === 0 ? (
          <p className="text-gray-500 text-sm">No scores yet. Add your first one above!</p>
        ) : (
          <ul className="space-y-3">
            {scores.map((s, i) => (
              <li
                key={s.id}
                className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                  <div>
                    <p className="text-white font-bold text-lg">{s.score}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(s.played_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
