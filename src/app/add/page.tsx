"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Logo } from "@/components/logo";
import { PhotoUpload } from "@/components/photo-upload";

const MapWithNoSSR = dynamic(() => import("@/components/location-picker-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50">
      <p className="text-sm text-zinc-500">Loading map...</p>
    </div>
  ),
});

export default function AddBathroomPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    place_description: "",
    latitude: 38.7223,
    longitude: -9.1393,
    address: "",
    free_or_paid: "free" as "free" | "paid" | "unknown",
    price_if_known: "",
    opening_hours: "",
    wheelchair_accessible: false,
    step_free_access: false,
    baby_changing: false,
    gender_neutral: false,
    family_friendly: false,
    requires_code: false,
    code_hint: "",
    notes: "",
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bathrooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          photos,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add bathroom");
      }

      const result = await response.json();
      router.push(`/bathroom/${result.id}`);
    } catch (error) {
      console.error("Error adding bathroom:", error);
      alert("Failed to add bathroom. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container-shell space-y-6">
      <header className="flex items-center justify-between rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
        <Logo />

        <button
          onClick={() => router.push("/")}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Cancel
        </button>
      </header>

      <div className="card-surface overflow-hidden">
        <div className="border-b border-zinc-200 bg-gradient-to-r from-teal-50 to-blue-50 p-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Add a Bathroom</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Help the community by adding a public bathroom
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Name or description <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Starbucks Restroom, City Hall Bathroom"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Place description
              </label>
              <input
                type="text"
                value={formData.place_description}
                onChange={(e) => setFormData({ ...formData, place_description: e.target.value })}
                placeholder="e.g., Inside shopping center, 2nd floor"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address or nearby landmark"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Location Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">
              Location <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-zinc-500">
              Tap on the map to set the exact location
            </p>
            <MapWithNoSSR
              center={[formData.latitude, formData.longitude]}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <PhotoUpload
              onPhotosChange={setPhotos}
              maxPhotos={5}
            />
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Pricing</h2>

            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Free or paid?
              </label>
              <select
                value={formData.free_or_paid}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    free_or_paid: e.target.value as "free" | "paid" | "unknown",
                  })
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            {formData.free_or_paid === "paid" && (
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Price (if known)
                </label>
                <input
                  type="text"
                  value={formData.price_if_known}
                  onChange={(e) =>
                    setFormData({ ...formData, price_if_known: e.target.value })
                  }
                  placeholder="e.g., €0.50, $1.00"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          {/* Hours & Access */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Hours & Access</h2>

            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Opening hours
              </label>
              <input
                type="text"
                value={formData.opening_hours}
                onChange={(e) =>
                  setFormData({ ...formData, opening_hours: e.target.value })
                }
                placeholder="e.g., 24/7, Mon-Fri 9am-6pm"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requires_code"
                checked={formData.requires_code}
                onChange={(e) =>
                  setFormData({ ...formData, requires_code: e.target.checked })
                }
                className="h-4 w-4 rounded border-zinc-300 text-teal-700 focus:ring-2 focus:ring-teal-500"
              />
              <label htmlFor="requires_code" className="text-sm text-zinc-700">
                Requires code or key
              </label>
            </div>

            {formData.requires_code && (
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Code hint
                </label>
                <input
                  type="text"
                  value={formData.code_hint}
                  onChange={(e) =>
                    setFormData({ ...formData, code_hint: e.target.value })
                  }
                  placeholder="e.g., Ask staff, Written on receipt"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          {/* Accessibility Features */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">
              Accessibility Features
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wheelchair_accessible"
                  checked={formData.wheelchair_accessible}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wheelchair_accessible: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-teal-700 focus:ring-2 focus:ring-teal-500"
                />
                <label htmlFor="wheelchair_accessible" className="text-sm text-zinc-700">
                  Wheelchair accessible
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="step_free_access"
                  checked={formData.step_free_access}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      step_free_access: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-teal-700 focus:ring-2 focus:ring-teal-500"
                />
                <label htmlFor="step_free_access" className="text-sm text-zinc-700">
                  Step-free access
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="baby_changing"
                  checked={formData.baby_changing}
                  onChange={(e) =>
                    setFormData({ ...formData, baby_changing: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-teal-700 focus:ring-2 focus:ring-teal-500"
                />
                <label htmlFor="baby_changing" className="text-sm text-zinc-700">
                  Baby changing table
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="gender_neutral"
                  checked={formData.gender_neutral}
                  onChange={(e) =>
                    setFormData({ ...formData, gender_neutral: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-teal-700 focus:ring-2 focus:ring-teal-500"
                />
                <label htmlFor="gender_neutral" className="text-sm text-zinc-700">
                  Gender-neutral
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="family_friendly"
                  checked={formData.family_friendly}
                  onChange={(e) =>
                    setFormData({ ...formData, family_friendly: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-teal-700 focus:ring-2 focus:ring-teal-500"
                />
                <label htmlFor="family_friendly" className="text-sm text-zinc-700">
                  Family-friendly
                </label>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Additional notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any other helpful information..."
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-teal-700 px-6 py-3 font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Adding bathroom..." : "Add bathroom"}
          </button>
        </form>
      </div>
    </main>
  );
}