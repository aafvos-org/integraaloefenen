'use client'

import { useState } from 'react'

import { Link } from '@/i18n/navigation'
import { Math as TeX, RichMath } from '@/components/math'
import { cn } from '@/components/ui'
import type { Deel, HoofdstukTopic, Regel, RegelId, Uitwerking, Voorbeeld } from '@/lib/theory'

export type SchemaLabels = {
  stap0Title: string
  stap0Generic: string
  stap1Title: string
  stap2Title: string
  stap3Title: string
  generic1: string
  generic2: string
  generic3: string
  /** "vanaf {chapter}" */
  vanaf: string
  kiesVoorbeeld: string
  antwoord: string
  herken: string
  antwoordvorm: string
  inDitHoofdstuk: string
  oefen: string
  video: string
  wisSelectie: string
  toonGenest: string
}

type Props = {
  regels: Regel[]
  /** Regels die op deze pagina actief (klikbaar) zijn */
  actieveRegels: RegelId[]
  voorbeelden: Voorbeeld[]
  notities?: Partial<Record<RegelId, string>>
  /** Oefen-topics van dit hoofdstuk, gekoppeld aan een regel */
  topics?: HoofdstukTopic[]
  chapterSlug?: string
  /** Voorbeeld dat bij het laden al open staat (index in `voorbeelden`) */
  initieelVoorbeeld?: number | null
  /** Pad van uitwerkingen dat bij het laden al open staat, bv. [1, 0] = h' in het hoofdschema, daarin g' */
  initieelHoe?: number[] | null
  labels: SchemaLabels
}

