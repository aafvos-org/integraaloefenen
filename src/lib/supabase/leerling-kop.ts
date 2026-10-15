/**
 * Kop op het verzoek, gezet door de middleware nádat de sessie is nagekeken.
 *
 * De pagina leest alleen dit id en belt Supabase Auth niet opnieuw. Een
 * bezoeker kan de kop zelf meesturen; de middleware haalt die waarde daarom
 * eerst weg en zet hem alleen terug als de sessie klopt.
 */
export const LEERLING_KOP = 'x-ingelogde-leerling'
