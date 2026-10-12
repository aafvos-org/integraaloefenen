-- =============================================================================
-- Stappenplannen van H11: geen letter u bij een substitutie.
--
-- Migratie 0024 zette bij substitutie "Stel u = e^x" (en u = x^2, u = p^2,
-- u = e^p). Functies heten f, g en h, ook bij een substitutie. Die u wordt g,
-- net als in de latere hoofdstukken. De stappen erna (ontbinden, terugrekenen)
-- gebruiken dezelfde letter, anders klopt het verhaal niet.
--
-- Bij afstand uit snelheid stond v(t). Die functie heet nu f(t), in de opgave
-- en in de stappen. De versnelling blijft a(t): dat is geen u of v.
-- Vlakdelen heten nog V en W; dat zijn geen functies.
--
-- Twee keer draaien verandert niets: de update zoekt de oude zin, en de
-- controle daarna eist de nieuwe zin.
-- =============================================================================

begin;

create temp table h11_stap_letter (
  topic_slug text not null,
  q_order int not null,
  step_order int not null,
  oud text not null,
  nieuw text not null
) on commit drop;

insert into h11_stap_letter (topic_slug, q_order, step_order, oud, nieuw)
values
  ('h11_subst_ex', 1, 1,
    $oud$Stel $u = e^x$, dan $e^{2x} = u^2$. De vergelijking wordt $u^2 - 5u + 6 = 0$.$oud$,
    $nieuw$Stel $g = e^x$, dan $e^{2x} = g^2$. De vergelijking wordt $g^2 - 5g + 6 = 0$.$nieuw$),
  ('h11_subst_ex', 1, 2,
    $oud$Ontbind: $(u-2)(u-3) = 0$, dus $u = 2$ of $u = 3$.$oud$,
    $nieuw$Ontbind: $(g-2)(g-3) = 0$, dus $g = 2$ of $g = 3$.$nieuw$),
  ('h11_subst_ex', 2, 1,
    $oud$Stel $u = e^x$. De vergelijking wordt $u^2 - 4u + 3 = 0$.$oud$,
    $nieuw$Stel $g = e^x$. De vergelijking wordt $g^2 - 4g + 3 = 0$.$nieuw$),
  ('h11_subst_ex', 2, 2,
    $oud$Ontbind: $(u-1)(u-3) = 0$, dus $u = 1$ of $u = 3$.$oud$,
    $nieuw$Ontbind: $(g-1)(g-3) = 0$, dus $g = 1$ of $g = 3$.$nieuw$),
  ('h11_subst_ex', 3, 1,
    $oud$Stel $u = e^x$. De vergelijking wordt $u^2 + u - 6 = 0$.$oud$,
    $nieuw$Stel $g = e^x$. De vergelijking wordt $g^2 + g - 6 = 0$.$nieuw$),
  ('h11_subst_ex', 3, 2,
    $oud$Ontbind: $(u+3)(u-2) = 0$, dus $u = -3$ of $u = 2$.$oud$,
    $nieuw$Ontbind: $(g+3)(g-2) = 0$, dus $g = -3$ of $g = 2$.$nieuw$),
  ('h11_subst_ex', 3, 3,
    $oud$$u = -3$ voldoet niet want $e^x > 0$. Dus $e^x = 2 \Rightarrow x = \ln(2)$.$oud$,
    $nieuw$$g = -3$ voldoet niet want $e^x > 0$. Dus $e^x = 2 \Rightarrow x = \ln(2)$.$nieuw$),
  ('h11_subst_ex', 4, 1,
    $oud$Stel $u = e^x$. De vergelijking wordt $2u^2 - 9u + 4 = 0$.$oud$,
    $nieuw$Stel $g = e^x$. De vergelijking wordt $2g^2 - 9g + 4 = 0$.$nieuw$),
  ('h11_subst_ex', 4, 2,
    $oud$Ontbind: $(2u-1)(u-4) = 0$, dus $u = \tfrac{1}{2}$ of $u = 4$.$oud$,
    $nieuw$Ontbind: $(2g-1)(g-4) = 0$, dus $g = \tfrac{1}{2}$ of $g = 4$.$nieuw$),
  ('h11_subst_ex', 5, 1,
    $oud$Stel $u = e^x$. De vergelijking wordt $u^2 - 3u + 2 = 0$.$oud$,
    $nieuw$Stel $g = e^x$. De vergelijking wordt $g^2 - 3g + 2 = 0$.$nieuw$),
  ('h11_subst_ex', 5, 2,
    $oud$Ontbind: $(u-1)(u-2) = 0$, dus $u = 1$ of $u = 2$.$oud$,
    $nieuw$Ontbind: $(g-1)(g-2) = 0$, dus $g = 1$ of $g = 2$.$nieuw$),
  ('h11_subst_ex', 6, 1,
    $oud$Stel $u = e^x$. De vergelijking wordt $3u^2 - 10u + 3 = 0$.$oud$,
    $nieuw$Stel $g = e^x$. De vergelijking wordt $3g^2 - 10g + 3 = 0$.$nieuw$),
  ('h11_subst_ex', 6, 2,
    $oud$Ontbind: $(3u-1)(u-3) = 0$, dus $u = \tfrac{1}{3}$ of $u = 3$.$oud$,
    $nieuw$Ontbind: $(3g-1)(g-3) = 0$, dus $g = \tfrac{1}{3}$ of $g = 3$.$nieuw$),
  ('h11_subst_px', 1, 1,
    $oud$Stel $u = x^2$. De vergelijking wordt $u^2 - 5u + 4 = 0$.$oud$,
    $nieuw$Stel $g = x^2$. De vergelijking wordt $g^2 - 5g + 4 = 0$.$nieuw$),
  ('h11_subst_px', 1, 2,
    $oud$Ontbind: $(u-1)(u-4) = 0$, dus $u = 1$ of $u = 4$.$oud$,
    $nieuw$Ontbind: $(g-1)(g-4) = 0$, dus $g = 1$ of $g = 4$.$nieuw$),
  ('h11_subst_px', 2, 1,
    $oud$Stel $u = x^2$. De vergelijking wordt $u^2 - 13u + 36 = 0$.$oud$,
    $nieuw$Stel $g = x^2$. De vergelijking wordt $g^2 - 13g + 36 = 0$.$nieuw$),
  ('h11_subst_px', 2, 2,
    $oud$Ontbind: $(u-4)(u-9) = 0$, dus $u = 4$ of $u = 9$.$oud$,
    $nieuw$Ontbind: $(g-4)(g-9) = 0$, dus $g = 4$ of $g = 9$.$nieuw$),
  ('h11_subst_px', 3, 1,
    $oud$Stel $u = x^2$. De vergelijking wordt $u^2 - 10u + 9 = 0$.$oud$,
    $nieuw$Stel $g = x^2$. De vergelijking wordt $g^2 - 10g + 9 = 0$.$nieuw$),
  ('h11_subst_px', 3, 2,
    $oud$Ontbind: $(u-1)(u-9) = 0$, dus $u = 1$ of $u = 9$.$oud$,
    $nieuw$Ontbind: $(g-1)(g-9) = 0$, dus $g = 1$ of $g = 9$.$nieuw$),
  ('h11_subst_px', 4, 1,
    $oud$Stel $u = p^2$. De vergelijking wordt $u^2 - 4u + 2 = 0$.$oud$,
    $nieuw$Stel $g = p^2$. De vergelijking wordt $g^2 - 4g + 2 = 0$.$nieuw$),
  ('h11_subst_px', 4, 2,
    $oud$ABC-formule: $u = \dfrac{4 \pm \sqrt{16-8}}{2} = 2 \pm \sqrt{2}$.$oud$,
    $nieuw$ABC-formule: $g = \dfrac{4 \pm \sqrt{16-8}}{2} = 2 \pm \sqrt{2}$.$nieuw$),
  ('h11_subst_px', 5, 1,
    $oud$Stel $u = x^2$. De vergelijking wordt $u^2 + 2u - 8 = 0$.$oud$,
    $nieuw$Stel $g = x^2$. De vergelijking wordt $g^2 + 2g - 8 = 0$.$nieuw$),
  ('h11_subst_px', 5, 2,
    $oud$Ontbind: $(u+4)(u-2) = 0$, dus $u = -4$ of $u = 2$.$oud$,
    $nieuw$Ontbind: $(g+4)(g-2) = 0$, dus $g = -4$ of $g = 2$.$nieuw$),
  ('h11_subst_px', 5, 3,
    $oud$$u = -4$ voldoet niet want $x^2 \geq 0$. Dus $x^2 = 2 \Rightarrow x = \pm\sqrt{2}$.$oud$,
    $nieuw$$g = -4$ voldoet niet want $x^2 \geq 0$. Dus $x^2 = 2 \Rightarrow x = \pm\sqrt{2}$.$nieuw$),
  ('h11_subst_px', 6, 1,
    $oud$Stel $u = x^2$. De vergelijking wordt $2u^2 - 5u - 3 = 0$.$oud$,
    $nieuw$Stel $g = x^2$. De vergelijking wordt $2g^2 - 5g - 3 = 0$.$nieuw$),
  ('h11_subst_px', 6, 2,
    $oud$Ontbind: $(2u+1)(u-3) = 0$, dus $u = -\tfrac{1}{2}$ of $u = 3$.$oud$,
    $nieuw$Ontbind: $(2g+1)(g-3) = 0$, dus $g = -\tfrac{1}{2}$ of $g = 3$.$nieuw$),
  ('h11_subst_px', 6, 3,
    $oud$$u = -\tfrac{1}{2}$ voldoet niet. Dus $x^2 = 3 \Rightarrow x = \pm\sqrt{3}$.$oud$,
    $nieuw$$g = -\tfrac{1}{2}$ voldoet niet. Dus $x^2 = 3 \Rightarrow x = \pm\sqrt{3}$.$nieuw$),
  ('h11_twee_int', 3, 2,
    $oud$$O(W) = 2 \cdot O(V)$: $e^{2p} - e^p = 2(e^p - 1)$. Stel $u = e^p$: $u^2 - 3u + 2 = 0$.$oud$,
    $nieuw$$O(W) = 2 \cdot O(V)$: $e^{2p} - e^p = 2(e^p - 1)$. Stel $g = e^p$: $g^2 - 3g + 2 = 0$.$nieuw$),
  ('h11_twee_int', 3, 3,
    $oud$$(u-1)(u-2) = 0$. $u = 1$ geeft $p = 0$ (voldoet niet). $u = 2$ geeft $p = \ln(2)$.$oud$,
    $nieuw$$(g-1)(g-2) = 0$. $g = 1$ geeft $p = 0$ (voldoet niet). $g = 2$ geeft $p = \ln(2)$.$nieuw$),
  ('h11_afstand', 3, 1,
    $oud$Stilstand: $v=0 \Rightarrow 10-2t=0 \Rightarrow t=5$.$oud$,
    $nieuw$Stilstand: $f(t) = 0 \Rightarrow 10-2t=0 \Rightarrow t=5$.$nieuw$),
  ('h11_afstand', 5, 1,
    $oud$Eerst $v(t)$ bepalen: $v(t) = \int 6t\,dt = 3t^2+c$. $v(0)=2$ geeft $c=2$, dus $v(t)=3t^2+2$.$oud$,
    $nieuw$Eerst $f(t)$ bepalen: $f(t) = \int 6t\,dt = 3t^2+c$. $f(0)=2$ geeft $c=2$, dus $f(t)=3t^2+2$.$nieuw$);

