-- Demo content for Cinema O'my. Run once on an empty database:
--   npm run db:seed
-- Everything here is editable from /admin.

begin;

-- ─── Settings & pages ───────────────────────────────────────────────────────

insert into public.site_settings (
  id, name, tagline, address, district, city, phone, instagram_url,
  map_query, opening_hours, booking_note, default_prices, hold_minutes
) values (
  1,
  'Cinema O''my',
  'Thirty seats, one screen, and films worth leaving the house for.',
  '8 Saint Petersburg Street',
  'Plekhanovi',
  'Tbilisi 0102',
  '+995 557 00 82 55',
  'https://www.instagram.com/cinemaomy/',
  'Cinema O''my, 8 Saint Petersburg Street, Tbilisi',
  'Doors open 30 minutes before each screening.',
  'Seats are held for 15 minutes while you pay. Your ticket appears on screen right after payment — no printing needed.',
  '{"armchair": 1500, "lounge": 2000, "saucer": 2000}',
  15
) on conflict (id) do nothing;

insert into public.pages (slug, eyebrow, title, lead, body, image_url, image_alt, facts, seo_description) values
(
  'about',
  'About',
  'A small room for big films',
  'Thirty leather seats, one screen and a programme that runs from Cassavetes to Akira — in an old building on Saint Petersburg Street.',
  E'## What we show\n\nFilms that deserve a big screen, whatever their age: classics, festival favourites, Georgian premieres, and the occasional special screening that is hard to explain until you are in the room. Most nights there are two screenings, at 18:00 and 21:00.\n\n## The room\n\nFive rows on wooden risers, leather armchairs, a few lounge chairs you can sink into, dark velvet curtains and a screen that fills the wall. With thirty seats there is no bad one — but if you have a favourite, you can pick it when you book.\n\n## Before and after\n\nThe bar opens before the first film: popcorn, Coca-Cola floats, wine. Stay after the credits; somebody usually wants to talk about what they just saw.',
  '/images/venue/hall.jpg',
  'The auditorium: leather armchairs on five rows facing the screen',
  '[{"value": "30", "label": "seats"}, {"value": "5", "label": "rows"}, {"value": "1", "label": "screen"}]',
  'Cinema O''my is a thirty-seat cinema in Tbilisi showing classics, festival films and premieres.'
),
(
  'contact',
  'Contact',
  'Find us',
  'On Saint Petersburg Street in Plekhanovi, a short walk from Marjanishvili metro.',
  E'Tickets for every screening are sold online — choose your seats and pay by card.\n\nFor group bookings, private screenings, festivals and collaborations, call us or send a message on Instagram.',
  '/images/venue/bar.jpg',
  'The concrete bar with hanging lamps and red stools',
  '[]',
  'Address, phone and directions for Cinema O''my in Tbilisi.'
)
on conflict (slug) do nothing;

-- ─── Hall: 30 seats on five rows (A is closest to the screen) ───────────────
-- Coordinates are in plan units of the 1000 × 900 hall drawing.

insert into public.seats (row_label, number, kind, x, y, rotation) values
  ('A', 1, 'lounge',   118, 236, -14),
  ('A', 2, 'lounge',   234, 240,  -8),
  ('A', 3, 'armchair', 372, 244,   0),
  ('A', 4, 'armchair', 628, 244,   0),
  ('A', 5, 'lounge',   766, 240,   8),
  ('A', 6, 'lounge',   882, 236,  14),

  ('B', 1, 'armchair', 104, 364, 0),
  ('B', 2, 'armchair', 194, 364, 0),
  ('B', 3, 'armchair', 284, 364, 0),
  ('B', 4, 'armchair', 374, 364, 0),
  ('B', 5, 'armchair', 626, 364, 0),
  ('B', 6, 'armchair', 716, 364, 0),
  ('B', 7, 'armchair', 806, 364, 0),

  ('C', 1, 'saucer',   148, 486, 0),
  ('C', 2, 'armchair', 284, 490, 0),
  ('C', 3, 'armchair', 374, 490, 0),
  ('C', 4, 'armchair', 626, 490, 0),
  ('C', 5, 'armchair', 716, 490, 0),
  ('C', 6, 'saucer',   852, 486, 0),

  ('D', 1, 'armchair', 194, 614, 0),
  ('D', 2, 'armchair', 284, 614, 0),
  ('D', 3, 'armchair', 374, 614, 0),
  ('D', 4, 'armchair', 626, 614, 0),
  ('D', 5, 'armchair', 716, 614, 0),
  ('D', 6, 'armchair', 806, 614, 0),

  ('E', 1, 'saucer', 250, 748, 0),
  ('E', 2, 'saucer', 375, 748, 0),
  ('E', 3, 'saucer', 500, 748, 0),
  ('E', 4, 'saucer', 625, 748, 0),
  ('E', 5, 'saucer', 750, 748, 0)
on conflict (row_label, number) do nothing;

-- ─── Program ────────────────────────────────────────────────────────────────

