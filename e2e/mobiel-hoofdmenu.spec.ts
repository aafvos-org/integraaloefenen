import { expect, test } from '@playwright/test'

/**
 * INT-771: het mobiele hoofdmenu had geen afgedimde achtergrond. Een tik
 * buiten het paneel lekte daardoor door naar de link eronder — de leerling
 * navigeerde ongewild weg, met het menu nog zichtbaar open op de nieuwe
 * pagina. Deze test tikt expres op een plek met gewone pagina-inhoud (de
 * link naar afgeleideoefenen.nl direct onder de kop, geen onderdeel van het
 * paneel). Sinds INT-830 staat de proefsom zelf meteen in het eerste scherm
 * en heeft de kop geen eigen "Probeer"-knop meer; deze link bleef wel staan.
 */
test('tikken buiten het open mobiele hoofdmenu sluit het en navigeert niet @telefoon', async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 1280) >= 1024, 'alleen relevant op telefoonformaat')

  await page.goto('/nl')

  await page.getByRole('button', { name: 'Menu openen' }).click()
  const sluitKnop = page.getByRole('button', { name: 'Menu sluiten' })
  await expect(sluitKnop).toBeVisible()

  // Deze link staat altijd op de startpagina, los van het menu-paneel.
  const heroKnop = page.getByRole('link', { name: /differentiëren oefenen/i })
  const box = await heroKnop.boundingBox()
  if (!box) throw new Error('Link naar afgeleideoefenen.nl niet gevonden op de startpagina')

  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

  await expect(sluitKnop).toBeHidden()
  await expect(page).toHaveURL(/\/nl$/)

  // Escape moet ook sluiten, via eigen code (niet toevallig via de browser).
  await page.getByRole('button', { name: 'Menu openen' }).click()
  await expect(sluitKnop).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(sluitKnop).toBeHidden()
})
