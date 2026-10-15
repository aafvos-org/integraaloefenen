export type VraagRij = {
  id: string
  cluster_id: string
  difficulty: number
  latex_body: string | null
}

export type OefenVraag = {
  id: string
  latex_body: string | null
}

/**
 * Kies hoogstens `aantal` vragen, om de beurt uit elk cluster, en zet de
 * makkelijkste vooraan. `schud` haalt de volgorde binnen een cluster door
 * elkaar; de pagina roept dit pas aan als een leerling de video al ziet.
 */
export function kiesOefenvragen(
  rijen: VraagRij[],
  clusterIds: string[],
  aantal: number,
  schud: (lijst: VraagRij[]) => void = (lijst) => {
    lijst.sort(() => Math.random() - 0.5)
  },
): OefenVraag[] {
  const perCluster = new Map<string, VraagRij[]>()
  for (const id of clusterIds) perCluster.set(id, [])
  for (const rij of rijen) perCluster.get(rij.cluster_id)?.push(rij)
  for (const lijst of perCluster.values()) schud(lijst)

  const gekozen: VraagRij[] = []
  let toegevoegd = true
  while (gekozen.length < aantal && toegevoegd) {
    toegevoegd = false
    for (const lijst of perCluster.values()) {
      const volgende = lijst.pop()
      if (volgende && gekozen.length < aantal) {
        gekozen.push(volgende)
        toegevoegd = true
      }
    }
  }

  return gekozen
    .sort((a, b) => a.difficulty - b.difficulty)
    .map((vraag) => ({ id: vraag.id, latex_body: vraag.latex_body }))
}
