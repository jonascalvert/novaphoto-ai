create table if not exists profiles (id uuid primary key references auth.users on delete cascade, email text, credits int not null default 20, role text not null default 'user', created_at timestamptz default now());
create table if not exists photo_jobs (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade, tool text not null, status text not null default 'pending', input_url text, output_url text, credits_used int default 1, created_at timestamptz default now());
create table if not exists credit_transactions (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,amount int not null,kind text not null check(kind in ('purchase','usage','bonus','refund')),payment_provider text,payment_id text unique,created_at timestamptz default now());
alter table profiles enable row level security;alter table photo_jobs enable row level security;alter table credit_transactions enable row level security;
drop policy if exists "profile self read" on profiles;create policy "profile self read" on profiles for select using(auth.uid()=id);
drop policy if exists "profile self insert" on profiles;create policy "profile self insert" on profiles for insert with check(auth.uid()=id);
drop policy if exists "jobs self read" on photo_jobs;create policy "jobs self read" on photo_jobs for select using(auth.uid()=user_id);
drop policy if exists "jobs self insert" on photo_jobs;create policy "jobs self insert" on photo_jobs for insert with check(auth.uid()=user_id);
create policy "transactions self read" on credit_transactions for select using(auth.uid()=user_id);


create table if not exists photo_assets (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users on delete cascade,
 tool text not null,
 original_name text not null,
 storage_path text not null unique,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now() + interval '24 hours')
);
alter table photo_assets enable row level security;
drop policy if exists "assets self read" on photo_assets;
create policy "assets self read" on photo_assets for select using(auth.uid()=user_id);
drop policy if exists "assets self insert" on photo_assets;
create policy "assets self insert" on photo_assets for insert with check(auth.uid()=user_id);
drop policy if exists "assets self delete" on photo_assets;
create policy "assets self delete" on photo_assets for delete using(auth.uid()=user_id);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('private-photos','private-photos',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false;

drop policy if exists "private photos own select" on storage.objects;
create policy "private photos own select" on storage.objects for select to authenticated
using(bucket_id='private-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "private photos own insert" on storage.objects;
create policy "private photos own insert" on storage.objects for insert to authenticated
with check(bucket_id='private-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "private photos own delete" on storage.objects;
create policy "private photos own delete" on storage.objects for delete to authenticated
using(bucket_id='private-photos' and (storage.foldername(name))[1]=auth.uid()::text);
