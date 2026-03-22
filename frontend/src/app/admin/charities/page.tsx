'use client';

import { useEffect, useMemo, useState } from 'react';

import { SectionCard, StatCard } from '@/components/dashboard/overview-primitives';
import { ListSkeleton } from '@/components/loading/LoadingUI';
import api from '@/lib/axios';

interface Charity {
  id: string;
  name: string;
  description: string;
  image_url?: string | null;
  is_featured: boolean;
}

const emptyForm = {
  name: '',
  description: '',
  image_url: '',
  is_featured: false,
};

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void fetchCharities();
  }, []);

  const fetchCharities = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/charities');
      setCharities(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load charities');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      setError('Name and description are required.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (editingId) {
        await api.patch(`/admin/charities/${editingId}`, form);
        setMessage('Charity updated successfully.');
      } else {
        await api.post('/admin/charities', form);
        setMessage('Charity created successfully.');
      }

      resetForm();
      await fetchCharities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save charity');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (charity: Charity) => {
    setEditingId(charity.id);
    setMessage('');
    setError('');
    setForm({
      name: charity.name,
      description: charity.description,
      image_url: charity.image_url ?? '',
      is_featured: charity.is_featured,
    });
  };

  const handleDelete = async (charity: Charity) => {
    if (!confirm(`Delete ${charity.name}?`)) return;

    setDeletingId(charity.id);
    setError('');
    setMessage('');

    try {
      await api.delete(`/admin/charities/${charity.id}`);
      if (editingId === charity.id) {
        resetForm();
      }
      setMessage('Charity deleted successfully.');
      await fetchCharities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete charity');
    } finally {
      setDeletingId(null);
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
          Add, edit, and curate the charity catalogue that subscribers can browse and support.
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
          value={editingId ? 'Editing' : 'Create'}
          suffix={editingId ? 'updating existing entry' : 'ready for new charity'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4 md:gap-6">
        <SectionCard
          title={editingId ? 'Edit Charity' : 'Add Charity'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          }
          action={
            editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel edit
              </button>
            ) : null
          }
        >
          <div className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium block mb-2">Charity Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
                placeholder="Charity Water"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium block mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={5}
                className="w-full rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 resize-none"
                placeholder="Describe the mission, impact, and why members should support it."
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium block mb-2">Image URL</label>
              <input
                type="url"
                value={form.image_url}
                onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))}
                className="w-full rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
                placeholder="https://images.example.com/charity.jpg"
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))}
                className="size-4 accent-[#10b981]"
              />
              <div>
                <p className="text-sm font-medium text-zinc-100">Feature this charity</p>
                <p className="text-xs text-zinc-500 mt-1">Featured charities rise to the top of the subscriber experience.</p>
              </div>
            </label>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={saving}
              className="w-full rounded-xl bg-[#10b981] py-3 text-sm font-semibold text-[#0a0a0a] transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {saving ? 'Saving charity...' : editingId ? 'Update Charity' : 'Create Charity'}
            </button>
          </div>
        </SectionCard>

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
            <div className="grid gap-3 md:grid-cols-2">
              {charities.map((charity) => (
                <article key={charity.id} className="rounded-xl border border-[#1e1e1e] bg-[#0a0a0a] p-5 hover:border-[#2a2a2a] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-white font-medium leading-snug">{charity.name}</h3>
                      {charity.image_url ? (
                        <p className="text-xs text-zinc-500 mt-1 truncate">{charity.image_url}</p>
                      ) : null}
                    </div>
                    {charity.is_featured ? (
                      <span className="text-[11px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded-full border border-[#10b981]/20 whitespace-nowrap">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-4">{charity.description}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(charity)}
                      className="rounded-lg border border-[#1e1e1e] bg-[#141414] px-3 py-2 text-xs font-medium text-white transition hover:border-[#2a2a2a]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(charity)}
                      disabled={deletingId === charity.id}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/15 disabled:opacity-50"
                    >
                      {deletingId === charity.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
