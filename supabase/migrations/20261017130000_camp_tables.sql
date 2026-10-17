-- Nextwave Online Coding Camp: registration + sponsorship tables with RLS.
--
-- Privacy model (enforced here, not in app code):
--   * anyone may INSERT a *pending* row (public can register),
--   * nobody can READ rows publicly (no public SELECT policy),
--   * only rows with the 'admin' role may be READ or UPDATED,
--   * status can only ever be one of the known lifecycle values.

-- ---------------------------------------------------------------------------
-- camp_registrations
-- ---------------------------------------------------------------------------
create table if not exists public.camp_registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  paid_at timestamptz,

  -- Parent/guardian (the payer). Only child data below.
  parent_name text not null,
  parent_whatsapp text not null,
  parent_email text not null,

  -- Child data — deliberately minimal: first name + age only.
  child_first_name text not null,
  child_age integer not null,
  age_group text not null,
  city_state text,
  device text,
  consent boolean not null default false,

  -- Payment
  reference text not null unique,
  payment_method text check (payment_method in ('card', 'transfer')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  amount_kobo integer not null default 1200000,
  notes text
);

create index if not exists camp_registrations_status_idx on public.camp_registrations (status);
create index if not exists camp_registrations_created_idx on public.camp_registrations (created_at desc);
create index if not exists camp_registrations_reference_idx on public.camp_registrations (reference);

alter table public.camp_registrations enable row level security;
alter table public.camp_registrations force row level security;

drop policy if exists "camp_reg_public_insert" on public.camp_registrations;
create policy "camp_reg_public_insert"
  on public.camp_registrations
  for insert to anon, authenticated
  with check (status = 'pending');

drop policy if exists "camp_reg_admin_select" on public.camp_registrations;
create policy "camp_reg_admin_select"
  on public.camp_registrations
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "camp_reg_admin_update" on public.camp_registrations;
create policy "camp_reg_admin_update"
  on public.camp_registrations
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- camp_sponsorships
-- ---------------------------------------------------------------------------
create table if not exists public.camp_sponsorships (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  paid_at timestamptz,

  donor_name text,
  donor_email text not null,
  donor_whatsapp text,
  consent_show_name boolean not null default false,

  seats integer not null check (seats > 0),
  amount_kobo integer not null,

  reference text not null unique,
  payment_method text check (payment_method in ('card', 'transfer')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  notes text
);

create index if not exists camp_sponsorships_status_idx on public.camp_sponsorships (status);
create index if not exists camp_sponsorships_created_idx on public.camp_sponsorships (created_at desc);
create index if not exists camp_sponsorships_reference_idx on public.camp_sponsorships (reference);

alter table public.camp_sponsorships enable row level security;
alter table public.camp_sponsorships force row level security;

drop policy if exists "camp_spon_public_insert" on public.camp_sponsorships;
create policy "camp_spon_public_insert"
  on public.camp_sponsorships
  for insert to anon, authenticated
  with check (status = 'pending');

drop policy if exists "camp_spon_admin_select" on public.camp_sponsorships;
create policy "camp_spon_admin_select"
  on public.camp_sponsorships
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "camp_spon_admin_update" on public.camp_sponsorships;
create policy "camp_spon_admin_update"
  on public.camp_sponsorships
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
