import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { leesbareTekst, leesbareWiskunde } from '@/app/[locale]/theorie/leesbare-tekst'
import { DeelKnop } from '@/components/deel-knop'
import { Math, RichMath } from '@/components/math'
import { SITE_CONFIG } from '@/config/site'
import { oefenPad, proefPad, vindVoorbeeld, VOORBEELDEN } from '@/content/voorbeelden'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { zetStatischeTaal } from '@/i18n/statisch'
import { voorbeeldGegevens } from '@/lib/gestructureerde-gegevens'
import { eigenPagina } from '@/lib/seo'

import { YoutubeStrip } from '../../youtube-strip'

type Params = Promise<{ locale: string; slug: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    VOORBEELDEN.map((voorbeeld) => ({ locale, slug: voorbeeld.slug })),
  )
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params
  zetStatischeTaal(locale)
  const voorbeeld = vindVoorbeeld(slug)
  if (!voorbeeld) notFound()
  return eigenPagina({
    locale,
    pad: `/voorbeeld/${slug}`,
    titel: voorbeeld.titel,
    omschrijving: voorbeeld.omschrijving,
    eigenDeelafbeelding: true,
  })
}

export default async function VoorbeeldPagina({ params }: { params: Params }) {
  const { locale, slug } = await params
  zetStatischeTaal(locale)
  const voorbeeld = vindVoorbeeld(slug)
  if (!voorbeeld) notFound()

  const t = await getTranslations('Voorbeeld')
  const proef = proefPad(voorbeeld)
  const antwoordTekst = leesbareWiskunde(voorbeeld.antwoordLatex)
  const stappenTekst = voorbeeld.stappen.map((stap) => leesbareTekst(stap))
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_CONFIG.domain}`
  const gegevens = voorbeeldGegevens({
    url: `${siteUrl}/${locale}/voorbeeld/${slug}`,
    vraag: voorbeeld.kop,
    antwoord: antwoordTekst,
    stappen: stappenTekst,
  })
  const verwant = voorbeeld.verwant.map((ander) => vindVoorbeeld(ander)!)

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(gegevens).replace(/</g, '\\u003c'),
        }}
      />
      <YoutubeStrip />
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        <Link href="/voorbeeld" className="hover:underline">
          {t('eyebrow')}
        </Link>
      </p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">{voorbeeld.kop}</h1>

      {voorbeeld.nietTeVerwarrenMet && (
        <p className="mt-3 text-text-muted">
          <RichMath source={voorbeeld.nietTeVerwarrenMet} />
          {voorbeeld.nietTeVerwarrenMetSlug && (
            <>
              {' '}
              <Link
                href={`/voorbeeld/${voorbeeld.nietTeVerwarrenMetSlug}` as '/voorbeeld'}
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                {t('nietTeVerwarrenMetLink', {
                  kop: vindVoorbeeld(voorbeeld.nietTeVerwarrenMetSlug)!.kop,
                })}
              </Link>
            </>
          )}
        </p>
      )}

      {proef && (
        <Link
          href={proef as '/proberen'}
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 font-medium text-white shadow-sm hover:bg-accent/90"
        >
          {t('proefKnop')}
        </Link>
      )}

      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">{t('antwoord')}</p>
        <p className="mt-3 text-lg text-text">
          {t('antwoordZin')} <span className="font-medium">{antwoordTekst}</span>
        </p>
        <div className="mt-2 text-center text-text">
          <Math tex={voorbeeld.antwoordLatex} displayMode />
        </div>
        <p className="sr-only">
          {leesbareWiskunde(voorbeeld.vraagLatex)} = {antwoordTekst}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-text">{t('uitwerking')}</h2>
        <p className="mt-3 text-text-muted">
          <Math tex={voorbeeld.vraagLatex} />
        </p>
        <ol className="mt-6 space-y-4 border-l-2 border-border pl-5">
          {voorbeeld.stappen.map((stap, i) => (
            <li key={i}>
              <p className="text-xs font-medium uppercase tracking-wider text-accent">
                {t('stap', { n: i })}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text">
                <RichMath source={stap} />
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 rounded-xl border border-accent-2/30 bg-accent-2-light p-5">
        <h2 className="font-serif text-xl text-text">{t('fout')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text">
          <RichMath source={voorbeeld.fout} />
        </p>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-2">
        <Link
          href={oefenPad(voorbeeld) as '/oefenen'}
          className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
        >
          {t('oefenen')}
        </Link>
        <DeelKnop />
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">{t('verwant')}</h2>
        <ul className="mt-4 space-y-2">
          {verwant.map((ander) => (
            <li key={ander.slug}>
              <Link
                href={`/voorbeeld/${ander.slug}` as '/voorbeeld'}
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                {ander.kop}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <Link
            href={voorbeeld.theorie as '/theorie'}
            className="text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            {t('theorie')}
          </Link>
        </p>
      </section>
    </article>
  )
}
