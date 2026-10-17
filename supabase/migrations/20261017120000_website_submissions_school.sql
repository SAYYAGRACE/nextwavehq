alter table public.website_submissions
  add column if not exists school_name text,
  add column if not exists lga text,
  add column if not exists consent boolean not null default false;
