export type BathroomStatus = "open" | "closed" | "uncertain" | "pending_review";
export type FreeOrPaid = "free" | "paid" | "unknown";

export type BathroomPhoto = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  uploadedAt: string;
};

export type Bathroom = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  place_description?: string;
  free_or_paid: FreeOrPaid;
  price_if_known?: string;
  opening_hours?: string;
  wheelchair_accessible: boolean;
  step_free_access: boolean;
  baby_changing: boolean;
  gender_neutral: boolean;
  family_friendly: boolean;
  requires_code: boolean;
  code_hint?: string;
  status: BathroomStatus;
  cleanliness_avg: number;
  safety_avg: number;
  accessibility_avg: number;
  trust_score: number;
  number_of_confirmations: number;
  report_count: number;
  last_verified_at?: string;
  created_at: string;
  photos: BathroomPhoto[];
};

export type ActivityItem = {
  id: string;
  type: "added" | "verified" | "edited" | "reported";
  bathroomId: string;
  bathroomName: string;
  createdAt: string;
  userName?: string;
  confirmations?: number;
};