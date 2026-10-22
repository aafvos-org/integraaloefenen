/**
 * Periode voor de tijdelijke "terug van vakantie"-balk op de startpagina
 * (INT-456): Midden en Zuid zijn dan terug van de herfstvakantie en starten
 * toetsweken. Na 9 november verdwijnt de balk vanzelf, geen cleanup-taak.
 */
const PERIODE_START = '2026-10-26'
const PERIODE_EIND = '2026-11-09'

function naarDatumString(datum: Date): string {
  const jaar = datum.getFullYear()
  const maand = String(datum.getMonth() + 1).padStart(2, '0')
  const dag = String(datum.getDate()).padStart(2, '0')
  return `${jaar}-${maand}-${dag}`
}

export function isTerugVanVakantiePeriode(nu: Date): boolean {
  const vandaag = naarDatumString(nu)
  return vandaag >= PERIODE_START && vandaag <= PERIODE_EIND
}
