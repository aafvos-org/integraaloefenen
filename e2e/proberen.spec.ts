import { expect, test } from '@playwright/test'

/**
 * Proberen zonder account: drie sommen van een theoriehoofdstuk, nakijken
 * en stappenplan, en daarna de knop naar registreren. /oefenen blijft dicht.
 */

test('de startpagina begint meteen met een proefsom, zonder account @telefoon', async ({
  page,
}) => {
  // INT-830: de proefsom (niveaukeuze, invoer, Nakijken) staat meteen op de
  // startpagina zelf, niet achter een losse "Probeer"-knop naar een andere
  // pagina. Registreren/Inloggen staan niet meer als knoppen in de kop.
  await page.goto('/nl')
  const kop = page.locator('section').first()
  await expect(kop.getByRole('link', { name: 'Gratis account aanmaken' })).toHaveCount(0)
  await expect(kop.getByRole('link', { name: 'Inloggen', exact: true })).toHaveCount(0)

  await page.getByRole('button', { name: 'Makkelijk' }).click()
  await page.getByPlaceholder('Bijv. x^3/3 + sin(x)').fill('3*x^2 + 5*x')
  await page.getByRole('button', { name: 'Nakijken' }).click()
  await expect(page.getByText('Goed gedaan!')).toBeVisible()

  // Registreren staat er na het nakijken wel, als tekstlink bij het resultaat.
  await expect(page.getByRole('link', { name: 'Verder oefenen, gratis →' })).toHaveAttribute(
    'href',
    /\/registreren/,
  )
})

test('drie proefopgaven zonder account, daarna aanmelden @telefoon', async ({ page }) => {
  await page.goto('/nl/theorie/primitieve')
  await page.getByRole('link', { name: 'Probeer 3 sommen' }).click()

  await expect(page).toHaveURL(/\/proberen\/primitieve/)
  await expect(page.getByRole('heading', { name: 'Som 1 van 3' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Nakijken' })).toBeDisabled()

  await page.getByLabel('Jouw antwoord').fill('x^4/4 + sin(x)')
  await page.getByRole('button', { name: 'Nakijken' }).click()
  await expect(page.getByText('Goed!', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Volgende' }).click()

  await expect(page.getByRole('heading', { name: 'Som 2 van 3' })).toBeVisible()
  await page.getByLabel('Jouw antwoord').fill('2*x^3 + cos(x)')
  await page.getByRole('button', { name: 'Nakijken' }).click()
  await expect(page.getByText('Goed!', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Volgende' }).click()

  await expect(page.getByRole('heading', { name: 'Som 3 van 3' })).toBeVisible()
  await page.getByLabel('Jouw antwoord').fill('5*2^x/ln(2)')
  await page.getByRole('button', { name: 'Nakijken' }).click()
  await expect(page.getByText('Goed!', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Klaar' }).click()

  await expect(
    page.getByRole('heading', {
      name: 'Goed bezig! Maak een gratis account om je voortgang te bewaren en verder te oefenen',
    }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Maak een gratis account' })).toHaveAttribute(
    'href',
    /\/registreren\?van=proberen$/,
  )
  await expect(
    page.getByText('Je klasgenoot kan dezelfde drie sommen maken zonder account.'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Stuur naar een klasgenoot' })).toBeVisible()

  const cookies = await page.context().cookies()
  expect(cookies.some((cookie) => /proberen|volg/i.test(cookie.name))).toBe(false)
})

test('een fout antwoord toont het stappenplan @telefoon', async ({ page }) => {
  await page.goto('/nl/proberen/primitieve')
  await page.getByLabel('Jouw antwoord').fill('x')
  await page.getByRole('button', { name: 'Nakijken' }).click()
  await page.getByRole('button', { name: 'Laat het goede antwoord zien' }).click()
  await expect(page.getByText('Stappenplan: zo hoort het stap voor stap')).toBeVisible()
})

test('oefenen blijft achter de inlog', async ({ page }) => {
  await page.goto('/nl/oefenen')
  await expect(page).toHaveURL(/\/nl\/inloggen$/)
})

test('een antwoordpagina heeft bovenaan een eigen proefknop', async ({ page }) => {
  await page.goto('/nl/voorbeeld/1-over-x')
  await page.getByRole('link', { name: 'Oefen dit zelf — 3 sommen, geen account' }).click()
  await expect(page).toHaveURL(/\/proberen\/primitieve/)
  await expect(page.getByRole('heading', { name: 'Som 1 van 3' })).toBeVisible()
})

test('de voorbeeldopgaven hebben dezelfde proefknop', async ({ page }) => {
  await page.goto('/nl/theorie/k3')
  const knoppen = page.getByRole('link', { name: 'Probeer 3 sommen' })
  await expect(knoppen.first()).toBeVisible()
  await knoppen.last().click()
  await expect(page).toHaveURL(/\/proberen\/k3/)
  await expect(page.getByRole('heading', { name: 'Som 1 van 3' })).toBeVisible()
})
