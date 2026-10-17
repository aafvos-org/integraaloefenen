-- =============================================================================
-- Migratie 0078: klikmeting zonder cookies
-- =============================================================================
-- Cloudflare Web Analytics telt alleen paginabezoeken. Hier komt bij wat een
-- bezoeker daarna doet: waar hij klikt, waar hij mis klikt, hoe ver hij
-- scrolt, en of hij uiteindelijk een account maakt. Ook zonder account.
--
-- Wat er NIET in staat: geen IP-adres, geen user-agent, geen e-mailadres,
-- geen user_id, geen ingetypt antwoord en niets van de beheerpagina's.
--
-- Twee soorten herkenning, allebei zonder cookie:
--
--   sessie_id   Een willekeurig id per tabblad. Staat in `sessionStorage` en
--               verdwijnt als het tabblad dichtgaat. Samen met `volgnummer`
--               is de route binnen één bezoek op volgorde te leggen. Een
--               bezoeker zonder account krijgt niets anders en niets blijvends.
--
--   schuilnaam  Alleen bij een ingelogde leerling. HMAC-SHA256 over het
--               user_id met een geheim dat als Worker-secret in Cloudflare
--               staat (MEET_SCHUILNAAM_GEHEIM), ingekort tot 16 tekens.
--               Daarmee zijn de klikken van dezelfde leerling over meerdere
--               dagen te volgen, zonder naam en zonder e-mailadres. Het
--               user_id staat er bewust niet naast: dan was de schuilnaam
--               zinloos.
--
-- Bewaartermijn: 90 dagen ruwe gebeurtenissen. Wat daarna nog nodig is voor
-- de trend staat in `site_meet_dagtotalen`, en dat zijn alleen aantallen.
--
-- Idempotent: mag vaker draaien.
-- =============================================================================

-- hmac() voor public.meet_schuilnaam hieronder. Op Supabase staat pgcrypto al
-- in het schema `extensions`; dan doet dit niets.
create extension if not exists pgcrypto;

-- ── De ruwe gebeurtenissen ───────────────────────────────────────────────────

create table if not exists public.site_gebeurtenissen (
  id           bigint generated always as identity primary key,
  site         text        not null default 'integralen',
  tijdstip     timestamptz not null default now(),
  sessie_id    text        not null,
  volgnummer   integer     not null,
  soort        text        not null,
  pad          text        not null,
  doel         text,
  scrolldiepte smallint,
  apparaat     text        not null,
  verwijzer    text,
  van          text,
  utm_source   text,
  ingelogd     boolean     not null default false,
  schuilnaam   text
);

comment on table public.site_gebeurtenissen is
  'Klikmeting zonder cookies. 90 dagen bewaard; daarna blijven alleen de dagtotalen over.';
comment on column public.site_gebeurtenissen.sessie_id is
  'Willekeurig id van één tabblad, uit sessionStorage. Geen cookie, verdwijnt met het tabblad.';
comment on column public.site_gebeurtenissen.volgnummer is
  'Hoeveelste gebeurtenis binnen dit bezoek. Op volgorde leggen geeft de route.';
comment on column public.site_gebeurtenissen.schuilnaam is
  'Alleen bij ingelogde leerlingen: HMAC-SHA256(user_id, geheim), eerste 16 tekens. Niet terug te rekenen zonder het geheim.';
comment on column public.site_gebeurtenissen.pad is
  'Het pad zonder queryparameters. Wat er van ?van= en ?utm_source= bewaard wordt, staat in de eigen kolommen hiernaast.';

-- Alle kolommen die er na een eerdere versie van deze migratie nog niet zijn.
alter table public.site_gebeurtenissen add column if not exists schuilnaam text;
alter table public.site_gebeurtenissen add column if not exists volgnummer integer;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'site_gebeurtenissen'
      and column_name = 'volgnummer' and is_nullable = 'YES'
  ) then
    update public.site_gebeurtenissen set volgnummer = id where volgnummer is null;
    alter table public.site_gebeurtenissen alter column volgnummer set not null;
  end if;
