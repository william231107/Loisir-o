import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getMyBookings } from "@/lib/bookings";
import { formatPrice } from "@/lib/format";

export default async function CompteDashboard() {
  const bookings = await getMyBookings();
  const upcoming = bookings.filter((b) => b.status === "confirmed");
  const next = upcoming[0];

  return (
    <div>
      <h1 className="text-2xl font-extrabold font-display">Bonjour 👋</h1>
      <p className="text-sm text-slatey">
        Vous avez {upcoming.length} activité{upcoming.length > 1 ? "s" : ""} à venir.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-4">
        {[
          ["Réservations", String(bookings.length)],
          ["À venir", String(upcoming.length)],
          ["Points fidélité", "120"],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-white p-4 border border-sand">
            <p className="text-2xl font-bold font-mono">{v}</p>
            <p className="text-xs text-slatey">{l}</p>
          </div>
        ))}
      </div>

      {next && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 font-display">Votre prochaine activité</h2>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-sand">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: next.gradient }}>
              <span style={{ fontSize: 26 }}>{next.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate font-display">{next.activity_title}</p>
              <p className="text-xs text-slatey">
                {next.slot_start ? new Date(next.slot_start).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : ""}
                {" · "}{next.participants_count} pers. · {formatPrice(next.total_price_cents)}
              </p>
            </div>
            <Link href="/compte/reservations" className="text-sm font-semibold flex items-center gap-1 text-raspberry">
              Détails <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
