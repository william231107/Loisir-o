import { Award, Check } from "lucide-react";
import { getProDashboard } from "@/lib/pro";
import { updateProfessional } from "@/lib/pro-actions";

export default async function ProSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const { professional } = await getProDashboard();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold font-display mb-1">Paramètres</h1>
      <p className="text-sm text-slatey mb-6">Gérez les informations de votre établissement.</p>

      {professional?.is_founding_partner && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3 bg-sand">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-ink text-white flex-shrink-0">
            <Award size={18} />
          </span>
          <div>
            <p className="text-sm font-bold">Partenaire Fondateur</p>
            <p className="text-xs text-slatey">Commission réduite à vie et mise en avant sur la plateforme.</p>
          </div>
        </div>
      )}

      {saved && (
        <p className="mb-4 text-sm text-forest bg-forest/10 rounded-lg px-3 py-2 flex items-center gap-1.5">
          <Check size={14} /> Modifications enregistrées.
        </p>
      )}
      {error && <p className="mb-4 text-sm text-raspberry bg-raspberry/10 rounded-lg px-3 py-2">{error}</p>}

      <form action={updateProfessional} className="flex flex-col gap-4 rounded-2xl bg-white border border-sand p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Nom de l'établissement</span>
          <input name="company_name" defaultValue={professional?.company_name ?? ""} required className="px-3 py-2.5 rounded-lg text-sm outline-none border border-sand" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Description</span>
          <textarea name="description" rows={3} className="px-3 py-2.5 rounded-lg text-sm outline-none border border-sand resize-none" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Téléphone</span>
            <input name="phone" className="px-3 py-2.5 rounded-lg text-sm outline-none border border-sand" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Ville</span>
            <input name="city" defaultValue={professional?.city ?? ""} className="px-3 py-2.5 rounded-lg text-sm outline-none border border-sand" />
          </label>
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Adresse</span>
            <input name="address" className="px-3 py-2.5 rounded-lg text-sm outline-none border border-sand" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Code postal</span>
            <input name="postal_code" className="px-3 py-2.5 rounded-lg text-sm outline-none border border-sand" />
          </label>
        </div>

        <button className="mt-2 py-3 rounded-full font-semibold text-sm bg-raspberry text-white w-fit px-8">
          Enregistrer
        </button>
      </form>
    </div>
  );
}
