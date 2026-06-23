"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Ticket, CalendarDays, Users, BarChart3, MessageSquare, Settings,
} from "lucide-react";

const NAV = [
  { href: "/pro", label: "Bord", icon: LayoutDashboard, exact: true },
  { href: "/pro/activites", label: "Activités", icon: Ticket },
  { href: "/pro/calendrier", label: "Agenda", icon: CalendarDays },
  { href: "/pro/reservations", label: "Résa", icon: Users },
  { href: "/pro/statistiques", label: "Stats", icon: BarChart3 },
  { href: "/pro/messagerie", label: "Messages", icon: MessageSquare },
  { href: "/pro/parametres", label: "Réglages", icon: Settings },
];

export function ProMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden border-b border-sand bg-mist overflow-x-auto no-scrollbar">
      <div className="flex gap-1 px-3 py-2 min-w-max">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
              style={{
                backgroundColor: active ? "#16213D" : "#fff",
                color: active ? "#fff" : "#5B6472",
                border: "1px solid #E4DFCB",
              }}
            >
              <Icon size={14} /> {n.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
