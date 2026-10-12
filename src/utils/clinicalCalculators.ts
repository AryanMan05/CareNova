// Clinical Formulas & Medical Classification Reference
// Lead Architect: Aryan More

import { BPCategory } from '../types/health';

/**
 * BMI = Weight (kg) / (Height (m))^2
 */
export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string; color: string } {
  if (heightCm <= 0 || weightKg <= 0) return { bmi: 0, category: 'Invalid input', color: 'text-slate-500' };
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) return { bmi, category: 'Underweight', color: 'text-amber-500' };
  if (bmi <= 24.9) return { bmi, category: 'Normal weight', color: 'text-emerald-600' };
  if (bmi <= 29.9) return { bmi, category: 'Overweight', color: 'text-amber-600' };
  return { bmi, category: 'Obese', color: 'text-rose-600' };
}

/**
 * BMR (Mifflin-St Jeor):
 * Men: BMR = (10 * W) + (6.25 * H) - (5 * A) + 5
 * Women: BMR = (10 * W) + (6.25 * H) - (5 * A) - 161
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'Male' | 'Female' | string): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 0;
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  const result = gender === 'Male' ? base + 5 : base - 161;
  return Math.round(result);
}

/**
 * TDEE Activity Multipliers:
 * Sedentary: 1.2, Light: 1.375, Moderate: 1.55, Very Active: 1.725, Extra Active: 1.9
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    Sedentary: 1.2,
    Light: 1.375,
    Moderate: 1.55,
    'Very Active': 1.725,
    'Extra Active': 1.9,
  };
  const multiplier = multipliers[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
}

/**
 * Hydration Recommendation:
 * 35 ml per kg of body weight + workout adjustment
 */
export function calculateHydrationTarget(weightKg: number, workoutMinutesDaily: number = 0): { totalMl: number; glasses: number } {
  if (weightKg <= 0) return { totalMl: 2000, glasses: 8 };
  // 35 ml / kg + 350 ml per 30 mins workout
  const baseMl = weightKg * 35;
  const workoutMl = (workoutMinutesDaily / 30) * 350;
  const totalMl = Math.round(baseMl + workoutMl);
  const glasses = Math.round(totalMl / 250);
  return { totalMl, glasses };
}

/**
 * Devine Formula for Ideal Body Weight (IBW):
 * Men: 50.0 kg + 2.3 kg * (Height in inches - 60)
 * Women: 45.5 kg + 2.3 kg * (Height in inches - 60)
 */
export function calculateDevineIBW(heightCm: number, gender: 'Male' | 'Female' | string): number {
  if (heightCm <= 0) return 0;
  const heightInches = heightCm / 2.54;
  if (heightInches < 60) {
    return Number((gender === 'Male' ? 50.0 : 45.5).toFixed(1));
  }
  const inchesOver60 = heightInches - 60;
  const base = gender === 'Male' ? 50.0 : 45.5;
  return Number((base + (2.3 * inchesOver60)).toFixed(1));
}

/**
 * Tanaka Equation for Max Heart Rate:
 * HRmax = 208 - (0.7 * Age)
 * Fat Burn: 50-70%
 * Cardio: 70-85%
 * Peak: 85-100%
 */
export function calculateTanakaHeartZones(age: number): {
  maxHR: number;
  fatBurn: [number, number];
  cardio: [number, number];
  peak: [number, number];
} {
  const safeAge = Math.max(10, Math.min(100, age || 25));
  const maxHR = Math.round(208 - (0.7 * safeAge));
  return {
    maxHR,
    fatBurn: [Math.round(maxHR * 0.50), Math.round(maxHR * 0.70)],
    cardio: [Math.round(maxHR * 0.70), Math.round(maxHR * 0.85)],
    peak: [Math.round(maxHR * 0.85), maxHR],
  };
}

/**
 * AHA Blood Pressure Classification:
 * Normal: < 120 and < 80
 * Elevated: 120–129 and < 80
 * Hypertension Stage 1: 130–139 or 80–89
 * Hypertension Stage 2: >= 140 or >= 90
 * Hypertensive Crisis: > 180 and/or > 120
 */
export function classifyBloodPressure(systolic: number, diastolic: number): {
  category: BPCategory;
  color: string;
  badgeClass: string;
  isCrisis: boolean;
} {
  if (systolic > 180 || diastolic > 120) {
    return {
      category: 'Hypertensive Crisis',
      color: 'text-rose-600',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
      isCrisis: true,
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'Hypertension Stage 2',
      color: 'text-red-600',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      isCrisis: false,
    };
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      category: 'Hypertension Stage 1',
      color: 'text-amber-600',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      isCrisis: false,
    };
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      category: 'Elevated',
      color: 'text-yellow-600',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      isCrisis: false,
    };
  }
  return {
    category: 'Normal',
    color: 'text-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    isCrisis: false,
  };
}

/**
 * ADA Blood Glucose Targets:
 * Fasting/Pre-Meal: 80 - 130 mg/dL normal
 * Post-Meal (< 2 hrs): < 180 mg/dL normal
 * Bedtime: 100 - 140 mg/dL normal
 */
export function classifyBloodGlucose(glucoseMgDl: number, timing: string = 'Fasting'): {
  status: 'Low' | 'Target' | 'Elevated' | 'High';
  color: string;
  badgeClass: string;
} {
  if (glucoseMgDl < 70) {
    return { status: 'Low', color: 'text-red-600', badgeClass: 'bg-red-100 text-red-800 border-red-300' };
  }
  
  if (timing === 'Post-Meal') {
    if (glucoseMgDl <= 140) return { status: 'Target', color: 'text-emerald-600', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (glucoseMgDl <= 180) return { status: 'Elevated', color: 'text-amber-600', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { status: 'High', color: 'text-rose-600', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' };
  }

  // Fasting or Pre-Meal default
  if (glucoseMgDl >= 70 && glucoseMgDl <= 99) {
    return { status: 'Target', color: 'text-emerald-600', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  }
  if (glucoseMgDl >= 100 && glucoseMgDl <= 125) {
    return { status: 'Elevated', color: 'text-amber-600', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' };
  }
  return { status: 'High', color: 'text-rose-600', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' };
}
