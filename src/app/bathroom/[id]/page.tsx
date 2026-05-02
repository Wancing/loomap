"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { TrustBadge } from "@/components/trust-badge";
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
          setBathroom(null);
          return;
        }

        const data = await response.json();
        setBathroom(data);
      } catch (error) {
        console.error("Error fetching bathroom:", error);
        setBathroom(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBathroom();
    }
  }, [params.id]);

  const handleVerify = async () => {
    if (!bathroom) return;

    setIsVerifying(true);
    setVerificationMessage("");

    try {
      const response = await fetch(`/api/bathrooms/${bathroom.id}/verify`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to verify bathroom");
      }

      const result = await response.json();

      setBathroom((current) =>
        current
          ? {
              ...current,
              number_of_confirmations:
                result.confirmations ?? current.number_of_confirmations,
              trust_score: result.trustScore ?? current.trust_score,
              status: result.status ?? current.status,
              last_verified_at: new Date().toISOString(),
            }
          : current
      );

      setVerificationMessage(
        result.message || "Thanks for confirming this bathroom."
      );
    } catch (error) {
      console.error("Error verifying bathroom:", error);
      setVerificationMessage("Could not verify this bathroom right now.");
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

        <section className="card-surface p-6">
          <p className="text-sm text-zinc-600">Loading bathroom details...</p>
        </section>
      </main>
    );
  }

  if (!bathroom) {
    return (
      <main className="container-shell space-y-6">
        <header className="flex items-center justify-between rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
          <Logo />
        </header>

        <section className="card-surface space-y-4 p-6">
          <h1 className="text-xl font-semibold">Bathroom not found</h1>
          <p className="text-sm text-zinc-600">
            This bathroom may have been removed or the link is incorrect.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
          >
            Back to map
          </button>
        </section>
      </main>
    );
  }

  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${bathroom.latitude},${bathroom.longitude}`;

  return (
    <main className="container-shell space-y-6">
      <header className="flex items-center justify-between rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
        <Logo />
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Back
        </button>
      </header>

      <section className="card-surface space-y-6 p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {bathroom.name}
            </h1>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                bathroom.status
              )}`}
            >
              {getStatusLabel(bathroom.status)}
            </span>
          </div>

          {bathroom.place_description && (
            <p className="text-sm text-zinc-700">{bathroom.place_description}</p>
          )}

          {bathroom.address && (
            <p className="text-sm text-zinc-500">{bathroom.address}</p>
          )}
        </div>

        <TrustBadge
          trustScore={bathroom.trust_score}
          confirmations={bathroom.number_of_confirmations}
        />

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-xs text-zinc-500">Cleanliness</p>
            <p className="mt-1 text-lg font-semibold">
              {bathroom.cleanliness_avg}
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-xs text-zinc-500">Safety</p>
            <p className="mt-1 text-lg font-semibold">{bathroom.safety_avg}</p>
          </div>

          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-xs text-zinc-500">Access</p>
            <p className="mt-1 text-lg font-semibold">
              {bathroom.accessibility_avg}
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-zinc-50 p-4">
          <h2 className="text-sm font-semibold text-zinc-900">Details</h2>

          <div className="grid gap-2 text-sm text-zinc-700">
            <p>
              <span className="font-medium">Type:</span> {bathroom.free_or_paid}
            </p>

            {bathroom.price_if_known && (
              <p>
                <span className="font-medium">Price:</span>{" "}
                {bathroom.price_if_known}
              </p>
            )}

            {bathroom.opening_hours && (
              <p>
                <span className="font-medium">Opening hours:</span>{" "}
                {bathroom.opening_hours}
              </p>
            )}

            {bathroom.last_verified_at && (
              <p>
                <span className="font-medium">Last verified:</span>{" "}
                {new Date(bathroom.last_verified_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-zinc-50 p-4">
          <h2 className="text-sm font-semibold text-zinc-900">Accessibility</h2>

          <div className="flex flex-wrap gap-2 text-xs text-zinc-700">
            {bathroom.wheelchair_accessible && (
              <span className="rounded-full bg-white px-3 py-1">
                Wheelchair accessible
              </span>
            )}
            {bathroom.step_free_access && (
              <span className="rounded-full bg-white px-3 py-1">
                Step-free access
              </span>
            )}
            {bathroom.baby_changing && (
              <span className="rounded-full bg-white px-3 py-1">
                Baby changing
              </span>
            )}
            {bathroom.gender_neutral && (
              <span className="rounded-full bg-white px-3 py-1">
                Gender-neutral
              </span>
            )}
            {bathroom.family_friendly && (
              <span className="rounded-full bg-white px-3 py-1">
                Family-friendly
              </span>
            )}
            {bathroom.requires_code && (
              <span className="rounded-full bg-white px-3 py-1">
                Requires code
              </span>
            )}
          </div>
        </div>

        {verificationMessage && (
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
            {verificationMessage}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-teal-700 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-teal-800"
          >
            Get directions
          </a>

          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying}
            className="rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isVerifying ? "Verifying..." : "Confirm location"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/bathroom/${bathroom.id}/edit`)}
            className="rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Edit info
          </button>
        </div>
      </section>
    </main>
  );
}
