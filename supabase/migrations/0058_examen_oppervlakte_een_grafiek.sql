-- =============================================================================
-- Migration 0058: Examentraining — oppervlakte van één grafiek
-- =============================================================================
-- Gegenereerd door scripts/examen-oppervlakte-een.ts — niet met de hand bewerken.
--
-- Eigen onderdeel Examentraining, geen theoriehoofdstuk uit het boek.
-- Eerste soort: de oppervlakte tussen één grafiek en de x-as, grenzen gegeven.
-- Acht vragen, allemaal niveau 2.
--
-- Eigen oefenvragen, geen boek- of examenopgaven. Elke integraal wordt
-- nagerekend door src/content/primitieven.test.ts
-- (content/hoofdstuk-examen/oppervlakte-een-grafiek.json).
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
  ('examen_opp_een', $examentrainingsql$Oppervlakte van één grafiek$examentrainingsql$, 1, 'toepassingen')
) AS v(slug, title, order_index, category)
ON CONFLICT (slug) DO NOTHING;

-- 3. Clusters
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT t.id, v.slug, v.title, v.order_index, 'integralen'
FROM (VALUES
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Grenzen gegeven$examentrainingsql$, 1)
) AS v(topic_slug, slug, title, order_index)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
ON CONFLICT (topic_id, slug) DO NOTHING;

