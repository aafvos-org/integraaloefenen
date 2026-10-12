-- =============================================================================
-- De tabel stoomcursus_progress weg.
--
-- Die tabel hoorde bij de stoomcursus van de oude afgeleiden-site. De
-- integralen-site leest en schrijft hem nergens: geen code, geen andere
-- migratie na de basisdump. [INT-12] liet hem met opzet staan.
--
-- Er staat één rij in. Die gaat mee weg. Een reservekopie van de tabel
-- wordt gemaakt vóór dit bestand op de echte database draait.
--
-- Twee keer draaien doet niets: IF EXISTS.
-- Geen CASCADE: wijst er nog iets naar deze tabel, dan stopt dit bestand
-- en rolt de transactie terug.
-- =============================================================================

drop table if exists public.stoomcursus_progress;
