import { Router, Request, Response } from 'express';
import supabase from '../config/supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, full_name, charity_id, contribution_percent } = req.body;

  if (!email || !password || !full_name || !charity_id) {
    res.status(400).json({ success: false, error: 'All fields required' });
    return;
  }

  const { data: charity, error: charityError } = await supabase
    .from('charities')
    .select('id')
    .eq('id', charity_id)
    .maybeSingle();

  if (charityError || !charity) {
    res.status(400).json({ success: false, error: 'Please choose a valid charity' });
    return;
  }

  const percent = contribution_percent ?? 10;
  if (percent < 10 || percent > 100) {
    res.status(400).json({ success: false, error: 'Contribution must be between 10% and 100%' });
    return;
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    res.status(400).json({ success: false, error: error?.message });
    return;
  }

  // Create profile row
  await supabase.from('profiles').insert({
    id: data.user.id,
    full_name,
    role: 'subscriber',
    charity_id,
    contribution_percent: percent,
  });

  res.status(201).json({ success: true, message: 'Account created. Please verify your email.' });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, charity_id, contribution_percent')
    .eq('id', data.user.id)
    .maybeSingle();

  res.json({
    success: true,
    token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      full_name: profile?.full_name ?? null,
      role: profile?.role ?? 'subscriber',
      charity_id: profile?.charity_id ?? null,
      contribution_percent: profile?.contribution_percent ?? 10,
    },
  });
});

// GET /api/auth/me  (protected)
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, charity_id, contribution_percent')
    .eq('id', req.user!.id)
    .maybeSingle();

  let charity: { id: string; name: string } | null = null;

  if (profile?.charity_id) {
    const { data: charityRecord } = await supabase
      .from('charities')
      .select('id, name')
      .eq('id', profile.charity_id)
      .maybeSingle();

    charity = charityRecord ?? null;
  }

  res.json({
    success: true,
    data: {
      id: req.user!.id,
      email: req.user!.email,
      role: profile?.role ?? req.user!.role,
      full_name: profile?.full_name ?? null,
      charity_id: profile?.charity_id ?? null,
      contribution_percent: profile?.contribution_percent ?? 10,
      charities: charity,
    },
  });
});

export default router;
