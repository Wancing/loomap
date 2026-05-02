"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Bathroom } from "@/lib/types";

const LeafletMap = dynamic(() => import("./simple-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[460px] items-center justify-center rounded-[28px] border border-zinc-200 bg-zinc-50">
      <p className="text-sm text-zinc-500">Loading map...</p>
    </div>
  ),
});

type SimpleMapProps = {
  bathrooms: Bathroom[];
  selectedBathroomId?: string | null;
  userLocation?: [number, number] | null;
  onBathroomSelect?: (bathroom: Bathroom) => void;
};

export default function SimpleMap(props: SimpleMapProps) {
  const safeBathrooms = useMemo(
    () =>
      Array.isArray(props.bathrooms)
        ? props.bathrooms.filter(
            (bathroom) =>
              bathroom &&
              Number.isFinite(bathroom.latitude) &&
              Number.isFinite(bathroom.longitude)
          )
        : [],
    [props.bathrooms]
  );

  return <LeafletMap {...props} bathrooms={safeBathrooms} />;
}