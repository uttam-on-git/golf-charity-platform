'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import Logo from '@/components/Logo';
import { DashboardPageLoader } from '@/components/loading/LoadingUI';
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

export default function CharityProfilePage() {
  const params = useParams<{ id: string }>();
  const charityId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [charity, setCharity] = useState<Charity | null>(null);
  const [related, setRelated] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!charityId) return;

    const fetchCharity = async () => {
      setLoading(true);
      setError('');

      try {
        const [charityRes, listRes] = await Promise.all([
          api.get(`/charities/${charityId}`),
          api.get('/charities'),
        ]);

        const current = (charityRes.data?.data as Charity | null) ?? null;
        const list = Array.isArray(listRes.data?.data) ? listRes.data.data : [];

        setCharity(current);
        setRelated(list.filter((item: Charity) => item.id !== charityId).slice(0, 3));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load charity profile');
      } finally {
        setLoading(false);
      }
    };

    void fetchCharity();
  }, [charityId]);

  const badge = useMemo(() => charityBadge(charity?.name ?? 'GC'), [charity?.name]);

  if (loading) {
    return <DashboardPageLoader title="Loading charity profile" subtitle="Pulling the latest charity story, imagery, and impact details." />;
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500 mb-4">Charity Profile</p>
          <h1 className="text-4xl font-semibold tracking-tight">This charity could not be found.</h1>
          <p className="mt-4 text-zinc-400">{error || 'It may have been removed or the link may be out of date.'}</p>
          <Link href="/charities" className="inline-flex mt-8 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#08110d] transition hover:bg-emerald-400">
            Back to directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="grain-overlay" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[32rem] h-[32rem] bg-emerald-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-[rgba(5,5,5,0.84)] backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={34} />
              <span className="font-semibold tracking-tight text-lg">GolfCharity</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/charities" className="text-sm text-zinc-400 hover:text-white transition-colors">
                All charities
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#08110d] transition hover:bg-emerald-400"
              >
                Support Through Membership
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 pt-16 pb-20">
          {error ? (
            <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-zinc-400 mb-6">
                Charity Profile
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-[-0.05em] leading-[0.95]">
                {charity.name}
              </h1>
              <p className="mt-6 max-w-2xl text-base md:text-lg text-zinc-400 leading-relaxed">
                {charity.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {charity.is_featured ? (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                    Featured partner
                  </span>
                ) : null}
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  Public profile
                </span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
              <div className="grid grid-cols-3 gap-4">
                {[
                  ['10%', 'Minimum contribution'],
                  ['Live', 'Directory status'],
                  ['Open', 'Member selection'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/[0.08] bg-[#090909] p-4">
                    <p className="text-2xl font-semibold text-white">{value}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#090909] p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/90 text-[#08110d] flex items-center justify-center font-bold text-lg">
                  {badge}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Ready to support</p>
                  <p className="text-xs text-zinc-500 mt-1">Subscribers can choose this charity during signup and later from their dashboard.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-white/[0.08] bg-[#0a0a0a] overflow-hidden">
              <div className="h-[26rem] relative border-b border-white/[0.06] bg-linear-to-br from-[#151515] via-[#0d0d0d] to-[#070707]">
                {charity.image_url ? (
                  <img src={charity.image_url} alt={charity.name} className="absolute inset-0 h-full w-full object-cover opacity-65" />
                ) : null}
                <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[#050505]/35 to-transparent" />
                <div className="absolute left-6 bottom-6 rounded-2xl border border-white/[0.08] bg-[rgba(5,5,5,0.75)] px-4 py-3 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Partner view</p>
                  <p className="mt-1 text-lg font-semibold text-white">{charity.name}</p>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Why it matters here</p>
                    <p className="text-sm leading-relaxed text-zinc-300">
                      GolfCharity is designed to keep impact visible, not hidden. This partner sits inside the same experience as membership, scores, draws, and winnings so support feels immediate.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Upcoming events</p>
                    <p className="text-sm leading-relaxed text-zinc-300">
                      Event programming can be surfaced here once your charity data model adds event records. The layout is ready for charity golf days, fundraisers, and local activations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Support Path</p>
                <h2 className="text-2xl font-semibold tracking-tight text-white">Choose this cause when you join.</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  New members can select a charity during signup, and active subscribers can switch partners later from the dashboard while keeping their contribution percentage in sync.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link href="/register" className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#08110d] transition hover:bg-emerald-400 text-center">
                    Create account
                  </Link>
                  <Link href="/charities" className="rounded-full border border-white/[0.08] bg-[#0a0a0a] px-5 py-3 text-sm font-medium text-zinc-300 transition hover:text-white text-center">
                    Browse more charities
                  </Link>
                </div>
              </div>

              {related.length > 0 ? (
                <div className="rounded-[2rem] border border-white/[0.08] bg-[#0a0a0a] p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">More Partners</p>
                  <div className="space-y-3">
                    {related.map((item) => (
                      <Link
                        key={item.id}
                        href={`/charities/${item.id}`}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 transition hover:border-white/[0.14]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-white/90 text-[#08110d] flex items-center justify-center font-bold text-sm">
                            {charityBadge(item.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{item.name}</p>
                            <p className="text-xs text-zinc-500 mt-1">{item.is_featured ? 'Featured partner' : 'Directory profile'}</p>
                          </div>
                        </div>
                        <span className="text-zinc-500">&rarr;</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
