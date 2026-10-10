-- Cinema O'my — initial schema
--
-- Data access model:
--   * The Next.js server talks to Postgres directly (Drizzle over the Supabase
--     pooler) as the table owner, so RLS does not apply to it.
--   * RLS is enabled on every table with no anon/authenticated policies, which
--     keeps the auto-generated Data API closed. Supabase Auth is used only for
--     admin sign-in and Storage only for admin uploads.

-- ─── Enums ──────────────────────────────────────────────────────────────────

create type public.event_kind as enum ('film', 'premiere', 'special', 'music', 'talk');
create type public.seat_kind as enum ('armchair', 'lounge', 'saucer');
create type public.screening_status as enum ('scheduled', 'cancelled');
create type public.booking_status as enum (
  'pending',   -- seats held, waiting for payment
  'paid',      -- payment approved, seats sold
  'expired',   -- hold ran out before payment
  'cancelled', -- cancelled by an admin, seats released
  'refunded',  -- payment reversed
  'conflict'   -- paid after the hold was lost; needs a refund
);
create type public.slide_theme as enum ('paper', 'dark', 'red');

-- ─── Admins ─────────────────────────────────────────────────────────────────

create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
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

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ─── Site content ───────────────────────────────────────────────────────────

create table public.site_settings (
  id              smallint primary key default 1 check (id = 1),
  name            text not null default 'Cinema O''my',
  tagline         text,
  address         text,
  district        text,
  city            text,
  phone           text,
  email           text,
  instagram_url   text,
  facebook_url    text,
  map_query       text,
  opening_hours   text,
  booking_note    text,
  default_prices  jsonb not null default '{"armchair": 1500, "lounge": 2000, "saucer": 2000}',
  hold_minutes    smallint not null default 15 check (hold_minutes between 5 and 30),
  updated_at      timestamptz not null default now()
);

create table public.pages (
  slug            text primary key,
  eyebrow         text,
  title           text not null,
  lead            text,
  body            text,
  image_url       text,
  image_alt       text,
  facts           jsonb not null default '[]',
  seo_description text,
  updated_at      timestamptz not null default now()
);

create table public.slides (
  id           uuid primary key default gen_random_uuid(),
  eyebrow      text,
  title        text not null,
  subtitle     text,
  aside        text,
  meta         text,
  image_url    text not null,
  image_alt    text,
  cta_label    text,
  link_url     text,
  theme        public.slide_theme not null default 'paper',
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index slides_sort_idx on public.slides (sort_order);

create table public.gallery_images (
  id           uuid primary key default gen_random_uuid(),
  image_url    text not null,
  alt          text,
  caption      text,
  width        integer,
  height       integer,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create index gallery_images_sort_idx on public.gallery_images (sort_order);

-- ─── Program ────────────────────────────────────────────────────────────────

create table public.events (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  kind            public.event_kind not null default 'film',
  title           text not null,
  original_title  text,
  tagline         text,
  director        text,
  year            smallint,
  country         text,
  runtime_minutes smallint,
  language        text,
  subtitles       text,
  synopsis        text,
  image_url       text,
  poster_url      text,
  trailer_url     text,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.screenings (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events (id) on delete cascade,
  starts_at  timestamptz not null,
  note       text,
  prices     jsonb not null,
  status     public.screening_status not null default 'scheduled',
  sales_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index screenings_starts_at_idx on public.screenings (starts_at);
create index screenings_event_idx on public.screenings (event_id);

-- ─── Hall ───────────────────────────────────────────────────────────────────

create table public.seats (
  id         smallint generated always as identity primary key,
  row_label  text not null,
  number     smallint not null,
  kind       public.seat_kind not null,
  x          real not null,
  y          real not null,
  rotation   real not null default 0,
  is_active  boolean not null default true,
  unique (row_label, number)
);

-- ─── Bookings ───────────────────────────────────────────────────────────────

create table public.bookings (
  id               uuid primary key default gen_random_uuid(),
  reference        text not null unique,
  screening_id     uuid not null references public.screenings (id) on delete restrict,
  status           public.booking_status not null default 'pending',
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text,
  amount           integer not null check (amount > 0),
  currency         text not null default 'GEL',
  seats            jsonb not null,
  access_token     text not null,
  expires_at       timestamptz not null,
  paid_at          timestamptz,
  checked_in_at    timestamptz,
  payment_order_id text unique,
  payment_id       text,
  payment_status   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index bookings_screening_status_idx on public.bookings (screening_id, status);
create index bookings_created_at_idx on public.bookings (created_at desc);

-- One row per seat currently held or sold. The primary key is what makes
-- double-selling a seat impossible.
create table public.booking_seats (
  screening_id uuid not null references public.screenings (id) on delete cascade,
  seat_id      smallint not null references public.seats (id),
  booking_id   uuid not null references public.bookings (id) on delete cascade,
  price        integer not null check (price >= 0),
  primary key (screening_id, seat_id)
);

create index booking_seats_booking_idx on public.booking_seats (booking_id);

create table public.payment_events (
  id              bigint generated always as identity primary key,
  booking_id      uuid references public.bookings (id) on delete set null,
  source          text not null,
  order_status    text,
  signature_valid boolean not null,
  payload         jsonb not null,
  created_at      timestamptz not null default now()
);

create index payment_events_booking_idx on public.payment_events (booking_id);

-- ─── Row level security (deny-all for the Data API) ─────────────────────────

alter table public.admins          enable row level security;
alter table public.site_settings   enable row level security;
alter table public.pages           enable row level security;
alter table public.slides          enable row level security;
alter table public.gallery_images  enable row level security;
alter table public.events          enable row level security;
alter table public.screenings      enable row level security;
alter table public.seats           enable row level security;
alter table public.bookings        enable row level security;
alter table public.booking_seats   enable row level security;
alter table public.payment_events  enable row level security;

-- ─── Storage: public media bucket, admin-only writes ─────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do nothing;

create policy "media: admins can read"
  on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

create policy "media: admins can upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));

create policy "media: admins can update"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

create policy "media: admins can delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
