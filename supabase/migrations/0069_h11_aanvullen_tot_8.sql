-- =============================================================================
-- Migration 0069: H11 aanvullen tot minstens 8 vragen per soort
-- =============================================================================
-- Elke soort som in hoofdstuk 11 had 6 vragen. Een soort telt pas als
-- beheerst na drie goed op rij, dus bij 6 vragen krijgt een leerling al
-- snel dezelfde opnieuw. Per soort komen er twee eigen varianten bij,
-- oplopend van middelmatig naar lastiger.
--
-- Alleen toevoegen. Twee keer draaien voegt niets dubbel toe.
-- Geen letterlijke boekopgaven. Antwoorden nagerekend door terug te
-- differentiëren of de grenzen in te vullen.
--
--   • 27 clusters, elk van 6 naar 8 vragen
--   • 54 nieuwe vragen, elk met stap 0 t/m 3 (216 stappen)
-- =============================================================================

BEGIN;

INSERT INTO public.questions_new
  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, order_index, is_ai_generated, answer_alternatives)
SELECT 'integralen', t.id, cl.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, v.order_index, false, v.alternatives
FROM (VALUES
  ($h11$h11_machtsfuncties$h11$, $h11$standaard_machten$h11$, $h11$f(x) = 4x^{3} - 6x + 5$h11$, $h11$x^4 - 3x^2 + 5x + c$h11$, $h11$x^{4} - 3x^{2} + 5x + c$h11$, 2, 7, ARRAY[$h11$F(x) = x^4 - 3x^2 + 5x + c$h11$]::text[]),
  ($h11$h11_machtsfuncties$h11$, $h11$standaard_machten$h11$, $h11$f(x) = 6x^{5} - 9x^{2} + 4$h11$, $h11$x^6 - 3x^3 + 4x + c$h11$, $h11$x^{6} - 3x^{3} + 4x + c$h11$, 3, 8, ARRAY[$h11$F(x) = x^6 - 3x^3 + 4x + c$h11$]::text[]),
  ($h11$h11_wortels_breuken$h11$, $h11$wortels_en_neg_machten$h11$, $h11$f(x) = \dfrac{1}{\sqrt{x}}$h11$, $h11$2 sqrt(x) + c$h11$, $h11$2\sqrt{x} + c$h11$, 2, 7, ARRAY[$h11$F(x) = 2sqrt(x) + c$h11$, $h11$2*x^(1/2) + c$h11$]::text[]),
  ($h11$h11_wortels_breuken$h11$, $h11$wortels_en_neg_machten$h11$, $h11$f(x) = \dfrac{4}{x^{3}} + 3\sqrt{x}$h11$, $h11$-2/x^2 + 2x sqrt(x) + c$h11$, $h11$-\dfrac{2}{x^{2}} + 2x\sqrt{x} + c$h11$, 3, 8, ARRAY[$h11$F(x) = -2/x^2 + 2x*sqrt(x) + c$h11$, $h11$-2*x^(-2) + 2*x^(3/2) + c$h11$]::text[]),
  ($h11$h11_e_machten$h11$, $h11$e_en_g_machten$h11$, $h11$f(x) = 4e^{x} + 2^{x}$h11$, $h11$4e^x + 2^x/ln(2) + c$h11$, $h11$4e^{x} + \dfrac{2^{x}}{\ln(2)} + c$h11$, 2, 7, ARRAY[$h11$F(x) = 4e^x + 2^x/ln(2) + c$h11$, $h11$4*e^x + (2^x)/ln(2) + c$h11$]::text[]),
  ($h11$h11_e_machten$h11$, $h11$e_en_g_machten$h11$, $h11$f(x) = 5^{x} - 3$h11$, $h11$5^x/ln(5) - 3x + c$h11$, $h11$\dfrac{5^{x}}{\ln(5)} - 3x + c$h11$, 3, 8, ARRAY[$h11$F(x) = 5^x/ln(5) - 3x + c$h11$, $h11$(5^x)/ln(5) - 3*x + c$h11$]::text[]),
  ($h11$h11_logaritmes$h11$, $h11$ln_en_glog$h11$, $h11$f(x) = \dfrac{5}{x} + 2$h11$, $h11$5 ln|x| + 2x + c$h11$, $h11$5\ln|x| + 2x + c$h11$, 2, 7, ARRAY[$h11$F(x) = 5ln|x| + 2x + c$h11$, $h11$5*ln(abs(x)) + 2*x + c$h11$]::text[]),
  ($h11$h11_logaritmes$h11$, $h11$ln_en_glog$h11$, $h11$f(x) = {}^{4}\!\log(x)$h11$, $h11$(x ln(x) - x)/ln(4) + c$h11$, $h11$\dfrac{x\ln(x) - x}{\ln(4)} + c$h11$, 3, 8, ARRAY[$h11$F(x) = (x*ln(x) - x)/ln(4) + c$h11$, $h11$(x*ln(x)-x)/ln(4) + c$h11$]::text[]),
  ($h11$h11_goniometrie$h11$, $h11$sin_cos_primitiveren$h11$, $h11$f(x) = 4\cos(x) - 2$h11$, $h11$4 sin(x) - 2x + c$h11$, $h11$4\sin(x) - 2x + c$h11$, 2, 7, ARRAY[$h11$F(x) = 4sin(x) - 2x + c$h11$]::text[]),
  ($h11$h11_goniometrie$h11$, $h11$sin_cos_primitiveren$h11$, $h11$f(x) = x + \sin(x) - \cos(x)$h11$, $h11$x^2/2 - cos(x) - sin(x) + c$h11$, $h11$\dfrac{1}{2}x^{2} - \cos(x) - \sin(x) + c$h11$, 3, 8, ARRAY[$h11$F(x) = x^2/2 - cos(x) - sin(x) + c$h11$, $h11$(1/2)*x^2 - cos(x) - sin(x) + c$h11$]::text[]),
  ($h11$h11_lineaire_ketting$h11$, $h11$f_ax_plus_b$h11$, $h11$f(x) = (4x + 1)^{3}$h11$, $h11$(4x+1)^4/16 + c$h11$, $h11$\dfrac{(4x + 1)^{4}}{16} + c$h11$, 2, 7, ARRAY[$h11$F(x) = (4x+1)^4/16 + c$h11$, $h11$((4x+1)^4)/16 + c$h11$]::text[]),
  ($h11$h11_lineaire_ketting$h11$, $h11$f_ax_plus_b$h11$, $h11$f(x) = e^{3x - 2}$h11$, $h11$e^(3x-2)/3 + c$h11$, $h11$\dfrac{e^{3x - 2}}{3} + c$h11$, 3, 8, ARRAY[$h11$F(x) = e^(3x-2)/3 + c$h11$, $h11$exp(3x-2)/3 + c$h11$]::text[]),
  ($h11$h11_uitdelen$h11$, $h11$breuk_uitdelen$h11$, $h11$f(x) = \dfrac{x^{3} + 5}{x}$h11$, $h11$x^3/3 + 5 ln|x| + c$h11$, $h11$\dfrac{1}{3}x^{3} + 5\ln|x| + c$h11$, 2, 7, ARRAY[$h11$F(x) = x^3/3 + 5ln|x| + c$h11$, $h11$(1/3)*x^3 + 5*ln(abs(x)) + c$h11$]::text[]),
  ($h11$h11_uitdelen$h11$, $h11$breuk_uitdelen$h11$, $h11$f(x) = \dfrac{2x^{3} - x + 4}{x^{2}}$h11$, $h11$x^2 - ln|x| - 4/x + c$h11$, $h11$x^{2} - \ln|x| - \dfrac{4}{x} + c$h11$, 3, 8, ARRAY[$h11$F(x) = x^2 - ln|x| - 4/x + c$h11$, $h11$x^2 - ln(abs(x)) - 4*x^(-1) + c$h11$]::text[]),
  ($h11$h11_aantonen$h11$, $h11$toon_aan_primitieve$h11$, $h11$Toon aan dat $F(x) = 3x^{2} - 5x$ een primitieve is van $f(x) = 6x - 5$.$h11$, $h11$F'(x) = 6x - 5 = f(x)$h11$, $h11$F'(x) = 6x - 5 = f(x)$h11$, 2, 7, ARRAY[$h11$F'(x) = 6x-5 = f(x)$h11$, $h11$6x - 5$h11$]::text[]),
  ($h11$h11_aantonen$h11$, $h11$toon_aan_primitieve$h11$, $h11$Toon aan dat $F(x) = (2x + 1)^{4}$ een primitieve is van $f(x) = 8(2x + 1)^{3}$.$h11$, $h11$F'(x) = 8(2x+1)^3 = f(x)$h11$, $h11$F'(x) = 8(2x + 1)^{3} = f(x)$h11$, 3, 8, ARRAY[$h11$F'(x) = 8*(2x+1)^3 = f(x)$h11$]::text[]),
  ($h11$h11_beginvoorwaarde$h11$, $h11$c_bepalen$h11$, $h11$$f(x) = 6x^{2} - 2$. De grafiek van een primitieve $F$ gaat door het punt $(1, 4)$. Bereken $F(x)$.$h11$, $h11$F(x) = 2x^3 - 2x + 4$h11$, $h11$F(x) = 2x^{3} - 2x + 4$h11$, 2, 7, ARRAY[$h11$2x^3 - 2x + 4$h11$, $h11$F(x) = 2*x^3 - 2*x + 4$h11$]::text[]),
  ($h11$h11_beginvoorwaarde$h11$, $h11$c_bepalen$h11$, $h11$$f(x) = e^{2x}$. De grafiek van een primitieve $F$ gaat door het punt $(0, 5)$. Bereken $F(x)$.$h11$, $h11$F(x) = e^(2x)/2 + 9/2$h11$, $h11$F(x) = \dfrac{1}{2}e^{2x} + \dfrac{9}{2}$h11$, 3, 8, ARRAY[$h11$e^(2x)/2 + 9/2$h11$, $h11$F(x) = (1/2)*e^(2x) + 9/2$h11$, $h11$(1/2)e^(2x) + 4,5$h11$]::text[]),
  ($h11$h11_machten_int$h11$, $h11$machten_integraal$h11$, $h11$\int_{0}^{2} (4x + 1)\,dx$h11$, $h11$10$h11$, $h11$10$h11$, 2, 7, '{}'::text[]),
  ($h11$h11_machten_int$h11$, $h11$machten_integraal$h11$, $h11$\int_{-1}^{2} (3x^{2} - 2x)\,dx$h11$, $h11$6$h11$, $h11$6$h11$, 3, 8, '{}'::text[]),
  ($h11$h11_wortels_int$h11$, $h11$wortels_breuken_integraal$h11$, $h11$\int_{1}^{4} \dfrac{2}{\sqrt{x}}\,dx$h11$, $h11$4$h11$, $h11$4$h11$, 2, 7, '{}'::text[]),
  ($h11$h11_wortels_int$h11$, $h11$wortels_breuken_integraal$h11$, $h11$\int_{1}^{9} \left(\sqrt{x} + 1\right)\,dx$h11$, $h11$76/3$h11$, $h11$\dfrac{76}{3}$h11$, 3, 8, ARRAY[$h11$(76)/(3)$h11$]::text[]),
  ($h11$h11_e_ln_int$h11$, $h11$e_ln_integraal$h11$, $h11$\int_{0}^{\ln(2)} 4e^{x}\,dx$h11$, $h11$4$h11$, $h11$4$h11$, 2, 7, '{}'::text[]),
  ($h11$h11_e_ln_int$h11$, $h11$e_ln_integraal$h11$, $h11$\int_{1}^{e^{2}} \left(\dfrac{1}{x} + 1\right)\,dx$h11$, $h11$1 + e^2$h11$, $h11$1 + e^{2}$h11$, 3, 8, ARRAY[$h11$e^2 + 1$h11$, $h11$1+e^2$h11$]::text[]),
  ($h11$h11_gonio_int$h11$, $h11$gonio_integraal$h11$, $h11$\int_{0}^{\frac{1}{2}\pi} 2\sin(x)\,dx$h11$, $h11$2$h11$, $h11$2$h11$, 2, 7, '{}'::text[]),
  ($h11$h11_gonio_int$h11$, $h11$gonio_integraal$h11$, $h11$\int_{\frac{1}{6}\pi}^{\frac{1}{3}\pi} \cos(x)\,dx$h11$, $h11$(sqrt(3) - 1)/2$h11$, $h11$\dfrac{\sqrt{3} - 1}{2}$h11$, 3, 8, ARRAY[$h11$(sqrt(3)-1)/2$h11$, $h11$sqrt(3)/2 - 1/2$h11$]::text[]),
  ($h11$h11_ketting_int$h11$, $h11$kettingregel_integraal$h11$, $h11$\int_{0}^{1} (4x + 1)^{2}\,dx$h11$, $h11$31/3$h11$, $h11$\dfrac{31}{3}$h11$, 2, 7, ARRAY[$h11$(31)/(3)$h11$]::text[]),
  ($h11$h11_ketting_int$h11$, $h11$kettingregel_integraal$h11$, $h11$\int_{0}^{1} e^{5x}\,dx$h11$, $h11$(e^5 - 1)/5$h11$, $h11$\dfrac{e^{5} - 1}{5}$h11$, 3, 8, ARRAY[$h11$(exp(5) - 1)/5$h11$, $h11$e^5/5 - 1/5$h11$]::text[]),
  ($h11$h11_uitdelen_int$h11$, $h11$uitdelen_integraal$h11$, $h11$\int_{1}^{e} \dfrac{x^{2} + 1}{x}\,dx$h11$, $h11$(e^2 + 1)/2$h11$, $h11$\dfrac{e^{2} + 1}{2}$h11$, 2, 7, ARRAY[$h11$(1 + e^2)/2$h11$, $h11$e^2/2 + 1/2$h11$]::text[]),
  ($h11$h11_uitdelen_int$h11$, $h11$uitdelen_integraal$h11$, $h11$\int_{1}^{4} \dfrac{x + 4}{\sqrt{x}}\,dx$h11$, $h11$38/3$h11$, $h11$\dfrac{38}{3}$h11$, 3, 8, ARRAY[$h11$(38)/(3)$h11$]::text[]),
  ($h11$h11_subst_ex$h11$, $h11$substitutie_ex$h11$, $h11$Los exact op: $e^{2x} - 6e^{x} + 8 = 0$$h11$, $h11$x = ln(2) of x = ln(4)$h11$, $h11$x = \ln(2) \vee x = \ln(4)$h11$, 2, 7, ARRAY[$h11$x = ln(4) of x = ln(2)$h11$, $h11$x = ln(2) of x = 2ln(2)$h11$, $h11$ln(2) of ln(4)$h11$]::text[]),
  ($h11$h11_subst_ex$h11$, $h11$substitutie_ex$h11$, $h11$Los exact op: $2e^{2x} - 7e^{x} + 3 = 0$$h11$, $h11$x = ln(1/2) of x = ln(3)$h11$, $h11$x = \ln\left(\dfrac{1}{2}\right) \vee x = \ln(3)$h11$, 3, 8, ARRAY[$h11$x = ln(3) of x = ln(1/2)$h11$, $h11$x = -ln(2) of x = ln(3)$h11$, $h11$x = ln(3) of x = -ln(2)$h11$]::text[]),
  ($h11$h11_subst_px$h11$, $h11$substitutie_px$h11$, $h11$Los exact op: $x^{4} - 17x^{2} + 16 = 0$$h11$, $h11$x = -4, -1, 1 of 4$h11$, $h11$x = -4 \vee x = -1 \vee x = 1 \vee x = 4$h11$, 2, 7, ARRAY[$h11$x = -4 of x = -1 of x = 1 of x = 4$h11$, $h11$x = ±1 of x = ±4$h11$]::text[]),
  ($h11$h11_subst_px$h11$, $h11$substitutie_px$h11$, $h11$Los exact op: $x^{4} - 5x^{2} - 36 = 0$$h11$, $h11$x = -3 of x = 3$h11$, $h11$x = -3 \vee x = 3$h11$, 3, 8, ARRAY[$h11$x = 3 of x = -3$h11$, $h11$x = ±3$h11$]::text[]),
  ($h11$h11_ln_nemen$h11$, $h11$ln_nemen$h11$, $h11$Los exact op: $e^{3x} = 8$$h11$, $h11$x = ln(2)$h11$, $h11$x = \ln(2)$h11$, 2, 7, ARRAY[$h11$x = ln(8)/3$h11$, $h11$ln(2)$h11$, $h11$x = (1/3)*ln(8)$h11$]::text[]),
  ($h11$h11_ln_nemen$h11$, $h11$ln_nemen$h11$, $h11$Los exact op: $3^{x + 1} = 5^{x}$$h11$, $h11$x = ln(3)/(ln(5) - ln(3))$h11$, $h11$x = \dfrac{\ln(3)}{\ln(5) - \ln(3)}$h11$, 3, 8, ARRAY[$h11$ln(3)/(ln(5)-ln(3))$h11$, $h11$x = ln(3)/ln(5/3)$h11$]::text[]),
  ($h11$h11_ontbinden$h11$, $h11$ontbinden$h11$, $h11$Los exact op: $x^{2}e^{x} - 16e^{x} = 0$$h11$, $h11$x = -4 of x = 4$h11$, $h11$x = -4 \vee x = 4$h11$, 2, 7, ARRAY[$h11$x = 4 of x = -4$h11$, $h11$x = ±4$h11$]::text[]),
  ($h11$h11_ontbinden$h11$, $h11$ontbinden$h11$, $h11$Los exact op: $x^{2}\ln(x) - 9\ln(x) = 0$$h11$, $h11$x = 1 of x = 3$h11$, $h11$x = 1 \vee x = 3$h11$, 3, 8, ARRAY[$h11$x = 3 of x = 1$h11$]::text[]),
  ($h11$h11_int_waarde$h11$, $h11$integraal_is_waarde$h11$, $h11$$\int_{0}^{p} 6x\,dx = 12$. Bereken $p$ met $p > 0$.$h11$, $h11$p = 2$h11$, $h11$p = 2$h11$, 2, 7, ARRAY[$h11$2$h11$]::text[]),
  ($h11$h11_int_waarde$h11$, $h11$integraal_is_waarde$h11$, $h11$$\int_{0}^{p} e^{3x}\,dx = 5$. Bereken exact $p$.$h11$, $h11$p = ln(16)/3$h11$, $h11$p = \dfrac{\ln(16)}{3}$h11$, 3, 8, ARRAY[$h11$p = (4/3)*ln(2)$h11$, $h11$p = 4*ln(2)/3$h11$, $h11$ln(16)/3$h11$]::text[]),
  ($h11$h11_twee_int$h11$, $h11$twee_integralen$h11$, $h11$$f(x) = x$ op $[0, 4]$. De lijn $x = p$ verdeelt het vlakdeel onder de grafiek in twee gelijke delen. Bereken exact $p$.$h11$, $h11$p = 2sqrt(2)$h11$, $h11$p = 2\sqrt{2}$h11$, 2, 7, ARRAY[$h11$p = sqrt(8)$h11$, $h11$2sqrt(2)$h11$]::text[]),
  ($h11$h11_twee_int$h11$, $h11$twee_integralen$h11$, $h11$$f(x) = 3x^{2}$ op $[0, 2]$. De lijn $x = p$ verdeelt het vlakdeel onder de grafiek in twee gelijke delen. Bereken exact $p$.$h11$, $h11$p = 4^(1/3)$h11$, $h11$p = \sqrt[3]{4}$h11$, 3, 8, ARRAY[$h11$4^(1/3)$h11$, $h11$p = (4)^(1/3)$h11$]::text[]),
  ($h11$h11_opp_grafiek$h11$, $h11$opp_onder_grafiek$h11$, $h11$Gegeven is $f(x) = e^{x}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$, de $x$-as, de $y$-as en de lijn $x = 1$.$h11$, $h11$e - 1$h11$, $h11$e - 1$h11$, 2, 7, ARRAY[$h11$-1 + e$h11$, $h11$exp(1) - 1$h11$]::text[]),
  ($h11$h11_opp_grafiek$h11$, $h11$opp_onder_grafiek$h11$, $h11$Gegeven is $f(x) = 9x - x^{2}$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$ en de $x$-as. Bereken exact $O(V)$.$h11$, $h11$243/2$h11$, $h11$\dfrac{243}{2}$h11$, 3, 8, ARRAY[$h11$(243)/(2)$h11$]::text[]),
  ($h11$h11_opp_tussen$h11$, $h11$opp_tussen_grafieken$h11$, $h11$Gegeven zijn $f(x) = 3x$ en $g(x) = x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken van $f$ en $g$.$h11$, $h11$9/2$h11$, $h11$\dfrac{9}{2}$h11$, 2, 7, ARRAY[$h11$(9)/(2)$h11$, $h11$4,5$h11$]::text[]),
  ($h11$h11_opp_tussen$h11$, $h11$opp_tussen_grafieken$h11$, $h11$Gegeven zijn $f(x) = 4$ en $g(x) = x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken van $f$ en $g$.$h11$, $h11$32/3$h11$, $h11$\dfrac{32}{3}$h11$, 3, 8, ARRAY[$h11$(32)/(3)$h11$]::text[]),
  ($h11$h11_opp_xas$h11$, $h11$opp_onder_xas$h11$, $h11$Gegeven is $f(x) = x^{2} - 9$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$ en de $x$-as.$h11$, $h11$36$h11$, $h11$36$h11$, 2, 7, '{}'::text[]),
  ($h11$h11_opp_xas$h11$, $h11$opp_onder_xas$h11$, $h11$Gegeven is $f(x) = \cos(x)$ met domein $[0, \pi]$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek en de $x$-as.$h11$, $h11$2$h11$, $h11$2$h11$, 3, 8, '{}'::text[]),
  ($h11$h11_inhoud$h11$, $h11$inhoud_omwenteling$h11$, $h11$Gegeven is $f(x) = x + 1$. Het vlakdeel ingesloten door de grafiek, de $x$-as, de $y$-as en de lijn $x = 2$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.$h11$, $h11$26 pi/3$h11$, $h11$\dfrac{26}{3}\pi$h11$, 2, 7, ARRAY[$h11$26*pi/3$h11$, $h11$(26/3)*pi$h11$, $h11$26pi/3$h11$]::text[]),
  ($h11$h11_inhoud$h11$, $h11$inhoud_omwenteling$h11$, $h11$Gegeven is $f(x) = \dfrac{1}{x}$. Het vlakdeel ingesloten door de grafiek, de $x$-as en de lijnen $x = 1$ en $x = e$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.$h11$, $h11$pi(e - 1)/e$h11$, $h11$\dfrac{\pi(e - 1)}{e}$h11$, 3, 8, ARRAY[$h11$pi*(e-1)/e$h11$, $h11$(1 - 1/e)*pi$h11$, $h11$pi - pi/e$h11$]::text[]),
  ($h11$h11_afstand$h11$, $h11$afstand_snelheid$h11$, $h11$De snelheid van een voorwerp is $f(t) = 5t$ m/s. Bereken de afgelegde afstand in de eerste $4$ seconden.$h11$, $h11$40$h11$, $h11$40$h11$, 2, 7, '{}'::text[]),
  ($h11$h11_afstand$h11$, $h11$afstand_snelheid$h11$, $h11$De snelheid van een voorwerp is $f(t) = 8 - 4t$ m/s. Het voorwerp begint op $t = 0$. Bereken de afgelegde afstand tot het voorwerp stilstaat.$h11$, $h11$8$h11$, $h11$8$h11$, 3, 8, '{}'::text[]),
  ($h11$h11_gemiddelde$h11$, $h11$gemiddelde_waarde$h11$, $h11$Bereken de gemiddelde waarde van $f(x) = 6x$ op het interval $[0, 3]$.$h11$, $h11$9$h11$, $h11$9$h11$, 2, 7, '{}'::text[]),
  ($h11$h11_gemiddelde$h11$, $h11$gemiddelde_waarde$h11$, $h11$Bereken de gemiddelde waarde van $f(x) = \dfrac{1}{x}$ op het interval $[1, e^{2}]$.$h11$, $h11$2/(e^2 - 1)$h11$, $h11$\dfrac{2}{e^{2} - 1}$h11$, 3, 8, ARRAY[$h11$2/(e^2-1)$h11$, $h11$2/(exp(2)-1)$h11$]::text[])
) AS v(topic_slug, cluster_slug, latex_body, answer, latex_answer, difficulty, order_index, alternatives)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new cl ON cl.slug = v.cluster_slug AND cl.topic_id = t.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.questions_new bestaand
  WHERE bestaand.cluster_id = cl.id AND bestaand.latex_body = v.latex_body
);

INSERT INTO public.question_steps_new (question_id, step_order, step_description)
SELECT vr.id, v.step_order, v.step_description
FROM (VALUES
  ($h11$h11_machtsfuncties$h11$, $h11$standaard_machten$h11$, $h11$f(x) = 4x^{3} - 6x + 5$h11$, 0, $h11$Dit is deel 2 van de driedeling: je primitiveert een veelterm term voor term met de machtsregel. Vergeet $+ c$ niet.$h11$),
  ($h11$h11_machtsfuncties$h11$, $h11$standaard_machten$h11$, $h11$f(x) = 4x^{3} - 6x + 5$h11$, 1, $h11$$\int 4x^{3}\,dx = x^{4}$, $\int -6x\,dx = -3x^{2}$ en $\int 5\,dx = 5x$.$h11$),
  ($h11$h11_machtsfuncties$h11$, $h11$standaard_machten$h11$, $h11$f(x) = 4x^{3} - 6x + 5$h11$, 2, $h11$Zet de termen bij elkaar: $F(x) = x^{4} - 3x^{2} + 5x + c$.$h11$),
  ($h11$h11_machtsfuncties$h11$, $h11$standaard_machten$h11$, $h11$f(x) = 4x^{3} - 6x + 5$h11$, 3, $h11$Een primitieve is $x^{4} - 3x^{2} + 5x + c$.$h11$),
  ($h11$h11_machtsfuncties$h11$, $h11$standaard_machten$h11$, $h11$f(x) = 6x^{5} - 9x^{2} + 4$h11$, 0, $h11$Dit is deel 2 van de driedeling: je primitiveert een veelterm term voor term met de machtsregel. Vergeet $+ c$ niet.$h11$),
  ($h11$h11_machtsfuncties$h11$, $h11$standaard_machten$h11$, $h11$f(x) = 6x^{5} - 9x^{2} + 4$h11$, 1, $h11$$\int 6x^{5}\,dx = x^{6}$, $\int -9x^{2}\,dx = -3x^{3}$ en $\int 4\,dx = 4x$.$h11$),
  ($h11$h11_machtsfuncties$h11$, $h11$standaard_machten$h11$, $h11$f(x) = 6x^{5} - 9x^{2} + 4$h11$, 2, $h11$Zet de termen bij elkaar: $F(x) = x^{6} - 3x^{3} + 4x + c$.$h11$),
  ($h11$h11_machtsfuncties$h11$, $h11$standaard_machten$h11$, $h11$f(x) = 6x^{5} - 9x^{2} + 4$h11$, 3, $h11$Een primitieve is $x^{6} - 3x^{3} + 4x + c$.$h11$),
  ($h11$h11_wortels_breuken$h11$, $h11$wortels_en_neg_machten$h11$, $h11$f(x) = \dfrac{1}{\sqrt{x}}$h11$, 0, $h11$Dit is deel 2 van de driedeling: schrijf de breuk eerst als een macht. $\dfrac{1}{\sqrt{x}} = x^{-\frac{1}{2}}$.$h11$),
  ($h11$h11_wortels_breuken$h11$, $h11$wortels_en_neg_machten$h11$, $h11$f(x) = \dfrac{1}{\sqrt{x}}$h11$, 1, $h11$De machtsregel geeft $\int x^{-\frac{1}{2}}\,dx = \dfrac{x^{\frac{1}{2}}}{\frac{1}{2}} = 2x^{\frac{1}{2}}$.$h11$),
  ($h11$h11_wortels_breuken$h11$, $h11$wortels_en_neg_machten$h11$, $h11$f(x) = \dfrac{1}{\sqrt{x}}$h11$, 2, $h11$$2x^{\frac{1}{2}}$ is hetzelfde als $2\sqrt{x}$.$h11$),
  ($h11$h11_wortels_breuken$h11$, $h11$wortels_en_neg_machten$h11$, $h11$f(x) = \dfrac{1}{\sqrt{x}}$h11$, 3, $h11$Een primitieve is $2\sqrt{x} + c$.$h11$),
  ($h11$h11_wortels_breuken$h11$, $h11$wortels_en_neg_machten$h11$, $h11$f(x) = \dfrac{4}{x^{3}} + 3\sqrt{x}$h11$, 0, $h11$Dit is deel 2 van de driedeling: schrijf eerst als machten. $\dfrac{4}{x^{3}} = 4x^{-3}$ en $3\sqrt{x} = 3x^{\frac{1}{2}}$.$h11$),
  ($h11$h11_wortels_breuken$h11$, $h11$wortels_en_neg_machten$h11$, $h11$f(x) = \dfrac{4}{x^{3}} + 3\sqrt{x}$h11$, 1, $h11$$\int 4x^{-3}\,dx = 4\cdot\dfrac{x^{-2}}{-2} = -2x^{-2}$ en $\int 3x^{\frac{1}{2}}\,dx = 3\cdot\dfrac{x^{\frac{3}{2}}}{\frac{3}{2}} = 2x^{\frac{3}{2}}$.$h11$),
  ($h11$h11_wortels_breuken$h11$, $h11$wortels_en_neg_machten$h11$, $h11$f(x) = \dfrac{4}{x^{3}} + 3\sqrt{x}$h11$, 2, $h11$$-2x^{-2} = -\dfrac{2}{x^{2}}$ en $2x^{\frac{3}{2}} = 2x\sqrt{x}$.$h11$),
  ($h11$h11_wortels_breuken$h11$, $h11$wortels_en_neg_machten$h11$, $h11$f(x) = \dfrac{4}{x^{3}} + 3\sqrt{x}$h11$, 3, $h11$Een primitieve is $-\dfrac{2}{x^{2}} + 2x\sqrt{x} + c$.$h11$),
  ($h11$h11_e_machten$h11$, $h11$e_en_g_machten$h11$, $h11$f(x) = 4e^{x} + 2^{x}$h11$, 0, $h11$Dit is deel 2 van de driedeling: de primitieve van $e^{x}$ is $e^{x}$, en de primitieve van $g^{x}$ is $\dfrac{g^{x}}{\ln(g)}$.$h11$),
  ($h11$h11_e_machten$h11$, $h11$e_en_g_machten$h11$, $h11$f(x) = 4e^{x} + 2^{x}$h11$, 1, $h11$$\int 4e^{x}\,dx = 4e^{x}$ en $\int 2^{x}\,dx = \dfrac{2^{x}}{\ln(2)}$.$h11$),
  ($h11$h11_e_machten$h11$, $h11$e_en_g_machten$h11$, $h11$f(x) = 4e^{x} + 2^{x}$h11$, 2, $h11$Tel de termen op en zet er $+ c$ achter.$h11$),
  ($h11$h11_e_machten$h11$, $h11$e_en_g_machten$h11$, $h11$f(x) = 4e^{x} + 2^{x}$h11$, 3, $h11$Een primitieve is $4e^{x} + \dfrac{2^{x}}{\ln(2)} + c$.$h11$),
  ($h11$h11_e_machten$h11$, $h11$e_en_g_machten$h11$, $h11$f(x) = 5^{x} - 3$h11$, 0, $h11$Dit is deel 2 van de driedeling: de primitieve van $g^{x}$ is $\dfrac{g^{x}}{\ln(g)}$, en de primitieve van een constante is die constante keer $x$.$h11$),
  ($h11$h11_e_machten$h11$, $h11$e_en_g_machten$h11$, $h11$f(x) = 5^{x} - 3$h11$, 1, $h11$$\int 5^{x}\,dx = \dfrac{5^{x}}{\ln(5)}$ en $\int -3\,dx = -3x$.$h11$),
  ($h11$h11_e_machten$h11$, $h11$e_en_g_machten$h11$, $h11$f(x) = 5^{x} - 3$h11$, 2, $h11$Zet de termen bij elkaar.$h11$),
  ($h11$h11_e_machten$h11$, $h11$e_en_g_machten$h11$, $h11$f(x) = 5^{x} - 3$h11$, 3, $h11$Een primitieve is $\dfrac{5^{x}}{\ln(5)} - 3x + c$.$h11$),
  ($h11$h11_logaritmes$h11$, $h11$ln_en_glog$h11$, $h11$f(x) = \dfrac{5}{x} + 2$h11$, 0, $h11$Dit is deel 2 van de driedeling: de primitieve van $\dfrac{1}{x}$ is $\ln|x|$, en de primitieve van $2$ is $2x$.$h11$),
  ($h11$h11_logaritmes$h11$, $h11$ln_en_glog$h11$, $h11$f(x) = \dfrac{5}{x} + 2$h11$, 1, $h11$$\int \dfrac{5}{x}\,dx = 5\ln|x|$ en $\int 2\,dx = 2x$.$h11$),
  ($h11$h11_logaritmes$h11$, $h11$ln_en_glog$h11$, $h11$f(x) = \dfrac{5}{x} + 2$h11$, 2, $h11$Tel de termen op.$h11$),
  ($h11$h11_logaritmes$h11$, $h11$ln_en_glog$h11$, $h11$f(x) = \dfrac{5}{x} + 2$h11$, 3, $h11$Een primitieve is $5\ln|x| + 2x + c$.$h11$),
  ($h11$h11_logaritmes$h11$, $h11$ln_en_glog$h11$, $h11$f(x) = {}^{4}\!\log(x)$h11$, 0, $h11$Dit is deel 2 van de driedeling: ${}^{4}\!\log(x) = \dfrac{\ln(x)}{\ln(4)}$. De primitieve van $\ln(x)$ is $x\ln(x) - x$.$h11$),
  ($h11$h11_logaritmes$h11$, $h11$ln_en_glog$h11$, $h11$f(x) = {}^{4}\!\log(x)$h11$, 1, $h11$Schrijf $f(x) = \dfrac{\ln(x)}{\ln(4)}$. De noemer $\ln(4)$ is een constante, die mag je voor het integraalteken halen.$h11$),
  ($h11$h11_logaritmes$h11$, $h11$ln_en_glog$h11$, $h11$f(x) = {}^{4}\!\log(x)$h11$, 2, $h11$$\int \ln(x)\,dx = x\ln(x) - x$, dus $\int f(x)\,dx = \dfrac{x\ln(x) - x}{\ln(4)}$.$h11$),
  ($h11$h11_logaritmes$h11$, $h11$ln_en_glog$h11$, $h11$f(x) = {}^{4}\!\log(x)$h11$, 3, $h11$Een primitieve is $\dfrac{x\ln(x) - x}{\ln(4)} + c$.$h11$),
  ($h11$h11_goniometrie$h11$, $h11$sin_cos_primitiveren$h11$, $h11$f(x) = 4\cos(x) - 2$h11$, 0, $h11$Dit is deel 2 van de driedeling: de primitieve van $\cos(x)$ is $\sin(x)$, en de primitieve van $-2$ is $-2x$.$h11$),
  ($h11$h11_goniometrie$h11$, $h11$sin_cos_primitiveren$h11$, $h11$f(x) = 4\cos(x) - 2$h11$, 1, $h11$$\int 4\cos(x)\,dx = 4\sin(x)$ en $\int -2\,dx = -2x$.$h11$),
  ($h11$h11_goniometrie$h11$, $h11$sin_cos_primitiveren$h11$, $h11$f(x) = 4\cos(x) - 2$h11$, 2, $h11$Zet de termen bij elkaar.$h11$),
  ($h11$h11_goniometrie$h11$, $h11$sin_cos_primitiveren$h11$, $h11$f(x) = 4\cos(x) - 2$h11$, 3, $h11$Een primitieve is $4\sin(x) - 2x + c$.$h11$),
  ($h11$h11_goniometrie$h11$, $h11$sin_cos_primitiveren$h11$, $h11$f(x) = x + \sin(x) - \cos(x)$h11$, 0, $h11$Dit is deel 2 van de driedeling: je primitiveert elke term apart. De primitieve van $\sin(x)$ is $-\cos(x)$ en die van $-\cos(x)$ is $-\sin(x)$.$h11$),
  ($h11$h11_goniometrie$h11$, $h11$sin_cos_primitiveren$h11$, $h11$f(x) = x + \sin(x) - \cos(x)$h11$, 1, $h11$$\int x\,dx = \dfrac{1}{2}x^{2}$, $\int \sin(x)\,dx = -\cos(x)$ en $\int -\cos(x)\,dx = -\sin(x)$.$h11$),
  ($h11$h11_goniometrie$h11$, $h11$sin_cos_primitiveren$h11$, $h11$f(x) = x + \sin(x) - \cos(x)$h11$, 2, $h11$Zet de termen bij elkaar.$h11$),
  ($h11$h11_goniometrie$h11$, $h11$sin_cos_primitiveren$h11$, $h11$f(x) = x + \sin(x) - \cos(x)$h11$, 3, $h11$Een primitieve is $\dfrac{1}{2}x^{2} - \cos(x) - \sin(x) + c$.$h11$),
  ($h11$h11_lineaire_ketting$h11$, $h11$f_ax_plus_b$h11$, $h11$f(x) = (4x + 1)^{3}$h11$, 0, $h11$Dit is deel 2 van de driedeling: de kern is $4x + 1$, met afgeleide $4$. Bij een macht deel je door die afgeleide en door de nieuwe exponent.$h11$),
  ($h11$h11_lineaire_ketting$h11$, $h11$f_ax_plus_b$h11$, $h11$f(x) = (4x + 1)^{3}$h11$, 1, $h11$De nieuwe exponent is $4$. Dus $\int (4x + 1)^{3}\,dx = \dfrac{(4x + 1)^{4}}{4 \cdot 4} = \dfrac{(4x + 1)^{4}}{16}$.$h11$),
  ($h11$h11_lineaire_ketting$h11$, $h11$f_ax_plus_b$h11$, $h11$f(x) = (4x + 1)^{3}$h11$, 2, $h11$Controle: de afgeleide van $\dfrac{(4x + 1)^{4}}{16}$ is $\dfrac{4(4x + 1)^{3} \cdot 4}{16} = (4x + 1)^{3}$.$h11$),
  ($h11$h11_lineaire_ketting$h11$, $h11$f_ax_plus_b$h11$, $h11$f(x) = (4x + 1)^{3}$h11$, 3, $h11$Een primitieve is $\dfrac{(4x + 1)^{4}}{16} + c$.$h11$),
  ($h11$h11_lineaire_ketting$h11$, $h11$f_ax_plus_b$h11$, $h11$f(x) = e^{3x - 2}$h11$, 0, $h11$Dit is deel 2 van de driedeling: de kern van de e-macht is $3x - 2$, met afgeleide $3$. Deel door die afgeleide.$h11$),
  ($h11$h11_lineaire_ketting$h11$, $h11$f_ax_plus_b$h11$, $h11$f(x) = e^{3x - 2}$h11$, 1, $h11$$\int e^{3x - 2}\,dx = \dfrac{e^{3x - 2}}{3}$.$h11$),
  ($h11$h11_lineaire_ketting$h11$, $h11$f_ax_plus_b$h11$, $h11$f(x) = e^{3x - 2}$h11$, 2, $h11$Controle: de afgeleide van $\dfrac{e^{3x - 2}}{3}$ is $\dfrac{3e^{3x - 2}}{3} = e^{3x - 2}$.$h11$),
  ($h11$h11_lineaire_ketting$h11$, $h11$f_ax_plus_b$h11$, $h11$f(x) = e^{3x - 2}$h11$, 3, $h11$Een primitieve is $\dfrac{e^{3x - 2}}{3} + c$.$h11$),
  ($h11$h11_uitdelen$h11$, $h11$breuk_uitdelen$h11$, $h11$f(x) = \dfrac{x^{3} + 5}{x}$h11$, 0, $h11$Dit is deel 2 van de driedeling: deel de breuk eerst uit. $\dfrac{x^{3} + 5}{x} = x^{2} + \dfrac{5}{x}$.$h11$),
  ($h11$h11_uitdelen$h11$, $h11$breuk_uitdelen$h11$, $h11$f(x) = \dfrac{x^{3} + 5}{x}$h11$, 1, $h11$$\int x^{2}\,dx = \dfrac{1}{3}x^{3}$ en $\int \dfrac{5}{x}\,dx = 5\ln|x|$.$h11$),
  ($h11$h11_uitdelen$h11$, $h11$breuk_uitdelen$h11$, $h11$f(x) = \dfrac{x^{3} + 5}{x}$h11$, 2, $h11$Tel de termen op.$h11$),
  ($h11$h11_uitdelen$h11$, $h11$breuk_uitdelen$h11$, $h11$f(x) = \dfrac{x^{3} + 5}{x}$h11$, 3, $h11$Een primitieve is $\dfrac{1}{3}x^{3} + 5\ln|x| + c$.$h11$),
  ($h11$h11_uitdelen$h11$, $h11$breuk_uitdelen$h11$, $h11$f(x) = \dfrac{2x^{3} - x + 4}{x^{2}}$h11$, 0, $h11$Dit is deel 2 van de driedeling: deel de breuk uit. $\dfrac{2x^{3} - x + 4}{x^{2}} = 2x - \dfrac{1}{x} + \dfrac{4}{x^{2}}$.$h11$),
  ($h11$h11_uitdelen$h11$, $h11$breuk_uitdelen$h11$, $h11$f(x) = \dfrac{2x^{3} - x + 4}{x^{2}}$h11$, 1, $h11$$\int 2x\,dx = x^{2}$, $\int -\dfrac{1}{x}\,dx = -\ln|x|$ en $\int 4x^{-2}\,dx = 4\cdot\dfrac{x^{-1}}{-1} = -\dfrac{4}{x}$.$h11$),
  ($h11$h11_uitdelen$h11$, $h11$breuk_uitdelen$h11$, $h11$f(x) = \dfrac{2x^{3} - x + 4}{x^{2}}$h11$, 2, $h11$Zet de termen bij elkaar.$h11$),
  ($h11$h11_uitdelen$h11$, $h11$breuk_uitdelen$h11$, $h11$f(x) = \dfrac{2x^{3} - x + 4}{x^{2}}$h11$, 3, $h11$Een primitieve is $x^{2} - \ln|x| - \dfrac{4}{x} + c$.$h11$),
  ($h11$h11_aantonen$h11$, $h11$toon_aan_primitieve$h11$, $h11$Toon aan dat $F(x) = 3x^{2} - 5x$ een primitieve is van $f(x) = 6x - 5$.$h11$, 0, $h11$Dit is deel 2 van de driedeling: differentieer $F$ en laat zien dat je $f$ terugkrijgt.$h11$),
  ($h11$h11_aantonen$h11$, $h11$toon_aan_primitieve$h11$, $h11$Toon aan dat $F(x) = 3x^{2} - 5x$ een primitieve is van $f(x) = 6x - 5$.$h11$, 1, $h11$$F(x) = 3x^{2} - 5x$, dus $F'(x) = 6x - 5$.$h11$),
  ($h11$h11_aantonen$h11$, $h11$toon_aan_primitieve$h11$, $h11$Toon aan dat $F(x) = 3x^{2} - 5x$ een primitieve is van $f(x) = 6x - 5$.$h11$, 2, $h11$Dat is precies $f(x)$.$h11$),
  ($h11$h11_aantonen$h11$, $h11$toon_aan_primitieve$h11$, $h11$Toon aan dat $F(x) = 3x^{2} - 5x$ een primitieve is van $f(x) = 6x - 5$.$h11$, 3, $h11$Dus $F'(x) = 6x - 5 = f(x)$. $F$ is een primitieve van $f$.$h11$),
  ($h11$h11_aantonen$h11$, $h11$toon_aan_primitieve$h11$, $h11$Toon aan dat $F(x) = (2x + 1)^{4}$ een primitieve is van $f(x) = 8(2x + 1)^{3}$.$h11$, 0, $h11$Dit is deel 2 van de driedeling: differentieer $F$ met de kettingregel. De kern is $2x + 1$, met afgeleide $2$.$h11$),
  ($h11$h11_aantonen$h11$, $h11$toon_aan_primitieve$h11$, $h11$Toon aan dat $F(x) = (2x + 1)^{4}$ een primitieve is van $f(x) = 8(2x + 1)^{3}$.$h11$, 1, $h11$$F'(x) = 4(2x + 1)^{3} \cdot 2 = 8(2x + 1)^{3}$.$h11$),
  ($h11$h11_aantonen$h11$, $h11$toon_aan_primitieve$h11$, $h11$Toon aan dat $F(x) = (2x + 1)^{4}$ een primitieve is van $f(x) = 8(2x + 1)^{3}$.$h11$, 2, $h11$Dat is precies $f(x)$.$h11$),
  ($h11$h11_aantonen$h11$, $h11$toon_aan_primitieve$h11$, $h11$Toon aan dat $F(x) = (2x + 1)^{4}$ een primitieve is van $f(x) = 8(2x + 1)^{3}$.$h11$, 3, $h11$Dus $F'(x) = 8(2x + 1)^{3} = f(x)$. $F$ is een primitieve van $f$.$h11$),
  ($h11$h11_beginvoorwaarde$h11$, $h11$c_bepalen$h11$, $h11$$f(x) = 6x^{2} - 2$. De grafiek van een primitieve $F$ gaat door het punt $(1, 4)$. Bereken $F(x)$.$h11$, 0, $h11$Hier spelen deel 2 en deel 3: eerst een primitieve met constante $c$, daarna vul je het punt in.$h11$),
  ($h11$h11_beginvoorwaarde$h11$, $h11$c_bepalen$h11$, $h11$$f(x) = 6x^{2} - 2$. De grafiek van een primitieve $F$ gaat door het punt $(1, 4)$. Bereken $F(x)$.$h11$, 1, $h11$Een primitieve van $6x^{2} - 2$ is $F(x) = 2x^{3} - 2x + c$.$h11$),
  ($h11$h11_beginvoorwaarde$h11$, $h11$c_bepalen$h11$, $h11$$f(x) = 6x^{2} - 2$. De grafiek van een primitieve $F$ gaat door het punt $(1, 4)$. Bereken $F(x)$.$h11$, 2, $h11$Het punt $(1, 4)$ geeft $F(1) = 4$: $2 - 2 + c = 4$, dus $c = 4$.$h11$),
  ($h11$h11_beginvoorwaarde$h11$, $h11$c_bepalen$h11$, $h11$$f(x) = 6x^{2} - 2$. De grafiek van een primitieve $F$ gaat door het punt $(1, 4)$. Bereken $F(x)$.$h11$, 3, $h11$$F(x) = 2x^{3} - 2x + 4$.$h11$),
  ($h11$h11_beginvoorwaarde$h11$, $h11$c_bepalen$h11$, $h11$$f(x) = e^{2x}$. De grafiek van een primitieve $F$ gaat door het punt $(0, 5)$. Bereken $F(x)$.$h11$, 0, $h11$Hier spelen deel 2 en deel 3: eerst een primitieve met constante $c$, daarna vul je het punt in. De kern van $e^{2x}$ is $2x$, met afgeleide $2$.$h11$),
  ($h11$h11_beginvoorwaarde$h11$, $h11$c_bepalen$h11$, $h11$$f(x) = e^{2x}$. De grafiek van een primitieve $F$ gaat door het punt $(0, 5)$. Bereken $F(x)$.$h11$, 1, $h11$Een primitieve is $F(x) = \dfrac{1}{2}e^{2x} + c$.$h11$),
  ($h11$h11_beginvoorwaarde$h11$, $h11$c_bepalen$h11$, $h11$$f(x) = e^{2x}$. De grafiek van een primitieve $F$ gaat door het punt $(0, 5)$. Bereken $F(x)$.$h11$, 2, $h11$Het punt $(0, 5)$ geeft $F(0) = 5$: $\dfrac{1}{2} + c = 5$, dus $c = \dfrac{9}{2}$.$h11$),
  ($h11$h11_beginvoorwaarde$h11$, $h11$c_bepalen$h11$, $h11$$f(x) = e^{2x}$. De grafiek van een primitieve $F$ gaat door het punt $(0, 5)$. Bereken $F(x)$.$h11$, 3, $h11$$F(x) = \dfrac{1}{2}e^{2x} + \dfrac{9}{2}$.$h11$),
  ($h11$h11_machten_int$h11$, $h11$machten_integraal$h11$, $h11$\int_{0}^{2} (4x + 1)\,dx$h11$, 0, $h11$Dit is deel 2 van de driedeling: bepaal een primitieve en vul de grenzen in.$h11$),
  ($h11$h11_machten_int$h11$, $h11$machten_integraal$h11$, $h11$\int_{0}^{2} (4x + 1)\,dx$h11$, 1, $h11$Een primitieve van $4x + 1$ is $F(x) = 2x^{2} + x$.$h11$),
  ($h11$h11_machten_int$h11$, $h11$machten_integraal$h11$, $h11$\int_{0}^{2} (4x + 1)\,dx$h11$, 2, $h11$$F(2) = 8 + 2 = 10$ en $F(0) = 0$.$h11$),
  ($h11$h11_machten_int$h11$, $h11$machten_integraal$h11$, $h11$\int_{0}^{2} (4x + 1)\,dx$h11$, 3, $h11$$F(2) - F(0) = 10$. De integraal is $10$.$h11$),
  ($h11$h11_machten_int$h11$, $h11$machten_integraal$h11$, $h11$\int_{-1}^{2} (3x^{2} - 2x)\,dx$h11$, 0, $h11$Dit is deel 2 van de driedeling: bepaal een primitieve en vul de grenzen in. Let op het minteken bij de ondergrens.$h11$),
  ($h11$h11_machten_int$h11$, $h11$machten_integraal$h11$, $h11$\int_{-1}^{2} (3x^{2} - 2x)\,dx$h11$, 1, $h11$Een primitieve van $3x^{2} - 2x$ is $F(x) = x^{3} - x^{2}$.$h11$),
  ($h11$h11_machten_int$h11$, $h11$machten_integraal$h11$, $h11$\int_{-1}^{2} (3x^{2} - 2x)\,dx$h11$, 2, $h11$$F(2) = 8 - 4 = 4$ en $F(-1) = -1 - 1 = -2$.$h11$),
  ($h11$h11_machten_int$h11$, $h11$machten_integraal$h11$, $h11$\int_{-1}^{2} (3x^{2} - 2x)\,dx$h11$, 3, $h11$$F(2) - F(-1) = 4 - (-2) = 6$. De integraal is $6$.$h11$),
  ($h11$h11_wortels_int$h11$, $h11$wortels_breuken_integraal$h11$, $h11$\int_{1}^{4} \dfrac{2}{\sqrt{x}}\,dx$h11$, 0, $h11$Dit is deel 2 van de driedeling: schrijf $\dfrac{2}{\sqrt{x}} = 2x^{-\frac{1}{2}}$ en pas daarna de machtsregel toe.$h11$),
  ($h11$h11_wortels_int$h11$, $h11$wortels_breuken_integraal$h11$, $h11$\int_{1}^{4} \dfrac{2}{\sqrt{x}}\,dx$h11$, 1, $h11$Een primitieve is $F(x) = 4\sqrt{x}$.$h11$),
  ($h11$h11_wortels_int$h11$, $h11$wortels_breuken_integraal$h11$, $h11$\int_{1}^{4} \dfrac{2}{\sqrt{x}}\,dx$h11$, 2, $h11$$F(4) = 4 \cdot 2 = 8$ en $F(1) = 4$.$h11$),
  ($h11$h11_wortels_int$h11$, $h11$wortels_breuken_integraal$h11$, $h11$\int_{1}^{4} \dfrac{2}{\sqrt{x}}\,dx$h11$, 3, $h11$$F(4) - F(1) = 4$. De integraal is $4$.$h11$),
  ($h11$h11_wortels_int$h11$, $h11$wortels_breuken_integraal$h11$, $h11$\int_{1}^{9} \left(\sqrt{x} + 1\right)\,dx$h11$, 0, $h11$Dit is deel 2 van de driedeling: schrijf $\sqrt{x}$ als een macht en primitiveer daarna beide termen apart.$h11$),
  ($h11$h11_wortels_int$h11$, $h11$wortels_breuken_integraal$h11$, $h11$\int_{1}^{9} \left(\sqrt{x} + 1\right)\,dx$h11$, 1, $h11$Een primitieve is $F(x) = \dfrac{2}{3}x^{\frac{3}{2}} + x$.$h11$),
  ($h11$h11_wortels_int$h11$, $h11$wortels_breuken_integraal$h11$, $h11$\int_{1}^{9} \left(\sqrt{x} + 1\right)\,dx$h11$, 2, $h11$$F(9) = \dfrac{2}{3} \cdot 27 + 9 = 27$ en $F(1) = \dfrac{2}{3} + 1 = \dfrac{5}{3}$.$h11$),
  ($h11$h11_wortels_int$h11$, $h11$wortels_breuken_integraal$h11$, $h11$\int_{1}^{9} \left(\sqrt{x} + 1\right)\,dx$h11$, 3, $h11$$F(9) - F(1) = 27 - \dfrac{5}{3} = \dfrac{76}{3}$. De integraal is $\dfrac{76}{3}$.$h11$),
  ($h11$h11_e_ln_int$h11$, $h11$e_ln_integraal$h11$, $h11$\int_{0}^{\ln(2)} 4e^{x}\,dx$h11$, 0, $h11$Dit is deel 2 van de driedeling: een primitieve van $4e^{x}$ is $4e^{x}$.$h11$),
  ($h11$h11_e_ln_int$h11$, $h11$e_ln_integraal$h11$, $h11$\int_{0}^{\ln(2)} 4e^{x}\,dx$h11$, 1, $h11$Vul de grenzen in: $F(x) = 4e^{x}$, dus $F(\ln(2)) - F(0)$.$h11$),
  ($h11$h11_e_ln_int$h11$, $h11$e_ln_integraal$h11$, $h11$\int_{0}^{\ln(2)} 4e^{x}\,dx$h11$, 2, $h11$$F(\ln(2)) = 4e^{\ln(2)} = 4 \cdot 2 = 8$ en $F(0) = 4$.$h11$),
  ($h11$h11_e_ln_int$h11$, $h11$e_ln_integraal$h11$, $h11$\int_{0}^{\ln(2)} 4e^{x}\,dx$h11$, 3, $h11$$8 - 4 = 4$. De integraal is $4$.$h11$),
  ($h11$h11_e_ln_int$h11$, $h11$e_ln_integraal$h11$, $h11$\int_{1}^{e^{2}} \left(\dfrac{1}{x} + 1\right)\,dx$h11$, 0, $h11$Dit is deel 2 van de driedeling: primitiveer de twee termen apart.$h11$),
  ($h11$h11_e_ln_int$h11$, $h11$e_ln_integraal$h11$, $h11$\int_{1}^{e^{2}} \left(\dfrac{1}{x} + 1\right)\,dx$h11$, 1, $h11$Een primitieve is $F(x) = \ln|x| + x$. Op $[1, e^{2}]$ is $x$ positief, dus $\ln(x) + x$.$h11$),
  ($h11$h11_e_ln_int$h11$, $h11$e_ln_integraal$h11$, $h11$\int_{1}^{e^{2}} \left(\dfrac{1}{x} + 1\right)\,dx$h11$, 2, $h11$$F(e^{2}) = 2 + e^{2}$ en $F(1) = 0 + 1 = 1$.$h11$),
  ($h11$h11_e_ln_int$h11$, $h11$e_ln_integraal$h11$, $h11$\int_{1}^{e^{2}} \left(\dfrac{1}{x} + 1\right)\,dx$h11$, 3, $h11$$F(e^{2}) - F(1) = e^{2} + 2 - 1 = e^{2} + 1$. De integraal is $1 + e^{2}$.$h11$),
  ($h11$h11_gonio_int$h11$, $h11$gonio_integraal$h11$, $h11$\int_{0}^{\frac{1}{2}\pi} 2\sin(x)\,dx$h11$, 0, $h11$Dit is deel 2 van de driedeling: een primitieve van $2\sin(x)$ is $-2\cos(x)$.$h11$),
  ($h11$h11_gonio_int$h11$, $h11$gonio_integraal$h11$, $h11$\int_{0}^{\frac{1}{2}\pi} 2\sin(x)\,dx$h11$, 1, $h11$$F\left(\dfrac{1}{2}\pi\right) = -2\cos\left(\dfrac{1}{2}\pi\right) = 0$.$h11$),
  ($h11$h11_gonio_int$h11$, $h11$gonio_integraal$h11$, $h11$\int_{0}^{\frac{1}{2}\pi} 2\sin(x)\,dx$h11$, 2, $h11$$F(0) = -2\cos(0) = -2$.$h11$),
  ($h11$h11_gonio_int$h11$, $h11$gonio_integraal$h11$, $h11$\int_{0}^{\frac{1}{2}\pi} 2\sin(x)\,dx$h11$, 3, $h11$$F\left(\dfrac{1}{2}\pi\right) - F(0) = 0 - (-2) = 2$. De integraal is $2$.$h11$),
  ($h11$h11_gonio_int$h11$, $h11$gonio_integraal$h11$, $h11$\int_{\frac{1}{6}\pi}^{\frac{1}{3}\pi} \cos(x)\,dx$h11$, 0, $h11$Dit is deel 2 van de driedeling: een primitieve van $\cos(x)$ is $\sin(x)$.$h11$),
  ($h11$h11_gonio_int$h11$, $h11$gonio_integraal$h11$, $h11$\int_{\frac{1}{6}\pi}^{\frac{1}{3}\pi} \cos(x)\,dx$h11$, 1, $h11$$\sin\left(\dfrac{1}{3}\pi\right) = \dfrac{1}{2}\sqrt{3}$ en $\sin\left(\dfrac{1}{6}\pi\right) = \dfrac{1}{2}$.$h11$),
  ($h11$h11_gonio_int$h11$, $h11$gonio_integraal$h11$, $h11$\int_{\frac{1}{6}\pi}^{\frac{1}{3}\pi} \cos(x)\,dx$h11$, 2, $h11$Trek af: $\dfrac{1}{2}\sqrt{3} - \dfrac{1}{2}$.$h11$),
  ($h11$h11_gonio_int$h11$, $h11$gonio_integraal$h11$, $h11$\int_{\frac{1}{6}\pi}^{\frac{1}{3}\pi} \cos(x)\,dx$h11$, 3, $h11$De integraal is $\dfrac{\sqrt{3} - 1}{2}$.$h11$),
  ($h11$h11_ketting_int$h11$, $h11$kettingregel_integraal$h11$, $h11$\int_{0}^{1} (4x + 1)^{2}\,dx$h11$, 0, $h11$Dit is deel 2 van de driedeling: de kern is $4x + 1$, met afgeleide $4$. Deel door $4$ en door de nieuwe exponent $3$.$h11$),
  ($h11$h11_ketting_int$h11$, $h11$kettingregel_integraal$h11$, $h11$\int_{0}^{1} (4x + 1)^{2}\,dx$h11$, 1, $h11$Een primitieve is $F(x) = \dfrac{(4x + 1)^{3}}{12}$.$h11$),
  ($h11$h11_ketting_int$h11$, $h11$kettingregel_integraal$h11$, $h11$\int_{0}^{1} (4x + 1)^{2}\,dx$h11$, 2, $h11$$F(1) = \dfrac{5^{3}}{12} = \dfrac{125}{12}$ en $F(0) = \dfrac{1}{12}$.$h11$),
  ($h11$h11_ketting_int$h11$, $h11$kettingregel_integraal$h11$, $h11$\int_{0}^{1} (4x + 1)^{2}\,dx$h11$, 3, $h11$$F(1) - F(0) = \dfrac{124}{12} = \dfrac{31}{3}$. De integraal is $\dfrac{31}{3}$.$h11$),
  ($h11$h11_ketting_int$h11$, $h11$kettingregel_integraal$h11$, $h11$\int_{0}^{1} e^{5x}\,dx$h11$, 0, $h11$Dit is deel 2 van de driedeling: de kern van $e^{5x}$ is $5x$, met afgeleide $5$.$h11$),
  ($h11$h11_ketting_int$h11$, $h11$kettingregel_integraal$h11$, $h11$\int_{0}^{1} e^{5x}\,dx$h11$, 1, $h11$Een primitieve is $F(x) = \dfrac{1}{5}e^{5x}$.$h11$),
  ($h11$h11_ketting_int$h11$, $h11$kettingregel_integraal$h11$, $h11$\int_{0}^{1} e^{5x}\,dx$h11$, 2, $h11$$F(1) = \dfrac{1}{5}e^{5}$ en $F(0) = \dfrac{1}{5}$.$h11$),
  ($h11$h11_ketting_int$h11$, $h11$kettingregel_integraal$h11$, $h11$\int_{0}^{1} e^{5x}\,dx$h11$, 3, $h11$$F(1) - F(0) = \dfrac{e^{5} - 1}{5}$. De integraal is $\dfrac{e^{5} - 1}{5}$.$h11$),
  ($h11$h11_uitdelen_int$h11$, $h11$uitdelen_integraal$h11$, $h11$\int_{1}^{e} \dfrac{x^{2} + 1}{x}\,dx$h11$, 0, $h11$Dit is deel 2 van de driedeling: deel eerst uit. $\dfrac{x^{2} + 1}{x} = x + \dfrac{1}{x}$.$h11$),
  ($h11$h11_uitdelen_int$h11$, $h11$uitdelen_integraal$h11$, $h11$\int_{1}^{e} \dfrac{x^{2} + 1}{x}\,dx$h11$, 1, $h11$Een primitieve is $F(x) = \dfrac{1}{2}x^{2} + \ln|x|$. Op $[1, e]$ is $x$ positief.$h11$),
  ($h11$h11_uitdelen_int$h11$, $h11$uitdelen_integraal$h11$, $h11$\int_{1}^{e} \dfrac{x^{2} + 1}{x}\,dx$h11$, 2, $h11$$F(e) = \dfrac{1}{2}e^{2} + 1$ en $F(1) = \dfrac{1}{2}$.$h11$),
  ($h11$h11_uitdelen_int$h11$, $h11$uitdelen_integraal$h11$, $h11$\int_{1}^{e} \dfrac{x^{2} + 1}{x}\,dx$h11$, 3, $h11$$F(e) - F(1) = \dfrac{1}{2}e^{2} + 1 - \dfrac{1}{2} = \dfrac{e^{2} + 1}{2}$. De integraal is $\dfrac{e^{2} + 1}{2}$.$h11$),
  ($h11$h11_uitdelen_int$h11$, $h11$uitdelen_integraal$h11$, $h11$\int_{1}^{4} \dfrac{x + 4}{\sqrt{x}}\,dx$h11$, 0, $h11$Dit is deel 2 van de driedeling: deel eerst uit. $\dfrac{x + 4}{\sqrt{x}} = \sqrt{x} + \dfrac{4}{\sqrt{x}}$.$h11$),
  ($h11$h11_uitdelen_int$h11$, $h11$uitdelen_integraal$h11$, $h11$\int_{1}^{4} \dfrac{x + 4}{\sqrt{x}}\,dx$h11$, 1, $h11$Een primitieve is $F(x) = \dfrac{2}{3}x^{\frac{3}{2}} + 8\sqrt{x}$.$h11$),
  ($h11$h11_uitdelen_int$h11$, $h11$uitdelen_integraal$h11$, $h11$\int_{1}^{4} \dfrac{x + 4}{\sqrt{x}}\,dx$h11$, 2, $h11$$F(4) = \dfrac{2}{3} \cdot 8 + 16 = \dfrac{64}{3}$ en $F(1) = \dfrac{2}{3} + 8 = \dfrac{26}{3}$.$h11$),
  ($h11$h11_uitdelen_int$h11$, $h11$uitdelen_integraal$h11$, $h11$\int_{1}^{4} \dfrac{x + 4}{\sqrt{x}}\,dx$h11$, 3, $h11$$F(4) - F(1) = \dfrac{38}{3}$. De integraal is $\dfrac{38}{3}$.$h11$),
  ($h11$h11_subst_ex$h11$, $h11$substitutie_ex$h11$, $h11$Los exact op: $e^{2x} - 6e^{x} + 8 = 0$$h11$, 0, $h11$Dit is deel 2 van de driedeling: stel $g = e^{x}$. Dan is $e^{2x} = g^{2}$, en $g > 0$.$h11$),
  ($h11$h11_subst_ex$h11$, $h11$substitutie_ex$h11$, $h11$Los exact op: $e^{2x} - 6e^{x} + 8 = 0$$h11$, 1, $h11$De vergelijking wordt $g^{2} - 6g + 8 = 0$. Ontbind: $(g - 2)(g - 4) = 0$.$h11$),
  ($h11$h11_subst_ex$h11$, $h11$substitutie_ex$h11$, $h11$Los exact op: $e^{2x} - 6e^{x} + 8 = 0$$h11$, 2, $h11$Dus $g = 2$ of $g = 4$. Beide zijn positief, dus beide horen erbij.$h11$),
  ($h11$h11_subst_ex$h11$, $h11$substitutie_ex$h11$, $h11$Los exact op: $e^{2x} - 6e^{x} + 8 = 0$$h11$, 3, $h11$Terugrekenen: $e^{x} = 2$ geeft $x = \ln(2)$, en $e^{x} = 4$ geeft $x = \ln(4)$.$h11$),
  ($h11$h11_subst_ex$h11$, $h11$substitutie_ex$h11$, $h11$Los exact op: $2e^{2x} - 7e^{x} + 3 = 0$$h11$, 0, $h11$Dit is deel 2 van de driedeling: stel $g = e^{x}$. Dan is $e^{2x} = g^{2}$, en $g > 0$.$h11$),
  ($h11$h11_subst_ex$h11$, $h11$substitutie_ex$h11$, $h11$Los exact op: $2e^{2x} - 7e^{x} + 3 = 0$$h11$, 1, $h11$De vergelijking wordt $2g^{2} - 7g + 3 = 0$. Ontbind: $(2g - 1)(g - 3) = 0$.$h11$),
  ($h11$h11_subst_ex$h11$, $h11$substitutie_ex$h11$, $h11$Los exact op: $2e^{2x} - 7e^{x} + 3 = 0$$h11$, 2, $h11$Dus $g = \dfrac{1}{2}$ of $g = 3$. Beide zijn positief.$h11$),
  ($h11$h11_subst_ex$h11$, $h11$substitutie_ex$h11$, $h11$Los exact op: $2e^{2x} - 7e^{x} + 3 = 0$$h11$, 3, $h11$Terugrekenen: $x = \ln\left(\dfrac{1}{2}\right)$ of $x = \ln(3)$.$h11$),
  ($h11$h11_subst_px$h11$, $h11$substitutie_px$h11$, $h11$Los exact op: $x^{4} - 17x^{2} + 16 = 0$$h11$, 0, $h11$Dit is deel 2 van de driedeling: stel $g = x^{2}$. Dan wordt de vergelijking kwadratisch in $g$, met $g \ge 0$.$h11$),
  ($h11$h11_subst_px$h11$, $h11$substitutie_px$h11$, $h11$Los exact op: $x^{4} - 17x^{2} + 16 = 0$$h11$, 1, $h11$$g^{2} - 17g + 16 = 0$ geeft $(g - 16)(g - 1) = 0$, dus $g = 16$ of $g = 1$.$h11$),
  ($h11$h11_subst_px$h11$, $h11$substitutie_px$h11$, $h11$Los exact op: $x^{4} - 17x^{2} + 16 = 0$$h11$, 2, $h11$Uit $x^{2} = 16$ volgt $x = -4$ of $x = 4$. Uit $x^{2} = 1$ volgt $x = -1$ of $x = 1$.$h11$),
  ($h11$h11_subst_px$h11$, $h11$substitutie_px$h11$, $h11$Los exact op: $x^{4} - 17x^{2} + 16 = 0$$h11$, 3, $h11$De oplossingen zijn $x = -4$, $x = -1$, $x = 1$ en $x = 4$.$h11$),
  ($h11$h11_subst_px$h11$, $h11$substitutie_px$h11$, $h11$Los exact op: $x^{4} - 5x^{2} - 36 = 0$$h11$, 0, $h11$Dit is deel 2 van de driedeling: stel $g = x^{2}$. Dan is $g \ge 0$.$h11$),
  ($h11$h11_subst_px$h11$, $h11$substitutie_px$h11$, $h11$Los exact op: $x^{4} - 5x^{2} - 36 = 0$$h11$, 1, $h11$$g^{2} - 5g - 36 = 0$. De discriminant is $25 + 144 = 169$, dus $g = \dfrac{5 \pm 13}{2}$.$h11$),
  ($h11$h11_subst_px$h11$, $h11$substitutie_px$h11$, $h11$Los exact op: $x^{4} - 5x^{2} - 36 = 0$$h11$, 2, $h11$$g = 9$ of $g = -4$. Alleen $g = 9$ mag, want een kwadraat is niet negatief.$h11$),
  ($h11$h11_subst_px$h11$, $h11$substitutie_px$h11$, $h11$Los exact op: $x^{4} - 5x^{2} - 36 = 0$$h11$, 3, $h11$Uit $x^{2} = 9$ volgt $x = -3$ of $x = 3$.$h11$),
  ($h11$h11_ln_nemen$h11$, $h11$ln_nemen$h11$, $h11$Los exact op: $e^{3x} = 8$$h11$, 0, $h11$Dit is deel 2 van de driedeling: neem aan beide kanten de natuurlijke logaritme.$h11$),
  ($h11$h11_ln_nemen$h11$, $h11$ln_nemen$h11$, $h11$Los exact op: $e^{3x} = 8$$h11$, 1, $h11$$3x = \ln(8)$.$h11$),
  ($h11$h11_ln_nemen$h11$, $h11$ln_nemen$h11$, $h11$Los exact op: $e^{3x} = 8$$h11$, 2, $h11$$\ln(8) = \ln(2^{3}) = 3\ln(2)$, dus $3x = 3\ln(2)$.$h11$),
  ($h11$h11_ln_nemen$h11$, $h11$ln_nemen$h11$, $h11$Los exact op: $e^{3x} = 8$$h11$, 3, $h11$Deel door $3$: $x = \ln(2)$.$h11$),
  ($h11$h11_ln_nemen$h11$, $h11$ln_nemen$h11$, $h11$Los exact op: $3^{x + 1} = 5^{x}$$h11$, 0, $h11$Dit is deel 2 van de driedeling: neem aan beide kanten $\ln$.$h11$),
  ($h11$h11_ln_nemen$h11$, $h11$ln_nemen$h11$, $h11$Los exact op: $3^{x + 1} = 5^{x}$$h11$, 1, $h11$$(x + 1)\ln(3) = x\ln(5)$.$h11$),
  ($h11$h11_ln_nemen$h11$, $h11$ln_nemen$h11$, $h11$Los exact op: $3^{x + 1} = 5^{x}$$h11$, 2, $h11$Werk de haakjes uit: $x\ln(3) + \ln(3) = x\ln(5)$. Breng de termen met $x$ naar één kant: $\ln(3) = x\ln(5) - x\ln(3) = x(\ln(5) - \ln(3))$.$h11$),
  ($h11$h11_ln_nemen$h11$, $h11$ln_nemen$h11$, $h11$Los exact op: $3^{x + 1} = 5^{x}$$h11$, 3, $h11$Dus $x = \dfrac{\ln(3)}{\ln(5) - \ln(3)}$.$h11$),
  ($h11$h11_ontbinden$h11$, $h11$ontbinden$h11$, $h11$Los exact op: $x^{2}e^{x} - 16e^{x} = 0$$h11$, 0, $h11$Dit is deel 2 van de driedeling: haal de gemeenschappelijke factor buiten haakjes.$h11$),
  ($h11$h11_ontbinden$h11$, $h11$ontbinden$h11$, $h11$Los exact op: $x^{2}e^{x} - 16e^{x} = 0$$h11$, 1, $h11$$e^{x}(x^{2} - 16) = 0$.$h11$),
  ($h11$h11_ontbinden$h11$, $h11$ontbinden$h11$, $h11$Los exact op: $x^{2}e^{x} - 16e^{x} = 0$$h11$, 2, $h11$$e^{x}$ is nooit $0$. Dus $x^{2} - 16 = 0$, ofwel $(x - 4)(x + 4) = 0$.$h11$),
  ($h11$h11_ontbinden$h11$, $h11$ontbinden$h11$, $h11$Los exact op: $x^{2}e^{x} - 16e^{x} = 0$$h11$, 3, $h11$De oplossingen zijn $x = -4$ en $x = 4$.$h11$),
  ($h11$h11_ontbinden$h11$, $h11$ontbinden$h11$, $h11$Los exact op: $x^{2}\ln(x) - 9\ln(x) = 0$$h11$, 0, $h11$Dit is deel 2 van de driedeling: haal $\ln(x)$ buiten haakjes. Let op: $\ln(x)$ bestaat alleen voor $x > 0$.$h11$),
  ($h11$h11_ontbinden$h11$, $h11$ontbinden$h11$, $h11$Los exact op: $x^{2}\ln(x) - 9\ln(x) = 0$$h11$, 1, $h11$$\ln(x)\,(x^{2} - 9) = 0$, dus $\ln(x) = 0$ of $x^{2} = 9$.$h11$),
  ($h11$h11_ontbinden$h11$, $h11$ontbinden$h11$, $h11$Los exact op: $x^{2}\ln(x) - 9\ln(x) = 0$$h11$, 2, $h11$$\ln(x) = 0$ geeft $x = 1$. Uit $x^{2} = 9$ volgen $x = 3$ en $x = -3$, maar $x = -3$ valt af omdat $\ln(x)$ daar niet bestaat.$h11$),
  ($h11$h11_ontbinden$h11$, $h11$ontbinden$h11$, $h11$Los exact op: $x^{2}\ln(x) - 9\ln(x) = 0$$h11$, 3, $h11$De oplossingen zijn $x = 1$ en $x = 3$.$h11$),
  ($h11$h11_int_waarde$h11$, $h11$integraal_is_waarde$h11$, $h11$$\int_{0}^{p} 6x\,dx = 12$. Bereken $p$ met $p > 0$.$h11$, 0, $h11$Hier spelen deel 2 en deel 3: eerst de integraal uitrekenen, daarna de vergelijking voor $p$ oplossen.$h11$),
  ($h11$h11_int_waarde$h11$, $h11$integraal_is_waarde$h11$, $h11$$\int_{0}^{p} 6x\,dx = 12$. Bereken $p$ met $p > 0$.$h11$, 1, $h11$Een primitieve van $6x$ is $3x^{2}$. Dus $\left[3x^{2}\right]_{0}^{p} = 3p^{2}$.$h11$),
  ($h11$h11_int_waarde$h11$, $h11$integraal_is_waarde$h11$, $h11$$\int_{0}^{p} 6x\,dx = 12$. Bereken $p$ met $p > 0$.$h11$, 2, $h11$$3p^{2} = 12$, dus $p^{2} = 4$.$h11$),
  ($h11$h11_int_waarde$h11$, $h11$integraal_is_waarde$h11$, $h11$$\int_{0}^{p} 6x\,dx = 12$. Bereken $p$ met $p > 0$.$h11$, 3, $h11$Omdat $p > 0$ is, geldt $p = 2$.$h11$),
  ($h11$h11_int_waarde$h11$, $h11$integraal_is_waarde$h11$, $h11$$\int_{0}^{p} e^{3x}\,dx = 5$. Bereken exact $p$.$h11$, 0, $h11$Hier spelen deel 2 en deel 3: eerst de integraal, daarna de vergelijking voor $p$. De kern van $e^{3x}$ is $3x$, met afgeleide $3$.$h11$),
  ($h11$h11_int_waarde$h11$, $h11$integraal_is_waarde$h11$, $h11$$\int_{0}^{p} e^{3x}\,dx = 5$. Bereken exact $p$.$h11$, 1, $h11$Een primitieve is $\dfrac{1}{3}e^{3x}$. Dus $\dfrac{1}{3}e^{3p} - \dfrac{1}{3} = 5$.$h11$),
  ($h11$h11_int_waarde$h11$, $h11$integraal_is_waarde$h11$, $h11$$\int_{0}^{p} e^{3x}\,dx = 5$. Bereken exact $p$.$h11$, 2, $h11$$\dfrac{1}{3}(e^{3p} - 1) = 5$, dus $e^{3p} - 1 = 15$ en $e^{3p} = 16$.$h11$),
  ($h11$h11_int_waarde$h11$, $h11$integraal_is_waarde$h11$, $h11$$\int_{0}^{p} e^{3x}\,dx = 5$. Bereken exact $p$.$h11$, 3, $h11$$3p = \ln(16)$, dus $p = \dfrac{\ln(16)}{3}$.$h11$),
  ($h11$h11_twee_int$h11$, $h11$twee_integralen$h11$, $h11$$f(x) = x$ op $[0, 4]$. De lijn $x = p$ verdeelt het vlakdeel onder de grafiek in twee gelijke delen. Bereken exact $p$.$h11$, 0, $h11$Hier spelen deel 1, 2 en 3: de oppervlakte is de integraal van $f$, die splits je in twee gelijke stukken, en daaruit los je $p$ op.$h11$),
  ($h11$h11_twee_int$h11$, $h11$twee_integralen$h11$, $h11$$f(x) = x$ op $[0, 4]$. De lijn $x = p$ verdeelt het vlakdeel onder de grafiek in twee gelijke delen. Bereken exact $p$.$h11$, 1, $h11$De totale oppervlakte is $\int_{0}^{4} x\,dx = \left[\dfrac{1}{2}x^{2}\right]_{0}^{4} = 8$. Elk deel heeft oppervlakte $4$.$h11$),
  ($h11$h11_twee_int$h11$, $h11$twee_integralen$h11$, $h11$$f(x) = x$ op $[0, 4]$. De lijn $x = p$ verdeelt het vlakdeel onder de grafiek in twee gelijke delen. Bereken exact $p$.$h11$, 2, $h11$$\int_{0}^{p} x\,dx = \dfrac{1}{2}p^{2} = 4$, dus $p^{2} = 8$.$h11$),
  ($h11$h11_twee_int$h11$, $h11$twee_integralen$h11$, $h11$$f(x) = x$ op $[0, 4]$. De lijn $x = p$ verdeelt het vlakdeel onder de grafiek in twee gelijke delen. Bereken exact $p$.$h11$, 3, $h11$Omdat $0 < p < 4$ is, geldt $p = \sqrt{8} = 2\sqrt{2}$.$h11$),
  ($h11$h11_twee_int$h11$, $h11$twee_integralen$h11$, $h11$$f(x) = 3x^{2}$ op $[0, 2]$. De lijn $x = p$ verdeelt het vlakdeel onder de grafiek in twee gelijke delen. Bereken exact $p$.$h11$, 0, $h11$Hier spelen deel 1, 2 en 3: de oppervlakte is de integraal van $f$, die splits je in twee gelijke stukken, en daaruit los je $p$ op.$h11$),
  ($h11$h11_twee_int$h11$, $h11$twee_integralen$h11$, $h11$$f(x) = 3x^{2}$ op $[0, 2]$. De lijn $x = p$ verdeelt het vlakdeel onder de grafiek in twee gelijke delen. Bereken exact $p$.$h11$, 1, $h11$De totale oppervlakte is $\int_{0}^{2} 3x^{2}\,dx = \left[x^{3}\right]_{0}^{2} = 8$. Elk deel heeft oppervlakte $4$.$h11$),
  ($h11$h11_twee_int$h11$, $h11$twee_integralen$h11$, $h11$$f(x) = 3x^{2}$ op $[0, 2]$. De lijn $x = p$ verdeelt het vlakdeel onder de grafiek in twee gelijke delen. Bereken exact $p$.$h11$, 2, $h11$$\int_{0}^{p} 3x^{2}\,dx = p^{3} = 4$.$h11$),
  ($h11$h11_twee_int$h11$, $h11$twee_integralen$h11$, $h11$$f(x) = 3x^{2}$ op $[0, 2]$. De lijn $x = p$ verdeelt het vlakdeel onder de grafiek in twee gelijke delen. Bereken exact $p$.$h11$, 3, $h11$Dus $p = \sqrt[3]{4}$.$h11$),
  ($h11$h11_opp_grafiek$h11$, $h11$opp_onder_grafiek$h11$, $h11$Gegeven is $f(x) = e^{x}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$, de $x$-as, de $y$-as en de lijn $x = 1$.$h11$, 0, $h11$Hier spelen deel 1 en deel 2: $e^{x}$ ligt overal boven de $x$-as. De grenzen zijn $x = 0$ en $x = 1$. De oppervlakte is de integraal van $f$.$h11$),
  ($h11$h11_opp_grafiek$h11$, $h11$opp_onder_grafiek$h11$, $h11$Gegeven is $f(x) = e^{x}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$, de $x$-as, de $y$-as en de lijn $x = 1$.$h11$, 1, $h11$$O = \int_{0}^{1} e^{x}\,dx$. Een primitieve is $F(x) = e^{x}$.$h11$),
  ($h11$h11_opp_grafiek$h11$, $h11$opp_onder_grafiek$h11$, $h11$Gegeven is $f(x) = e^{x}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$, de $x$-as, de $y$-as en de lijn $x = 1$.$h11$, 2, $h11$$F(1) - F(0) = e - 1$.$h11$),
  ($h11$h11_opp_grafiek$h11$, $h11$opp_onder_grafiek$h11$, $h11$Gegeven is $f(x) = e^{x}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$, de $x$-as, de $y$-as en de lijn $x = 1$.$h11$, 3, $h11$De oppervlakte is $e - 1$.$h11$),
  ($h11$h11_opp_grafiek$h11$, $h11$opp_onder_grafiek$h11$, $h11$Gegeven is $f(x) = 9x - x^{2}$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$ en de $x$-as. Bereken exact $O(V)$.$h11$, 0, $h11$Hier spelen deel 1 en deel 2: zoek eerst waar de grafiek de $x$-as snijdt. $9x - x^{2} = x(9 - x) = 0$ geeft $x = 0$ en $x = 9$.$h11$),
  ($h11$h11_opp_grafiek$h11$, $h11$opp_onder_grafiek$h11$, $h11$Gegeven is $f(x) = 9x - x^{2}$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$ en de $x$-as. Bereken exact $O(V)$.$h11$, 1, $h11$Op $(0, 9)$ is $f(1) = 8 > 0$, dus de grafiek ligt boven de $x$-as. $O(V) = \int_{0}^{9} (9x - x^{2})\,dx$.$h11$),
  ($h11$h11_opp_grafiek$h11$, $h11$opp_onder_grafiek$h11$, $h11$Gegeven is $f(x) = 9x - x^{2}$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$ en de $x$-as. Bereken exact $O(V)$.$h11$, 2, $h11$Een primitieve is $F(x) = \dfrac{9}{2}x^{2} - \dfrac{1}{3}x^{3}$.$h11$),
  ($h11$h11_opp_grafiek$h11$, $h11$opp_onder_grafiek$h11$, $h11$Gegeven is $f(x) = 9x - x^{2}$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$ en de $x$-as. Bereken exact $O(V)$.$h11$, 3, $h11$$F(9) - F(0) = \dfrac{9}{2} \cdot 81 - \dfrac{1}{3} \cdot 729 = \dfrac{729}{2} - 243 = \dfrac{243}{2}$. De oppervlakte is $\dfrac{243}{2}$.$h11$),
  ($h11$h11_opp_tussen$h11$, $h11$opp_tussen_grafieken$h11$, $h11$Gegeven zijn $f(x) = 3x$ en $g(x) = x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken van $f$ en $g$.$h11$, 0, $h11$Hier spelen deel 1 en deel 2: de grafieken snijden elkaar waar $x^{2} = 3x$, dus $x(x - 3) = 0$. De snijpunten zijn $x = 0$ en $x = 3$.$h11$),
  ($h11$h11_opp_tussen$h11$, $h11$opp_tussen_grafieken$h11$, $h11$Gegeven zijn $f(x) = 3x$ en $g(x) = x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken van $f$ en $g$.$h11$, 1, $h11$Op $(0, 3)$ is $f(1) = 3$ groter dan $g(1) = 1$, dus $f$ ligt boven $g$. De oppervlakte is $\int_{0}^{3} (3x - x^{2})\,dx$.$h11$),
  ($h11$h11_opp_tussen$h11$, $h11$opp_tussen_grafieken$h11$, $h11$Gegeven zijn $f(x) = 3x$ en $g(x) = x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken van $f$ en $g$.$h11$, 2, $h11$Een primitieve is $F(x) = \dfrac{3}{2}x^{2} - \dfrac{1}{3}x^{3}$.$h11$),
  ($h11$h11_opp_tussen$h11$, $h11$opp_tussen_grafieken$h11$, $h11$Gegeven zijn $f(x) = 3x$ en $g(x) = x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken van $f$ en $g$.$h11$, 3, $h11$$F(3) - F(0) = \dfrac{27}{2} - 9 = \dfrac{9}{2}$. De oppervlakte is $\dfrac{9}{2}$.$h11$),
  ($h11$h11_opp_tussen$h11$, $h11$opp_tussen_grafieken$h11$, $h11$Gegeven zijn $f(x) = 4$ en $g(x) = x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken van $f$ en $g$.$h11$, 0, $h11$Hier spelen deel 1 en deel 2: de grafieken snijden elkaar waar $x^{2} = 4$, dus $x = -2$ of $x = 2$.$h11$),
  ($h11$h11_opp_tussen$h11$, $h11$opp_tussen_grafieken$h11$, $h11$Gegeven zijn $f(x) = 4$ en $g(x) = x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken van $f$ en $g$.$h11$, 1, $h11$Op $(-2, 2)$ ligt de horizontale lijn $f$ boven de parabool $g$. De oppervlakte is $\int_{-2}^{2} (4 - x^{2})\,dx$.$h11$),
  ($h11$h11_opp_tussen$h11$, $h11$opp_tussen_grafieken$h11$, $h11$Gegeven zijn $f(x) = 4$ en $g(x) = x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken van $f$ en $g$.$h11$, 2, $h11$Een primitieve is $F(x) = 4x - \dfrac{1}{3}x^{3}$. $F(2) = 8 - \dfrac{8}{3} = \dfrac{16}{3}$ en $F(-2) = -8 + \dfrac{8}{3} = -\dfrac{16}{3}$.$h11$),
  ($h11$h11_opp_tussen$h11$, $h11$opp_tussen_grafieken$h11$, $h11$Gegeven zijn $f(x) = 4$ en $g(x) = x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafieken van $f$ en $g$.$h11$, 3, $h11$$F(2) - F(-2) = \dfrac{16}{3} - \left(-\dfrac{16}{3}\right) = \dfrac{32}{3}$. De oppervlakte is $\dfrac{32}{3}$.$h11$),
  ($h11$h11_opp_xas$h11$, $h11$opp_onder_xas$h11$, $h11$Gegeven is $f(x) = x^{2} - 9$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$ en de $x$-as.$h11$, 0, $h11$Hier spelen deel 1 en deel 2: de grafiek snijdt de $x$-as waar $x^{2} - 9 = 0$, dus $x = -3$ of $x = 3$. Op $(-3, 3)$ is $f(0) = -9$, dus de grafiek ligt onder de $x$-as.$h11$),
  ($h11$h11_opp_xas$h11$, $h11$opp_onder_xas$h11$, $h11$Gegeven is $f(x) = x^{2} - 9$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$ en de $x$-as.$h11$, 1, $h11$De oppervlakte is de integraal van de tegengestelde: $O = \int_{-3}^{3} (9 - x^{2})\,dx$.$h11$),
  ($h11$h11_opp_xas$h11$, $h11$opp_onder_xas$h11$, $h11$Gegeven is $f(x) = x^{2} - 9$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$ en de $x$-as.$h11$, 2, $h11$Een primitieve is $F(x) = 9x - \dfrac{1}{3}x^{3}$. $F(3) = 27 - 9 = 18$ en $F(-3) = -27 + 9 = -18$.$h11$),
  ($h11$h11_opp_xas$h11$, $h11$opp_onder_xas$h11$, $h11$Gegeven is $f(x) = x^{2} - 9$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$ en de $x$-as.$h11$, 3, $h11$$F(3) - F(-3) = 18 - (-18) = 36$. De oppervlakte is $36$.$h11$),
  ($h11$h11_opp_xas$h11$, $h11$opp_onder_xas$h11$, $h11$Gegeven is $f(x) = \cos(x)$ met domein $[0, \pi]$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek en de $x$-as.$h11$, 0, $h11$Hier spelen deel 1 en deel 2: $\cos(x) = 0$ bij $x = \dfrac{1}{2}\pi$. Op $\left(0, \dfrac{1}{2}\pi\right)$ ligt de grafiek boven de $x$-as, daarna tot $\pi$ eronder. Je splitst de oppervlakte.$h11$),
  ($h11$h11_opp_xas$h11$, $h11$opp_onder_xas$h11$, $h11$Gegeven is $f(x) = \cos(x)$ met domein $[0, \pi]$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek en de $x$-as.$h11$, 1, $h11$$O = \int_{0}^{\frac{1}{2}\pi} \cos(x)\,dx + \int_{\frac{1}{2}\pi}^{\pi} -\cos(x)\,dx$.$h11$),
  ($h11$h11_opp_xas$h11$, $h11$opp_onder_xas$h11$, $h11$Gegeven is $f(x) = \cos(x)$ met domein $[0, \pi]$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek en de $x$-as.$h11$, 2, $h11$Het eerste stuk is $\sin\left(\dfrac{1}{2}\pi\right) - \sin(0) = 1$. Het tweede stuk is $-\sin(\pi) - \left(-\sin\left(\dfrac{1}{2}\pi\right)\right) = 1$.$h11$),
  ($h11$h11_opp_xas$h11$, $h11$opp_onder_xas$h11$, $h11$Gegeven is $f(x) = \cos(x)$ met domein $[0, \pi]$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek en de $x$-as.$h11$, 3, $h11$De oppervlakte is $1 + 1 = 2$.$h11$),
  ($h11$h11_inhoud$h11$, $h11$inhoud_omwenteling$h11$, $h11$Gegeven is $f(x) = x + 1$. Het vlakdeel ingesloten door de grafiek, de $x$-as, de $y$-as en de lijn $x = 2$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.$h11$, 0, $h11$Hier spelen deel 1 en deel 2: op $[0, 2]$ is $f(x) \ge 1$, dus de grafiek ligt boven de $x$-as. De inhoud is $\pi$ keer de integraal van het kwadraat van $f$.$h11$),
  ($h11$h11_inhoud$h11$, $h11$inhoud_omwenteling$h11$, $h11$Gegeven is $f(x) = x + 1$. Het vlakdeel ingesloten door de grafiek, de $x$-as, de $y$-as en de lijn $x = 2$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.$h11$, 1, $h11$$I = \pi \int_{0}^{2} (x + 1)^{2}\,dx = \pi \int_{0}^{2} (x^{2} + 2x + 1)\,dx$.$h11$),
  ($h11$h11_inhoud$h11$, $h11$inhoud_omwenteling$h11$, $h11$Gegeven is $f(x) = x + 1$. Het vlakdeel ingesloten door de grafiek, de $x$-as, de $y$-as en de lijn $x = 2$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.$h11$, 2, $h11$Een primitieve van de integrand is $F(x) = \dfrac{1}{3}x^{3} + x^{2} + x$.$h11$),
  ($h11$h11_inhoud$h11$, $h11$inhoud_omwenteling$h11$, $h11$Gegeven is $f(x) = x + 1$. Het vlakdeel ingesloten door de grafiek, de $x$-as, de $y$-as en de lijn $x = 2$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.$h11$, 3, $h11$$F(2) - F(0) = \dfrac{8}{3} + 4 + 2 = \dfrac{26}{3}$. De inhoud is $\dfrac{26}{3}\pi$.$h11$),
  ($h11$h11_inhoud$h11$, $h11$inhoud_omwenteling$h11$, $h11$Gegeven is $f(x) = \dfrac{1}{x}$. Het vlakdeel ingesloten door de grafiek, de $x$-as en de lijnen $x = 1$ en $x = e$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.$h11$, 0, $h11$Hier spelen deel 1 en deel 2: op $[1, e]$ is $f(x) > 0$. De inhoud is $\pi$ keer de integraal van $\left(\dfrac{1}{x}\right)^{2}$.$h11$),
  ($h11$h11_inhoud$h11$, $h11$inhoud_omwenteling$h11$, $h11$Gegeven is $f(x) = \dfrac{1}{x}$. Het vlakdeel ingesloten door de grafiek, de $x$-as en de lijnen $x = 1$ en $x = e$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.$h11$, 1, $h11$$I = \pi \int_{1}^{e} \dfrac{1}{x^{2}}\,dx$.$h11$),
  ($h11$h11_inhoud$h11$, $h11$inhoud_omwenteling$h11$, $h11$Gegeven is $f(x) = \dfrac{1}{x}$. Het vlakdeel ingesloten door de grafiek, de $x$-as en de lijnen $x = 1$ en $x = e$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.$h11$, 2, $h11$Een primitieve van $\dfrac{1}{x^{2}}$ is $-\dfrac{1}{x}$. Dus de primitieve van de integrand met $\pi$ meegerekend geeft het verschil $\pi\left(-\dfrac{1}{e} - (-1)\right)$.$h11$),
  ($h11$h11_inhoud$h11$, $h11$inhoud_omwenteling$h11$, $h11$Gegeven is $f(x) = \dfrac{1}{x}$. Het vlakdeel ingesloten door de grafiek, de $x$-as en de lijnen $x = 1$ en $x = e$ wordt gewenteld om de $x$-as. Bereken exact de inhoud.$h11$, 3, $h11$$\pi\left(1 - \dfrac{1}{e}\right) = \dfrac{\pi(e - 1)}{e}$. De inhoud is $\dfrac{\pi(e - 1)}{e}$.$h11$),
  ($h11$h11_afstand$h11$, $h11$afstand_snelheid$h11$, $h11$De snelheid van een voorwerp is $f(t) = 5t$ m/s. Bereken de afgelegde afstand in de eerste $4$ seconden.$h11$, 0, $h11$Hier spelen deel 1 en deel 2: de snelheid is op $[0, 4]$ positief, dus de afgelegde afstand is de integraal van de snelheid.$h11$),
  ($h11$h11_afstand$h11$, $h11$afstand_snelheid$h11$, $h11$De snelheid van een voorwerp is $f(t) = 5t$ m/s. Bereken de afgelegde afstand in de eerste $4$ seconden.$h11$, 1, $h11$$s = \int_{0}^{4} 5t\,dt$. Een primitieve is $F(t) = \dfrac{5}{2}t^{2}$.$h11$),
  ($h11$h11_afstand$h11$, $h11$afstand_snelheid$h11$, $h11$De snelheid van een voorwerp is $f(t) = 5t$ m/s. Bereken de afgelegde afstand in de eerste $4$ seconden.$h11$, 2, $h11$$F(4) = \dfrac{5}{2} \cdot 16 = 40$ en $F(0) = 0$.$h11$),
  ($h11$h11_afstand$h11$, $h11$afstand_snelheid$h11$, $h11$De snelheid van een voorwerp is $f(t) = 5t$ m/s. Bereken de afgelegde afstand in de eerste $4$ seconden.$h11$, 3, $h11$De afgelegde afstand is $40$ meter.$h11$),
  ($h11$h11_afstand$h11$, $h11$afstand_snelheid$h11$, $h11$De snelheid van een voorwerp is $f(t) = 8 - 4t$ m/s. Het voorwerp begint op $t = 0$. Bereken de afgelegde afstand tot het voorwerp stilstaat.$h11$, 0, $h11$Hier spelen deel 1 en deel 2: het voorwerp staat stil als de snelheid $0$ is. $8 - 4t = 0$ geeft $t = 2$. Tot dat moment is de snelheid positief.$h11$),
  ($h11$h11_afstand$h11$, $h11$afstand_snelheid$h11$, $h11$De snelheid van een voorwerp is $f(t) = 8 - 4t$ m/s. Het voorwerp begint op $t = 0$. Bereken de afgelegde afstand tot het voorwerp stilstaat.$h11$, 1, $h11$De afstand is $\int_{0}^{2} (8 - 4t)\,dt$. Een primitieve is $F(t) = 8t - 2t^{2}$.$h11$),
  ($h11$h11_afstand$h11$, $h11$afstand_snelheid$h11$, $h11$De snelheid van een voorwerp is $f(t) = 8 - 4t$ m/s. Het voorwerp begint op $t = 0$. Bereken de afgelegde afstand tot het voorwerp stilstaat.$h11$, 2, $h11$$F(2) = 16 - 8 = 8$ en $F(0) = 0$.$h11$),
  ($h11$h11_afstand$h11$, $h11$afstand_snelheid$h11$, $h11$De snelheid van een voorwerp is $f(t) = 8 - 4t$ m/s. Het voorwerp begint op $t = 0$. Bereken de afgelegde afstand tot het voorwerp stilstaat.$h11$, 3, $h11$De afgelegde afstand is $8$ meter.$h11$),
  ($h11$h11_gemiddelde$h11$, $h11$gemiddelde_waarde$h11$, $h11$Bereken de gemiddelde waarde van $f(x) = 6x$ op het interval $[0, 3]$.$h11$, 0, $h11$Hier spelen deel 1 en deel 2: de gemiddelde waarde op $[a, b]$ is $\dfrac{1}{b - a}$ keer de integraal van $f$ van $a$ tot $b$.$h11$),
  ($h11$h11_gemiddelde$h11$, $h11$gemiddelde_waarde$h11$, $h11$Bereken de gemiddelde waarde van $f(x) = 6x$ op het interval $[0, 3]$.$h11$, 1, $h11$$\dfrac{1}{3 - 0} \int_{0}^{3} 6x\,dx$. Een primitieve van $6x$ is $3x^{2}$.$h11$),
  ($h11$h11_gemiddelde$h11$, $h11$gemiddelde_waarde$h11$, $h11$Bereken de gemiddelde waarde van $f(x) = 6x$ op het interval $[0, 3]$.$h11$, 2, $h11$$\int_{0}^{3} 6x\,dx = 3 \cdot 9 - 0 = 27$.$h11$),
  ($h11$h11_gemiddelde$h11$, $h11$gemiddelde_waarde$h11$, $h11$Bereken de gemiddelde waarde van $f(x) = 6x$ op het interval $[0, 3]$.$h11$, 3, $h11$De gemiddelde waarde is $\dfrac{27}{3} = 9$.$h11$),
  ($h11$h11_gemiddelde$h11$, $h11$gemiddelde_waarde$h11$, $h11$Bereken de gemiddelde waarde van $f(x) = \dfrac{1}{x}$ op het interval $[1, e^{2}]$.$h11$, 0, $h11$Hier spelen deel 1 en deel 2: de gemiddelde waarde op $[1, e^{2}]$ is $\dfrac{1}{e^{2} - 1}$ keer de integraal van $\dfrac{1}{x}$.$h11$),
  ($h11$h11_gemiddelde$h11$, $h11$gemiddelde_waarde$h11$, $h11$Bereken de gemiddelde waarde van $f(x) = \dfrac{1}{x}$ op het interval $[1, e^{2}]$.$h11$, 1, $h11$Een primitieve van $\dfrac{1}{x}$ is $\ln|x|$. Op dit interval is $x$ positief.$h11$),
  ($h11$h11_gemiddelde$h11$, $h11$gemiddelde_waarde$h11$, $h11$Bereken de gemiddelde waarde van $f(x) = \dfrac{1}{x}$ op het interval $[1, e^{2}]$.$h11$, 2, $h11$$\int_{1}^{e^{2}} \dfrac{1}{x}\,dx = \ln(e^{2}) - \ln(1) = 2$.$h11$),
  ($h11$h11_gemiddelde$h11$, $h11$gemiddelde_waarde$h11$, $h11$Bereken de gemiddelde waarde van $f(x) = \dfrac{1}{x}$ op het interval $[1, e^{2}]$.$h11$, 3, $h11$De gemiddelde waarde is $\dfrac{2}{e^{2} - 1}$.$h11$)
) AS v(topic_slug, cluster_slug, latex_body, step_order, step_description)
JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = 'integralen'
JOIN public.topic_clusters_new cl ON cl.slug = v.cluster_slug AND cl.topic_id = t.id
JOIN public.questions_new vr ON vr.latex_body = v.latex_body AND vr.cluster_id = cl.id
ON CONFLICT (question_id, step_order) DO NOTHING;

DO $do$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'standaard_machten' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster standaard_machten hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'wortels_en_neg_machten' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster wortels_en_neg_machten hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'e_en_g_machten' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster e_en_g_machten hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'ln_en_glog' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster ln_en_glog hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'sin_cos_primitiveren' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster sin_cos_primitiveren hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'f_ax_plus_b' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster f_ax_plus_b hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'breuk_uitdelen' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster breuk_uitdelen hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'toon_aan_primitieve' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster toon_aan_primitieve hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'c_bepalen' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster c_bepalen hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'machten_integraal' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster machten_integraal hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'wortels_breuken_integraal' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster wortels_breuken_integraal hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'e_ln_integraal' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster e_ln_integraal hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'gonio_integraal' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster gonio_integraal hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'kettingregel_integraal' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster kettingregel_integraal hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'uitdelen_integraal' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster uitdelen_integraal hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'substitutie_ex' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster substitutie_ex hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'substitutie_px' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster substitutie_px hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'ln_nemen' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster ln_nemen hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'ontbinden' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster ontbinden hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'integraal_is_waarde' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster integraal_is_waarde hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'twee_integralen' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster twee_integralen hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'opp_onder_grafiek' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster opp_onder_grafiek hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'opp_tussen_grafieken' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster opp_tussen_grafieken hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'opp_onder_xas' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster opp_onder_xas hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'inhoud_omwenteling' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster inhoud_omwenteling hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'afstand_snelheid' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster afstand_snelheid hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.questions_new q
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  WHERE cl.slug = 'gemiddelde_waarde' AND cl.site = 'integralen';
  IF n < 8 THEN RAISE EXCEPTION 'Cluster gemiddelde_waarde hoort minstens 8 vragen te hebben, gevonden %', n; END IF;
  SELECT count(*) INTO n FROM public.question_steps_new s
  JOIN public.questions_new q ON q.id = s.question_id
  JOIN public.topic_clusters_new cl ON cl.id = q.cluster_id
  JOIN public.topics_new t ON t.id = cl.topic_id
  JOIN public.chapters c ON c.id = t.chapter_id
  WHERE c.slug = 'h11' AND c.site = 'integralen' AND q.order_index IN (7, 8);
  IF n <> 216 THEN RAISE EXCEPTION 'De nieuwe H11-vragen horen 216 stappen te hebben, gevonden %', n; END IF;
END $do$;

COMMIT;
