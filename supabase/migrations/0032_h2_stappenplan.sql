-- =============================================================================
-- Migration 0032: H2 "De afgeleide berekenen" — herindeling + stappenplan
-- =============================================================================
-- Gegenereerd door scripts/h2-content.ts — niet met de hand bewerken.
-- Spec: docs/h2-afgeleide-berekenen.md
--
-- Nummering springt van 0025 naar 0032: 0026–0031 zijn lokaal bezet door de
-- gearchiveerde stoomcursus-tak (tag archief/stoomcursus-2026-09).
--
--   • Nieuw topic h2_gemengd + 6 nieuwe clusters; 5 clusters hernoemd (id blijft)
--   • 51 bestaande vragen: verplaatst/hernummerd, canonieke antwoorden
--   • 45 nieuwe vragen
--   • Alle H2-stappen vervangen door het vaste stappenplan (stap 0 t/m 3)
-- =============================================================================

BEGIN;

-- 1. Nieuw topic
INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default, site)
VALUES ('h2_gemengd', $h2sql$Gemengd: welke regel?$h2sql$, (SELECT id FROM public.chapters WHERE slug = 'h2'), 5, false, 'afgeleiden')
ON CONFLICT (slug) DO NOTHING;

-- 2. Nieuwe clusters (hernoemen gebeurt in stap 4, ná het verplaatsen van vragen)
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), 'breuken_decimalen', $h2sql$Breuken en decimalen$h2sql$, 2, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'breuken_decimalen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), 'andere_letters', $h2sql$Andere letters$h2sql$, 3, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'andere_letters' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), 'constante_factor', $h2sql$Constante factor en extra termen$h2sql$, 3, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'constante_factor' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), 'hogere_graad', $h2sql$Hogere graad$h2sql$, 4, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'hogere_graad' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'), 'twee_polynomen', $h2sql$Twee polynomen$h2sql$, 1, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'), 'genest_in_som', $h2sql$Genest in een som$h2sql$, 3, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'genest_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'), 'drie_factoren', $h2sql$Drie factoren$h2sql$, 4, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'drie_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'), 'polynoom_breuk', $h2sql$Polynoom-breuk$h2sql$, 2, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'), 'som_met_breuk', $h2sql$Som met breuk$h2sql$, 3, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), 'welke_regel', $h2sql$Welke regel?$h2sql$, 1, 'afgeleiden'
WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'));

