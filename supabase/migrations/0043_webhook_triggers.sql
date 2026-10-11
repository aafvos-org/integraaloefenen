-- =============================================================================
-- De triggers achter de twee webhooks rond een nieuw account.
--
-- Ze stonden in supabase/sql/triggers-en-webhooks.sql en moesten met de hand
-- gedraaid worden. Daardoor bestond deze keten alleen op de echte site:
-- `supabase db reset` zette hem lokaal niet neer, en wie hem na een herstel
-- vergat te draaien, had geen welkomstmail en geen seintje — zonder melding.
--
--   webhook_nieuwe_gebruiker  public.profiles INSERT  → /api/webhooks/new-user
--   webhook_welkom            auth.users UPDATE       → /api/webhooks/welkom
--
-- Let op wanneer ze afgaan. `webhook_nieuwe_gebruiker` gaat af bij het
-- REGISTREREN, dus vóór het bevestigen van het e-mailadres: er komt dus ook
-- bericht over iemand die zijn adres nooit bevestigt. Dat is de bedoeling.
-- Het tweede seintje, bij het BEVESTIGEN, gaat mee met de welkomstmail en
-- staat in src/lib/email/welkom.ts — niet hier.
--
-- `webhook_welkom` stuurt alleen id en email_confirmed_at mee, niet de hele
-- gebruikersrij (een standaard Supabase-webhook zou ook de wachtwoordhash
-- meesturen).
--
-- De trigger die het profiel aanmaakt (on_auth_user_created) staat al in
-- migratie 0001.
--
-- Waar de webhook heen gaat, staat niet meer vast in de functie maar in de
-- Vault, naast het geheim:
--
--   webhook_secret     de header x-webhook-secret. Staat niet in de repo en
--                      komt uit scripts/supabase-triggers.sh.
--   webhook_basis_url  waar /api/webhooks/* te vinden is. Hieronder wordt hij
--                      op het echte domein gezet als hij nog niet bestaat;
--                      lokaal zet supabase/seed.sql hem op de testserver.
--
-- Ontbreekt een van de twee, dan gaat er niets de deur uit en blijft het bij
-- een waarschuwing in de logs. Dat is met opzet: een lokale database mag nooit
-- per ongeluk de echte site aanroepen.
--
-- Idempotent: mag vaker draaien.
-- =============================================================================

create extension if not exists pg_net;

-- ── Waar de webhooks heen gaan ───────────────────────────────────────────────
-- Alleen als die waarde er nog niet is: anders overschrijft een volgende
-- `db push` het adres dat in de Vault gezet is.
do $$
begin
  if to_regclass('vault.secrets') is null then
    raise warning 'Geen Vault in deze database; webhook_basis_url niet gezet.';
    return;
  end if;
  if not exists (select 1 from vault.secrets where name = 'webhook_basis_url') then
    perform vault.create_secret(
      -- Het kale domein stuurt door (307) naar www.
      'https://www.integraaloefenen.nl',
      'webhook_basis_url',
      'Waar /api/webhooks/* staat'
    );
  end if;
end
$$;

-- ── Versturen ────────────────────────────────────────────────────────────────
create or replace function public.stuur_webhook(pad text, payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  geheim text;
  basis  text;
begin
  select decrypted_secret into geheim from vault.decrypted_secrets where name = 'webhook_secret';
  select decrypted_secret into basis  from vault.decrypted_secrets where name = 'webhook_basis_url';

  if geheim is null or basis is null then
    raise warning 'webhook_secret of webhook_basis_url ontbreekt in de Vault; webhook % niet verstuurd', pad;
    return;
  end if;

  perform net.http_post(
    url := rtrim(basis, '/') || pad,
    body := payload,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', geheim)
  );
exception
  -- Een registratie of een bevestiging mag nooit stuklopen op een webhook.
  when others then
    raise warning 'webhook % niet verstuurd: %', pad, sqlerrm;
end;
$$;

revoke all on function public.stuur_webhook(text, jsonb) from public, anon, authenticated;

-- ── Bij het registreren ──────────────────────────────────────────────────────
create or replace function public.webhook_nieuwe_gebruiker()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.stuur_webhook('/api/webhooks/new-user', jsonb_build_object(
    'type', 'INSERT',
    'table', 'profiles',
    'schema', 'public',
    'record', to_jsonb(new),
    'old_record', null
  ));
  return new;
end;
$$;

drop trigger if exists webhook_nieuwe_gebruiker on public.profiles;
create trigger webhook_nieuwe_gebruiker
  after insert on public.profiles
  for each row execute function public.webhook_nieuwe_gebruiker();

-- ── Bij het bevestigen van het e-mailadres ───────────────────────────────────
create or replace function public.webhook_welkom()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    perform public.stuur_webhook('/api/webhooks/welkom', jsonb_build_object(
      'type', 'UPDATE',
      'table', 'users',
      'schema', 'auth',
      'record', jsonb_build_object('id', new.id, 'email_confirmed_at', new.email_confirmed_at),
      'old_record', jsonb_build_object('id', old.id, 'email_confirmed_at', old.email_confirmed_at)
    ));
  end if;
  return new;
end;
$$;

drop trigger if exists webhook_welkom on auth.users;
create trigger webhook_welkom
  after update of email_confirmed_at on auth.users
  for each row execute function public.webhook_welkom();
