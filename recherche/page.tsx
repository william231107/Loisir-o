import Link from "next/link";
import { Search, MapPin, Clock, Star, ArrowRight } from "lucide-react";
import { getActivities, formatPrice } from "@/lib/data";
import { SearchMap } from "@/components/SearchMap";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string }>;
}) {
  const params = await searchParams;
  const activities = await getActivities({ q: params.q, city: params.city });

  return (
    <div>
      <header className="sticky top-0 z-20 bg-mist border-b border-sand">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link href="/" className="text-lg font-extrabold hidden sm:block flex-shrink-0 font-display">
            Loisiréo
          </Link>
          <form action="/recherche" className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-sand">
            <Search size={16} className="text-raspberry" />
            <input name="q" defaultValue={params.q} placeholder="Quelle activité ?" className="w-full outline-none text-sm bg-transparent" />
            <span className="hidden sm:flex items-center gap-1 pl-2 border-l border-sand text-slatey">
              <MapPin size={14} />
              <input name="city" defaultValue={params.city} placeholder="Ville" className="w-24 outline-none text-sm bg-transparent" />
            </span>
            <button className="px-4 py-1.5 rounded-full text-sm font-semibold bg-ink text-white flex-shrink-0">
              Rechercher
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-6 flex gap-6">
        {/* Liste */}
        <main className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold font-display">
            {activities.length} activité{activities.length > 1 ? "s" : ""} trouvée{activities.length > 1 ? "s" : ""}
          </h1>
          <p className="text-sm text-slatey mb-4">
            {params.q ? `« ${params.q} »` : "Toutes les activités"}
            {params.city ? ` à ${params.city}` : ""}
          </p>

          <div className="flex flex-col gap-4">
            {activities.map((a) => (
              <div key={a.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white border border-sand">
                <div className="w-full sm:w-40 h-32 sm:h-auto rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: a.gradient }}>
                  <span style={{ fontSize: 36 }}>{a.icon}</span>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-raspberry">
                      {a.professional?.company_name} · {a.professional?.city}
                    </p>
                    <h3 className="mt-1 font-bold text-base font-display">{a.title}</h3>
                    <div className="mt-1.5 flex items-center gap-3 text-sm text-slatey">
                      <span className="flex items-center gap-1"><Clock size={13} /> {a.duration_minutes} min</span>
                      <span className="flex items-center gap-1"><Star size={13} fill="#F5B700" stroke="#F5B700" /> {a.average_rating} ({a.reviews_count})</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold font-mono">{formatPrice(a.price_cents)}</span>
                    <Link href={`/activite/${a.slug}`} className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 bg-ink text-white transition-transform hover:scale-105">
                      Voir les créneaux <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Carte (sticky, masquée sur mobile) */}
        <aside className="hidden lg:block w-[420px] flex-shrink-0">
          <div className="sticky top-20 h-[calc(100vh-6rem)]">
            <SearchMap activities={activities} />
          </div>
        </aside>
      </div>
    </div>
  );
}
