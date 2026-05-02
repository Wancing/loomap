create table if not exists bathrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  place_description text,
  free_or_paid text check (free_or_paid in ('free', 'paid', 'unknown')) default 'unknown',
  price_if_known text,
  opening_hours text,
  wheelchair_accessible boolean default false,
  step_free_access boolean default false,
  baby_changing boolean default false,
  gender_neutral boolean default false,
  family_friendly boolean default false,
  requires_code boolean default false,
  code_hint text,
  status text check (status in ('open', 'closed', 'uncertain', 'pending_review', 'under_review')) default 'pending_review',
  cleanliness_avg numeric(3,2) default 0,
  safety_avg numeric(3,2) default 0,
  accessibility_avg numeric(3,2) default 0,
  trust_score integer default 0,
  number_of_confirmations integer default 0,
  report_count integer default 0,
  last_verified_at timestamptz,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  avatar_url text,
  role text check (role in ('user', 'moderator', 'admin')) default 'user',
  reputation_score integer default 0,
  contribution_count integer default 0,
  verification_count integer default 0,
  joined_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  bathroom_id uuid references bathrooms(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  cleanliness_rating integer check (cleanliness_rating between 1 and 5),
  safety_rating integer check (safety_rating between 1 and 5),
  accessibility_rating integer check (accessibility_rating between 1 and 5),
  note text,
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  bathroom_id uuid references bathrooms(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  type text not null,
  description text,
  status text check (status in ('open', 'reviewing', 'resolved', 'rejected')) default 'open',
  created_at timestamptz default now(),
  reviewed_by uuid,
  reviewed_at timestamptz
);

create table if not exists edits (
  id uuid primary key default gen_random_uuid(),
  bathroom_id uuid references bathrooms(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  payload jsonb not null,
  status text check (status in ('pending', 'approved', 'rejected', 'merged')) default 'pending',
  duplicate_candidate_id uuid,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  bathroom_id uuid references bathrooms(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  image_url text not null,
  caption text,
  created_at timestamptz default now()
);

create table if not exists reputation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  event_type text not null,
  points integer not null default 0,
  reference_id uuid,
  created_at timestamptz default now()
);