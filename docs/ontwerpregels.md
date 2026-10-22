# Ontwerpregels — integraaloefenen.nl

Wat er al is en goed werkt, vastgelegd zodat nieuwe schermen hetzelfde aanvoelen.
Bij twijfel: kijk hoe het al het vaakst gedaan is en doe dat na.

**2026-10-22** — eerste versie (UX-ontwerper), op basis van `globals.css`,
`src/components/ui.tsx` en de schermen zoals ze nu op de site staan.

## Kleuren
- **Groen (`accent`)** = goed, actie, primair. Hoofdknoppen, het goede antwoord,
  bevestiging (`SuccessBanner`).
- **Rood (`accent-2`)** = fout, verwijderen, foutmelding (`ErrorBanner`). Nooit
  voor iets anders, ook niet als "opvallende" kleur.
- **Oranje (`warn`)** = waarschuwing, een badge die aandacht vraagt zonder fout
  te zijn.
- **Achtergrond** `bg` (zacht beige) voor de pagina, `surface` (wit) voor
  kaarten erop, `surface-2` voor een vlak ietsje donkerder dan een kaart (bv.
  een invoerveld binnen een kaart). Tekst: `text` voor gewone tekst, `text-muted`
  voor bijschrift en hints.

## Lettergrootte en kopjes
- Koppen (h1, h2) staan in `font-serif` (DM Serif), lopende tekst in
  `font-sans` (DM Sans). Dat contrast is bewust: serif = kop, sans = alles
  waarin een leerling leest of typt.
- h1: `text-3xl` à `text-4xl`, op computer groter (`sm:text-5xl`). h2:
  `text-2xl` à `text-3xl`. Eén h1 per pagina.

## Knoppen
- **Hoofdknop** (`Button variant="primary"`): gevulde groene knop, witte tekst.
  Eén per scherm of sectie — de belangrijkste volgende stap ("Probeer drie
  sommen", "Nakijken"). Niet twee hoofdknoppen naast elkaar.
- **Tweede knop** (`variant="secondary"`): witte knop met rand, voor een
  gelijkwaardig maar niet dwingend alternatief ("Inloggen" naast "Account
  aanmaken").
- **Tekstlink**: onderstreept bij hover, geen rand of vulling, voor iets dat
  weinig gewicht heeft (overslaan, een hint, terug).
- Elke knop is minstens 44 pixels hoog (`min-h-11`), ook een tekstlink die
  als knop fungeert. Dat geldt op elk schermformaat, niet alleen telefoon.
- Knoptekst is een werkwoord, kort: "Opslaan", "Opnieuw proberen", niet
  "Opslaan van je antwoord" of een los zelfstandig naamwoord.

## Afstanden, kaarten en tegels
- Een kaart: witte achtergrond, `rounded-2xl`, dunne rand (`border-border`),
  padding `p-4` tot `p-6`. Op een grijzere achtergrond (`surface-2`) voor een
  kaart die zelf weer in een kaart zit (bv. video-uitleg naast de oefenvraag).
- Ruimte tussen secties op een pagina: minstens `mt-6`; grote overgangen
  (bv. tussen het bovenblok en de volgende sectie op de homepage) `mt-12` tot
  `mt-20`.

## Wat klikbaar is
- Klikbaar = een knop zoals hierboven, of een onderstreepte link in de
  hoofdkleur. Niets anders krijgt een rand, schaduw of kleur die op "klik mij"
  lijkt als het niet klikbaar is.
- Een hele kaart die naar een andere pagina linkt (bv. een opgave in een lijst)
  is ook met toetsenbord en voor een schermlezer als geheel aanklikbaar
  (`<a>` of `<button>` om de kaart heen, niet alleen om een woordje erin).

## Formules
- Een formule moet passen binnen 390 pixels breed zonder dat er iets afvalt.
  Past hij niet, dan krijgt de formule zelf een smal, scrollbaar vak
  (`min-w-0 overflow-x-auto`) — niet de hele pagina breder laten worden.
  Zie `study-card.tsx` en `theorie-client.tsx` voor het patroon.
- Een losse formule die op haar eigen regel hoort te staan: `displayMode`
  (`<Math displayMode />` of `<OpgaveTekst>`), niet tussen de lopende tekst
  proppen.

## Het poppetje (Aaf)
- Rechtsonder in beeld, met ruimte eromheen (`bottom-4 right-4`), nooit boven
  op een knop, invoerveld of tekst die een leerling op dat moment nodig heeft.
- Tijdens de rondleiding dimt de rest van het scherm; daarbuiten is het
  poppetje klein en rustig (opacity omlaag tot je erover hovert of tikt).

## Meldingen, lege schermen en laden
- Foutmelding: `ErrorBanner` — rode achtergrond, rode rand, rode tekst, korte
  Nederlandse zin. Nooit de ruwe foutmelding van de server of database tonen
  (vaak Engels, zegt een leerling niets) — zie `foutpagina.tsx`.
- Succes: `SuccessBanner`, dezelfde opbouw maar groen.
- Laden: de draaiende cirkel (`PageSpinner`), gecentreerd, met `aria-live` erbij
  zodat een schermlezer het ook merkt. Geen kale witte pagina tijdens het laden.
- Een crash-pagina legt in twee zinnen uit wat er aan de hand is en geeft één
  knop: opnieuw proberen.

## Taal in knoppen en kopjes
- Je-vorm, geen Engelse termen, geen "klik hier".
- Kopjes zijn een korte aankondiging ("Je voortgang"), geen hele zin.
- Knoppen zijn een werkwoord in de gebiedende wijs: "Opslaan", "Oefenen",
  "Terug naar de theorie".
