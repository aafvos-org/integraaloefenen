import { expect, test } from '@playwright/test'
import { logIn } from './leerling'

/**
 * INT-722: een hoofdstuk mét paragraaf (zoals H12) stond in de zijbalk van
 * /oefenen met alleen een accordion-knop. Die klapte de paragraaflijst open,
 * maar opende het hoofdstuk zelf niet — tikken op de regel "leek" dus niets
 * te doen, en de klikmeting zag dat als een dode klik op de <li>. Een
 * hoofdstuk zónder paragraaf (zoals H11, of ons testhoofdstuk 'e2e') werkte
 * altijd al goed: die regel navigeert meteen.
 *
 * Het testhoofdstuk 'e2eblok' (supabase/seed.sql) heeft, net als H12, precies
 * één paragraaf en één theorieblok met opgaven.
 */
test('tikken op de hoofdstukregel met een paragraaf opent het hoofdstuk meteen @telefoon', async ({
  page,
}) => {
  const breed = (page.viewportSize()?.width ?? 1280) >= 1024

  await logIn(page)
  await page.goto('/nl/oefenen')

  const regel = page.getByRole('button', { name: /E2EBLOK.*Testhoofdstuk met paragraaf/ })

  if (breed) {
    await expect(regel).toBeVisible()
  } else {
    await page.getByRole('button', { name: 'Kies een onderdeel' }).click()
    const dialoog = page.getByRole('dialog', { name: 'Kies een onderdeel' })
    await expect(dialoog).toBeVisible()
    await expect(regel).toBeVisible()
  }

  // Vóór de klik is er nergens tekst van ons testblok te zien.
  await expect(page.getByText('Testblok (e2e)')).toBeHidden()

  await regel.click()

  if (!breed) {
    // Op telefoon sluit een keuze het dialoogvenster, net als bij theorie.
    await expect(page.getByRole('dialog', { name: 'Kies een onderdeel' })).toBeHidden()
  }

  // Eén tik op de hoofdstukregel is genoeg: het hoofdstuk (zijn enige
  // paragraaf/blok) staat er meteen, zonder nog een keer te hoeven klikken.
  await expect(page.getByRole('heading', { name: /Testblok \(e2e\)/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Opgave 1\./ })).toBeVisible()
})
