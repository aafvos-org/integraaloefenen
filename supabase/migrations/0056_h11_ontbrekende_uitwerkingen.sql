-- =============================================================================
-- Uitwerkingen voor 26 vragen in hoofdstuk 11 die nog geen stappen hadden.
--
-- De vragen staan al in 0024. Dit bestand voegt alleen rijen toe aan
-- question_steps_new. Bestaande rijen blijven staan.
--
--   h11_machten_int   vragen 1, 2 en 3
--   h11_e_ln_int      vragen 2, 4 en 6
--   h11_gonio_int     vragen 3, 4, 5 en 6
--   h11_ketting_int   vragen 3, 4, 5 en 6
--   h11_wortels_int   alle 6 vragen
--   h11_uitdelen_int  alle 6 vragen
--
-- Per vraag vier stappen, genummerd 1 t/m 4, net als de uitwerkingen die er
-- al stonden. Twee keer draaien voegt niets toe: ON CONFLICT DO NOTHING.
-- =============================================================================

BEGIN;

INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT q.id, v.step_order, v.step_description
FROM (VALUES
  -- h11_machten_int, vraag 1
  ('h11_machten_int', $stap$\int_{0}^{2} 3x^{2}\,dx$stap$, 1, $stap$Een primitieve van $f(x) = 3x^{2}$ is $F(x) = x^{3}$.$stap$),
  ('h11_machten_int', $stap$\int_{0}^{2} 3x^{2}\,dx$stap$, 2, $stap$Vul de grenzen in: $F(2) = 2^{3} = 8$ en $F(0) = 0$.$stap$),
  ('h11_machten_int', $stap$\int_{0}^{2} 3x^{2}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $F(2) - F(0) = 8 - 0$.$stap$),
  ('h11_machten_int', $stap$\int_{0}^{2} 3x^{2}\,dx$stap$, 4, $stap$De bepaalde integraal is $8$.$stap$),

  -- h11_machten_int, vraag 2
  ('h11_machten_int', $stap$\int_{1}^{3} 2x\,dx$stap$, 1, $stap$Een primitieve van $f(x) = 2x$ is $F(x) = x^{2}$.$stap$),
  ('h11_machten_int', $stap$\int_{1}^{3} 2x\,dx$stap$, 2, $stap$Vul de grenzen in: $F(3) = 3^{2} = 9$ en $F(1) = 1$.$stap$),
  ('h11_machten_int', $stap$\int_{1}^{3} 2x\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $F(3) - F(1) = 9 - 1$.$stap$),
  ('h11_machten_int', $stap$\int_{1}^{3} 2x\,dx$stap$, 4, $stap$De bepaalde integraal is $8$.$stap$),

  -- h11_machten_int, vraag 3
  ('h11_machten_int', $stap$\int_{0}^{1} (6x^{2} - 4x + 3)\,dx$stap$, 1, $stap$Een primitieve van $f(x) = 6x^{2} - 4x + 3$ is $F(x) = 2x^{3} - 2x^{2} + 3x$.$stap$),
  ('h11_machten_int', $stap$\int_{0}^{1} (6x^{2} - 4x + 3)\,dx$stap$, 2, $stap$Vul de grenzen in: $F(1) = 2 - 2 + 3 = 3$ en $F(0) = 0$.$stap$),
  ('h11_machten_int', $stap$\int_{0}^{1} (6x^{2} - 4x + 3)\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $F(1) - F(0) = 3 - 0$.$stap$),
  ('h11_machten_int', $stap$\int_{0}^{1} (6x^{2} - 4x + 3)\,dx$stap$, 4, $stap$De bepaalde integraal is $3$.$stap$),

  -- h11_e_ln_int, vraag 2
  ('h11_e_ln_int', $stap$\int_{1}^{e} \dfrac{1}{x}\,dx$stap$, 1, $stap$Een primitieve van $f(x) = \dfrac{1}{x}$ is $F(x) = \ln|x|$.$stap$),
  ('h11_e_ln_int', $stap$\int_{1}^{e} \dfrac{1}{x}\,dx$stap$, 2, $stap$Op het interval $[1, e]$ is $x$ positief. Dus $F(e) = \ln(e) = 1$ en $F(1) = \ln(1) = 0$.$stap$),
  ('h11_e_ln_int', $stap$\int_{1}^{e} \dfrac{1}{x}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $F(e) - F(1) = 1 - 0$.$stap$),
  ('h11_e_ln_int', $stap$\int_{1}^{e} \dfrac{1}{x}\,dx$stap$, 4, $stap$De bepaalde integraal is $1$.$stap$),

  -- h11_e_ln_int, vraag 4
  ('h11_e_ln_int', $stap$\int_{1}^{e^{2}} \dfrac{2}{x}\,dx$stap$, 1, $stap$Een primitieve van $f(x) = \dfrac{2}{x}$ is $F(x) = 2\ln|x|$.$stap$),
  ('h11_e_ln_int', $stap$\int_{1}^{e^{2}} \dfrac{2}{x}\,dx$stap$, 2, $stap$Op het interval is $x$ positief. Dus $F(e^{2}) = 2\ln(e^{2}) = 4$ en $F(1) = 2\ln(1) = 0$.$stap$),
  ('h11_e_ln_int', $stap$\int_{1}^{e^{2}} \dfrac{2}{x}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $F(e^{2}) - F(1) = 4 - 0$.$stap$),
  ('h11_e_ln_int', $stap$\int_{1}^{e^{2}} \dfrac{2}{x}\,dx$stap$, 4, $stap$De bepaalde integraal is $4$.$stap$),

  -- h11_e_ln_int, vraag 6
  ('h11_e_ln_int', $stap$\int_{0}^{\ln(3)} e^{x}\,dx$stap$, 1, $stap$Een primitieve van $f(x) = e^{x}$ is $F(x) = e^{x}$.$stap$),
  ('h11_e_ln_int', $stap$\int_{0}^{\ln(3)} e^{x}\,dx$stap$, 2, $stap$Vul de grenzen in: $F(\ln(3)) = e^{\ln(3)} = 3$ en $F(0) = e^{0} = 1$.$stap$),
  ('h11_e_ln_int', $stap$\int_{0}^{\ln(3)} e^{x}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $F(\ln(3)) - F(0) = 3 - 1$.$stap$),
  ('h11_e_ln_int', $stap$\int_{0}^{\ln(3)} e^{x}\,dx$stap$, 4, $stap$De bepaalde integraal is $2$.$stap$),

  -- h11_gonio_int, vraag 3
  ('h11_gonio_int', $stap$\int_{0}^{\pi} (1 + \sin(x))\,dx$stap$, 1, $stap$Een primitieve van $f(x) = 1 + \sin(x)$ is $F(x) = x - \cos(x)$.$stap$),
  ('h11_gonio_int', $stap$\int_{0}^{\pi} (1 + \sin(x))\,dx$stap$, 2, $stap$Vul de grenzen in: $F(\pi) = \pi - \cos(\pi) = \pi + 1$ en $F(0) = 0 - \cos(0) = -1$.$stap$),
  ('h11_gonio_int', $stap$\int_{0}^{\pi} (1 + \sin(x))\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $F(\pi) - F(0) = (\pi + 1) - (-1) = \pi + 2$.$stap$),
  ('h11_gonio_int', $stap$\int_{0}^{\pi} (1 + \sin(x))\,dx$stap$, 4, $stap$De bepaalde integraal is $2 + \pi$.$stap$),

  -- h11_gonio_int, vraag 4
  ('h11_gonio_int', $stap$\int_{0}^{\frac{1}{2}\pi} (2\cos(x) - 1)\,dx$stap$, 1, $stap$Een primitieve van $f(x) = 2\cos(x) - 1$ is $F(x) = 2\sin(x) - x$.$stap$),
  ('h11_gonio_int', $stap$\int_{0}^{\frac{1}{2}\pi} (2\cos(x) - 1)\,dx$stap$, 2, $stap$Vul de grenzen in: $F(\frac{1}{2}\pi) = 2\sin(\frac{1}{2}\pi) - \frac{1}{2}\pi = 2 - \frac{1}{2}\pi$ en $F(0) = 0$.$stap$),
  ('h11_gonio_int', $stap$\int_{0}^{\frac{1}{2}\pi} (2\cos(x) - 1)\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $F(\frac{1}{2}\pi) - F(0) = 2 - \frac{1}{2}\pi$.$stap$),
  ('h11_gonio_int', $stap$\int_{0}^{\frac{1}{2}\pi} (2\cos(x) - 1)\,dx$stap$, 4, $stap$De bepaalde integraal is $2 - \dfrac{\pi}{2}$.$stap$),

  -- h11_gonio_int, vraag 5
  ('h11_gonio_int', $stap$\int_{\frac{1}{4}\pi}^{\frac{3}{4}\pi} \sin(x)\,dx$stap$, 1, $stap$Een primitieve van $f(x) = \sin(x)$ is $F(x) = -\cos(x)$.$stap$),
  ('h11_gonio_int', $stap$\int_{\frac{1}{4}\pi}^{\frac{3}{4}\pi} \sin(x)\,dx$stap$, 2, $stap$Vul de grenzen in: $F(\frac{3}{4}\pi) = -\cos(\frac{3}{4}\pi) = \dfrac{1}{2}\sqrt{2}$ en $F(\frac{1}{4}\pi) = -\cos(\frac{1}{4}\pi) = -\dfrac{1}{2}\sqrt{2}$.$stap$),
  ('h11_gonio_int', $stap$\int_{\frac{1}{4}\pi}^{\frac{3}{4}\pi} \sin(x)\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $\dfrac{1}{2}\sqrt{2} - \left(-\dfrac{1}{2}\sqrt{2}\right) = \sqrt{2}$.$stap$),
  ('h11_gonio_int', $stap$\int_{\frac{1}{4}\pi}^{\frac{3}{4}\pi} \sin(x)\,dx$stap$, 4, $stap$De bepaalde integraal is $\sqrt{2}$.$stap$),

  -- h11_gonio_int, vraag 6
  ('h11_gonio_int', $stap$\int_{0}^{\pi} (\sin(x) + \cos(x))\,dx$stap$, 1, $stap$Een primitieve van $f(x) = \sin(x) + \cos(x)$ is $F(x) = -\cos(x) + \sin(x)$.$stap$),
  ('h11_gonio_int', $stap$\int_{0}^{\pi} (\sin(x) + \cos(x))\,dx$stap$, 2, $stap$Vul de grenzen in: $F(\pi) = -\cos(\pi) + \sin(\pi) = 1$ en $F(0) = -\cos(0) + \sin(0) = -1$.$stap$),
  ('h11_gonio_int', $stap$\int_{0}^{\pi} (\sin(x) + \cos(x))\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $F(\pi) - F(0) = 1 - (-1) = 2$.$stap$),
  ('h11_gonio_int', $stap$\int_{0}^{\pi} (\sin(x) + \cos(x))\,dx$stap$, 4, $stap$De bepaalde integraal is $2$.$stap$),

  -- h11_ketting_int, vraag 3
  ('h11_ketting_int', $stap$\int_{0}^{\frac{1}{2}\pi} \sin(2x)\,dx$stap$, 1, $stap$De kern is $2x$, met afgeleide $2$. Een primitieve van $\sin(2x)$ is $F(x) = -\dfrac{1}{2}\cos(2x)$.$stap$),
  ('h11_ketting_int', $stap$\int_{0}^{\frac{1}{2}\pi} \sin(2x)\,dx$stap$, 2, $stap$Vul de grenzen in: $F(\frac{1}{2}\pi) = -\dfrac{1}{2}\cos(\pi) = \dfrac{1}{2}$ en $F(0) = -\dfrac{1}{2}\cos(0) = -\dfrac{1}{2}$.$stap$),
  ('h11_ketting_int', $stap$\int_{0}^{\frac{1}{2}\pi} \sin(2x)\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $\dfrac{1}{2} - \left(-\dfrac{1}{2}\right) = 1$.$stap$),
  ('h11_ketting_int', $stap$\int_{0}^{\frac{1}{2}\pi} \sin(2x)\,dx$stap$, 4, $stap$De bepaalde integraal is $1$.$stap$),

  -- h11_ketting_int, vraag 4
  ('h11_ketting_int', $stap$\int_{1}^{2} \dfrac{1}{(3x-1)^{2}}\,dx$stap$, 1, $stap$Schrijf de integrand als $(3x-1)^{-2}$. De kern is $3x-1$, met afgeleide $3$. Een primitieve is $F(x) = -\dfrac{1}{3(3x-1)}$.$stap$),
  ('h11_ketting_int', $stap$\int_{1}^{2} \dfrac{1}{(3x-1)^{2}}\,dx$stap$, 2, $stap$Vul de grenzen in: $F(2) = -\dfrac{1}{3 \cdot 5} = -\dfrac{1}{15}$ en $F(1) = -\dfrac{1}{3 \cdot 2} = -\dfrac{1}{6}$.$stap$),
  ('h11_ketting_int', $stap$\int_{1}^{2} \dfrac{1}{(3x-1)^{2}}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $-\dfrac{1}{15} - \left(-\dfrac{1}{6}\right) = -\dfrac{2}{30} + \dfrac{5}{30} = \dfrac{3}{30}$.$stap$),
  ('h11_ketting_int', $stap$\int_{1}^{2} \dfrac{1}{(3x-1)^{2}}\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{1}{10}$.$stap$),

  -- h11_ketting_int, vraag 5
  ('h11_ketting_int', $stap$\int_{0}^{4} \sqrt{2x+1}\,dx$stap$, 1, $stap$Schrijf $\sqrt{2x+1} = (2x+1)^{1/2}$. De kern is $2x+1$, met afgeleide $2$. Een primitieve is $F(x) = \dfrac{1}{3}(2x+1)^{3/2}$.$stap$),
  ('h11_ketting_int', $stap$\int_{0}^{4} \sqrt{2x+1}\,dx$stap$, 2, $stap$Vul de grenzen in: $F(4) = \dfrac{1}{3} \cdot 9^{3/2} = 9$ en $F(0) = \dfrac{1}{3}$.$stap$),
  ('h11_ketting_int', $stap$\int_{0}^{4} \sqrt{2x+1}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $9 - \dfrac{1}{3} = \dfrac{26}{3}$.$stap$),
  ('h11_ketting_int', $stap$\int_{0}^{4} \sqrt{2x+1}\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{26}{3}$.$stap$),

  -- h11_ketting_int, vraag 6
  ('h11_ketting_int', $stap$\int_{0}^{1} e^{3x}\,dx$stap$, 1, $stap$De kern is $3x$, met afgeleide $3$. Een primitieve van $e^{3x}$ is $F(x) = \dfrac{1}{3}e^{3x}$.$stap$),
  ('h11_ketting_int', $stap$\int_{0}^{1} e^{3x}\,dx$stap$, 2, $stap$Vul de grenzen in: $F(1) = \dfrac{1}{3}e^{3}$ en $F(0) = \dfrac{1}{3}$.$stap$),
  ('h11_ketting_int', $stap$\int_{0}^{1} e^{3x}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $\dfrac{1}{3}e^{3} - \dfrac{1}{3}$.$stap$),
  ('h11_ketting_int', $stap$\int_{0}^{1} e^{3x}\,dx$stap$, 4, $stap$De bepaalde integraal is $-\dfrac{1}{3} + \dfrac{e^{3}}{3}$.$stap$),

  -- h11_wortels_int, vraag 1
  ('h11_wortels_int', $stap$\int_{1}^{4} \sqrt{x}\,dx$stap$, 1, $stap$Schrijf $\sqrt{x} = x^{1/2}$. Een primitieve is $F(x) = \dfrac{2}{3}x^{3/2}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{4} \sqrt{x}\,dx$stap$, 2, $stap$Vul de grenzen in: $F(4) = \dfrac{2}{3} \cdot 8 = \dfrac{16}{3}$ en $F(1) = \dfrac{2}{3}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{4} \sqrt{x}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $\dfrac{16}{3} - \dfrac{2}{3} = \dfrac{14}{3}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{4} \sqrt{x}\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{14}{3}$.$stap$),

  -- h11_wortels_int, vraag 2
  ('h11_wortels_int', $stap$\int_{1}^{2} \dfrac{1}{x^{2}}\,dx$stap$, 1, $stap$Schrijf $\dfrac{1}{x^{2}} = x^{-2}$. Een primitieve is $F(x) = -\dfrac{1}{x}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{2} \dfrac{1}{x^{2}}\,dx$stap$, 2, $stap$Vul de grenzen in: $F(2) = -\dfrac{1}{2}$ en $F(1) = -1$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{2} \dfrac{1}{x^{2}}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $-\dfrac{1}{2} - (-1) = \dfrac{1}{2}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{2} \dfrac{1}{x^{2}}\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{1}{2}$.$stap$),

  -- h11_wortels_int, vraag 3
  ('h11_wortels_int', $stap$\int_{1}^{9} \sqrt{x}\,dx$stap$, 1, $stap$Schrijf $\sqrt{x} = x^{1/2}$. Een primitieve is $F(x) = \dfrac{2}{3}x^{3/2}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{9} \sqrt{x}\,dx$stap$, 2, $stap$Vul de grenzen in: $F(9) = \dfrac{2}{3} \cdot 27 = 18$ en $F(1) = \dfrac{2}{3}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{9} \sqrt{x}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $18 - \dfrac{2}{3} = \dfrac{52}{3}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{9} \sqrt{x}\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{52}{3}$.$stap$),

  -- h11_wortels_int, vraag 4
  ('h11_wortels_int', $stap$\int_{1}^{4} \left(\sqrt{x} + \dfrac{1}{x^{2}}\right)\,dx$stap$, 1, $stap$Schrijf de integrand als $x^{1/2} + x^{-2}$. Een primitieve is $F(x) = \dfrac{2}{3}x^{3/2} - \dfrac{1}{x}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{4} \left(\sqrt{x} + \dfrac{1}{x^{2}}\right)\,dx$stap$, 2, $stap$Vul de grenzen in: $F(4) = \dfrac{16}{3} - \dfrac{1}{4} = \dfrac{61}{12}$ en $F(1) = \dfrac{2}{3} - 1 = -\dfrac{1}{3}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{4} \left(\sqrt{x} + \dfrac{1}{x^{2}}\right)\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $\dfrac{61}{12} - \left(-\dfrac{1}{3}\right) = \dfrac{65}{12}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{4} \left(\sqrt{x} + \dfrac{1}{x^{2}}\right)\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{65}{12}$.$stap$),

  -- h11_wortels_int, vraag 5
  ('h11_wortels_int', $stap$\int_{0}^{4} x\sqrt{x}\,dx$stap$, 1, $stap$Schrijf $x\sqrt{x} = x^{3/2}$. Een primitieve is $F(x) = \dfrac{2}{5}x^{5/2}$.$stap$),
  ('h11_wortels_int', $stap$\int_{0}^{4} x\sqrt{x}\,dx$stap$, 2, $stap$Vul de grenzen in: $F(4) = \dfrac{2}{5} \cdot 32 = \dfrac{64}{5}$ en $F(0) = 0$.$stap$),
  ('h11_wortels_int', $stap$\int_{0}^{4} x\sqrt{x}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $\dfrac{64}{5} - 0 = \dfrac{64}{5}$.$stap$),
  ('h11_wortels_int', $stap$\int_{0}^{4} x\sqrt{x}\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{64}{5}$.$stap$),

  -- h11_wortels_int, vraag 6
  ('h11_wortels_int', $stap$\int_{1}^{4} \dfrac{3}{x^{4}}\,dx$stap$, 1, $stap$Schrijf $\dfrac{3}{x^{4}} = 3x^{-4}$. Een primitieve is $F(x) = -\dfrac{1}{x^{3}}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{4} \dfrac{3}{x^{4}}\,dx$stap$, 2, $stap$Vul de grenzen in: $F(4) = -\dfrac{1}{64}$ en $F(1) = -1$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{4} \dfrac{3}{x^{4}}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $-\dfrac{1}{64} - (-1) = \dfrac{63}{64}$.$stap$),
  ('h11_wortels_int', $stap$\int_{1}^{4} \dfrac{3}{x^{4}}\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{63}{64}$.$stap$),

  -- h11_uitdelen_int, vraag 1
  ('h11_uitdelen_int', $stap$\int_{1}^{2} \dfrac{x^{2}+1}{x}\,dx$stap$, 1, $stap$Deel de teller door de noemer: $\dfrac{x^{2}+1}{x} = x + \dfrac{1}{x}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{2} \dfrac{x^{2}+1}{x}\,dx$stap$, 2, $stap$Een primitieve is $F(x) = \dfrac{1}{2}x^{2} + \ln|x|$. Op $[1, 2]$ geldt $F(2) = 2 + \ln(2)$ en $F(1) = \dfrac{1}{2}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{2} \dfrac{x^{2}+1}{x}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $2 + \ln(2) - \dfrac{1}{2} = \dfrac{3}{2} + \ln(2)$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{2} \dfrac{x^{2}+1}{x}\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{3}{2} + \ln(2)$.$stap$),

  -- h11_uitdelen_int, vraag 2
  ('h11_uitdelen_int', $stap$\int_{1}^{2} \dfrac{x^{2}+4}{x^{2}}\,dx$stap$, 1, $stap$Deel de teller door de noemer: $\dfrac{x^{2}+4}{x^{2}} = 1 + \dfrac{4}{x^{2}}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{2} \dfrac{x^{2}+4}{x^{2}}\,dx$stap$, 2, $stap$Een primitieve is $F(x) = x - \dfrac{4}{x}$. Dan is $F(2) = 0$ en $F(1) = -3$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{2} \dfrac{x^{2}+4}{x^{2}}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $0 - (-3) = 3$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{2} \dfrac{x^{2}+4}{x^{2}}\,dx$stap$, 4, $stap$De bepaalde integraal is $3$.$stap$),

  -- h11_uitdelen_int, vraag 3
  ('h11_uitdelen_int', $stap$\int_{1}^{4} \dfrac{x+1}{\sqrt{x}}\,dx$stap$, 1, $stap$Deel de teller door de noemer: $\dfrac{x+1}{\sqrt{x}} = x^{1/2} + x^{-1/2}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{4} \dfrac{x+1}{\sqrt{x}}\,dx$stap$, 2, $stap$Een primitieve is $F(x) = \dfrac{2}{3}x^{3/2} + 2x^{1/2}$. Dan is $F(4) = \dfrac{28}{3}$ en $F(1) = \dfrac{8}{3}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{4} \dfrac{x+1}{\sqrt{x}}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $\dfrac{28}{3} - \dfrac{8}{3} = \dfrac{20}{3}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{4} \dfrac{x+1}{\sqrt{x}}\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{20}{3}$.$stap$),

  -- h11_uitdelen_int, vraag 4
  ('h11_uitdelen_int', $stap$\int_{1}^{3} \dfrac{2x^{3} + 1}{x^{2}}\,dx$stap$, 1, $stap$Deel de teller door de noemer: $\dfrac{2x^{3} + 1}{x^{2}} = 2x + \dfrac{1}{x^{2}}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{3} \dfrac{2x^{3} + 1}{x^{2}}\,dx$stap$, 2, $stap$Een primitieve is $F(x) = x^{2} - \dfrac{1}{x}$. Dan is $F(3) = \dfrac{26}{3}$ en $F(1) = 0$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{3} \dfrac{2x^{3} + 1}{x^{2}}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $\dfrac{26}{3} - 0 = \dfrac{26}{3}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{3} \dfrac{2x^{3} + 1}{x^{2}}\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{26}{3}$.$stap$),

  -- h11_uitdelen_int, vraag 5
  ('h11_uitdelen_int', $stap$\int_{1}^{2} \dfrac{x^{4}-1}{x^{2}}\,dx$stap$, 1, $stap$Deel de teller door de noemer: $\dfrac{x^{4}-1}{x^{2}} = x^{2} - \dfrac{1}{x^{2}}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{2} \dfrac{x^{4}-1}{x^{2}}\,dx$stap$, 2, $stap$Een primitieve is $F(x) = \dfrac{1}{3}x^{3} + \dfrac{1}{x}$. Dan is $F(2) = \dfrac{19}{6}$ en $F(1) = \dfrac{4}{3}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{2} \dfrac{x^{4}-1}{x^{2}}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $\dfrac{19}{6} - \dfrac{8}{6} = \dfrac{11}{6}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{2} \dfrac{x^{4}-1}{x^{2}}\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{11}{6}$.$stap$),

  -- h11_uitdelen_int, vraag 6
  ('h11_uitdelen_int', $stap$\int_{1}^{4} \dfrac{2x+3}{x^{3}}\,dx$stap$, 1, $stap$Deel de teller door de noemer: $\dfrac{2x+3}{x^{3}} = \dfrac{2}{x^{2}} + \dfrac{3}{x^{3}}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{4} \dfrac{2x+3}{x^{3}}\,dx$stap$, 2, $stap$Een primitieve is $F(x) = -\dfrac{2}{x} - \dfrac{3}{2x^{2}}$. Dan is $F(4) = -\dfrac{19}{32}$ en $F(1) = -\dfrac{7}{2}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{4} \dfrac{2x+3}{x^{3}}\,dx$stap$, 3, $stap$Trek de ondergrens af van de bovengrens: $-\dfrac{19}{32} - \left(-\dfrac{7}{2}\right) = \dfrac{93}{32}$.$stap$),
  ('h11_uitdelen_int', $stap$\int_{1}^{4} \dfrac{2x+3}{x^{3}}\,dx$stap$, 4, $stap$De bepaalde integraal is $\dfrac{93}{32}$.$stap$)
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
  JOIN (VALUES
    ('h11_machten_int', $chk$\int_{0}^{2} 3x^{2}\,dx$chk$),
    ('h11_machten_int', $chk$\int_{1}^{3} 2x\,dx$chk$),
    ('h11_machten_int', $chk$\int_{0}^{1} (6x^{2} - 4x + 3)\,dx$chk$),
    ('h11_e_ln_int', $chk$\int_{1}^{e} \dfrac{1}{x}\,dx$chk$),
    ('h11_e_ln_int', $chk$\int_{1}^{e^{2}} \dfrac{2}{x}\,dx$chk$),
    ('h11_e_ln_int', $chk$\int_{0}^{\ln(3)} e^{x}\,dx$chk$),
    ('h11_gonio_int', $chk$\int_{0}^{\pi} (1 + \sin(x))\,dx$chk$),
    ('h11_gonio_int', $chk$\int_{0}^{\frac{1}{2}\pi} (2\cos(x) - 1)\,dx$chk$),
    ('h11_gonio_int', $chk$\int_{\frac{1}{4}\pi}^{\frac{3}{4}\pi} \sin(x)\,dx$chk$),
    ('h11_gonio_int', $chk$\int_{0}^{\pi} (\sin(x) + \cos(x))\,dx$chk$),
    ('h11_ketting_int', $chk$\int_{0}^{\frac{1}{2}\pi} \sin(2x)\,dx$chk$),
    ('h11_ketting_int', $chk$\int_{1}^{2} \dfrac{1}{(3x-1)^{2}}\,dx$chk$),
    ('h11_ketting_int', $chk$\int_{0}^{4} \sqrt{2x+1}\,dx$chk$),
    ('h11_ketting_int', $chk$\int_{0}^{1} e^{3x}\,dx$chk$),
    ('h11_wortels_int', $chk$\int_{1}^{4} \sqrt{x}\,dx$chk$),
    ('h11_wortels_int', $chk$\int_{1}^{2} \dfrac{1}{x^{2}}\,dx$chk$),
    ('h11_wortels_int', $chk$\int_{1}^{9} \sqrt{x}\,dx$chk$),
    ('h11_wortels_int', $chk$\int_{1}^{4} \left(\sqrt{x} + \dfrac{1}{x^{2}}\right)\,dx$chk$),
    ('h11_wortels_int', $chk$\int_{0}^{4} x\sqrt{x}\,dx$chk$),
    ('h11_wortels_int', $chk$\int_{1}^{4} \dfrac{3}{x^{4}}\,dx$chk$),
    ('h11_uitdelen_int', $chk$\int_{1}^{2} \dfrac{x^{2}+1}{x}\,dx$chk$),
    ('h11_uitdelen_int', $chk$\int_{1}^{2} \dfrac{x^{2}+4}{x^{2}}\,dx$chk$),
    ('h11_uitdelen_int', $chk$\int_{1}^{4} \dfrac{x+1}{\sqrt{x}}\,dx$chk$),
    ('h11_uitdelen_int', $chk$\int_{1}^{3} \dfrac{2x^{3} + 1}{x^{2}}\,dx$chk$),
    ('h11_uitdelen_int', $chk$\int_{1}^{2} \dfrac{x^{4}-1}{x^{2}}\,dx$chk$),
    ('h11_uitdelen_int', $chk$\int_{1}^{4} \dfrac{2x+3}{x^{3}}\,dx$chk$)
  ) AS v(topic_slug, latex_body)
    ON t.site = 'integralen'
   AND t.slug = v.topic_slug
   AND q.latex_body = v.latex_body;
  IF n <> 104 THEN
    RAISE EXCEPTION 'Deze 26 vragen horen samen 104 stappen te hebben, gevonden %', n;
  END IF;

  SELECT count(*) INTO n
  FROM (VALUES
    ('h11_machten_int', $chk$\int_{0}^{2} 3x^{2}\,dx$chk$),
    ('h11_machten_int', $chk$\int_{1}^{3} 2x\,dx$chk$),
    ('h11_machten_int', $chk$\int_{0}^{1} (6x^{2} - 4x + 3)\,dx$chk$),
    ('h11_e_ln_int', $chk$\int_{1}^{e} \dfrac{1}{x}\,dx$chk$),
    ('h11_e_ln_int', $chk$\int_{1}^{e^{2}} \dfrac{2}{x}\,dx$chk$),
    ('h11_e_ln_int', $chk$\int_{0}^{\ln(3)} e^{x}\,dx$chk$),
    ('h11_gonio_int', $chk$\int_{0}^{\pi} (1 + \sin(x))\,dx$chk$),
    ('h11_gonio_int', $chk$\int_{0}^{\frac{1}{2}\pi} (2\cos(x) - 1)\,dx$chk$),
    ('h11_gonio_int', $chk$\int_{\frac{1}{4}\pi}^{\frac{3}{4}\pi} \sin(x)\,dx$chk$),
    ('h11_gonio_int', $chk$\int_{0}^{\pi} (\sin(x) + \cos(x))\,dx$chk$),
    ('h11_ketting_int', $chk$\int_{0}^{\frac{1}{2}\pi} \sin(2x)\,dx$chk$),
    ('h11_ketting_int', $chk$\int_{1}^{2} \dfrac{1}{(3x-1)^{2}}\,dx$chk$),
    ('h11_ketting_int', $chk$\int_{0}^{4} \sqrt{2x+1}\,dx$chk$),
    ('h11_ketting_int', $chk$\int_{0}^{1} e^{3x}\,dx$chk$),
    ('h11_wortels_int', $chk$\int_{1}^{4} \sqrt{x}\,dx$chk$),
    ('h11_wortels_int', $chk$\int_{1}^{2} \dfrac{1}{x^{2}}\,dx$chk$),
    ('h11_wortels_int', $chk$\int_{1}^{9} \sqrt{x}\,dx$chk$),
    ('h11_wortels_int', $chk$\int_{1}^{4} \left(\sqrt{x} + \dfrac{1}{x^{2}}\right)\,dx$chk$),
    ('h11_wortels_int', $chk$\int_{0}^{4} x\sqrt{x}\,dx$chk$),
    ('h11_wortels_int', $chk$\int_{1}^{4} \dfrac{3}{x^{4}}\,dx$chk$),
    ('h11_uitdelen_int', $chk$\int_{1}^{2} \dfrac{x^{2}+1}{x}\,dx$chk$),
    ('h11_uitdelen_int', $chk$\int_{1}^{2} \dfrac{x^{2}+4}{x^{2}}\,dx$chk$),
    ('h11_uitdelen_int', $chk$\int_{1}^{4} \dfrac{x+1}{\sqrt{x}}\,dx$chk$),
    ('h11_uitdelen_int', $chk$\int_{1}^{3} \dfrac{2x^{3} + 1}{x^{2}}\,dx$chk$),
    ('h11_uitdelen_int', $chk$\int_{1}^{2} \dfrac{x^{4}-1}{x^{2}}\,dx$chk$),
    ('h11_uitdelen_int', $chk$\int_{1}^{4} \dfrac{2x+3}{x^{3}}\,dx$chk$)
  ) AS v(topic_slug, latex_body)
  JOIN public.topics_new t
    ON t.site = 'integralen' AND t.slug = v.topic_slug
  JOIN public.questions_new q
    ON q.topic_id = t.id AND q.latex_body = v.latex_body
  WHERE (
    SELECT count(*) FROM public.question_steps_new s WHERE s.question_id = q.id
  ) = 4;
  IF n <> 26 THEN
    RAISE EXCEPTION 'Elk van de 26 vragen hoort 4 stappen te hebben, kloppend gevonden %', n;
  END IF;
END
$do$;

COMMIT;
