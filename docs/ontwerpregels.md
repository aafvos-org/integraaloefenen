# Ontwerpregels — integraaloefenen.nl

Vastgelegd vanuit wat er al staat (`src/app/globals.css`, `src/components/ui.tsx`).
Bij twijfel: de variant die het vaakst voorkomt. Wijzig je iets, zet er een
datum en reden bij.

## Kleuren
- **Groen (`accent`)**: goed, actie, de hoofdknop. Ook de lichte variant
  (`accent-light`) voor een goed-melding of een rustige badge.
- **Rood (`accent-2`)**: fout, een foutmelding. Nooit voor een gewone
  waarschuwing.
- **Oranje (`warn`)**: middenmoot (bijvoorbeeld niveau "gemiddeld"), geen fout.
- **Achtergrond**: `bg` voor de pagina, `surface` (wit) voor kaarten,
  `surface-2` voor een licht vlak binnen een kaart (bijv. een hover).

## Lettergrootte en kopjes
- `font-serif` voor elk kopje (h1 t/m h3), `font-sans` voor lopende tekst.
- h1: `text-4xl` (`sm:text-5xl`). h2: `text-3xl`. Kaarttitel (h3): `text-xl`.

## Knoppen
- **Hoofdknop**: effen groen (`bg-accent text-white`). Eén per scherm, voor de
  belangrijkste volgende stap.
- **Tweede knop**: rand + witte achtergrond (`border-border bg-surface`).
  Gebruik hem voor een nette, duidelijk minder belangrijke keuze dan de
  hoofdknop ernaast — **niet** voor twee acties die voor de leerling even
  zwaar wegen (zie het "Beslissing"-ticket over "Account aanmaken" naast
  "Inloggen").
- **Tekstlink**: groene tekst, onderstreept (`underline underline-offset-2`)
  zodra hij los in lopende tekst staat. Een link die in een eigen regel of
  knoprij staat mag zonder onderstreping, zolang de kleur hem al als link
  verraadt.
- Minstens 44 pixels hoog (`min-h-11`). Alle knoppen uit `ui.tsx` voldoen
  hieraan; nieuwe eigen knoppen (buiten `Button`) ook.

## Afstanden, kaarten en tegels
- Kaart: `rounded-xl` of `rounded-2xl`, `border border-border`,
  `bg-surface`, padding `p-5`/`p-6`.
- Ruimte tussen secties op een pagina: `mt-14` tot `mt-20`.

## Wat is klikbaar?
- Klikbaar = groene tekst, of een knop/kaart met rand. Grijze tekst
  (`text-muted`) is nooit klikbaar.
- Een tab in een segmented control (bijv. de niveaus Makkelijk/Gemiddeld/
  Moeilijk) moet **ook niet-geselecteerd** herkenbaar zijn als knop: een
  zwakke hover-only stijl (alleen tekstkleur, geen rand) oogt als vaste tekst.
  Geef niet-geselecteerd minimaal een duidelijke hover- of randstijl.

## Formules
- Binnen 390 pixels breed, nooit afgekapt: test elke nieuwe formuleweergave
  op telefoonformaat.
- Woordvoorbeeld (`VOORBEELD —`) in schreefloos, de formule zelf in
  `font-serif` via KaTeX.

## Het poppetje (welkomst-rondleiding)
- Vast rechtsonder (`fixed bottom-4 right-4`), nooit een knop of invoerveld
  bedekken.
- Eén ring tegelijk rond het uitgelichte element; nooit twee dingen
  tegelijk aanwijzen.

## Meldingen, lege schermen en laden
- Foutmelding: rode rand + lichtrode achtergrond, `role="alert"`.
- Succesmelding: groene rand + lichtgroene achtergrond, `role="status"`.
- Een melding na een fout antwoord hoort **direct** de uitleg te tonen, niet
  achter een extra tik verstopt — zie het ticket over `/proberen` versus de
  proefsom op de startpagina.

## Taal in knoppen en kopjes
- Kort, je-vorm, een werkwoord op de knop: "Nakijken", "Account aanmaken",
  "Inloggen", niet "Verzenden" of "OK".

## Wijzigingen
- 2026-10-22: eerste versie, vastgelegd bij het eerste UX-rondje (INT-463).
