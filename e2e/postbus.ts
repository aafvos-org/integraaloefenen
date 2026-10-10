/**
 * De testpostbus van de lokale Supabase (Mailpit, poort 54324).
 *
 * Mails die een lokale Supabase verstuurt — bevestig je account, nieuw
 * wachtwoord — gaan hierheen en de deur niet uit. Je kunt ze zelf bekijken op
 * http://127.0.0.1:54324; de tests halen ze hier op via de HTTP-API, zodat ze
 * echt op de link in de mail kunnen klikken.
 *
 * Staat de postbus uit, dan verstuurt Supabase via de echte afzender en is er
 * hier niets op te halen. Hij staat daarom aan in `supabase/config.toml`
 * ([local_smtp]), ook in de automatische controle.
 */
const POSTBUS = process.env.E2E_POSTBUS_URL ?? 'http://127.0.0.1:54324'

export type Mail = {
  onderwerp: string
  /** Hoe de afzender in de inbox staat: naam én adres. */
  afzender: { naam: string; adres: string }
  html: string
}

type Adres = { Name?: string; Address: string }
type Kopregel = { ID: string; To?: Adres[] }
type Bericht = { Subject: string; From?: Adres; HTML: string }

async function haalOp<T>(pad: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${POSTBUS}${pad}`)
  } catch (oorzaak) {
    throw new Error(
      `De testpostbus op ${POSTBUS} is niet bereikbaar. Draait de lokale Supabase, en staat [local_smtp] aan in supabase/config.toml? (${oorzaak})`,
    )
  }
  if (!res.ok) {
    throw new Error(`De testpostbus antwoordde met ${res.status} op ${pad}.`)
  }
  return (await res.json()) as T
}

/**
 * Wacht tot er een mail voor dit adres in de postbus ligt en geef de nieuwste
 * terug. Elke test gebruikt een eigen adres (zie `nieuwAdres`), dus twee tests
 * kunnen elkaars mail niet pakken.
 */
export async function wachtOpMail(adres: string): Promise<Mail> {
  const gezocht = adres.toLowerCase()
  const uiterlijk = Date.now() + 30_000

  while (Date.now() < uiterlijk) {
    // Mailpit zet de nieuwste mail vooraan. 200 is ruim: per run komen er een
    // handvol mails bij, en oudere runs duwen de onze nooit weg.
    const lijst = await haalOp<{ messages?: Kopregel[] }>(
      '/api/v1/messages?limit=200',
    )
    const voorOns = (lijst.messages ?? []).find((m) =>
      (m.To ?? []).some((t) => t.Address.toLowerCase() === gezocht),
    )

    if (voorOns) {
      const bericht = await haalOp<Bericht>(`/api/v1/message/${voorOns.ID}`)
      return {
        onderwerp: bericht.Subject,
        afzender: {
          naam: bericht.From?.Name ?? '',
          adres: bericht.From?.Address ?? '',
        },
        html: bericht.HTML,
      }
    }

    await new Promise((klaar) => setTimeout(klaar, 500))
  }

  throw new Error(
    `Er kwam binnen 30 seconden geen mail aan voor ${adres} in de testpostbus op ${POSTBUS}.`,
  )
}

/**
 * De link uit de mail, zoals een leerling hem aanklikt. Supabase zet er een
 * adres van zijn eigen `/auth/v1/verify` in; dat stuurt daarna door naar de
 * site.
 *
 * In HTML staat `&` als `&amp;`, anders raakt de link onderweg zijn
 * parameters kwijt.
 */
export function linkUitMail(mail: Mail): string {
  const treffer = /href="([^"]*\/auth\/v1\/verify[^"]*)"/.exec(mail.html)
  if (!treffer) {
    throw new Error(
      `In de mail "${mail.onderwerp}" staat geen link naar Supabase.`,
    )
  }
  return treffer[1]!.replaceAll('&amp;', '&')
}
