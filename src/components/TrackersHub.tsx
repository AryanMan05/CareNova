// Module B: 8 Dedicated Health Trackers with Full CRUD Modals
// Simple labels: Water, Weight, Sleep, Exercise, Steps, Blood Pressure, Blood Sugar, Heart Rate
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
    { id: 'water', label: 'Water Intake', icon: Droplets, color: 'text-sky-600' },
    { id: 'weight', label: 'Weight & BMI', icon: Scale, color: 'text-indigo-600' },
    { id: 'sleep', label: 'Sleep Log', icon: Moon, color: 'text-violet-600' },
    { id: 'exercise', label: 'Exercise & Walking', icon: Flame, color: 'text-amber-600' },
    { id: 'steps', label: 'Daily Steps', icon: Footprints, color: 'text-emerald-600' },
    { id: 'bp', label: 'Blood Pressure', icon: Activity, color: 'text-rose-600' },
    { id: 'glucose', label: 'Blood Sugar', icon: Heart, color: 'text-orange-600' },
    { id: 'heart', label: 'Heart Rate', icon: Heart, color: 'text-pink-600' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Daily Health Trackers
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Easily record your daily habits, check your past entries, and keep a consistent personal health history.
          </p>
        </div>

        {activeTab !== 'water' && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
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
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tracker Container */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-2xs">
        {/* 1. Water Tracker */}
        {activeTab === 'water' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-sky-50/70 border border-sky-100">
              <div>
                <h3 className="text-lg font-bold text-sky-950">Water Intake Today</h3>
                <p className="text-xs text-sky-800 mt-1">
                  1 glass = 250 ml. Your recommended target is {profile?.water_goal_glasses || 8} glasses (about 2 liters).
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-black text-sky-950">
                  {getTodayWaterGlasses()}{' '}
                  <span className="text-sm font-semibold text-sky-800">/ {profile?.water_goal_glasses || 8} glasses</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => logWater(-1)}
                    className="p-2 px-3 rounded-xl bg-white text-sky-900 shadow-2xs font-bold text-xs hover:bg-sky-100 transition-colors"
                  >
                    -1 Glass
                  </button>
                  <button
                    onClick={() => logWater(1)}
                    className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-600/20 hover:bg-sky-700 transition-colors"
                  >
                    +1 Glass (250ml)
                  </button>
                </div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-stone-800">Past Water Logs</h4>
            <div className="divide-y divide-stone-100">
              {waterLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-4 h-4 text-sky-500" />
                    <span className="font-semibold text-stone-800">{log.log_date}</span>
                  </div>
                  <span className="font-bold text-stone-900">{log.glasses} Glasses ({log.glasses * 250} ml)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Weight Tracker */}
        {activeTab === 'weight' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-stone-800">Weight & BMI History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-xs text-stone-400">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Weight (kg)</th>
                    <th className="py-2.5">Body Mass Index (BMI)</th>
                    <th className="py-2.5">Notes</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {weightLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50">
                      <td className="py-3 font-medium text-stone-800">{log.log_date}</td>
                      <td className="py-3 font-bold text-stone-900">{log.weight} kg</td>
                      <td className="py-3 font-semibold text-indigo-700">{log.bmi || '—'}</td>
                      <td className="py-3 text-stone-500">{log.notes || '—'}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteWeightLog(log.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Sleep Tracker */}
        {activeTab === 'sleep' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-stone-800">Nightly Sleep Duration</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-xs text-stone-400">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Sleep Duration</th>
                    <th className="py-2.5">Sleep Quality</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {sleepLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50">
                      <td className="py-3 font-medium text-stone-800">{log.log_date}</td>
                      <td className="py-3 font-bold text-stone-900">{log.duration_hours} hours</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          log.quality === 'Restful' ? 'bg-violet-100 text-violet-800' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {log.quality || 'Normal'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteSleepLog(log.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Exercise Tracker */}
        {activeTab === 'exercise' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-stone-800">Daily Exercise & Movement</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-xs text-stone-400">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Activity</th>
                    <th className="py-2.5">Duration</th>
                    <th className="py-2.5">Calories Burned</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {exerciseLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50">
                      <td className="py-3 font-medium text-stone-800">{log.log_date}</td>
                      <td className="py-3 font-bold text-stone-900">{log.activity_type}</td>
                      <td className="py-3 text-stone-700">{log.duration_minutes} minutes</td>
                      <td className="py-3 font-bold text-amber-600">{log.calories_burned || '—'} kcal</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteExerciseLog(log.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Daily Steps */}
        {activeTab === 'steps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Steps Today</span>
                <div className="text-2xl font-black text-emerald-950 mt-1">
                  {getTodaySteps().toLocaleString()} steps
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700">
                Target: {profile?.step_goal?.toLocaleString() || '10,000'} steps
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {stepLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-stone-800">{log.log_date}</span>
                  <span className="font-bold text-stone-900">{log.step_count.toLocaleString()} steps</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Blood Pressure */}
        {activeTab === 'bp' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-700 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Understanding your reading:</strong> A normal resting blood pressure is generally under <strong>120 / 80 mmHg</strong>. The first number is your heart pumping, the second is between beats.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-xs text-stone-400">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Blood Pressure</th>
                    <th className="py-2.5">Pulse</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {bloodPressureLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50">
                      <td className="py-3 font-medium text-stone-800">{log.log_date}</td>
                      <td className="py-3 font-bold text-stone-900">{log.systolic} / {log.diastolic} mmHg</td>
                      <td className="py-3 text-stone-600">{log.pulse ? `${log.pulse} BPM` : '—'}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          {log.category || 'Logged'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteBloodPressureLog(log.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Blood Sugar */}
        {activeTab === 'glucose' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-700 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Everyday Guide:</strong> Before breakfast (fasting), a normal blood sugar level is usually between <strong>70 and 100 mg/dL</strong>. Two hours after meals, it is typically under <strong>140 mg/dL</strong>.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-xs text-stone-400">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Sugar Level</th>
                    <th className="py-2.5">When Taken</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {bloodGlucoseLogs.map((log) => {
                    const status = classifyBloodGlucose(log.glucose_mg_dl, log.timing || 'Fasting');
                    return (
                      <tr key={log.id} className="hover:bg-stone-50">
                        <td className="py-3 font-medium text-stone-800">{log.log_date}</td>
                        <td className="py-3 font-bold text-stone-900">{log.glucose_mg_dl} mg/dL</td>
                        <td className="py-3 text-stone-600">{log.timing || 'Fasting'}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => deleteBloodGlucoseLog(log.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. Heart Rate */}
        {activeTab === 'heart' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-xs text-stone-400">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Heart Rate</th>
                    <th className="py-2.5">Activity State</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {heartRateLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50">
                      <td className="py-3 font-medium text-stone-800">{log.log_date}</td>
                      <td className="py-3 font-bold text-stone-900">{log.bpm} BPM</td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-800 border border-pink-200">
                          {log.tag || 'General'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteHeartRateLog(log.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Dialog for Recording Entry */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 capitalize">Record {activeTab} Entry</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              {activeTab === 'weight' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={weightVal}
                      onChange={(e) => setWeightVal(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Optional Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Weighed in morning before breakfast"
                      value={weightNotes}
                      onChange={(e) => setWeightNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                </>
              )}

              {activeTab === 'sleep' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Hours Slept</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">How was your sleep quality?</label>
                    <select
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600 bg-white"
                    >
                      <option value="Restful">Restful (Slept deeply)</option>
                      <option value="Normal">Normal (Average sleep)</option>
                      <option value="Disturbed">Disturbed (Woke up multiple times)</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'exercise' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Activity Type</label>
                    <select
                      value={exerciseType}
                      onChange={(e) => setExerciseType(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600 bg-white"
                    >
                      <option value="Walking">Walking</option>
                      <option value="Running">Running</option>
                      <option value="Cycling">Cycling</option>
                      <option value="Gym / Weights">Gym / Strength training</option>
                      <option value="Yoga">Yoga / Stretching</option>
                      <option value="Swimming">Swimming</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Minutes</label>
                      <input
                        type="number"
                        required
                        value={exerciseMins}
                        onChange={(e) => setExerciseMins(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Est. Calories Burned</label>
                      <input
                        type="number"
                        value={exerciseCalories}
                        onChange={(e) => setExerciseCalories(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'steps' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Total Steps Today</label>
                  <input
                    type="number"
                    required
                    value={stepVal}
                    onChange={(e) => setStepVal(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600"
                  />
                </div>
              )}

              {activeTab === 'bp' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Top (Systolic)</label>
                    <input
                      type="number"
                      required
                      placeholder="120"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Bottom (Diastolic)</label>
                    <input
                      type="number"
                      required
                      placeholder="80"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Pulse (BPM)</label>
                    <input
                      type="number"
                      placeholder="72"
                      value={bpPulse}
                      onChange={(e) => setBpPulse(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'glucose' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Blood Sugar (mg/dL)</label>
                    <input
                      type="number"
                      required
                      value={glucoseVal}
                      onChange={(e) => setGlucoseVal(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">When did you test?</label>
                    <select
                      value={glucoseTiming}
                      onChange={(e) => setGlucoseTiming(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600 bg-white"
                    >
                      <option value="Fasting">Before breakfast (Fasting)</option>
                      <option value="Pre-Meal">Before a meal</option>
                      <option value="Post-Meal">2 hours after a meal</option>
                      <option value="Bedtime">Before going to sleep</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'heart' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Heart Beats Per Minute (BPM)</label>
                    <input
                      type="number"
                      required
                      value={hrVal}
                      onChange={(e) => setHrVal(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Current State</label>
                    <select
                      value={hrTag}
                      onChange={(e) => setHrTag(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-indigo-600 bg-white"
                    >
                      <option value="Resting">Resting calmly</option>
                      <option value="Post-Workout">Right after exercise</option>
                      <option value="General">General / Routine reading</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
