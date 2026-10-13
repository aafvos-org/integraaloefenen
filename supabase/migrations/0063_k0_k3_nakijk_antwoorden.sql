-- =============================================================================
-- Herstel antwoorden in K.0 B t/m K.3 C die de nakijkcode verkeerd leest
-- (nakijkronde INT-166, taak INT-175).
--
-- De uitkomsten kloppen. Alleen de tekst waarmee wordt nagekeken verandert,
-- zodat een goed antwoord al goed is vóór de AI-controle. Bestaande rijen
-- worden bijgewerkt. Er gaat niets weg: geen DELETE.
--
-- Herkenning is cluster, volgorde en de huidige antwoordtekst. Het vraag-id
-- verschilt per database. Op de live site horen ze bij:
--   k3c_oppervlakte, volgorde 3     177babbf-7c83-4eb7-88d7-4806069fd4ad
--   k0b_exponenten, volgorde 1      98c599dc-77b2-4616-801a-c52a17bc1863
--   k2b_ln, volgorde 1              c1a108db-7564-46c1-81a5-471194ff3519
--   k2b_ln, volgorde 2              22d13539-db68-47b3-a28d-80320c37f5da
--   k2b_ln, volgorde 3              363d7516-a80e-4bd6-907e-5cf58a336752
--   k2b_ln, volgorde 4              19dfe0d6-a90c-4c0b-a6bc-afd20f155726
--   k2b_ln, volgorde 5              c0a8e6e8-803a-430f-a70c-a9852136966f
--   k2b_ln, volgorde 6              b5a46cfc-72a0-4b7d-89ec-837bed7f4ac3
--   k3a_standaard, volgorde 6       826a559f-10e4-4edc-8698-ccaff330148f
--   k3c_kern, volgorde 3            b7c37fd9-60a1-4a68-8de8-2f8fc7be47d7
--
-- Twee keer draaien zet dezelfde teksten opnieuw en voegt geen tweede
-- exemplaar van een alternatief toe.
-- =============================================================================

BEGIN;

-- 1. p = (5/2)√2. Het gemengde getal "2 1/2" wordt zonder spatie gelezen
-- als 21/2, dus als 10,5√2. Daardoor valt een goede breuk fout uit bij
-- het narekenen.
UPDATE public.questions_new AS q
SET
  answer = '5/2 sqrt(2)',
  latex_answer = $a$p = \tfrac{5}{2}\sqrt{2}$a$
FROM public.topic_clusters_new AS cl
WHERE q.cluster_id = cl.id
  AND cl.slug = 'k3c_oppervlakte'
  AND q.site = 'integralen'
  AND q.order_index = 3
  AND q.answer IN ('2 1/2 sqrt(2)', '5/2 sqrt(2)');

UPDATE public.question_steps_new AS s
SET step_description = replace(s.step_description, '2\tfrac{1}{2}\sqrt{2}', '\tfrac{5}{2}\sqrt{2}')
FROM public.questions_new AS q
JOIN public.topic_clusters_new AS cl ON cl.id = q.cluster_id
WHERE s.question_id = q.id
  AND cl.slug = 'k3c_oppervlakte'
  AND q.site = 'integralen'
  AND q.order_index = 3
  AND position('2\tfrac{1}{2}\sqrt{2}' in s.step_description) > 0;

-- 2. 5·2^x / ln(2). Zonder sterretje tussen 5 en 2^x leest de nakijkcode
-- 52^x. De vorm met haakjes om de breuk wordt wél doorgerekend, ook als
-- de leerling het sterretje weg laat.
UPDATE public.questions_new AS q
SET answer_alternatives = q.answer_alternatives || ARRAY['(5/ln(2))*2^x + c']
FROM public.topic_clusters_new AS cl
WHERE q.cluster_id = cl.id
  AND cl.slug = 'k0b_exponenten'
  AND q.site = 'integralen'
  AND q.order_index = 1
  AND q.answer = '5 * 2^x / ln(2) + c'
  AND NOT (q.answer_alternatives @> ARRAY['(5/ln(2))*2^x + c']);

