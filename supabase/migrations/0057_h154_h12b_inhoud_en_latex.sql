-- =============================================================================
-- Correctie van foute inhouden en kapotte LaTeX in H15.4 en H12.2.
--
-- De vragen staan al in 0054 en 0055. Dit bestand wijzigt die rijen.
-- Twee keer draaien zet dezelfde teksten opnieuw; er komt niets bij en er
-- gaat niets weg.
--
-- Herkenning is topic, cluster en volgorde. Het vraag-id verschilt per
-- database. Op de live site horen ze bij:
--   h15c_yas 2         5063f489-e7f4-481d-b6b5-fa041240493d
--   h15c_yas 3         2d526484-129c-4043-a5ae-fdffe864120f
--   h15c_vergelijk 5   d806c1e9-9a30-4367-94d7-25ad1d0665ce
--   h15c_vergelijk 7   4742fcb5-76ab-4f3e-a25b-ae7b1972ad4b
--   h12b_kwadraat 7    acd799ca-76af-41d4-b486-57d9ce9af270
--   h15b_verhouding 6  24b1499d-d3d2-492f-bd4d-533b6248aa29
--   h15c_yas 4         2153250f-fae7-40de-a3f7-9044b3b530d8
--   h15c_yas 8         e7dad51e-99f9-4598-ada5-eb8558a6a3cb
--
-- Bij wentelen om de y-as ligt het vlakdeel tot aan de rechtergrens.
-- De straal is dan niet alleen de x van de grafiek.
-- =============================================================================

BEGIN;

-- 1. Antwoorden die inhoudelijk fout waren
UPDATE public.questions_new AS q
SET
  answer = v.answer,
  latex_answer = v.latex_answer,
  answer_alternatives = v.alternatives
FROM (VALUES
  (
    'h15c_yas', 'h15c_yas', 2,
    $c$(128/5)pi$c$,
    $c$\dfrac{128}{5}\pi$c$,
    ARRAY[$c$128pi/5$c$, $c$(128/5)*pi$c$]::text[]
  ),
  (
    'h15c_vergelijk', 'h15c_vergelijk', 5,
    $c$8^(2/5)$c$,
    $c$p = 8^{2/5}$c$,
    ARRAY[$c$p = 8^(2/5)$c$, $c$p=8^(2/5)$c$, $c$2^(6/5)$c$, $c$p = 2^(6/5)$c$, $c$p=2^(6/5)$c$]::text[]
  ),
  (
    'h15c_vergelijk', 'h15c_vergelijk', 7,
    $c$25/64$c$,
    $c$a = \dfrac{25}{64}$c$,
    ARRAY[$c$a = 25/64$c$, $c$a=25/64$c$]::text[]
  )
) AS v(topic_slug, cluster_slug, order_index, answer, latex_answer, alternatives)
JOIN public.topics_new AS t
  ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new AS cl
  ON cl.slug = v.cluster_slug AND cl.topic_id = t.id
WHERE q.cluster_id = cl.id
  AND q.site = 'integralen'
  AND q.order_index = v.order_index;

