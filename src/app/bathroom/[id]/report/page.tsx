"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import type { Bathroom } from "@/lib/types";

const REPORT_REASONS = [
  "Permanently closed",
  "Temporarily closed",
  "Incorrect location",
  "Requires payment (marked as free)",
  "Not wheelchair accessible (marked as accessible)",
  "No baby changing table (marked as available)",
  "Requires code/key (not mentioned)",
  "Poor cleanliness",
  "Safety concerns",
  "Other",
] as const;

export default function ReportBathroomPage() {
  const params = useParams();
  const router = useRouter();
  const [bathroom, setBathroom] = useState<Bathroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      alert("Please select a reason for reporting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/bathrooms/${params.id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: selectedReason,
          notes: additionalNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to report bathroom");
      }

      const result = await response.json();
      
      alert(result.message);
      router.push(`/bathroom/${params.id}`);
    } catch (error) {
      console.error("Error reporting bathroom:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
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
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-zinc-100"></div>
            <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100"></div>
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

  return (
    <main className="container-shell space-y-6">
      <header className="flex items-center justify-between rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
        <Logo />

        <button
          onClick={() => router.push(`/bathroom/${params.id}`)}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          ← Cancel
        </button>
      </header>

      <div className="card-surface p-6">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-semibold">Report an issue</h1>
          <p className="text-sm text-zinc-600">
            Help keep Loomap accurate by reporting problems with{" "}
            <span className="font-medium">{bathroom.name}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 flex-shrink-0 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-rose-900">
                  What's wrong with this bathroom?
                </p>
                <p className="mt-1 text-xs text-rose-700">
                  Select the main issue below. Multiple reports from the community help us keep data accurate.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-700">
              Reason for report <span className="text-rose-600">*</span>
            </label>

            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-sm transition hover:bg-zinc-50"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="h-4 w-4 border-zinc-300 text-rose-600 focus:ring-rose-600"
                  />
                  <span className="text-zinc-700">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Additional notes (optional)
            </label>
            <textarea
              placeholder="Provide any additional context that might help..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedReason}
            className="w-full rounded-full bg-rose-600 px-6 py-3 font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting report..." : "Submit report"}
          </button>
        </form>
      </div>
    </main>
  );
}