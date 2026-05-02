"use client";

import { useEffect, useState } from "react";
import type { BathroomPhoto } from "@/lib/types";

type PhotoGalleryProps = {
  photos: BathroomPhoto[];
  bathroomName: string;
};

export function PhotoGallery({ photos, bathroomName }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? 0 : (current + 1) % photos.length
        );
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? 0 : (current - 1 + photos.length) % photos.length
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, photos.length]);

  if (!photos.length) return null;

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;
  const currentIndex = activeIndex ?? 0;

  return (
    <>
      <section aria-labelledby="photo-gallery-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            id="photo-gallery-heading"
            className="text-lg font-semibold text-slate-900"
          >
            Photos
          </h2>
          <p className="text-sm text-slate-500">
            {photos.length} {photos.length === 1 ? "photo" : "photos"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              aria-label={`Open photo ${index + 1} of ${photos.length} for ${bathroomName}`}
            >
              <img
                src={photo.src}
                alt={photo.alt || `${bathroomName} photo ${index + 1}`}
                className="h-32 w-full object-cover"
              />
              {photo.caption ? (
                <div className="p-2 text-xs text-slate-600">{photo.caption}</div>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      {activePhoto ? (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            aria-label="Close photo viewer"
          >
            Close
          </button>

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((currentIndex - 1 + photos.length) % photos.length)
                }
                className="absolute left-4 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
                aria-label="Previous photo"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((currentIndex + 1) % photos.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
                aria-label="Next photo"
              >
                →
              </button>
            </>
          ) : null}

          <figure className="mx-auto flex max-h-full max-w-4xl flex-col items-center gap-3">
            <img
              src={activePhoto.src}
              alt={activePhoto.alt || `${bathroomName} enlarged photo`}
              className="max-h-[75vh] w-auto rounded-2xl object-contain"
            />
            {(activePhoto.caption || photos.length > 1) && (
              <figcaption className="text-center text-sm text-slate-200">
                {activePhoto.caption || `${currentIndex + 1} of ${photos.length}`}
              </figcaption>
            )}
          </figure>
        </div>
      ) : null}
    </>
  );
}