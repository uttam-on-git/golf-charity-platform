'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import Logo from '@/components/Logo';
import { ListSkeleton } from '@/components/loading/LoadingUI';
import api from '@/lib/axios';

interface Charity {
  id: string;
  name: string;
  description: string;
  image_url?: string | null;
  is_featured: boolean;
}

function charityBadge(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export default function PublicCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCharities = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await api.get('/charities');
        setCharities(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load charities');
      } finally {
        setLoading(false);
      }
    };

    void fetchCharities();
  }, []);

  const featured = useMemo(
    () => charities.filter((charity) => charity.is_featured).slice(0, 3),
    [charities],
  );

  const filtered = useMemo(() => {
    return charities.filter((charity) => {
      const matchesSearch =
        !search ||
        charity.name.toLowerCase().includes(search.toLowerCase()) ||
        charity.description.toLowerCase().includes(search.toLowerCase());

      if (showFeaturedOnly && !charity.is_featured) {
        return false;
      }

      return matchesSearch;
    });
  }, [charities, search, showFeaturedOnly]);

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="grain-overlay" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[24rem] bg-emerald-500/10 blur-[140px]" />
        <div className="absolute right-[-10%] top-[18rem] w-[22rem] h-[22rem] bg-cyan-400/8 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-[rgba(5,5,5,0.82)] backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={34} />
              <span className="font-semibold tracking-tight text-lg">GolfCharity</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Home
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#08110d] transition hover:bg-emerald-400"
              >
                Join the Draw
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 pt-16 pb-20">
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-end mb-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-zinc-400 mb-6">
                Browse Charity Partners
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-[-0.05em] leading-[0.95] max-w-4xl">
                Causes worth
                <span className="block text-emerald-400">playing for.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base md:text-lg text-zinc-400 leading-relaxed">
                Explore the organisations behind the GolfCharity mission. Every membership sends a live contribution toward a cause that matters, and featured partners are surfaced first so impact stays visible.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Featured</p>
                  <p className="text-3xl font-semibold text-white">{featured.length}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Directory</p>
                  <p className="text-3xl font-semibold text-white">{charities.length}</p>
                </div>
              </div>
              <p className="mt-5 text-sm text-zinc-400 leading-relaxed">
                Built to feel like an impact gallery, not a stale database. Pick a charity later in your member dashboard or start by seeing who you would support.
              </p>
            </div>
          </section>

          {featured.length > 0 ? (
            <section className="mb-14">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Spotlight</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-white mt-1">Featured Partners</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFeaturedOnly((value) => !value)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] transition ${
                    showFeaturedOnly
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:text-white'
                  }`}
                >
                  {showFeaturedOnly ? 'Showing Featured' : 'Filter Featured'}
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {featured.map((charity, index) => (
                  <Link
                    key={charity.id}
                    href={`/charities/${charity.id}`}
                    className={`group rounded-[2rem] border border-white/[0.08] p-6 transition hover:border-emerald-500/30 hover:bg-white/[0.03] ${
                      index === 0 ? 'bg-linear-to-br from-emerald-500/12 via-white/[0.02] to-transparent' : 'bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-white/90 text-[#09110d] flex items-center justify-center font-bold text-lg">
                        {charityBadge(charity.name)}
                      </div>
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
                        Featured
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight text-white">{charity.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">{charity.description}</p>
                    <div className="mt-8 flex items-center justify-between text-sm text-zinc-300">
                      <span>View profile</span>
                      <span className="transition group-hover:translate-x-1">&rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-[2rem] border border-white/[0.08] bg-white/[0.02] p-5 md:p-6 mb-8">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by charity name or mission..."
                className="w-full rounded-2xl border border-white/[0.08] bg-[#090909] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={() => setShowFeaturedOnly((value) => !value)}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  showFeaturedOnly
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/[0.08] bg-[#090909] text-zinc-300 hover:text-white'
                }`}
              >
                {showFeaturedOnly ? 'Featured Only' : 'All Charities'}
              </button>
              <div className="text-sm text-zinc-500">{filtered.length} results</div>
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          ) : loading ? (
            <ListSkeleton rows={6} />
          ) : filtered.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/[0.12] bg-white/[0.02] px-6 py-16 text-center text-zinc-500">
              No charities match that search yet.
            </div>
          ) : (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((charity) => (
                <Link
                  key={charity.id}
                  href={`/charities/${charity.id}`}
                  className="group rounded-[2rem] border border-white/[0.08] bg-[#0a0a0a] overflow-hidden transition hover:-translate-y-0.5 hover:border-white/[0.16]"
                >
                  <div className="h-44 border-b border-white/[0.06] bg-linear-to-br from-[#151515] via-[#0d0d0d] to-[#070707] relative overflow-hidden">
                    {charity.image_url ? (
                      <Image
                        loader={({ src }) => src}
                        unoptimized
                        src={charity.image_url}
                        alt={charity.name}
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover opacity-55"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                    <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-white/90 text-[#09110d] flex items-center justify-center font-bold">
                      {charityBadge(charity.name)}
                    </div>
                    {charity.is_featured ? (
                      <span className="absolute top-4 right-4 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold tracking-tight text-white">{charity.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-4">{charity.description}</p>
                    <div className="mt-6 flex items-center justify-between text-sm text-zinc-300">
                      <span>Open charity profile</span>
                      <span className="transition group-hover:translate-x-1">&rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
