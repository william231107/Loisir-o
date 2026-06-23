import Link from "next/link";
import { LogIn, Check } from "lucide-react";
import { signIn } from "@/lib/auth-actions";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-ink">
        <div className="max-w-sm text-center lg:text-left">
          <Link href="/" className="text-2xl font-extrabold font-display text-white">Loisiréo</Link>
          <h2 className="mt-6 text-3xl font-extrabold leading-tight font-display text-white">
            Tous vos loisirs, au même endroit.
          </h2>
          <p className="mt-3 text-sm text-sand">
            Réservez en quelques secondes, retrouvez vos billets et vos favoris.
          </p>
          <div className="mt-8 hidden lg:flex flex-col gap-3">
            {["Réservation en temps réel", "Annulation gratuite 24h avant", "Programme de fidélité"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-white">
                <Check size={16} className="text-raspberry" /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-mist">
        <div className="w-full max-w-sm">
          <div className="flex rounded-full p-1 mb-6 bg-white border border-sand">
            <span className="flex-1 py-2 rounded-full text-sm font-semibold text-center bg-ink text-white">Connexion</span>
            <Link href="/inscription" className="flex-1 py-2 rounded-full text-sm font-semibold text-center text-slatey">Inscription</Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-raspberry bg-raspberry/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <form action={signIn} className="flex flex-col gap-3">
            <input type="hidden" name="next" value={next ?? "/compte"} />
            <input name="email" type="email" required placeholder="Email" className="px-4 py-3 rounded-xl text-sm outline-none bg-white border border-sand" />
            <input name="password" type="password" required placeholder="Mot de passe" className="px-4 py-3 rounded-xl text-sm outline-none bg-white border border-sand" />
            <button className="mt-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-raspberry text-white">
              <LogIn size={15} /> Se connecter
            </button>
          </form>

          <p className="text-center text-xs mt-6 text-slatey">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-semibold text-raspberry">Inscrivez-vous</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
