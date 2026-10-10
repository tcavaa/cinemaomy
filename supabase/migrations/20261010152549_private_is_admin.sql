-- Move is_admin() out of the exposed `public` schema so it is not callable via
-- /rest/v1/rpc. Storage policies keep using it from the private schema.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

drop policy "media: admins can read" on storage.objects;
drop policy "media: admins can upload" on storage.objects;
drop policy "media: admins can update" on storage.objects;
drop policy "media: admins can delete" on storage.objects;

create policy "media: admins can read"
  on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select private.is_admin()));

create policy "media: admins can upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select private.is_admin()));

create policy "media: admins can update"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select private.is_admin()));

create policy "media: admins can delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select private.is_admin()));

drop function public.is_admin();
