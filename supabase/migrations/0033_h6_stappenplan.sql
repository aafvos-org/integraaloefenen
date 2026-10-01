-- =============================================================================
-- Migration 0033: H6 "Machten, wortels en de kettingregel" — herindeling + stappenplan
-- =============================================================================
-- Gegenereerd door scripts/h6-content.ts — niet met de hand bewerken.
-- Spec: docs/h6-afgeleide-berekenen.md
--
-- Kettingregel zonder letters: "buitenkant" en "kern" (u/v = somregel, g/h = product- en
-- quotiëntregel, zoals in H2). Antwoorden zonder negatieve of gebroken exponent.
--
--   • Nieuw topic h6_gemengd + 4 nieuwe clusters; topic h6_machten hertiteld; 1 kapotte vraag vervangen
--   • 66 bestaande vragen: verplaatst/hernummerd, canonieke antwoorden
--   • 30 nieuwe vragen
--   • Alle H6-stappen vervangen door het vaste stappenplan (stap 0 t/m 3)
-- =============================================================================

BEGIN;

-- 1. Nieuw topic
INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default, site)
VALUES ('h6_gemengd', $h2sql$Gemengd: welke regel?$h2sql$, (SELECT id FROM public.chapters WHERE slug = 'h6'), 4, false, 'afgeleiden')
ON CONFLICT (slug) DO NOTHING;
UPDATE public.topics_new SET title = $h2sql$Machten en wortels herschrijven$h2sql$ WHERE slug = 'h6_machten';

-- 2. Nieuwe clusters (hernoemen gebeurt in stap 4, ná het verplaatsen van vragen)
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'), 'negatieve_macht', $h2sql$Negatieve machten$h2sql$, 1, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'), 'uitdelen', $h2sql$Uitdelen vóór differentiëren$h2sql$, 2, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'), 'wortelvorm', $h2sql$Wortels als macht$h2sql$, 3, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'), 'nde_wortel', $h2sql$N-de machtswortels$h2sql$, 4, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'nde_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'), 'gemengd_macht_wortel', $h2sql$Gemengde machten en wortels$h2sql$, 5, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), 'macht_lineair', $h2sql$Macht met lineaire kern$h2sql$, 1, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), 'macht_polynoom', $h2sql$Macht met polynoom-kern$h2sql$, 2, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), 'wortel_lineair', $h2sql$Wortel met lineaire kern$h2sql$, 3, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), 'wortel_polynoom', $h2sql$Wortel met polynoom-kern$h2sql$, 4, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), 'negatieve_macht_expressie', $h2sql$Negatieve macht van een kern$h2sql$, 5, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), 'gebroken_macht_kern', $h2sql$Gebroken macht van een kern$h2sql$, 6, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'gebroken_macht_kern' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), 'ketting_in_som', $h2sql$Kettingregel in een som$h2sql$, 7, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'ketting_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'), 'ketting_plus_product', $h2sql$Kettingregel + productregel$h2sql$, 1, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'), 'ketting_plus_quotient', $h2sql$Kettingregel + quotiëntregel$h2sql$, 2, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), 'welke_regel', $h2sql$Welke regel?$h2sql$, 1, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'));

