-- =============================================================================
-- Migration 0077: bron "voorbeeld"
-- =============================================================================
-- Wie op een antwoordpagina op oefenen klikt en daarna een account aanmaakt,
-- komt binnen via ?van=voorbeeld. Zelfde kolom als in 0076, één extra woord.
-- Bestaande rijen blijven zoals ze zijn. Tweemaal draaien verandert niets.
-- =============================================================================

alter table public.profiles
  drop constraint if exists profiles_bron_check;

alter table public.profiles
  add constraint profiles_bron_check
  check (
    bron is null
    or bron in ('docent', 'youtube', 'klas', 'forum', 'proberen', 'voorbeeld')
  );

comment on column public.profiles.bron is
  'Waar het account vandaan kwam: docent, youtube, klas, forum, proberen of voorbeeld. Leeg als dat niet bekend is.';

-- Zelfde functie als in 0076, plus het woord voorbeeld. Een onbekend woord
-- wordt nog steeds geen bron. Tweemaal draaien vervangt de functie.
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
      when gekozen in ('docent', 'youtube', 'klas', 'forum', 'proberen', 'voorbeeld') then gekozen
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
