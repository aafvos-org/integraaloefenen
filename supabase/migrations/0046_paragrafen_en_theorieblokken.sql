-- =============================================================================
-- Paragrafen en theorieblokken, zoals het boek.
--
-- Een leerling zoekt K.1 A, niet een losse technieknaam. De onderwerpen blijven
-- staan (voortgang, clusters, categorie). Elk onderwerp van hoofdstuk K wijst
-- naar zijn theorieblok. Opgaven worden niet verplaatst of weggegooid.
--
-- K.0 A (differentiëren) hoort bij afgeleiden en staat hier niet in.
-- H11 blijft zonder blok: dat zijn de oude opgaven, onderaan in de zijbalk.
-- De titel van K.2 is voorlopig "Partieel integreren".
--
-- Twee keer draaien voegt niets dubbel toe. Ontbreekt een genoemd onderwerp,
-- dan stopt dit bestand en rolt de transactie terug.
-- =============================================================================

create table if not exists public.paragraphs (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  site text not null default 'integralen',
  slug text not null,
  label text not null,
  title text not null,
  order_index smallint not null,
  created_at timestamptz not null default now(),
  constraint paragraphs_site_check check (site = any (array['afgeleiden'::text, 'integralen'::text])),
  constraint paragraphs_slug_key unique (slug)
);

create table if not exists public.theory_blocks (
  id uuid primary key default gen_random_uuid(),
  paragraph_id uuid not null references public.paragraphs (id) on delete cascade,
  site text not null default 'integralen',
  slug text not null,
  letter text not null,
  title text not null,
  order_index smallint not null,
  created_at timestamptz not null default now(),
  constraint theory_blocks_site_check check (site = any (array['afgeleiden'::text, 'integralen'::text])),
  constraint theory_blocks_slug_key unique (slug),
  constraint theory_blocks_paragraph_letter_key unique (paragraph_id, letter)
);

create index if not exists paragraphs_chapter_id_idx on public.paragraphs (chapter_id);
create index if not exists theory_blocks_paragraph_id_idx on public.theory_blocks (paragraph_id);

alter table public.topics_new
  add column if not exists theory_block_id uuid references public.theory_blocks (id);

create index if not exists topics_new_theory_block_id_idx on public.topics_new (theory_block_id);

alter table public.paragraphs enable row level security;
alter table public.theory_blocks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'paragraphs' and policyname = 'read_paragraphs'
  ) then
    create policy read_paragraphs on public.paragraphs for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'paragraphs' and policyname = 'write_paragraphs'
  ) then
    create policy write_paragraphs on public.paragraphs
      using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'paragraphs' and policyname = 'analist_lezen'
  ) then
    create policy analist_lezen on public.paragraphs for select to analist using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'theory_blocks' and policyname = 'read_theory_blocks'
  ) then
    create policy read_theory_blocks on public.theory_blocks for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'theory_blocks' and policyname = 'write_theory_blocks'
  ) then
    create policy write_theory_blocks on public.theory_blocks
      using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'theory_blocks' and policyname = 'analist_lezen'
  ) then
    create policy analist_lezen on public.theory_blocks for select to analist using (true);
  end if;
end $$;

grant all on table public.paragraphs to anon, authenticated, service_role;
grant select on table public.paragraphs to analist;
grant all on table public.theory_blocks to anon, authenticated, service_role;
grant select on table public.theory_blocks to analist;

insert into public.paragraphs (chapter_id, site, slug, label, title, order_index)
select c.id, 'integralen', v.slug, v.label, v.title, v.order_index::smallint
from public.chapters c
cross join (
  values
    ('k0'::text, 'K.0'::text, 'Voorkennis'::text, 1),
    ('k1', 'K.1', 'De substitutiemethode', 2),
    ('k2', 'K.2', 'Partieel integreren', 3),
    ('k3', 'K.3', 'Cyclometrische functies', 4)
) as v(slug, label, title, order_index)
where c.slug = 'k' and c.site = 'integralen'
on conflict (slug) do update
  set title = excluded.title,
      label = excluded.label,
      order_index = excluded.order_index,
      chapter_id = excluded.chapter_id;

