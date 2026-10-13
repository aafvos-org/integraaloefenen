-- =============================================================================
-- Migration 0073: H11 — integralen numeriek berekenen
-- =============================================================================
-- Gegenereerd door scripts/h11-numeriek-content.ts — niet met de hand bewerken.
--
-- Eigen soort onder hoofdstuk 11: een integraal of oppervlakte benaderen
-- met de grafische rekenmachine en afronden op twee decimalen. Er is geen
-- primitieve die een leerling hier exact kan uitrekenen.
--
-- Geen boekopgaven. Elke uitkomst is nagerekend met numerieke integratie;
-- src/content/h11-numeriek.test.ts doet dat opnieuw.
--
-- Alleen toevoegen: geen DELETE, DROP, ALTER of UPDATE. Twee keer draaien
-- voegt niets dubbel toe.
--
--   • 1 hoofdstuk, 1 topics, 1 clusters
--   • 8 vragen met elk 4 stappen (32 stappen)
-- =============================================================================

BEGIN;

-- 1. Hoofdstuk
INSERT INTO public.chapters (slug, title, book_part, order_index, site)
VALUES ('h11', $h11sql$H11 — Primitiveren en integralen$h11sql$, 3, 11, 'integralen')
ON CONFLICT (slug) DO NOTHING;

-- 2. Topics
INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default, site, category)
SELECT v.slug, v.title, (SELECT id FROM public.chapters WHERE slug = 'h11' AND site = 'integralen'), v.order_index, true, 'integralen', v.category
FROM (VALUES
  ('h11_numeriek', $h11sql$Integralen numeriek berekenen$h11sql$, 28, 'toepassingen')
) AS v(slug, title, order_index, category)
ON CONFLICT (slug) DO NOTHING;

-- 3. Clusters
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT t.id, v.slug, v.title, v.order_index, 'integralen'
FROM (VALUES
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benaderen en afronden$h11sql$, 1)
) AS v(topic_slug, slug, title, order_index)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
ON CONFLICT (topic_id, slug) DO NOTHING;

-- 4. Vragen
INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, order_index, is_ai_generated, answer_alternatives)
SELECT 'integralen', t.id, cl.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, v.order_index, false, v.alternatives
FROM (VALUES
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} e^{x^{2}}\,dx$. Rond af op twee decimalen.$h11sql$, $h11sql$1,46$h11sql$, $h11sql$1{,}46$h11sql$, 1, 1, ARRAY[$h11sql$1.46$h11sql$]::text[]),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sqrt{1 + x^{3}}\,dx$. Rond af op twee decimalen.$h11sql$, $h11sql$1,11$h11sql$, $h11sql$1{,}11$h11sql$, 1, 2, ARRAY[$h11sql$1.11$h11sql$]::text[]),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} e^{-x^{2}}\,dx$. Rond af op twee decimalen.$h11sql$, $h11sql$0,75$h11sql$, $h11sql$0{,}75$h11sql$, 1, 3, ARRAY[$h11sql$0.75$h11sql$]::text[]),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sin(x^{2})\,dx$. Rond af op twee decimalen.$h11sql$, $h11sql$0,31$h11sql$, $h11sql$0{,}31$h11sql$, 2, 4, ARRAY[$h11sql$0.31$h11sql$]::text[]),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sqrt{1 + x^{4}}\,dx$. Rond af op twee decimalen.$h11sql$, $h11sql$1,09$h11sql$, $h11sql$1{,}09$h11sql$, 2, 5, ARRAY[$h11sql$1.09$h11sql$]::text[]),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{2}^{4} \dfrac{1}{\ln(x)}\,dx$. Rond af op twee decimalen.$h11sql$, $h11sql$1,92$h11sql$, $h11sql$1{,}92$h11sql$, 2, 6, ARRAY[$h11sql$1.92$h11sql$]::text[]),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Gegeven is $f(x) = \sqrt{1 + x^{3}}$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$, de $x$-as en de lijnen $x = 0$ en $x = 2$. Benader de oppervlakte van $V$. Rond af op twee decimalen.$h11sql$, $h11sql$3,24$h11sql$, $h11sql$3{,}24$h11sql$, 3, 7, ARRAY[$h11sql$3.24$h11sql$]::text[]),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Gegeven zijn $f(x) = e^{x^{2}}$ en $g(x) = 1$. Benader de oppervlakte van het vlakdeel dat de grafieken van $f$ en $g$ insluiten op het interval $[0, 1]$. Rond af op twee decimalen.$h11sql$, $h11sql$0,46$h11sql$, $h11sql$0{,}46$h11sql$, 3, 8, ARRAY[$h11sql$0.46$h11sql$]::text[])
) AS v(topic_slug, cluster_slug, latex_body, answer, latex_answer, difficulty, order_index, alternatives)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new cl ON cl.slug = v.cluster_slug AND cl.topic_id = t.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.questions_new bestaand
  WHERE bestaand.cluster_id = cl.id AND bestaand.latex_body = v.latex_body
);

