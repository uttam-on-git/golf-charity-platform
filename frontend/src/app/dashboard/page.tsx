'use client';

import axios from 'axios';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { ScoreItem, SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import { DashboardPageLoader } from '@/components/loading/LoadingUI';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

interface Score {
  id: string;
  score: number;
  played_at: string;
}

interface Draw {
  id: string;
  month: string;
  status: string;
  winning_numbers: number[];
  jackpot_rolled_over: boolean;
}

interface DrawEntry {
  id: string;
  created_at: string;
  draws?: {
    id: string;
    month: string;
    status: string;
    jackpot_rolled_over: boolean;
    prize_pool_total?: number;
  } | null;
}

interface Winning {
  id: string;
  match_type: string;
  prize_amount: number;
  payment_status: string;
}

interface Subscription {
  plan: string;
  status: string;
  renews_at: string;
}

function hasSubscriptionAccess(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  if (!['active', 'cancelled'].includes(subscription.status)) return false;
  if (!subscription.renews_at) return subscription.status === 'active';
  return new Date(subscription.renews_at).getTime() > Date.now();
}

interface Charity {
  id: string;
  name: string;
  description: string;
  is_featured: boolean;
}

interface ProfileResponse {
  charity_id?: string | number | null;
  contribution_percent?: number | null;
  charities?: { name?: string | null } | null;
}

function formatDate(value?: string | null) {
  if (!value) return 'TBD';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMonth(value?: string | null) {
  if (!value) return 'TBD';
  return new Date(`${value}-01`).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

function formatStatus(status?: string | null) {
  if (!status) return 'Inactive';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getInitials(name?: string | null) {
  if (!name) return 'GC';

  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'GC'
  );
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [entries, setEntries] = useState<DrawEntry[]>([]);
  const [winnings, setWinnings] = useState<Winning[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [profileCharityName, setProfileCharityName] = useState<string | null>(null);
  const [contributionPercent, setContributionPercent] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError('');

      try {
        const [scoresRes, drawsRes, entriesRes, winningsRes, subscriptionRes, profileRes] = await Promise.allSettled([
          api.get('/scores'),
          api.get('/draws'),
          api.get('/draws/me/entries'),
          api.get('/draws/me/winnings'),
          api.get('/subscriptions/me'),
          api.get('/auth/me'),
        ]);

        const getResultData = <T,>(
          result: PromiseSettledResult<{ data?: { data?: T } }>,
          fallback: T,
        ): T => {
          if (result.status === 'fulfilled') {
            return (result.value.data?.data as T | undefined) ?? fallback;
          }

          if (axios.isAxiosError(result.reason) && result.reason.response?.status === 402) {
            return fallback;
          }

          throw result.reason;
        };

        const nextScores = getResultData<Score[]>(scoresRes, []);
        const nextDraws = getResultData<Draw[]>(drawsRes, []);
        const nextEntries = getResultData<DrawEntry[]>(entriesRes, []);
        const nextWinnings = getResultData<Winning[]>(winningsRes, []);
        const nextSubscription = getResultData<Subscription | null>(subscriptionRes, null);
        const profile = getResultData<ProfileResponse | null>(profileRes, null);
        const currentCharityId = profile?.charity_id ?? user?.charity_id;
        let currentCharity: Charity | null = null;

        if (currentCharityId) {
          try {
            const charityRes = await api.get(`/charities/${currentCharityId}`);
            currentCharity = (charityRes.data?.data as Charity | null) ?? null;
          } catch {
            currentCharity = null;
          }
        }

        setScores(nextScores);
        setDraws(nextDraws);
        setEntries(nextEntries);
        setWinnings(nextWinnings);
        setSubscription(nextSubscription);
        setProfileCharityName(profile?.charities?.name ?? null);
        setContributionPercent(profile?.contribution_percent ?? 10);
        setSelectedCharity(
          currentCharity ??
            resolveSelectedCharity([], currentCharityId, profile?.charities?.name ?? null),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard overview');
      } finally {
        setLoading(false);
      }
    };

    void fetchOverview();
  }, [user?.charity_id]);

  const userName =
    user?.full_name?.trim() ||
    user?.email?.split('@')[0] ||
    'Member';

  const totalWinnings = useMemo(
    () => winnings.reduce((sum, item) => sum + (item.prize_amount || 0), 0),
    [winnings],
  );

  const latestPublishedDraw = useMemo(
    () => draws[0] ?? null,
    [draws],
  );

  const recentScores = scores.slice(0, 3);
  const activeStatus = hasSubscriptionAccess(subscription);
  const readyScoreSet = scores.length === 5;
  const upcomingEntry = entries.find((entry) => entry.draws?.status === 'draft') ?? null;
  const participationSuffix = upcomingEntry?.draws?.month
    ? `Entered ${formatMonth(upcomingEntry.draws.month)}`
    : activeStatus
      ? readyScoreSet
        ? 'Ready for next draw'
        : `${scores.length}/5 scores stored`
      : 'Subscription required';
  const contributionRate = selectedCharity ? `${contributionPercent}%` : 'Not set';
  const paidWinningsCount = winnings.filter((item) => item.payment_status === 'paid').length;

  if (loading) {
    return (
      <DashboardPageLoader
        title="Loading your overview"
        subtitle="Pulling your membership, scores, draws, and charity impact into one place."
        variant="overview"
      />
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">
          Welcome back, {userName}
        </h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Here&apos;s your live subscription overview, draw status, and latest activity.
        </p>
      </header>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard
          label="Subscription Status"
          value={formatStatus(subscription?.status)}
          accent={
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className={`absolute inline-flex h-full w-full rounded-full ${activeStatus ? 'animate-ping bg-[#10b981] opacity-40' : 'bg-zinc-500/40'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${activeStatus ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-zinc-500'}`} />
              </div>
              <span className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">
                {formatStatus(subscription?.status)}
              </span>
            </div>
          }
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="Draws Entered"
          value={String(entries.length)}
          suffix={participationSuffix}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          }
        />
        <StatCard
          label="Total Winnings"
          value={totalWinnings.toFixed(2)}
          suffix={paidWinningsCount ? `${paidWinningsCount} paid out` : 'No paid wins yet'}
          className="sm:col-span-2 lg:col-span-1"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <section className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 hover:border-[#2a2a2a] transition-colors flex flex-col justify-center">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-base md:text-lg font-medium text-zinc-100 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-[#10b981]" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Latest Draw Snapshot
              </h2>
              <span className="text-[10px] md:text-xs font-semibold px-2.5 py-1 bg-[#1e1e1e] text-zinc-300 rounded-md tracking-wider uppercase border border-[#2a2a2a]">
                {latestPublishedDraw ? formatMonth(latestPublishedDraw.month) : 'No draws'}
              </span>
            </div>

            {latestPublishedDraw ? (
              <>
                <div className="flex gap-3 flex-wrap justify-center pb-4">
                  {(latestPublishedDraw.winning_numbers?.length ? latestPublishedDraw.winning_numbers : ['-', '-', '-', '-', '-']).map((value, index) => (
                    <div key={`${value}-${index}`} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center shadow-inner">
                      <span className="text-3xl sm:text-5xl font-semibold text-zinc-100 font-mono tracking-tighter">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#1e1e1e]">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium mb-1">Status</p>
                      <p className="text-sm text-zinc-100 font-medium capitalize">{latestPublishedDraw.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium mb-1">Jackpot</p>
                      <p className="text-sm text-zinc-100 font-medium">
                        {latestPublishedDraw.jackpot_rolled_over ? 'Rolled over' : 'Settled'}
                      </p>
                    </div>
                  </div>
              </>
            ) : (
              <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
                No draw activity yet. Your latest draw information will appear here once the first draw is available.
              </div>
            )}
          </section>

          <SectionCard
            title="Recent Scores"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400" aria-hidden="true">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            }
            action={
              <Link
                href="/dashboard/scores"
                className="text-sm font-medium text-[#10b981] hover:text-[#059669] transition-colors flex items-center gap-1"
              >
                View all
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            }
          >
            {recentScores.length === 0 ? (
              <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
                No scores submitted yet. Add your first round to start building your draw numbers.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentScores.map((score) => (
                  <ScoreItem
                    key={score.id}
                    score={String(score.score)}
                    course="Stableford round"
                    date={formatDate(score.played_at)}
                    delta={`${score.score} pts`}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="flex flex-col">
          <section className="bg-[#141414] border border-[#1e1e1e] rounded-2xl overflow-hidden hover:border-[#2a2a2a] transition-colors flex flex-col h-full">
            <div className="p-6 border-b border-[#1e1e1e] flex items-center justify-between bg-[#0f0f0f]/50">
              <h2 className="text-base md:text-lg font-medium text-zinc-100 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-rose-500" aria-hidden="true">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                Your Impact
              </h2>
              <div className="flex items-center gap-1.5 bg-[#10b981]/10 px-2.5 py-1 rounded-full border border-[#10b981]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                <span className="text-[10px] md:text-xs font-medium text-[#10b981]">{contributionRate} Contribution</span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="w-full rounded-xl bg-linear-to-br from-[#1a1a1a] via-[#101010] to-[#0a0a0a] border border-[#2a2a2a] p-5 mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_45%)]" />

                <div className="relative z-10 flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-white/95 text-[#0a0a0a] flex items-center justify-center font-bold shadow-lg shrink-0">
                    {getInitials(selectedCharity?.name ?? profileCharityName)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg shadow-sm leading-tight">
                      {selectedCharity?.name ?? profileCharityName ?? 'No charity selected'}
                    </h3>
                    <p className="text-xs text-zinc-300">
                      {selectedCharity?.is_featured ? 'Featured charity partner' : 'Linked to your account'}
                    </p>
                  </div>
                </div>

                <p className="relative z-10 text-sm text-zinc-300 leading-relaxed">
                  {selectedCharity?.description ??
                    'Choose a charity to connect your subscription with a cause and see it reflected across your dashboard.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-4">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Current Plan</span>
                  <span className="text-lg font-semibold text-zinc-100">
                    {subscription?.plan ? formatStatus(subscription.plan) : 'No plan'}
                  </span>
                </div>
                <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-4">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Renews On</span>
                  <span className="text-lg font-semibold text-zinc-100">{formatDate(subscription?.renews_at)}</span>
                </div>
              </div>

              <div className="mt-auto pt-5 border-t border-[#1e1e1e] flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-0.5">Winning Entries</span>
                  <span className="text-xl font-semibold text-zinc-100">{winnings.length}</span>
                </div>
                <Link
                  href="/dashboard/charity"
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-transparent hover:border-[#3f3f46] px-4 py-2 rounded-lg"
                >
                  Manage Charity
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
