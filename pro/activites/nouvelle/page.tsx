import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createActivity } from "@/lib/pro-actions";

const CATEGORIES: [string, string][] = [
  ["padel", "Padel"], ["escape_game", "Escape game"], ["bowling", "Bowling"],
  ["karting", "Karting"], ["laser_game", "Laser game"], ["yoga", "Yoga"],
  ["danse", "Danse"], ["atelier_creatif", "Atelier créatif"], ["musee", "Musée"],
  ["accrobranche", "Accrobranche"], ["sport_nautique", "Sport nautique"],
  ["stage", "Stage"], ["evenement", "Événement"], ["autre", "Autre"],
];

export default async function NewActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-xl">
      <Link href="/pro/activites" className="flex items-center gap-1.5 text-sm font-semibold mb-4">
        <ArrowLeft size={15} /> Retour
      </Link>
      <h1 className="text-2xl font-extrabold font-display mb-1">Nouvelle activité</h1>
      <p className="text-sm text-slatey mb-6">Décrivez votre activité, elle sera publiée immédiatement.</p>

      {error && <p className="mb-4 text-sm text-raspberry bg-raspberry/10 rounded-lg px-3 py-2">{error}</p>}

      <form action={createActivity} className="flex flex-col gap-4 rounded-2xl bg-white border border-sand p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Titre</span>
          <input name="title" required placeholder="Ex : Le Manoir Hanté" className="px-3 py-2.5 rounded-lg text-sm outline-none border border-sand" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Catégorie</span>
          <select name="category" required className="px-3 py-2.5 rounded-lg text-sm outline-none border border-sand bg-white">
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Description</span>
          <textarea name="description" rows={3} placeholder="Décrivez l'expérience..." className="px-3 py-2.5 rounded-lg text-sm outline-none border border-sand resize-none" />
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Prix (€)</span>
            <input name="price" type="number" min={0} step="0.5" required placeholder="32" className="px-3 py-2.5 rounded-lg text-sm outline-none border border-sand" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Durée (min)</span>
            <input name="duration" type="number" min={5} defaultValue={60} className="px-3 py-2.5 rounded-lg text-sm outline-none border border-sand" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Max pers.</span>
            <input name="max_participants" type="number" min={1} defaultValue={6} className="px-3 py-2.5 rounded-lg text-sm outline-none border border-sand" />
          </label>
        </div>

        <button className="mt-2 py-3 rounded-full font-semibold text-sm bg-raspberry text-white">
          Publier l'activité
        </button>
      </form>
    </div>
  );
}
