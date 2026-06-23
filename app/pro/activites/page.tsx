import Link from "next/link";
import { Plus, Star, Clock, Pencil } from "lucide-react";
import { getProDashboard } from "@/lib/pro";
import { formatPrice, categoryStyle } from "@/lib/format";

export default async function ProActivitiesPage() {
  const { activities } = await getProDashboard();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold font-display">Mes activités</h1>
          <p className="text-sm text-slatey">{activities.length} activité{activities.length > 1 ? "s" : ""} en ligne</p>
        </div>
        <Link href="/pro/activites/nouvelle" className="px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 bg-raspberry text-white">
          <Plus size={16} /> Ajouter
        </Link>
      </div>

      {activities.length === 0 && (
        <div className="rounded-2xl bg-white border border-sand p-8 text-center">
          <p className="text-sm text-slatey">Vous n'avez pas encore d'activité.</p>
          <Link href="/pro/activites/nouvelle" className="inline-block mt-3 px-5 py-2.5 rounded-full text-sm font-semibold bg-ink text-white">
            Créer ma première activité
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {activities.map((a) => {
          const s = categoryStyle(a.category);
          return (
            <div key={a.id} className="rounded-2xl bg-white border border-sand overflow-hidden">
              <div className="h-28 flex items-center justify-center" style={{ background: a.gradient }}>
                <span style={{ fontSize: 40 }}>{a.icon}</span>
              </div>
              <div className="p-4">
                <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold mb-1.5 bg-sand">{s.label}</span>
                <h3 className="font-bold font-display">{a.title}</h3>
                <div className="mt-2 flex items-center gap-3 text-sm text-slatey">
                  <span className="flex items-center gap-1"><Clock size={13} /> {a.duration_minutes} min</span>
                  <span className="flex items-center gap-1"><Star size={13} fill="#F5B700" stroke="#F5B700" /> {a.average_rating} ({a.reviews_count})</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold font-mono">{formatPrice(a.price_cents)}</span>
                  <button className="px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 bg-mist border border-sand">
                    <Pencil size={13} /> Modifier
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