end
$$;

alter table public.site_gebeurtenissen
  drop constraint if exists site_gebeurtenissen_soort_check;
alter table public.site_gebeurtenissen
  add constraint site_gebeurtenissen_soort_check check (
    soort in (
      'pagina', 'klik', 'dode_klik', 'woedeklik', 'fout', 'scroll',
      'geregistreerd', 'ingelogd'
    )
  );

alter table public.site_gebeurtenissen
  drop constraint if exists site_gebeurtenissen_apparaat_check;
alter table public.site_gebeurtenissen
  add constraint site_gebeurtenissen_apparaat_check
  check (apparaat in ('telefoon', 'tablet', 'computer'));

alter table public.site_gebeurtenissen
  drop constraint if exists site_gebeurtenissen_scrolldiepte_check;
alter table public.site_gebeurtenissen
  add constraint site_gebeurtenissen_scrolldiepte_check
  check (scrolldiepte is null or scrolldiepte in (25, 50, 75, 100));

-- Een schuilnaam hoort alleen bij iemand die ingelogd is, en is altijd
-- 16 tekens hex. Zo kan er nooit per ongeluk iets anders in belanden.
alter table public.site_gebeurtenissen
  drop constraint if exists site_gebeurtenissen_schuilnaam_check;
alter table public.site_gebeurtenissen
  add constraint site_gebeurtenissen_schuilnaam_check check (
    schuilnaam is null
    or (ingelogd and schuilnaam ~ '^[0-9a-f]{16}$')
  );

-- Hetzelfde volgnummer binnen één bezoek kan maar één keer. Daardoor levert
-- een pakketje dat de browser opnieuw stuurt geen dubbele regels op.
create unique index if not exists site_gebeurtenissen_sessie_volgnummer_idx
  on public.site_gebeurtenissen (sessie_id, volgnummer);

create index if not exists site_gebeurtenissen_tijdstip_idx
  on public.site_gebeurtenissen (tijdstip desc);

create index if not exists site_gebeurtenissen_sessie_tijd_idx
  on public.site_gebeurtenissen (sessie_id, tijdstip desc);

create index if not exists site_gebeurtenissen_schuilnaam_idx
  on public.site_gebeurtenissen (schuilnaam, tijdstip desc)
  where schuilnaam is not null;

create index if not exists site_gebeurtenissen_soort_idx
  on public.site_gebeurtenissen (soort, tijdstip desc);

-- ── Wie erbij mag ────────────────────────────────────────────────────────────
-- Niemand in de browser. De site schrijft met de service-role (die gaat langs
-- RLS heen), de analist leest mee.

alter table public.site_gebeurtenissen enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'site_gebeurtenissen'
      and policyname = 'analist_lezen'
  ) then
    create policy analist_lezen on public.site_gebeurtenissen
      for select to analist using (true);
  end if;
end
$$;

revoke all on table public.site_gebeurtenissen from anon, authenticated;
grant all on table public.site_gebeurtenissen to service_role;
grant select on table public.site_gebeurtenissen to analist;

-- ── De schuilnaam, ook in SQL ────────────────────────────────────────────────
-- Dezelfde berekening als in src/lib/meten/schuilnaam.ts. Nodig voor de view
-- die voortgangscijfers aan een schuilnaam hangt: die moet van een user_id
-- naar de schuilnaam kunnen rekenen, zonder dat het user_id of het geheim
-- ergens zichtbaar wordt.
--
-- Het geheim staat in de Vault onder `meet_schuilnaam_geheim` en moet
-- dezelfde waarde hebben als het Worker-secret MEET_SCHUILNAAM_GEHEIM.
-- Ontbreekt het, dan is de uitkomst null en blijft de view leeg — liever
-- niets dan een schuilnaam die niet klopt.

