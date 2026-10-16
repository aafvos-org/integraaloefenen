import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'
import { zetStatischeTaal } from '@/i18n/statisch'
import { proefSommen } from '@/lib/proberen/opgaven'
import { THEORIE_SLUGS } from '@/lib/theorie-slugs'

import { leesbareWiskunde } from '../../theorie/leesbare-tekst'
import { ProberenClient } from './proberen-client'

type Params = Promise<{ locale: string; hoofdstuk: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    THEORIE_SLUGS.map((hoofdstuk) => ({ locale, hoofdstuk })),
  )
}

const PROEFSOM_OMSCHRIJVING =
  'Maak drie sommen zonder account en kijk of je de primitieve vindt.'

export async function generateMetadata(
  { params }: { params: Params },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, hoofdstuk } = await params
  zetStatischeTaal(locale)
  if (!proefSommen(hoofdstuk)) notFound()
  const vorige = await parent
  return {
    title: 'Probeer 3 sommen',
    description: PROEFSOM_OMSCHRIJVING,
    openGraph: { ...vorige.openGraph, description: PROEFSOM_OMSCHRIJVING },
  }
}

export default async function ProberenPage({ params }: { params: Params }) {
  const { locale, hoofdstuk } = await params
  zetStatischeTaal(locale)
  const sommen = proefSommen(hoofdstuk)
  if (!sommen) notFound()

  return (
    <ProberenClient
      hoofdstuk={hoofdstuk}
      sommen={sommen.map((som) => ({
        ...som,
        leesbaar: leesbareWiskunde(som.latex),
      }))}
    />
  )
}