insert into public.events (slug, kind, title, original_title, tagline, director, year, country, runtime_minutes, language, synopsis, image_url, poster_url) values
('the-lobster', 'film', 'The Lobster', null, null, 'Yorgos Lanthimos', 2015, 'Ireland, UK, Greece', 119, 'English',
 'In a city where being single is against the rules, the unattached are sent to a seaside hotel and given forty-five days to find a match. Fail, and you are turned into the animal of your choice. David, newly divorced, has already picked the lobster.',
 '/images/films/lobster.jpg', null),
('the-room-next-door', 'film', 'The Room Next Door', null, null, 'Pedro Almodóvar', 2024, 'Spain', 107, 'English',
 'Two old friends — a novelist and a former war correspondent — share a rented house outside New York and a decision neither of them can take back. Almodóvar''s first English-language feature, with Tilda Swinton and Julianne Moore.',
 '/images/films/the-room-next-door.jpg', null),
('akira', 'film', 'Akira', 'アキラ', null, 'Katsuhiro Otomo', 1988, 'Japan', 124, 'Japanese',
 'Neo-Tokyo, 2019. A biker gang, a secret government project and a boy whose powers grow faster than anyone can contain them. The film that changed what animation could look like.',
 null, null),
('the-brand-new-testament', 'film', 'The Brand New Testament', 'Le Tout Nouveau Testament', null, 'Jaco Van Dormael', 2015, 'Belgium, France, Luxembourg', 115, 'French',
 'God lives in a small flat in Brussels and is a petty tyrant. His ten-year-old daughter leaks everyone''s date of death by text message, then goes out to find six new apostles of her own.',
 null, null),
('beginners', 'film', 'Beginners', null, null, 'Mike Mills', 2010, 'USA', 105, 'English',
 'After his father comes out at seventy-five, Oliver learns a few things about love from the man who raised him — told in loose, funny, heartbroken fragments.',
 null, null),
('on-the-way-home', 'premiere', 'On the Way Home', 'იქ, სადაც სახლია', 'Tbilisi premiere', 'Giorgi Kvelidze', null, 'Georgia', null, 'Georgian',
 'Giorgi Kvelidze''s documentary comes home after a festival run through Slamdance, Full Frame and Big Sky.',
 '/images/films/on-the-way-home.jpg', '/images/posters/on-the-way-home.jpg'),
('9-month-contract', 'film', '9-Month Contract', null, null, 'Ketevan Vashagashvili', 2024, 'Georgia', null, 'Georgian',
 'Ketevan Vashagashvili''s documentary, shown in competition at CPH:DOX.',
 null, '/images/posters/9-month-contract.jpg'),
('inner-blooming-springs', 'film', 'Inner Blooming Springs', null, null, 'Tiku Kobiashvili', 2025, 'Georgia', null, 'Georgian',
 'Tiku Kobiashvili''s film from the 75th Berlinale Forum, with Tina Matchavariani and Luka Chibukhaia.',
 null, '/images/posters/inner-blooming-springs.jpg'),
('the-million-dollar-hotel', 'film', 'The Million Dollar Hotel', null, null, 'Wim Wenders', 2000, 'Germany, USA', 122, 'English',
 'A death at a downtown Los Angeles flophouse brings an FBI agent into a hotel full of misfits who would rather not be found. From a story by Bono, with Jeremy Davies, Milla Jovovich and Mel Gibson.',
 '/images/films/the-million-dollar-hotel.jpg', null),
('babel', 'film', 'Babel', null, null, 'Alejandro G. Iñárritu', 2006, 'USA, Mexico', 143, 'English, Arabic, Japanese, Spanish',
 'A rifle shot in the Moroccan desert sets off a chain of events across four countries and as many languages. With Brad Pitt, Cate Blanchett, Gael García Bernal and Rinko Kikuchi.',
 '/images/films/babel.jpg', null),
('a-woman-under-the-influence', 'film', 'A Woman Under the Influence', null, null, 'John Cassavetes', 1974, 'USA', 155, 'English',
 'Gena Rowlands is Mabel, whose behaviour unsettles everyone around her; Peter Falk is the husband who loves her and cannot cope. Cassavetes at his most raw.',
 '/images/films/a-woman-under-the-influence.jpg', null),
('the-sopranos', 'special', 'The Sopranos', null, 'Special screening — season 1, episodes 1–4', 'David Chase', 1999, 'USA', 220, 'English',
 'The first four episodes of the first season, back to back on the big screen. Tony, Carmela, the ducks and Dr. Melfi.',
 '/images/films/the-sopranos.jpg', null),
('free-form-music-sets', 'music', 'Occupied Head, Tete Noise, KPOT', null, 'Three free-form music sets', null, null, null, null, null,
 'Three free-form music sets by Occupied Head, Tete Noise and KPOT, with a visual installation by GLASOON.',
 '/images/venue/red-screen.jpg', null),
('grand-opening', 'special', 'Grand Opening', null, 'A night of short films, wines & bites', null, null, null, null, null,
 'Our opening night: a programme of short films from Jeunet, Anderson, Burton, Jarmusch, Godard, Almodóvar and more, with food by Nuri Puri, music by MURJJ and an afterparty at St. Sebastian.',
 '/images/venue/bar.jpg', '/images/posters/grand-opening.jpg')