update public.question_steps_new as s
set step_description = v.nieuw
from h11_stap_letter v
join public.topics_new t
  on t.site = 'integralen' and t.slug = v.topic_slug
join public.questions_new q
  on q.site = 'integralen'
 and q.topic_id = t.id
 and q.order_index = v.q_order
where s.question_id = q.id
  and s.step_order = v.step_order
  and s.step_description = v.oud;

create temp table h11_vraag_letter (
  topic_slug text not null,
  q_order int not null,
  oud text not null,
  nieuw text not null
) on commit drop;

insert into h11_vraag_letter (topic_slug, q_order, oud, nieuw)
values
  ('h11_afstand', 1,
    $oud$De snelheid van een voorwerp is $v(t) = 3t^{2}$ m/s. Bereken de afgelegde afstand in de eerste $4$ seconden.$oud$,
    $nieuw$De snelheid van een voorwerp is $f(t) = 3t^{2}$ m/s. Bereken de afgelegde afstand in de eerste $4$ seconden.$nieuw$),
  ('h11_afstand', 2,
    $oud$De snelheid van een voorwerp is $v(t) = 2t + 1$ m/s. Bereken de afgelegde afstand in het interval $[1, 5]$.$oud$,
    $nieuw$De snelheid van een voorwerp is $f(t) = 2t + 1$ m/s. Bereken de afgelegde afstand in het interval $[1, 5]$.$nieuw$),
  ('h11_afstand', 3,
    $oud$De snelheid van een voorwerp is $v(t) = 10 - 2t$ m/s. Het voorwerp begint op $t = 0$. Bereken de afgelegde afstand tot het voorwerp stilstaat.$oud$,
    $nieuw$De snelheid van een voorwerp is $f(t) = 10 - 2t$ m/s. Het voorwerp begint op $t = 0$. Bereken de afgelegde afstand tot het voorwerp stilstaat.$nieuw$),
  ('h11_afstand', 4,
    $oud$De snelheid van een voorwerp is $v(t) = e^{t}$ m/s. Bereken exact de afgelegde afstand in de eerste $3$ seconden.$oud$,
    $nieuw$De snelheid van een voorwerp is $f(t) = e^{t}$ m/s. Bereken exact de afgelegde afstand in de eerste $3$ seconden.$nieuw$),
  ('h11_afstand', 5,
    $oud$De versnelling van een voorwerp is $a(t) = 6t$ m/s$^{2}$ en $v(0) = 2$ m/s. Bereken de afgelegde afstand in de eerste $3$ seconden.$oud$,
    $nieuw$De versnelling van een voorwerp is $a(t) = 6t$ m/s$^{2}$ en $f(0) = 2$ m/s. Bereken de afgelegde afstand in de eerste $3$ seconden.$nieuw$),
  ('h11_afstand', 6,
    $oud$De snelheid van een voorwerp is $v(t) = -\tfrac{1}{2}t^{2} + 2t + 1$ m/s. Bereken exact de afgelegde afstand op het interval $[1, 4]$.$oud$,
    $nieuw$De snelheid van een voorwerp is $f(t) = -\tfrac{1}{2}t^{2} + 2t + 1$ m/s. Bereken exact de afgelegde afstand op het interval $[1, 4]$.$nieuw$);

