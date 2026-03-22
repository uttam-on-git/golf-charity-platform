import { Router, Response } from 'express';
import { PostgrestError } from '@supabase/supabase-js';

import supabase from '../config/supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { notifyUser } from '../services/notifications.js';

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

router.post('/test', async (req: AuthRequest, res: Response): Promise<void> => {
  const allowInProduction = req.user?.role === 'admin';
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !allowInProduction) {
    res.status(403).json({ success: false, error: 'Admin access required for notification test trigger' });
    return;
  }

  try {
    await notifyUser({
      userId: req.user!.id,
      title: 'Notification test successful',
      message: 'This test notification confirms the backend write path and dashboard feed are working.',
      category: 'system',
      actionUrl: '/dashboard/notifications',
      dedupeKey: `notification-test-${req.user!.id}-${Date.now()}`,
    });

    res.status(201).json({ success: true, message: 'Test notification created' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create test notification',
    });
  }
});

export default router;
