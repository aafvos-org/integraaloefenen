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
  /** Hoofdstuk waar de video bij hoort, bv. "H2". Null = niet hoofdstukgebonden. */
  chapter: string | null
  /** Weergaveduur, bv. "2:21". */
  duration: string
  /** Publieke mp4-URL (Supabase Storage, bucket `videos`). */
  src: string
  /**
   * Clusters (topic_clusters_new.id) waar de oefenvragen bij deze video
   * vandaan komen. Leeg = geen oefensectie tonen.
   */
  clusterIds: string[]
}

/**
 * De uitlegvideo's van integraaloefenen.nl. Nog leeg: de eerste video's over
 * integreren worden gemaakt. Zolang deze lijst leeg is toont de pagina een
 * uitnodiging om een vraag te stellen, in plaats van een speler.
 *
 * Een video toevoegen:
 * - zet de mp4 in de publieke Storage-bucket `videos` van élke omgeving waar je
 *   hem wilt zien (lokaal, dev en prod hebben een eigen bucket) en bouw `src`
 *   als `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/<naam>.mp4`;
 * - vul `clusterIds` met clusters uit `topic_clusters_new` van dít project
 *   (IntegraalOefenen), anders blijft de oefenkaart eronder leeg.
 */
const VIDEOS: UitlegVideo[] = []

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
