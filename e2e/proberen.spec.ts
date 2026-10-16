import { expect, test } from '@playwright/test'

/**
 * Proberen zonder account: drie sommen van een theoriehoofdstuk, nakijken
 * en stappenplan, en daarna de knop naar registreren. /oefenen blijft dicht.
 */

test('de startpagina begint met drie sommen zonder account @telefoon', async ({ page }) => {
  await page.goto('/nl')
  const kop = page.locator('section').first()
  const proberen = kop.getByRole('link', { name: 'Probeer drie sommen', exact: true })
  const aanmelden = kop.getByRole('link', { name: 'Gratis account aanmaken', exact: true })
  const inloggen = kop.getByRole('link', { name: 'Inloggen', exact: true })
  await expect(proberen).toHaveAttribute('href', /\/proberen\/primitieve$/)
  const volgorde = await kop.evaluate((el) =>
    [...el.querySelectorAll('a')].map((a) => a.textContent?.trim() ?? ''),
  )
  expect(volgorde.indexOf('Probeer drie sommen')).toBeLessThan(
    volgorde.indexOf('Gratis account aanmaken'),
  )
  expect(volgorde.indexOf('Gratis account aanmaken')).toBeLessThan(volgorde.indexOf('Inloggen'))
  await expect(aanmelden).toBeVisible()
  await expect(inloggen).toBeVisible()
  await proberen.click()
  await expect(page).toHaveURL(/\/proberen\/primitieve/)
  await expect(page.getByRole('heading', { name: 'Som 1 van 3' })).toBeVisible()
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

test('een antwoordpagina heeft dezelfde proefknop', async ({ page }) => {
  await page.goto('/nl/voorbeeld/1-over-x')
  await page.getByRole('link', { name: 'Probeer 3 sommen' }).click()
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
