import { expect, test, type Page } from '@playwright/test'

import { foutmelding, geefAntwoord, rondleidingWegklikken } from './leerling'
import { linkUitMail, wachtOpMail } from './postbus'

/**
 * Vaste balk "Maak je eerste som" op dashboard en theorie (INT-731): een
 * leerling zonder enig antwoord krijgt op beide plekken een duidelijke duw
 * naar zijn eerste som, en die balk verdwijnt zodra hij er één heeft gemaakt.
 *
 * Een vers, net bevestigd account heeft gegarandeerd nul antwoorden —
 * daarom hier een eigen registratie in plaats van de vaste testleerling uit
 * `supabase/seed.sql` (die heeft al geoefend).
 */

const WACHTWOORD = 'oefenen123'
const BEVESTIGING = 'Bevestig je account bij IntegraalOefenen'
const BALKTEKST = 'Je hebt nog geen enkele som gemaakt.'

function nieuwAdres(): string {
  return `eerste-som-${Date.now()}-${Math.round(Math.random() * 1e6)}@test.local`
}

async function registreerEnBevestig(page: Page): Promise<void> {
  const email = nieuwAdres()
  await page.goto('/nl/registreren')
  await page.locator('input[name="username"]').fill('Leerling ' + email.slice(-12))
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(WACHTWOORD)
  await page.locator('input[name="passwordConfirm"]').fill(WACHTWOORD)
  await page.getByRole('button', { name: 'Account aanmaken' }).click()
  await expect(page.getByRole('status')).toBeVisible()

  const mail = await wachtOpMail(email, BEVESTIGING)
  await page.goto(linkUitMail(mail))
  await expect(page).toHaveURL(/\/nl\/oefenen/)
  await expect(foutmelding(page)).toBeHidden()
  await rondleidingWegklikken(page)
}

function balk(page: Page) {
  return page.locator('[data-meet="eerste-som-balk"]')
}

/**
 * Scrolt naar de onderkant van de pagina en klikt de onderste link ernaartoe.
 * Lukt die klik niet (Playwright's actionability-check ziet dan dat het
 * element "intercepted" wordt door een ander element), dan ligt er iets
 * overheen — precies wat een `fixed` balk zonder onderruimte doet.
 */
async function onderkantIsKlikbaar(page: Page) {
  const link = page.locator('[data-meet="theorie-voorbeeld"]').last()
  await link.scrollIntoViewIfNeeded()
  await link.click({ timeout: 5_000 })
  await expect(page).toHaveURL(/\/nl\/voorbeeld\//)
  await page.goBack()
}

/**
 * Zelf-toets heeft geen `data-meet="theorie-voorbeeld"'-link om op te
 * klikken; de onderste bedienbare invoer van het configuratieformulier is
 * het aantal-veld, vlak boven de knop "Start toets" (die pas klikbaar wordt
 * na een keuze bij Bronnen). Focus lukt niet als de vaste balk eroverheen
 * ligt — zelfde soort check als `onderkantIsKlikbaar`, maar zonder
 * destructieve navigatie.
 */
async function onderkantZelfToetsIsKlikbaar(page: Page) {
  const countInput = page.locator('input[type="number"]')
  await countInput.scrollIntoViewIfNeeded()
  await countInput.click({ timeout: 5_000 })
  await expect(countInput).toBeFocused()
}

test('leerling met 0 antwoorden ziet de balk op dashboard en theorie, en die verdwijnt na zijn eerste antwoord @telefoon', async ({
  page,
}) => {
  await test.step('vers account registreren en bevestigen', async () => {
    await registreerEnBevestig(page)
  })

  await test.step('balk zichtbaar op het dashboard', async () => {
    await page.goto('/nl/dashboard')
    await expect(page.getByText(BALKTEKST)).toBeVisible()
    await expect(balk(page)).toBeVisible()
  })

  await test.step('balk zichtbaar op het theorie-overzicht, en dekt de onderste inhoud niet af', async () => {
    await page.goto('/nl/theorie')
    await expect(page.getByText(BALKTEKST)).toBeVisible()
    await onderkantIsKlikbaar(page)
  })

  await test.step('balk zichtbaar op een theorie-hoofdstukpagina, en dekt de onderste inhoud niet af', async () => {
    await page.goto('/nl/theorie/primitieve')
    await expect(balk(page)).toBeVisible()
    await onderkantIsKlikbaar(page)
  })

  await test.step('balk zichtbaar op zelf-toets, met korte toelichting, en dekt de onderste inhoud niet af (INT-750)', async () => {
    await page.goto('/nl/zelf-toets')
    await expect(page.getByText(BALKTEKST)).toBeVisible()
    await expect(
      page.getByText('Een zelf-toets werkt beter als je eerst een paar sommen hebt gemaakt.'),
    ).toBeVisible()
    await onderkantZelfToetsIsKlikbaar(page)
  })

  await test.step('balk op de hoofdstukpagina opent de eerste som', async () => {
    const knop = balk(page)
    await expect(knop).toBeVisible()

    await knop.click()
    await expect(page).toHaveURL(/\/nl\/oefenen/)
    await expect(page.getByText('Bepaal de primitieve van:')).toBeVisible()
  })

  await test.step('een eerste antwoord geven (fout maakt niet uit, moet wel geldige wiskunde zijn)', async () => {
    await geefAntwoord(page, 'x^99')

    // Wachten tot het antwoord echt verwerkt is (goed of fout), anders
    // race je tegen het wegschrijven van session_answers_new.
    await expect(
      page
        .getByText('Goed!', { exact: true })
        .or(page.getByRole('button', { name: 'Laat het goede antwoord zien' })),
    ).toBeVisible()
  })

  await test.step('balk weg op dashboard, theorie en zelf-toets na dat antwoord', async () => {
    await page.goto('/nl/dashboard')
    await expect(balk(page)).toBeHidden()

    await page.goto('/nl/theorie')
    await expect(balk(page)).toBeHidden()
    // Geen race met de client-fetch: even de tijd geven om "toon: false" op
    // te halen voordat we concluderen dat hij écht nooit verschijnt.
    await page.waitForTimeout(1_000)
    await expect(balk(page)).toBeHidden()

    await page.goto('/nl/zelf-toets')
    await expect(balk(page)).toBeHidden()
  })
})
