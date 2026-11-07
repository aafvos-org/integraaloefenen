-- =============================================================================
-- Haal een kapot goedgekeurd alternatief weg bij primitiveer f(x) = sqrt(x)(x-3)
-- (INT-783, vervolg op INT-779).
--
-- In answer_alternatives stond '(2)/(5)x^(2)sqrt(x)-2x sqrt(x))': één '(' te
-- weinig t.o.v. het aantal ')', en de '+ c' ontbreekt. answersMatch vergelijkt
-- eerst op exacte string, dus deze kapotte schrijfwijze werd altijd goedgekeurd
-- als een leerling hem precies intypte. De vraag en de andere twee
-- alternatieven blijven staan.
--
-- Herkenning is het modelantwoord, niet het vraag-id: dat id verschilt per
-- database. Op de live site hoort dit bij vraag a0d3ad55-c455-4e71-a491-e0eafcfd5a10.
--
-- Twee keer draaien haalt niets extra weg: de tekst staat er dan al niet meer.
-- =============================================================================

BEGIN;

UPDATE public.questions_new AS q
SET answer_alternatives = array_remove(q.answer_alternatives, '(2)/(5)x^(2)sqrt(x)-2x sqrt(x))')
WHERE q.site = 'integralen'
  AND q.answer = '2/5 x^2 sqrt(x) - 2x sqrt(x) + c'
  AND '(2)/(5)x^(2)sqrt(x)-2x sqrt(x))' = ANY (q.answer_alternatives);

DO $do$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new q
  WHERE q.site = 'integralen'
    AND q.answer_alternatives @> ARRAY['(2)/(5)x^(2)sqrt(x)-2x sqrt(x))']::text[];
  IF n <> 0 THEN
    RAISE EXCEPTION 'Het kapotte alternatief hoort weg te zijn, nog gevonden bij % vragen', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  WHERE q.site = 'integralen'
    AND q.answer = '2/5 x^2 sqrt(x) - 2x sqrt(x) + c';
  IF n <> 1 THEN
    RAISE EXCEPTION 'De vraag hoort te blijven, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  WHERE q.site = 'integralen'
    AND q.answer = '2/5 x^2 sqrt(x) - 2x sqrt(x) + c'
    AND q.answer_alternatives @> ARRAY['2/5x^(5/2) - 2x^(3/2) + c', '0,4x^2sqrt(x) - 2xsqrt(x) + c']::text[];
  IF n <> 1 THEN
    RAISE EXCEPTION 'De twee goede alternatieven horen te blijven, gevonden %', n;
  END IF;
END
$do$;

COMMIT;
