import Link from "next/link";
import { Check, CalendarPlus, Download } from "lucide-react";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div className="max-w-md mx-auto px-5 py-16 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-forest flex items-center justify-center mb-4">
        <Check size={28} className="text-white" />
      </div>
      <h1 className="text-2xl font-extrabold font-display">Réservation confirmée !</h1>
      <p className="text-sm text-slatey mt-1">
        Un email de confirmation vous a été envoyé. Présentez votre billet à l'accueil le jour de l'activité.
      </p>

      {session_id && (
        <p className="text-xs text-slatey mt-3 font-mono break-all">
          Référence paiement : {session_id}
        </p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
        <button className="flex-1 py-3 rounded-full font-semibold text-sm flex items-center justify-center gap-2 bg-ink text-white">
          <CalendarPlus size={15} /> Ajouter au calendrier
        </button>
        <button className="flex-1 py-3 rounded-full font-semibold text-sm flex items-center justify-center gap-2 bg-white border border-sand">
          <Download size={15} /> Télécharger
        </button>
      </div>

      <Link href="/compte/reservations" className="mt-4 text-sm font-semibold text-raspberry">
        Voir mes réservations →
      </Link>
    </div>
  );
}
