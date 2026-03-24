-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- MOLECULES TABLE
-- Stores molecules as a list of atoms with 3D coordinates.
-- is_universal = true  → available to all authenticated users
-- is_universal = false → belongs to a specific user (user_id)
-- ============================================================
create table if not exists public.molecules (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  description  text,
  -- atoms stored as JSONB array: [{type: 'C', x: 0.0, y: 0.0, z: 0.0}, ...]
  atoms        jsonb not null default '[]'::jsonb,
  is_universal boolean not null default false,
  user_id      uuid references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),

  -- a molecule must be either universal (no owner) or owned by a user
  constraint molecule_ownership check (
    (is_universal = true and user_id is null) or
    (is_universal = false and user_id is not null)
  )
);

-- Index for fast per-user queries
create index if not exists molecules_user_id_idx on public.molecules(user_id);
-- Index for fetching universal molecules
create index if not exists molecules_universal_idx  on public.molecules(is_universal) where is_universal = true;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.molecules enable row level security;

-- Authenticated users can read universal molecules
create policy "universal molecules are readable by all authenticated users"
  on public.molecules
  for select
  to authenticated
  using (is_universal = true);

-- Users can read their own molecules
create policy "users can read own molecules"
  on public.molecules
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can insert their own molecules
create policy "users can insert own molecules"
  on public.molecules
  for insert
  to authenticated
  with check (auth.uid() = user_id and is_universal = false);

-- Users can update their own molecules
create policy "users can update own molecules"
  on public.molecules
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and is_universal = false);

-- Users can delete their own molecules
create policy "users can delete own molecules"
  on public.molecules
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Service role can manage all molecules (for seeding universal molecules)
create policy "service role has full access"
  on public.molecules
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- SEED: UNIVERSAL MOLECULES
-- Methane (CH4) at approximate bond geometry (Angstroms)
-- ============================================================
insert into public.molecules (name, description, is_universal, user_id, atoms)
values (
  'Methane',
  'CH₄ — simplest alkane. Universal reference molecule.',
  true,
  null,
  '[
    {"type": "C",  "x":  0.000,  "y":  0.000,  "z":  0.000},
    {"type": "H",  "x":  0.629,  "y":  0.629,  "z":  0.629},
    {"type": "H",  "x": -0.629,  "y": -0.629,  "z":  0.629},
    {"type": "H",  "x": -0.629,  "y":  0.629,  "z": -0.629},
    {"type": "H",  "x":  0.629,  "y": -0.629,  "z": -0.629}
  ]'::jsonb
);
