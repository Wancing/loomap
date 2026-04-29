"use client";

import { useMemo, useState } from "react";
import { bathrooms } from "@/lib/mock-data";
import { Logo } from "@/components/logo";
import { TrustBadge } from "@/components/trust-badge";
import SimpleMap from "@/components/map/simple-map";
import { Bathroom } from "@/lib/types";

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
  if (distanceKm === null) {
    return "Distance unavailable";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }

  return `${distanceKm.toFixed(1)} km away`;
}

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [activeFilters, setActiveFilters] = useState<FilterLabel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

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

    const results = bathrooms
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

        if (a.distanceKm === null) {
          return 1;
        }

        if (b.distanceKm === null) {
          return -1;
        }

        return a.distanceKm - b.distanceKm;
      });

    return results;
  }, [activeFilters, searchQuery, userLocation]);

  return (
    <main className="container-shell space-y-6">
      <header className="flex flex-col gap-4 rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Logo />

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="rounded-full border border-teal-700 bg-white px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLocating ? "Finding your location..." : "Use my location"}
          </button>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Find a bathroom fast
          </h1>
          <p className="max-w-xl text-sm text-zinc-600">
            Loomap helps people find trustworthy public bathrooms nearby, with
            accessibility and community trust signals built in.
          </p>

          {userLocation && (
            <p className="text-sm text-teal-700">
              Using your current location to sort nearby bathrooms.
            </p>
          )}

          {locationError && (
            <p className="text-sm text-rose-600">{locationError}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === "map"
                  ? "bg-teal-700 text-white"
                  : "border border-zinc-300 bg-white text-zinc-700"
              }`}
            >
              Map view
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === "list"
                  ? "bg-teal-700 text-white"
                  : "border border-zinc-300 bg-white text-zinc-700"
              }`}
            >
              List view
            </button>
          </div>

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
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {FILTERS.map((item) => {
            const isActive = activeFilters.includes(item);

            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border border-teal-700 bg-teal-700 text-white"
                    : "border border-zinc-300 bg-white text-zinc-700"
                }`}
              >
                {item}
              </button>
            );
          })}

          {(activeFilters.length > 0 || searchQuery.trim().length > 0) && (
            <button
              type="button"
              onClick={() => {
                setActiveFilters([]);
                setSearchQuery("");
              }}
              className="rounded-full border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700"
            >
              Clear all
            </button>
          )}
        </div>
      </header>

      {viewMode === "map" ? (
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SimpleMap bathrooms={filteredBathrooms} userLocation={userLocation} />

          <div className="space-y-4">
            {filteredBathrooms.length > 0 ? (
              filteredBathrooms.map((bathroom) => (
                <article key={bathroom.id} className="card-surface p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold">
                            {bathroom.name}
                          </h3>
                          <span className="text-xs text-zinc-500">
                            {formatDistance(bathroom.distanceKm)}
                          </span>
                        </div>

                        <p className="text-sm text-zinc-600">
                          {bathroom.place_description}
                        </p>

                        {bathroom.address && (
                          <p className="mt-1 text-xs text-zinc-500">
                            {bathroom.address}
                          </p>
                        )}
                      </div>

                      <span className="rounded-full bg-teal-700 px-2.5 py-1 text-xs font-semibold text-white">
                        {bathroom.free_or_paid}
                      </span>
                    </div>

                    <TrustBadge
                      trustScore={bathroom.trust_score}
                      confirmations={bathroom.number_of_confirmations}
                    />

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="rounded-2xl bg-zinc-50 p-3">
                        <p className="text-xs text-zinc-500">Cleanliness</p>
                        <p className="font-semibold">
                          {bathroom.cleanliness_avg}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-zinc-50 p-3">
                        <p className="text-xs text-zinc-500">Safety</p>
                        <p className="font-semibold">{bathroom.safety_avg}</p>
                      </div>

                      <div className="rounded-2xl bg-zinc-50 p-3">
                        <p className="text-xs text-zinc-500">Access</p>
                        <p className="font-semibold">
                          {bathroom.accessibility_avg}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="card-surface p-6 text-sm text-zinc-600">
                No bathrooms match your current search or filters.
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {filteredBathrooms.length > 0 ? (
            filteredBathrooms.map((bathroom) => (
              <article key={bathroom.id} className="card-surface p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold">
                          {bathroom.name}
                        </h3>
                        <span className="text-xs text-zinc-500">
                          {formatDistance(bathroom.distanceKm)}
                        </span>
                      </div>

                      <p className="text-sm text-zinc-600">
                        {bathroom.place_description}
                      </p>

                      {bathroom.address && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {bathroom.address}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-teal-700 px-2.5 py-1 text-xs font-semibold text-white">
                      {bathroom.free_or_paid}
                    </span>
                  </div>

                  <TrustBadge
                    trustScore={bathroom.trust_score}
                    confirmations={bathroom.number_of_confirmations}
                  />

                  <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
                    {bathroom.wheelchair_accessible && (
                      <span className="rounded-full bg-zinc-100 px-3 py-1">
                        Wheelchair
                      </span>
                    )}
                    {bathroom.baby_changing && (
                      <span className="rounded-full bg-zinc-100 px-3 py-1">
                        Baby changing
                      </span>
                    )}
                    {bathroom.gender_neutral && (
                      <span className="rounded-full bg-zinc-100 px-3 py-1">
                        Gender-neutral
                      </span>
                    )}
                    {bathroom.family_friendly && (
                      <span className="rounded-full bg-zinc-100 px-3 py-1">
                        Family-friendly
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-2xl bg-zinc-50 p-3">
                      <p className="text-xs text-zinc-500">Cleanliness</p>
                      <p className="font-semibold">{bathroom.cleanliness_avg}</p>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 p-3">
                      <p className="text-xs text-zinc-500">Safety</p>
                      <p className="font-semibold">{bathroom.safety_avg}</p>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 p-3">
                      <p className="text-xs text-zinc-500">Access</p>
                      <p className="font-semibold">
                        {bathroom.accessibility_avg}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="card-surface p-6 text-sm text-zinc-600">
              No bathrooms match your current search or filters.
            </div>
          )}
        </section>
      )}
    </main>
  );
}