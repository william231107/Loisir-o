import Link from "next/link";
import { Compass } from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function CompteLayout({ children }: { children: React.ReactNode }) {
  let displayName = "Camille"; // valeur de démo
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();
      displayName = profile?.first_name ?? user.email?.split("@")[0] ?? "vous";
    }
  }

  return (
    <div>
      <header className="sticky top-0 z-20 bg-mist border-b border-sand">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold font-display">Loisiréo</Link>
          <div className="flex items-center gap-3">
            <Link href="/recherche" className="text-sm font-semibold flex items-center gap-1.5 text-slatey">
              <Compass size={15} /> Explorer
            </Link>
            <form action={signOut}>
              <button className="text-sm font-semibold text-slatey">Déconnexion</button>
            </form>
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-ink text-white">
              {displayName.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <nav className="border-b border-sand bg-mist">
        <div className="max-w-5xl mx-auto px-5 flex gap-1 text-sm font-semibold">
          {[
            ["/compte", "Tableau de bord"],
            ["/compte/reservations", "Mes réservations"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="px-4 py-3 text-slatey hover:text-ink">
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
