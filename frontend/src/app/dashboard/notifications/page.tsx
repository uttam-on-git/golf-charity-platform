'use client';

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import { SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import { DashboardPageLoader } from '@/components/loading/LoadingUI';
import api from '@/lib/axios';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'system' | 'draw_result' | 'winner_alert' | 'billing';
  action_url?: string | null;
  read_at?: string | null;
  created_at: string;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const categoryTone: Record<NotificationItem['category'], string> = {
  system: 'bg-white/[0.04] text-zinc-300 border-white/[0.08]',
  draw_result: 'bg-cyan-500/10 text-cyan-200 border-cyan-500/20',
  winner_alert: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20',
  billing: 'bg-yellow-500/10 text-yellow-200 border-yellow-500/20',
};

export default function DashboardNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Notifications are temporarily unavailable');
      } else {
        setError('Notifications are temporarily unavailable');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read_at).length,
    [notifications],
  );

  const winnerCount = useMemo(
    () => notifications.filter((notification) => notification.category === 'winner_alert').length,
    [notifications],
  );

  const handleMarkRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item,
        ),
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Could not update this notification right now');
      } else {
        setError('Could not update this notification right now');
      }
    }
  };

  const handleReadAll = async () => {
    setMarkingAll(true);
    setError('');

    try {
      await api.post('/notifications/read-all');
      const now = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? now })));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Could not mark notifications as read right now');
      } else {
        setError('Could not mark notifications as read right now');
      }
    } finally {
      setMarkingAll(false);
    }
  };

  if (loading) {
    return <DashboardPageLoader title="Loading notifications" subtitle="Collecting your latest draw updates, billing alerts, and winner messages." />;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Notifications</h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Track system updates, draw result releases, winner review progress, and billing events in one place.
        </p>
      </header>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard
          label="Unread"
          value={String(unreadCount)}
          suffix="awaiting review"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.268 21a2 2 0 0 0 3.464 0" />
              <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .738-1.674C19.41 13.868 18 12.2 18 8A6 6 0 0 0 6 8c0 4.2-1.411 5.868-2.738 7.326" />
            </svg>
          }
        />
        <StatCard
          label="Winner Alerts"
          value={String(winnerCount)}
          suffix="important updates"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          }
        />
        <StatCard
          label="Notification Feed"
          value={String(notifications.length)}
          suffix="most recent first"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
          }
        />
      </div>

      <SectionCard
        title="Activity Feed"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
            <path d="M12 2v20" />
            <path d="m19 9-7-7-7 7" />
          </svg>
        }
        action={
          notifications.length > 0 ? (
            <button
              type="button"
              onClick={() => void handleReadAll()}
              disabled={markingAll || unreadCount === 0}
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {markingAll ? 'Marking...' : 'Mark all read'}
            </button>
          ) : null
        }
      >
        {notifications.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
            No notifications yet. Once new draws publish or billing changes, updates will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl border p-5 transition-colors ${
                  notification.read_at
                    ? 'border-[#1e1e1e] bg-[#0a0a0a]'
                    : 'border-[#10b981]/20 bg-[#10b981]/5'
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${categoryTone[notification.category]}`}>
                        {notification.category.replace('_', ' ')}
                      </span>
                      {!notification.read_at ? (
                        <span className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8ef0c6]">
                          New
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-base font-semibold text-zinc-100">{notification.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{notification.message}</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {formatDateTime(notification.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {notification.action_url ? (
                      <a
                        href={notification.action_url}
                        className="rounded-lg border border-[#1e1e1e] bg-[#141414] px-3 py-2 text-xs font-medium text-white transition hover:border-[#2a2a2a]"
                      >
                        Open
                      </a>
                    ) : null}
                    {!notification.read_at ? (
                      <button
                        type="button"
                        onClick={() => void handleMarkRead(notification.id)}
                        className="rounded-lg border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-2 text-xs font-medium text-[#8ef0c6] transition hover:bg-[#10b981]/15"
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
