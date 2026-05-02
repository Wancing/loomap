import { NextRequest, NextResponse } from "next/server";
import { getAllBathrooms, saveBathroom } from "@/lib/db/bathrooms";
import type { Bathroom } from "@/lib/types";

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

const LISBON_BBOX = {
  south: 38.691,
  west: -9.229,
  north: 38.796,
  east: -9.090,
};

function parseBooleanTag(value?: string): boolean {
  if (!value) return false;
  return ["yes", "designated", "limited"].includes(value.toLowerCase());
}

function mapOsmElementToBathroom(element: OverpassElement): Bathroom | null {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (typeof lat !== "number" || typeof lon !== "number") {
    return null;
  }

  const tags = element.tags ?? {};
  const fee = (tags.fee || "").toLowerCase();
  const wheelchair = (tags.wheelchair || "").toLowerCase();
  const changingTable = (tags.changing_table || "").toLowerCase();
  const unisex = (tags.unisex || tags.gender_neutral || "").toLowerCase();

  let free_or_paid: "free" | "paid" | "unknown" = "unknown";
  if (fee === "yes") free_or_paid = "paid";
  if (fee === "no") free_or_paid = "free";

  return {
    id: `osm-${element.id}`,
    name: tags.name || tags.operator || tags.brand || "Public bathroom",
    latitude: lat,
    longitude: lon,
    address: [
      tags["addr:street"],
      tags["addr:housenumber"],
      tags["addr:postcode"],
    ]
      .filter(Boolean)
      .join(", "),
    place_description:
      tags.description ||
      tags.location ||
      tags.level ||
      "",
    free_or_paid,
    price_if_known: tags.charge || "",
    opening_hours: tags.opening_hours || "",
    wheelchair_accessible: wheelchair === "yes" || wheelchair === "designated",
    step_free_access: wheelchair === "yes" || wheelchair === "designated",
    baby_changing: parseBooleanTag(changingTable),
    gender_neutral: parseBooleanTag(unisex),
    family_friendly: parseBooleanTag(changingTable),
    requires_code: false,
    code_hint: "",
    notes: tags.note || tags.description || "",
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

async function getOsmBathrooms(): Promise<Bathroom[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="toilets"](${LISBON_BBOX.south},${LISBON_BBOX.west},${LISBON_BBOX.north},${LISBON_BBOX.east});
      way["amenity"="toilets"](${LISBON_BBOX.south},${LISBON_BBOX.west},${LISBON_BBOX.north},${LISBON_BBOX.east});
      relation["amenity"="toilets"](${LISBON_BBOX.south},${LISBON_BBOX.west},${LISBON_BBOX.north},${LISBON_BBOX.east});
    );
    out center tags;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
    },
    body: query,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch OSM bathrooms");
  }

  const data = await response.json();
  const elements = Array.isArray(data.elements) ? data.elements : [];

  return elements
    .map(mapOsmElementToBathroom)
    .filter(Boolean) as Bathroom[];
}

export async function GET(_request: NextRequest) {
  try {
    const localBathrooms = getAllBathrooms();

    let osmBathrooms: Bathroom[] = [];
    try {
      osmBathrooms = await getOsmBathrooms();
    } catch (osmError) {
      console.error("OSM fetch failed, returning local bathrooms only:", osmError);
    }

    const bathrooms = [...localBathrooms, ...osmBathrooms];

    return NextResponse.json({ bathrooms });
  } catch (error) {
    console.error("Error fetching bathrooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch bathrooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || body.latitude === undefined || body.longitude === undefined) {
      return NextResponse.json(
        { error: "name, latitude, and longitude are required" },
        { status: 400 }
      );
    }

    const id = saveBathroom({
      name: body.name,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      address: body.address || "",
      place_description: body.place_description || "",
      free_or_paid: body.free_or_paid || "unknown",
      price_if_known: body.price_if_known || "",
      opening_hours: body.opening_hours || "",
      wheelchair_accessible: Boolean(body.wheelchair_accessible),
      step_free_access: Boolean(body.step_free_access),
      baby_changing: Boolean(body.baby_changing),
      gender_neutral: Boolean(body.gender_neutral),
      family_friendly: Boolean(body.family_friendly),
      requires_code: Boolean(body.requires_code),
      code_hint: body.code_hint || "",
      notes: body.notes || "",
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("Error creating bathroom:", error);
    return NextResponse.json(
      { error: "Failed to create bathroom" },
      { status: 500 }
    );
  }
}