-- =============================================================================
-- Migration 0047: de onboarding-velden uit profiles
-- =============================================================================
-- De onboarding vroeg een leerling naar zijn leerjaar en naar hoe hij wilde
-- oefenen. Die leermodi (guided, topic_select, diagnostic, free) hoorden bij
-- het leerpad. Het leerpad is op 13 mei 2026 uitgezet en komt niet terug; de
-- bijbehorende code is in INT-23 verwijderd. Sindsdien vult niemand deze
-- kolommen nog: de laatste leerling die ze invulde deed dat op 7 mei 2026.
--
-- Zolang de kolommen blijven staan suggereren ze een stap in de aanmelding die
-- niet bestaat, en lijkt het alsof leerlingen daarop vastlopen.
--
-- display_name en tour_seen_at komen uit dezelfde tabel maar worden wél
-- gebruikt (dashboard en rondleiding) en blijven dus staan.
--
-- Let op: dit gooit de ingevulde waarden van vijf leerlingen weg. Er is geen
-- weg terug zonder back-up.
-- =============================================================================

alter table public.profiles
  drop constraint if exists profiles_grade_check;

alter table public.profiles
  drop constraint if exists profiles_learning_mode_check;

drop index if exists public.profiles_onboarded_at_idx;

alter table public.profiles
  drop column if exists grade,
  drop column if exists learning_mode,
  drop column if exists onboarded_at;
