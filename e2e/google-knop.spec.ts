import { expect, test } from '@playwright/test'

/**
 * De knop "Doorgaan met Google" hoort er niet te staan zolang de vlag
 * NEXT_PUBLIC_GOOGLE_LOGIN uit staat. De e2e-run zet die vlag niet.
 */

test('Doorgaan met Google staat niet op inloggen en registreren @telefoon', async ({
  page,
}) => {
  await page.goto('/nl/inloggen')
  await expect(page.getByRole('heading', { name: 'Inloggen' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Doorgaan met Google' })).toHaveCount(0)

  await page.goto('/nl/registreren')
  await expect(page.getByRole('heading', { name: 'Account aanmaken' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Doorgaan met Google' })).toHaveCount(0)
})
