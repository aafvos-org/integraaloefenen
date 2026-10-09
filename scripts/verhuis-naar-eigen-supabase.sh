#!/usr/bin/env bash
# =============================================================================
# Verhuis integraaloefenen.nl naar een eigen Supabase-project.
#
#   OUD  = LerenDifferentieren (gedeeld met afgeleideoefenen.nl) — wordt ALLEEN GELEZEN
#   NIEUW = IntegraalOefenen (oyevapifmenqjuklprws)              — wordt gevuld
#
# Wat het doet:
#   1. Dumpt rollen, schema en data van OUD (alleen lezen, niets wordt gewijzigd).
#   2. Zet alles in NIEUW: accounts (auth.users), profielen, voortgang en inhoud.
#   3. Verwijdert in NIEUW de inhoud van afgeleideoefenen.nl (site = 'afgeleiden');
#      voortgang en sessies op die inhoud gaan via ON DELETE CASCADE mee.
#   4. Toont aantallen ter controle (geen e-mailadressen of andere persoonsgegevens).
#   5. Gooit de dumpbestanden weg (die bevatten persoonsgegevens).
#
# Gebruik (vanuit de root van de repo, Docker moet draaien):
#   bash scripts/verhuis-naar-eigen-supabase.sh [--ja] [pad/naar/.env.local]
#   --ja  sla de bevestigingsvraag over (voor niet-interactief draaien)
#
# Nodig in .env.local:
#   SUPABASE_PROD_DB_PASSWORD       wachtwoord van de database van OUD
#   SUPABASE_INTEGRAAL_DB_PASSWORD  wachtwoord van de database van NIEUW
#
# NIEUW moet leeg zijn: draai dit één keer. Opnieuw draaien? Maak NIEUW eerst
# leeg (Supabase-dashboard → Database → Reset) of maak een nieuw project.
# =============================================================================
set -euo pipefail

JA=0
if [[ "${1:-}" == "--ja" ]]; then JA=1; shift; fi
ENV_FILE="${1:-.env.local}"
OUD_REF="dccjsuyuolxwqqcjxtqe"
NIEUW_REF="oyevapifmenqjuklprws"
POOLER="aws-0-eu-west-1.pooler.supabase.com"
PG_IMAGE="postgres:17"

lees() { grep "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2-; }
urlenc() { python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$1"; }

OUD_PW="$(lees SUPABASE_PROD_DB_PASSWORD)"
NIEUW_PW="$(lees SUPABASE_INTEGRAAL_DB_PASSWORD)"
[[ -n "$OUD_PW" && -n "$NIEUW_PW" ]] || { echo "Wachtwoorden ontbreken in $ENV_FILE"; exit 1; }

# Session pooler (IPv4) in plaats van de directe host (alleen IPv6)
OUD_URL="postgresql://postgres.${OUD_REF}:$(urlenc "$OUD_PW")@${POOLER}:5432/postgres"
NIEUW_URL="postgresql://postgres.${NIEUW_REF}:$(urlenc "$NIEUW_PW")@${POOLER}:5432/postgres"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"; echo "Dumpbestanden verwijderd."' EXIT

psql_nieuw() { docker run --rm -i -v "$TMP:/d" "$PG_IMAGE" psql "$NIEUW_URL" -v ON_ERROR_STOP=1 "$@"; }

echo "Controle: is NIEUW nog leeg?"
AANTAL=$(psql_nieuw -tAc "select count(*) from information_schema.tables where table_schema = 'public'")
if [[ "$AANTAL" != "0" ]]; then
  echo "NIEUW heeft al $AANTAL tabellen in 'public'. Gestopt, er wordt niets overschreven."
  exit 1
fi

if [[ "$JA" != "1" ]]; then
  read -r -p "OUD alleen lezen, NIEUW vullen. Doorgaan? [j/N] " ok
  [[ "$ok" == "j" ]] || { echo "Gestopt."; exit 0; }
fi

echo "1/4 Dump van OUD (alleen lezen)…"
supabase db dump --db-url "$OUD_URL" --role-only -f "$TMP/roles.sql"
supabase db dump --db-url "$OUD_URL" -f "$TMP/schema.sql"
supabase db dump --db-url "$OUD_URL" --data-only --use-copy -f "$TMP/data.sql"

echo "2/4 Terugzetten in NIEUW…"
psql_nieuw --single-transaction \
  --file /d/roles.sql \
  --file /d/schema.sql \
  --command 'SET session_replication_role = replica' \
  --file /d/data.sql > "$TMP/restore.log"

echo "3/4 Inhoud van afgeleideoefenen.nl weghalen uit NIEUW…"
psql_nieuw --single-transaction <<'SQL'
delete from public.question_steps_new s using public.questions_new q
  where s.question_id = q.id and q.site = 'afgeleiden';
delete from public.questions_new      where site = 'afgeleiden';
delete from public.topic_clusters_new where site = 'afgeleiden';
delete from public.topics_new         where site = 'afgeleiden';
delete from public.chapters           where site = 'afgeleiden';
SQL

echo "4/4 Controle (alleen aantallen):"
psql_nieuw <<'SQL'
select 'accounts'            as wat, count(*) from auth.users
union all select 'bevestigd',          count(*) from auth.users where email_confirmed_at is not null
union all select 'profielen',          count(*) from public.profiles
union all select 'hoofdstukken',       count(*) from public.chapters
union all select 'vragen',             count(*) from public.questions_new
union all select 'afgeleiden over',    (select count(*) from public.chapters where site = 'afgeleiden')
union all select 'sessies',            count(*) from public.user_sessions_new;
SQL

echo "Klaar. NIEUW is gevuld; OUD is niet aangeraakt."
