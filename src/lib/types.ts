export type BathroomStatus = "open" | "closed" | "uncertain" | "pending";
export type BathroomAccess = "free" | "paid";

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
  address: string;
  free_or_paid: BathroomAccess;
  price_if_known?: string;
  opening_hours?: string;
  wheelchair_accessible: boolean;
  step_free_access: boolean;
  baby_changing: boolean;
  gender_neutral: boolean;
  requires_code: boolean;
  safety_rating: number;
  cleanliness_rating: number;
  accessibility_rating: number;
  notes?: string;
  photos: BathroomPhoto[];
  status: BathroomStatus;
  last_verified_at?: string;
  created_by?: string;
  trust_score: number;
  number_of_confirmations: number;
  report_count: number;
  created_at: string;
  updated_at: string;
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