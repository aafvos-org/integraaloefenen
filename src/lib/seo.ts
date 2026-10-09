import type { Metadata } from 'next'

/**
 * Het eigen adres van een pagina, voor zoekmachines (de "canonical").
 *
 * Een canonical zegt tegen Google: dít is het echte adres van deze pagina.
 * Hij stond in src/app/[locale]/layout.tsx, en een layout weet niet op welke
 * pagina hij staat. Daardoor riep elke pagina dat ze de startpagina was en
 * kwam geen enkele andere pagina los in de index. Daarom geeft elke openbare
 * pagina hem nu zelf op, met het pad dat erbij hoort.
 *
 * Het pad begint met een schuine streep en heeft de taal niet vooraan:
 * eigenAdres('nl', '/theorie') wordt /nl/theorie. De startpagina geeft geen
 * pad mee. Het domein komt uit metadataBase in de layout.
 */
export function eigenAdres(locale: string, pad = ''): Metadata['alternates'] {
  return { canonical: `/${locale}${pad}` }
}
