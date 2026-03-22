import { Router, Response } from 'express';
import supabase from '../config/supabase.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { notifyUser } from '../services/notifications.js';
import { isSubscriptionCurrentlyActive } from '../utils/subscriptions.js';

const router = Router();

router.use(authenticate, requireAdmin);

async function getAuthEmailMap() {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw error;
  }

  return new Map(data.users.map((user) => [user.id, user.email ?? null]));
}

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  const [usersRes, subsRes, prizesRes, drawsRes, winnersRes, profilesRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('subscriptions').select('id, plan, status, renews_at, stripe_subscription_id'),
    supabase.from('draws').select('prize_pool_total'),
    supabase.from('draws').select('id, status, month'),
    supabase.from('winners').select('id, payment_status, verification_status'),
    supabase.from('profiles').select('charity_id, contribution_percent, charities(id, name, is_featured)'),
  ]);

  const totalPrizePool = prizesRes.data?.reduce(
    (sum, d) => sum + (d.prize_pool_total || 0), 0
  ) || 0;

  const activeSubscriptions = (subsRes.data ?? []).filter((subscription) => isSubscriptionCurrentlyActive(subscription));
  const draws = drawsRes.data ?? [];
  const winners = winnersRes.data ?? [];
  const profiles = profilesRes.data ?? [];

  const charityMap = new Map<string, { id: string; name: string; supporters: number; featured: boolean }>();

  for (const profile of profiles) {
    const charity = Array.isArray(profile.charities) ? profile.charities[0] : profile.charities;
    if (!profile.charity_id || !charity?.id || !charity?.name) continue;

    const existing = charityMap.get(charity.id);
    if (existing) {
      existing.supporters += 1;
      continue;
    }

    charityMap.set(charity.id, {
      id: charity.id,
      name: charity.name,
      supporters: 1,
      featured: Boolean(charity.is_featured),
    });
  }

  const topCharities = [...charityMap.values()]
    .sort((a, b) => b.supporters - a.supporters)
    .slice(0, 5);

  const averageContributionPercent = profiles.length
    ? profiles.reduce((sum, profile) => sum + (profile.contribution_percent ?? 10), 0) / profiles.length
    : 10;

  res.json({
    success: true,
    data: {
      total_users: usersRes.count || 0,
      active_subscribers: activeSubscriptions.length,
      total_prize_pool: totalPrizePool,
      total_charity_contributions: totalPrizePool * 0.1,
      published_draws: draws.filter((draw) => draw.status === 'published').length,
      draft_draws: draws.filter((draw) => draw.status === 'draft').length,
      pending_winner_reviews: winners.filter((winner) => winner.verification_status !== 'approved').length,
      paid_winners: winners.filter((winner) => winner.payment_status === 'paid').length,
      monthly_subscribers: activeSubscriptions.filter((subscription) => subscription.plan === 'monthly').length,
      yearly_subscribers: activeSubscriptions.filter((subscription) => subscription.plan === 'yearly').length,
      average_contribution_percent: averageContributionPercent,
      top_charities: topCharities,
    },
  });
});

// GET /api/admin/users
router.get('/users', async (_req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, subscriptions(status, plan, renews_at, stripe_subscription_id)')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  try {
    const emailMap = await getAuthEmailMap();
    const users = (data ?? []).map((user) => ({
      ...user,
      email: emailMap.get(user.id) ?? null,
    }));

    res.json({ success: true, data: users });
  } catch (authError) {
    res.status(500).json({
      success: false,
      error: authError instanceof Error ? authError.message : 'Failed to enrich user records',
    });
  }
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req, res) => {
  const { full_name, role, charity_id } = req.body;

  if (!full_name || !role) {
    res.status(400).json({ success: false, error: 'full_name and role are required' });
    return;
  }

  if (!['admin', 'subscriber'].includes(String(role))) {
    res.status(400).json({ success: false, error: 'Role must be admin or subscriber' });
    return;
  }

  const payload: Record<string, unknown> = {
    full_name: String(full_name).trim(),
    role: String(role),
  };

  if (Object.prototype.hasOwnProperty.call(req.body, 'charity_id')) {
    payload.charity_id = charity_id || null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: error?.message || 'User not found' });
    return;
  }

  res.json({ success: true, data });
});

