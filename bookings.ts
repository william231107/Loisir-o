import type { Slot } from "./types";
import { createClient, isSupabaseConfigured } from "./supabase/server";
import { decorate, DEMO_ACTIVITIES } from "./data";

// ---------- Créneaux ----------
// Génère des créneaux de démo sur les 7 prochains jours pour une activité.
function demoSlots(activityId: string): Slot[] {
  const out: Slot[] = [];
  const now = new Date();
  for (let d = 0; d < 7; d++) {
    for (const h of [10, 14, 18, 20]) {
      const start = new Date(now);
      start.setDate(now.getDate() + d);
      start.setHours(h, 0, 0, 0);
      const end = new Date(start);
      end.setHours(h + 1);
      const remaining = (d + h) % 4 === 0 ? 0 : ((d + h) % 6) + 1;
      out.push({
        id: `demo-${activityId}-${d}-${h}`,
        activity_id: activityId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        total_capacity: 6,
        remaining_capacity: remaining,
      });
    }
  }
  return out;
}

export async function getSlots(activityId: string): Promise<Slot[]> {
  if (!isSupabaseConfigured) return demoSlots(activityId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_slots")
    .select("id, activity_id, start_time, end_time, total_capacity, remaining_capacity")
    .eq("activity_id", activityId)
    .eq("is_cancelled", false)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(60);

  if (error || !data) return demoSlots(activityId);
  return data as Slot[];
}

// ---------- Réservations de l'utilisateur connecté ----------
export interface BookingWithActivity {
  id: string;
  status: string;
  participants_count: number;
  total_price_cents: number;
  qr_code: string | null;
  slot_start: string | null;
  activity_title: string;
  activity_slug: string;
  category: string;
  icon?: string;
  gradient?: string;
}

const DEMO_BOOKINGS: BookingWithActivity[] = [
  {
    id: "b1", status: "confirmed", participants_count: 4, total_price_cents: 12800,
    qr_code: "LOIS-7K2M9X", slot_start: new Date(Date.now() + 4 * 864e5).toISOString(),
    activity_title: DEMO_ACTIVITIES[1].title, activity_slug: DEMO_ACTIVITIES[1].slug, category: "escape_game",
  },
  {
    id: "b2", status: "completed", participants_count: 2, total_price_cents: 8000,
    qr_code: "LOIS-3P8Q1Z", slot_start: new Date(Date.now() - 12 * 864e5).toISOString(),
    activity_title: DEMO_ACTIVITIES[0].title, activity_slug: DEMO_ACTIVITIES[0].slug, category: "padel",
  },
];

export async function getMyBookings(): Promise<BookingWithActivity[]> {
  if (!isSupabaseConfigured) {
    return DEMO_BOOKINGS.map((b) => {
      const s = decorate({ category: b.category } as never);
      return { ...b, icon: s.icon, gradient: s.gradient };
    });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id, status, participants_count, total_price_cents, qr_code,
      slot:availability_slots ( start_time ),
      activity:activities ( title, slug, category )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as never[]).map((row) => {
    const r = row as {
      id: string; status: string; participants_count: number; total_price_cents: number; qr_code: string | null;
      slot: { start_time: string } | null;
      activity: { title: string; slug: string; category: string };
    };
    const s = decorate({ category: r.activity.category } as never);
    return {
      id: r.id, status: r.status, participants_count: r.participants_count,
      total_price_cents: r.total_price_cents, qr_code: r.qr_code,
      slot_start: r.slot?.start_time ?? null,
      activity_title: r.activity.title, activity_slug: r.activity.slug, category: r.activity.category,
      icon: s.icon, gradient: s.gradient,
    };
  });
}
