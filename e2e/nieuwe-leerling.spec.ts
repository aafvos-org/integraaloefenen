import { expect, test, type Page } from '@playwright/test'

import {
  TESTLEERLING,
  foutmelding,
  geefAntwoord,
  kiesOpgave,
  logIn,
  logUit,
  rondleidingWegklikken,
} from './leerling'
import { kopregelsVoor, linkUitMail, wachtOpMail } from './postbus'

/**
 * De weg van een nieuwe leerling, van het registratieformulier tot zijn eerste
 * nagekeken antwoord. Hier ging het in de praktijk mis: iemand registreerde
 * zich en bevestigde zijn mail nooit. De andere e2e-tests slaan dit stuk over
 * — die loggen in met het vaste account uit `supabase/seed.sql`.
 *
 * De mail gaat niet de deur uit: een lokale Supabase levert hem af in de
 * testpostbus (Mailpit), en daar haalt `e2e/postbus.ts` hem op. Dat geldt ook
 * voor de welkomstmail, die de site zelf verstuurt: `scripts/e2e.mjs` zet
 * `MAIL_MODE=postbus`.
 */

const WACHTWOORD = 'oefenen123'
const BEVESTIGING = 'Bevestig je account bij IntegraalOefenen'
const WELKOM = 'Welkom bij IntegraalOefenen!'

/**
 * Elk account een eigen adres, met de tijd erin. Twee runs achter elkaar
 * mogen elkaar niet bijten, en twee tests mogen elkaars mail niet pakken.
 * `.test.local` bestaat niet echt, dus hier kan nooit per ongeluk iemand
 * post van krijgen.
 */
function nieuwAdres(wat: string): string {
  return `${wat}-${Date.now()}-${Math.round(Math.random() * 1e6)}@test.local`
}

/**
 * Een unieke gebruikersnaam per testadres: de kolom is uniek, en elke run
 * registreert nieuwe accounts.
 */
function gebruikersnaamVoor(email: string): string {
  return 'Leerling ' + email.split('@')[0].slice(-12)
}

/** Het registratieformulier invullen en versturen, zoals een leerling. */
async function registreer(
  page: Page,
  { email, wachtwoord = WACHTWOORD }: { email: string; wachtwoord?: string },
) {
  await page.goto('/nl/registreren')
  await page.locator('input[name="username"]').fill(gebruikersnaamVoor(email))
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(wachtwoord)
  await page.locator('input[name="passwordConfirm"]').fill(wachtwoord)
  await page.getByRole('button', { name: 'Account aanmaken' }).click()
}

