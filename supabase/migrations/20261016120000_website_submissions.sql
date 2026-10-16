create table if not exists public.website_submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'newsletter', 'waitlist')),
  email text not null,
  name text,
  organization text,
  intent text,
  message text,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists website_submissions_kind_created_idx
  on public.website_submissions (kind, created_at desc);

create index if not exists website_submissions_email_idx
  on public.website_submissions (lower(email));

alter table public.website_submissions enable row level security;

create policy "Service role can insert website submissions"
  on public.website_submissions
  for insert
  to service_role
  with check (true);
