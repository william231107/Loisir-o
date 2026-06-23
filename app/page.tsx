import Link from "next/link";
import { Search, MapPin, Calendar, Users, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ActivityCard } from "@/components/ActivityCard";
import { getActivities, categoryStyle } from "@/lib/data";

const HOME_CATEGORIES = [
  "padel", "escape_game", "bowling", "karting", "laser_game", "yoga", "accrobranche", "musee",
] as const;

export default async function HomePage() {
  const activities = await getActivities();
  const trending = activities.slice(0, 3);

  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-10 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5 bg-sand">
          <Sparkles size={13} /> + 2 400 activités partout en France
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight max-w-3xl mx-auto font-display">
          Réservez votre prochain moment de loisir.
        </h1>
        <p className="mt-4 text-base md:text-lg max-w-xl mx-auto text-slatey">
          Padel, escape game, yoga, karting... comparez les disponibilités en temps réel et réservez en quelques secondes.
        </p>

        <form action="/recherche" className="mt-8 mx-auto max-w-3xl rounded-2xl p-2 flex flex-col md:flex-row gap-2 bg-white border border-sand">
          <label className="flex-1 flex items-center gap-2 px-4 py-3 md:border-r border-sand">
            <Search size={18} className="text-raspberry" />
            <input name="q" placeholder="Quelle activité ?" className="w-full outline-none text-sm bg-transparent" />
          </label>
          <label className="flex-1 flex items-center gap-2 px-4 py-3 md:border-r border-sand">
            <MapPin size={18} className="text-raspberry" />
            <input name="city" placeholder="Ville ou code postal" className="w-full outline-none text-sm bg-transparent" />
          </label>
          <label className="flex-1 flex items-center gap-2 px-4 py-3 md:border-r border-sand">
            <Calendar size={18} className="text-raspberry" />
            <input name="date" type="date" className="w-full outline-none text-sm bg-transparent text-slatey" />
          </label>
          <label className="flex-1 flex items-center gap-2 px-4 py-3">
            <Users size={18} className="text-raspberry" />
            <input name="people" type="number" min={1} placeholder="Participants" className="w-full outline-none text-sm bg-transparent" />
          </label>
          <button className="px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-ink text-white transition-transform hover:scale-[1.02]">
            Rechercher <ArrowRight size={16} />
          </button>
        </form>
      </section>

      {/* Catégories */}
      <section className="max-w-6xl mx-auto px-5 pb-14">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {HOME_CATEGORIES.map((c) => {
            const s = categoryStyle(c);
            return (
              <Link key={c} href={`/recherche?q=${c}`} className="flex-shrink-0 flex items-center gap-2 pl-3 pr-4 py-2 rounded-full text-sm font-semibold bg-white border border-sand">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: s.gradient }}>{s.icon}</span>
                {s.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Tendances */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-extrabold font-display">Tendances cette semaine</h2>
          <Link href="/recherche" className="text-sm font-semibold flex items-center gap-1 text-raspberry">
            Tout voir <ArrowRight size={14} />
          </Link>
        </div>
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-3">
          {trending.map((a) => <ActivityCard key={a.id} a={a} />)}
        </div>
      </section>

      {/* Bandeau confiance */}
      <section className="bg-ink py-12">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {[["2 400+", "activités référencées partout en France"], ["180", "villes couvertes, du local au national"], ["4.8/5", "note moyenne laissée par les utilisateurs"]].map(([n, l]) => (
            <div key={n}>
              <p className="text-3xl font-extrabold font-mono text-white">{n}</p>
              <p className="text-sm mt-1 text-sand">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA pro */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-sand">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-ink text-white">
              <ShieldCheck size={13} /> Programme Partenaire Fondateur
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold max-w-md leading-tight font-display">
              Vous gérez des activités ? Remplissez vos créneaux dès aujourd'hui.
            </h3>
            <p className="mt-2 text-sm max-w-md text-slatey">
              Inscription gratuite, commission réduite à vie, badge fondateur et mise en avant sur la plateforme.
            </p>
          </div>
          <Link href="/pro" className="px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 flex-shrink-0 bg-raspberry text-white transition-transform hover:scale-[1.02]">
            Devenir partenaire <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="bg-ink py-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-extrabold font-display text-white">Loisiréo</span>
          <p className="text-xs text-sand">© 2026 Loisiréo SAS — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