create or replace function public.meet_schuilnaam(gebruiker uuid)
returns text
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  geheim text;
begin
  if gebruiker is null then
    return null;
  end if;
  if to_regclass('vault.decrypted_secrets') is null then
    return null;
  end if;
  select decrypted_secret into geheim
  from vault.decrypted_secrets
  where name = 'meet_schuilnaam_geheim';
  if geheim is null or geheim = '' then
    return null;
  end if;
  return left(encode(hmac(gebruiker::text, geheim, 'sha256'), 'hex'), 16);
end;
$$;

comment on function public.meet_schuilnaam(uuid) is
  'HMAC-SHA256(user_id, geheim uit de Vault), eerste 16 tekens. Zelfde uitkomst als src/lib/meten/schuilnaam.ts.';

-- Niet voor de site zelf en niet voor een ingelogde leerling: wie deze functie
-- kan aanroepen, kan voor een bekend user_id de schuilnaam opzoeken.
revoke all on function public.meet_schuilnaam(uuid) from public, anon, authenticated;

-- De analist heeft hem wel nodig, want PostgreSQL kijkt bij een functie in een
-- view naar wie de vraag stelt en niet naar wie de view bezit. Dat is hier geen
-- nieuwe deur: de analist mag `profiles` al lezen, dus hij kon de user_id's
-- sowieso al zien. Waar het om gaat is dat de user_id nooit in
-- `site_gebeurtenissen` terechtkomt, en dat blijft zo.
grant execute on function public.meet_schuilnaam(uuid) to analist;

-- ── Dagtotalen, voor na de 90 dagen ──────────────────────────────────────────

create table if not exists public.site_meet_dagtotalen (
  dag       date   not null,
  soort     text   not null,
  pad       text   not null,
  apparaat  text   not null,
  aantal    integer not null,
  sessies   integer not null,
  primary key (dag, soort, pad, apparaat)
);

comment on table public.site_meet_dagtotalen is
  'Aantallen per dag uit site_gebeurtenissen. Blijft staan als de ruwe regels na 90 dagen weg zijn.';

alter table public.site_meet_dagtotalen enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'site_meet_dagtotalen'
      and policyname = 'analist_lezen'
  ) then
    create policy analist_lezen on public.site_meet_dagtotalen
      for select to analist using (true);
  end if;
end
$$;

revoke all on table public.site_meet_dagtotalen from anon, authenticated;
grant all on table public.site_meet_dagtotalen to service_role;
grant select on table public.site_meet_dagtotalen to analist;

-- ── Opruimen ─────────────────────────────────────────────────────────────────
-- Eerst de dagtotalen bijwerken van elke dag die af is, dan alles weggooien
-- wat ouder is dan 90 dagen.

create or replace function public.meet_opruimen()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  verwijderd integer;
begin
  insert into public.site_meet_dagtotalen (dag, soort, pad, apparaat, aantal, sessies)
  select
    (tijdstip at time zone 'Europe/Amsterdam')::date,
    soort,
    pad,
    apparaat,
    count(*)::integer,
    count(distinct sessie_id)::integer
  from public.site_gebeurtenissen
  where tijdstip < date_trunc('day', now() at time zone 'Europe/Amsterdam')
  group by 1, 2, 3, 4
  on conflict (dag, soort, pad, apparaat) do update
    set aantal = excluded.aantal,
        sessies = excluded.sessies;

  delete from public.site_gebeurtenissen where tijdstip < now() - interval '90 days';
  get diagnostics verwijderd = row_count;
  return verwijderd;
end;
$$;

comment on function public.meet_opruimen() is
  'Werkt de dagtotalen bij en gooit ruwe gebeurtenissen ouder dan 90 dagen weg.';

revoke all on function public.meet_opruimen() from public, anon, authenticated, analist;

-- Elke nacht. Draait deze database zonder pg_cron (bijvoorbeeld de lokale
-- Supabase van de tests), dan blijft het bij een waarschuwing.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.unschedule('meet-opruimen')
    from cron.job where jobname = 'meet-opruimen';
    perform cron.schedule('meet-opruimen', '20 3 * * *', 'select public.meet_opruimen()');
  else
    raise warning 'pg_cron ontbreekt; meet_opruimen() draait niet vanzelf.';
  end if;
