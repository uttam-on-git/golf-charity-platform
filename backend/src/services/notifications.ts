import supabase from '../config/supabase.js';

export interface NotificationInput {
  userId: string;
  title: string;
  message: string;
  category?: 'system' | 'draw_result' | 'winner_alert' | 'billing';
  actionUrl?: string | null;
  dedupeKey?: string | null;
}

export async function notifyUser({
  userId,
  title,
  message,
  category = 'system',
  actionUrl = null,
  dedupeKey = null,
}: NotificationInput): Promise<void> {
  const payload = {
    user_id: userId,
    title,
    message,
    category,
    action_url: actionUrl,
    dedupe_key: dedupeKey,
  };

  if (dedupeKey) {
    const { error } = await supabase
      .from('notifications')
      .upsert(payload, { onConflict: 'user_id,dedupe_key' });

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return;
  }

  const { error } = await supabase
    .from('notifications')
    .insert(payload);

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

export async function notifyUsers(notifications: NotificationInput[]): Promise<void> {
  for (const notification of notifications) {
    await notifyUser(notification);
  }
}
