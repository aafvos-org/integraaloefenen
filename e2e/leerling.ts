import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { expect, type Locator, type Page } from '@playwright/test'

/**
 * De vaste testleerling uit `supabase/seed.sql`. Dit account bestaat alleen
 * op een lokale Supabase, dus het wachtwoord is hier geen geheim.
 */
export const TESTLEERLING = {
  id: 'e2e00000-0000-4000-8000-000000000001',
  email: 'leerling@test.local',
  wachtwoord: 'oefenen123',
}

/** Het testhoofdstuk uit de seed. */
export const TESTHOOFDSTUK = {
  slug: 'e2e',
  titel: 'Testhoofdstuk voor de e2e-tests',
  // Het oefenoverzicht toont alle hoofdstukken onder elkaar en nummert de
  // opgaven per hoofdstuk. "Opgave 1" bestaat dus meerdere keren; zoeken moet
  // binnen dit blok gebeuren.
  anker: '#hoofdstuk-e2e',
}

/**
 * Een verbinding met de lokale testdatabase, om te controleren wat er
 * daadwerkelijk is opgeslagen. Alleen lokaal: hier mag nooit de echte
 * database van integraaloefenen.nl achter zitten.
 */
export function testDatabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Start de tests met `npm run test:e2e`.')
  }
  if (!['localhost', '127.0.0.1', '::1'].includes(new URL(url).hostname)) {
    throw new Error(`Niet lokaal: ${url}.`)
  }
  return createClient(url, serviceKey)
}

/** Inloggen zoals een leerling dat doet: formulier invullen en versturen. */
export async function logIn(
  page: Page,
  account: { email: string; wachtwoord: string } = TESTLEERLING,
) {
  await page.goto('/nl/inloggen')
  await page.locator('input[name="email"]').fill(account.email)
  await page.locator('input[name="password"]').fill(account.wachtwoord)
  await page.getByRole('button', { name: 'Inloggen' }).click()
  await expect(page).toHaveURL(/\/nl\/dashboard/)
}

/**
 * Het menu met "Uitloggen" openen en die knop teruggeven. Op computerformaat
 * zit dat achter het rondje met je initiaal (dat rondje heet naar je
 * gebruikersnaam), op telefoonformaat achter het hamburgermenu.
 *
 * De eerste klik kan aankomen voordat de balk klaarstaat — de balk komt uit
 * een client-component, en in ontwikkelstand bouwt Next een pagina pas als je
 * hem opvraagt. Die klik doet dan niets, en er komt geen tweede gebeurtenis
 * meer: de muis blijft staan waar hij staat. Daarom klikken we opnieuw tot
 * "Uitloggen" er echt is. Dat overkomt een leerling met een trage verbinding
 * ook, en de test moet er niet op omvallen.
 */
export async function menuMetUitloggen(page: Page): Promise<Locator> {
  const smal = (page.viewportSize()?.width ?? 1280) < 768
  const knop = smal
    ? page.getByRole('button', { name: 'Menu openen' })
    : // Het rondje rechtsboven. Het heet naar je gebruikersnaam, en die kan
      // per leerling verschillen; het is wel altijd het laatste klapmenu in
      // de balk.
      page.locator('header button[aria-haspopup="menu"]').last()
  const uitloggen = page.getByRole('button', { name: 'Uitloggen' })

  await expect(async () => {
    // Staat het menu al open, dan zou een tweede klik het juist sluiten.
    if (!(await uitloggen.isVisible())) await knop.click({ timeout: 5_000 })
    await expect(uitloggen).toBeVisible({ timeout: 3_000 })
  }).toPass({ timeout: 60_000, intervals: [500, 1_000, 2_000] })

  return uitloggen
}

/**
 * Uitloggen via het menu, zoals een leerling.
 *
 * Daarna controleren we dat de sessie echt weg is: een pagina achter de inlog
 * stuurt je terug naar het inlogscherm.
 */
export async function logUit(page: Page) {
  const uitloggen = await menuMetUitloggen(page)
  await uitloggen.click()
  // Uitloggen zet je terug op de voorpagina (/ of /nl).
  await expect(page).toHaveURL(/\/(nl)?\/?$/)

  await page.goto('/nl/dashboard')
  await expect(page).toHaveURL(/\/nl\/inloggen/)
}

