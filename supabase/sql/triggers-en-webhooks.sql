-- =============================================================================
-- Triggers en webhooks voor het eigen project van integraaloefenen.nl.
--
-- Deze hangen aan auth.users of zijn in het oude project via het dashboard
-- ingesteld, en gaan daarom niet mee in een schemadump. Idempotent: mag
-- vaker draaien. Draai via scripts/supabase-triggers.sh (zet eerst het
-- webhookgeheim in de Vault).
--
--   on_auth_user_created     auth.users INSERT  → profiel aanmaken
--   webhook_nieuwe_gebruiker profiles INSERT    → /api/webhooks/new-user (melding aan beheer)
--   webhook_welkom           auth.users UPDATE  → /api/webhooks/welkom   (welkomstmail na bevestigen)
--
-- De welkom-webhook stuurt alleen id en email_confirmed_at mee, niet de hele
-- gebruikersrij (een standaard Supabase-webhook zou ook de wachtwoordhash meesturen).
-- =============================================================================

create extension if not exists pg_net;

-- ── Profiel bij een nieuwe gebruiker ─────────────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Webhooks ─────────────────────────────────────────────────────────────────
create or replace function public.stuur_webhook(pad text, payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  geheim text;
begin
  select decrypted_secret into geheim from vault.decrypted_secrets where name = 'webhook_secret';
  if geheim is null then
    raise warning 'webhook_secret ontbreekt in de Vault; webhook % niet verstuurd', pad;
    return;
  end if;
  perform net.http_post(
    url := 'https://www.integraaloefenen.nl' || pad,  -- het kale domein stuurt door (307) naar www
    body := payload,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', geheim)
  );
end;
$$;

revoke all on function public.stuur_webhook(text, jsonb) from public, anon, authenticated;

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
