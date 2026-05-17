create table if not exists public.om_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'editor',
  updated_at timestamptz not null default now()
);

alter table public.om_profiles add column if not exists display_name text;

alter table public.om_profiles drop constraint if exists om_profiles_role_check;
alter table public.om_profiles
  add constraint om_profiles_role_check check (role in ('admin', 'reviewer', 'editor', 'viewer'));

alter table public.om_profiles enable row level security;

create or replace function public.is_om_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.om_profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_om_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.om_profiles (user_id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'editor'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_om_profile on auth.users;
create trigger on_auth_user_created_om_profile
after insert on auth.users
for each row execute function public.handle_new_om_user();

drop policy if exists "Users can read their own O&M profile" on public.om_profiles;
create policy "Users can read their own O&M profile"
on public.om_profiles
for select
to authenticated
using (auth.uid() = user_id or public.is_om_admin());

drop policy if exists "Admins can update O&M user roles" on public.om_profiles;
create policy "Admins can update O&M user roles"
on public.om_profiles
for update
to authenticated
using (public.is_om_admin())
with check (public.is_om_admin());

insert into public.om_profiles (user_id, email, display_name, role)
select id, email, coalesce(raw_user_meta_data->>'display_name', raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 'editor'
from auth.users
on conflict (user_id) do nothing;

update public.om_profiles profile
set
  email = coalesce(profile.email, auth_user.email),
  display_name = coalesce(profile.display_name, auth_user.raw_user_meta_data->>'display_name', auth_user.raw_user_meta_data->>'full_name', split_part(auth_user.email, '@', 1))
from auth.users auth_user
where profile.user_id = auth_user.id
  and (profile.email is null or profile.display_name is null);

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
