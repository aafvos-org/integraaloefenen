-- =============================================================================
-- K.1a welke_a: alternatief "a = ... en F" toevoegen aan 6 vragen (INT-691,
-- vervolg op INT-689).
--
-- Elke vraag in k1a_welke_a vraagt om zowel a als de primitieve. Twee van de
-- acht rijen hebben daarvoor al een alternatief "a = <n> en <primitieve>".
-- De andere zes niet, dus een leerling die netjes "a = ... en F" intypt werd
-- afgekeurd. Dit voegt alleen het ontbrekende alternatief toe; er gaat niets
-- weg en de bestaande antwoorden blijven staan.
--
-- Twee keer draaien voegt niets dubbel toe (NOT (... @> ARRAY[...])).
-- =============================================================================

BEGIN;

UPDATE public.questions_new AS q
SET answer_alternatives = q.answer_alternatives || ARRAY[v.alternatief]
FROM (VALUES
  ('9332606d-7db8-4dda-9438-c233525a95f8'::uuid, 'a = 1 en sin(3x^2 + x) + c'),
  ('96954493-6f0a-4223-afd3-aab34024ed5a'::uuid, 'a = 6 en 2/5 (x^2 + 3x)^5 + c'),
  ('5bc35629-69ae-4b75-9e3f-3da1a96c0124'::uuid, 'a = 3 en 3sqrt(x^4 + 2x) + c'),
  ('02f76bcd-1d2b-4ee9-b311-79900e7cecf1'::uuid, 'a = 1 en -1/(x^3 + x) + c'),
  ('c7534f70-a3ed-4021-a6fd-deebf62e651f'::uuid, 'a = 2 en 2/3 (x^2 + 6x + 10)sqrt(x^2 + 6x + 10) + c'),
  ('0622f905-31ed-4a41-9ed0-c7f6a70cebe5'::uuid, 'a = 2 en ln|x^2 + 5x + 1| + c')
) AS v(id, alternatief)
WHERE q.id = v.id
  AND q.site = 'integralen'
  AND NOT (q.answer_alternatives @> ARRAY[v.alternatief]);

-- Nakijken: alle 6 rijen hebben nu precies hun nieuwe alternatief erbij.
DO $do$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN (VALUES
    ('9332606d-7db8-4dda-9438-c233525a95f8'::uuid, 'a = 1 en sin(3x^2 + x) + c'),
    ('96954493-6f0a-4223-afd3-aab34024ed5a'::uuid, 'a = 6 en 2/5 (x^2 + 3x)^5 + c'),
    ('5bc35629-69ae-4b75-9e3f-3da1a96c0124'::uuid, 'a = 3 en 3sqrt(x^4 + 2x) + c'),
    ('02f76bcd-1d2b-4ee9-b311-79900e7cecf1'::uuid, 'a = 1 en -1/(x^3 + x) + c'),
    ('c7534f70-a3ed-4021-a6fd-deebf62e651f'::uuid, 'a = 2 en 2/3 (x^2 + 6x + 10)sqrt(x^2 + 6x + 10) + c'),
    ('0622f905-31ed-4a41-9ed0-c7f6a70cebe5'::uuid, 'a = 2 en ln|x^2 + 5x + 1| + c')
  ) AS v(id, alternatief) ON q.id = v.id
  WHERE q.answer_alternatives @> ARRAY[v.alternatief];
  IF n <> 6 THEN
    RAISE EXCEPTION 'Alle 6 vragen in k1a_welke_a horen hun nieuwe alternatief "a = ... en F" te hebben, gevonden %', n;
  END IF;
END
$do$;

COMMIT;
