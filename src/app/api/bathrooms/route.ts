import { NextRequest, NextResponse } from "next/server";

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements: OverpassElement[];
};

function parseYesNo(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return normalized === "yes" || normalized === "true";
}

function parseFreeOrPaid(
  fee: string | undefined
): "free" | "paid" | "unknown" {
  if (!fee) return "unknown";
  const normalized = fee.toLowerCase();
  if (normalized === "no") return "free";
  if (normalized === "yes") return "paid";
  return "unknown";
}

function parseStatus(
  tags: Record<string, string> | undefined
): "open" | "closed" | "uncertain" | "under_review" {
  if (!tags) return "uncertain";
  
  const access = tags.access?.toLowerCase();
  if (access === "no" || access === "private") return "closed";
  
  const disused = tags.disused?.toLowerCase();
  if (disused === "yes") return "closed";
  
  if (tags.opening_hours) return "open";
  
  return "uncertain";
}

function transformOverpassToBathroom(element: OverpassElement, index: number) {
  const tags = element.tags || {};
  
  const lat = element.lat ?? element.center?.lat ?? 0;
  const lon = element.lon ?? element.center?.lon ?? 0;

  const name =
    tags.name ||
    tags.operator ||
    `Public Toilet ${index + 1}`;

  return {
    id: `osm-${element.type}-${element.id}`,
    name,
    latitude: lat,
    longitude: lon,
    address: tags["addr:street"] || tags["addr:city"] || null,
    place_description: tags.description || tags.note || null,
    free_or_paid: parseFreeOrPaid(tags.fee),
    price_if_known: tags.charge || null,
    opening_hours: tags.opening_hours || null,
    wheelchair_accessible: parseYesNo(tags.wheelchair),
    step_free_access: parseYesNo(tags.wheelchair),
    baby_changing: parseYesNo(tags.changing_table) || parseYesNo(tags["changing_table:location"]),
    gender_neutral: parseYesNo(tags.unisex) || (tags.male === "no" && tags.female === "no"),
    family_friendly: parseYesNo(tags.family),
    requires_code: parseYesNo(tags["access:key"]) || tags.access === "customers",
    code_hint: tags["access:description"] || null,
    status: parseStatus(tags),
    cleanliness_avg: 3.5,
    safety_avg: 3.5,
    accessibility_avg: parseYesNo(tags.wheelchair) ? 4.2 : 3.0,
    trust_score: 65,
    number_of_confirmations: 1,
    report_count: 0,
    last_verified_at: null,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const lat = parseFloat(searchParams.get("lat") || "38.7223");
  const lon = parseFloat(searchParams.get("lon") || "-9.1393");
  const radius = parseInt(searchParams.get("radius") || "5000", 10);

  const query = `[out:json][timeout:25];(node["amenity"="toilets"](around:${radius},${lat},${lon});way["amenity"="toilets"](around:${radius},${lat},${lon});relation["amenity"="toilets"](around:${radius},${lat},${lon}););out center tags;`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json",
        "User-Agent": "Loomap/1.0 (community bathroom finder)",
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      console.error("Overpass API error:", response.status, response.statusText);
      
      // Fallback to empty array instead of error
      return NextResponse.json({ bathrooms: [] });
    }

    const data: OverpassResponse = await response.json();

    const bathrooms = data.elements
      .filter((element) => element.tags && (element.lat || element.center))
      .map((element, index) => transformOverpassToBathroom(element, index));

    return NextResponse.json({ bathrooms });
  } catch (error) {
    console.error("Error fetching from Overpass API:", error);
    
    // Return empty array instead of 500 error
    return NextResponse.json({ bathrooms: [] });
  }
}