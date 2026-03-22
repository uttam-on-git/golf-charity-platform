import { Router, Response } from 'express';
import { PostgrestError } from '@supabase/supabase-js';

import supabase from '../config/supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

function isNotificationsSchemaMissing(error: PostgrestError | null): boolean {
  if (!error) {
    return false;
  }

  return (
    error.code === '42P01' ||
    error.code === '42703' ||
    (typeof error.message === 'string' && error.message.toLowerCase().includes('notifications'))
  );
}

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false });

  if (error) {
    if (isNotificationsSchemaMissing(error)) {
      res.json({
        success: true,
        data: [],
        unread_count: 0,
      });
      return;
    }

    res.status(500).json({ success: false, error: error.message });
    return;
  }

  const notifications = data ?? [];
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  res.json({
    success: true,
    data: notifications,
    unread_count: unreadCount,
  });
});

router.patch('/:id/read', async (req: AuthRequest, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .select()
    .single();

  if (error || !data) {
    if (isNotificationsSchemaMissing(error)) {
      res.json({ success: true, data: null, message: 'Notifications are not enabled yet' });
      return;
    }

    res.status(404).json({ success: false, error: 'Notification not found' });
    return;
  }

  res.json({ success: true, data });
});

router.post('/read-all', async (req: AuthRequest, res: Response): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', req.user!.id)
    .is('read_at', null);

  if (error) {
    if (isNotificationsSchemaMissing(error)) {
      res.json({ success: true, message: 'Notifications are not enabled yet' });
      return;
    }

    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, message: 'Notifications marked as read' });
});

export default router;
