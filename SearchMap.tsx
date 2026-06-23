"use client";

import { useMemo, useState, useCallback } from "react";
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Activity } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const containerStyle = { width: "100%", height: "100%" };

// Style de carte épuré, accordé à la charte Loisiréo
const mapStyles: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5B6472" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#D8E2DC" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#EEF1EC" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
];

function center(activities: Activity[]) {
  const pts = activities.filter((a) => a.professional?.latitude && a.professional?.longitude);
  if (pts.length === 0) return { lat: 46.6, lng: 2.5 }; // centre France par défaut
  const lat = pts.reduce((s, a) => s + (a.professional!.latitude || 0), 0) / pts.length;
  const lng = pts.reduce((s, a) => s + (a.professional!.longitude || 0), 0) / pts.length;
  return { lat, lng };
}

export function SearchMap({ activities }: { activities: Activity[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? "",
    // évite un crash si la clé est absente : on n'appelle pas l'API sans clé
    preventGoogleFontsLoading: true,
  });

  const [active, setActive] = useState<Activity | null>(null);
  const mapCenter = useMemo(() => center(activities), [activities]);

  const onMarkerClick = useCallback((a: Activity) => setActive(a), []);

  // Sans clé API configurée → on affiche un repli propre plutôt qu'une carte cassée
  if (!apiKey) {
    return (
      <div className="w-full h-full rounded-2xl border border-sand bg-sand/40 flex flex-col items-center justify-center text-center p-6">
        <MapPin size={26} className="text-raspberry mb-2" />
        <p className="text-sm font-semibold">Carte Google Maps</p>
        <p className="text-xs text-slatey mt-1 max-w-[220px]">
          Ajoutez votre clé <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> dans
          <code className="font-mono"> .env.local</code> pour afficher la carte interactive.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-full rounded-2xl border border-sand flex items-center justify-center">
        <p className="text-sm text-slatey">Impossible de charger la carte.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full rounded-2xl border border-sand bg-white flex items-center justify-center">
        <p className="text-sm text-slatey">Chargement de la carte…</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-sand">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={activities.length > 1 ? 6 : 13}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
        }}
      >
        {activities.map((a) => {
          const lat = a.professional?.latitude;
          const lng = a.professional?.longitude;
          if (lat == null || lng == null) return null;
          return (
            <MarkerF
              key={a.id}
              position={{ lat, lng }}
              onClick={() => onMarkerClick(a)}
              label={{
                text: formatPrice(a.price_cents),
                className: "loisireo-marker",
                color: "#16213D",
                fontSize: "12px",
                fontWeight: "700",
              }}
            />
          );
        })}

        {active && active.professional?.latitude != null && (
          <InfoWindowF
            position={{ lat: active.professional.latitude, lng: active.professional.longitude! }}
            onCloseClick={() => setActive(null)}
          >
            <div style={{ minWidth: 180 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#FF4D6D", textTransform: "uppercase" }}>
                {active.professional.company_name}
              </p>
              <p style={{ fontWeight: 700, marginTop: 2 }}>{active.title}</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>
                {formatPrice(active.price_cents)} · ⭐ {active.average_rating}
              </p>
              <Link
                href={`/activite/${active.slug}`}
                style={{ display: "inline-block", marginTop: 8, fontSize: 13, fontWeight: 600, color: "#16213D", textDecoration: "underline" }}
              >
                Voir les créneaux →
              </Link>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}
