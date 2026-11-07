import { expect, test } from '@playwright/test'

/**
 * Op het overzicht (/theorie, alle hoofdstukken onder elkaar met interne
 * scroll-spy) stond de hoofdstukkenknop/-lijst op telefoon in de korte
 * zijbalk, in normale documentflow: een stuk scrollen liet hem meteen uit
 * beeld verdwijnen (INT-661, dezelfde bug als INT-659 op de hoofdstukpagina's
 * zelf). Nu staat er een sticky knop die bereikbaar blijft, en die springt
 * naar het juiste anker op déze pagina — in tegenstelling tot de
 * hoofdstukpagina's navigeert /theorie niet naar een andere route. Op
 * computer blijft de gewone zijbalk gewoon staan en is de sticky knop
 * (lg:hidden) niet zichtbaar.
 */
test('de hoofdstukkenlijst op /theorie blijft bereikbaar na scrollen: zijbalk op computer, sticky knop op telefoon @telefoon', async ({
  page,
}) => {
  const breed = (page.viewportSize()?.width ?? 1280) >= 1024

  await page.goto('/nl/theorie')

  const stickyKnop = page.getByRole('button', { name: /Kies een hoofdstuk: De primitieve en de standaardintegralen/ })

  if (breed) {
    await expect(page.locator('aside')).toBeVisible()
    await expect(stickyKnop).toBeHidden()
    return
  }

  await expect(page.locator('aside')).toBeHidden()
  await expect(stickyKnop).toBeVisible()

  // Een flink stuk naar beneden scrollen, ver voorbij het eerste hoofdstuk.
  await page.evaluate(() => window.scrollBy(0, 4000))
  await expect(stickyKnop).toBeInViewport()

  await stickyKnop.click()
  const dialoog = page.getByRole('dialog', { name: 'Kies een hoofdstuk' })
  await expect(dialoog).toBeVisible()

  await dialoog.getByRole('button', { name: /substitutiemethode/i }).click()
  await expect(dialoog).toBeHidden()

  // Gesprongen naar het anker op dezelfde pagina, niet genavigeerd.
  await expect(page).toHaveURL(/\/nl\/theorie$/)
  await expect(page.getByRole('heading', { name: /De substitutiemethode/ })).toBeInViewport()
  await expect(page.getByRole('button', { name: /substitutiemethode/i })).toBeVisible()
})
