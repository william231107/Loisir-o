# Loisiréo — Application Next.js

Plateforme de réservation d'activités et loisirs en France.
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · Supabase · Stripe · Google Maps.

## ⚡ Démarrage rapide (fonctionne sans aucune clé)

```bash
npm install      # si conflit de peer deps (React 19) : npm install --legacy-peer-deps
npm run dev
```

Ouvrez http://localhost:3000. L'app tourne immédiatement avec des **données de démo**
(5 activités), la recherche et les fiches activité. La carte et le paiement
affichent un message tant que les clés ne sont pas renseignées — c'est normal.

## 🔑 Activer les services réels

Copiez `.env.example` vers `.env.local` et remplissez les clés :

```bash
cp .env.example .env.local
```

### 1. Supabase (base de données + auth)
1. Créez un projet sur https://supabase.com
2. Dans **SQL Editor**, collez et exécutez `supabase/database-complete.sql`
   (il crée les tables, la sécurité RLS et insère les données fictives).
3. Exécutez ensuite `supabase/migration-auth-trigger.sql` (crée le profil
   automatiquement à chaque inscription).
4. Dans **Project Settings → API**, copiez l'URL et les clés dans `.env.local` :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (gardez-la secrète, côté serveur uniquement)

Dès que ces clés sont présentes, l'app lit les vraies données au lieu de la démo.

### 2. Google Maps
1. Sur https://console.cloud.google.com, activez **Maps JavaScript API**.
2. Créez une clé API, restreignez-la à votre domaine.
3. Renseignez `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

La carte interactive apparaît alors sur `/recherche` (marqueurs avec prix +
infobulles cliquables) et sur chaque fiche activité.

### 3. Stripe (paiement)
1. Sur https://dashboard.stripe.com, récupérez vos clés de test.
2. Renseignez `STRIPE_SECRET_KEY` et `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Pour les webhooks en local :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copiez le `whsec_...` affiché dans `STRIPE_WEBHOOK_SECRET`.

Le bouton « Réserver » d'une fiche redirige vers Stripe Checkout (carte test
`4242 4242 4242 4242`), puis vers la page de confirmation.

## 🗂️ Structure

```
app/
  page.tsx                      Accueil
  recherche/page.tsx            Résultats + carte Google Maps
  activite/[slug]/
    page.tsx                    Fiche activité
    ActivityMap.tsx             Mini-carte de localisation
    BookingWidget.tsx           Sélection créneau + paiement
  reservation/confirmation/     Page de retour après paiement
  api/
    search/route.ts             Recherche JSON
    stripe/checkout/route.ts    Création session de paiement
    stripe/webhook/route.ts     Confirmation paiement
components/
  Navbar.tsx, ActivityCard.tsx, SearchMap.tsx
lib/
  supabase/{client,server}.ts   Connexions Supabase
  data.ts                       Lecture des données (+ repli démo)
  types.ts                      Types du domaine
middleware.ts                   Protection des routes /compte /pro /admin
supabase/database-complete.sql  Schéma + sécurité + données
```

## 🚀 Déploiement (Vercel)
1. Poussez le repo sur GitHub.
2. Importez-le sur https://vercel.com.
3. Ajoutez les mêmes variables d'environnement dans les **Project Settings**.
4. Déployez. (Supabase et Stripe sont déjà hébergés de leur côté.)

## ✅ État
- Fait : accueil, recherche + Google Maps, fiche activité + localisation +
  vrais créneaux, connexion/inscription Supabase, espace utilisateur connecté
  (tableau de bord + mes réservations), tunnel Stripe Checkout qui crée une
  réservation `pending`, webhook qui la confirme + crée le paiement + la
  notification + génère le QR, middleware de rôles, base SQL complète.
- Fait aussi : **espace pro connecté complet** — tableau de bord (KPI, revenus,
  réservations), mes activités + création d'activité, calendrier hebdo,
  réservations, statistiques (CA par activité), messagerie, paramètres
  d'établissement, le tout avec navigation mobile (iPad/téléphone).
- À compléter : espace admin connecté, emails de confirmation et rappels
  automatiques (Vercel Cron + Resend), upload des photos d'activité
  (Supabase Storage), Stripe Connect pour reverser automatiquement les pros.

## 🔄 Parcours de réservation réel
1. L'utilisateur connecté choisit un créneau → clic « Réserver et payer ».
2. `/api/stripe/checkout` crée une réservation `pending` et une session Stripe.
3. Paiement sur Stripe → redirection vers `/reservation/confirmation`.
4. `/api/stripe/webhook` reçoit `checkout.session.completed`, passe la
   réservation à `confirmed`, génère le QR, enregistre le paiement et notifie.
   (Le trigger SQL décrémente automatiquement les places du créneau.)
```
