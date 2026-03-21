'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import { DashboardPageLoader } from '@/components/loading/LoadingUI';
import api from '@/lib/axios';

interface Subscription {
  plan: string;
  status: string;
  renews_at: string;
}

function formatDate(value?: string | null) {
  if (!value) return 'TBD';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function SubscriptionPage() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    void fetchSub();
  }, []);

  useEffect(() => {
    if (!success) return;

    let stopped = false;

    const pollSubscription = async () => {
      if (sessionId) {
        try {
          const res = await api.post('/subscriptions/confirm-session', {
            session_id: sessionId,
          });

          if (res.data?.data) {
            setSub(res.data.data as Subscription);
            setLoading(false);
            return;
          }
        } catch {
          // Fall back to polling /subscriptions/me in case webhook wins the race.
        }
      }

      for (let attempt = 0; attempt < 4; attempt += 1) {
        const found = await fetchSub(attempt === 0);
        if (found || stopped) return;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    };

    void pollSubscription();

    return () => {
      stopped = true;
    };
  }, [sessionId, success]);

  const fetchSub = async (skipLoading = false) => {
    if (!skipLoading) setLoading(true);

    try {
      const res = await api.get('/subscriptions/me');
      const nextSub = res.data.data as Subscription | null;
      setSub(nextSub);
      return Boolean(nextSub);
    } catch {
      setError('Unable to load subscription details right now.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: string) => {
    setCheckoutLoading(plan);
    setError(null);

    try {
      const res = await api.post('/subscriptions/checkout', { plan });
      if (!res.data?.url) {
        throw new Error('Checkout URL missing from API response');
      }

      window.location.href = res.data.url;
    } catch {
      setError('Unable to start checkout right now. Please try again.');
      setCheckoutLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel?')) return;

    try {
      setError(null);
      await api.post('/subscriptions/cancel');
      await fetchSub();
    } catch {
      setError('Unable to cancel the subscription right now.');
    }
  };

  const planLabel = useMemo(() => {
    if (!sub?.plan) return 'None';
    return sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1);
  }, [sub]);

  if (loading) {
    return <DashboardPageLoader title="Loading subscription details" subtitle="Pulling your plan, renewal timing, and billing status." />;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Subscription</h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Manage your membership plan, renewal timing, and billing status.
        </p>
      </header>

      {success ? (
        <div className="bg-[#10b981]/10 border border-[#10b981]/20 text-[#8ef0c6] text-sm rounded-xl px-4 py-3 mb-6">
          Subscription activated. Welcome aboard.
        </div>
      ) : null}
      {cancelled ? (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm rounded-xl px-4 py-3 mb-6">
          Checkout cancelled. No charges were made.
        </div>
      ) : null}
      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard
          label="Current Plan"
          value={planLabel}
          suffix={sub ? 'Stripe-backed membership' : 'Choose a plan'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="Status"
          value={sub?.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : 'Inactive'}
          suffix={sub?.status === 'active' ? 'All benefits enabled' : 'No active billing'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v20" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          label="Renews On"
          value={sub?.renews_at ? formatDate(sub.renews_at) : 'Not scheduled'}
          suffix={sub?.status === 'cancelled' ? 'Ends at period close' : 'Next billing cycle'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
          }
        />
      </div>

      {sub && sub.status === 'active' ? (
        <SectionCard
          title="Active Membership"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="rounded-2xl bg-[#0a0a0a] border border-[#1e1e1e] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium mb-2">Membership Summary</p>
              <h3 className="text-2xl font-semibold text-zinc-100 mb-2">{planLabel} Plan</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                Your subscription is active and your dashboard benefits remain unlocked, including score submissions, charity selection, and draw participation.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] px-2 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">Active</span>
                <span className="text-[11px] px-2 py-1 rounded-full bg-[#141414] text-zinc-300 border border-[#2a2a2a]">Renews {formatDate(sub.renews_at)}</span>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-sm font-medium text-red-300 hover:text-white transition-colors bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-transparent hover:border-[#3f3f46] px-4 py-2.5 rounded-lg"
            >
              Cancel subscription
            </button>
          </div>
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {[
            {
              plan: 'monthly',
              label: 'Monthly',
              price: 'GBP 9.99/mo',
              note: 'Flexible entry, billed every month.',
              accent: false,
            },
            {
              plan: 'yearly',
              label: 'Yearly',
              price: 'GBP 99.99/yr',
              note: 'Best value, roughly 17% saved annually.',
              accent: true,
            },
          ].map((item) => (
            <SectionCard
              key={item.plan}
              title={item.label}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={item.accent ? 'text-[#10b981]' : 'text-zinc-400'} aria-hidden="true">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              }
              className={item.accent ? 'border-[#10b981]/40 shadow-[0_0_20px_rgba(16,185,129,0.08)]' : undefined}
            >
              <div className="rounded-2xl bg-[#0a0a0a] border border-[#1e1e1e] p-5 mb-5">
                <p className="text-3xl font-semibold text-zinc-100 tracking-tight">{item.price}</p>
                <p className="text-sm text-zinc-500 mt-2">{item.note}</p>
              </div>
              <button
                onClick={() => handleSubscribe(item.plan)}
                disabled={!!checkoutLoading}
                className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${item.accent ? 'bg-[#10b981] hover:bg-[#0fb172] text-[#0a0a0a]' : 'bg-[#1e1e1e] hover:bg-[#2a2a2a] text-zinc-100'} disabled:opacity-50`}
              >
                {checkoutLoading === item.plan ? 'Redirecting...' : `Choose ${item.label}`}
              </button>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
