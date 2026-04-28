"use client";

import { useEffect, useState } from "react";

export default function SimpleMap() {
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

  return <LeafletMap />;
}

function LeafletMap() {
  const { MapContainer, Marker, Popup, TileLayer, useMap } = require("react-leaflet");
  const L = require("leaflet");

  const bathroomIcon = L.icon({
    iconUrl: "/marker-icon.png",
    iconRetinaUrl: "/marker-icon-2x.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const bathrooms = [
    {
      id: "1",
      name: "Odivelas Metro Station Toilet",
      address: "Estação de Metro de Odivelas",
      position: [38.7938, -9.1835] as [number, number],
      status: "open",
    },
    {
      id: "2",
      name: "Strada Shopping Restroom",
      address: "Strada Outlet, Odivelas",
      position: [38.7912, -9.1764] as [number, number],
      status: "open",
    },
    {
      id: "3",
      name: "Jardim Público Facility",
      address: "Parque urbano, Odivelas",
      position: [38.7954, -9.1798] as [number, number],
      status: "uncertain",
    },
  ];

  const { MapContainer: MC, Marker: Mk, Popup: Pu, TileLayer: TL } = {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
  };

  function ResizeMap() {
    const map = useMap();
    map.invalidateSize();
    return null;
  }

  return (
    <div className="card-surface min-h-[420px] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Map view</h2>
        <span className="text-xs text-zinc-500">Markers are demo data</span>
      </div>

      <MC
        center={[38.7938, -9.1835]}
        zoom={14}
        scrollWheelZoom={true}
        className="h-[340px] w-full rounded-[20px] overflow-hidden"
      >
        <ResizeMap />

        <TL
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors, tiles style by HOT, hosted by <a href="https://www.openstreetmap.fr">OSM France</a>'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />

        {bathrooms.map((bathroom) => (
          <Mk key={bathroom.id} position={bathroom.position} icon={bathroomIcon}>
            <Pu>
              <div className="space-y-1 text-sm">
                <strong>{bathroom.name}</strong>
                <p>{bathroom.address}</p>
                <p>Status: {bathroom.status}</p>
              </div>
            </Pu>
          </Mk>
        ))}
      </MC>
    </div>
  );
}