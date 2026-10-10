import { expect, test } from '@playwright/test'

import { dashboardRegel, geefAntwoord, kiesOpgave, logIn } from './leerling'

/**
 * De weg van een leerling, van begin tot eind nagelopen in een echte browser:
 * inloggen → oefenen → antwoord nakijken → voortgang op het dashboard.
 *
 * De opgaven komen uit het testhoofdstuk in `supabase/seed.sql`, zodat de
 * tests niet omvallen als de echte oefenstof verandert. Het zijn allemaal
 * kale primitiveer-opgaven: deel 2 van de driedeling.
 */

test.beforeEach(async ({ page }) => {
  await logIn(page)
})

test('boven de opgave staat wat je moet doen @telefoon', async ({ page }) => {
  // Opgave 1 is een kale primitiveer-opgave: f(x) = x^2. Zonder regel erboven
  // staat er nergens of je moet primitiveren of differentiëren.
  await kiesOpgave(page, 1)

  await expect(page.getByText('Bepaal de primitieve van:')).toBeVisible()
})

test('een goed antwoord wordt goedgekeurd @telefoon', async ({ page }) => {
  // Opgave 1: f(x) = x^2  →  F(x) = 1/3x^3 + c
  await kiesOpgave(page, 1)

  await geefAntwoord(page, '1/3x^3 + c')

  await expect(page.getByText('Goed!', { exact: true })).toBeVisible()
  // Geen vast getal: deze test draait twee keer (computer én telefoon) op
  // dezelfde oefenleerling, dus de reeks staat de tweede keer een hoger.
  await expect(page.getByText(/Streak: \d\/3/)).toBeVisible()
})

test('een fout antwoord wordt afgekeurd', async ({ page }) => {
  // Opgave 2: f(x) = x^3  →  F(x) = 1/4x^4 + c. "3x^2" is de afgeleide.
  await kiesOpgave(page, 2)

  await geefAntwoord(page, '3x^2')

  await expect(
    page.getByRole('button', { name: 'Laat het goede antwoord zien' }),
  ).toBeVisible()
  await expect(page.getByText('Goed!', { exact: true })).toBeHidden()

  // En het goede antwoord staat er netjes als je erom vraagt.
  await page.getByRole('button', { name: 'Laat het goede antwoord zien' }).click()
  await expect(page.getByText('Juiste antwoord')).toBeVisible()
})

test('een primitieve zonder + C wordt goedgekeurd', async ({ page }) => {
  // Opgave 3: f(x) = 2x  →  F(x) = x^2 + c. De leerling schrijft "x^2"; de
  // primitieve klopt, alleen de integratieconstante ontbreekt.
  await kiesOpgave(page, 3)

  await geefAntwoord(page, 'x^2')

  await expect(page.getByText('Goed!', { exact: true })).toBeVisible()
})

test('na drie goede antwoorden staat het onderdeel op beheerst', async ({
  page,
}) => {
  const opgaven = [
    { nummer: 4, antwoord: 'x^3 + c' }, // f(x) = 3x^2
    { nummer: 5, antwoord: 'x^4 + c' }, // f(x) = 4x^3
    { nummer: 6, antwoord: 'x^5 + c' }, // f(x) = 5x^4
  ]

  for (const [i, opgave] of opgaven.entries()) {
    await kiesOpgave(page, opgave.nummer)
    await geefAntwoord(page, opgave.antwoord)

    if (i < opgaven.length - 1) {
      await expect(page.getByText(`Streak: ${i + 1}/3`)).toBeVisible()
    } else {
      await expect(page.getByText('Geweldig, onderdeel afgerond!')).toBeVisible()
    }
  }

  // En dat zie je terug op het dashboard.
  await page.goto('/nl/dashboard')
  const regel = await dashboardRegel(page, 'Beheersen (e2e)')
  await expect(regel).toContainText('1/1')
  await expect(regel).toContainText('100%')
})
