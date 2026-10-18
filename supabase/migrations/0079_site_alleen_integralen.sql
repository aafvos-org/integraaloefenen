-- =============================================================================
-- De kolom `site` mag alleen nog 'integralen' zijn.
--
-- Deze database is sinds de afsplitsing van afgeleideoefenen.nl alleen van
-- integraaloefenen.nl. Toch stond op vier tabellen uit de basisdump nog
-- `default 'afgeleiden'`, en lieten zes CHECK-constraints 'afgeleiden' toe.
--
-- Een insert die `site` vergeet, kwam daardoor stilletjes op 'afgeleiden'
-- terecht. Elke query filtert op `site = 'integralen'`, dus zo'n rij is
-- daarna nergens meer te zien: hij bestaat wel, maar niemand merkt het.
-- Nu weigert de database hem meteen.
--
-- Alle bestaande rijen staan al op 'integralen' (nagekeken op de echte
-- database: chapters 5, paragraphs 8, questions_new 880, theory_blocks 16,
-- topic_clusters_new 110, topics_new 83 — allemaal 'integralen'). Er worden
-- dus geen rijen aangepast.
--
-- Twee keer draaien mag: de default zetten is een no-op en elke constraint
-- gaat er eerst af met `if exists`.
-- =============================================================================

alter table public.chapters alter column site set default 'integralen';
alter table public.chapters drop constraint if exists chapters_site_check;
alter table public.chapters
  add constraint chapters_site_check check (site = 'integralen');

alter table public.questions_new alter column site set default 'integralen';
alter table public.questions_new drop constraint if exists questions_new_site_check;
alter table public.questions_new
  add constraint questions_new_site_check check (site = 'integralen');

alter table public.topic_clusters_new alter column site set default 'integralen';
alter table public.topic_clusters_new drop constraint if exists topic_clusters_new_site_check;
alter table public.topic_clusters_new
  add constraint topic_clusters_new_site_check check (site = 'integralen');

alter table public.topics_new alter column site set default 'integralen';
alter table public.topics_new drop constraint if exists topics_new_site_check;
alter table public.topics_new
  add constraint topics_new_site_check check (site = 'integralen');

alter table public.paragraphs alter column site set default 'integralen';
alter table public.paragraphs drop constraint if exists paragraphs_site_check;
alter table public.paragraphs
  add constraint paragraphs_site_check check (site = 'integralen');

alter table public.theory_blocks alter column site set default 'integralen';
alter table public.theory_blocks drop constraint if exists theory_blocks_site_check;
alter table public.theory_blocks
  add constraint theory_blocks_site_check check (site = 'integralen');