-- 3. Acht primitieven waarbij ln^2, arctan^2 en arcsin^3 niet worden
-- uitgerekend. Het alternatief is dezelfde functie in een vorm die wel
-- wordt doorgerekend; de + c mag daarbij ook weg. Het gewone antwoord
-- blijft staan, ook de schrijfwijze met arctan en arcsin.
UPDATE public.questions_new AS q
SET answer_alternatives = q.answer_alternatives || ARRAY[v.alternatief]
FROM (VALUES
  ('k2b_ln', 1, 'x ln^2(x) - 2x ln(x) + 2x + c', 'x*(ln(x))^2 - 2*x*ln(x) + 2*x + c'),
  ('k2b_ln', 2, '1/2 x^2 ln^2(x) - 1/2 x^2 ln(x) + 1/4 x^2 + c', '(1/2)*x^2*(ln(x))^2 - (1/2)*x^2*ln(x) + (1/4)*x^2 + c'),
  ('k2b_ln', 3, '1/3 x^3 ln^2(x) - 2/9 x^3 ln(x) + 2/27 x^3 + c', '(1/3)*x^3*(ln(x))^2 - (2/9)*x^3*ln(x) + (2/27)*x^3 + c'),
  ('k2b_ln', 4, '-(ln^2(x) + 2ln(x) + 2)/x + c', '-((ln(x))^2 + 2*ln(x) + 2)/x + c'),
  ('k2b_ln', 5, 'x ln^2(2x) - 2x ln(2x) + 2x + c', 'x*(ln(2*x))^2 - 2*x*ln(2*x) + 2*x + c'),
  ('k2b_ln', 6, 'x ln^3(x) - 3x ln^2(x) + 6x ln(x) - 6x + c', 'x*(ln(x))^3 - 3*x*(ln(x))^2 + 6*x*ln(x) - 6*x + c'),
  ('k3a_standaard', 6, '1/2 arctan^2(x) + c', '1/2*(atan(x))^2 + c'),
  ('k3c_kern', 3, '1/3 arcsin^3(x) + c', '1/3*(asin(x))^3 + c')
) AS v(cluster, volgorde, antwoord, alternatief)
JOIN public.topic_clusters_new AS cl ON cl.slug = v.cluster
WHERE q.cluster_id = cl.id
  AND q.site = 'integralen'
  AND q.order_index = v.volgorde
  AND q.answer = v.antwoord
  AND NOT (q.answer_alternatives @> ARRAY[v.alternatief]);

-- 4. Onbepaalde integralen met arctan of arcsin. Die namen worden niet
-- uitgerekend, dus een antwoord zonder + c valt fout. Zet hetzelfde
-- antwoord zonder " + c" erbij. Het gewone antwoord met + c blijft.
UPDATE public.questions_new AS q
SET answer_alternatives = q.answer_alternatives || ARRAY[left(q.answer, length(q.answer) - 4)]
FROM public.topic_clusters_new AS cl
JOIN public.topics_new AS t ON t.id = cl.topic_id
WHERE q.cluster_id = cl.id
  AND q.site = 'integralen'
  AND t.site = 'integralen'
  AND t.slug ~ '^(k0|k1|k2|k3)'
  AND right(q.answer, 4) = ' + c'
  AND (position('arctan' in q.answer) > 0 OR position('arcsin' in q.answer) > 0)
  AND NOT (q.answer_alternatives @> ARRAY[left(q.answer, length(q.answer) - 4)]);

