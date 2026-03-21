'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface DrawResult {
  winning_numbers: number[];
  winners: { user_id: string; match_type: string }[];
  jackpot_rolled_over: boolean;
}

interface Draw {
  id: string;
  month: string;
  status: string;
  winning_numbers: number[];
  jackpot_rolled_over: boolean;
}

export default function AdminDrawsPage() {
  const [mode, setMode] = useState<'random' | 'algorithmic'>('random');
  const [prizePool, setPrizePool] = useState('');
  const [simulation, setSimulation] = useState<DrawResult | null>(null);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => { fetchDraws(); }, []);

  const fetchDraws = async () => {
    const res = await api.get('/draws');
    setDraws(res.data.data || []);
  };

  const handleSimulate = async () => {
    setLoading(true);
    setSimulation(null);
    try {
      const res = await api.post('/draws/simulate', { mode });
      setSimulation(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDraw = async () => {
    if (!confirm('Run the official draw for this month?')) return;
    setRunning(true);
    try {
      await api.post('/draws/run', {
        mode,
        prize_pool_total: parseFloat(prizePool) || 0,
      });
      await fetchDraws();
      setSimulation(null);
    } finally {
      setRunning(false);
    }
  };

  const handlePublish = async (id: string) => {
    await api.post(`/draws/${id}/publish`);
    await fetchDraws();
  };

  const matchLabel: Record<string, string> = {
    '5_match': '5 Match',
    '4_match': '4 Match',
    '3_match': '3 Match',
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">Draw Control</h1>
      <p className="text-gray-400 text-sm mb-8">Configure and run monthly draws</p>

      {/* Draw config */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">Draw Settings</h2>

        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Draw Mode</label>
          <div className="flex gap-3">
            {(['random', 'algorithmic'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize
                  ${mode === m
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-1 block">Prize Pool Total (£)</label>
          <input
            type="number"
            value={prizePool}
            onChange={(e) => setPrizePool(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g. 500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition"
          >
            {loading ? 'Simulating...' : '👁 Simulate'}
          </button>
          <button
            onClick={handleRunDraw}
            disabled={running}
            className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black text-sm font-semibold py-2.5 rounded-lg transition"
          >
            {running ? 'Running...' : 'Run Draw'}
          </button>
        </div>
      </div>

      {/* Simulation result */}
      {simulation && (
        <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-6 mb-6">
          <p className="text-yellow-400 text-sm font-medium mb-4">
            👁 Simulation Preview - not saved
          </p>

          <div className="flex gap-2 mb-4">
            {simulation.winning_numbers.map((n) => (
              <div
                key={n}
                className="w-9 h-9 rounded-full bg-green-500 text-black text-sm font-bold flex items-center justify-center"
              >
                {n}
              </div>
            ))}
          </div>

          <p className="text-gray-400 text-sm mb-2">
            Winners: {simulation.winners.length}
          </p>

          {simulation.winners.length > 0 && (
            <div className="space-y-1">
              {simulation.winners.map((w, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-500">
                  <span>{w.user_id.slice(0, 8)}...</span>
                  <span>{matchLabel[w.match_type]}</span>
                </div>
              ))}
            </div>
          )}

          {simulation.jackpot_rolled_over && (
            <p className="text-yellow-400 text-xs mt-3">Jackpot would roll over</p>
          )}
        </div>
      )}

      {/* Existing draws */}
      <h2 className="text-white font-semibold mb-3">All Draws</h2>
      {draws.length === 0 ? (
        <p className="text-gray-500 text-sm">No draws yet.</p>
      ) : (
        <div className="space-y-3">
          {draws.map((draw) => (
            <div
              key={draw.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-white font-medium">{draw.month}</p>
                <div className="flex gap-1.5 mt-2">
                  {draw.winning_numbers?.map((n) => (
                    <div
                      key={n}
                      className="w-7 h-7 rounded-full bg-green-500 text-black text-xs font-bold flex items-center justify-center"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                {draw.status === 'draft' ? (
                  <button
                    onClick={() => handlePublish(draw.id)}
                    className="bg-green-500 hover:bg-green-400 text-black text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    Publish
                  </button>
                ) : (
                  <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">
                    Published
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}