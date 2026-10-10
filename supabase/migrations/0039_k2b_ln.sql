-- =============================================================================
-- Migration 0039: K.2 Theorie B — Herhaald partieel integreren met een macht van ln
-- =============================================================================
-- Gegenereerd door scripts/k2b-ln-content.ts — niet met de hand bewerken.
--
-- Aanvulling op migratie 0038. Die dekt de twee gedaanten waarin een factor
-- vanzelf eenvoudiger wordt (een veelterm van graad 2) of waarin de integraal
-- terugkomt (e-macht maal gonio). Dit is de derde: een macht van ln(x), waar je
-- zelf een product maakt door h'(x) = 1 te kiezen en de macht van de logaritme
-- per ronde één zakt.
--
-- Eigen topic en eigen clusters, zodat de controle aan het eind van 0038 blijft
-- kloppen en die migratie herhaalbaar blijft.
--
-- Eigen oefenvragen, geen boekopgaven. Elke primitieve wordt nagerekend door
-- src/content/primitieven.test.ts (content/hoofdstuk-k/k2b-ln.json).
--
-- Alleen toevoegen: geen DELETE, DROP, ALTER of UPDATE. Twee keer draaien
-- voegt niets dubbel toe.
--
--   • 1 hoofdstuk, 1 topics, 2 clusters
--   • 12 vragen met elk 4 stappen (48 stappen)
-- =============================================================================

BEGIN;

-- 1. Hoofdstuk
INSERT INTO public.chapters (slug, title, book_part, order_index, site)
VALUES ('k', $ksql$K — Voortgezette integraalrekening$ksql$, 4, 12, 'integralen')
ON CONFLICT (slug) DO NOTHING;

-- 2. Topics
INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default, site, category)
SELECT v.slug, v.title, (SELECT id FROM public.chapters WHERE slug = 'k' AND site = 'integralen'), v.order_index, true, 'integralen', v.category
FROM (VALUES
  ('k2b_logaritme', $ksql$Herhaald partieel integreren met een macht van ln$ksql$, 16, 'primitiveren')
) AS v(slug, title, order_index, category)
ON CONFLICT (slug) DO NOTHING;

-- 3. Clusters
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT t.id, v.slug, v.title, v.order_index, 'integralen'
FROM (VALUES
  ('k2b_logaritme', 'k2b_ln', $ksql$Een macht van ln primitiveren$ksql$, 1),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bepaalde integralen en oppervlakte met een macht van ln$ksql$, 2)
) AS v(topic_slug, slug, title, order_index)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
ON CONFLICT (topic_id, slug) DO NOTHING;

