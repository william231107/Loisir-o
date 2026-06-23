import type { Activity, ActivityCategory } from "./types";

// ---------- Habillage visuel par catégorie ----------
const CATEGORY_STYLE: Record<string, { icon: string; gradient: string; label: string }> = {
  padel: { icon: "🎾", gradient: "linear-gradient(135deg,#2B6CB0,#16213D)", label: "Padel" },
  escape_game: { icon: "🗝️", gradient: "linear-gradient(135deg,#6B2D5C,#16213D)", label: "Escape game" },
  bowling: { icon: "🎳", gradient: "linear-gradient(135deg,#B45309,#16213D)", label: "Bowling" },
  karting: { icon: "🏁", gradient: "linear-gradient(135deg,#1F7A53,#16213D)", label: "Karting" },
  laser_game: { icon: "🔫", gradient: "linear-gradient(135deg,#7C3AED,#16213D)", label: "Laser game" },
  yoga: { icon: "🧘", gradient: "linear-gradient(135deg,#0E7490,#16213D)", label: "Yoga" },
  danse: { icon: "💃", gradient: "linear-gradient(135deg,#BE185D,#16213D)", label: "Danse" },
  atelier_creatif: { icon: "🎨", gradient: "linear-gradient(135deg,#C2410C,#16213D)", label: "Atelier créatif" },
  musee: { icon: "🖼️", gradient: "linear-gradient(135deg,#9D174D,#16213D)", label: "Musée" },
  accrobranche: { icon: "🌲", gradient: "linear-gradient(135deg,#3F6212,#16213D)", label: "Accrobranche" },
  sport_nautique: { icon: "🚣", gradient: "linear-gradient(135deg,#0369A1,#16213D)", label: "Sport nautique" },
  stage: { icon: "📚", gradient: "linear-gradient(135deg,#4338CA,#16213D)", label: "Stage" },
  evenement: { icon: "🎉", gradient: "linear-gradient(135deg,#A21CAF,#16213D)", label: "Événement" },
  autre: { icon: "✨", gradient: "linear-gradient(135deg,#475569,#16213D)", label: "Autre" },
};

export function categoryStyle(cat: ActivityCategory) {
  return CATEGORY_STYLE[cat] ?? CATEGORY_STYLE.autre;
}

export function decorate(a: Activity): Activity {
  const s = categoryStyle(a.category);
  return { ...a, icon: s.icon, gradient: s.gradient };
}

export function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  });
}
