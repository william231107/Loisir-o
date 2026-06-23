import Link from "next/link";
import { getMyBookings } from "@/lib/bookings";
import { formatPrice } from "@/lib/format";

const STATUS_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  confirmed: { label: "À venir", bg: "#E3F2EC", fg: "#1F7A53" },
  completed: { label: "Terminée", bg: "#EEF1EC", fg: "#5B6472" },
  pending: { label: "En attente", bg: "#FDEFE3", fg: "#B45309" },
  cancelled: { label: "Annulée", bg: "#FBE3E6", fg: "#FF4D6D" },
  refunded: { label: "Remboursée", bg: "#EEF1EC", fg: "#5B6472" },
};

export default async function ReservationsPage() {
  const bookings = await getMyBookings();

  return (
    <div>
      <h1 className="text-2xl font-extrabold font-display mb-1">Mes réservations</h1>
      <p className="text-sm text-slatey mb-6">Retrouvez vos billets et leur statut.</p>

      {bookings.length === 0 && (
        <div className="rounded-2xl bg-white border border-sand p-8 text-center">
          <p className="text-sm text-slatey">Vous n'avez pas encore de réservation.</p>
          <Link href="/recherche" className="inline-block mt-3 px-5 py-2.5 rounded-full text-sm font-semibold bg-ink text-white">
            Découvrir des activités
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {bookings.map((b) => {
          const s = STATUS_LABEL[b.status] ?? STATUS_LABEL.pending;
          return (
            <div key={b.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-sand">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: b.gradient }}>
                <span style={{ fontSize: 26 }}>{b.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/activite/${b.activity_slug}`} className="font-bold text-sm truncate font-display hover:underline block">
                  {b.activity_title}
                </Link>
                <p className="text-xs text-slatey">
                  {b.slot_start ? new Date(b.slot_start).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : "Date à confirmer"}
                  {" · "}{b.participants_count} pers. · {formatPrice(b.total_price_cents)}
                </p>
                {b.qr_code && <p className="text-[11px] text-slatey font-mono mt-0.5">Réf. {b.qr_code}</p>}
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0" style={{ backgroundColor: s.bg, color: s.fg }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