-- 3. Bestaande vragen bijwerken (herkend op oud cluster + latex_body)
DO $do$
DECLARE n int;
BEGIN
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = \dfrac{6}{x}$h2sql$,
    answer = $h2sql$-6/x^2$h2sql$,
    latex_answer = $h2sql$-\dfrac{6}{x^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-6x^-2$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = \dfrac{6}{x}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{6}{x}$h2sql$, 'negatieve_macht', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = \dfrac{1}{x^{2}}$h2sql$,
    answer = $h2sql$-2/x^3$h2sql$,
    latex_answer = $h2sql$-\dfrac{2}{x^{3}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-2x^-3$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = \dfrac{1}{x^{2}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{1}{x^{2}}$h2sql$, 'negatieve_macht', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = \dfrac{6}{x^{3}}$h2sql$,
    answer = $h2sql$-18/x^4$h2sql$,
    latex_answer = $h2sql$-\dfrac{18}{x^{4}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-18x^-4$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$f(x) = \dfrac{6}{x^{3}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{6}{x^{3}}$h2sql$, 'negatieve_macht', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$g(x) = 5 - \dfrac{3}{x^{2}}$h2sql$,
    answer = $h2sql$6/x^3$h2sql$,
    latex_answer = $h2sql$\dfrac{6}{x^{3}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$6x^-3$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$g(x) = 5 - \dfrac{3}{x^{2}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$g(x) = 5 - \dfrac{3}{x^{2}}$h2sql$, 'negatieve_macht', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$h(x) = ax^{4} - \dfrac{b}{x^{4}}$h2sql$,
    answer = $h2sql$4ax^3 + 4b/x^5$h2sql$,
    latex_answer = $h2sql$4ax^{3} + \dfrac{4b}{x^{5}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$4ax^3+4bx^-5$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$h(x) = ax^{4} - \dfrac{b}{x^{4}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(x) = ax^{4} - \dfrac{b}{x^{4}}$h2sql$, 'negatieve_macht', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = 5x^{2} - \dfrac{5}{x^{2}}$h2sql$,
    answer = $h2sql$10x + 10/x^3$h2sql$,
    latex_answer = $h2sql$10x + \dfrac{10}{x^{3}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$10x+10x^-3$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$f(x) = 5x^{2} - \dfrac{5}{x^{2}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = 5x^{2} - \dfrac{5}{x^{2}}$h2sql$, 'negatieve_macht', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = \dfrac{2x - 1}{x^{3}}$h2sql$,
    answer = $h2sql$-4/x^3 + 3/x^4$h2sql$,
    latex_answer = $h2sql$-\dfrac{4}{x^{3}} + \dfrac{3}{x^{4}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-4x^-3+3x^-4$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = \dfrac{2x - 1}{x^{3}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{2x - 1}{x^{3}}$h2sql$, 'uitdelen', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = \dfrac{x^{3} + 1}{x^{3}}$h2sql$,
    answer = $h2sql$-3/x^4$h2sql$,
    latex_answer = $h2sql$-\dfrac{3}{x^{4}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-3x^-4$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = \dfrac{x^{3} + 1}{x^{3}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{x^{3} + 1}{x^{3}}$h2sql$, 'uitdelen', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$g(x) = \dfrac{x^{2} + 1}{x}$h2sql$,
    answer = $h2sql$1 - 1/x^2$h2sql$,
    latex_answer = $h2sql$1 - \dfrac{1}{x^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$1-x^-2$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$g(x) = \dfrac{x^{2} + 1}{x}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$g(x) = \dfrac{x^{2} + 1}{x}$h2sql$, 'uitdelen', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$h(x) = \dfrac{3x^{6} - 3}{x^{3}}$h2sql$,
    answer = $h2sql$9x^2 + 9/x^4$h2sql$,
    latex_answer = $h2sql$9x^{2} + \dfrac{9}{x^{4}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$9x^2+9x^-4$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$h(x) = \dfrac{3x^{6} - 3}{x^{3}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(x) = \dfrac{3x^{6} - 3}{x^{3}}$h2sql$, 'uitdelen', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = \dfrac{2x^{2} - 5}{2x^{2}}$h2sql$,
    answer = $h2sql$5/x^3$h2sql$,
    latex_answer = $h2sql$\dfrac{5}{x^{3}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$5x^-3$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = \dfrac{2x^{2} - 5}{2x^{2}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{2x^{2} - 5}{2x^{2}}$h2sql$, 'uitdelen', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$h(x) = 6 - \dfrac{x^{2} - 1}{x}$h2sql$,
    answer = $h2sql$-1 - 1/x^2$h2sql$,
    latex_answer = $h2sql$-1 - \dfrac{1}{x^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-1-x^-2$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$f(x) = \dfrac{x^{2} - 1}{6 - x^{2}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{x^{2} - 1}{6 - x^{2}}$h2sql$, 'uitdelen', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = \sqrt{x}$h2sql$,
    answer = $h2sql$1/(2sqrt(x))$h2sql$,
    latex_answer = $h2sql$\dfrac{1}{2\sqrt{x}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$1/2x^(-1/2)$h2sql$, $h2sql$0.5x^-0.5$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = \sqrt{x}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \sqrt{x}$h2sql$, 'wortelvorm', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = 2\sqrt{x}$h2sql$,
    answer = $h2sql$1/(sqrt(x))$h2sql$,
    latex_answer = $h2sql$\dfrac{1}{\sqrt{x}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$x^(-1/2)$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = 2\sqrt{x}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = 2\sqrt{x}$h2sql$, 'wortelvorm', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$g(x) = \sqrt{x} - \dfrac{1}{\sqrt{x}}$h2sql$,
    answer = $h2sql$1/(2sqrt(x)) + 1/(2xsqrt(x))$h2sql$,
    latex_answer = $h2sql$\dfrac{1}{2\sqrt{x}} + \dfrac{1}{2x\sqrt{x}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$1/2x^(-1/2)+1/2x^(-3/2)$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$g(x) = \sqrt{x} - \dfrac{1}{\sqrt{x}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$g(x) = \sqrt{x} - \dfrac{1}{\sqrt{x}}$h2sql$, 'wortelvorm', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = 3\sqrt{x} + 5$h2sql$,
    answer = $h2sql$3/(2sqrt(x))$h2sql$,
    latex_answer = $h2sql$\dfrac{3}{2\sqrt{x}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$1.5x^(-1/2)$h2sql$, $h2sql$1,5/sqrt(x)$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$f(x) = 3\sqrt{x} + 5$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = 3\sqrt{x} + 5$h2sql$, 'wortelvorm', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$h(x) = \dfrac{1}{\sqrt{x}}$h2sql$,
    answer = $h2sql$-1/(2xsqrt(x))$h2sql$,
    latex_answer = $h2sql$-\dfrac{1}{2x\sqrt{x}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-1/2x^(-3/2)$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$h(x) = \dfrac{1}{\sqrt{x}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(x) = \dfrac{1}{\sqrt{x}}$h2sql$, 'wortelvorm', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$k(x) = x^{3} \cdot \sqrt{x}$h2sql$,
    answer = $h2sql$3,5x^2sqrt(x)$h2sql$,
    latex_answer = $h2sql$3{,}5x^{2}\sqrt{x}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$7/2x^2sqrt(x)$h2sql$, $h2sql$3.5x^(5/2)$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$k(x) = x^{3} \cdot \sqrt{x}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$k(x) = x^{3} \cdot \sqrt{x}$h2sql$, 'wortelvorm', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = x \cdot \sqrt{x}$h2sql$,
    answer = $h2sql$1,5sqrt(x)$h2sql$,
    latex_answer = $h2sql$1{,}5\sqrt{x}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$3/2sqrt(x)$h2sql$, $h2sql$1.5x^(1/2)$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = x \cdot \sqrt{x}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = x \cdot \sqrt{x}$h2sql$, 'gemengd_macht_wortel', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = x^{2} \cdot \sqrt{x}$h2sql$,
    answer = $h2sql$2,5xsqrt(x)$h2sql$,
    latex_answer = $h2sql$2{,}5x\sqrt{x}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$5/2xsqrt(x)$h2sql$, $h2sql$2.5x^(3/2)$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = x^{2} \cdot \sqrt{x}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = x^{2} \cdot \sqrt{x}$h2sql$, 'gemengd_macht_wortel', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$g(x) = \dfrac{x}{\sqrt{x}}$h2sql$,
    answer = $h2sql$1/(2sqrt(x))$h2sql$,
    latex_answer = $h2sql$\dfrac{1}{2\sqrt{x}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$1/2x^(-1/2)$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$g(x) = \dfrac{x}{\sqrt{x}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$g(x) = \dfrac{x}{\sqrt{x}}$h2sql$, 'gemengd_macht_wortel', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$h(x) = \dfrac{1}{x\sqrt{x}}$h2sql$,
    answer = $h2sql$-(1,5)/(x^2sqrt(x))$h2sql$,
    latex_answer = $h2sql$-\dfrac{1{,}5}{x^{2}\sqrt{x}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-3/2x^(-5/2)$h2sql$, $h2sql$-1.5x^(-5/2)$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$h(x) = \dfrac{1}{x\sqrt{x}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(x) = \dfrac{1}{x\sqrt{x}}$h2sql$, 'gemengd_macht_wortel', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$k(x) = x^{2}(x\sqrt{x} - 3)$h2sql$,
    answer = $h2sql$3,5x^2sqrt(x) - 6x$h2sql$,
    latex_answer = $h2sql$3{,}5x^{2}\sqrt{x} - 6x$h2sql$,
    answer_alternatives = ARRAY[$h2sql$7/2x^2sqrt(x)-6x$h2sql$, $h2sql$3.5x^(5/2)-6x$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$k(x) = x^{2}(x\sqrt{x} - 3)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$k(x) = x^{2}(x\sqrt{x} - 3)$h2sql$, 'gemengd_macht_wortel', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'),
    latex_body = $h2sql$f(x) = \dfrac{x^{2} - 2}{x\sqrt{x}}$h2sql$,
    answer = $h2sql$(0,5)/(sqrt(x)) + 3/(x^2sqrt(x))$h2sql$,
    latex_answer = $h2sql$\dfrac{0{,}5}{\sqrt{x}} + \dfrac{3}{x^{2}\sqrt{x}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$1/2x^(-1/2)+3x^(-5/2)$h2sql$, $h2sql$1/(2sqrt(x))+3/(x^2sqrt(x))$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$f(x) = \dfrac{x^{2} - 2}{x\sqrt{x}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{x^{2} - 2}{x\sqrt{x}}$h2sql$, 'gemengd_macht_wortel', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = (4x + 3)^{3}$h2sql$,
    answer = $h2sql$12(4x + 3)^2$h2sql$,
    latex_answer = $h2sql$12(4x + 3)^{2}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$3(4x+3)^2*4$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = (4x + 3)^{3}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (4x + 3)^{3}$h2sql$, 'macht_lineair', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = (2x - 1)^{4}$h2sql$,
    answer = $h2sql$8(2x - 1)^3$h2sql$,
    latex_answer = $h2sql$8(2x - 1)^{3}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$4(2x-1)^3*2$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = (2x - 1)^{4}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (2x - 1)^{4}$h2sql$, 'macht_lineair', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$g(x) = 6(\tfrac{1}{2}x - 4)^{5}$h2sql$,
    answer = $h2sql$15(1/2x - 4)^4$h2sql$,
    latex_answer = $h2sql$15(\tfrac{1}{2}x - 4)^{4}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$15(0.5x-4)^4$h2sql$, $h2sql$15(0,5x-4)^4$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$g(x) = 6(\tfrac{1}{2}x - 4)^{5}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$g(x) = 6(\tfrac{1}{2}x - 4)^{5}$h2sql$, 'macht_lineair', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$h(x) = -2(2x + 1)^{4}$h2sql$,
    answer = $h2sql$-16(2x + 1)^3$h2sql$,
    latex_answer = $h2sql$-16(2x + 1)^{3}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-8(2x+1)^3*2$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$h(x) = -2(2x + 1)^{4}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(x) = -2(2x + 1)^{4}$h2sql$, 'macht_lineair', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = (x^{2} + 1)^{3}$h2sql$,
    answer = $h2sql$6x(x^2 + 1)^2$h2sql$,
    latex_answer = $h2sql$6x(x^{2} + 1)^{2}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$3(x^2+1)^2*2x$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = (x^{2} + 1)^{3}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (x^{2} + 1)^{3}$h2sql$, 'macht_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = (4x^{2} - 3)^{4}$h2sql$,
    answer = $h2sql$32x(4x^2 - 3)^3$h2sql$,
    latex_answer = $h2sql$32x(4x^{2} - 3)^{3}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$4(4x^2-3)^3*8x$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = (4x^{2} - 3)^{4}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (4x^{2} - 3)^{4}$h2sql$, 'macht_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$h(x) = (x^{2} - 2x + 3)^{3}$h2sql$,
    answer = $h2sql$3(2x - 2)(x^2 - 2x + 3)^2$h2sql$,
    latex_answer = $h2sql$3(2x - 2)(x^{2} - 2x + 3)^{2}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(6x-6)(x^2-2x+3)^2$h2sql$, $h2sql$3(x^2-2x+3)^2*(2x-2)$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$h(x) = (x^{2} - 2x + 3)^{3}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(x) = (x^{2} - 2x + 3)^{3}$h2sql$, 'macht_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = (x^{2} - 5)^{3}$h2sql$,
    answer = $h2sql$6x(x^2 - 5)^2$h2sql$,
    latex_answer = $h2sql$6x(x^{2} - 5)^{2}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$3(x^2-5)^2*2x$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$f(x) = (x^{2} - 5)^{3}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (x^{2} - 5)^{3}$h2sql$, 'macht_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$g(x) = 4(x^{3} + 7x - 2)^{2}$h2sql$,
    answer = $h2sql$8(3x^2 + 7)(x^3 + 7x - 2)$h2sql$,
    latex_answer = $h2sql$8(3x^{2} + 7)(x^{3} + 7x - 2)$h2sql$,
    answer_alternatives = ARRAY[$h2sql$8(x^3+7x-2)*(3x^2+7)$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$g(x) = 4(x^{3} + 7x - 2)^{2}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$g(x) = 4(x^{3} + 7x - 2)^{2}$h2sql$, 'macht_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}$h2sql$,
    answer = $h2sql$3(x - 2)(1/2x^2 - 2x)^2$h2sql$,
    latex_answer = $h2sql$3(x - 2)(\tfrac{1}{2}x^{2} - 2x)^{2}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$3(0.5x^2-2x)^2*(x-2)$h2sql$, $h2sql$(3x-6)(1/2x^2-2x)^2$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}$h2sql$, 'macht_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = \sqrt{4x + 1}$h2sql$,
    answer = $h2sql$2/(sqrt(4x + 1))$h2sql$,
    latex_answer = $h2sql$\dfrac{2}{\sqrt{4x + 1}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$4/(2sqrt(4x+1))$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = \sqrt{4x + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \sqrt{4x + 1}$h2sql$, 'wortel_lineair', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = \sqrt{3x + 1}$h2sql$,
    answer = $h2sql$3/(2sqrt(3x + 1))$h2sql$,
    latex_answer = $h2sql$\dfrac{3}{2\sqrt{3x + 1}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$1.5/sqrt(3x+1)$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = \sqrt{3x + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \sqrt{3x + 1}$h2sql$, 'wortel_lineair', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$g(x) = \sqrt{2x - 5}$h2sql$,
    answer = $h2sql$1/(sqrt(2x - 5))$h2sql$,
    latex_answer = $h2sql$\dfrac{1}{\sqrt{2x - 5}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$2/(2sqrt(2x-5))$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$g(x) = \sqrt{2x - 5}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$g(x) = \sqrt{2x - 5}$h2sql$, 'wortel_lineair', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$h(x) = 3\sqrt{2x + 1}$h2sql$,
    answer = $h2sql$3/(sqrt(2x + 1))$h2sql$,
    latex_answer = $h2sql$\dfrac{3}{\sqrt{2x + 1}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$6/(2sqrt(2x+1))$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$h(x) = 3\sqrt{2x + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(x) = 3\sqrt{2x + 1}$h2sql$, 'wortel_lineair', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = \dfrac{1}{\sqrt{4x - 1}}$h2sql$,
    answer = $h2sql$-2/((4x - 1)sqrt(4x - 1))$h2sql$,
    latex_answer = $h2sql$-\dfrac{2}{(4x - 1)\sqrt{4x - 1}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-2(4x-1)^(-3/2)$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = \dfrac{1}{\sqrt{4x - 1}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{1}{\sqrt{4x - 1}}$h2sql$, 'wortel_lineair', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$k(x) = 5\sqrt{3x - 2} + 7$h2sql$,
    answer = $h2sql$15/(2sqrt(3x - 2))$h2sql$,
    latex_answer = $h2sql$\dfrac{15}{2\sqrt{3x - 2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$7.5/sqrt(3x-2)$h2sql$, $h2sql$7,5/sqrt(3x-2)$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$k(x) = 5\sqrt{3x - 2} + 7$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$k(x) = 5\sqrt{3x - 2} + 7$h2sql$, 'wortel_lineair', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = \sqrt{x^{2} + 1}$h2sql$,
    answer = $h2sql$x/(sqrt(x^2 + 1))$h2sql$,
    latex_answer = $h2sql$\dfrac{x}{\sqrt{x^{2} + 1}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$2x/(2sqrt(x^2+1))$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = \sqrt{x^{2} + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \sqrt{x^{2} + 1}$h2sql$, 'wortel_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = \sqrt{x^{2} + 9}$h2sql$,
    answer = $h2sql$x/(sqrt(x^2 + 9))$h2sql$,
    latex_answer = $h2sql$\dfrac{x}{\sqrt{x^{2} + 9}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$2x/(2sqrt(x^2+9))$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = \sqrt{x^{2} + 9}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \sqrt{x^{2} + 9}$h2sql$, 'wortel_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$g(x) = \sqrt{2x^{2} + 4x}$h2sql$,
    answer = $h2sql$(2x + 2)/(sqrt(2x^2 + 4x))$h2sql$,
    latex_answer = $h2sql$\dfrac{2x + 2}{\sqrt{2x^{2} + 4x}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(4x+4)/(2sqrt(2x^2+4x))$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$g(x) = \sqrt{2x^{2} + 4x}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$g(x) = \sqrt{2x^{2} + 4x}$h2sql$, 'wortel_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$h(x) = \sqrt{x^{3} + 3x}$h2sql$,
    answer = $h2sql$(3x^2 + 3)/(2sqrt(x^3 + 3x))$h2sql$,
    latex_answer = $h2sql$\dfrac{3x^{2} + 3}{2\sqrt{x^{3} + 3x}}$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$h(x) = \sqrt{x^{3} + 3x}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(x) = \sqrt{x^{3} + 3x}$h2sql$, 'wortel_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = \sqrt{x^{2} + 2x + 3}$h2sql$,
    answer = $h2sql$(x + 1)/(sqrt(x^2 + 2x + 3))$h2sql$,
    latex_answer = $h2sql$\dfrac{x + 1}{\sqrt{x^{2} + 2x + 3}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(2x+2)/(2sqrt(x^2+2x+3))$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = \sqrt{x^{2} + 2x + 3}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \sqrt{x^{2} + 2x + 3}$h2sql$, 'wortel_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$k(x) = 5\sqrt{2x^{4} + x^{2}}$h2sql$,
    answer = $h2sql$(5(4x^3 + x))/(sqrt(2x^4 + x^2))$h2sql$,
    latex_answer = $h2sql$\dfrac{5(4x^{3} + x)}{\sqrt{2x^{4} + x^{2}}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$5(8x^3+2x)/(2sqrt(2x^4+x^2))$h2sql$, $h2sql$(20x^3+5x)/sqrt(2x^4+x^2)$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$k(x) = 5\sqrt{2x^{4} + x^{2}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$k(x) = 5\sqrt{2x^{4} + x^{2}}$h2sql$, 'wortel_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = \dfrac{1}{(2x + 1)^{2}}$h2sql$,
    answer = $h2sql$-4/(2x + 1)^3$h2sql$,
    latex_answer = $h2sql$-\dfrac{4}{(2x + 1)^{3}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-4(2x+1)^-3$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = \dfrac{1}{(2x + 1)^{2}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{1}{(2x + 1)^{2}}$h2sql$, 'negatieve_macht_expressie', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = \dfrac{1}{(3x - 2)^{3}}$h2sql$,
    answer = $h2sql$-9/(3x - 2)^4$h2sql$,
    latex_answer = $h2sql$-\dfrac{9}{(3x - 2)^{4}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-9(3x-2)^-4$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = \dfrac{1}{(3x - 2)^{3}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{1}{(3x - 2)^{3}}$h2sql$, 'negatieve_macht_expressie', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$g(x) = \dfrac{5}{(2x^{3} - 7x)^{4}}$h2sql$,
    answer = $h2sql$-(20(6x^2 - 7))/(2x^3 - 7x)^5$h2sql$,
    latex_answer = $h2sql$-\dfrac{20(6x^{2} - 7)}{(2x^{3} - 7x)^{5}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-20(6x^2-7)(2x^3-7x)^-5$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$g(x) = \dfrac{5}{(2x^{3} - 7x)^{4}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$g(x) = \dfrac{5}{(2x^{3} - 7x)^{4}}$h2sql$, 'negatieve_macht_expressie', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$h(x) = \dfrac{6}{(x^{2} + 3x)^{3}}$h2sql$,
    answer = $h2sql$-(18(2x + 3))/(x^2 + 3x)^4$h2sql$,
    latex_answer = $h2sql$-\dfrac{18(2x + 3)}{(x^{2} + 3x)^{4}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-18(2x+3)(x^2+3x)^-4$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$h(x) = \dfrac{6}{(x^{2} + 3x)^{3}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(x) = \dfrac{6}{(x^{2} + 3x)^{3}}$h2sql$, 'negatieve_macht_expressie', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = \dfrac{3}{\sqrt{2x + 1}}$h2sql$,
    answer = $h2sql$-3/((2x + 1)sqrt(2x + 1))$h2sql$,
    latex_answer = $h2sql$-\dfrac{3}{(2x + 1)\sqrt{2x + 1}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-3(2x+1)^(-3/2)$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = \dfrac{3}{\sqrt{2x + 1}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{3}{\sqrt{2x + 1}}$h2sql$, 'negatieve_macht_expressie', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$k(x) = \dfrac{2}{\sqrt{x^{2} + 4}}$h2sql$,
    answer = $h2sql$-2x/((x^2 + 4)sqrt(x^2 + 4))$h2sql$,
    latex_answer = $h2sql$-\dfrac{2x}{(x^{2} + 4)\sqrt{x^{2} + 4}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-2x(x^2+4)^(-3/2)$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$k(x) = \dfrac{2}{\sqrt{x^{2} + 4}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$k(x) = \dfrac{2}{\sqrt{x^{2} + 4}}$h2sql$, 'negatieve_macht_expressie', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$k(x) = 3x^{2} - \tfrac{1}{2}(x - 2)^{3}$h2sql$,
    answer = $h2sql$6x - 1,5(x - 2)^2$h2sql$,
    latex_answer = $h2sql$6x - 1{,}5(x - 2)^{2}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$6x-3/2(x-2)^2$h2sql$, $h2sql$6x-1.5(x-2)^2$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$k(x) = 3x^{2} - \tfrac{1}{2}(x - 2)^{3}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$k(x) = 3x^{2} - \tfrac{1}{2}(x - 2)^{3}$h2sql$, 'macht_lineair', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'),
    latex_body = $h2sql$f(x) = 5x - \dfrac{4}{(3x + 2)^{3}}$h2sql$,
    answer = $h2sql$5 + 36/(3x + 2)^4$h2sql$,
    latex_answer = $h2sql$5 + \dfrac{36}{(3x + 2)^{4}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$5+36(3x+2)^-4$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = 5x - \dfrac{4}{(3x + 2)^{3}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = 5x - \dfrac{4}{(3x + 2)^{3}}$h2sql$, 'macht_lineair', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'),
    latex_body = $h2sql$f(x) = x\sqrt{2x + 1}$h2sql$,
    answer = $h2sql$sqrt(2x + 1) + x/(sqrt(2x + 1))$h2sql$,
    latex_answer = $h2sql$\sqrt{2x + 1} + \dfrac{x}{\sqrt{2x + 1}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(3x+1)/sqrt(2x+1)$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = x\sqrt{2x + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = x\sqrt{2x + 1}$h2sql$, 'ketting_plus_product', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'),
    latex_body = $h2sql$f(x) = x(2x + 1)^{3}$h2sql$,
    answer = $h2sql$(2x + 1)^3 + 6x(2x + 1)^2$h2sql$,
    latex_answer = $h2sql$(2x + 1)^{3} + 6x(2x + 1)^{2}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(2x+1)^2(8x+1)$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = x(2x + 1)^{3}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = x(2x + 1)^{3}$h2sql$, 'ketting_plus_product', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'),
    latex_body = $h2sql$g(x) = x\sqrt{3x + 1}$h2sql$,
    answer = $h2sql$sqrt(3x + 1) + 3x/(2sqrt(3x + 1))$h2sql$,
    latex_answer = $h2sql$\sqrt{3x + 1} + \dfrac{3x}{2\sqrt{3x + 1}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(9x+2)/(2sqrt(3x+1))$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$g(x) = x\sqrt{3x + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$g(x) = x\sqrt{3x + 1}$h2sql$, 'ketting_plus_product', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'),
    latex_body = $h2sql$h(x) = x(3x + 1)^{3}$h2sql$,
    answer = $h2sql$(3x + 1)^3 + 9x(3x + 1)^2$h2sql$,
    latex_answer = $h2sql$(3x + 1)^{3} + 9x(3x + 1)^{2}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(3x+1)^2(12x+1)$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$h(x) = x(3x + 1)^{3}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(x) = x(3x + 1)^{3}$h2sql$, 'ketting_plus_product', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'),
    latex_body = $h2sql$f(x) = x^{2}\sqrt{x + 1}$h2sql$,
    answer = $h2sql$2xsqrt(x + 1) + x^2/(2sqrt(x + 1))$h2sql$,
    latex_answer = $h2sql$2x\sqrt{x + 1} + \dfrac{x^{2}}{2\sqrt{x + 1}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(5x^2+4x)/(2sqrt(x+1))$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = x^{2}\sqrt{x + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = x^{2}\sqrt{x + 1}$h2sql$, 'ketting_plus_product', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'),
    latex_body = $h2sql$k(x) = (x + 1)(2x - 1)^{3}$h2sql$,
    answer = $h2sql$(2x - 1)^3 + 6(x + 1)(2x - 1)^2$h2sql$,
    latex_answer = $h2sql$(2x - 1)^{3} + 6(x + 1)(2x - 1)^{2}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(2x-1)^2(8x+5)$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$k(x) = (x + 1)(2x - 1)^{3}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$k(x) = (x + 1)(2x - 1)^{3}$h2sql$, 'ketting_plus_product', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'),
    latex_body = $h2sql$f(x) = \dfrac{x + 6}{\sqrt{8x + 9}}$h2sql$,
    answer = $h2sql$(sqrt(8x + 9) - (4(x + 6))/(sqrt(8x + 9)))/(8x + 9)$h2sql$,
    latex_answer = $h2sql$\dfrac{\sqrt{8x + 9} - \dfrac{4(x + 6)}{\sqrt{8x + 9}}}{8x + 9}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(4x-15)/((8x+9)sqrt(8x+9))$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = \dfrac{x + 6}{\sqrt{8x + 9}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{x + 6}{\sqrt{8x + 9}}$h2sql$, 'ketting_plus_quotient', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'),
    latex_body = $h2sql$f(x) = \dfrac{x}{\sqrt{2x + 1}}$h2sql$,
    answer = $h2sql$(sqrt(2x + 1) - x/(sqrt(2x + 1)))/(2x + 1)$h2sql$,
    latex_answer = $h2sql$\dfrac{\sqrt{2x + 1} - \dfrac{x}{\sqrt{2x + 1}}}{2x + 1}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(x+1)/((2x+1)sqrt(2x+1))$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = \dfrac{x}{\sqrt{2x + 1}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{x}{\sqrt{2x + 1}}$h2sql$, 'ketting_plus_quotient', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'),
    latex_body = $h2sql$g(x) = \dfrac{\sqrt{x^{2} + 1}}{2x + 1}$h2sql$,
    answer = $h2sql$((x(2x + 1))/(sqrt(x^2 + 1)) - 2sqrt(x^2 + 1))/(2x + 1)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{\dfrac{x(2x + 1)}{\sqrt{x^{2} + 1}} - 2\sqrt{x^{2} + 1}}{(2x + 1)^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(x(2x+1)/sqrt(x^2+1)-2sqrt(x^2+1))/(2x+1)^2$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$g(x) = \dfrac{\sqrt{x^{2} + 1}}{2x + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$g(x) = \dfrac{\sqrt{x^{2} + 1}}{2x + 1}$h2sql$, 'ketting_plus_quotient', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'),
    latex_body = $h2sql$h(x) = \dfrac{x^{2} - 1}{\sqrt{4x + 1}}$h2sql$,
    answer = $h2sql$(2xsqrt(4x + 1) - (2(x^2 - 1))/(sqrt(4x + 1)))/(4x + 1)$h2sql$,
    latex_answer = $h2sql$\dfrac{2x\sqrt{4x + 1} - \dfrac{2(x^{2} - 1)}{\sqrt{4x + 1}}}{4x + 1}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(2xsqrt(4x+1)-2(x^2-1)/sqrt(4x+1))/(4x+1)$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$h(x) = \dfrac{x^{2} - 1}{\sqrt{4x + 1}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(x) = \dfrac{x^{2} - 1}{\sqrt{4x + 1}}$h2sql$, 'ketting_plus_quotient', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'),
    latex_body = $h2sql$f(x) = \dfrac{(2x + 1)^{2}}{x + 1}$h2sql$,
    answer = $h2sql$(4(2x + 1)(x + 1) - (2x + 1)^2)/(x + 1)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{4(2x + 1)(x + 1) - (2x + 1)^{2}}{(x + 1)^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(2x+1)(2x+3)/(x+1)^2$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = \dfrac{(2x + 1)^{2}}{x + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{(2x + 1)^{2}}{x + 1}$h2sql$, 'ketting_plus_quotient', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'),
    latex_body = $h2sql$k(x) = \dfrac{x^{2} + 1}{(3x - 2)^{2}}$h2sql$,
    answer = $h2sql$(2x(3x - 2)^2 - 6(x^2 + 1)(3x - 2))/(3x - 2)^4$h2sql$,
    latex_answer = $h2sql$\dfrac{2x(3x - 2)^{2} - 6(x^{2} + 1)(3x - 2)}{(3x - 2)^{4}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(2x(3x-2)-6(x^2+1))/(3x-2)^3$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$k(x) = \dfrac{x^{2} + 1}{(3x - 2)^{2}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$k(x) = \dfrac{x^{2} + 1}{(3x - 2)^{2}}$h2sql$, 'ketting_plus_quotient', n; END IF;
END $do$;

-- 4. Clusters hernoemen en hertitelen (id blijft; voortgang en video-koppelingen blijven werken)
UPDATE public.topic_clusters_new SET slug = 'negatieve_macht', title = $h2sql$Negatieve machten$h2sql$, order_index = 1
WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten');
UPDATE public.topic_clusters_new SET slug = 'uitdelen', title = $h2sql$Uitdelen vóór differentiëren$h2sql$, order_index = 2
WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten');
UPDATE public.topic_clusters_new SET slug = 'wortelvorm', title = $h2sql$Wortels als macht$h2sql$, order_index = 3
WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten');
UPDATE public.topic_clusters_new SET slug = 'nde_wortel', title = $h2sql$N-de machtswortels$h2sql$, order_index = 4
WHERE slug = 'nde_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten');
UPDATE public.topic_clusters_new SET slug = 'gemengd_macht_wortel', title = $h2sql$Gemengde machten en wortels$h2sql$, order_index = 5
WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten');
UPDATE public.topic_clusters_new SET slug = 'macht_lineair', title = $h2sql$Macht met lineaire kern$h2sql$, order_index = 1
WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel');
UPDATE public.topic_clusters_new SET slug = 'macht_polynoom', title = $h2sql$Macht met polynoom-kern$h2sql$, order_index = 2
WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel');
UPDATE public.topic_clusters_new SET slug = 'wortel_lineair', title = $h2sql$Wortel met lineaire kern$h2sql$, order_index = 3
WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel');
UPDATE public.topic_clusters_new SET slug = 'wortel_polynoom', title = $h2sql$Wortel met polynoom-kern$h2sql$, order_index = 4
WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel');
UPDATE public.topic_clusters_new SET slug = 'negatieve_macht_expressie', title = $h2sql$Negatieve macht van een kern$h2sql$, order_index = 5
WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel');
UPDATE public.topic_clusters_new SET slug = 'gebroken_macht_kern', title = $h2sql$Gebroken macht van een kern$h2sql$, order_index = 6
WHERE slug = 'gebroken_macht_kern' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel');
UPDATE public.topic_clusters_new SET slug = 'ketting_in_som', title = $h2sql$Kettingregel in een som$h2sql$, order_index = 7
WHERE slug = 'ketting_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel');
UPDATE public.topic_clusters_new SET slug = 'ketting_plus_product', title = $h2sql$Kettingregel + productregel$h2sql$, order_index = 1
WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties');
UPDATE public.topic_clusters_new SET slug = 'ketting_plus_quotient', title = $h2sql$Kettingregel + quotiëntregel$h2sql$, order_index = 2
WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties');
UPDATE public.topic_clusters_new SET slug = 'welke_regel', title = $h2sql$Welke regel?$h2sql$, order_index = 1
WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd');

-- 5. Nieuwe vragen
INSERT INTO public.questions_new (topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, is_ai_generated, order_index, answer_alternatives, site) VALUES
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_machten'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'nde_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')), $h2sql$f(x) = \sqrt[3]{x}$h2sql$, $h2sql$1/(3(x^2)^(1/3))$h2sql$, $h2sql$\dfrac{1}{3\sqrt[3]{x^{2}}}$h2sql$, 1, true, 1, ARRAY[$h2sql$1/3x^(-2/3)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_machten'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'nde_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')), $h2sql$f(x) = \sqrt[4]{x}$h2sql$, $h2sql$1/(4(x^3)^(1/4))$h2sql$, $h2sql$\dfrac{1}{4\sqrt[4]{x^{3}}}$h2sql$, 1, true, 2, ARRAY[$h2sql$1/4x^(-3/4)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_machten'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'nde_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')), $h2sql$g(x) = \sqrt[3]{x^{2}}$h2sql$, $h2sql$2/(3(x)^(1/3))$h2sql$, $h2sql$\dfrac{2}{3\sqrt[3]{x}}$h2sql$, 2, true, 3, ARRAY[$h2sql$2/3x^(-1/3)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_machten'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'nde_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')), $h2sql$f(x) = x \cdot \sqrt[3]{x}$h2sql$, $h2sql$4/3(x)^(1/3)$h2sql$, $h2sql$\tfrac{4}{3}\sqrt[3]{x}$h2sql$, 2, true, 4, ARRAY[$h2sql$4/3x^(1/3)$h2sql$, $h2sql$1 1/3 (x)^(1/3)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_machten'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'nde_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')), $h2sql$k(x) = x^{3} \cdot \sqrt[5]{x^{3}}$h2sql$, $h2sql$3,6x^2(x^3)^(1/5)$h2sql$, $h2sql$3{,}6x^{2}\sqrt[5]{x^{3}}$h2sql$, 3, true, 5, ARRAY[$h2sql$18/5x^(13/5)$h2sql$, $h2sql$3.6x^(13/5)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_machten'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'nde_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten')), $h2sql$f(x) = x^{2} \cdot \sqrt[4]{x}$h2sql$, $h2sql$2,25x(x)^(1/4)$h2sql$, $h2sql$2{,}25x\sqrt[4]{x}$h2sql$, 3, true, 6, ARRAY[$h2sql$9/4x^(5/4)$h2sql$, $h2sql$2.25x^(5/4)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')), $h2sql$f(x) = (5 - 2x)^{6}$h2sql$, $h2sql$-12(5 - 2x)^5$h2sql$, $h2sql$-12(5 - 2x)^{5}$h2sql$, 3, true, 5, ARRAY[$h2sql$6(5-2x)^5*-2$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')), $h2sql$f(x) = \tfrac{1}{4}(2x - 3)^{4}$h2sql$, $h2sql$2(2x - 3)^3$h2sql$, $h2sql$2(2x - 3)^{3}$h2sql$, 3, true, 6, ARRAY[$h2sql$(2x-3)^3*2$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'gebroken_macht_kern' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')), $h2sql$f(x) = (2x + 1)\sqrt{2x + 1}$h2sql$, $h2sql$3sqrt(2x + 1)$h2sql$, $h2sql$3\sqrt{2x + 1}$h2sql$, 1, true, 1, ARRAY[$h2sql$1.5(2x+1)^(1/2)*2$h2sql$, $h2sql$3(2x+1)^(1/2)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'gebroken_macht_kern' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')), $h2sql$f(x) = (x^{2} + 3)\sqrt{x^{2} + 3}$h2sql$, $h2sql$3xsqrt(x^2 + 3)$h2sql$, $h2sql$3x\sqrt{x^{2} + 3}$h2sql$, 1, true, 2, ARRAY[$h2sql$1.5(x^2+3)^(1/2)*2x$h2sql$, $h2sql$3x(x^2+3)^(1/2)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'gebroken_macht_kern' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')), $h2sql$g(x) = \dfrac{x^{2} + 4}{\sqrt{x^{2} + 4}}$h2sql$, $h2sql$x/(sqrt(x^2 + 4))$h2sql$, $h2sql$\dfrac{x}{\sqrt{x^{2} + 4}}$h2sql$, 2, true, 3, ARRAY[$h2sql$2x/(2sqrt(x^2+4))$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'gebroken_macht_kern' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')), $h2sql$h(x) = \sqrt[3]{x^{3} + 3x}$h2sql$, $h2sql$(x^2 + 1)/(((x^3 + 3x)^2)^(1/3))$h2sql$, $h2sql$\dfrac{x^{2} + 1}{\sqrt[3]{(x^{3} + 3x)^{2}}}$h2sql$, 2, true, 4, ARRAY[$h2sql$(3x^2+3)/(3(x^3+3x)^(2/3))$h2sql$, $h2sql$1/3(x^3+3x)^(-2/3)*(3x^2+3)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'gebroken_macht_kern' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')), $h2sql$f(x) = \dfrac{1}{(4 - x)\sqrt{4 - x}}$h2sql$, $h2sql$(1,5)/((4 - x)^2sqrt(4 - x))$h2sql$, $h2sql$\dfrac{1{,}5}{(4 - x)^{2}\sqrt{4 - x}}$h2sql$, 3, true, 5, ARRAY[$h2sql$1.5(4-x)^(-5/2)$h2sql$, $h2sql$3/(2(4-x)^2sqrt(4-x))$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'gebroken_macht_kern' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')), $h2sql$k(x) = \sqrt[3]{(2x - 1)^{2}}$h2sql$, $h2sql$4/(3(2x - 1)^(1/3))$h2sql$, $h2sql$\dfrac{4}{3\sqrt[3]{2x - 1}}$h2sql$, 3, true, 6, ARRAY[$h2sql$4/3(2x-1)^(-1/3)$h2sql$, $h2sql$2/3(2x-1)^(-1/3)*2$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')), $h2sql$f(x) = x^{2} + (2x + 1)^{4}$h2sql$, $h2sql$2x + 8(2x + 1)^3$h2sql$, $h2sql$2x + 8(2x + 1)^{3}$h2sql$, 1, true, 1, ARRAY[$h2sql$2x+4(2x+1)^3*2$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')), $h2sql$h(x) = 3x^{2} - (\tfrac{1}{4}x - 2)^{3}$h2sql$, $h2sql$6x - 3/4(1/4x - 2)^2$h2sql$, $h2sql$6x - \tfrac{3}{4}(\tfrac{1}{4}x - 2)^{2}$h2sql$, 2, true, 3, ARRAY[$h2sql$6x-0.75(0.25x-2)^2$h2sql$, $h2sql$6x-3(1/4x-2)^2*1/4$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')), $h2sql$f(x) = (\tfrac{1}{4}x - 1)^{4} - x + 2$h2sql$, $h2sql$(1/4x - 1)^3 - 1$h2sql$, $h2sql$(\tfrac{1}{4}x - 1)^{3} - 1$h2sql$, 2, true, 4, ARRAY[$h2sql$(0.25x-1)^3-1$h2sql$, $h2sql$4(1/4x-1)^3*1/4-1$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel')), $h2sql$f(x) = \sqrt{x^{2} + 9} - x^{2} + 5x$h2sql$, $h2sql$x/(sqrt(x^2 + 9)) - 2x + 5$h2sql$, $h2sql$\dfrac{x}{\sqrt{x^{2} + 9}} - 2x + 5$h2sql$, 3, true, 6, ARRAY[$h2sql$2x/(2sqrt(x^2+9))-2x+5$h2sql$, $h2sql$x/sqrt(x^2+9)-(2x-5)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd')), $h2sql$f(x) = \dfrac{4}{x^{3}}$h2sql$, $h2sql$-12/x^4$h2sql$, $h2sql$-\dfrac{12}{x^{4}}$h2sql$, 1, true, 1, ARRAY[$h2sql$-12x^-4$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd')), $h2sql$f(x) = (3x - 1)^{4}$h2sql$, $h2sql$12(3x - 1)^3$h2sql$, $h2sql$12(3x - 1)^{3}$h2sql$, 1, true, 2, ARRAY[$h2sql$4(3x-1)^3*3$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd')), $h2sql$f(x) = \dfrac{x^{3} + 5x^{2}}{x}$h2sql$, $h2sql$2x + 5$h2sql$, $h2sql$2x + 5$h2sql$, 1, true, 3, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd')), $h2sql$f(x) = (x^{2} - 4)(x^{3} + 1)$h2sql$, $h2sql$2x(x^3 + 1) + (x^2 - 4) * 3x^2$h2sql$, $h2sql$2x(x^{3} + 1) + (x^{2} - 4) \cdot 3x^{2}$h2sql$, 1, true, 4, ARRAY[$h2sql$5x^4-12x^2+2x$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd')), $h2sql$f(x) = \dfrac{2x^{3}}{x^{2} + 4}$h2sql$, $h2sql$(2x^4 + 24x^2)/(x^2 + 4)^2$h2sql$, $h2sql$\dfrac{2x^{4} + 24x^{2}}{(x^{2} + 4)^{2}}$h2sql$, 2, true, 5, ARRAY[$h2sql$(6x^2(x^2+4)-2x^3*2x)/(x^2+4)^2$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd')), $h2sql$g(x) = \dfrac{x^{2} + 4}{2x^{3}}$h2sql$, $h2sql$-1/2x^2 - 6/x^4$h2sql$, $h2sql$-\dfrac{1}{2x^{2}} - \dfrac{6}{x^{4}}$h2sql$, 2, true, 6, ARRAY[$h2sql$-1/2x^-2-6x^-4$h2sql$, $h2sql$-0.5/x^2-6/x^4$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd')), $h2sql$f(x) = \sqrt{5x - 2}$h2sql$, $h2sql$5/(2sqrt(5x - 2))$h2sql$, $h2sql$\dfrac{5}{2\sqrt{5x - 2}}$h2sql$, 2, true, 7, ARRAY[$h2sql$2.5/sqrt(5x-2)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd')), $h2sql$f(x) = x\sqrt{x} - 3x$h2sql$, $h2sql$1,5sqrt(x) - 3$h2sql$, $h2sql$1{,}5\sqrt{x} - 3$h2sql$, 2, true, 8, ARRAY[$h2sql$3/2sqrt(x)-3$h2sql$, $h2sql$1.5x^(1/2)-3$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd')), $h2sql$f(x) = x(x^{2} + 1)^{4}$h2sql$, $h2sql$(x^2 + 1)^4 + 8x^2(x^2 + 1)^3$h2sql$, $h2sql$(x^{2} + 1)^{4} + 8x^{2}(x^{2} + 1)^{3}$h2sql$, 3, true, 9, ARRAY[$h2sql$(x^2+1)^3(9x^2+1)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd')), $h2sql$f(x) = \dfrac{6}{(x^{2} + 1)^{2}}$h2sql$, $h2sql$-24x/(x^2 + 1)^3$h2sql$, $h2sql$-\dfrac{24x}{(x^{2} + 1)^{3}}$h2sql$, 3, true, 10, ARRAY[$h2sql$-24x(x^2+1)^-3$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd')), $h2sql$h(x) = \dfrac{x + 2}{4x}$h2sql$, $h2sql$-1/2x^2$h2sql$, $h2sql$-\dfrac{1}{2x^{2}}$h2sql$, 3, true, 11, ARRAY[$h2sql$-1/2x^-2$h2sql$, $h2sql$-0.5/x^2$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd')), $h2sql$f(x) = \dfrac{2}{x\sqrt{x}} - x^{2}$h2sql$, $h2sql$-3/(x^2sqrt(x)) - 2x$h2sql$, $h2sql$-\dfrac{3}{x^{2}\sqrt{x}} - 2x$h2sql$, 3, true, 12, ARRAY[$h2sql$-3x^(-5/2)-2x$h2sql$]::text[], 'afgeleiden');

-- 6. Alle H6-stappen vervangen
DELETE FROM public.question_steps_new WHERE question_id IN (SELECT id FROM public.questions_new WHERE topic_id IN (SELECT id FROM public.topics_new WHERE chapter_id = (SELECT id FROM public.chapters WHERE slug = 'h6')));

INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, s.step_order, s.description
FROM (VALUES
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = \dfrac{6}{x}$h2sql$, 0, $h2sql$Buitenste schil: een getal gedeeld door een macht van $x$ → herschrijf als negatieve macht, $\dfrac{a}{x^n} = ax^{-n}$, dan de machtsregel.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = \dfrac{6}{x}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = 6x^{-1}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = \dfrac{6}{x}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[6x^{-1}]' = -6x^{-2}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = \dfrac{6}{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = -\dfrac{6}{x^2}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = \dfrac{1}{x^{2}}$h2sql$, 0, $h2sql$Buitenste schil: een getal gedeeld door een macht van $x$ → herschrijf als negatieve macht, $\dfrac{a}{x^n} = ax^{-n}$, dan de machtsregel.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = \dfrac{1}{x^{2}}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = x^{-2}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = \dfrac{1}{x^{2}}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{-2}]' = -2x^{-3}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = \dfrac{1}{x^{2}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = -\dfrac{2}{x^3}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = \dfrac{6}{x^{3}}$h2sql$, 0, $h2sql$Buitenste schil: een getal gedeeld door een macht van $x$ → herschrijf als negatieve macht, $\dfrac{a}{x^n} = ax^{-n}$, dan de machtsregel.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = \dfrac{6}{x^{3}}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = 6x^{-3}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = \dfrac{6}{x^{3}}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[6x^{-3}]' = -18x^{-4}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = \dfrac{6}{x^{3}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = -\dfrac{18}{x^4}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$g(x) = 5 - \dfrac{3}{x^{2}}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen een getal en een breuk met alleen een macht van $x$ eronder → somregel; de breuk herschrijf je als negatieve macht.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$g(x) = 5 - \dfrac{3}{x^{2}}$h2sql$, 1, $h2sql$Herschrijf als macht: $g(x) = 5 - 3x^{-2}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$g(x) = 5 - \dfrac{3}{x^{2}}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[5]' = 0$, $[-3x^{-2}]' = 6x^{-3}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$g(x) = 5 - \dfrac{3}{x^{2}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $g'(x) = \dfrac{6}{x^3}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$h(x) = ax^{4} - \dfrac{b}{x^{4}}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee termen → somregel; $a$ en $b$ zijn getallen, de breuk herschrijf je als negatieve macht.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$h(x) = ax^{4} - \dfrac{b}{x^{4}}$h2sql$, 1, $h2sql$Herschrijf als macht: $h(x) = ax^4 - bx^{-4}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$h(x) = ax^{4} - \dfrac{b}{x^{4}}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[ax^4]' = 4ax^3$, $[-bx^{-4}]' = 4bx^{-5}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$h(x) = ax^{4} - \dfrac{b}{x^{4}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $h'(x) = 4ax^3 + \dfrac{4b}{x^5}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = 5x^{2} - \dfrac{5}{x^{2}}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee termen → somregel; de breuk herschrijf je als negatieve macht.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = 5x^{2} - \dfrac{5}{x^{2}}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = 5x^2 - 5x^{-2}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = 5x^{2} - \dfrac{5}{x^{2}}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[5x^2]' = 10x$, $[-5x^{-2}]' = 10x^{-3}$.$h2sql$),
  ('h6_machten', 'negatieve_macht', $h2sql$f(x) = 5x^{2} - \dfrac{5}{x^{2}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = 10x + \dfrac{10}{x^3}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$f(x) = \dfrac{2x - 1}{x^{3}}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met één term in de noemer → deel uit, dan termsgewijs (geen quotiëntregel nodig).$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$f(x) = \dfrac{2x - 1}{x^{3}}$h2sql$, 1, $h2sql$Deel uit: $f(x) = \dfrac{2x}{x^3} - \dfrac{1}{x^3} = 2x^{-2} - x^{-3}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$f(x) = \dfrac{2x - 1}{x^{3}}$h2sql$, 2, $h2sql$Machtsregel per term: $[2x^{-2}]' = -4x^{-3}$, $[-x^{-3}]' = 3x^{-4}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$f(x) = \dfrac{2x - 1}{x^{3}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve exponent: $f'(x) = -\dfrac{4}{x^3} + \dfrac{3}{x^4}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$f(x) = \dfrac{x^{3} + 1}{x^{3}}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met één term in de noemer → deel uit, dan termsgewijs (geen quotiëntregel nodig).$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$f(x) = \dfrac{x^{3} + 1}{x^{3}}$h2sql$, 1, $h2sql$Deel uit: $f(x) = \dfrac{x^3}{x^3} + \dfrac{1}{x^3} = 1 + x^{-3}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$f(x) = \dfrac{x^{3} + 1}{x^{3}}$h2sql$, 2, $h2sql$Machtsregel per term: $[1]' = 0$, $[x^{-3}]' = -3x^{-4}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$f(x) = \dfrac{x^{3} + 1}{x^{3}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve exponent: $f'(x) = -\dfrac{3}{x^4}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$g(x) = \dfrac{x^{2} + 1}{x}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met één term in de noemer → deel uit, dan termsgewijs (geen quotiëntregel nodig).$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$g(x) = \dfrac{x^{2} + 1}{x}$h2sql$, 1, $h2sql$Deel uit: $g(x) = \dfrac{x^2}{x} + \dfrac{1}{x} = x + x^{-1}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$g(x) = \dfrac{x^{2} + 1}{x}$h2sql$, 2, $h2sql$Machtsregel per term: $[x]' = 1$, $[x^{-1}]' = -x^{-2}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$g(x) = \dfrac{x^{2} + 1}{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve exponent: $g'(x) = 1 - \dfrac{1}{x^2}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$h(x) = \dfrac{3x^{6} - 3}{x^{3}}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met één term in de noemer → deel uit, dan termsgewijs (geen quotiëntregel nodig).$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$h(x) = \dfrac{3x^{6} - 3}{x^{3}}$h2sql$, 1, $h2sql$Deel uit: $h(x) = \dfrac{3x^6}{x^3} - \dfrac{3}{x^3} = 3x^3 - 3x^{-3}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$h(x) = \dfrac{3x^{6} - 3}{x^{3}}$h2sql$, 2, $h2sql$Machtsregel per term: $[3x^3]' = 9x^2$, $[-3x^{-3}]' = 9x^{-4}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$h(x) = \dfrac{3x^{6} - 3}{x^{3}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve exponent: $h'(x) = 9x^2 + \dfrac{9}{x^4}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$f(x) = \dfrac{2x^{2} - 5}{2x^{2}}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met één term in de noemer → deel uit, dan termsgewijs (geen quotiëntregel nodig).$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$f(x) = \dfrac{2x^{2} - 5}{2x^{2}}$h2sql$, 1, $h2sql$Deel uit: $f(x) = \dfrac{2x^2}{2x^2} - \dfrac{5}{2x^2} = 1 - \tfrac{5}{2}x^{-2}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$f(x) = \dfrac{2x^{2} - 5}{2x^{2}}$h2sql$, 2, $h2sql$Machtsregel per term: $[1]' = 0$, $[-\tfrac{5}{2}x^{-2}]' = 5x^{-3}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$f(x) = \dfrac{2x^{2} - 5}{2x^{2}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve exponent: $f'(x) = \dfrac{5}{x^3}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$h(x) = 6 - \dfrac{x^{2} - 1}{x}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen een getal en een breuk met één term in de noemer → somregel; de breuk deel je uit. Let op: de min gaat over beide termen.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$h(x) = 6 - \dfrac{x^{2} - 1}{x}$h2sql$, 1, $h2sql$Deel uit: $h(x) = 6 - \left(\dfrac{x^2}{x} - \dfrac{1}{x}\right) = 6 - x + x^{-1}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$h(x) = 6 - \dfrac{x^{2} - 1}{x}$h2sql$, 2, $h2sql$Machtsregel per term: $[6]' = 0$, $[-x]' = -1$, $[x^{-1}]' = -x^{-2}$.$h2sql$),
  ('h6_machten', 'uitdelen', $h2sql$h(x) = 6 - \dfrac{x^{2} - 1}{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve exponent: $h'(x) = -1 - \dfrac{1}{x^2}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$f(x) = \sqrt{x}$h2sql$, 0, $h2sql$Buitenste schil: een wortel van $x$ → herschrijf als macht, $\sqrt{x} = x^{1/2}$, dan de machtsregel.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$f(x) = \sqrt{x}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = x^{1/2}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$f(x) = \sqrt{x}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{1/2}]' = \tfrac{1}{2}x^{-1/2}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$f(x) = \sqrt{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = \dfrac{1}{2\sqrt{x}}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$f(x) = 2\sqrt{x}$h2sql$, 0, $h2sql$Buitenste schil: een wortel van $x$ → herschrijf als macht, $\sqrt{x} = x^{1/2}$, dan de machtsregel.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$f(x) = 2\sqrt{x}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = 2x^{1/2}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$f(x) = 2\sqrt{x}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[2x^{1/2}]' = x^{-1/2}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$f(x) = 2\sqrt{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = \dfrac{1}{\sqrt{x}}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$g(x) = \sqrt{x} - \dfrac{1}{\sqrt{x}}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee termen → somregel; beide termen herschrijf je als macht van $x$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$g(x) = \sqrt{x} - \dfrac{1}{\sqrt{x}}$h2sql$, 1, $h2sql$Herschrijf als macht: $g(x) = x^{1/2} - x^{-1/2}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$g(x) = \sqrt{x} - \dfrac{1}{\sqrt{x}}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{1/2}]' = \tfrac{1}{2}x^{-1/2}$, $[-x^{-1/2}]' = \tfrac{1}{2}x^{-3/2}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$g(x) = \sqrt{x} - \dfrac{1}{\sqrt{x}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $g'(x) = \dfrac{1}{2\sqrt{x}} + \dfrac{1}{2x\sqrt{x}}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$f(x) = 3\sqrt{x} + 5$h2sql$, 0, $h2sql$Buitenste schil: een $+$ tussen twee termen → somregel; de wortel herschrijf je als macht.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$f(x) = 3\sqrt{x} + 5$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = 3x^{1/2} + 5$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$f(x) = 3\sqrt{x} + 5$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[3x^{1/2}]' = 1{,}5x^{-1/2}$, $[5]' = 0$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$f(x) = 3\sqrt{x} + 5$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = \dfrac{3}{2\sqrt{x}}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$h(x) = \dfrac{1}{\sqrt{x}}$h2sql$, 0, $h2sql$Buitenste schil: $1$ gedeeld door een wortel van $x$ → herschrijf als macht, $\dfrac{1}{\sqrt{x}} = x^{-1/2}$, dan de machtsregel.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$h(x) = \dfrac{1}{\sqrt{x}}$h2sql$, 1, $h2sql$Herschrijf als macht: $h(x) = x^{-1/2}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$h(x) = \dfrac{1}{\sqrt{x}}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{-1/2}]' = -\tfrac{1}{2}x^{-3/2}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$h(x) = \dfrac{1}{\sqrt{x}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $h'(x) = -\dfrac{1}{2x\sqrt{x}}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$k(x) = x^{3} \cdot \sqrt{x}$h2sql$, 0, $h2sql$Buitenste schil: $x$-machten en wortels door elkaar → schrijf alles als macht van $x$ en tel de exponenten op, dan de machtsregel.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$k(x) = x^{3} \cdot \sqrt{x}$h2sql$, 1, $h2sql$Herschrijf als macht: $k(x) = x^3 \cdot x^{1/2} = x^{7/2}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$k(x) = x^{3} \cdot \sqrt{x}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{7/2}]' = \tfrac{7}{2}x^{5/2}$.$h2sql$),
  ('h6_machten', 'wortelvorm', $h2sql$k(x) = x^{3} \cdot \sqrt{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $k'(x) = 3{,}5x^2\sqrt{x}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = \sqrt[3]{x}$h2sql$, 0, $h2sql$Buitenste schil: een $n$-de machtswortel → herschrijf als macht, $\sqrt[n]{x^m} = x^{m/n}$, dan de machtsregel.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = \sqrt[3]{x}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = x^{1/3}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = \sqrt[3]{x}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{1/3}]' = \tfrac{1}{3}x^{-2/3}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = \sqrt[3]{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = \dfrac{1}{3\sqrt[3]{x^2}}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = \sqrt[4]{x}$h2sql$, 0, $h2sql$Buitenste schil: een $n$-de machtswortel → herschrijf als macht, $\sqrt[n]{x^m} = x^{m/n}$, dan de machtsregel.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = \sqrt[4]{x}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = x^{1/4}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = \sqrt[4]{x}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{1/4}]' = \tfrac{1}{4}x^{-3/4}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = \sqrt[4]{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = \dfrac{1}{4\sqrt[4]{x^3}}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$g(x) = \sqrt[3]{x^{2}}$h2sql$, 0, $h2sql$Buitenste schil: een $n$-de machtswortel → herschrijf als macht, $\sqrt[n]{x^m} = x^{m/n}$, dan de machtsregel.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$g(x) = \sqrt[3]{x^{2}}$h2sql$, 1, $h2sql$Herschrijf als macht: $g(x) = x^{2/3}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$g(x) = \sqrt[3]{x^{2}}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{2/3}]' = \tfrac{2}{3}x^{-1/3}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$g(x) = \sqrt[3]{x^{2}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $g'(x) = \dfrac{2}{3\sqrt[3]{x}}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = x \cdot \sqrt[3]{x}$h2sql$, 0, $h2sql$Buitenste schil: $x$-machten en wortels door elkaar → schrijf alles als macht van $x$ en tel de exponenten op, dan de machtsregel.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = x \cdot \sqrt[3]{x}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = x \cdot x^{1/3} = x^{4/3}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = x \cdot \sqrt[3]{x}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{4/3}]' = \tfrac{4}{3}x^{1/3}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = x \cdot \sqrt[3]{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = \tfrac{4}{3}\sqrt[3]{x}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$k(x) = x^{3} \cdot \sqrt[5]{x^{3}}$h2sql$, 0, $h2sql$Buitenste schil: een macht maal een $n$-de machtswortel → schrijf alles als macht van $x$, tel de exponenten op ($3 + \tfrac{3}{5} = \tfrac{18}{5}$), dan de machtsregel.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$k(x) = x^{3} \cdot \sqrt[5]{x^{3}}$h2sql$, 1, $h2sql$Herschrijf als macht: $k(x) = x^3 \cdot x^{3/5} = x^{18/5}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$k(x) = x^{3} \cdot \sqrt[5]{x^{3}}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{18/5}]' = \tfrac{18}{5}x^{13/5}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$k(x) = x^{3} \cdot \sqrt[5]{x^{3}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $k'(x) = 3{,}6x^2\sqrt[5]{x^3}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = x^{2} \cdot \sqrt[4]{x}$h2sql$, 0, $h2sql$Buitenste schil: een macht maal een $n$-de machtswortel → schrijf alles als macht van $x$, tel de exponenten op ($2 + \tfrac{1}{4} = \tfrac{9}{4}$), dan de machtsregel.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = x^{2} \cdot \sqrt[4]{x}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = x^2 \cdot x^{1/4} = x^{9/4}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = x^{2} \cdot \sqrt[4]{x}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{9/4}]' = \tfrac{9}{4}x^{5/4}$.$h2sql$),
  ('h6_machten', 'nde_wortel', $h2sql$f(x) = x^{2} \cdot \sqrt[4]{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = 2{,}25x\sqrt[4]{x}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$f(x) = x \cdot \sqrt{x}$h2sql$, 0, $h2sql$Buitenste schil: $x$-machten en wortels door elkaar → schrijf alles als macht van $x$ en tel de exponenten op, dan de machtsregel.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$f(x) = x \cdot \sqrt{x}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = x \cdot x^{1/2} = x^{3/2}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$f(x) = x \cdot \sqrt{x}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{3/2}]' = \tfrac{3}{2}x^{1/2}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$f(x) = x \cdot \sqrt{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = 1{,}5\sqrt{x}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$f(x) = x^{2} \cdot \sqrt{x}$h2sql$, 0, $h2sql$Buitenste schil: $x$-machten en wortels door elkaar → schrijf alles als macht van $x$ en tel de exponenten op, dan de machtsregel.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$f(x) = x^{2} \cdot \sqrt{x}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = x^2 \cdot x^{1/2} = x^{5/2}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$f(x) = x^{2} \cdot \sqrt{x}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{5/2}]' = \tfrac{5}{2}x^{3/2}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$f(x) = x^{2} \cdot \sqrt{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = 2{,}5x\sqrt{x}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$g(x) = \dfrac{x}{\sqrt{x}}$h2sql$, 0, $h2sql$Buitenste schil: $x$ gedeeld door een wortel van $x$ → schrijf als machten en trek de exponenten af, dan de machtsregel. Geen quotiëntregel nodig.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$g(x) = \dfrac{x}{\sqrt{x}}$h2sql$, 1, $h2sql$Herschrijf als macht: $g(x) = \dfrac{x^1}{x^{1/2}} = x^{1/2}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$g(x) = \dfrac{x}{\sqrt{x}}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{1/2}]' = \tfrac{1}{2}x^{-1/2}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$g(x) = \dfrac{x}{\sqrt{x}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $g'(x) = \dfrac{1}{2\sqrt{x}}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$h(x) = \dfrac{1}{x\sqrt{x}}$h2sql$, 0, $h2sql$Buitenste schil: $1$ gedeeld door $x\sqrt{x}$ → schrijf de noemer als $x^{3/2}$ en het geheel als $x^{-3/2}$, dan de machtsregel.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$h(x) = \dfrac{1}{x\sqrt{x}}$h2sql$, 1, $h2sql$Herschrijf als macht: $h(x) = \dfrac{1}{x^{3/2}} = x^{-3/2}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$h(x) = \dfrac{1}{x\sqrt{x}}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{-3/2}]' = -\tfrac{3}{2}x^{-5/2}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$h(x) = \dfrac{1}{x\sqrt{x}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $h'(x) = -\dfrac{1{,}5}{x^2\sqrt{x}}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$k(x) = x^{2}(x\sqrt{x} - 3)$h2sql$, 0, $h2sql$Buitenste schil: $x^2$ maal haakjes → werk de haakjes uit en schrijf alles als macht van $x$, dan termsgewijs.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$k(x) = x^{2}(x\sqrt{x} - 3)$h2sql$, 1, $h2sql$Herschrijf als macht: $k(x) = x^2 \cdot x^{3/2} - 3x^2 = x^{7/2} - 3x^2$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$k(x) = x^{2}(x\sqrt{x} - 3)$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{7/2}]' = \tfrac{7}{2}x^{5/2}$, $[-3x^2]' = -6x$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$k(x) = x^{2}(x\sqrt{x} - 3)$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $k'(x) = 3{,}5x^2\sqrt{x} - 6x$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$f(x) = \dfrac{x^{2} - 2}{x\sqrt{x}}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met één term in de noemer ($x\sqrt{x} = x^{3/2}$) → deel uit, dan termsgewijs. Geen quotiëntregel nodig.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$f(x) = \dfrac{x^{2} - 2}{x\sqrt{x}}$h2sql$, 1, $h2sql$Deel uit: $f(x) = \dfrac{x^2}{x^{3/2}} - \dfrac{2}{x^{3/2}} = x^{1/2} - 2x^{-3/2}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$f(x) = \dfrac{x^{2} - 2}{x\sqrt{x}}$h2sql$, 2, $h2sql$Machtsregel per term: $[x^{1/2}]' = \tfrac{1}{2}x^{-1/2}$, $[-2x^{-3/2}]' = 3x^{-5/2}$.$h2sql$),
  ('h6_machten', 'gemengd_macht_wortel', $h2sql$f(x) = \dfrac{x^{2} - 2}{x\sqrt{x}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve exponent: $f'(x) = \dfrac{0{,}5}{\sqrt{x}} + \dfrac{3}{x^2\sqrt{x}}$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = (4x + 3)^{3}$h2sql$, 0, $h2sql$Buitenste schil: haakjes tot een macht → kettingregel. Buitenkant is $(\ldots)^n$, kern is wat tussen de haakjes staat.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = (4x + 3)^{3}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^3$, kern $4x + 3$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = (4x + 3)^{3}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $3(4x + 3)^2$. Afgeleide van de kern: $4$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = (4x + 3)^{3}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = 3(4x + 3)^2 \cdot 4 = 12(4x + 3)^2$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = (2x - 1)^{4}$h2sql$, 0, $h2sql$Buitenste schil: haakjes tot een macht → kettingregel. Buitenkant is $(\ldots)^n$, kern is wat tussen de haakjes staat.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = (2x - 1)^{4}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^4$, kern $2x - 1$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = (2x - 1)^{4}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $4(2x - 1)^3$. Afgeleide van de kern: $2$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = (2x - 1)^{4}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = 4(2x - 1)^3 \cdot 2 = 8(2x - 1)^3$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$g(x) = 6(\tfrac{1}{2}x - 4)^{5}$h2sql$, 0, $h2sql$Buitenste schil: een getal maal haakjes tot een macht → kettingregel; het getal blijft gewoon voor de buitenkant staan.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$g(x) = 6(\tfrac{1}{2}x - 4)^{5}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $6(\ldots)^5$, kern $\tfrac{1}{2}x - 4$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$g(x) = 6(\tfrac{1}{2}x - 4)^{5}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $30(\tfrac{1}{2}x - 4)^4$. Afgeleide van de kern: $\tfrac{1}{2}$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$g(x) = 6(\tfrac{1}{2}x - 4)^{5}$h2sql$, 3, $h2sql$Vermenigvuldig: $g'(x) = 30(\tfrac{1}{2}x - 4)^4 \cdot \tfrac{1}{2} = 15(\tfrac{1}{2}x - 4)^4$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$h(x) = -2(2x + 1)^{4}$h2sql$, 0, $h2sql$Buitenste schil: een getal maal haakjes tot een macht → kettingregel; het getal blijft gewoon voor de buitenkant staan.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$h(x) = -2(2x + 1)^{4}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $-2(\ldots)^4$, kern $2x + 1$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$h(x) = -2(2x + 1)^{4}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $-8(2x + 1)^3$. Afgeleide van de kern: $2$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$h(x) = -2(2x + 1)^{4}$h2sql$, 3, $h2sql$Vermenigvuldig: $h'(x) = -8(2x + 1)^3 \cdot 2 = -16(2x + 1)^3$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = (5 - 2x)^{6}$h2sql$, 0, $h2sql$Buitenste schil: haakjes tot een macht → kettingregel. Let op: de kern $5 - 2x$ heeft afgeleide $-2$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = (5 - 2x)^{6}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^6$, kern $5 - 2x$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = (5 - 2x)^{6}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $6(5 - 2x)^5$. Afgeleide van de kern: $-2$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = (5 - 2x)^{6}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = 6(5 - 2x)^5 \cdot (-2) = -12(5 - 2x)^5$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = \tfrac{1}{4}(2x - 3)^{4}$h2sql$, 0, $h2sql$Buitenste schil: een breuk maal haakjes tot een macht → kettingregel; $4 \cdot \tfrac{1}{4} = 1$ valt weg.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = \tfrac{1}{4}(2x - 3)^{4}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $\tfrac{1}{4}(\ldots)^4$, kern $2x - 3$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = \tfrac{1}{4}(2x - 3)^{4}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $4 \cdot \tfrac{1}{4}(2x - 3)^3 = (2x - 3)^3$. Afgeleide van de kern: $2$.$h2sql$),
  ('h6_kettingregel', 'macht_lineair', $h2sql$f(x) = \tfrac{1}{4}(2x - 3)^{4}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = (2x - 3)^3 \cdot 2 = 2(2x - 3)^3$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$f(x) = (x^{2} + 1)^{3}$h2sql$, 0, $h2sql$Buitenste schil: haakjes tot een macht → kettingregel. Buitenkant is $(\ldots)^n$, kern is wat tussen de haakjes staat.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$f(x) = (x^{2} + 1)^{3}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^3$, kern $x^2 + 1$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$f(x) = (x^{2} + 1)^{3}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $3(x^2 + 1)^2$. Afgeleide van de kern: $2x$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$f(x) = (x^{2} + 1)^{3}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = 3(x^2 + 1)^2 \cdot 2x = 6x(x^2 + 1)^2$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$f(x) = (4x^{2} - 3)^{4}$h2sql$, 0, $h2sql$Buitenste schil: haakjes tot een macht → kettingregel. Buitenkant is $(\ldots)^n$, kern is wat tussen de haakjes staat.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$f(x) = (4x^{2} - 3)^{4}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^4$, kern $4x^2 - 3$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$f(x) = (4x^{2} - 3)^{4}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $4(4x^2 - 3)^3$. Afgeleide van de kern: $8x$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$f(x) = (4x^{2} - 3)^{4}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = 4(4x^2 - 3)^3 \cdot 8x = 32x(4x^2 - 3)^3$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$h(x) = (x^{2} - 2x + 3)^{3}$h2sql$, 0, $h2sql$Buitenste schil: haakjes tot een macht → kettingregel. Buitenkant is $(\ldots)^n$, kern is wat tussen de haakjes staat.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$h(x) = (x^{2} - 2x + 3)^{3}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^3$, kern $x^2 - 2x + 3$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$h(x) = (x^{2} - 2x + 3)^{3}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $3(x^2 - 2x + 3)^2$. Afgeleide van de kern: $2x - 2$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$h(x) = (x^{2} - 2x + 3)^{3}$h2sql$, 3, $h2sql$Vermenigvuldig: $h'(x) = 3(x^2 - 2x + 3)^2 \cdot (2x - 2) = 3(2x - 2)(x^2 - 2x + 3)^2$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$f(x) = (x^{2} - 5)^{3}$h2sql$, 0, $h2sql$Buitenste schil: haakjes tot een macht → kettingregel. Buitenkant is $(\ldots)^n$, kern is wat tussen de haakjes staat.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$f(x) = (x^{2} - 5)^{3}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^3$, kern $x^2 - 5$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$f(x) = (x^{2} - 5)^{3}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $3(x^2 - 5)^2$. Afgeleide van de kern: $2x$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$f(x) = (x^{2} - 5)^{3}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = 3(x^2 - 5)^2 \cdot 2x = 6x(x^2 - 5)^2$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$g(x) = 4(x^{3} + 7x - 2)^{2}$h2sql$, 0, $h2sql$Buitenste schil: een getal maal haakjes tot een macht → kettingregel; het getal blijft voor de buitenkant staan.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$g(x) = 4(x^{3} + 7x - 2)^{2}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $4(\ldots)^2$, kern $x^3 + 7x - 2$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$g(x) = 4(x^{3} + 7x - 2)^{2}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $8(x^3 + 7x - 2)$. Afgeleide van de kern: $3x^2 + 7$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$g(x) = 4(x^{3} + 7x - 2)^{2}$h2sql$, 3, $h2sql$Vermenigvuldig: $g'(x) = 8(x^3 + 7x - 2) \cdot (3x^2 + 7) = 8(3x^2 + 7)(x^3 + 7x - 2)$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}$h2sql$, 0, $h2sql$Buitenste schil: haakjes tot een macht → kettingregel. Buitenkant is $(\ldots)^n$, kern is wat tussen de haakjes staat.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^3$, kern $\tfrac{1}{2}x^2 - 2x$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $3(\tfrac{1}{2}x^2 - 2x)^2$. Afgeleide van de kern: $x - 2$.$h2sql$),
  ('h6_kettingregel', 'macht_polynoom', $h2sql$k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}$h2sql$, 3, $h2sql$Vermenigvuldig: $k'(x) = 3(\tfrac{1}{2}x^2 - 2x)^2 \cdot (x - 2) = 3(x - 2)(\tfrac{1}{2}x^2 - 2x)^2$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$f(x) = \sqrt{4x + 1}$h2sql$, 0, $h2sql$Buitenste schil: een wortel van een expressie → kettingregel. Buitenkant is $\sqrt{\ldots}$, kern is wat onder de wortel staat.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$f(x) = \sqrt{4x + 1}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $\sqrt{\ldots}$, kern $4x + 1$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$f(x) = \sqrt{4x + 1}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\dfrac{1}{2\sqrt{4x + 1}}$. Afgeleide van de kern: $4$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$f(x) = \sqrt{4x + 1}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = \dfrac{1}{2\sqrt{4x + 1}} \cdot 4 = \dfrac{2}{\sqrt{4x + 1}}$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$f(x) = \sqrt{3x + 1}$h2sql$, 0, $h2sql$Buitenste schil: een wortel van een expressie → kettingregel. Buitenkant is $\sqrt{\ldots}$, kern is wat onder de wortel staat.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$f(x) = \sqrt{3x + 1}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $\sqrt{\ldots}$, kern $3x + 1$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$f(x) = \sqrt{3x + 1}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\dfrac{1}{2\sqrt{3x + 1}}$. Afgeleide van de kern: $3$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$f(x) = \sqrt{3x + 1}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = \dfrac{1}{2\sqrt{3x + 1}} \cdot 3 = \dfrac{3}{2\sqrt{3x + 1}}$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$g(x) = \sqrt{2x - 5}$h2sql$, 0, $h2sql$Buitenste schil: een wortel van een expressie → kettingregel. Buitenkant is $\sqrt{\ldots}$, kern is wat onder de wortel staat.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$g(x) = \sqrt{2x - 5}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $\sqrt{\ldots}$, kern $2x - 5$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$g(x) = \sqrt{2x - 5}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\dfrac{1}{2\sqrt{2x - 5}}$. Afgeleide van de kern: $2$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$g(x) = \sqrt{2x - 5}$h2sql$, 3, $h2sql$Vermenigvuldig: $g'(x) = \dfrac{1}{2\sqrt{2x - 5}} \cdot 2 = \dfrac{1}{\sqrt{2x - 5}}$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$h(x) = 3\sqrt{2x + 1}$h2sql$, 0, $h2sql$Buitenste schil: een getal maal een wortel van een expressie → kettingregel; het getal blijft voor de buitenkant staan.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$h(x) = 3\sqrt{2x + 1}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $3\sqrt{\ldots}$, kern $2x + 1$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$h(x) = 3\sqrt{2x + 1}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\dfrac{3}{2\sqrt{2x + 1}}$. Afgeleide van de kern: $2$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$h(x) = 3\sqrt{2x + 1}$h2sql$, 3, $h2sql$Vermenigvuldig: $h'(x) = \dfrac{3}{2\sqrt{2x + 1}} \cdot 2 = \dfrac{3}{\sqrt{2x + 1}}$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$f(x) = \dfrac{1}{\sqrt{4x - 1}}$h2sql$, 0, $h2sql$Buitenste schil: $1$ gedeeld door een wortel van een expressie → schrijf als $(\ldots)^{-1/2}$ en gebruik de kettingregel.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$f(x) = \dfrac{1}{\sqrt{4x - 1}}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^{-1/2}$, kern $4x - 1$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$f(x) = \dfrac{1}{\sqrt{4x - 1}}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $-\tfrac{1}{2}(4x - 1)^{-3/2}$. Afgeleide van de kern: $4$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$f(x) = \dfrac{1}{\sqrt{4x - 1}}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = -\tfrac{1}{2}(4x - 1)^{-3/2} \cdot 4 = -2(4x - 1)^{-3/2} = -\dfrac{2}{(4x - 1)\sqrt{4x - 1}}$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$k(x) = 5\sqrt{3x - 2} + 7$h2sql$, 0, $h2sql$Buitenste schil: een $+$ tussen twee delen → somregel.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$k(x) = 5\sqrt{3x - 2} + 7$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 5\sqrt{3x - 2}$ en $h(x) = 7$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$k(x) = 5\sqrt{3x - 2} + 7$h2sql$, 2, $h2sql$$h'(x) = 0$. Voor $g$: kettingregel met buitenkant $5\sqrt{\ldots}$ en kern $3x - 2$, dus $g'(x) = \dfrac{5}{2\sqrt{3x - 2}} \cdot 3 = \dfrac{15}{2\sqrt{3x - 2}}$.$h2sql$),
  ('h6_kettingregel', 'wortel_lineair', $h2sql$k(x) = 5\sqrt{3x - 2} + 7$h2sql$, 3, $h2sql$Voeg samen: $k'(x) = g'(x) + h'(x) = \dfrac{15}{2\sqrt{3x - 2}} + 0 = \dfrac{15}{2\sqrt{3x - 2}}$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$f(x) = \sqrt{x^{2} + 1}$h2sql$, 0, $h2sql$Buitenste schil: een wortel van een expressie → kettingregel. Buitenkant is $\sqrt{\ldots}$, kern is wat onder de wortel staat.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$f(x) = \sqrt{x^{2} + 1}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $\sqrt{\ldots}$, kern $x^2 + 1$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$f(x) = \sqrt{x^{2} + 1}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\dfrac{1}{2\sqrt{x^2 + 1}}$. Afgeleide van de kern: $2x$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$f(x) = \sqrt{x^{2} + 1}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = \dfrac{1}{2\sqrt{x^2 + 1}} \cdot 2x = \dfrac{x}{\sqrt{x^2 + 1}}$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$f(x) = \sqrt{x^{2} + 9}$h2sql$, 0, $h2sql$Buitenste schil: een wortel van een expressie → kettingregel. Buitenkant is $\sqrt{\ldots}$, kern is wat onder de wortel staat.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$f(x) = \sqrt{x^{2} + 9}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $\sqrt{\ldots}$, kern $x^2 + 9$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$f(x) = \sqrt{x^{2} + 9}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\dfrac{1}{2\sqrt{x^2 + 9}}$. Afgeleide van de kern: $2x$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$f(x) = \sqrt{x^{2} + 9}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = \dfrac{1}{2\sqrt{x^2 + 9}} \cdot 2x = \dfrac{x}{\sqrt{x^2 + 9}}$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$g(x) = \sqrt{2x^{2} + 4x}$h2sql$, 0, $h2sql$Buitenste schil: een wortel van een expressie → kettingregel. Buitenkant is $\sqrt{\ldots}$, kern is wat onder de wortel staat.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$g(x) = \sqrt{2x^{2} + 4x}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $\sqrt{\ldots}$, kern $2x^2 + 4x$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$g(x) = \sqrt{2x^{2} + 4x}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\dfrac{1}{2\sqrt{2x^2 + 4x}}$. Afgeleide van de kern: $4x + 4$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$g(x) = \sqrt{2x^{2} + 4x}$h2sql$, 3, $h2sql$Vermenigvuldig: $g'(x) = \dfrac{1}{2\sqrt{2x^2 + 4x}} \cdot (4x + 4) = \dfrac{2x + 2}{\sqrt{2x^2 + 4x}}$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$h(x) = \sqrt{x^{3} + 3x}$h2sql$, 0, $h2sql$Buitenste schil: een wortel van een expressie → kettingregel. Buitenkant is $\sqrt{\ldots}$, kern is wat onder de wortel staat.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$h(x) = \sqrt{x^{3} + 3x}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $\sqrt{\ldots}$, kern $x^3 + 3x$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$h(x) = \sqrt{x^{3} + 3x}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\dfrac{1}{2\sqrt{x^3 + 3x}}$. Afgeleide van de kern: $3x^2 + 3$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$h(x) = \sqrt{x^{3} + 3x}$h2sql$, 3, $h2sql$Vermenigvuldig: $h'(x) = \dfrac{1}{2\sqrt{x^3 + 3x}} \cdot (3x^2 + 3) = \dfrac{3x^2 + 3}{2\sqrt{x^3 + 3x}}$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$f(x) = \sqrt{x^{2} + 2x + 3}$h2sql$, 0, $h2sql$Buitenste schil: een wortel van een expressie → kettingregel. Buitenkant is $\sqrt{\ldots}$, kern is wat onder de wortel staat.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$f(x) = \sqrt{x^{2} + 2x + 3}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $\sqrt{\ldots}$, kern $x^2 + 2x + 3$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$f(x) = \sqrt{x^{2} + 2x + 3}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\dfrac{1}{2\sqrt{x^2 + 2x + 3}}$. Afgeleide van de kern: $2x + 2$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$f(x) = \sqrt{x^{2} + 2x + 3}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = \dfrac{1}{2\sqrt{x^2 + 2x + 3}} \cdot (2x + 2) = \dfrac{x + 1}{\sqrt{x^2 + 2x + 3}}$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$k(x) = 5\sqrt{2x^{4} + x^{2}}$h2sql$, 0, $h2sql$Buitenste schil: een getal maal een wortel van een expressie → kettingregel; het getal blijft voor de buitenkant staan.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$k(x) = 5\sqrt{2x^{4} + x^{2}}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $5\sqrt{\ldots}$, kern $2x^4 + x^2$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$k(x) = 5\sqrt{2x^{4} + x^{2}}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\dfrac{5}{2\sqrt{2x^4 + x^2}}$. Afgeleide van de kern: $8x^3 + 2x$.$h2sql$),
  ('h6_kettingregel', 'wortel_polynoom', $h2sql$k(x) = 5\sqrt{2x^{4} + x^{2}}$h2sql$, 3, $h2sql$Vermenigvuldig: $k'(x) = \dfrac{5}{2\sqrt{2x^4 + x^2}} \cdot (8x^3 + 2x) = \dfrac{5(4x^3 + x)}{\sqrt{2x^4 + x^2}}$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$f(x) = \dfrac{1}{(2x + 1)^{2}}$h2sql$, 0, $h2sql$Buitenste schil: een getal gedeeld door een expressie tot een macht → schrijf als $(\ldots)^{-n}$ en gebruik de kettingregel.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$f(x) = \dfrac{1}{(2x + 1)^{2}}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^{-2}$, kern $2x + 1$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$f(x) = \dfrac{1}{(2x + 1)^{2}}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $-2(2x + 1)^{-3}$. Afgeleide van de kern: $2$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$f(x) = \dfrac{1}{(2x + 1)^{2}}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = -2(2x + 1)^{-3} \cdot 2 = -4(2x + 1)^{-3} = -\dfrac{4}{(2x + 1)^3}$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$f(x) = \dfrac{1}{(3x - 2)^{3}}$h2sql$, 0, $h2sql$Buitenste schil: een getal gedeeld door een expressie tot een macht → schrijf als $(\ldots)^{-n}$ en gebruik de kettingregel.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$f(x) = \dfrac{1}{(3x - 2)^{3}}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^{-3}$, kern $3x - 2$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$f(x) = \dfrac{1}{(3x - 2)^{3}}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $-3(3x - 2)^{-4}$. Afgeleide van de kern: $3$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$f(x) = \dfrac{1}{(3x - 2)^{3}}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = -3(3x - 2)^{-4} \cdot 3 = -9(3x - 2)^{-4} = -\dfrac{9}{(3x - 2)^4}$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$g(x) = \dfrac{5}{(2x^{3} - 7x)^{4}}$h2sql$, 0, $h2sql$Buitenste schil: een getal gedeeld door een expressie tot een macht → schrijf als $(\ldots)^{-n}$ en gebruik de kettingregel.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$g(x) = \dfrac{5}{(2x^{3} - 7x)^{4}}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $5(\ldots)^{-4}$, kern $2x^3 - 7x$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$g(x) = \dfrac{5}{(2x^{3} - 7x)^{4}}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $-20(2x^3 - 7x)^{-5}$. Afgeleide van de kern: $6x^2 - 7$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$g(x) = \dfrac{5}{(2x^{3} - 7x)^{4}}$h2sql$, 3, $h2sql$Vermenigvuldig: $g'(x) = -20(2x^3 - 7x)^{-5} \cdot (6x^2 - 7) = -\dfrac{20(6x^2 - 7)}{(2x^3 - 7x)^5}$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$h(x) = \dfrac{6}{(x^{2} + 3x)^{3}}$h2sql$, 0, $h2sql$Buitenste schil: een getal gedeeld door een expressie tot een macht → schrijf als $(\ldots)^{-n}$ en gebruik de kettingregel.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$h(x) = \dfrac{6}{(x^{2} + 3x)^{3}}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $6(\ldots)^{-3}$, kern $x^2 + 3x$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$h(x) = \dfrac{6}{(x^{2} + 3x)^{3}}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $-18(x^2 + 3x)^{-4}$. Afgeleide van de kern: $2x + 3$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$h(x) = \dfrac{6}{(x^{2} + 3x)^{3}}$h2sql$, 3, $h2sql$Vermenigvuldig: $h'(x) = -18(x^2 + 3x)^{-4} \cdot (2x + 3) = -\dfrac{18(2x + 3)}{(x^2 + 3x)^4}$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$f(x) = \dfrac{3}{\sqrt{2x + 1}}$h2sql$, 0, $h2sql$Buitenste schil: een getal gedeeld door een wortel van een expressie → schrijf als $3(\ldots)^{-1/2}$ en gebruik de kettingregel.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$f(x) = \dfrac{3}{\sqrt{2x + 1}}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $3(\ldots)^{-1/2}$, kern $2x + 1$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$f(x) = \dfrac{3}{\sqrt{2x + 1}}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $-1{,}5(2x + 1)^{-3/2}$. Afgeleide van de kern: $2$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$f(x) = \dfrac{3}{\sqrt{2x + 1}}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = -1{,}5(2x + 1)^{-3/2} \cdot 2 = -3(2x + 1)^{-3/2} = -\dfrac{3}{(2x + 1)\sqrt{2x + 1}}$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$k(x) = \dfrac{2}{\sqrt{x^{2} + 4}}$h2sql$, 0, $h2sql$Buitenste schil: een getal gedeeld door een wortel van een expressie → schrijf als $2(\ldots)^{-1/2}$ en gebruik de kettingregel.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$k(x) = \dfrac{2}{\sqrt{x^{2} + 4}}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $2(\ldots)^{-1/2}$, kern $x^2 + 4$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$k(x) = \dfrac{2}{\sqrt{x^{2} + 4}}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $-(x^2 + 4)^{-3/2}$. Afgeleide van de kern: $2x$.$h2sql$),
  ('h6_kettingregel', 'negatieve_macht_expressie', $h2sql$k(x) = \dfrac{2}{\sqrt{x^{2} + 4}}$h2sql$, 3, $h2sql$Vermenigvuldig: $k'(x) = -(x^2 + 4)^{-3/2} \cdot 2x = -2x(x^2 + 4)^{-3/2} = -\dfrac{2x}{(x^2 + 4)\sqrt{x^2 + 4}}$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$f(x) = (2x + 1)\sqrt{2x + 1}$h2sql$, 0, $h2sql$Buitenste schil: een expressie maal de wortel van diezelfde expressie → schrijf als $(\ldots)^{3/2}$ en gebruik de kettingregel.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$f(x) = (2x + 1)\sqrt{2x + 1}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^{3/2}$, kern $2x + 1$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$f(x) = (2x + 1)\sqrt{2x + 1}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $1{,}5(2x + 1)^{1/2} = 1{,}5\sqrt{2x + 1}$. Afgeleide van de kern: $2$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$f(x) = (2x + 1)\sqrt{2x + 1}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = 1{,}5\sqrt{2x + 1} \cdot 2 = 3\sqrt{2x + 1}$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$f(x) = (x^{2} + 3)\sqrt{x^{2} + 3}$h2sql$, 0, $h2sql$Buitenste schil: een expressie maal de wortel van diezelfde expressie → schrijf als $(\ldots)^{3/2}$ en gebruik de kettingregel.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$f(x) = (x^{2} + 3)\sqrt{x^{2} + 3}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^{3/2}$, kern $x^2 + 3$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$f(x) = (x^{2} + 3)\sqrt{x^{2} + 3}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $1{,}5\sqrt{x^2 + 3}$. Afgeleide van de kern: $2x$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$f(x) = (x^{2} + 3)\sqrt{x^{2} + 3}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = 1{,}5\sqrt{x^2 + 3} \cdot 2x = 3x\sqrt{x^2 + 3}$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$g(x) = \dfrac{x^{2} + 4}{\sqrt{x^{2} + 4}}$h2sql$, 0, $h2sql$Buitenste schil: een expressie gedeeld door de wortel van diezelfde expressie → vereenvoudig eerst: $\dfrac{a}{\sqrt{a}} = \sqrt{a}$. Dan is het een wortel van een expressie → kettingregel.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$g(x) = \dfrac{x^{2} + 4}{\sqrt{x^{2} + 4}}$h2sql$, 1, $h2sql$Vereenvoudig en benoem: $g(x) = \sqrt{x^2 + 4}$, buitenkant $\sqrt{\ldots}$, kern $x^2 + 4$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$g(x) = \dfrac{x^{2} + 4}{\sqrt{x^{2} + 4}}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\dfrac{1}{2\sqrt{x^2 + 4}}$. Afgeleide van de kern: $2x$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$g(x) = \dfrac{x^{2} + 4}{\sqrt{x^{2} + 4}}$h2sql$, 3, $h2sql$Vermenigvuldig: $g'(x) = \dfrac{1}{2\sqrt{x^2 + 4}} \cdot 2x = \dfrac{x}{\sqrt{x^2 + 4}}$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$h(x) = \sqrt[3]{x^{3} + 3x}$h2sql$, 0, $h2sql$Buitenste schil: een derdemachtswortel van een expressie → schrijf als $(\ldots)^{1/3}$ en gebruik de kettingregel.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$h(x) = \sqrt[3]{x^{3} + 3x}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^{1/3}$, kern $x^3 + 3x$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$h(x) = \sqrt[3]{x^{3} + 3x}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\tfrac{1}{3}(x^3 + 3x)^{-2/3}$. Afgeleide van de kern: $3x^2 + 3$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$h(x) = \sqrt[3]{x^{3} + 3x}$h2sql$, 3, $h2sql$Vermenigvuldig: $h'(x) = \tfrac{1}{3}(x^3 + 3x)^{-2/3} \cdot (3x^2 + 3) = (x^2 + 1)(x^3 + 3x)^{-2/3} = \dfrac{x^2 + 1}{\sqrt[3]{(x^3 + 3x)^2}}$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$f(x) = \dfrac{1}{(4 - x)\sqrt{4 - x}}$h2sql$, 0, $h2sql$Buitenste schil: $1$ gedeeld door een expressie maal de wortel van diezelfde expressie → schrijf als $(\ldots)^{-3/2}$ en gebruik de kettingregel. Let op: de kern $4 - x$ heeft afgeleide $-1$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$f(x) = \dfrac{1}{(4 - x)\sqrt{4 - x}}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^{-3/2}$, kern $4 - x$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$f(x) = \dfrac{1}{(4 - x)\sqrt{4 - x}}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $-1{,}5(4 - x)^{-5/2}$. Afgeleide van de kern: $-1$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$f(x) = \dfrac{1}{(4 - x)\sqrt{4 - x}}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = -1{,}5(4 - x)^{-5/2} \cdot (-1) = 1{,}5(4 - x)^{-5/2} = \dfrac{1{,}5}{(4 - x)^2\sqrt{4 - x}}$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$k(x) = \sqrt[3]{(2x - 1)^{2}}$h2sql$, 0, $h2sql$Buitenste schil: een derdemachtswortel van een kwadraat → schrijf als $(\ldots)^{2/3}$ en gebruik de kettingregel.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$k(x) = \sqrt[3]{(2x - 1)^{2}}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^{2/3}$, kern $2x - 1$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$k(x) = \sqrt[3]{(2x - 1)^{2}}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\tfrac{2}{3}(2x - 1)^{-1/3}$. Afgeleide van de kern: $2$.$h2sql$),
  ('h6_kettingregel', 'gebroken_macht_kern', $h2sql$k(x) = \sqrt[3]{(2x - 1)^{2}}$h2sql$, 3, $h2sql$Vermenigvuldig: $k'(x) = \tfrac{2}{3}(2x - 1)^{-1/3} \cdot 2 = \tfrac{4}{3}(2x - 1)^{-1/3} = \dfrac{4}{3\sqrt[3]{2x - 1}}$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = x^{2} + (2x + 1)^{4}$h2sql$, 0, $h2sql$Buitenste schil: een $+$ tussen twee delen → somregel.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = x^{2} + (2x + 1)^{4}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^2$ en $h(x) = (2x + 1)^4$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = x^{2} + (2x + 1)^{4}$h2sql$, 2, $h2sql$$g'(x) = 2x$. Voor $h$: kettingregel met buitenkant $(\ldots)^4$ en kern $2x + 1$, dus $h'(x) = 4(2x + 1)^3 \cdot 2 = 8(2x + 1)^3$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = x^{2} + (2x + 1)^{4}$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) + h'(x) = 2x + 8(2x + 1)^3$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$k(x) = 3x^{2} - \tfrac{1}{2}(x - 2)^{3}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee delen → somregel.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$k(x) = 3x^{2} - \tfrac{1}{2}(x - 2)^{3}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 3x^2$ en $h(x) = \tfrac{1}{2}(x - 2)^3$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$k(x) = 3x^{2} - \tfrac{1}{2}(x - 2)^{3}$h2sql$, 2, $h2sql$$g'(x) = 6x$. Voor $h$: kettingregel met buitenkant $\tfrac{1}{2}(\ldots)^3$ en kern $x - 2$, dus $h'(x) = 1{,}5(x - 2)^2 \cdot 1 = 1{,}5(x - 2)^2$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$k(x) = 3x^{2} - \tfrac{1}{2}(x - 2)^{3}$h2sql$, 3, $h2sql$Voeg samen: $k'(x) = g'(x) - h'(x) = 6x - 1{,}5(x - 2)^2$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$h(x) = 3x^{2} - (\tfrac{1}{4}x - 2)^{3}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee delen → somregel.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$h(x) = 3x^{2} - (\tfrac{1}{4}x - 2)^{3}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 3x^2$ en $h(x) = (\tfrac{1}{4}x - 2)^3$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$h(x) = 3x^{2} - (\tfrac{1}{4}x - 2)^{3}$h2sql$, 2, $h2sql$$g'(x) = 6x$. Voor $h$: kettingregel met buitenkant $(\ldots)^3$ en kern $\tfrac{1}{4}x - 2$, dus $h'(x) = 3(\tfrac{1}{4}x - 2)^2 \cdot \tfrac{1}{4} = \tfrac{3}{4}(\tfrac{1}{4}x - 2)^2$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$h(x) = 3x^{2} - (\tfrac{1}{4}x - 2)^{3}$h2sql$, 3, $h2sql$Voeg samen: $h'(x) = g'(x) - h'(x) = 6x - \tfrac{3}{4}(\tfrac{1}{4}x - 2)^2$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = (\tfrac{1}{4}x - 1)^{4} - x + 2$h2sql$, 0, $h2sql$Buitenste schil: termen met $+$ en $-$ ertussen → somregel; de eerste term is haakjes tot een macht en vraagt de kettingregel.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = (\tfrac{1}{4}x - 1)^{4} - x + 2$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = (\tfrac{1}{4}x - 1)^4$ en $h(x) = -x + 2$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = (\tfrac{1}{4}x - 1)^{4} - x + 2$h2sql$, 2, $h2sql$$h'(x) = -1$. Voor $g$: kettingregel met buitenkant $(\ldots)^4$ en kern $\tfrac{1}{4}x - 1$, dus $g'(x) = 4(\tfrac{1}{4}x - 1)^3 \cdot \tfrac{1}{4} = (\tfrac{1}{4}x - 1)^3$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = (\tfrac{1}{4}x - 1)^{4} - x + 2$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) + h'(x) = (\tfrac{1}{4}x - 1)^3 - 1$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = 5x - \dfrac{4}{(3x + 2)^{3}}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee delen → somregel; de breuk schrijf je als $4(\ldots)^{-3}$ en die vraagt de kettingregel.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = 5x - \dfrac{4}{(3x + 2)^{3}}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 5x$ en $h(x) = \dfrac{4}{(3x + 2)^3} = 4(3x + 2)^{-3}$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = 5x - \dfrac{4}{(3x + 2)^{3}}$h2sql$, 2, $h2sql$$g'(x) = 5$. Voor $h$: kettingregel met buitenkant $4(\ldots)^{-3}$ en kern $3x + 2$, dus $h'(x) = -12(3x + 2)^{-4} \cdot 3 = -36(3x + 2)^{-4} = -\dfrac{36}{(3x + 2)^4}$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = 5x - \dfrac{4}{(3x + 2)^{3}}$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) - h'(x) = 5 - \left(-\dfrac{36}{(3x + 2)^4}\right) = 5 + \dfrac{36}{(3x + 2)^4}$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = \sqrt{x^{2} + 9} - x^{2} + 5x$h2sql$, 0, $h2sql$Buitenste schil: termen met $-$ en $+$ ertussen → somregel, hier als $u - v$ met $v = x^2 - 5x$; de wortel vraagt de kettingregel.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = \sqrt{x^{2} + 9} - x^{2} + 5x$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = \sqrt{x^2 + 9}$ en $h(x) = x^2 - 5x$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = \sqrt{x^{2} + 9} - x^{2} + 5x$h2sql$, 2, $h2sql$$h'(x) = 2x - 5$. Voor $g$: kettingregel met buitenkant $\sqrt{\ldots}$ en kern $x^2 + 9$, dus $g'(x) = \dfrac{1}{2\sqrt{x^2 + 9}} \cdot 2x = \dfrac{x}{\sqrt{x^2 + 9}}$.$h2sql$),
  ('h6_kettingregel', 'ketting_in_som', $h2sql$f(x) = \sqrt{x^{2} + 9} - x^{2} + 5x$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) - h'(x) = \dfrac{x}{\sqrt{x^2 + 9}} - (2x - 5) = \dfrac{x}{\sqrt{x^2 + 9}} - 2x + 5$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$f(x) = x\sqrt{2x + 1}$h2sql$, 0, $h2sql$Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel. In één factor zit een kettingregel.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$f(x) = x\sqrt{2x + 1}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x$ en $h(x) = \sqrt{2x + 1}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$f(x) = x\sqrt{2x + 1}$h2sql$, 2, $h2sql$$g'(x) = 1$. Voor $h$: kettingregel met buitenkant $\sqrt{\ldots}$ en kern $2x + 1$, dus $h'(x) = \dfrac{1}{2\sqrt{2x + 1}} \cdot 2 = \dfrac{1}{\sqrt{2x + 1}}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$f(x) = x\sqrt{2x + 1}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 1 \cdot \sqrt{2x + 1} + x \cdot \dfrac{1}{\sqrt{2x + 1}} = \sqrt{2x + 1} + \dfrac{x}{\sqrt{2x + 1}}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$f(x) = x(2x + 1)^{3}$h2sql$, 0, $h2sql$Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel. In één factor zit een kettingregel.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$f(x) = x(2x + 1)^{3}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x$ en $h(x) = (2x + 1)^3$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$f(x) = x(2x + 1)^{3}$h2sql$, 2, $h2sql$$g'(x) = 1$. Voor $h$: kettingregel met buitenkant $(\ldots)^3$ en kern $2x + 1$, dus $h'(x) = 3(2x + 1)^2 \cdot 2 = 6(2x + 1)^2$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$f(x) = x(2x + 1)^{3}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 1 \cdot (2x + 1)^3 + x \cdot 6(2x + 1)^2 = (2x + 1)^3 + 6x(2x + 1)^2$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$g(x) = x\sqrt{3x + 1}$h2sql$, 0, $h2sql$Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel. In één factor zit een kettingregel.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$g(x) = x\sqrt{3x + 1}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x$ en $h(x) = \sqrt{3x + 1}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$g(x) = x\sqrt{3x + 1}$h2sql$, 2, $h2sql$$g'(x) = 1$. Voor $h$: kettingregel met buitenkant $\sqrt{\ldots}$ en kern $3x + 1$, dus $h'(x) = \dfrac{1}{2\sqrt{3x + 1}} \cdot 3 = \dfrac{3}{2\sqrt{3x + 1}}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$g(x) = x\sqrt{3x + 1}$h2sql$, 3, $h2sql$Vul de formule in: $g'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 1 \cdot \sqrt{3x + 1} + x \cdot \dfrac{3}{2\sqrt{3x + 1}} = \sqrt{3x + 1} + \dfrac{3x}{2\sqrt{3x + 1}}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$h(x) = x(3x + 1)^{3}$h2sql$, 0, $h2sql$Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel. In één factor zit een kettingregel.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$h(x) = x(3x + 1)^{3}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x$ en $h(x) = (3x + 1)^3$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$h(x) = x(3x + 1)^{3}$h2sql$, 2, $h2sql$$g'(x) = 1$. Voor $h$: kettingregel met buitenkant $(\ldots)^3$ en kern $3x + 1$, dus $h'(x) = 3(3x + 1)^2 \cdot 3 = 9(3x + 1)^2$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$h(x) = x(3x + 1)^{3}$h2sql$, 3, $h2sql$Vul de formule in: $h'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 1 \cdot (3x + 1)^3 + x \cdot 9(3x + 1)^2 = (3x + 1)^3 + 9x(3x + 1)^2$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$f(x) = x^{2}\sqrt{x + 1}$h2sql$, 0, $h2sql$Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel. In één factor zit een kettingregel.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$f(x) = x^{2}\sqrt{x + 1}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^2$ en $h(x) = \sqrt{x + 1}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$f(x) = x^{2}\sqrt{x + 1}$h2sql$, 2, $h2sql$$g'(x) = 2x$. Voor $h$: kettingregel met buitenkant $\sqrt{\ldots}$ en kern $x + 1$, dus $h'(x) = \dfrac{1}{2\sqrt{x + 1}} \cdot 1 = \dfrac{1}{2\sqrt{x + 1}}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$f(x) = x^{2}\sqrt{x + 1}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 2x \cdot \sqrt{x + 1} + x^2 \cdot \dfrac{1}{2\sqrt{x + 1}} = 2x\sqrt{x + 1} + \dfrac{x^2}{2\sqrt{x + 1}}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$k(x) = (x + 1)(2x - 1)^{3}$h2sql$, 0, $h2sql$Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel. In één factor zit een kettingregel.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$k(x) = (x + 1)(2x - 1)^{3}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x + 1$ en $h(x) = (2x - 1)^3$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$k(x) = (x + 1)(2x - 1)^{3}$h2sql$, 2, $h2sql$$g'(x) = 1$. Voor $h$: kettingregel met buitenkant $(\ldots)^3$ en kern $2x - 1$, dus $h'(x) = 3(2x - 1)^2 \cdot 2 = 6(2x - 1)^2$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_product', $h2sql$k(x) = (x + 1)(2x - 1)^{3}$h2sql$, 3, $h2sql$Vul de formule in: $k'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 1 \cdot (2x - 1)^3 + (x + 1) \cdot 6(2x - 1)^2 = (2x - 1)^3 + 6(x + 1)(2x - 1)^2$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$f(x) = \dfrac{x + 6}{\sqrt{8x + 9}}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel. In de breuk zit een kettingregel.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$f(x) = \dfrac{x + 6}{\sqrt{8x + 9}}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = x + 6$ en $h(x) = \sqrt{8x + 9}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$f(x) = \dfrac{x + 6}{\sqrt{8x + 9}}$h2sql$, 2, $h2sql$$g'(x) = 1$. Voor $h$: kettingregel met buitenkant $\sqrt{\ldots}$ en kern $8x + 9$, dus $h'(x) = \dfrac{1}{2\sqrt{8x + 9}} \cdot 8 = \dfrac{4}{\sqrt{8x + 9}}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$f(x) = \dfrac{x + 6}{\sqrt{8x + 9}}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{1 \cdot \sqrt{8x + 9} - (x + 6) \cdot \dfrac{4}{\sqrt{8x + 9}}}{(\sqrt{8x + 9})^2} = \dfrac{\sqrt{8x + 9} - \dfrac{4(x + 6)}{\sqrt{8x + 9}}}{8x + 9}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$f(x) = \dfrac{x}{\sqrt{2x + 1}}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel. In de breuk zit een kettingregel.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$f(x) = \dfrac{x}{\sqrt{2x + 1}}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = x$ en $h(x) = \sqrt{2x + 1}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$f(x) = \dfrac{x}{\sqrt{2x + 1}}$h2sql$, 2, $h2sql$$g'(x) = 1$. Voor $h$: kettingregel met buitenkant $\sqrt{\ldots}$ en kern $2x + 1$, dus $h'(x) = \dfrac{1}{2\sqrt{2x + 1}} \cdot 2 = \dfrac{1}{\sqrt{2x + 1}}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$f(x) = \dfrac{x}{\sqrt{2x + 1}}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{1 \cdot \sqrt{2x + 1} - x \cdot \dfrac{1}{\sqrt{2x + 1}}}{(\sqrt{2x + 1})^2} = \dfrac{\sqrt{2x + 1} - \dfrac{x}{\sqrt{2x + 1}}}{2x + 1}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$g(x) = \dfrac{\sqrt{x^{2} + 1}}{2x + 1}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel. In de breuk zit een kettingregel.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$g(x) = \dfrac{\sqrt{x^{2} + 1}}{2x + 1}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = \sqrt{x^2 + 1}$ en $h(x) = 2x + 1$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$g(x) = \dfrac{\sqrt{x^{2} + 1}}{2x + 1}$h2sql$, 2, $h2sql$$h'(x) = 2$. Voor $g$: kettingregel met buitenkant $\sqrt{\ldots}$ en kern $x^2 + 1$, dus $g'(x) = \dfrac{1}{2\sqrt{x^2 + 1}} \cdot 2x = \dfrac{x}{\sqrt{x^2 + 1}}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$g(x) = \dfrac{\sqrt{x^{2} + 1}}{2x + 1}$h2sql$, 3, $h2sql$Vul de formule in: $g'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{\dfrac{x}{\sqrt{x^2 + 1}} \cdot (2x + 1) - \sqrt{x^2 + 1} \cdot 2}{(2x + 1)^2} = \dfrac{\dfrac{x(2x + 1)}{\sqrt{x^2 + 1}} - 2\sqrt{x^2 + 1}}{(2x + 1)^2}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$h(x) = \dfrac{x^{2} - 1}{\sqrt{4x + 1}}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel. In de breuk zit een kettingregel.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$h(x) = \dfrac{x^{2} - 1}{\sqrt{4x + 1}}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = x^2 - 1$ en $h(x) = \sqrt{4x + 1}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$h(x) = \dfrac{x^{2} - 1}{\sqrt{4x + 1}}$h2sql$, 2, $h2sql$$g'(x) = 2x$. Voor $h$: kettingregel met buitenkant $\sqrt{\ldots}$ en kern $4x + 1$, dus $h'(x) = \dfrac{1}{2\sqrt{4x + 1}} \cdot 4 = \dfrac{2}{\sqrt{4x + 1}}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$h(x) = \dfrac{x^{2} - 1}{\sqrt{4x + 1}}$h2sql$, 3, $h2sql$Vul de formule in: $h'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{2x \cdot \sqrt{4x + 1} - (x^2 - 1) \cdot \dfrac{2}{\sqrt{4x + 1}}}{(\sqrt{4x + 1})^2} = \dfrac{2x\sqrt{4x + 1} - \dfrac{2(x^2 - 1)}{\sqrt{4x + 1}}}{4x + 1}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$f(x) = \dfrac{(2x + 1)^{2}}{x + 1}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel. In de breuk zit een kettingregel.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$f(x) = \dfrac{(2x + 1)^{2}}{x + 1}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = (2x + 1)^2$ en $h(x) = x + 1$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$f(x) = \dfrac{(2x + 1)^{2}}{x + 1}$h2sql$, 2, $h2sql$$h'(x) = 1$. Voor $g$: kettingregel met buitenkant $(\ldots)^2$ en kern $2x + 1$, dus $g'(x) = 2(2x + 1) \cdot 2 = 4(2x + 1)$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$f(x) = \dfrac{(2x + 1)^{2}}{x + 1}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{4(2x + 1) \cdot (x + 1) - (2x + 1)^2 \cdot 1}{(x + 1)^2} = \dfrac{4(2x + 1)(x + 1) - (2x + 1)^2}{(x + 1)^2}$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$k(x) = \dfrac{x^{2} + 1}{(3x - 2)^{2}}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel. In de breuk zit een kettingregel.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$k(x) = \dfrac{x^{2} + 1}{(3x - 2)^{2}}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = x^2 + 1$ en $h(x) = (3x - 2)^2$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$k(x) = \dfrac{x^{2} + 1}{(3x - 2)^{2}}$h2sql$, 2, $h2sql$$g'(x) = 2x$. Voor $h$: kettingregel met buitenkant $(\ldots)^2$ en kern $3x - 2$, dus $h'(x) = 2(3x - 2) \cdot 3 = 6(3x - 2)$.$h2sql$),
  ('h6_combinaties', 'ketting_plus_quotient', $h2sql$k(x) = \dfrac{x^{2} + 1}{(3x - 2)^{2}}$h2sql$, 3, $h2sql$Vul de formule in: $k'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{2x \cdot (3x - 2)^2 - (x^2 + 1) \cdot 6(3x - 2)}{((3x - 2)^2)^2} = \dfrac{2x(3x - 2)^2 - 6(x^2 + 1)(3x - 2)}{(3x - 2)^4}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{4}{x^{3}}$h2sql$, 0, $h2sql$Buitenste schil: een getal gedeeld door een macht van $x$ → geen quotiëntregel nodig, herschrijf als $4x^{-3}$ en gebruik de machtsregel.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{4}{x^{3}}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = 4x^{-3}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{4}{x^{3}}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[4x^{-3}]' = -12x^{-4}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{4}{x^{3}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = -\dfrac{12}{x^4}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = (3x - 1)^{4}$h2sql$, 0, $h2sql$Buitenste schil: haakjes tot de vierde macht → uitwerken is veel werk, kettingregel is de weg.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = (3x - 1)^{4}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $(\ldots)^4$, kern $3x - 1$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = (3x - 1)^{4}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $4(3x - 1)^3$. Afgeleide van de kern: $3$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = (3x - 1)^{4}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = 4(3x - 1)^3 \cdot 3 = 12(3x - 1)^3$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{x^{3} + 5x^{2}}{x}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met één term in de noemer → uitdelen is sneller dan de quotiëntregel.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{x^{3} + 5x^{2}}{x}$h2sql$, 1, $h2sql$Deel uit: $f(x) = \dfrac{x^3}{x} + \dfrac{5x^2}{x} = x^2 + 5x$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{x^{3} + 5x^{2}}{x}$h2sql$, 2, $h2sql$Machtsregel per term: $[x^2]' = 2x$, $[5x]' = 5$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{x^{3} + 5x^{2}}{x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve exponent: $f'(x) = 2x + 5$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = (x^{2} - 4)(x^{3} + 1)$h2sql$, 0, $h2sql$Buitenste schil: twee polynomen met een $\cdot$ ertussen → productregel (uitwerken mag ook).$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = (x^{2} - 4)(x^{3} + 1)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^2 - 4$ en $h(x) = x^3 + 1$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = (x^{2} - 4)(x^{3} + 1)$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 2x$ en $h'(x) = 3x^2$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = (x^{2} - 4)(x^{3} + 1)$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 2x(x^3 + 1) + (x^2 - 4) \cdot 3x^2$. Laat de haakjes staan.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{2x^{3}}{x^{2} + 4}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met een som in de noemer → uitdelen kan niet, dus quotiëntregel.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{2x^{3}}{x^{2} + 4}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = 2x^3$ en $h(x) = x^2 + 4$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{2x^{3}}{x^{2} + 4}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 6x^2$ en $h'(x) = 2x$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{2x^{3}}{x^{2} + 4}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{6x^2(x^2 + 4) - 2x^3 \cdot 2x}{(x^2 + 4)^2}$. Teller uitwerken: $f'(x) = \dfrac{2x^4 + 24x^2}{(x^2 + 4)^2}$. De noemer laat je staan.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$g(x) = \dfrac{x^{2} + 4}{2x^{3}}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met één term in de noemer ($2x^3$) → uitdelen, geen quotiëntregel nodig.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$g(x) = \dfrac{x^{2} + 4}{2x^{3}}$h2sql$, 1, $h2sql$Deel uit: $g(x) = \dfrac{x^2}{2x^3} + \dfrac{4}{2x^3} = \tfrac{1}{2}x^{-1} + 2x^{-3}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$g(x) = \dfrac{x^{2} + 4}{2x^{3}}$h2sql$, 2, $h2sql$Machtsregel per term: $[\tfrac{1}{2}x^{-1}]' = -\tfrac{1}{2}x^{-2}$, $[2x^{-3}]' = -6x^{-4}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$g(x) = \dfrac{x^{2} + 4}{2x^{3}}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve exponent: $g'(x) = -\dfrac{1}{2x^2} - \dfrac{6}{x^4}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \sqrt{5x - 2}$h2sql$, 0, $h2sql$Buitenste schil: een wortel van een expressie (niet alleen $x$) → kettingregel.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \sqrt{5x - 2}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $\sqrt{\ldots}$, kern $5x - 2$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \sqrt{5x - 2}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $\dfrac{1}{2\sqrt{5x - 2}}$. Afgeleide van de kern: $5$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \sqrt{5x - 2}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = \dfrac{1}{2\sqrt{5x - 2}} \cdot 5 = \dfrac{5}{2\sqrt{5x - 2}}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = x\sqrt{x} - 3x$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee termen → somregel; $x\sqrt{x}$ is geen kettingregel maar een macht van $x$: $x^{3/2}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = x\sqrt{x} - 3x$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = x^{3/2} - 3x$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = x\sqrt{x} - 3x$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^{3/2}]' = \tfrac{3}{2}x^{1/2}$, $[-3x]' = -3$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = x\sqrt{x} - 3x$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = 1{,}5\sqrt{x} - 3$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = x(x^{2} + 1)^{4}$h2sql$, 0, $h2sql$Buitenste schil: $x$ maal haakjes tot een macht → productregel; in de tweede factor zit de kettingregel.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = x(x^{2} + 1)^{4}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x$ en $h(x) = (x^2 + 1)^4$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = x(x^{2} + 1)^{4}$h2sql$, 2, $h2sql$$g'(x) = 1$. Voor $h$: kettingregel met buitenkant $(\ldots)^4$ en kern $x^2 + 1$, dus $h'(x) = 4(x^2 + 1)^3 \cdot 2x = 8x(x^2 + 1)^3$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = x(x^{2} + 1)^{4}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 1 \cdot (x^2 + 1)^4 + x \cdot 8x(x^2 + 1)^3 = (x^2 + 1)^4 + 8x^2(x^2 + 1)^3$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{6}{(x^{2} + 1)^{2}}$h2sql$, 0, $h2sql$Buitenste schil: een getal gedeeld door een expressie tot een macht → schrijf als $6(\ldots)^{-2}$ en gebruik de kettingregel; de quotiëntregel is hier een omweg.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{6}{(x^{2} + 1)^{2}}$h2sql$, 1, $h2sql$Buitenkant en kern: buitenkant $6(\ldots)^{-2}$, kern $x^2 + 1$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{6}{(x^{2} + 1)^{2}}$h2sql$, 2, $h2sql$Afgeleide van de buitenkant met de kern erin: $-12(x^2 + 1)^{-3}$. Afgeleide van de kern: $2x$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{6}{(x^{2} + 1)^{2}}$h2sql$, 3, $h2sql$Vermenigvuldig: $f'(x) = -12(x^2 + 1)^{-3} \cdot 2x = -24x(x^2 + 1)^{-3} = -\dfrac{24x}{(x^2 + 1)^3}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$h(x) = \dfrac{x + 2}{4x}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met één term in de noemer ($4x$) → uitdelen; de quotiëntregel werkt ook maar is meer werk.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$h(x) = \dfrac{x + 2}{4x}$h2sql$, 1, $h2sql$Deel uit: $h(x) = \dfrac{x}{4x} + \dfrac{2}{4x} = \tfrac{1}{4} + \tfrac{1}{2}x^{-1}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$h(x) = \dfrac{x + 2}{4x}$h2sql$, 2, $h2sql$Machtsregel per term: $[\tfrac{1}{4}]' = 0$, $[\tfrac{1}{2}x^{-1}]' = -\tfrac{1}{2}x^{-2}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$h(x) = \dfrac{x + 2}{4x}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve exponent: $h'(x) = -\dfrac{1}{2x^2}$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{2}{x\sqrt{x}} - x^{2}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee termen → somregel; $\dfrac{2}{x\sqrt{x}}$ is een macht van $x$ ($2x^{-3/2}$), geen kettingregel.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{2}{x\sqrt{x}} - x^{2}$h2sql$, 1, $h2sql$Herschrijf als macht: $f(x) = 2x^{-3/2} - x^2$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{2}{x\sqrt{x}} - x^{2}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[2x^{-3/2}]' = -3x^{-5/2}$, $[-x^2]' = -2x$.$h2sql$),
  ('h6_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{2}{x\sqrt{x}} - x^{2}$h2sql$, 3, $h2sql$Schrijf terug zonder negatieve of gebroken exponent: $f'(x) = -\dfrac{3}{x^2\sqrt{x}} - 2x$.$h2sql$)
) AS s(topic_slug, cluster_slug, body, step_order, description)
JOIN public.topics_new t ON t.slug = s.topic_slug
JOIN public.topic_clusters_new c ON c.slug = s.cluster_slug AND c.topic_id = t.id
JOIN public.questions_new q ON q.latex_body = s.body AND q.cluster_id = c.id;

-- 7. Controle
DO $do$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.questions_new WHERE topic_id IN (SELECT id FROM public.topics_new WHERE chapter_id = (SELECT id FROM public.chapters WHERE slug = 'h6'));
  IF n <> 96 THEN RAISE EXCEPTION 'H6 hoort 96 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.question_steps_new WHERE question_id IN (SELECT id FROM public.questions_new WHERE topic_id IN (SELECT id FROM public.topics_new WHERE chapter_id = (SELECT id FROM public.chapters WHERE slug = 'h6')));
  IF n <> 384 THEN RAISE EXCEPTION 'H6 hoort 384 stappen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster negatieve_macht hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'uitdelen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster uitdelen hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortelvorm' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster wortelvorm hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'nde_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster nde_wortel hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gemengd_macht_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_machten'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster gemengd_macht_wortel hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster macht_lineair hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'macht_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster macht_polynoom hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster wortel_lineair hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'wortel_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster wortel_polynoom hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'negatieve_macht_expressie' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster negatieve_macht_expressie hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gebroken_macht_kern' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster gebroken_macht_kern hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_kettingregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster ketting_in_som hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster ketting_plus_product hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'ketting_plus_quotient' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_combinaties'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster ketting_plus_quotient hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h6_gemengd'));
  IF n <> 12 THEN RAISE EXCEPTION 'Cluster welke_regel hoort 12 vragen te hebben, gevonden %', n; END IF;
END $do$;

COMMIT;
