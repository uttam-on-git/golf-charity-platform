import { Router, Response } from 'express';
import supabase from '../config/supabase.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  const [usersRes, subsRes, prizesRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('draws').select('prize_pool_total'),
  ]);

  const totalPrizePool = prizesRes.data?.reduce(
    (sum, d) => sum + (d.prize_pool_total || 0), 0
  ) || 0;

  res.json({
    success: true,
    data: {
      total_users: usersRes.count || 0,
      active_subscribers: subsRes.count || 0,
      total_prize_pool: totalPrizePool,
      total_charity_contributions: totalPrizePool * 0.1,
    },
  });
});

// GET /api/admin/users
router.get('/users', async (_req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, subscriptions(status, plan)')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, data });
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
  const { verified, payment_status } = req.body;

  const { data, error } = await supabase
    .from('winners')
    .update({ verified, payment_status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: 'Winner not found' });
    return;
  }

  res.json({ success: true, data });
});

export default router;