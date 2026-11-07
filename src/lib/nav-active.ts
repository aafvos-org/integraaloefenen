/** Herkent of een navigatielink bij het huidige pad hoort (zelfde pad of een subpagina ervan). */
export function isActiveNavHref(pathname: string, href: string): boolean {
  const basisHref = href.split('?')[0]
  return pathname === basisHref || pathname.startsWith(`${basisHref}/`)
}
