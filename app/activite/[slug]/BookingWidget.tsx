"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Activity, Slot } from "@/lib/types";
import { formatPrice } from "@/lib/format";

// Regroupe les créneaux par jour (clé lisible -> liste de créneaux)
function groupByDay(slots: Slot[]) {
  const groups: Record<string, Slot[]> = {};
  for (const s of slots) {
    const d = new Date(s.start_time);
    const key = d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
    (groups[key] ??= []).push(s);
  }
  return groups;
}

export function BookingWidget({ activity, slots }: { activity: Activity; slots: Slot[] }) {
  const grouped = useMemo(() => groupByDay(slots), [slots]);
  const days = Object.keys(grouped);

  const [day, setDay] = useState(days[0] ?? "");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [people, setPeople] = useState(activity.min_participants);
  const [loading, setLoading] = useState(false);

  const daySlots = grouped[day] ?? [];
  const total = activity.price_cents * people;

  async function handleBooking() {
    if (!slot) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: activity.id,
          activitySlug: activity.slug,
          slotId: slot.id,
          title: activity.title,
          unitAmount: activity.price_cents,
          quantity: people,
          day,
          slot: new Date(slot.start_time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Paiement indisponible (clé Stripe non configurée).");
    } catch {
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lg:sticky lg:top-20 rounded-2xl overflow-hidden bg-white border border-sand">
      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono">{formatPrice(activity.price_cents)}</span>
          <span className="text-sm text-slatey">/ participant</span>
        </div>

        <p className="text-xs font-semibold mt-4 mb-2">Choisir une date</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => { setDay(d); setSlot(null); }}
              className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border whitespace-nowrap"
              style={{
                backgroundColor: day === d ? "#16213D" : "#EEF1EC",
                color: day === d ? "#fff" : "#16213D",
                borderColor: day === d ? "#16213D" : "#E4DFCB",
              }}
            >
              {d}
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold mt-4 mb-2">Créneaux disponibles</p>
        <div className="grid grid-cols-2 gap-2">
          {daySlots.length === 0 && <p className="col-span-2 text-xs text-slatey">Aucun créneau ce jour-là.</p>}
          {daySlots.map((sl) => {
            const time = new Date(sl.start_time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
            const full = sl.remaining_capacity === 0;
            const active = slot?.id === sl.id;
            return (
              <button
                key={sl.id}
                disabled={full}
                onClick={() => setSlot(sl)}
                className="rounded-lg py-2 text-xs font-semibold flex flex-col items-center border disabled:cursor-not-allowed"
                style={{
                  backgroundColor: active ? "#16213D" : full ? "#EEF1EC" : "#fff",
                  color: active ? "#fff" : full ? "#5B6472" : "#16213D",
                  borderColor: active ? "#16213D" : "#E4DFCB",
                  opacity: full ? 0.5 : 1,
                }}
              >
                {time}
                <span className="text-[10px] font-normal">{full ? "Complet" : `${sl.remaining_capacity} places`}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs font-semibold mt-4 mb-2">Participants</p>
        <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-sand">
          <button
            onClick={() => setPeople(Math.max(activity.min_participants, people - 1))}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-mist"
            aria-label="Retirer un participant"
          >
            <Minus size={14} />
          </button>
          <span className="text-sm font-semibold">{people} personnes</span>
          <button
            onClick={() => setPeople(Math.min(activity.max_participants, people + 1))}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-mist"
            aria-label="Ajouter un participant"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="ticket-perf">
        <div className="absolute left-3 right-3 top-0 border-t-2 border-dashed border-sand" />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-slatey">{people} × {formatPrice(activity.price_cents)}</span>
          <span className="font-semibold font-mono">{formatPrice(total)}</span>
        </div>
        <button
          disabled={!slot || loading}
          onClick={handleBooking}
          className="w-full py-3 rounded-full font-semibold text-sm disabled:cursor-not-allowed"
          style={{ backgroundColor: slot ? "#FF4D6D" : "#E4DFCB", color: slot ? "#fff" : "#5B6472" }}
        >
          {loading ? "Redirection…" : slot ? "Réserver et payer" : "Choisir un créneau"}
        </button>
        <p className="text-center text-xs mt-2 text-slatey">Annulation gratuite jusqu'à 24h avant</p>
      </div>
    </div>
  );
}
