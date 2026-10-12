-- =============================================================================
-- Migration 0054: H12.2 Theorie B — Primitiveren met verdubbelingsformules
-- =============================================================================
-- Gegenereerd door scripts/h12b-content.ts — niet met de hand bewerken.
--
-- Nieuw hoofdstuk H12, alleen paragraaf 12.2 theorie B: sin² en cos²
-- en een product sin·cos herschrijven met een verdubbelingsformule en dan
-- primitiveren. Symmetrie, 12.1, 12.3 en 12.4 horen hier niet bij.
--
-- Vier clusters, acht vragen per cluster.
--
-- De volgorde van het hoofdstuk is 11, dezelfde als H11. H11 heeft geen
-- paragraaf en blijft bij de oude opgaven. H12 heeft wel een paragraaf en
-- komt daardoor in de zijbalk vóór hoofdstuk K (volgorde 12).
--
-- Eigen oefenvragen, geen boekopgaven. Elke primitieve wordt nagerekend door
-- src/content/primitieven.test.ts (content/hoofdstuk-h12/h12b.json).
--
-- Alleen toevoegen: geen DELETE, DROP of ALTER, en geen UPDATE op bestaande
-- vragen. De enige UPDATE zet theory_block_id op de topics van dit blok,
-- en alleen als die koppeling er nog niet staat. Twee keer draaien voegt
-- niets dubbel toe.
--
--   • 1 hoofdstuk, 3 topics, 4 clusters
--   • 32 vragen met elk 4 stappen (128 stappen)
-- =============================================================================

BEGIN;

-- 1. Hoofdstuk
INSERT INTO public.chapters (slug, title, book_part, order_index, site)
VALUES ('h12', $h12sql$H12 — Goniometrische formules$h12sql$, 3, 11, 'integralen')
ON CONFLICT (slug) DO NOTHING;

-- 1b. Paragraaf en theorieblok
INSERT INTO public.paragraphs (chapter_id, site, slug, label, title, order_index)
SELECT c.id, 'integralen', 'h12-2', '12.2', 'Formules bij symmetrie en primitiveren', 1
FROM public.chapters c
WHERE c.slug = 'h12' AND c.site = 'integralen'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.theory_blocks (paragraph_id, site, slug, letter, title, order_index)
SELECT p.id, 'integralen', 'h12b', 'B', 'Verdubbelingsformules en primitiveren', 1
FROM public.paragraphs p
WHERE p.slug = 'h12-2' AND p.site = 'integralen'
ON CONFLICT (slug) DO NOTHING;

-- 2. Topics
INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default, site, category)
SELECT v.slug, v.title, (SELECT id FROM public.chapters WHERE slug = 'h12' AND site = 'integralen'), v.order_index, true, 'integralen', v.category
FROM (VALUES
  ('h12b_primitiveren', $h12sql$Verdubbelingsformules primitiveren$h12sql$, 37, 'primitiveren'),
  ('h12b_bepaald', $h12sql$Bepaalde integralen met verdubbelingsformules$h12sql$, 38, 'integralen'),
  ('h12b_toepassing', $h12sql$Oppervlakte en inhoud met verdubbelingsformules$h12sql$, 39, 'toepassingen')
) AS v(slug, title, order_index, category)
ON CONFLICT (slug) DO NOTHING;

-- 3. Clusters
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT t.id, v.slug, v.title, v.order_index, 'integralen'
FROM (VALUES
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Kwadraat van sinus of cosinus$h12sql$, 1),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Product van sinus en cosinus$h12sql$, 2),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact$h12sql$, 1),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Oppervlakte, inhoud en de waarde van p$h12sql$, 1)
) AS v(topic_slug, slug, title, order_index)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
ON CONFLICT (topic_id, slug) DO NOTHING;

