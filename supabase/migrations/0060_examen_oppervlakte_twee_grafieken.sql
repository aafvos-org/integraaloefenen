-- =============================================================================
-- Migration 0059: Examentraining — oppervlakte tussen twee grafieken
-- =============================================================================
-- Gegenereerd door scripts/examen-oppervlakte-twee.ts — niet met de hand bewerken.
--
-- Eigen onderdeel Examentraining, geen theoriehoofdstuk uit het boek.
-- Oppervlakte van het vlakdeel tussen de grafieken van f en g, grenzen gegeven.
-- Acht vragen, allemaal niveau 2. Het hoofdstuk en de eerdere soort blijven staan.
--
-- Eigen oefenvragen, geen boek- of examenopgaven. Elke integraal wordt
-- nagerekend door src/content/primitieven.test.ts
-- (content/hoofdstuk-examen/oppervlakte-twee-grafieken.json).
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
  ('examen_opp_twee', $examentrainingsql$Oppervlakte tussen twee grafieken$examentrainingsql$, 2, 'toepassingen')
) AS v(slug, title, order_index, category)
ON CONFLICT (slug) DO NOTHING;

-- 3. Clusters
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT t.id, v.slug, v.title, v.order_index, 'integralen'
FROM (VALUES
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Grenzen gegeven$examentrainingsql$, 1)
) AS v(topic_slug, slug, title, order_index)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
ON CONFLICT (topic_id, slug) DO NOTHING;

