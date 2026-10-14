-- =============================================================================
-- Migration 0076: bron "proberen"
-- =============================================================================
-- Wie drie proefopgaven maakt en daarna een account aanmaakt, komt binnen via
-- ?van=proberen. Zelfde kolom als in 0074, één extra toegestaan woord.
-- Bestaande rijen blijven zoals ze zijn. Tweemaal draaien verandert niets.
-- =============================================================================

alter table public.profiles
  drop constraint if exists profiles_bron_check;

alter table public.profiles
  add constraint profiles_bron_check
  check (
    bron is null
    or bron in ('docent', 'youtube', 'klas', 'forum', 'proberen')
  );

comment on column public.profiles.bron is
  'Waar het account vandaan kwam: docent, youtube, klas, forum of proberen. Leeg als dat niet bekend is.';

-- Zelfde functie als in 0074, plus het woord proberen. Een onbekend woord
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
      when gekozen in ('docent', 'youtube', 'klas', 'forum', 'proberen') then gekozen
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