exception
  when others then
    raise warning 'meet-opruimen niet ingepland: %', sqlerrm;
end
$$;

-- ── Overzichten voor de analist ──────────────────────────────────────────────
-- `security_invoker` staat aan: de analist leest met zijn eigen rechten, dus
-- een view kan nooit meer laten zien dan hij zelf mag zien. De enige
-- uitzondering staat helemaal onderaan en is daar uitgelegd.

create or replace view public.meet_bezoekers_per_dag
with (security_invoker = true) as
select
  (tijdstip at time zone 'Europe/Amsterdam')::date as dag,
  count(distinct sessie_id)                        as bezoeken,
  count(*) filter (where soort = 'pagina')         as paginas,
  count(distinct sessie_id) filter (where ingelogd) as ingelogde_bezoeken,
  count(distinct schuilnaam)                        as leerlingen
from public.site_gebeurtenissen
group by 1
order by 1 desc;

comment on view public.meet_bezoekers_per_dag is
  'Hoeveel bezoeken en paginaweergaven per dag, en hoeveel daarvan van een ingelogde leerling waren.';

create or replace view public.meet_apparaten_per_dag
with (security_invoker = true) as
select
  (tijdstip at time zone 'Europe/Amsterdam')::date as dag,
  apparaat,
  count(distinct sessie_id) as bezoeken
from public.site_gebeurtenissen
group by 1, 2
order by 1 desc, 3 desc;

comment on view public.meet_apparaten_per_dag is
  'Telefoon tegenover tablet en computer, per dag.';

create or replace view public.meet_top_doelen
with (security_invoker = true) as
select
  pad,
  doel,
  count(*)                  as klikken,
  count(distinct sessie_id) as bezoeken
from public.site_gebeurtenissen
where soort = 'klik' and doel is not null
group by 1, 2
order by 3 desc;

comment on view public.meet_top_doelen is
  'Waar het meest op geklikt wordt, per pagina. `doel` is de vaste naam uit data-meet.';

create or replace view public.meet_dode_klikken
with (security_invoker = true) as
select
  pad,
  doel,
  count(*)                  as dode_klikken,
  count(distinct sessie_id) as bezoeken
from public.site_gebeurtenissen
where soort = 'dode_klik'
group by 1, 2
order by 3 desc;

comment on view public.meet_dode_klikken is
  'Klikken op iets dat niet klikbaar is. Veel op dezelfde plek: daar verwacht een leerling een knop.';

create or replace view public.meet_woedeklikken
with (security_invoker = true) as
select
  pad,
  doel,
  count(*)                  as woedeklikken,
  count(distinct sessie_id) as bezoeken
from public.site_gebeurtenissen
where soort = 'woedeklik'
group by 1, 2
order by 3 desc;

comment on view public.meet_woedeklikken is
  'Drie of meer klikken binnen een seconde op dezelfde plek: er gebeurt niet wat de leerling verwacht.';

create or replace view public.meet_fouten
with (security_invoker = true) as
select
  (tijdstip at time zone 'Europe/Amsterdam')::date as dag,
  pad,
  doel                      as melding,
  count(*)                  as aantal,
  count(distinct sessie_id) as bezoeken
from public.site_gebeurtenissen
where soort = 'fout'
group by 1, 2, 3
order by 1 desc, 4 desc;

comment on view public.meet_fouten is
  'JavaScript-fouten en 404''s per dag en per pagina.';

create or replace view public.meet_scrolldiepte
with (security_invoker = true) as
select
  pad,
  count(distinct sessie_id) filter (where scrolldiepte >= 25)  as tot_25,
  count(distinct sessie_id) filter (where scrolldiepte >= 50)  as tot_50,
  count(distinct sessie_id) filter (where scrolldiepte >= 75)  as tot_75,
  count(distinct sessie_id) filter (where scrolldiepte >= 100) as helemaal
from public.site_gebeurtenissen
where soort = 'scroll'
group by 1
order by 2 desc;

comment on view public.meet_scrolldiepte is
  'Hoe ver bezoekers op een pagina komen.';

