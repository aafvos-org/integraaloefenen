-- =============================================================================
-- Migration 0051: K.4 Theorie A — Staartdelingen
-- =============================================================================
-- Gegenereerd door scripts/k4a-content.ts — niet met de hand bewerken.
--
-- Het eerste theorieblok van K.4. Een breuk met een lineaire noemer en een
-- teller die minstens even lang is, deel je eerst. Daarna geeft de rest een
-- logaritme.
--
-- Drie clusters: onbepaald primitiveren, bepaalde integralen, en vlakdelen
-- (twee keer de waarde van p).
--
-- Eigen oefenvragen, geen boekopgaven. Elke primitieve wordt nagerekend door
-- src/content/primitieven.test.ts (content/hoofdstuk-k/k4a.json).
--
-- Alleen toevoegen: geen DELETE, DROP of ALTER, en geen UPDATE op bestaande
-- vragen. De enige UPDATE zet theory_block_id op de topics van dit blok,
-- en alleen als die koppeling er nog niet staat. Twee keer draaien voegt
-- niets dubbel toe.
--
--   • 1 hoofdstuk, 3 topics, 3 clusters
--   • 24 vragen met elk 4 stappen (96 stappen)
-- =============================================================================

BEGIN;

-- 1. Hoofdstuk
INSERT INTO public.chapters (slug, title, book_part, order_index, site)
VALUES ('k', $ksql$K — Voortgezette integraalrekening$ksql$, 4, 12, 'integralen')
ON CONFLICT (slug) DO NOTHING;

-- 1b. Paragraaf en theorieblok
INSERT INTO public.paragraphs (chapter_id, site, slug, label, title, order_index)
SELECT c.id, 'integralen', 'k4', 'K.4', 'Breuksplitsen', 5
FROM public.chapters c
WHERE c.slug = 'k' AND c.site = 'integralen'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.theory_blocks (paragraph_id, site, slug, letter, title, order_index)
SELECT p.id, 'integralen', 'k4a', 'A', 'Staartdelingen', 1
FROM public.paragraphs p
WHERE p.slug = 'k4' AND p.site = 'integralen'
ON CONFLICT (slug) DO NOTHING;

-- 2. Topics
INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default, site, category)
SELECT v.slug, v.title, (SELECT id FROM public.chapters WHERE slug = 'k' AND site = 'integralen'), v.order_index, true, 'integralen', v.category
FROM (VALUES
  ('k4a_primitiveren', $ksql$Staartdelen en primitiveren$ksql$, 27, 'primitiveren'),
  ('k4a_bepaald', $ksql$Bepaalde integralen na een staartdeling$ksql$, 28, 'integralen'),
  ('k4a_toepassing', $ksql$Vlakdelen na een staartdeling$ksql$, 29, 'toepassingen')
) AS v(slug, title, order_index, category)
ON CONFLICT (slug) DO NOTHING;

-- 3. Clusters
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT t.id, v.slug, v.title, v.order_index, 'integralen'
FROM (VALUES
  ('k4a_primitiveren', 'k4a_staart', $ksql$Een breuk met een lineaire noemer delen$ksql$, 1),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bepaalde integralen na een staartdeling$ksql$, 1),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Oppervlakte, inhoud en de waarde van p$ksql$, 1)
) AS v(topic_slug, slug, title, order_index)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
ON CONFLICT (topic_id, slug) DO NOTHING;

