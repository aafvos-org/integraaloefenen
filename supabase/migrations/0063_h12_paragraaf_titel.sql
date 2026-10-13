-- =============================================================================
-- Nummer 0063: 0062 hoort al bij de examentraining over de waarde van p.
--
-- Paragraaf 12.2 heet "Verdubbelingsformules en primitiveren".
--
-- Het boek noemt ook symmetrie, maar dat blok staat niet op deze site.
-- Alleen theorieblok B staat er. De paragraaftitel noemt daarom geen
-- symmetrie meer.
--
-- Twee keer draaien zet dezelfde titel opnieuw. Er komt niets bij en er
-- gaat niets weg.
-- =============================================================================

BEGIN;

UPDATE public.paragraphs
SET title = 'Verdubbelingsformules en primitiveren'
WHERE slug = 'h12-2'
  AND site = 'integralen'
  AND title IS DISTINCT FROM 'Verdubbelingsformules en primitiveren';

DO $do$
DECLARE
  titel text;
BEGIN
  SELECT p.title INTO titel
  FROM public.paragraphs p
  WHERE p.slug = 'h12-2' AND p.site = 'integralen';

  IF titel IS DISTINCT FROM 'Verdubbelingsformules en primitiveren' THEN
    RAISE EXCEPTION 'Paragraaf 12.2 hoort "Verdubbelingsformules en primitiveren" te heten, gevonden %', titel;
  END IF;
END
$do$;

COMMIT;
