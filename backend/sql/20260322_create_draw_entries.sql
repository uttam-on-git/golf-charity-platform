create table if not exists public.draw_entries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists draw_entries_user_created_idx
on public.draw_entries (user_id, created_at desc);

create unique index if not exists draw_entries_draw_user_idx
on public.draw_entries (draw_id, user_id);
