'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';

interface Subscription {
  plan: string;
  status: string;
  renews_at: string;
}

export default function SubscriptionPage() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');

  useEffect(() => {
    void fetchSub();
  }, []);

  useEffect(() => {
    if (!success) {
      return;
    }

    let stopped = false;

    const pollSubscription = async () => {
      const attempts = 4;

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const foundSubscription = await fetchSub(attempt === 0);
        if (foundSubscription || stopped) {
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    };

    void pollSubscription();

    return () => {
      stopped = true;
    };
  }, [success]);

  const fetchSub = async (skipLoading = false) => {
    if (!skipLoading) {
      setLoading(true);
    }

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

  if (loading) {
    return <p className="text-gray-500 animate-pulse text-sm">Loading...</p>;
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-white mb-1">Subscription</h1>
      <p className="text-gray-400 text-sm mb-8">Manage your plan</p>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg p-3 mb-6">
          Subscription activated. Welcome aboard.
        </div>
      )}
      {cancelled && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm rounded-lg p-3 mb-6">
          Checkout cancelled. No charges made.
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-6">
          {error}
        </div>
      )}

      {sub && sub.status === 'active' ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-semibold capitalize">{sub.plan} Plan</p>
              <p className="text-gray-500 text-xs mt-1">
                Renews {new Date(sub.renews_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
              Active
            </span>
          </div>
          <button
            onClick={handleCancel}
            className="text-sm text-red-400 hover:text-red-300 transition"
          >
            Cancel subscription
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {[
            { plan: 'monthly', label: 'Monthly', price: 'GBP 9.99/mo', note: 'Billed monthly' },
            { plan: 'yearly', label: 'Yearly', price: 'GBP 99.99/yr', note: 'Save ~17%' },
          ].map((p) => (
            <div
              key={p.plan}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-white font-semibold">{p.label}</p>
                <p className="text-gray-500 text-xs mt-1">{p.note}</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold mb-2">{p.price}</p>
                <button
                  onClick={() => handleSubscribe(p.plan)}
                  disabled={!!checkoutLoading}
                  className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  {checkoutLoading === p.plan ? 'Redirecting...' : 'Subscribe'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
