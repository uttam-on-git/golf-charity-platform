'use client';

import { useEffect, useMemo, useState } from 'react';

import { SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import { ListSkeleton } from '@/components/loading/LoadingUI';
import api from '@/lib/axios';

interface Charity {
  id: string;
  name: string;
  description: string;
  is_featured: boolean;
}

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchCharities();
  }, []);

  const fetchCharities = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/charities');
      setCharities(res.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load charities');
    } finally {
      setLoading(false);
    }
  };

  const featuredCount = useMemo(
    () => charities.filter((charity) => charity.is_featured).length,
    [charities],
  );

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Charities</h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Review the current charity catalogue that subscribers can browse and support.
        </p>
      </header>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard
          label="Total Charities"
          value={String(charities.length)}
          suffix="available"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          }
        />
        <StatCard
          label="Featured"
          value={String(featuredCount)}
          suffix="highlighted"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          }
        />
        <StatCard
          label="Admin Note"
          value="Read-only"
          suffix="using current API"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 16h.01" />
              <path d="M12 8v4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          }
        />
      </div>

      <SectionCard
        title="Charity Catalogue"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
          </svg>
        }
        action={<span className="text-xs text-zinc-500">{charities.length} entries</span>}
      >
        {loading ? (
          <ListSkeleton rows={5} />
        ) : charities.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
            No charities found.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {charities.map((charity) => (
              <article key={charity.id} className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5 hover:border-[#2a2a2a] transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-white font-medium leading-snug">{charity.name}</h3>
                  {charity.is_featured ? (
                    <span className="text-[11px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded-full border border-[#10b981]/20 whitespace-nowrap">
                      Featured
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">{charity.description}</p>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
