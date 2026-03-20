import { Router, Response } from 'express';
import supabase from '../config/supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/charities - public, list all charities
router.get('/', async (req, res) => {
  const { search } = req.query;

  let query = supabase
    .from('charities')
    .select('*')
    .order('is_featured', { ascending: false });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, data });
});

// GET /api/charities/:id - single charity
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: 'Charity not found' });
    return;
  }

  res.json({ success: true, data });
});

// PUT /api/charities/select - user selects a charity (protected)
router.put('/select', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { charity_id, contribution_percent } = req.body;

  if (!charity_id) {
    res.status(400).json({ success: false, error: 'charity_id is required' });
    return;
  }

  // Minimum 10%
  const percent = contribution_percent ?? 10;
  if (percent < 10 || percent > 100) {
    res.status(400).json({ success: false, error: 'Contribution must be between 10% and 100%' });
    return;
  }

  // Check charity exists
  const { data: charity } = await supabase
    .from('charities')
    .select('id')
    .eq('id', charity_id)
    .single();

  if (!charity) {
    res.status(404).json({ success: false, error: 'Charity not found' });
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      charity_id,
      charity_contribution_percent: percent,
    })
    .eq('id', req.user!.id);

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, message: 'Charity selection updated' });
});

export default router;