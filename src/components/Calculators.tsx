// CareNova Clinical Health Calculators
// Everyday English explanations: Daily Calories, Body Mass, Target Heart Zones, Hydration
// Palette: Forest Teal (#0B343B), Deep Navy (#102D3E), Primary Teal (#168B83), Fresh Mint (#A8E6D5 / #64D8C1)
// Lead Architect: Aryan More

import React, { useState, useEffect } from 'react';
import {
  Scale,
  Flame,
  Droplets,
  Heart,
  Activity,
  CheckCircle,
  RefreshCw,
  Info,
  Sparkles,
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

  // Sync inputs with profile when profile loads
  useEffect(() => {
    if (profile) {
      if (profile.weight) setWeight(profile.weight);
      if (profile.height) setHeight(profile.height);
      if (profile.age) setAge(profile.age);
      if (profile.gender) setGender(profile.gender === 'Female' ? 'Female' : 'Male');
      if (profile.activity_level) setActivity(profile.activity_level);
    }
  }, [profile]);

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
    <div className="space-y-6 animate-fadeIn text-[#183447] dark:text-[#EAF7F4]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B343B] dark:text-[#EAF7F4]">
            Health & Calorie Calculators
          </h1>
          <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-1">
            Find out your daily calorie needs, healthy target weight, and ideal water intake with clinically backed formulas explained simply.
          </p>
        </div>

        <button
          onClick={handleSyncGoals}
          disabled={syncStatus === 'syncing'}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#168B83] hover:bg-[#12726B] text-white font-semibold text-xs shadow-md shadow-[#168B83]/20 transition-all hover:scale-105 shrink-0"
        >
          {syncStatus === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4 text-[#A8E6D5]" />
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
      <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs">
        <h3 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4] mb-1">
          Your Personal Details
        </h3>
        <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mb-4">
          Enter or adjust your numbers below to see your personalized recommendations instantly:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-sm font-semibold outline-none focus:border-[#168B83]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-sm font-semibold outline-none focus:border-[#168B83]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
              Age (Years)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-sm font-semibold outline-none focus:border-[#168B83]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-sm font-semibold outline-none focus:border-[#168B83]"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
              Daily Activity Level
            </label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-sm font-semibold outline-none focus:border-[#168B83]"
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

      {/* Calculated Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Result 1: Daily Maintenance Calories */}
        <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#168B83] dark:text-[#64D8C1]">
                Daily Calories Needed
              </span>
              <Activity className="w-5 h-5 text-[#168B83] dark:text-[#64D8C1]" />
            </div>
            <div className="text-3xl font-black text-[#0B343B] dark:text-[#EAF7F4]">
              {tdeeResult.toLocaleString()} <span className="text-sm font-medium text-[#7E9FA8] dark:text-[#789B96]">calories / day</span>
            </div>
            <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-2.5 leading-relaxed">
              Your body burns roughly <strong>{tdeeResult.toLocaleString()} calories</strong> each day to maintain your current weight with your typical activity level.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#168B83] dark:text-[#64D8C1] font-medium bg-[#E0F7F1]/50 dark:bg-[#163B38]/50 p-2.5 rounded-xl">
            Tip: Eating roughly 300 to 500 calories less per day helps with steady, safe weight loss.
          </div>
        </div>

        {/* Result 2: Resting Calories */}
        <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#168B83] dark:text-[#64D8C1]">
                Resting Calories (BMR)
              </span>
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-[#0B343B] dark:text-[#EAF7F4]">
              {bmrResult.toLocaleString()} <span className="text-sm font-medium text-[#7E9FA8] dark:text-[#789B96]">calories / day</span>
            </div>
            <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-2.5 leading-relaxed">
              Your body naturally burns about <strong>{bmrResult.toLocaleString()} calories</strong> every day just doing essential work like breathing, circulating blood, and keeping your organs working at rest.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#7E9FA8] dark:text-[#789B96]">
            This is the baseline energy your body requires to function every day.
          </div>
        </div>

        {/* Result 3: Body Mass Index (BMI) */}
        <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Body Mass Index (BMI)
              </span>
              <Scale className="w-5 h-5 text-sky-500" />
            </div>
            <div className="text-3xl font-black text-[#0B343B] dark:text-[#EAF7F4]">{bmiResult.bmi}</div>
            <div className="text-xs font-bold mt-1 text-[#168B83] dark:text-[#64D8C1]">
              {bmiResult.category} Weight Range
            </div>
            <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-2.5 leading-relaxed">
              {bmiResult.category.toLowerCase().includes('normal') || bmiResult.category.toLowerCase().includes('healthy')
                ? `Your BMI is ${bmiResult.bmi}, which falls within the healthy range (18.5 – 24.9) for most adults.`
                : `Your BMI is ${bmiResult.bmi}, which is in the ${bmiResult.category.toLowerCase()} category. A healthy range is 18.5 – 24.9.`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#7E9FA8] dark:text-[#789B96]">
            Standard healthy reference zone: 18.5 to 24.9
          </div>
        </div>

        {/* Result 4: Recommended Water Intake */}
        <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Recommended Daily Water
              </span>
              <Droplets className="w-5 h-5 text-sky-500" />
            </div>
            <div className="text-3xl font-black text-[#0B343B] dark:text-[#EAF7F4]">
              {hydrationResult.glasses} <span className="text-sm font-medium text-[#7E9FA8] dark:text-[#789B96]">glasses ({hydrationResult.totalMl} ml)</span>
            </div>
            <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-2.5 leading-relaxed">
              Drinking about <strong>{hydrationResult.glasses} glasses of water</strong> each day keeps your kidneys healthy, your digestion smooth, and your daily energy levels high.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#7E9FA8] dark:text-[#789B96]">
            Tip: A regular glass of water is roughly 250 ml.
          </div>
        </div>

        {/* Result 5: Healthy Target Weight */}
        <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#168B83] dark:text-[#64D8C1]">
                Healthy Target Weight
              </span>
              <Scale className="w-5 h-5 text-[#168B83] dark:text-[#64D8C1]" />
            </div>
            <div className="text-3xl font-black text-[#0B343B] dark:text-[#EAF7F4]">
              ~{ibwResult} <span className="text-sm font-medium text-[#7E9FA8] dark:text-[#789B96]">kg</span>
            </div>
            <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-2.5 leading-relaxed">
              For your height ({height} cm), a balanced reference weight is around <strong>{ibwResult} kg</strong>. Individual body structure and muscle naturally vary.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#7E9FA8] dark:text-[#789B96]">
            A helpful benchmark used by doctors and nutritionists.
          </div>
        </div>

        {/* Result 6: Heart Rate Zones for Exercise */}
        <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Exercise Heart Rate
              </span>
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-[#0B343B] dark:text-[#EAF7F4]">
              Max: {hrZones.maxHR} <span className="text-xs font-medium text-[#7E9FA8] dark:text-[#789B96]">beats / min</span>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 p-2 rounded-xl">
                <span className="text-amber-900 dark:text-amber-200">Fat Burn (Brisk walking / light jog):</span>
                <span className="font-bold text-amber-800 dark:text-amber-300">{hrZones.fatBurn[0]}–{hrZones.fatBurn[1]} BPM</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 p-2 rounded-xl">
                <span className="text-emerald-900 dark:text-emerald-200">Cardio (Cycling / jogging):</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-300">{hrZones.cardio[0]}–{hrZones.cardio[1]} BPM</span>
              </div>
              <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 p-2 rounded-xl">
                <span className="text-rose-900 dark:text-rose-200">Peak (High intensity bursts):</span>
                <span className="font-bold text-rose-800 dark:text-rose-300">{hrZones.peak[0]}–{hrZones.peak[1]} BPM</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#7E9FA8] dark:text-[#789B96]">
            Staying in the fat burn zone is great for daily stamina.
          </div>
        </div>
      </div>
    </div>
  );
};