test('een nieuwe leerling registreert zich, bevestigt zijn mail en maakt zijn eerste opgave @telefoon', async ({
  page,
}) => {
  const email = nieuwAdres('nieuw')

  await test.step('1. het registratieformulier invullen en versturen', async () => {
    await registreer(page, { email })
  })

  await test.step('2. de site zegt dat de bevestigingsmail onderweg is', async () => {
    await expect(page.getByRole('status')).toContainText(
      'Klik op de link in de bevestigingsmail',
    )
    await expect(page.getByRole('link', { name: 'Naar inlogpagina' })).toBeVisible()
  })

  const mail = await test.step('3. de mail komt aan, in het Nederlands, van IntegraalOefenen', async () => {
    const mail = await wachtOpMail(email, BEVESTIGING)

    expect(mail.onderwerp).toBe(BEVESTIGING)
    expect(mail.afzender).toEqual({
      naam: 'IntegraalOefenen',
      adres: 'no-reply@integraaloefenen.nl',
    })
    expect(mail.html).toContain('IntegraalOefenen')
    expect(mail.html).toContain('Bevestig je e-mailadres')
    expect(mail.html).toContain('Account bevestigen')

    return mail
  })

  await test.step('4. de link in de mail brengt hem ingelogd op de oefenpagina', async () => {
    await page.goto(linkUitMail(mail))

    // /nl/oefenen zit achter de inlog (src/i18n/paths.ts): kom je daar uit,
    // dan ben je ingelogd. Een mislukte bevestiging eindigt op /nl/inloggen.
    await expect(page).toHaveURL(/\/nl\/oefenen/)
    await expect(foutmelding(page)).toBeHidden()
  })

  await test.step('4b. zijn gekozen gebruikersnaam staat in de site, niet zijn mailadres (INT-89)', async () => {
    // De naam staat op de knop van het gebruikersmenu (zichtbaar is alleen
    // de eerste letter); op telefoonformaat zit die knop in het verborgen menu.
    await expect(
      page.locator(`button[aria-label="${gebruikersnaamVoor(email)}"]`).first(),
    ).toBeAttached()
  })

  await test.step('5. de rondleiding van Aaf begroet hem', async () => {
    const breed = (page.viewportSize()?.width ?? 0) >= 900
    if (breed) {
      await expect(page.getByText('Hoi! Ik ben Aaf.')).toBeVisible()
      await page.getByRole('button', { name: 'Ja, graag!' }).click()
      await expect(page.getByText('Bij Theorie vind je per hoofdstuk')).toBeVisible()
    }
    await rondleidingWegklikken(page)
  })

  await test.step('6. uitloggen en opnieuw inloggen met het nieuwe account', async () => {
    await logUit(page)
    await logIn(page, { email, wachtwoord: WACHTWOORD })
  })

  await test.step('7. de welkomstmail van de site zelf ligt in de postbus', async () => {
    // Deze mail komt niet van Supabase maar van de site (src/lib/email/welkom.ts),
    // als vangnet bij de eerste keer inloggen. Hij vertrekt ná de response,
    // dus even wachten tot hij er is.
    const welkom = await wachtOpMail(email, WELKOM)

    expect(welkom.afzender).toEqual({
      naam: 'IntegraalOefenen',
      adres: 'no-reply@integraaloefenen.nl',
    })
    expect(welkom.html).toContain('Je account is klaar.')
    expect(welkom.html).toContain('Stel je eerste vraag')
  })

  await test.step('8. zijn eerste opgave openen en nakijken', async () => {
    await kiesOpgave(page, 1)
    await expect(page.getByText('Bepaal de primitieve van:')).toBeVisible()

    // Opgave 1: f(x) = x^2  →  F(x) = 1/3x^3 + c
    await geefAntwoord(page, '1/3x^3 + c')

    await expect(page.getByText('Goed!', { exact: true })).toBeVisible()
    // Vers account, dus de reeks begint echt bij één.
    await expect(page.getByText('Reeks: 1/3')).toBeVisible()
  })

  await test.step('9. nog een keer inloggen levert geen tweede welkomstmail op', async () => {
    await logUit(page)
    await logIn(page, { email, wachtwoord: WACHTWOORD })

    // De welkomstmail gaat bij elke login opnieuw langs `stuurWelkomstmail`;
    // de vlag in user_metadata moet een tweede mail tegenhouden. Even wachten,
    // want die aanroep gebeurt ná de response.
    await page.waitForTimeout(3_000)
    expect(await kopregelsVoor(email, WELKOM)).toHaveLength(1)
  })
})

test('inloggen vóór het bevestigen zegt wat eraan schort', async ({ page }) => {
  const email = nieuwAdres('onbevestigd')
  await registreer(page, { email })
  await expect(page.getByRole('status')).toBeVisible()

  await page.goto('/nl/inloggen')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(WACHTWOORD)
  await page.getByRole('button', { name: 'Inloggen' }).click()

  await expect(foutmelding(page)).toHaveText(
    'Je hebt je e-mailadres nog niet bevestigd. Check je inbox.',
  )
  // En hij kan de mail opnieuw laten sturen, voor als hij hem kwijt is.
  await expect(
    page.getByRole('button', { name: 'Stuur bevestigingsmail opnieuw' }),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/nl\/inloggen/)
})

test('een bevestigingsmail die niet verstuurd wordt, heet ook niet verstuurd', async ({
  page,
}) => {
  const email = nieuwAdres('teSnel')
  await registreer(page, { email })
  await expect(page.getByRole('status')).toBeVisible()

  await page.goto('/nl/inloggen')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(WACHTWOORD)
  await page.getByRole('button', { name: 'Inloggen' }).click()

  // De bevestigingsmail van het registreren is nog geen minuut oud, dus
  // Supabase weigert er een tweede te sturen (`max_frequency` in
  // supabase/config.toml). Vroeger stond er dan toch "Mail verstuurd" en bleef
  // de leerling wachten op post die nooit kwam.
  await page.getByRole('button', { name: 'Stuur bevestigingsmail opnieuw' }).click()

  await expect(
    page.getByText('Je hebt net al een bevestigingsmail aangevraagd', {
      exact: false,
    }),
  ).toBeVisible()
  await expect(page.getByText('Mail verstuurd', { exact: false })).toBeHidden()

  // En de knop telt zichtbaar af in plaats van nog een keer niets te doen.
  const knop = page.getByRole('button', { name: /wachten$/ })
  await expect(knop).toBeVisible()
  await expect(knop).toBeDisabled()
})