-- 4. Vragen
INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, order_index, is_ai_generated, answer_alternatives)
SELECT 'integralen', t.id, cl.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, v.order_index, false, v.alternatives
FROM (VALUES
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{3x + 7}{x + 2}$$ksql$, $ksql$3x + ln(abs(x + 2)) + c$ksql$, $ksql$F(x) = 3x + \ln|x + 2| + c$ksql$, 1, 1, ARRAY[]::text[]),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{5x - 3}{x - 1}$$ksql$, $ksql$5x + 2ln(abs(x - 1)) + c$ksql$, $ksql$F(x) = 5x + 2\ln|x - 1| + c$ksql$, 1, 2, ARRAY[]::text[]),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{6x + 3}{3x - 1}$$ksql$, $ksql$2x + (5/3)ln(abs(3x - 1)) + c$ksql$, $ksql$F(x) = 2x + \tfrac{5}{3}\ln|3x - 1| + c$ksql$, 1, 3, ARRAY[]::text[]),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{2} + 5x}{x + 2}$$ksql$, $ksql$(1/2)x^2 + 3x - 6ln(abs(x + 2)) + c$ksql$, $ksql$F(x) = \tfrac{1}{2}x^{2} + 3x - 6\ln|x + 2| + c$ksql$, 2, 4, ARRAY[]::text[]),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{2x^{2} + x + 3}{x + 1}$$ksql$, $ksql$x^2 - x + 4ln(abs(x + 1)) + c$ksql$, $ksql$F(x) = x^{2} - x + 4\ln|x + 1| + c$ksql$, 2, 5, ARRAY[]::text[]),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{2} - 9}{x - 3}$$ksql$, $ksql$(1/2)x^2 + 3x + c$ksql$, $ksql$F(x) = \tfrac{1}{2}x^{2} + 3x + c$ksql$, 2, 6, ARRAY[]::text[]),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{3} + 2}{x - 1}$$ksql$, $ksql$(1/3)x^3 + (1/2)x^2 + x + 3ln(abs(x - 1)) + c$ksql$, $ksql$F(x) = \tfrac{1}{3}x^{3} + \tfrac{1}{2}x^{2} + x + 3\ln|x - 1| + c$ksql$, 3, 7, ARRAY[]::text[]),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{3} - x^{2} + 1}{x + 1}$$ksql$, $ksql$(1/3)x^3 - x^2 + 2x - ln(abs(x + 1)) + c$ksql$, $ksql$F(x) = \tfrac{1}{3}x^{3} - x^{2} + 2x - \ln|x + 1| + c$ksql$, 3, 8, ARRAY[]::text[]),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{3x + 7}{x + 2}\,\mathrm{d}x$$ksql$, $ksql$3 + ln(3/2)$ksql$, $ksql$3 + \ln\left(\tfrac{3}{2}\right)$ksql$, 1, 1, ARRAY[$ksql$3 + ln(3) - ln(2)$ksql$, $ksql$3 + ln(1,5)$ksql$]::text[]),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{2}^{4} \dfrac{5x - 3}{x - 1}\,\mathrm{d}x$$ksql$, $ksql$10 + 2ln(3)$ksql$, $ksql$10 + 2\ln(3)$ksql$, 1, 2, ARRAY[]::text[]),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{1}^{2} \dfrac{6x + 3}{3x - 1}\,\mathrm{d}x$$ksql$, $ksql$2 + (5/3)ln(5/2)$ksql$, $ksql$2 + \tfrac{5}{3}\ln\left(\tfrac{5}{2}\right)$ksql$, 1, 3, ARRAY[$ksql$2 + (5/3)ln(5) - (5/3)ln(2)$ksql$]::text[]),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{x^{2} + 5x}{x + 2}\,\mathrm{d}x$$ksql$, $ksql$8 - 6ln(2)$ksql$, $ksql$8 - 6\ln(2)$ksql$, 2, 4, ARRAY[]::text[]),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{2x^{2} + x + 3}{x + 1}\,\mathrm{d}x$$ksql$, $ksql$4ln(2)$ksql$, $ksql$4\ln(2)$ksql$, 2, 5, ARRAY[$ksql$ln(16)$ksql$, $ksql$ln(2^4)$ksql$]::text[]),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{2x^{2} + 8x + 3}{x + 4}\,\mathrm{d}x$$ksql$, $ksql$4 + 3ln(3/2)$ksql$, $ksql$4 + 3\ln\left(\tfrac{3}{2}\right)$ksql$, 2, 6, ARRAY[$ksql$4 + 3ln(3) - 3ln(2)$ksql$, $ksql$4 + 3ln(6) - 6ln(2)$ksql$]::text[]),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{2}^{3} \dfrac{x^{3} + 2}{x - 1}\,\mathrm{d}x$$ksql$, $ksql$59/6 + 3ln(2)$ksql$, $ksql$\tfrac{59}{6} + 3\ln(2)$ksql$, 3, 7, ARRAY[]::text[]),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{x^{3} - x^{2} + 1}{x + 1}\,\mathrm{d}x$$ksql$, $ksql$4/3 - ln(2)$ksql$, $ksql$\tfrac{4}{3} - \ln(2)$ksql$, 3, 8, ARRAY[]::text[]),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{4x + 2}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, $ksql$4 - 2ln(2)$ksql$, $ksql$4 - 2\ln(2)$ksql$, 1, 1, ARRAY[]::text[]),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{5x - 3}{x - 1}$, de $x$-as en de lijnen $x = 2$ en $x = 3$. Bereken exact de oppervlakte van $V$.$ksql$, $ksql$5 + 2ln(2)$ksql$, $ksql$5 + 2\ln(2)$ksql$, 1, 2, ARRAY[]::text[]),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{2} + 1}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, $ksql$2ln(2) - 1/2$ksql$, $ksql$2\ln(2) - \tfrac{1}{2}$ksql$, 2, 3, ARRAY[$ksql$2ln(2) - 0,5$ksql$, $ksql$ln(4) - 1/2$ksql$]::text[]),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{2} + 2x + 2}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, $ksql$3/2 + ln(2)$ksql$, $ksql$\tfrac{3}{2} + \ln(2)$ksql$, 2, 4, ARRAY[$ksql$1,5 + ln(2)$ksql$, $ksql$1 1/2 + ln(2)$ksql$]::text[]),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 3}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $2 + 2\ln(3)$.$ksql$, $ksql$p = 2$ksql$, $ksql$p = 2$ksql$, 2, 5, ARRAY[$ksql$2$ksql$]::text[]),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{2x^{2} + 8x + 3}{x + 4}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, $ksql$1 + 3ln(5) - 6ln(2)$ksql$, $ksql$1 + 3\ln(5) - 6\ln(2)$ksql$, 2, 6, ARRAY[$ksql$1 + 3ln(5/4)$ksql$, $ksql$1 + ln(125/64)$ksql$]::text[]),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{3} - x^{2} + 1}{x + 1}$, de $x$-as en de lijnen $x = 1$ en $x = 2$. Bereken exact de oppervlakte van $V$.$ksql$, $ksql$4/3 + ln(2/3)$ksql$, $ksql$\tfrac{4}{3} + \ln\left(\tfrac{2}{3}\right)$ksql$, 3, 7, ARRAY[$ksql$4/3 + ln(2) - ln(3)$ksql$]::text[]),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 4}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $1 + 3\ln(2)$.$ksql$, $ksql$p = 1$ksql$, $ksql$p = 1$ksql$, 3, 8, ARRAY[$ksql$1$ksql$]::text[])
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
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{3x + 7}{x + 2}$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{3x + 7}{x + 2}$$ksql$, 1, $ksql$Deel $3x + 7$ door $x + 2$. Omdat $3(x + 2) = 3x + 6$, blijft er $1$ over: $f(x) = 3 + \dfrac{1}{x + 2}$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{3x + 7}{x + 2}$$ksql$, 2, $ksql$Het getal $3$ geeft $3x$. De rest is de standaardvorm $\dfrac{1}{x}$: $\displaystyle\int \dfrac{1}{x + 2}\,\mathrm{d}x = \ln|x + 2|$. De noemer is al van de vorm $x + b$, dus je hoeft niet nog eens te delen.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{3x + 7}{x + 2}$$ksql$, 3, $ksql$Dus $F(x) = 3x + \ln|x + 2| + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{5x - 3}{x - 1}$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{5x - 3}{x - 1}$$ksql$, 1, $ksql$Deel $5x - 3$ door $x - 1$. Omdat $5(x - 1) = 5x - 5$, blijft er $2$ over: $f(x) = 5 + \dfrac{2}{x - 1}$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{5x - 3}{x - 1}$$ksql$, 2, $ksql$Het getal $5$ geeft $5x$. De rest: $\displaystyle\int \dfrac{2}{x - 1}\,\mathrm{d}x = 2\ln|x - 1|$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{5x - 3}{x - 1}$$ksql$, 3, $ksql$Dus $F(x) = 5x + 2\ln|x - 1| + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{6x + 3}{3x - 1}$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{6x + 3}{3x - 1}$$ksql$, 1, $ksql$Deel $6x + 3$ door $3x - 1$. Omdat $2(3x - 1) = 6x - 2$, blijft er $5$ over: $f(x) = 2 + \dfrac{5}{3x - 1}$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{6x + 3}{3x - 1}$$ksql$, 2, $ksql$Het getal $2$ geeft $2x$. Bij de rest staat in de noemer $3x - 1$, dus $a = 3$: primitiveer alsof er $x$ staat en deel daarna door $3$. $\displaystyle\int \dfrac{5}{3x - 1}\,\mathrm{d}x = \tfrac{5}{3}\ln|3x - 1|$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{6x + 3}{3x - 1}$$ksql$, 3, $ksql$Dus $F(x) = 2x + \tfrac{5}{3}\ln|3x - 1| + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{2} + 5x}{x + 2}$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{2} + 5x}{x + 2}$$ksql$, 1, $ksql$De teller is nu een kwadraat, dus het quotiënt is lineair. $(x + 2)(x + 3) = x^{2} + 5x + 6$, en de teller is $6$ kleiner: $f(x) = x + 3 - \dfrac{6}{x + 2}$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{2} + 5x}{x + 2}$$ksql$, 2, $ksql$$x + 3$ geeft $\tfrac{1}{2}x^{2} + 3x$. De rest geeft $-6\ln|x + 2|$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{2} + 5x}{x + 2}$$ksql$, 3, $ksql$Dus $F(x) = \tfrac{1}{2}x^{2} + 3x - 6\ln|x + 2| + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{2x^{2} + x + 3}{x + 1}$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{2x^{2} + x + 3}{x + 1}$$ksql$, 1, $ksql$$(x + 1)(2x - 1) = 2x^{2} + x - 1$. De teller is $4$ groter, dus $f(x) = 2x - 1 + \dfrac{4}{x + 1}$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{2x^{2} + x + 3}{x + 1}$$ksql$, 2, $ksql$$2x - 1$ geeft $x^{2} - x$. De rest geeft $4\ln|x + 1|$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{2x^{2} + x + 3}{x + 1}$$ksql$, 3, $ksql$Dus $F(x) = x^{2} - x + 4\ln|x + 1| + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{2} - 9}{x - 3}$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{2} - 9}{x - 3}$$ksql$, 1, $ksql$Dit is een merkwaardig product: $x^{2} - 9 = (x - 3)(x + 3)$. Voor $x \ne 3$ blijft er dus alleen $x + 3$ over. De rest is $0$; er komt geen logaritme.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{2} - 9}{x - 3}$$ksql$, 2, $ksql$Primitiveer $x + 3$: dat geeft $\tfrac{1}{2}x^{2} + 3x$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{2} - 9}{x - 3}$$ksql$, 3, $ksql$Dus $F(x) = \tfrac{1}{2}x^{2} + 3x + c$. De breuk zelf bestaat niet bij $x = 3$, maar de primitieve wel. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{3} + 2}{x - 1}$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{3} + 2}{x - 1}$$ksql$, 1, $ksql$De teller is een derdegraads, dus het quotiënt is een kwadraat. Deel $x^{3} + 0x^{2} + 0x + 2$ door $x - 1$: het quotiënt is $x^{2} + x + 1$ en de rest is $3$. Dus $f(x) = x^{2} + x + 1 + \dfrac{3}{x - 1}$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{3} + 2}{x - 1}$$ksql$, 2, $ksql$$x^{2} + x + 1$ geeft $\tfrac{1}{3}x^{3} + \tfrac{1}{2}x^{2} + x$. De rest geeft $3\ln|x - 1|$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{3} + 2}{x - 1}$$ksql$, 3, $ksql$Dus $F(x) = \tfrac{1}{3}x^{3} + \tfrac{1}{2}x^{2} + x + 3\ln|x - 1| + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{3} - x^{2} + 1}{x + 1}$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{3} - x^{2} + 1}{x + 1}$$ksql$, 1, $ksql$Deel $x^{3} - x^{2} + 0x + 1$ door $x + 1$. Het quotiënt is $x^{2} - 2x + 2$ en de rest is $-1$: $f(x) = x^{2} - 2x + 2 - \dfrac{1}{x + 1}$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{3} - x^{2} + 1}{x + 1}$$ksql$, 2, $ksql$$x^{2} - 2x + 2$ geeft $\tfrac{1}{3}x^{3} - x^{2} + 2x$. De rest geeft $-\ln|x + 1|$.$ksql$),
  ('k4a_primitiveren', 'k4a_staart', $ksql$Primitiveer: $f(x) = \dfrac{x^{3} - x^{2} + 1}{x + 1}$$ksql$, 3, $ksql$Dus $F(x) = \tfrac{1}{3}x^{3} - x^{2} + 2x - \ln|x + 1| + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{3x + 7}{x + 2}\,\mathrm{d}x$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{3x + 7}{x + 2}\,\mathrm{d}x$$ksql$, 1, $ksql$Deel eerst: $3(x + 2) = 3x + 6$, dus $\dfrac{3x + 7}{x + 2} = 3 + \dfrac{1}{x + 2}$. Op $[0, 1]$ is $x + 2$ positief, dus de absoluutstrepen mogen straks weg.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{3x + 7}{x + 2}\,\mathrm{d}x$$ksql$, 2, $ksql$Een primitieve is $F(x) = 3x + \ln(x + 2)$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{3x + 7}{x + 2}\,\mathrm{d}x$$ksql$, 3, $ksql$Vul de grenzen in: $F(1) - F(0) = \left(3 + \ln 3\right) - \ln 2 = 3 + \ln\left(\tfrac{3}{2}\right)$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{2}^{4} \dfrac{5x - 3}{x - 1}\,\mathrm{d}x$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{2}^{4} \dfrac{5x - 3}{x - 1}\,\mathrm{d}x$$ksql$, 1, $ksql$Deel eerst: $5(x - 1) = 5x - 5$, dus $\dfrac{5x - 3}{x - 1} = 5 + \dfrac{2}{x - 1}$. Op $[2, 4]$ is $x - 1$ positief.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{2}^{4} \dfrac{5x - 3}{x - 1}\,\mathrm{d}x$$ksql$, 2, $ksql$Een primitieve is $F(x) = 5x + 2\ln(x - 1)$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{2}^{4} \dfrac{5x - 3}{x - 1}\,\mathrm{d}x$$ksql$, 3, $ksql$$F(4) - F(2) = \left(20 + 2\ln 3\right) - \left(10 + 2\ln 1\right) = 10 + 2\ln 3$, want $\ln 1 = 0$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{1}^{2} \dfrac{6x + 3}{3x - 1}\,\mathrm{d}x$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{1}^{2} \dfrac{6x + 3}{3x - 1}\,\mathrm{d}x$$ksql$, 1, $ksql$Deel eerst: $2(3x - 1) = 6x - 2$, dus $\dfrac{6x + 3}{3x - 1} = 2 + \dfrac{5}{3x - 1}$. Op $[1, 2]$ is $3x - 1$ positief.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{1}^{2} \dfrac{6x + 3}{3x - 1}\,\mathrm{d}x$$ksql$, 2, $ksql$Deel bij de logaritme door $a = 3$: een primitieve is $F(x) = 2x + \tfrac{5}{3}\ln(3x - 1)$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{1}^{2} \dfrac{6x + 3}{3x - 1}\,\mathrm{d}x$$ksql$, 3, $ksql$$F(2) - F(1) = \left(4 + \tfrac{5}{3}\ln 5\right) - \left(2 + \tfrac{5}{3}\ln 2\right) = 2 + \tfrac{5}{3}\ln\left(\tfrac{5}{2}\right)$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{x^{2} + 5x}{x + 2}\,\mathrm{d}x$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{x^{2} + 5x}{x + 2}\,\mathrm{d}x$$ksql$, 1, $ksql$$(x + 2)(x + 3) = x^{2} + 5x + 6$, dus $\dfrac{x^{2} + 5x}{x + 2} = x + 3 - \dfrac{6}{x + 2}$. Op $[0, 2]$ is de noemer positief.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{x^{2} + 5x}{x + 2}\,\mathrm{d}x$$ksql$, 2, $ksql$Een primitieve is $F(x) = \tfrac{1}{2}x^{2} + 3x - 6\ln(x + 2)$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{x^{2} + 5x}{x + 2}\,\mathrm{d}x$$ksql$, 3, $ksql$$F(2) = 2 + 6 - 6\ln 4 = 8 - 12\ln 2$, want $\ln 4 = 2\ln 2$. $F(0) = -6\ln 2$. Het verschil is $8 - 12\ln 2 + 6\ln 2 = 8 - 6\ln 2$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{2x^{2} + x + 3}{x + 1}\,\mathrm{d}x$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{2x^{2} + x + 3}{x + 1}\,\mathrm{d}x$$ksql$, 1, $ksql$$(x + 1)(2x - 1) = 2x^{2} + x - 1$, dus $\dfrac{2x^{2} + x + 3}{x + 1} = 2x - 1 + \dfrac{4}{x + 1}$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{2x^{2} + x + 3}{x + 1}\,\mathrm{d}x$$ksql$, 2, $ksql$Een primitieve is $F(x) = x^{2} - x + 4\ln(x + 1)$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{2x^{2} + x + 3}{x + 1}\,\mathrm{d}x$$ksql$, 3, $ksql$$F(1) - F(0) = \left(1 - 1 + 4\ln 2\right) - 4\ln 1 = 4\ln 2$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{2x^{2} + 8x + 3}{x + 4}\,\mathrm{d}x$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{2x^{2} + 8x + 3}{x + 4}\,\mathrm{d}x$$ksql$, 1, $ksql$$(x + 4) \cdot 2x = 2x^{2} + 8x$, dus $\dfrac{2x^{2} + 8x + 3}{x + 4} = 2x + \dfrac{3}{x + 4}$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{2x^{2} + 8x + 3}{x + 4}\,\mathrm{d}x$$ksql$, 2, $ksql$Een primitieve is $F(x) = x^{2} + 3\ln(x + 4)$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{2x^{2} + 8x + 3}{x + 4}\,\mathrm{d}x$$ksql$, 3, $ksql$$F(2) - F(0) = \left(4 + 3\ln 6\right) - 3\ln 4$. Schrijf $\ln 6 = \ln 2 + \ln 3$ en $\ln 4 = 2\ln 2$: $4 + 3\ln 2 + 3\ln 3 - 6\ln 2 = 4 + 3\ln\left(\tfrac{3}{2}\right)$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{2}^{3} \dfrac{x^{3} + 2}{x - 1}\,\mathrm{d}x$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{2}^{3} \dfrac{x^{3} + 2}{x - 1}\,\mathrm{d}x$$ksql$, 1, $ksql$Deel $x^{3} + 2$ door $x - 1$: quotiënt $x^{2} + x + 1$, rest $3$. Dus de integrand is $x^{2} + x + 1 + \dfrac{3}{x - 1}$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{2}^{3} \dfrac{x^{3} + 2}{x - 1}\,\mathrm{d}x$$ksql$, 2, $ksql$Een primitieve is $F(x) = \tfrac{1}{3}x^{3} + \tfrac{1}{2}x^{2} + x + 3\ln(x - 1)$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{2}^{3} \dfrac{x^{3} + 2}{x - 1}\,\mathrm{d}x$$ksql$, 3, $ksql$$F(3) = 9 + \tfrac{9}{2} + 3 + 3\ln 2 = \tfrac{33}{2} + 3\ln 2$. $F(2) = \tfrac{8}{3} + 2 + 2 = \tfrac{20}{3}$. Het verschil is $\tfrac{33}{2} - \tfrac{20}{3} + 3\ln 2 = \tfrac{59}{6} + 3\ln 2$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{x^{3} - x^{2} + 1}{x + 1}\,\mathrm{d}x$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact. Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{x^{3} - x^{2} + 1}{x + 1}\,\mathrm{d}x$$ksql$, 1, $ksql$Deel door $x + 1$: quotiënt $x^{2} - 2x + 2$, rest $-1$. De integrand is $x^{2} - 2x + 2 - \dfrac{1}{x + 1}$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{x^{3} - x^{2} + 1}{x + 1}\,\mathrm{d}x$$ksql$, 2, $ksql$Een primitieve is $F(x) = \tfrac{1}{3}x^{3} - x^{2} + 2x - \ln(x + 1)$.$ksql$),
  ('k4a_bepaald', 'k4a_bepaald', $ksql$Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{x^{3} - x^{2} + 1}{x + 1}\,\mathrm{d}x$$ksql$, 3, $ksql$$F(1) - F(0) = \left(\tfrac{1}{3} - 1 + 2 - \ln 2\right) - 0 = \tfrac{1}{3} + 1 - \ln 2 = \tfrac{4}{3} - \ln 2$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{4x + 2}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 0, $ksql$Hier spelen alle drie de delen van de driedeling: eerst het verhaaltje vertalen naar een integraal (deel 1), dan die integraal berekenen (deel 2), en daarna nog iets doen met de uitkomst (deel 3). Deel 1: $O(V) = \displaystyle\int_{0}^{1} \dfrac{4x + 2}{x + 1}\,\mathrm{d}x$. Op $[0, 1]$ is $f$ positief, dus er hoeft geen minteken bij.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{4x + 2}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 1, $ksql$Deel: $4(x + 1) = 4x + 4$, dus $f(x) = 4 - \dfrac{2}{x + 1}$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{4x + 2}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 2, $ksql$Deel 2: een primitieve is $F(x) = 4x - 2\ln(x + 1)$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{4x + 2}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 3, $ksql$Deel 3: $F(1) - F(0) = \left(4 - 2\ln 2\right) - 0 = 4 - 2\ln 2$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{5x - 3}{x - 1}$, de $x$-as en de lijnen $x = 2$ en $x = 3$. Bereken exact de oppervlakte van $V$.$ksql$, 0, $ksql$Hier spelen alle drie de delen van de driedeling: eerst het verhaaltje vertalen naar een integraal (deel 1), dan die integraal berekenen (deel 2), en daarna nog iets doen met de uitkomst (deel 3). Deel 1: $O(V) = \displaystyle\int_{2}^{3} \dfrac{5x - 3}{x - 1}\,\mathrm{d}x$. Op $[2, 3]$ liggen teller en noemer allebei boven nul.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{5x - 3}{x - 1}$, de $x$-as en de lijnen $x = 2$ en $x = 3$. Bereken exact de oppervlakte van $V$.$ksql$, 1, $ksql$Deel: $5(x - 1) = 5x - 5$, dus $f(x) = 5 + \dfrac{2}{x - 1}$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{5x - 3}{x - 1}$, de $x$-as en de lijnen $x = 2$ en $x = 3$. Bereken exact de oppervlakte van $V$.$ksql$, 2, $ksql$Deel 2: een primitieve is $F(x) = 5x + 2\ln(x - 1)$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{5x - 3}{x - 1}$, de $x$-as en de lijnen $x = 2$ en $x = 3$. Bereken exact de oppervlakte van $V$.$ksql$, 3, $ksql$Deel 3: $F(3) - F(2) = \left(15 + 2\ln 2\right) - 10 = 5 + 2\ln 2$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{2} + 1}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 0, $ksql$Hier spelen alle drie de delen van de driedeling: eerst het verhaaltje vertalen naar een integraal (deel 1), dan die integraal berekenen (deel 2), en daarna nog iets doen met de uitkomst (deel 3). Deel 1: $O(V) = \displaystyle\int_{0}^{1} \dfrac{x^{2} + 1}{x + 1}\,\mathrm{d}x$. Teller en noemer zijn op $[0, 1]$ positief.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{2} + 1}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 1, $ksql$$(x + 1)(x - 1) = x^{2} - 1$, dus $x^{2} + 1 = (x + 1)(x - 1) + 2$ en $f(x) = x - 1 + \dfrac{2}{x + 1}$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{2} + 1}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 2, $ksql$Deel 2: een primitieve is $F(x) = \tfrac{1}{2}x^{2} - x + 2\ln(x + 1)$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{2} + 1}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 3, $ksql$Deel 3: $F(1) - F(0) = \left(\tfrac{1}{2} - 1 + 2\ln 2\right) - 0 = 2\ln 2 - \tfrac{1}{2}$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{2} + 2x + 2}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 0, $ksql$Hier spelen alle drie de delen van de driedeling: eerst het verhaaltje vertalen naar een integraal (deel 1), dan die integraal berekenen (deel 2), en daarna nog iets doen met de uitkomst (deel 3). Deel 1: $O(V) = \displaystyle\int_{0}^{1} \dfrac{x^{2} + 2x + 2}{x + 1}\,\mathrm{d}x$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{2} + 2x + 2}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 1, $ksql$$(x + 1)^{2} = x^{2} + 2x + 1$, dus de teller is $1$ groter: $f(x) = x + 1 + \dfrac{1}{x + 1}$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{2} + 2x + 2}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 2, $ksql$Deel 2: een primitieve is $F(x) = \tfrac{1}{2}x^{2} + x + \ln(x + 1)$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{2} + 2x + 2}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 3, $ksql$Deel 3: $F(1) - F(0) = \left(\tfrac{1}{2} + 1 + \ln 2\right) - 0 = \tfrac{3}{2} + \ln 2$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 3}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $2 + 2\ln(3)$.$ksql$, 0, $ksql$Hier spelen alle drie de delen van de driedeling: eerst het verhaaltje vertalen naar een integraal (deel 1), dan die integraal berekenen (deel 2), en daarna nog iets doen met de uitkomst (deel 3). Deel 1: $O(V_p) = \displaystyle\int_{0}^{p} \dfrac{x + 3}{x + 1}\,\mathrm{d}x$. Op $[0, p]$ is $f$ positief.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 3}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $2 + 2\ln(3)$.$ksql$, 1, $ksql$Deel: $(x + 1) + 2 = x + 3$, dus $f(x) = 1 + \dfrac{2}{x + 1}$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 3}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $2 + 2\ln(3)$.$ksql$, 2, $ksql$Deel 2: een primitieve is $F(x) = x + 2\ln(x + 1)$. Omdat $F(0) = 0$ is $O(V_p) = p + 2\ln(p + 1)$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 3}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $2 + 2\ln(3)$.$ksql$, 3, $ksql$Deel 3: los $p + 2\ln(p + 1) = 2 + 2\ln 3$ op. Probeer $p = 2$: links staat $2 + 2\ln 3$. Dat klopt, en $p > 0$. Dus $p = 2$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{2x^{2} + 8x + 3}{x + 4}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 0, $ksql$Hier spelen alle drie de delen van de driedeling: eerst het verhaaltje vertalen naar een integraal (deel 1), dan die integraal berekenen (deel 2), en daarna nog iets doen met de uitkomst (deel 3). Deel 1: $O(V) = \displaystyle\int_{0}^{1} \dfrac{2x^{2} + 8x + 3}{x + 4}\,\mathrm{d}x$. Teller en noemer zijn op $[0, 1]$ positief.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{2x^{2} + 8x + 3}{x + 4}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 1, $ksql$$(x + 4) \cdot 2x = 2x^{2} + 8x$, dus $f(x) = 2x + \dfrac{3}{x + 4}$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{2x^{2} + 8x + 3}{x + 4}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 2, $ksql$Deel 2: een primitieve is $F(x) = x^{2} + 3\ln(x + 4)$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{2x^{2} + 8x + 3}{x + 4}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.$ksql$, 3, $ksql$Deel 3: $F(1) - F(0) = \left(1 + 3\ln 5\right) - 3\ln 4 = 1 + 3\ln 5 - 6\ln 2$, want $\ln 4 = 2\ln 2$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{3} - x^{2} + 1}{x + 1}$, de $x$-as en de lijnen $x = 1$ en $x = 2$. Bereken exact de oppervlakte van $V$.$ksql$, 0, $ksql$Hier spelen alle drie de delen van de driedeling: eerst het verhaaltje vertalen naar een integraal (deel 1), dan die integraal berekenen (deel 2), en daarna nog iets doen met de uitkomst (deel 3). Deel 1: $O(V) = \displaystyle\int_{1}^{2} \dfrac{x^{3} - x^{2} + 1}{x + 1}\,\mathrm{d}x$. Op $[1, 2]$ zijn teller en noemer positief.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{3} - x^{2} + 1}{x + 1}$, de $x$-as en de lijnen $x = 1$ en $x = 2$. Bereken exact de oppervlakte van $V$.$ksql$, 1, $ksql$Deel $x^{3} - x^{2} + 1$ door $x + 1$: quotiënt $x^{2} - 2x + 2$, rest $-1$. Dus $f(x) = x^{2} - 2x + 2 - \dfrac{1}{x + 1}$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{3} - x^{2} + 1}{x + 1}$, de $x$-as en de lijnen $x = 1$ en $x = 2$. Bereken exact de oppervlakte van $V$.$ksql$, 2, $ksql$Deel 2: een primitieve is $F(x) = \tfrac{1}{3}x^{3} - x^{2} + 2x - \ln(x + 1)$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{3} - x^{2} + 1}{x + 1}$, de $x$-as en de lijnen $x = 1$ en $x = 2$. Bereken exact de oppervlakte van $V$.$ksql$, 3, $ksql$Deel 3: $F(2) = \tfrac{8}{3} - \ln 3$ en $F(1) = \tfrac{4}{3} - \ln 2$. Het verschil is $\tfrac{4}{3} - \ln 3 + \ln 2 = \tfrac{4}{3} + \ln\left(\tfrac{2}{3}\right)$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 4}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $1 + 3\ln(2)$.$ksql$, 0, $ksql$Hier spelen alle drie de delen van de driedeling: eerst het verhaaltje vertalen naar een integraal (deel 1), dan die integraal berekenen (deel 2), en daarna nog iets doen met de uitkomst (deel 3). Deel 1: $O(V_p) = \displaystyle\int_{0}^{p} \dfrac{x + 4}{x + 1}\,\mathrm{d}x$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 4}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $1 + 3\ln(2)$.$ksql$, 1, $ksql$Deel: $(x + 1) + 3 = x + 4$, dus $f(x) = 1 + \dfrac{3}{x + 1}$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 4}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $1 + 3\ln(2)$.$ksql$, 2, $ksql$Deel 2: een primitieve is $F(x) = x + 3\ln(x + 1)$. Omdat $F(0) = 0$ is $O(V_p) = p + 3\ln(p + 1)$.$ksql$),
  ('k4a_toepassing', 'k4a_oppervlakte', $ksql$Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 4}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $1 + 3\ln(2)$.$ksql$, 3, $ksql$Deel 3: los $p + 3\ln(p + 1) = 1 + 3\ln 2$ op. Probeer $p = 1$: links staat $1 + 3\ln 2$. Dat klopt, en $p > 0$. Dus $p = 1$.$ksql$)
) AS v(topic_slug, cluster_slug, latex_body, step_order, step_description)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new cl ON cl.slug = v.cluster_slug AND cl.topic_id = t.id
JOIN public.questions_new vr ON vr.latex_body = v.latex_body AND vr.cluster_id = cl.id
ON CONFLICT (question_id, step_order) DO NOTHING;

