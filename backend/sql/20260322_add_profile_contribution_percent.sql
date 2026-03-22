alter table public.profiles
add column if not exists contribution_percent integer;

update public.profiles
set contribution_percent = 10
where contribution_percent is null;

alter table public.profiles
alter column contribution_percent set default 10;

alter table public.profiles
alter column contribution_percent set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_contribution_percent_check'
  ) then
    alter table public.profiles
    add constraint profiles_contribution_percent_check
    check (contribution_percent between 10 and 100);
  end if;
end $$;
