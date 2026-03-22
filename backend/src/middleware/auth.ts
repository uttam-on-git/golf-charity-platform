import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabase.js';
import { isSubscriptionCurrentlyActive } from '../utils/subscriptions.js';

interface UserSubscription {
  status: string;
  renews_at: string | null;
  stripe_subscription_id: string | null;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  subscription?: UserSubscription | null;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
    return;
  }

  // Fetch role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  req.user = {
    id: data.user.id,
    email: data.user.email!,
    role: profile?.role || 'subscriber',
  };

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, renews_at, stripe_subscription_id')
    .eq('user_id', data.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  req.subscription = subscription ?? null;

  next();
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access only' });
    return;
  }
  next();
};

export const requireActiveSubscription = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!isSubscriptionCurrentlyActive(req.subscription)) {
    res.status(402).json({
      success: false,
      error: 'Active subscription required',
      code: 'SUBSCRIPTION_REQUIRED',
    });
    return;
  }

  next();
};
