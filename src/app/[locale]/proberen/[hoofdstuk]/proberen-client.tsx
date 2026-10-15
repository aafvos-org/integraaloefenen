'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'

import { DeelKnop } from '@/components/deel-knop'
import { MathKeyboard } from '@/components/math-keyboard'
import { Math as TeX, RichMath } from '@/components/math'
import { Button } from '@/components/ui'
import { Link } from '@/i18n/navigation'
import { padNaarAanmelden } from '@/lib/bron'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'
import { antwoordPrefix, opdrachtSleutel } from '@/lib/practice/opdracht'

import { nakijkProefopgave } from './actions'

type Som = {
  volgnummer: number
  latex: string
  leesbaar: string
}

type Fase =
  | { soort: 'invoer'; melding: string | null }
  | { soort: 'goed' }
  | { soort: 'fout'; stappen: string[]; antwoordLatex: string; getoond: boolean }
  | { soort: 'klaar' }

export function ProberenClient({
  hoofdstuk,
  sommen,
}: {
  hoofdstuk: string
  sommen: Som[]
}) {
  const t = useTranslations('PracticeCard')
  const [index, setIndex] = useState(0)
  const [antwoord, setAntwoord] = useState('')
  const [fase, setFase] = useState<Fase>({ soort: 'invoer', melding: null })
  const [bezig, setBezig] = useState(false)
  const invoer = useRef<HTMLInputElement | null>(null)
  const terugkoppeling = useRef<HTMLDivElement | null>(null)

  const som = sommen[index]
  const laatste = index >= sommen.length - 1
  const aanmelden = padNaarAanmelden('/registreren', 'proberen')

  function verder() {
    if (laatste) {
      setFase({ soort: 'klaar' })
      return
    }
    setIndex(index + 1)
    setAntwoord('')
    setFase({ soort: 'invoer', melding: null })
    requestAnimationFrame(() => invoer.current?.focus())
  }

  function opnieuw() {
    setAntwoord('')
    setFase({ soort: 'invoer', melding: null })
    requestAnimationFrame(() => invoer.current?.focus())
  }

  function toonStappen() {
    if (fase.soort !== 'fout') return
    setFase({ ...fase, getoond: true })
    requestAnimationFrame(() =>
      terugkoppeling.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }),
    )
  }

  function voegIn(tekst: string) {
    const el = invoer.current
    const start = el?.selectionStart ?? antwoord.length
    const end = el?.selectionEnd ?? antwoord.length
    const { value, caret } = insertAtCursor(antwoord, start, end, tekst)
    setAntwoord(value)
    requestAnimationFrame(() => {
      invoer.current?.focus()
      invoer.current?.setSelectionRange(caret, caret)
    })
  }

  async function verstuur(e: FormEvent) {
    e.preventDefault()
    if (bezig || fase.soort !== 'invoer' || !antwoord.trim() || !som) return
    setBezig(true)
    try {
      const uitslag = await nakijkProefopgave(hoofdstuk, som.volgnummer, antwoord)
      if (uitslag.soort === 'goed') setFase({ soort: 'goed' })
      else if (uitslag.soort === 'fout') {
        setFase({
          soort: 'fout',
          stappen: uitslag.stappen,
          antwoordLatex: uitslag.antwoordLatex,
          getoond: false,
        })
      } else if (uitslag.soort === 'leeg') {
        setFase({ soort: 'invoer', melding: 'Vul eerst een antwoord in.' })
      } else {
        setFase({ soort: 'invoer', melding: 'Deze som is niet gevonden.' })
      }
    } catch {
      setFase({ soort: 'invoer', melding: 'Er ging iets mis. Probeer het nog eens.' })
    } finally {
      setBezig(false)
    }
  }

  if (fase.soort === 'klaar') {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl border border-accent/30 bg-accent-light p-5 sm:p-6">
          <h1 className="font-serif text-2xl text-text">
            Goed bezig! Maak een gratis account om je voortgang te bewaren en verder te
            oefenen
          </h1>
          <p className="mt-3 text-sm text-text">
            Je klasgenoot kan dezelfde drie sommen maken zonder account.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={aanmelden}
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white"
            >
              Maak een gratis account
            </Link>
            <DeelKnop />
          </div>
        </div>
      </main>
    )
  }

  if (!som) return null

  const opdracht = opdrachtSleutel(som.latex)
  const prefix = antwoordPrefix(som.latex)

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <p className="text-sm font-medium text-text-muted">
        Som {index + 1} van {sommen.length}
      </p>
      <div className="mt-3 min-w-0 overflow-x-auto rounded-2xl border border-border bg-surface p-4 sm:p-6">
        {opdracht && <p className="mb-1 text-sm font-medium text-text-muted">{t(opdracht)}</p>}
        <div className="font-serif text-xl leading-snug text-text">
          {som.latex.includes('$') ? <RichMath source={som.latex} /> : <TeX tex={som.latex} displayMode />}
        </div>
        <p className="sr-only">{som.leesbaar}</p>

        {fase.soort === 'invoer' && (
          <div className="mt-3 font-serif text-2xl text-accent">
            <TeX tex={`${prefix} ${antwoord.trim() ? toLatexPreview(antwoord) : '\\ldots'}`} displayMode />
          </div>
        )}

        {fase.soort === 'fout' && fase.getoond && (
          <p className="mt-4 overflow-x-auto text-sm text-text">
            <span className="font-medium">Juiste antwoord: </span>
            <RichMath source={fase.antwoordLatex.includes('$') ? fase.antwoordLatex : `$${fase.antwoordLatex}$`} />
          </p>
        )}

        {fase.soort === 'invoer' && (
          <form onSubmit={verstuur} className="mt-4 space-y-3">
            <label htmlFor="proef-antwoord" className="block text-sm font-medium text-text">
              Jouw antwoord
            </label>
            <input
              id="proef-antwoord"
              ref={invoer}
              value={antwoord}
              onChange={(e) => setAntwoord(e.target.value)}
              placeholder={t('placeholder')}
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={bezig}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-lg text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <MathKeyboard onInsert={voegIn} disabled={bezig} />
            {fase.melding && (
              <p role="alert" className="text-sm text-accent-2">
                {fase.melding}
              </p>
            )}
            <Button type="submit" disabled={bezig || !antwoord.trim()}>
              {bezig ? t('checking') : t('submit')}
            </Button>
          </form>
        )}

        {fase.soort === 'goed' && (
          <div className="mt-4 rounded-xl border border-accent/30 bg-accent-light p-4">
            <p className="font-serif text-xl text-accent">{t('correct')}</p>
            <Button className="mt-4" onClick={verder}>
              {laatste ? 'Klaar' : t('nextQuestion')}
            </Button>
          </div>
        )}

        {fase.soort === 'fout' && (
          <div ref={terugkoppeling} className="mt-4 space-y-4">
            {!fase.getoond ? (
              <div className="flex flex-wrap gap-2">
                <Button onClick={opnieuw}>{t('retryButton')}</Button>
                <Button variant="secondary" onClick={toonStappen}>
                  {t('showAnswer')}
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-border bg-white/90">
                  <p className="px-4 py-3 text-sm font-semibold text-text">{t('stepsTitle')}</p>
                  <ol className="space-y-1 border-t border-border px-3 py-3 text-sm text-text">
                    {fase.stappen.map((stap, i) => (
                      <li key={i} className="flex items-start gap-3 px-3 py-2 leading-relaxed">
                        <span className="min-w-[1.25rem] shrink-0 font-semibold tabular-nums text-accent">
                          {i + 1}.
                        </span>
                        <span>
                          <RichMath source={stap} />
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={verder}>{laatste ? 'Klaar' : t('nextQuestion')}</Button>
                  <Button variant="secondary" onClick={opnieuw}>
                    {t('retryButton')}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