-- 2. Stappen: de vier wentelvragen, plus vier losse LaTeX-fouten
UPDATE public.question_steps_new AS s
SET step_description = v.step_description
FROM (VALUES
  -- h15c_yas, volgorde 2: onder y = sqrt(x) tot x = 4
  ('h15c_yas', 'h15c_yas', 2, 0, $c$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Op een hoogte $y$ loopt het vlakdeel van de grafiek tot de lijn $x = 4$. De buitenste straal is $4$, de binnenste is de $x$ van de grafiek.$c$),
  ('h15c_yas', 'h15c_yas', 2, 1, $c$$y = \sqrt{x}$ geeft $x = y^{2}$, en $y$ loopt van $0$ tot $2$. $I(L) = \pi \displaystyle\int_{0}^{2} \left(4^{2} - (y^{2})^{2}\right)\,\mathrm{d}y = \pi \displaystyle\int_{0}^{2} (16 - y^{4})\,\mathrm{d}y$. In de berekening hieronder heet de integratievariabele $x$.$c$),
  ('h15c_yas', 'h15c_yas', 2, 2, $c$Een primitieve van $\pi(16 - x^{4})$ is $F(x) = \pi\left(16x - \dfrac{1}{5}x^{5}\right)$.$c$),
  ('h15c_yas', 'h15c_yas', 2, 3, $c$$F(2) - F(0) = \pi\left(32 - \dfrac{32}{5}\right) = \dfrac{128}{5}\pi$. De inhoud is $\dfrac{128}{5}\pi$.$c$),
  -- h15c_yas, volgorde 3: onder y = x^2 tot x = 2. Antwoord 8π blijft.
  ('h15c_yas', 'h15c_yas', 3, 0, $c$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Op een hoogte $y$ loopt het vlakdeel van de grafiek tot de lijn $x = 2$. De buitenste straal is $2$, de binnenste is de $x$ van de grafiek.$c$),
  ('h15c_yas', 'h15c_yas', 3, 1, $c$$y = x^{2}$ met $x \ge 0$ geeft de binnenste straal $x = \sqrt{y}$. Het kwadraat daarvan is $y$, en $y$ loopt van $0$ tot $4$. $I(L) = \pi \displaystyle\int_{0}^{4} \left(2^{2} - y\right)\,\mathrm{d}y = \pi \displaystyle\int_{0}^{4} (4 - y)\,\mathrm{d}y$. In de berekening hieronder heet de integratievariabele $x$.$c$),
  ('h15c_yas', 'h15c_yas', 3, 2, $c$Een primitieve van $\pi(4 - x)$ is $F(x) = \pi\left(4x - \dfrac{1}{2}x^{2}\right)$.$c$),
  ('h15c_yas', 'h15c_yas', 3, 3, $c$$F(4) - F(0) = \pi(16 - 8) = 8\pi$. De inhoud is $8\pi$.$c$),
  -- h15c_vergelijk, volgorde 5: inhoud 32π/5, zoek p
  ('h15c_vergelijk', 'h15c_vergelijk', 5, 0, $c$Hier spelen alle drie de delen: het verhaal wordt een integraal, die reken je exact uit, en met die uitkomst vind je de gevraagde waarde. Op een hoogte $y$ loopt het vlakdeel van de grafiek tot de lijn $x = p$.$c$),
  ('h15c_vergelijk', 'h15c_vergelijk', 5, 1, $c$$y$ loopt van $0$ tot $\sqrt{p}$. De buitenste straal is $p$ en de binnenste is $y^{2}$. $I(L_p) = \pi \displaystyle\int_{0}^{\sqrt{p}} \left(p^{2} - y^{4}\right)\,\mathrm{d}y$.$c$),
  ('h15c_vergelijk', 'h15c_vergelijk', 5, 2, $c$Een primitieve van $p^{2} - y^{4}$ is $p^{2}y - \dfrac{1}{5}y^{5}$. Invullen geeft $I(L_p) = \dfrac{4}{5}\pi p^{5/2}$. Stel $\dfrac{4}{5}p^{5/2} = \dfrac{32}{5}$, dus $p^{5/2} = 8$.$c$),
  ('h15c_vergelijk', 'h15c_vergelijk', 5, 3, $c$Deel 3: $p = 8^{2/5}$. Dat is hetzelfde als $2^{6/5}$.$c$),
  -- h15c_vergelijk, volgorde 7: L en M gelijk
  ('h15c_vergelijk', 'h15c_vergelijk', 7, 0, $c$Hier spelen alle drie de delen: het verhaal wordt een integraal, die reken je exact uit, en met die uitkomst vind je de gevraagde waarde.$c$),
  ('h15c_vergelijk', 'h15c_vergelijk', 7, 1, $c$$I(L) = \pi \displaystyle\int_{0}^{a} x\,\mathrm{d}x = \pi \cdot \dfrac{1}{2}a^{2}$. Voor $M$ loopt $y$ van $0$ tot $\sqrt{a}$. De buitenste straal is $a$ en de binnenste is $y^{2}$, dus $I(M) = \pi \displaystyle\int_{0}^{\sqrt{a}} \left(a^{2} - y^{4}\right)\,\mathrm{d}y = \dfrac{4}{5}\pi a^{5/2}$.$c$),
  ('h15c_vergelijk', 'h15c_vergelijk', 7, 2, $c$Stel $\dfrac{1}{2}a^{2} = \dfrac{4}{5}a^{5/2}$. Deel door $a^{2}$, dat mag omdat $a > 0$: $\dfrac{1}{2} = \dfrac{4}{5}\sqrt{a}$.$c$),
  ('h15c_vergelijk', 'h15c_vergelijk', 7, 3, $c$Deel 3: $\sqrt{a} = \dfrac{5}{8}$, dus $a = \dfrac{25}{64}$.$c$),
  -- Losse LaTeX in stap 0
  ('h12b_primitiveren', 'h12b_kwadraat', 7, 0, $c$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. De hoek in de verdubbelingsformule is $\tfrac{1}{2}x$. Twee keer die hoek is gewoon $x$.$c$),
  ('h15b_verhouding', 'h15b_verhouding', 6, 0, $c$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Op $[0, 1]$ ligt $\sqrt{x}$ boven $y = x$.$c$),
  ('h15c_yas', 'h15c_yas', 4, 0, $c$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Uit $y = 2x$ volgt de straal $x = \dfrac{1}{2}y$.$c$),
  ('h15c_yas', 'h15c_yas', 8, 0, $c$Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen. Op $[0, 1]$ is $y \ge y^{2}$, dus de buitenste straal is $y$ en de binnenste is $y^{2}$.$c$)
) AS v(topic_slug, cluster_slug, order_index, step_order, step_description)
JOIN public.topics_new AS t
  ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new AS cl
  ON cl.slug = v.cluster_slug AND cl.topic_id = t.id