-- 4. Vragen
INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, order_index, is_ai_generated, answer_alternatives)
SELECT 'integralen', t.id, cl.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, v.order_index, false, v.alternatives
FROM (VALUES
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{2}(x)$$ksql$, $ksql$x ln^2(x) - 2x ln(x) + 2x + c$ksql$, $ksql$F(x) = x\ln^{2}(x) - 2x\ln(x) + 2x + c$ksql$, 1, 1, ARRAY[$ksql$x ln(x)^2 - 2x ln(x) + 2x + c$ksql$, $ksql$x (ln(x)^2 - 2ln(x) + 2) + c$ksql$]::text[]),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = x\ln^{2}(x)$$ksql$, $ksql$1/2 x^2 ln^2(x) - 1/2 x^2 ln(x) + 1/4 x^2 + c$ksql$, $ksql$F(x) = \tfrac{1}{2}x^{2}\ln^{2}(x) - \tfrac{1}{2}x^{2}\ln(x) + \tfrac{1}{4}x^{2} + c$ksql$, 1, 2, ARRAY[$ksql$1/2 x^2 ln(x)^2 - 1/2 x^2 ln(x) + 1/4 x^2 + c$ksql$, $ksql$x^2 (2ln(x)^2 - 2ln(x) + 1)/4 + c$ksql$, $ksql$x^2 ln(x)^2/2 - x^2 ln(x)/2 + x^2/4 + c$ksql$]::text[]),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = x^{2}\ln^{2}(x)$$ksql$, $ksql$1/3 x^3 ln^2(x) - 2/9 x^3 ln(x) + 2/27 x^3 + c$ksql$, $ksql$F(x) = \tfrac{1}{3}x^{3}\ln^{2}(x) - \tfrac{2}{9}x^{3}\ln(x) + \tfrac{2}{27}x^{3} + c$ksql$, 2, 3, ARRAY[$ksql$1/3 x^3 ln(x)^2 - 2/9 x^3 ln(x) + 2/27 x^3 + c$ksql$, $ksql$x^3 (9ln(x)^2 - 6ln(x) + 2)/27 + c$ksql$]::text[]),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \dfrac{\ln^{2}(x)}{x^{2}}$$ksql$, $ksql$-(ln^2(x) + 2ln(x) + 2)/x + c$ksql$, $ksql$F(x) = -\dfrac{\ln^{2}(x) + 2\ln(x) + 2}{x} + c$ksql$, 2, 4, ARRAY[$ksql$-(ln(x)^2 + 2ln(x) + 2)/x + c$ksql$, $ksql$-ln(x)^2/x - 2ln(x)/x - 2/x + c$ksql$]::text[]),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{2}(2x)$$ksql$, $ksql$x ln^2(2x) - 2x ln(2x) + 2x + c$ksql$, $ksql$F(x) = x\ln^{2}(2x) - 2x\ln(2x) + 2x + c$ksql$, 3, 5, ARRAY[$ksql$x ln(2x)^2 - 2x ln(2x) + 2x + c$ksql$, $ksql$x (ln(2x)^2 - 2ln(2x) + 2) + c$ksql$]::text[]),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{3}(x)$$ksql$, $ksql$x ln^3(x) - 3x ln^2(x) + 6x ln(x) - 6x + c$ksql$, $ksql$F(x) = x\ln^{3}(x) - 3x\ln^{2}(x) + 6x\ln(x) - 6x + c$ksql$, 3, 6, ARRAY[$ksql$x ln(x)^3 - 3x ln(x)^2 + 6x ln(x) - 6x + c$ksql$, $ksql$x (ln(x)^3 - 3ln(x)^2 + 6ln(x) - 6) + c$ksql$]::text[]),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} \ln^{2}(x)\,\mathrm{d}x$$ksql$, $ksql$e - 2$ksql$, $ksql$\mathrm{e} - 2$ksql$, 1, 1, ARRAY[$ksql$-2 + e$ksql$]::text[]),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{2}} \ln^{2}(x)\,\mathrm{d}x$$ksql$, $ksql$2e^2 - 2$ksql$, $ksql$2\mathrm{e}^{2} - 2$ksql$, 1, 2, ARRAY[$ksql$2(e^2 - 1)$ksql$, $ksql$-2 + 2e^2$ksql$]::text[]),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} x^{2}\ln^{2}(x)\,\mathrm{d}x$$ksql$, $ksql$(5e^3 - 2)/27$ksql$, $ksql$\dfrac{5\mathrm{e}^{3} - 2}{27}$ksql$, 2, 3, ARRAY[$ksql$5e^3/27 - 2/27$ksql$]::text[]),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{3}} \dfrac{\ln^{2}(x)}{x^{2}}\,\mathrm{d}x$$ksql$, $ksql$2 - 17/e^3$ksql$, $ksql$2 - \dfrac{17}{\mathrm{e}^{3}}$ksql$, 2, 4, ARRAY[$ksql$-17e^(-3) + 2$ksql$, $ksql$2 - 17e^(-3)$ksql$]::text[]),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln^{3}(x)$, de $x$-as en de lijn $x = \mathrm{e}$. Bereken exact de oppervlakte van $V$.$ksql$, $ksql$6 - 2e$ksql$, $ksql$6 - 2\mathrm{e}$ksql$, 3, 5, ARRAY[$ksql$-2e + 6$ksql$]::text[]),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln^{2}(x) - 1$ en de $x$-as. Bereken exact de oppervlakte van $V$.$ksql$, $ksql$4/e$ksql$, $ksql$\dfrac{4}{\mathrm{e}}$ksql$, 3, 6, ARRAY[$ksql$4e^(-1)$ksql$]::text[])
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
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{2}(x)$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een macht van $\ln(x)$ → partieel integreren. Een logaritme kun je niet zomaar primitiveren, maar wél differentiëren, dus zet hem op de plek van $g$. Differentiëren haalt de macht van de logaritme per ronde één omlaag: van $\ln^{2}$ naar $\ln^{1}$ naar $\ln^{0}$ zijn dat twee rondes.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{2}(x)$$ksql$, 1, $ksql$Er staat maar één factor, dus maak er zelf een product van: $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln^{2}(x)$, dus $g'(x) = \dfrac{2\ln(x)}{x}$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{2}(x)$$ksql$, 2, $ksql$Vul de regel in: $\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$. Dat geeft $\int \ln^{2}(x)\,\mathrm{d}x = x\ln^{2}(x) - \int x \cdot \dfrac{2\ln(x)}{x}\,\mathrm{d}x = x\ln^{2}(x) - 2\int \ln(x)\,\mathrm{d}x$. De $x$ valt weg tegen de $x$ in de noemer en de macht van de logaritme is één gezakt, maar er staat nog een logaritme: nog een ronde.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{2}(x)$$ksql$, 3, $ksql$Tweede ronde op $\int \ln(x)\,\mathrm{d}x$, weer met $h'(x) = 1$ en $g(x) = \ln(x)$: $\int \ln(x)\,\mathrm{d}x = x\ln(x) - \int x \cdot \dfrac{1}{x}\,\mathrm{d}x = x\ln(x) - x$. Samen: $F(x) = x\ln^{2}(x) - 2x\ln(x) + 2x + c$. Controle: differentiëren geeft $\ln^{2}(x) + 2\ln(x) - 2\ln(x) - 2 + 2 = \ln^{2}(x)$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = x\ln^{2}(x)$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een macht van $x$ maal een macht van $\ln(x)$ → partieel integreren. De macht van $x$ is makkelijk te primitiveren, dus die wordt $h'$; de logaritme zet je op de plek van $g$, want differentiëren haalt zijn macht per ronde één omlaag.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = x\ln^{2}(x)$$ksql$, 1, $ksql$Kies $h'(x) = x$, dus $h(x) = \tfrac{1}{2}x^{2}$, en $g(x) = \ln^{2}(x)$, dus $g'(x) = \dfrac{2\ln(x)}{x}$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = x\ln^{2}(x)$$ksql$, 2, $ksql$Vul de regel in: $\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$. Dat geeft $\int x\ln^{2}(x)\,\mathrm{d}x = \tfrac{1}{2}x^{2}\ln^{2}(x) - \int \tfrac{1}{2}x^{2} \cdot \dfrac{2\ln(x)}{x}\,\mathrm{d}x = \tfrac{1}{2}x^{2}\ln^{2}(x) - \int x\ln(x)\,\mathrm{d}x$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = x\ln^{2}(x)$$ksql$, 3, $ksql$Tweede ronde op $\int x\ln(x)\,\mathrm{d}x$, weer met $h'(x) = x$: $\int x\ln(x)\,\mathrm{d}x = \tfrac{1}{2}x^{2}\ln(x) - \int \tfrac{1}{2}x\,\mathrm{d}x = \tfrac{1}{2}x^{2}\ln(x) - \tfrac{1}{4}x^{2}$. Samen: $F(x) = \tfrac{1}{2}x^{2}\ln^{2}(x) - \tfrac{1}{2}x^{2}\ln(x) + \tfrac{1}{4}x^{2} + c$. Controle: differentiëren geeft $x\ln^{2}(x) + x\ln(x) - x\ln(x) - \tfrac{1}{2}x + \tfrac{1}{2}x = x\ln^{2}(x)$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = x^{2}\ln^{2}(x)$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een macht van $x$ maal een macht van $\ln(x)$ → partieel integreren. De macht van $x$ is makkelijk te primitiveren, dus die wordt $h'$; de logaritme zet je op de plek van $g$, want differentiëren haalt zijn macht per ronde één omlaag.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = x^{2}\ln^{2}(x)$$ksql$, 1, $ksql$Kies $h'(x) = x^{2}$, dus $h(x) = \tfrac{1}{3}x^{3}$, en $g(x) = \ln^{2}(x)$, dus $g'(x) = \dfrac{2\ln(x)}{x}$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = x^{2}\ln^{2}(x)$$ksql$, 2, $ksql$Vul de regel in: $\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$. Dat geeft $\int x^{2}\ln^{2}(x)\,\mathrm{d}x = \tfrac{1}{3}x^{3}\ln^{2}(x) - \int \tfrac{1}{3}x^{3} \cdot \dfrac{2\ln(x)}{x}\,\mathrm{d}x = \tfrac{1}{3}x^{3}\ln^{2}(x) - \tfrac{2}{3}\int x^{2}\ln(x)\,\mathrm{d}x$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = x^{2}\ln^{2}(x)$$ksql$, 3, $ksql$Tweede ronde op $\int x^{2}\ln(x)\,\mathrm{d}x = \tfrac{1}{3}x^{3}\ln(x) - \int \tfrac{1}{3}x^{2}\,\mathrm{d}x = \tfrac{1}{3}x^{3}\ln(x) - \tfrac{1}{9}x^{3}$. Die $\tfrac{2}{3}$ ervoor geeft $F(x) = \tfrac{1}{3}x^{3}\ln^{2}(x) - \tfrac{2}{9}x^{3}\ln(x) + \tfrac{2}{27}x^{3} + c$. Controle: differentiëren geeft $x^{2}\ln^{2}(x) + \tfrac{2}{3}x^{2}\ln(x) - \tfrac{2}{3}x^{2}\ln(x) - \tfrac{2}{9}x^{2} + \tfrac{2}{9}x^{2} = x^{2}\ln^{2}(x)$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \dfrac{\ln^{2}(x)}{x^{2}}$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een macht van $x$ maal een macht van $\ln(x)$ → partieel integreren. De macht van $x$ is makkelijk te primitiveren, dus die wordt $h'$; de logaritme zet je op de plek van $g$, want differentiëren haalt zijn macht per ronde één omlaag.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \dfrac{\ln^{2}(x)}{x^{2}}$$ksql$, 1, $ksql$Schrijf de breuk als $x^{-2}\ln^{2}(x)$. Kies $h'(x) = x^{-2}$, dus $h(x) = -\dfrac{1}{x}$, en $g(x) = \ln^{2}(x)$, dus $g'(x) = \dfrac{2\ln(x)}{x}$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \dfrac{\ln^{2}(x)}{x^{2}}$$ksql$, 2, $ksql$Vul de regel in: $\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$. Dat geeft $\int \dfrac{\ln^{2}(x)}{x^{2}}\,\mathrm{d}x = -\dfrac{\ln^{2}(x)}{x} + \int \dfrac{1}{x} \cdot \dfrac{2\ln(x)}{x}\,\mathrm{d}x = -\dfrac{\ln^{2}(x)}{x} + 2\int \dfrac{\ln(x)}{x^{2}}\,\mathrm{d}x$. Let op het plusteken: twee mintekens tegen elkaar.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \dfrac{\ln^{2}(x)}{x^{2}}$$ksql$, 3, $ksql$Tweede ronde op $\int \dfrac{\ln(x)}{x^{2}}\,\mathrm{d}x = -\dfrac{\ln(x)}{x} + \int \dfrac{1}{x^{2}}\,\mathrm{d}x = -\dfrac{\ln(x)}{x} - \dfrac{1}{x}$. Samen: $F(x) = -\dfrac{\ln^{2}(x)}{x} - \dfrac{2\ln(x)}{x} - \dfrac{2}{x} + c = -\dfrac{\ln^{2}(x) + 2\ln(x) + 2}{x} + c$. Controle: differentiëren geeft $\dfrac{\ln^{2}(x) + 2\ln(x) + 2}{x^{2}} - \dfrac{2\ln(x) + 2}{x^{2}} = \dfrac{\ln^{2}(x)}{x^{2}}$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{2}(2x)$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een macht van $\ln(x)$ → partieel integreren. Een logaritme kun je niet zomaar primitiveren, maar wél differentiëren, dus zet hem op de plek van $g$. Differentiëren haalt de macht van de logaritme per ronde één omlaag: van $\ln^{2}$ naar $\ln^{1}$ naar $\ln^{0}$ zijn dat twee rondes.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{2}(2x)$$ksql$, 1, $ksql$Weer $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln^{2}(2x)$. Voor $g'$ heb je de kettingregel nodig: de kern is $\ln(2x)$, en $\dfrac{\mathrm{d}}{\mathrm{d}x}\ln(2x) = \dfrac{2}{2x} = \dfrac{1}{x}$. Dus $g'(x) = \dfrac{2\ln(2x)}{x}$ — net als bij $\ln^{2}(x)$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{2}(2x)$$ksql$, 2, $ksql$Vul de regel in: $\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$. Dat geeft $\int \ln^{2}(2x)\,\mathrm{d}x = x\ln^{2}(2x) - \int x \cdot \dfrac{2\ln(2x)}{x}\,\mathrm{d}x = x\ln^{2}(2x) - 2\int \ln(2x)\,\mathrm{d}x$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{2}(2x)$$ksql$, 3, $ksql$Tweede ronde op $\int \ln(2x)\,\mathrm{d}x = x\ln(2x) - \int x \cdot \dfrac{1}{x}\,\mathrm{d}x = x\ln(2x) - x$. Samen: $F(x) = x\ln^{2}(2x) - 2x\ln(2x) + 2x + c$. Controle: differentiëren geeft $\ln^{2}(2x) + 2\ln(2x) - 2\ln(2x) - 2 + 2 = \ln^{2}(2x)$.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{3}(x)$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Buitenste schil: een macht van $\ln(x)$ → partieel integreren. Een logaritme kun je niet zomaar primitiveren, maar wél differentiëren, dus zet hem op de plek van $g$. Differentiëren haalt de macht van de logaritme per ronde één omlaag: van $\ln^{2}$ naar $\ln^{1}$ naar $\ln^{0}$ zijn dat twee rondes.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{3}(x)$$ksql$, 1, $ksql$Weer $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln^{3}(x)$, dus $g'(x) = \dfrac{3\ln^{2}(x)}{x}$. De macht is nu 3, dus je hebt drie rondes nodig in plaats van twee.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{3}(x)$$ksql$, 2, $ksql$Vul de regel in: $\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$. Dat geeft $\int \ln^{3}(x)\,\mathrm{d}x = x\ln^{3}(x) - 3\int \ln^{2}(x)\,\mathrm{d}x$. Die overgebleven integraal ken je al.$ksql$),
  ('k2b_logaritme', 'k2b_ln', $ksql$Primitiveer: $f(x) = \ln^{3}(x)$$ksql$, 3, $ksql$Uit de eerste opgave van dit cluster: $\int \ln^{2}(x)\,\mathrm{d}x = x\ln^{2}(x) - 2x\ln(x) + 2x$. Invullen geeft $F(x) = x\ln^{3}(x) - 3\left(x\ln^{2}(x) - 2x\ln(x) + 2x\right) + c = x\ln^{3}(x) - 3x\ln^{2}(x) + 6x\ln(x) - 6x + c$. Controle: differentiëren geeft $\ln^{3}(x) + 3\ln^{2}(x) - 3\ln^{2}(x) - 6\ln(x) + 6\ln(x) + 6 - 6 = \ln^{3}(x)$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} \ln^{2}(x)\,\mathrm{d}x$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Het is een bepaalde integraal, dus eerst primitiveren en daarna de grenzen invullen. Buitenste schil: een macht van $\ln(x)$ → partieel integreren. Een logaritme kun je niet zomaar primitiveren, maar wél differentiëren, dus zet hem op de plek van $g$. Differentiëren haalt de macht van de logaritme per ronde één omlaag: van $\ln^{2}$ naar $\ln^{1}$ naar $\ln^{0}$ zijn dat twee rondes.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} \ln^{2}(x)\,\mathrm{d}x$$ksql$, 1, $ksql$Maak er een product van met $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln^{2}(x)$, dus $g'(x) = \dfrac{2\ln(x)}{x}$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} \ln^{2}(x)\,\mathrm{d}x$$ksql$, 2, $ksql$Eerste ronde: $\int \ln^{2}(x)\,\mathrm{d}x = x\ln^{2}(x) - 2\int \ln(x)\,\mathrm{d}x$. Tweede ronde: $\int \ln(x)\,\mathrm{d}x = x\ln(x) - x$. De primitieve is dus $F(x) = x\ln^{2}(x) - 2x\ln(x) + 2x$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} \ln^{2}(x)\,\mathrm{d}x$$ksql$, 3, $ksql$Vul de grenzen in. Met $\ln(\mathrm{e}) = 1$ is $F(\mathrm{e}) = \mathrm{e} - 2\mathrm{e} + 2\mathrm{e} = \mathrm{e}$, en met $\ln(1) = 0$ is $F(1) = 0 - 0 + 2 = 2$. De integraal is $\mathrm{e} - 2$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{2}} \ln^{2}(x)\,\mathrm{d}x$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Het is een bepaalde integraal, dus eerst primitiveren en daarna de grenzen invullen. Buitenste schil: een macht van $\ln(x)$ → partieel integreren. Een logaritme kun je niet zomaar primitiveren, maar wél differentiëren, dus zet hem op de plek van $g$. Differentiëren haalt de macht van de logaritme per ronde één omlaag: van $\ln^{2}$ naar $\ln^{1}$ naar $\ln^{0}$ zijn dat twee rondes.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{2}} \ln^{2}(x)\,\mathrm{d}x$$ksql$, 1, $ksql$Dezelfde primitieve als bij de vorige opgave; alleen de bovengrens verandert. Kies $h'(x) = 1$ en $g(x) = \ln^{2}(x)$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{2}} \ln^{2}(x)\,\mathrm{d}x$$ksql$, 2, $ksql$Twee rondes geven $F(x) = x\ln^{2}(x) - 2x\ln(x) + 2x$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{2}} \ln^{2}(x)\,\mathrm{d}x$$ksql$, 3, $ksql$Vul de grenzen in. Nu is $\ln\left(\mathrm{e}^{2}\right) = 2$, dus $F\left(\mathrm{e}^{2}\right) = 4\mathrm{e}^{2} - 4\mathrm{e}^{2} + 2\mathrm{e}^{2} = 2\mathrm{e}^{2}$. En $F(1) = 2$. De integraal is $2\mathrm{e}^{2} - 2$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} x^{2}\ln^{2}(x)\,\mathrm{d}x$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Het is een bepaalde integraal, dus eerst primitiveren en daarna de grenzen invullen. Buitenste schil: een macht van $x$ maal een macht van $\ln(x)$ → partieel integreren. De macht van $x$ is makkelijk te primitiveren, dus die wordt $h'$; de logaritme zet je op de plek van $g$, want differentiëren haalt zijn macht per ronde één omlaag.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} x^{2}\ln^{2}(x)\,\mathrm{d}x$$ksql$, 1, $ksql$Kies $h'(x) = x^{2}$, dus $h(x) = \tfrac{1}{3}x^{3}$, en $g(x) = \ln^{2}(x)$, dus $g'(x) = \dfrac{2\ln(x)}{x}$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} x^{2}\ln^{2}(x)\,\mathrm{d}x$$ksql$, 2, $ksql$Eerste ronde geeft $\tfrac{1}{3}x^{3}\ln^{2}(x) - \tfrac{2}{3}\int x^{2}\ln(x)\,\mathrm{d}x$, en de tweede ronde $\int x^{2}\ln(x)\,\mathrm{d}x = \tfrac{1}{3}x^{3}\ln(x) - \tfrac{1}{9}x^{3}$. Dus $F(x) = \tfrac{1}{3}x^{3}\ln^{2}(x) - \tfrac{2}{9}x^{3}\ln(x) + \tfrac{2}{27}x^{3}$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} x^{2}\ln^{2}(x)\,\mathrm{d}x$$ksql$, 3, $ksql$Vul de grenzen in: $F(\mathrm{e}) = \tfrac{1}{3}\mathrm{e}^{3} - \tfrac{2}{9}\mathrm{e}^{3} + \tfrac{2}{27}\mathrm{e}^{3} = \tfrac{9 - 6 + 2}{27}\mathrm{e}^{3} = \tfrac{5}{27}\mathrm{e}^{3}$ en $F(1) = \tfrac{2}{27}$. De integraal is $\dfrac{5\mathrm{e}^{3} - 2}{27}$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{3}} \dfrac{\ln^{2}(x)}{x^{2}}\,\mathrm{d}x$$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Het is een bepaalde integraal, dus eerst primitiveren en daarna de grenzen invullen. Buitenste schil: een macht van $x$ maal een macht van $\ln(x)$ → partieel integreren. De macht van $x$ is makkelijk te primitiveren, dus die wordt $h'$; de logaritme zet je op de plek van $g$, want differentiëren haalt zijn macht per ronde één omlaag.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{3}} \dfrac{\ln^{2}(x)}{x^{2}}\,\mathrm{d}x$$ksql$, 1, $ksql$Schrijf de breuk als $x^{-2}\ln^{2}(x)$ en kies $h'(x) = x^{-2}$, dus $h(x) = -\dfrac{1}{x}$, en $g(x) = \ln^{2}(x)$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{3}} \dfrac{\ln^{2}(x)}{x^{2}}\,\mathrm{d}x$$ksql$, 2, $ksql$Twee rondes geven $F(x) = -\dfrac{\ln^{2}(x) + 2\ln(x) + 2}{x}$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{3}} \dfrac{\ln^{2}(x)}{x^{2}}\,\mathrm{d}x$$ksql$, 3, $ksql$Vul de grenzen in. Met $\ln\left(\mathrm{e}^{3}\right) = 3$ is $F\left(\mathrm{e}^{3}\right) = -\dfrac{9 + 6 + 2}{\mathrm{e}^{3}} = -\dfrac{17}{\mathrm{e}^{3}}$, en $F(1) = -\dfrac{0 + 0 + 2}{1} = -2$. De integraal is $-\dfrac{17}{\mathrm{e}^{3}} + 2 = 2 - \dfrac{17}{\mathrm{e}^{3}}$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln^{3}(x)$, de $x$-as en de lijn $x = \mathrm{e}$. Bereken exact de oppervlakte van $V$.$ksql$, 0, $ksql$Deel 1 van de driedeling: $\ln^{3}(x) = 0$ als $\ln(x) = 0$, dus de grafiek snijdt de $x$-as bij $x = 1$. Tussen $x = 1$ en $x = \mathrm{e}$ is $\ln(x) > 0$, dus ook $\ln^{3}(x) > 0$ en ligt de grafiek boven de $x$-as. De oppervlakte is $\displaystyle\int_{1}^{\mathrm{e}} \ln^{3}(x)\,\mathrm{d}x$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln^{3}(x)$, de $x$-as en de lijn $x = \mathrm{e}$. Bereken exact de oppervlakte van $V$.$ksql$, 1, $ksql$Deel 2: een macht van $\ln(x)$ → partieel integreren met $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln^{3}(x)$, dus $g'(x) = \dfrac{3\ln^{2}(x)}{x}$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln^{3}(x)$, de $x$-as en de lijn $x = \mathrm{e}$. Bereken exact de oppervlakte van $V$.$ksql$, 2, $ksql$Eerste ronde: $\int \ln^{3}(x)\,\mathrm{d}x = x\ln^{3}(x) - 3\int \ln^{2}(x)\,\mathrm{d}x$. Daarna nog twee rondes voor $\int \ln^{2}(x)\,\mathrm{d}x = x\ln^{2}(x) - 2x\ln(x) + 2x$. Samen: $F(x) = x\ln^{3}(x) - 3x\ln^{2}(x) + 6x\ln(x) - 6x$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln^{3}(x)$, de $x$-as en de lijn $x = \mathrm{e}$. Bereken exact de oppervlakte van $V$.$ksql$, 3, $ksql$Vul de grenzen in: $F(\mathrm{e}) = \mathrm{e} - 3\mathrm{e} + 6\mathrm{e} - 6\mathrm{e} = -2\mathrm{e}$ en $F(1) = 0 - 0 + 0 - 6 = -6$. De oppervlakte is $-2\mathrm{e} - (-6) = 6 - 2\mathrm{e}$. Dat is positief, want $\mathrm{e} < 3$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln^{2}(x) - 1$ en de $x$-as. Bereken exact de oppervlakte van $V$.$ksql$, 0, $ksql$Deel 1 van de driedeling: zoek eerst de snijpunten met de $x$-as. Uit $\ln^{2}(x) = 1$ volgt $\ln(x) = 1$ of $\ln(x) = -1$, dus $x = \mathrm{e}$ en $x = \dfrac{1}{\mathrm{e}}$. Daartussen is $\left|\ln(x)\right| < 1$, dus $\ln^{2}(x) - 1 < 0$ en ligt de grafiek ónder de $x$-as. De oppervlakte is $-\displaystyle\int_{\frac{1}{\mathrm{e}}}^{\mathrm{e}} \left(\ln^{2}(x) - 1\right)\mathrm{d}x$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln^{2}(x) - 1$ en de $x$-as. Bereken exact de oppervlakte van $V$.$ksql$, 1, $ksql$Deel 2: splits de integraal. De $-1$ primitiveer je zo tot $-x$; voor $\int \ln^{2}(x)\,\mathrm{d}x$ ga je twee keer partieel integreren met $h'(x) = 1$ en $g(x) = \ln^{2}(x)$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln^{2}(x) - 1$ en de $x$-as. Bereken exact de oppervlakte van $V$.$ksql$, 2, $ksql$Twee rondes geven $\int \ln^{2}(x)\,\mathrm{d}x = x\ln^{2}(x) - 2x\ln(x) + 2x$. Met de $-x$ erbij: $F(x) = x\ln^{2}(x) - 2x\ln(x) + 2x - x = x\ln^{2}(x) - 2x\ln(x) + x$.$ksql$),
  ('k2b_logaritme', 'k2b_bepaald_ln', $ksql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln^{2}(x) - 1$ en de $x$-as. Bereken exact de oppervlakte van $V$.$ksql$, 3, $ksql$Vul de grenzen in: $F(\mathrm{e}) = \mathrm{e} - 2\mathrm{e} + \mathrm{e} = 0$ en $F\left(\tfrac{1}{\mathrm{e}}\right) = \tfrac{1}{\mathrm{e}} + \tfrac{2}{\mathrm{e}} + \tfrac{1}{\mathrm{e}} = \dfrac{4}{\mathrm{e}}$ (let op: $\ln\left(\tfrac{1}{\mathrm{e}}\right) = -1$, dus de middelste term wordt positief). De integraal is $0 - \dfrac{4}{\mathrm{e}} = -\dfrac{4}{\mathrm{e}}$, dus negatief. De oppervlakte is het tegengestelde: $\dfrac{4}{\mathrm{e}}$.$ksql$)
) AS v(topic_slug, cluster_slug, latex_body, step_order, step_description)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new cl ON cl.slug = v.cluster_slug AND cl.topic_id = t.id
JOIN public.questions_new vr ON vr.latex_body = v.latex_body AND vr.cluster_id = cl.id
ON CONFLICT (question_id, step_order) DO NOTHING;

-- 6. Controle
DO $do$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'k2b_ln' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'k2b_logaritme' AND site = 'integralen'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster k2b_ln hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'k2b_bepaald_ln' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'k2b_logaritme' AND site = 'integralen'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster k2b_bepaald_ln hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.question_steps_new s
  JOIN public.questions_new vr ON vr.id = s.question_id
  JOIN public.topics_new t ON t.id = vr.topic_id
  WHERE t.site = 'integralen' AND t.slug IN ('k2b_logaritme');
  IF n <> 48 THEN RAISE EXCEPTION 'Deze topics horen samen 48 stappen te hebben, gevonden %', n; END IF;
END $do$;

COMMIT;
