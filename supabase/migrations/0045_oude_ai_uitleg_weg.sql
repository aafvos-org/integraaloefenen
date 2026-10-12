-- =============================================================================
-- Oude AI-uitleg uit de cache.
--
-- known_wrong_answers_new bewaart uitleg die Gemini eerder bij een fout
-- antwoord schreef. De site kijkt daar eerst, en slaat Gemini dan over.
-- Rijen van vóór pull request 23 (gemerged op 2026-10-09 19:35 UTC) zijn met
-- de oude, op differentiëren gerichte prompt gemaakt. Die horen weg, zodat
-- dezelfde fout de volgende keer opnieuw wordt uitgelegd met de integraal-prompt.
--
-- De drie rijen van ná dat tijdstip blijven: die zijn al met de nieuwe prompt
-- gemaakt.
--
-- question_steps_new blijft staan. Dat zijn de stappenplannen uit de
-- oefenstof-migraties (H11 en K), geen Gemini-cache. De oude tabellen
-- known_wrong_answers en question_steps zijn al weg in migratie 0044.
--
-- Twee keer draaien doet niets: de tweede keer is er niets meer van vóór
-- dat tijdstip.
-- =============================================================================

DELETE FROM public.known_wrong_answers_new
WHERE created_at < timestamptz '2026-10-09 19:36:00+00';