update public.questions_new as q
set latex_body = v.nieuw
from h11_vraag_letter v
join public.topics_new t
  on t.site = 'integralen' and t.slug = v.topic_slug
where q.site = 'integralen'
  and q.topic_id = t.id
  and q.order_index = v.q_order
  and q.latex_body = v.oud;

do $controle$
declare
  stappen_nieuw int;
  stappen_oud int;
  vragen_nieuw int;
  vragen_oud int;
  nog_u_of_v int;
begin
  select count(*) into stappen_nieuw
  from h11_stap_letter v
  join public.topics_new t
    on t.site = 'integralen' and t.slug = v.topic_slug
  join public.questions_new q
    on q.site = 'integralen' and q.topic_id = t.id and q.order_index = v.q_order
  join public.question_steps_new s
    on s.question_id = q.id and s.step_order = v.step_order and s.step_description = v.nieuw;

  select count(*) into stappen_oud
  from h11_stap_letter v
  join public.topics_new t
    on t.site = 'integralen' and t.slug = v.topic_slug
  join public.questions_new q
    on q.site = 'integralen' and q.topic_id = t.id and q.order_index = v.q_order
  join public.question_steps_new s
    on s.question_id = q.id and s.step_order = v.step_order and s.step_description = v.oud;

  select count(*) into vragen_nieuw
  from h11_vraag_letter v
  join public.topics_new t
    on t.site = 'integralen' and t.slug = v.topic_slug
  join public.questions_new q
    on q.site = 'integralen' and q.topic_id = t.id and q.order_index = v.q_order
   and q.latex_body = v.nieuw;

  select count(*) into vragen_oud
  from h11_vraag_letter v
  join public.topics_new t
    on t.site = 'integralen' and t.slug = v.topic_slug
  join public.questions_new q
    on q.site = 'integralen' and q.topic_id = t.id and q.order_index = v.q_order
   and q.latex_body = v.oud;

  select count(*) into nog_u_of_v
  from public.question_steps_new s
  join public.questions_new q on q.id = s.question_id
  join public.topics_new t on t.id = q.topic_id
  where t.site = 'integralen'
    and t.slug in ('h11_subst_ex', 'h11_subst_px', 'h11_twee_int', 'h11_afstand')
    and (
      s.step_description like '%$u%'
      or s.step_description like '%(u%'
      or s.step_description like '%$v%'
    );

  if stappen_nieuw <> 31 then
    raise exception 'h11 hoort 31 aangepaste stappen te hebben, gevonden %', stappen_nieuw;
  end if;
  if stappen_oud <> 0 then
    raise exception 'er staan nog oude stappen met u of v: %', stappen_oud;
  end if;
  if vragen_nieuw <> 6 then
    raise exception 'h11_afstand hoort 6 aangepaste opgaven te hebben, gevonden %', vragen_nieuw;
  end if;
  if vragen_oud <> 0 then
    raise exception 'er staan nog opgaven met v(t): %', vragen_oud;
  end if;
  if nog_u_of_v <> 0 then
    raise exception 'er staat nog een stap met u of v: %', nog_u_of_v;
  end if;
end
$controle$;

commit;
