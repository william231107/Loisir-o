import { getProDashboard } from "@/lib/pro";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HOURS = [10, 12, 14, 16, 18, 20];

export default async function ProCalendarPage() {
  const { bookings } = await getProDashboard();

  // Indexe les réservations par (jour de semaine, heure)
  const grid: Record<string, { name: string; people: number }[]> = {};
  for (const b of bookings) {
    if (!b.slot_start) continue;
    const d = new Date(b.slot_start);
    const dayIdx = (d.getDay() + 6) % 7; // lundi = 0
    const hour = d.getHours();
    const key = `${dayIdx}-${hour}`;
    (grid[key] ??= []).push({ name: b.client_name, people: b.participants_count });
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold font-display mb-1">Mon calendrier</h1>
      <p className="text-sm text-slatey mb-6">Vue d'ensemble de vos créneaux réservés cette semaine.</p>

      <div className="rounded-2xl bg-white border border-sand p-4 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* En-tête jours */}
          <div className="grid grid-cols-8 gap-1 mb-1">
            <div />
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slatey py-1">{d}</div>
            ))}
          </div>

          {/* Lignes horaires */}
          {HOURS.map((h) => (
            <div key={h} className="grid grid-cols-8 gap-1 mb-1">
              <div className="text-xs text-slatey font-mono flex items-center justify-end pr-2">{h}h</div>
              {DAYS.map((_, dayIdx) => {
                const cell = grid[`${dayIdx}-${h}`];
                return (
                  <div
                    key={dayIdx}
                    className="rounded-lg min-h-[44px] p-1 flex flex-col gap-1"
                    style={{ backgroundColor: cell ? "#16213D" : "#EEF1EC" }}
                  >
                    {cell?.map((c, i) => (
                      <div key={i} className="text-[10px] font-semibold leading-tight text-white truncate" title={`${c.name} (${c.people})`}>
                        {c.name.split(" ")[0]} · {c.people}p
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slatey">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-ink inline-block" /> Créneau réservé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-mist border border-sand inline-block" /> Libre
        </span>
      </div>
    </div>
  );
}
