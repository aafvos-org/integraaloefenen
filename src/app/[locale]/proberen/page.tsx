import { redirect } from 'next/navigation'

type Params = Promise<{ locale: string }>

// Zonder hoofdstuk erachter bestaat deze pagina niet: /proberen/[hoofdstuk]
// heeft de sommen. Een bezoeker die het pad inkort of gokt (bijvoorbeeld
// vanuit een zoekmachine of ChatGPT) sturen we door naar de eerste proefroute
// in plaats van een 404 te tonen.
export default async function ProberenPage({ params }: { params: Params }) {
  const { locale } = await params
  redirect(`/${locale}/proberen/primitieve`)
}