-- 3. Bestaande vragen bijwerken (herkend op oud cluster + latex_body)
DO $do$
DECLARE n int;
BEGIN
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_differentieren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'),
    latex_body = $h2sql$f(x) = 5x^{6} - 3x^{5} + 2x - 7$h2sql$,
    answer = $h2sql$30x^5 - 15x^4 + 2$h2sql$,
    latex_answer = $h2sql$30x^{5} - 15x^{4} + 2$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = 5x^{6} - 3x^{5} + 2x - 7$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_differentieren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = 5x^{6} - 3x^{5} + 2x - 7$h2sql$, 'polynoom_differentieren', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_differentieren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'),
    latex_body = $h2sql$f(x) = 2x^{3} - 5x^{2} + 8x - 4$h2sql$,
    answer = $h2sql$6x^2 - 10x + 8$h2sql$,
    latex_answer = $h2sql$6x^{2} - 10x + 8$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = 2x^{3} - 5x^{2} + 8x - 4$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_differentieren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = 2x^{3} - 5x^{2} + 8x - 4$h2sql$, 'polynoom_differentieren', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'breuken_decimalen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'),
    latex_body = $h2sql$f(x) = -2x^{8} - 4x^{4} + 7{,}2$h2sql$,
    answer = $h2sql$-16x^7 - 16x^3$h2sql$,
    latex_answer = $h2sql$-16x^{7} - 16x^{3}$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = -2x^{8} - 4x^{4} + 7{,}2$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_differentieren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = -2x^{8} - 4x^{4} + 7{,}2$h2sql$, 'polynoom_differentieren', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'breuken_decimalen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'),
    latex_body = $h2sql$f(x) = 0{,}6x^{3} - 1{,}3x^{2} + 7$h2sql$,
    answer = $h2sql$1,8x^2 - 2,6x$h2sql$,
    latex_answer = $h2sql$1{,}8x^{2} - 2{,}6x$h2sql$,
    answer_alternatives = ARRAY[$h2sql$1.8x^2-2.6x$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$f(x) = 0{,}6x^{3} - 1{,}3x^{2} + 7$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_differentieren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = 0{,}6x^{3} - 1{,}3x^{2} + 7$h2sql$, 'polynoom_differentieren', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'andere_letters' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'),
    latex_body = $h2sql$h(t) = 2t^{3} - 4t^{2} + 3t - 2$h2sql$,
    answer = $h2sql$6t^2 - 8t + 3$h2sql$,
    latex_answer = $h2sql$6t^{2} - 8t + 3$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$h(t) = 2t^{3} - 4t^{2} + 3t - 2$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_differentieren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(t) = 2t^{3} - 4t^{2} + 3t - 2$h2sql$, 'polynoom_differentieren', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'andere_letters' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'),
    latex_body = $h2sql$k(q) = 1 + 3q - 3q^{2} - 5q^{7}$h2sql$,
    answer = $h2sql$-35q^6 - 6q + 3$h2sql$,
    latex_answer = $h2sql$-35q^{6} - 6q + 3$h2sql$,
    answer_alternatives = ARRAY[$h2sql$3-6q-35q^6$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$k(q) = 1 + 3q - 3q^{2} - 5q^{7}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_differentieren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$k(q) = 1 + 3q - 3q^{2} - 5q^{7}$h2sql$, 'polynoom_differentieren', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'product_uitwerken' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
    latex_body = $h2sql$f(x) = (3 - x)(5 + 2x)$h2sql$,
    answer = $h2sql$-4x + 1$h2sql$,
    latex_answer = $h2sql$-4x + 1$h2sql$,
    answer_alternatives = ARRAY[$h2sql$1-4x$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = (3 - x)(5 + 2x)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'product_uitwerken' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (3 - x)(5 + 2x)$h2sql$, 'product_uitwerken', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'product_uitwerken' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
    latex_body = $h2sql$f(x) = (5x + 7)(4 - 3x)$h2sql$,
    answer = $h2sql$-30x - 1$h2sql$,
    latex_answer = $h2sql$-30x - 1$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = (5x + 7)(4 - 3x)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'product_uitwerken' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (5x + 7)(4 - 3x)$h2sql$, 'product_uitwerken', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardige_producten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
    latex_body = $h2sql$f(x) = (3x + 1)^{2}$h2sql$,
    answer = $h2sql$18x + 6$h2sql$,
    latex_answer = $h2sql$18x + 6$h2sql$,
    answer_alternatives = ARRAY[$h2sql$6(3x+1)$h2sql$, $h2sql$2*3(3x+1)$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = (3x + 1)^{2}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardige_producten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (3x + 1)^{2}$h2sql$, 'merkwaardige_producten', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardige_producten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
    latex_body = $h2sql$f(x) = (2x - 5)^{2}$h2sql$,
    answer = $h2sql$8x - 20$h2sql$,
    latex_answer = $h2sql$8x - 20$h2sql$,
    answer_alternatives = ARRAY[$h2sql$4(2x-5)$h2sql$, $h2sql$2*2(2x-5)$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = (2x - 5)^{2}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardige_producten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (2x - 5)^{2}$h2sql$, 'merkwaardige_producten', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardige_producten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
    latex_body = $h2sql$f(x) = (3x + 6)^{2} - 8x$h2sql$,
    answer = $h2sql$18x + 28$h2sql$,
    latex_answer = $h2sql$18x + 28$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$f(x) = (3x + 6)^{2} - 8x$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardige_producten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (3x + 6)^{2} - 8x$h2sql$, 'merkwaardige_producten', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardige_producten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
    latex_body = $h2sql$f(x) = (2x + 3)^{2} - (x - 4)^{2}$h2sql$,
    answer = $h2sql$6x + 20$h2sql$,
    latex_answer = $h2sql$6x + 20$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$f(x) = (2x + 3)^{2} - (x - 4)^{2}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardige_producten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (2x + 3)^{2} - (x - 4)^{2}$h2sql$, 'merkwaardige_producten', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'constante_factor' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
    latex_body = $h2sql$f(x) = 5(x - 3)^{2} + 5(2x - 1)$h2sql$,
    answer = $h2sql$10x - 20$h2sql$,
    latex_answer = $h2sql$10x - 20$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$f(x) = 5(x - 3)^{2} + 5(2x - 1)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardige_producten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = 5(x - 3)^{2} + 5(2x - 1)$h2sql$, 'merkwaardige_producten', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'constante_factor' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
    latex_body = $h2sql$f(x) = 2(3x - 2)^{2} + 3(2x - 1)^{2}$h2sql$,
    answer = $h2sql$60x - 36$h2sql$,
    latex_answer = $h2sql$60x - 36$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = 2(3x - 2)^{2} + 3(2x - 1)^{2}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardige_producten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = 2(3x - 2)^{2} + 3(2x - 1)^{2}$h2sql$, 'merkwaardige_producten', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'constante_factor' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
    latex_body = $h2sql$f(x) = -3(x - 1)(5 - 9x) - 8(x - 7)$h2sql$,
    answer = $h2sql$54x - 50$h2sql$,
    latex_answer = $h2sql$54x - 50$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$f(x) = -3(x - 1)(5 - 9x) - 8(x - 7)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'product_uitwerken' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = -3(x - 1)(5 - 9x) - 8(x - 7)$h2sql$, 'product_uitwerken', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'hogere_graad' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
    latex_body = $h2sql$f(x) = x(2x - 1)^{2}$h2sql$,
    answer = $h2sql$12x^2 - 8x + 1$h2sql$,
    latex_answer = $h2sql$12x^{2} - 8x + 1$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = x(2x - 1)^{2}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'product_uitwerken' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = x(2x - 1)^{2}$h2sql$, 'product_uitwerken', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'hogere_graad' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
    latex_body = $h2sql$f(x) = \tfrac{1}{2}x^{3} + 2x^{2}(x - 4) + 6$h2sql$,
    answer = $h2sql$7,5x^2 - 16x$h2sql$,
    latex_answer = $h2sql$7{,}5x^{2} - 16x$h2sql$,
    answer_alternatives = ARRAY[$h2sql$7.5x^2-16x$h2sql$, $h2sql$15/2x^2-16x$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$f(x) = \tfrac{1}{2}x^{3} + 2x^{2}(x - 4) + 6$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'product_uitwerken' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \tfrac{1}{2}x^{3} + 2x^{2}(x - 4) + 6$h2sql$, 'product_uitwerken', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'hogere_graad' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'),
    latex_body = $h2sql$f(x) = 5(3x - 1)(x^{3} - 4x)$h2sql$,
    answer = $h2sql$60x^3 - 15x^2 - 120x + 20$h2sql$,
    latex_answer = $h2sql$60x^{3} - 15x^{2} - 120x + 20$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = 5(3x - 1)(x^{3} - 4x)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'product_uitwerken' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = 5(3x - 1)(x^{3} - 4x)$h2sql$, 'product_uitwerken', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$f(x) = (x^{2} - 4)(x^{3} + 2x + 3)$h2sql$,
    answer = $h2sql$2x(x^3 + 2x + 3) + (x^2 - 4)(3x^2 + 2)$h2sql$,
    latex_answer = $h2sql$2x(x^{3} + 2x + 3) + (x^{2} - 4)(3x^{2} + 2)$h2sql$,
    answer_alternatives = ARRAY[$h2sql$5x^4-6x^2+6x-8$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = (x^{2} - 4)(x^{3} + 2x + 3)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (x^{2} - 4)(x^{3} + 2x + 3)$h2sql$, 'twee_polynomen', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$f(x) = (2 - 3x^{2})(2 + 7x)$h2sql$,
    answer = $h2sql$-6x(2 + 7x) + (2 - 3x^2) * 7$h2sql$,
    latex_answer = $h2sql$-6x(2 + 7x) + (2 - 3x^{2}) \cdot 7$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-6x(2+7x)+7(2-3x^2)$h2sql$, $h2sql$-63x^2-12x+14$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = (2 - 3x^{2})(2 + 7x)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (2 - 3x^{2})(2 + 7x)$h2sql$, 'twee_polynomen', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$f(x) = (3x - 1)(x^{2} + 5x)$h2sql$,
    answer = $h2sql$3(x^2 + 5x) + (3x - 1)(2x + 5)$h2sql$,
    latex_answer = $h2sql$3(x^{2} + 5x) + (3x - 1)(2x + 5)$h2sql$,
    answer_alternatives = ARRAY[$h2sql$9x^2+28x-5$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$f(x) = (3x - 1)(x^{2} + 5x)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (3x - 1)(x^{2} + 5x)$h2sql$, 'twee_polynomen', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$f(x) = (x^{2} - 3x)(x^{3} + x^{2} + x)$h2sql$,
    answer = $h2sql$(2x - 3)(x^3 + x^2 + x) + (x^2 - 3x)(3x^2 + 2x + 1)$h2sql$,
    latex_answer = $h2sql$(2x - 3)(x^{3} + x^{2} + x) + (x^{2} - 3x)(3x^{2} + 2x + 1)$h2sql$,
    answer_alternatives = ARRAY[$h2sql$5x^4-8x^3-6x^2-6x$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$f(x) = (x^{2} - 3x)(x^{3} + x^{2} + x)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (x^{2} - 3x)(x^{3} + x^{2} + x)$h2sql$, 'twee_polynomen', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$f(x) = (5x^{5} - 3)(3x - 2)$h2sql$,
    answer = $h2sql$25x^4(3x - 2) + (5x^5 - 3) * 3$h2sql$,
    latex_answer = $h2sql$25x^{4}(3x - 2) + (5x^{5} - 3) \cdot 3$h2sql$,
    answer_alternatives = ARRAY[$h2sql$25x^4(3x-2)+3(5x^5-3)$h2sql$, $h2sql$90x^5-50x^4-9$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = (5x^{5} - 3)(3x - 2)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (5x^{5} - 3)(3x - 2)$h2sql$, 'twee_polynomen', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$l(t) = (5t^{3} - t)(3t^{5} + t)$h2sql$,
    answer = $h2sql$(15t^2 - 1)(3t^5 + t) + (5t^3 - t)(15t^4 + 1)$h2sql$,
    latex_answer = $h2sql$(15t^{2} - 1)(3t^{5} + t) + (5t^{3} - t)(15t^{4} + 1)$h2sql$,
    answer_alternatives = ARRAY[$h2sql$120t^7-18t^5+20t^3-2t$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$l(t) = (5t^{3} - t)(3t^{5} + t)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$l(t) = (5t^{3} - t)(3t^{5} + t)$h2sql$, 'twee_polynomen', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_van_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$f(x) = (x^{2} + 1)^{2}$h2sql$,
    answer = $h2sql$2x(x^2 + 1) + (x^2 + 1) * 2x$h2sql$,
    latex_answer = $h2sql$2x(x^{2} + 1) + (x^{2} + 1) \cdot 2x$h2sql$,
    answer_alternatives = ARRAY[$h2sql$4x(x^2+1)$h2sql$, $h2sql$2*2x(x^2+1)$h2sql$, $h2sql$4x^3+4x$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = (2x - 5)^{2}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_van_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (2x - 5)^{2}$h2sql$, 'kwadraat_van_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_van_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$f(x) = (x^{3} + 2)^{2}$h2sql$,
    answer = $h2sql$3x^2(x^3 + 2) + (x^3 + 2) * 3x^2$h2sql$,
    latex_answer = $h2sql$3x^{2}(x^{3} + 2) + (x^{3} + 2) \cdot 3x^{2}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$6x^2(x^3+2)$h2sql$, $h2sql$2*3x^2(x^3+2)$h2sql$, $h2sql$6x^5+12x^2$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = (3x + 1)^{2}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_van_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (3x + 1)^{2}$h2sql$, 'kwadraat_van_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_van_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$f(x) = (3x^{3} - 1)^{2}$h2sql$,
    answer = $h2sql$9x^2(3x^3 - 1) + (3x^3 - 1) * 9x^2$h2sql$,
    latex_answer = $h2sql$9x^{2}(3x^{3} - 1) + (3x^{3} - 1) \cdot 9x^{2}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$18x^2(3x^3-1)$h2sql$, $h2sql$2*9x^2(3x^3-1)$h2sql$, $h2sql$54x^5-18x^2$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$f(x) = (3x^{3} - 1)^{2}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_van_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (3x^{3} - 1)^{2}$h2sql$, 'kwadraat_van_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_van_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$f(x) = (3x^{2} - 4)^{2}$h2sql$,
    answer = $h2sql$6x(3x^2 - 4) + (3x^2 - 4) * 6x$h2sql$,
    latex_answer = $h2sql$6x(3x^{2} - 4) + (3x^{2} - 4) \cdot 6x$h2sql$,
    answer_alternatives = ARRAY[$h2sql$12x(3x^2-4)$h2sql$, $h2sql$2*6x(3x^2-4)$h2sql$, $h2sql$36x^3-48x$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$f(x) = (3x^{2} - 4)^{2}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_van_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (3x^{2} - 4)^{2}$h2sql$, 'kwadraat_van_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_van_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$m(q) = 1 - (3q^{2} - 2)^{2}$h2sql$,
    answer = $h2sql$-6q(3q^2 - 2) - (3q^2 - 2) * 6q$h2sql$,
    latex_answer = $h2sql$-6q(3q^{2} - 2) - (3q^{2} - 2) \cdot 6q$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-12q(3q^2-2)$h2sql$, $h2sql$-2*6q(3q^2-2)$h2sql$, $h2sql$-36q^3+24q$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$m(q) = 1 - (3q^{2} - 2)^{2}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_van_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$m(q) = 1 - (3q^{2} - 2)^{2}$h2sql$, 'kwadraat_van_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'genest_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$f(x) = 5 - 3(x^{4} - x)(x + 1)$h2sql$,
    answer = $h2sql$-(12x^3 - 3)(x + 1) - (3x^4 - 3x)$h2sql$,
    latex_answer = $h2sql$-(12x^{3} - 3)(x + 1) - (3x^{4} - 3x)$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-3(4x^3-1)(x+1)-3(x^4-x)$h2sql$, $h2sql$-15x^4-12x^3+6x+3$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = 5 - 3(x^{4} - x)(x + 1)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_van_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = 5 - 3(x^{4} - x)(x + 1)$h2sql$, 'kwadraat_van_polynoom', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'drie_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$f(x) = x(x - 1)(x + 2)$h2sql$,
    answer = $h2sql$(x - 1)(x + 2) + x(x + 2) + x(x - 1)$h2sql$,
    latex_answer = $h2sql$(x - 1)(x + 2) + x(x + 2) + x(x - 1)$h2sql$,
    answer_alternatives = ARRAY[$h2sql$3x^2+2x-2$h2sql$]::text[],
    difficulty = 3,
    order_index = 4
  WHERE latex_body = $h2sql$f(x) = x(x - 1)(x + 2)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'drie_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = x(x - 1)(x + 2)$h2sql$, 'drie_factoren', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'drie_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$F(t) = t(t - 1)(t + 2)$h2sql$,
    answer = $h2sql$(t - 1)(t + 2) + t(t + 2) + t(t - 1)$h2sql$,
    latex_answer = $h2sql$(t - 1)(t + 2) + t(t + 2) + t(t - 1)$h2sql$,
    answer_alternatives = ARRAY[$h2sql$3t^2+2t-2$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$F(t) = t(t - 1)(t + 2)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'drie_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$F(t) = t(t - 1)(t + 2)$h2sql$, 'drie_factoren', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'drie_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'),
    latex_body = $h2sql$f(x) = (x + 1)(x - 2)(2x + 3)$h2sql$,
    answer = $h2sql$(x - 2)(2x + 3) + (x + 1)(2x + 3) + 2(x + 1)(x - 2)$h2sql$,
    latex_answer = $h2sql$(x - 2)(2x + 3) + (x + 1)(2x + 3) + 2(x + 1)(x - 2)$h2sql$,
    answer_alternatives = ARRAY[$h2sql$6x^2+2x-7$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$f(x) = (x + 1)(x - 2)(2x + 3)$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'drie_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = (x + 1)(x - 2)(2x + 3)$h2sql$, 'drie_factoren', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = \dfrac{x - 2}{x + 5}$h2sql$,
    answer = $h2sql$7/(x + 5)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{7}{(x + 5)^{2}}$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = \dfrac{x - 2}{x + 5}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{x - 2}{x + 5}$h2sql$, 'eenvoudige_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = \dfrac{2}{2x - 1}$h2sql$,
    answer = $h2sql$-4/(2x - 1)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{-4}{(2x - 1)^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$-4/(2x-1)^2$h2sql$]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = \dfrac{2}{2x - 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{2}{2x - 1}$h2sql$, 'eenvoudige_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = \dfrac{2x + 1}{3x - 1}$h2sql$,
    answer = $h2sql$-5/(3x - 1)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{-5}{(3x - 1)^{2}}$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$f(x) = \dfrac{2x + 1}{3x - 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{2x + 1}{3x - 1}$h2sql$, 'eenvoudige_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = \dfrac{2x - 3}{3x - 1}$h2sql$,
    answer = $h2sql$7/(3x - 1)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{7}{(3x - 1)^{2}}$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$f(x) = \dfrac{2x - 3}{3x - 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{2x - 3}{3x - 1}$h2sql$, 'eenvoudige_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = \dfrac{3 - 4x}{2x + 5}$h2sql$,
    answer = $h2sql$-26/(2x + 5)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{-26}{(2x + 5)^{2}}$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = \dfrac{3 - 4x}{2x + 5}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{3 - 4x}{2x + 5}$h2sql$, 'eenvoudige_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(t) = \dfrac{5t + 2}{1 - 3t}$h2sql$,
    answer = $h2sql$11/(1 - 3t)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{11}{(1 - 3t)^{2}}$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$f(t) = \dfrac{5t + 2}{1 - 3t}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(t) = \dfrac{5t + 2}{1 - 3t}$h2sql$, 'eenvoudige_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = \dfrac{x^{2}}{x + 1}$h2sql$,
    answer = $h2sql$(x^2 + 2x)/(x + 1)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{x^{2} + 2x}{(x + 1)^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(2x(x+1)-x^2)/(x+1)^2$h2sql$]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = \dfrac{x^{2}}{x + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{x^{2}}{x + 1}$h2sql$, 'polynoom_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = \dfrac{3}{2x^{2} + 1}$h2sql$,
    answer = $h2sql$-12x/(2x^2 + 1)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{-12x}{(2x^{2} + 1)^{2}}$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = \dfrac{3}{2x^{2} + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{3}{2x^{2} + 1}$h2sql$, 'polynoom_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = \dfrac{x^{3}}{2x^{2} + 1}$h2sql$,
    answer = $h2sql$(2x^4 + 3x^2)/(2x^2 + 1)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{2x^{4} + 3x^{2}}{(2x^{2} + 1)^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(3x^2(2x^2+1)-x^3*4x)/(2x^2+1)^2$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$f(x) = \dfrac{x^{3}}{2x^{2} + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{x^{3}}{2x^{2} + 1}$h2sql$, 'polynoom_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = \dfrac{x^{4}}{x^{2} + 1}$h2sql$,
    answer = $h2sql$(2x^5 + 4x^3)/(x^2 + 1)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{2x^{5} + 4x^{3}}{(x^{2} + 1)^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(4x^3(x^2+1)-x^4*2x)/(x^2+1)^2$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$f(x) = \dfrac{x^{4}}{x^{2} + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{x^{4}}{x^{2} + 1}$h2sql$, 'polynoom_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = \dfrac{x - 2}{3 - x^{2}}$h2sql$,
    answer = $h2sql$(x^2 - 4x + 3)/(3 - x^2)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{x^{2} - 4x + 3}{(3 - x^{2})^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$((3-x^2)-(x-2)(-2x))/(3-x^2)^2$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = \dfrac{x - 2}{3 - x^{2}}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{x - 2}{3 - x^{2}}$h2sql$, 'polynoom_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$g(t) = \dfrac{t^{2} + 1}{t^{3} - t}$h2sql$,
    answer = $h2sql$(-t^4 - 4t^2 + 1)/(t^3 - t)^2$h2sql$,
    latex_answer = $h2sql$\dfrac{-t^{4} - 4t^{2} + 1}{(t^{3} - t)^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(2t(t^3-t)-(t^2+1)(3t^2-1))/(t^3-t)^2$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$g(t) = \dfrac{t^{2} + 1}{t^{3} - t}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$g(t) = \dfrac{t^{2} + 1}{t^{3} - t}$h2sql$, 'polynoom_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = x^{2} - \dfrac{3}{x + 1}$h2sql$,
    answer = $h2sql$2x + 3/(x + 1)^2$h2sql$,
    latex_answer = $h2sql$2x + \dfrac{3}{(x + 1)^{2}}$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 1,
    order_index = 1
  WHERE latex_body = $h2sql$f(x) = x^{2} - \dfrac{3}{x + 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = x^{2} - \dfrac{3}{x + 1}$h2sql$, 'som_met_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = x^{2} - \dfrac{2}{x + 4}$h2sql$,
    answer = $h2sql$2x + 2/(x + 4)^2$h2sql$,
    latex_answer = $h2sql$2x + \dfrac{2}{(x + 4)^{2}}$h2sql$,
    answer_alternatives = ARRAY[]::text[],
    difficulty = 1,
    order_index = 2
  WHERE latex_body = $h2sql$f(x) = x^{2} - \dfrac{2}{x + 4}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = x^{2} - \dfrac{2}{x + 4}$h2sql$, 'som_met_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = 3x + \dfrac{1}{x - 1}$h2sql$,
    answer = $h2sql$3 - 1/(x - 1)^2$h2sql$,
    latex_answer = $h2sql$3 - \dfrac{1}{(x - 1)^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$3+(-1)/(x-1)^2$h2sql$]::text[],
    difficulty = 2,
    order_index = 3
  WHERE latex_body = $h2sql$f(x) = 3x + \dfrac{1}{x - 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = 3x + \dfrac{1}{x - 1}$h2sql$, 'som_met_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = \dfrac{3 - x^{2}}{x - 2} + x^{3}$h2sql$,
    answer = $h2sql$(-x^2 + 4x - 3)/(x - 2)^2 + 3x^2$h2sql$,
    latex_answer = $h2sql$\dfrac{-x^{2} + 4x - 3}{(x - 2)^{2}} + 3x^{2}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$(-2x(x-2)-(3-x^2))/(x-2)^2+3x^2$h2sql$, $h2sql$3x^2+(-x^2+4x-3)/(x-2)^2$h2sql$]::text[],
    difficulty = 2,
    order_index = 4
  WHERE latex_body = $h2sql$f(x) = \dfrac{3 - x^{2}}{x - 2} + x^{3}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = \dfrac{3 - x^{2}}{x - 2} + x^{3}$h2sql$, 'som_met_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$f(x) = x^{3} + \dfrac{2x + 1}{x - 3}$h2sql$,
    answer = $h2sql$3x^2 - 7/(x - 3)^2$h2sql$,
    latex_answer = $h2sql$3x^{2} - \dfrac{7}{(x - 3)^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$3x^2+(-7)/(x-3)^2$h2sql$, $h2sql$3x^2+-7/(x-3)^2$h2sql$]::text[],
    difficulty = 3,
    order_index = 5
  WHERE latex_body = $h2sql$f(x) = x^{3} + \dfrac{2x + 1}{x - 3}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$f(x) = x^{3} + \dfrac{2x + 1}{x - 3}$h2sql$, 'som_met_breuk', n; END IF;
  UPDATE public.questions_new SET
    cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel')),
    topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'),
    latex_body = $h2sql$h(q) = q^{2} - \dfrac{q + 1}{2q - 1}$h2sql$,
    answer = $h2sql$2q + 3/(2q - 1)^2$h2sql$,
    latex_answer = $h2sql$2q + \dfrac{3}{(2q - 1)^{2}}$h2sql$,
    answer_alternatives = ARRAY[$h2sql$2q-(-3)/(2q-1)^2$h2sql$, $h2sql$2q--3/(2q-1)^2$h2sql$]::text[],
    difficulty = 3,
    order_index = 6
  WHERE latex_body = $h2sql$h(q) = q^{2} - \dfrac{q + 1}{2q - 1}$h2sql$
    AND cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', $h2sql$h(q) = q^{2} - \dfrac{q + 1}{2q - 1}$h2sql$, 'som_met_breuk', n; END IF;
END $do$;

-- 4. Clusters hernoemen en hertitelen (id blijft; voortgang en video-koppelingen blijven werken)
UPDATE public.topic_clusters_new SET slug = 'gehele_coefficienten', title = $h2sql$Gehele coëfficiënten$h2sql$, order_index = 1
WHERE slug = 'polynoom_differentieren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs');
UPDATE public.topic_clusters_new SET slug = 'breuken_decimalen', title = $h2sql$Breuken en decimalen$h2sql$, order_index = 2
WHERE slug = 'breuken_decimalen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs');
UPDATE public.topic_clusters_new SET slug = 'andere_letters', title = $h2sql$Andere letters$h2sql$, order_index = 3
WHERE slug = 'andere_letters' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs');
UPDATE public.topic_clusters_new SET slug = 'twee_lineaire_factoren', title = $h2sql$Twee lineaire factoren$h2sql$, order_index = 1
WHERE slug = 'product_uitwerken' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst');
UPDATE public.topic_clusters_new SET slug = 'merkwaardig_product', title = $h2sql$Merkwaardig product$h2sql$, order_index = 2
WHERE slug = 'merkwaardige_producten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst');
UPDATE public.topic_clusters_new SET slug = 'constante_factor', title = $h2sql$Constante factor en extra termen$h2sql$, order_index = 3
WHERE slug = 'constante_factor' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst');
UPDATE public.topic_clusters_new SET slug = 'hogere_graad', title = $h2sql$Hogere graad$h2sql$, order_index = 4
WHERE slug = 'hogere_graad' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst');
UPDATE public.topic_clusters_new SET slug = 'twee_polynomen', title = $h2sql$Twee polynomen$h2sql$, order_index = 1
WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel');
UPDATE public.topic_clusters_new SET slug = 'kwadraat_als_product', title = $h2sql$Kwadraat als product$h2sql$, order_index = 2
WHERE slug = 'kwadraat_van_polynoom' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel');
UPDATE public.topic_clusters_new SET slug = 'genest_in_som', title = $h2sql$Genest in een som$h2sql$, order_index = 3
WHERE slug = 'genest_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel');
UPDATE public.topic_clusters_new SET slug = 'drie_factoren', title = $h2sql$Drie factoren$h2sql$, order_index = 4
WHERE slug = 'drie_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel');
UPDATE public.topic_clusters_new SET slug = 'lineair_door_lineair', title = $h2sql$Lineair gedeeld door lineair$h2sql$, order_index = 1
WHERE slug = 'eenvoudige_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel');
UPDATE public.topic_clusters_new SET slug = 'polynoom_breuk', title = $h2sql$Polynoom-breuk$h2sql$, order_index = 2
WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel');
UPDATE public.topic_clusters_new SET slug = 'som_met_breuk', title = $h2sql$Som met breuk$h2sql$, order_index = 3
WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel');
UPDATE public.topic_clusters_new SET slug = 'welke_regel', title = $h2sql$Welke regel?$h2sql$, order_index = 1
WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd');

-- 5. Nieuwe vragen
INSERT INTO public.questions_new (topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, is_ai_generated, order_index, answer_alternatives, site) VALUES
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'gehele_coefficienten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')), $h2sql$f(x) = 4x^{5} - 2x^{3} + 6x - 9$h2sql$, $h2sql$20x^4 - 6x^2 + 6$h2sql$, $h2sql$20x^{4} - 6x^{2} + 6$h2sql$, 2, true, 3, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'gehele_coefficienten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')), $h2sql$g(x) = x^{7} - 3x^{4} + x^{2}$h2sql$, $h2sql$7x^6 - 12x^3 + 2x$h2sql$, $h2sql$7x^{6} - 12x^{3} + 2x$h2sql$, 2, true, 4, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'gehele_coefficienten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')), $h2sql$f(x) = -3x^{6} + x^{5} - 4x^{2} + 11$h2sql$, $h2sql$-18x^5 + 5x^4 - 8x$h2sql$, $h2sql$-18x^{5} + 5x^{4} - 8x$h2sql$, 3, true, 5, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'gehele_coefficienten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')), $h2sql$f(x) = 9 - 2x^{4} + 5x^{9} - x$h2sql$, $h2sql$45x^8 - 8x^3 - 1$h2sql$, $h2sql$45x^{8} - 8x^{3} - 1$h2sql$, 3, true, 6, ARRAY[$h2sql$-8x^3+45x^8-1$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'breuken_decimalen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')), $h2sql$f(x) = \tfrac{1}{2}x^{4} - \tfrac{1}{3}x^{3} + 2x$h2sql$, $h2sql$2x^3 - x^2 + 2$h2sql$, $h2sql$2x^{3} - x^{2} + 2$h2sql$, 1, true, 2, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'breuken_decimalen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')), $h2sql$f(x) = 0{,}4x^{5} - 1{,}5x^{2} + 3{,}2$h2sql$, $h2sql$2x^4 - 3x$h2sql$, $h2sql$2x^{4} - 3x$h2sql$, 2, true, 4, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'breuken_decimalen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')), $h2sql$f(x) = -\tfrac{1}{4}x^{8} + \tfrac{2}{3}x^{3} - x$h2sql$, $h2sql$-2x^7 + 2x^2 - 1$h2sql$, $h2sql$-2x^{7} + 2x^{2} - 1$h2sql$, 3, true, 5, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'breuken_decimalen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')), $h2sql$f(x) = 1{,}5x^{4} - \tfrac{3}{2}x^{2} + 0{,}25x$h2sql$, $h2sql$6x^3 - 3x + 0,25$h2sql$, $h2sql$6x^{3} - 3x + 0{,}25$h2sql$, 3, true, 6, ARRAY[$h2sql$6x^3-3x+1/4$h2sql$, $h2sql$6x^3-3x+0.25$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'andere_letters' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')), $h2sql$s(t) = 3t^{4} - 2t^{2} + 5t$h2sql$, $h2sql$12t^3 - 4t + 5$h2sql$, $h2sql$12t^{3} - 4t + 5$h2sql$, 1, true, 2, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'andere_letters' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')), $h2sql$N(p) = 0{,}5p^{2} - 3p + 7$h2sql$, $h2sql$p - 3$h2sql$, $h2sql$p - 3$h2sql$, 2, true, 4, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'andere_letters' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')), $h2sql$k(q) = 2 - q + 4q^{3} - q^{6}$h2sql$, $h2sql$-6q^5 + 12q^2 - 1$h2sql$, $h2sql$-6q^{5} + 12q^{2} - 1$h2sql$, 3, true, 5, ARRAY[$h2sql$-1+12q^2-6q^5$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'andere_letters' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs')), $h2sql$A(r) = \tfrac{1}{3}r^{6} - 2r^{3} + \tfrac{1}{2}r$h2sql$, $h2sql$2r^5 - 6r^2 + 1/2$h2sql$, $h2sql$2r^{5} - 6r^{2} + \tfrac{1}{2}$h2sql$, 3, true, 6, ARRAY[$h2sql$2r^5-6r^2+0.5$h2sql$, $h2sql$2r^5-6r^2+0,5$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_lineaire_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')), $h2sql$f(x) = (x + 4)(2x - 3)$h2sql$, $h2sql$4x + 5$h2sql$, $h2sql$4x + 5$h2sql$, 2, true, 3, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_lineaire_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')), $h2sql$f(x) = (4 - x)(3 + 2x)$h2sql$, $h2sql$-4x + 5$h2sql$, $h2sql$-4x + 5$h2sql$, 2, true, 4, ARRAY[$h2sql$5-4x$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_lineaire_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')), $h2sql$f(x) = (3x + 2)(2 - 5x)$h2sql$, $h2sql$-30x - 4$h2sql$, $h2sql$-30x - 4$h2sql$, 3, true, 5, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_lineaire_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')), $h2sql$g(t) = (2t - 1)(3t + 4) - 7t$h2sql$, $h2sql$12t - 2$h2sql$, $h2sql$12t - 2$h2sql$, 3, true, 6, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardig_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')), $h2sql$f(x) = (4x - 1)^{2} - 6x$h2sql$, $h2sql$32x - 14$h2sql$, $h2sql$32x - 14$h2sql$, 3, true, 5, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardig_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')), $h2sql$f(x) = (x + 3)^{2} - (2x - 1)^{2}$h2sql$, $h2sql$-6x + 10$h2sql$, $h2sql$-6x + 10$h2sql$, 3, true, 6, ARRAY[$h2sql$10-6x$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'constante_factor' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')), $h2sql$f(x) = 3(x - 2)^{2} + 4(x + 1)$h2sql$, $h2sql$6x - 8$h2sql$, $h2sql$6x - 8$h2sql$, 1, true, 1, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'constante_factor' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')), $h2sql$f(x) = 2(x + 1)(x - 3)$h2sql$, $h2sql$4x - 4$h2sql$, $h2sql$4x - 4$h2sql$, 1, true, 2, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'constante_factor' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')), $h2sql$f(x) = -2(x + 1)(3 - x) + 5(x - 2)$h2sql$, $h2sql$4x + 1$h2sql$, $h2sql$4x + 1$h2sql$, 2, true, 4, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'hogere_graad' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')), $h2sql$f(x) = x(3x - 2)^{2}$h2sql$, $h2sql$27x^2 - 24x + 4$h2sql$, $h2sql$27x^{2} - 24x + 4$h2sql$, 1, true, 2, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'hogere_graad' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')), $h2sql$f(x) = x^{2}(x - 5) + \tfrac{1}{4}x^{4}$h2sql$, $h2sql$x^3 + 3x^2 - 10x$h2sql$, $h2sql$x^{3} + 3x^{2} - 10x$h2sql$, 2, true, 4, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'hogere_graad' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst')), $h2sql$f(x) = 2(x^{2} + 1)(x^{3} - x)$h2sql$, $h2sql$10x^4 - 2$h2sql$, $h2sql$10x^{4} - 2$h2sql$, 3, true, 6, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_als_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')), $h2sql$f(x) = (x^{4} - x)^{2}$h2sql$, $h2sql$(4x^3 - 1)(x^4 - x) + (x^4 - x)(4x^3 - 1)$h2sql$, $h2sql$(4x^{3} - 1)(x^{4} - x) + (x^{4} - x)(4x^{3} - 1)$h2sql$, 3, true, 6, ARRAY[$h2sql$2(4x^3-1)(x^4-x)$h2sql$, $h2sql$8x^7-10x^4+2x$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'genest_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')), $h2sql$f(x) = x^{2} + (x + 1)(x^{2} - 3)$h2sql$, $h2sql$2x + (x^2 - 3) + (x + 1) * 2x$h2sql$, $h2sql$2x + (x^{2} - 3) + (x + 1) \cdot 2x$h2sql$, 1, true, 1, ARRAY[$h2sql$2x+(x^2-3)+2x(x+1)$h2sql$, $h2sql$3x^2+4x-3$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'genest_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')), $h2sql$f(x) = (2x - 1)(x^{3} + 4) + 6x$h2sql$, $h2sql$2(x^3 + 4) + (2x - 1) * 3x^2 + 6$h2sql$, $h2sql$2(x^{3} + 4) + (2x - 1) \cdot 3x^{2} + 6$h2sql$, 1, true, 2, ARRAY[$h2sql$2(x^3+4)+3x^2(2x-1)+6$h2sql$, $h2sql$8x^3-3x^2+14$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'genest_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')), $h2sql$f(x) = 2x + 3(x^{2} - 1)(x + 4)$h2sql$, $h2sql$2 + 6x(x + 4) + (3x^2 - 3)$h2sql$, $h2sql$2 + 6x(x + 4) + (3x^{2} - 3)$h2sql$, 2, true, 3, ARRAY[$h2sql$2+6x(x+4)+3x^2-3$h2sql$, $h2sql$9x^2+24x-1$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'genest_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')), $h2sql$f(x) = x^{2} - (x^{3} - 2)(x + 5)$h2sql$, $h2sql$2x - 3x^2(x + 5) - (x^3 - 2)$h2sql$, $h2sql$2x - 3x^{2}(x + 5) - (x^{3} - 2)$h2sql$, 2, true, 4, ARRAY[$h2sql$2x-(3x^2(x+5)+(x^3-2))$h2sql$, $h2sql$-4x^3-15x^2+2x+2$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'genest_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')), $h2sql$f(x) = 7 - 2(x^{3} + 1)(x^{2} - x)$h2sql$, $h2sql$-6x^2(x^2 - x) - (2x^3 + 2)(2x - 1)$h2sql$, $h2sql$-6x^{2}(x^{2} - x) - (2x^{3} + 2)(2x - 1)$h2sql$, 3, true, 6, ARRAY[$h2sql$-10x^4+8x^3-4x+2$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'drie_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')), $h2sql$f(x) = x(x + 3)(x - 1)$h2sql$, $h2sql$(x + 3)(x - 1) + x(x - 1) + x(x + 3)$h2sql$, $h2sql$(x + 3)(x - 1) + x(x - 1) + x(x + 3)$h2sql$, 2, true, 1, ARRAY[$h2sql$3x^2+4x-3$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'drie_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')), $h2sql$f(x) = (x - 2)(x + 2)(x^{2} + 1)$h2sql$, $h2sql$(x + 2)(x^2 + 1) + (x - 2)(x^2 + 1) + (x - 2)(x + 2) * 2x$h2sql$, $h2sql$(x + 2)(x^{2} + 1) + (x - 2)(x^{2} + 1) + (x - 2)(x + 2) \cdot 2x$h2sql$, 2, true, 2, ARRAY[$h2sql$4x^3-6x$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'drie_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel')), $h2sql$f(x) = 2x(x^{2} - 1)(x + 4)$h2sql$, $h2sql$2(x^2 - 1)(x + 4) + 2x * 2x(x + 4) + 2x(x^2 - 1)$h2sql$, $h2sql$2(x^{2} - 1)(x + 4) + 2x \cdot 2x(x + 4) + 2x(x^{2} - 1)$h2sql$, 2, true, 3, ARRAY[$h2sql$2(x^2-1)(x+4)+4x^2(x+4)+2x(x^2-1)$h2sql$, $h2sql$8x^3+24x^2-4x-8$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd')), $h2sql$f(x) = (x + 1)(x - 1)$h2sql$, $h2sql$2x$h2sql$, $h2sql$2x$h2sql$, 1, true, 1, ARRAY[$h2sql$(x-1)+(x+1)$h2sql$, $h2sql$1(x-1)+(x+1)1$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd')), $h2sql$f(x) = \dfrac{x^{2} - 4}{x + 1}$h2sql$, $h2sql$(x^2 + 2x + 4)/(x + 1)^2$h2sql$, $h2sql$\dfrac{x^{2} + 2x + 4}{(x + 1)^{2}}$h2sql$, 1, true, 2, ARRAY[$h2sql$(2x(x+1)-(x^2-4))/(x+1)^2$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd')), $h2sql$f(x) = 3x^{4} - 2(x + 1)^{2}$h2sql$, $h2sql$12x^3 - 4x - 4$h2sql$, $h2sql$12x^{3} - 4x - 4$h2sql$, 1, true, 3, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd')), $h2sql$f(x) = (x^{2} + 1)(x^{3} - x)$h2sql$, $h2sql$2x(x^3 - x) + (x^2 + 1)(3x^2 - 1)$h2sql$, $h2sql$2x(x^{3} - x) + (x^{2} + 1)(3x^{2} - 1)$h2sql$, 1, true, 4, ARRAY[$h2sql$5x^4-1$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd')), $h2sql$f(x) = x^{2} + \dfrac{1}{x - 2}$h2sql$, $h2sql$2x - 1/(x - 2)^2$h2sql$, $h2sql$2x - \dfrac{1}{(x - 2)^{2}}$h2sql$, 2, true, 5, ARRAY[$h2sql$2x+(-1)/(x-2)^2$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd')), $h2sql$f(x) = (x^{3} - 1)^{2}$h2sql$, $h2sql$3x^2(x^3 - 1) + (x^3 - 1) * 3x^2$h2sql$, $h2sql$3x^{2}(x^{3} - 1) + (x^{3} - 1) \cdot 3x^{2}$h2sql$, 2, true, 6, ARRAY[$h2sql$6x^2(x^3-1)$h2sql$, $h2sql$6x^5-6x^2$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd')), $h2sql$f(x) = 4x^{3} - \tfrac{1}{2}x^{2} + 6$h2sql$, $h2sql$12x^2 - x$h2sql$, $h2sql$12x^{2} - x$h2sql$, 2, true, 7, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd')), $h2sql$f(x) = \dfrac{5}{x^{2} + 3}$h2sql$, $h2sql$-10x/(x^2 + 3)^2$h2sql$, $h2sql$\dfrac{-10x}{(x^{2} + 3)^{2}}$h2sql$, 2, true, 8, ARRAY[]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd')), $h2sql$f(x) = (2x - 3)(x^{2} + x) - x^{3}$h2sql$, $h2sql$2(x^2 + x) + (2x - 3)(2x + 1) - 3x^2$h2sql$, $h2sql$2(x^{2} + x) + (2x - 3)(2x + 1) - 3x^{2}$h2sql$, 3, true, 9, ARRAY[$h2sql$3x^2-2x-3$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd')), $h2sql$g(t) = \dfrac{t^{2}}{2t - 1}$h2sql$, $h2sql$(2t^2 - 2t)/(2t - 1)^2$h2sql$, $h2sql$\dfrac{2t^{2} - 2t}{(2t - 1)^{2}}$h2sql$, 3, true, 10, ARRAY[$h2sql$(2t(2t-1)-t^2*2)/(2t-1)^2$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd')), $h2sql$f(x) = 2x(x - 1)(x + 3)$h2sql$, $h2sql$6x^2 + 8x - 6$h2sql$, $h2sql$6x^{2} + 8x - 6$h2sql$, 3, true, 11, ARRAY[$h2sql$2(x-1)(x+3)+2x(x+3)+2x(x-1)$h2sql$]::text[], 'afgeleiden'),
  ((SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'), (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd')), $h2sql$f(x) = 5 - \dfrac{3x}{x^{2} + 1}$h2sql$, $h2sql$(3x^2 - 3)/(x^2 + 1)^2$h2sql$, $h2sql$\dfrac{3x^{2} - 3}{(x^{2} + 1)^{2}}$h2sql$, 3, true, 12, ARRAY[$h2sql$-(3-3x^2)/(x^2+1)^2$h2sql$, $h2sql$0-(3(x^2+1)-3x*2x)/(x^2+1)^2$h2sql$]::text[], 'afgeleiden');

