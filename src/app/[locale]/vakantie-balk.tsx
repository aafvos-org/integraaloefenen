import { getTranslations } from 'next-intl/server'

import { VAKANTIE_BALK_ID, scriptDatVakantieBalkToont } from '@/lib/vakantiebalk'

/**
 * Tijdelijke zin boven de proefsom (INT-456), zichtbaar van 26 oktober t/m
 * 9 november 2026: leerlingen zijn dan terug van de herfstvakantie en
 * starten toetsweken. Verdwijnt vanzelf na de periode.
 *
 * Staat altijd in de ruwe HTML, maar begint verborgen (`hidden`): openbare
 * pagina's worden bij de build klaargezet (zie open-next.config.ts), dus een
 * servercheck zou vastzitten op de bouwdatum. Het script erna draait
 * synchroon terwijl de browser deze HTML nog aan het inlezen is — dus vóór
 * de eerste tekening — en toont de zin alsnog als het vandaag binnen de
 * periode is. Bewust geen `next/script` met `strategy="beforeInteractive"`:
 * die voegt het script pas via JavaScript toe zodra de hoofdbundel geladen
 * is, wat net zo laat kan zijn als hydratatie — en dat is precies het
 * probleem dat deze balk had (INT-612).
 *
 * Sinds INT-830 geen losse banner met eigen knop meer: de tekst staat als
 * één korte regel direct boven de proefsom, die er vlak onder staat.
 */
export async function VakantieBalk() {
  const t = await getTranslations('VakantieBalk')

  return (
    <>
      <p
        id={VAKANTIE_BALK_ID}
        hidden
        className="mb-3 text-center text-sm font-medium text-accent"
      >
        {t('title')}
      </p>
      <script dangerouslySetInnerHTML={{ __html: scriptDatVakantieBalkToont() }} />
    </>
  )
}
