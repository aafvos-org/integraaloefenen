-- =============================================================================
-- Haal de 'a/b'-alternatieven weg bij de verhoudingsvragen (topic
-- h15b_verhouding) (INT-816, vervolg op INT-790/INT-791).
--
-- answersMatch rekende '2/1' numeriek uit als de functie "2", waardoor een
-- leerling die alleen '2' of '0,5' intypte (in plaats van '2 : 1' / '1 : 2')
-- toch goedgerekend werd. Een verhouding met een dubbele punt is geen
-- functie, dus de 'a/b'-schrijfwijze mag niet als alternatief blijven staan
-- (de code-kant van deze fix staat in src/lib/practice/engine.ts). De
-- 'a:b'-schrijfwijze (zonder spaties) blijft gewoon een goed alternatief.
--
-- Herkenning is het antwoord ('N : M') en de topic, niet de vraag-ids: die
-- verschillen per database.
--
-- Twee keer draaien haalt niets extra weg: de alternatieven staan er dan al
-- niet meer.
-- =============================================================================

BEGIN;

UPDATE public.questions_new AS q
SET answer_alternatives = COALESCE(
  (
    SELECT array_agg(alt ORDER BY ord)
    FROM unnest(q.answer_alternatives) WITH ORDINALITY AS u(alt, ord)
    WHERE alt !~ '^\d+/\d+$'
  ),
  '{}'::text[]
)
WHERE q.site = 'integralen'
  AND q.topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h15b_verhouding')
  AND q.answer ~ '^\d+ : \d+$'
  AND EXISTS (
    SELECT 1 FROM unnest(q.answer_alternatives) AS alt WHERE alt ~ '^\d+/\d+$'
  );

DO $do$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new q
  WHERE q.site = 'integralen'
    AND q.topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h15b_verhouding')
    AND q.answer ~ '^\d+ : \d+$'
    AND EXISTS (
      SELECT 1 FROM unnest(q.answer_alternatives) AS alt WHERE alt ~ '^\d+/\d+$'
    );
  IF n <> 0 THEN
    RAISE EXCEPTION 'Er hoort geen ''a/b''-alternatief meer te zijn, nog gevonden bij % vragen', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  WHERE q.site = 'integralen'
    AND q.topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h15b_verhouding');
  IF n < 1 THEN
    RAISE EXCEPTION 'De verhoudingsvragen horen te blijven bestaan, gevonden %', n;
  END IF;
END
$do$;

COMMIT;
