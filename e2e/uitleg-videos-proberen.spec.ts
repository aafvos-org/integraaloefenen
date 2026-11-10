import { expect, test } from '@playwright/test'

/**
 * YouTube-landingen op /uitleg-videos hadden geen pad naar de gratis proefsom
 * (INT-810). De strip bovenaan draagt `?van=youtube` mee, ongeacht of dat al
 * in de adresregel stond.
 */
test('uitleg-videos heeft een strip naar drie sommen zonder account @telefoon', async ({
  page,
}) => {
  await page.goto('/nl/uitleg-videos')
  const proberen = page.getByRole('link', { name: 'Probeer drie sommen' })
  await expect(proberen).toBeVisible()
  await expect(proberen).toHaveAttribute('href', /\/proberen\/primitieve\?van=youtube$/)

  await proberen.click()
  await expect(page).toHaveURL(/\/proberen\/primitieve\?van=youtube/)
  await expect(page.getByRole('heading', { name: 'Som 1 van 3' })).toBeVisible()
})
