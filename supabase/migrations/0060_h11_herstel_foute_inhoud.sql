-- =============================================================================
-- Herstel van foute inhoud in hoofdstuk 11 (nakijkronde INT-165).
--
-- De vragen staan al in 0024, de uitwerkingen met "definite integraal" in
-- 0049. Dit bestand wijzigt bestaande rijen en voegt drie ontbrekende
-- uitwerkingen toe. Er gaat niets weg: geen DELETE.
--
-- Herkenning is topic, cluster en volgorde. Het vraag-id verschilt per
-- database. Op de live site horen ze bij:
--   uitdelen, volgorde 1          30a71550-ed04-46ed-8914-650114909557
--   twee integralen, volgorde 1   c0be3ca6-320a-4e3e-8ffe-d04c68e43cf6
--   tussen grafieken, volgorde 4  80cc5c6c-84f3-424c-8dad-8dd951fb8658
--   twee integralen, volgorde 6   48d9e33f-b596-4fe2-9113-7a438fd0e245
--   twee integralen, volgorde 2   2994b2fe-cce1-4607-b37a-d9819bd581a1
--   tussen grafieken, volgorde 5  81d16267-393f-421a-98c1-72d2a1d68851
--   tussen grafieken, volgorde 6  418c5bea-e6ed-40e1-b1ea-b1183ed3b837
--   oppervlakte x-as, volgorde 4  0303961f-6884-4b9e-baa7-41085db424e9
--   stappen met "definite integraal":
--     b6aaa122-6e08-43f8-905a-6779a7f07a73  stap 3
--     e2e3904d-1f3a-4a79-91fe-282ac32e957a  stap 3
--     d759be62-534a-4755-9295-c2520133358a  stap 4
--
-- Twee keer draaien zet dezelfde teksten opnieuw. De nieuwe stappen worden
-- bij een tweede keer overschreven met dezelfde tekst.
-- =============================================================================

BEGIN;

-- 1. Antwoord en opgave
UPDATE public.questions_new AS q
SET
  answer = 'ln(2) + 3/2',
  latex_answer = $a$\dfrac{3}{2}+\ln(2)$a$,
  answer_alternatives = ARRAY(
    SELECT alt
    FROM unnest(q.answer_alternatives) AS alt
    WHERE lower(replace(alt, ' ', '')) NOT IN ('log(2)+3/2', '3/2+log(2)')
  )
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS cl
  ON cl.topic_id = t.id AND cl.slug = 'uitdelen_integraal'
WHERE q.cluster_id = cl.id
  AND q.site = 'integralen'
  AND t.site = 'integralen'
  AND t.slug = 'h11_uitdelen_int'
  AND q.order_index = 1;

-- Het hele vlakdeel van -2 tot 2 wordt door p = 0 in tweeën gedeeld, en
-- dat mag niet. De vergelijking  p^3 - 12p + 8 = 0  heeft drie reële
-- wortels; alleen de wortel in (0, 2) hoort bij het rechterdeel.
-- Afgerond op twee decimalen is dat 0,69.
UPDATE public.questions_new AS q
SET
  latex_body = $a$$f(x) = 4-x^{2}$. Het vlakdeel rechts van de $y$-as, tussen de grafiek en de $x$-as, wordt door de lijn $x = p$ in twee gelijke delen verdeeld, met $0 < p < 2$. Bereken $p$ op twee decimalen.$a$,
  answer = '0,69',
  latex_answer = $a$0{,}69$a$
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS cl
  ON cl.topic_id = t.id AND cl.slug = 'twee_integralen'
WHERE q.cluster_id = cl.id
  AND q.site = 'integralen'
  AND t.site = 'integralen'
  AND t.slug = 'h11_twee_int'
  AND q.order_index = 1;

-- e^x, y = 1 en de y-as sluiten geen eindig vlakdeel in. Het antwoord
-- e - 2 hoort bij de extra grens x = 1.
UPDATE public.questions_new AS q
SET
  latex_body = $a$Gegeven zijn $f(x) = e^{x}$ en $g(x) = 1$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken, de $y$-as en de lijn $x = 1$.$a$
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS cl
  ON cl.topic_id = t.id AND cl.slug = 'opp_tussen_grafieken'
WHERE q.cluster_id = cl.id
  AND q.site = 'integralen'
  AND t.site = 'integralen'
  AND t.slug = 'h11_opp_tussen'
  AND q.order_index = 4
  AND q.answer = 'e - 2';