insert into public.theory_blocks (paragraph_id, site, slug, letter, title, order_index)
select p.id, 'integralen', v.slug, v.letter, v.title, v.order_index::smallint
from public.paragraphs p
join (
  values
    ('k0'::text, 'k0b'::text, 'B'::text, 'Regels voor het primitiveren'::text, 1),
    ('k1', 'k1a', 'A', 'Primitiveren en de kettingregel', 1),
    ('k1', 'k1b', 'B', 'Toepassingen van de substitutiemethode', 2),
    ('k2', 'k2a', 'A', 'Primitiveren en de productregel', 1),
    ('k2', 'k2b', 'B', 'Herhaald partieel integreren', 2),
    ('k3', 'k3a', 'A', 'De functie arctan', 1),
    ('k3', 'k3b', 'B', 'De arctangensfunctie en primitiveren', 2),
    ('k3', 'k3c', 'C', 'De functie arcsin', 3)
) as v(paragraph_slug, slug, letter, title, order_index)
  on v.paragraph_slug = p.slug
on conflict (slug) do update
  set title = excluded.title,
      letter = excluded.letter,
      order_index = excluded.order_index,
      paragraph_id = excluded.paragraph_id;

update public.topics_new as t
set theory_block_id = b.id
from (
  values
    ('k0b_standaardprimitieven'::text, 'k0b'::text),
    ('k0b_lineaire_kern', 'k0b'),
    ('k0b_bepaalde_integralen', 'k0b'),
    ('k1a_kern_herkennen', 'k1a'),
    ('k1a_primitiveren_ketting', 'k1a'),
    ('k1a_toepassingen', 'k1a'),
    ('k1b_gonio', 'k1b'),
    ('k1b_bepaald', 'k1b'),
    ('k1b_toepassingen', 'k1b'),
    ('k2a_partieel', 'k2a'),
    ('k2a_bepaald', 'k2a'),
    ('k2a_toepassingen', 'k2a'),
    ('k2b_herhaald', 'k2b'),
    ('k2b_bepaald', 'k2b'),
    ('k2b_toepassingen', 'k2b'),
    ('k2b_logaritme', 'k2b'),
    ('k3a_arctangens', 'k3a'),
    ('k3a_primitiveren', 'k3a'),
    ('k3a_bepaald', 'k3a'),
    ('k3b_primitiveren', 'k3b'),
    ('k3b_bepaald', 'k3b'),
    ('k3b_toepassing', 'k3b'),
    ('k3c_arcsinus', 'k3c'),
    ('k3c_primitiveren', 'k3c'),
    ('k3c_bepaald', 'k3c'),
    ('k3c_toepassing', 'k3c')
) as v(topic_slug, block_slug)
join public.theory_blocks b on b.slug = v.block_slug
where t.slug = v.topic_slug
  and t.site = 'integralen'
  and t.theory_block_id is distinct from b.id;

do $$
declare
  ontbreekt int;
begin
  select count(*) into ontbreekt
  from (
    values
      ('k0b_standaardprimitieven'::text, 'k0b'::text),
      ('k0b_lineaire_kern', 'k0b'),
      ('k0b_bepaalde_integralen', 'k0b'),
      ('k1a_kern_herkennen', 'k1a'),
      ('k1a_primitiveren_ketting', 'k1a'),
      ('k1a_toepassingen', 'k1a'),
      ('k1b_gonio', 'k1b'),
      ('k1b_bepaald', 'k1b'),
      ('k1b_toepassingen', 'k1b'),
      ('k2a_partieel', 'k2a'),
      ('k2a_bepaald', 'k2a'),
      ('k2a_toepassingen', 'k2a'),
      ('k2b_herhaald', 'k2b'),
      ('k2b_bepaald', 'k2b'),
      ('k2b_toepassingen', 'k2b'),
      ('k2b_logaritme', 'k2b'),
      ('k3a_arctangens', 'k3a'),
      ('k3a_primitiveren', 'k3a'),
      ('k3a_bepaald', 'k3a'),
      ('k3b_primitiveren', 'k3b'),
      ('k3b_bepaald', 'k3b'),
      ('k3b_toepassing', 'k3b'),
      ('k3c_arcsinus', 'k3c'),
      ('k3c_primitiveren', 'k3c'),
      ('k3c_bepaald', 'k3c'),
      ('k3c_toepassing', 'k3c')
  ) as v(topic_slug, block_slug)
  left join public.topics_new t
    on t.slug = v.topic_slug and t.site = 'integralen'
  left join public.theory_blocks b on b.slug = v.block_slug
  where t.id is null
     or b.id is null
     or t.theory_block_id is distinct from b.id;

  if ontbreekt <> 0 then
    raise exception 'Niet alle 26 onderwerpen hangen aan het juiste theorieblok (% klopt niet)', ontbreekt;
  end if;
end $$;
