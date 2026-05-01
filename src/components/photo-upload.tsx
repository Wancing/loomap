"use client";

import { useRef, useState } from "react";
import type { BathroomPhoto } from "@/lib/types";

type PhotoUploadProps = {
  value: BathroomPhoto[];
  onChange: (photos: BathroomPhoto[]) => void;
  maxFiles?: number;
  maxFileSizeMb?: number;
};

export function PhotoUpload({
  value,
  onChange,
  maxFiles = 5,
  maxFileSizeMb = 4,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string>("");

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    setError("");
    const selected = Array.from(files);

    if (value.length + selected.length > maxFiles) {
      setError(`You can upload up to ${maxFiles} photos.`);
      return;
    }

    const invalid = selected.find(
      (file) =>
        !file.type.startsWith("image/") || file.size > maxFileSizeMb * 1024 * 1024
    );

    if (invalid) {
      setError(
        `Only image files up to ${maxFileSizeMb}MB are allowed.`
      );
      return;
    }

    const newPhotos = await Promise.all(
      selected.map(async (file, index) => {
        const src = await fileToDataUrl(file);
        return {
          id: crypto.randomUUID?.() ?? `${Date.now()}-${index}`,
          src,
          alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          caption: "",
          uploadedAt: new Date().toISOString(),
        };
      })
    );

    onChange([...value, ...newPhotos]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removePhoto = (id: string) => {
    onChange(value.filter((photo) => photo.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    onChange(
      value.map((photo) =>
        photo.id === id ? { ...photo, caption, alt: caption || photo.alt } : photo
      )
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="photo-upload"
          className="mb-2 block text-sm font-medium text-slate-900"
        >
          Photos
        </label>
        <input
          ref={inputRef}
          id="photo-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => void handleFiles(e.target.files)}
          className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-teal-800"
          aria-describedby="photo-upload-help"
        />
        <p id="photo-upload-help" className="mt-2 text-xs text-slate-500">
          Upload up to {maxFiles} photos. JPG, PNG, or WebP. Max {maxFileSizeMb}MB each.
        </p>
        {error ? (
          <p className="mt-2 text-sm text-rose-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {value.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="list">
          {value.map((photo) => (
            <li
              key={photo.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <img
                src={photo.src}
                alt={photo.alt || "Bathroom photo preview"}
                className="h-32 w-full object-cover"
              />
              <div className="space-y-2 p-3">
                <label className="block text-xs font-medium text-slate-700">
                  Caption
                  <input
                    type="text"
                    value={photo.caption ?? ""}
                    onChange={(e) => updateCaption(photo.id, e.target.value)}
                    placeholder="Optional note"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                >
                  Remove photo
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}