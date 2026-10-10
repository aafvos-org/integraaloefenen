-- =============================================================================
-- Migration 0034: K.0 Theorie B — Regels voor het primitiveren
-- =============================================================================
-- Gegenereerd door scripts/k0b-content.ts — niet met de hand bewerken.
--
-- Voorkennisblok B van hoofdstuk K: de standaardprimitieven en de regel dat
-- de primitieven van f(ax + b) gelijk zijn aan 1/a · F(ax + b) + c.
--
-- Eigen oefenvragen, geen boekopgaven. Elke primitieve wordt nagerekend door
-- src/content/primitieven.test.ts (content/hoofdstuk-k/k0b.json).
--
-- Alleen toevoegen: geen DELETE, DROP, ALTER of UPDATE. Twee keer draaien
-- voegt niets dubbel toe.
--
--   • 1 hoofdstuk, 3 topics, 7 clusters
--   • 44 vragen met elk 4 stappen (176 stappen)
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
  ('k0b_standaardprimitieven', $ksql$Standaardprimitieven$ksql$, 1, 'primitiveren'),
  ('k0b_lineaire_kern', $ksql$De regel voor f(ax + b)$ksql$, 2, 'primitiveren'),
  ('k0b_bepaalde_integralen', $ksql$Bepaalde integralen met standaardprimitieven$ksql$, 3, 'integralen')
) AS v(slug, title, order_index, category)
ON CONFLICT (slug) DO NOTHING;

-- 3. Clusters
INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)
SELECT t.id, v.slug, v.title, v.order_index, 'integralen'
FROM (VALUES
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$Machten, breuken en sin/cos$ksql$, 1),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$e-machten en g^x$ksql$, 2),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$ln(x) en log(x)$ksql$, 3),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$e-macht, sinus en cosinus met kern ax + b$ksql$, 1),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$Breuken en wortels met kern ax + b$ksql$, 2),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$g^x en ln met kern ax + b$ksql$, 3),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$Bereken exact$ksql$, 1)
) AS v(topic_slug, slug, title, order_index)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
ON CONFLICT (topic_id, slug) DO NOTHING;

