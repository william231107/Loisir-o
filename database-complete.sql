-- =========================================================
-- LOISIRÉO — BASE DE DONNÉES COMPLÈTE (fichier unique)
-- =========================================================
-- À exécuter dans l'éditeur SQL de Supabase, dans l'ordre :
--   PARTIE 1 : schéma (tables, enums, triggers)
--   PARTIE 2 : règles de sécurité (RLS)
--   PARTIE 3 : données fictives (seed)
-- =========================================================


-- #########################################################
-- ###  PARTIE 1 — SCHÉMA
-- #########################################################

-- =========================================================
-- LOISIRÉO — SCHÉMA SQL (PostgreSQL / Supabase)
-- =========================================================
-- À exécuter dans l'éditeur SQL de Supabase, ou via
-- supabase/migrations/0001_init.sql une fois le projet créé.
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists "postgis";   -- pour les recherches géographiques

-- =========================================================
-- 1. ENUMS
-- =========================================================

create type user_role as enum ('client', 'pro', 'admin');
create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
create type activity_category as enum (
  'padel', 'escape_game', 'bowling', 'karting', 'laser_game', 'yoga',
  'danse', 'atelier_creatif', 'musee', 'accrobranche', 'sport_nautique',
  'stage', 'evenement', 'autre'
);
create type professional_status as enum ('pending', 'active', 'suspended');

-- =========================================================
-- 2. PROFILS UTILISATEURS (lié à auth.users de Supabase)
-- =========================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  birth_date date,
  loyalty_points int not null default 0,
  referral_code text unique not null default substr(md5(random()::text), 1, 8),
  referred_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 3. ÉTABLISSEMENTS PROFESSIONNELS
-- =========================================================

create table professionals (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  company_name text not null,
  siret text,
  description text,
  logo_url text,
  cover_url text,
  address text not null,
  city text not null,
  postal_code text not null,
  latitude double precision,
  longitude double precision,
  phone text,
  email text,
  website text,
  status professional_status not null default 'pending',

  -- Programme Partenaire Fondateur
  is_founding_partner boolean not null default false,
  founding_partner_until date,
  commission_rate numeric(4,2) not null default 15.00,

  -- Stripe Connect
  stripe_account_id text,
  stripe_onboarding_complete boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_professionals_city on professionals(city);
create index idx_professionals_status on professionals(status);

-- =========================================================
-- 4. ACTIVITÉS
-- =========================================================

create table activities (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid not null references professionals(id) on delete cascade,
  slug text unique not null,
  title text not null,
  category activity_category not null,
  description text,
  duration_minutes int not null,
  price_cents int not null,            -- prix en centimes pour éviter les flottants
  min_participants int not null default 1,
  max_participants int not null default 1,
  min_age int,
  max_age int,
  is_indoor boolean not null default true,
  is_outdoor boolean not null default false,
  is_pmr_accessible boolean not null default false,
  practical_info text,
  is_published boolean not null default false,
  average_rating numeric(3,2) not null default 0,
  reviews_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_activities_professional on activities(professional_id);
create index idx_activities_category on activities(category);
create index idx_activities_published on activities(is_published);

create table activity_images (
  id uuid primary key default uuid_generate_v4(),
  activity_id uuid not null references activities(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 5. CRÉNEAUX & DISPONIBILITÉS
-- =========================================================

create table availability_slots (
  id uuid primary key default uuid_generate_v4(),
  activity_id uuid not null references activities(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  total_capacity int not null,
  remaining_capacity int not null,
  is_cancelled boolean not null default false,
  created_at timestamptz not null default now(),
  constraint remaining_not_negative check (remaining_capacity >= 0)
);

create index idx_slots_activity_time on availability_slots(activity_id, start_time);

-- =========================================================
-- 6. CODES PROMO (créés avant bookings car référencés par clé étrangère)
-- =========================================================

create table promo_codes (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  discount_percent int,
  discount_cents int,
  max_uses int,
  used_count int not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 7. RÉSERVATIONS
-- =========================================================

create table bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id),
  activity_id uuid not null references activities(id),
  slot_id uuid not null references availability_slots(id),
  participants_count int not null default 1,
  status booking_status not null default 'pending',
  total_price_cents int not null,
  commission_cents int not null default 0,
  promo_code_id uuid references promo_codes(id),
  qr_code text unique,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bookings_user on bookings(user_id);
create index idx_bookings_activity on bookings(activity_id);
create index idx_bookings_status on bookings(status);

-- =========================================================
-- 7. PAIEMENTS (miroir des événements Stripe)
-- =========================================================

create table payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id) on delete cascade,
  stripe_payment_intent_id text unique,
  amount_cents int not null,
  status payment_status not null default 'pending',
  refunded_amount_cents int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 8. AVIS
-- =========================================================

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id),
  user_id uuid not null references profiles(id),
  activity_id uuid not null references activities(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default true,   -- bascule à false si modération auto déclenchée
  pro_reply text,
  pro_reply_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index uniq_review_per_booking on reviews(booking_id);

-- =========================================================
-- 9. FAVORIS
-- =========================================================

create table favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  activity_id uuid not null references activities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, activity_id)
);

-- =========================================================
-- 10. MESSAGERIE
-- =========================================================

create table conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id),
  professional_id uuid not null references professionals(id),
  created_at timestamptz not null default now()
);