-- 5. Nakijken
DO $do$
DECLARE
  n int;
  tekst text;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'k3c_oppervlakte'
    AND q.order_index = 3
    AND q.site = 'integralen'
    AND q.answer = '5/2 sqrt(2)'
    AND q.latex_answer = $c$p = \tfrac{5}{2}\sqrt{2}$c$;
  IF n <> 1 THEN
    RAISE EXCEPTION 'De oppervlaktevraag hoort antwoord 5/2 sqrt(2) te hebben, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'k3c_oppervlakte'
    AND q.order_index = 3
    AND position($c$p = \tfrac{5}{2}\sqrt{2}$c$ in s.step_description) > 0
    AND position('2\tfrac{1}{2}\sqrt{2}' in s.step_description) = 0;
  IF n <> 1 THEN
    RAISE EXCEPTION 'De laatste stap hoort p = 5/2 sqrt(2) te zeggen, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'k0b_exponenten'
    AND q.order_index = 1
    AND q.answer = '5 * 2^x / ln(2) + c'
    AND q.answer_alternatives @> ARRAY['(5/ln(2))*2^x + c'];
  IF n <> 1 THEN
    RAISE EXCEPTION 'De exponentvraag hoort het alternatief (5/ln(2))*2^x + c te hebben, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  JOIN (VALUES
    ('k2b_ln', 1, 'x*(ln(x))^2 - 2*x*ln(x) + 2*x + c'),
    ('k2b_ln', 2, '(1/2)*x^2*(ln(x))^2 - (1/2)*x^2*ln(x) + (1/4)*x^2 + c'),
    ('k2b_ln', 3, '(1/3)*x^3*(ln(x))^2 - (2/9)*x^3*ln(x) + (2/27)*x^3 + c'),
    ('k2b_ln', 4, '-((ln(x))^2 + 2*ln(x) + 2)/x + c'),
    ('k2b_ln', 5, 'x*(ln(2*x))^2 - 2*x*ln(2*x) + 2*x + c'),
    ('k2b_ln', 6, 'x*(ln(x))^3 - 3*x*(ln(x))^2 + 6*x*ln(x) - 6*x + c'),
    ('k3a_standaard', 6, '1/2*(atan(x))^2 + c'),
    ('k3c_kern', 3, '1/3*(asin(x))^3 + c')
  ) AS v(cluster, volgorde, alternatief)
    ON cl.slug = v.cluster
   AND q.order_index = v.volgorde
   AND q.answer_alternatives @> ARRAY[v.alternatief]
  WHERE q.site = 'integralen';
  IF n <> 8 THEN
    RAISE EXCEPTION 'Acht primitieven horen hun nieuwe alternatief te hebben, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  JOIN public.topics_new t ON t.id = cl.topic_id
  WHERE q.site = 'integralen'
    AND t.site = 'integralen'
    AND t.slug ~ '^(k0|k1|k2|k3)'
    AND right(q.answer, 4) = ' + c'
    AND (position('arctan' in q.answer) > 0 OR position('arcsin' in q.answer) > 0);
  IF n <> 35 THEN
    RAISE EXCEPTION 'Er horen 35 onbepaalde integralen met arctan of arcsin te zijn, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  JOIN public.topics_new t ON t.id = cl.topic_id
  WHERE q.site = 'integralen'
    AND t.site = 'integralen'
    AND t.slug ~ '^(k0|k1|k2|k3)'
    AND right(q.answer, 4) = ' + c'
    AND (position('arctan' in q.answer) > 0 OR position('arcsin' in q.answer) > 0)
    AND q.answer_alternatives @> ARRAY[left(q.answer, length(q.answer) - 4)];
  IF n <> 35 THEN
    RAISE EXCEPTION 'Die 35 horen het antwoord zonder + c als alternatief te hebben, gevonden %', n;
  END IF;

  SELECT s.step_description INTO tekst
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'k3c_oppervlakte' AND q.order_index = 3 AND s.step_order = 3;
  IF tekst IS NULL OR position('3{,}54' in tekst) = 0 THEN
    RAISE EXCEPTION 'De benadering 3,54 hoort in de laatste stap te blijven, gevonden %', tekst;
  END IF;
END
$do$;

COMMIT;
