"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { PhotoUpload } from "@/components/photo-upload";

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
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      () => {}
    );
  }, []);

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
          type="button"
          onClick={() => router.push("/")}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Cancel
        </button>
      </header>

      <div className="card-surface overflow-hidden">
        <div className="border-b border-zinc-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Add a Bathroom</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Help the community by adding a public bathroom.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Basic information</h2>

            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Name or description <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. City Hall restroom"
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
                onChange={(e) =>
                  setFormData({ ...formData, place_description: e.target.value })
                }
                placeholder="Inside shopping center, 2nd floor"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address or landmark"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-zinc-50 p-4">
            <h2 className="text-lg font-semibold text-zinc-900">Location</h2>
            <p className="text-sm text-zinc-600">
              For now, edit the coordinates directly. We’ll restore the picker after the app is stable.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitude: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitude: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <PhotoUpload onPhotosChange={setPhotos} maxPhotos={5} />

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

            {formData.free_or_paid === "paid" ? (
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
                  placeholder="€0.50"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Hours & access</h2>

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
                placeholder="24/7 or Mon-Fri 9am-6pm"
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

            {formData.requires_code ? (
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
                  placeholder="Ask staff or receipt code"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">
              Accessibility features
            </h2>

            <div className="space-y-3">
              {[
                ["wheelchair_accessible", "Wheelchair accessible"],
                ["step_free_access", "Step-free access"],
                ["baby_changing", "Baby changing table"],
                ["gender_neutral", "Gender-neutral"],
                ["family_friendly", "Family-friendly"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={key}
                    checked={formData[key as keyof typeof formData] as boolean}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [key]: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-zinc-300 text-teal-700 focus:ring-2 focus:ring-teal-500"
                  />
                  <label htmlFor={key} className="text-sm text-zinc-700">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Additional notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any extra directions or tips..."
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

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