-- ==============================================================================
-- CareNova Database Schema & Row Level Security (RLS)
-- Lead Architect: Aryan More
-- Compatible with Supabase PostgreSQL & Auth
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text default 'user' check (role in ('user', 'admin')),
  age integer,
  gender text check (gender in ('Male', 'Female', 'Other', 'Prefer not to say')),
  height numeric(5,2), -- cm
  weight numeric(5,2), -- kg
  blood_group text,
  activity_level text default 'Moderate',
  water_goal_glasses integer default 8,
  step_goal integer default 10000,
  sleep_goal_hours numeric(3,1) default 8.0,
  emergency_contact_name text,
  emergency_contact_phone text,
  allergies text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Water Logs
create table if not exists public.water_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  glasses integer not null default 1,
  log_date date not null default current_date,
  created_at timestamptz default now(),
  unique (user_id, log_date)
);

-- 3. Weight Logs
create table if not exists public.weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  weight numeric(5,2) not null,
  bmi numeric(4,1),
  notes text,
  log_date date not null default current_date,
  created_at timestamptz default now()
);

-- 4. Sleep Logs
create table if not exists public.sleep_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  duration_hours numeric(4,2) not null,
  quality text check (quality in ('Restful', 'Normal', 'Disturbed')),
  notes text,
  log_date date not null default current_date,
  created_at timestamptz default now()
);

-- 5. Exercise Logs
create table if not exists public.exercise_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  activity_type text not null,
  duration_minutes integer not null,
  calories_burned integer,
  intensity text check (intensity in ('Light', 'Moderate', 'Vigorous')),
  notes text,
  log_date date not null default current_date,
  created_at timestamptz default now()
);

-- 6. Step Logs
create table if not exists public.step_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  step_count integer not null,
  log_date date not null default current_date,
  created_at timestamptz default now(),
  unique (user_id, log_date)
);

-- 7. Blood Pressure Logs
create table if not exists public.blood_pressure_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  systolic integer not null,
  diastolic integer not null,
  pulse integer,
  category text,
  log_date date not null default current_date,
  created_at timestamptz default now()
);

-- 8. Blood Glucose Logs
create table if not exists public.blood_glucose_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  glucose_mg_dl integer not null,
  timing text check (timing in ('Fasting', 'Pre-Meal', 'Post-Meal', 'Bedtime')),
  notes text,
  log_date date not null default current_date,
  created_at timestamptz default now()
);

-- 9. Heart Rate Logs
create table if not exists public.heart_rate_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  bpm integer not null,
  tag text check (tag in ('Resting', 'Post-Workout', 'General')),
  log_date date not null default current_date,
  created_at timestamptz default now()
);

-- 10. Medications
create table if not exists public.medications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  dosage text not null,
  frequency text not null,
  reminder_time text,
  instructions text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 11. Medication Logs (Compliance)
create table if not exists public.medication_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  medication_id uuid references public.medications(id) on delete cascade not null,
  status text check (status in ('taken', 'skipped', 'pending')),
  log_date date not null default current_date,
  created_at timestamptz default now(),
  unique(medication_id, log_date)
);

-- 12. Health Goals
create table if not exists public.health_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category text check (category in ('Water', 'Weight', 'Steps', 'Sleep', 'Exercise', 'Other')),
  target_value numeric(8,2) not null,
  current_value numeric(8,2) default 0,
  unit text not null,
  status text default 'in_progress' check (status in ('in_progress', 'completed')),
  deadline date,
  created_at timestamptz default now()
);

-- 13. Disease Library (Dynamic Catalog)
create table if not exists public.disease_library (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  overview text not null,
  symptoms jsonb not null default '[]'::jsonb,
  causes jsonb not null default '[]'::jsonb,
  risk_factors jsonb not null default '[]'::jsonb,
  prevention jsonb not null default '[]'::jsonb,
  treatment text not null,
  emergency_signs text,
  created_at timestamptz default now()
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.water_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.sleep_logs enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.step_logs enable row level security;
alter table public.blood_pressure_logs enable row level security;
alter table public.blood_glucose_logs enable row level security;
alter table public.heart_rate_logs enable row level security;
alter table public.medications enable row level security;
alter table public.medication_logs enable row level security;
alter table public.health_goals enable row level security;
alter table public.disease_library enable row level security;

-- Helper function to check if current user is admin without recursion
create or replace function public.is_admin()
returns boolean security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql;

-- Profiles:
-- Users can read their own profile, Admins can read all profiles
drop policy if exists "Users can view own profile or admin can view all" on public.profiles;
create policy "Users can view own profile or admin can view all" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- Users can update their own profile, but cannot tamper with role or is_active
-- We can enforce that only admins can update role/is_active or manage other profiles
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Trigger to create profile automatically on auth.users signup
create or replace function public.handle_new_user()
returns trigger security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'CareNova User'),
    'user'
  )
  on conflict (id) do update
  set full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$ language plpgsql;

-- Drop trigger if already exists and rebind
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- User Isolation Policies for Logs & Trackers
drop policy if exists "User isolation policy for water_logs" on public.water_logs;
create policy "User isolation policy for water_logs" on public.water_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User isolation policy for weight_logs" on public.weight_logs;
create policy "User isolation policy for weight_logs" on public.weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User isolation policy for sleep_logs" on public.sleep_logs;
create policy "User isolation policy for sleep_logs" on public.sleep_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User isolation policy for exercise_logs" on public.exercise_logs;
create policy "User isolation policy for exercise_logs" on public.exercise_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User isolation policy for step_logs" on public.step_logs;
create policy "User isolation policy for step_logs" on public.step_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User isolation policy for blood_pressure_logs" on public.blood_pressure_logs;
create policy "User isolation policy for blood_pressure_logs" on public.blood_pressure_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User isolation policy for blood_glucose_logs" on public.blood_glucose_logs;
create policy "User isolation policy for blood_glucose_logs" on public.blood_glucose_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User isolation policy for heart_rate_logs" on public.heart_rate_logs;
create policy "User isolation policy for heart_rate_logs" on public.heart_rate_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User isolation policy for medications" on public.medications;
create policy "User isolation policy for medications" on public.medications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User isolation policy for medication_logs" on public.medication_logs;
create policy "User isolation policy for medication_logs" on public.medication_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User isolation policy for health_goals" on public.health_goals;
create policy "User isolation policy for health_goals" on public.health_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Disease Library: Everyone (authenticated or anonymous) can view; only admins can modify
drop policy if exists "Anyone can read disease library" on public.disease_library;
create policy "Anyone can read disease library" on public.disease_library
  for select using (true);

drop policy if exists "Admins can manage disease library" on public.disease_library;
create policy "Admins can manage disease library" on public.disease_library
  for all using (public.is_admin()) with check (public.is_admin());
