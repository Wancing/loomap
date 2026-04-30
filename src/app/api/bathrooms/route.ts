import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import type { Bathroom, BathroomPhoto } from "@/lib/types";

const DATA_PATH = path.join(process.cwd(), "data", "bathrooms.json");

async function readBathrooms(): Promise<Bathroom[]> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeBathrooms(data: Bathroom[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function normalizePhotos(input: unknown): BathroomPhoto[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((photo) => photo && typeof photo === "object")
    .map((photo, index) => {
      const p = photo as Partial<BathroomPhoto>;
      return {
        id: p.id || crypto.randomUUID(),
        src: typeof p.src === "string" ? p.src : "",
        alt:
          typeof p.alt === "string" && p.alt.trim().length > 0
            ? p.alt
            : `Bathroom photo ${index + 1}`,
        caption: typeof p.caption === "string" ? p.caption : "",
        uploadedAt:
          typeof p.uploadedAt === "string"
            ? p.uploadedAt
            : new Date().toISOString(),
      };
    })
    .filter((photo) => photo.src.startsWith("data:image/") || photo.src.startsWith("http"));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bathrooms = await readBathrooms();
  const bathroom = bathrooms.find((item) => item.id === id);

  if (!bathroom) {
    return NextResponse.json({ error: "Bathroom not found" }, { status: 404 });
  }

  return NextResponse.json(bathroom);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const bathrooms = await readBathrooms();
  const index = bathrooms.findIndex((item) => item.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Bathroom not found" }, { status: 404 });
  }

  const existing = bathrooms[index];

  const updated: Bathroom = {
    ...existing,
    ...body,
    latitude:
      body.latitude !== undefined ? Number(body.latitude) : existing.latitude,
    longitude:
      body.longitude !== undefined ? Number(body.longitude) : existing.longitude,
    safety_rating:
      body.safety_rating !== undefined
        ? Number(body.safety_rating)
        : existing.safety_rating,
    cleanliness_rating:
      body.cleanliness_rating !== undefined
        ? Number(body.cleanliness_rating)
        : existing.cleanliness_rating,
    accessibility_rating:
      body.accessibility_rating !== undefined
        ? Number(body.accessibility_rating)
        : existing.accessibility_rating,
    photos:
      body.photos !== undefined ? normalizePhotos(body.photos) : existing.photos,
    updated_at: new Date().toISOString(),
  };

  bathrooms[index] = updated;
  await writeBathrooms(bathrooms);

  return NextResponse.json(updated);
}