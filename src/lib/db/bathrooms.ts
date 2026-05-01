import db from "./init";
import type { Bathroom } from "../types";

db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bathrooms'").get();

function rowToBathroom(row: any): Bathroom {
  return {
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address,
    place_description: row.place_description,
    free_or_paid: row.free_or_paid,
    price_if_known: row.price_if_known,
    opening_hours: row.opening_hours,
    wheelchair_accessible: Boolean(row.wheelchair_accessible),
    step_free_access: Boolean(row.step_free_access),
    baby_changing: Boolean(row.baby_changing),
    gender_neutral: Boolean(row.gender_neutral),
    family_friendly: Boolean(row.family_friendly),
    requires_code: Boolean(row.requires_code),
    code_hint: row.code_hint,
    status: row.status,
    cleanliness_avg: row.cleanliness_avg ?? 3.5,
    safety_avg: row.safety_avg ?? 3.5,
    accessibility_avg: row.accessibility_avg ?? 3.5,
    trust_score: row.trust_score ?? 50,
    number_of_confirmations: row.number_of_confirmations ?? 0,
    report_count: row.report_count ?? 0,
    last_verified_at: row.last_verified_at,
    created_at: row.created_at,
    photos: [],
  };
}

export function saveBathroom(data: {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  place_description: string;
  free_or_paid: string;
  price_if_known: string;
  opening_hours: string;
  wheelchair_accessible: boolean;
  step_free_access: boolean;
  baby_changing: boolean;
  gender_neutral: boolean;
  family_friendly: boolean;
  requires_code: boolean;
  code_hint: string;
}) {
  const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const stmt = db.prepare(`
    INSERT INTO bathrooms (
      id, name, latitude, longitude, address, place_description,
      free_or_paid, price_if_known, opening_hours,
      wheelchair_accessible, step_free_access, baby_changing,
      gender_neutral, family_friendly, requires_code, code_hint,
      status, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', 'user_submission')
  `);

  stmt.run(
    id,
    data.name,
    data.latitude,
    data.longitude,
    data.address || null,
    data.place_description || null,
    data.free_or_paid,
    data.price_if_known || null,
    data.opening_hours || null,
    data.wheelchair_accessible ? 1 : 0,
    data.step_free_access ? 1 : 0,
    data.baby_changing ? 1 : 0,
    data.gender_neutral ? 1 : 0,
    data.family_friendly ? 1 : 0,
    data.requires_code ? 1 : 0,
    data.code_hint || null
  );

  return id;
}

export function getAllBathrooms(): Bathroom[] {
  const rows = db
    .prepare(
      `SELECT * FROM bathrooms WHERE status != 'rejected' ORDER BY created_at DESC`
    )
    .all() as any[];

  return rows.map(rowToBathroom);
}

export function getBathroomById(id: string): Bathroom | null {
  const row = db
    .prepare("SELECT * FROM bathrooms WHERE id = ?")
    .get(id) as any;

  return row ? rowToBathroom(row) : null;
}