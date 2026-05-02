"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { TrustBadge } from "@/components/trust-badge";
import { PhotoGallery } from "@/components/photo-gallery";
import { getStatusLabel, getStatusColor } from "@/components/bathroom-marker";
import type { Bathroom } from "@/lib/types";

export default function BathroomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [bathroom, setBathroom] = useState<Bathroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  useEffect(() => {
    const fetchBathroom = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/bathrooms/${params.id}`);
        if (!response.ok) {
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        setBathroom(data);
      } catch (error) {
        console.error("Error fetching bathroom:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchBathroom();
  }, [params.id]);

  const handleVerify = async () => {
    if (!bathroom) return;
    setIsVerifying(true);
    setVerificationMessage("");

    try {
      const response = await fetch(`/api/bathrooms/${bathroom.id}/verify`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to verify");

      const result = await response.json();
      setVerificationMessage(result.message);
      setBathroom({
        ...bathroom,
        number_of_confirmations: result.confirmations,
        status: result.status,
        trust_score: result.trustScore,
      });
      setTimeout(() => setVerificationMessage(""), 5000);
    } catch {
      setVerificationMessage("Failed to verify. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <main className="container-shell space-y-6">
        <header className="flex items-center justify-between rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
          <Logo />
        </header>
        <div className="card-surface p-6">
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-zinc-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
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
        {/* Photo gallery — renders nothing when photos array is empty */}
        {bathroom.photos?.length > 0 ? (
          <div className="p-6 pb-0">
            <PhotoGallery
              photos={bathroom.photos}
              bathroomName={bathroom.name}
            />
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 text-sm text-zinc-400">
            No photos yet — be the first to add one
          </div>
        )}

        <div className="space-y-6 p-6">
          <div>
            <h1 className="mb-3 text-2xl font-semibold">{bathroom.name}</h1>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(bathroom.status)}`}
              >
                {bathroom.status === "pending_review" && (
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {getStatusLabel(bathroom.status)}
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
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

          <TrustBadge
            trustScore={bathroom.trust_score}
            confirmations={bathroom.number_of_confirmations}
          />

          {bathroom.status === "pending_review" && (
            <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">
                    Pending community review
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    Have you visited this location? Help verify it for the community.
                  </p>
                </div>
              </div>
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full rounded-full bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isVerifying ? "Confirming…" : "✓ Confirm this location"}
              </button>
              {verificationMessage && (
                <p className="text-sm font-medium text-amber-900">
                  {verificationMessage}
                </p>
              )}
            </div>
          )}

          {bathroom.status === "open" && bathroom.number_of_confirmations > 0 && (
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full rounded-full border border-teal-700 bg-white px-4 py-2.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? "Confirming…" : "✓ I've been here too"}
            </button>
          )}

          {verificationMessage && bathroom.status === "open" && (
            <p className="rounded-lg bg-teal-50 p-3 text-sm font-medium text-teal-900">
              {verificationMessage}
            </p>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Cleanliness", value: bathroom.cleanliness_avg },
              { label: "Safety", value: bathroom.safety_avg },
              { label: "Accessibility", value: bathroom.accessibility_avg },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-zinc-50 p-4 text-center">
                <p className="mb-1 text-2xl font-bold text-teal-700">
                  {value?.toFixed(1) ?? "—"}
                </p>
                <p className="text-xs text-zinc-600">{label}</p>
              </div>
            ))}
          </div>

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

          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h2 className="font-semibold text-zinc-900">Accessibility Features</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { key: "wheelchair_accessible", label: "Wheelchair accessible" },
                { key: "step_free_access", label: "Step-free access" },
                { key: "baby_changing", label: "Baby changing" },
                { key: "gender_neutral", label: "Gender-neutral" },
                { key: "family_friendly", label: "Family-friendly" },
              ].map(({ key, label }) => {
                const active = Boolean(bathroom[key as keyof Bathroom]);
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2 ${
                      active ? "text-teal-700" : "text-zinc-400"
                    }`}
                  >
                    <span>{active ? "✓" : "✗"}</span>
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

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
                onClick={() => router.push(`/bathroom/${bathroom.id}/report`)}
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Report issue
              </button>
              <button
                type="button"
                onClick={() => router.push(`/bathroom/${bathroom.id}/edit`)}
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