-- 4. Vragen
INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, order_index, is_ai_generated, answer_alternatives)
SELECT 'integralen', t.id, cl.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, v.order_index, false, v.alternatives
FROM (VALUES
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} - 2x + 4$, de $x$-as en de lijnen $x = 0$ en $x = 3$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$12$examentrainingsql$, $examentrainingsql$12$examentrainingsql$, 2, 1, ARRAY[]::text[]),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{5x + 2}{x + 2}$, de $x$-as en de lijnen $x = 1$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$15 - 8ln(2)$examentrainingsql$, $examentrainingsql$15 - 8\ln(2)$examentrainingsql$, 2, 2, ARRAY[$examentrainingsql$15 + 8ln(1/2)$examentrainingsql$, $examentrainingsql$15 - 8ln(6) + 8ln(3)$examentrainingsql$]::text[]),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{x}$, de $x$-as en de lijnen $x = 1$ en $x = 9$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$52/3$examentrainingsql$, $examentrainingsql$\dfrac{52}{3}$examentrainingsql$, 2, 3, ARRAY[]::text[]),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{2x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$26/3$examentrainingsql$, $examentrainingsql$\dfrac{26}{3}$examentrainingsql$, 2, 4, ARRAY[]::text[]),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{2x}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$(1/2)(e^2 - 1)$examentrainingsql$, $examentrainingsql$\dfrac{1}{2}(e^{2} - 1)$examentrainingsql$, 2, 5, ARRAY[$examentrainingsql$(1/2)*e^2 - 1/2$examentrainingsql$, $examentrainingsql$e^2/2 - 1/2$examentrainingsql$]::text[]),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln(x)$, de $x$-as en de lijnen $x = 2$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$6ln(2) - 2$examentrainingsql$, $examentrainingsql$6\ln(2) - 2$examentrainingsql$, 2, 6, ARRAY[$examentrainingsql$2(3ln(2) - 1)$examentrainingsql$]::text[]),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2 + \sin(x)$, de $x$-as en de lijnen $x = 0$ en $x = \pi$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$2pi + 2$examentrainingsql$, $examentrainingsql$2\pi + 2$examentrainingsql$, 2, 7, ARRAY[$examentrainingsql$2(pi + 1)$examentrainingsql$, $examentrainingsql$2*pi + 2$examentrainingsql$]::text[]),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$De grafiek van $f(x) = \cos(x)$ ligt op $\left[\dfrac{\pi}{2}, \pi\right]$ onder de $x$-as. Het vlakdeel $V$ wordt ingesloten door die grafiek, de $x$-as en de lijnen $x = \dfrac{\pi}{2}$ en $x = \pi$. De oppervlakte is positief. Bereken exact de oppervlakte van $V$.$examentrainingsql$, $examentrainingsql$1$examentrainingsql$, $examentrainingsql$1$examentrainingsql$, 2, 8, ARRAY[]::text[])
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
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} - 2x + 4$, de $x$-as en de lijnen $x = 0$ en $x = 3$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Op $[0, 3]$ ligt de grafiek boven de $x$-as: de top van de parabool zit bij $x = 1$ en $f(1) = 3$. De oppervlakte is dus de integraal zelf.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} - 2x + 4$, de $x$-as en de lijnen $x = 0$ en $x = 3$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{0}^{3} (x^{2} - 2x + 4)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} - 2x + 4$, de $x$-as en de lijnen $x = 0$ en $x = 3$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = \dfrac{1}{3}x^{3} - x^{2} + 4x$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} - 2x + 4$, de $x$-as en de lijnen $x = 0$ en $x = 3$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(3) - F(0) = 9 - 9 + 12 = 12$. De oppervlakte is $12$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{5x + 2}{x + 2}$, de $x$-as en de lijnen $x = 1$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Op $[1, 4]$ zijn teller en noemer positief, dus de grafiek ligt boven de $x$-as. De oppervlakte is de integraal.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{5x + 2}{x + 2}$, de $x$-as en de lijnen $x = 1$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$Schrijf de breuk als een getal plus een rest: $5x + 2 = 5(x + 2) - 8$, dus $f(x) = 5 - \dfrac{8}{x + 2}$. $O(V) = \displaystyle\int_{1}^{4} \left(5 - \dfrac{8}{x + 2}\right)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{5x + 2}{x + 2}$, de $x$-as en de lijnen $x = 1$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = 5x - 8\ln(x + 2)$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{5x + 2}{x + 2}$, de $x$-as en de lijnen $x = 1$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(4) - F(1) = (20 - 8\ln(6)) - (5 - 8\ln(3)) = 15 - 8\ln(2)$. De oppervlakte is $15 - 8\ln(2)$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{x}$, de $x$-as en de lijnen $x = 1$ en $x = 9$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Op $[1, 9]$ ligt de wortel boven de $x$-as, dus de oppervlakte is de integraal.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{x}$, de $x$-as en de lijnen $x = 1$ en $x = 9$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{1}^{9} \sqrt{x}\,\mathrm{d}x = \displaystyle\int_{1}^{9} x^{1/2}\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{x}$, de $x$-as en de lijnen $x = 1$ en $x = 9$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = \dfrac{2}{3}x^{3/2}$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{x}$, de $x$-as en de lijnen $x = 1$ en $x = 9$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(9) - F(1) = \dfrac{2}{3}\cdot 27 - \dfrac{2}{3} = \dfrac{52}{3}$. De oppervlakte is $\dfrac{52}{3}$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{2x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Op $[0, 4]$ is $2x + 1 \ge 1$, dus de grafiek ligt boven de $x$-as.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{2x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{0}^{4} \sqrt{2x + 1}\,\mathrm{d}x$. De kern is $2x + 1$, en die heeft afgeleide $2$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{2x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = \dfrac{1}{3}(2x + 1)^{3/2}$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{2x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(4) - F(0) = \dfrac{1}{3}\cdot 27 - \dfrac{1}{3} = \dfrac{26}{3}$. De oppervlakte is $\dfrac{26}{3}$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{2x}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. $e^{2x}$ is overal positief, dus de oppervlakte is de integraal.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{2x}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{0}^{1} e^{2x}\,\mathrm{d}x$. De kern is $2x$, met afgeleide $2$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{2x}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = \dfrac{1}{2}e^{2x}$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{2x}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(1) - F(0) = \dfrac{1}{2}e^{2} - \dfrac{1}{2} = \dfrac{1}{2}(e^{2} - 1)$. De oppervlakte is $\dfrac{1}{2}(e^{2} - 1)$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln(x)$, de $x$-as en de lijnen $x = 2$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Op $[2, 4]$ is $\ln(x) > 0$, dus de grafiek ligt boven de $x$-as.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln(x)$, de $x$-as en de lijnen $x = 2$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{2}^{4} \ln(x)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln(x)$, de $x$-as en de lijnen $x = 2$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = x\ln(x) - x$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln(x)$, de $x$-as en de lijnen $x = 2$ en $x = 4$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(4) - F(2) = (4\ln(4) - 4) - (2\ln(2) - 2) = 6\ln(2) - 2$. De oppervlakte is $6\ln(2) - 2$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2 + \sin(x)$, de $x$-as en de lijnen $x = 0$ en $x = \pi$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. $\sin(x)$ ligt tussen $-1$ en $1$, dus $2 + \sin(x)$ ligt tussen $1$ en $3$. De grafiek ligt boven de $x$-as.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2 + \sin(x)$, de $x$-as en de lijnen $x = 0$ en $x = \pi$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = \displaystyle\int_{0}^{\pi} (2 + \sin(x))\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2 + \sin(x)$, de $x$-as en de lijnen $x = 0$ en $x = \pi$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve is $F(x) = 2x - \cos(x)$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2 + \sin(x)$, de $x$-as en de lijnen $x = 0$ en $x = \pi$. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(\pi) - F(0) = (2\pi + 1) - (-1) = 2\pi + 2$. De oppervlakte is $2\pi + 2$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$De grafiek van $f(x) = \cos(x)$ ligt op $\left[\dfrac{\pi}{2}, \pi\right]$ onder de $x$-as. Het vlakdeel $V$ wordt ingesloten door die grafiek, de $x$-as en de lijnen $x = \dfrac{\pi}{2}$ en $x = \pi$. De oppervlakte is positief. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 0, $examentrainingsql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. De grafiek ligt onder de $x$-as. De integraal van $f$ is dan negatief, en de oppervlakte is het tegengestelde.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$De grafiek van $f(x) = \cos(x)$ ligt op $\left[\dfrac{\pi}{2}, \pi\right]$ onder de $x$-as. Het vlakdeel $V$ wordt ingesloten door die grafiek, de $x$-as en de lijnen $x = \dfrac{\pi}{2}$ en $x = \pi$. De oppervlakte is positief. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 1, $examentrainingsql$$O(V) = -\displaystyle\int_{\pi/2}^{\pi} \cos(x)\,\mathrm{d}x = \displaystyle\int_{\pi/2}^{\pi} -\cos(x)\,\mathrm{d}x$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$De grafiek van $f(x) = \cos(x)$ ligt op $\left[\dfrac{\pi}{2}, \pi\right]$ onder de $x$-as. Het vlakdeel $V$ wordt ingesloten door die grafiek, de $x$-as en de lijnen $x = \dfrac{\pi}{2}$ en $x = \pi$. De oppervlakte is positief. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 2, $examentrainingsql$Een primitieve van $-\cos(x)$ is $F(x) = -\sin(x)$.$examentrainingsql$),
  ('examen_opp_een', 'examen_opp_een', $examentrainingsql$De grafiek van $f(x) = \cos(x)$ ligt op $\left[\dfrac{\pi}{2}, \pi\right]$ onder de $x$-as. Het vlakdeel $V$ wordt ingesloten door die grafiek, de $x$-as en de lijnen $x = \dfrac{\pi}{2}$ en $x = \pi$. De oppervlakte is positief. Bereken exact de oppervlakte van $V$.$examentrainingsql$, 3, $examentrainingsql$$F(\pi) - F\left(\dfrac{\pi}{2}\right) = 0 - (-1) = 1$. De oppervlakte is $1$.$examentrainingsql$)
) AS v(topic_slug, cluster_slug, latex_body, step_order, step_description)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new cl ON cl.slug = v.cluster_slug AND cl.topic_id = t.id
JOIN public.questions_new vr ON vr.latex_body = v.latex_body AND vr.cluster_id = cl.id
ON CONFLICT (question_id, step_order) DO NOTHING;

-- 6. Controle
DO $do$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'examen_opp_een' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'examen_opp_een' AND site = 'integralen'));
  IF n <> 8 THEN RAISE EXCEPTION 'Cluster examen_opp_een hoort 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.question_steps_new s
  JOIN public.questions_new vr ON vr.id = s.question_id
  JOIN public.topics_new t ON t.id = vr.topic_id
  WHERE t.site = 'integralen' AND t.slug IN ('examen_opp_een');
  IF n <> 32 THEN RAISE EXCEPTION 'Deze topics horen samen 32 stappen te hebben, gevonden %', n; END IF;
END $do$;

COMMIT;