-- 5. Stappen (step_order 0 t/m 3)
INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT vr.id, v.step_order, v.step_description
FROM (VALUES
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} e^{x^{2}}\,dx$. Rond af op twee decimalen.$h11sql$, 0, $h11sql$Deel 2 en deel 3: de integraal staat er al. Een primitieve kun je hier niet uitrekenen. Benader de integraal met de grafische rekenmachine en rond af op twee decimalen.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} e^{x^{2}}\,dx$. Rond af op twee decimalen.$h11sql$, 1, $h11sql$Zet in de grafische rekenmachine de integraal $\int_{0}^{1} e^{x^{2}}\,dx$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} e^{x^{2}}\,dx$. Rond af op twee decimalen.$h11sql$, 2, $h11sql$De rekenmachine geeft ongeveer $1{,}46265$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} e^{x^{2}}\,dx$. Rond af op twee decimalen.$h11sql$, 3, $h11sql$Het derde cijfer achter de komma is $2$. Dat is kleiner dan $5$, dus het tweede cijfer achter de komma, $6$, blijft staan. Op twee decimalen is het antwoord $1{,}46$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sqrt{1 + x^{3}}\,dx$. Rond af op twee decimalen.$h11sql$, 0, $h11sql$Deel 2 en deel 3: de integraal staat er al. Een primitieve kun je hier niet uitrekenen. Benader de integraal met de grafische rekenmachine en rond af op twee decimalen.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sqrt{1 + x^{3}}\,dx$. Rond af op twee decimalen.$h11sql$, 1, $h11sql$Zet in de grafische rekenmachine de integraal $\int_{0}^{1} \sqrt{1 + x^{3}}\,dx$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sqrt{1 + x^{3}}\,dx$. Rond af op twee decimalen.$h11sql$, 2, $h11sql$De rekenmachine geeft ongeveer $1{,}11145$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sqrt{1 + x^{3}}\,dx$. Rond af op twee decimalen.$h11sql$, 3, $h11sql$Het derde cijfer achter de komma is $1$. Dat is kleiner dan $5$, dus het tweede cijfer achter de komma, $1$, blijft staan. Op twee decimalen is het antwoord $1{,}11$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} e^{-x^{2}}\,dx$. Rond af op twee decimalen.$h11sql$, 0, $h11sql$Deel 2 en deel 3: de integraal staat er al. Een primitieve kun je hier niet uitrekenen. Benader de integraal met de grafische rekenmachine en rond af op twee decimalen.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} e^{-x^{2}}\,dx$. Rond af op twee decimalen.$h11sql$, 1, $h11sql$Zet in de grafische rekenmachine de integraal $\int_{0}^{1} e^{-x^{2}}\,dx$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} e^{-x^{2}}\,dx$. Rond af op twee decimalen.$h11sql$, 2, $h11sql$De rekenmachine geeft ongeveer $0{,}74682$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} e^{-x^{2}}\,dx$. Rond af op twee decimalen.$h11sql$, 3, $h11sql$Het derde cijfer achter de komma is $6$. Dat is $5$ of groter, dus het tweede cijfer achter de komma, $4$, gaat één omhoog. Op twee decimalen is het antwoord $0{,}75$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sin(x^{2})\,dx$. Rond af op twee decimalen.$h11sql$, 0, $h11sql$Deel 2 en deel 3: de integraal staat er al. Een primitieve kun je hier niet uitrekenen. Benader de integraal met de grafische rekenmachine en rond af op twee decimalen.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sin(x^{2})\,dx$. Rond af op twee decimalen.$h11sql$, 1, $h11sql$Zet in de grafische rekenmachine de integraal $\int_{0}^{1} \sin(x^{2})\,dx$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sin(x^{2})\,dx$. Rond af op twee decimalen.$h11sql$, 2, $h11sql$De rekenmachine geeft ongeveer $0{,}31027$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sin(x^{2})\,dx$. Rond af op twee decimalen.$h11sql$, 3, $h11sql$Het derde cijfer achter de komma is $0$. Dat is kleiner dan $5$, dus het tweede cijfer achter de komma, $1$, blijft staan. Op twee decimalen is het antwoord $0{,}31$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sqrt{1 + x^{4}}\,dx$. Rond af op twee decimalen.$h11sql$, 0, $h11sql$Deel 2 en deel 3: de integraal staat er al. Een primitieve kun je hier niet uitrekenen. Benader de integraal met de grafische rekenmachine en rond af op twee decimalen.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sqrt{1 + x^{4}}\,dx$. Rond af op twee decimalen.$h11sql$, 1, $h11sql$Zet in de grafische rekenmachine de integraal $\int_{0}^{1} \sqrt{1 + x^{4}}\,dx$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sqrt{1 + x^{4}}\,dx$. Rond af op twee decimalen.$h11sql$, 2, $h11sql$De rekenmachine geeft ongeveer $1{,}08943$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{0}^{1} \sqrt{1 + x^{4}}\,dx$. Rond af op twee decimalen.$h11sql$, 3, $h11sql$Het derde cijfer achter de komma is $9$. Dat is $5$ of groter, dus het tweede cijfer achter de komma, $8$, gaat één omhoog. Op twee decimalen is het antwoord $1{,}09$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{2}^{4} \dfrac{1}{\ln(x)}\,dx$. Rond af op twee decimalen.$h11sql$, 0, $h11sql$Deel 2 en deel 3: de integraal staat er al. Een primitieve kun je hier niet uitrekenen. Benader de integraal met de grafische rekenmachine en rond af op twee decimalen.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{2}^{4} \dfrac{1}{\ln(x)}\,dx$. Rond af op twee decimalen.$h11sql$, 1, $h11sql$Zet in de grafische rekenmachine de integraal $\int_{2}^{4} \dfrac{1}{\ln(x)}\,dx$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{2}^{4} \dfrac{1}{\ln(x)}\,dx$. Rond af op twee decimalen.$h11sql$, 2, $h11sql$De rekenmachine geeft ongeveer $1{,}92242$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Benader $\int_{2}^{4} \dfrac{1}{\ln(x)}\,dx$. Rond af op twee decimalen.$h11sql$, 3, $h11sql$Het derde cijfer achter de komma is $2$. Dat is kleiner dan $5$, dus het tweede cijfer achter de komma, $2$, blijft staan. Op twee decimalen is het antwoord $1{,}92$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Gegeven is $f(x) = \sqrt{1 + x^{3}}$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$, de $x$-as en de lijnen $x = 0$ en $x = 2$. Benader de oppervlakte van $V$. Rond af op twee decimalen.$h11sql$, 0, $h11sql$Alle drie de delen. $\sqrt{1 + x^{3}}$ is overal positief, dus de grafiek ligt boven de $x$-as. De oppervlakte is de integraal van $f$ van $0$ tot $2$. Die reken je niet exact uit: benader met de grafische rekenmachine en rond af.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Gegeven is $f(x) = \sqrt{1 + x^{3}}$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$, de $x$-as en de lijnen $x = 0$ en $x = 2$. Benader de oppervlakte van $V$. Rond af op twee decimalen.$h11sql$, 1, $h11sql$$O(V) = \int_{0}^{2} \sqrt{1 + x^{3}}\,dx$. Zet die integraal in de rekenmachine.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Gegeven is $f(x) = \sqrt{1 + x^{3}}$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$, de $x$-as en de lijnen $x = 0$ en $x = 2$. Benader de oppervlakte van $V$. Rond af op twee decimalen.$h11sql$, 2, $h11sql$De rekenmachine geeft ongeveer $3{,}24131$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Gegeven is $f(x) = \sqrt{1 + x^{3}}$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$, de $x$-as en de lijnen $x = 0$ en $x = 2$. Benader de oppervlakte van $V$. Rond af op twee decimalen.$h11sql$, 3, $h11sql$Het derde cijfer achter de komma is $1$. Dat is kleiner dan $5$, dus het tweede cijfer achter de komma, $4$, blijft staan. De oppervlakte is $3{,}24$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Gegeven zijn $f(x) = e^{x^{2}}$ en $g(x) = 1$. Benader de oppervlakte van het vlakdeel dat de grafieken van $f$ en $g$ insluiten op het interval $[0, 1]$. Rond af op twee decimalen.$h11sql$, 0, $h11sql$Alle drie de delen. Op $[0, 1]$ is $e^{x^{2}} \ge 1$, en op $(0, 1]$ ligt $f$ boven $g$. De oppervlakte is de integraal van $f - g$. Die benader je met de rekenmachine en je rondt af.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Gegeven zijn $f(x) = e^{x^{2}}$ en $g(x) = 1$. Benader de oppervlakte van het vlakdeel dat de grafieken van $f$ en $g$ insluiten op het interval $[0, 1]$. Rond af op twee decimalen.$h11sql$, 1, $h11sql$$O = \int_{0}^{1} \left(e^{x^{2}} - 1\right)\,dx$. Zet die integraal in de rekenmachine.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Gegeven zijn $f(x) = e^{x^{2}}$ en $g(x) = 1$. Benader de oppervlakte van het vlakdeel dat de grafieken van $f$ en $g$ insluiten op het interval $[0, 1]$. Rond af op twee decimalen.$h11sql$, 2, $h11sql$De rekenmachine geeft ongeveer $0{,}46265$.$h11sql$),
  ('h11_numeriek', 'h11_numeriek_afronden', $h11sql$Gegeven zijn $f(x) = e^{x^{2}}$ en $g(x) = 1$. Benader de oppervlakte van het vlakdeel dat de grafieken van $f$ en $g$ insluiten op het interval $[0, 1]$. Rond af op twee decimalen.$h11sql$, 3, $h11sql$Het derde cijfer achter de komma is $2$. Dat is kleiner dan $5$, dus het tweede cijfer achter de komma, $6$, blijft staan. De oppervlakte is $0{,}46$.$h11sql$)
) AS v(topic_slug, cluster_slug, latex_body, step_order, step_description)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new cl ON cl.slug = v.cluster_slug AND cl.topic_id = t.id
JOIN public.questions_new vr ON vr.latex_body = v.latex_body AND vr.cluster_id = cl.id
ON CONFLICT (question_id, step_order) DO NOTHING;

-- 6. Controle
DO $do$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'h11_numeriek_afronden' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h11_numeriek' AND site = 'integralen'));
  IF n <> 8 THEN RAISE EXCEPTION 'Cluster h11_numeriek_afronden hoort 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.question_steps_new s
  JOIN public.questions_new vr ON vr.id = s.question_id
  JOIN public.topics_new t ON t.id = vr.topic_id
  WHERE t.site = 'integralen' AND t.slug IN ('h11_numeriek');
  IF n <> 32 THEN RAISE EXCEPTION 'Deze topics horen samen 32 stappen te hebben, gevonden %', n; END IF;
END $do$;

COMMIT;
