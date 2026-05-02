import { NextRequest, NextResponse } from "next/server";
import { getBathroomById } from "@/lib/db/bathrooms";
import type { Bathroom } from "@/lib/types";

type OverpassElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

const LISBON_BBOX = {
  south: 38.691,
  west: -9.229,
  north: 38.796,
  east: -9.090,
};

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://z.overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

function parseBooleanTag(value?: string): boolean {
  if (!value) return false;
  return ["yes", "true", "1", "designated", "limited"].includes(
    value.toLowerCase()
  );
}

function normalizeText(value?: string): string {
  return typeof value === "string" ? value.trim() : "";
}

function mapOsmElementToBathroom(element: OverpassElement): Bathroom | null {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (typeof lat !== "number" || typeof lon !== "number") {
    return null;
  }

  const tags = element.tags ?? {};
  const fee = normalizeText(tags.fee).toLowerCase();
  const wheelchair = normalizeText(tags.wheelchair).toLowerCase();
  const changingTable = normalizeText(tags.changing_table).toLowerCase();
  const unisex = normalizeText(tags.unisex || tags.gender_neutral).toLowerCase();

  let free_or_paid: "free" | "paid" | "unknown" = "unknown";
  if (fee === "yes") free_or_paid = "paid";
  if (fee === "no") free_or_paid = "free";

  return {
    id: `osm-${element.type}-${element.id}`,
    name:
      normalizeText(tags.name) ||
      normalizeText(tags.operator) ||
      normalizeText(tags.brand) ||
      "Public bathroom",
    latitude: lat,
    longitude: lon,
    address: [
      normalizeText(tags["addr:street"]),
      normalizeText(tags["addr:housenumber"]),
      normalizeText(tags["addr:postcode"]),
    ]
      .filter(Boolean)
      .join(", "),
    place_description:
      normalizeText(tags.description) ||
      normalizeText(tags.location) ||
      normalizeText(tags.level) ||
      "",
    free_or_paid,
    price_if_known: normalizeText(tags.charge),
    opening_hours: normalizeText(tags.opening_hours),
    wheelchair_accessible:
      wheelchair === "yes" || wheelchair === "designated",
    step_free_access:
      wheelchair === "yes" || wheelchair === "designated",
    baby_changing: parseBooleanTag(changingTable),
    gender_neutral: parseBooleanTag(unisex),
    family_friendly: parseBooleanTag(changingTable),
    requires_code: false,
    code_hint: "",
    notes:
      normalizeText(tags.note) ||
      normalizeText(tags.description) ||
      "",
    status: "open",
    cleanliness_avg: 3.5,
    safety_avg: 3.5,
    accessibility_avg:
      wheelchair === "yes" || wheelchair === "designated" ? 4 : 3,
    trust_score: 60,
    number_of_confirmations: 0,
    report_count: 0,
    last_verified_at: null,
    created_at: null,
    source: "openstreetmap",
  };
}

function buildOverpassQuery() {
  return `
[out:json][timeout:30];
(
  node["amenity"="toilets"](${LISBON_BBOX.south},${LISBON_BBOX.west},${LISBON_BBOX.north},${LISBON_BBOX.east});
  way["amenity"="toilets"](${LISBON_BBOX.south},${LISBON_BBOX.west},${LISBON_BBOX.north},${LISBON_BBOX.east});
  relation["amenity"="toilets"](${LISBON_BBOX.south},${LISBON_BBOX.west},${LISBON_BBOX.north},${LISBON_BBOX.east});
);
out center tags;
`.trim();
}

async function fetchOverpassJson(endpoint: string, query: string) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Accept: "application/json",
      "User-Agent": "loomap/1.0 public-bathroom-map",
    },
    body: query,
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Overpass ${response.status}: ${text.slice(0, 300)}`);
  }

  try {
    return JSON.parse(text) as OverpassResponse;
  } catch {
    throw new Error(`Overpass returned non-JSON response: ${text.slice(0, 300)}`);
  }
}

async function getOsmBathroomById(id: string): Promise<Bathroom | null> {
  if (!id.startsWith("osm-")) {
    return null;
  }

  const query = buildOverpassQuery();
  let lastError: unknown = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await fetchOverpassJson(endpoint, query);
      const elements = Array.isArray(data.elements) ? data.elements : [];

      const match = elements
        .map(mapOsmElementToBathroom)
        .filter(Boolean)
        .find((bathroom) => bathroom?.id === id);

      if (match) {
        return match;
      }
    } catch (error) {
      lastError = error;
      console.error(`OSM detail fetch failed from ${endpoint}:`, error);
    }
  }

  if (lastError) {
    console.error("All OSM detail endpoints failed:", lastError);
  }

  return null;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const localBathroom = getBathroomById(id);
    if (localBathroom) {
      return NextResponse.json(localBathroom);
    }

    const osmBathroom = await getOsmBathroomById(id);
    if (osmBathroom) {
      return NextResponse.json(osmBathroom);
    }

    return NextResponse.json(
      { error: "Bathroom not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching bathroom:", error);
    return NextResponse.json(
      { error: "Failed to fetch bathroom" },
      { status: 500 }
    );
  }
}