-- 4. Vragen
INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, order_index, is_ai_generated, answer_alternatives)
SELECT 'integralen', t.id, cl.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, v.order_index, false, v.alternatives
FROM (VALUES
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}(x)$.$h12sql$, $h12sql$x/2 + sin(2x)/4 + c$h12sql$, $h12sql$F(x) = \tfrac{1}{2}x + \tfrac{1}{4}\sin(2x) + c$h12sql$, 1, 1, ARRAY[$h12sql$(1/2)*x + (1/4)*sin(2*x) + c$h12sql$, $h12sql$0,5x + 0,25sin(2x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \sin^{2}(x)$.$h12sql$, $h12sql$x/2 - sin(2x)/4 + c$h12sql$, $h12sql$F(x) = \tfrac{1}{2}x - \tfrac{1}{4}\sin(2x) + c$h12sql$, 1, 2, ARRAY[$h12sql$(1/2)*x - (1/4)*sin(2*x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}(2x)$.$h12sql$, $h12sql$x/2 + sin(4x)/8 + c$h12sql$, $h12sql$F(x) = \tfrac{1}{2}x + \tfrac{1}{8}\sin(4x) + c$h12sql$, 1, 3, ARRAY[$h12sql$(1/2)*x + (1/8)*sin(4*x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $g(x) = \sin^{2}(3x)$.$h12sql$, $h12sql$x/2 - sin(6x)/12 + c$h12sql$, $h12sql$G(x) = \tfrac{1}{2}x - \tfrac{1}{12}\sin(6x) + c$h12sql$, 2, 4, ARRAY[$h12sql$(1/2)*x - (1/12)*sin(6*x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = 4\cos^{2}(x)$.$h12sql$, $h12sql$2x + sin(2x) + c$h12sql$, $h12sql$F(x) = 2x + \sin(2x) + c$h12sql$, 2, 5, ARRAY[$h12sql$2*x + sin(2*x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \sin^{2}(x) + \cos^{2}(2x)$.$h12sql$, $h12sql$x - sin(2x)/4 + sin(4x)/8 + c$h12sql$, $h12sql$F(x) = x - \tfrac{1}{4}\sin(2x) + \tfrac{1}{8}\sin(4x) + c$h12sql$, 2, 6, ARRAY[$h12sql$x - (1/4)*sin(2*x) + (1/8)*sin(4*x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}\left(\tfrac{1}{2}x\right)$.$h12sql$, $h12sql$x/2 + sin(x)/2 + c$h12sql$, $h12sql$F(x) = \tfrac{1}{2}x + \tfrac{1}{2}\sin(x) + c$h12sql$, 3, 7, ARRAY[$h12sql$(1/2)*x + (1/2)*sin(x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = 3\sin^{2}(2x) - \cos^{2}(x)$.$h12sql$, $h12sql$x - sin(2x)/4 - (3/8)*sin(4x) + c$h12sql$, $h12sql$F(x) = x - \tfrac{1}{4}\sin(2x) - \tfrac{3}{8}\sin(4x) + c$h12sql$, 3, 8, ARRAY[$h12sql$x - (1/4)*sin(2*x) - (3/8)*sin(4*x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(x)\cos(x)$.$h12sql$, $h12sql$-cos(2x)/4 + c$h12sql$, $h12sql$F(x) = -\tfrac{1}{4}\cos(2x) + c$h12sql$, 1, 1, ARRAY[$h12sql$-(1/4)*cos(2*x) + c$h12sql$, $h12sql$-0,25cos(2x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(2x)\cos(2x)$.$h12sql$, $h12sql$-cos(4x)/8 + c$h12sql$, $h12sql$F(x) = -\tfrac{1}{8}\cos(4x) + c$h12sql$, 1, 2, ARRAY[$h12sql$-(1/8)*cos(4*x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = 2\sin(x)\cos(x)$.$h12sql$, $h12sql$-cos(2x)/2 + c$h12sql$, $h12sql$F(x) = -\tfrac{1}{2}\cos(2x) + c$h12sql$, 1, 3, ARRAY[$h12sql$-(1/2)*cos(2*x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $g(x) = \sin(3x)\cos(3x)$.$h12sql$, $h12sql$-cos(6x)/12 + c$h12sql$, $h12sql$G(x) = -\tfrac{1}{12}\cos(6x) + c$h12sql$, 2, 4, ARRAY[$h12sql$-(1/12)*cos(6*x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin\left(\tfrac{1}{2}x\right)\cos\left(\tfrac{1}{2}x\right)$.$h12sql$, $h12sql$-cos(x)/2 + c$h12sql$, $h12sql$F(x) = -\tfrac{1}{2}\cos(x) + c$h12sql$, 2, 5, ARRAY[$h12sql$-(1/2)*cos(x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = 6\sin(2x)\cos(2x)$.$h12sql$, $h12sql$-(3/4)*cos(4x) + c$h12sql$, $h12sql$F(x) = -\tfrac{3}{4}\cos(4x) + c$h12sql$, 2, 6, ARRAY[$h12sql$-0,75cos(4x) + c$h12sql$, $h12sql$-3/4 cos(4x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(2x)\cos(2x) + \cos^{2}(x)$.$h12sql$, $h12sql$x/2 + sin(2x)/4 - cos(4x)/8 + c$h12sql$, $h12sql$F(x) = \tfrac{1}{2}x + \tfrac{1}{4}\sin(2x) - \tfrac{1}{8}\cos(4x) + c$h12sql$, 3, 7, ARRAY[$h12sql$(1/2)*x + (1/4)*sin(2*x) - (1/8)*cos(4*x) + c$h12sql$]::text[]),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $h(x) = 4\sin(3x)\cos(3x) - \sin^{2}(x)$.$h12sql$, $h12sql$-x/2 - cos(6x)/3 + sin(2x)/4 + c$h12sql$, $h12sql$H(x) = -\tfrac{1}{2}x - \tfrac{1}{3}\cos(6x) + \tfrac{1}{4}\sin(2x) + c$h12sql$, 3, 8, ARRAY[$h12sql$-(1/2)*x - (1/3)*cos(6*x) + (1/4)*sin(2*x) + c$h12sql$]::text[]),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \cos^{2}(x)\,\mathrm{d}x$.$h12sql$, $h12sql$pi/4$h12sql$, $h12sql$\dfrac{1}{4}\pi$h12sql$, 1, 1, ARRAY[$h12sql$(1/4)*pi$h12sql$, $h12sql$0,25pi$h12sql$]::text[]),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{4}\pi} \sin(2x)\cos(2x)\,\mathrm{d}x$.$h12sql$, $h12sql$1/4$h12sql$, $h12sql$\dfrac{1}{4}$h12sql$, 1, 2, ARRAY[$h12sql$0,25$h12sql$]::text[]),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\pi} \sin^{2}(x)\,\mathrm{d}x$.$h12sql$, $h12sql$pi/2$h12sql$, $h12sql$\dfrac{1}{2}\pi$h12sql$, 1, 3, ARRAY[$h12sql$(1/2)*pi$h12sql$, $h12sql$0,5pi$h12sql$]::text[]),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \left(2 - \tfrac{1}{2}\sin^{2}(x)\right)\,\mathrm{d}x$.$h12sql$, $h12sql$(7/8)*pi$h12sql$, $h12sql$\dfrac{7}{8}\pi$h12sql$, 2, 4, ARRAY[$h12sql$7pi/8$h12sql$, $h12sql$0,875pi$h12sql$]::text[]),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{6}\pi} \sin^{2}(3x)\,\mathrm{d}x$.$h12sql$, $h12sql$pi/12$h12sql$, $h12sql$\dfrac{1}{12}\pi$h12sql$, 2, 5, ARRAY[$h12sql$(1/12)*pi$h12sql$]::text[]),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\pi} \cos^{2}\left(\tfrac{1}{2}x\right)\,\mathrm{d}x$.$h12sql$, $h12sql$pi/2$h12sql$, $h12sql$\dfrac{1}{2}\pi$h12sql$, 2, 6, ARRAY[$h12sql$(1/2)*pi$h12sql$]::text[]),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \left(\sin^{2}(x) + \sin(x)\cos(x)\right)\,\mathrm{d}x$.$h12sql$, $h12sql$pi/4 + 1/2$h12sql$, $h12sql$\dfrac{1}{4}\pi + \dfrac{1}{2}$h12sql$, 3, 7, ARRAY[$h12sql$(1/4)*pi + 0,5$h12sql$, $h12sql$0,25pi + 1/2$h12sql$]::text[]),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{\frac{1}{4}\pi}^{\frac{1}{2}\pi} \left(4\cos^{2}(x) - 1\right)\,\mathrm{d}x$.$h12sql$, $h12sql$pi/4 - 1$h12sql$, $h12sql$\dfrac{1}{4}\pi - 1$h12sql$, 3, 8, ARRAY[$h12sql$(1/4)*pi - 1$h12sql$]::text[]),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \cos^{2}(x)$, de $x$-as en de lijnen $x = 0$ en $x = \tfrac{1}{2}\pi$. Bereken exact de oppervlakte van $V$.$h12sql$, $h12sql$pi/4$h12sql$, $h12sql$\dfrac{1}{4}\pi$h12sql$, 1, 1, ARRAY[$h12sql$(1/4)*pi$h12sql$]::text[]),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(x)\cos(x)$, de $x$-as en de lijnen $x = 0$ en $x = \tfrac{1}{2}\pi$. Bereken exact de oppervlakte van $V$.$h12sql$, $h12sql$1/2$h12sql$, $h12sql$\dfrac{1}{2}$h12sql$, 1, 2, ARRAY[$h12sql$0,5$h12sql$]::text[]),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2\sin(x)\cos(x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Bereken exact de oppervlakte van $V$.$h12sql$, $h12sql$1$h12sql$, $h12sql$1$h12sql$, 1, 3, ARRAY[]::text[]),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(x)$ en de $x$-as op het domein $[0, \pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, $h12sql$(1/2)*pi^2$h12sql$, $h12sql$\dfrac{1}{2}\pi^{2}$h12sql$, 2, 4, ARRAY[$h12sql$pi^2/2$h12sql$, $h12sql$0,5pi^2$h12sql$]::text[]),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin^{2}(x) + \tfrac{1}{2}$ en de $x$-as op het domein $[0, \pi]$. Bereken exact de oppervlakte van $V$.$h12sql$, $h12sql$pi$h12sql$, $h12sql$\pi$h12sql$, 2, 5, ARRAY[]::text[]),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \cos(x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, $h12sql$(1/4)*pi^2$h12sql$, $h12sql$\dfrac{1}{4}\pi^{2}$h12sql$, 2, 6, ARRAY[$h12sql$pi^2/4$h12sql$, $h12sql$0,25pi^2$h12sql$]::text[]),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Voor elke $p > 0$ sluit de grafiek van $f(x) = p\sin(x)\cos(x)$ met de $x$-as op $[0, \tfrac{1}{2}\pi]$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $3$.$h12sql$, $h12sql$6$h12sql$, $h12sql$p = 6$h12sql$, 3, 7, ARRAY[$h12sql$p = 6$h12sql$, $h12sql$p=6$h12sql$]::text[]),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(2x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, $h12sql$(1/4)*pi^2$h12sql$, $h12sql$\dfrac{1}{4}\pi^{2}$h12sql$, 3, 8, ARRAY[$h12sql$pi^2/4$h12sql$]::text[])
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
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}(x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Een kwadraat van een cosinus herschrijf je eerst met een verdubbelingsformule.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}(x)$.$h12sql$, 1, $h12sql$Gebruik $\cos^{2}(A) = \tfrac{1}{2} + \tfrac{1}{2}\cos(2A)$ met $A = x$: $f(x) = \tfrac{1}{2} + \tfrac{1}{2}\cos(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}(x)$.$h12sql$, 2, $h12sql$Primitiveer term voor term. Bij $\cos(2x)$ is de kern $2x$, dus deel door $2$: een primitieve van $\tfrac{1}{2}\cos(2x)$ is $\tfrac{1}{4}\sin(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}(x)$.$h12sql$, 3, $h12sql$$F(x) = \tfrac{1}{2}x + \tfrac{1}{4}\sin(2x) + c$. Controle: differentieer $F$ en je krijgt $\tfrac{1}{2} + \tfrac{1}{2}\cos(2x) = \cos^{2}(x)$ terug.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \sin^{2}(x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Een kwadraat van een sinus herschrijf je eerst met een verdubbelingsformule.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \sin^{2}(x)$.$h12sql$, 1, $h12sql$Gebruik $\sin^{2}(A) = \tfrac{1}{2} - \tfrac{1}{2}\cos(2A)$ met $A = x$: $f(x) = \tfrac{1}{2} - \tfrac{1}{2}\cos(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \sin^{2}(x)$.$h12sql$, 2, $h12sql$Primitiveer term voor term. Bij $\cos(2x)$ is de kern $2x$, dus deel door $2$: een primitieve van $-\tfrac{1}{2}\cos(2x)$ is $-\tfrac{1}{4}\sin(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \sin^{2}(x)$.$h12sql$, 3, $h12sql$$F(x) = \tfrac{1}{2}x - \tfrac{1}{4}\sin(2x) + c$. Controle: differentieer $F$ en je krijgt $\sin^{2}(x)$ terug.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}(2x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst het kwadraat herschrijven. De hoek in de formule is de hele $2x$, niet alleen $x$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}(2x)$.$h12sql$, 1, $h12sql$$\cos^{2}(2x) = \tfrac{1}{2} + \tfrac{1}{2}\cos(4x)$, want $2A = 4x$ als $A = 2x$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}(2x)$.$h12sql$, 2, $h12sql$Een primitieve van $\tfrac{1}{2}$ is $\tfrac{1}{2}x$. Bij $\tfrac{1}{2}\cos(4x)$ is de kern $4x$, dus deel door $4$: $\tfrac{1}{8}\sin(4x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}(2x)$.$h12sql$, 3, $h12sql$$F(x) = \tfrac{1}{2}x + \tfrac{1}{8}\sin(4x) + c$. Controle: de afgeleide is $\tfrac{1}{2} + \tfrac{1}{2}\cos(4x) = \cos^{2}(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $g(x) = \sin^{2}(3x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Herschrijf het kwadraat. De hoek in de formule is $3x$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $g(x) = \sin^{2}(3x)$.$h12sql$, 1, $h12sql$$\sin^{2}(3x) = \tfrac{1}{2} - \tfrac{1}{2}\cos(6x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $g(x) = \sin^{2}(3x)$.$h12sql$, 2, $h12sql$Een primitieve van $\tfrac{1}{2}$ is $\tfrac{1}{2}x$. Bij $-\tfrac{1}{2}\cos(6x)$ is de kern $6x$, dus deel door $6$: $-\tfrac{1}{12}\sin(6x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $g(x) = \sin^{2}(3x)$.$h12sql$, 3, $h12sql$$G(x) = \tfrac{1}{2}x - \tfrac{1}{12}\sin(6x) + c$. Controle: differentieer $G$ en je krijgt $\sin^{2}(3x)$ terug.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = 4\cos^{2}(x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Haal de factor $4$ mee als je het kwadraat herschrijft.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = 4\cos^{2}(x)$.$h12sql$, 1, $h12sql$$4\cos^{2}(x) = 4\left(\tfrac{1}{2} + \tfrac{1}{2}\cos(2x)\right) = 2 + 2\cos(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = 4\cos^{2}(x)$.$h12sql$, 2, $h12sql$Een primitieve van $2$ is $2x$. Bij $2\cos(2x)$ is de kern $2x$, dus deel door $2$: $\sin(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = 4\cos^{2}(x)$.$h12sql$, 3, $h12sql$$F(x) = 2x + \sin(2x) + c$. Controle: de afgeleide is $2 + 2\cos(2x) = 4\cos^{2}(x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \sin^{2}(x) + \cos^{2}(2x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Twee kwadraten, elk met een eigen hoek. Herschrijf ze apart en tel daarna op.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \sin^{2}(x) + \cos^{2}(2x)$.$h12sql$, 1, $h12sql$$\sin^{2}(x) = \tfrac{1}{2} - \tfrac{1}{2}\cos(2x)$ en $\cos^{2}(2x) = \tfrac{1}{2} + \tfrac{1}{2}\cos(4x)$. Samen: $f(x) = 1 - \tfrac{1}{2}\cos(2x) + \tfrac{1}{2}\cos(4x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \sin^{2}(x) + \cos^{2}(2x)$.$h12sql$, 2, $h12sql$Primitiveer term voor term. De kernen zijn $2x$ en $4x$: een primitieve is $x - \tfrac{1}{4}\sin(2x) + \tfrac{1}{8}\sin(4x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \sin^{2}(x) + \cos^{2}(2x)$.$h12sql$, 3, $h12sql$$F(x) = x - \tfrac{1}{4}\sin(2x) + \tfrac{1}{8}\sin(4x) + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}\left(\tfrac{1}{2}x\right)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. De hoek in de verdubbelingsformule is $	frac{1}{2}x$. Twee keer die hoek is gewoon $x$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}\left(\tfrac{1}{2}x\right)$.$h12sql$, 1, $h12sql$$\cos^{2}\left(\tfrac{1}{2}x\right) = \tfrac{1}{2} + \tfrac{1}{2}\cos(x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}\left(\tfrac{1}{2}x\right)$.$h12sql$, 2, $h12sql$Een primitieve van $\tfrac{1}{2}$ is $\tfrac{1}{2}x$. Een primitieve van $\tfrac{1}{2}\cos(x)$ is $\tfrac{1}{2}\sin(x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = \cos^{2}\left(\tfrac{1}{2}x\right)$.$h12sql$, 3, $h12sql$$F(x) = \tfrac{1}{2}x + \tfrac{1}{2}\sin(x) + c$. Controle: de afgeleide is $\tfrac{1}{2} + \tfrac{1}{2}\cos(x) = \cos^{2}\left(\tfrac{1}{2}x\right)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = 3\sin^{2}(2x) - \cos^{2}(x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Herschrijf beide kwadraten, met elk de juiste hoek, en trek ze daarna van elkaar af.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = 3\sin^{2}(2x) - \cos^{2}(x)$.$h12sql$, 1, $h12sql$$3\sin^{2}(2x) = 3\left(\tfrac{1}{2} - \tfrac{1}{2}\cos(4x)\right) = \tfrac{3}{2} - \tfrac{3}{2}\cos(4x)$ en $\cos^{2}(x) = \tfrac{1}{2} + \tfrac{1}{2}\cos(2x)$. Dus $f(x) = 1 - \tfrac{1}{2}\cos(2x) - \tfrac{3}{2}\cos(4x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = 3\sin^{2}(2x) - \cos^{2}(x)$.$h12sql$, 2, $h12sql$Primitiveer term voor term. Een primitieve van $-\tfrac{1}{2}\cos(2x)$ is $-\tfrac{1}{4}\sin(2x)$. Een primitieve van $-\tfrac{3}{2}\cos(4x)$ is $-\tfrac{3}{8}\sin(4x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_kwadraat', $h12sql$Primitiveer $f(x) = 3\sin^{2}(2x) - \cos^{2}(x)$.$h12sql$, 3, $h12sql$$F(x) = x - \tfrac{1}{4}\sin(2x) - \tfrac{3}{8}\sin(4x) + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(x)\cos(x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Een product $\sin(A)\cos(A)$ herschrijf je met de verdubbelingsformule tot één sinus.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(x)\cos(x)$.$h12sql$, 1, $h12sql$$\sin(2A) = 2\sin(A)\cos(A)$, dus $\sin(x)\cos(x) = \tfrac{1}{2}\sin(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(x)\cos(x)$.$h12sql$, 2, $h12sql$Bij $\tfrac{1}{2}\sin(2x)$ is de kern $2x$. Een primitieve is $-\tfrac{1}{4}\cos(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(x)\cos(x)$.$h12sql$, 3, $h12sql$$F(x) = -\tfrac{1}{4}\cos(2x) + c$. Controle: de afgeleide is $\tfrac{1}{2}\sin(2x) = \sin(x)\cos(x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(2x)\cos(2x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Zelfde product, maar de hoek is $2x$. Die hoek verdubbelt naar $4x$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(2x)\cos(2x)$.$h12sql$, 1, $h12sql$$\sin(2x)\cos(2x) = \tfrac{1}{2}\sin(4x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(2x)\cos(2x)$.$h12sql$, 2, $h12sql$Bij $\tfrac{1}{2}\sin(4x)$ is de kern $4x$, dus deel door $4$: een primitieve is $-\tfrac{1}{8}\cos(4x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(2x)\cos(2x)$.$h12sql$, 3, $h12sql$$F(x) = -\tfrac{1}{8}\cos(4x) + c$. Controle: de afgeleide is $\tfrac{1}{2}\sin(4x) = \sin(2x)\cos(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = 2\sin(x)\cos(x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. De factor $2$ maakt het product meteen de verdubbelingsformule.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = 2\sin(x)\cos(x)$.$h12sql$, 1, $h12sql$$2\sin(x)\cos(x) = \sin(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = 2\sin(x)\cos(x)$.$h12sql$, 2, $h12sql$Bij $\sin(2x)$ is de kern $2x$, dus deel door $2$: een primitieve is $-\tfrac{1}{2}\cos(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = 2\sin(x)\cos(x)$.$h12sql$, 3, $h12sql$$F(x) = -\tfrac{1}{2}\cos(2x) + c$. Controle: de afgeleide is $\sin(2x) = 2\sin(x)\cos(x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $g(x) = \sin(3x)\cos(3x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. De hoek is $3x$. Die verdubbelt naar $6x$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $g(x) = \sin(3x)\cos(3x)$.$h12sql$, 1, $h12sql$$\sin(3x)\cos(3x) = \tfrac{1}{2}\sin(6x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $g(x) = \sin(3x)\cos(3x)$.$h12sql$, 2, $h12sql$Bij $\tfrac{1}{2}\sin(6x)$ is de kern $6x$, dus deel door $6$: een primitieve is $-\tfrac{1}{12}\cos(6x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $g(x) = \sin(3x)\cos(3x)$.$h12sql$, 3, $h12sql$$G(x) = -\tfrac{1}{12}\cos(6x) + c$. Controle: differentieer $G$ en je krijgt $g$ terug.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin\left(\tfrac{1}{2}x\right)\cos\left(\tfrac{1}{2}x\right)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. De hoek is $\tfrac{1}{2}x$. Twee keer die hoek is $x$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin\left(\tfrac{1}{2}x\right)\cos\left(\tfrac{1}{2}x\right)$.$h12sql$, 1, $h12sql$$\sin\left(\tfrac{1}{2}x\right)\cos\left(\tfrac{1}{2}x\right) = \tfrac{1}{2}\sin(x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin\left(\tfrac{1}{2}x\right)\cos\left(\tfrac{1}{2}x\right)$.$h12sql$, 2, $h12sql$Een primitieve van $\tfrac{1}{2}\sin(x)$ is $-\tfrac{1}{2}\cos(x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin\left(\tfrac{1}{2}x\right)\cos\left(\tfrac{1}{2}x\right)$.$h12sql$, 3, $h12sql$$F(x) = -\tfrac{1}{2}\cos(x) + c$. Controle: de afgeleide is $\tfrac{1}{2}\sin(x)$, en dat is het product weer.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = 6\sin(2x)\cos(2x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst het product herschrijven, de factor $6$ gaat mee.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = 6\sin(2x)\cos(2x)$.$h12sql$, 1, $h12sql$$6\sin(2x)\cos(2x) = 6 \cdot \tfrac{1}{2}\sin(4x) = 3\sin(4x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = 6\sin(2x)\cos(2x)$.$h12sql$, 2, $h12sql$Bij $3\sin(4x)$ is de kern $4x$, dus deel door $4$: een primitieve is $-\tfrac{3}{4}\cos(4x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = 6\sin(2x)\cos(2x)$.$h12sql$, 3, $h12sql$$F(x) = -\tfrac{3}{4}\cos(4x) + c$. Controle: de afgeleide is $3\sin(4x) = 6\sin(2x)\cos(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(2x)\cos(2x) + \cos^{2}(x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Twee stukken: een product en een kwadraat. Herschrijf elk stuk met zijn eigen formule.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(2x)\cos(2x) + \cos^{2}(x)$.$h12sql$, 1, $h12sql$$\sin(2x)\cos(2x) = \tfrac{1}{2}\sin(4x)$ en $\cos^{2}(x) = \tfrac{1}{2} + \tfrac{1}{2}\cos(2x)$. Dus $f(x) = \tfrac{1}{2} + \tfrac{1}{2}\cos(2x) + \tfrac{1}{2}\sin(4x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(2x)\cos(2x) + \cos^{2}(x)$.$h12sql$, 2, $h12sql$Primitiveer term voor term: $\tfrac{1}{2}x + \tfrac{1}{4}\sin(2x) - \tfrac{1}{8}\cos(4x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $f(x) = \sin(2x)\cos(2x) + \cos^{2}(x)$.$h12sql$, 3, $h12sql$$F(x) = \tfrac{1}{2}x + \tfrac{1}{4}\sin(2x) - \tfrac{1}{8}\cos(4x) + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $h(x) = 4\sin(3x)\cos(3x) - \sin^{2}(x)$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Herschrijf het product en het kwadraat apart, en trek ze daarna van elkaar af.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $h(x) = 4\sin(3x)\cos(3x) - \sin^{2}(x)$.$h12sql$, 1, $h12sql$$4\sin(3x)\cos(3x) = 2\sin(6x)$ en $\sin^{2}(x) = \tfrac{1}{2} - \tfrac{1}{2}\cos(2x)$. Dus $h(x) = 2\sin(6x) - \tfrac{1}{2} + \tfrac{1}{2}\cos(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $h(x) = 4\sin(3x)\cos(3x) - \sin^{2}(x)$.$h12sql$, 2, $h12sql$Een primitieve van $2\sin(6x)$ is $-\tfrac{1}{3}\cos(6x)$. Een primitieve van $-\tfrac{1}{2}$ is $-\tfrac{1}{2}x$. Een primitieve van $\tfrac{1}{2}\cos(2x)$ is $\tfrac{1}{4}\sin(2x)$.$h12sql$),
  ('h12b_primitiveren', 'h12b_product', $h12sql$Primitiveer $h(x) = 4\sin(3x)\cos(3x) - \sin^{2}(x)$.$h12sql$, 3, $h12sql$$H(x) = -\tfrac{1}{2}x - \tfrac{1}{3}\cos(6x) + \tfrac{1}{4}\sin(2x) + c$. Controle: differentieer $H$ en je krijgt $h$ terug.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \cos^{2}(x)\,\mathrm{d}x$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \cos^{2}(x)\,\mathrm{d}x$.$h12sql$, 1, $h12sql$$\cos^{2}(x) = \tfrac{1}{2} + \tfrac{1}{2}\cos(2x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \cos^{2}(x)\,\mathrm{d}x$.$h12sql$, 2, $h12sql$Een primitieve is $F(x) = \tfrac{1}{2}x + \tfrac{1}{4}\sin(2x)$. De integratieconstante laat je weg.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \cos^{2}(x)\,\mathrm{d}x$.$h12sql$, 3, $h12sql$$\left[\tfrac{1}{2}x + \tfrac{1}{4}\sin(2x)\right]_{0}^{\frac{1}{2}\pi} = \tfrac{1}{4}\pi - 0 = \tfrac{1}{4}\pi$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{4}\pi} \sin(2x)\cos(2x)\,\mathrm{d}x$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst het product herschrijven, dan primitiveren, dan de grenzen invullen.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{4}\pi} \sin(2x)\cos(2x)\,\mathrm{d}x$.$h12sql$, 1, $h12sql$$\sin(2x)\cos(2x) = \tfrac{1}{2}\sin(4x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{4}\pi} \sin(2x)\cos(2x)\,\mathrm{d}x$.$h12sql$, 2, $h12sql$Een primitieve is $F(x) = -\tfrac{1}{8}\cos(4x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{4}\pi} \sin(2x)\cos(2x)\,\mathrm{d}x$.$h12sql$, 3, $h12sql$$F\left(\tfrac{1}{4}\pi\right) - F(0) = -\tfrac{1}{8}\cos(\pi) - \left(-\tfrac{1}{8}\cos(0)\right) = \tfrac{1}{8} + \tfrac{1}{8} = \tfrac{1}{4}$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\pi} \sin^{2}(x)\,\mathrm{d}x$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Herschrijf het kwadraat, primitiveer, en vul de grenzen in.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\pi} \sin^{2}(x)\,\mathrm{d}x$.$h12sql$, 1, $h12sql$$\sin^{2}(x) = \tfrac{1}{2} - \tfrac{1}{2}\cos(2x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\pi} \sin^{2}(x)\,\mathrm{d}x$.$h12sql$, 2, $h12sql$Een primitieve is $F(x) = \tfrac{1}{2}x - \tfrac{1}{4}\sin(2x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\pi} \sin^{2}(x)\,\mathrm{d}x$.$h12sql$, 3, $h12sql$$F(\pi) - F(0) = \tfrac{1}{2}\pi - 0 = \tfrac{1}{2}\pi$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \left(2 - \tfrac{1}{2}\sin^{2}(x)\right)\,\mathrm{d}x$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst het kwadraat herschrijven, zodat je losse termen overhoudt.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \left(2 - \tfrac{1}{2}\sin^{2}(x)\right)\,\mathrm{d}x$.$h12sql$, 1, $h12sql$$\sin^{2}(x) = \tfrac{1}{2} - \tfrac{1}{2}\cos(2x)$, dus $\tfrac{1}{2}\sin^{2}(x) = \tfrac{1}{4} - \tfrac{1}{4}\cos(2x)$. De integrand wordt $2 - \tfrac{1}{4} + \tfrac{1}{4}\cos(2x) = \tfrac{7}{4} + \tfrac{1}{4}\cos(2x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \left(2 - \tfrac{1}{2}\sin^{2}(x)\right)\,\mathrm{d}x$.$h12sql$, 2, $h12sql$Een primitieve is $F(x) = \tfrac{7}{4}x + \tfrac{1}{8}\sin(2x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \left(2 - \tfrac{1}{2}\sin^{2}(x)\right)\,\mathrm{d}x$.$h12sql$, 3, $h12sql$$F\left(\tfrac{1}{2}\pi\right) - F(0) = \tfrac{7}{8}\pi$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{6}\pi} \sin^{2}(3x)\,\mathrm{d}x$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. De hoek in het kwadraat is $3x$. Die verdubbelt naar $6x$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{6}\pi} \sin^{2}(3x)\,\mathrm{d}x$.$h12sql$, 1, $h12sql$$\sin^{2}(3x) = \tfrac{1}{2} - \tfrac{1}{2}\cos(6x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{6}\pi} \sin^{2}(3x)\,\mathrm{d}x$.$h12sql$, 2, $h12sql$Een primitieve is $F(x) = \tfrac{1}{2}x - \tfrac{1}{12}\sin(6x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{6}\pi} \sin^{2}(3x)\,\mathrm{d}x$.$h12sql$, 3, $h12sql$$F\left(\tfrac{1}{6}\pi\right) - F(0) = \tfrac{1}{12}\pi - \sin(\pi)/12 = \tfrac{1}{12}\pi$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\pi} \cos^{2}\left(\tfrac{1}{2}x\right)\,\mathrm{d}x$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Twee keer de hoek $\tfrac{1}{2}x$ is $x$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\pi} \cos^{2}\left(\tfrac{1}{2}x\right)\,\mathrm{d}x$.$h12sql$, 1, $h12sql$$\cos^{2}\left(\tfrac{1}{2}x\right) = \tfrac{1}{2} + \tfrac{1}{2}\cos(x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\pi} \cos^{2}\left(\tfrac{1}{2}x\right)\,\mathrm{d}x$.$h12sql$, 2, $h12sql$Een primitieve is $F(x) = \tfrac{1}{2}x + \tfrac{1}{2}\sin(x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\pi} \cos^{2}\left(\tfrac{1}{2}x\right)\,\mathrm{d}x$.$h12sql$, 3, $h12sql$$F(\pi) - F(0) = \tfrac{1}{2}\pi$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \left(\sin^{2}(x) + \sin(x)\cos(x)\right)\,\mathrm{d}x$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Herschrijf het kwadraat en het product apart.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \left(\sin^{2}(x) + \sin(x)\cos(x)\right)\,\mathrm{d}x$.$h12sql$, 1, $h12sql$$\sin^{2}(x) = \tfrac{1}{2} - \tfrac{1}{2}\cos(2x)$ en $\sin(x)\cos(x) = \tfrac{1}{2}\sin(2x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \left(\sin^{2}(x) + \sin(x)\cos(x)\right)\,\mathrm{d}x$.$h12sql$, 2, $h12sql$Een primitieve is $F(x) = \tfrac{1}{2}x - \tfrac{1}{4}\sin(2x) - \tfrac{1}{4}\cos(2x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{0}^{\frac{1}{2}\pi} \left(\sin^{2}(x) + \sin(x)\cos(x)\right)\,\mathrm{d}x$.$h12sql$, 3, $h12sql$$F\left(\tfrac{1}{2}\pi\right) = \tfrac{1}{4}\pi + \tfrac{1}{4}$ en $F(0) = -\tfrac{1}{4}$. Het verschil is $\tfrac{1}{4}\pi + \tfrac{1}{2}$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{\frac{1}{4}\pi}^{\frac{1}{2}\pi} \left(4\cos^{2}(x) - 1\right)\,\mathrm{d}x$.$h12sql$, 0, $h12sql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Herschrijf het kwadraat voordat je de constante $1$ eraf haalt.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{\frac{1}{4}\pi}^{\frac{1}{2}\pi} \left(4\cos^{2}(x) - 1\right)\,\mathrm{d}x$.$h12sql$, 1, $h12sql$$4\cos^{2}(x) = 2 + 2\cos(2x)$, dus de integrand is $1 + 2\cos(2x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{\frac{1}{4}\pi}^{\frac{1}{2}\pi} \left(4\cos^{2}(x) - 1\right)\,\mathrm{d}x$.$h12sql$, 2, $h12sql$Een primitieve is $F(x) = x + \sin(2x)$.$h12sql$),
  ('h12b_bepaald', 'h12b_bepaald', $h12sql$Bereken exact $\displaystyle\int_{\frac{1}{4}\pi}^{\frac{1}{2}\pi} \left(4\cos^{2}(x) - 1\right)\,\mathrm{d}x$.$h12sql$, 3, $h12sql$$F\left(\tfrac{1}{2}\pi\right) = \tfrac{1}{2}\pi$ en $F\left(\tfrac{1}{4}\pi\right) = \tfrac{1}{4}\pi + 1$. Het verschil is $\tfrac{1}{4}\pi - 1$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \cos^{2}(x)$, de $x$-as en de lijnen $x = 0$ en $x = \tfrac{1}{2}\pi$. Bereken exact de oppervlakte van $V$.$h12sql$, 0, $h12sql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Op $[0, \tfrac{1}{2}\pi]$ is $\cos^{2}(x) \ge 0$, dus de oppervlakte is de integraal zelf.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \cos^{2}(x)$, de $x$-as en de lijnen $x = 0$ en $x = \tfrac{1}{2}\pi$. Bereken exact de oppervlakte van $V$.$h12sql$, 1, $h12sql$$O(V) = \displaystyle\int_{0}^{\frac{1}{2}\pi} \cos^{2}(x)\,\mathrm{d}x$ en $\cos^{2}(x) = \tfrac{1}{2} + \tfrac{1}{2}\cos(2x)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \cos^{2}(x)$, de $x$-as en de lijnen $x = 0$ en $x = \tfrac{1}{2}\pi$. Bereken exact de oppervlakte van $V$.$h12sql$, 2, $h12sql$Een primitieve is $F(x) = \tfrac{1}{2}x + \tfrac{1}{4}\sin(2x)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \cos^{2}(x)$, de $x$-as en de lijnen $x = 0$ en $x = \tfrac{1}{2}\pi$. Bereken exact de oppervlakte van $V$.$h12sql$, 3, $h12sql$$F\left(\tfrac{1}{2}\pi\right) - F(0) = \tfrac{1}{4}\pi$. De oppervlakte is $\tfrac{1}{4}\pi$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(x)\cos(x)$, de $x$-as en de lijnen $x = 0$ en $x = \tfrac{1}{2}\pi$. Bereken exact de oppervlakte van $V$.$h12sql$, 0, $h12sql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Op $[0, \tfrac{1}{2}\pi]$ zijn sinus en cosinus allebei positief, dus $f(x) \ge 0$ en de oppervlakte is de integraal.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(x)\cos(x)$, de $x$-as en de lijnen $x = 0$ en $x = \tfrac{1}{2}\pi$. Bereken exact de oppervlakte van $V$.$h12sql$, 1, $h12sql$$O(V) = \displaystyle\int_{0}^{\frac{1}{2}\pi} \sin(x)\cos(x)\,\mathrm{d}x$ en $\sin(x)\cos(x) = \tfrac{1}{2}\sin(2x)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(x)\cos(x)$, de $x$-as en de lijnen $x = 0$ en $x = \tfrac{1}{2}\pi$. Bereken exact de oppervlakte van $V$.$h12sql$, 2, $h12sql$Een primitieve is $F(x) = -\tfrac{1}{4}\cos(2x)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(x)\cos(x)$, de $x$-as en de lijnen $x = 0$ en $x = \tfrac{1}{2}\pi$. Bereken exact de oppervlakte van $V$.$h12sql$, 3, $h12sql$$F\left(\tfrac{1}{2}\pi\right) - F(0) = \tfrac{1}{4} - \left(-\tfrac{1}{4}\right) = \tfrac{1}{2}$. De oppervlakte is $\tfrac{1}{2}$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2\sin(x)\cos(x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Bereken exact de oppervlakte van $V$.$h12sql$, 0, $h12sql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Op dit domein is $f(x) = \sin(2x) \ge 0$, dus de oppervlakte is de integraal.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2\sin(x)\cos(x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Bereken exact de oppervlakte van $V$.$h12sql$, 1, $h12sql$$2\sin(x)\cos(x) = \sin(2x)$, dus $O(V) = \displaystyle\int_{0}^{\frac{1}{2}\pi} \sin(2x)\,\mathrm{d}x$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2\sin(x)\cos(x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Bereken exact de oppervlakte van $V$.$h12sql$, 2, $h12sql$Een primitieve is $F(x) = -\tfrac{1}{2}\cos(2x)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2\sin(x)\cos(x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Bereken exact de oppervlakte van $V$.$h12sql$, 3, $h12sql$$F\left(\tfrac{1}{2}\pi\right) - F(0) = \tfrac{1}{2} - \left(-\tfrac{1}{2}\right) = 1$. De oppervlakte is $1$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(x)$ en de $x$-as op het domein $[0, \pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, 0, $h12sql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. De inhoud bij wentelen om de $x$-as is $\pi$ keer de integraal van het kwadraat van $f$. Op $[0, \pi]$ ligt de grafiek boven de $x$-as.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(x)$ en de $x$-as op het domein $[0, \pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, 1, $h12sql$$I(L) = \pi \displaystyle\int_{0}^{\pi} \sin^{2}(x)\,\mathrm{d}x$ en $\sin^{2}(x) = \tfrac{1}{2} - \tfrac{1}{2}\cos(2x)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(x)$ en de $x$-as op het domein $[0, \pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, 2, $h12sql$Een primitieve van de integrand is $F(x) = \pi\left(\tfrac{1}{2}x - \tfrac{1}{4}\sin(2x)\right)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(x)$ en de $x$-as op het domein $[0, \pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, 3, $h12sql$$F(\pi) - F(0) = \pi \cdot \tfrac{1}{2}\pi = \tfrac{1}{2}\pi^{2}$. De inhoud is $\tfrac{1}{2}\pi^{2}$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin^{2}(x) + \tfrac{1}{2}$ en de $x$-as op het domein $[0, \pi]$. Bereken exact de oppervlakte van $V$.$h12sql$, 0, $h12sql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. $f(x) \ge \tfrac{1}{2}$ op het hele domein, dus de oppervlakte is de integraal.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin^{2}(x) + \tfrac{1}{2}$ en de $x$-as op het domein $[0, \pi]$. Bereken exact de oppervlakte van $V$.$h12sql$, 1, $h12sql$$\sin^{2}(x) = \tfrac{1}{2} - \tfrac{1}{2}\cos(2x)$, dus $f(x) = 1 - \tfrac{1}{2}\cos(2x)$ en $O(V) = \displaystyle\int_{0}^{\pi} \left(1 - \tfrac{1}{2}\cos(2x)\right)\,\mathrm{d}x$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin^{2}(x) + \tfrac{1}{2}$ en de $x$-as op het domein $[0, \pi]$. Bereken exact de oppervlakte van $V$.$h12sql$, 2, $h12sql$Een primitieve is $F(x) = x - \tfrac{1}{4}\sin(2x)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin^{2}(x) + \tfrac{1}{2}$ en de $x$-as op het domein $[0, \pi]$. Bereken exact de oppervlakte van $V$.$h12sql$, 3, $h12sql$$F(\pi) - F(0) = \pi$. De oppervlakte is $\pi$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \cos(x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, 0, $h12sql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. De inhoud is $\pi$ keer de integraal van $\cos^{2}(x)$. Op dit domein ligt de grafiek boven de $x$-as.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \cos(x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, 1, $h12sql$$I(L) = \pi \displaystyle\int_{0}^{\frac{1}{2}\pi} \cos^{2}(x)\,\mathrm{d}x$ en $\cos^{2}(x) = \tfrac{1}{2} + \tfrac{1}{2}\cos(2x)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \cos(x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, 2, $h12sql$Een primitieve van de integrand is $F(x) = \pi\left(\tfrac{1}{2}x + \tfrac{1}{4}\sin(2x)\right)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \cos(x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, 3, $h12sql$$F\left(\tfrac{1}{2}\pi\right) - F(0) = \pi \cdot \tfrac{1}{4}\pi = \tfrac{1}{4}\pi^{2}$. De inhoud is $\tfrac{1}{4}\pi^{2}$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Voor elke $p > 0$ sluit de grafiek van $f(x) = p\sin(x)\cos(x)$ met de $x$-as op $[0, \tfrac{1}{2}\pi]$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $3$.$h12sql$, 0, $h12sql$Hier spelen alle drie de delen: het vlakdeel wordt een integraal, die reken je exact uit, en met die uitkomst vind je $p$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Voor elke $p > 0$ sluit de grafiek van $f(x) = p\sin(x)\cos(x)$ met de $x$-as op $[0, \tfrac{1}{2}\pi]$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $3$.$h12sql$, 1, $h12sql$Op $[0, \tfrac{1}{2}\pi]$ is $\sin(x)\cos(x) \ge 0$. Dus $O(V_p) = \displaystyle\int_{0}^{\frac{1}{2}\pi} p\sin(x)\cos(x)\,\mathrm{d}x$ en $\sin(x)\cos(x) = \tfrac{1}{2}\sin(2x)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Voor elke $p > 0$ sluit de grafiek van $f(x) = p\sin(x)\cos(x)$ met de $x$-as op $[0, \tfrac{1}{2}\pi]$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $3$.$h12sql$, 2, $h12sql$Een primitieve van $\tfrac{1}{2}\sin(2x)$ is $-\tfrac{1}{4}\cos(2x)$. Zonder de $p$ is de integraal van $0$ tot $\tfrac{1}{2}\pi$ gelijk aan $\tfrac{1}{2}$. Dus $O(V_p) = \tfrac{1}{2}p$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Voor elke $p > 0$ sluit de grafiek van $f(x) = p\sin(x)\cos(x)$ met de $x$-as op $[0, \tfrac{1}{2}\pi]$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $3$.$h12sql$, 3, $h12sql$Deel 3: $\tfrac{1}{2}p = 3$, dus $p = 6$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(2x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, 0, $h12sql$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. De inhoud is $\pi$ keer de integraal van $\sin^{2}(2x)$. Op $[0, \tfrac{1}{2}\pi]$ is $\sin(2x) \ge 0$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(2x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, 1, $h12sql$$I(L) = \pi \displaystyle\int_{0}^{\frac{1}{2}\pi} \sin^{2}(2x)\,\mathrm{d}x$ en $\sin^{2}(2x) = \tfrac{1}{2} - \tfrac{1}{2}\cos(4x)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(2x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, 2, $h12sql$Een primitieve van de integrand is $F(x) = \pi\left(\tfrac{1}{2}x - \tfrac{1}{8}\sin(4x)\right)$.$h12sql$),
  ('h12b_toepassing', 'h12b_toepassing', $h12sql$Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(2x)$ en de $x$-as op het domein $[0, \tfrac{1}{2}\pi]$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.$h12sql$, 3, $h12sql$$F\left(\tfrac{1}{2}\pi\right) - F(0) = \pi \cdot \tfrac{1}{4}\pi = \tfrac{1}{4}\pi^{2}$. De inhoud is $\tfrac{1}{4}\pi^{2}$.$h12sql$)
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
  ('h12b_primitiveren', 'h12b'),
  ('h12b_bepaald', 'h12b'),
  ('h12b_toepassing', 'h12b')
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
    AND b.slug = 'h12b'
    AND t.slug IN ('h12b_primitiveren', 'h12b_bepaald', 'h12b_toepassing');
  IF n <> 3 THEN
    RAISE EXCEPTION 'Theorieblok h12b hoort 3 topics te hebben, gevonden %', n;
  END IF;
END $blok$;

-- 7. Controle
DO $do$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'h12b_kwadraat' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h12b_primitiveren' AND site = 'integralen'));
  IF n <> 8 THEN RAISE EXCEPTION 'Cluster h12b_kwadraat hoort 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'h12b_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h12b_primitiveren' AND site = 'integralen'));
  IF n <> 8 THEN RAISE EXCEPTION 'Cluster h12b_product hoort 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'h12b_bepaald' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h12b_bepaald' AND site = 'integralen'));
  IF n <> 8 THEN RAISE EXCEPTION 'Cluster h12b_bepaald hoort 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'h12b_toepassing' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h12b_toepassing' AND site = 'integralen'));
  IF n <> 8 THEN RAISE EXCEPTION 'Cluster h12b_toepassing hoort 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.question_steps_new s
  JOIN public.questions_new vr ON vr.id = s.question_id
  JOIN public.topics_new t ON t.id = vr.topic_id
  WHERE t.site = 'integralen' AND t.slug IN ('h12b_primitiveren', 'h12b_bepaald', 'h12b_toepassing');
  IF n <> 128 THEN RAISE EXCEPTION 'Deze topics horen samen 128 stappen te hebben, gevonden %', n; END IF;
END $do$;

COMMIT;