-- 6. Alle H2-stappen vervangen
DELETE FROM public.question_steps_new WHERE question_id IN (SELECT id FROM public.questions_new WHERE topic_id IN (SELECT id FROM public.topics_new WHERE chapter_id = (SELECT id FROM public.chapters WHERE slug = 'h2')));

INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, s.step_order, s.description
FROM (VALUES
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 5x^{6} - 3x^{5} + 2x - 7$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 5x^{6} - 3x^{5} + 2x - 7$h2sql$, 1, $h2sql$Termen: $5x^6$, $-3x^5$, $2x$, $-7$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 5x^{6} - 3x^{5} + 2x - 7$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[5x^6]' = 30x^5$, $[-3x^5]' = -15x^4$, $[2x]' = 2$, $[-7]' = 0$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 5x^{6} - 3x^{5} + 2x - 7$h2sql$, 3, $h2sql$Optellen: $f'(x) = 30x^5 - 15x^4 + 2$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 2x^{3} - 5x^{2} + 8x - 4$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 2x^{3} - 5x^{2} + 8x - 4$h2sql$, 1, $h2sql$Termen: $2x^3$, $-5x^2$, $8x$, $-4$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 2x^{3} - 5x^{2} + 8x - 4$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[2x^3]' = 6x^2$, $[-5x^2]' = -10x$, $[8x]' = 8$, $[-4]' = 0$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 2x^{3} - 5x^{2} + 8x - 4$h2sql$, 3, $h2sql$Optellen: $f'(x) = 6x^2 - 10x + 8$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 4x^{5} - 2x^{3} + 6x - 9$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 4x^{5} - 2x^{3} + 6x - 9$h2sql$, 1, $h2sql$Termen: $4x^5$, $-2x^3$, $6x$, $-9$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 4x^{5} - 2x^{3} + 6x - 9$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[4x^5]' = 20x^4$, $[-2x^3]' = -6x^2$, $[6x]' = 6$, $[-9]' = 0$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 4x^{5} - 2x^{3} + 6x - 9$h2sql$, 3, $h2sql$Optellen: $f'(x) = 20x^4 - 6x^2 + 6$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$g(x) = x^{7} - 3x^{4} + x^{2}$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$g(x) = x^{7} - 3x^{4} + x^{2}$h2sql$, 1, $h2sql$Termen: $x^7$, $-3x^4$, $x^2$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$g(x) = x^{7} - 3x^{4} + x^{2}$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[x^7]' = 7x^6$, $[-3x^4]' = -12x^3$, $[x^2]' = 2x$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$g(x) = x^{7} - 3x^{4} + x^{2}$h2sql$, 3, $h2sql$Optellen: $g'(x) = 7x^6 - 12x^3 + 2x$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = -3x^{6} + x^{5} - 4x^{2} + 11$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = -3x^{6} + x^{5} - 4x^{2} + 11$h2sql$, 1, $h2sql$Termen: $-3x^6$, $x^5$, $-4x^2$, $11$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = -3x^{6} + x^{5} - 4x^{2} + 11$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[-3x^6]' = -18x^5$, $[x^5]' = 5x^4$, $[-4x^2]' = -8x$, $[11]' = 0$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = -3x^{6} + x^{5} - 4x^{2} + 11$h2sql$, 3, $h2sql$Optellen: $f'(x) = -18x^5 + 5x^4 - 8x$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 9 - 2x^{4} + 5x^{9} - x$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 9 - 2x^{4} + 5x^{9} - x$h2sql$, 1, $h2sql$Termen: $9$, $-2x^4$, $5x^9$, $-x$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 9 - 2x^{4} + 5x^{9} - x$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[9]' = 0$, $[-2x^4]' = -8x^3$, $[5x^9]' = 45x^8$, $[-x]' = -1$.$h2sql$),
  ('h2_termsgewijs', 'gehele_coefficienten', $h2sql$f(x) = 9 - 2x^{4} + 5x^{9} - x$h2sql$, 3, $h2sql$Optellen: $f'(x) = 45x^8 - 8x^3 - 1$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = -2x^{8} - 4x^{4} + 7{,}2$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = -2x^{8} - 4x^{4} + 7{,}2$h2sql$, 1, $h2sql$Termen: $-2x^8$, $-4x^4$, $7{,}2$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = -2x^{8} - 4x^{4} + 7{,}2$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[-2x^8]' = -16x^7$, $[-4x^4]' = -16x^3$, $[7{,}2]' = 0$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = -2x^{8} - 4x^{4} + 7{,}2$h2sql$, 3, $h2sql$Optellen: $f'(x) = -16x^7 - 16x^3$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = \tfrac{1}{2}x^{4} - \tfrac{1}{3}x^{3} + 2x$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = \tfrac{1}{2}x^{4} - \tfrac{1}{3}x^{3} + 2x$h2sql$, 1, $h2sql$Termen: $\tfrac{1}{2}x^4$, $-\tfrac{1}{3}x^3$, $2x$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = \tfrac{1}{2}x^{4} - \tfrac{1}{3}x^{3} + 2x$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[\tfrac{1}{2}x^4]' = 4 \cdot \tfrac{1}{2}x^3 = 2x^3$, $[-\tfrac{1}{3}x^3]' = -3 \cdot \tfrac{1}{3}x^2 = -x^2$, $[2x]' = 2$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = \tfrac{1}{2}x^{4} - \tfrac{1}{3}x^{3} + 2x$h2sql$, 3, $h2sql$Optellen: $f'(x) = 2x^3 - x^2 + 2$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = 0{,}6x^{3} - 1{,}3x^{2} + 7$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = 0{,}6x^{3} - 1{,}3x^{2} + 7$h2sql$, 1, $h2sql$Termen: $0{,}6x^3$, $-1{,}3x^2$, $7$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = 0{,}6x^{3} - 1{,}3x^{2} + 7$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[0{,}6x^3]' = 3 \cdot 0{,}6x^2 = 1{,}8x^2$, $[-1{,}3x^2]' = -2 \cdot 1{,}3x = -2{,}6x$, $[7]' = 0$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = 0{,}6x^{3} - 1{,}3x^{2} + 7$h2sql$, 3, $h2sql$Optellen: $f'(x) = 1{,}8x^2 - 2{,}6x$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = 0{,}4x^{5} - 1{,}5x^{2} + 3{,}2$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = 0{,}4x^{5} - 1{,}5x^{2} + 3{,}2$h2sql$, 1, $h2sql$Termen: $0{,}4x^5$, $-1{,}5x^2$, $3{,}2$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = 0{,}4x^{5} - 1{,}5x^{2} + 3{,}2$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[0{,}4x^5]' = 5 \cdot 0{,}4x^4 = 2x^4$, $[-1{,}5x^2]' = -2 \cdot 1{,}5x = -3x$, $[3{,}2]' = 0$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = 0{,}4x^{5} - 1{,}5x^{2} + 3{,}2$h2sql$, 3, $h2sql$Optellen: $f'(x) = 2x^4 - 3x$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = -\tfrac{1}{4}x^{8} + \tfrac{2}{3}x^{3} - x$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = -\tfrac{1}{4}x^{8} + \tfrac{2}{3}x^{3} - x$h2sql$, 1, $h2sql$Termen: $-\tfrac{1}{4}x^8$, $\tfrac{2}{3}x^3$, $-x$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = -\tfrac{1}{4}x^{8} + \tfrac{2}{3}x^{3} - x$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[-\tfrac{1}{4}x^8]' = -8 \cdot \tfrac{1}{4}x^7 = -2x^7$, $[\tfrac{2}{3}x^3]' = 3 \cdot \tfrac{2}{3}x^2 = 2x^2$, $[-x]' = -1$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = -\tfrac{1}{4}x^{8} + \tfrac{2}{3}x^{3} - x$h2sql$, 3, $h2sql$Optellen: $f'(x) = -2x^7 + 2x^2 - 1$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = 1{,}5x^{4} - \tfrac{3}{2}x^{2} + 0{,}25x$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = 1{,}5x^{4} - \tfrac{3}{2}x^{2} + 0{,}25x$h2sql$, 1, $h2sql$Termen: $1{,}5x^4$, $-\tfrac{3}{2}x^2$, $0{,}25x$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = 1{,}5x^{4} - \tfrac{3}{2}x^{2} + 0{,}25x$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[1{,}5x^4]' = 4 \cdot 1{,}5x^3 = 6x^3$, $[-\tfrac{3}{2}x^2]' = -2 \cdot \tfrac{3}{2}x = -3x$, $[0{,}25x]' = 0{,}25$.$h2sql$),
  ('h2_termsgewijs', 'breuken_decimalen', $h2sql$f(x) = 1{,}5x^{4} - \tfrac{3}{2}x^{2} + 0{,}25x$h2sql$, 3, $h2sql$Optellen: $f'(x) = 6x^3 - 3x + 0{,}25$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$h(t) = 2t^{3} - 4t^{2} + 3t - 2$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ → somregel. De variabele heet $t$, de regels blijven hetzelfde.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$h(t) = 2t^{3} - 4t^{2} + 3t - 2$h2sql$, 1, $h2sql$Termen: $2t^3$, $-4t^2$, $3t$, $-2$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$h(t) = 2t^{3} - 4t^{2} + 3t - 2$h2sql$, 2, $h2sql$Machtsregel per term, $[at^n]' = n \cdot at^{n-1}$: $[2t^3]' = 6t^2$, $[-4t^2]' = -8t$, $[3t]' = 3$, $[-2]' = 0$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$h(t) = 2t^{3} - 4t^{2} + 3t - 2$h2sql$, 3, $h2sql$Optellen: $h'(t) = 6t^2 - 8t + 3$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$s(t) = 3t^{4} - 2t^{2} + 5t$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ → somregel. De variabele heet $t$, de regels blijven hetzelfde.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$s(t) = 3t^{4} - 2t^{2} + 5t$h2sql$, 1, $h2sql$Termen: $3t^4$, $-2t^2$, $5t$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$s(t) = 3t^{4} - 2t^{2} + 5t$h2sql$, 2, $h2sql$Machtsregel per term, $[at^n]' = n \cdot at^{n-1}$: $[3t^4]' = 12t^3$, $[-2t^2]' = -4t$, $[5t]' = 5$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$s(t) = 3t^{4} - 2t^{2} + 5t$h2sql$, 3, $h2sql$Optellen: $s'(t) = 12t^3 - 4t + 5$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$k(q) = 1 + 3q - 3q^{2} - 5q^{7}$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ → somregel. De variabele heet $q$, de regels blijven hetzelfde.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$k(q) = 1 + 3q - 3q^{2} - 5q^{7}$h2sql$, 1, $h2sql$Termen: $1$, $3q$, $-3q^2$, $-5q^7$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$k(q) = 1 + 3q - 3q^{2} - 5q^{7}$h2sql$, 2, $h2sql$Machtsregel per term, $[aq^n]' = n \cdot aq^{n-1}$: $[1]' = 0$, $[3q]' = 3$, $[-3q^2]' = -6q$, $[-5q^7]' = -35q^6$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$k(q) = 1 + 3q - 3q^{2} - 5q^{7}$h2sql$, 3, $h2sql$Optellen: $k'(q) = -35q^6 - 6q + 3$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$N(p) = 0{,}5p^{2} - 3p + 7$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ → somregel. De variabele heet $p$, de regels blijven hetzelfde.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$N(p) = 0{,}5p^{2} - 3p + 7$h2sql$, 1, $h2sql$Termen: $0{,}5p^2$, $-3p$, $7$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$N(p) = 0{,}5p^{2} - 3p + 7$h2sql$, 2, $h2sql$Machtsregel per term, $[ap^n]' = n \cdot ap^{n-1}$: $[0{,}5p^2]' = 2 \cdot 0{,}5p = p$, $[-3p]' = -3$, $[7]' = 0$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$N(p) = 0{,}5p^{2} - 3p + 7$h2sql$, 3, $h2sql$Optellen: $N'(p) = p - 3$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$k(q) = 2 - q + 4q^{3} - q^{6}$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ → somregel. De variabele heet $q$, de regels blijven hetzelfde.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$k(q) = 2 - q + 4q^{3} - q^{6}$h2sql$, 1, $h2sql$Termen: $2$, $-q$, $4q^3$, $-q^6$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$k(q) = 2 - q + 4q^{3} - q^{6}$h2sql$, 2, $h2sql$Machtsregel per term, $[aq^n]' = n \cdot aq^{n-1}$: $[2]' = 0$, $[-q]' = -1$, $[4q^3]' = 12q^2$, $[-q^6]' = -6q^5$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$k(q) = 2 - q + 4q^{3} - q^{6}$h2sql$, 3, $h2sql$Optellen: $k'(q) = -6q^5 + 12q^2 - 1$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$A(r) = \tfrac{1}{3}r^{6} - 2r^{3} + \tfrac{1}{2}r$h2sql$, 0, $h2sql$Buitenste schil: losse termen met $+$ en $-$ → somregel. De variabele heet $r$, de regels blijven hetzelfde.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$A(r) = \tfrac{1}{3}r^{6} - 2r^{3} + \tfrac{1}{2}r$h2sql$, 1, $h2sql$Termen: $\tfrac{1}{3}r^6$, $-2r^3$, $\tfrac{1}{2}r$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$A(r) = \tfrac{1}{3}r^{6} - 2r^{3} + \tfrac{1}{2}r$h2sql$, 2, $h2sql$Machtsregel per term, $[ar^n]' = n \cdot ar^{n-1}$: $[\tfrac{1}{3}r^6]' = 6 \cdot \tfrac{1}{3}r^5 = 2r^5$, $[-2r^3]' = -6r^2$, $[\tfrac{1}{2}r]' = \tfrac{1}{2}$.$h2sql$),
  ('h2_termsgewijs', 'andere_letters', $h2sql$A(r) = \tfrac{1}{3}r^{6} - 2r^{3} + \tfrac{1}{2}r$h2sql$, 3, $h2sql$Optellen: $A'(r) = 2r^5 - 6r^2 + \tfrac{1}{2}$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (3 - x)(5 + 2x)$h2sql$, 0, $h2sql$Buitenste schil: haakjes die je in één keer kunt uitwerken → eerst uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (3 - x)(5 + 2x)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 15 + 6x - 5x - 2x^2$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (3 - x)(5 + 2x)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = -2x^2 + x + 15$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (3 - x)(5 + 2x)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = -4x + 1$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (5x + 7)(4 - 3x)$h2sql$, 0, $h2sql$Buitenste schil: haakjes die je in één keer kunt uitwerken → eerst uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (5x + 7)(4 - 3x)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 20x - 15x^2 + 28 - 21x$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (5x + 7)(4 - 3x)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = -15x^2 - x + 28$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (5x + 7)(4 - 3x)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = -30x - 1$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (x + 4)(2x - 3)$h2sql$, 0, $h2sql$Buitenste schil: haakjes die je in één keer kunt uitwerken → eerst uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (x + 4)(2x - 3)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 2x^2 - 3x + 8x - 12$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (x + 4)(2x - 3)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 2x^2 + 5x - 12$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (x + 4)(2x - 3)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 4x + 5$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (4 - x)(3 + 2x)$h2sql$, 0, $h2sql$Buitenste schil: haakjes die je in één keer kunt uitwerken → eerst uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (4 - x)(3 + 2x)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 12 + 8x - 3x - 2x^2$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (4 - x)(3 + 2x)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = -2x^2 + 5x + 12$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (4 - x)(3 + 2x)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = -4x + 5$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (3x + 2)(2 - 5x)$h2sql$, 0, $h2sql$Buitenste schil: haakjes die je in één keer kunt uitwerken → eerst uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (3x + 2)(2 - 5x)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 6x - 15x^2 + 4 - 10x$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (3x + 2)(2 - 5x)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = -15x^2 - 4x + 4$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$f(x) = (3x + 2)(2 - 5x)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = -30x - 4$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$g(t) = (2t - 1)(3t + 4) - 7t$h2sql$, 0, $h2sql$Buitenste schil: haakjes die je in één keer kunt uitwerken → eerst uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$g(t) = (2t - 1)(3t + 4) - 7t$h2sql$, 1, $h2sql$Werk de haakjes uit: $g(t) = 6t^2 + 8t - 3t - 4 - 7t$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$g(t) = (2t - 1)(3t + 4) - 7t$h2sql$, 2, $h2sql$Herleid tot een polynoom: $g(t) = 6t^2 - 2t - 4$.$h2sql$),
  ('h2_haakjes_eerst', 'twee_lineaire_factoren', $h2sql$g(t) = (2t - 1)(3t + 4) - 7t$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $g'(t) = 12t - 2$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (3x + 1)^{2}$h2sql$, 0, $h2sql$Buitenste schil: een kwadraat van een lineaire vorm, $(a + b)^2 = a^2 + 2ab + b^2$ → eerst uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (3x + 1)^{2}$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = (3x)^2 + 2 \cdot 3x \cdot 1 + 1^2$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (3x + 1)^{2}$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 9x^2 + 6x + 1$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (3x + 1)^{2}$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 18x + 6$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (2x - 5)^{2}$h2sql$, 0, $h2sql$Buitenste schil: een kwadraat van een lineaire vorm, $(a - b)^2 = a^2 - 2ab + b^2$ → eerst uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (2x - 5)^{2}$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = (2x)^2 - 2 \cdot 2x \cdot 5 + 5^2$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (2x - 5)^{2}$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 4x^2 - 20x + 25$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (2x - 5)^{2}$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 8x - 20$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (3x + 6)^{2} - 8x$h2sql$, 0, $h2sql$Buitenste schil: haakjes die je in één keer kunt uitwerken → eerst uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (3x + 6)^{2} - 8x$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 9x^2 + 36x + 36 - 8x$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (3x + 6)^{2} - 8x$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 9x^2 + 28x + 36$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (3x + 6)^{2} - 8x$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 18x + 28$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (2x + 3)^{2} - (x - 4)^{2}$h2sql$, 0, $h2sql$Buitenste schil: twee kwadraten met een $-$ ertussen → beide uitwerken, let op de min vóór het tweede kwadraat.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (2x + 3)^{2} - (x - 4)^{2}$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 4x^2 + 12x + 9 - (x^2 - 8x + 16)$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (2x + 3)^{2} - (x - 4)^{2}$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 3x^2 + 20x - 7$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (2x + 3)^{2} - (x - 4)^{2}$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 6x + 20$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (4x - 1)^{2} - 6x$h2sql$, 0, $h2sql$Buitenste schil: haakjes die je in één keer kunt uitwerken → eerst uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (4x - 1)^{2} - 6x$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 16x^2 - 8x + 1 - 6x$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (4x - 1)^{2} - 6x$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 16x^2 - 14x + 1$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (4x - 1)^{2} - 6x$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 32x - 14$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (x + 3)^{2} - (2x - 1)^{2}$h2sql$, 0, $h2sql$Buitenste schil: twee kwadraten met een $-$ ertussen → beide uitwerken, let op de min vóór het tweede kwadraat.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (x + 3)^{2} - (2x - 1)^{2}$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = x^2 + 6x + 9 - (4x^2 - 4x + 1)$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (x + 3)^{2} - (2x - 1)^{2}$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = -3x^2 + 10x + 8$.$h2sql$),
  ('h2_haakjes_eerst', 'merkwaardig_product', $h2sql$f(x) = (x + 3)^{2} - (2x - 1)^{2}$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = -6x + 10$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 3(x - 2)^{2} + 4(x + 1)$h2sql$, 0, $h2sql$Buitenste schil: haakjes met een getal ervoor → eerst uitwerken (getal mee vermenigvuldigen), dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 3(x - 2)^{2} + 4(x + 1)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 3(x^2 - 4x + 4) + 4x + 4$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 3(x - 2)^{2} + 4(x + 1)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 3x^2 - 8x + 16$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 3(x - 2)^{2} + 4(x + 1)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 6x - 8$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 2(x + 1)(x - 3)$h2sql$, 0, $h2sql$Buitenste schil: haakjes met een getal ervoor → eerst uitwerken (getal mee vermenigvuldigen), dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 2(x + 1)(x - 3)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 2(x^2 - 3x + x - 3)$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 2(x + 1)(x - 3)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 2x^2 - 4x - 6$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 2(x + 1)(x - 3)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 4x - 4$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 5(x - 3)^{2} + 5(2x - 1)$h2sql$, 0, $h2sql$Buitenste schil: haakjes met een getal ervoor → eerst uitwerken (getal mee vermenigvuldigen), dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 5(x - 3)^{2} + 5(2x - 1)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 5(x^2 - 6x + 9) + 10x - 5$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 5(x - 3)^{2} + 5(2x - 1)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 5x^2 - 20x + 40$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 5(x - 3)^{2} + 5(2x - 1)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 10x - 20$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = -2(x + 1)(3 - x) + 5(x - 2)$h2sql$, 0, $h2sql$Buitenste schil: haakjes met een negatief getal ervoor → eerst uitwerken, de min gaat over álle termen.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = -2(x + 1)(3 - x) + 5(x - 2)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = -2(-x^2 + 2x + 3) + 5x - 10$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = -2(x + 1)(3 - x) + 5(x - 2)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 2x^2 + x - 16$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = -2(x + 1)(3 - x) + 5(x - 2)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 4x + 1$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 2(3x - 2)^{2} + 3(2x - 1)^{2}$h2sql$, 0, $h2sql$Buitenste schil: twee kwadraten met een getal ervoor → beide uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 2(3x - 2)^{2} + 3(2x - 1)^{2}$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 2(9x^2 - 12x + 4) + 3(4x^2 - 4x + 1)$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 2(3x - 2)^{2} + 3(2x - 1)^{2}$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 30x^2 - 36x + 11$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = 2(3x - 2)^{2} + 3(2x - 1)^{2}$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 60x - 36$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = -3(x - 1)(5 - 9x) - 8(x - 7)$h2sql$, 0, $h2sql$Buitenste schil: haakjes met een negatief getal ervoor → eerst uitwerken, de min gaat over álle termen.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = -3(x - 1)(5 - 9x) - 8(x - 7)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = -3(-9x^2 + 14x - 5) - 8x + 56$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = -3(x - 1)(5 - 9x) - 8(x - 7)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 27x^2 - 50x + 71$.$h2sql$),
  ('h2_haakjes_eerst', 'constante_factor', $h2sql$f(x) = -3(x - 1)(5 - 9x) - 8(x - 7)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 54x - 50$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = x(2x - 1)^{2}$h2sql$, 0, $h2sql$Buitenste schil: $x$ maal een kwadraat → eerst het kwadraat uitwerken, dan $x$ erdoor, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = x(2x - 1)^{2}$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = x(4x^2 - 4x + 1)$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = x(2x - 1)^{2}$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 4x^3 - 4x^2 + x$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = x(2x - 1)^{2}$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 12x^2 - 8x + 1$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = x(3x - 2)^{2}$h2sql$, 0, $h2sql$Buitenste schil: $x$ maal een kwadraat → eerst het kwadraat uitwerken, dan $x$ erdoor, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = x(3x - 2)^{2}$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = x(9x^2 - 12x + 4)$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = x(3x - 2)^{2}$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 9x^3 - 12x^2 + 4x$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = x(3x - 2)^{2}$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 27x^2 - 24x + 4$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = \tfrac{1}{2}x^{3} + 2x^{2}(x - 4) + 6$h2sql$, 0, $h2sql$Buitenste schil: termen met $+$ ertussen, waarvan één met haakjes → eerst die haakjes uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = \tfrac{1}{2}x^{3} + 2x^{2}(x - 4) + 6$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = \tfrac{1}{2}x^3 + 2x^3 - 8x^2 + 6$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = \tfrac{1}{2}x^{3} + 2x^{2}(x - 4) + 6$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 2\tfrac{1}{2}x^3 - 8x^2 + 6$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = \tfrac{1}{2}x^{3} + 2x^{2}(x - 4) + 6$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 7{,}5x^2 - 16x$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = x^{2}(x - 5) + \tfrac{1}{4}x^{4}$h2sql$, 0, $h2sql$Buitenste schil: termen met $+$ ertussen, waarvan één met haakjes → eerst die haakjes uitwerken, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = x^{2}(x - 5) + \tfrac{1}{4}x^{4}$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = x^3 - 5x^2 + \tfrac{1}{4}x^4$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = x^{2}(x - 5) + \tfrac{1}{4}x^{4}$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = \tfrac{1}{4}x^4 + x^3 - 5x^2$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = x^{2}(x - 5) + \tfrac{1}{4}x^{4}$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = x^3 + 3x^2 - 10x$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = 5(3x - 1)(x^{3} - 4x)$h2sql$, 0, $h2sql$Buitenste schil: een getal maal twee haakjes → eerst de haakjes uitwerken en met 5 vermenigvuldigen, dan de somregel.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = 5(3x - 1)(x^{3} - 4x)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 5(3x^4 - 12x^2 - x^3 + 4x)$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = 5(3x - 1)(x^{3} - 4x)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 15x^4 - 5x^3 - 60x^2 + 20x$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = 5(3x - 1)(x^{3} - 4x)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 60x^3 - 15x^2 - 120x + 20$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = 2(x^{2} + 1)(x^{3} - x)$h2sql$, 0, $h2sql$Buitenste schil: een getal maal twee haakjes → eerst uitwerken; hier vallen termen tegen elkaar weg, dus dit is sneller dan de productregel.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = 2(x^{2} + 1)(x^{3} - x)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 2(x^5 - x^3 + x^3 - x)$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = 2(x^{2} + 1)(x^{3} - x)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 2x^5 - 2x$.$h2sql$),
  ('h2_haakjes_eerst', 'hogere_graad', $h2sql$f(x) = 2(x^{2} + 1)(x^{3} - x)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 10x^4 - 2$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (x^{2} - 4)(x^{3} + 2x + 3)$h2sql$, 0, $h2sql$Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (x^{2} - 4)(x^{3} + 2x + 3)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^2 - 4$ en $h(x) = x^3 + 2x + 3$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (x^{2} - 4)(x^{3} + 2x + 3)$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 2x$ en $h'(x) = 3x^2 + 2$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (x^{2} - 4)(x^{3} + 2x + 3)$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 2x(x^3 + 2x + 3) + (x^2 - 4)(3x^2 + 2)$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (2 - 3x^{2})(2 + 7x)$h2sql$, 0, $h2sql$Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (2 - 3x^{2})(2 + 7x)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 2 - 3x^2$ en $h(x) = 2 + 7x$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (2 - 3x^{2})(2 + 7x)$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = -6x$ en $h'(x) = 7$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (2 - 3x^{2})(2 + 7x)$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = -6x(2 + 7x) + (2 - 3x^2) \cdot 7$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (3x - 1)(x^{2} + 5x)$h2sql$, 0, $h2sql$Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (3x - 1)(x^{2} + 5x)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 3x - 1$ en $h(x) = x^2 + 5x$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (3x - 1)(x^{2} + 5x)$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 3$ en $h'(x) = 2x + 5$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (3x - 1)(x^{2} + 5x)$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 3(x^2 + 5x) + (3x - 1)(2x + 5)$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (x^{2} - 3x)(x^{3} + x^{2} + x)$h2sql$, 0, $h2sql$Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (x^{2} - 3x)(x^{3} + x^{2} + x)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^2 - 3x$ en $h(x) = x^3 + x^2 + x$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (x^{2} - 3x)(x^{3} + x^{2} + x)$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 2x - 3$ en $h'(x) = 3x^2 + 2x + 1$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (x^{2} - 3x)(x^{3} + x^{2} + x)$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = (2x - 3)(x^3 + x^2 + x) + (x^2 - 3x)(3x^2 + 2x + 1)$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (5x^{5} - 3)(3x - 2)$h2sql$, 0, $h2sql$Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (5x^{5} - 3)(3x - 2)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 5x^5 - 3$ en $h(x) = 3x - 2$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (5x^{5} - 3)(3x - 2)$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 25x^4$ en $h'(x) = 3$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$f(x) = (5x^{5} - 3)(3x - 2)$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 25x^4(3x - 2) + (5x^5 - 3) \cdot 3$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$l(t) = (5t^{3} - t)(3t^{5} + t)$h2sql$, 0, $h2sql$Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel. De variabele heet $t$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$l(t) = (5t^{3} - t)(3t^{5} + t)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(t) = 5t^3 - t$ en $h(t) = 3t^5 + t$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$l(t) = (5t^{3} - t)(3t^{5} + t)$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(t) = 15t^2 - 1$ en $h'(t) = 15t^4 + 1$.$h2sql$),
  ('h2_productregel', 'twee_polynomen', $h2sql$l(t) = (5t^{3} - t)(3t^{5} + t)$h2sql$, 3, $h2sql$Vul de formule in: $l'(t) = g'(t) \cdot h(t) + g(t) \cdot h'(t) = (15t^2 - 1)(3t^5 + t) + (5t^3 - t)(15t^4 + 1)$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (x^{2} + 1)^{2}$h2sql$, 0, $h2sql$Buitenste schil: een kwadraat van een polynoom → schrijf als $g \cdot g$ en gebruik de productregel.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (x^{2} + 1)^{2}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^2 + 1$ en $h(x) = x^2 + 1$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (x^{2} + 1)^{2}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 2x$ en $h'(x) = 2x$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (x^{2} + 1)^{2}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 2x(x^2 + 1) + (x^2 + 1) \cdot 2x$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (x^{3} + 2)^{2}$h2sql$, 0, $h2sql$Buitenste schil: een kwadraat van een polynoom → schrijf als $g \cdot g$ en gebruik de productregel.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (x^{3} + 2)^{2}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^3 + 2$ en $h(x) = x^3 + 2$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (x^{3} + 2)^{2}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 3x^2$ en $h'(x) = 3x^2$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (x^{3} + 2)^{2}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 3x^2(x^3 + 2) + (x^3 + 2) \cdot 3x^2$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (3x^{3} - 1)^{2}$h2sql$, 0, $h2sql$Buitenste schil: een kwadraat van een polynoom → schrijf als $g \cdot g$ en gebruik de productregel.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (3x^{3} - 1)^{2}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 3x^3 - 1$ en $h(x) = 3x^3 - 1$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (3x^{3} - 1)^{2}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 9x^2$ en $h'(x) = 9x^2$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (3x^{3} - 1)^{2}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 9x^2(3x^3 - 1) + (3x^3 - 1) \cdot 9x^2$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (3x^{2} - 4)^{2}$h2sql$, 0, $h2sql$Buitenste schil: een kwadraat van een polynoom → schrijf als $g \cdot g$ en gebruik de productregel.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (3x^{2} - 4)^{2}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 3x^2 - 4$ en $h(x) = 3x^2 - 4$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (3x^{2} - 4)^{2}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 6x$ en $h'(x) = 6x$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (3x^{2} - 4)^{2}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 6x(3x^2 - 4) + (3x^2 - 4) \cdot 6x$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$m(q) = 1 - (3q^{2} - 2)^{2}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen $1$ en een kwadraat → somregel; het kwadraat zelf wordt straks $g \cdot g$ met de productregel.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$m(q) = 1 - (3q^{2} - 2)^{2}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(q) = 1$ en $h(q) = (3q^2 - 2)^2$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$m(q) = 1 - (3q^{2} - 2)^{2}$h2sql$, 2, $h2sql$$g'(q) = 0$. Voor $h$: een product → productregel. Noem dit deel even $f$ met $g(q) = 3q^2 - 2$ en $h(q) = 3q^2 - 2$; $g'(q) = 6q$, $h'(q) = 6q$, dus $f'(q) = 6q(3q^2 - 2) + (3q^2 - 2) \cdot 6q$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$m(q) = 1 - (3q^{2} - 2)^{2}$h2sql$, 3, $h2sql$Voeg samen: $m'(q) = g'(q) - h'(q) = 0 - \bigl(6q(3q^2 - 2) + (3q^2 - 2) \cdot 6q\bigr) = -6q(3q^2 - 2) - (3q^2 - 2) \cdot 6q$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (x^{4} - x)^{2}$h2sql$, 0, $h2sql$Buitenste schil: een kwadraat van een polynoom → schrijf als $g \cdot g$ en gebruik de productregel.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (x^{4} - x)^{2}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^4 - x$ en $h(x) = x^4 - x$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (x^{4} - x)^{2}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 4x^3 - 1$ en $h'(x) = 4x^3 - 1$.$h2sql$),
  ('h2_productregel', 'kwadraat_als_product', $h2sql$f(x) = (x^{4} - x)^{2}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = (4x^3 - 1)(x^4 - x) + (x^4 - x)(4x^3 - 1)$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = x^{2} + (x + 1)(x^{2} - 3)$h2sql$, 0, $h2sql$Buitenste schil: een $+$ tussen twee delen → somregel.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = x^{2} + (x + 1)(x^{2} - 3)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^2$ en $h(x) = (x + 1)(x^2 - 3)$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = x^{2} + (x + 1)(x^{2} - 3)$h2sql$, 2, $h2sql$$g'(x) = 2x$. Voor $h$: een product → productregel. Noem dit deel even $f$ met $g(x) = x + 1$ en $h(x) = x^2 - 3$; $g'(x) = 1$, $h'(x) = 2x$, dus $f'(x) = 1 \cdot (x^2 - 3) + (x + 1) \cdot 2x$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = x^{2} + (x + 1)(x^{2} - 3)$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) + h'(x) = 2x + (x^2 - 3) + (x + 1) \cdot 2x$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = (2x - 1)(x^{3} + 4) + 6x$h2sql$, 0, $h2sql$Buitenste schil: een $+$ tussen twee delen → somregel.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = (2x - 1)(x^{3} + 4) + 6x$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = (2x - 1)(x^3 + 4)$ en $h(x) = 6x$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = (2x - 1)(x^{3} + 4) + 6x$h2sql$, 2, $h2sql$$h'(x) = 6$. Voor $g$: een product → productregel. Noem dit deel even $f$ met $g(x) = 2x - 1$ en $h(x) = x^3 + 4$; $g'(x) = 2$, $h'(x) = 3x^2$, dus $f'(x) = 2(x^3 + 4) + (2x - 1) \cdot 3x^2$. Dat is de afgeleide van $g$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = (2x - 1)(x^{3} + 4) + 6x$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) + h'(x) = 2(x^3 + 4) + (2x - 1) \cdot 3x^2 + 6$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = 2x + 3(x^{2} - 1)(x + 4)$h2sql$, 0, $h2sql$Buitenste schil: een $+$ tussen twee delen → somregel. Handig: haal de 3 naar binnen, dan zie je twee losse factoren.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = 2x + 3(x^{2} - 1)(x + 4)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 2x$ en $h(x) = 3(x^2 - 1)(x + 4) = (3x^2 - 3)(x + 4)$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = 2x + 3(x^{2} - 1)(x + 4)$h2sql$, 2, $h2sql$$g'(x) = 2$. Voor $h$: een product → productregel. Noem dit deel even $f$ met $g(x) = 3x^2 - 3$ en $h(x) = x + 4$; $g'(x) = 6x$, $h'(x) = 1$, dus $f'(x) = 6x(x + 4) + (3x^2 - 3) \cdot 1$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = 2x + 3(x^{2} - 1)(x + 4)$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) + h'(x) = 2 + 6x(x + 4) + (3x^2 - 3)$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = x^{2} - (x^{3} - 2)(x + 5)$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee delen → somregel. De min gaat straks over de hele afgeleide van $v$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = x^{2} - (x^{3} - 2)(x + 5)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^2$ en $h(x) = (x^3 - 2)(x + 5)$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = x^{2} - (x^{3} - 2)(x + 5)$h2sql$, 2, $h2sql$$g'(x) = 2x$. Voor $h$: een product → productregel. Noem dit deel even $f$ met $g(x) = x^3 - 2$ en $h(x) = x + 5$; $g'(x) = 3x^2$, $h'(x) = 1$, dus $f'(x) = 3x^2(x + 5) + (x^3 - 2) \cdot 1$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = x^{2} - (x^{3} - 2)(x + 5)$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) - h'(x) = 2x - \bigl(3x^2(x + 5) + (x^3 - 2)\bigr) = 2x - 3x^2(x + 5) - (x^3 - 2)$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = 5 - 3(x^{4} - x)(x + 1)$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen $5$ en een product → somregel. Handig: haal de 3 naar binnen, dan zie je twee losse factoren.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = 5 - 3(x^{4} - x)(x + 1)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 5$ en $h(x) = 3(x^4 - x)(x + 1) = (3x^4 - 3x)(x + 1)$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = 5 - 3(x^{4} - x)(x + 1)$h2sql$, 2, $h2sql$$g'(x) = 0$. Voor $h$: een product → productregel. Noem dit deel even $f$ met $g(x) = 3x^4 - 3x$ en $h(x) = x + 1$; $g'(x) = 12x^3 - 3$, $h'(x) = 1$, dus $f'(x) = (12x^3 - 3)(x + 1) + (3x^4 - 3x) \cdot 1$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = 5 - 3(x^{4} - x)(x + 1)$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) - h'(x) = 0 - \bigl((12x^3 - 3)(x + 1) + (3x^4 - 3x)\bigr) = -(12x^3 - 3)(x + 1) - (3x^4 - 3x)$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = 7 - 2(x^{3} + 1)(x^{2} - x)$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen $7$ en een product → somregel. Handig: haal de 2 naar binnen, dan zie je twee losse factoren.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = 7 - 2(x^{3} + 1)(x^{2} - x)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 7$ en $h(x) = 2(x^3 + 1)(x^2 - x) = (2x^3 + 2)(x^2 - x)$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = 7 - 2(x^{3} + 1)(x^{2} - x)$h2sql$, 2, $h2sql$$g'(x) = 0$. Voor $h$: een product → productregel. Noem dit deel even $f$ met $g(x) = 2x^3 + 2$ en $h(x) = x^2 - x$; $g'(x) = 6x^2$, $h'(x) = 2x - 1$, dus $f'(x) = 6x^2(x^2 - x) + (2x^3 + 2)(2x - 1)$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_productregel', 'genest_in_som', $h2sql$f(x) = 7 - 2(x^{3} + 1)(x^{2} - x)$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) - h'(x) = 0 - \bigl(6x^2(x^2 - x) + (2x^3 + 2)(2x - 1)\bigr) = -6x^2(x^2 - x) - (2x^3 + 2)(2x - 1)$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = x(x + 3)(x - 1)$h2sql$, 0, $h2sql$Buitenste schil: drie factoren achter elkaar → productregel voor drie factoren: $(pqr)' = p'qr + pq'r + pqr'$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = x(x + 3)(x - 1)$h2sql$, 1, $h2sql$Kies de drie factoren: $p(x) = x$, $q(x) = x + 3$ en $r(x) = x - 1$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = x(x + 3)(x - 1)$h2sql$, 2, $h2sql$Bereken de drie afgeleiden: $p'(x) = 1$, $q'(x) = 1$ en $r'(x) = 1$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = x(x + 3)(x - 1)$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = 1 \cdot (x + 3)(x - 1) + x \cdot 1 \cdot (x - 1) + x(x + 3) \cdot 1 = (x + 3)(x - 1) + x(x - 1) + x(x + 3)$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = (x - 2)(x + 2)(x^{2} + 1)$h2sql$, 0, $h2sql$Buitenste schil: drie factoren achter elkaar → productregel voor drie factoren: $(pqr)' = p'qr + pq'r + pqr'$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = (x - 2)(x + 2)(x^{2} + 1)$h2sql$, 1, $h2sql$Kies de drie factoren: $p(x) = x - 2$, $q(x) = x + 2$ en $r(x) = x^2 + 1$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = (x - 2)(x + 2)(x^{2} + 1)$h2sql$, 2, $h2sql$Bereken de drie afgeleiden: $p'(x) = 1$, $q'(x) = 1$ en $r'(x) = 2x$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = (x - 2)(x + 2)(x^{2} + 1)$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = (x + 2)(x^2 + 1) + (x - 2)(x^2 + 1) + (x - 2)(x + 2) \cdot 2x$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = 2x(x^{2} - 1)(x + 4)$h2sql$, 0, $h2sql$Buitenste schil: drie factoren achter elkaar → productregel voor drie factoren: $(pqr)' = p'qr + pq'r + pqr'$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = 2x(x^{2} - 1)(x + 4)$h2sql$, 1, $h2sql$Kies de drie factoren: $p(x) = 2x$, $q(x) = x^2 - 1$ en $r(x) = x + 4$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = 2x(x^{2} - 1)(x + 4)$h2sql$, 2, $h2sql$Bereken de drie afgeleiden: $p'(x) = 2$, $q'(x) = 2x$ en $r'(x) = 1$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = 2x(x^{2} - 1)(x + 4)$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = 2(x^2 - 1)(x + 4) + 2x \cdot 2x(x + 4) + 2x(x^2 - 1)$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = x(x - 1)(x + 2)$h2sql$, 0, $h2sql$Buitenste schil: drie factoren achter elkaar → productregel voor drie factoren: $(pqr)' = p'qr + pq'r + pqr'$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = x(x - 1)(x + 2)$h2sql$, 1, $h2sql$Kies de drie factoren: $p(x) = x$, $q(x) = x - 1$ en $r(x) = x + 2$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = x(x - 1)(x + 2)$h2sql$, 2, $h2sql$Bereken de drie afgeleiden: $p'(x) = 1$, $q'(x) = 1$ en $r'(x) = 1$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = x(x - 1)(x + 2)$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = (x - 1)(x + 2) + x(x + 2) + x(x - 1)$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$F(t) = t(t - 1)(t + 2)$h2sql$, 0, $h2sql$Buitenste schil: drie factoren achter elkaar → productregel voor drie factoren: $(pqr)' = p'qr + pq'r + pqr'$. De variabele heet $t$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$F(t) = t(t - 1)(t + 2)$h2sql$, 1, $h2sql$Kies de drie factoren: $p(t) = t$, $q(t) = t - 1$ en $r(t) = t + 2$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$F(t) = t(t - 1)(t + 2)$h2sql$, 2, $h2sql$Bereken de drie afgeleiden: $p'(t) = 1$, $q'(t) = 1$ en $r'(t) = 1$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$F(t) = t(t - 1)(t + 2)$h2sql$, 3, $h2sql$Vul de formule in: $F'(t) = (t - 1)(t + 2) + t(t + 2) + t(t - 1)$. Laat de haakjes staan.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = (x + 1)(x - 2)(2x + 3)$h2sql$, 0, $h2sql$Buitenste schil: drie factoren achter elkaar → productregel voor drie factoren: $(pqr)' = p'qr + pq'r + pqr'$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = (x + 1)(x - 2)(2x + 3)$h2sql$, 1, $h2sql$Kies de drie factoren: $p(x) = x + 1$, $q(x) = x - 2$ en $r(x) = 2x + 3$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = (x + 1)(x - 2)(2x + 3)$h2sql$, 2, $h2sql$Bereken de drie afgeleiden: $p'(x) = 1$, $q'(x) = 1$ en $r'(x) = 2$.$h2sql$),
  ('h2_productregel', 'drie_factoren', $h2sql$f(x) = (x + 1)(x - 2)(2x + 3)$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = (x - 2)(2x + 3) + (x + 1)(2x + 3) + (x + 1)(x - 2) \cdot 2$. Laat de haakjes staan.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{x - 2}{x + 5}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{x - 2}{x + 5}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = x - 2$ en $h(x) = x + 5$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{x - 2}{x + 5}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 1$ en $h'(x) = 1$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{x - 2}{x + 5}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{1 \cdot (x + 5) - (x - 2) \cdot 1}{(x + 5)^2}$. Teller uitwerken: $f'(x) = \dfrac{7}{(x + 5)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{2}{2x - 1}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel. De teller is een getal, dus $g' = 0$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{2}{2x - 1}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = 2$ en $h(x) = 2x - 1$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{2}{2x - 1}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 0$ en $h'(x) = 2$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{2}{2x - 1}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{0 \cdot (2x - 1) - 2 \cdot 2}{(2x - 1)^2}$. Teller uitwerken: $f'(x) = \dfrac{-4}{(2x - 1)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{2x + 1}{3x - 1}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{2x + 1}{3x - 1}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = 2x + 1$ en $h(x) = 3x - 1$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{2x + 1}{3x - 1}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 2$ en $h'(x) = 3$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{2x + 1}{3x - 1}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{2(3x - 1) - (2x + 1) \cdot 3}{(3x - 1)^2}$. Teller uitwerken: $f'(x) = \dfrac{-5}{(3x - 1)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{2x - 3}{3x - 1}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{2x - 3}{3x - 1}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = 2x - 3$ en $h(x) = 3x - 1$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{2x - 3}{3x - 1}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 2$ en $h'(x) = 3$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{2x - 3}{3x - 1}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{2(3x - 1) - (2x - 3) \cdot 3}{(3x - 1)^2}$. Teller uitwerken: $f'(x) = \dfrac{7}{(3x - 1)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{3 - 4x}{2x + 5}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{3 - 4x}{2x + 5}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = 3 - 4x$ en $h(x) = 2x + 5$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{3 - 4x}{2x + 5}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = -4$ en $h'(x) = 2$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(x) = \dfrac{3 - 4x}{2x + 5}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{-4(2x + 5) - (3 - 4x) \cdot 2}{(2x + 5)^2}$. Teller uitwerken: $f'(x) = \dfrac{-26}{(2x + 5)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(t) = \dfrac{5t + 2}{1 - 3t}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $t$ in de noemer → quotiëntregel. Let op: $h' = -3$ is negatief.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(t) = \dfrac{5t + 2}{1 - 3t}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(t) = 5t + 2$ en $h(t) = 1 - 3t$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(t) = \dfrac{5t + 2}{1 - 3t}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(t) = 5$ en $h'(t) = -3$.$h2sql$),
  ('h2_quotientregel', 'lineair_door_lineair', $h2sql$f(t) = \dfrac{5t + 2}{1 - 3t}$h2sql$, 3, $h2sql$Vul de formule in: $f'(t) = \dfrac{g'(t) \cdot h(t) - g(t) \cdot h'(t)}{(h(t))^2} = \dfrac{5(1 - 3t) - (5t + 2) \cdot (-3)}{(1 - 3t)^2}$. Teller uitwerken: $f'(t) = \dfrac{11}{(1 - 3t)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x^{2}}{x + 1}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x^{2}}{x + 1}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = x^2$ en $h(x) = x + 1$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x^{2}}{x + 1}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 2x$ en $h'(x) = 1$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x^{2}}{x + 1}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{2x(x + 1) - x^2 \cdot 1}{(x + 1)^2}$. Teller uitwerken: $f'(x) = \dfrac{x^2 + 2x}{(x + 1)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{3}{2x^{2} + 1}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel. De teller is een getal, dus $g' = 0$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{3}{2x^{2} + 1}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = 3$ en $h(x) = 2x^2 + 1$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{3}{2x^{2} + 1}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 0$ en $h'(x) = 4x$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{3}{2x^{2} + 1}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{0 \cdot (2x^2 + 1) - 3 \cdot 4x}{(2x^2 + 1)^2}$. Teller uitwerken: $f'(x) = \dfrac{-12x}{(2x^2 + 1)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x^{3}}{2x^{2} + 1}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x^{3}}{2x^{2} + 1}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = x^3$ en $h(x) = 2x^2 + 1$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x^{3}}{2x^{2} + 1}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 3x^2$ en $h'(x) = 4x$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x^{3}}{2x^{2} + 1}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{3x^2(2x^2 + 1) - x^3 \cdot 4x}{(2x^2 + 1)^2}$. Teller uitwerken: $f'(x) = \dfrac{2x^4 + 3x^2}{(2x^2 + 1)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x^{4}}{x^{2} + 1}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x^{4}}{x^{2} + 1}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = x^4$ en $h(x) = x^2 + 1$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x^{4}}{x^{2} + 1}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 4x^3$ en $h'(x) = 2x$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x^{4}}{x^{2} + 1}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{4x^3(x^2 + 1) - x^4 \cdot 2x}{(x^2 + 1)^2}$. Teller uitwerken: $f'(x) = \dfrac{2x^5 + 4x^3}{(x^2 + 1)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x - 2}{3 - x^{2}}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel. Let op: $h' = -2x$ is negatief, min keer min wordt plus.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x - 2}{3 - x^{2}}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = x - 2$ en $h(x) = 3 - x^2$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x - 2}{3 - x^{2}}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 1$ en $h'(x) = -2x$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$f(x) = \dfrac{x - 2}{3 - x^{2}}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{1 \cdot (3 - x^2) - (x - 2) \cdot (-2x)}{(3 - x^2)^2}$. Teller uitwerken: $f'(x) = \dfrac{x^2 - 4x + 3}{(3 - x^2)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$g(t) = \dfrac{t^{2} + 1}{t^{3} - t}$h2sql$, 0, $h2sql$Buitenste schil: een breuk met $t$ in de noemer → quotiëntregel.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$g(t) = \dfrac{t^{2} + 1}{t^{3} - t}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(t) = t^2 + 1$ en $h(t) = t^3 - t$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$g(t) = \dfrac{t^{2} + 1}{t^{3} - t}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(t) = 2t$ en $h'(t) = 3t^2 - 1$.$h2sql$),
  ('h2_quotientregel', 'polynoom_breuk', $h2sql$g(t) = \dfrac{t^{2} + 1}{t^{3} - t}$h2sql$, 3, $h2sql$Vul de formule in: $g'(t) = \dfrac{g'(t) \cdot h(t) - g(t) \cdot h'(t)}{(h(t))^2} = \dfrac{2t(t^3 - t) - (t^2 + 1)(3t^2 - 1)}{(t^3 - t)^2}$. Teller uitwerken: $g'(t) = \dfrac{-t^4 - 4t^2 + 1}{(t^3 - t)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = x^{2} - \dfrac{3}{x + 1}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee delen → somregel.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = x^{2} - \dfrac{3}{x + 1}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^2$ en $h(x) = \dfrac{3}{x + 1}$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = x^{2} - \dfrac{3}{x + 1}$h2sql$, 2, $h2sql$$g'(x) = 2x$. Voor $h$: een breuk → quotiëntregel. Noem dit deel even $f$ met $g(x) = 3$ (teller) en $h(x) = x + 1$ (noemer); $g'(x) = 0$, $h'(x) = 1$, dus $f'(x) = \dfrac{0 \cdot (x + 1) - 3 \cdot 1}{(x + 1)^2} = \dfrac{-3}{(x + 1)^2}$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = x^{2} - \dfrac{3}{x + 1}$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) - h'(x) = 2x - \dfrac{-3}{(x + 1)^2} = 2x + \dfrac{3}{(x + 1)^2}$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = x^{2} - \dfrac{2}{x + 4}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee delen → somregel.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = x^{2} - \dfrac{2}{x + 4}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^2$ en $h(x) = \dfrac{2}{x + 4}$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = x^{2} - \dfrac{2}{x + 4}$h2sql$, 2, $h2sql$$g'(x) = 2x$. Voor $h$: een breuk → quotiëntregel. Noem dit deel even $f$ met $g(x) = 2$ (teller) en $h(x) = x + 4$ (noemer); $g'(x) = 0$, $h'(x) = 1$, dus $f'(x) = \dfrac{0 \cdot (x + 4) - 2 \cdot 1}{(x + 4)^2} = \dfrac{-2}{(x + 4)^2}$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = x^{2} - \dfrac{2}{x + 4}$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) - h'(x) = 2x - \dfrac{-2}{(x + 4)^2} = 2x + \dfrac{2}{(x + 4)^2}$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = 3x + \dfrac{1}{x - 1}$h2sql$, 0, $h2sql$Buitenste schil: een $+$ tussen twee delen → somregel.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = 3x + \dfrac{1}{x - 1}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 3x$ en $h(x) = \dfrac{1}{x - 1}$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = 3x + \dfrac{1}{x - 1}$h2sql$, 2, $h2sql$$g'(x) = 3$. Voor $h$: een breuk → quotiëntregel. Noem dit deel even $f$ met $g(x) = 1$ (teller) en $h(x) = x - 1$ (noemer); $g'(x) = 0$, $h'(x) = 1$, dus $f'(x) = \dfrac{0 \cdot (x - 1) - 1 \cdot 1}{(x - 1)^2} = \dfrac{-1}{(x - 1)^2}$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = 3x + \dfrac{1}{x - 1}$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) + h'(x) = 3 + \dfrac{-1}{(x - 1)^2} = 3 - \dfrac{1}{(x - 1)^2}$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = \dfrac{3 - x^{2}}{x - 2} + x^{3}$h2sql$, 0, $h2sql$Buitenste schil: een $+$ tussen twee delen → somregel.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = \dfrac{3 - x^{2}}{x - 2} + x^{3}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = \dfrac{3 - x^2}{x - 2}$ en $h(x) = x^3$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = \dfrac{3 - x^{2}}{x - 2} + x^{3}$h2sql$, 2, $h2sql$$h'(x) = 3x^2$. Voor $g$: een breuk → quotiëntregel. Noem dit deel even $f$ met $g(x) = 3 - x^2$ (teller) en $h(x) = x - 2$ (noemer); $g'(x) = -2x$, $h'(x) = 1$, dus $f'(x) = \dfrac{-2x(x - 2) - (3 - x^2) \cdot 1}{(x - 2)^2} = \dfrac{-x^2 + 4x - 3}{(x - 2)^2}$. Dat is de afgeleide van $g$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = \dfrac{3 - x^{2}}{x - 2} + x^{3}$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) + h'(x) = \dfrac{-x^2 + 4x - 3}{(x - 2)^2} + 3x^2$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = x^{3} + \dfrac{2x + 1}{x - 3}$h2sql$, 0, $h2sql$Buitenste schil: een $+$ tussen twee delen → somregel.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = x^{3} + \dfrac{2x + 1}{x - 3}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^3$ en $h(x) = \dfrac{2x + 1}{x - 3}$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = x^{3} + \dfrac{2x + 1}{x - 3}$h2sql$, 2, $h2sql$$g'(x) = 3x^2$. Voor $h$: een breuk → quotiëntregel. Noem dit deel even $f$ met $g(x) = 2x + 1$ (teller) en $h(x) = x - 3$ (noemer); $g'(x) = 2$, $h'(x) = 1$, dus $f'(x) = \dfrac{2(x - 3) - (2x + 1) \cdot 1}{(x - 3)^2} = \dfrac{-7}{(x - 3)^2}$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$f(x) = x^{3} + \dfrac{2x + 1}{x - 3}$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) + h'(x) = 3x^2 + \dfrac{-7}{(x - 3)^2} = 3x^2 - \dfrac{7}{(x - 3)^2}$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$h(q) = q^{2} - \dfrac{q + 1}{2q - 1}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee delen → somregel. De variabele heet $q$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$h(q) = q^{2} - \dfrac{q + 1}{2q - 1}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(q) = q^2$ en $h(q) = \dfrac{q + 1}{2q - 1}$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$h(q) = q^{2} - \dfrac{q + 1}{2q - 1}$h2sql$, 2, $h2sql$$g'(q) = 2q$. Voor $h$: een breuk → quotiëntregel. Noem dit deel even $f$ met $g(q) = q + 1$ (teller) en $h(q) = 2q - 1$ (noemer); $g'(q) = 1$, $h'(q) = 2$, dus $f'(q) = \dfrac{1 \cdot (2q - 1) - (q + 1) \cdot 2}{(2q - 1)^2} = \dfrac{-3}{(2q - 1)^2}$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_quotientregel', 'som_met_breuk', $h2sql$h(q) = q^{2} - \dfrac{q + 1}{2q - 1}$h2sql$, 3, $h2sql$Voeg samen: $h'(q) = g'(q) - h'(q) = 2q - \dfrac{-3}{(2q - 1)^2} = 2q + \dfrac{3}{(2q - 1)^2}$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (x + 1)(x - 1)$h2sql$, 0, $h2sql$Buitenste schil: twee lineaire factoren → uitwerken is het snelst (de productregel mag ook en geeft hetzelfde).$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (x + 1)(x - 1)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = x^2 - x + x - 1$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (x + 1)(x - 1)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = x^2 - 1$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (x + 1)(x - 1)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 2x$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{x^{2} - 4}{x + 1}$h2sql$, 0, $h2sql$Buitenste schil: een breukstreep met $x$ in de noemer → quotiëntregel.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{x^{2} - 4}{x + 1}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = x^2 - 4$ en $h(x) = x + 1$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{x^{2} - 4}{x + 1}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 2x$ en $h'(x) = 1$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{x^{2} - 4}{x + 1}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{2x(x + 1) - (x^2 - 4) \cdot 1}{(x + 1)^2}$. Teller uitwerken: $f'(x) = \dfrac{x^2 + 2x + 4}{(x + 1)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 3x^{4} - 2(x + 1)^{2}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee delen → somregel; het kwadraat van een lineaire vorm werk je eerst uit.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 3x^{4} - 2(x + 1)^{2}$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 3x^4 - 2(x^2 + 2x + 1)$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 3x^{4} - 2(x + 1)^{2}$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 3x^4 - 2x^2 - 4x - 2$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 3x^{4} - 2(x + 1)^{2}$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 12x^3 - 4x - 4$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (x^{2} + 1)(x^{3} - x)$h2sql$, 0, $h2sql$Buitenste schil: twee polynomen met een $\cdot$ ertussen → productregel (uitwerken mag ook, dan krijg je $5x^4 - 1$).$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (x^{2} + 1)(x^{3} - x)$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^2 + 1$ en $h(x) = x^3 - x$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (x^{2} + 1)(x^{3} - x)$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 2x$ en $h'(x) = 3x^2 - 1$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (x^{2} + 1)(x^{3} - x)$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 2x(x^3 - x) + (x^2 + 1)(3x^2 - 1)$. Laat de haakjes staan.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = x^{2} + \dfrac{1}{x - 2}$h2sql$, 0, $h2sql$Buitenste schil: een $+$ tussen twee delen → somregel; de breuk erin vraagt straks de quotiëntregel.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = x^{2} + \dfrac{1}{x - 2}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^2$ en $h(x) = \dfrac{1}{x - 2}$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = x^{2} + \dfrac{1}{x - 2}$h2sql$, 2, $h2sql$$g'(x) = 2x$. Voor $h$: een breuk → quotiëntregel. Noem dit deel even $f$ met $g(x) = 1$ (teller) en $h(x) = x - 2$ (noemer); $g'(x) = 0$, $h'(x) = 1$, dus $f'(x) = \dfrac{0 \cdot (x - 2) - 1 \cdot 1}{(x - 2)^2} = \dfrac{-1}{(x - 2)^2}$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = x^{2} + \dfrac{1}{x - 2}$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) + h'(x) = 2x + \dfrac{-1}{(x - 2)^2} = 2x - \dfrac{1}{(x - 2)^2}$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (x^{3} - 1)^{2}$h2sql$, 0, $h2sql$Buitenste schil: een kwadraat van een polynoom van graad 3 → schrijf als $g \cdot g$ en gebruik de productregel.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (x^{3} - 1)^{2}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = x^3 - 1$ en $h(x) = x^3 - 1$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (x^{3} - 1)^{2}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 3x^2$ en $h'(x) = 3x^2$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (x^{3} - 1)^{2}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 3x^2(x^3 - 1) + (x^3 - 1) \cdot 3x^2$. Laat de haakjes staan.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 4x^{3} - \tfrac{1}{2}x^{2} + 6$h2sql$, 0, $h2sql$Buitenste schil: losse termen, geen haakjes, geen breuk met $x$ → gewoon termsgewijs met de machtsregel.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 4x^{3} - \tfrac{1}{2}x^{2} + 6$h2sql$, 1, $h2sql$Termen: $4x^3$, $-\tfrac{1}{2}x^2$, $6$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 4x^{3} - \tfrac{1}{2}x^{2} + 6$h2sql$, 2, $h2sql$Machtsregel per term, $[ax^n]' = n \cdot ax^{n-1}$: $[4x^3]' = 12x^2$, $[-\tfrac{1}{2}x^2]' = -2 \cdot \tfrac{1}{2}x = -x$, $[6]' = 0$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 4x^{3} - \tfrac{1}{2}x^{2} + 6$h2sql$, 3, $h2sql$Optellen: $f'(x) = 12x^2 - x$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{5}{x^{2} + 3}$h2sql$, 0, $h2sql$Buitenste schil: een breukstreep met $x$ in de noemer → quotiëntregel. De teller is een getal, dus $g' = 0$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{5}{x^{2} + 3}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(x) = 5$ en $h(x) = x^2 + 3$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{5}{x^{2} + 3}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(x) = 0$ en $h'(x) = 2x$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = \dfrac{5}{x^{2} + 3}$h2sql$, 3, $h2sql$Vul de formule in: $f'(x) = \dfrac{g'(x) \cdot h(x) - g(x) \cdot h'(x)}{(h(x))^2} = \dfrac{0 \cdot (x^2 + 3) - 5 \cdot 2x}{(x^2 + 3)^2}$. Teller uitwerken: $f'(x) = \dfrac{-10x}{(x^2 + 3)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (2x - 3)(x^{2} + x) - x^{3}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen twee delen → somregel; het eerste deel is een product en vraagt de productregel.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (2x - 3)(x^{2} + x) - x^{3}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = (2x - 3)(x^2 + x)$ en $h(x) = x^3$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (2x - 3)(x^{2} + x) - x^{3}$h2sql$, 2, $h2sql$$h'(x) = 3x^2$. Voor $g$: een product → productregel. Noem dit deel even $f$ met $g(x) = 2x - 3$ en $h(x) = x^2 + x$; $g'(x) = 2$, $h'(x) = 2x + 1$, dus $f'(x) = 2(x^2 + x) + (2x - 3)(2x + 1)$. Dat is de afgeleide van $g$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = (2x - 3)(x^{2} + x) - x^{3}$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) - h'(x) = 2(x^2 + x) + (2x - 3)(2x + 1) - 3x^2$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$g(t) = \dfrac{t^{2}}{2t - 1}$h2sql$, 0, $h2sql$Buitenste schil: een breukstreep met $t$ in de noemer → quotiëntregel.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$g(t) = \dfrac{t^{2}}{2t - 1}$h2sql$, 1, $h2sql$$g$ is de teller, $h$ de noemer: $g(t) = t^2$ en $h(t) = 2t - 1$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$g(t) = \dfrac{t^{2}}{2t - 1}$h2sql$, 2, $h2sql$Bereken $g'$ en $h'$: $g'(t) = 2t$ en $h'(t) = 2$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$g(t) = \dfrac{t^{2}}{2t - 1}$h2sql$, 3, $h2sql$Vul de formule in: $g'(t) = \dfrac{g'(t) \cdot h(t) - g(t) \cdot h'(t)}{(h(t))^2} = \dfrac{2t(2t - 1) - t^2 \cdot 2}{(2t - 1)^2}$. Teller uitwerken: $g'(t) = \dfrac{2t^2 - 2t}{(2t - 1)^2}$. De noemer laat je staan.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 2x(x - 1)(x + 3)$h2sql$, 0, $h2sql$Buitenste schil: drie factoren → productregel voor drie factoren kan, maar uitwerken is hier sneller omdat alles polynoom is.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 2x(x - 1)(x + 3)$h2sql$, 1, $h2sql$Werk de haakjes uit: $f(x) = 2x(x^2 + 3x - x - 3)$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 2x(x - 1)(x + 3)$h2sql$, 2, $h2sql$Herleid tot een polynoom: $f(x) = 2x^3 + 4x^2 - 6x$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 2x(x - 1)(x + 3)$h2sql$, 3, $h2sql$Termsgewijs differentiëren: $f'(x) = 6x^2 + 8x - 6$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 5 - \dfrac{3x}{x^{2} + 1}$h2sql$, 0, $h2sql$Buitenste schil: een $-$ tussen $5$ en een breuk → somregel; de breuk vraagt straks de quotiëntregel.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 5 - \dfrac{3x}{x^{2} + 1}$h2sql$, 1, $h2sql$Kies $g$ en $h$: $g(x) = 5$ en $h(x) = \dfrac{3x}{x^2 + 1}$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 5 - \dfrac{3x}{x^{2} + 1}$h2sql$, 2, $h2sql$$g'(x) = 0$. Voor $h$: een breuk → quotiëntregel. Noem dit deel even $f$ met $g(x) = 3x$ (teller) en $h(x) = x^2 + 1$ (noemer); $g'(x) = 3$, $h'(x) = 2x$, dus $f'(x) = \dfrac{3(x^2 + 1) - 3x \cdot 2x}{(x^2 + 1)^2} = \dfrac{3 - 3x^2}{(x^2 + 1)^2}$. Dat is de afgeleide van $h$.$h2sql$),
  ('h2_gemengd', 'welke_regel', $h2sql$f(x) = 5 - \dfrac{3x}{x^{2} + 1}$h2sql$, 3, $h2sql$Voeg samen: $f'(x) = g'(x) - h'(x) = 0 - \dfrac{3 - 3x^2}{(x^2 + 1)^2} = \dfrac{3x^2 - 3}{(x^2 + 1)^2}$.$h2sql$)
) AS s(topic_slug, cluster_slug, body, step_order, description)
JOIN public.topics_new t ON t.slug = s.topic_slug
JOIN public.topic_clusters_new c ON c.slug = s.cluster_slug AND c.topic_id = t.id
JOIN public.questions_new q ON q.latex_body = s.body AND q.cluster_id = c.id;

