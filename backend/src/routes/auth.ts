import { Router, Request, Response } from 'express';
import supabase from '../config/supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, full_name } = req.body;

  if (!email || !password || !full_name) {
    res.status(400).json({ success: false, error: 'All fields required' });
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
    .select('full_name, role, charity_id')
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
    },
  });
});

// GET /api/auth/me  (protected)
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, charity_id')
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
      charities: charity,
    },
  });
});

export default router;
