#!/usr/bin/env bash
# =============================================================================
# Zet het webhookgeheim en het webhookadres in de Vault van het echte project
# van integraaloefenen.nl, en legt de triggers er meteen overheen.
#
# De triggers zelf staan sinds INT-99 in supabase/migrations/0043_webhook_
# triggers.sql en komen dus ook mee met `npx supabase db push` en met elke
# `npx supabase db reset`. Dit script blijft bestaan voor het ene stuk dat niet
# in de repo kan staan: het geheim. Het draait die migratie er voor de zekerheid
# nog een keer overheen (hij is idempotent), zodat een herstel in één commando
# klaar is.
#
# Raakt alleen het project IntegraalOefenen. Idempotent.
#
# Gebruik (vanuit de root van de repo, Docker moet draaien):
#   bash scripts/supabase-triggers.sh [pad/naar/.env.local]
#
# Nodig in .env.local: SUPABASE_INTEGRAAL_DB_PASSWORD en WEBHOOK_SECRET
# (zelfde waarde als WEBHOOK_SECRET van de Worker in Cloudflare).
# Optioneel: WEBHOOK_BASIS_URL, als de webhooks ergens anders heen moeten dan
# naar https://www.integraaloefenen.nl (bijvoorbeeld een voorbeeldversie).
# =============================================================================
set -euo pipefail

ENV_FILE="${1:-.env.local}"
REF="oyevapifmenqjuklprws"
POOLER="aws-0-eu-west-1.pooler.supabase.com"
SQL_DIR="$(cd "$(dirname "$0")/../supabase/migrations" && pwd)"
MIGRATIE="0043_webhook_triggers.sql"

lees() { grep "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2-; }
urlenc() { python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$1"; }

PW="$(lees SUPABASE_INTEGRAAL_DB_PASSWORD)"
GEHEIM="$(lees WEBHOOK_SECRET)"
BASIS="$(lees WEBHOOK_BASIS_URL)"
BASIS="${BASIS:-https://www.integraaloefenen.nl}"
[[ -n "$PW" && -n "$GEHEIM" ]] || { echo "SUPABASE_INTEGRAAL_DB_PASSWORD of WEBHOOK_SECRET ontbreekt in $ENV_FILE"; exit 1; }

echo "De webhooks gaan naar $BASIS/api/webhooks/*"

URL="postgresql://postgres.${REF}:$(urlenc "$PW")@${POOLER}:5432/postgres"

docker run --rm -i -v "$SQL_DIR:/sql:ro" postgres:17 \
  psql "$URL" -v ON_ERROR_STOP=1 --single-transaction \
    -v geheim="$GEHEIM" -v basis="$BASIS" -v migratie="/sql/$MIGRATIE" <<'SQL'
delete from vault.secrets where name in ('webhook_secret', 'webhook_basis_url');
select vault.create_secret(:'geheim', 'webhook_secret', 'x-webhook-secret voor /api/webhooks/*') is not null as geheim_opgeslagen;
select vault.create_secret(:'basis', 'webhook_basis_url', 'Waar /api/webhooks/* staat') is not null as adres_opgeslagen;
\i :migratie
select tgname as trigger from pg_trigger
 where not tgisinternal and tgrelid in ('auth.users'::regclass, 'public.profiles'::regclass)
 order by 1;
SQL
