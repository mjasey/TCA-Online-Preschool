-- TCA owner workspace: drafts, published pages, media, and design requests.
-- Apply this migration to the dedicated TCA Supabase project.

create table if not exists public.cms_editors (
  email text primary key check (email = lower(email)),
  display_name text not null default 'TCA editor',
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.published_pages (
  slug text primary key check (slug in ('home', 'enroll', 'donate')),
  content jsonb not null default '{}'::jsonb,
  version integer not null default 1 check (version > 0),
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now()
);

create table if not exists public.page_drafts (
  slug text primary key check (slug in ('home', 'enroll', 'donate')),
  content jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_activity (
  id bigint generated always as identity primary key,
  slug text not null check (slug in ('home', 'enroll', 'donate')),
  action text not null check (action in ('published', 'restored')),
  version integer not null,
  content jsonb not null,
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.change_requests (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_by_email text not null,
  category text not null check (char_length(category) between 1 and 100),
  page text not null check (char_length(page) between 1 and 100),
  summary text not null check (char_length(summary) between 1 and 120),
  details text not null check (char_length(details) between 1 and 3000),
  reference_url text check (reference_url is null or char_length(reference_url) <= 500),
  priority text not null default 'normal' check (priority in ('normal', 'soon', 'urgent')),
  status text not null default 'new' check (status in ('new', 'reviewing', 'in_progress', 'ready_for_review', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cms_editors enable row level security;
alter table public.published_pages enable row level security;
alter table public.page_drafts enable row level security;
alter table public.cms_activity enable row level security;
alter table public.change_requests enable row level security;

create policy "Editors can read their own editor profile"
on public.cms_editors for select
to authenticated
using (email = lower((select auth.jwt() ->> 'email')));

create policy "Anyone can read published website content"
on public.published_pages for select
to anon, authenticated
using (true);

create policy "Editors can create published website content"
on public.published_pages for insert
to authenticated
with check (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt() ->> 'email'))
));

create policy "Editors can update published website content"
on public.published_pages for update
to authenticated
using (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt() ->> 'email'))
))
with check (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt() ->> 'email'))
));

create policy "Editors can read drafts"
on public.page_drafts for select
to authenticated
using (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt() ->> 'email'))
));

create policy "Editors can create drafts"
on public.page_drafts for insert
to authenticated
with check (
  updated_by = (select auth.uid())
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt() ->> 'email'))
  )
);

create policy "Editors can update drafts"
on public.page_drafts for update
to authenticated
using (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt() ->> 'email'))
))
with check (
  updated_by = (select auth.uid())
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt() ->> 'email'))
  )
);

create policy "Editors can read publishing history"
on public.cms_activity for select
to authenticated
using (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt() ->> 'email'))
));

create policy "Editors can add publishing history"
on public.cms_activity for insert
to authenticated
with check (
  actor_id = (select auth.uid())
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt() ->> 'email'))
  )
);

create policy "Editors can read website change requests"
on public.change_requests for select
to authenticated
using (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt() ->> 'email'))
));

create policy "Editors can create website change requests"
on public.change_requests for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and created_by_email = lower((select auth.jwt() ->> 'email'))
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt() ->> 'email'))
  )
);

create policy "Administrators can update website change requests"
on public.change_requests for update
to authenticated
using (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt() ->> 'email')) and role = 'admin'
))
with check (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt() ->> 'email')) and role = 'admin'
));

grant select on public.cms_editors to authenticated;
grant select on public.published_pages to anon, authenticated;
grant insert, update on public.published_pages to authenticated;
grant select, insert, update on public.page_drafts to authenticated;
grant select, insert on public.cms_activity to authenticated;
grant select, insert, update on public.change_requests to authenticated;
grant usage, select on sequence public.cms_activity_id_seq to authenticated;

create or replace function public.publish_cms_page(p_slug text)
returns public.published_pages
language plpgsql
security invoker
set search_path = public
as $$
declare
  draft_record public.page_drafts;
  published_record public.published_pages;
  next_version integer;
begin
  if p_slug not in ('home', 'enroll', 'donate') then
    raise exception 'Unknown website page';
  end if;

  if not exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt() ->> 'email'))
  ) then
    raise exception 'Editor access required';
  end if;

  select * into draft_record from public.page_drafts where slug = p_slug;
  if not found then raise exception 'Save a draft before publishing'; end if;

  select coalesce(max(version), 0) + 1 into next_version
  from public.published_pages where slug = p_slug;

  insert into public.published_pages (slug, content, version, published_by, published_at)
  values (p_slug, draft_record.content, next_version, (select auth.uid()), now())
  on conflict (slug) do update set
    content = excluded.content,
    version = public.published_pages.version + 1,
    published_by = excluded.published_by,
    published_at = excluded.published_at
  returning * into published_record;

  insert into public.cms_activity (slug, action, version, content, actor_id, actor_email)
  values (p_slug, 'published', published_record.version, published_record.content, (select auth.uid()), lower((select auth.jwt() ->> 'email')));

  return published_record;
end;
$$;

revoke all on function public.publish_cms_page(text) from public;
revoke all on function public.publish_cms_page(text) from anon;
grant execute on function public.publish_cms_page(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media',
  'cms-media',
  true,
  78643200,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view CMS media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'cms-media');

create policy "Editors can upload CMS media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'cms-media'
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt() ->> 'email'))
  )
);

create policy "Editors can replace CMS media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'cms-media'
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt() ->> 'email'))
  )
)
with check (
  bucket_id = 'cms-media'
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt() ->> 'email'))
  )
);

create policy "Editors can delete CMS media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'cms-media'
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt() ->> 'email'))
  )
);