-- 6. Topics aan het theorieblok koppelen
-- Alleen de topics van dit blok, en alleen als de koppeling er nog niet staat.
UPDATE public.topics_new AS t
SET theory_block_id = b.id
FROM (VALUES
  ('k4a_primitiveren', 'k4a'),
  ('k4a_bepaald', 'k4a'),
  ('k4a_toepassing', 'k4a')
) AS v(topic_slug, block_slug)
JOIN public.theory_blocks b ON b.slug = v.block_slug AND b.site = 'integralen'
WHERE t.slug = v.topic_slug
  AND t.site = 'integralen'
  AND t.theory_block_id IS DISTINCT FROM b.id;

DO $blok$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.topics_new t
  JOIN public.theory_blocks b ON b.id = t.theory_block_id
  WHERE t.site = 'integralen'
    AND b.slug = 'k4a'
    AND t.slug IN ('k4a_primitiveren', 'k4a_bepaald', 'k4a_toepassing');
  IF n <> 3 THEN
    RAISE EXCEPTION 'Theorieblok k4a hoort 3 topics te hebben, gevonden %', n;
  END IF;
END $blok$;

-- 7. Controle
DO $do$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'k4a_staart' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'k4a_primitiveren' AND site = 'integralen'));
  IF n <> 8 THEN RAISE EXCEPTION 'Cluster k4a_staart hoort 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'k4a_bepaald' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'k4a_bepaald' AND site = 'integralen'));
  IF n <> 8 THEN RAISE EXCEPTION 'Cluster k4a_bepaald hoort 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'k4a_oppervlakte' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'k4a_toepassing' AND site = 'integralen'));
  IF n <> 8 THEN RAISE EXCEPTION 'Cluster k4a_oppervlakte hoort 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.question_steps_new s
  JOIN public.questions_new vr ON vr.id = s.question_id
  JOIN public.topics_new t ON t.id = vr.topic_id
  WHERE t.site = 'integralen' AND t.slug IN ('k4a_primitiveren', 'k4a_bepaald', 'k4a_toepassing');
  IF n <> 96 THEN RAISE EXCEPTION 'Deze topics horen samen 96 stappen te hebben, gevonden %', n; END IF;
END $do$;

COMMIT;
