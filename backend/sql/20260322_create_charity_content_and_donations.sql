create table if not exists public.charity_events (
  id uuid primary key default gen_random_uuid(),
  charity_id uuid not null references public.charities(id) on delete cascade,
  title text not null,
  summary text not null,
  event_date timestamptz not null,
  location text,
  signup_url text,
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists charity_events_charity_date_idx
on public.charity_events (charity_id, event_date asc);

create table if not exists public.charity_donations (
  id uuid primary key default gen_random_uuid(),
  charity_id uuid not null references public.charities(id) on delete cascade,
  donor_name text not null,
  donor_email text not null,
  amount_gbp numeric(10, 2) not null,
  status text not null default 'pending',
  stripe_checkout_session_id text not null,
  stripe_payment_intent_id text,
  donated_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists charity_donations_charity_created_idx
on public.charity_donations (charity_id, created_at desc);

create unique index if not exists charity_donations_session_idx
on public.charity_donations (stripe_checkout_session_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'charity_donations_status_check'
  ) then
    alter table public.charity_donations
    add constraint charity_donations_status_check
    check (status in ('pending', 'completed', 'cancelled'));
  end if;
end $$;
