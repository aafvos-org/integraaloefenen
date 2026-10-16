import { expect, test } from '@playwright/test'

import { TESTHOOFDSTUK, TESTLEERLING, logIn, testDatabase } from './leerling'

/**
 * Een zelf-toets samenstellen zoals een leerling dat doet: onderwerpen
 * aanvinken, een aantal kiezen, op Start toets drukken — en dan moet de
 * eerste vraag er staan.
 *
 * Dit liep stuk: de toets werd wel aangemaakt maar bleef leeg, de leerling
 * kreeg een foutmelding en er bleef een onbruikbare toets achter (INT-80).
 */

test.beforeEach(async ({ page }) => {
  await logIn(page)
})

/** Het testhoofdstuk aanvinken en een toets van `aantal` vragen starten. */
async function maakToets(page: import('@playwright/test').Page, aantal: number) {
  await page.goto('/nl/zelf-toets')

  // Het hele testhoofdstuk in één klik; alle onderdelen eronder gaan aan.
  const hoofdstuk = page.getByRole('checkbox', { name: TESTHOOFDSTUK.titel })
  await expect(async () => {
    await hoofdstuk.click()
    await expect(hoofdstuk).toHaveAttribute('aria-checked', 'true', { timeout: 3_000 })
  }).toPass({ timeout: 60_000, intervals: [500, 1_000, 2_000] })

  // "Alle vragen": zo hangt de test niet af van wat de leerling eerder deed.
  await page.getByRole('radio', { name: /Alle vragen/ }).check()

  const aantalVeld = page.locator('input[type="number"]')
  await aantalVeld.fill(String(aantal))

  await page.getByRole('button', { name: 'Start toets' }).click()
  await expect(page).toHaveURL(/\/nl\/zelf-toets\/loop\//)
}

test('een zelf-toets aanmaken geeft meteen de eerste vraag @telefoon', async ({
  page,
}) => {
  await maakToets(page, 3)

  await expect(page.getByText('Vraag 1 van 3')).toBeVisible()
  await expect(page.getByPlaceholder('Bijv. x^3/3 + sin(x)')).toBeVisible()

  // En er staat geen foutmelding op de plek waar de toets werd samengesteld.
  await expect(page.getByText(/lukte niet/)).toBeHidden()
})

test('de vragen staan ook echt in de database', async ({ page }) => {
  await maakToets(page, 4)

  const sessionId = new URL(page.url()).pathname.split('/').pop()!
  const db = testDatabase()

  const { count } = await db
    .from('custom_test_questions')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)

  expect(count).toBe(4)
})

test('er blijft geen zelf-toets zonder vragen achter', async ({ page }) => {
  await maakToets(page, 2)

  const db = testDatabase()

  const { data: toetsen } = await db
    .from('user_sessions_new')
    .select('id')
    .eq('user_id', TESTLEERLING.id)
    .eq('session_type', 'custom_test')

  const { data: vragen } = await db
    .from('custom_test_questions')
    .select('session_id')
    .in('session_id', (toetsen ?? []).map((t) => t.id))

  const gevuld = new Set((vragen ?? []).map((r) => r.session_id))
  const leeg = (toetsen ?? []).filter((t) => !gevuld.has(t.id))

  expect(leeg).toEqual([])
})