UPDATE public.questions_new AS q
SET
  answer = '1,84',
  latex_answer = $a$1{,}84$a$
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS cl
  ON cl.topic_id = t.id AND cl.slug = 'twee_integralen'
WHERE q.cluster_id = cl.id
  AND q.site = 'integralen'
  AND t.site = 'integralen'
  AND t.slug = 'h11_twee_int'
  AND q.order_index = 6;

UPDATE public.questions_new AS q
SET
  answer = 'p = 3/2^(1/3)'
FROM public.topics_new AS t
JOIN public.topic_clusters_new AS cl
  ON cl.topic_id = t.id AND cl.slug = 'twee_integralen'
WHERE q.cluster_id = cl.id
  AND q.site = 'integralen'
  AND t.site = 'integralen'
  AND t.slug = 'h11_twee_int'
  AND q.order_index = 2;

-- 2. Tekst in bestaande stappen
UPDATE public.question_steps_new AS s
SET step_description = replace(s.step_description, 'definite integraal', 'bepaalde integraal')
WHERE s.step_description LIKE '%definite integraal%';

UPDATE public.question_steps_new AS s
SET step_description = replace(s.step_description, '|-{-2}|', '|-2|')
FROM public.questions_new AS q
JOIN public.topics_new AS t
  ON t.id = q.topic_id AND t.site = 'integralen' AND t.slug = 'h11_opp_xas'
JOIN public.topic_clusters_new AS cl
  ON cl.id = q.cluster_id AND cl.slug = 'opp_onder_xas'
WHERE s.question_id = q.id
  AND q.site = 'integralen'
  AND q.order_index = 4
  AND s.step_order = 2;

-- 3. Ontbrekende uitwerkingen, in dezelfde trant als de andere vragen
--    van oppervlakte tussen grafieken: twee stappen.
INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, v.step_order, v.step_description
FROM (VALUES
  (
    4, 1,
    $s$Snijpunt van $e^{x}$ en $y = 1$: $x = 0$. Op $[0, 1]$ ligt $e^{x}$ boven $1$.$s$
  ),
  (
    4, 2,
    $s$$O = \int_{0}^{1} (e^{x} - 1)\,dx = \left[e^{x} - x\right]_{0}^{1} = (e - 1) - 1 = e - 2$.$s$
  ),
  (
    5, 1,
    $s$Snijpunten: $x = 0$ en $x = 2$. Op dat stuk ligt $2x + 2$ boven $x^{2} + 2$.$s$
  ),
  (
    5, 2,
    $s$$O = \int_{0}^{2} (2x - x^{2})\,dx = \left[x^{2} - \tfrac{1}{3}x^{3}\right]_{0}^{2} = 4 - \tfrac{8}{3} = \tfrac{4}{3}$.$s$
  ),
  (
    6, 1,
    $s$Snijpunten: $x = 0$ en $x = 1$. Op dat stuk ligt $\sqrt{x}$ boven $x^{2}$.$s$
  ),
  (
    6, 2,
    $s$$O = \int_{0}^{1} \left(x^{1/2} - x^{2}\right)\,dx = \left[\tfrac{2}{3}x^{3/2} - \tfrac{1}{3}x^{3}\right]_{0}^{1} = \tfrac{2}{3} - \tfrac{1}{3} = \tfrac{1}{3}$.$s$
  )
) AS v(order_index, step_order, step_description)
JOIN public.topics_new AS t
  ON t.site = 'integralen' AND t.slug = 'h11_opp_tussen'
JOIN public.topic_clusters_new AS cl
  ON cl.topic_id = t.id AND cl.slug = 'opp_tussen_grafieken'
JOIN public.questions_new AS q
  ON q.cluster_id = cl.id
 AND q.site = 'integralen'
 AND q.order_index = v.order_index
ON CONFLICT (question_id, step_order) DO UPDATE
SET step_description = EXCLUDED.step_description;

