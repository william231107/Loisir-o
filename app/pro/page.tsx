import { Euro, Ticket, TrendingUp, Star, ArrowUpRight } from "lucide-react";
import { getProDashboard } from "@/lib/pro";
import { formatPrice } from "@/lib/format";

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  confirmed: { label: "confirmé", bg: "#E3F2EC", fg: "#1F7A53" },
  pending: { label: "en attente", bg: "#FDEFE3", fg: "#B45309" },
  completed: { label: "terminé", bg: "#EEF1EC", fg: "#5B6472" },
  cancelled: { label: "annulé", bg: "#FBE3E6", fg: "#FF4D6D" },
};

export default async function ProDashboard() {
  const { professional, bookings, stats } = await getProDashboard();
  const maxRev = Math.max(...stats.revenueByWeek, 1);

  const kpis = [
    { label: "Revenus du mois", value: formatPrice(stats.revenueCents), delta: "+18%", icon: Euro, up: true },
    { label: "Réservations", value: String(stats.bookingsCount), delta: "+9%", icon: Ticket, up: true },
    { label: "Remplissage", value: `${stats.fillRate} %`, delta: "+4 pts", icon: TrendingUp, up: true },
    { label: "Note moyenne", value: String(stats.averageRating || "—"), delta: "", icon: Star, up: false },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold font-display">Bonjour, {professional?.company_name ?? "votre établissement"} 👋</h1>
        <p className="text-sm text-slatey">Voici l'activité de votre établissement cette semaine.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl bg-white p-4 border border-sand">
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-mist">
                  <Icon size={16} className="text-raspberry" />
                </span>
                {k.up && k.delta && (
                  <span className="text-xs font-semibold flex items-center gap-0.5 text-forest">
                    <ArrowUpRight size={12} /> {k.delta}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold font-mono">{k.value}</p>
              <p className="text-xs mt-0.5 text-slatey">{k.label}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white p-5 border border-sand mb-6">
        <h2 className="font-bold mb-4 font-display">Revenus — 8 dernières semaines</h2>
        <div className="flex items-end gap-2 h-40">
          {stats.revenueByWeek.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${(v / maxRev) * 100}%`,
                  background: i === stats.revenueByWeek.length - 1 ? "linear-gradient(#16213D,#FF4D6D)" : "#16213D",
                  opacity: i === stats.revenueByWeek.length - 1 ? 1 : 0.78,
                  minHeight: 4,
                }}
              />
              <span className="text-[10px] text-slatey">S{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 border border-sand">
        <h2 className="font-bold mb-4 font-display">Prochaines réservations</h2>

        {bookings.length === 0 && <p className="text-sm text-slatey">Aucune réservation pour le moment.</p>}

        <div className="hidden sm:block overflow-x-auto">
          {bookings.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slatey">
                  {["Client", "Activité", "Créneau", "Pers.", "Montant", "Statut"].map((h) => (
                    <th key={h} className="pb-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 8).map((b) => {
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="sm:hidden flex flex-col gap-3">
          {bookings.slice(0, 8).map((b) => {
            const s = STATUS[b.status] ?? STATUS.pending;
            return (
              <div key={b.id} className="rounded-xl p-3 border border-sand">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{b.client_name}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.fg }}>{s.label}</span>
                </div>
                <p className="text-xs text-slatey">{b.activity_title}</p>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-slatey">{b.participants_count} pers.</span>
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
