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
-- Herkenning is cluster, volgorde en de huidige antwoordtekst (zoals in
-- 0063_k0_k3_nakijk_antwoorden.sql): het vraag-id verschilt per database.
-- Twee keer draaien voegt niets dubbel toe (NOT (... @> ARRAY[...])).
-- =============================================================================

BEGIN;

UPDATE public.questions_new AS q
SET answer_alternatives = q.answer_alternatives || ARRAY[v.alternatief]
FROM (VALUES
  (1, 'sin(3x^2 + x) + c', 'a = 1 en sin(3x^2 + x) + c'),
  (2, '2/5 (x^2 + 3x)^5 + c', 'a = 6 en 2/5 (x^2 + 3x)^5 + c'),
  (3, '3sqrt(x^4 + 2x) + c', 'a = 3 en 3sqrt(x^4 + 2x) + c'),
  (4, 'ln|x^2 + 5x + 1| + c', 'a = 2 en ln|x^2 + 5x + 1| + c'),
  (5, '-1/(x^3 + x) + c', 'a = 1 en -1/(x^3 + x) + c'),
  (6, '2/3 (x^2 + 6x + 10)sqrt(x^2 + 6x + 10) + c', 'a = 2 en 2/3 (x^2 + 6x + 10)sqrt(x^2 + 6x + 10) + c')
) AS v(volgorde, antwoord, alternatief),
public.topic_clusters_new AS cl
WHERE q.cluster_id = cl.id
  AND cl.slug = 'k1a_welke_a'
  AND q.site = 'integralen'
  AND q.order_index = v.volgorde
  AND q.answer = v.antwoord
  AND NOT (q.answer_alternatives @> ARRAY[v.alternatief]);

-- Nakijken: alle 6 rijen hebben nu precies hun nieuwe alternatief erbij.
DO $do$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  JOIN (VALUES
    (1, 'a = 1 en sin(3x^2 + x) + c'),
    (2, 'a = 6 en 2/5 (x^2 + 3x)^5 + c'),
    (3, 'a = 3 en 3sqrt(x^4 + 2x) + c'),
    (4, 'a = 2 en ln|x^2 + 5x + 1| + c'),
    (5, 'a = 1 en -1/(x^3 + x) + c'),
    (6, 'a = 2 en 2/3 (x^2 + 6x + 10)sqrt(x^2 + 6x + 10) + c')
  ) AS v(volgorde, alternatief)
    ON q.order_index = v.volgorde
   AND q.answer_alternatives @> ARRAY[v.alternatief]
  WHERE cl.slug = 'k1a_welke_a'
    AND q.site = 'integralen';
  IF n <> 6 THEN
    RAISE EXCEPTION 'Alle 6 vragen in k1a_welke_a horen hun nieuwe alternatief "a = ... en F" te hebben, gevonden %', n;
  END IF;
END
$do$;

COMMIT;