JOIN public.questions_new AS q
  ON q.cluster_id = cl.id
 AND q.site = 'integralen'
 AND q.order_index = v.order_index
WHERE s.question_id = q.id
  AND s.step_order = v.step_order;

-- 3. Nakijken: de foute antwoorden zijn weg, de nieuwe staan er, LaTeX klopt
DO $do$
DECLARE
  n int;
  stap text;
BEGIN
  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  JOIN public.topics_new t ON t.id = cl.topic_id
  WHERE t.slug = 'h15c_yas' AND t.site = 'integralen'
    AND cl.slug = 'h15c_yas' AND q.order_index = 2
    AND q.answer = '(128/5)pi'
    AND q.latex_answer = $c$\dfrac{128}{5}\pi$c$
    AND NOT ('32pi/5' = ANY (q.answer_alternatives))
    AND NOT ('(32/5)*pi' = ANY (q.answer_alternatives));
  IF n <> 1 THEN
    RAISE EXCEPTION 'Wentelen om de y-as tot x = 4 hoort inhoud 128π/5 te zijn, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  JOIN public.topics_new t ON t.id = cl.topic_id
  WHERE t.slug = 'h15c_yas' AND cl.slug = 'h15c_yas' AND q.order_index = 3
    AND q.answer = '8pi';
  IF n <> 1 THEN
    RAISE EXCEPTION 'De inhoud 8π bij y = x^2 hoort te blijven staan, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'h15c_vergelijk' AND q.order_index = 5
    AND q.answer = '8^(2/5)'
    AND NOT ('4' = ANY (q.answer_alternatives))
    AND NOT ('p = 4' = ANY (q.answer_alternatives))
    AND NOT ('p=4' = ANY (q.answer_alternatives));
  IF n <> 1 THEN
    RAISE EXCEPTION 'De parameter p hoort 8^(2/5) te zijn, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'h15c_vergelijk' AND q.order_index = 7
    AND q.answer = '25/64'
    AND q.latex_answer = $c$a = \dfrac{25}{64}$c$
    AND NOT ('25/4' = ANY (q.answer_alternatives))
    AND NOT ('6,25' = ANY (q.answer_alternatives))
    AND NOT ('6.25' = ANY (q.answer_alternatives));
  IF n <> 1 THEN
    RAISE EXCEPTION 'De parameter a hoort 25/64 te zijn, gevonden %', n;
  END IF;

  SELECT s.step_description INTO stap
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  JOIN public.topics_new t ON t.id = cl.topic_id
  WHERE t.slug = 'h12b_primitiveren' AND cl.slug = 'h12b_kwadraat'
    AND q.order_index = 7 AND s.step_order = 0;
  IF stap IS NULL OR position($c$\tfrac{1}{2}x$c$ in stap) = 0 OR position(E'\tfrac' in stap) > 0 THEN
    RAISE EXCEPTION 'De verdubbelingsformule hoort $\tfrac{1}{2}x$ te bevatten';
  END IF;

  SELECT s.step_description INTO stap
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'h15b_verhouding' AND q.order_index = 6 AND s.step_order = 0;
  IF stap IS NULL OR position($c$\sqrt{x}$c$ in stap) = 0 OR position($c$$sqrt{x}$c$ in stap) > 0 THEN
    RAISE EXCEPTION 'De verhouding hoort $\sqrt{x}$ te bevatten';
  END IF;

  SELECT s.step_description INTO stap
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'h15c_yas' AND q.order_index = 4 AND s.step_order = 0;
  IF stap IS NULL OR position($c$\dfrac{1}{2}y$c$ in stap) = 0 THEN
    RAISE EXCEPTION 'De straal hoort $\dfrac{1}{2}y$ te zijn';
  END IF;

  SELECT s.step_description INTO stap
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'h15c_yas' AND q.order_index = 8 AND s.step_order = 0;
  IF stap IS NULL OR position($c$\ge$c$ in stap) = 0 OR position($c$ ge $c$ in stap) > 0 THEN
    RAISE EXCEPTION 'De vergelijking hoort $y \ge y^{2}$ te zijn';
  END IF;

  SELECT count(*) INTO n
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'h15c_yas' AND q.order_index = 2
    AND position($c$\dfrac{128}{5}$c$ in s.step_description) > 0;
  IF n <> 1 THEN
    RAISE EXCEPTION 'De stappen bij x = 4 horen op 128/5 uit te komen, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'h15c_yas' AND q.order_index = 3
    AND s.step_description LIKE $c$%(4 - y)%$c$;
  IF n <> 1 THEN
    RAISE EXCEPTION 'De stappen bij y = x^2 horen (4 - y) te bevatten, gevonden %', n;
  END IF;
END $do$;

COMMIT;
