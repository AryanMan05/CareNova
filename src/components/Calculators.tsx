// Module C: Clinical Health Calculators
// Simple everyday English explanations: Daily Calories, Body Mass, Target Heart Zones, Hydration
// Lead Architect: Aryan More

import React, { useState } from 'react';
import {
  Scale,
  Flame,
  Droplets,
  Heart,
  Activity,
  CheckCircle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateHydrationTarget,
  calculateDevineIBW,
  calculateTanakaHeartZones,
} from '../utils/clinicalCalculators';

export const Calculators: React.FC = () => {
  const { profile, updateProfile } = useAuth();

  const [weight, setWeight] = useState<number>(profile?.weight || 70);
  const [height, setHeight] = useState<number>(profile?.height || 175);
  const [age, setAge] = useState<number>(profile?.age || 26);
  const [gender, setGender] = useState<'Male' | 'Female'>(
    (profile?.gender as any) === 'Female' ? 'Female' : 'Male'
  );
  const [activity, setActivity] = useState<string>(profile?.activity_level || 'Moderate');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Computations
  const bmiResult = calculateBMI(weight, height);
  const bmrResult = calculateBMR(weight, height, age, gender);
  const tdeeResult = calculateTDEE(bmrResult, activity);
  const hydrationResult = calculateHydrationTarget(weight, 30);
  const ibwResult = calculateDevineIBW(height, gender);
  const hrZones = calculateTanakaHeartZones(age);

  // 1-Click Sync to Profile Goals
  const handleSyncGoals = async () => {
    setSyncStatus('syncing');
    const { error } = await updateProfile({
      weight,
      height,
      age,
      gender,
      activity_level: activity,
      water_goal_glasses: hydrationResult.glasses,
    });
    if (!error) {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus(null), 3000);
    } else {
      setSyncStatus('error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Easy Health & Calorie Calculators
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Find out your daily calorie needs, healthy target weight, and ideal water intake with clinically backed formulas explained simply.
          </p>
        </div>

        <button
          onClick={handleSyncGoals}
          disabled={syncStatus === 'syncing'}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
        >
          {syncStatus === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>Saved to My Profile!</span>
            </>
          ) : (
            <>
              <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>Save Results to My Goals</span>
            </>
          )}
        </button>
      </div>

      {/* Inputs Form */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs">
        <h3 className="text-sm font-bold text-stone-800 mb-1">Your Personal Details</h3>
        <p className="text-xs text-stone-500 mb-4">Enter or adjust your numbers below to see your personalized recommendations instantly:</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Age (Years)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Biological Sex</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-600 bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Daily Activity Level</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-600 bg-white"
            >
              <option value="Sedentary">Sedentary (Little or no exercise)</option>
              <option value="Light">Light (Light walk 1-3 days/week)</option>
              <option value="Moderate">Moderate (Active 3-5 days/week)</option>
              <option value="Very Active">Very Active (Hard exercise 6-7 days)</option>
              <option value="Extra Active">Extra Active (Very physical job)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calculated Results: Simple, Clear, Everyday Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Result 1: Daily Maintenance Calories */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Daily Calories Needed</span>
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-stone-900">
              {tdeeResult.toLocaleString()} <span className="text-sm font-medium text-stone-500">calories / day</span>
            </div>
            <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
              Your body needs about <strong>{tdeeResult.toLocaleString()} calories</strong> each day to maintain your current weight with your typical activity level.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-indigo-700 font-medium bg-indigo-50/50 p-2.5 rounded-xl">
            Tip: Eating roughly 300 to 500 calories less per day helps with steady, safe weight loss.
          </div>
        </div>

        {/* Result 2: Resting Calories */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Resting Calories (BMR)</span>
              <Flame className="w-5 h-5 text-violet-600" />
            </div>
            <div className="text-3xl font-black text-stone-900">
              {bmrResult.toLocaleString()} <span className="text-sm font-medium text-stone-500">calories / day</span>
            </div>
            <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
              Your body naturally burns about <strong>{bmrResult.toLocaleString()} calories</strong> every day just doing essential work like breathing, pumping blood, and keeping your organs running while at rest.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500">
            This is the minimum energy your body requires to function every day.
          </div>
        </div>

        {/* Result 3: Body Mass Index (BMI) */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Body Mass Index (BMI)</span>
              <Scale className="w-5 h-5 text-sky-600" />
            </div>
            <div className="text-3xl font-black text-stone-900">{bmiResult.bmi}</div>
            <div className={`text-xs font-bold mt-1 ${bmiResult.color}`}>
              {bmiResult.category} Weight Range
            </div>
            <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
              {bmiResult.category.toLowerCase().includes('normal') || bmiResult.category.toLowerCase().includes('healthy')
                ? `Your BMI is ${bmiResult.bmi}, which falls within the healthy range (18.5 – 24.9) for most adults.`
                : `Your BMI is ${bmiResult.bmi}, which is in the ${bmiResult.category.toLowerCase()} category. A healthy range is 18.5 – 24.9.`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500">
            Standard healthy reference zone: 18.5 to 24.9
          </div>
        </div>

        {/* Result 4: Recommended Water Intake */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Recommended Daily Water</span>
              <Droplets className="w-5 h-5 text-sky-600" />
            </div>
            <div className="text-3xl font-black text-stone-900">
              {hydrationResult.glasses} <span className="text-sm font-medium text-stone-500">glasses ({hydrationResult.totalMl} ml)</span>
            </div>
            <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
              Drinking about <strong>{hydrationResult.glasses} glasses of water</strong> each day keeps your kidneys healthy, your digestion smooth, and your daily energy levels high.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500">
            Tip: A regular glass of water is roughly 250 ml.
          </div>
        </div>

        {/* Result 5: Healthy Target Weight */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Healthy Target Weight</span>
              <Scale className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-stone-900">
              ~{ibwResult} <span className="text-sm font-medium text-stone-500">kg</span>
            </div>
            <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
              For your height ({height} cm), a balanced reference weight is around <strong>{ibwResult} kg</strong>. Keep in mind that individual body structure and muscle naturally vary.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500">
            A helpful benchmark used by doctors and nutritionists.
          </div>
        </div>

        {/* Result 6: Heart Rate Zones for Exercise */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Exercise Heart Rate</span>
              <Heart className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-stone-900">
              Max: {hrZones.maxHR} <span className="text-xs font-medium text-stone-500">beats / min</span>
            </div>
            <div className="mt-3 space-y-2 text-xs text-stone-700">
              <div className="flex justify-between items-center bg-amber-50/60 p-2 rounded-xl">
                <span>Fat Burn (Brisk walking / light jog):</span>
                <span className="font-bold text-amber-800">{hrZones.fatBurn[0]}–{hrZones.fatBurn[1]} BPM</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50/60 p-2 rounded-xl">
                <span>Cardio (Cycling / jogging):</span>
                <span className="font-bold text-emerald-800">{hrZones.cardio[0]}–{hrZones.cardio[1]} BPM</span>
              </div>
              <div className="flex justify-between items-center bg-rose-50/60 p-2 rounded-xl">
                <span>Peak (High intensity bursts):</span>
                <span className="font-bold text-rose-800">{hrZones.peak[0]}–{hrZones.peak[1]} BPM</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500">
            Staying in the fat burn zone is great for daily stamina.
          </div>
        </div>
      </div>
    </div>
  );
};