// PATCH /api/admin/users/:id/subscription
router.patch('/users/:id/subscription', async (req, res) => {
  const { plan, status, renews_at } = req.body;

  if (!plan || !['monthly', 'yearly'].includes(String(plan))) {
    res.status(400).json({ success: false, error: 'Plan must be monthly or yearly' });
    return;
  }

  if (!status || !['active', 'cancelled', 'lapsed'].includes(String(status))) {
    res.status(400).json({ success: false, error: 'Status must be active, cancelled, or lapsed' });
    return;
  }

  let nextRenewsAt: string | null = renews_at ? new Date(String(renews_at)).toISOString() : null;
  if (renews_at && Number.isNaN(new Date(String(renews_at)).getTime())) {
    res.status(400).json({ success: false, error: 'renews_at must be a valid date' });
    return;
  }

  if (status === 'active' && !nextRenewsAt) {
    const defaultRenewal = new Date();
    defaultRenewal.setMonth(defaultRenewal.getMonth() + (plan === 'yearly' ? 12 : 1));
    nextRenewsAt = defaultRenewal.toISOString();
  }

  const { data: existing, error: existingError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', req.params.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    res.status(500).json({ success: false, error: existingError.message });
    return;
  }

  const payload = {
    user_id: req.params.id,
    plan: String(plan),
    status: String(status),
    renews_at: nextRenewsAt,
    stripe_customer_id: existing?.stripe_customer_id ?? null,
    stripe_subscription_id: existing?.stripe_subscription_id ?? null,
  };

  let data;
  let error;

  if (existing?.id) {
    ({ data, error } = await supabase
      .from('subscriptions')
      .update(payload)
      .eq('id', existing.id)
      .select('*')
      .single());
  } else {
    ({ data, error } = await supabase
      .from('subscriptions')
      .insert(payload)
      .select('*')
      .single());
  }

  if (error || !data) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update subscription' });
    return;
  }

  await notifyUser({
    userId: req.params.id,
    title: 'Subscription updated by admin',
    message:
      status === 'active'
        ? `Your ${plan} membership has been activated and now renews on ${new Date(nextRenewsAt!).toLocaleDateString('en-GB')}.`
        : `Your subscription status is now ${status}. Review your membership details in the subscription dashboard.`,
    category: 'billing',
    actionUrl: '/dashboard/subscription',
    dedupeKey: `admin-subscription-${data.id}-${status}-${plan}-${nextRenewsAt ?? 'none'}`,
  });

  res.json({ success: true, data });
});

// GET /api/admin/users/:id/scores
router.get('/users/:id/scores', async (req, res) => {
  const { data, error } = await supabase
    .from('golf_scores')
    .select('*')
    .eq('user_id', req.params.id)
    .order('played_at', { ascending: false });

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, data });
});

// POST /api/admin/users/:id/scores
router.post('/users/:id/scores', async (req, res) => {
  const { score, played_at } = req.body;
  const userId = req.params.id;

  if (!score || score < 1 || score > 45) {
    res.status(400).json({ success: false, error: 'Score must be between 1 and 45' });
    return;
  }

  if (!played_at) {
    res.status(400).json({ success: false, error: 'Date is required' });
    return;
  }

  const { data: existing, error: fetchError } = await supabase
    .from('golf_scores')
    .select('id, played_at')
    .eq('user_id', userId)
    .order('played_at', { ascending: true });

  if (fetchError) {
    res.status(500).json({ success: false, error: fetchError.message });
    return;
  }

  if (existing && existing.length >= 5) {
    const oldest = existing[0];
    await supabase.from('golf_scores').delete().eq('id', oldest.id);
  }

  const { data, error } = await supabase
    .from('golf_scores')
    .insert({ user_id: userId, score, played_at })
    .select()
    .single();

  if (error || !data) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to add score' });
    return;
  }

  res.status(201).json({ success: true, data });
});

// PATCH /api/admin/scores/:id
router.patch('/scores/:id', async (req, res) => {
  const { score, played_at } = req.body;

  if (!score || score < 1 || score > 45) {
    res.status(400).json({ success: false, error: 'Score must be between 1 and 45' });
    return;
  }

  if (!played_at) {
    res.status(400).json({ success: false, error: 'Date is required' });
    return;
  }

  const { data, error } = await supabase
    .from('golf_scores')
    .update({ score, played_at })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: error?.message || 'Score not found' });
    return;
  }

  res.json({ success: true, data });
});

// DELETE /api/admin/scores/:id
router.delete('/scores/:id', async (req, res) => {
  const { error } = await supabase
    .from('golf_scores')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, message: 'Score deleted successfully' });
});

// GET /api/admin/charities
router.get('/charities', async (_req, res) => {
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, data });
});

// POST /api/admin/charities
router.post('/charities', async (req, res) => {
  const { name, description, image_url, is_featured } = req.body;

  if (!name || !description) {
    res.status(400).json({ success: false, error: 'Name and description are required' });
    return;
  }

  const { data, error } = await supabase
    .from('charities')
    .insert({
      name: String(name).trim(),
      description: String(description).trim(),
      image_url: image_url ? String(image_url).trim() : null,
      is_featured: Boolean(is_featured),
    })
    .select()
    .single();

  if (error || !data) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to create charity' });
    return;
  }

  res.status(201).json({ success: true, data });
});

// PATCH /api/admin/charities/:id
router.patch('/charities/:id', async (req, res) => {
  const { name, description, image_url, is_featured } = req.body;

  if (!name || !description) {
    res.status(400).json({ success: false, error: 'Name and description are required' });
    return;
  }

  const { data, error } = await supabase
    .from('charities')
    .update({
      name: String(name).trim(),
      description: String(description).trim(),
      image_url: image_url ? String(image_url).trim() : null,
      is_featured: Boolean(is_featured),
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: error?.message || 'Charity not found' });
    return;
  }

  res.json({ success: true, data });
});

