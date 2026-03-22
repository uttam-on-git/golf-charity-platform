import supabase from '../config/supabase.js';

export interface NotificationInput {
  userId: string;
  title: string;
  message: string;
  category?: 'system' | 'draw_result' | 'winner_alert' | 'billing';
  actionUrl?: string | null;
  dedupeKey?: string | null;
}

function formatNotificationContext(notification: NotificationInput): string {
  return `${notification.userId}:${notification.category ?? 'system'}:${notification.dedupeKey ?? notification.title}`;
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
    const { data: existingNotification, error: existingNotificationError } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('dedupe_key', dedupeKey)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingNotificationError) {
      throw new Error(`Failed to check existing notification: ${existingNotificationError.message}`);
    }

    if (existingNotification?.id) {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          title,
          message,
          category,
          action_url: actionUrl,
        })
        .eq('id', existingNotification.id);

      if (updateError) {
        throw new Error(`Failed to update notification: ${updateError.message}`);
      }

      return;
    }

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(payload);

    if (insertError) {
      throw new Error(`Failed to create notification: ${insertError.message}`);
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

export async function tryNotifyUser(notification: NotificationInput): Promise<boolean> {
  try {
    await notifyUser(notification);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown notification error';
    console.warn(`[notifications] skipped failed delivery for ${formatNotificationContext(notification)}: ${message}`);
    return false;
  }
}

export async function tryNotifyUsers(notifications: NotificationInput[]): Promise<number> {
  let deliveredCount = 0;

  for (const notification of notifications) {
    const delivered = await tryNotifyUser(notification);
    if (delivered) {
      deliveredCount += 1;
    }
  }

  return deliveredCount;
}
