#!/usr/bin/env bash
# =============================================================================
# Zet de triggers en webhooks (supabase/sql/triggers-en-webhooks.sql) op het
# eigen project van integraaloefenen.nl, met het webhookgeheim in de Vault.
# Raakt alleen het project IntegraalOefenen. Idempotent.
#
# Gebruik (vanuit de root van de repo, Docker moet draaien):
#   bash scripts/supabase-triggers.sh [pad/naar/.env.local]
#
# Nodig in .env.local: SUPABASE_INTEGRAAL_DB_PASSWORD en WEBHOOK_SECRET
# (zelfde waarde als WEBHOOK_SECRET van de Worker in Cloudflare).
# =============================================================================
set -euo pipefail

ENV_FILE="${1:-.env.local}"
REF="oyevapifmenqjuklprws"
POOLER="aws-0-eu-west-1.pooler.supabase.com"
SQL_DIR="$(cd "$(dirname "$0")/../supabase/sql" && pwd)"

lees() { grep "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2-; }
urlenc() { python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$1"; }

PW="$(lees SUPABASE_INTEGRAAL_DB_PASSWORD)"
GEHEIM="$(lees WEBHOOK_SECRET)"
[[ -n "$PW" && -n "$GEHEIM" ]] || { echo "SUPABASE_INTEGRAAL_DB_PASSWORD of WEBHOOK_SECRET ontbreekt in $ENV_FILE"; exit 1; }

URL="postgresql://postgres.${REF}:$(urlenc "$PW")@${POOLER}:5432/postgres"

docker run --rm -i -v "$SQL_DIR:/sql:ro" postgres:17 \
  psql "$URL" -v ON_ERROR_STOP=1 --single-transaction -v geheim="$GEHEIM" <<'SQL'
delete from vault.secrets where name = 'webhook_secret';
select vault.create_secret(:'geheim', 'webhook_secret', 'x-webhook-secret voor /api/webhooks/*') is not null as geheim_opgeslagen;
\i /sql/triggers-en-webhooks.sql
select tgname as trigger from pg_trigger
 where not tgisinternal and tgrelid in ('auth.users'::regclass, 'public.profiles'::regclass)
 order by 1;
SQL
