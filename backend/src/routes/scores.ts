import { Router, Response } from 'express';
import supabase from '../config/supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All score routes require auth
router.use(authenticate);

// GET /api/scores - get my scores
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('golf_scores')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('played_at', { ascending: false });

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, data });
});

// POST /api/scores - add a new score
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { score, played_at } = req.body;
  const userId = req.user!.id;

  // Validate score range
  if (!score || score < 1 || score > 45) {
    res.status(400).json({ success: false, error: 'Score must be between 1 and 45' });
    return;
  }

  if (!played_at) {
    res.status(400).json({ success: false, error: 'Date is required' });
    return;
  }

  // Check how many scores the user currently has
  const { data: existing, error: fetchError } = await supabase
    .from('golf_scores')
    .select('id, played_at')
    .eq('user_id', userId)
    .order('played_at', { ascending: true }); // oldest first

  if (fetchError) {
    res.status(500).json({ success: false, error: fetchError.message });
    return;
  }

  // If already 5 scores → delete the oldest one
  if (existing && existing.length >= 5) {
    const oldest = existing[0];
    await supabase.from('golf_scores').delete().eq('id', oldest.id);
  }

  // Insert new score
  const { data, error } = await supabase
    .from('golf_scores')
    .insert({ user_id: userId, score, played_at })
    .select()
    .single();

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.status(201).json({ success: true, data });
});

// DELETE /api/scores/:id - delete a score
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  // Make sure user owns this score
  const { data: score } = await supabase
    .from('golf_scores')
    .select('id')
    .eq('id', id)
    .eq('user_id', req.user!.id)
    .single();

  if (!score) {
    res.status(404).json({ success: false, error: 'Score not found' });
    return;
  }

  await supabase.from('golf_scores').delete().eq('id', id);

  res.json({ success: true, message: 'Score deleted' });
});

export default router;