-- 4. Vragen
INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, order_index, is_ai_generated, answer_alternatives)
SELECT 'integralen', t.id, cl.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, v.order_index, false, v.alternatives
FROM (VALUES
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = x^{3} + \cos(x)$ksql$, $ksql$x^4/4 + sin(x) + c$ksql$, $ksql$F(x) = \tfrac{1}{4}x^{4} + \sin(x) + c$ksql$, 1, 1, ARRAY[$ksql$1/4x^4 + sin(x) + c$ksql$, $ksql$0,25x^4 + sin(x) + c$ksql$]::text[]),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = 6x^{2} - \sin(x)$ksql$, $ksql$2x^3 + cos(x) + c$ksql$, $ksql$F(x) = 2x^{3} + \cos(x) + c$ksql$, 1, 2, ARRAY[]::text[]),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{x^{3} + 4}{x^{2}}$ksql$, $ksql$x^2/2 - 4/x + c$ksql$, $ksql$F(x) = \tfrac{1}{2}x^{2} - \dfrac{4}{x} + c$ksql$, 2, 3, ARRAY[$ksql$1/2x^2 - 4/x + c$ksql$, $ksql$0,5x^2 - 4/x + c$ksql$]::text[]),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \sqrt{x}\,(x - 3)$ksql$, $ksql$2/5 x^2 sqrt(x) - 2x sqrt(x) + c$ksql$, $ksql$F(x) = \tfrac{2}{5}x^{2}\sqrt{x} - 2x\sqrt{x} + c$ksql$, 2, 4, ARRAY[$ksql$2/5x^(5/2) - 2x^(3/2) + c$ksql$, $ksql$0,4x^2sqrt(x) - 2xsqrt(x) + c$ksql$]::text[]),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{2x^{2} - 5}{x^{4}}$ksql$, $ksql$-2/x + 5/(3x^3) + c$ksql$, $ksql$F(x) = -\dfrac{2}{x} + \dfrac{5}{3x^{3}} + c$ksql$, 3, 5, ARRAY[$ksql$-2x^-1 + 5/3x^-3 + c$ksql$]::text[]),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{(\sqrt{x} + 1)^{2}}{x}$ksql$, $ksql$x + 4sqrt(x) + ln(x) + c$ksql$, $ksql$F(x) = x + 4\sqrt{x} + \ln(x) + c$ksql$, 3, 6, ARRAY[$ksql$x + 4x^(1/2) + ln(x) + c$ksql$]::text[]),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = 5 \cdot 2^{x}$ksql$, $ksql$5 * 2^x / ln(2) + c$ksql$, $ksql$F(x) = \dfrac{5 \cdot 2^{x}}{\ln(2)} + c$ksql$, 1, 1, ARRAY[$ksql$5*2^x/ln2 + c$ksql$]::text[]),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = e^{x} + 3x^{2}$ksql$, $ksql$e^x + x^3 + c$ksql$, $ksql$F(x) = e^{x} + x^{3} + c$ksql$, 1, 2, ARRAY[]::text[]),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = 3^{x} - 2e^{x}$ksql$, $ksql$3^x/ln(3) - 2e^x + c$ksql$, $ksql$F(x) = \dfrac{3^{x}}{\ln(3)} - 2e^{x} + c$ksql$, 2, 3, ARRAY[]::text[]),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{9^{x} + 3^{x}}{3^{x}}$ksql$, $ksql$3^x/ln(3) + x + c$ksql$, $ksql$F(x) = \dfrac{3^{x}}{\ln(3)} + x + c$ksql$, 2, 4, ARRAY[]::text[]),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{(2^{x} + 1)^{2}}{2^{x}}$ksql$, $ksql$2^x/ln(2) + 2x - 1/(2^x ln(2)) + c$ksql$, $ksql$F(x) = \dfrac{2^{x}}{\ln(2)} + 2x - \dfrac{1}{2^{x}\ln(2)} + c$ksql$, 3, 5, ARRAY[$ksql$2^x/ln2 + 2x - 2^-x/ln2 + c$ksql$]::text[]),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{6^{x} - 3^{x}}{2^{x}}$ksql$, $ksql$3^x/ln(3) - (3/2)^x/ln(3/2) + c$ksql$, $ksql$F(x) = \dfrac{3^{x}}{\ln(3)} - \dfrac{\left(\frac{3}{2}\right)^{x}}{\ln\left(\frac{3}{2}\right)} + c$ksql$, 3, 6, ARRAY[$ksql$3^x/ln3 - 1,5^x/ln(1,5) + c$ksql$]::text[]),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 3\ln(x)$ksql$, $ksql$3x ln(x) - 3x + c$ksql$, $ksql$F(x) = 3x\ln(x) - 3x + c$ksql$, 1, 1, ARRAY[$ksql$3(x ln(x) - x) + c$ksql$]::text[]),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln(x) + \dfrac{1}{x}$ksql$, $ksql$x ln(x) - x + ln(x) + c$ksql$, $ksql$F(x) = x\ln(x) - x + \ln(x) + c$ksql$, 1, 2, ARRAY[]::text[]),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln(5x)$ksql$, $ksql$x ln(5x) - x + c$ksql$, $ksql$F(x) = x\ln(5x) - x + c$ksql$, 2, 3, ARRAY[$ksql$x ln(5) + x ln(x) - x + c$ksql$]::text[]),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 4 \cdot \log(x)$ksql$, $ksql$4(x ln(x) - x)/ln(10) + c$ksql$, $ksql$F(x) = \dfrac{4\big(x\ln(x) - x\big)}{\ln(10)} + c$ksql$, 2, 4, ARRAY[]::text[]),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln\left(\dfrac{x^{2}}{3}\right)$ksql$, $ksql$x ln(x^2/3) - 2x + c$ksql$, $ksql$F(x) = x\ln\left(\dfrac{x^{2}}{3}\right) - 2x + c$ksql$, 3, 5, ARRAY[$ksql$2x ln(x) - x ln(3) - 2x + c$ksql$]::text[]),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 2 \cdot \log(4x)$ksql$, $ksql$2x(ln(4x) - 1)/ln(10) + c$ksql$, $ksql$F(x) = \dfrac{2x\big(\ln(4x) - 1\big)}{\ln(10)} + c$ksql$, 3, 6, ARRAY[$ksql$2(x ln(4x) - x)/ln(10) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = e^{3x}$ksql$, $ksql$e^(3x)/3 + c$ksql$, $ksql$F(x) = \tfrac{1}{3}e^{3x} + c$ksql$, 1, 1, ARRAY[$ksql$1/3e^(3x) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = \cos(2x)$ksql$, $ksql$sin(2x)/2 + c$ksql$, $ksql$F(x) = \tfrac{1}{2}\sin(2x) + c$ksql$, 1, 2, ARRAY[$ksql$1/2sin(2x) + c$ksql$, $ksql$0,5sin(2x) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = e^{2x + 5}$ksql$, $ksql$e^(2x+5)/2 + c$ksql$, $ksql$F(x) = \tfrac{1}{2}e^{2x + 5} + c$ksql$, 2, 3, ARRAY[$ksql$1/2e^(2x+5) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = 2\cos\left(\tfrac{1}{2}\pi x\right)$ksql$, $ksql$4sin(1/2 pi x)/pi + c$ksql$, $ksql$F(x) = \dfrac{4}{\pi}\sin\left(\tfrac{1}{2}\pi x\right) + c$ksql$, 2, 4, ARRAY[$ksql$4/pi sin(0,5pi x) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = 3e^{1 - 2x}$ksql$, $ksql$-1,5e^(1-2x) + c$ksql$, $ksql$F(x) = -1\tfrac{1}{2}e^{1 - 2x} + c$ksql$, 3, 5, ARRAY[$ksql$-3e^(1-2x)/2 + c$ksql$, $ksql$-3/2e^(1-2x) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = \sin(2x) - \cos(3x)$ksql$, $ksql$-cos(2x)/2 - sin(3x)/3 + c$ksql$, $ksql$F(x) = -\tfrac{1}{2}\cos(2x) - \tfrac{1}{3}\sin(3x) + c$ksql$, 3, 6, ARRAY[$ksql$-1/2cos(2x) - 1/3sin(3x) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{1}{x + 4}$ksql$, $ksql$ln|x + 4| + c$ksql$, $ksql$F(x) = \ln|x + 4| + c$ksql$, 1, 1, ARRAY[$ksql$ln(x + 4) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = (3x - 2)^{4}$ksql$, $ksql$(3x-2)^5/15 + c$ksql$, $ksql$F(x) = \tfrac{1}{15}(3x - 2)^{5} + c$ksql$, 1, 2, ARRAY[$ksql$1/15(3x-2)^5 + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{4}{3x + 2}$ksql$, $ksql$4ln|3x + 2|/3 + c$ksql$, $ksql$F(x) = \tfrac{4}{3}\ln|3x + 2| + c$ksql$, 2, 3, ARRAY[$ksql$4/3 ln(3x + 2) + c$ksql$, $ksql$1 1/3 ln|3x+2| + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \sqrt{2x + 3}$ksql$, $ksql$(2x+3)sqrt(2x+3)/3 + c$ksql$, $ksql$F(x) = \tfrac{1}{3}(2x + 3)\sqrt{2x + 3} + c$ksql$, 2, 4, ARRAY[$ksql$1/3(2x+3)^(3/2) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{6}{5 - 2x}$ksql$, $ksql$-3ln|5 - 2x| + c$ksql$, $ksql$F(x) = -3\ln|5 - 2x| + c$ksql$, 3, 5, ARRAY[$ksql$-3ln(5 - 2x) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{1}{\sqrt{4x + 1}}$ksql$, $ksql$sqrt(4x+1)/2 + c$ksql$, $ksql$F(x) = \tfrac{1}{2}\sqrt{4x + 1} + c$ksql$, 3, 6, ARRAY[$ksql$1/2sqrt(4x+1) + c$ksql$, $ksql$0,5(4x+1)^(1/2) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 2^{3x}$ksql$, $ksql$2^(3x)/(3ln(2)) + c$ksql$, $ksql$F(x) = \dfrac{2^{3x}}{3\ln(2)} + c$ksql$, 1, 1, ARRAY[]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \ln(x + 2)$ksql$, $ksql$(x+2)ln(x+2) - (x+2) + c$ksql$, $ksql$F(x) = (x + 2)\ln(x + 2) - (x + 2) + c$ksql$, 1, 2, ARRAY[]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 5^{2x - 1}$ksql$, $ksql$5^(2x-1)/(2ln(5)) + c$ksql$, $ksql$F(x) = \dfrac{5^{2x - 1}}{2\ln(5)} + c$ksql$, 2, 3, ARRAY[]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \ln(2x - 1)$ksql$, $ksql$((2x-1)ln(2x-1) - (2x-1))/2 + c$ksql$, $ksql$F(x) = \tfrac{1}{2}\big((2x - 1)\ln(2x - 1) - (2x - 1)\big) + c$ksql$, 2, 4, ARRAY[$ksql$1/2((2x-1)ln(2x-1) - (2x-1)) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \left(\tfrac{1}{3}\right)^{2x + 1}$ksql$, $ksql$(1/3)^(2x+1)/(2ln(1/3)) + c$ksql$, $ksql$F(x) = \dfrac{\left(\frac{1}{3}\right)^{2x + 1}}{2\ln\left(\frac{1}{3}\right)} + c$ksql$, 3, 5, ARRAY[$ksql$-(1/3)^(2x+1)/(2ln(3)) + c$ksql$]::text[]),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 6\ln(3x + 2)$ksql$, $ksql$2((3x+2)ln(3x+2) - (3x+2)) + c$ksql$, $ksql$F(x) = 2\big((3x + 2)\ln(3x + 2) - (3x + 2)\big) + c$ksql$, 3, 6, ARRAY[]::text[]),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{\frac{1}{4}\pi} \cos(2x)\,dx$ksql$, $ksql$1/2$ksql$, $ksql$\tfrac{1}{2}$ksql$, 1, 1, ARRAY[$ksql$0,5$ksql$, $ksql$0.5$ksql$]::text[]),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{2} \dfrac{1}{x + 1}\,dx$ksql$, $ksql$ln(3)$ksql$, $ksql$\ln(3)$ksql$, 1, 2, ARRAY[]::text[]),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{2} e^{\frac{1}{2}x}\,dx$ksql$, $ksql$2e - 2$ksql$, $ksql$2e - 2$ksql$, 1, 3, ARRAY[$ksql$2(e - 1)$ksql$]::text[]),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{\frac{1}{6}\pi}^{\frac{1}{2}\pi} 4\sin(2x)\,dx$ksql$, $ksql$3$ksql$, $ksql$3$ksql$, 2, 4, ARRAY[]::text[]),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{1}^{3} \dfrac{4}{2x - 1}\,dx$ksql$, $ksql$2ln(5)$ksql$, $ksql$2\ln(5)$ksql$, 2, 5, ARRAY[$ksql$ln(25)$ksql$]::text[]),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{1}^{e} 3\ln(x)\,dx$ksql$, $ksql$3$ksql$, $ksql$3$ksql$, 2, 6, ARRAY[]::text[]),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{e}^{e^{3}} 6\ln\left(\sqrt{x}\right)\,dx$ksql$, $ksql$6e^3$ksql$, $ksql$6e^{3}$ksql$, 3, 7, ARRAY[]::text[]),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{-1}^{1} 6e^{2x + 1}\,dx$ksql$, $ksql$3e^3 - 3/e$ksql$, $ksql$3e^{3} - \dfrac{3}{e}$ksql$, 3, 8, ARRAY[$ksql$3e^3 - 3e^-1$ksql$]::text[])
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
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = x^{3} + \cos(x)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Twee losse termen met een $+$ ertussen: primitiveer elke term apart.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = x^{3} + \cos(x)$ksql$, 1, $ksql$De termen zijn $x^{3}$ (een macht) en $\cos(x)$ (een standaardfunctie); herschrijven is niet nodig.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = x^{3} + \cos(x)$ksql$, 2, $ksql$$ax^{n}$ geeft $a \cdot \dfrac{1}{n + 1}x^{n + 1}$, dus $x^{3}$ geeft $\tfrac{1}{4}x^{4}$. En $\cos(x)$ geeft $\sin(x)$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = x^{3} + \cos(x)$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = \tfrac{1}{4}x^{4} + \sin(x) + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = 6x^{2} - \sin(x)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Twee losse termen met een $-$ ertussen: primitiveer elke term apart en houd het minteken vast.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = 6x^{2} - \sin(x)$ksql$, 1, $ksql$De termen zijn $6x^{2}$ en $-\sin(x)$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = 6x^{2} - \sin(x)$ksql$, 2, $ksql$$6x^{2}$ geeft $6 \cdot \tfrac{1}{3}x^{3} = 2x^{3}$. En $\sin(x)$ geeft $-\cos(x)$, dus $-\sin(x)$ geeft $+\cos(x)$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = 6x^{2} - \sin(x)$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = 2x^{3} + \cos(x) + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{x^{3} + 4}{x^{2}}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Een breuk met één term in de noemer: deel eerst uit, dan heb je losse machten van $x$. Er is geen quotiëntregel voor primitiveren.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{x^{3} + 4}{x^{2}}$ksql$, 1, $ksql$Deel uit: $f(x) = \dfrac{x^{3}}{x^{2}} + \dfrac{4}{x^{2}} = x + 4x^{-2}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{x^{3} + 4}{x^{2}}$ksql$, 2, $ksql$$x$ geeft $\tfrac{1}{2}x^{2}$. En $4x^{-2}$ geeft $4 \cdot \dfrac{1}{-1}x^{-1} = -4x^{-1} = -\dfrac{4}{x}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{x^{3} + 4}{x^{2}}$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = \tfrac{1}{2}x^{2} - \dfrac{4}{x} + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \sqrt{x}\,(x - 3)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Een wortel maal haakjes: werk de haakjes uit en schrijf de wortel als een macht, dan is het weer de machtsregel.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \sqrt{x}\,(x - 3)$ksql$, 1, $ksql$$\sqrt{x} = x^{\frac{1}{2}}$, dus $f(x) = x^{\frac{1}{2}} \cdot x - 3x^{\frac{1}{2}} = x^{\frac{3}{2}} - 3x^{\frac{1}{2}}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \sqrt{x}\,(x - 3)$ksql$, 2, $ksql$$x^{\frac{3}{2}}$ geeft $\dfrac{1}{\frac{5}{2}}x^{\frac{5}{2}} = \tfrac{2}{5}x^{\frac{5}{2}}$. En $3x^{\frac{1}{2}}$ geeft $3 \cdot \tfrac{2}{3}x^{\frac{3}{2}} = 2x^{\frac{3}{2}}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \sqrt{x}\,(x - 3)$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = \tfrac{2}{5}x^{2}\sqrt{x} - 2x\sqrt{x} + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{2x^{2} - 5}{x^{4}}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Een breuk met één term in de noemer: uitdelen, en let op de negatieve exponenten die je dan krijgt.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{2x^{2} - 5}{x^{4}}$ksql$, 1, $ksql$Deel uit: $f(x) = \dfrac{2x^{2}}{x^{4}} - \dfrac{5}{x^{4}} = 2x^{-2} - 5x^{-4}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{2x^{2} - 5}{x^{4}}$ksql$, 2, $ksql$$2x^{-2}$ geeft $2 \cdot \dfrac{1}{-1}x^{-1} = -2x^{-1}$. En $5x^{-4}$ geeft $5 \cdot \dfrac{1}{-3}x^{-3} = -\tfrac{5}{3}x^{-3}$; met het minteken ervoor wordt dat $+\tfrac{5}{3}x^{-3}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{2x^{2} - 5}{x^{4}}$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = -\dfrac{2}{x} + \dfrac{5}{3x^{3}} + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{(\sqrt{x} + 1)^{2}}{x}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst het kwadraat uitwerken, dan uitdelen; pas daarna zie je de standaardvormen. Let op de term $\dfrac{1}{x}$: die geeft $\ln$, niet een macht.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{(\sqrt{x} + 1)^{2}}{x}$ksql$, 1, $ksql$$(\sqrt{x} + 1)^{2} = x + 2\sqrt{x} + 1$, dus $f(x) = \dfrac{x + 2\sqrt{x} + 1}{x} = 1 + 2x^{-\frac{1}{2}} + x^{-1}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{(\sqrt{x} + 1)^{2}}{x}$ksql$, 2, $ksql$$1$ geeft $x$. En $2x^{-\frac{1}{2}}$ geeft $2 \cdot \dfrac{1}{\frac{1}{2}}x^{\frac{1}{2}} = 4\sqrt{x}$. De term $x^{-1} = \dfrac{1}{x}$ valt buiten de machtsregel ($n = -1$) en geeft $\ln(x)$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_machten_gonio', $ksql$f(x) = \dfrac{(\sqrt{x} + 1)^{2}}{x}$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = x + 4\sqrt{x} + \ln(x) + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = 5 \cdot 2^{x}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Een getal maal een macht met $x$ in de exponent: dat is de standaardvorm $g^{x}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = 5 \cdot 2^{x}$ksql$, 1, $ksql$Hier is $g = 2$; de factor $5$ blijft staan.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = 5 \cdot 2^{x}$ksql$, 2, $ksql$$g^{x}$ geeft $\dfrac{g^{x}}{\ln(g)}$, dus $2^{x}$ geeft $\dfrac{2^{x}}{\ln(2)}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = 5 \cdot 2^{x}$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = \dfrac{5 \cdot 2^{x}}{\ln(2)} + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = e^{x} + 3x^{2}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Twee losse termen: een $e$-macht en een macht van $x$. Primitiveer ze apart.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = e^{x} + 3x^{2}$ksql$, 1, $ksql$De termen zijn $e^{x}$ en $3x^{2}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = e^{x} + 3x^{2}$ksql$, 2, $ksql$$e^{x}$ geeft $e^{x}$ — die verandert niet. En $3x^{2}$ geeft $3 \cdot \tfrac{1}{3}x^{3} = x^{3}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = e^{x} + 3x^{2}$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = e^{x} + x^{3} + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = 3^{x} - 2e^{x}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Twee exponentiële termen, maar met verschillende grondtallen: $g = 3$ en $g = e$. Dat zijn twee verschillende regels.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = 3^{x} - 2e^{x}$ksql$, 1, $ksql$De termen zijn $3^{x}$ en $-2e^{x}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = 3^{x} - 2e^{x}$ksql$, 2, $ksql$$3^{x}$ geeft $\dfrac{3^{x}}{\ln(3)}$. Bij $e^{x}$ hoeft dat delen niet, want $\ln(e) = 1$: $-2e^{x}$ geeft $-2e^{x}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = 3^{x} - 2e^{x}$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = \dfrac{3^{x}}{\ln(3)} - 2e^{x} + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{9^{x} + 3^{x}}{3^{x}}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Een breuk met machten: eerst uitdelen met de rekenregels voor machten, dan staan er standaardvormen.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{9^{x} + 3^{x}}{3^{x}}$ksql$, 1, $ksql$$\dfrac{9^{x}}{3^{x}} = \left(\dfrac{9}{3}\right)^{x} = 3^{x}$ en $\dfrac{3^{x}}{3^{x}} = 1$, dus $f(x) = 3^{x} + 1$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{9^{x} + 3^{x}}{3^{x}}$ksql$, 2, $ksql$$3^{x}$ geeft $\dfrac{3^{x}}{\ln(3)}$. En $1$ geeft $x$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{9^{x} + 3^{x}}{3^{x}}$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = \dfrac{3^{x}}{\ln(3)} + x + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{(2^{x} + 1)^{2}}{2^{x}}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst het kwadraat uitwerken, dan uitdelen. Er komt een term met $2^{-x}$ uit; dat is $g^{x}$ met $g = \tfrac{1}{2}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{(2^{x} + 1)^{2}}{2^{x}}$ksql$, 1, $ksql$$(2^{x} + 1)^{2} = 4^{x} + 2 \cdot 2^{x} + 1$, dus $f(x) = \dfrac{4^{x}}{2^{x}} + 2 + \dfrac{1}{2^{x}} = 2^{x} + 2 + 2^{-x}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{(2^{x} + 1)^{2}}{2^{x}}$ksql$, 2, $ksql$$2^{x}$ geeft $\dfrac{2^{x}}{\ln(2)}$ en $2$ geeft $2x$. Voor $2^{-x} = \left(\tfrac{1}{2}\right)^{x}$ geldt $\ln\left(\tfrac{1}{2}\right) = -\ln(2)$, dus dat geeft $\dfrac{2^{-x}}{-\ln(2)} = -\dfrac{1}{2^{x}\ln(2)}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{(2^{x} + 1)^{2}}{2^{x}}$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = \dfrac{2^{x}}{\ln(2)} + 2x - \dfrac{1}{2^{x}\ln(2)} + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{6^{x} - 3^{x}}{2^{x}}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Een breuk met drie verschillende grondtallen: uitdelen levert twee keer de standaardvorm $g^{x}$, met een gebroken grondtal erbij.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{6^{x} - 3^{x}}{2^{x}}$ksql$, 1, $ksql$$\dfrac{6^{x}}{2^{x}} = 3^{x}$ en $\dfrac{3^{x}}{2^{x}} = \left(\tfrac{3}{2}\right)^{x}$, dus $f(x) = 3^{x} - \left(\tfrac{3}{2}\right)^{x}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{6^{x} - 3^{x}}{2^{x}}$ksql$, 2, $ksql$$3^{x}$ geeft $\dfrac{3^{x}}{\ln(3)}$ en $\left(\tfrac{3}{2}\right)^{x}$ geeft $\dfrac{\left(\frac{3}{2}\right)^{x}}{\ln\left(\frac{3}{2}\right)}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_exponenten', $ksql$f(x) = \dfrac{6^{x} - 3^{x}}{2^{x}}$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = \dfrac{3^{x}}{\ln(3)} - \dfrac{\left(\frac{3}{2}\right)^{x}}{\ln\left(\frac{3}{2}\right)} + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 3\ln(x)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Een getal maal $\ln(x)$: dat is de standaardvorm $\ln(x)$, met de factor $3$ ervoor.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 3\ln(x)$ksql$, 1, $ksql$Herschrijven is niet nodig; de factor $3$ mag je voor de primitieve zetten.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 3\ln(x)$ksql$, 2, $ksql$$\ln(x)$ geeft $x\ln(x) - x$, dus $3\ln(x)$ geeft $3\big(x\ln(x) - x\big)$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 3\ln(x)$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = 3x\ln(x) - 3x + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln(x) + \dfrac{1}{x}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Twee losse termen die er op elkaar lijken, maar elk een eigen regel hebben: $\ln(x)$ en $\dfrac{1}{x}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln(x) + \dfrac{1}{x}$ksql$, 1, $ksql$De termen zijn $\ln(x)$ en $\dfrac{1}{x}$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln(x) + \dfrac{1}{x}$ksql$, 2, $ksql$$\ln(x)$ geeft $x\ln(x) - x$. En $\dfrac{1}{x}$ geeft $\ln(x)$ — dat is precies de andere kant op.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln(x) + \dfrac{1}{x}$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = x\ln(x) - x + \ln(x) + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln(5x)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. $\ln$ van een product: splits dat eerst met $\ln(ab) = \ln(a) + \ln(b)$, dan staat er een getal plus de standaardvorm $\ln(x)$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln(5x)$ksql$, 1, $ksql$$f(x) = \ln(5) + \ln(x)$; $\ln(5)$ is gewoon een getal.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln(5x)$ksql$, 2, $ksql$$\ln(5)$ geeft $x\ln(5)$. En $\ln(x)$ geeft $x\ln(x) - x$. Samen: $x\ln(5) + x\ln(x) - x$, en met $\ln(ab) = \ln(a) + \ln(b)$ terug is dat $x\ln(5x) - x$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln(5x)$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = x\ln(5x) - x + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 4 \cdot \log(x)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Hier staat $\log$ met grondtal $10$, niet $\ln$. Gebruik de regel voor $^{g}\!\log(x)$ met $g = 10$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 4 \cdot \log(x)$ksql$, 1, $ksql$Je kunt ook eerst omschrijven: $\log(x) = \dfrac{\ln(x)}{\ln(10)}$, dus $f(x) = \dfrac{4}{\ln(10)}\ln(x)$ met $\dfrac{4}{\ln(10)}$ als getal ervoor.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 4 \cdot \log(x)$ksql$, 2, $ksql$$^{g}\!\log(x)$ geeft $\dfrac{1}{\ln(g)}\big(x\ln(x) - x\big)$, dus met $g = 10$ en de factor $4$ ervoor: $\dfrac{4}{\ln(10)}\big(x\ln(x) - x\big)$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 4 \cdot \log(x)$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = \dfrac{4\big(x\ln(x) - x\big)}{\ln(10)} + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln\left(\dfrac{x^{2}}{3}\right)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. $\ln$ van een breuk met een macht erin: eerst helemaal uitsplitsen met de rekenregels voor $\ln$, dan blijft er $\ln(x)$ over.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln\left(\dfrac{x^{2}}{3}\right)$ksql$, 1, $ksql$$f(x) = \ln(x^{2}) - \ln(3) = 2\ln(x) - \ln(3)$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln\left(\dfrac{x^{2}}{3}\right)$ksql$, 2, $ksql$$2\ln(x)$ geeft $2\big(x\ln(x) - x\big)$ en $-\ln(3)$ geeft $-x\ln(3)$. Samen: $2x\ln(x) - x\ln(3) - 2x$, en dat is $x\big(2\ln(x) - \ln(3)\big) - 2x = x\ln\left(\dfrac{x^{2}}{3}\right) - 2x$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = \ln\left(\dfrac{x^{2}}{3}\right)$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = x\ln\left(\dfrac{x^{2}}{3}\right) - 2x + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 2 \cdot \log(4x)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Grondtal $10$ én een getal in de logaritme: schrijf eerst alles om naar $\ln$, dan is het weer de standaardvorm $\ln(x)$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 2 \cdot \log(4x)$ksql$, 1, $ksql$$f(x) = \dfrac{2\ln(4x)}{\ln(10)} = \dfrac{2}{\ln(10)}\big(\ln(4) + \ln(x)\big)$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 2 \cdot \log(4x)$ksql$, 2, $ksql$$\ln(4)$ geeft $x\ln(4)$ en $\ln(x)$ geeft $x\ln(x) - x$. Samen, met $\dfrac{2}{\ln(10)}$ ervoor: $\dfrac{2}{\ln(10)}\big(x\ln(4) + x\ln(x) - x\big) = \dfrac{2}{\ln(10)}\big(x\ln(4x) - x\big)$.$ksql$),
  ('k0b_standaardprimitieven', 'k0b_logaritmen', $ksql$f(x) = 2 \cdot \log(4x)$ksql$, 3, $ksql$Schrijf het antwoord op: $F(x) = \dfrac{2x\big(\ln(4x) - 1\big)}{\ln(10)} + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = e^{3x}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = e^{3x}$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $e^{\ldots}$, kern $3x$. Dus $a = 3$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = e^{3x}$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $e^{\ldots}$ geeft $e^{\ldots}$, dus met de kern erin: $e^{3x}$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = e^{3x}$ksql$, 3, $ksql$Deel door $a = 3$: $F(x) = \tfrac{1}{3}e^{3x} + c$. Controle: differentieer $F$; de kettingregel geeft de factor $3$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = \cos(2x)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = \cos(2x)$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $\cos(\ldots)$, kern $2x$. Dus $a = 2$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = \cos(2x)$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $\cos(\ldots)$ geeft $\sin(\ldots)$, dus met de kern erin: $\sin(2x)$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = \cos(2x)$ksql$, 3, $ksql$Deel door $a = 2$: $F(x) = \tfrac{1}{2}\sin(2x) + c$. Controle: differentieer $F$; de kettingregel geeft de factor $2$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = e^{2x + 5}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = e^{2x + 5}$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $e^{\ldots}$, kern $2x + 5$. Dus $a = 2$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = e^{2x + 5}$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $e^{\ldots}$ geeft $e^{\ldots}$, dus met de kern erin: $e^{2x + 5}$. De $+5$ verandert niets aan de factor; alleen de $a$ telt.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = e^{2x + 5}$ksql$, 3, $ksql$Deel door $a = 2$: $F(x) = \tfrac{1}{2}e^{2x + 5} + c$. Controle: differentieer $F$; de kettingregel geeft de factor $2$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = 2\cos\left(\tfrac{1}{2}\pi x\right)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = 2\cos\left(\tfrac{1}{2}\pi x\right)$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $\cos(\ldots)$, kern $\tfrac{1}{2}\pi x$. Dus $a = \tfrac{1}{2}\pi$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = 2\cos\left(\tfrac{1}{2}\pi x\right)$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $\cos(\ldots)$ geeft $\sin(\ldots)$, dus met de kern erin en de factor $2$ ervoor: $2\sin\left(\tfrac{1}{2}\pi x\right)$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = 2\cos\left(\tfrac{1}{2}\pi x\right)$ksql$, 3, $ksql$Deel door $a = \tfrac{1}{2}\pi$: $F(x) = \dfrac{2}{\frac{1}{2}\pi}\sin\left(\tfrac{1}{2}\pi x\right) = \dfrac{4}{\pi}\sin\left(\tfrac{1}{2}\pi x\right) + c$. Controle: differentieer $F$; de kettingregel geeft de factor $\tfrac{1}{2}\pi$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = 3e^{1 - 2x}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = 3e^{1 - 2x}$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $e^{\ldots}$, kern $1 - 2x$. Dus $a = -2$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = 3e^{1 - 2x}$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $e^{\ldots}$ geeft $e^{\ldots}$, dus met de kern erin en de factor $3$ ervoor: $3e^{1 - 2x}$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = 3e^{1 - 2x}$ksql$, 3, $ksql$Deel door $a = -2$: $F(x) = \dfrac{3}{-2}e^{1 - 2x} = -1\tfrac{1}{2}e^{1 - 2x} + c$. Controle: differentieer $F$; de kettingregel geeft de factor $-2$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = \sin(2x) - \cos(3x)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Twee termen, elk met een eigen kern $ax + b$. Pas de regel voor $f(ax + b)$ per term toe; de $a$ is niet voor beide hetzelfde.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = \sin(2x) - \cos(3x)$ksql$, 1, $ksql$Eerste term: buitenkant $\sin(\ldots)$, kern $2x$, dus $a = 2$. Tweede term: buitenkant $\cos(\ldots)$, kern $3x$, dus $a = 3$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = \sin(2x) - \cos(3x)$ksql$, 2, $ksql$Primitiveer de buitenkanten: $\sin(\ldots)$ geeft $-\cos(\ldots)$ en $\cos(\ldots)$ geeft $\sin(\ldots)$. Met de kernen erin: $-\cos(2x)$ en $\sin(3x)$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_e_gonio', $ksql$f(x) = \sin(2x) - \cos(3x)$ksql$, 3, $ksql$Deel elke term door zijn eigen $a$: $F(x) = -\tfrac{1}{2}\cos(2x) - \tfrac{1}{3}\sin(3x) + c$. Controle: differentieer $F$ en je krijgt $f$ terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{1}{x + 4}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{1}{x + 4}$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $\dfrac{1}{\ldots}$, kern $x + 4$. Dus $a = 1$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{1}{x + 4}$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $\dfrac{1}{x}$ geeft $\ln|x|$, dus met de kern erin: $\ln|x + 4|$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{1}{x + 4}$ksql$, 3, $ksql$Deel door $a = 1$: $F(x) = \ln|x + 4| + c$. Controle: differentieer $F$; de kettingregel geeft de factor $1$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = (3x - 2)^{4}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = (3x - 2)^{4}$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $(\ldots)^{4}$, kern $3x - 2$. Dus $a = 3$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = (3x - 2)^{4}$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $(\ldots)^{4}$ geeft $\tfrac{1}{5}(\ldots)^{5}$, dus met de kern erin: $\tfrac{1}{5}(3x - 2)^{5}$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = (3x - 2)^{4}$ksql$, 3, $ksql$Deel door $a = 3$: $F(x) = \dfrac{1}{3} \cdot \tfrac{1}{5}(3x - 2)^{5} = \tfrac{1}{15}(3x - 2)^{5} + c$. Controle: differentieer $F$; de kettingregel geeft de factor $3$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{4}{3x + 2}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{4}{3x + 2}$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $\dfrac{1}{\ldots}$, kern $3x + 2$. Dus $a = 3$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{4}{3x + 2}$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $\dfrac{1}{x}$ geeft $\ln|x|$, dus met de kern erin en de factor $4$ ervoor: $4\ln|3x + 2|$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{4}{3x + 2}$ksql$, 3, $ksql$Deel door $a = 3$: $F(x) = \tfrac{4}{3}\ln|3x + 2| + c$. Controle: differentieer $F$; de kettingregel geeft de factor $3$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \sqrt{2x + 3}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \sqrt{2x + 3}$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $\sqrt{\ldots} = (\ldots)^{\frac{1}{2}}$, kern $2x + 3$. Dus $a = 2$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \sqrt{2x + 3}$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $(\ldots)^{\frac{1}{2}}$ geeft $\tfrac{2}{3}(\ldots)^{\frac{3}{2}}$, dus met de kern erin: $\tfrac{2}{3}(2x + 3)\sqrt{2x + 3}$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \sqrt{2x + 3}$ksql$, 3, $ksql$Deel door $a = 2$: $F(x) = \dfrac{1}{2} \cdot \tfrac{2}{3}(2x + 3)\sqrt{2x + 3} = \tfrac{1}{3}(2x + 3)\sqrt{2x + 3} + c$. Controle: differentieer $F$; de kettingregel geeft de factor $2$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{6}{5 - 2x}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{6}{5 - 2x}$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $\dfrac{1}{\ldots}$, kern $5 - 2x$. Dus $a = -2$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{6}{5 - 2x}$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $\dfrac{1}{x}$ geeft $\ln|x|$, dus met de kern erin en de factor $6$ ervoor: $6\ln|5 - 2x|$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{6}{5 - 2x}$ksql$, 3, $ksql$Deel door $a = -2$: $F(x) = \dfrac{6}{-2}\ln|5 - 2x| = -3\ln|5 - 2x| + c$. Controle: differentieer $F$; de kettingregel geeft de factor $-2$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{1}{\sqrt{4x + 1}}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{1}{\sqrt{4x + 1}}$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $\dfrac{1}{\sqrt{\ldots}} = (\ldots)^{-\frac{1}{2}}$, kern $4x + 1$. Dus $a = 4$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{1}{\sqrt{4x + 1}}$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $(\ldots)^{-\frac{1}{2}}$ geeft $\dfrac{1}{\frac{1}{2}}(\ldots)^{\frac{1}{2}} = 2\sqrt{\ldots}$, dus met de kern erin: $2\sqrt{4x + 1}$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_breuk_wortel', $ksql$f(x) = \dfrac{1}{\sqrt{4x + 1}}$ksql$, 3, $ksql$Deel door $a = 4$: $F(x) = \dfrac{1}{4} \cdot 2\sqrt{4x + 1} = \tfrac{1}{2}\sqrt{4x + 1} + c$. Controle: differentieer $F$; de kettingregel geeft de factor $4$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 2^{3x}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 2^{3x}$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $2^{\ldots}$, kern $3x$. Dus $a = 3$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 2^{3x}$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $2^{x}$ geeft $\dfrac{2^{x}}{\ln(2)}$, dus met de kern erin: $\dfrac{2^{3x}}{\ln(2)}$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 2^{3x}$ksql$, 3, $ksql$Deel door $a = 3$: $F(x) = \dfrac{2^{3x}}{3\ln(2)} + c$. Controle: differentieer $F$; de kettingregel geeft de factor $3$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \ln(x + 2)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \ln(x + 2)$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $\ln(\ldots)$, kern $x + 2$. Dus $a = 1$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \ln(x + 2)$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $\ln(x)$ geeft $x\ln(x) - x$, dus met de kern erin: $(x + 2)\ln(x + 2) - (x + 2)$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \ln(x + 2)$ksql$, 3, $ksql$Deel door $a = 1$: $F(x) = (x + 2)\ln(x + 2) - (x + 2) + c$. Controle: differentieer $F$; de kettingregel geeft de factor $1$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 5^{2x - 1}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 5^{2x - 1}$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $5^{\ldots}$, kern $2x - 1$. Dus $a = 2$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 5^{2x - 1}$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $5^{x}$ geeft $\dfrac{5^{x}}{\ln(5)}$, dus met de kern erin: $\dfrac{5^{2x - 1}}{\ln(5)}$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 5^{2x - 1}$ksql$, 3, $ksql$Deel door $a = 2$: $F(x) = \dfrac{5^{2x - 1}}{2\ln(5)} + c$. Controle: differentieer $F$; de kettingregel geeft de factor $2$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \ln(2x - 1)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \ln(2x - 1)$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $\ln(\ldots)$, kern $2x - 1$. Dus $a = 2$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \ln(2x - 1)$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $\ln(x)$ geeft $x\ln(x) - x$, dus met de kern erin: $(2x - 1)\ln(2x - 1) - (2x - 1)$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \ln(2x - 1)$ksql$, 3, $ksql$Deel door $a = 2$: $F(x) = \tfrac{1}{2}\big((2x - 1)\ln(2x - 1) - (2x - 1)\big) + c$. Controle: differentieer $F$; de kettingregel geeft de factor $2$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \left(\tfrac{1}{3}\right)^{2x + 1}$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \left(\tfrac{1}{3}\right)^{2x + 1}$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $\left(\tfrac{1}{3}\right)^{\ldots}$, kern $2x + 1$. Dus $a = 2$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \left(\tfrac{1}{3}\right)^{2x + 1}$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $g^{x}$ geeft $\dfrac{g^{x}}{\ln(g)}$ met $g = \tfrac{1}{3}$, dus met de kern erin: $\dfrac{\left(\frac{1}{3}\right)^{2x + 1}}{\ln\left(\frac{1}{3}\right)}$. Let op: $\ln\left(\tfrac{1}{3}\right)$ is negatief.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = \left(\tfrac{1}{3}\right)^{2x + 1}$ksql$, 3, $ksql$Deel door $a = 2$: $F(x) = \dfrac{\left(\frac{1}{3}\right)^{2x + 1}}{2\ln\left(\frac{1}{3}\right)} + c$. Controle: differentieer $F$; de kettingregel geeft de factor $2$ weer terug.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 6\ln(3x + 2)$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\dfrac{1}{a}F(ax + b) + c$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 6\ln(3x + 2)$ksql$, 1, $ksql$Buitenkant en kern: buitenkant $\ln(\ldots)$, kern $3x + 2$. Dus $a = 3$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 6\ln(3x + 2)$ksql$, 2, $ksql$Primitiveer alleen de buitenkant, met de kern erin: $\ln(x)$ geeft $x\ln(x) - x$, dus met de kern erin en de factor $6$ ervoor: $6\big((3x + 2)\ln(3x + 2) - (3x + 2)\big)$.$ksql$),
  ('k0b_lineaire_kern', 'k0b_lin_exp_ln', $ksql$f(x) = 6\ln(3x + 2)$ksql$, 3, $ksql$Deel door $a = 3$: $F(x) = \dfrac{6}{3}\big((3x + 2)\ln(3x + 2) - (3x + 2)\big) = 2\big((3x + 2)\ln(3x + 2) - (3x + 2)\big) + c$. Controle: differentieer $F$; de kettingregel geeft de factor $3$ weer terug.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{\frac{1}{4}\pi} \cos(2x)\,dx$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{\frac{1}{4}\pi} \cos(2x)\,dx$ksql$, 1, $ksql$Buitenkant $\cos(\ldots)$, kern $2x$, dus $a = 2$: de regel voor $f(ax + b)$.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{\frac{1}{4}\pi} \cos(2x)\,dx$ksql$, 2, $ksql$Primitiveer: $F(x) = \tfrac{1}{2}\sin(2x)$. De integratieconstante laat je weg; die valt bij het aftrekken toch weg.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{\frac{1}{4}\pi} \cos(2x)\,dx$ksql$, 3, $ksql$Vul de grenzen in: $\left[\tfrac{1}{2}\sin(2x)\right]_{0}^{\frac{1}{4}\pi} = \tfrac{1}{2}\sin\left(\tfrac{1}{2}\pi\right) - \tfrac{1}{2}\sin(0) = \tfrac{1}{2} \cdot 1 - 0 = \tfrac{1}{2}$.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{2} \dfrac{1}{x + 1}\,dx$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{2} \dfrac{1}{x + 1}\,dx$ksql$, 1, $ksql$Buitenkant $\dfrac{1}{\ldots}$, kern $x + 1$, dus $a = 1$: delen door $a$ verandert hier niets.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{2} \dfrac{1}{x + 1}\,dx$ksql$, 2, $ksql$Primitiveer: $F(x) = \ln|x + 1|$. De integratieconstante laat je weg; die valt bij het aftrekken toch weg.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{2} \dfrac{1}{x + 1}\,dx$ksql$, 3, $ksql$Vul de grenzen in: $\big[\ln|x + 1|\big]_{0}^{2} = \ln(3) - \ln(1) = \ln(3)$, want $\ln(1) = 0$. Dat laat je zo staan; niet afronden.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{2} e^{\frac{1}{2}x}\,dx$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{2} e^{\frac{1}{2}x}\,dx$ksql$, 1, $ksql$Buitenkant $e^{\ldots}$, kern $\tfrac{1}{2}x$, dus $a = \tfrac{1}{2}$. Delen door $\tfrac{1}{2}$ is keer $2$.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{2} e^{\frac{1}{2}x}\,dx$ksql$, 2, $ksql$Primitiveer: $F(x) = 2e^{\frac{1}{2}x}$. De integratieconstante laat je weg; die valt bij het aftrekken toch weg.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{0}^{2} e^{\frac{1}{2}x}\,dx$ksql$, 3, $ksql$Vul de grenzen in: $\left[2e^{\frac{1}{2}x}\right]_{0}^{2} = 2e^{1} - 2e^{0} = 2e - 2$.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{\frac{1}{6}\pi}^{\frac{1}{2}\pi} 4\sin(2x)\,dx$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{\frac{1}{6}\pi}^{\frac{1}{2}\pi} 4\sin(2x)\,dx$ksql$, 1, $ksql$Buitenkant $\sin(\ldots)$, kern $2x$, dus $a = 2$; de factor $4$ blijft ervoor staan.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{\frac{1}{6}\pi}^{\frac{1}{2}\pi} 4\sin(2x)\,dx$ksql$, 2, $ksql$Primitiveer: $F(x) = \dfrac{4}{2} \cdot -\cos(2x) = -2\cos(2x)$. De integratieconstante laat je weg; die valt bij het aftrekken toch weg.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{\frac{1}{6}\pi}^{\frac{1}{2}\pi} 4\sin(2x)\,dx$ksql$, 3, $ksql$Vul de grenzen in: $\big[-2\cos(2x)\big]_{\frac{1}{6}\pi}^{\frac{1}{2}\pi} = -2\cos(\pi) + 2\cos\left(\tfrac{1}{3}\pi\right) = -2 \cdot (-1) + 2 \cdot \tfrac{1}{2} = 2 + 1 = 3$.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{1}^{3} \dfrac{4}{2x - 1}\,dx$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{1}^{3} \dfrac{4}{2x - 1}\,dx$ksql$, 1, $ksql$Buitenkant $\dfrac{1}{\ldots}$, kern $2x - 1$, dus $a = 2$; de factor $4$ blijft ervoor staan.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{1}^{3} \dfrac{4}{2x - 1}\,dx$ksql$, 2, $ksql$Primitiveer: $F(x) = \dfrac{4}{2}\ln|2x - 1| = 2\ln|2x - 1|$. De integratieconstante laat je weg; die valt bij het aftrekken toch weg.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{1}^{3} \dfrac{4}{2x - 1}\,dx$ksql$, 3, $ksql$Vul de grenzen in: $\big[2\ln|2x - 1|\big]_{1}^{3} = 2\ln(5) - 2\ln(1) = 2\ln(5)$.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{1}^{e} 3\ln(x)\,dx$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{1}^{e} 3\ln(x)\,dx$ksql$, 1, $ksql$Geen kern: dit is gewoon de standaardprimitieve van $\ln(x)$, met de factor $3$ ervoor.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{1}^{e} 3\ln(x)\,dx$ksql$, 2, $ksql$Primitiveer: $F(x) = 3\big(x\ln(x) - x\big)$. De integratieconstante laat je weg; die valt bij het aftrekken toch weg.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{1}^{e} 3\ln(x)\,dx$ksql$, 3, $ksql$Vul de grenzen in: $\big[3(x\ln(x) - x)\big]_{1}^{e} = 3(e \cdot 1 - e) - 3(1 \cdot 0 - 1) = 0 + 3 = 3$, want $\ln(e) = 1$ en $\ln(1) = 0$.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{e}^{e^{3}} 6\ln\left(\sqrt{x}\right)\,dx$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{e}^{e^{3}} 6\ln\left(\sqrt{x}\right)\,dx$ksql$, 1, $ksql$Eerst herschrijven: $\ln\left(\sqrt{x}\right) = \ln\left(x^{\frac{1}{2}}\right) = \tfrac{1}{2}\ln(x)$, dus de integrand is $3\ln(x)$.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{e}^{e^{3}} 6\ln\left(\sqrt{x}\right)\,dx$ksql$, 2, $ksql$Primitiveer: $F(x) = 3\big(x\ln(x) - x\big)$. De integratieconstante laat je weg; die valt bij het aftrekken toch weg.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{e}^{e^{3}} 6\ln\left(\sqrt{x}\right)\,dx$ksql$, 3, $ksql$Vul de grenzen in: $\big[3(x\ln(x) - x)\big]_{e}^{e^{3}} = 3(3e^{3} - e^{3}) - 3(e - e) = 6e^{3}$, want $\ln\left(e^{3}\right) = 3$ en $\ln(e) = 1$.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{-1}^{1} 6e^{2x + 1}\,dx$ksql$, 0, $ksql$Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{-1}^{1} 6e^{2x + 1}\,dx$ksql$, 1, $ksql$Buitenkant $e^{\ldots}$, kern $2x + 1$, dus $a = 2$; de factor $6$ blijft ervoor staan.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{-1}^{1} 6e^{2x + 1}\,dx$ksql$, 2, $ksql$Primitiveer: $F(x) = \dfrac{6}{2}e^{2x + 1} = 3e^{2x + 1}$. De integratieconstante laat je weg; die valt bij het aftrekken toch weg.$ksql$),
  ('k0b_bepaalde_integralen', 'k0b_bepaald_exact', $ksql$\int_{-1}^{1} 6e^{2x + 1}\,dx$ksql$, 3, $ksql$Vul de grenzen in: $\left[3e^{2x + 1}\right]_{-1}^{1} = 3e^{3} - 3e^{-1} = 3e^{3} - \dfrac{3}{e}$.$ksql$)
) AS v(topic_slug, cluster_slug, latex_body, step_order, step_description)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new cl ON cl.slug = v.cluster_slug AND cl.topic_id = t.id
JOIN public.questions_new vr ON vr.latex_body = v.latex_body AND vr.cluster_id = cl.id
ON CONFLICT (question_id, step_order) DO NOTHING;

-- 6. Controle
DO $do$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'k0b_machten_gonio' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'k0b_standaardprimitieven' AND site = 'integralen'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster k0b_machten_gonio hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'k0b_exponenten' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'k0b_standaardprimitieven' AND site = 'integralen'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster k0b_exponenten hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'k0b_logaritmen' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'k0b_standaardprimitieven' AND site = 'integralen'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster k0b_logaritmen hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'k0b_lin_e_gonio' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'k0b_lineaire_kern' AND site = 'integralen'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster k0b_lin_e_gonio hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'k0b_lin_breuk_wortel' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'k0b_lineaire_kern' AND site = 'integralen'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster k0b_lin_breuk_wortel hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'k0b_lin_exp_ln' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'k0b_lineaire_kern' AND site = 'integralen'));
  IF n <> 6 THEN RAISE EXCEPTION 'Cluster k0b_lin_exp_ln hoort 6 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = (SELECT id FROM public.topic_clusters_new WHERE slug = 'k0b_bepaald_exact' AND topic_id = (SELECT id FROM public.topics_new WHERE slug = 'k0b_bepaalde_integralen' AND site = 'integralen'));
  IF n <> 8 THEN RAISE EXCEPTION 'Cluster k0b_bepaald_exact hoort 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.question_steps_new s
  JOIN public.questions_new vr ON vr.id = s.question_id
  JOIN public.topics_new t ON t.id = vr.topic_id
  WHERE t.site = 'integralen' AND t.slug IN ('k0b_standaardprimitieven', 'k0b_lineaire_kern', 'k0b_bepaalde_integralen');
  IF n <> 176 THEN RAISE EXCEPTION 'Deze topics horen samen 176 stappen te hebben, gevonden %', n; END IF;
END $do$;

COMMIT;
