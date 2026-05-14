create table if not exists public.om_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.om_projects enable row level security;

drop policy if exists "Users can read their own O&M projects" on public.om_projects;
create policy "Users can read their own O&M projects"
on public.om_projects
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own O&M projects" on public.om_projects;
create policy "Users can create their own O&M projects"
on public.om_projects
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own O&M projects" on public.om_projects;
create policy "Users can update their own O&M projects"
on public.om_projects
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own O&M projects" on public.om_projects;
create policy "Users can delete their own O&M projects"
on public.om_projects
for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('om-attachments', 'om-attachments', false)
on conflict (id) do nothing;

drop policy if exists "Users can read their own O&M attachments" on storage.objects;
create policy "Users can read their own O&M attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'om-attachments'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can upload their own O&M attachments" on storage.objects;
create policy "Users can upload their own O&M attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'om-attachments'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can update their own O&M attachments" on storage.objects;
create policy "Users can update their own O&M attachments"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'om-attachments'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'om-attachments'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can delete their own O&M attachments" on storage.objects;
create policy "Users can delete their own O&M attachments"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'om-attachments'
  and split_part(name, '/', 1) = auth.uid()::text
);
