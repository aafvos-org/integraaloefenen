-- =============================================================================
-- Uitwerkingen van vier onderwerpen in hoofdstuk 11.
--
-- De vragen staan al in 0024. De stappen stonden wel op de echte
-- database, maar niet in de migraties. Een lege database miste ze daardoor.
--
--   h11_machten_int  11 stappen
--   h11_e_ln_int     12 stappen
--   h11_gonio_int     8 stappen
--   h11_ketting_int   8 stappen
--
-- Twee keer draaien voegt niets toe: ON CONFLICT DO NOTHING.
-- =============================================================================

BEGIN;

INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, v.step_order, v.step_description
FROM (VALUES
  -- h11_machten_int
  ('h11_machten_int', $ksql$\int_{-1}^{2} (x^{2} + x)\,dx$ksql$, 1, $ksql$Bepaal de primitieve functie van de integrand $f(x) = x^2 + x$: $\int (x^2 + x)\,dx = \frac{1}{3}x^3 + \frac{1}{2}x^2 + C$.$ksql$),
  ('h11_machten_int', $ksql$\int_{-1}^{2} (x^{2} + x)\,dx$ksql$, 2, $ksql$Evalueer de primitieve functie $F(x) = \frac{1}{3}x^3 + \frac{1}{2}x^2$ bij de bovengrens $x=2$ en de ondergrens $x=-1$: $F(2) = \frac{1}{3}(2)^3 + \frac{1}{2}(2)^2 = \frac{8}{3} + 2 = \frac{14}{3}$ en $F(-1) = \frac{1}{3}(-1)^3 + \frac{1}{2}(-1)^2 = -\frac{1}{3} + \frac{1}{2} = \frac{1}{6}$.$ksql$),
  ('h11_machten_int', $ksql$\int_{-1}^{2} (x^{2} + x)\,dx$ksql$, 3, $ksql$Trek de waarde van de primitieve functie bij de ondergrens af van die bij de bovengrens: $F(2) - F(-1) = \frac{14}{3} - \frac{1}{6}$.$ksql$),
  ('h11_machten_int', $ksql$\int_{-1}^{2} (x^{2} + x)\,dx$ksql$, 4, $ksql$Vereenvoudig de uitkomst tot een breuk: $\frac{28}{6} - \frac{1}{6} = \frac{27}{6} = \frac{9}{2}$.$ksql$),
  ('h11_machten_int', $ksql$\int_{1}^{4} (x^{3} - 3x^{2} + 2)\,dx$ksql$, 1, $ksql$Bepaal de primitieve functie van de integrand $f(x) = x^{3} - 3x^{2} + 2$: $\int (x^{3} - 3x^{2} + 2)\,dx = \frac{1}{4}x^{4} - x^{3} + 2x + C$.$ksql$),
  ('h11_machten_int', $ksql$\int_{1}^{4} (x^{3} - 3x^{2} + 2)\,dx$ksql$, 2, $ksql$Evalueer de primitieve functie op de bovengrens $x=4$ en de ondergrens $x=1$: $F(4) = \frac{1}{4}(4)^{4} - (4)^{3} + 2(4) = 8$ en $F(1) = \frac{1}{4}(1)^{4} - (1)^{3} + 2(1) = \frac{5}{4}$.$ksql$),
  ('h11_machten_int', $ksql$\int_{1}^{4} (x^{3} - 3x^{2} + 2)\,dx$ksql$, 3, $ksql$Trek de waarde bij de ondergrens af van de waarde bij de bovengrens om de definite integraal te vinden: $\int_{1}^{4} (x^{3} - 3x^{2} + 2)\,dx = F(4) - F(1) = 8 - \frac{5}{4}$.$ksql$),
  ('h11_machten_int', $ksql$\int_{1}^{4} (x^{3} - 3x^{2} + 2)\,dx$ksql$, 4, $ksql$Vereenvoudig de uitkomst tot een breuk: $8 - \frac{5}{4} = \frac{32}{4} - \frac{5}{4} = \frac{27}{4}$.$ksql$),
  ('h11_machten_int', $ksql$\int_{-2}^{1} (x^{3} + 2x^{2} - x)\,dx$ksql$, 1, $ksql$Bepaal de primitieve functie $F(x)$ van $f(x) = x^{3} + 2x^{2} - x$, wat resulteert in $F(x) = \frac{1}{4}x^4 + \frac{2}{3}x^3 - \frac{1}{2}x^2$.$ksql$),
  ('h11_machten_int', $ksql$\int_{-2}^{1} (x^{3} + 2x^{2} - x)\,dx$ksql$, 2, $ksql$Evalueer de primitieve functie bij de bovengrens $x=1$ en de ondergrens $x=-2$: $F(1) = \frac{1}{4}(1)^4 + \frac{2}{3}(1)^3 - \frac{1}{2}(1)^2 = \frac{5}{12}$ en $F(-2) = \frac{1}{4}(-2)^4 + \frac{2}{3}(-2)^3 - \frac{1}{2}(-2)^2 = 4 - \frac{16}{3} - 2 = -\frac{10}{3}$.$ksql$),
  ('h11_machten_int', $ksql$\int_{-2}^{1} (x^{3} + 2x^{2} - x)\,dx$ksql$, 3, $ksql$Bereken het verschil $F(1) - F(-2)$ om de definite integraal te vinden: $\frac{5}{12} - (-\frac{10}{3}) = \frac{5}{12} + \frac{40}{12} = \frac{45}{12} = \frac{15}{4}$.$ksql$),
  -- h11_e_ln_int
  ('h11_e_ln_int', $ksql$\int_{0}^{1} e^{x}\,dx$ksql$, 1, $ksql$Bepaal de primitieve functie van $f(x) = e^x$, wat $F(x) = e^x$ is.$ksql$),
  ('h11_e_ln_int', $ksql$\int_{0}^{1} e^{x}\,dx$ksql$, 2, $ksql$Pas de hoofdstelling van de integraalrekening toe door de primitieve functie te evalueren bij de bovengrens en de ondergrens: $[e^x]_{0}^{1}$.$ksql$),
  ('h11_e_ln_int', $ksql$\int_{0}^{1} e^{x}\,dx$ksql$, 3, $ksql$Vul de grenzen in en bereken de exacte waarde: $e^1 - e^0$.$ksql$),
  ('h11_e_ln_int', $ksql$\int_{0}^{1} e^{x}\,dx$ksql$, 4, $ksql$Vereenvoudig de uitdrukking: $e - 1$.$ksql$),
  ('h11_e_ln_int', $ksql$\int_{0}^{2} 3e^{x}\,dx$ksql$, 1, $ksql$Bepaal de primitieve functie van de integrand $3e^x$: $\int 3e^x\,dx = 3e^x + C$.$ksql$),
  ('h11_e_ln_int', $ksql$\int_{0}^{2} 3e^{x}\,dx$ksql$, 2, $ksql$Pas de hoofdstelling van de integraalrekening toe door de bovengrens en ondergrens in te vullen: $[3e^x]_{0}^{2} = 3e^2 - 3e^0$.$ksql$),
  ('h11_e_ln_int', $ksql$\int_{0}^{2} 3e^{x}\,dx$ksql$, 3, $ksql$Vereenvoudig de uitdrukking door te gebruiken dat $e^0 = 1$: $3e^2 - 3 \times 1 = 3e^2 - 3$.$ksql$),
  ('h11_e_ln_int', $ksql$\int_{0}^{2} 3e^{x}\,dx$ksql$, 4, $ksql$Geef het antwoord in exacte vorm: $-3 + 3e^2$.$ksql$),
  ('h11_e_ln_int', $ksql$\int_{0}^{1} (e^{x} + x^{2})\,dx$ksql$, 1, $ksql$Bepaal de primitieve functie van de integrand $f(x) = e^x + x^2$: $F(x) = e^x + \frac{1}{3}x^3$.$ksql$),
  ('h11_e_ln_int', $ksql$\int_{0}^{1} (e^{x} + x^{2})\,dx$ksql$, 2, $ksql$Pas de hoofdstelling van de integraalrekening toe door $F(1) - F(0)$ te berekenen.$ksql$),
  ('h11_e_ln_int', $ksql$\int_{0}^{1} (e^{x} + x^{2})\,dx$ksql$, 3, $ksql$Evalueer $F(1)$: $F(1) = e^1 + \frac{1}{3}(1)^3 = e + \frac{1}{3}$.$ksql$),
  ('h11_e_ln_int', $ksql$\int_{0}^{1} (e^{x} + x^{2})\,dx$ksql$, 4, $ksql$Evalueer $F(0)$ en trek af: $F(0) = e^0 + \frac{1}{3}(0)^3 = 1$. De uitkomst is $(e + \frac{1}{3}) - 1 = e - \frac{2}{3}$.$ksql$),
  -- h11_gonio_int
  ('h11_gonio_int', $ksql$\int_{0}^{\pi} \sin(x)\,dx$ksql$, 1, $ksql$Bepaal de primitieve van de functie $f(x) = \sin(x)$. De primitieve is $F(x) = -\cos(x)$.$ksql$),
  ('h11_gonio_int', $ksql$\int_{0}^{\pi} \sin(x)\,dx$ksql$, 2, $ksql$Evalueer de primitieve op de bovengrens $\pi$: $F(\pi) = -\cos(\pi) = -(-1) = 1$.$ksql$),
  ('h11_gonio_int', $ksql$\int_{0}^{\pi} \sin(x)\,dx$ksql$, 3, $ksql$Evalueer de primitieve op de ondergrens $0$: $F(0) = -\cos(0) = -(1) = -1$.$ksql$),
  ('h11_gonio_int', $ksql$\int_{0}^{\pi} \sin(x)\,dx$ksql$, 4, $ksql$Bereken het verschil $F(\pi) - F(0)$: $1 - (-1) = 2$.$ksql$),
  ('h11_gonio_int', $ksql$\int_{0}^{\frac{1}{2}\pi} \cos(x)\,dx$ksql$, 1, $ksql$Bepaal de primitieve functie van $\cos(x)$: $\int \cos(x)\,dx = \sin(x) + C$.$ksql$),
  ('h11_gonio_int', $ksql$\int_{0}^{\frac{1}{2}\pi} \cos(x)\,dx$ksql$, 2, $ksql$Evalueer de primitieve functie bij de bovengrens $\frac{1}{2}\pi$: $\sin(\frac{1}{2}\pi) = 1$.$ksql$),
  ('h11_gonio_int', $ksql$\int_{0}^{\frac{1}{2}\pi} \cos(x)\,dx$ksql$, 3, $ksql$Evalueer de primitieve functie bij de ondergrens $0$: $\sin(0) = 0$.$ksql$),
  ('h11_gonio_int', $ksql$\int_{0}^{\frac{1}{2}\pi} \cos(x)\,dx$ksql$, 4, $ksql$Bereken het verschil tussen de waarden bij de bovengrens en de ondergrens: $1 - 0 = 1$.$ksql$),
  -- h11_ketting_int
  ('h11_ketting_int', $ksql$\int_{0}^{1} (2x+1)^{3}\,dx$ksql$, 1, $ksql$Bepaal de primitieve functie van $(2x+1)^3$ met behulp van de regel $\int (ax+b)^n \,dx = \frac{1}{a(n+1)}(ax+b)^{n+1} + C$. Voor $a=2$ en $n=3$ is dit $\frac{1}{2(3+1)}(2x+1)^{3+1} = \frac{1}{8}(2x+1)^4$.$ksql$),
  ('h11_ketting_int', $ksql$\int_{0}^{1} (2x+1)^{3}\,dx$ksql$, 2, $ksql$Evalueer de primitieve functie bij de bovengrens $x=1$: $\frac{1}{8}(2(1)+1)^4 = \frac{1}{8}(3)^4 = \frac{81}{8}$.$ksql$),
  ('h11_ketting_int', $ksql$\int_{0}^{1} (2x+1)^{3}\,dx$ksql$, 3, $ksql$Evalueer de primitieve functie bij de ondergrens $x=0$: $\frac{1}{8}(2(0)+1)^4 = \frac{1}{8}(1)^4 = \frac{1}{8}$.$ksql$),
  ('h11_ketting_int', $ksql$\int_{0}^{1} (2x+1)^{3}\,dx$ksql$, 4, $ksql$Trek de waarde bij de ondergrens af van de waarde bij de bovengrens om de definite integraal te vinden: $\frac{81}{8} - \frac{1}{8} = \frac{80}{8} = 10$.$ksql$),
  ('h11_ketting_int', $ksql$\int_{0}^{1} e^{2x}\,dx$ksql$, 1, $ksql$Bepaal de primitieve van de functie $f(x) = e^{2x}$ met behulp van de regel $\int e^{ax}\,dx = \frac{1}{a}e^{ax} + C$.$ksql$),
  ('h11_ketting_int', $ksql$\int_{0}^{1} e^{2x}\,dx$ksql$, 2, $ksql$Pas deze regel toe om de primitieve te vinden: $\int e^{2x}\,dx = \frac{1}{2}e^{2x} + C$.$ksql$),
  ('h11_ketting_int', $ksql$\int_{0}^{1} e^{2x}\,dx$ksql$, 3, $ksql$Vul de bovengrens ($x=1$) en ondergrens ($x=0$) in de primitieve in en trek deze van elkaar af: $[\frac{1}{2}e^{2x}]_{0}^{1} = \frac{1}{2}e^{2(1)} - \frac{1}{2}e^{2(0)}$.$ksql$),
  ('h11_ketting_int', $ksql$\int_{0}^{1} e^{2x}\,dx$ksql$, 4, $ksql$Vereenvoudig de uitdrukking om het eindantwoord te krijgen: $\frac{1}{2}e^2 - \frac{1}{2}e^0 = \frac{1}{2}e^2 - \frac{1}{2}$.$ksql$)
) AS v(topic_slug, latex_body, step_order, step_description)
JOIN public.topics_new t
  ON t.site = 'integralen' AND t.slug = v.topic_slug
