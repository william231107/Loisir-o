"use client";

import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import type { Activity } from "@/lib/types";

const containerStyle = { width: "100%", height: "100%" };

export function ActivityMap({ activity }: { activity: Activity }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey ?? "" });

  const lat = activity.professional?.latitude;
  const lng = activity.professional?.longitude;

  if (!apiKey || lat == null || lng == null) {
    return (
      <div className="w-full h-full bg-sand/40 flex flex-col items-center justify-center text-center">
        <MapPin size={24} className="text-raspberry mb-1" />
        <span className="text-xs text-slatey px-4">
          {apiKey ? "Position non renseignée" : "Ajoutez votre clé Google Maps pour la carte"}
        </span>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="w-full h-full bg-white flex items-center justify-center text-sm text-slatey">Chargement…</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat, lng }}
      zoom={15}
      options={{ disableDefaultUI: true, zoomControl: true, clickableIcons: false }}
    >
      <MarkerF position={{ lat, lng }} />
    </GoogleMap>
  );
}
