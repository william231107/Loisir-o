import Link from "next/link";
import { UserPlus, Check } from "lucide-react";
import { signUp } from "@/lib/auth-actions";

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-ink">
        <div className="max-w-sm text-center lg:text-left">
          <Link href="/" className="text-2xl font-extrabold font-display text-white">Loisiréo</Link>
          <h2 className="mt-6 text-3xl font-extrabold leading-tight font-display text-white">
            Rejoignez la communauté.
          </h2>
          <p className="mt-3 text-sm text-sand">
            Créez votre compte gratuitement et réservez votre première activité en quelques secondes.
          </p>
        </div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-mist">
        <div className="w-full max-w-sm">
          <div className="flex rounded-full p-1 mb-6 bg-white border border-sand">
            <Link href="/connexion" className="flex-1 py-2 rounded-full text-sm font-semibold text-center text-slatey">Connexion</Link>
            <span className="flex-1 py-2 rounded-full text-sm font-semibold text-center bg-ink text-white">Inscription</span>
          </div>

          {error && (
            <p className="mb-4 text-sm text-raspberry bg-raspberry/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <form action={signUp} className="flex flex-col gap-3">
            <input name="full_name" required placeholder="Prénom et nom" className="px-4 py-3 rounded-xl text-sm outline-none bg-white border border-sand" />
            <input name="email" type="email" required placeholder="Email" className="px-4 py-3 rounded-xl text-sm outline-none bg-white border border-sand" />
            <input name="password" type="password" required minLength={6} placeholder="Mot de passe (6 caractères min.)" className="px-4 py-3 rounded-xl text-sm outline-none bg-white border border-sand" />
            <button className="mt-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-raspberry text-white">
              <UserPlus size={15} /> Créer mon compte
            </button>
          </form>

          <p className="text-center text-xs mt-6 text-slatey">
            Vous êtes un professionnel ?{" "}
            <Link href="/pro" className="font-semibold text-raspberry">Espace pro</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
