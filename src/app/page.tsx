"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { TrustBadge } from "@/components/trust-badge";
import SimpleMap from "@/components/map/simple-map";
import type { Bathroom } from "@/lib/types";

const FILTERS = [
  "Wheelchair",
  "Baby changing",
  "Gender-neutral",
  "Free",
  "Open now",
] as const;

type FilterLabel = (typeof FILTERS)[number];
type ViewMode = "map" | "list";

type UserLocation = {
  latitude: number;
  longitude: number;
};

type BathroomWithDistance = Bathroom & {
  distanceKm: number | null;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const startLat = toRadians(lat1);
  const endLat = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(startLat) *
      Math.cos(endLat) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function formatDistance(distanceKm: number | null) {
  if (distanceKm === null) return "Distance unavailable";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
}

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [activeFilters, setActiveFilters] = useState<FilterLabel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [bathrooms, setBathrooms] = useState<Bathroom[]>([]);
  const [isLoadingBathrooms, setIsLoadingBathrooms] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBathrooms = async () => {
      setIsLoadingBathrooms(true);

      try {
        const response = await fetch("/api/bathrooms");

        if (!response.ok) {
          throw new Error(`Failed to fetch bathrooms: ${response.status}`);
        }

        const data = await response.json();
        setBathrooms(data.bathrooms || []);
      } catch (error) {
        console.error("Error fetching bathrooms:", error);
        setBathrooms([]);
      } finally {
        setIsLoadingBathrooms(false);
      }
    };

    fetchBathrooms();
  }, []);

  const toggleFilter = (filter: FilterLabel) => {
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    );
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location permission was denied.");
        } else if (error.code === error.TIMEOUT) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError("Could not get your location.");
        }

        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const filteredBathrooms = useMemo<BathroomWithDistance[]>(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return bathrooms
      .filter((bathroom) => {
        if (
          activeFilters.includes("Wheelchair") &&
          !bathroom.wheelchair_accessible
        ) {
          return false;
        }

        if (
          activeFilters.includes("Baby changing") &&
          !bathroom.baby_changing
        ) {
          return false;
        }

        if (
          activeFilters.includes("Gender-neutral") &&
          !bathroom.gender_neutral
        ) {
          return false;
        }

        if (activeFilters.includes("Free") && bathroom.free_or_paid !== "free") {
          return false;
        }

        if (activeFilters.includes("Open now") && bathroom.status !== "open") {
          return false;
        }

        if (normalizedQuery.length > 0) {
          const searchableText = [
            bathroom.name,
            bathroom.address ?? "",
            bathroom.place_description ?? "",
            bathroom.free_or_paid,
            bathroom.status,
          ]
            .join(" ")
            .toLowerCase();

          if (!searchableText.includes(normalizedQuery)) {
            return false;
          }
        }

        return true;
      })
      .map((bathroom) => {
        const distanceKm = userLocation
          ? getDistanceKm(
              userLocation.latitude,
              userLocation.longitude,
              bathroom.latitude,
              bathroom.longitude
            )
          : null;

        return {
          ...bathroom,
          distanceKm,
        };
      })
      .sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) {
          return b.trust_score - a.trust_score;
        }

        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;

        return a.distanceKm - b.distanceKm;
      });
  }, [activeFilters, searchQuery, userLocation, bathrooms]);

  return (
    <main className="container-shell space-y-6">
      <header className="flex flex-col gap-4 rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Logo />

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="rounded-full border border-teal-700 bg-white px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLocating ? "Finding your location..." : "Use my location"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/add")}
              className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
            >
              Add bathroom
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <label htmlFor="bathroom-search" className="sr-only">
              Search bathrooms
            </label>
            <input
              id="bathroom-search"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, area, or note"
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-teal-700"
            />
          </div>

          <div className="flex rounded-full bg-zinc-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === "map"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600"
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === "list"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600"
              }`}
            >
              List
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilters.includes(filter);

            return (
              <button
                key={filter}
                type="button"
                onClick={() => toggleFilter(filter)}
                className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-teal-700 text-white"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {locationError ? (
          <p className="text-sm text-rose-600">{locationError}</p>
        ) : null}
      </header>

      <section className="flex items-center justify-between px-1">
        <div>
          <p className="text-sm font-medium text-zinc-900">
            {isLoadingBathrooms
              ? "Loading bathrooms..."
              : `${filteredBathrooms.length} bathrooms found`}
          </p>
          <p className="text-xs text-zinc-500">
            Fast nearby results with accessibility-first filters
          </p>
        </div>
      </section>

      {viewMode === "map" ? (
        <section className="space-y-4">
          <SimpleMap
            bathrooms={filteredBathrooms}
            userLocation={userLocation}
          />

          <div className="rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Map legend</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-700">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                Open
              </span>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">
                Closed
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                Uncertain
              </span>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                Pending review
              </span>
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {filteredBathrooms.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-zinc-300 bg-white p-6 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">
                No bathrooms match these filters
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Try clearing a filter or changing your search.
              </p>
            </div>
          ) : (
            filteredBathrooms.map((bathroom) => (
              <article
                key={bathroom.id}
                className="rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {bathroom.name}
                    </h2>

                    {bathroom.place_description ? (
                      <p className="text-sm text-zinc-700">
                        {bathroom.place_description}
                      </p>
                    ) : null}

                    {bathroom.address ? (
                      <p className="text-sm text-zinc-500">
                        {bathroom.address}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/bathroom/${bathroom.id}`)}
                    className="rounded-full border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    View
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-700">
                  <span className="rounded-full bg-zinc-100 px-3 py-1">
                    {formatDistance(bathroom.distanceKm)}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1">
                    {bathroom.free_or_paid}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1">
                    {bathroom.status}
                  </span>
                  {bathroom.wheelchair_accessible ? (
                    <span className="rounded-full bg-zinc-100 px-3 py-1">
                      Wheelchair
                    </span>
                  ) : null}
                  {bathroom.baby_changing ? (
                    <span className="rounded-full bg-zinc-100 px-3 py-1">
                      Baby changing
                    </span>
                  ) : null}
                  {bathroom.gender_neutral ? (
                    <span className="rounded-full bg-zinc-100 px-3 py-1">
                      Gender-neutral
                    </span>
                  ) : null}
                </div>

                <div className="mt-4">
                  <TrustBadge
                    trustScore={bathroom.trust_score}
                    confirmations={bathroom.number_of_confirmations}
                  />
                </div>
              </article>
            ))
          )}
        </section>
      )}
    </main>
  );
}