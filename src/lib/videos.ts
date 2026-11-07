/**
 * `algemeen` legt een onderwerp of regelkeuze uit; `vraaguitwerking` werkt één
 * opgave uit, meestal op verzoek van een leerling.
 */
export type VideoSoort = 'algemeen' | 'vraaguitwerking'

export type UitlegVideo = {
  slug: string
  title: string
  description: string
  soort: VideoSoort
  /** Hoofdstuk waar de video bij hoort, bv. "K". Null = niet hoofdstukgebonden. */
  chapter: string | null
  /** Weergaveduur, bv. "2:21". */
  duration: string
  /** YouTube-video-ID, bv. "VC22q6hNci0" uit youtu.be/VC22q6hNci0. */
  youtubeId: string
  /** Pad naar de bijpassende theoriepagina, bv. "/theorie/substitutiemethode". Null = geen koppeling. */
  theorieHref: string | null
  /** Pad naar de bijpassende oefenstof, bv. "/oefenen?blok=k1a". Null = geen koppeling. */
  oefenHref: string | null
  /**
   * Clusters (topic_clusters_new.id) waar de oefenvragen bij deze video
   * vandaan komen. Leeg = geen embedded oefenkaart tonen (de links hierboven
   * volstaan dan).
   */
  clusterIds: string[]
}

/**
 * De uitlegvideo's van integraaloefenen.nl (INT-604). Ze staan op YouTube, het
 * kanaal "Wiskunde met Aaf": integraal heeft geen eigen Storage-bucket voor
 * video's en krijgt er ook geen (regelboek 6).
 */
const VIDEOS: UitlegVideo[] = [
  {
    slug: 'k1a-kettingregel',
    title: 'K.1A — Primitiveren met de kettingregel',
    description:
      'Hoe je een integraal herkent waarbij de kern en zijn afgeleide naast elkaar staan, en hem dan met de kettingregel achterstevoren primitiveert.',
    soort: 'algemeen',
    chapter: 'K',
    duration: '6:56',
    youtubeId: 'VC22q6hNci0',
    theorieHref: '/theorie/substitutiemethode',
    oefenHref: '/oefenen?blok=k1a',
    clusterIds: [],
  },
  {
    slug: 'ln-afgeleide-primitieve',
    title: 'Afgeleide en primitieve van ln(x)',
    description:
      'De afgeleide van ln(x) is 1/x, en dus is de primitieve van 1/x gelijk aan ln(x) — in drie minuten uitgelegd.',
    soort: 'algemeen',
    chapter: null,
    duration: '3:23',
    youtubeId: 'q53YUlb5QzQ',
    theorieHref: '/theorie/primitieve',
    oefenHref: '/oefenen?blok=k0b',
    clusterIds: [],
  },
  {
    slug: 'ln-primitieve-kort',
    title: 'Short: de primitieve van ln(x) is niet 1/x',
    description:
      'Een veelgemaakte verwisseling in 30 seconden: de afgeleide van ln(x) is 1/x, maar de primitieve van ln(x) is x·ln(x) − x.',
    soort: 'algemeen',
    chapter: null,
    duration: '0:30',
    youtubeId: 'gnw1Ipv9baQ',
    theorieHref: null,
    oefenHref: '/oefenen?blok=k2a',
    clusterIds: [],
  },
  {
    slug: 'substitutie-6-stappen',
    title: 'Substitutie in 6 stappen (K.1A)',
    description:
      'Hoe je een integraal met een kern en zijn afgeleide herkent, en in zes vaste stappen oplost met de substitutiemethode.',
    soort: 'algemeen',
    chapter: 'K',
    duration: '6:56',
    youtubeId: 'TkA321QEXds',
    theorieHref: '/theorie/substitutiemethode',
    oefenHref: '/oefenen?blok=k1a',
    clusterIds: [],
  },
  {
    slug: 'substitutie-trucje-kort',
    title: 'Short: hetzelfde trucje bij x en x²',
    description:
      'Zie je in één integraal zowel x als x² staan? Dan werkt bijna altijd hetzelfde trucje van de substitutiemethode.',
    soort: 'algemeen',
    chapter: 'K',
    duration: '0:49',
    youtubeId: 'vUNrZQNDUmE',
    theorieHref: null,
    oefenHref: '/oefenen?blok=k1a',
    clusterIds: [],
  },
  {
    slug: 'examen-2024-1-wachttijden',
    title: 'Examen 2024-I, vraag 3: Wachttijden',
    description:
      'De integraalvraag over wachttijden uit het eindexamen van 2024, tijdvak I, helemaal uitgewerkt, goed voor alle drie de punten.',
    soort: 'algemeen',
    chapter: null,
    duration: '3:28',
    youtubeId: 'RPLetmuD0C4',
    theorieHref: '/theorie/oppervlakte',
    oefenHref: '/examen-integralen',
    clusterIds: [],
  },
  {
    slug: 'examen-2024-1-wachttijden-kort',
    title: 'Short: examenvraag wachttijden',
    description:
      'Welk percentage wacht korter dan drie minuten? Het eerste onderdeel van de examenvraag over wachttijden, kort uitgelegd.',
    soort: 'algemeen',
    chapter: null,
    duration: '0:31',
    youtubeId: 'M5059w16XLw',
    theorieHref: null,
    oefenHref: '/examen-integralen',
    clusterIds: [],
  },
]

export function getUitlegVideos(): UitlegVideo[] {
  return VIDEOS
}

/**
 * De uitlegvideo die bij een cluster hoort, of null. Zo kan de oefenpagina bij
 * een vraag laten zien dat er uitleg over dat onderwerp klaarstaat.
 * Hoort een cluster bij meerdere video's, dan wint de laatst toegevoegde.
 */
export function getVideoForCluster(clusterId: string | null): UitlegVideo | null {
  if (!clusterId) return null
  for (let i = VIDEOS.length - 1; i >= 0; i--) {
    if (VIDEOS[i].clusterIds.includes(clusterId)) return VIDEOS[i]
  }
  return null
}
