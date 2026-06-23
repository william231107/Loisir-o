"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Ticket, CalendarDays, Users, BarChart3,
  MessageSquare, Settings, Plus, Award,
} from "lucide-react";

const NAV = [
  { href: "/pro", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/pro/activites", label: "Mes activités", icon: Ticket },
  { href: "/pro/calendrier", label: "Mon calendrier", icon: CalendarDays },
  { href: "/pro/reservations", label: "Réservations", icon: Users },
  { href: "/pro/statistiques", label: "Statistiques", icon: BarChart3 },
  { href: "/pro/messagerie", label: "Messagerie", icon: MessageSquare },
  { href: "/pro/parametres", label: "Paramètres", icon: Settings },
];

export function ProSidebar({ companyName }: { companyName: string }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 flex items-center justify-between">
        <Link href="/" className="text-lg font-extrabold font-display text-white">Loisiréo</Link>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-raspberry text-white">PRO</span>
      </div>

      <div className="mx-3 mb-4 p-3 rounded-xl flex items-center gap-2 bg-white/10">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#6B2D5C,#16213D)" }}>🗝️</div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{companyName}</p>
          <p className="text-[11px] flex items-center gap-1 text-sand"><Award size={11} /> Partenaire Fondateur</p>
        </div>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.65)",
              }}
            >
              <Icon size={17} /> {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Link
          href="/pro/activites/nouvelle"
          className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 bg-raspberry text-white"
        >
          <Plus size={16} /> Nouvelle activité
        </Link>
      </div>
    </div>
  );
}
