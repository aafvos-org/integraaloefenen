-- =============================================================================
-- De oude tabellen weg. De site leest en schrijft alleen de `*_new`-tabellen.
--
-- De tabellen zonder `_new` zijn het oude afgeleiden-schema (onderwerpen als
-- somregel en kettingregel). De integralen-site gebruikt ze niet. De koppeling
-- `topic_clusters_new.source_cluster_id` wees naar die oude clusters en is leeg.
--
-- Twee keer draaien doet niets: alles met IF EXISTS.
-- Geen CASCADE: blijft er ergens een verwijzing over, dan stopt dit bestand
-- en rolt de transactie terug.
-- =============================================================================

alter table public.topic_clusters_new
  drop constraint if exists topic_clusters_new_source_cluster_id_fkey;

drop index if exists public.topic_clusters_new_source_cluster_idx;

alter table public.topic_clusters_new
  drop column if exists source_cluster_id;

-- Eerst de tabellen die naar een andere oude tabel wijzen.
drop table if exists public.step_mistakes;
drop table if exists public.session_answers;
drop table if exists public.question_flags;
drop table if exists public.known_wrong_answers;
drop table if exists public.question_steps;
drop table if exists public.user_progress;
drop table if exists public.user_sessions;
drop table if exists public.questions;
drop table if exists public.root_causes;
drop table if exists public.topic_clusters;
drop table if exists public.topics;
