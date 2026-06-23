import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 bg-mist border-b border-sand">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold tracking-tight font-display">
          Loisiréo
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slatey">
          <Link href="/recherche" className="hover:opacity-70">Découvrir</Link>
          <Link href="/pro" className="hover:opacity-70">Devenir partenaire</Link>
          <Link href="/aide" className="hover:opacity-70">Aide</Link>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/connexion" className="text-sm font-semibold px-4 py-2 rounded-full">
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="text-sm font-semibold px-4 py-2 rounded-full bg-raspberry text-white"
          >
            Inscription
          </Link>
        </div>
      </div>
    </header>
  );
}