test('een te kort wachtwoord komt er niet doorheen', async ({ page }) => {
  await page.goto('/nl/registreren')
  await page.locator('input[name="email"]').fill(nieuwAdres('kort'))
  const wachtwoord = page.locator('input[name="password"]')
  const herhaal = page.locator('input[name="passwordConfirm"]')
  await wachtwoord.fill('kort123')
  await herhaal.fill('kort123')

  // Eerst de browser zelf: die laat het formulier niet eens vertrekken.
  await page.getByRole('button', { name: 'Account aanmaken' }).click()
  await expect(wachtwoord).toHaveJSProperty('validity.valid', false)
  await expect(page.getByText('Minstens 8 tekens.')).toBeVisible()

  // En daarachter de site zelf, voor een browser die de eis niet kent: haal
  // de eis uit het formulier en stuur hem alsnog op.
  for (const veld of [wachtwoord, herhaal]) {
    await veld.evaluate((el) => el.removeAttribute('minlength'))
  }
  await page.getByRole('button', { name: 'Account aanmaken' }).click()

  await expect(foutmelding(page)).toHaveText(
    'Je wachtwoord moet minstens 8 tekens lang zijn.',
  )
})

test('registreren met een adres dat al bestaat zegt dat in het Nederlands', async ({
  page,
}) => {
  await registreer(page, { email: TESTLEERLING.email })

  // Geen Engelse foutmelding van Supabase en geen foutpagina, maar één zin
  // waar een leerling iets mee kan.
  await expect(foutmelding(page)).toHaveText(
    'Er bestaat al een account met dit e-mailadres.',
  )
  // Hij blijft op het formulier staan, met zijn adres er nog in.
  await expect(page.locator('input[name="email"]')).toHaveValue(
    TESTLEERLING.email,
  )

  // En het bestaande account is ongemoeid: het oude wachtwoord werkt nog.
  await logIn(page)
})

test('wachtwoord vergeten: mail, link, nieuw wachtwoord, inloggen', async ({
  page,
}) => {
  const email = nieuwAdres('vergeten')
  const nieuwWachtwoord = 'nieuwgeheim123'
  let mail: Awaited<ReturnType<typeof wachtOpMail>>

  await test.step('eerst een account dat bestaat en bevestigd is', async () => {
    await registreer(page, { email })
    const bevestiging = await wachtOpMail(email, BEVESTIGING)
    await page.goto(linkUitMail(bevestiging))
    await expect(page).toHaveURL(/\/nl\/oefenen/)
    await rondleidingWegklikken(page)
    await logUit(page)
  })

  await test.step('een resetlink aanvragen', async () => {
    await page.goto('/nl/wachtwoord-vergeten')
    await page.locator('input[name="email"]').fill(email)
    await page.getByRole('button', { name: 'Stuur de link' }).click()

    await expect(
      page.getByText('ontvang je zo een link om je wachtwoord opnieuw in te stellen', { exact: false }),
    ).toBeVisible()
  })

  await test.step('de mail komt aan en de link opent het formulier', async () => {
    mail = await wachtOpMail(email, 'Nieuw wachtwoord voor IntegraalOefenen')
    expect(mail.onderwerp).toBe('Nieuw wachtwoord voor IntegraalOefenen')
    expect(mail.afzender.naam).toBe('IntegraalOefenen')

    await page.goto(linkUitMail(mail))
    await expect(page).toHaveURL(/\/nl\/wachtwoord-opnieuw/)
    await expect(
      page.getByRole('heading', { name: 'Nieuw wachtwoord instellen' }),
    ).toBeVisible()
  })

  await test.step('een nieuw wachtwoord zetten en uitloggen', async () => {
    await page.locator('input[name="password"]').fill(nieuwWachtwoord)
    await page.getByRole('button', { name: 'Wachtwoord opslaan' }).click()
    await expect(page).toHaveURL(/\/nl\/dashboard/)

    await rondleidingWegklikken(page)
    await logUit(page)
  })

  await test.step('een gebruikte resetlink legt uit dat hij niet meer werkt', async () => {
    // De resetlink is net een keer gebruikt; nog eens openen kan niet meer.
    // De leerling komt dan op de inlogpagina met uitleg en een link om een
    // nieuwe resetlink aan te vragen.
    await page.goto(linkUitMail(mail))
    await expect(page).toHaveURL(/\/nl\/inloggen/)
    await expect(
      page.getByText('Deze link om je wachtwoord opnieuw in te stellen werkt niet meer', { exact: false }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Vraag een nieuwe aan' }),
    ).toBeVisible()
  })

  await test.step('ook zonder herkende resetlink kijkt de inlogpagina achter de #', async () => {
    // Supabase zet de reden van een geweigerde link achter een `#`, en dat
    // stuk komt nooit bij de server aan. Zelfs dan hoort de pagina te zien
    // dat de resetlink stuk was.
    await page.goto(
      '/nl/inloggen?error=auth_callback_failed#error=access_denied&error_code=otp_expired',
    )
    await expect(
      page.getByText('Deze link om je wachtwoord opnieuw in te stellen werkt niet meer', { exact: false }),
    ).toBeVisible()
  })

  await test.step('de resetlink heeft gewerkt: inloggen met het nieuwe wachtwoord', async () => {
    await logIn(page, { email, wachtwoord: nieuwWachtwoord })
  })
})
