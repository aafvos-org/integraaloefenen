import { expect, test } from '@playwright/test'

/**
 * Plakkerige oefenbalk op voorbeeldpagina's (INT-678). wortel-x heeft geen
 * video en is daardoor kort: de bestaande oefenknop onderaan de pagina komt
 * al rond dezelfde scrolldiepte als de 75%-drempel in beeld. Zonder marge op
 * de "al in beeld"-check verdween de balk daardoor meteen weer voordat hij
 * ooit zichtbaar werd (Controle op PR #119, 31-10-2026) — deze test bewaakt
 * dat juist op zo'n korte pagina.
 */
test('de plakkerige oefenbalk verschijnt na 75% scroll op wortel-x en verdwijnt weer onderaan @telefoon', async ({
  page,
}) => {
  await page.goto('/nl/voorbeeld/wortel-x')

  const balk = page.locator('[data-meet="voorbeeld-sticky-oefenen"]')
  await expect(balk).toBeHidden()

  await page.evaluate(() => {
    const totaal = document.documentElement.scrollHeight
    window.scrollTo(0, totaal * 0.78 - window.innerHeight)
  })
  await expect(balk).toBeVisible()

  const box = await balk.boundingBox()
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)

  // Helemaal naar beneden: de bestaande oefenknop staat daar al, dus de
  // plakkerige balk mag niet nog eens dezelfde knop erbovenop leggen.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect(balk).toBeHidden()
})
