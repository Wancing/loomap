"use client";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  CircleMarker,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import Link from "next/link";
import type { Bathroom } from "@/lib/types";
import { getMarkerIcon, getStatusLabel } from "@/components/bathroom-marker";
import { getVerificationStatus } from "@/lib/bathroom-status";

type Props = {
  bathrooms: Bathroom[];
  selectedBathroomId?: string | null;
  userLocation?: [number, number] | null;
  onBathroomSelect?: (bathroom: Bathroom) => void;
};

function MapViewport({
  bathrooms,
  userLocation,
}: {
  bathrooms: Bathroom[];
  userLocation?: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 14);
      return;
    }

    if (bathrooms.length === 0) return;

    const bounds = bathrooms.map((bathroom) => [
      bathroom.latitude,
      bathroom.longitude,
    ]) as [number, number][];

    map.fitBounds(bounds, { padding: [32, 32] });
  }, [bathrooms, map, userLocation]);

  return null;
}

export default function SimpleMapInner({
  bathrooms,
  selectedBathroomId,
  userLocation,
  onBathroomSelect,
}: Props) {
  const center: [number, number] = userLocation ?? [38.7223, -9.1393];

  return (
    <div className="overflow-hidden rounded-[28px] border border-zinc-200">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="h-[460px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/" target="_blank" rel="noopener noreferrer">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapViewport bathrooms={bathrooms} userLocation={userLocation} />

        {userLocation ? (
          <CircleMarker
            center={userLocation}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              weight: 3,
              fillColor: "#0f9f78",
              fillOpacity: 1,
            }}
          />
        ) : null}

        {bathrooms.map((bathroom) => {
          const verificationStatus = getVerificationStatus(bathroom);

          return (
            <Marker
              key={bathroom.id}
              position={[bathroom.latitude, bathroom.longitude]}
              icon={getMarkerIcon(verificationStatus) ?? undefined}
              eventHandlers={{
                click: () => {
                  onBathroomSelect?.(bathroom);
                },
              }}
            >
              <Popup>
                <div className="min-w-[250px] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">
                        {bathroom.name}
                      </h3>
                      {bathroom.address ? (
                        <p className="text-xs text-zinc-500">{bathroom.address}</p>
                      ) : null}
                    </div>

                    {selectedBathroomId === bathroom.id ? (
                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-600">
                        Selected
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700">
                      {getStatusLabel(verificationStatus)}
                    </span>

                    {bathroom.wheelchair_accessible ? (
                      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700">
                        Wheelchair
                      </span>
                    ) : null}

                    {bathroom.baby_changing ? (
                      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700">
                        Baby changing
                      </span>
                    ) : null}

                    {bathroom.gender_neutral ? (
                      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700">
                        Gender-neutral
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-zinc-500">
                      {bathroom.number_of_confirmations ?? 0} confirmations
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      href={`/bathroom/${bathroom.id}`}
                      className="rounded-full bg-teal-700 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-teal-800"
                    >
                      Details
                    </Link>

                    <Link
                      href={`/bathroom/${bathroom.id}/edit`}
                      className="rounded-full border border-zinc-300 bg-white px-3 py-2 text-center text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                    >
                      Edit
                    </Link>

                    <Link
                      href={`/bathroom/${bathroom.id}/report`}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-center text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                    >
                      Report
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}