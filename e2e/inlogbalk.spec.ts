import { expect, test, type Page } from '@playwright/test'

import { logIn, menuMetUitloggen, rondleidingWegklikken } from './leerling'

/**
 * Na inloggen stuurt de site je door zonder de pagina helemaal opnieuw te
 * laden. De balk zit in de opmaak en blijft dan staan. Hij moet toch meteen
 * de ingelogde links tonen, en na uitloggen weer de uitgelogde.
 *
 * Op telefoonformaat zitten die links achter het menu (MobileNav).
 */

async function menuOpenenOpTelefoon(page: Page) {
  const smal = (page.viewportSize()?.width ?? 1280) < 768
  if (!smal) return
  const openen = page.getByRole('button', { name: 'Menu openen' })
  if (await openen.isVisible()) await openen.click()
}

test('de balk wisselt meteen na inloggen en uitloggen @telefoon', async ({ page }) => {
  const balk = page.locator('header')

  await page.goto('/nl')
  await menuOpenenOpTelefoon(page)
  await expect(balk.getByRole('link', { name: 'Inloggen', exact: true })).toBeVisible()
  await expect(balk.getByRole('link', { name: 'Oefenen', exact: true })).toHaveCount(0)

  await logIn(page)
  // Geen page.reload(): de doorverwijzing na het formulier moet genoeg zijn.
  await menuOpenenOpTelefoon(page)
  await expect(balk.getByRole('link', { name: 'Oefenen', exact: true })).toBeVisible()
  await expect(balk.getByRole('link', { name: 'Inloggen', exact: true })).toHaveCount(0)

  await rondleidingWegklikken(page)

  await (await menuMetUitloggen(page)).click()
  await expect(page).toHaveURL(/\/(nl)?\/?$/)

  // Ook hier geen herlaadbeurt: de balk moet meteen weer uitgelogd zijn.
  await menuOpenenOpTelefoon(page)
  await expect(balk.getByRole('link', { name: 'Inloggen', exact: true })).toBeVisible()
  await expect(balk.getByRole('link', { name: 'Oefenen', exact: true })).toHaveCount(0)
})
