import type { Activity } from "./types";
import { createClient, isSupabaseConfigured } from "./supabase/server";
import { decorate, categoryStyle, formatPrice } from "./format";

// Ré-exports pour compat (les Server Components peuvent tout importer depuis "@/lib/data")
export { decorate, categoryStyle, formatPrice };

// ---------- Données de démo (repli si Supabase non configuré) ----------
export const DEMO_ACTIVITIES: Activity[] = [
  {
    id: "a1", slug: "padel-club-lyon-terrain-1h", title: "Location terrain de padel (1h)",
    category: "padel", description: "Terrain indoor climatisé, raquettes et balles fournies sur demande.",
    duration_minutes: 60, price_cents: 4000, min_participants: 2, max_participants: 4,
    is_indoor: true, is_outdoor: false, is_pmr_accessible: true,
    average_rating: 4.7, reviews_count: 38,
    professional: { id: "p1", company_name: "Padel Club Lyon", city: "Lyon", postal_code: "69002", address: "12 rue de la République", latitude: 45.7578, longitude: 4.8320, is_founding_partner: true },
  },
  {
    id: "a2", slug: "escape-mystere-paris-le-manoir", title: "Le Manoir Hanté",
    category: "escape_game", description: "Une heure pour percer le secret du manoir avant que la malédiction ne se referme.",
    duration_minutes: 60, price_cents: 3200, min_participants: 2, max_participants: 6,
    is_indoor: true, is_outdoor: false, is_pmr_accessible: false,
    average_rating: 4.9, reviews_count: 152,
    professional: { id: "p2", company_name: "Escape Mystère Paris", city: "Paris", postal_code: "75004", address: "8 rue des Archives", latitude: 48.8606, longitude: 2.3622, is_founding_partner: true },
  },
  {
    id: "a3", slug: "yoga-lab-bordeaux-vinyasa-debutant", title: "Vinyasa Flow — débutants",
    category: "yoga", description: "Une séance douce pour découvrir les bases du yoga vinyasa.",
    duration_minutes: 75, price_cents: 1800, min_participants: 1, max_participants: 12,
    is_indoor: true, is_outdoor: false, is_pmr_accessible: true,
    average_rating: 4.8, reviews_count: 64,
    professional: { id: "p3", company_name: "Yoga Lab Bordeaux", city: "Bordeaux", postal_code: "33000", address: "24 cours de l'Intendance", latitude: 44.8412, longitude: -0.5772, is_founding_partner: false },
  },
  {
    id: "a4", slug: "karting-arena-villeurbanne", title: "Session karting indoor",
    category: "karting", description: "10 tours sur piste indoor, casque et combinaison fournis.",
    duration_minutes: 20, price_cents: 2800, min_participants: 1, max_participants: 8,
    is_indoor: true, is_outdoor: false, is_pmr_accessible: false,
    average_rating: 4.6, reviews_count: 91,
    professional: { id: "p4", company_name: "Karting Arena Villeurbanne", city: "Villeurbanne", postal_code: "69100", address: "5 av. des Sports", latitude: 45.7733, longitude: 4.8800, is_founding_partner: false },
  },
  {
    id: "a5", slug: "foret-aventure-annecy", title: "Parcours accrobranche famille",
    category: "accrobranche", description: "Parcours adaptés à tous les âges au cœur de la forêt.",
    duration_minutes: 120, price_cents: 2200, min_participants: 1, max_participants: 20,
    is_indoor: false, is_outdoor: true, is_pmr_accessible: false,
    average_rating: 4.8, reviews_count: 47,
    professional: { id: "p5", company_name: "Forêt Aventure Annecy", city: "Annecy", postal_code: "74000", address: "Route du Semnoz", latitude: 45.8992, longitude: 6.1294, is_founding_partner: false },
  },
];

const SELECT = `
  id, slug, title, category, description, duration_minutes, price_cents,
  min_participants, max_participants, is_indoor, is_outdoor, is_pmr_accessible,
  average_rating, reviews_count,
  professional:professionals (
    id, company_name, city, postal_code, address, latitude, longitude, is_founding_partner
  )
`;

export async function getActivities(query?: { q?: string; city?: string }): Promise<Activity[]> {
  if (!isSupabaseConfigured) {
    let list = DEMO_ACTIVITIES;
    if (query?.q) {
      const q = query.q.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.category.includes(q));
    }
    if (query?.city) {
      const c = query.city.toLowerCase();
      list = list.filter((a) => a.professional?.city.toLowerCase().includes(c));
    }
    return list.map(decorate);
  }

  const supabase = await createClient();
  let req = supabase.from("activities").select(SELECT).eq("is_published", true);
  if (query?.q) req = req.ilike("title", `%${query.q}%`);

  const { data, error } = await req.limit(50);
  if (error || !data) return DEMO_ACTIVITIES.map(decorate);

  let list = data as unknown as Activity[];
  if (query?.city) {
    const c = query.city.toLowerCase();
    list = list.filter((a) => a.professional?.city.toLowerCase().includes(c));
  }
  return list.map(decorate);
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  if (!isSupabaseConfigured) {
    const a = DEMO_ACTIVITIES.find((x) => x.slug === slug);
    return a ? decorate(a) : null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("activities").select(SELECT).eq("slug", slug).single();
  if (error || !data) {
    const a = DEMO_ACTIVITIES.find((x) => x.slug === slug);
    return a ? decorate(a) : null;
  }
  return decorate(data as unknown as Activity);
}
