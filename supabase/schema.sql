-- Portfolio : schéma Supabase / Supabase schema
-- À exécuter une fois dans Supabase > SQL Editor. / Run once in Supabase > SQL Editor.
-- Remplacez l'email ci-dessous si votre compte administrateur est différent.
-- Replace the email below if your admin account is different.

create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description_fr text not null default '',
  description_en text not null default '',
  features_fr text[] not null default '{}',
  features_en text[] not null default '{}',
  stack text[] not null default '{}',
  status text not null default 'in_progress'
    check (status in ('production', 'in_progress', 'completed', 'academic', 'security')),
  images text[] not null default '{}',
  demo_url text,
  code_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  title_fr text not null default '',
  title_en text not null default '',
  year text not null,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.journey (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title_fr text not null default '',
  title_en text not null default '',
  description_fr text not null default '',
  description_en text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.certifications enable row level security;
alter table public.journey enable row level security;

-- Lecture publique / public read
create policy "projects public read" on public.projects for select using (true);
create policy "certifications public read" on public.certifications for select using (true);
create policy "journey public read" on public.journey for select using (true);

-- Écriture réservée à l'administrateur / admin-only writes
create policy "projects admin write" on public.projects for all
  using ((auth.jwt() ->> 'email') = 'agbebaviobedelom@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'agbebaviobedelom@gmail.com');

create policy "certifications admin write" on public.certifications for all
  using ((auth.jwt() ->> 'email') = 'agbebaviobedelom@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'agbebaviobedelom@gmail.com');

create policy "journey admin write" on public.journey for all
  using ((auth.jwt() ->> 'email') = 'agbebaviobedelom@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'agbebaviobedelom@gmail.com');

-- Stockage des images / image storage
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

create policy "portfolio images public read" on storage.objects for select
  using (bucket_id = 'portfolio');

create policy "portfolio images admin insert" on storage.objects for insert
  with check (bucket_id = 'portfolio' and (auth.jwt() ->> 'email') = 'agbebaviobedelom@gmail.com');

create policy "portfolio images admin update" on storage.objects for update
  using (bucket_id = 'portfolio' and (auth.jwt() ->> 'email') = 'agbebaviobedelom@gmail.com');

create policy "portfolio images admin delete" on storage.objects for delete
  using (bucket_id = 'portfolio' and (auth.jwt() ->> 'email') = 'agbebaviobedelom@gmail.com');
