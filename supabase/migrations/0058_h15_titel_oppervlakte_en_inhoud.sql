-- =============================================================================
-- H15 heet op de site "Oppervlakte en inhoud".
--
-- Alleen paragraaf 15.4 staat erop. De boektitel "Afgeleiden en primitieven"
-- hoort daar niet. De paragraaf en de drie theorieblokken heten al goed
-- (15.4 Integralen bij oppervlakte en inhoud, en A, B en C). Die blijven staan.
--
-- Twee keer draaien zet dezelfde titel opnieuw. Er komt niets bij en er
-- gaat niets weg.
-- =============================================================================

BEGIN;

UPDATE public.chapters
SET title = 'H15 — Oppervlakte en inhoud'
WHERE slug = 'h15'
  AND site = 'integralen'
  AND title IS DISTINCT FROM 'H15 — Oppervlakte en inhoud';

DO $do$
DECLARE
  titel text;
BEGIN
  SELECT c.title INTO titel
  FROM public.chapters c
  WHERE c.slug = 'h15' AND c.site = 'integralen';

  IF titel IS DISTINCT FROM 'H15 — Oppervlakte en inhoud' THEN
    RAISE EXCEPTION 'Hoofdstuk H15 hoort "H15 — Oppervlakte en inhoud" te heten, gevonden %', titel;
  END IF;
END
$do$;

COMMIT;
