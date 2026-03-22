import { Router, Response } from 'express';
import supabase from '../config/supabase.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { runDraw, calculatePrizes, calculatePrizePoolPreview, getEligibleDrawParticipants } from '../services/drawEngine.js';
import { tryNotifyUsers } from '../services/notifications.js';

const router = Router();
const WINNER_PROOF_BUCKET = 'winner-proofs';

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-');
}

async function ensureWinnerProofBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === WINNER_PROOF_BUCKET);

  if (!exists) {
    await supabase.storage.createBucket(WINNER_PROOF_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });
  }
}

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

// GET /api/draws/admin/all - get all draws including drafts (admin only)
router.get('/admin/all', authenticate, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .order('month', { ascending: false });

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, data });
});

// GET /api/draws/admin/pool-preview - get the current auto-calculated prize pool (admin only)
router.get('/admin/pool-preview', authenticate, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const preview = await calculatePrizePoolPreview();
    res.json({ success: true, data: preview });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to calculate prize pool preview';
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/draws/me/entries - get my recorded draw entries
router.get('/me/entries', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('draw_entries')
    .select('id, created_at, draws(id, month, status, jackpot_rolled_over, prize_pool_total)')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false });

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

router.post('/me/winnings/:id/proof', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { file_name, file_data, content_type } = req.body as {
    file_name?: string;
    file_data?: string;
    content_type?: string;
  };

  if (!file_name || !file_data || !content_type) {
    res.status(400).json({ success: false, error: 'file_name, file_data, and content_type are required' });
    return;
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(content_type)) {
    res.status(400).json({ success: false, error: 'Only JPG, PNG, and WEBP screenshots are supported' });
    return;
  }

  const { data: winner, error: winnerError } = await supabase
    .from('winners')
    .select('id, user_id, payment_status')
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .maybeSingle();

  if (winnerError || !winner) {
    res.status(404).json({ success: false, error: 'Winning entry not found' });
    return;
  }

  const normalizedBase64 = file_data.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(normalizedBase64, 'base64');

  if (!buffer.length) {
    res.status(400).json({ success: false, error: 'Uploaded file is empty' });
    return;
  }

  if (buffer.length > 5 * 1024 * 1024) {
    res.status(400).json({ success: false, error: 'Proof screenshot must be 5MB or smaller' });
    return;
  }

  await ensureWinnerProofBucket();

  const safeFileName = sanitizeFileName(file_name);
  const storagePath = `${req.user!.id}/${winner.id}-${Date.now()}-${safeFileName}`;
  const uploadRes = await supabase.storage
    .from(WINNER_PROOF_BUCKET)
    .upload(storagePath, buffer, {
      contentType: content_type,
      upsert: true,
    });

  if (uploadRes.error) {
    res.status(500).json({ success: false, error: uploadRes.error.message });
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from(WINNER_PROOF_BUCKET)
    .getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from('winners')
    .update({
      proof_url: publicUrlData.publicUrl,
      proof_file_name: file_name,
      proof_uploaded_at: new Date().toISOString(),
      verification_status: 'pending',
      verification_notes: null,
      verified: false,
      payment_status: winner.payment_status === 'paid' ? 'paid' : 'pending',
    })
    .eq('id', winner.id)
    .select('*, draws(month, winning_numbers)')
    .single();

  if (error || !data) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to save proof submission' });
    return;
  }

  res.json({
    success: true,
    message: 'Proof uploaded successfully',
    data,
  });
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
      const [result, prizePoolPreview] = await Promise.all([
        runDraw(mode, month),
        calculatePrizePoolPreview(),
      ]);
      res.json({
        success: true,
        data: {
          ...result,
          ...prizePoolPreview,
        },
        simulated: true,
      });
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
    const { mode = 'random' } = req.body;
    const month = new Date().toISOString().slice(0, 7);
    const monthLabel = new Date(`${month}-01`).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });

    // Check draw doesn't already exist for this month
    const { data: existing } = await supabase
      .from('draws')
      .select('id, status')
      .eq('month', month)
      .maybeSingle();

    if (existing) {
      const statusLabel = existing.status === 'published' ? 'published' : 'saved as a draft';
      res.status(409).json({
        success: false,
        error: `${monthLabel} draw already exists and is ${statusLabel}. Publish the draft or wait until the next month before running another draw.`,
      });
      return;
    }

    try {
      const [result, prizePoolPreview, eligibleParticipants] = await Promise.all([
        runDraw(mode, month),
        calculatePrizePoolPreview(),
        getEligibleDrawParticipants(),
      ]);

      // Save draw as draft
      const { data: draw, error: drawError } = await supabase
        .from('draws')
        .insert({
          month,
          winning_numbers: result.winning_numbers,
          status: 'draft',
          jackpot_rolled_over: result.jackpot_rolled_over,
          prize_pool_total: prizePoolPreview.prize_pool_total,
        })
        .select()
        .single();

      if (drawError || !draw) {
        res.status(500).json({ success: false, error: 'Failed to save draw' });
        return;
      }

      if (eligibleParticipants.length > 0) {
        const { error: entryError } = await supabase.from('draw_entries').insert(
          eligibleParticipants.map((participant) => ({
            draw_id: draw.id,
            user_id: participant.user_id,
          })),
        );

        if (entryError) {
          res.status(500).json({ success: false, error: `Failed to save draw entries: ${entryError.message}` });
          return;
        }
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
        await calculatePrizes(draw.id, prizePoolPreview.prize_pool_total);
      }

      res.json({
        success: true,
        data: {
          draw,
          winners: result.winners,
          prize_pool_preview: prizePoolPreview,
        },
      });
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

    const monthLabel = new Date(`${data.month}-01`).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });

    const [{ data: entries }, { data: winners }] = await Promise.all([
      supabase
        .from('draw_entries')
        .select('user_id')
        .eq('draw_id', data.id),
      supabase
        .from('winners')
        .select('user_id')
        .eq('draw_id', data.id),
    ]);

    const entrantNotifications = [...new Set((entries ?? []).map((entry) => entry.user_id))].map((userId) => ({
      userId,
      title: `${monthLabel} draw results are live`,
      message: 'The latest winning numbers have been published. Check the draw history to see how your numbers matched.',
      category: 'draw_result' as const,
      actionUrl: '/dashboard/draws',
      dedupeKey: `draw-published-${data.id}`,
    }));

    const winnerNotifications = [...new Set((winners ?? []).map((winner) => winner.user_id))].map((userId) => ({
      userId,
      title: 'You have a winning entry',
      message: `You matched numbers in the ${monthLabel} draw. Upload your proof screenshot so the admin team can review your win.`,
      category: 'winner_alert' as const,
      actionUrl: '/dashboard/draws',
      dedupeKey: `winner-alert-${data.id}`,
    }));

    await tryNotifyUsers([...entrantNotifications, ...winnerNotifications]);

    res.json({ success: true, data });
  }
);

export default router;
