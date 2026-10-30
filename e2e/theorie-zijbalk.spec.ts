import { expect, test } from '@playwright/test'

/**
 * Op computer staat de hoofdstukkenzijbalk vast open naast de inhoud. Op
 * telefoon is er geen zijbalk: in plaats daarvan staat er een knop met het
 * huidige hoofdstuk die een scherm met de hoofdstukkenlijst opent (INT-581,
 * INT-659).
 */
test('de hoofdstukkenzijbalk staat open op computer @telefoon', async ({ page }) => {
  const breed = (page.viewportSize()?.width ?? 1280) >= 1024

  await page.goto('/nl/theorie/k3')

  // De titel en de knop om te oefenen moeten meteen in beeld staan.
  // "Probeer 3 sommen" staat twee keer op de pagina (ook onderaan bij de
  // voorbeeldopgaven), dus de eerste.
  await expect(page.getByRole('heading', { name: 'K.3 – Cyclometrische functies' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Probeer 3 sommen' }).first()).toBeVisible()

  if (breed) {
    const toggle = page.getByRole('button', { name: /zijbalk/i })
    const anderHoofdstuk = page.getByRole('link', { name: /substitutiemethode/i })
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(anderHoofdstuk).toBeVisible()
  } else {
    await expect(page.getByRole('button', { name: /zijbalk/i })).toBeHidden()
  }
})

/**
 * INT-659: de mobiele hoofdstukknop stond in normale documentflow in de
 * (korte) zijbalk en scrolde daardoor mee uit beeld — na een stuk scrollen
 * moest je eerst terug naar boven om van hoofdstuk te wisselen. De knop staat
 * nu `sticky` als eerste kind van de lange scrollende inhoud, dus blijft hij
 * bereikbaar ongeacht de scrolpositie.
 */
test('de hoofdstukknop op telefoon blijft bereikbaar na scrollen en wisselt van hoofdstuk @telefoon', async ({
  page,
}) => {
  // Alleen op telefoonformaat: vanaf het lg-breakpoint is deze knop `lg:hidden`
  // en staat de zijbalk vast naast de inhoud (zie de andere test hierboven).
  test.skip((page.viewportSize()?.width ?? 1280) >= 1024, 'alleen relevant op telefoonformaat')

  await page.goto('/nl/theorie/k3')

  const hoofdstukKnop = page.getByRole('button', { name: 'K.3 – Cyclometrische functies' })
  await expect(hoofdstukKnop).toBeInViewport()

  await page.mouse.wheel(0, 700)
  await expect(page.evaluate(() => window.scrollY)).resolves.toBeGreaterThan(300)
  await expect(hoofdstukKnop).toBeInViewport()

  await hoofdstukKnop.click()
  const dialoog = page.getByRole('dialog', { name: 'Kies een hoofdstuk' })
  await expect(dialoog).toBeVisible()

  await dialoog.getByRole('link', { name: /substitutiemethode/i }).click()
  await expect(dialoog).toBeHidden()
  await expect(page).not.toHaveURL(/k3$/)
})

/**
 * INT-657: een hoofdstukpagina is een eigen route (geen gedeelde layout), dus
 * wordt hij bij elke navigatie volledig ver- en hermonteerd. Zonder eigen
 * ingreep (zie `useScrollrestauratie` in theorie-layout.tsx) scrolt de
 * terugknop dan altijd naar boven in plaats van terug naar de leespositie.
 */
test('scrollpositie op een hoofdstukpagina blijft bewaard na terugknop @telefoon', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1280) >= 1024, 'alleen relevant op telefoonformaat')

  await page.goto('/nl/theorie/k3')

  await page.mouse.wheel(0, 700)
  await expect(page.evaluate(() => window.scrollY)).resolves.toBeGreaterThan(300)
  // De scrollpositie wordt gedebouncet opgeslagen (150ms); wacht dat af voor
  // we wegnavigeren.
  await page.waitForTimeout(300)
  const positieVoorWeg = await page.evaluate(() => window.scrollY)

  await page.getByRole('button', { name: /cyclometrische functies/i }).click()
  await page.getByRole('dialog', { name: 'Kies een hoofdstuk' }).getByRole('link', { name: /substitutiemethode/i }).click()
  await expect(page).toHaveURL(/substitutiemethode$/)

  await page.goBack()
  await expect(page).toHaveURL(/k3$/)
  await expect(page.evaluate(() => window.scrollY)).resolves.toBeGreaterThan(positieVoorWeg - 50)
})
