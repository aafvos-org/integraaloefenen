import { expect, test } from '@playwright/test'

/**
 * Op een hoofdstukpagina pusht de volledige hoofdstukkenlijst anders de titel
 * en de knop "Probeer 3 sommen" onder de vouw op telefoon (INT-581). Net als
 * op /theorie zelf (INT-418) moet de zijbalk op telefoon dicht beginnen en pas
 * na een tik open — puur CSS-gestuurd op het lg-breakpoint (1024px), zodat
 * er geen layout shift ontstaat. Op computer blijft hij gewoon open.
 */
test('de hoofdstukkenzijbalk begint dicht op telefoon, open op computer @telefoon', async ({ page }) => {
  const breed = (page.viewportSize()?.width ?? 1280) >= 1024

  await page.goto('/nl/theorie/k3')

  const toggle = page.getByRole('button', { name: /zijbalk/i })
  const anderHoofdstuk = page.getByRole('link', { name: /substitutiemethode/i })

  await expect(toggle).toHaveAttribute('aria-expanded', breed ? 'true' : 'false')
  if (breed) {
    await expect(anderHoofdstuk).toBeVisible()
  } else {
    await expect(anderHoofdstuk).toBeHidden()
  }

  // De titel en de knop om te oefenen moeten meteen in beeld staan, niet
  // onder een opengeklapte hoofdstukkenlijst. "Probeer 3 sommen" staat twee
  // keer op de pagina (ook onderaan bij de voorbeeldopgaven), dus de eerste.
  await expect(page.getByRole('heading', { name: 'K.3 – Cyclometrische functies' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Probeer 3 sommen' }).first()).toBeVisible()

  if (!breed) {
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(anderHoofdstuk).toBeVisible()
  }
})
