import { getProDashboard } from "@/lib/pro";
import { formatPrice } from "@/lib/format";

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  confirmed: { label: "Confirmé", bg: "#E3F2EC", fg: "#1F7A53" },
  pending: { label: "En attente", bg: "#FDEFE3", fg: "#B45309" },
  completed: { label: "Terminé", bg: "#EEF1EC", fg: "#5B6472" },
  cancelled: { label: "Annulé", bg: "#FBE3E6", fg: "#FF4D6D" },
  refunded: { label: "Remboursé", bg: "#EEF1EC", fg: "#5B6472" },
};

export default async function ProReservationsPage() {
  const { bookings } = await getProDashboard();

  const upcoming = bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length;
  const revenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((s, b) => s + b.total_price_cents, 0);

  return (
    <div>
      <h1 className="text-2xl font-extrabold font-display mb-1">Réservations</h1>
      <p className="text-sm text-slatey mb-6">Suivez et gérez toutes les réservations de votre établissement.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          ["Total", String(bookings.length)],
          ["À honorer", String(upcoming)],
          ["Chiffre d'affaires", formatPrice(revenue)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-white p-4 border border-sand">
            <p className="text-xl font-bold font-mono">{v}</p>
            <p className="text-xs text-slatey">{l}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-sand p-5">
        {bookings.length === 0 && <p className="text-sm text-slatey">Aucune réservation pour le moment.</p>}

        <div className="hidden sm:block overflow-x-auto">
          {bookings.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slatey">
                  {["Client", "Activité", "Créneau", "Pers.", "Montant", "Statut", ""].map((h) => (
                    <th key={h} className="pb-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const s = STATUS[b.status] ?? STATUS.pending;
                  return (
                    <tr key={b.id} className="border-t border-sand">
                      <td className="py-3 font-semibold">{b.client_name}</td>
                      <td className="py-3 text-slatey">{b.activity_title}</td>
                      <td className="py-3 text-slatey">
                        {b.slot_start ? new Date(b.slot_start).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—"}
                      </td>
                      <td className="py-3 text-slatey">{b.participants_count}</td>
                      <td className="py-3 font-semibold font-mono">{formatPrice(b.total_price_cents)}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.fg }}>{s.label}</span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-xs font-semibold text-raspberry">Détails</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="sm:hidden flex flex-col gap-3">
          {bookings.map((b) => {
            const s = STATUS[b.status] ?? STATUS.pending;
            return (
              <div key={b.id} className="rounded-xl p-3 border border-sand">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{b.client_name}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.fg }}>{s.label}</span>
                </div>
                <p className="text-xs text-slatey">{b.activity_title}</p>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-slatey">
                    {b.slot_start ? new Date(b.slot_start).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—"} · {b.participants_count} pers.
                  </span>
                  <span className="font-semibold font-mono">{formatPrice(b.total_price_cents)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
