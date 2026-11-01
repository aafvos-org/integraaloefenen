/**
 * Een bruikbare default-schuilnaam voor een nieuwe Google- of
 * mail-aanmelder (INT-704).
 *
 * Zonder default moest iemand eerst zelf een naam bedenken voordat hij verder
 * kon; met een ingevulde, bewerkbare naam is "Verder oefenen" vaak al genoeg.
 * De naam is nooit de echte naam van de leerling (geen gegevens van Google
 * erin) en de combinatie van bijvoeglijk naamwoord, zelfstandig naamwoord en
 * een getal van 4 cijfers houdt botsingen met bestaande gebruikersnamen
 * zeldzaam.
 */

const BIJVOEGLIJK = [
  'Vlotte',
  'Slimme',
  'Rappe',
  'Scherpe',
  'Knappe',
  'Pientere',
  'Handige',
  'Vlugge',
  'Stevige',
  'Heldere',
]

const ZELFSTANDIG = [
  'Integraal',
  'Parabool',
  'Asymptoot',
  'Tangens',
  'Cosinus',
  'Afgeleide',
  'Vergelijking',
  'Limiet',
  'Vector',
  'Exponent',
  'Logaritme',
  'Functie',
  'Grafiek',
  'Wortel',
  'Matrix',
]

export function genereerStandaardNaam(random: () => number = Math.random): string {
  const bijvoeglijk = BIJVOEGLIJK[Math.floor(random() * BIJVOEGLIJK.length)]
  const zelfstandig = ZELFSTANDIG[Math.floor(random() * ZELFSTANDIG.length)]
  const nummer = 1000 + Math.floor(random() * 9000)
  return `${bijvoeglijk} ${zelfstandig}${nummer}`
}
