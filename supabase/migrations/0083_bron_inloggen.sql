-- =============================================================================
-- Migration 0083: bron "inloggen"
-- =============================================================================
-- Wie op /nl/inloggen op "Eerst 3 sommen zonder account" klikt (INT-751) en
-- zich daarna alsnog aanmeldt, komt binnen met bron "inloggen". Zelfde kolom
-- als in 0080, één extra woord. Bestaande rijen blijven zoals ze zijn.
-- Tweemaal draaien verandert niets.
-- =============================================================================

alter table public.profiles
  drop constraint if exists profiles_bron_check;

alter table public.profiles
  add constraint profiles_bron_check
  check (
    bron is null
    or bron in ('docent', 'youtube', 'klas', 'forum', 'proberen', 'voorbeeld', 'google', 'inloggen')
  );

comment on column public.profiles.bron is
  'Waar het account vandaan kwam: docent, youtube, klas, forum, proberen, voorbeeld, google of inloggen. Leeg als dat niet bekend is.';

-- Zelfde functie als in 0080, plus het woord inloggen. Een onbekend woord
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
      when gekozen in ('docent', 'youtube', 'klas', 'forum', 'proberen', 'voorbeeld', 'google', 'inloggen') then gekozen
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