create unique index uniq_conversation on conversations(user_id, professional_id);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 11. NOTIFICATIONS
-- =========================================================

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,                 -- 'booking_reminder', 'booking_confirmed', etc.
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 12. PARRAINAGE
-- =========================================================

create table referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid not null references profiles(id),
  referred_id uuid not null references profiles(id) unique,
  reward_granted boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 13. JOURNAL ADMIN (traçabilité)
-- =========================================================

create table admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references profiles(id),
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 14. TRIGGERS UTILES
-- =========================================================

-- Met à jour la note moyenne d'une activité après un nouvel avis
create or replace function update_activity_rating()
returns trigger as $$
begin
  update activities
  set
    average_rating = (
      select coalesce(avg(rating), 0) from reviews
      where activity_id = new.activity_id and is_approved = true
    ),
    reviews_count = (
      select count(*) from reviews
      where activity_id = new.activity_id and is_approved = true
    )
  where id = new.activity_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_update_activity_rating
after insert or update on reviews
for each row execute function update_activity_rating();

-- Décrémente la capacité restante d'un créneau à la confirmation d'une réservation
create or replace function decrement_slot_capacity()
returns trigger as $$
begin
  if new.status = 'confirmed' and old.status is distinct from 'confirmed' then
    update availability_slots
    set remaining_capacity = remaining_capacity - new.participants_count
    where id = new.slot_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_decrement_slot_capacity
after update on bookings
for each row execute function decrement_slot_capacity();

-- =========================================================
-- FIN DU SCHÉMA — voir rls_policies.sql pour la sécurité
-- =========================================================


-- #########################################################
-- ###  PARTIE 2 — SÉCURITÉ (RLS)
-- #########################################################

-- =========================================================
-- LOISIRÉO — RÈGLES DE SÉCURITÉ (Row Level Security)
-- =========================================================
-- Principe : tout est verrouillé par défaut, on ouvre
-- explicitement chaque accès nécessaire.
-- =========================================================

alter table profiles enable row level security;
alter table professionals enable row level security;
alter table activities enable row level security;
alter table activity_images enable row level security;
alter table availability_slots enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table favorites enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table promo_codes enable row level security;
alter table referrals enable row level security;
alter table admin_logs enable row level security;

-- Fonction utilitaire : récupère le rôle de l'utilisateur connecté
create or replace function current_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

-- Fonction utilitaire : l'établissement appartient-il à l'utilisateur connecté ?
create or replace function owns_professional(pro_id uuid)
returns boolean as $$
  select exists(
    select 1 from professionals
    where id = pro_id and owner_id = auth.uid()
  );
$$ language sql stable security definer;

-- =========================================================
-- PROFILES
-- =========================================================

create policy "Un utilisateur lit son propre profil"
on profiles for select
using (auth.uid() = id or current_user_role() = 'admin');

create policy "Un utilisateur modifie son propre profil"
on profiles for update
using (auth.uid() = id);

create policy "Création de profil à l'inscription"
on profiles for insert
with check (auth.uid() = id);

-- =========================================================
-- PROFESSIONALS (établissements)
-- =========================================================

create policy "Tout le monde voit les établissements actifs"
on professionals for select
using (status = 'active' or owner_id = auth.uid() or current_user_role() = 'admin');

create policy "Un pro crée son établissement"
on professionals for insert
with check (owner_id = auth.uid());

create policy "Un pro modifie son propre établissement"
on professionals for update
using (owner_id = auth.uid() or current_user_role() = 'admin');

-- =========================================================
-- ACTIVITIES
-- =========================================================

create policy "Tout le monde voit les activités publiées"
on activities for select
using (
  is_published = true
  or owns_professional(professional_id)
  or current_user_role() = 'admin'
);

