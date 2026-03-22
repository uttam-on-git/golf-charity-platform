drop index if exists public.notifications_user_dedupe_idx;

create unique index if not exists notifications_user_dedupe_idx
on public.notifications (user_id, dedupe_key);
