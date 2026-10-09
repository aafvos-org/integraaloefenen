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
export async function logIn(page: Page) {
  await page.goto('/nl/inloggen')
  await page.locator('input[name="email"]').fill(TESTLEERLING.email)
  await page.locator('input[name="password"]').fill(TESTLEERLING.wachtwoord)
  await page.getByRole('button', { name: 'Inloggen' }).click()
  await expect(page).toHaveURL(/\/nl\/dashboard/)
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
  return page.getByPlaceholder('Bijv. 12x^2')
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
