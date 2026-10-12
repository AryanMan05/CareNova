// CareNova Type Definitions
// Lead Architect: Aryan More

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  age?: number | null;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | null;
  height?: number | null; // cm
  weight?: number | null; // kg
  blood_group?: string | null;
  activity_level?: string | null;
  water_goal_glasses?: number;
  step_goal?: number;
  sleep_goal_hours?: number;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  allergies?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  glasses: number;
  log_date: string;
  created_at?: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight: number;
  bmi?: number | null;
  notes?: string | null;
  log_date: string;
  created_at?: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  duration_hours: number;
  quality?: 'Restful' | 'Normal' | 'Disturbed' | null;
  notes?: string | null;
  log_date: string;
  created_at?: string;
}

export interface ExerciseLog {
  id: string;
  user_id: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned?: number | null;
  intensity?: 'Light' | 'Moderate' | 'Vigorous' | null;
  notes?: string | null;
  log_date: string;
  created_at?: string;
}

export interface StepLog {
  id: string;
  user_id: string;
  step_count: number;
  log_date: string;
  created_at?: string;
}

export type BPCategory = 'Normal' | 'Elevated' | 'Hypertension Stage 1' | 'Hypertension Stage 2' | 'Hypertensive Crisis';

export interface BloodPressureLog {
  id: string;
  user_id: string;
  systolic: number;
  diastolic: number;
  pulse?: number | null;
  category?: BPCategory | string;
  log_date: string;
  created_at?: string;
}

export interface BloodGlucoseLog {
  id: string;
  user_id: string;
  glucose_mg_dl: number;
  timing?: 'Fasting' | 'Pre-Meal' | 'Post-Meal' | 'Bedtime' | null;
  notes?: string | null;
  log_date: string;
  created_at?: string;
}

export interface HeartRateLog {
  id: string;
  user_id: string;
  bpm: number;
  tag?: 'Resting' | 'Post-Workout' | 'General' | null;
  log_date: string;
  created_at?: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  reminder_time?: string | null;
  instructions?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface MedicationLog {
  id: string;
  user_id: string;
  medication_id: string;
  status: 'taken' | 'skipped' | 'pending';
  log_date: string;
  created_at?: string;
}

export interface HealthGoal {
  id: string;
  user_id: string;
  title: string;
  category: 'Water' | 'Weight' | 'Steps' | 'Sleep' | 'Exercise' | 'Other';
  target_value: number;
  current_value: number;
  unit: string;
  status: 'in_progress' | 'completed';
  deadline?: string | null;
  created_at?: string;
}

export interface DiseaseLibraryItem {
  id: string;
  title: string;
  category: string;
  overview: string;
  symptoms: string[];
  causes: string[];
  risk_factors: string[];
  prevention: string[];
  treatment: string;
  emergency_signs?: string | null;
  created_at?: string;
}