// GET /api/admin/charities/:id/events
router.get('/charities/:id/events', async (req, res) => {
  const { data, error } = await supabase
    .from('charity_events')
    .select('*')
    .eq('charity_id', req.params.id)
    .order('event_date', { ascending: true });

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, data });
});

// POST /api/admin/charities/:id/events
router.post('/charities/:id/events', async (req, res) => {
  const { title, summary, event_date, location, signup_url, image_url, is_published } = req.body;

  if (!title || !summary || !event_date) {
    res.status(400).json({ success: false, error: 'title, summary, and event_date are required' });
    return;
  }

  if (Number.isNaN(new Date(String(event_date)).getTime())) {
    res.status(400).json({ success: false, error: 'event_date must be a valid date' });
    return;
  }

  const { data, error } = await supabase
    .from('charity_events')
    .insert({
      charity_id: req.params.id,
      title: String(title).trim(),
      summary: String(summary).trim(),
      event_date: new Date(String(event_date)).toISOString(),
      location: location ? String(location).trim() : null,
      signup_url: signup_url ? String(signup_url).trim() : null,
      image_url: image_url ? String(image_url).trim() : null,
      is_published: is_published !== false,
    })
    .select('*')
    .single();

  if (error || !data) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to create charity event' });
    return;
  }

  res.status(201).json({ success: true, data });
});

// PATCH /api/admin/charity-events/:id
router.patch('/charity-events/:id', async (req, res) => {
  const { title, summary, event_date, location, signup_url, image_url, is_published } = req.body;

  if (!title || !summary || !event_date) {
    res.status(400).json({ success: false, error: 'title, summary, and event_date are required' });
    return;
  }

  if (Number.isNaN(new Date(String(event_date)).getTime())) {
    res.status(400).json({ success: false, error: 'event_date must be a valid date' });
    return;
  }

  const { data, error } = await supabase
    .from('charity_events')
    .update({
      title: String(title).trim(),
      summary: String(summary).trim(),
      event_date: new Date(String(event_date)).toISOString(),
      location: location ? String(location).trim() : null,
      signup_url: signup_url ? String(signup_url).trim() : null,
      image_url: image_url ? String(image_url).trim() : null,
      is_published: is_published !== false,
    })
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: error?.message || 'Charity event not found' });
    return;
  }

  res.json({ success: true, data });
});

// DELETE /api/admin/charity-events/:id
router.delete('/charity-events/:id', async (req, res) => {
  const { error } = await supabase
    .from('charity_events')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, message: 'Charity event deleted successfully' });
});

// DELETE /api/admin/charities/:id
router.delete('/charities/:id', async (req, res) => {
  const { count, error: assignedError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('charity_id', req.params.id);

  if (assignedError) {
    res.status(500).json({ success: false, error: assignedError.message });
    return;
  }

  if ((count || 0) > 0) {
    res.status(409).json({
      success: false,
      error: 'This charity is still linked to active user profiles and cannot be deleted yet',
    });
    return;
  }

  const { error } = await supabase
    .from('charities')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, message: 'Charity deleted successfully' });
});

// GET /api/admin/winners
router.get('/winners', async (_req, res) => {
  const { data, error } = await supabase
    .from('winners')
    .select('*, profiles(full_name), draws(month)')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, data });
});

// PATCH /api/admin/winners/:id/verify
router.patch('/winners/:id/verify', async (req: AuthRequest, res: Response): Promise<void> => {
  const { verified, payment_status, verification_status, verification_notes } = req.body;

  const nextVerificationStatus =
    verification_status ??
    (verified === true ? 'approved' : verified === false ? 'pending' : 'pending');

  const nextVerified = nextVerificationStatus === 'approved';

  const { data, error } = await supabase
    .from('winners')
    .update({
      verified: nextVerified,
      payment_status,
      verification_status: nextVerificationStatus,
      verification_notes: verification_notes ?? null,
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: 'Winner not found' });
    return;
  }

  if (data.user_id) {
    if (nextVerificationStatus === 'approved') {
      await notifyUser({
        userId: data.user_id,
        title: 'Winner proof approved',
        message: 'Your winner proof has been approved. We will keep you posted as payout status changes.',
        category: 'winner_alert',
        actionUrl: '/dashboard/draws',
        dedupeKey: `winner-approved-${data.id}`,
      });
    }

    if (nextVerificationStatus === 'rejected') {
      await notifyUser({
        userId: data.user_id,
        title: 'Winner proof needs attention',
        message: verification_notes ?? 'Your uploaded proof was rejected. Please review the note and upload a clearer screenshot.',
        category: 'winner_alert',
        actionUrl: '/dashboard/draws',
        dedupeKey: `winner-rejected-${data.id}`,
      });
    }

    if (payment_status === 'paid') {
      await notifyUser({
        userId: data.user_id,
        title: 'Prize payout completed',
        message: 'Your winning payout has been marked as paid. Thanks for playing and supporting charity.',
        category: 'billing',
        actionUrl: '/dashboard/draws',
        dedupeKey: `winner-paid-${data.id}`,
      });
    }
  }

  res.json({ success: true, data });
});

export default router;