JOIN public.questions_new q
  ON q.topic_id = t.id AND q.latex_body = v.latex_body
ON CONFLICT (question_id, step_order) DO NOTHING;

DO $do$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.site = 'integralen' AND t.slug = 'h11_machten_int';
  IF n <> 11 THEN
    RAISE EXCEPTION 'h11_machten_int hoort 11 stappen te hebben, gevonden %', n;
  END IF;
  SELECT count(*) INTO n
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.site = 'integralen' AND t.slug = 'h11_e_ln_int';
  IF n <> 12 THEN
    RAISE EXCEPTION 'h11_e_ln_int hoort 12 stappen te hebben, gevonden %', n;
  END IF;
  SELECT count(*) INTO n
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.site = 'integralen' AND t.slug = 'h11_gonio_int';
  IF n <> 8 THEN
    RAISE EXCEPTION 'h11_gonio_int hoort 8 stappen te hebben, gevonden %', n;
  END IF;
  SELECT count(*) INTO n
  FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topics_new t ON t.id = q.topic_id
  WHERE t.site = 'integralen' AND t.slug = 'h11_ketting_int';
  IF n <> 8 THEN
    RAISE EXCEPTION 'h11_ketting_int hoort 8 stappen te hebben, gevonden %', n;
  END IF;
END
$do$;

COMMIT;
