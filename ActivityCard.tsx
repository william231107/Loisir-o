import Link from "next/link";
import { Clock, Star, ArrowRight } from "lucide-react";
import type { Activity } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function ActivityCard({ a }: { a: Activity }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-sand w-72 flex-shrink-0">
      <div
        className="h-36 flex items-center justify-center relative"
        style={{ background: a.gradient }}
      >
        <span style={{ fontSize: 44 }}>{a.icon}</span>
      </div>

      <div className="ticket-perf">
        <div className="absolute left-3 right-3 top-0 border-t-2 border-dashed border-sand" />
      </div>

      <div className="p-4 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-raspberry">
          {a.professional?.company_name} · {a.professional?.city}
        </p>
        <h3 className="mt-1 font-bold text-base leading-snug font-display">{a.title}</h3>

        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-slatey">
            <Clock size={14} /> {a.duration_minutes} min
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold">
            <Star size={14} fill="#F5B700" stroke="#F5B700" /> {a.average_rating}
            <span className="text-slatey font-normal">({a.reviews_count})</span>
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold font-mono">{formatPrice(a.price_cents)}</span>
          <Link
            href={`/activite/${a.slug}`}
            className="px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 bg-ink text-white transition-transform hover:scale-105"
          >
            Réserver <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
