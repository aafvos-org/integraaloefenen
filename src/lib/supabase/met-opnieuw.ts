/**
 * Eén herkansing bij een fout.
 *
 * Supabase heeft af en toe een kortstondig falende ronde. Op `/oefenen` en
 * `/examentraining` staan meerdere van die rondes na elkaar (INT-559: een
 * leerling zag daar de foutpagina, en een halve minuut later werkten
 * dezelfde pagina's vanzelf weer). Zonder herkansing gooit zo'n pagina meteen
 * naar de error-boundary voor iets wat de tweede keer wél lukt.
 */
export async function metOpnieuw<T>(roep: () => Promise<T>): Promise<T> {
  try {
    return await roep()
  } catch {
    return roep()
  }
}
