-- Customer accounts: bookings made while signed in (or claimed later from the
-- private ticket link) belong to a Supabase Auth user.

alter table public.bookings
  add column user_id uuid references auth.users (id) on delete set null;

create index bookings_user_idx on public.bookings (user_id, created_at desc);
