// Health Data Context & Telemetry Engine (Powered by SQLite / Turso Backend)
// Lead Architect: Aryan More

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
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

// Initial fallback disease library in case network is initialising
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
];

interface HealthDataContextType {
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
  logWater: (glassesDelta: number) => Promise<void>;
  addWeightLog: (weight: number, notes?: string) => Promise<void>;
  deleteWeightLog: (id: string) => Promise<void>;
  addSleepLog: (durationHours: number, quality: 'Restful' | 'Normal' | 'Disturbed', notes?: string) => Promise<void>;
  deleteSleepLog: (id: string) => Promise<void>;
  addExerciseLog: (
    activityType: string,
    durationMinutes: number,
    caloriesBurned?: number,
    intensity?: 'Light' | 'Moderate' | 'Vigorous',
    notes?: string
  ) => Promise<void>;
  deleteExerciseLog: (id: string) => Promise<void>;
  addStepLog: (stepCount: number) => Promise<void>;
  addBloodPressureLog: (systolic: number, diastolic: number, pulse?: number) => Promise<void>;
  deleteBloodPressureLog: (id: string) => Promise<void>;
  addBloodGlucoseLog: (
    glucose: number,
    timing: 'Fasting' | 'Pre-Meal' | 'Post-Meal' | 'Bedtime',
    notes?: string
  ) => Promise<void>;
  deleteBloodGlucoseLog: (id: string) => Promise<void>;
  addHeartRateLog: (bpm: number, tag: 'Resting' | 'Post-Workout' | 'General') => Promise<void>;
  deleteHeartRateLog: (id: string) => Promise<void>;
  addMedication: (med: Omit<Medication, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  toggleMedicationLog: (medicationId: string, status: 'taken' | 'skipped') => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  addGoal: (goal: Omit<HealthGoal, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateGoalProgress: (id: string, currentValue: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addDiseaseItem: (item: Omit<DiseaseLibraryItem, 'id' | 'created_at'>) => Promise<void>;
  updateDiseaseItem: (id: string, item: Partial<DiseaseLibraryItem>) => Promise<void>;
  deleteDiseaseItem: (id: string) => Promise<void>;
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
  const { user, profile } = useAuth();

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

  const fetchData = async () => {
    if (!user) {
      setWaterLogs([]);
      setWeightLogs([]);
      setSleepLogs([]);
      setExerciseLogs([]);
      setStepLogs([]);
      setBloodPressureLogs([]);
      setBloodGlucoseLogs([]);
      setHeartRateLogs([]);
      setMedications([]);
      setMedicationLogs([]);
      setHealthGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.health.getAll();

      if (data.waterLogs) setWaterLogs(data.waterLogs);
      if (data.weightLogs) setWeightLogs(data.weightLogs);
      if (data.sleepLogs) setSleepLogs(data.sleepLogs);
      if (data.exerciseLogs) setExerciseLogs(data.exerciseLogs);
      if (data.stepLogs) setStepLogs(data.stepLogs);
      if (data.bloodPressureLogs) setBloodPressureLogs(data.bloodPressureLogs);
      if (data.bloodGlucoseLogs) setBloodGlucoseLogs(data.bloodGlucoseLogs);
      if (data.heartRateLogs) setHeartRateLogs(data.heartRateLogs);
      if (data.medications) setMedications(data.medications);
      if (data.medicationLogs) setMedicationLogs(data.medicationLogs);
      if (data.healthGoals) setHealthGoals(data.healthGoals);
      if (data.diseaseLibrary && data.diseaseLibrary.length > 0) {
        setDiseaseLibrary(data.diseaseLibrary);
      }
    } catch (err) {
      console.error('Error fetching health telemetry from SQLite:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // 1-Click Quick Water Logger
  const logWater = async (glassesDelta: number) => {
    if (!user) return;
    const current = getTodayWaterGlasses();
    const newCount = Math.max(0, current + glassesDelta);
    try {
      await api.health.logWater(newCount, todayStr);
      await fetchData();
    } catch (err) {
      console.error('Failed to log water:', err);
    }
  };

  // Weight Logging
  const addWeightLog = async (weight: number, notes?: string) => {
    if (!user) return;
    const height = profile?.height || 175;
    const { bmi } = calculateBMI(weight, height);
    try {
      await api.health.logWeight({ weight, bmi, notes, log_date: todayStr });
      await fetchData();
    } catch (err) {
      console.error('Failed to log weight:', err);
    }
  };

  const deleteWeightLog = async (id: string) => {
    // Local deletion
    setWeightLogs(weightLogs.filter((w) => w.id !== id));
  };

  // Sleep Logging
  const addSleepLog = async (durationHours: number, quality: 'Restful' | 'Normal' | 'Disturbed', notes?: string) => {
    if (!user) return;
    try {
      await api.health.logSleep({ duration_hours: durationHours, quality, notes, log_date: todayStr });
      await fetchData();
    } catch (err) {
      console.error('Failed to log sleep:', err);
    }
  };

  const deleteSleepLog = async (id: string) => {
    setSleepLogs(sleepLogs.filter((s) => s.id !== id));
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
    try {
      await api.health.logExercise({
        activity_type: activityType,
        duration_minutes: durationMinutes,
        calories_burned: caloriesBurned,
        intensity,
        notes,
        log_date: todayStr,
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to log exercise:', err);
    }
  };

  const deleteExerciseLog = async (id: string) => {
    setExerciseLogs(exerciseLogs.filter((e) => e.id !== id));
  };

  // Steps Logging
  const addStepLog = async (stepCount: number) => {
    if (!user) return;
    try {
      await api.health.logSteps(stepCount, todayStr);
      await fetchData();
    } catch (err) {
      console.error('Failed to log steps:', err);
    }
  };

  // Blood Pressure Logging
  const addBloodPressureLog = async (systolic: number, diastolic: number, pulse?: number) => {
    if (!user) return;
    const { category } = classifyBloodPressure(systolic, diastolic);
    try {
      await api.health.logBloodPressure({ systolic, diastolic, pulse, category, log_date: todayStr });
      await fetchData();
    } catch (err) {
      console.error('Failed to log blood pressure:', err);
    }
  };

  const deleteBloodPressureLog = async (id: string) => {
    setBloodPressureLogs(bloodPressureLogs.filter((b) => b.id !== id));
  };

  // Blood Glucose Logging
  const addBloodGlucoseLog = async (
    glucose: number,
    timing: 'Fasting' | 'Pre-Meal' | 'Post-Meal' | 'Bedtime',
    notes?: string
  ) => {
    if (!user) return;
    try {
      await api.health.logBloodGlucose({ glucose_mg_dl: glucose, timing, notes, log_date: todayStr });
      await fetchData();
    } catch (err) {
      console.error('Failed to log blood glucose:', err);
    }
  };

  const deleteBloodGlucoseLog = async (id: string) => {
    setBloodGlucoseLogs(bloodGlucoseLogs.filter((g) => g.id !== id));
  };

  // Heart Rate Logging
  const addHeartRateLog = async (bpm: number, tag: 'Resting' | 'Post-Workout' | 'General') => {
    if (!user) return;
    try {
      await api.health.logHeartRate({ bpm, tag, log_date: todayStr });
      await fetchData();
    } catch (err) {
      console.error('Failed to log heart rate:', err);
    }
  };

  const deleteHeartRateLog = async (id: string) => {
    setHeartRateLogs(heartRateLogs.filter((h) => h.id !== id));
  };

  // Medication Management
  const addMedication = async (med: Omit<Medication, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    try {
      await api.health.addMedication(med);
      await fetchData();
    } catch (err) {
      console.error('Failed to add medication:', err);
    }
  };

  const toggleMedicationLog = async (medicationId: string, status: 'taken' | 'skipped') => {
    if (!user) return;
    try {
      await api.health.logMedicationDose(medicationId, status, todayStr);
      await fetchData();
    } catch (err) {
      console.error('Failed to record medication status:', err);
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      await api.health.deleteMedication(id);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete medication:', err);
    }
  };

  // Goals Management
  const addGoal = async (goal: Omit<HealthGoal, 'id' | 'user_id' | 'created_at'>) => {
    const newGoal: HealthGoal = {
      ...goal,
      id: `g-${Date.now()}`,
      user_id: user?.id || 'uid',
      status: 'in_progress',
    };
    setHealthGoals([...healthGoals, newGoal]);
  };

  const updateGoalProgress = async (id: string, currentValue: number) => {
    const target = healthGoals.find((g) => g.id === id);
    const isCompleted = target && currentValue >= target.target_value;
    setHealthGoals(
      healthGoals.map((g) =>
        g.id === id ? { ...g, current_value: currentValue, status: isCompleted ? 'completed' : 'in_progress' } : g
      )
    );
  };

  const deleteGoal = async (id: string) => {
    setHealthGoals(healthGoals.filter((g) => g.id !== id));
  };

  // Disease Library (Admin operations)
  const addDiseaseItem = async (item: Omit<DiseaseLibraryItem, 'id' | 'created_at'>) => {
    try {
      await api.admin.addDisease(item);
      await fetchData();
    } catch (err) {
      console.error('Failed to add disease item:', err);
    }
  };

  const updateDiseaseItem = async (id: string, item: Partial<DiseaseLibraryItem>) => {
    setDiseaseLibrary(
      diseaseLibrary.map((d) => (d.id === id ? { ...d, ...item } : d))
    );
  };

  const deleteDiseaseItem = async (id: string) => {
    try {
      await api.admin.deleteDisease(id);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete disease item:', err);
    }
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
