// Health Data Context & Full CRUD Operations Engine
// Connects to all 8 trackers + Medications + Goals + Disease Library
// Lead Architect: Aryan More

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  WaterLog,
  WeightLog,
  SleepLog,
  ExerciseLog,
  StepLog,
  BloodPressureLog,
  BloodGlucoseLog,
  HeartRateLog,
  Medication,
  MedicationLog,
  HealthGoal,
  DiseaseLibraryItem,
} from '../types/health';
import { classifyBloodPressure, calculateBMI } from '../utils/clinicalCalculators';

// Comprehensive initial mock data for seamless first run and offline demonstration
const INITIAL_DISEASE_LIBRARY: DiseaseLibraryItem[] = [
  {
    id: 'dl-1',
    title: 'Essential Hypertension',
    category: 'Cardiology',
    overview: 'A chronic medical condition in which systemic arterial blood pressure is persistently elevated above 130/80 mmHg without identifiable secondary causes.',
    symptoms: ['Often asymptomatic ("silent killer")', 'Morning occipital headaches', 'Dizziness', 'Shortness of breath', 'Visual disturbances'],
    causes: ['Vascular stiffness', 'Excessive dietary sodium', 'Renal sodium retention', 'Genetic predisposition', 'Sympathetic nervous system hyperactivity'],
    risk_factors: ['Sedentary lifestyle', 'Obesity', 'Age > 45', 'Tobacco usage', 'High alcohol intake', 'Chronic stress'],
    prevention: ['DASH diet (rich in fruits, vegetables, low-fat dairy)', 'Aerobic exercise >= 150 mins/week', 'Sodium intake < 2,300 mg/day', 'Weight management'],
    treatment: 'Lifestyle modification combined with ACE inhibitors (e.g. Enalapril), ARBs (Losartan), Calcium channel blockers (Amlodipine), or Thiazides.',
    emergency_signs: 'Hypertensive Crisis: BP > 180/120 with chest pain, shortness of breath, blurry vision, or neurological deficits. Call 112/108 immediately.',
  },
  {
    id: 'dl-2',
    title: 'Type 2 Diabetes Mellitus',
    category: 'Endocrinology',
    overview: 'A progressive metabolic disorder characterized by peripheral insulin resistance and progressive pancreatic beta-cell secretory defect leading to persistent hyperglycemia.',
    symptoms: ['Polyuria (excessive urination)', 'Polydipsia (increased thirst)', 'Polyphagia (unexplained hunger)', 'Unintended weight loss', 'Fatigue', 'Slow-healing sores'],
    causes: ['Insulin resistance in muscle, liver, and adipose tissues', 'Hepatic gluconeogenesis dysregulation', 'Genetic susceptibility'],
    risk_factors: ['BMI >= 25', 'Physical inactivity', 'First-degree relative with T2D', 'History of gestational diabetes', 'Polycystic ovary syndrome (PCOS)'],
    prevention: ['Moderate weight loss (5-7% body weight)', 'Mediterranean or low-glycemic diet', 'Routine blood glucose screening'],
    treatment: 'Metformin as foundational pharmacotherapy, lifestyle management, GLP-1 receptor agonists, SGLT-2 inhibitors, and insulin when indicated.',
    emergency_signs: 'Severe hyperglycemia (> 300 mg/dL) with confusion, fruity breath odor (DKA), or severe hypoglycemia (< 55 mg/dL) causing seizure or unconsciousness.',
  },
  {
    id: 'dl-3',
    title: 'Asthma & Reactive Airway Disease',
    category: 'Pulmonology',
    overview: 'A heterogeneous chronic respiratory condition characterized by hyper-responsive airway inflammation and variable expiratory airflow limitation.',
    symptoms: ['Wheezing on expiration', 'Dry or productive nocturnal cough', 'Shortness of breath', 'Chest tightness'],
    causes: ['Airway hyperresponsiveness to allergens, viral respiratory infections, cold air, or physical exertion.'],
    risk_factors: ['Atopic family history', 'Allergic rhinitis', 'Childhood viral bronchitis', 'Tobacco smoke exposure', 'Occupational dust exposure'],
    prevention: ['Avoidance of known allergens and smoke', 'Annual influenza vaccination', 'Consistent controller inhaler adherence'],
    treatment: 'Inhaled corticosteroids (Budesonide, Fluticasone) with long-acting beta-agonists (Formoterol) and short-acting beta-agonists (Albuterol) for acute rescue.',
    emergency_signs: 'Severe wheezing unresponsive to rescue inhaler, inability to speak in full sentences, cyanosis (blue lips/fingernails), chest retractions. Seek emergency care 112.',
  },
  {
    id: 'dl-4',
    title: 'Major Depressive Disorder & Anxiety',
    category: 'Mental Health',
    overview: 'Common but serious mood and affective disorders that negatively affect cognition, mood regulation, physical energy, and daily functioning.',
    symptoms: ['Persistent feelings of sadness or emptiness', 'Loss of interest in hobbies (anhedonia)', 'Sleep disruption', 'Fatigue', 'Difficulty concentrating'],
    causes: ['Neurochemical dysregulation (serotonin, norepinephrine, dopamine)', 'Genetic predisposition', 'Major life stressors and trauma'],
    risk_factors: ['Family history of affective disorders', 'Chronic medical conditions', 'Lack of social support', 'Substance misuse'],
    prevention: ['Cognitive behavioral self-care', 'Regular physical exercise', 'Mindfulness meditation', 'Consistent sleep hygiene'],
    treatment: 'Psychotherapy (CBT), selective serotonin reuptake inhibitors (SSRIs), lifestyle interventions, and social support systems.',
    emergency_signs: 'Acute thoughts of self-harm or suicide. Immediately dial KIRAN Helpline (1800-599-0019) or National Emergency 112.',
  },
  {
    id: 'dl-5',
    title: 'Coronary Artery Disease (CAD)',
    category: 'Cardiology',
    overview: 'Pathological narrowing or occlusion of the coronary arteries caused by atheromatous plaque accumulation, reducing myocardial oxygen supply.',
    symptoms: ['Angina pectoris (chest tightness/pressure)', 'Pain radiating to neck, jaw, left shoulder, or back', 'Exertional dyspnea', 'Unexplained fatigue'],
    causes: ['Atherosclerosis triggered by chronic endothelial inflammation, elevated LDL cholesterol, and oxidative stress.'],
    risk_factors: ['Smoking', 'Hypertension', 'Dyslipidemia', 'Diabetes mellitus', 'Family history of premature CAD'],
    prevention: ['Cardiac-healthy nutrition (olive oil, fish, oats)', 'Smoking cessation', 'Statin therapy for hyperlipidemia', 'Routine aerobic exercise'],
    treatment: 'Antiplatelet agents (Aspirin, Clopidogrel), beta-blockers, statins, ACE inhibitors, and percutaneous coronary intervention (PCI/stenting) when indicated.',
    emergency_signs: 'Crushing central chest pain lasting > 5 minutes, diaphoresis (cold sweats), nausea, syncope. Call 112 / 108 immediately.',
  },
  {
    id: 'dl-6',
    title: 'Gastroesophageal Reflux Disease (GERD)',
    category: 'Gastroenterology',
    overview: 'A digestive disorder where stomach acid or bile irritates the mucosal lining of the esophagus due to transient lower esophageal sphincter relaxation.',
    symptoms: ['Retrosternal heartburn', 'Acid regurgitation', 'Dysphagia', 'Chronic dry cough', 'Globus sensation in throat'],
    causes: ['Lower esophageal sphincter dysfunction', 'Hiatal hernia', 'Delayed gastric emptying', 'Increased intra-abdominal pressure'],
    risk_factors: ['Obesity', 'Late-night eating', 'Caffeine, chocolate, fatty meals', 'Pregnancy', 'Smoking'],
    prevention: ['Elevating bed head 6 inches', 'Avoiding food 3 hours prior to lying down', 'Small frequent meals'],
    treatment: 'Proton Pump Inhibitors (Omeprazole, Pantoprazole), H2-receptor antagonists, antacids, and lifestyle modifications.',
    emergency_signs: 'Dysphagia with food impaction, vomiting blood, black tarry stools, or pain mimicking myocardial infarction.',
  },
];

