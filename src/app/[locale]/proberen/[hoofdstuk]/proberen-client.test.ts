import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('proberen-client klik op opgavetekst en formule (INT-504)', () => {
  it('focust het antwoordveld bij een klik, in plaats van niets te doen', () => {
    const bron = readFileSync(
      join(process.cwd(), "src/app/[locale]/proberen/[hoofdstuk]/proberen-client.tsx"),
      'utf8',
    )

    // Vóór deze fix stond data-geen-dode-klik alleen op de formule-div: dat
    // onderdrukte de meting (INT-434), maar een klik op de opdracht-tekst
    // ("Bepaal de primitieve van:") of de formule zelf deed nog steeds niets
    // (INT-504). Beide horen nu samen in één blok te zitten dat een klik
    // oppakt en het bestaande antwoordveld focust — zelfde patroon als
    // home-demo.tsx (INT-461).
    expect(bron).toMatch(/function focusAntwoord\(\) \{[\s\S]*?invoer\.current\?\.focus\(\)/)
    expect(bron).toMatch(
      /data-geen-dode-klik\s*\n\s*onClick=\{focusAntwoord\}[\s\S]{0,400}\{t\(opdracht\)\}[\s\S]{0,400}<OpgaveTekst/,
    )
  })
})

describe('proberen-client klik op formule in de uitwerking (INT-580)', () => {
  it('markeert het goede antwoord en de uitwerkingsstappen als geen dode klik', () => {
    const bron = readFileSync(
      join(process.cwd(), "src/app/[locale]/proberen/[hoofdstuk]/proberen-client.tsx"),
      'utf8',
    )

    // Na het tonen van de uitwerking bevat de kaart twee formuleblokken die
    // geen invoerveld hebben om naar te focussen: "Juiste antwoord" en de
    // genummerde stappenlijst (RichMath/KaTeX). Zonder data-geen-dode-klik
    // telt de meting een tik daarop als dode klik (zie INT-434 voor hetzelfde
    // patroon bij de opgavetekst).
    expect(bron).toMatch(
      /data-geen-dode-klik[\s\S]{0,120}Juiste antwoord[\s\S]{0,200}<GoedAntwoord/,
    )
    expect(bron).toMatch(
      /data-geen-dode-klik[\s\S]{0,150}\{t\('stepsTitle'\)\}[\s\S]{0,600}<RichMath/,
    )
  })
})

describe('proberen-client klik op het succesvlak na een goed antwoord (INT-615)', () => {
  it('stuurt een tik op "Goed!" of het vlak eromheen ook naar de volgende som', () => {
    const bron = readFileSync(
      join(process.cwd(), "src/app/[locale]/proberen/[hoofdstuk]/proberen-client.tsx"),
      'utf8',
    )

    // Vóór deze fix werkte alleen de knop zelf: een tik op het groene vlak of
    // op de tekst "Goed!" deed niets (dode klik, zie INT-609). Het vlak krijgt
    // nu dezelfde onClick als de knop, plus data-geen-dode-klik — zelfde
    // patroon als focusAntwoord hierboven (INT-504).
    expect(bron).toMatch(
      /data-geen-dode-klik\s*\n\s*onClick=\{verder\}[\s\S]{0,200}\{t\('correct'\)\}/,
    )

    // De knop zelf mag geen eigen onClick meer hebben: anders bubbelt een tik
    // erop naar het vlak eromheen en wordt verder() twee keer aangeroepen,
    // waardoor er een som wordt overgeslagen.
    const goedBlok = bron.slice(bron.indexOf("soort === 'goed'"))
    const knopBlok = goedBlok.slice(0, goedBlok.indexOf('</div>'))
    expect(knopBlok).not.toMatch(/data-meet="proberen-volgende"[^>]*onClick=/)
    expect(knopBlok).not.toMatch(/onClick=\{verder\}[^>]*data-meet="proberen-volgende"/)
  })
})