-- De trechter uit het ticket: startpagina → proefsom → registreren → eerste som.
create or replace view public.meet_trechter
with (security_invoker = true) as
with per_bezoek as (
  select
    sessie_id,
    (min(tijdstip) at time zone 'Europe/Amsterdam')::date as dag,
    bool_or(pad in ('/', '/nl'))                          as zag_startpagina,
    bool_or(pad like '%/proberen%')                       as zag_proefsom,
    bool_or(pad like '%/registreren%')                    as zag_registreren,
    bool_or(soort = 'geregistreerd')                      as maakte_account,
    bool_or(pad like '%/oefenen%')                        as ging_oefenen
  from public.site_gebeurtenissen
  group by sessie_id
)
select
  dag,
  count(*)                                       as bezoeken,
  count(*) filter (where zag_startpagina)        as startpagina,
  count(*) filter (where zag_proefsom)           as proefsom,
  count(*) filter (where zag_registreren)        as registreerpagina,
  count(*) filter (where maakte_account)         as account_gemaakt,
  count(*) filter (where maakte_account and ging_oefenen) as eerste_som
from per_bezoek
group by dag
order by dag desc;

comment on view public.meet_trechter is
  'Per dag: hoeveel bezoeken de startpagina, de proefsom, het registreerformulier, een account en daarna het oefenen haalden.';

-- ── Routes per bezoek ────────────────────────────────────────────────────────

-- De eerste zes stappen van elk bezoek, op volgorde, als één leesbare regel.
create or replace view public.meet_route_per_bezoek
with (security_invoker = true) as
with genummerd as (
  select
    sessie_id,
    tijdstip,
    soort,
    pad,
    doel,
    row_number() over (partition by sessie_id order by volgnummer) as stap
  from public.site_gebeurtenissen
  -- Scrollen en fouten zeggen niets over de route zelf.
  where soort in ('pagina', 'klik', 'dode_klik', 'geregistreerd', 'ingelogd')
)
select
  sessie_id,
  (min(tijdstip) at time zone 'Europe/Amsterdam')::date as dag,
  string_agg(
    case
      when soort = 'pagina' then pad
      when soort in ('geregistreerd', 'ingelogd') then '<' || soort || '>'
      else coalesce(doel, soort)
    end,
    ' → ' order by stap
  ) as route,
  count(*) as stappen
from genummerd
where stap <= 6
group by sessie_id;

comment on view public.meet_route_per_bezoek is
  'De eerste zes stappen van elk bezoek als één regel, op volgorde van volgnummer.';

-- De twintig meest voorkomende routes.
create or replace view public.meet_top_routes
with (security_invoker = true) as
select
  route,
  count(*) as bezoeken,
  min(dag) as eerste_dag,
  max(dag) as laatste_dag
from public.meet_route_per_bezoek
group by route
order by bezoeken desc
limit 20;

comment on view public.meet_top_routes is
  'De twintig meest voorkomende routes van zes stappen. Hier zie je waar een bezoek meestal heen gaat.';

-- Alleen de bezoeken waarin een account gemaakt is: welke weg liep daarheen?
create or replace view public.meet_route_naar_registratie
with (security_invoker = true) as
with registraties as (
  select sessie_id, min(volgnummer) as registratie_stap
  from public.site_gebeurtenissen
  where soort = 'geregistreerd'
  group by sessie_id
),
stappen as (
  select
    g.sessie_id,
    g.tijdstip,
    g.soort,
    g.pad,
    g.doel,
    g.volgnummer
  from public.site_gebeurtenissen g
  join registraties r on r.sessie_id = g.sessie_id
  where g.volgnummer <= r.registratie_stap
    and g.soort in ('pagina', 'klik', 'dode_klik', 'geregistreerd')
)
select
  sessie_id,
  (min(tijdstip) at time zone 'Europe/Amsterdam')::date as dag,
  count(*) as stappen,
  round(extract(epoch from (max(tijdstip) - min(tijdstip))))::integer as seconden,
  string_agg(
    case
      when soort = 'pagina' then pad
      when soort = 'geregistreerd' then '<geregistreerd>'
      else coalesce(doel, soort)
    end,
    ' → ' order by volgnummer
  ) as route
