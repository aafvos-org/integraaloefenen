/**
 * Of dit verzoek een Supabase-inlogsessie bij zich heeft.
 *
 * De cookie heet `sb-<project>-auth-token`, en een lange sessie wordt
 * opgeknipt als `sb-<project>-auth-token.0`. Zonder zo'n cookie is er niemand
 * ingelogd: dan hoeven we Supabase niet te bellen. Die ronde kost op de
 * telefoon al gauw een seconde, op elke openbare pagina.
 */
const INLOGCOOKIE = /^sb-.+-auth-token(?:\.\d+)?$/

export function heeftInlogsessie(cookies: Iterable<{ name: string }>): boolean {
  for (const cookie of cookies) {
    if (INLOGCOOKIE.test(cookie.name)) return true
  }
  return false
}
