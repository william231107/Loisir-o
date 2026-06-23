import { createClient, isSupabaseConfigured } from "./supabase/server";
import { decorate, DEMO_ACTIVITIES } from "./data";
import type { Activity, Professional } from "./types";

export interface ProBooking {
  id: string;
  client_name: string;
  activity_title: string;
  slot_start: string | null;
  participants_count: number;
  total_price_cents: number;
  status: string;
}

export interface ProStats {
  revenueCents: number;
  bookingsCount: number;
  fillRate: number;       // 0-100
  averageRating: number;
  revenueByWeek: number[]; // 8 valeurs en euros
}

export interface ProDashboardData {
  professional: Professional | null;
  activities: Activity[];
  bookings: ProBooking[];
  stats: ProStats;
}

// ---------- Données de démo ----------
const DEMO_PRO: Professional = {
  id: "p2", company_name: "Escape Mystère Paris", city: "Paris", postal_code: "75004",
  address: "8 rue des Archives", latitude: 48.8606, longitude: 2.3622, is_founding_partner: true,
};

const DEMO_PRO_ACTIVITIES: Activity[] = [
  DEMO_ACTIVITIES[1],
  {
    ...DEMO_ACTIVITIES[1],
    id: "a2b", slug: "escape-mystere-paris-la-crypte", title: "La Crypte Oubliée",
    price_cents: 3400, average_rating: 4.7, reviews_count: 88,
  },
];

const DEMO_PRO_BOOKINGS: ProBooking[] = [
  { id: "pb1", client_name: "Camille Durand", activity_title: "Le Manoir Hanté", slot_start: new Date(Date.now() + 4 * 864e5).toISOString(), participants_count: 4, total_price_cents: 12800, status: "confirmed" },
  { id: "pb2", client_name: "Hugo Lefèvre", activity_title: "La Crypte Oubliée", slot_start: new Date(Date.now() + 4 * 864e5).toISOString(), participants_count: 5, total_price_cents: 17000, status: "confirmed" },
  { id: "pb3", client_name: "Inès Bernard", activity_title: "Le Manoir Hanté", slot_start: new Date(Date.now() + 5 * 864e5).toISOString(), participants_count: 2, total_price_cents: 6400, status: "pending" },
  { id: "pb4", client_name: "Léa Petit", activity_title: "La Crypte Oubliée", slot_start: new Date(Date.now() + 6 * 864e5).toISOString(), participants_count: 6, total_price_cents: 20400, status: "confirmed" },
];

const DEMO_STATS: ProStats = {
  revenueCents: 428000,
  bookingsCount: 134,
  fillRate: 76,
  averageRating: 4.9,
  revenueByWeek: [620, 740, 810, 690, 880, 940, 1010, 920],
};

// ---------- Lecture ----------
async function getMyProfessional() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, pro: null as Professional | null };

  const { data: pro } = await supabase
    .from("professionals")
    .select("id, company_name, city, postal_code, address, latitude, longitude, is_founding_partner")
    .eq("owner_id", user.id)
    .single();

  return { supabase, user, pro: (pro as Professional) ?? null };
}

export async function getProDashboard(): Promise<ProDashboardData> {
  if (!isSupabaseConfigured) {
    return {
      professional: DEMO_PRO,
      activities: DEMO_PRO_ACTIVITIES.map(decorate),
      bookings: DEMO_PRO_BOOKINGS,
      stats: DEMO_STATS,
    };
  }

  const { supabase, pro } = await getMyProfessional();
  if (!pro) {
    // Pro pas encore d'établissement → données vides
    return { professional: null, activities: [], bookings: [], stats: { revenueCents: 0, bookingsCount: 0, fillRate: 0, averageRating: 0, revenueByWeek: [0, 0, 0, 0, 0, 0, 0, 0] } };
  }

  const { data: acts } = await supabase
    .from("activities")
    .select("id, slug, title, category, description, duration_minutes, price_cents, min_participants, max_participants, is_indoor, is_outdoor, is_pmr_accessible, average_rating, reviews_count")
    .eq("professional_id", pro.id);

  const activities = ((acts as Activity[]) ?? []).map((a) => decorate({ ...a, professional: pro }));
  const activityIds = activities.map((a) => a.id);

  let bookings: ProBooking[] = [];
  let revenueCents = 0;
  let bookingsCount = 0;

  if (activityIds.length > 0) {
    const { data: bk } = await supabase
      .from("bookings")
      .select(`id, participants_count, total_price_cents, status,
        slot:availability_slots ( start_time ),
        activity:activities ( title ),
        client:profiles ( first_name, last_name )`)
      .in("activity_id", activityIds)
      .order("created_at", { ascending: false })
      .limit(50);

    bookings = ((bk as never[]) ?? []).map((row) => {
      const r = row as {
        id: string; participants_count: number; total_price_cents: number; status: string;
        slot: { start_time: string } | null;
        activity: { title: string } | null;
        client: { first_name: string | null; last_name: string | null } | null;
      };
      if (r.status === "confirmed" || r.status === "completed") {
        revenueCents += r.total_price_cents;
        bookingsCount += 1;
      }
      return {
        id: r.id,
        client_name: [r.client?.first_name, r.client?.last_name].filter(Boolean).join(" ") || "Client",
        activity_title: r.activity?.title ?? "",
        slot_start: r.slot?.start_time ?? null,
        participants_count: r.participants_count,
        total_price_cents: r.total_price_cents,
        status: r.status,
      };
    });
  }

  const avgRating = activities.length
    ? activities.reduce((s, a) => s + a.average_rating, 0) / activities.length
    : 0;

  return {
    professional: pro,
    activities,
    bookings,
    stats: {
      revenueCents,
      bookingsCount,
      fillRate: 0, // calculable plus tard depuis les créneaux
      averageRating: Math.round(avgRating * 10) / 10,
      revenueByWeek: [0, 0, 0, 0, 0, 0, 0, revenueCents / 100],
    },
  };
}