-- 7. Controle
DO $do$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.questions_new WHERE topic_id IN (SELECT id FROM public.topics_new WHERE chapter_id = (SELECT id FROM public.chapters WHERE slug = 'h2'));
  IF n <> 96 THEN RAISE EXCEPTION 'H2 hoort 96 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.question_steps_new WHERE question_id IN (SELECT id FROM public.questions_new WHERE topic_id IN (SELECT id FROM public.topics_new WHERE chapter_id = (SELECT id FROM public.chapters WHERE slug = 'h2')));
  IF n <> 384 THEN RAISE EXCEPTION 'H2 hoort 384 stappen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'gehele_coefficienten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster gehele_coefficienten hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'breuken_decimalen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster breuken_decimalen hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'andere_letters' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_termsgewijs'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster andere_letters hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_lineaire_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster twee_lineaire_factoren hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'merkwaardig_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster merkwaardig_product hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'constante_factor' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster constante_factor hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'hogere_graad' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_haakjes_eerst'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster hogere_graad hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'twee_polynomen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster twee_polynomen hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'kwadraat_als_product' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster kwadraat_als_product hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'genest_in_som' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster genest_in_som hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'drie_factoren' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_productregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster drie_factoren hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'lineair_door_lineair' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster lineair_door_lineair hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'polynoom_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster polynoom_breuk hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'som_met_breuk' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_quotientregel'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster som_met_breuk hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'welke_regel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'h2_gemengd'));
  IF n <> 12 THEN RAISE EXCEPTION 'Cluster welke_regel hoort 12 vragen te hebben, gevonden %', n; END IF;
END $do$;

COMMIT;