/**
 * De rondleiding van Aaf wegklikken. Die legt een grijze laag over de pagina
 * waar geen knop meer doorheen komt, dus zonder dit kan een test verder niets
 * meer aanklikken.
 *
 * Hij staat er niet altijd: alleen zolang de leerling hem nog niet heeft
 * weggeklikt (op elk schermformaat). Daarom kijkt dit eerst of hij
 * opkomt in plaats van het af te dwingen. Dát de rondleiding er voor een
 * nieuwe leerling ís, controleert `e2e/nieuwe-leerling.spec.ts` apart.
 */
export async function rondleidingWegklikken(page: Page) {
  const overslaan = page.getByRole('button', { name: 'Overslaan' })

  // De rondleiding komt pas na een halve seconde op.
  const erIsEen = await overslaan
    .waitFor({ state: 'visible', timeout: 3_000 })
    .then(() => true)
    .catch(() => false)
  if (!erIsEen) return

  await overslaan.click()
  await expect(overslaan).toBeHidden()
}

/**
 * Ga naar een opgave in het testhoofdstuk. Het oefenoverzicht opent op het
 * testhoofdstuk (dat leest het uit de URL); daarna is het nog één klik op de
 * tegel, net als bij een leerling.
 *
 * De nummers lopen door over het hele testhoofdstuk, in de volgorde van de
 * onderdelen in `supabase/seed.sql`:
 *   1 goed · 2 fout · 3 zonder + C · 4, 5, 6 drie goed op rij
 */
export async function kiesOpgave(page: Page, nummer: number) {
  await page.goto(`/nl/oefenen?chapter=${TESTHOOFDSTUK.slug}`)

  const tegel = page
    .locator(TESTHOOFDSTUK.anker)
    .getByRole('link', { name: new RegExp(`^Opgave ${nummer}\\.`) })

  // De eerste klik kan aankomen voordat de pagina klaarstaat; die doet dan
  // niets. Dat overkomt een leerling met een trage verbinding ook, en de test
  // moet er niet op omvallen.
  await expect(async () => {
    await tegel.click()
    await expect(antwoordveld(page)).toBeVisible({ timeout: 3_000 })
  }).toPass({ timeout: 60_000, intervals: [500, 1_000, 2_000] })
}

function antwoordveld(page: Page): Locator {
  return page.getByPlaceholder('Bijv. x^3/3 + sin(x)')
}

/**
 * De rode melding op een formulier ("Onjuiste combinatie van e-mailadres en
 * wachtwoord", "Je wachtwoord moet minstens 8 tekens lang zijn").
 *
 * Niet via `getByRole('alert')`: Next.js hangt zelf een lege melder voor
 * schermlezers in elke pagina, en die heeft dezelfde rol. Met `p[role=alert]`
 * houden we alleen de melding over die een leerling ziet staan.
 */
export function foutmelding(page: Page): Locator {
  return page.locator('p[role="alert"]')
}

/** Antwoord intypen en op Nakijken drukken. */
export async function geefAntwoord(page: Page, antwoord: string) {
  const invoer = antwoordveld(page)
  const nakijken = page.getByRole('button', { name: 'Nakijken', exact: true })

  // De knop staat uit zolang het antwoordveld leeg is. Gaat hij aan, dan
  // weten we zeker dat de pagina klaarstaat en dat het antwoord erin staat.
  await expect(async () => {
    await invoer.fill(antwoord)
    await expect(invoer).toHaveValue(antwoord, { timeout: 2_000 })
    await expect(nakijken).toBeEnabled({ timeout: 2_000 })
  }).toPass({ timeout: 60_000, intervals: [500, 1_000, 2_000] })

  await nakijken.click()
}

/**
 * Klap het testhoofdstuk op het dashboard open en geef de regel van één
 * onderwerp terug.
 */
export async function dashboardRegel(
  page: Page,
  onderwerp: string,
): Promise<Locator> {
  const hoofdstuk = page.getByRole('button', { name: TESTHOOFDSTUK.titel })
  const regel = page.locator('li').filter({ hasText: onderwerp }).first()

  await expect(async () => {
    await hoofdstuk.click()
    await expect(regel).toBeVisible({ timeout: 3_000 })
  }).toPass({ timeout: 60_000, intervals: [500, 1_000, 2_000] })

  return regel
}
