/** Platte zin voor Google: de intro, zonder dollartekens van formules. */
export function hoofdstukOmschrijving(title: string, intro: string | undefined): string {
  const zin = (intro ?? '').replace(/\$/g, '').replace(/\\/g, '').replace(/\s+/g, ' ').trim()
  return zin ? `${title}. ${zin}` : title
}
