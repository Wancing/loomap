"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

type FormData = {
  name: string;
  latitude: number;
  longitude: number;
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

export default function AddBathroomPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    latitude: 0,
    longitude: 0,
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setUseCurrentLocation(true);
        setLocationError("");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location permission was denied.");
        } else {
          setLocationError("Could not get your location.");
        }
      }
    );
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.name.trim()) {
    alert("Please enter a name for this bathroom.");
    return;
  }

  if (formData.latitude === 0 || formData.longitude === 0) {
    alert("Please set the bathroom location.");
    return;
  }

  console.log("Submitting form data:", formData);
  setIsSubmitting(true);

  try {
    const response = await fetch("/api/bathrooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    console.log("Response status:", response.status);
    const result = await response.json();
    console.log("Response body:", result);

    if (!response.ok) {
      throw new Error("Failed to submit bathroom");
    }
    
    alert(`Bathroom submitted successfully! It will appear after review. ID: ${result.id}`);
    router.push("/");
  } catch (error) {
    console.error("Error submitting bathroom:", error);
    alert("Failed to submit bathroom. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="container-shell space-y-6">
      <header className="flex items-center justify-between rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
        <Logo />

        <button
          onClick={() => router.push("/")}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          ← Cancel
        </button>
      </header>

      <div className="card-surface p-6">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-semibold">Add a new bathroom</h1>
          <p className="text-sm text-zinc-600">
            Help the community by adding a public bathroom you know about.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h2 className="font-semibold text-zinc-900">Location</h2>

            {!useCurrentLocation ? (
              <button
                type="button"
                onClick={handleGetLocation}
                className="w-full rounded-full bg-teal-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-800"
              >
                Use my current location
              </button>
            ) : (
              <div className="rounded-lg bg-white p-3 text-sm">
                <p className="font-medium text-teal-700">✓ Location set</p>
                <p className="text-xs text-zinc-600">
                  {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                </p>
              </div>
            )}

            {locationError && (
              <p className="text-sm text-rose-600">{locationError}</p>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Or enter coordinates manually
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={formData.latitude || ""}
                  onChange={(e) =>
                    updateField("latitude", parseFloat(e.target.value) || 0)
                  }
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={formData.longitude || ""}
                  onChange={(e) =>
                    updateField("longitude", parseFloat(e.target.value) || 0)
                  }
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
                />
              </div>
            </div>
          </div>

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
            {isSubmitting ? "Submitting..." : "Submit bathroom"}
          </button>
        </form>
      </div>
    </main>
  );
}