/** Link die een leerling naar een klasgenoot stuurt, met herkomst `klas`. */
export function deelAdres(huidigeUrl: string, pad?: string): string {
  const url = new URL(huidigeUrl)
  if (pad) {
    const doel = new URL(pad, url.origin)
    url.pathname = doel.pathname
    url.search = doel.search
    url.hash = doel.hash
  }
  url.searchParams.set('van', 'klas')
  return url.toString()
}

/** Op een smal scherm opent het deelmenu; op een computer kopieert de knop de link. */
export function openDeelmenu(breedte: number, heeftDeelmenu: boolean): boolean {
  return heeftDeelmenu && breedte <= 768
}
