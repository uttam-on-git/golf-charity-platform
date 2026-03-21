'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Image from 'next/image';

interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_featured: boolean;
}

export default function CharityPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string>('');
  const [percent, setPercent] = useState(10);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [charitiesRes, profileRes] = await Promise.all([
      api.get('/charities'),
      api.get('/auth/me'),
    ]);
    setCharities(charitiesRes.data.data);
    const p = profileRes.data.data;
    if (p.charity_id) setSelected(p.charity_id);
    if (p.charity_contribution_percent) setPercent(p.charity_contribution_percent);
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const res = await api.get(`/charities?search=${e.target.value}`);
    setCharities(res.data.data);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setMessage('');
    try {
      await api.put('/charities/select', {
        charity_id: selected,
        contribution_percent: percent,
      });
      setMessage('Charity updated successfully!');
    } catch {
      setMessage('Failed to update charity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">Choose Your Charity</h1>
      <p className="text-gray-400 text-sm mb-8">
        A minimum of 10% of your subscription supports your chosen charity.
      </p>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Search charities..."
        className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 mb-6"
      />

      {/* Charity cards */}
      <div className="space-y-3 mb-8">
        {charities.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition
              ${selected === c.id
                ? 'border-green-500 bg-green-500/5'
                : 'border-gray-800 bg-gray-900 hover:border-gray-700'
              }`}
          >
            <Image
              src={c.image_url}
              alt={c.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-white font-medium text-sm">{c.name}</p>
                {c.is_featured && (
                  <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-0.5">{c.description}</p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 shrink-0
              ${selected === c.id ? 'border-green-500 bg-green-500' : 'border-gray-600'}`}
            />
          </div>
        ))}
      </div>

      {/* Contribution slider */}
      {selected && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-white font-medium">
              Contribution Percentage
            </label>
            <span className="text-green-400 font-bold">{percent}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={percent}
            onChange={(e) => setPercent(parseInt(e.target.value))}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10% (min)</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {message && (
        <p className="text-sm mb-4 text-green-400">{message}</p>
      )}

      <button
        onClick={handleSave}
        disabled={!selected || saving}
        className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold rounded-lg py-2.5 text-sm transition"
      >
        {saving ? 'Saving...' : 'Save Charity Selection'}
      </button>
    </div>
  );
}
