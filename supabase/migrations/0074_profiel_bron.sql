-- =============================================================================
-- Migration 0074: profiles.bron
-- =============================================================================
-- Een leerling die via een link met ?van=youtube (of docent, klas, forum)
-- binnenkomt, houdt die korte waarde op zijn profiel. Zo is later te zien
-- of de YouTube-shorts accounts opleveren. Geen vrije tekst en geen cookie.
--
-- De waarde komt mee in de metadata van het account en wordt hier bij het
-- aanmaken van het profiel overgenomen. Bestaande profielen blijven leeg.
-- =============================================================================

alter table public.profiles
  add column if not exists bron text;

alter table public.profiles
  drop constraint if exists profiles_bron_check;

alter table public.profiles
  add constraint profiles_bron_check
  check (
    bron is null
    or bron in ('docent', 'youtube', 'klas', 'forum')
  );

comment on column public.profiles.bron is
  'Waar het account vandaan kwam: docent, youtube, klas of forum. Leeg als dat niet bekend is.';

-- Zelfde trigger als in 0001, plus de bron uit de metadata van het account.
-- Een onbekend woord wordt geen bron. Tweemaal draaien vervangt de functie,
-- het voegt geen tweede profiel toe.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  gekozen text := lower(btrim(coalesce(new.raw_user_meta_data->>'bron', '')));
begin
  insert into public.profiles (id, bron)
  values (
    new.id,
    case
      when gekozen in ('docent', 'youtube', 'klas', 'forum') then gekozen
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