create policy "Un pro gère les activités de son établissement"
on activities for insert
with check (owns_professional(professional_id));

create policy "Un pro modifie les activités de son établissement"
on activities for update
using (owns_professional(professional_id));

create policy "Un pro supprime les activités de son établissement"
on activities for delete
using (owns_professional(professional_id));

-- =========================================================
-- ACTIVITY_IMAGES (hérite des droits de l'activité parente)
-- =========================================================

create policy "Lecture publique des images d'activités publiées"
on activity_images for select
using (
  exists(
    select 1 from activities a
    where a.id = activity_id
    and (a.is_published = true or owns_professional(a.professional_id))
  )
);

create policy "Un pro gère les images de ses activités"
on activity_images for all
using (
  exists(
    select 1 from activities a
    where a.id = activity_id and owns_professional(a.professional_id)
  )
);

-- =========================================================
-- AVAILABILITY_SLOTS
-- =========================================================

create policy "Tout le monde voit les créneaux d'activités publiées"
on availability_slots for select
using (
  exists(
    select 1 from activities a
    where a.id = activity_id
    and (a.is_published = true or owns_professional(a.professional_id))
  )
);

create policy "Un pro gère les créneaux de ses activités"
on availability_slots for all
using (
  exists(
    select 1 from activities a
    where a.id = activity_id and owns_professional(a.professional_id)
  )
);

-- =========================================================
-- BOOKINGS
-- =========================================================

create policy "Un client voit ses propres réservations"
on bookings for select
using (
  user_id = auth.uid()
  or exists(
    select 1 from activities a
    where a.id = activity_id and owns_professional(a.professional_id)
  )
  or current_user_role() = 'admin'
);

create policy "Un client crée sa propre réservation"
on bookings for insert
with check (user_id = auth.uid());

create policy "Annulation par le client ou le pro concerné"
on bookings for update
using (
  user_id = auth.uid()
  or exists(
    select 1 from activities a
    where a.id = activity_id and owns_professional(a.professional_id)
  )
);

-- =========================================================
-- PAYMENTS (jamais modifiable côté client, lecture seule)
-- =========================================================

create policy "Lecture des paiements liés à ses réservations"
on payments for select
using (
  exists(
    select 1 from bookings b
    where b.id = booking_id
    and (b.user_id = auth.uid() or current_user_role() = 'admin')
  )
);
-- Aucune policy insert/update : seul le backend (service_role via webhook Stripe) écrit ici.

-- =========================================================
-- REVIEWS
-- =========================================================

create policy "Tout le monde voit les avis approuvés"
on reviews for select
using (is_approved = true or user_id = auth.uid() or current_user_role() = 'admin');

create policy "Un client publie un avis sur sa propre réservation"
on reviews for insert
with check (
  user_id = auth.uid()
  and exists(
    select 1 from bookings b
    where b.id = booking_id and b.user_id = auth.uid() and b.status = 'completed'
  )
);

create policy "Le pro répond à un avis sur ses activités"
on reviews for update
using (
  exists(
    select 1 from activities a
    where a.id = activity_id and owns_professional(a.professional_id)
  )
);

-- =========================================================
-- FAVORITES
-- =========================================================

create policy "Un utilisateur gère ses propres favoris"
on favorites for all
using (user_id = auth.uid());

-- =========================================================
-- CONVERSATIONS & MESSAGES
-- =========================================================

create policy "Accès à ses propres conversations"
on conversations for select
using (
  user_id = auth.uid() or owns_professional(professional_id)
);

create policy "Création d'une conversation"
on conversations for insert
with check (user_id = auth.uid() or owns_professional(professional_id));

create policy "Lecture des messages de ses conversations"
on messages for select
using (
  exists(
    select 1 from conversations c
    where c.id = conversation_id
    and (c.user_id = auth.uid() or owns_professional(c.professional_id))
  )
);

create policy "Envoi de message dans ses conversations"
on messages for insert
with check (
  sender_id = auth.uid()
  and exists(
    select 1 from conversations c
    where c.id = conversation_id
    and (c.user_id = auth.uid() or owns_professional(c.professional_id))
  )
);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

create policy "Un utilisateur voit ses propres notifications"
on notifications for select
using (user_id = auth.uid());

create policy "Un utilisateur marque ses notifications comme lues"
on notifications for update
using (user_id = auth.uid());

-- =========================================================
-- PROMO_CODES (lecture publique des codes actifs, gestion admin)
-- =========================================================

create policy "Lecture des codes promo actifs"
on promo_codes for select
using (valid_until is null or valid_until > now());

create policy "Seul un admin gère les codes promo"
on promo_codes for all
using (current_user_role() = 'admin');

-- =========================================================
-- REFERRALS
-- =========================================================

create policy "Un utilisateur voit les parrainages qui le concernent"
on referrals for select
using (referrer_id = auth.uid() or referred_id = auth.uid());

-- =========================================================
-- ADMIN_LOGS (réservé aux admins)
-- =========================================================

create policy "Seuls les admins consultent les logs"
on admin_logs for select
using (current_user_role() = 'admin');

create policy "Seuls les admins écrivent des logs"
on admin_logs for insert
with check (current_user_role() = 'admin');


-- #########################################################
-- ###  PARTIE 3 — DONNÉES FICTIVES (SEED)
-- #########################################################

-- =========================================================
-- LOISIRÉO — DONNÉES FICTIVES (seed)
-- =========================================================
-- À lancer après schema.sql et rls_policies.sql.
-- Utilise des UUID fixes pour pouvoir les référencer facilement
-- pendant le développement.
-- =========================================================

-- ---------------------------------------------------------
-- Profils (3 clients, 3 propriétaires pro, 1 admin)
-- Note : en conditions réelles, ces lignes sont créées
-- automatiquement par un trigger sur auth.users à l'inscription.
-- Ici on les insère directement pour le seed de dev.
-- ---------------------------------------------------------

insert into profiles (id, role, first_name, last_name, phone, loyalty_points) values
  ('11111111-1111-1111-1111-111111111111', 'client', 'Camille', 'Durand', '0612345678', 120),
  ('22222222-2222-2222-2222-222222222222', 'client', 'Hugo', 'Lefèvre', '0623456789', 40),
  ('33333333-3333-3333-3333-333333333333', 'client', 'Inès', 'Bernard', '0634567890', 0),
  ('44444444-4444-4444-4444-444444444444', 'pro', 'Karim', 'Saidi', '0145678901', 0),
  ('55555555-5555-5555-5555-555555555555', 'pro', 'Lucie', 'Moreau', '0156789012', 0),
  ('66666666-6666-6666-6666-666666666666', 'pro', 'Thomas', 'Petit', '0167890123', 0),
  ('77777777-7777-7777-7777-777777777777', 'admin', 'Admin', 'Loisiréo', '0100000000', 0);

-- ---------------------------------------------------------
-- Établissements professionnels
-- ---------------------------------------------------------

insert into professionals
  (id, owner_id, company_name, siret, description, address, city, postal_code,
   latitude, longitude, phone, email, status, is_founding_partner, commission_rate)
values
  ('aaaaaaaa-0001-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444',
   'Padel Club Lyon', '12345678900011', 'Le plus grand club de padel de Lyon, 6 terrains indoor.',
   '12 rue de la République', 'Lyon', '69002', 45.7578, 4.8320, '0478123456',
   'contact@padelclublyon.fr', 'active', true, 5.00),

  ('aaaaaaaa-0002-0002-0002-000000000002', '55555555-5555-5555-5555-555555555555',
   'Escape Mystère Paris', '12345678900022', 'Trois salles d''escape game à thème dans le Marais.',
   '8 rue des Archives', 'Paris', '75004', 48.8606, 2.3622, '0142123456',
   'contact@escapemystere.fr', 'active', true, 5.00),

  ('aaaaaaaa-0003-0003-0003-000000000003', '66666666-6666-6666-6666-666666666666',
   'Yoga Lab Bordeaux', '12345678900033', 'Studio de yoga et méditation au cœur de Bordeaux.',
   '24 cours de l''Intendance', 'Bordeaux', '33000', 44.8412, -0.5772, '0556123456',
   'contact@yogalab-bdx.fr', 'active', false, 15.00);

-- ---------------------------------------------------------
-- Activités
-- ---------------------------------------------------------

insert into activities
  (id, professional_id, slug, title, category, description, duration_minutes, price_cents,
   min_participants, max_participants, min_age, is_indoor, is_outdoor, is_pmr_accessible,
   practical_info, is_published, average_rating, reviews_count)
values
  ('bbbbbbbb-0001-0001-0001-000000000001', 'aaaaaaaa-0001-0001-0001-000000000001',
   'padel-club-lyon-terrain-1h', 'Location terrain de padel (1h)', 'padel',
   'Réservez un terrain indoor climatisé, raquettes et balles fournies sur demande.',
   60, 4000, 2, 4, 12, true, false, true,
   'Chaussures de sport obligatoires. Parking gratuit sur place.', true, 4.7, 38),

  ('bbbbbbbb-0002-0002-0002-000000000002', 'aaaaaaaa-0002-0002-0002-000000000002',
   'escape-mystere-paris-le-manoir', 'Le Manoir Hanté', 'escape_game',
   'Une heure pour percer le secret du manoir avant que la malédiction ne se referme.',
   60, 3200, 2, 6, 10, true, false, false,
   'Non recommandé aux personnes sujettes à la claustrophobie sévère.', true, 4.9, 152),

  ('bbbbbbbb-0003-0003-0003-000000000003', 'aaaaaaaa-0003-0003-0003-000000000003',
   'yoga-lab-bordeaux-vinyasa-debutant', 'Vinyasa Flow — Spécial débutants', 'yoga',
   'Une séance douce pour découvrir les bases du yoga vinyasa, encadrée par une instructrice diplômée.',
   75, 1800, 1, 12, 16, true, false, true,
   'Tapis fournis. Pensez à venir 10 minutes en avance.', true, 4.8, 64);

-- ---------------------------------------------------------
-- Images
-- ---------------------------------------------------------

insert into activity_images (activity_id, url, position) values
  ('bbbbbbbb-0001-0001-0001-000000000001', 'https://images.loisireo.fr/seed/padel-1.jpg', 0),
  ('bbbbbbbb-0001-0001-0001-000000000001', 'https://images.loisireo.fr/seed/padel-2.jpg', 1),
  ('bbbbbbbb-0002-0002-0002-000000000002', 'https://images.loisireo.fr/seed/escape-1.jpg', 0),
  ('bbbbbbbb-0003-0003-0003-000000000003', 'https://images.loisireo.fr/seed/yoga-1.jpg', 0);

-- ---------------------------------------------------------
-- Créneaux disponibles (sur les 7 prochains jours)
-- ---------------------------------------------------------

insert into availability_slots (activity_id, start_time, end_time, total_capacity, remaining_capacity)
select
  'bbbbbbbb-0001-0001-0001-000000000001',
  date_trunc('day', now()) + (d || ' days')::interval + (h || ' hours')::interval,
  date_trunc('day', now()) + (d || ' days')::interval + (h || ' hours')::interval + interval '1 hour',
  4, 4
from generate_series(0, 6) d, generate_series(9, 20, 2) h;

insert into availability_slots (activity_id, start_time, end_time, total_capacity, remaining_capacity)
select
  'bbbbbbbb-0002-0002-0002-000000000002',
  date_trunc('day', now()) + (d || ' days')::interval + (h || ' hours')::interval,
  date_trunc('day', now()) + (d || ' days')::interval + (h || ' hours')::interval + interval '1 hour',
  6, 6
from generate_series(0, 6) d, generate_series(10, 22, 2) h;

insert into availability_slots (activity_id, start_time, end_time, total_capacity, remaining_capacity)
select
  'bbbbbbbb-0003-0003-0003-000000000003',
  date_trunc('day', now()) + (d || ' days')::interval + interval '18 hours',
  date_trunc('day', now()) + (d || ' days')::interval + interval '19 hours 15 minutes',
  12, 9
from generate_series(0, 6) d;

-- ---------------------------------------------------------
-- Réservations + avis (exemples)
-- ---------------------------------------------------------

insert into bookings
  (id, user_id, activity_id, slot_id, participants_count, status, total_price_cents, commission_cents, qr_code)
select
  'cccccccc-0001-0001-0001-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-0002-0002-0002-000000000002',
  id,
  4, 'completed', 12800, 0, 'LOIS-CCCCCCCC0001'
from availability_slots
where activity_id = 'bbbbbbbb-0002-0002-0002-000000000002'
order by start_time asc
limit 1;

insert into reviews (booking_id, user_id, activity_id, rating, comment) values
  ('cccccccc-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111',
   'bbbbbbbb-0002-0002-0002-000000000002', 5,
   'Décor superbe, énigmes bien pensées, on a flippé pour de vrai ! À refaire.');

-- ---------------------------------------------------------
-- Favoris
-- ---------------------------------------------------------

insert into favorites (user_id, activity_id) values
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0001-0001-0001-000000000001'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0003-0003-0003-000000000003');

-- ---------------------------------------------------------
-- Codes promo
-- ---------------------------------------------------------

insert into promo_codes (code, discount_percent, max_uses, valid_until) values
  ('BIENVENUE10', 10, 1000, now() + interval '6 months'),
  ('ETE2026', 15, 500, '2026-09-15');

-- ---------------------------------------------------------
-- Fin du seed
-- ---------------------------------------------------------
