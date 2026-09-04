-- Run this script in Supabase SQL Editor before using the cloud version.
-- It creates per-user profiles, records, attachment metadata and private file policies.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '同学',
  school text not null default '',
  major text not null default '',
  grade text not null default '大二',
  goal text not null default '综合测评与个人成长记录',
  updated_at timestamptz not null default now()
);

create table if not exists public.records (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'portfolio',
  title text not null,
  date text not null default '',
  year text not null default '',
  org text not null default '',
  type text not null default '',
  award text not null default '',
  role text not null default '',
  team text not null default '',
  tools text not null default '',
  description text not null default '',
  responsibilities text not null default '',
  outcome text not null default '',
  metrics text not null default '',
  abilities text not null default '',
  summary text not null default '',
  tags text[] not null default '{}',
  material text not null default '',
  is_example boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  record_id text not null references public.records(id) on delete cascade,
  storage_path text not null unique,
  name text not null,
  type text not null default 'application/octet-stream',
  size bigint not null default 0,
  last_modified bigint not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.records enable row level security;
alter table public.attachments enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users can insert their own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users can update their own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Users can manage their own records" on public.records;
create policy "Users can manage their own records" on public.records for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own attachment metadata" on public.attachments;
create policy "Users can manage their own attachment metadata" on public.attachments for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('archive-files', 'archive-files', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can read their own archive files" on storage.objects;
drop policy if exists "Users can upload their own archive files" on storage.objects;
drop policy if exists "Users can update their own archive files" on storage.objects;
drop policy if exists "Users can delete their own archive files" on storage.objects;
create policy "Users can read their own archive files" on storage.objects for select to authenticated
  using (bucket_id = 'archive-files' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Users can upload their own archive files" on storage.objects for insert to authenticated
  with check (bucket_id = 'archive-files' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Users can update their own archive files" on storage.objects for update to authenticated
  using (bucket_id = 'archive-files' and (storage.foldername(name))[1] = (select auth.uid()::text))
  with check (bucket_id = 'archive-files' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Users can delete their own archive files" on storage.objects for delete to authenticated
  using (bucket_id = 'archive-files' and (storage.foldername(name))[1] = (select auth.uid()::text));

