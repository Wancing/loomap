"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { TrustBadge } from "@/components/trust-badge";
import type { Bathroom } from "@/lib/types";

export default function BathroomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [bathroom, setBathroom] = useState<Bathroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBathroom = async () => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/bathrooms");

        if (!response.ok) {
          console.error("Failed to fetch bathrooms");
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        const found = data.bathrooms.find(
          (b: Bathroom) => b.id === params.id
        );

        setBathroom(found || null);
      } catch (error) {
        console.error("Error fetching bathroom:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBathroom();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="container-shell space-y-6">
        <header className="flex items-center justify-between rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
          <Logo />
        </header>

        <div className="card-surface p-6">
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-zinc-100"></div>
            <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100"></div>
            <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!bathroom) {
    return (
      <main className="container-shell space-y-6">
        <header className="flex items-center justify-between rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
          <Logo />
        </header>

        <div className="card-surface p-6 text-center">
          <p className="mb-4 text-zinc-600">Bathroom not found</p>
          <button
            onClick={() => router.push("/")}
            className="rounded-full bg-teal-700 px-6 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
          >
            Back to map
          </button>
        </div>
      </main>
    );
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${bathroom.latitude},${bathroom.longitude}`;

  return (
    <main className="container-shell space-y-6">
      <header className="flex items-center justify-between rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
        <Logo />

        <button
          onClick={() => router.push("/")}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          ← Back to map
        </button>
      </header>

      <div className="card-surface overflow-hidden">
        {/* Placeholder for photo - we'll add this later */}
        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 text-sm text-teal-700">
          Photo coming soon
        </div>

        <div className="space-y-6 p-6">
          {/* Title and status */}
          <div>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-semibold">{bathroom.name}</h1>

              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  bathroom.free_or_paid === "free"
                    ? "bg-teal-100 text-teal-800"
                    : bathroom.free_or_paid === "paid"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-zinc-100 text-zinc-700"
                }`}
              >
                {bathroom.free_or_paid === "free"
                  ? "Free"
                  : bathroom.free_or_paid === "paid"
                  ? bathroom.price_if_known || "Paid"
                  : "Unknown"}
              </span>
            </div>

            {bathroom.place_description && (
              <p className="text-zinc-600">{bathroom.place_description}</p>
            )}

            {bathroom.address && (
              <p className="mt-1 text-sm text-zinc-500">{bathroom.address}</p>
            )}
          </div>

          {/* Trust badge */}
          <TrustBadge
            trustScore={bathroom.trust_score}
            confirmations={bathroom.number_of_confirmations}
          />

          {/* Ratings */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-zinc-50 p-4 text-center">
              <p className="mb-1 text-2xl font-bold text-teal-700">
                {bathroom.cleanliness_avg}
              </p>
              <p className="text-xs text-zinc-600">Cleanliness</p>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4 text-center">
              <p className="mb-1 text-2xl font-bold text-teal-700">
                {bathroom.safety_avg}
              </p>
              <p className="text-xs text-zinc-600">Safety</p>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4 text-center">
              <p className="mb-1 text-2xl font-bold text-teal-700">
                {bathroom.accessibility_avg}
              </p>
              <p className="text-xs text-zinc-600">Accessibility</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h2 className="font-semibold text-zinc-900">Details</h2>

            <div className="grid gap-3 text-sm">
              {bathroom.opening_hours && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Opening hours</span>
                  <span className="font-medium text-zinc-900">
                    {bathroom.opening_hours}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-zinc-600">Status</span>
                <span
                  className={`font-medium ${
                    bathroom.status === "open"
                      ? "text-green-700"
                      : bathroom.status === "closed"
                      ? "text-red-700"
                      : "text-zinc-600"
                  }`}
                >
                  {bathroom.status.charAt(0).toUpperCase() +
                    bathroom.status.slice(1)}
                </span>
              </div>

              {bathroom.requires_code && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Access</span>
                  <span className="font-medium text-zinc-900">
                    {bathroom.code_hint || "Code required"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Accessibility features */}
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h2 className="font-semibold text-zinc-900">
              Accessibility Features
            </h2>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div
                className={`flex items-center gap-2 ${
                  bathroom.wheelchair_accessible
                    ? "text-teal-700"
                    : "text-zinc-400"
                }`}
              >
                <span>{bathroom.wheelchair_accessible ? "✓" : "✗"}</span>
                <span>Wheelchair accessible</span>
              </div>

              <div
                className={`flex items-center gap-2 ${
                  bathroom.step_free_access
                    ? "text-teal-700"
                    : "text-zinc-400"
                }`}
              >
                <span>{bathroom.step_free_access ? "✓" : "✗"}</span>
                <span>Step-free access</span>
              </div>

              <div
                className={`flex items-center gap-2 ${
                  bathroom.baby_changing ? "text-teal-700" : "text-zinc-400"
                }`}
              >
                <span>{bathroom.baby_changing ? "✓" : "✗"}</span>
                <span>Baby changing</span>
              </div>

              <div
                className={`flex items-center gap-2 ${
                  bathroom.gender_neutral ? "text-teal-700" : "text-zinc-400"
                }`}
              >
                <span>{bathroom.gender_neutral ? "✓" : "✗"}</span>
                <span>Gender-neutral</span>
              </div>

              <div
                className={`flex items-center gap-2 ${
                  bathroom.family_friendly ? "text-teal-700" : "text-zinc-400"
                }`}
              >
                <span>{bathroom.family_friendly ? "✓" : "✗"}</span>
                <span>Family-friendly</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid gap-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-teal-700 px-6 py-3 text-center font-medium text-white transition hover:bg-teal-800"
            >
              Get directions
            </a>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Report issue
              </button>

              <button
                type="button"
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Edit info
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}