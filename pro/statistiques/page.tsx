import { getProDashboard } from "@/lib/pro";
import { formatPrice } from "@/lib/format";

export default async function ProStatsPage() {
  const { activities, bookings, stats } = await getProDashboard();
  const maxRev = Math.max(...stats.revenueByWeek, 1);

  // Répartition du CA par activité
  const byActivity: Record<string, number> = {};
  for (const b of bookings) {
    if (b.status === "confirmed" || b.status === "completed") {
      byActivity[b.activity_title] = (byActivity[b.activity_title] ?? 0) + b.total_price_cents;
    }
  }
  const totalCents = Object.values(byActivity).reduce((s, v) => s + v, 0) || 1;
  const ranked = Object.entries(byActivity).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold font-display mb-1">Statistiques</h1>
      <p className="text-sm text-slatey mb-6">Analysez la performance de votre établissement.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ["Chiffre d'affaires", formatPrice(stats.revenueCents)],
          ["Réservations", String(stats.bookingsCount)],
          ["Note moyenne", String(stats.averageRating || "—")],
          ["Activités en ligne", String(activities.length)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-white p-4 border border-sand">
            <p className="text-2xl font-bold font-mono">{v}</p>
            <p className="text-xs text-slatey">{l}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white p-5 border border-sand">
          <h2 className="font-bold mb-4 font-display">Revenus — 8 semaines</h2>
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
          <h2 className="font-bold mb-4 font-display">CA par activité</h2>
          {ranked.length === 0 && <p className="text-sm text-slatey">Pas encore de données.</p>}
          <div className="flex flex-col gap-3">
            {ranked.map(([title, cents]) => {
              const pct = Math.round((cents / totalCents) * 100);
              return (
                <div key={title}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium truncate">{title}</span>
                    <span className="font-semibold font-mono text-xs">{formatPrice(cents)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-mist overflow-hidden">
                    <div className="h-full rounded-full bg-raspberry" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
