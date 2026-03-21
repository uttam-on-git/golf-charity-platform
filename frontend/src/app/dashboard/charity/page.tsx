'use client';

import { useEffect, useMemo, useState } from 'react';

import { SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import { ListSkeleton } from '@/components/loading/LoadingUI';
import api from '@/lib/axios';

interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_featured: boolean;
}

interface ProfileResponse {
  charity_id?: string | number | null;
  charities?: { name?: string | null } | null;
}

function resolveSelectedCharity(
  charities: Charity[],
  charityId?: string | number | null,
  charityName?: string | null,
) {
  const byId = charities.find((charity) => String(charity.id) === String(charityId));
  if (byId) return byId;

  if (charityName) {
    return charities.find((charity) => charity.name === charityName) ?? null;
  }

  return null;
}

function charityBadge(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export default function CharityPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string>('');
  const [percent, setPercent] = useState(10);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profileCharityName, setProfileCharityName] = useState<string | null>(null);

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    setFetching(true);
    setError('');

    try {
      const [charitiesRes, profileRes] = await Promise.all([
        api.get('/charities'),
        api.get('/auth/me'),
      ]);

      const nextCharities = charitiesRes.data.data || [];
      const profile = (profileRes.data.data || {}) as ProfileResponse;

      setCharities(nextCharities);
      if (profile.charity_id) setSelected(String(profile.charity_id));
      setProfileCharityName(profile.charities?.name ?? null);
      setPercent(10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load charities');
    } finally {
      setFetching(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearch(value);
    try {
      const res = await api.get(`/charities?search=${encodeURIComponent(value)}`);
      setCharities(res.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.put('/charities/select', {
        charity_id: selected,
        contribution_percent: percent,
      });

      const profileRes = await api.get('/auth/me');
      const refreshedProfile = (profileRes.data.data || {}) as ProfileResponse;
      const currentId = refreshedProfile.charity_id ?? selected;
      const currentRes = await api.get(`/charities/${currentId}`);
      const current = (currentRes.data.data as Charity | null) ?? resolveSelectedCharity(
        charities,
        currentId,
        refreshedProfile.charities?.name ?? null,
      );

      setSelected(String(currentId));
      setProfileCharityName(refreshedProfile.charities?.name ?? current?.name ?? profileCharityName);
      setMessage('Charity selection updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update charity');
    } finally {
      setSaving(false);
    }
  };

  const featuredCount = useMemo(
    () => charities.filter((charity) => charity.is_featured).length,
    [charities],
  );

  const selectedCharity = charities.find((charity) => charity.id === selected) ?? null;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Charity</h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Choose the organisation your subscription supports and adjust the percentage you give back.
        </p>
      </header>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="bg-[#10b981]/10 border border-[#10b981]/20 text-[#8ef0c6] text-sm rounded-xl px-4 py-3 mb-6">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard
          label="Selected Charity"
          value={profileCharityName ?? 'Not chosen'}
          suffix={selectedCharity?.is_featured ? 'Featured partner' : 'Ready to update'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          }
        />
        <StatCard
          label="Contribution Rate"
          value={`${percent}%`}
          suffix="minimum 10%"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          label="Available Charities"
          value={String(charities.length)}
          suffix={`${featuredCount} featured`}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4 md:gap-6">
        <SectionCard
          title="Choose a Charity"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          }
        >
          <input
            type="text"
            value={search}
            onChange={(e) => void handleSearch(e.target.value)}
            placeholder="Search charities..."
            className="w-full bg-[#0a0a0a] border border-[#1e1e1e] text-zinc-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition mb-5"
          />

          {fetching ? (
            <ListSkeleton rows={5} />
          ) : (
            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1 dashboard-scroll">
              {charities.map((charity) => {
                const isSelected = selected === charity.id;
                return (
                  <button
                    key={charity.id}
                    type="button"
                    onClick={() => setSelected(charity.id)}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition ${
                      isSelected
                        ? 'border-[#10b981] bg-[#10b981]/5'
                        : 'border-[#1e1e1e] bg-[#0a0a0a] hover:border-[#2a2a2a] hover:bg-[#0f0f0f]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#2a2a2a] flex items-center justify-center text-[#10b981] font-semibold shrink-0">
                      {charityBadge(charity.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-zinc-100 truncate">{charity.name}</p>
                        {charity.is_featured ? (
                          <span className="text-[11px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded-full border border-[#10b981]/20">
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2">{charity.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${isSelected ? 'border-[#10b981] bg-[#10b981]' : 'border-zinc-600'}`} />
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Your Impact"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500" aria-hidden="true">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          }
        >
          <div className="rounded-2xl bg-[#0a0a0a] border border-[#1e1e1e] p-5 mb-5">
            <div className="w-full h-44 rounded-xl bg-linear-to-br from-[#1a1a1a] via-[#101010] to-[#0a0a0a] border border-[#222] flex items-end p-5 mb-4 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_45%)]" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/95 text-[#0a0a0a] flex items-center justify-center font-bold shadow-lg">
                  {selectedCharity ? charityBadge(selectedCharity.name) : 'GC'}
                </div>
                <div>
                  <p className="text-white font-semibold text-lg leading-tight">
                    {selectedCharity?.name ?? profileCharityName ?? 'Select a charity'}
                  </p>
                  <p className="text-xs text-zinc-300 mt-1">
                    {selectedCharity ? 'Ready to support with your subscription' : 'Choose a partner to continue'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed">
              {selectedCharity?.description ?? 'Once you select a charity, your recurring contribution will be applied automatically every billing cycle.'}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-zinc-100">Contribution Percentage</label>
              <span className="text-[#10b981] font-semibold">{percent}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={percent}
              onChange={(e) => setPercent(parseInt(e.target.value, 10))}
              className="w-full accent-[#10b981]"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              <span>10% minimum</span>
              <span>100% maximum</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!selected || saving}
            className="w-full bg-[#10b981] hover:bg-[#0fb172] disabled:opacity-50 text-[#0a0a0a] font-semibold rounded-xl py-3 text-sm transition-all"
          >
            {saving ? 'Saving charity...' : 'Save Charity Selection'}
          </button>
        </SectionCard>
      </div>
    </div>
  );
}
