-- =============================================================================
-- Migration 0060: Examentraining — oppervlakte, grenzen zelf vinden
-- =============================================================================
-- Gegenereerd door scripts/examen-oppervlakte-grenzen.ts — niet met de hand bewerken.
--
-- Eigen onderdeel Examentraining, geen theoriehoofdstuk uit het boek.
-- De oppervlakte van een vlakdeel waarvan de grenzen niet in de vraag staan.
-- Acht vragen, allemaal niveau 3.
--
-- Eigen oefenvragen, geen boek- of examenopgaven. Elke integraal wordt
-- nagerekend door src/content/primitieven.test.ts
-- (content/hoofdstuk-examen/oppervlakte-grenzen-zelf.json).
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
VALUES ('examentraining', $examentrainingsql$Examentraining$examentrainingsql$, 5, 16, 'integralen')
ON CONFLICT (slug) DO NOTHING;

-- 2. Topics
INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default, site, category)
SELECT v.slug, v.title, (SELECT id FROM public.chapters WHERE slug = 'examentraining' AND site = 'integralen'), v.order_index, true, 'integralen', v.category
FROM (VALUES
  ('examen_opp_grenzen', $examentrainingsql$Oppervlakte, grenzen zelf vinden$examentrainingsql$, 3, 'toepassingen')
) AS v(slug, title, order_index, category)
ON CONFLICT (slug) DO NOTHING;

-- 3. Clusters
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT t.id, v.slug, v.title, v.order_index, 'integralen'
FROM (VALUES
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Grenzen zelf vinden$examentrainingsql$, 1)
) AS v(topic_slug, slug, title, order_index)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
ON CONFLICT (topic_id, slug) DO NOTHING;

