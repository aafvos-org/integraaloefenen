-- =============================================================================
-- Vijf goede antwoorden stonden nog op fout, en drie soorten daardoor niet
-- op beheerst (INT-241).
--
-- De rekenregel van nu (answersMatch) keurt deze schrijfwijzen goed. De code
-- is al hersteld; dit bestand haalt alleen de oude rijen bij. Geen DELETE.
-- Herkenning is de tekst van het antwoord plus het modelantwoord, niet een
-- leerlingnummer: dat verschilt per database en hoort hier niet in.
--
--   x^3                    bij  x^3 + c
--   x^-1-x^-2-x^-3         bij  1/x - 1/x^2 - 1/x^3 + c
--   ln(x)+C                bij  ln|x| + c
--   ((3x+4)^(6))/(18)      bij  (3x+4)^6 / 18 + c
--
-- Daarna opnieuw uit het oefenlog (geen zelftoets): drie goede antwoorden
-- op rij zetten de soort op beheerst. Eenmaal beheerst blijft beheerst.
-- Een soort die al beheerst is, blijft onaangeroerd.
--
-- Op een lege database raakt dit niets: er zijn dan geen leerlingrijen.
-- Tweemaal draaien verandert niets meer.
-- =============================================================================

UPDATE public.session_answers_new AS a
SET is_correct = true
FROM public.questions_new AS q
WHERE a.question_id = q.id
  AND q.site = 'integralen'
  AND a.is_correct IS DISTINCT FROM true
  AND (
    (a.user_answer = 'x^3' AND q.answer = 'x^3 + c')
    OR (a.user_answer = 'x^-1-x^-2-x^-3' AND q.answer = '1/x - 1/x^2 - 1/x^3 + c')
    OR (a.user_answer = 'ln(x)+C' AND q.answer = 'ln|x| + c')
    OR (a.user_answer = '((3x+4)^(6))/(18)' AND q.answer = '(3x+4)^6 / 18 + c')
  );

-- De drie soorten uit de taak. Alleen oefenen, en alleen wie nog niet
-- beheerst is. De reeks en het aantal goede antwoorden komen uit het log
-- van ná de verbetering hierboven. Het aantal pogingen blijft staan.
DO $do$
DECLARE
  r record;
  a record;
  reeks int;
  goed int;
  beheerst boolean;
  beheerst_op timestamptz;
BEGIN
  FOR r IN
    SELECT p.id, p.user_id, p.cluster_id, p.mastered_at, p.total_correct
    FROM public.user_progress_new AS p
    JOIN public.topic_clusters_new AS c ON c.id = p.cluster_id
    WHERE p.status <> 'mastered'
      AND c.slug IN (
        'wortels_breuken_integraal',
        'machten_integraal',
        'standaard_machten'
      )
  LOOP
    reeks := 0;
    goed := 0;
    beheerst := false;
    beheerst_op := r.mastered_at;

    FOR a IN
      SELECT sa.is_correct, sa.answered_at
      FROM public.session_answers_new AS sa
      JOIN public.user_sessions_new AS s ON s.id = sa.session_id
      JOIN public.questions_new AS q ON q.id = sa.question_id
      WHERE s.user_id = r.user_id
        AND q.cluster_id = r.cluster_id
        AND s.session_type = 'practice'
        AND sa.is_correct IS NOT NULL
      ORDER BY sa.answered_at, sa.id
    LOOP
      IF a.is_correct THEN
        reeks := reeks + 1;
        goed := goed + 1;
        IF reeks >= 3 AND NOT beheerst THEN
          beheerst := true;
          IF beheerst_op IS NULL THEN
            beheerst_op := a.answered_at;
          END IF;
        END IF;
      ELSE
        reeks := 0;
      END IF;
    END LOOP;

    IF beheerst THEN
      UPDATE public.user_progress_new
      SET status = 'mastered',
          correct_streak = reeks,
          total_correct = GREATEST(goed, r.total_correct),
          mastered_at = beheerst_op
      WHERE id = r.id
        AND status <> 'mastered';
    END IF;
  END LOOP;
END
$do$;

-- Twee van de vijf horen bij een soort die nog niet op beheerst gaat.
-- Ze tellen wel mee in het aantal goede antwoorden. Alleen ophogen,
-- en een soort die al beheerst is blijft staan.
UPDATE public.user_progress_new AS p
SET total_correct = telling.goed
FROM (
  SELECT s.user_id,
         q.cluster_id,
         count(*) FILTER (WHERE a.is_correct) AS goed
  FROM public.session_answers_new AS a
  JOIN public.user_sessions_new AS s ON s.id = a.session_id
  JOIN public.questions_new AS q ON q.id = a.question_id
  WHERE s.session_type = 'practice'
    AND q.site = 'integralen'
    AND (s.user_id, q.cluster_id) IN (
      SELECT s2.user_id, q2.cluster_id
      FROM public.session_answers_new AS a2
      JOIN public.user_sessions_new AS s2 ON s2.id = a2.session_id
      JOIN public.questions_new AS q2 ON q2.id = a2.question_id
      WHERE s2.session_type = 'practice'
        AND q2.site = 'integralen'
        AND (
          (a2.user_answer = 'ln(x)+C' AND q2.answer = 'ln|x| + c')
          OR (a2.user_answer = '((3x+4)^(6))/(18)' AND q2.answer = '(3x+4)^6 / 18 + c')
        )
    )
  GROUP BY s.user_id, q.cluster_id
) AS telling
WHERE p.user_id = telling.user_id
  AND p.cluster_id = telling.cluster_id
  AND p.status <> 'mastered'
  AND p.total_correct < telling.goed;
