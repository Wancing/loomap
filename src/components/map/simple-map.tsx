"use client";

import { useEffect, useMemo, useState } from "react";
import type { Bathroom } from "@/lib/types";

type UserLocation = {
  latitude: number;
  longitude: number;
};

type SimpleMapProps = {
  bathrooms: Bathroom[];
  userLocation?: UserLocation | null;
};

export default function SimpleMap({
  bathrooms,
  userLocation = null,
}: SimpleMapProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="card-surface min-h-[420px] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Map view</h2>
          <span className="text-xs text-zinc-500">Loading map…</span>
        </div>

        <div className="flex h-[340px] items-center justify-center rounded-[20px] bg-zinc-50 text-center text-sm text-zinc-500">
          Preparing map…
        </div>
      </div>
    );
  }

  return <LeafletMap bathrooms={bathrooms} userLocation={userLocation} />;
}

function LeafletMap({ bathrooms, userLocation }: SimpleMapProps) {
  const { MapContainer, Marker, Popup, TileLayer, Circle, useMap } =
    require("react-leaflet");
  const L = require("leaflet");

  const defaultCenter: [number, number] = [38.7938, -9.1835];

  const bathroomIcon = useMemo(
    () =>
      L.icon({
        iconUrl: "/bathroom-icon.svg",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -24],
      }),
    [L]
  );

  const userIcon = useMemo(
    () =>
      L.divIcon({
        html: `
          <div style="
            width:18px;
            height:18px;
            border-radius:999px;
            background:#0f766e;
            border:3px solid white;
            box-shadow:0 0 0 6px rgba(15,118,110,0.18);
          "></div>
        `,
        className: "",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
    [L]
  );

  function FitMapToData() {
    const map = useMap();

    useEffect(() => {
      const points: [number, number][] = bathrooms.map((bathroom) => [
        bathroom.latitude,
        bathroom.longitude,
      ]);

      if (userLocation) {
        points.push([userLocation.latitude, userLocation.longitude]);
      }

      if (points.length === 0) {
        map.setView(defaultCenter, 14);
        return;
      }

      if (points.length === 1) {
        map.setView(points[0], 15);
        return;
      }

      const bounds = L.latLngBounds(points);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [32, 32] });
      }
    }, [map, bathrooms, userLocation]);

    return null;
  }

  return (
    <div className="card-surface min-h-[420px] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Map view</h2>
        <span className="text-xs text-zinc-500">
          {bathrooms.length} result{bathrooms.length === 1 ? "" : "s"}
        </span>
      </div>

      <MapContainer
        center={
          userLocation
            ? [userLocation.latitude, userLocation.longitude]
            : defaultCenter
        }
        zoom={14}
        scrollWheelZoom={true}
        className="h-[340px] w-full overflow-hidden rounded-[20px]"
      >
        <FitMapToData />

        <TileLayer
  attribution='&copy; OpenStreetMap contributors &copy; CARTO'
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  subdomains={["a", "b", "c", "d"]}
        />

        {bathrooms.map((bathroom) => (
          <Marker
            key={bathroom.id}
            position={[bathroom.latitude, bathroom.longitude]}
            icon={bathroomIcon}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <strong>{bathroom.name}</strong>
                {bathroom.place_description && <p>{bathroom.place_description}</p>}
                {bathroom.address && <p>{bathroom.address}</p>}
                <p>Status: {bathroom.status}</p>
                <p>Type: {bathroom.free_or_paid}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {userLocation && (
          <>
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userIcon}
            >
              <Popup>
                <div className="text-sm font-medium">You are here</div>
              </Popup>
            </Marker>

            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={120}
              pathOptions={{
                color: "#0f766e",
                fillColor: "#0f766e",
                fillOpacity: 0.08,
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}