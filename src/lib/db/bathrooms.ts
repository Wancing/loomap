import Database from "better-sqlite3";
import path from "path";
import type { Bathroom } from "@/lib/types";

const dbPath = path.join(process.cwd(), "loomap.db");
const db = new Database(dbPath);

function normalizeBathroom(row: any): Bathroom {
  return {
    id: String(row.id),
    name: row.name,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    address: row.address ?? "",
    place_description: row.place_description ?? "",
    free_or_paid: row.free_or_paid ?? "unknown",
    price_if_known: row.price_if_known ?? "",
    opening_hours: row.opening_hours ?? "",
    wheelchair_accessible: Boolean(row.wheelchair_accessible),
    step_free_access: Boolean(row.step_free_access),
    baby_changing: Boolean(row.baby_changing),
    gender_neutral: Boolean(row.gender_neutral),
    family_friendly: Boolean(row.family_friendly),
    requires_code: Boolean(row.requires_code),
    code_hint: row.code_hint ?? "",
    notes: row.notes ?? "",
    status: row.status ?? "pending_review",
    cleanliness_avg: Number(row.cleanliness_avg ?? 3.5),
    safety_avg: Number(row.safety_avg ?? 3.5),
    accessibility_avg: Number(row.accessibility_avg ?? 3.5),
    trust_score: Number(row.trust_score ?? 50),
    number_of_confirmations: Number(row.number_of_confirmations ?? 0),
    report_count: Number(row.report_count ?? 0),
    last_verified_at: row.last_verified_at ?? null,
    created_at: row.created_at ?? null,
    source: row.source ?? "user_submission",
  };
}

export function getAllBathrooms(): Bathroom[] {
  const rows = db
    .prepare(
      `
      SELECT
        id,
        name,
        latitude,
        longitude,
        address,
        place_description,
        free_or_paid,
        price_if_known,
        opening_hours,
        wheelchair_accessible,
        step_free_access,
        baby_changing,
        gender_neutral,
        family_friendly,
        requires_code,
        code_hint,
        status,
        cleanliness_avg,
        safety_avg,
        accessibility_avg,
        trust_score,
        number_of_confirmations,
        report_count,
        last_verified_at,
        created_at,
        source
      FROM bathrooms
      ORDER BY datetime(created_at) DESC, id DESC
      `
    )
    .all();

  return rows.map(normalizeBathroom);
}

export function getBathroomById(id: string): Bathroom | null {
  const row = db
    .prepare(
      `
      SELECT
        id,
        name,
        latitude,
        longitude,
        address,
        place_description,
        free_or_paid,
        price_if_known,
        opening_hours,
        wheelchair_accessible,
        step_free_access,
        baby_changing,
        gender_neutral,
        family_friendly,
        requires_code,
        code_hint,
        status,
        cleanliness_avg,
        safety_avg,
        accessibility_avg,
        trust_score,
        number_of_confirmations,
        report_count,
        last_verified_at,
        created_at,
        source
      FROM bathrooms
      WHERE id = ?
      `
    )
    .get(id);

  return row ? normalizeBathroom(row) : null;
}

export function saveBathroom(input: {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  place_description?: string;
  free_or_paid?: "free" | "paid" | "unknown";
  price_if_known?: string;
  opening_hours?: string;
  wheelchair_accessible?: boolean;
  step_free_access?: boolean;
  baby_changing?: boolean;
  gender_neutral?: boolean;
  family_friendly?: boolean;
  requires_code?: boolean;
  code_hint?: string;
  notes?: string;
}): string {
  const id = crypto.randomUUID();

  db.prepare(
    `
    INSERT INTO bathrooms (
      id,
      name,
      latitude,
      longitude,
      address,
      place_description,
      free_or_paid,
      price_if_known,
      opening_hours,
      wheelchair_accessible,
      step_free_access,
      baby_changing,
      gender_neutral,
      family_friendly,
      requires_code,
      code_hint,
      status,
      cleanliness_avg,
      safety_avg,
      accessibility_avg,
      trust_score,
      number_of_confirmations,
      report_count,
      last_verified_at,
      source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    id,
    input.name,
    input.latitude,
    input.longitude,
    input.address ?? "",
    input.place_description ?? "",
    input.free_or_paid ?? "unknown",
    input.price_if_known ?? "",
    input.opening_hours ?? "",
    input.wheelchair_accessible ? 1 : 0,
    input.step_free_access ? 1 : 0,
    input.baby_changing ? 1 : 0,
    input.gender_neutral ? 1 : 0,
    input.family_friendly ? 1 : 0,
    input.requires_code ? 1 : 0,
    input.code_hint ?? "",
    "pending_review",
    3.5,
    3.5,
    3.5,
    50,
    0,
    0,
    null,
    "user_submission"
  );

  return id;
}