-- 4. Vragen
INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, order_index, is_ai_generated, answer_alternatives)
SELECT 'integralen', t.id, cl.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, v.order_index, false, v.alternatives
FROM (VALUES
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = -x^{2} + 4x + 1$ en $g(x) = x + 1$ en de lijnen $x = 0$ en $x = 3$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$9/2$examentrainingsql$, $examentrainingsql$\dfrac{9}{2}$examentrainingsql$, 2, 1, ARRAY[]::text[]),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{5x + 8}{x + 2}$ en $g(x) = 4$ en de lijnen $x = 0$ en $x = 2$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$2 - 2ln(2)$examentrainingsql$, $examentrainingsql$2 - 2\ln(2)$examentrainingsql$, 2, 2, ARRAY[$examentrainingsql$2(1 - ln(2))$examentrainingsql$, $examentrainingsql$2 - ln(4)$examentrainingsql$]::text[]),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{x}$ en $g(x) = \dfrac{1}{4}x$ en de lijnen $x = 0$ en $x = 16$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$32/3$examentrainingsql$, $examentrainingsql$\dfrac{32}{3}$examentrainingsql$, 2, 3, ARRAY[]::text[]),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = e^{2x}$ en $g(x) = e^{x}$ en de lijnen $x = 0$ en $x = 1$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$(1/2)(e - 1)^2$examentrainingsql$, $examentrainingsql$\dfrac{1}{2}(e - 1)^{2}$examentrainingsql$, 2, 4, ARRAY[$examentrainingsql$(1/2)*e^2 - e + 1/2$examentrainingsql$, $examentrainingsql$e^2/2 - e + 1/2$examentrainingsql$]::text[]),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 3x + \ln(x)$ en $g(x) = 3x$ en de lijnen $x = 1$ en $x = e^{2}$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$e^2 + 1$examentrainingsql$, $examentrainingsql$e^{2} + 1$examentrainingsql$, 2, 5, ARRAY[$examentrainingsql$1 + e^2$examentrainingsql$]::text[]),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 1 + \sin(x)$ en $g(x) = \cos(x)$ en de lijnen $x = 0$ en $x = \dfrac{\pi}{2}$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$pi/2$examentrainingsql$, $examentrainingsql$\dfrac{\pi}{2}$examentrainingsql$, 2, 6, ARRAY[$examentrainingsql$(1/2)*pi$examentrainingsql$, $examentrainingsql$pi/2$examentrainingsql$]::text[]),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 2x$ en $g(x) = 2x + \cos(x)$ en de lijnen $x = 0$ en $x = \dfrac{\pi}{2}$. De grafiek van $g$ ligt boven die van $f$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$1$examentrainingsql$, $examentrainingsql$1$examentrainingsql$, 2, 7, ARRAY[]::text[]),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{4x + 1}$ en $g(x) = x + 1$ en de lijnen $x = 0$ en $x = 2$. Welke grafiek boven ligt, staat er niet bij: neem het verschil positief. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$1/3$examentrainingsql$, $examentrainingsql$\dfrac{1}{3}$examentrainingsql$, 2, 8, ARRAY[]::text[])
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
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = -x^{2} + 4x + 1$ en $g(x) = x + 1$ en de lijnen $x = 0$ en $x = 3$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafiek van $f$ ligt boven die van $g$. Het verschil is $f(x) - g(x) = -x^{2} + 3x = x(3 - x)$. Op $[0, 3]$ is dat positief.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = -x^{2} + 4x + 1$ en $g(x) = x + 1$ en de lijnen $x = 0$ en $x = 3$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{0}^{3} (-x^{2} + 3x)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = -x^{2} + 4x + 1$ en $g(x) = x + 1$ en de lijnen $x = 0$ en $x = 3$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = -\dfrac{1}{3}x^{3} + \dfrac{3}{2}x^{2}$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = -x^{2} + 4x + 1$ en $g(x) = x + 1$ en de lijnen $x = 0$ en $x = 3$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(3) - F(0) = -9 + \dfrac{27}{2} = \dfrac{9}{2}$. De oppervlakte is $\dfrac{9}{2}$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{5x + 8}{x + 2}$ en $g(x) = 4$ en de lijnen $x = 0$ en $x = 2$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafiek van $f$ ligt boven die van $g$, dus je integreert $f(x) - g(x)$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{5x + 8}{x + 2}$ en $g(x) = 4$ en de lijnen $x = 0$ en $x = 2$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$f(x) - 4 = \dfrac{5x + 8 - 4(x + 2)}{x + 2} = \dfrac{x}{x + 2}$. Schrijf dat als een getal plus een rest: $\dfrac{x}{x + 2} = 1 - \dfrac{2}{x + 2}$. $O(V) = \displaystyle\int_{0}^{2} \left(1 - \dfrac{2}{x + 2}\right)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{5x + 8}{x + 2}$ en $g(x) = 4$ en de lijnen $x = 0$ en $x = 2$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = x - 2\ln(x + 2)$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{5x + 8}{x + 2}$ en $g(x) = 4$ en de lijnen $x = 0$ en $x = 2$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(2) - F(0) = (2 - 2\ln(4)) - (-2\ln(2)) = 2 - 4\ln(2) + 2\ln(2) = 2 - 2\ln(2)$. De oppervlakte is $2 - 2\ln(2)$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{x}$ en $g(x) = \dfrac{1}{4}x$ en de lijnen $x = 0$ en $x = 16$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafiek van $f$ ligt boven die van $g$. Het verschil is $\sqrt{x} - \dfrac{1}{4}x$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{x}$ en $g(x) = \dfrac{1}{4}x$ en de lijnen $x = 0$ en $x = 16$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{0}^{16} \left(\sqrt{x} - \dfrac{1}{4}x\right)\,\mathrm{d}x = \displaystyle\int_{0}^{16} \left(x^{1/2} - \dfrac{1}{4}x\right)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{x}$ en $g(x) = \dfrac{1}{4}x$ en de lijnen $x = 0$ en $x = 16$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = \dfrac{2}{3}x^{3/2} - \dfrac{1}{8}x^{2}$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{x}$ en $g(x) = \dfrac{1}{4}x$ en de lijnen $x = 0$ en $x = 16$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(16) - F(0) = \dfrac{2}{3}\cdot 64 - \dfrac{1}{8}\cdot 256 = \dfrac{128}{3} - 32 = \dfrac{32}{3}$. De oppervlakte is $\dfrac{32}{3}$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = e^{2x}$ en $g(x) = e^{x}$ en de lijnen $x = 0$ en $x = 1$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. Op $[0, 1]$ is $e^{x} \ge 1$, dus $e^{2x} = e^{x}\cdot e^{x} \ge e^{x}$. De grafiek van $f$ ligt boven die van $g$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = e^{2x}$ en $g(x) = e^{x}$ en de lijnen $x = 0$ en $x = 1$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{0}^{1} (e^{2x} - e^{x})\,\mathrm{d}x$. Bij $e^{2x}$ is de kern $2x$, met afgeleide $2$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = e^{2x}$ en $g(x) = e^{x}$ en de lijnen $x = 0$ en $x = 1$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = \dfrac{1}{2}e^{2x} - e^{x}$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = e^{2x}$ en $g(x) = e^{x}$ en de lijnen $x = 0$ en $x = 1$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(1) - F(0) = \left(\dfrac{1}{2}e^{2} - e\right) - \left(\dfrac{1}{2} - 1\right) = \dfrac{1}{2}e^{2} - e + \dfrac{1}{2} = \dfrac{1}{2}(e - 1)^{2}$. De oppervlakte is $\dfrac{1}{2}(e - 1)^{2}$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 3x + \ln(x)$ en $g(x) = 3x$ en de lijnen $x = 1$ en $x = e^{2}$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. Op $[1, e^{2}]$ is $\ln(x) \ge 0$, dus de grafiek van $f$ ligt boven die van $g$. Het verschil is $\ln(x)$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 3x + \ln(x)$ en $g(x) = 3x$ en de lijnen $x = 1$ en $x = e^{2}$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{1}^{e^{2}} \ln(x)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 3x + \ln(x)$ en $g(x) = 3x$ en de lijnen $x = 1$ en $x = e^{2}$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = x\ln(x) - x$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 3x + \ln(x)$ en $g(x) = 3x$ en de lijnen $x = 1$ en $x = e^{2}$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(e^{2}) - F(1) = (2e^{2} - e^{2}) - (0 - 1) = e^{2} + 1$. De oppervlakte is $e^{2} + 1$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 1 + \sin(x)$ en $g(x) = \cos(x)$ en de lijnen $x = 0$ en $x = \dfrac{\pi}{2}$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafiek van $f$ ligt boven die van $g$. Het verschil is $1 + \sin(x) - \cos(x)$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 1 + \sin(x)$ en $g(x) = \cos(x)$ en de lijnen $x = 0$ en $x = \dfrac{\pi}{2}$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{0}^{\pi/2} (1 + \sin(x) - \cos(x))\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 1 + \sin(x)$ en $g(x) = \cos(x)$ en de lijnen $x = 0$ en $x = \dfrac{\pi}{2}$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = x - \cos(x) - \sin(x)$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 1 + \sin(x)$ en $g(x) = \cos(x)$ en de lijnen $x = 0$ en $x = \dfrac{\pi}{2}$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F\left(\dfrac{\pi}{2}\right) - F(0) = \left(\dfrac{\pi}{2} - 1\right) - (-1) = \dfrac{\pi}{2}$. De oppervlakte is $\dfrac{\pi}{2}$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 2x$ en $g(x) = 2x + \cos(x)$ en de lijnen $x = 0$ en $x = \dfrac{\pi}{2}$. De grafiek van $g$ ligt boven die van $f$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De grafiek van $g$ ligt boven die van $f$. Op $\left[0, \dfrac{\pi}{2}\right]$ is $\cos(x) \ge 0$, dus het verschil $g(x) - f(x) = \cos(x)$ is positief.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 2x$ en $g(x) = 2x + \cos(x)$ en de lijnen $x = 0$ en $x = \dfrac{\pi}{2}$. De grafiek van $g$ ligt boven die van $f$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{0}^{\pi/2} \cos(x)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 2x$ en $g(x) = 2x + \cos(x)$ en de lijnen $x = 0$ en $x = \dfrac{\pi}{2}$. De grafiek van $g$ ligt boven die van $f$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $G(x) = \sin(x)$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 2x$ en $g(x) = 2x + \cos(x)$ en de lijnen $x = 0$ en $x = \dfrac{\pi}{2}$. De grafiek van $g$ ligt boven die van $f$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$G\left(\dfrac{\pi}{2}\right) - G(0) = 1 - 0 = 1$. De oppervlakte is $1$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{4x + 1}$ en $g(x) = x + 1$ en de lijnen $x = 0$ en $x = 2$. Welke grafiek boven ligt, staat er niet bij: neem het verschil positief. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit. De zin zegt niet welke grafiek boven ligt. Je neemt het verschil positief.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{4x + 1}$ en $g(x) = x + 1$ en de lijnen $x = 0$ en $x = 2$. Welke grafiek boven ligt, staat er niet bij: neem het verschil positief. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$Kijk naar $f(x) - g(x) = \sqrt{4x + 1} - x - 1$. Op $[0, 2]$ is dat minstens $0$ (het is $0$ aan de uiteinden en daartussen positief). Dus $f$ ligt boven, en $O(V) = \displaystyle\int_{0}^{2} \left(\sqrt{4x + 1} - x - 1\right)\,\mathrm{d}x$. De kern van de wortel is $4x + 1$, met afgeleide $4$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{4x + 1}$ en $g(x) = x + 1$ en de lijnen $x = 0$ en $x = 2$. Welke grafiek boven ligt, staat er niet bij: neem het verschil positief. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = \dfrac{1}{6}(4x + 1)^{3/2} - \dfrac{1}{2}x^{2} - x$.$examentrainingsql$),
  ('examen_opp_twee', 'examen_opp_twee', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{4x + 1}$ en $g(x) = x + 1$ en de lijnen $x = 0$ en $x = 2$. Welke grafiek boven ligt, staat er niet bij: neem het verschil positief. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(2) - F(0) = \left(\dfrac{1}{6}\cdot 27 - 2 - 2\right) - \dfrac{1}{6} = \dfrac{1}{2} - \dfrac{1}{6} = \dfrac{1}{3}$. De oppervlakte is $\dfrac{1}{3}$.$examentrainingsql$)
) AS v(topic_slug, cluster_slug, latex_body, step_order, step_description)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new cl ON cl.slug = v.cluster_slug AND cl.topic_id = t.id
JOIN public.questions_new vr ON vr.latex_body = v.latex_body AND vr.cluster_id = cl.id
ON CONFLICT (question_id, step_order) DO NOTHING;

-- 6. Controle
DO $do$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'examen_opp_twee' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'examen_opp_twee' AND site = 'integralen'));
  IF n <> 8 THEN RAISE EXCEPTION 'Cluster examen_opp_twee hoort 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.question_steps_new s
  JOIN public.questions_new vr ON vr.id = s.question_id
  JOIN public.topics_new t ON t.id = vr.topic_id
  WHERE t.site = 'integralen' AND t.slug IN ('examen_opp_twee');
  IF n <> 32 THEN RAISE EXCEPTION 'Deze topics horen samen 32 stappen te hebben, gevonden %', n; END IF;
END $do$;

COMMIT;
