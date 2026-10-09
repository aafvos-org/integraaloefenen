-- =====================================================================
-- integraaloefenen.nl — seed data voor een LOKALE database
-- =====================================================================
-- Dit bestand draait alleen bij `npx supabase start` en `npx supabase db
-- reset` op je eigen computer en in de automatische controle. De echte
-- database krijgt het nooit te zien.
--
-- De oefenstof zelf staat in `supabase/migrations/` (hoofdstukken, onderwerpen
-- en opgaven in de `*_new`-tabellen). Hier staat alleen wat je lokaal nodig
-- hebt om de site te kunnen gebruiken: een vaste testleerling en een
-- testhoofdstuk waar de e2e-tests mee werken.
--
-- Eerder stond hier de oefenstof van afgeleideoefenen.nl in de oude tabellen
-- `topics`, `topic_clusters` en `questions`. Die kon niet meer draaien
-- (migratie 0011 haalde de kolom `questions.body` weg, waardoor elke
-- `supabase db reset` afbrak) en hoort niet bij deze site.
-- =====================================================================

-- =====================================================================
-- Vaste gegevens voor de e2e-tests (e2e/leerling-pad.spec.ts)
-- =====================================================================
-- Dit blok draait alleen op een LOKALE Supabase (`npx supabase db reset`) en
-- in de automatische controle. De echte database krijgt dit nooit te zien.
--
-- Het wachtwoord hieronder is geen geheim: dit account bestaat alleen op
-- je eigen computer en in de testomgeving.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Vaste testleerling: leerling@test.local / oefenen123
-- ---------------------------------------------------------------------
-- De lege tekstvelden zijn geen opsmuk: Supabase Auth struikelt over NULL in
-- confirmation_token en de andere token-kolommen ("Database error querying
-- schema") en weigert dan het inloggen.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  'e2e00000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'leerling@test.local',
  crypt('oefenen123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Test Leerling"}'::jsonb,
  now(),
  now(),
  '', '', '', ''
)
on conflict (id) do update
  set email              = excluded.email,
      encrypted_password = excluded.encrypted_password,
      email_confirmed_at = excluded.email_confirmed_at,
      updated_at         = now();

-- Zonder identity-rij weigert Supabase Auth het inloggen met wachtwoord.
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
values (
  'e2e00000-0000-4000-8000-000000000002',
  'e2e00000-0000-4000-8000-000000000001',
  'e2e00000-0000-4000-8000-000000000001',
  '{"sub":"e2e00000-0000-4000-8000-000000000001","email":"leerling@test.local","email_verified":true,"phone_verified":false}'::jsonb,
  'email',
  now(),
  now(),
  now()
)
on conflict (provider_id, provider) do nothing;

-- De onboarding is al gedaan (anders stuurt de middleware elke pagina door
-- naar /onboarding) en de rondleiding is al gezien, zodat die geen knoppen
-- afdekt in de tests.
update public.profiles
   set display_name = 'Test Leerling',
       onboarded_at = now(),
       tour_seen_at = now()
 where id = 'e2e00000-0000-4000-8000-000000000001';

-- ---------------------------------------------------------------------
-- Vaste oefenstof voor de tests: één hoofdstuk, twee onderwerpen
-- ---------------------------------------------------------------------
-- Alles staat onder de categorie 'primitiveren'; dat is het tabblad dat
-- /oefenen standaard opent.
insert into public.chapters (slug, title, book_part, order_index, site)
values ('e2e', 'Testhoofdstuk voor de e2e-tests', 1, 99, 'integralen')
on conflict (slug) do update
  set title       = excluded.title,
      order_index = excluded.order_index,
      site        = excluded.site;

insert into public.topics_new
  (slug, title, chapter_id, order_index, is_unlocked_by_default, site, category)
values
  ('e2e_nakijken',  'Nakijken (e2e)',
   (select id from public.chapters where slug = 'e2e'), 1, true,
   'integralen', 'primitiveren'),
  ('e2e_beheersen', 'Beheersen (e2e)',
   (select id from public.chapters where slug = 'e2e'), 2, true,
   'integralen', 'primitiveren')
on conflict (slug) do update
  set title       = excluded.title,
      chapter_id  = excluded.chapter_id,
      order_index = excluded.order_index,
      site        = excluded.site,
      category    = excluded.category;

insert into public.topic_clusters_new (topic_id, slug, title, order_index, site)
values
  ((select id from public.topics_new where slug = 'e2e_nakijken'),
   'e2e_goed',      'Goed antwoord (e2e)',    1, 'integralen'),
  ((select id from public.topics_new where slug = 'e2e_nakijken'),
   'e2e_fout',      'Fout antwoord (e2e)',    2, 'integralen'),
  ((select id from public.topics_new where slug = 'e2e_nakijken'),
   'e2e_constante', 'Zonder + C (e2e)',       3, 'integralen'),
  ((select id from public.topics_new where slug = 'e2e_beheersen'),
   'e2e_rij',       'Drie goed op rij (e2e)', 1, 'integralen')
on conflict (topic_id, slug) do update
  set title       = excluded.title,
      order_index = excluded.order_index,
      site        = excluded.site;

-- Vragen opnieuw neerzetten (questions_new heeft geen natuurlijke sleutel).
delete from public.questions_new
 where topic_id in (
   select id from public.topics_new
    where slug in ('e2e_nakijken', 'e2e_beheersen')
 );

-- Allemaal deel 2 van de driedeling: kale "primitiveer"-opgaven, zodat de
-- tests over het nakijken gaan en niet over het verhaaltje eromheen.
insert into public.questions_new
  (topic_id, cluster_id, latex_body, answer, latex_answer,
   difficulty, order_index, site)
select tc.topic_id, tc.id, q.latex_body, q.answer, q.latex_answer,
       1, q.order_index, 'integralen'
from (values
  -- Meteen goed: f(x) = x^2  →  F(x) = 1/3x^3 + c
  ('e2e_goed',      'f(x) = x^{2}',  '1/3x^3 + c', '\tfrac{1}{3}x^{3} + c', 1),
  -- Fout: f(x) = x^3  →  F(x) = 1/4x^4 + c, dus "3x^2" (de afgeleide) is mis
  ('e2e_fout',      'f(x) = x^{3}',  '1/4x^4 + c', '\tfrac{1}{4}x^{4} + c', 1),
  -- Zonder + C: f(x) = 2x  →  F(x) = x^2 + c; "x^2" hoort goed te zijn
  ('e2e_constante', 'f(x) = 2x',     'x^2 + c',    'x^{2} + c',             1),
  -- Drie op rij: 3x^2 → x^3,  4x^3 → x^4,  5x^4 → x^5
  ('e2e_rij',       'f(x) = 3x^{2}', 'x^3 + c',    'x^{3} + c',             1),
  ('e2e_rij',       'f(x) = 4x^{3}', 'x^4 + c',    'x^{4} + c',             2),
  ('e2e_rij',       'f(x) = 5x^{4}', 'x^5 + c',    'x^{5} + c',             3)
) as q(cluster_slug, latex_body, answer, latex_answer, order_index)
join public.topic_clusters_new tc on tc.slug = q.cluster_slug;
