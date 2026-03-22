alter table public.winners
add column if not exists proof_url text,
add column if not exists proof_file_name text,
add column if not exists proof_uploaded_at timestamptz,
add column if not exists verification_notes text,
add column if not exists verification_status text;

update public.winners
set verification_status = case
  when verified = true then 'approved'
  else 'pending'
end
where verification_status is null;

alter table public.winners
alter column verification_status set default 'pending';

alter table public.winners
alter column verification_status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'winners_verification_status_check'
  ) then
    alter table public.winners
    add constraint winners_verification_status_check
    check (verification_status in ('pending', 'approved', 'rejected'));
  end if;
end $$;
