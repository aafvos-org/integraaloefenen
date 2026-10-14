import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'
import { proefSommen } from '@/lib/proberen/opgaven'
import { THEORIE_SLUGS } from '@/lib/theorie-slugs'

import { leesbareWiskunde } from '../../theorie/leesbare-tekst'
import { ProberenClient } from './proberen-client'

type Params = Promise<{ hoofdstuk: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    THEORIE_SLUGS.map((hoofdstuk) => ({ locale, hoofdstuk })),
  )
}

export async function generateMetadata({ params }: { params: Params }) {
  const { hoofdstuk } = await params
  if (!proefSommen(hoofdstuk)) notFound()
  return { title: 'Probeer 3 sommen' }
}

export default async function ProberenPage({ params }: { params: Params }) {
  const { hoofdstuk } = await params
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
