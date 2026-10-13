-- =============================================================================
-- Haal zeven foute goedgekeurde antwoorden uit de vragen (INT-188).
--
-- Deze schrijfwijzen stonden in answer_alternatives, dus een leerling die ze
-- precies intypt kreeg ze altijd goed. Ze zijn niet overal gelijk aan het
-- modelantwoord. De vraag en de andere alternatieven blijven staan.
-- known_wrong_answers_new blijft onaangeroerd.
--
-- Herkenning is het modelantwoord, niet het vraag-id: dat id verschilt per
-- database. Op de live site horen ze bij:
--   sin(3x)/3                 1777c738-dae2-4c16-9938-ba972f6dfeba
--   4ln|3x + 2|/3 + c         de8f3551-2c62-4097-901a-c0e42f3c686e
--   -3ln|5 - 2x| + c          f2ad0e2a-5578-4c0f-82ca-2aed6f1af1d7
--   ln|x^2 + 5x + 1| + c      0622f905-31ed-4a41-9ed0-c7f6a70cebe5
--   -ln|cos(4x)|/4 + c        69428a2c-935a-4b80-8306-c4ca477ebf44
--   -2ln|cos(1/2 x)| + c      341284c5-578d-43d5-b37b-b06b42fce92c
--   x ln(x^2/3) - 2x + c      0eaa62ce-bc61-44ea-9191-e503dba27cc6
--
-- Twee keer draaien haalt niets extra weg: de tekst staat er dan al niet meer.
-- =============================================================================

BEGIN;

UPDATE public.questions_new AS q
SET answer_alternatives = array_remove(q.answer_alternatives, v.weg)
FROM (VALUES
  ('sin(3x)/3', '0,333sin(3x)'),
  ('4ln|3x + 2|/3 + c', '4/3 ln(3x + 2) + c'),
  ('-3ln|5 - 2x| + c', '-3ln(5 - 2x) + c'),
  ('ln|x^2 + 5x + 1| + c', 'ln(x^2 + 5x + 1) + c'),
  ('-ln|cos(4x)|/4 + c', '-ln(cos(4x))/4 + c'),
  ('-2ln|cos(1/2 x)| + c', '-2ln(cos(x/2)) + c'),
  ('x ln(x^2/3) - 2x + c', '2x ln(x) - x ln(3) - 2x + c')
) AS v(antwoord, weg)
WHERE q.site = 'integralen'
  AND q.answer = v.antwoord
  AND v.weg = ANY (q.answer_alternatives);

DO $do$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new q
  WHERE q.site = 'integralen'
    AND q.answer_alternatives && ARRAY[
      '0,333sin(3x)',
      '4/3 ln(3x + 2) + c',
      '-3ln(5 - 2x) + c',
      'ln(x^2 + 5x + 1) + c',
      '-ln(cos(4x))/4 + c',
      '-2ln(cos(x/2)) + c',
      '2x ln(x) - x ln(3) - 2x + c'
    ]::text[];
  IF n <> 0 THEN
    RAISE EXCEPTION 'De zeven foute antwoorden horen weg te zijn, nog gevonden bij % vragen', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  WHERE q.site = 'integralen'
    AND q.answer IN (
      'sin(3x)/3',
      '4ln|3x + 2|/3 + c',
      '-3ln|5 - 2x| + c',
      'ln|x^2 + 5x + 1| + c',
      '-ln|cos(4x)|/4 + c',
      '-2ln|cos(1/2 x)| + c',
      'x ln(x^2/3) - 2x + c'
    );
  IF n <> 7 THEN
    RAISE EXCEPTION 'De zeven vragen horen te blijven, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  WHERE q.site = 'integralen'
    AND (
      (q.answer = 'sin(3x)/3' AND q.answer_alternatives @> ARRAY['1/3sin(3x)'])
      OR (q.answer = '4ln|3x + 2|/3 + c' AND q.answer_alternatives @> ARRAY['1 1/3 ln|3x+2| + c'])
      OR (q.answer = '-ln|cos(4x)|/4 + c' AND q.answer_alternatives @> ARRAY['-1/4 ln|cos(4x)| + c', '-0,25ln|cos(4x)| + c'])
      OR (q.answer = '-2ln|cos(1/2 x)| + c' AND q.answer_alternatives @> ARRAY['-2ln|cos(0,5x)| + c', '-2ln|cos(x/2)| + c'])
    );
  IF n <> 4 THEN
    RAISE EXCEPTION 'De goede alternatieven horen te blijven, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  WHERE q.site = 'integralen'
    AND q.answer IN ('-3ln|5 - 2x| + c', 'ln|x^2 + 5x + 1| + c', 'x ln(x^2/3) - 2x + c')
    AND cardinality(q.answer_alternatives) = 0;
  IF n <> 3 THEN
    RAISE EXCEPTION 'Drie vragen horen geen alternatief meer te hebben, gevonden %', n;
  END IF;
END
$do$;

COMMIT;
