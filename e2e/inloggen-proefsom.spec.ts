import { expect, test } from '@playwright/test'

/**
 * Wie op /nl/inloggen landt zonder account, moet ook zonder in te loggen
 * naar de proefsom kunnen (INT-751). De link draagt `?van=inloggen` mee.
 */
test('inloggen heeft een pad naar drie sommen zonder account @telefoon', async ({ page }) => {
  await page.goto('/nl/inloggen')
  const proberen = page.getByRole('link', { name: 'Eerst 3 sommen zonder account' })
  await expect(proberen).toBeVisible()
  await expect(proberen).toHaveAttribute('href', /\/proberen\/primitieve\?van=inloggen$/)

  await proberen.click()
  await expect(page).toHaveURL(/\/proberen\/primitieve\?van=inloggen/)
  await expect(page.getByRole('heading', { name: 'Som 1 van 3' })).toBeVisible()
})