from stappen
group by sessie_id
order by dag desc;

comment on view public.meet_route_naar_registratie is
  'De hele weg van binnenkomst tot het aanmaken van een account, per bezoek, met hoe lang dat duurde.';

-- ── Per schuilnaam ───────────────────────────────────────────────────────────

create or replace view public.meet_per_schuilnaam
with (security_invoker = true) as
select
  schuilnaam,
  count(distinct sessie_id)                                              as sessies,
  count(distinct (tijdstip at time zone 'Europe/Amsterdam')::date)       as dagen_actief,
  (min(tijdstip) at time zone 'Europe/Amsterdam')::date                  as eerste_dag,
  (max(tijdstip) at time zone 'Europe/Amsterdam')::date                  as laatste_dag,
  count(*)                                                               as gebeurtenissen,
  count(*) filter (where soort = 'pagina')                               as paginas,
  count(*) filter (where soort = 'klik')                                 as klikken
from public.site_gebeurtenissen
where schuilnaam is not null
group by schuilnaam
order by dagen_actief desc, sessies desc;

comment on view public.meet_per_schuilnaam is
  'Per ingelogde leerling (onder schuilnaam): hoeveel bezoeken en op hoeveel dagen. Geen naam, geen e-mailadres.';

-- Klikgedrag naast de voortgangscijfers, allebei onder dezelfde schuilnaam.
--
-- Deze view is bewust GEEN security_invoker. Hij moet het geheim uit de Vault
-- lezen om van user_id naar schuilnaam te rekenen, en dat mag de analist niet
-- zelf. Wat eruit komt is daarom zorgvuldig beperkt: een schuilnaam en
-- aantallen. Geen user_id, geen e-mailadres, geen gebruikersnaam en geen
-- ingetypt antwoord.
create or replace view public.meet_voortgang_per_schuilnaam as
with voortgang as (
  select
    public.meet_schuilnaam(s.user_id)                                  as schuilnaam,
    count(distinct s.id)                                               as oefensessies,
    count(a.id)                                                        as antwoorden,
    count(a.id) filter (where a.is_correct)                            as goed,
    count(distinct (s.started_at at time zone 'Europe/Amsterdam')::date) as oefendagen,
    (max(s.started_at) at time zone 'Europe/Amsterdam')::date          as laatst_geoefend
  from public.user_sessions_new s
  left join public.session_answers_new a on a.session_id = s.id
  where s.user_id is not null
  group by 1
)
select
  v.schuilnaam,
  v.oefensessies,
  v.antwoorden,
  v.goed,
  v.oefendagen,
  v.laatst_geoefend,
  m.sessies      as meet_sessies,
  m.dagen_actief as meet_dagen_actief,
  m.klikken      as meet_klikken
from voortgang v
left join public.meet_per_schuilnaam m on m.schuilnaam = v.schuilnaam
where v.schuilnaam is not null;

comment on view public.meet_voortgang_per_schuilnaam is
  'Voortgangscijfers naast het klikgedrag, per schuilnaam. Alleen aantallen; geen naam, e-mailadres of antwoord.';

grant select on public.meet_bezoekers_per_dag        to analist;
grant select on public.meet_apparaten_per_dag        to analist;
grant select on public.meet_top_doelen               to analist;
grant select on public.meet_dode_klikken             to analist;
grant select on public.meet_woedeklikken             to analist;
grant select on public.meet_fouten                   to analist;
grant select on public.meet_scrolldiepte             to analist;
grant select on public.meet_trechter                 to analist;
grant select on public.meet_route_per_bezoek         to analist;
grant select on public.meet_top_routes               to analist;
grant select on public.meet_route_naar_registratie   to analist;
grant select on public.meet_per_schuilnaam           to analist;
grant select on public.meet_voortgang_per_schuilnaam to analist;
