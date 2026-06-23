import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Clock, Users, Home, Accessibility, MapPin, ShieldCheck } from "lucide-react";
import { getActivityBySlug, categoryStyle } from "@/lib/data";
import { getSlots } from "@/lib/bookings";
import { ActivityMap } from "./ActivityMap";
import { BookingWidget } from "./BookingWidget";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = await getActivityBySlug(slug);
  if (!a) notFound();

  const slots = await getSlots(a.id);
  const s = categoryStyle(a.category);

  return (
    <div>
      <header className="sticky top-0 z-20 bg-mist border-b border-sand">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/recherche" className="flex items-center gap-1.5 text-sm font-semibold">
            <ArrowLeft size={16} /> Retour
          </Link>
          <Link href="/" className="text-lg font-extrabold font-display">Loisiréo</Link>
          <span className="w-12" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-6">
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-2 bg-sand">
          {s.icon} {s.label}
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display">{a.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slatey">
          <span className="flex items-center gap-1">
            <Star size={14} fill="#F5B700" stroke="#F5B700" />
            <span className="font-semibold text-ink">{a.average_rating}</span> ({a.reviews_count} avis)
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {a.professional?.company_name} — {a.professional?.city}
          </span>
        </div>

        {/* Galerie */}
        <div className="mt-5 grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-72 md:h-96">
          <div className="col-span-2 row-span-2 flex items-center justify-center" style={{ background: a.gradient }}>
            <span style={{ fontSize: 56 }}>{a.icon}</span>
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-center" style={{ background: a.gradient, opacity: 0.85 - i * 0.12 }}>
              <span style={{ fontSize: 26 }}>📸</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* Infos pratiques */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Clock size={18} />, label: `${a.duration_minutes} min` },
                { icon: <Users size={18} />, label: `${a.min_participants} à ${a.max_participants} pers.` },
                { icon: <Home size={18} />, label: a.is_indoor ? "En intérieur" : "En extérieur" },
                { icon: <Accessibility size={18} />, label: a.is_pmr_accessible ? "Accessible PMR" : "Non accessible PMR" },
              ].map((it, i) => (
                <div key={i} className="rounded-xl p-3 flex flex-col items-center gap-1.5 text-center bg-white border border-sand">
                  <span className="text-raspberry">{it.icon}</span>
                  <span className="text-xs font-medium">{it.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <section className="mt-7">
              <h2 className="text-lg font-bold mb-2 font-display">À propos de cette activité</h2>
              <p className="text-sm leading-relaxed text-slatey">{a.description}</p>
              <div className="mt-3 rounded-xl p-3 text-sm flex items-start gap-2 bg-sand">
                <ShieldCheck size={16} className="mt-0.5 flex-shrink-0" />
                Annulation gratuite jusqu'à 24h avant l'activité.
              </div>
            </section>

            {/* Carte localisation */}
            <section className="mt-7">
              <h2 className="text-lg font-bold mb-2 font-display">Localisation</h2>
              <div className="h-56 rounded-xl overflow-hidden border border-sand">
                <ActivityMap activity={a} />
              </div>
              <p className="text-sm text-slatey mt-2">
                {a.professional?.address}, {a.professional?.postal_code} {a.professional?.city}
              </p>
            </section>
          </div>

          {/* Widget réservation (client) */}
          <div className="lg:w-80 flex-shrink-0">
            <BookingWidget activity={a} slots={slots} />
          </div>
        </div>
      </div>
    </div>
  );
}