interface HealthDataContextType {
  // Tracker State
  waterLogs: WaterLog[];
  weightLogs: WeightLog[];
  sleepLogs: SleepLog[];
  exerciseLogs: ExerciseLog[];
  stepLogs: StepLog[];
  bloodPressureLogs: BloodPressureLog[];
  bloodGlucoseLogs: BloodGlucoseLog[];
  heartRateLogs: HeartRateLog[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  healthGoals: HealthGoal[];
  diseaseLibrary: DiseaseLibraryItem[];
  loading: boolean;

  // Trackers CRUD
  logWater: (glassesChange: number) => Promise<void>;
  addWeightLog: (weight: number, notes?: string) => Promise<void>;
  deleteWeightLog: (id: string) => Promise<void>;
  addSleepLog: (durationHours: number, quality: 'Restful' | 'Normal' | 'Disturbed', notes?: string) => Promise<void>;
  deleteSleepLog: (id: string) => Promise<void>;
  addExerciseLog: (type: string, minutes: number, calories?: number, intensity?: 'Light' | 'Moderate' | 'Vigorous', notes?: string) => Promise<void>;
  deleteExerciseLog: (id: string) => Promise<void>;
  addStepLog: (stepCount: number) => Promise<void>;
  addBloodPressureLog: (systolic: number, diastolic: number, pulse?: number) => Promise<void>;
  deleteBloodPressureLog: (id: string) => Promise<void>;
  addBloodGlucoseLog: (glucose: number, timing: 'Fasting' | 'Pre-Meal' | 'Post-Meal' | 'Bedtime', notes?: string) => Promise<void>;
  deleteBloodGlucoseLog: (id: string) => Promise<void>;
  addHeartRateLog: (bpm: number, tag: 'Resting' | 'Post-Workout' | 'General') => Promise<void>;
  deleteHeartRateLog: (id: string) => Promise<void>;

  // Medications CRUD
  addMedication: (med: Omit<Medication, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  toggleMedicationLog: (medicationId: string, status: 'taken' | 'skipped') => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;

  // Goals CRUD
  addGoal: (goal: Omit<HealthGoal, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateGoalProgress: (id: string, currentValue: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Disease Library (Admin CRUD)
  addDiseaseItem: (item: Omit<DiseaseLibraryItem, 'id' | 'created_at'>) => Promise<void>;
  updateDiseaseItem: (id: string, item: Partial<DiseaseLibraryItem>) => Promise<void>;
  deleteDiseaseItem: (id: string) => Promise<void>;

  // Helpers
  getTodayWaterGlasses: () => number;
  getLatestWeight: () => WeightLog | null;
  getTodaySteps: () => number;
  getLatestBloodPressure: () => BloodPressureLog | null;
  getLatestGlucose: () => BloodGlucoseLog | null;
  getLatestHeartRate: () => HeartRateLog | null;
  getMedicationAdherenceRate: () => number;
  refreshData: () => Promise<void>;
}

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isDemoMode } = useAuth();

  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [stepLogs, setStepLogs] = useState<StepLog[]>([]);
  const [bloodPressureLogs, setBloodPressureLogs] = useState<BloodPressureLog[]>([]);
  const [bloodGlucoseLogs, setBloodGlucoseLogs] = useState<BloodGlucoseLog[]>([]);
  const [heartRateLogs, setHeartRateLogs] = useState<HeartRateLog[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [diseaseLibrary, setDiseaseLibrary] = useState<DiseaseLibraryItem[]>(INITIAL_DISEASE_LIBRARY);
  const [loading, setLoading] = useState<boolean>(true);

  const todayStr = new Date().toISOString().split('T')[0];

  // Load Seed / Cached data for Demo mode
  const loadDemoData = () => {
    const defaultUserId = user?.id || 'demo-user-aryan';
    const sampleWater: WaterLog[] = [
      { id: 'w-1', user_id: defaultUserId, glasses: 6, log_date: todayStr },
      { id: 'w-2', user_id: defaultUserId, glasses: 8, log_date: '2026-10-11' },
      { id: 'w-3', user_id: defaultUserId, glasses: 7, log_date: '2026-10-10' },
      { id: 'w-4', user_id: defaultUserId, glasses: 9, log_date: '2026-10-09' },
      { id: 'w-5', user_id: defaultUserId, glasses: 8, log_date: '2026-10-08' },
    ];
    const sampleWeight: WeightLog[] = [
      { id: 'wt-1', user_id: defaultUserId, weight: 70.2, bmi: 22.9, notes: 'Morning weigh-in', log_date: todayStr },
      { id: 'wt-2', user_id: defaultUserId, weight: 70.5, bmi: 23.0, notes: 'Post run', log_date: '2026-10-10' },
      { id: 'wt-3', user_id: defaultUserId, weight: 70.8, bmi: 23.1, notes: 'Standard', log_date: '2026-10-07' },
      { id: 'wt-4', user_id: defaultUserId, weight: 71.2, bmi: 23.2, notes: 'Weekly check', log_date: '2026-10-01' },
    ];
    const sampleSleep: SleepLog[] = [
      { id: 'sl-1', user_id: defaultUserId, duration_hours: 7.5, quality: 'Restful', notes: 'Slept soundly', log_date: todayStr },
      { id: 'sl-2', user_id: defaultUserId, duration_hours: 6.8, quality: 'Normal', notes: 'Woke once', log_date: '2026-10-11' },
      { id: 'sl-3', user_id: defaultUserId, duration_hours: 8.0, quality: 'Restful', notes: 'Weekend rest', log_date: '2026-10-10' },
    ];
    const sampleExercise: ExerciseLog[] = [
      { id: 'ex-1', user_id: defaultUserId, activity_type: 'Running', duration_minutes: 30, calories_burned: 280, intensity: 'Moderate', log_date: todayStr },
      { id: 'ex-2', user_id: defaultUserId, activity_type: 'Yoga', duration_minutes: 45, calories_burned: 150, intensity: 'Light', log_date: '2026-10-11' },
      { id: 'ex-3', user_id: defaultUserId, activity_type: 'Cycling', duration_minutes: 40, calories_burned: 320, intensity: 'Vigorous', log_date: '2026-10-09' },
    ];
    const sampleSteps: StepLog[] = [
      { id: 'st-1', user_id: defaultUserId, step_count: 8450, log_date: todayStr },
      { id: 'st-2', user_id: defaultUserId, step_count: 10240, log_date: '2026-10-11' },
      { id: 'st-3', user_id: defaultUserId, step_count: 9150, log_date: '2026-10-10' },
    ];
    const sampleBP: BloodPressureLog[] = [
      { id: 'bp-1', user_id: defaultUserId, systolic: 118, diastolic: 76, pulse: 72, category: 'Normal', log_date: todayStr },
      { id: 'bp-2', user_id: defaultUserId, systolic: 122, diastolic: 78, pulse: 74, category: 'Elevated', log_date: '2026-10-10' },
      { id: 'bp-3', user_id: defaultUserId, systolic: 116, diastolic: 74, pulse: 70, category: 'Normal', log_date: '2026-10-08' },
    ];
    const sampleGlucose: BloodGlucoseLog[] = [
      { id: 'bg-1', user_id: defaultUserId, glucose_mg_dl: 92, timing: 'Fasting', notes: 'Morning fasting test', log_date: todayStr },
      { id: 'bg-2', user_id: defaultUserId, glucose_mg_dl: 128, timing: 'Post-Meal', notes: '2h post lunch', log_date: '2026-10-11' },
    ];
    const sampleHR: HeartRateLog[] = [
      { id: 'hr-1', user_id: defaultUserId, bpm: 68, tag: 'Resting', log_date: todayStr },
      { id: 'hr-2', user_id: defaultUserId, bpm: 135, tag: 'Post-Workout', log_date: '2026-10-11' },
    ];
    const sampleMeds: Medication[] = [
      { id: 'm-1', user_id: defaultUserId, name: 'Vitamin D3 & K2', dosage: '2000 IU', frequency: 'Once daily', reminder_time: '09:00', instructions: 'Take with morning meal' },
      { id: 'm-2', user_id: defaultUserId, name: 'Omega-3 Fish Oil', dosage: '1000 mg', frequency: 'Once daily', reminder_time: '13:00', instructions: 'Take after lunch' },
      { id: 'm-3', user_id: defaultUserId, name: 'Magnesium Glycinate', dosage: '200 mg', frequency: 'Once daily (Night)', reminder_time: '21:30', instructions: 'Take 30 mins before sleep' },
    ];
    const sampleMedLogs: MedicationLog[] = [
      { id: 'ml-1', user_id: defaultUserId, medication_id: 'm-1', status: 'taken', log_date: todayStr },
      { id: 'ml-2', user_id: defaultUserId, medication_id: 'm-2', status: 'taken', log_date: todayStr },
    ];
    const sampleGoals: HealthGoal[] = [
      { id: 'g-1', user_id: defaultUserId, title: 'Daily Hydration Target', category: 'Water', target_value: 8, current_value: 6, unit: 'glasses', status: 'in_progress' },
      { id: 'g-2', user_id: defaultUserId, title: 'Target Weight Maintenance', category: 'Weight', target_value: 70, current_value: 70.2, unit: 'kg', status: 'in_progress' },
      { id: 'g-3', user_id: defaultUserId, title: 'Daily Step Goal', category: 'Steps', target_value: 10000, current_value: 8450, unit: 'steps', status: 'in_progress' },
      { id: 'g-4', user_id: defaultUserId, title: 'Nightly Sleep Target', category: 'Sleep', target_value: 8.0, current_value: 7.5, unit: 'hours', status: 'in_progress' },
    ];

    setWaterLogs(sampleWater);
    setWeightLogs(sampleWeight);
    setSleepLogs(sampleSleep);
    setExerciseLogs(sampleExercise);
    setStepLogs(sampleSteps);
    setBloodPressureLogs(sampleBP);
    setBloodGlucoseLogs(sampleGlucose);
    setHeartRateLogs(sampleHR);
    setMedications(sampleMeds);
    setMedicationLogs(sampleMedLogs);
    setHealthGoals(sampleGoals);
  };

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (isDemoMode) {
      loadDemoData();
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [
        waterRes,
        weightRes,
        sleepRes,
        exerciseRes,
        stepRes,
        bpRes,
        bgRes,
        hrRes,
        medRes,
        medLogRes,
        goalRes,
        diseaseRes,
      ] = await Promise.all([
        supabase.from('water_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }),
        supabase.from('weight_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }),
        supabase.from('sleep_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }),
        supabase.from('exercise_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }),
        supabase.from('step_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }),
        supabase.from('blood_pressure_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }),
        supabase.from('blood_glucose_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }),
        supabase.from('heart_rate_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }),
        supabase.from('medications').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('medication_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }),
        supabase.from('health_goals').select('*').eq('user_id', user.id),
        supabase.from('disease_library').select('*'),
      ]);

      if (waterRes.data) setWaterLogs(waterRes.data);
      if (weightRes.data) setWeightLogs(weightRes.data);
      if (sleepRes.data) setSleepLogs(sleepRes.data);
      if (exerciseRes.data) setExerciseLogs(exerciseRes.data);
      if (stepRes.data) setStepLogs(stepRes.data);
      if (bpRes.data) setBloodPressureLogs(bpRes.data);
      if (bgRes.data) setBloodGlucoseLogs(bgRes.data);
      if (hrRes.data) setHeartRateLogs(hrRes.data);
      if (medRes.data) setMedications(medRes.data);
      if (medLogRes.data) setMedicationLogs(medLogRes.data);
      if (goalRes.data) setHealthGoals(goalRes.data);
      if (diseaseRes.data && diseaseRes.data.length > 0) {
        setDiseaseLibrary(diseaseRes.data);
      }
    } catch (err) {
      console.error('Error fetching health telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, isDemoMode]);

  // 1-Click Quick Water Logger
  const logWater = async (glassesDelta: number) => {
    if (!user) return;
    const current = getTodayWaterGlasses();
    const newCount = Math.max(0, current + glassesDelta);

    if (isDemoMode) {
      const existingIdx = waterLogs.findIndex((w) => w.log_date === todayStr);
      if (existingIdx >= 0) {
        const updated = [...waterLogs];
        updated[existingIdx].glasses = newCount;
        setWaterLogs(updated);
      } else {
        const newRecord: WaterLog = {
          id: `w-${Date.now()}`,
          user_id: user.id,
          glasses: newCount,
          log_date: todayStr,
        };
        setWaterLogs([newRecord, ...waterLogs]);
      }
      return;
    }

    const { error } = await supabase.from('water_logs').upsert(
      {
        user_id: user.id,
        glasses: newCount,
        log_date: todayStr,
      },
      { onConflict: 'user_id,log_date' }
    );
    if (!error) fetchData();
  };

  // Weight Logging
  const addWeightLog = async (weight: number, notes?: string) => {
    if (!user) return;
    const height = profile?.height || 175;
    const { bmi } = calculateBMI(weight, height);

    if (isDemoMode) {
      const newEntry: WeightLog = {
        id: `wt-${Date.now()}`,
        user_id: user.id,
        weight,
        bmi,
        notes: notes || '',
        log_date: todayStr,
      };
      setWeightLogs([newEntry, ...weightLogs]);
      return;
    }

    const { error } = await supabase.from('weight_logs').insert({
      user_id: user.id,
      weight,
      bmi,
      notes,
      log_date: todayStr,
    });
    if (!error) fetchData();
  };

  const deleteWeightLog = async (id: string) => {
    if (isDemoMode) {
      setWeightLogs(weightLogs.filter((w) => w.id !== id));
      return;
    }
    const { error } = await supabase.from('weight_logs').delete().eq('id', id);
    if (!error) fetchData();
  };

  // Sleep Logging
  const addSleepLog = async (durationHours: number, quality: 'Restful' | 'Normal' | 'Disturbed', notes?: string) => {
    if (!user) return;
    if (isDemoMode) {
      const newEntry: SleepLog = {
        id: `sl-${Date.now()}`,
        user_id: user.id,
        duration_hours: durationHours,
        quality,
        notes: notes || '',
        log_date: todayStr,
      };
      setSleepLogs([newEntry, ...sleepLogs]);
      return;
    }

    const { error } = await supabase.from('sleep_logs').insert({
      user_id: user.id,
      duration_hours: durationHours,
      quality,
      notes,
      log_date: todayStr,
    });
    if (!error) fetchData();
  };

  const deleteSleepLog = async (id: string) => {
    if (isDemoMode) {
      setSleepLogs(sleepLogs.filter((s) => s.id !== id));
      return;
    }
    const { error } = await supabase.from('sleep_logs').delete().eq('id', id);
    if (!error) fetchData();
  };

  // Exercise Logging
  const addExerciseLog = async (
    activityType: string,
    durationMinutes: number,
    caloriesBurned?: number,
    intensity?: 'Light' | 'Moderate' | 'Vigorous',
    notes?: string
  ) => {
    if (!user) return;
    if (isDemoMode) {
      const newEntry: ExerciseLog = {
        id: `ex-${Date.now()}`,
        user_id: user.id,
        activity_type: activityType,
        duration_minutes: durationMinutes,
        calories_burned: caloriesBurned || null,
        intensity: intensity || 'Moderate',
        notes: notes || '',
        log_date: todayStr,
      };
      setExerciseLogs([newEntry, ...exerciseLogs]);
      return;
    }

    const { error } = await supabase.from('exercise_logs').insert({
      user_id: user.id,
      activity_type: activityType,
      duration_minutes: durationMinutes,
      calories_burned: caloriesBurned,
      intensity,
      notes,
      log_date: todayStr,
    });
    if (!error) fetchData();
  };

  const deleteExerciseLog = async (id: string) => {
    if (isDemoMode) {
      setExerciseLogs(exerciseLogs.filter((e) => e.id !== id));
      return;
    }
    const { error } = await supabase.from('exercise_logs').delete().eq('id', id);
    if (!error) fetchData();
  };

  // Steps Logging
  const addStepLog = async (stepCount: number) => {
    if (!user) return;
    if (isDemoMode) {
      const existingIdx = stepLogs.findIndex((s) => s.log_date === todayStr);
      if (existingIdx >= 0) {
        const updated = [...stepLogs];
        updated[existingIdx].step_count = stepCount;
        setStepLogs(updated);
      } else {
        const newEntry: StepLog = {
          id: `st-${Date.now()}`,
          user_id: user.id,
          step_count: stepCount,
          log_date: todayStr,
        };
        setStepLogs([newEntry, ...stepLogs]);
      }
      return;
    }

    const { error } = await supabase.from('step_logs').upsert(
      {
        user_id: user.id,
        step_count: stepCount,
        log_date: todayStr,
      },
      { onConflict: 'user_id,log_date' }
    );
    if (!error) fetchData();
  };

  // Blood Pressure Logging
  const addBloodPressureLog = async (systolic: number, diastolic: number, pulse?: number) => {
    if (!user) return;
    const { category } = classifyBloodPressure(systolic, diastolic);

    if (isDemoMode) {
      const newEntry: BloodPressureLog = {
        id: `bp-${Date.now()}`,
        user_id: user.id,
        systolic,
        diastolic,
        pulse: pulse || null,
        category,
        log_date: todayStr,
      };
      setBloodPressureLogs([newEntry, ...bloodPressureLogs]);
      return;
    }

    const { error } = await supabase.from('blood_pressure_logs').insert({
      user_id: user.id,
      systolic,
      diastolic,
      pulse,
      category,
      log_date: todayStr,
    });
    if (!error) fetchData();
  };

  const deleteBloodPressureLog = async (id: string) => {
    if (isDemoMode) {
      setBloodPressureLogs(bloodPressureLogs.filter((b) => b.id !== id));
      return;
    }
    const { error } = await supabase.from('blood_pressure_logs').delete().eq('id', id);
    if (!error) fetchData();
  };

  // Blood Glucose Logging
  const addBloodGlucoseLog = async (
    glucose: number,
    timing: 'Fasting' | 'Pre-Meal' | 'Post-Meal' | 'Bedtime',
    notes?: string
  ) => {
    if (!user) return;
    if (isDemoMode) {
      const newEntry: BloodGlucoseLog = {
        id: `bg-${Date.now()}`,
        user_id: user.id,
        glucose_mg_dl: glucose,
        timing,
        notes: notes || '',
        log_date: todayStr,
      };
      setBloodGlucoseLogs([newEntry, ...bloodGlucoseLogs]);
      return;
    }

    const { error } = await supabase.from('blood_glucose_logs').insert({
      user_id: user.id,
      glucose_mg_dl: glucose,
      timing,
      notes,
      log_date: todayStr,
    });
    if (!error) fetchData();
  };

  const deleteBloodGlucoseLog = async (id: string) => {
    if (isDemoMode) {
      setBloodGlucoseLogs(bloodGlucoseLogs.filter((g) => g.id !== id));
      return;
    }
    const { error } = await supabase.from('blood_glucose_logs').delete().eq('id', id);
    if (!error) fetchData();
  };

  // Heart Rate Logging
  const addHeartRateLog = async (bpm: number, tag: 'Resting' | 'Post-Workout' | 'General') => {
    if (!user) return;
    if (isDemoMode) {
      const newEntry: HeartRateLog = {
        id: `hr-${Date.now()}`,
        user_id: user.id,
        bpm,
        tag,
        log_date: todayStr,
      };
      setHeartRateLogs([newEntry, ...heartRateLogs]);
      return;
    }

    const { error } = await supabase.from('heart_rate_logs').insert({
      user_id: user.id,
      bpm,
      tag,
      log_date: todayStr,
    });
    if (!error) fetchData();
  };

  const deleteHeartRateLog = async (id: string) => {
    if (isDemoMode) {
      setHeartRateLogs(heartRateLogs.filter((h) => h.id !== id));
      return;
    }
    const { error } = await supabase.from('heart_rate_logs').delete().eq('id', id);
    if (!error) fetchData();
  };

  // Medication Management
  const addMedication = async (med: Omit<Medication, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    if (isDemoMode) {
      const newMed: Medication = {
        ...med,
        id: `m-${Date.now()}`,
        user_id: user.id,
        is_active: true,
      };
      setMedications([...medications, newMed]);
      return;
    }

    const { error } = await supabase.from('medications').insert({
      ...med,
      user_id: user.id,
    });
    if (!error) fetchData();
  };

  const toggleMedicationLog = async (medicationId: string, status: 'taken' | 'skipped') => {
    if (!user) return;
    if (isDemoMode) {
      const existingIdx = medicationLogs.findIndex(
        (m) => m.medication_id === medicationId && m.log_date === todayStr
      );
      if (existingIdx >= 0) {
        const updated = [...medicationLogs];
        updated[existingIdx].status = status;
        setMedicationLogs(updated);
      } else {
        const newLog: MedicationLog = {
          id: `ml-${Date.now()}`,
          user_id: user.id,
          medication_id: medicationId,
          status,
          log_date: todayStr,
        };
        setMedicationLogs([...medicationLogs, newLog]);
      }
      return;
    }

    const { error } = await supabase.from('medication_logs').upsert(
      {
        user_id: user.id,
        medication_id: medicationId,
        status,
        log_date: todayStr,
      },
      { onConflict: 'medication_id,log_date' }
    );
    if (!error) fetchData();
  };

  const deleteMedication = async (id: string) => {
    if (isDemoMode) {
      setMedications(medications.filter((m) => m.id !== id));
      return;
    }
    const { error } = await supabase.from('medications').update({ is_active: false }).eq('id', id);
    if (!error) fetchData();
  };

  // Goals Management
  const addGoal = async (goal: Omit<HealthGoal, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    if (isDemoMode) {
      const newGoal: HealthGoal = {
        ...goal,
        id: `g-${Date.now()}`,
        user_id: user.id,
        status: 'in_progress',
      };
      setHealthGoals([...healthGoals, newGoal]);
      return;
    }

    const { error } = await supabase.from('health_goals').insert({
      ...goal,
      user_id: user.id,
    });
    if (!error) fetchData();
  };

  const updateGoalProgress = async (id: string, currentValue: number) => {
    const target = healthGoals.find((g) => g.id === id);
    const isCompleted = target && currentValue >= target.target_value;

    if (isDemoMode) {
      setHealthGoals(
        healthGoals.map((g) =>
          g.id === id ? { ...g, current_value: currentValue, status: isCompleted ? 'completed' : 'in_progress' } : g
        )
      );
      return;
    }

    const { error } = await supabase
      .from('health_goals')
      .update({
        current_value: currentValue,
        status: isCompleted ? 'completed' : 'in_progress',
      })
      .eq('id', id);
    if (!error) fetchData();
  };

  const deleteGoal = async (id: string) => {
    if (isDemoMode) {
      setHealthGoals(healthGoals.filter((g) => g.id !== id));
      return;
    }
    const { error } = await supabase.from('health_goals').delete().eq('id', id);
    if (!error) fetchData();
  };

  // Disease Library (Admin operations)
  const addDiseaseItem = async (item: Omit<DiseaseLibraryItem, 'id' | 'created_at'>) => {
    if (isDemoMode) {
      const newItem: DiseaseLibraryItem = {
        ...item,
        id: `dl-${Date.now()}`,
      };
      setDiseaseLibrary([newItem, ...diseaseLibrary]);
      return;
    }

    const { error } = await supabase.from('disease_library').insert(item);
    if (!error) fetchData();
  };

  const updateDiseaseItem = async (id: string, item: Partial<DiseaseLibraryItem>) => {
    if (isDemoMode) {
      setDiseaseLibrary(
        diseaseLibrary.map((d) => (d.id === id ? { ...d, ...item } : d))
      );
      return;
    }

    const { error } = await supabase.from('disease_library').update(item).eq('id', id);
    if (!error) fetchData();
  };

  const deleteDiseaseItem = async (id: string) => {
    if (isDemoMode) {
      setDiseaseLibrary(diseaseLibrary.filter((d) => d.id !== id));
      return;
    }

    const { error } = await supabase.from('disease_library').delete().eq('id', id);
    if (!error) fetchData();
  };

  // Quick Telemetry Extractors
  const getTodayWaterGlasses = () => {
    const today = waterLogs.find((w) => w.log_date === todayStr);
    return today ? today.glasses : 0;
  };

  const getLatestWeight = () => {
    return weightLogs.length > 0 ? weightLogs[0] : null;
  };

  const getTodaySteps = () => {
    const today = stepLogs.find((s) => s.log_date === todayStr);
    return today ? today.step_count : 0;
  };

  const getLatestBloodPressure = () => {
    return bloodPressureLogs.length > 0 ? bloodPressureLogs[0] : null;
  };

  const getLatestGlucose = () => {
    return bloodGlucoseLogs.length > 0 ? bloodGlucoseLogs[0] : null;
  };

  const getLatestHeartRate = () => {
    return heartRateLogs.length > 0 ? heartRateLogs[0] : null;
  };

  const getMedicationAdherenceRate = () => {
    if (medications.length === 0) return 100;
    const takenCount = medicationLogs.filter((m) => m.status === 'taken').length;
    const totalLogs = medicationLogs.length;
    if (totalLogs === 0) return 100;
    return Math.round((takenCount / totalLogs) * 100);
  };

  return (
    <HealthDataContext.Provider
      value={{
        waterLogs,
        weightLogs,
        sleepLogs,
        exerciseLogs,
        stepLogs,
        bloodPressureLogs,
        bloodGlucoseLogs,
        heartRateLogs,
        medications,
        medicationLogs,
        healthGoals,
        diseaseLibrary,
        loading,
        logWater,
        addWeightLog,
        deleteWeightLog,
        addSleepLog,
        deleteSleepLog,
        addExerciseLog,
        deleteExerciseLog,
        addStepLog,
        addBloodPressureLog,
        deleteBloodPressureLog,
        addBloodGlucoseLog,
        deleteBloodGlucoseLog,
        addHeartRateLog,
        deleteHeartRateLog,
        addMedication,
        toggleMedicationLog,
        deleteMedication,
        addGoal,
        updateGoalProgress,
        deleteGoal,
        addDiseaseItem,
        updateDiseaseItem,
        deleteDiseaseItem,
        getTodayWaterGlasses,
        getLatestWeight,
        getTodaySteps,
        getLatestBloodPressure,
        getLatestGlucose,
        getLatestHeartRate,
        getMedicationAdherenceRate,
        refreshData: fetchData,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};
