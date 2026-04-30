"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import type { Bathroom } from "@/lib/types";

type FormData = {
  name: string;
  address: string;
  place_description: string;
  free_or_paid: "free" | "paid" | "unknown";
  price_if_known: string;
  opening_hours: string;
  wheelchair_accessible: boolean;
  step_free_access: boolean;
  baby_changing: boolean;
  gender_neutral: boolean;
  family_friendly: boolean;
  requires_code: boolean;
  code_hint: string;
};

export default function EditBathroomPage() {
  const params = useParams();
  const router = useRouter();
  const [bathroom, setBathroom] = useState<Bathroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    place_description: "",
    free_or_paid: "unknown",
    price_if_known: "",
    opening_hours: "",
    wheelchair_accessible: false,
    step_free_access: false,
    baby_changing: false,
    gender_neutral: false,
    family_friendly: false,
    requires_code: false,
    code_hint: "",
  });

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

        if (found) {
          setBathroom(found);
          setFormData({
            name: found.name,
            address: found.address || "",
            place_description: found.place_description || "",
            free_or_paid: found.free_or_paid,
            price_if_known: found.price_if_known || "",
            opening_hours: found.opening_hours || "",
            wheelchair_accessible: found.wheelchair_accessible,
            step_free_access: found.step_free_access,
            baby_changing: found.baby_changing,
            gender_neutral: found.gender_neutral,
            family_friendly: found.family_friendly,
            requires_code: found.requires_code,
            code_hint: found.code_hint || "",
          });
        }
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

    if (!formData.name.trim()) {
      alert("Please enter a name for this bathroom.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/bathrooms/${params.id}/edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update bathroom");
      }

      const result = await response.json();
      
      alert("Bathroom updated successfully!");
      router.push(`/bathroom/${params.id}`);
    } catch (error) {
      console.error("Error updating bathroom:", error);
      alert("Failed to update bathroom. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          <h1 className="mb-2 text-2xl font-semibold">Edit bathroom info</h1>
          <p className="text-sm text-zinc-600">
            Help keep information accurate by updating details you know have changed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Starbucks Bathroom, City Hall Restroom"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Address
              </label>
              <input
                type="text"
                placeholder="Street address or nearest landmark"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Description / Tips
              </label>
              <textarea
                placeholder="e.g., Inside shopping center, 2nd floor. Ask staff for code."
                value={formData.place_description}
                onChange={(e) => updateField("place_description", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Free or paid?
              </label>
              <select
                value={formData.free_or_paid}
                onChange={(e) =>
                  updateField("free_or_paid", e.target.value as "free" | "paid" | "unknown")
                }
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
              >
                <option value="unknown">Unknown</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {formData.free_or_paid === "paid" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Price (if known)
                </label>
                <input
                  type="text"
                  placeholder="e.g., €0.50, $1"
                  value={formData.price_if_known}
                  onChange={(e) => updateField("price_if_known", e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Opening hours
              </label>
              <input
                type="text"
                placeholder="e.g., 24/7, Mo-Fr 08:00-20:00"
                value={formData.opening_hours}
                onChange={(e) => updateField("opening_hours", e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h2 className="font-semibold text-zinc-900">Accessibility Features</h2>

            <div className="space-y-2">
              {[
                { field: "wheelchair_accessible", label: "Wheelchair accessible" },
                { field: "step_free_access", label: "Step-free access" },
                { field: "baby_changing", label: "Baby changing table" },
                { field: "gender_neutral", label: "Gender-neutral" },
                { field: "family_friendly", label: "Family-friendly" },
              ].map(({ field, label }) => (
                <label
                  key={field}
                  className="flex cursor-pointer items-center gap-3 rounded-lg bg-white p-3 text-sm transition hover:bg-zinc-50"
                >
                  <input
                    type="checkbox"
                    checked={formData[field as keyof FormData] as boolean}
                    onChange={(e) => updateField(field as keyof FormData, e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-teal-700 focus:ring-teal-700"
                  />
                  <span className="text-zinc-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={formData.requires_code}
                onChange={(e) => updateField("requires_code", e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-teal-700 focus:ring-teal-700"
              />
              <span className="font-medium text-zinc-700">Requires access code or key</span>
            </label>

            {formData.requires_code && (
              <input
                type="text"
                placeholder="e.g., Ask staff for code, customers only"
                value={formData.code_hint}
                onChange={(e) => updateField("code_hint", e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-teal-700 px-6 py-3 font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving changes..." : "Save changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
