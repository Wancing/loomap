import { NextResponse } from "next/server";

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

export async function GET() {
  const query = buildOverpassQuery();
  const results: Array<Record<string, unknown>> = [];

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
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
        results.push({
          endpoint,
          ok: false,
          status: response.status,
          bodyPreview: text.slice(0, 500),
        });
        continue;
      }

      try {
        const json = JSON.parse(text);
        results.push({
          endpoint,
          ok: true,
          status: response.status,
          elementCount: Array.isArray(json.elements) ? json.elements.length : 0,
          sample: Array.isArray(json.elements) ? json.elements.slice(0, 3) : [],
        });
      } catch {
        results.push({
          endpoint,
          ok: false,
          status: response.status,
          bodyPreview: text.slice(0, 500),
          parseError: "Response was not valid JSON",
        });
      }
    } catch (error) {
      results.push({
        endpoint,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown fetch error",
      });
    }
  }

  return NextResponse.json({
    bbox: LISBON_BBOX,
    query,
    results,
  });
}