-- 4. Nakijken
DO $do$
DECLARE
  n int;
  tekst text;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  JOIN public.topics_new t ON t.id = cl.topic_id
  WHERE t.slug = 'h11_uitdelen_int'
    AND cl.slug = 'uitdelen_integraal'
    AND q.order_index = 1
    AND q.answer = 'ln(2) + 3/2'
    AND q.latex_answer = $c$\dfrac{3}{2}+\ln(2)$c$
    AND NOT EXISTS (
      SELECT 1 FROM unnest(q.answer_alternatives) AS alt
      WHERE lower(replace(alt, ' ', '')) IN ('log(2)+3/2', '3/2+log(2)')
    );
  IF n <> 1 THEN
    RAISE EXCEPTION 'De integraal van (x^2+1)/x hoort ln(2)+3/2 te zijn, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'twee_integralen' AND q.order_index = 1
    AND q.answer = '0,69'
    AND q.latex_answer = $c$0{,}69$c$
    AND position('rechts van de $y$-as' in q.latex_body) > 0
    AND q.latex_body LIKE '%twee decimalen.';
  IF n <> 1 THEN
    RAISE EXCEPTION 'De deling rechts van de y-as hoort antwoord 0,69 te hebben, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'opp_tussen_grafieken' AND q.order_index = 4
    AND q.answer = 'e - 2'
    AND position('lijn $x = 1$' in q.latex_body) > 0;
  IF n <> 1 THEN
    RAISE EXCEPTION 'De opgave met e^x en y = 1 hoort de lijn x = 1 te noemen, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'twee_integralen' AND q.order_index = 6
    AND q.answer = '1,84'
    AND q.latex_answer = $c$1{,}84$c$;
  IF n <> 1 THEN
    RAISE EXCEPTION 'De deling bij 3x^2 - x^3 hoort antwoord 1,84 te hebben, gevonden %', n;
  END IF;

  SELECT q.latex_answer INTO tekst
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'twee_integralen' AND q.order_index = 2;
  IF tekst IS DISTINCT FROM $c$p = \dfrac{3}{\sqrt[3]{2}}$c$ THEN
    RAISE EXCEPTION 'De LaTeX van de derdemachtswortel hoort te blijven staan, gevonden %', tekst;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'twee_integralen' AND q.order_index = 2
    AND q.answer = 'p = 3/2^(1/3)';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Het antwoord hoort p = 3/2^(1/3) te zijn, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'opp_tussen_grafieken'
    AND q.order_index IN (4, 5, 6);
  IF n <> 6 THEN
    RAISE EXCEPTION 'De drie oppervlaktevragen horen samen 6 stappen te hebben, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'opp_tussen_grafieken' AND q.order_index = 4
    AND s.step_description LIKE '%e - 2%';
  IF n <> 1 THEN
    RAISE EXCEPTION 'De uitwerking van e^x en y = 1 hoort op e - 2 uit te komen, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'opp_tussen_grafieken' AND q.order_index = 5
    AND s.step_description LIKE $c$%\tfrac{4}{3}%$c$;
  IF n <> 1 THEN
    RAISE EXCEPTION 'De uitwerking van 2x+2 en x^2+2 hoort op 4/3 uit te komen, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'opp_tussen_grafieken' AND q.order_index = 6
    AND s.step_description LIKE $c$%\tfrac{1}{3}%$c$;
  IF n <> 1 THEN
    RAISE EXCEPTION 'De uitwerking van wortel(x) en x^2 hoort op 1/3 uit te komen, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.question_steps_new
  WHERE step_description LIKE '%definite integraal%';
  IF n <> 0 THEN
    RAISE EXCEPTION 'Er hoort geen "definite integraal" meer te staan, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  WHERE s.step_description LIKE '%bepaalde integraal%'
    AND (
      (q.latex_body = $c$\int_{1}^{4} (x^{3} - 3x^{2} + 2)\,dx$c$ AND s.step_order = 3)
      OR (q.latex_body = $c$\int_{-2}^{1} (x^{3} + 2x^{2} - x)\,dx$c$ AND s.step_order = 3)
      OR (q.latex_body = $c$\int_{0}^{1} (2x+1)^{3}\,dx$c$ AND s.step_order = 4)
    );
  IF n <> 3 THEN
    RAISE EXCEPTION 'Drie stappen horen "bepaalde integraal" te zeggen, gevonden %', n;
  END IF;

  SELECT s.step_description INTO tekst
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'opp_onder_xas' AND q.order_index = 4 AND s.step_order = 2;
  IF tekst IS NULL OR position('|-2|' in tekst) = 0 OR position('|-{-2}|' in tekst) > 0 THEN
    RAISE EXCEPTION 'De absolute waarde hoort |-2| te zijn, gevonden %', tekst;
  END IF;
END
$do$;

COMMIT;
