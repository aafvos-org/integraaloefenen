/**
 * Paragraaf en theorieblok aan een alleen-toevoegen-migratie hangen.
 *
 * De generator in stappenplan-content.ts zet hoofdstuk, topics, clusters,
 * vragen en stappen. Sinds de indeling per paragraaf hoort een nieuw blok
 * ook in `paragraphs` en `theory_blocks`, met de topics daaraan gekoppeld.
 * Die koppeling is de enige UPDATE: hij raakt alleen de topics van dit blok
 * aan, en alleen zolang de koppeling er nog niet staat.
 */
export function voegTheorieblokToe(
  sql: string,
  opt: {
    paragraphSlug: string
    paragraphLabel: string
    paragraphTitle: string
    paragraphOrder: number
    blockSlug: string
    blockLetter: string
    blockTitle: string
    blockOrder: number
    topics: string[]
    /** Hoofdstuk-slug. Standaard `k`, omdat de eerdere blokken daar horen. */
    chapterSlug?: string
  },
): string {
  const hoofdstuk = opt.chapterSlug ?? 'k'
  const kop = `-- 1b. Paragraaf en theorieblok
INSERT INTO public.paragraphs (chapter_id, site, slug, label, title, order_index)
SELECT c.id, 'integralen', '${opt.paragraphSlug}', '${opt.paragraphLabel}', '${opt.paragraphTitle}', ${opt.paragraphOrder}
FROM public.chapters c
WHERE c.slug = '${hoofdstuk}' AND c.site = 'integralen'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.theory_blocks (paragraph_id, site, slug, letter, title, order_index)
SELECT p.id, 'integralen', '${opt.blockSlug}', '${opt.blockLetter}', '${opt.blockTitle}', ${opt.blockOrder}
FROM public.paragraphs p
WHERE p.slug = '${opt.paragraphSlug}' AND p.site = 'integralen'
ON CONFLICT (slug) DO NOTHING;

`

  const lijst = opt.topics.map((slug) => `  ('${slug}', '${opt.blockSlug}')`).join(',\n')
  const koppel = `-- 6. Topics aan het theorieblok koppelen
-- Alleen de topics van dit blok, en alleen als de koppeling er nog niet staat.
UPDATE public.topics_new AS t
SET theory_block_id = b.id
FROM (VALUES
${lijst}
) AS v(topic_slug, block_slug)
JOIN public.theory_blocks b ON b.slug = v.block_slug AND b.site = 'integralen'
WHERE t.slug = v.topic_slug
  AND t.site = 'integralen'
  AND t.theory_block_id IS DISTINCT FROM b.id;

DO $blok$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.topics_new t
  JOIN public.theory_blocks b ON b.id = t.theory_block_id
  WHERE t.site = 'integralen'
    AND b.slug = '${opt.blockSlug}'
    AND t.slug IN (${opt.topics.map((slug) => `'${slug}'`).join(', ')});
  IF n <> ${opt.topics.length} THEN
    RAISE EXCEPTION 'Theorieblok ${opt.blockSlug} hoort ${opt.topics.length} topics te hebben, gevonden %', n;
  END IF;
END $blok$;

`

  if (!sql.includes('-- 2. Topics')) throw new Error('Geen plek voor de paragraaf gevonden')
  if (!sql.includes('-- 6. Controle')) throw new Error('Geen plek voor de koppeling gevonden')

  return sql
    .replace(
      '-- Alleen toevoegen: geen DELETE, DROP, ALTER of UPDATE. Twee keer draaien\n-- voegt niets dubbel toe.',
      '-- Alleen toevoegen: geen DELETE, DROP of ALTER, en geen UPDATE op bestaande\n' +
        '-- vragen. De enige UPDATE zet theory_block_id op de topics van dit blok,\n' +
        '-- en alleen als die koppeling er nog niet staat. Twee keer draaien voegt\n' +
        '-- niets dubbel toe.',
    )
    .replace('-- 2. Topics', `${kop}-- 2. Topics`)
    .replace('-- 6. Controle', `${koppel}-- 7. Controle`)
}
