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

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [activeFilters, setActiveFilters] = useState<FilterLabel[]>([]);

  const toggleFilter = (filter: FilterLabel) => {
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    );
  };

  const filteredBathrooms = useMemo(() => {
    return bathrooms.filter((bathroom) => {
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

      return true;
    });
  }, [activeFilters]);

  return (
    <main className="container-shell space-y-6">
      <header className="flex flex-col gap-4 rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
        <Logo />

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Find a bathroom fast
          </h1>
          <p className="max-w-xl text-sm text-zinc-600">
            Loomap helps people find trustworthy public bathrooms nearby, with
            accessibility and community trust signals built in.
          </p>
        </div>

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

          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilters([])}
              className="rounded-full border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </header>

      {viewMode === "map" ? (
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SimpleMap />

          <div className="space-y-4">
            {filteredBathrooms.length > 0 ? (
              filteredBathrooms.map((bathroom: Bathroom) => (
                <article key={bathroom.id} className="card-surface p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold">
                          {bathroom.name}
                        </h3>
                        <p className="text-sm text-zinc-600">
                          {bathroom.place_description}
                        </p>
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
                No bathrooms match your current filters.
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {filteredBathrooms.length > 0 ? (
            filteredBathrooms.map((bathroom: Bathroom) => (
              <article key={bathroom.id} className="card-surface p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold">
                        {bathroom.name}
                      </h3>
                      <p className="text-sm text-zinc-600">
                        {bathroom.place_description}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {bathroom.address}
                      </p>
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
                </div>
              </article>
            ))
          ) : (
            <div className="card-surface p-6 text-sm text-zinc-600">
              No bathrooms match your current filters.
            </div>
          )}
        </section>
      )}
    </main>
  );
}