-- 4. Vragen
INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, order_index, is_ai_generated, answer_alternatives)
SELECT 'integralen', t.id, cl.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, v.order_index, false, v.alternatives
FROM (VALUES
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} - 4x + 3$ en de $x$-as. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$4/3$examentrainingsql$, $examentrainingsql$\dfrac{4}{3}$examentrainingsql$, 3, 1, ARRAY[]::text[]),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = x^{2}$ en $g(x) = x + 2$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$9/2$examentrainingsql$, $examentrainingsql$\dfrac{9}{2}$examentrainingsql$, 3, 2, ARRAY[]::text[]),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{4x}$ en $g(x) = x$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$8/3$examentrainingsql$, $examentrainingsql$\dfrac{8}{3}$examentrainingsql$, 3, 3, ARRAY[]::text[]),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{3x}{x + 1}$ en $g(x) = x$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$4 - 3ln(3)$examentrainingsql$, $examentrainingsql$4 - 3\ln(3)$examentrainingsql$, 3, 4, ARRAY[$examentrainingsql$4 - ln(27)$examentrainingsql$]::text[]),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{x} + e^{-x}$ en de lijn $y = \dfrac{5}{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$5ln(2) - 3$examentrainingsql$, $examentrainingsql$5\ln(2) - 3$examentrainingsql$, 3, 5, ARRAY[$examentrainingsql$ln(32) - 3$examentrainingsql$]::text[]),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ ligt rechts van de $y$-as, zo dicht mogelijk bij de oorsprong, en wordt ingesloten door de grafiek van $f(x) = \sin(x)$ en de $x$-as. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$2$examentrainingsql$, $examentrainingsql$2$examentrainingsql$, 3, 6, ARRAY[]::text[]),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ ligt zo dicht mogelijk bij de oorsprong en wordt ingesloten door de grafiek van $f(x) = \cos(x)$ en de lijn $y = \dfrac{1}{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$sqrt(3) - pi/3$examentrainingsql$, $examentrainingsql$\sqrt{3} - \dfrac{\pi}{3}$examentrainingsql$, 3, 7, ARRAY[$examentrainingsql$(3*sqrt(3) - pi)/3$examentrainingsql$]::text[]),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \ln(x)$ en $g(x) = \bigl(\ln(x)\bigr)^{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$3 - e$examentrainingsql$, $examentrainingsql$3 - e$examentrainingsql$, 3, 8, ARRAY[]::text[])
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
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} - 4x + 3$ en de $x$-as. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafiek snijdt de $x$-as waar $x^{2} - 4x + 3 = 0$, dus $(x - 1)(x - 3) = 0$. De snijpunten zijn $x = 1$ en $x = 3$. Daartussen is $f(2) = -1$, dus de grafiek ligt onder de $x$-as. De oppervlakte is het tegengestelde van de integraal van $f$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} - 4x + 3$ en de $x$-as. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = -\displaystyle\int_{1}^{3} (x^{2} - 4x + 3)\,\mathrm{d}x = \displaystyle\int_{1}^{3} (-x^{2} + 4x - 3)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} - 4x + 3$ en de $x$-as. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = -\dfrac{1}{3}x^{3} + 2x^{2} - 3x$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} - 4x + 3$ en de $x$-as. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(3) - F(1) = 0 - \left(-\dfrac{4}{3}\right) = \dfrac{4}{3}$. De oppervlakte is $\dfrac{4}{3}$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = x^{2}$ en $g(x) = x + 2$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafieken snijden elkaar waar $x^{2} = x + 2$, dus $x^{2} - x - 2 = 0$, ofwel $(x - 2)(x + 1) = 0$. De snijpunten zijn $x = -1$ en $x = 2$. Op dat stuk is $g(0) = 2$ groter dan $f(0) = 0$, dus de grafiek van $g$ ligt boven die van $f$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = x^{2}$ en $g(x) = x + 2$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{-1}^{2} \bigl((x + 2) - x^{2}\bigr)\,\mathrm{d}x = \displaystyle\int_{-1}^{2} (-x^{2} + x + 2)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = x^{2}$ en $g(x) = x + 2$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = -\dfrac{1}{3}x^{3} + \dfrac{1}{2}x^{2} + 2x$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = x^{2}$ en $g(x) = x + 2$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(2) - F(-1) = \dfrac{10}{3} - \left(-\dfrac{7}{6}\right) = \dfrac{20}{6} + \dfrac{7}{6} = \dfrac{9}{2}$. De oppervlakte is $\dfrac{9}{2}$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{4x}$ en $g(x) = x$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafieken snijden elkaar waar $\sqrt{4x} = x$. Kwadrateren geeft $4x = x^{2}$, dus $x(x - 4) = 0$. Beide oplossingen kloppen: $x = 0$ en $x = 4$. Op dat stuk is $f(1) = 2$ groter dan $g(1) = 1$, dus de grafiek van $f$ ligt boven die van $g$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{4x}$ en $g(x) = x$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{0}^{4} \bigl(\sqrt{4x} - x\bigr)\,\mathrm{d}x$. De kern van de wortel is $4x$, en die heeft afgeleide $4$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{4x}$ en $g(x) = x$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = \dfrac{1}{6}(4x)^{3/2} - \dfrac{1}{2}x^{2}$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{4x}$ en $g(x) = x$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(4) - F(0) = \dfrac{1}{6}\cdot 64 - 8 = \dfrac{32}{3} - 8 = \dfrac{8}{3}$. De oppervlakte is $\dfrac{8}{3}$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{3x}{x + 1}$ en $g(x) = x$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafieken snijden elkaar waar $\dfrac{3x}{x + 1} = x$. Dan is $3x = x(x + 1)$, dus $x^{2} - 2x = 0$, ofwel $x(x - 2) = 0$. De snijpunten zijn $x = 0$ en $x = 2$. De verticale asymptoot $x = -1$ ligt daar buiten. Op dat stuk is $f(1) = \dfrac{3}{2}$ groter dan $g(1) = 1$, dus de grafiek van $f$ ligt boven die van $g$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{3x}{x + 1}$ en $g(x) = x$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$f(x) - g(x) = \dfrac{3x}{x + 1} - x$. Schrijf de breuk als een getal plus een rest: $\dfrac{3x}{x + 1} = 3 - \dfrac{3}{x + 1}$. Dus $f(x) - g(x) = 3 - x - \dfrac{3}{x + 1}$. $O(V) = \displaystyle\int_{0}^{2} \left(3 - x - \dfrac{3}{x + 1}\right)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{3x}{x + 1}$ en $g(x) = x$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = 3x - \dfrac{1}{2}x^{2} - 3\ln(x + 1)$. Op $[0, 2]$ is $x + 1$ positief.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{3x}{x + 1}$ en $g(x) = x$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(2) - F(0) = \bigl(6 - 2 - 3\ln(3)\bigr) - 0 = 4 - 3\ln(3)$. De oppervlakte is $4 - 3\ln(3)$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{x} + e^{-x}$ en de lijn $y = \dfrac{5}{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafiek snijdt de lijn waar $e^{x} + e^{-x} = \dfrac{5}{2}$. Vermenigvuldig met $e^{x}$: $e^{2x} + 1 = \dfrac{5}{2}e^{x}$, dus $2e^{2x} - 5e^{x} + 2 = 0$. Met $t = e^{x}$ wordt dat $(2t - 1)(t - 2) = 0$, dus $t = \dfrac{1}{2}$ of $t = 2$. De snijpunten zijn $x = -\ln(2)$ en $x = \ln(2)$. Daartussen is $f(0) = 2$ kleiner dan $\dfrac{5}{2}$, dus de lijn ligt boven de grafiek.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{x} + e^{-x}$ en de lijn $y = \dfrac{5}{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{-\ln(2)}^{\ln(2)} \left(\dfrac{5}{2} - e^{x} - e^{-x}\right)\,\mathrm{d}x$. Bij $e^{-x}$ is de kern $-x$, met afgeleide $-1$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{x} + e^{-x}$ en de lijn $y = \dfrac{5}{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = \dfrac{5}{2}x - e^{x} + e^{-x}$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{x} + e^{-x}$ en de lijn $y = \dfrac{5}{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F\bigl(\ln(2)\bigr) - F\bigl(-\ln(2)\bigr) = \left(\dfrac{5}{2}\ln(2) - \dfrac{3}{2}\right) - \left(-\dfrac{5}{2}\ln(2) + \dfrac{3}{2}\right) = 5\ln(2) - 3$. De oppervlakte is $5\ln(2) - 3$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ ligt rechts van de $y$-as, zo dicht mogelijk bij de oorsprong, en wordt ingesloten door de grafiek van $f(x) = \sin(x)$ en de $x$-as. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafiek snijdt de $x$-as waar $\sin(x) = 0$, dus bij $x = 0$, $x = \pi$, $x = 2\pi$, enzovoort. Rechts van de $y$-as, zo dicht mogelijk bij de oorsprong, hoort het stuk van $x = 0$ tot $x = \pi$. Daar is $\sin(x)$ positief, dus de grafiek ligt boven de $x$-as.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ ligt rechts van de $y$-as, zo dicht mogelijk bij de oorsprong, en wordt ingesloten door de grafiek van $f(x) = \sin(x)$ en de $x$-as. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{0}^{\pi} \sin(x)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ ligt rechts van de $y$-as, zo dicht mogelijk bij de oorsprong, en wordt ingesloten door de grafiek van $f(x) = \sin(x)$ en de $x$-as. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = -\cos(x)$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ ligt rechts van de $y$-as, zo dicht mogelijk bij de oorsprong, en wordt ingesloten door de grafiek van $f(x) = \sin(x)$ en de $x$-as. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(\pi) - F(0) = -(-1) - (-1) = 2$. De oppervlakte is $2$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ ligt zo dicht mogelijk bij de oorsprong en wordt ingesloten door de grafiek van $f(x) = \cos(x)$ en de lijn $y = \dfrac{1}{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafiek snijdt de lijn waar $\cos(x) = \dfrac{1}{2}$, dus bij $x = \pm\dfrac{\pi}{3} + 2k\pi$. Het vlakdeel het dichtst bij de oorsprong loopt van $x = -\dfrac{\pi}{3}$ tot $x = \dfrac{\pi}{3}$. Daar is $\cos(x) \ge \dfrac{1}{2}$, dus de grafiek ligt boven de lijn.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ ligt zo dicht mogelijk bij de oorsprong en wordt ingesloten door de grafiek van $f(x) = \cos(x)$ en de lijn $y = \dfrac{1}{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{-\pi/3}^{\pi/3} \left(\cos(x) - \dfrac{1}{2}\right)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ ligt zo dicht mogelijk bij de oorsprong en wordt ingesloten door de grafiek van $f(x) = \cos(x)$ en de lijn $y = \dfrac{1}{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = \sin(x) - \dfrac{1}{2}x$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ ligt zo dicht mogelijk bij de oorsprong en wordt ingesloten door de grafiek van $f(x) = \cos(x)$ en de lijn $y = \dfrac{1}{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F\left(\dfrac{\pi}{3}\right) - F\left(-\dfrac{\pi}{3}\right) = \left(\dfrac{\sqrt{3}}{2} - \dfrac{\pi}{6}\right) - \left(-\dfrac{\sqrt{3}}{2} + \dfrac{\pi}{6}\right) = \sqrt{3} - \dfrac{\pi}{3}$. De oppervlakte is $\sqrt{3} - \dfrac{\pi}{3}$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \ln(x)$ en $g(x) = \bigl(\ln(x)\bigr)^{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafieken snijden elkaar waar $\ln(x) = \bigl(\ln(x)\bigr)^{2}$. Met $t = \ln(x)$ wordt dat $t = t^{2}$, dus $t(t - 1) = 0$. Dan is $t = 0$ of $t = 1$, dus $x = 1$ of $x = e$. Op $(1, e)$ ligt $\ln(x)$ tussen $0$ en $1$, en dan is $\bigl(\ln(x)\bigr)^{2}$ kleiner. De grafiek van $f$ ligt boven die van $g$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \ln(x)$ en $g(x) = \bigl(\ln(x)\bigr)^{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{1}^{e} \bigl(\ln(x) - (\ln(x))^{2}\bigr)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \ln(x)$ en $g(x) = \bigl(\ln(x)\bigr)^{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve van $\ln(x)$ is $x\ln(x) - x$. Voor $(\ln(x))^{2}$ integreer je partieel: differentieer $(\ln(x))^{2}$ en primitiveer $1$. De afgeleide van $(\ln(x))^{2}$ is $\dfrac{2\ln(x)}{x}$, een primitieve van $1$ is $x$. Dan is $\int (\ln(x))^{2}\,\mathrm{d}x = x(\ln(x))^{2} - \int 2\ln(x)\,\mathrm{d}x = x(\ln(x))^{2} - 2x\ln(x) + 2x$. Een primitieve van het verschil is $F(x) = -x(\ln(x))^{2} + 3x\ln(x) - 3x$.$examentrainingsql$),
  ('examen_opp_grenzen', 'examen_opp_grenzen', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \ln(x)$ en $g(x) = \bigl(\ln(x)\bigr)^{2}$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(e) = -e\cdot 1 + 3e\cdot 1 - 3e = -e$ en $F(1) = -3$. Dus $F(e) - F(1) = -e - (-3) = 3 - e$. De oppervlakte is $3 - e$.$examentrainingsql$)
) AS v(topic_slug, cluster_slug, latex_body, step_order, step_description)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new cl ON cl.slug = v.cluster_slug AND cl.topic_id = t.id
JOIN public.questions_new vr ON vr.latex_body = v.latex_body AND vr.cluster_id = cl.id
ON CONFLICT (question_id, step_order) DO NOTHING;

-- 6. Controle
DO $do$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'examen_opp_grenzen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'examen_opp_grenzen' AND site = 'integralen'));
  IF n <> 8 THEN RAISE EXCEPTION 'Cluster examen_opp_grenzen hoort 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.question_steps_new s
  JOIN public.questions_new vr ON vr.id = s.question_id
  JOIN public.topics_new t ON t.id = vr.topic_id
  WHERE t.site = 'integralen' AND t.slug IN ('examen_opp_grenzen');
  IF n <> 32 THEN RAISE EXCEPTION 'Deze topics horen samen 32 stappen te hebben, gevonden %', n; END IF;
END $do$;

COMMIT;