on conflict (slug) do nothing;

-- Screenings — times are Tbilisi local (+04:00).
insert into public.screenings (event_id, starts_at, note, prices)
select e.id, s.starts_at::timestamptz, s.note, coalesce(s.prices, '{"armchair": 1500, "lounge": 2000, "saucer": 2000}')::jsonb
from (values
  ('grand-opening',               '2026-09-18 18:00+04', null, null),
  ('a-woman-under-the-influence', '2026-09-22 18:00+04', null, null),
  ('babel',                       '2026-09-29 18:00+04', null, null),
  ('free-form-music-sets',        '2026-09-30 19:00+04', 'Until 23:00', '{"armchair": 2000, "lounge": 2000, "saucer": 2000}'),
  ('the-sopranos',                '2026-10-05 19:00+04', 'Episodes 1–4, with an interval', '{"armchair": 2500, "lounge": 2500, "saucer": 2500}'),
  ('the-million-dollar-hotel',    '2026-10-06 18:00+04', null, null),
  ('beginners',                   '2026-10-09 18:00+04', null, null),
  ('on-the-way-home',             '2026-10-09 21:00+04', null, null),
  ('the-room-next-door',          '2026-10-10 18:00+04', null, null),
  ('the-lobster',                 '2026-10-10 21:00+04', null, null),
  ('akira',                       '2026-10-11 18:00+04', null, null),
  ('the-brand-new-testament',     '2026-10-11 21:00+04', null, null),
  ('9-month-contract',            '2026-10-13 19:00+04', null, null),
  ('inner-blooming-springs',      '2026-10-14 20:00+04', null, null),
  ('the-room-next-door',          '2026-10-16 19:00+04', null, null),
  ('the-million-dollar-hotel',    '2026-10-17 18:00+04', null, null),
  ('babel',                       '2026-10-17 21:00+04', null, null),
  ('on-the-way-home',             '2026-10-18 19:00+04', 'Tbilisi premiere', null),
  ('a-woman-under-the-influence', '2026-10-20 19:00+04', null, null),
  ('the-lobster',                 '2026-10-23 21:00+04', null, null)
) as s(slug, starts_at, note, prices)
join public.events e on e.slug = s.slug;

-- ─── Home slider ────────────────────────────────────────────────────────────

insert into public.slides (eyebrow, title, subtitle, aside, meta, image_url, image_alt, cta_label, link_url, theme, sort_order) values
('Now showing', 'The Lobster', 'Directed by Yorgos Lanthimos', '(2015)', 'Saturday · 10.10 · 21:00',
 '/images/films/lobster.jpg', 'Colin Farrell and Rachel Weisz running through tall grass', 'Choose seats', '/program/the-lobster', 'paper', 1),
('Thirty seats · One screen', 'Cinema O''my', '8 Saint Petersburg Street, Tbilisi', null, 'Classics · Festival films · Premieres',
 '/images/venue/hall.jpg', 'The auditorium with leather armchairs on five rows', 'See the program', '/program', 'dark', 2),
('Tbilisi premiere', 'On the Way Home', 'A film by Giorgi Kvelidze', null, 'Sunday · 18.10 · 19:00',
 '/images/films/on-the-way-home-dusk.jpg', 'A figure leaning on a railing against a pink evening sky', 'Choose seats', '/program/on-the-way-home', 'red', 3),
('Next week', 'Babel', 'Directed by Alejandro G. Iñárritu', '(2006)', 'Saturday · 17.10 · 21:00',
 '/images/films/babel.jpg', 'Brad Pitt on a payphone, pressing his hand against the wall', 'Choose seats', '/program/babel', 'paper', 4);

-- ─── Gallery ────────────────────────────────────────────────────────────────

insert into public.gallery_images (image_url, alt, caption, width, height, sort_order) values
('/images/venue/hall.jpg',          'The auditorium: leather armchairs on five rows', 'The hall', 1354, 1020, 1),
('/images/venue/chair-popcorn.jpg', 'Popcorn and Coca-Cola on a leather armchair in the dark', null, 482, 590, 2),
('/images/venue/coke-float.jpg',    'A Coca-Cola float held up against a red Coca-Cola sign', 'Coca-Cola float', 484, 590, 3),
('/images/venue/book-on-chair.jpg', 'A Tim Burton monograph on a white chair', null, 482, 590, 4),
('/images/venue/popcorn-floor.jpg', 'Spilled popcorn on a checkered floor', null, 484, 590, 5),
('/images/venue/orange-chairs.jpg', 'Two orange armchairs under a poster in the lobby', 'The lobby', 484, 590, 6),
('/images/venue/bar.jpg',           'The concrete bar with hanging lamps and red stools', 'The bar', 482, 590, 7),
('/images/venue/dark-hall.jpg',     'The hall with the lights down', null, 482, 590, 8),
('/images/venue/red-screen.jpg',    'A guest standing in front of the glowing red screen', null, 330, 500, 9);

commit;
