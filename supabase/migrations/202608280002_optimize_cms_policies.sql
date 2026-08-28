-- Cache Auth claims once per statement in RLS policies and index foreign keys.

alter policy "Editors can read their own editor profile"
on public.cms_editors
using (email = lower((select auth.jwt()) ->> 'email'));

alter policy "Editors can create published website content"
on public.published_pages
with check (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt()) ->> 'email')
));

alter policy "Editors can update published website content"
on public.published_pages
using (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt()) ->> 'email')
))
with check (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt()) ->> 'email')
));

alter policy "Editors can read drafts"
on public.page_drafts
using (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt()) ->> 'email')
));

alter policy "Editors can create drafts"
on public.page_drafts
with check (
  updated_by = (select auth.uid())
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt()) ->> 'email')
  )
);

alter policy "Editors can update drafts"
on public.page_drafts
using (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt()) ->> 'email')
))
with check (
  updated_by = (select auth.uid())
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt()) ->> 'email')
  )
);

alter policy "Editors can read publishing history"
on public.cms_activity
using (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt()) ->> 'email')
));

alter policy "Editors can add publishing history"
on public.cms_activity
with check (
  actor_id = (select auth.uid())
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt()) ->> 'email')
  )
);

alter policy "Editors can read website change requests"
on public.change_requests
using (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt()) ->> 'email')
));

alter policy "Editors can create website change requests"
on public.change_requests
with check (
  created_by = (select auth.uid())
  and created_by_email = lower((select auth.jwt()) ->> 'email')
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt()) ->> 'email')
  )
);

alter policy "Administrators can update website change requests"
on public.change_requests
using (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt()) ->> 'email') and role = 'admin'
))
with check (exists (
  select 1 from public.cms_editors
  where email = lower((select auth.jwt()) ->> 'email') and role = 'admin'
));

alter policy "Editors can upload CMS media"
on storage.objects
with check (
  bucket_id = 'cms-media'
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt()) ->> 'email')
  )
);

alter policy "Editors can replace CMS media"
on storage.objects
using (
  bucket_id = 'cms-media'
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt()) ->> 'email')
  )
)
with check (
  bucket_id = 'cms-media'
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt()) ->> 'email')
  )
);

alter policy "Editors can delete CMS media"
on storage.objects
using (
  bucket_id = 'cms-media'
  and exists (
    select 1 from public.cms_editors
    where email = lower((select auth.jwt()) ->> 'email')
  )
);

create index if not exists published_pages_published_by_idx on public.published_pages (published_by);
create index if not exists page_drafts_updated_by_idx on public.page_drafts (updated_by);
create index if not exists cms_activity_actor_id_idx on public.cms_activity (actor_id);
create index if not exists change_requests_created_by_idx on public.change_requests (created_by);
