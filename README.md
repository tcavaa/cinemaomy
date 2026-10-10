# Cinema O'my

Website and box office for **Cinema O'my** — a thirty-seat cinema on Saint Petersburg Street, Tbilisi.

- Poster-style public site: home slider, weekly program, film pages, about, contact, gallery.
- **Per-seat booking** on a top-view plan of the real hall (armchairs, front-row lounge chairs, back-row saucer chairs), with live availability and per-seat-type prices.
- **Flitt embedded checkout** — the card form sits inside the booking panel; payments are confirmed server-side with Flitt's signed API.
- Customer accounts: register, sign in, **My tickets**, password reset. Guests can book too and attach tickets to an account later.
- Tickets with QR codes; staff scan them to open the booking and check guests in.
- Admin for everything: program & screenings, prices, bookings & check-in, home slider, gallery, About/Contact pages, site settings and the seat layout.

## Stack

Next.js 16 (App Router, Cache Components, React 19) · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage) · Drizzle ORM · Flitt · Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values (see below)
npm run dev
```

Open **http://cinemaomy.localhost:3000** — not `localhost:3000`. Flitt's embedded checkout refuses pages served from a bare `localhost` host; any `*.localhost` name works and resolves to your machine automatically.

### Environment

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | Supabase **transaction pooler** URL (port 6543). The direct `db.<ref>.supabase.co` host is IPv6-only and does not work on Vercel. |
| `DATABASE_URL_SESSION` | Supabase **session pooler** URL (port 5432), used by the scripts. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project URL and publishable key. |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site (`https://…` in production). |
| `FLITT_MERCHANT_ID` / `FLITT_SECRET_KEY` | Flitt merchant ID and payment secret key. `1549901` / `test` is Flitt's public sandbox. |

### Database

The schema lives in `supabase/migrations/` (plain SQL, already applied to the project). `src/lib/db/schema.ts` mirrors it for Drizzle.

```bash
npm run db:seed     # demo program, hall layout, pages, slides, gallery (skips if data exists)
npm run db:studio   # browse the data
```

Every table has row level security enabled with no public policies: the Next.js server reads and writes through Drizzle, so the auto-generated Supabase Data API stays closed. Storage uses one public bucket, `media`, that only admins can write to.

### Your admin account

```bash
npm run admin:create -- you@example.com
```

Creates the account if it doesn't exist (asks for a password), marks it confirmed and grants admin rights. Then sign in at `/login` and open `/admin`. Run it again with another email to add more staff.

## Supabase settings to check

In the Supabase dashboard:

1. **Authentication → URL Configuration** — set *Site URL* to your production URL and add redirect URLs for `https://<your-domain>/**` and `http://cinemaomy.localhost:3000/**`.
2. **Authentication → Emails** — Supabase's built-in mailer only delivers to your own team's addresses and is heavily rate-limited. Before launch, add custom SMTP (e.g. Resend) so customers receive sign-up and password-reset emails — or switch off *Confirm email* if you prefer instant sign-up.
3. *(Optional)* For email links that work across devices, change the confirmation template link to
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/account`
   (and `type=recovery&next=/account/password` for password reset). The default links work too, via `/auth/callback`.

## Payments (Flitt)

Flow: the server holds the seats (15 minutes by default, set in Admin → Settings) and creates a Flitt order (`/api/checkout/token`) whose lifetime ends two minutes before the hold. The browser shows Flitt's embedded form with that token. When the payment succeeds, the server asks Flitt for the order status and marks the booking paid. Flitt also notifies `/api/payments/flitt/callback` (production only — Flitt can't reach your laptop) and redirects the browser through `/api/payments/flitt/return`. All three paths verify Flitt's SHA-1 signature, check the amount, and are idempotent. Every notification is kept in the payment log on the booking.

Sandbox test card: `4444 5555 6666 1111`, any expiry in the future and any CVV (the sandbox pre-fills it). More cards: <https://docs.flitt.com/api/testing/>.

**Going live:** put your merchant ID and payment secret key in the Vercel environment. Refunds are made in the Flitt merchant portal; cancelling a paid booking in the admin releases its seats and reminds you to refund.

## Deploying to Vercel

1. Import the GitHub repository in Vercel.
2. Add the environment variables above (with production `NEXT_PUBLIC_SITE_URL`).
3. Functions run in `fra1` (Frankfurt), next to the database — see `vercel.json`.

## Project structure

```
src/
  app/                      routes only — thin pages that compose features
    (site)/                 public site: home, program, book, tickets, account, auth pages
    admin/                  admin panel (signed-in admins only)
    api/                    bookings, seat availability, Flitt callback/return
    auth/                   Supabase email link handlers
  features/                 one folder per domain
    booking/                hall plan, seat picker, booking flow, tickets, service (holds & payments)
    events/                 program queries, event pages, admin editors
    payments/flitt/         signature, API client, embedded checkout
    content/ slides/ gallery/  CMS content and their admin
    auth/                   session helpers, sign-in/up actions, forms
    admin/                  admin shell and shared admin components
  components/               shared UI (buttons, fields, brand pieces, layout)
  lib/                      db (Drizzle), supabase clients, env, formatting, cache tags
supabase/                   migrations and seed
scripts/                    admin bootstrap and seed runner
```

Public pages are cached (`"use cache"` with tags) and refreshed the moment an admin saves; seat availability is always live.

## Admin quick guide

- **Program** — add a film/event, then its screenings (date, time, prices per seat type). Cancel a screening rather than deleting it once tickets are sold.
- **Bookings** — search by reference, name or email; open a booking to check guests in, re-check a payment or cancel. A *Needs refund* booking was paid after its hold expired and someone else took the seats.
- **Screening → Seats & guests** — the seat sheet and guest list for the door. Ticket QR codes open the booking directly.
- **Home slider** — poster slides in three colourways (paper, velvet, vermilion), reorder with the arrows.
- **Gallery** — drop photos in; they're resized in the browser before upload.
- **Pages** — About and Contact text (Markdown) and pictures.
- **Hall & seats** — switch a broken seat off, change a seat's type, or adjust the layout.
- **Settings** — address, phone, socials, opening hours, default prices, hold time.
