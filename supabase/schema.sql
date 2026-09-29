create table if not exists profiles (id uuid primary key references auth.users on delete cascade, email text, credits int not null default 20, role text not null default 'user', created_at timestamptz default now());
create table if not exists photo_jobs (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade, tool text not null, status text not null default 'pending', input_url text, output_url text, credits_used int default 1, created_at timestamptz default now());
alter table profiles enable row level security;
alter table photo_jobs enable row level security;
create policy "profile self read" on profiles for select using (auth.uid()=id);
create policy "jobs self read" on photo_jobs for select using (auth.uid()=user_id);
create policy "jobs self insert" on photo_jobs for insert with check (auth.uid()=user_id);