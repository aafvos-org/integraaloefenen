-- =============================================================================
-- Haal het te ruime alternatief '2' weg bij de verhoudingsvraag O(V):O(W)
-- (grafiek sqrt(x) en lijn y=3 op [0,9]) (INT-791, vervolg op INT-790).
--
-- In answer_alternatives stond naast '2:1' en '2/1' ook het losse getal '2'.
-- answersMatch vergeleek dat exact, dus een leerling die alleen '2' intypte
-- (bijvoorbeeld een verkeerd afgeronde verhouding, of maar één oppervlakte)
-- werd daardoor ten onrechte goedgerekend. Het gevraagde antwoord is '2 : 1'.
-- De vraag en de twee andere alternatieven blijven staan.
--
-- Herkenning is het modelantwoord, niet het vraag-id: dat id verschilt per
-- database. Op de live site hoort dit bij vraag 95a9150b-072a-4913-a079-5932334f1bf7.
--
-- Twee keer draaien haalt niets extra weg: het alternatief staat er dan al
-- niet meer.
-- =============================================================================

BEGIN;

UPDATE public.questions_new AS q
SET answer_alternatives = array_remove(q.answer_alternatives, '2')
WHERE q.site = 'integralen'
  AND q.answer = '2 : 1'
  AND '2' = ANY (q.answer_alternatives);

DO $do$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new q
  WHERE q.site = 'integralen'
    AND q.answer = '2 : 1'
    AND q.answer_alternatives @> ARRAY['2']::text[];
  IF n <> 0 THEN
    RAISE EXCEPTION 'Het alternatief ''2'' hoort weg te zijn, nog gevonden bij % vragen', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  WHERE q.site = 'integralen'
    AND q.answer = '2 : 1';
  IF n <> 1 THEN
    RAISE EXCEPTION 'De vraag hoort te blijven, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  WHERE q.site = 'integralen'
    AND q.answer = '2 : 1'
    AND q.answer_alternatives @> ARRAY['2:1', '2/1']::text[];
  IF n <> 1 THEN
    RAISE EXCEPTION 'De twee goede alternatieven horen te blijven, gevonden %', n;
  END IF;
END
$do$;

COMMIT;
