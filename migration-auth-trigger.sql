-- =========================================================
-- LOISIRÉO — Migration : profil auto à l'inscription
-- =========================================================
-- À exécuter dans Supabase APRÈS database-complete.sql.
-- Crée automatiquement une ligne `profiles` quand un compte
-- est créé via Supabase Auth, en reprenant les métadonnées
-- du formulaire d'inscription (prénom, nom, rôle, parrain).
-- =========================================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  ref_code text;
  ref_id uuid;
begin
  -- Code de parrainage éventuellement transmis à l'inscription
  ref_code := new.raw_user_meta_data->>'referral_code';
  if ref_code is not null then
    select id into ref_id from public.profiles where referral_code = ref_code limit 1;
  end if;

  insert into public.profiles (id, role, first_name, last_name, referred_by)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'client'),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    ref_id
  );

  -- Enregistre le parrainage si applicable
  if ref_id is not null then
    insert into public.referrals (referrer_id, referred_id)
    values (ref_id, new.id)
    on conflict (referred_id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
