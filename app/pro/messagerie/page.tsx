import { MessageSquare, Send } from "lucide-react";

const CONVERSATIONS = [
  { name: "Camille Durand", last: "Bonjour, est-il possible de venir à 6 au lieu de 4 ?", time: "10:24", unread: true, initials: "CD" },
  { name: "Hugo Lefèvre", last: "Parfait, merci pour la confirmation !", time: "Hier", unread: false, initials: "HL" },
  { name: "Inès Bernard", last: "Y a-t-il un parking à proximité ?", time: "Lun", unread: false, initials: "IB" },
];

const THREAD = [
  { from: "client", text: "Bonjour, est-il possible de venir à 6 au lieu de 4 ?", time: "10:24" },
  { from: "pro", text: "Bonjour Camille ! Oui, la salle accueille jusqu'à 6 joueurs. Je mets à jour votre réservation.", time: "10:31" },
  { from: "client", text: "Super, merci beaucoup !", time: "10:32" },
];

export default function ProMessagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold font-display mb-1">Messagerie</h1>
      <p className="text-sm text-slatey mb-6">Échangez avec vos clients avant et après leur venue.</p>

      <div className="rounded-2xl bg-white border border-sand overflow-hidden grid md:grid-cols-[280px_1fr] h-[520px]">
        {/* Liste des conversations */}
        <div className="border-r border-sand overflow-y-auto">
          {CONVERSATIONS.map((c, i) => (
            <button
              key={c.name}
              className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-sand hover:bg-mist"
              style={{ backgroundColor: i === 0 ? "#EEF1EC" : "transparent" }}
            >
              <span className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-ink text-white">
                {c.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold truncate">{c.name}</span>
                  <span className="text-[11px] text-slatey">{c.time}</span>
                </div>
                <p className="text-xs text-slatey truncate">{c.last}</p>
              </div>
              {c.unread && <span className="w-2 h-2 rounded-full bg-raspberry flex-shrink-0" />}
            </button>
          ))}
        </div>

        {/* Fil de discussion */}
        <div className="flex flex-col">
          <div className="px-5 py-3 border-b border-sand flex items-center gap-2">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-ink text-white">CD</span>
            <span className="text-sm font-semibold">Camille Durand</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {THREAD.map((m, i) => (
              <div key={i} className={`flex ${m.from === "pro" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[75%] rounded-2xl px-4 py-2 text-sm"
                  style={{
                    backgroundColor: m.from === "pro" ? "#16213D" : "#EEF1EC",
                    color: m.from === "pro" ? "#fff" : "#16213D",
                  }}
                >
                  {m.text}
                  <span className="block text-[10px] mt-1 opacity-60">{m.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-sand flex items-center gap-2">
            <input placeholder="Votre message…" className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none bg-mist" />
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-raspberry text-white flex-shrink-0">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-slatey flex items-center gap-1.5">
        <MessageSquare size={12} /> Démonstration — la messagerie temps réel s'appuiera sur Supabase Realtime.
      </p>
    </div>
  );
}
