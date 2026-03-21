import { Router, Response } from 'express';
import supabase from '../config/supabase.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { runDraw, calculatePrizes } from '../services/drawEngine.js';

const router = Router();

// GET /api/draws - get all published draws (public)
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('month', { ascending: false });

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, data });
});

// GET /api/draws/:month - get single draw by month
router.get('/:month', async (req, res) => {
  const { data, error } = await supabase
    .from('draws')
    .select('*, winners(*, profiles(full_name))')
    .eq('month', req.params.month)
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: 'Draw not found' });
    return;
  }

  res.json({ success: true, data });
});

// GET /api/draws/me/winnings - get my winnings
router.get('/me/winnings', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('winners')
    .select('*, draws(month, winning_numbers)')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, data });
});

// POST /api/draws/simulate - admin: simulate a draw (preview, not saved)
router.post(
  '/simulate',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { mode = 'random' } = req.body;
    const month = new Date().toISOString().slice(0, 7); // e.g. "2026-03"

    try {
      const result = await runDraw(mode, month);
      res.json({ success: true, data: result, simulated: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Draw simulation failed';
      res.status(500).json({ success: false, error: message });
    }
  }
);

// POST /api/draws/run - admin: run and save draw as draft
router.post(
  '/run',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { mode = 'random', prize_pool_total = 0 } = req.body;
    const month = new Date().toISOString().slice(0, 7);

    // Check draw doesn't already exist for this month
    const { data: existing } = await supabase
      .from('draws')
      .select('id')
      .eq('month', month)
      .single();

    if (existing) {
      res.status(400).json({ success: false, error: 'Draw already exists for this month' });
      return;
    }

    try {
      const result = await runDraw(mode, month);

      // Save draw as draft
      const { data: draw, error: drawError } = await supabase
        .from('draws')
        .insert({
          month,
          winning_numbers: result.winning_numbers,
          status: 'draft',
          jackpot_rolled_over: result.jackpot_rolled_over,
          prize_pool_total,
        })
        .select()
        .single();

      if (drawError || !draw) {
        res.status(500).json({ success: false, error: 'Failed to save draw' });
        return;
      }

      // Save winners
      if (result.winners.length > 0) {
        await supabase.from('winners').insert(
          result.winners.map(w => ({
            draw_id: draw.id,
            user_id: w.user_id,
            match_type: w.match_type,
          }))
        );

        // Calculate prize amounts
        await calculatePrizes(draw.id, prize_pool_total);
      }

      res.json({ success: true, data: { draw, winners: result.winners } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Draw failed';
      res.status(500).json({ success: false, error: message });
    }
  }
);

// POST /api/draws/:id/publish - admin: publish a draft draw
router.post(
  '/:id/publish',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { data, error } = await supabase
      .from('draws')
      .update({ status: 'published' })
      .eq('id', req.params.id)
      .eq('status', 'draft')
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ success: false, error: 'Draft draw not found' });
      return;
    }

    res.json({ success: true, data });
  }
);

export default router;