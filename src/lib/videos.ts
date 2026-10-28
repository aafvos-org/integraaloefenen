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
