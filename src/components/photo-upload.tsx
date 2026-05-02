"use client";

import { useRef, useState } from "react";

type PhotoUploadProps = {
  value?: string[];
  onPhotosChange?: (photos: string[]) => void;
  maxPhotos?: number;
};

export function PhotoUpload({
  value = [],
  onPhotosChange,
  maxPhotos = 5,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const photos = Array.isArray(value) ? value : [];

  const notifyChange = (nextPhotos: string[]) => {
    onPhotosChange?.(nextPhotos);
  };

  const handleFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const availableSlots = Math.max(0, maxPhotos - photos.length);
    const selectedFiles = files.slice(0, availableSlots);

    if (selectedFiles.length === 0) {
      alert(`You can upload up to ${maxPhotos} photos.`);
      event.target.value = "";
      return;
    }

    setIsProcessing(true);

    try {
      const nextPhotos = [...photos];

      for (const file of selectedFiles) {
        const dataUrl = await readFileAsDataURL(file);
        nextPhotos.push(dataUrl);
      }

      notifyChange(nextPhotos);
    } catch (error) {
      console.error("Error reading photos:", error);
      alert("Could not process one or more photos.");
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const nextPhotos = photos.filter((_, index) => index !== indexToRemove);
    notifyChange(nextPhotos);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Photos</h2>
          <p className="text-sm text-zinc-600">
            Add up to {maxPhotos} photos to help people recognize the location.
          </p>
        </div>

        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
          {photos.length}/{maxPhotos}
        </span>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing || photos.length >= maxPhotos}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing
              ? "Processing photos..."
              : photos.length >= maxPhotos
              ? "Photo limit reached"
              : "Choose photos"}
          </button>

          <p className="text-xs text-zinc-500">
            Photos stay in the browser for now so the form does not crash while we stabilize uploads.
          </p>
        </div>
      </div>

      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="list">
          {photos.map((photo, index) => (
            <li
              key={`${photo}-${index}`}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="aspect-square bg-zinc-100">
                <img
                  src={photo}
                  alt={`Uploaded bathroom photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-2">
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}