export function MethodeSchema({
  regels,
  actieveRegels,
  voorbeelden,
  notities,
  topics,
  chapterSlug,
  initieelVoorbeeld = null,
  initieelHoe = null,
  labels,
}: Props) {
  const startVb = initieelVoorbeeld !== null && voorbeelden[initieelVoorbeeld] ? initieelVoorbeeld : null
  const [regelSel, setRegelSel] = useState<RegelId | null>(startVb !== null ? voorbeelden[startVb]!.regel : null)
  const [vbSel, setVbSel] = useState<number | null>(startVb)
  const [kiezerOpen, setKiezerOpen] = useState(startVb !== null)
  // Pad van geopende uitwerkingen: hoePad[0] = index in stap 2 van het hoofdschema,
  // hoePad[1] = index in stap 2 van dat zijvak, enzovoort (sub-sub-delen).
  const [hoePad, setHoePad] = useState<number[]>(startVb !== null && initieelHoe ? initieelHoe : [])

  const vb = vbSel === null ? null : voorbeelden[vbSel] ?? null
  const regel = regelSel ? regels.find((r) => r.id === regelSel) ?? null : null
  const genestZichtbaar = !!vb && hoePad.length > 0 && !!vb.uitwerking.afgeleiden[hoePad[0]!]?.hoe
  // Regels die in de geopende keten van uitwerkingen gebruikt worden (gestippeld in de regelrij)
  const ketenRegels = new Set<RegelId>()
  // Per geopende laag: de uitwerking waarin het vraagteken is aangeklikt (elke laag krijgt een kolom rechts)
  const keten: Uitwerking[] = []
  {
    let u: Uitwerking | null = vb?.uitwerking ?? null
    for (const i of hoePad) {
      const h = u?.afgeleiden[i]?.hoe
      if (!u || !h) break
      keten.push(u)
      ketenRegels.add(h.regel)
      u = h.uitwerking
    }
  }

  /** Klik op een vraagteken op positie `positie` in het pad: open, of sluit als hij al open stond. */
  function kiesHoe(positie: number, i: number) {
    setHoePad((cur) => (cur[positie] === i ? cur.slice(0, positie) : [...cur.slice(0, positie), i]))
  }

  function kiesRegel(id: RegelId) {
    setHoePad([])
    if (regelSel === id && vbSel === null) {
      setRegelSel(null)
      return
    }
    setRegelSel(id)
    // Eerste voorbeeld van deze regel meteen tonen, als het er is
    const idx = voorbeelden.findIndex((v) => v.regel === id)
    setVbSel(idx >= 0 ? idx : null)
  }

  function kiesVoorbeeld(idx: number) {
    setHoePad([])
    if (vbSel === idx) {
      setVbSel(null)
      return
    }
    setVbSel(idx)
    setRegelSel(voorbeelden[idx]!.regel)
  }

  // Voorbeelden gegroepeerd per hoofdstuk, in volgorde van voorkomen
  const groepen: Array<{ chapter: string; items: Array<{ idx: number; v: Voorbeeld }> }> = []
  voorbeelden.forEach((v, idx) => {
    let g = groepen.find((x) => x.chapter === v.chapter)
    if (!g) {
      g = { chapter: v.chapter, items: [] }
      groepen.push(g)
    }
    g.items.push({ idx, v })
  })

  const stapTekst = (n: 1 | 2 | 3): string => (regel ? regel[`stap${n}`] : labels[`generic${n}`])
  // De machtsregel is de uitzondering: na a en n vul je meteen in, dus twee stappen.
  const tweeStappen = regel?.id === 'machtsregel'

  return (
    <div className="space-y-6">
      {/* ── Voorbeeldkiezer ─────────────────────────────────────────── */}
      {voorbeelden.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setKiezerOpen((v) => !v)}
            aria-expanded={kiezerOpen}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-text-muted transition hover:border-accent hover:text-accent"
          >
            <span className="text-[10px]">{kiezerOpen ? '▲' : '▼'}</span>
            {labels.kiesVoorbeeld}
            <span className="rounded-full bg-surface-2 px-1.5 font-mono text-[10px] normal-case tracking-normal">
              {voorbeelden.length}
            </span>
          </button>
          {kiezerOpen &&
            groepen.map((g) => (
            <div key={g.chapter} className="flex flex-wrap items-center gap-2">
              {groepen.length > 1 && (
                <span className="mr-1 font-mono text-xs font-semibold text-text-muted">{g.chapter}</span>
              )}
              {g.items.map(({ idx, v }) => {
                const active = vbSel === idx
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => kiesVoorbeeld(idx)}
                    aria-pressed={active}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition',
                      active
                        ? 'border-accent bg-accent text-white'
                        : 'border-border bg-surface text-text hover:border-accent hover:text-accent',
                    )}
                  >
                    <TeX tex={v.problem} />
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── Het schema ─────────────────────────────────────────────── */}
      <div className="methode-schema rounded-2xl border border-border bg-[linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[size:20px_20px] p-4 sm:p-6">
        {/* Stap 0 */}
        <Box title={labels.stap0Title} highlight className="mx-auto max-w-2xl">
          {vb ? (
            <div className="text-lg">
              <TeX tex={vb.problem} displayMode />
            </div>
          ) : null}
        </Box>

        <Connector />

        {/* Regels */}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {regels.map((r) => {
            const actief = actieveRegels.includes(r.id)
            const sel = regelSel === r.id
            const isGenest = ketenRegels.has(r.id)
            return (
              <li key={r.id}>
                <button
                  type="button"
                  disabled={!actief}
                  onClick={() => kiesRegel(r.id)}
                  aria-pressed={sel}
                  className={cn(
                    'flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl border-2 px-3 py-3 text-center transition',
                    actief ? 'cursor-pointer hover:border-accent' : 'cursor-not-allowed opacity-45',
                    sel
                      ? 'scale-[1.04] border-accent bg-accent text-white shadow-lg ring-4 ring-accent/20'
                      : 'bg-surface border-text/70',
                    isGenest && !sel && 'border-dashed border-accent bg-accent-light/50',
                  )}
                >
                  <span className={cn('font-medium', sel ? 'text-white' : 'text-text')}>{r.title}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold',
                      sel ? 'bg-white/20 text-white' : actief ? 'bg-accent-light text-accent' : 'bg-surface-2 text-text-muted',
                    )}
                  >
                    {actief ? r.chapter : labels.vanaf.replace('{chapter}', r.chapter)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <Connector />

        {/* Stap 1 → 2 → 3, met eventueel een genest schema naast stap 2 */}
        <div
          className={cn('mx-auto grid gap-x-4', genestZichtbaar ? 'md:grid-cols-[repeat(var(--kolommen),minmax(0,1fr))]' : 'max-w-2xl')}
          // Meer kolommen → alles iets kleiner (zoom), zodat de formules zonder scrollen passen
          style={{ ['--kolommen' as string]: String(1 + keten.length), zoom: [1, 0.94, 0.8, 0.7, 0.62][Math.min(keten.length, 4)] }}
        >
          <div className="min-w-0">
            <Box title={regel ? `${labels.stap1Title} · ${regel.title.toLowerCase()}` : labels.stap1Title} muted={!regel}>
              {vb && (
                <div className="mb-2 text-center">
                  <TeX tex={vb.uitwerking.functie ? markeerFunctie(vb.uitwerking.functie) : `\\boldsymbol{${vb.problem}}`} />
                </div>
              )}
              {regel && (
                <div className="mb-2 rounded-lg bg-accent-light/60 px-3 py-2 text-[0.95em]">
                  <TeX tex={regel.formule} displayMode />
                </div>
              )}
              {vb ? <DelenBlok delen={vb.uitwerking.delen} noot={vb.uitwerking.noot1} /> : <RichMath source={stapTekst(1)} />}
            </Box>
            {tweeStappen ? (
              <>
                <Arrow />
                <Box title={labels.stap2Title} muted={!regel}>
                  {vb ? <Invullen u={vb.uitwerking} /> : <RichMath source={stapTekst(2)} />}
                </Box>
              </>
            ) : (
              <>
                <Arrow />
                <Box title={labels.stap2Title} muted={!regel}>
                  {vb ? (
                    <DelenBlok
                      delen={vb.uitwerking.afgeleiden}
                     
                      noot={vb.uitwerking.noot2}
                      hoeOpen={hoePad[0] ?? null}
                      onHoe={(i) => kiesHoe(0, i)}
                      hoeLabel={labels.toonGenest}
                    />
                  ) : (
                    <RichMath source={stapTekst(2)} />
                  )}
                </Box>
                <Arrow />
                <Box title={labels.stap3Title} muted={!regel}>
                  {vb ? <Invullen u={vb.uitwerking} /> : <RichMath source={stapTekst(3)} />}
                </Box>
              </>
            )}
          </div>

          {keten.map((ouder, d) => (
            <div key={d} className="mt-6 min-w-0 md:mt-0 md:pt-[5.5rem]">
              <SubPaneel ouder={ouder} pad={hoePad} diepte={d} regels={regels} labels={labels} onKies={kiesHoe} />
            </div>
          ))}
        </div>

        {vb && (
          <div className="mx-auto mt-6 max-w-2xl rounded-xl bg-accent px-4 py-3 text-center text-white">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/80">{labels.antwoord}</p>
            <TeX tex={vb.answer} displayMode />
          </div>
        )}
      </div>

      {/* ── Regelpaneel ────────────────────────────────────────────── */}
      {regel && (
        <RegelPaneel
          regel={regel}
          notitie={notities?.[regel.id]}
          topics={(topics ?? []).filter((t) => t.regel === regel.id)}
          chapterSlug={chapterSlug}
          labels={labels}
          onClose={() => {
            setRegelSel(null)
            setVbSel(null)
          }}
        />
      )}
    </div>
  )
}

/* ── Zijvak: uitwerking van één afgeleide, recursief ────────────────── */

function SubPaneel({
  ouder,
  pad,
  diepte,
  regels,
  labels,
  onKies,
}: {
  /** De uitwerking waarin het vraagteken is aangeklikt */
  ouder: Uitwerking
  pad: number[]
  diepte: number
  regels: Regel[]
  labels: SchemaLabels
  onKies: (positie: number, i: number) => void
}) {
  const idx = pad[diepte]
  if (idx === undefined) return null
  const deel = ouder.afgeleiden[idx]
  const hoe = deel?.hoe
  if (!deel || !hoe) return null
  const regel = regels.find((r) => r.id === hoe.regel)
  if (!regel) return null
  const functieDeel = ouder.delen[idx] ?? null
  const u = hoe.uitwerking
  const tweeStappen = regel.id === 'machtsregel'

  return (
    <div className="rounded-xl border-2 border-dashed border-accent/60 bg-surface/80 p-3">
      <MiniBox title={labels.stap0Title}>
        {(u.functie || functieDeel) && (
          <div className="text-center text-[0.95em]">
            <TeX tex={u.functie ? markeerFunctie(u.functie) : `\\boldsymbol{${functieDeel!.naam} = ${functieDeel!.waarde}}`} />
          </div>
        )}
        <div className="mt-1.5 flex justify-center">
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-white">{regel.title}</span>
        </div>
      </MiniBox>
      <Arrow small />
      <MiniBox title={labels.stap1Title}>
        <div className="mb-1.5 rounded-md bg-accent-light/60 px-2 py-1.5 text-[0.85em]">
          <TeX tex={regel.formule} displayMode />
        </div>
        <DelenBlok delen={u.delen} noot={u.noot1} compact />
      </MiniBox>
      {tweeStappen ? (
        <>
          <Arrow small />
          <MiniBox title={labels.stap2Title}>
            <Invullen u={u} compact />
          </MiniBox>
        </>
      ) : (
        <>
          <Arrow small />
          <MiniBox title={labels.stap2Title}>
            <DelenBlok
              delen={u.afgeleiden}
              noot={u.noot2}
              compact
              hoeOpen={pad[diepte + 1] ?? null}
              onHoe={(i) => onKies(diepte + 1, i)}
              hoeLabel={labels.toonGenest}
            />
          </MiniBox>
          <Arrow small />
          <MiniBox title={labels.stap3Title}>
            <Invullen u={u} compact />
          </MiniBox>
        </>
      )}
    </div>
  )
}

/* ── Bouwstenen ──────────────────────────────────────────────────────── */

/**
 * Eén markeerkleur per gevonden letter: het eerste deel (g, of a, of buitenkant)
 * krijgt kleur 1, het tweede (h, n, kern) kleur 2, enz. De afgeleide van een
 * deel (g') krijgt dezelfde kleur als het deel zelf, zodat je in stap 3 ziet
 * waar elk stuk vandaan komt.
 */
const PALET = ['#cfe8f7', '#fde9b6', '#e6d9f5', '#fdd9c4', '#d3f0e0', '#f8d3e5'] as const
const kleur = (i: number) => PALET[i % PALET.length]!

/** Gemarkeerde formule: achtergrondkleur, tekst gewoon zwart. */
const markeer = (i: number, tex: string) => `\\colorbox{${kleur(i)}}{$${tex}$}`

/** Omlijnd blok met per regel `naam = waarde`, elk in de markeerkleur van zijn letter. */
function DelenBlok({
  delen,
  noot,
  compact,
  hoeOpen,
  onHoe,
  hoeLabel,
}: {
  delen: Deel[]
  noot?: string
  compact?: boolean
  /** Index van de afgeleide waarvan de uitwerking open staat */
  hoeOpen?: number | null
  /** Klik op het symbooltje achter een afgeleide met een eigen uitwerking */
  onHoe?: (index: number) => void
  hoeLabel?: string
}) {
  return (
    <div>
      <div className={cn('rounded-lg border border-border bg-surface px-3 py-2', compact && 'px-2 py-1.5 text-[0.9em]')}>
        <div className={cn('flex flex-wrap items-baseline', compact ? 'gap-x-3 gap-y-1' : 'gap-x-6 gap-y-1.5')}>
          {delen.map((d, i) => (
            <div key={i} className="inline-flex flex-col items-start whitespace-nowrap">
              <div className="inline-flex items-baseline gap-1.5">
              <TeX tex={markeer(i, `${d.naam} = ${d.waarde}`)} />
              {d.hoe && onHoe && (
                <button
                  type="button"
                  onClick={() => onHoe(i)}
                  aria-expanded={hoeOpen === i}
                  aria-label={hoeLabel}
                  title={hoeLabel}
                  className={cn(
                    'inline-flex size-5 shrink-0 translate-y-0.5 items-center justify-center rounded-full border text-[11px] font-bold leading-none transition',
                    hoeOpen === i
                      ? 'border-accent bg-accent text-white'
                      : 'border-accent/60 bg-white text-accent hover:bg-accent-light',
                  )}
                >
                  ?
                </button>
              )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {noot && (
        <p className={cn('mt-1.5 text-text-muted', compact ? 'text-xs' : 'text-sm')}>
          <RichMath source={noot} />
        </p>
      )}
    </div>
  )
}

/** De functie met gemarkeerde delen: `{1:…}` in kleur 1, `{2:…}` in kleur 2, enz. Vetgedrukt. */
function markeerFunctie(functie: string): string {
  const gemarkeerd = functie.replace(/\{(\d+):((?:[^{}]|\{[^{}]*\})*)\}/g, (_, nr: string, inhoud: string) =>
    markeer(Number(nr) - 1, `\\boldsymbol{${inhoud}}`),
  )
  return `\\boldsymbol{${gemarkeerd}}`
}

/** Vul {d1}, {a2}, … in met de waarden uit stap 1 en 2, elk in de kleur van zijn letter. */
function vulIn(u: Uitwerking): string {
  return u.ingevuld.replace(/\{([da])(\d+)\}/g, (_, soort: string, nr: string) => {
    const lijst = soort === 'd' ? u.delen : u.afgeleiden
    const i = Number(nr) - 1
    const deel = lijst[i]
    return deel ? markeer(i, deel.waarde) : ''
  })
}

/** Stap 3: de regel symbolisch, dan ingevuld in kleur, dan herleid. */
function Invullen({ u, compact }: { u: Uitwerking; compact?: boolean }) {
  return (
    <div className={cn('flex flex-col', compact ? 'gap-1' : 'gap-1.5')}>
      {u.formule && (
        <div className="text-text-muted">
          <TeX tex={u.formule} displayMode={!compact} />
        </div>
      )}
      <div className="">
        <TeX tex={vulIn(u)} displayMode={!compact} />
      </div>
      {u.herleid && (
        <div className="">
          <TeX tex={`= ${u.herleid}`} displayMode={!compact} />
        </div>
      )}
      {u.noot3 && (
        <p className={cn('text-text-muted', compact ? 'text-xs' : 'text-sm')}>
          <RichMath source={u.noot3} />
        </p>
      )}
    </div>
  )
}


function Box({
  title,
  children,
  highlight,
  muted,
  className,
}: {
  title: string
  children: React.ReactNode
  highlight?: boolean
  muted?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-surface px-4 py-3',
        highlight ? 'border-accent' : 'border-text/70',
        muted && 'text-text-muted',
        className,
      )}
    >
      <p className={cn('mb-1 text-xs font-semibold uppercase tracking-wider', highlight ? 'text-accent' : 'text-text-muted')}>
        {title}
      </p>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}

function MiniBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">{title}</p>
      <div className="text-sm leading-relaxed text-text">{children}</div>
    </div>
  )
}

function Connector() {
  return <div className="mx-auto my-3 h-6 w-0.5 bg-text/60" aria-hidden />
}

function Arrow({ small }: { small?: boolean }) {
  return (
    <div className={cn('flex flex-col items-center', small ? 'my-1' : 'my-2')} aria-hidden>
      <div className={cn('w-0.5 bg-text/60', small ? 'h-3' : 'h-5')} />
      <svg viewBox="0 0 12 8" className={cn('-mt-px fill-text/60', small ? 'h-2 w-3' : 'h-2.5 w-4')}>
        <path d="M0 0h12L6 8z" />
      </svg>
    </div>
  )
}

function RegelPaneel({
  regel,
  notitie,
  topics,
  chapterSlug,
  labels,
  onClose,
}: {
  regel: Regel
  notitie?: string
  topics: HoofdstukTopic[]
  chapterSlug?: string
  labels: SchemaLabels
  onClose: () => void
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl text-text">
            {regel.title}{' '}
            <span className="ml-1 rounded-full bg-accent-light px-2 py-0.5 align-middle font-mono text-xs font-semibold text-accent">
              {regel.chapter}
            </span>
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-muted transition hover:border-accent hover:text-accent"
        >
          {labels.wisSelectie}
        </button>
      </div>

      <div className="mt-4 rounded-lg bg-accent-light/60 px-4 py-4 text-[0.95em]">
        <TeX tex={regel.formule} displayMode />
      </div>

      <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">{labels.herken}</dt>
          <dd className="mt-1 leading-relaxed text-text">
            <RichMath source={regel.herken} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">{labels.antwoordvorm}</dt>
          <dd className="mt-1 leading-relaxed text-text">
            <RichMath source={regel.antwoord} />
          </dd>
        </div>
        {notitie && (
          <div className="md:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">{labels.inDitHoofdstuk}</dt>
            <dd className="mt-1 leading-relaxed text-text">
              <RichMath source={notitie} />
            </dd>
          </div>
        )}
      </dl>

      {topics.length > 0 && chapterSlug && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-sm">
          {topics.map((t) => (
            <Link
              key={t.slug}
              href={`/oefenen?chapter=${encodeURIComponent(chapterSlug)}&topic=${encodeURIComponent(t.slug)}` as '/oefenen'}
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              {labels.oefen}: {t.title} →
            </Link>
          ))}
          {topics.flatMap((t) => t.videos ?? []).map((v) => (
            <Link
              key={v.slug}
              href={`/uitleg-videos?video=${encodeURIComponent(v.slug)}` as '/uitleg-videos'}
              className="text-text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              <span aria-hidden>▶ </span>
              {labels.video}: {v.label}
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
