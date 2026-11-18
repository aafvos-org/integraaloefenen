/**
 * Waar /oefenen een niet-ingelogde bezoeker naartoe stuurt (INT-866).
 *
 * `/oefenen` vroeg eerst meteen om in te loggen, zonder dat een bezoeker de
 * gratis proefsom had gezien. Deze module kiest in plaats daarvan een
 * passende /proberen/<hoofdstuk>.
 */
import { VOORBEELDEN } from '@/content/voorbeelden'
import { THEORIE_SLUGS } from '@/lib/theorie-slugs'

type TheorieSlug = (typeof THEORIE_SLUGS)[number]

const FALLBACK_SLUG: TheorieSlug = 'primitieve'

function isTheorieSlug(waarde: string | null | undefined): waarde is TheorieSlug {
  return !!waarde && (THEORIE_SLUGS as readonly string[]).includes(waarde)
}

export type OefenQuery = {
  blok?: string | null
  cluster?: string | null
  chapter?: string | null
  topic?: string | null
}

/**
 * Kiest de proefpagina die het beste bij deze zoekwoorden past.
 *
 * Staat er al een echte theorieslug in de query (bijvoorbeeld chapter=k3),
 * dan gebruiken we die. Anders kijken we of blok/cluster bij een bestaande
 * voorbeeldpagina hoort — dat is precies de combinatie die de knop "Oefen
 * dit soort sommen" meestuurt (zie `oefenPad` in `content/voorbeelden.ts`).
 * Vinden we niets, dan is `primitieve` de redelijkste gok.
 */
export function proberenSlug(query: OefenQuery): TheorieSlug {
  const directeSlug = [query.chapter, query.blok, query.topic, query.cluster].find(
    isTheorieSlug,
  )
  if (directeSlug) return directeSlug

  const voorbeeld = query.blok
    ? VOORBEELDEN.find(
        (v) => v.blok === query.blok && (!query.cluster || v.cluster === query.cluster),
      )
    : undefined
  const slugUitVoorbeeld = voorbeeld?.theorie.split('/').filter(Boolean).pop()
  if (isTheorieSlug(slugUitVoorbeeld)) return slugUitVoorbeeld

  return FALLBACK_SLUG
}

/**
 * Volledig pad naar de proefpagina, met `van` doorgegeven als dat al in de
 * query stond (bijvoorbeeld `van=voorbeeld`). Geen nieuwe `van` erbij als die
 * er nog niet was.
 */
export function proberenAdres(locale: string, query: OefenQuery & { van?: string | null }): string {
  const slug = proberenSlug(query)
  const van = query.van?.trim()
  const basis = `/${locale}/proberen/${slug}`
  return van ? `${basis}?van=${encodeURIComponent(van)}` : basis
}
