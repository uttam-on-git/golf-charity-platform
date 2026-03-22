'use client';

import { useEffect, useMemo, useState } from 'react';

import { SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import { ListSkeleton } from '@/components/loading/LoadingUI';
import api from '@/lib/axios';

interface User {
  id: string;
  full_name: string;
  email?: string | null;
  role: string;
  charity_id?: string | null;
  subscriptions: { status: string; plan: string }[];
}

interface Score {
  id: string;
  score: number;
  played_at: string;
}

const emptyProfileForm = {
  full_name: '',
  role: 'subscriber',
};

const emptyScoreForm = {
  score: '',
  played_at: '',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [savingScore, setSavingScore] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [scores, setScores] = useState<Score[]>([]);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [scoreForm, setScoreForm] = useState(emptyScoreForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      const nextUsers = Array.isArray(res.data?.data) ? res.data.data : [];
      setUsers(nextUsers);
      setSelectedUserId((current) => {
        if (current && nextUsers.some((user: User) => user.id === current)) {
          return current;
        }
        return nextUsers[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const selectedUser = users.find((user) => user.id === selectedUserId);
    if (!selectedUser) {
      setProfileForm(emptyProfileForm);
      setScores([]);
      return;
    }

    setProfileForm({
      full_name: selectedUser.full_name ?? '',
      role: selectedUser.role ?? 'subscriber',
    });

    void fetchScores(selectedUser.id);
  }, [selectedUserId, users]);

  const fetchScores = async (userId: string) => {
    setScoresLoading(true);
    try {
      const res = await api.get(`/admin/users/${userId}/scores`);
      setScores(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user scores');
    } finally {
      setScoresLoading(false);
    }
  };

  const resetScoreForm = () => {
    setEditingScoreId(null);
    setScoreForm(emptyScoreForm);
  };

  const handleProfileSave = async () => {
    if (!selectedUserId) return;

    setSavingProfile(true);
    setError('');
    setMessage('');

    try {
      await api.patch(`/admin/users/${selectedUserId}`, profileForm);
      setMessage('User profile updated successfully.');
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleScoreSubmit = async () => {
    if (!selectedUserId) return;

    const payload = {
      score: Number(scoreForm.score),
      played_at: scoreForm.played_at,
    };

    setSavingScore(true);
    setError('');
    setMessage('');

    try {
      if (editingScoreId) {
        await api.patch(`/admin/scores/${editingScoreId}`, payload);
        setMessage('Score updated successfully.');
      } else {
        await api.post(`/admin/users/${selectedUserId}/scores`, payload);
        setMessage('Score added successfully.');
      }

      resetScoreForm();
      await fetchScores(selectedUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save score');
    } finally {
      setSavingScore(false);
    }
  };

  const handleScoreEdit = (score: Score) => {
    setEditingScoreId(score.id);
    setScoreForm({
      score: String(score.score),
      played_at: score.played_at?.slice(0, 10) ?? '',
    });
  };

  const handleScoreDelete = async (scoreId: string) => {
    if (!selectedUserId) return;
    if (!confirm('Delete this score?')) return;

    setError('');
    setMessage('');

    try {
      await api.delete(`/admin/scores/${scoreId}`);
      setMessage('Score deleted successfully.');
      await fetchScores(selectedUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete score');
    }
  };

  const activeCount = useMemo(
    () => users.filter((user) => user.subscriptions?.[0]?.status === 'active').length,
    [users],
  );
  const adminCount = useMemo(() => users.filter((user) => user.role === 'admin').length, [users]);
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setMessage('');
    setError('');
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Users</h1>
        <p className="text-zinc-500 mt-1.5 text-sm md:text-base">
          Review account roles, update member profiles, and manage the score history behind each draw entry.
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
          label="Total Accounts"
          value={String(users.length)}
          suffix="loaded"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Active Subscribers"
          value={String(activeCount)}
          suffix="current"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="Admins"
          value={String(adminCount)}
          suffix="with elevated access"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 3 7 4v5c0 5-3.5 8.74-7 10-3.5-1.26-7-5-7-10V7l7-4Z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4 md:gap-6">
        <SectionCard
          title="User Directory"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
              <path d="M3 5h18" />
              <path d="M3 12h18" />
              <path d="M3 19h18" />
            </svg>
          }
          action={<span className="text-xs text-zinc-500">{users.length} records</span>}
          className="overflow-hidden"
        >
          {loading ? (
            <ListSkeleton rows={5} />
          ) : users.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e1e] text-left">
                    <th className="px-4 py-3 text-zinc-500 font-medium">Member</th>
                    <th className="px-4 py-3 text-zinc-500 font-medium">Role</th>
                    <th className="px-4 py-3 text-zinc-500 font-medium">Subscription</th>
                    <th className="px-4 py-3 text-zinc-500 font-medium">Plan</th>
                    <th className="px-4 py-3 text-zinc-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const sub = user.subscriptions?.[0];
                    const isSelected = user.id === selectedUserId;
                    return (
                      <tr
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        className={`border-b border-[#1e1e1e] last:border-b-0 transition-colors ${
                          isSelected ? 'bg-[#101514]' : 'hover:bg-[#0f0f0f]'
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-zinc-100 font-medium">{user.full_name || 'Unnamed user'}</div>
                            <div className="text-xs text-zinc-500 mt-1">{user.email ?? user.id}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${user.role === 'admin' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-[#141414] text-zinc-300 border-[#2a2a2a]'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${sub?.status === 'active' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>
                            {sub?.status || 'none'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-zinc-400 capitalize">{sub?.plan || '-'}</td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSelectUser(user.id);
                            }}
                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                              isSelected
                                ? 'border-[#10b981]/30 bg-[#10b981]/10 text-[#8ef0c6]'
                                : 'border-[#1e1e1e] bg-[#141414] text-white hover:border-[#2a2a2a]'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <div className="flex flex-col gap-4 md:gap-6">
          <SectionCard
            title="Edit Profile"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            }
            action={<span className="text-xs text-zinc-500">{selectedUser ? 'selected' : 'choose a user'}</span>}
          >
            {!selectedUser ? (
              <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
                Select a user from the directory to edit their profile and score history.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-4">
                  <p className="text-sm font-medium text-zinc-100">{selectedUser.email ?? selectedUser.id}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Current plan: {selectedUser.subscriptions?.[0]?.plan || 'none'} · status: {selectedUser.subscriptions?.[0]?.status || 'none'}
                  </p>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium block mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(event) => setProfileForm((current) => ({ ...current, full_name: event.target.value }))}
                    className="w-full rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium block mb-2">Role</label>
                  <select
                    value={profileForm.role}
                    onChange={(event) => setProfileForm((current) => ({ ...current, role: event.target.value }))}
                    className="w-full rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
                  >
                    <option value="subscriber">Subscriber</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => void handleProfileSave()}
                  disabled={savingProfile}
                  className="w-full rounded-xl bg-[#10b981] py-3 text-sm font-semibold text-[#0a0a0a] transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {savingProfile ? 'Saving profile...' : 'Save Profile'}
                </button>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Score Manager"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            }
            action={
              editingScoreId ? (
                <button
                  type="button"
                  onClick={resetScoreForm}
                  className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel edit
                </button>
              ) : (
                <span className="text-xs text-zinc-500">{scores.length}/5 stored</span>
              )
            }
          >
            {!selectedUser ? (
              <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
                Choose a user to review and edit their Stableford score history.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-[0.8fr_1fr] gap-3">
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={scoreForm.score}
                    onChange={(event) => setScoreForm((current) => ({ ...current, score: event.target.value }))}
                    placeholder="Score"
                    className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
                  />
                  <input
                    type="date"
                    value={scoreForm.played_at}
                    onChange={(event) => setScoreForm((current) => ({ ...current, played_at: event.target.value }))}
                    className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleScoreSubmit()}
                  disabled={savingScore}
                  className="w-full rounded-xl border border-[#1e1e1e] bg-[#141414] py-3 text-sm font-medium text-white transition hover:border-[#2a2a2a] disabled:opacity-50"
                >
                  {savingScore ? 'Saving score...' : editingScoreId ? 'Update Score' : 'Add Score'}
                </button>

                {scoresLoading ? (
                  <ListSkeleton rows={4} />
                ) : scores.length === 0 ? (
                  <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-xl px-5 py-8 text-center text-sm text-zinc-500">
                    No scores stored for this user yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scores.map((score) => (
                      <div key={score.id} className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center text-zinc-100 font-bold shrink-0">
                            {score.score}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-100">Stableford round</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{score.played_at?.slice(0, 10)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleScoreEdit(score)}
                            className="rounded-lg border border-[#1e1e1e] bg-[#141414] px-3 py-2 text-xs font-medium text-white transition hover:border-[#2a2a2a]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleScoreDelete(score.id)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/15"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
