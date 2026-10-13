// CareNova Daily Health Trackers Hub
// 8 Dedicated Vitals & Activity Trackers with Friendly Empty States, Clean Organized Tables, and CRUD Modals
// Palette: Forest Teal (#0B343B), Deep Navy (#102D3E), Primary Teal (#168B83), Fresh Mint (#A8E6D5 / #64D8C1)
// Lead Architect: Aryan More

import React, { useState } from 'react';
import {
  Droplets,
  Scale,
  Moon,
  Flame,
  Footprints,
  Heart,
  Activity,
  Plus,
  Trash2,
  X,
  Info,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';
import { useAuth } from '../context/AuthContext';
import { classifyBloodGlucose } from '../utils/clinicalCalculators';

export const TrackersHub: React.FC = () => {
  const { profile } = useAuth();
  const {
    waterLogs,
    weightLogs,
    sleepLogs,
    exerciseLogs,
    stepLogs,
    bloodPressureLogs,
    bloodGlucoseLogs,
    heartRateLogs,
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
    getTodayWaterGlasses,
    getTodaySteps,
  } = useHealthData();

  const [activeTab, setActiveTab] = useState<
    'water' | 'weight' | 'sleep' | 'exercise' | 'steps' | 'bp' | 'glucose' | 'heart'
  >('water');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);

  // Form Fields
  const [weightVal, setWeightVal] = useState('70.5');
  const [weightNotes, setWeightNotes] = useState('');
  const [sleepHours, setSleepHours] = useState('7.5');
  const [sleepQuality, setSleepQuality] = useState<'Restful' | 'Normal' | 'Disturbed'>('Restful');
  const [exerciseType, setExerciseType] = useState('Walking');
  const [exerciseMins, setExerciseMins] = useState('30');
  const [exerciseCalories, setExerciseCalories] = useState('180');
  const [stepVal, setStepVal] = useState('8000');
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [bpPulse, setBpPulse] = useState('72');
  const [glucoseVal, setGlucoseVal] = useState('95');
  const [glucoseTiming, setGlucoseTiming] = useState<'Fasting' | 'Pre-Meal' | 'Post-Meal' | 'Bedtime'>('Fasting');
  const [hrVal, setHrVal] = useState('72');
  const [hrTag, setHrTag] = useState<'Resting' | 'Post-Workout' | 'General'>('Resting');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'weight') {
      await addWeightLog(parseFloat(weightVal), weightNotes);
    } else if (activeTab === 'sleep') {
      await addSleepLog(parseFloat(sleepHours), sleepQuality);
    } else if (activeTab === 'exercise') {
      await addExerciseLog(exerciseType, parseInt(exerciseMins), parseInt(exerciseCalories), 'Moderate');
    } else if (activeTab === 'steps') {
      await addStepLog(parseInt(stepVal));
    } else if (activeTab === 'bp') {
      await addBloodPressureLog(parseInt(bpSystolic), parseInt(bpDiastolic), parseInt(bpPulse));
    } else if (activeTab === 'glucose') {
      await addBloodGlucoseLog(parseInt(glucoseVal), glucoseTiming);
    } else if (activeTab === 'heart') {
      await addHeartRateLog(parseInt(hrVal), hrTag);
    }
    setModalOpen(false);
  };

  const tabs = [
    { id: 'water', label: 'Water Intake', icon: Droplets, color: 'text-sky-500' },
    { id: 'weight', label: 'Weight & BMI', icon: Scale, color: 'text-[#168B83]' },
    { id: 'sleep', label: 'Sleep Log', icon: Moon, color: 'text-teal-400' },
    { id: 'exercise', label: 'Exercise & Walking', icon: Flame, color: 'text-amber-500' },
    { id: 'steps', label: 'Daily Steps', icon: Footprints, color: 'text-emerald-500' },
    { id: 'bp', label: 'Blood Pressure', icon: Activity, color: 'text-rose-500' },
    { id: 'glucose', label: 'Blood Sugar', icon: Heart, color: 'text-orange-500' },
    { id: 'heart', label: 'Heart Rate', icon: Heart, color: 'text-pink-500' },
  ];

  // Helper Reusable Empty State Card
  const renderEmptyState = (
    title: string,
    message: string,
    icon: React.ReactNode,
    onAddClick: () => void
  ) => (
    <div className="p-8 md:p-12 text-center rounded-3xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] flex flex-col items-center justify-center space-y-4 my-2 animate-fadeIn">
      <div className="w-14 h-14 rounded-2xl bg-[#E0F7F1] dark:bg-[#163B38] text-[#168B83] dark:text-[#64D8C1] flex items-center justify-center shadow-xs">
        {icon}
      </div>
      <div className="max-w-md space-y-1">
        <h4 className="text-base font-bold text-[#0B343B] dark:text-[#EAF7F4]">{title}</h4>
        <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] leading-relaxed">
          {message}
        </p>
      </div>
      <button
        onClick={onAddClick}
        className="px-5 py-2.5 rounded-xl bg-[#168B83] hover:bg-[#12726B] text-white font-bold text-xs shadow-md shadow-[#168B83]/20 flex items-center gap-2 transition-all hover:scale-105"
      >
        <Plus className="w-4 h-4" />
        <span>+ Add Your First Entry</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn text-[#183447] dark:text-[#EAF7F4]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B343B] dark:text-[#EAF7F4]">
            Daily Health Trackers
          </h1>
          <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-1">
            Easily record your daily habits, check your past entries, and keep a consistent personal health history.
          </p>
        </div>

        {activeTab !== 'water' && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#168B83] hover:bg-[#12726B] text-white font-semibold text-xs shadow-md shadow-[#168B83]/20 transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Entry</span>
          </button>
        )}
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#168B83] text-white border-[#168B83] shadow-sm'
                  : 'bg-white dark:bg-[#17363A] text-[#476A76] dark:text-[#A9C5C1] border-[#D8ECE7] dark:border-[#234E54] hover:bg-[#F7FCFA] dark:hover:bg-[#122B2F]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tracker Container */}
      <div className="bg-white dark:bg-[#17363A] rounded-3xl border border-[#D8ECE7] dark:border-[#234E54] p-6 shadow-xs">
        {/* 1. Water Tracker */}
        {activeTab === 'water' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50">
              <div>
                <h3 className="text-lg font-bold text-sky-950 dark:text-sky-200">Water Intake Today</h3>
                <p className="text-xs text-sky-800 dark:text-sky-300 mt-1">
                  Staying hydrated improves digestion, concentration, and sustained energy.
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-sky-900 dark:text-sky-100">
                    {getTodayWaterGlasses()}
                  </span>
                  <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                    of {profile?.water_goal_glasses || 8} glasses target
                  </span>
                </div>
              </div>

              {/* Quick Log Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => logWater(1)}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+1 Glass (250ml)</span>
                </button>
                <button
                  onClick={() => logWater(2)}
                  className="px-4 py-2.5 rounded-xl bg-sky-100 dark:bg-sky-900/60 hover:bg-sky-200 dark:hover:bg-sky-800 text-sky-800 dark:text-sky-200 font-bold text-xs transition-colors"
                >
                  +2 Glasses
                </button>
              </div>
            </div>

            {/* Past Water Logs */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4]">
                Recent Hydration Log History
              </h4>
              {waterLogs.length === 0 ? (
                renderEmptyState(
                  'No water intake records yet',
                  'Start tracking your daily hydration by logging your first glass of water above.',
                  <Droplets className="w-7 h-7" />,
                  () => logWater(1)
                )
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#7E9FA8] dark:text-[#789B96]">
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Glasses Logged</th>
                        <th className="py-2.5">Estimated Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8F5F2] dark:divide-[#1C3E43]">
                      {waterLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#F7FCFA] dark:hover:bg-[#122B2F]">
                          <td className="py-3 font-medium text-[#0B343B] dark:text-[#EAF7F4]">
                            {log.log_date}
                          </td>
                          <td className="py-3 font-bold text-sky-600 dark:text-sky-400">
                            {log.glasses} glasses
                          </td>
                          <td className="py-3 text-[#476A76] dark:text-[#A9C5C1]">
                            {log.glasses * 250} ml
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Weight Tracker */}
        {activeTab === 'weight' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4]">
                Weight & Body Measurements
              </h4>
              <span className="text-xs text-[#7E9FA8] dark:text-[#789B96]">
                {weightLogs.length} total entries
              </span>
            </div>

            {weightLogs.length === 0 ? (
              renderEmptyState(
                'No weight records yet',
                'Start tracking your body weight and BMI by adding your first entry.',
                <Scale className="w-7 h-7" />,
                () => setModalOpen(true)
              )
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#7E9FA8] dark:text-[#789B96]">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Weight (kg)</th>
                      <th className="py-2.5">BMI Score</th>
                      <th className="py-2.5">Notes</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8F5F2] dark:divide-[#1C3E43]">
                    {weightLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F7FCFA] dark:hover:bg-[#122B2F]">
                        <td className="py-3 font-medium text-[#0B343B] dark:text-[#EAF7F4]">{log.log_date}</td>
                        <td className="py-3 font-bold text-[#0B343B] dark:text-[#EAF7F4]">{log.weight} kg</td>
                        <td className="py-3 text-[#168B83] dark:text-[#64D8C1] font-semibold">{log.bmi || '—'}</td>
                        <td className="py-3 text-[#476A76] dark:text-[#A9C5C1] text-xs">{log.notes || '—'}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => deleteWeightLog(log.id)}
                            className="p-1 text-[#7E9FA8] hover:text-rose-600 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. Sleep Tracker */}
        {activeTab === 'sleep' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4]">
                Nightly Sleep Records
              </h4>
              <span className="text-xs text-[#7E9FA8] dark:text-[#789B96]">
                Target: {profile?.sleep_goal_hours || 8} hours
              </span>
            </div>

            {sleepLogs.length === 0 ? (
              renderEmptyState(
                'No sleep records yet',
                'Start tracking your daily rest and sleep quality by adding your first entry.',
                <Moon className="w-7 h-7" />,
                () => setModalOpen(true)
              )
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#7E9FA8] dark:text-[#789B96]">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Sleep Duration</th>
                      <th className="py-2.5">Sleep Quality</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8F5F2] dark:divide-[#1C3E43]">
                    {sleepLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F7FCFA] dark:hover:bg-[#122B2F]">
                        <td className="py-3 font-medium text-[#0B343B] dark:text-[#EAF7F4]">{log.log_date}</td>
                        <td className="py-3 font-bold text-[#0B343B] dark:text-[#EAF7F4]">{log.duration_hours} hours</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            log.quality === 'Restful'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                          }`}>
                            {log.quality || 'Normal'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => deleteSleepLog(log.id)}
                            className="p-1 text-[#7E9FA8] hover:text-rose-600 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. Exercise Tracker */}
        {activeTab === 'exercise' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4]">
                Daily Exercise & Movement
              </h4>
              <span className="text-xs text-[#7E9FA8] dark:text-[#789B96]">
                {exerciseLogs.length} total workouts
              </span>
            </div>

            {exerciseLogs.length === 0 ? (
              renderEmptyState(
                'No exercise records yet',
                'Start tracking your daily activities and workouts by adding your first entry.',
                <Flame className="w-7 h-7" />,
                () => setModalOpen(true)
              )
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#7E9FA8] dark:text-[#789B96]">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Activity</th>
                      <th className="py-2.5">Duration</th>
                      <th className="py-2.5">Calories Burned</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8F5F2] dark:divide-[#1C3E43]">
                    {exerciseLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F7FCFA] dark:hover:bg-[#122B2F]">
                        <td className="py-3 font-medium text-[#0B343B] dark:text-[#EAF7F4]">{log.log_date}</td>
                        <td className="py-3 font-bold text-[#0B343B] dark:text-[#EAF7F4]">{log.activity_type}</td>
                        <td className="py-3 text-[#476A76] dark:text-[#A9C5C1]">{log.duration_minutes} minutes</td>
                        <td className="py-3 font-bold text-amber-600 dark:text-amber-400">{log.calories_burned || '—'} kcal</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => deleteExerciseLog(log.id)}
                            className="p-1 text-[#7E9FA8] hover:text-rose-600 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. Daily Steps */}
        {activeTab === 'steps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-[#E0F7F1]/70 dark:bg-[#163B38]/60 rounded-2xl border border-[#A8E6D5] dark:border-[#234E54]">
              <div>
                <span className="text-xs font-bold text-[#168B83] dark:text-[#64D8C1] uppercase tracking-wide">
                  Steps Today
                </span>
                <div className="text-2xl font-black text-[#0B343B] dark:text-[#EAF7F4] mt-1">
                  {getTodaySteps().toLocaleString()} steps
                </div>
              </div>
              <span className="text-xs font-semibold text-[#168B83] dark:text-[#64D8C1]">
                Target: {profile?.step_goal?.toLocaleString() || '10,000'} steps
              </span>
            </div>

            {stepLogs.length === 0 ? (
              renderEmptyState(
                'No step records yet',
                'Start building your walking habit by adding your first daily step count.',
                <Footprints className="w-7 h-7" />,
                () => setModalOpen(true)
              )
            ) : (
              <div className="divide-y divide-[#E8F5F2] dark:divide-[#1C3E43]">
                {stepLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#0B343B] dark:text-[#EAF7F4]">{log.log_date}</span>
                    <span className="font-bold text-[#168B83] dark:text-[#64D8C1]">{log.step_count.toLocaleString()} steps</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. Blood Pressure */}
        {activeTab === 'bp' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] rounded-2xl text-xs text-[#476A76] dark:text-[#A9C5C1] leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-[#168B83] dark:text-[#64D8C1] shrink-0 mt-0.5" />
              <span>
                <strong>Understanding your reading:</strong> A normal resting blood pressure is generally under <strong>120 / 80 mmHg</strong>. The first number is your systolic pressure (heart pumping), and the second is diastolic (between beats).
              </span>
            </div>

            {bloodPressureLogs.length === 0 ? (
              renderEmptyState(
                'No blood pressure records yet',
                'Start tracking your blood pressure by adding your first systolic and diastolic reading.',
                <Activity className="w-7 h-7" />,
                () => setModalOpen(true)
              )
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#7E9FA8] dark:text-[#789B96]">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Blood Pressure</th>
                      <th className="py-2.5">Pulse</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8F5F2] dark:divide-[#1C3E43]">
                    {bloodPressureLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F7FCFA] dark:hover:bg-[#122B2F]">
                        <td className="py-3 font-medium text-[#0B343B] dark:text-[#EAF7F4]">{log.log_date}</td>
                        <td className="py-3 font-bold text-[#0B343B] dark:text-[#EAF7F4]">{log.systolic} / {log.diastolic} mmHg</td>
                        <td className="py-3 text-[#476A76] dark:text-[#A9C5C1]">{log.pulse ? `${log.pulse} BPM` : '—'}</td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            {log.category || 'Logged'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => deleteBloodPressureLog(log.id)}
                            className="p-1 text-[#7E9FA8] hover:text-rose-600 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 7. Blood Sugar */}
        {activeTab === 'glucose' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] rounded-2xl text-xs text-[#476A76] dark:text-[#A9C5C1] leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-[#168B83] dark:text-[#64D8C1] shrink-0 mt-0.5" />
              <span>
                <strong>Everyday Guide:</strong> Before breakfast (fasting), a normal blood sugar level is typically between <strong>70 and 100 mg/dL</strong>. Two hours after meals, it is usually under <strong>140 mg/dL</strong>.
              </span>
            </div>

            {bloodGlucoseLogs.length === 0 ? (
              renderEmptyState(
                'No blood sugar records yet',
                'Start tracking your fasting and post-meal glucose levels by adding your first entry.',
                <Heart className="w-7 h-7" />,
                () => setModalOpen(true)
              )
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#7E9FA8] dark:text-[#789B96]">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Sugar Level</th>
                      <th className="py-2.5">When Taken</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8F5F2] dark:divide-[#1C3E43]">
                    {bloodGlucoseLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F7FCFA] dark:hover:bg-[#122B2F]">
                        <td className="py-3 font-medium text-[#0B343B] dark:text-[#EAF7F4]">{log.log_date}</td>
                        <td className="py-3 font-bold text-[#0B343B] dark:text-[#EAF7F4]">{log.glucose_mg_dl} mg/dL</td>
                        <td className="py-3 text-[#476A76] dark:text-[#A9C5C1]">{log.timing || 'Fasting'}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => deleteBloodGlucoseLog(log.id)}
                            className="p-1 text-[#7E9FA8] hover:text-rose-600 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 8. Heart Rate */}
        {activeTab === 'heart' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4]">
                Resting & Activity Pulse Records
              </h4>
              <span className="text-xs text-[#7E9FA8] dark:text-[#789B96]">
                Normal resting: 60 - 100 BPM
              </span>
            </div>

            {heartRateLogs.length === 0 ? (
              renderEmptyState(
                'No heart rate records yet',
                'Start recording your resting or post-exercise heart rate by adding your first entry.',
                <Heart className="w-7 h-7" />,
                () => setModalOpen(true)
              )
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#7E9FA8] dark:text-[#789B96]">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Heart Rate</th>
                      <th className="py-2.5">Activity State</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8F5F2] dark:divide-[#1C3E43]">
                    {heartRateLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F7FCFA] dark:hover:bg-[#122B2F]">
                        <td className="py-3 font-medium text-[#0B343B] dark:text-[#EAF7F4]">{log.log_date}</td>
                        <td className="py-3 font-bold text-[#0B343B] dark:text-[#EAF7F4]">{log.bpm} BPM</td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E0F7F1] dark:bg-[#163B38] text-[#168B83] dark:text-[#64D8C1]">
                            {log.tag || 'Resting'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => deleteHeartRateLog(log.id)}
                            className="p-1 text-[#7E9FA8] hover:text-rose-600 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CREATION MODAL FOR HEALTH ENTRIES
          ───────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#17363A] rounded-3xl max-w-md w-full border border-[#D8ECE7] dark:border-[#234E54] shadow-2xl p-6 text-[#183447] dark:text-[#EAF7F4] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8ECE7] dark:border-[#234E54]">
              <h3 className="font-bold text-base text-[#0B343B] dark:text-[#EAF7F4]">
                Add {tabs.find((t) => t.id === activeTab)?.label} Entry
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7E9FA8] hover:text-[#0B343B] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#10434C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Weight Form */}
              {activeTab === 'weight' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Body Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={weightVal}
                      onChange={(e) => setWeightVal(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Morning, before breakfast"
                      value={weightNotes}
                      onChange={(e) => setWeightNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                    />
                  </div>
                </>
              )}

              {/* Sleep Form */}
              {activeTab === 'sleep' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Sleep Duration (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Sleep Quality</label>
                    <select
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(e.target.value as any)}
                      className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                    >
                      <option value="Restful">Restful & Deep</option>
                      <option value="Normal">Normal</option>
                      <option value="Disturbed">Disturbed or Interrupted</option>
                    </select>
                  </div>
                </>
              )}

              {/* Exercise Form */}
              {activeTab === 'exercise' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Activity / Exercise Type</label>
                    <select
                      value={exerciseType}
                      onChange={(e) => setExerciseType(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                    >
                      <option value="Walking">Walking / Brisk Walk</option>
                      <option value="Running">Running / Jogging</option>
                      <option value="Cycling">Cycling</option>
                      <option value="Swimming">Swimming</option>
                      <option value="Yoga">Yoga / Stretching</option>
                      <option value="Gym Workout">Gym / Strength Training</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        required
                        value={exerciseMins}
                        onChange={(e) => setExerciseMins(e.target.value)}
                        className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Calories Burned (kcal)</label>
                      <input
                        type="number"
                        value={exerciseCalories}
                        onChange={(e) => setExerciseCalories(e.target.value)}
                        className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Steps Form */}
              {activeTab === 'steps' && (
                <div>
                  <label className="block font-semibold mb-1">Total Steps Count</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={stepVal}
                    onChange={(e) => setStepVal(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                  />
                </div>
              )}

              {/* Blood Pressure Form */}
              {activeTab === 'bp' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Systolic (Upper mmHg)</label>
                      <input
                        type="number"
                        required
                        value={bpSystolic}
                        onChange={(e) => setBpSystolic(e.target.value)}
                        className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Diastolic (Lower mmHg)</label>
                      <input
                        type="number"
                        required
                        value={bpDiastolic}
                        onChange={(e) => setBpDiastolic(e.target.value)}
                        className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Pulse Rate (BPM, Optional)</label>
                    <input
                      type="number"
                      value={bpPulse}
                      onChange={(e) => setBpPulse(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                    />
                  </div>
                </>
              )}

              {/* Glucose Form */}
              {activeTab === 'glucose' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Blood Sugar Level (mg/dL)</label>
                    <input
                      type="number"
                      required
                      value={glucoseVal}
                      onChange={(e) => setGlucoseVal(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">When Reading Was Taken</label>
                    <select
                      value={glucoseTiming}
                      onChange={(e) => setGlucoseTiming(e.target.value as any)}
                      className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                    >
                      <option value="Fasting">Fasting (Before breakfast)</option>
                      <option value="Pre-Meal">Before Lunch / Dinner</option>
                      <option value="Post-Meal">Post-Meal (2 hrs after eating)</option>
                      <option value="Bedtime">Bedtime</option>
                    </select>
                  </div>
                </>
              )}

              {/* Heart Rate Form */}
              {activeTab === 'heart' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Heart Rate (Beats Per Minute / BPM)</label>
                    <input
                      type="number"
                      required
                      value={hrVal}
                      onChange={(e) => setHrVal(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Activity State</label>
                    <select
                      value={hrTag}
                      onChange={(e) => setHrTag(e.target.value as any)}
                      className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] rounded-xl outline-none focus:border-[#168B83]"
                    >
                      <option value="Resting">Resting (Sitting calmly)</option>
                      <option value="Post-Workout">After Workout / Exercise</option>
                      <option value="General">General Daily Activity</option>
                    </select>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] hover:bg-stone-100 dark:hover:bg-[#10434C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#168B83] hover:bg-[#12726B] text-white font-bold text-xs shadow-md shadow-[#168B83]/20 flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
