export type ActivityCategory =
  | "padel" | "escape_game" | "bowling" | "karting" | "laser_game"
  | "yoga" | "danse" | "atelier_creatif" | "musee" | "accrobranche"
  | "sport_nautique" | "stage" | "evenement" | "autre";

export interface Professional {
  id: string;
  company_name: string;
  city: string;
  postal_code: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  is_founding_partner: boolean;
}

export interface Activity {
  id: string;
  slug: string;
  title: string;
  category: ActivityCategory;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  min_participants: number;
  max_participants: number;
  is_indoor: boolean;
  is_outdoor: boolean;
  is_pmr_accessible: boolean;
  average_rating: number;
  reviews_count: number;
  // joint depuis professionals
  professional?: Professional;
  // champ d'affichage dérivé
  icon?: string;
  gradient?: string;
}

export interface Slot {
  id: string;
  activity_id: string;
  start_time: string;
  end_time: string;
  remaining_capacity: number;
  total_capacity: number;
}
