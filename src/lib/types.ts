export type BathroomStatus =
  | "open"
  | "closed"
  | "uncertain"
  | "pending_review";

export type BathroomAccess = "free" | "paid" | "unknown";

export type Bathroom = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  place_description?: string;
  free_or_paid: BathroomAccess;
  price_if_known?: string;
  opening_hours?: string;
  wheelchair_accessible: boolean;
  step_free_access: boolean;
  baby_changing: boolean;
  gender_neutral: boolean;
  family_friendly: boolean;
  requires_code: boolean;
  code_hint?: string;
  notes?: string;
  status: BathroomStatus;
  cleanliness_avg: number;
  safety_avg: number;
  accessibility_avg: number;
  trust_score: number;
  number_of_confirmations: number;
  report_count: number;
  last_verified_at?: string | null;
  created_at?: string | null;
  source?: string;
};