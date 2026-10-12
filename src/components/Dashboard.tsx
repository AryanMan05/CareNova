// Module A: Unified Health Cockpit Dashboard
// Simple, clean, user-friendly language, soft ivory & indigo visual styling
// Lead Architect: Aryan More

import React, { useState } from 'react';
import {
  Droplets,
  Scale,
  Footprints,
  Heart,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import { calculateBMI } from '../utils/clinicalCalculators';
import { generateHealthSummaryPDF } from '../utils/pdfReportGenerator';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardProps {
  onNavigate: (tabId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const {
    weightLogs,
    medications,
    medicationLogs,
    logWater,
    toggleMedicationLog,
    getTodayWaterGlasses,
    getLatestWeight,
    getTodaySteps,
    getLatestBloodPressure,
    getLatestGlucose,
    getMedicationAdherenceRate,
  } = useHealthData();

  const [waterUpdating, setWaterUpdating] = useState(false);
  const [trendRange, setTrendRange] = useState<'7' | '30'>('7');

  const todayWater = getTodayWaterGlasses();
  const waterGoal = profile?.water_goal_glasses || 8;
  const latestWeightLog = getLatestWeight();
  const currentWeight = latestWeightLog ? latestWeightLog.weight : profile?.weight || 70;
  const heightCm = profile?.height || 175;
  const bmiInfo = calculateBMI(currentWeight, heightCm);

  const todaySteps = getTodaySteps();
  const stepGoal = profile?.step_goal || 10000;
  const latestBP = getLatestBloodPressure();
  const latestGlucose = getLatestGlucose();
  const adherenceScore = getMedicationAdherenceRate();

  const handleWaterClick = async (delta: number) => {
    setWaterUpdating(true);
    await logWater(delta);
    setWaterUpdating(false);
  };

  const handleDownloadPDF = () => {
    generateHealthSummaryPDF({
      profile,
      latestWeight: latestWeightLog,
      latestBP,
      latestGlucose,
      todaySteps,
      todayWaterGlasses: todayWater,
      medications,
      adherenceRate: adherenceScore,
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const chartData = [...weightLogs]
    .slice(0, trendRange === '7' ? 7 : 30)
    .reverse()
    .map((w) => ({
      date: w.log_date.slice(5),
      weight: w.weight,
      bmi: w.bmi || 22,
    }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome Banner: Indigo & Periwinkle with warm subtle accents */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-950/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold tracking-wide text-indigo-200 mb-2.5 border border-white/15">
              <span>Personal Health Cockpit</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile?.full_name ? profile.full_name.split(' ')[0] : 'friend'}!
            </h1>
            <p className="text-xs md:text-sm text-indigo-100/90 mt-1 max-w-xl leading-relaxed">
              Here is your daily health snapshot. Track your water, review your vitals, check your medicines, or download a clean report for your doctor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs shadow-md hover:bg-stone-50 transition-all hover:scale-105"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Download Doctor Report</span>
            </button>
            <button
              onClick={() => onNavigate('symptom-checker')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-rose-300" />
              <span>Check Symptoms</span>
            </button>
          </div>
        </div>

        {/* Ambient lavender glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-violet-400/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Real-Time Health Telemetry Cards (Simplified everyday English) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Weight & BMI */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Body Weight</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-stone-900 tracking-tight">
              {currentWeight} <span className="text-xs font-semibold text-stone-500">kg</span>
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-stone-500">Body Mass Index: <strong>{bmiInfo.bmi}</strong></span>
            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">
              {bmiInfo.category}
            </span>
          </div>
        </div>

        {/* Card 2: Water Tracker */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Water Intake Today</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-stone-900 tracking-tight">
              {todayWater} <span className="text-xs font-semibold text-stone-500">/ {waterGoal} glasses</span>
            </span>
            <span className="text-xs font-bold text-sky-600">
              {Math.min(100, Math.round((todayWater / waterGoal) * 100))}%
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => handleWaterClick(-1)}
              disabled={waterUpdating || todayWater <= 0}
              className="flex-1 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold disabled:opacity-40 transition-colors flex items-center justify-center"
              title="Remove 1 glass"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleWaterClick(1)}
              disabled={waterUpdating}
              className="flex-1 py-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm shadow-sky-600/20"
              title="Add 1 glass (250ml)"
            >
              <Plus className="w-3.5 h-3.5" /> <span>+1 Glass</span>
            </button>
          </div>
        </div>

        {/* Card 3: Daily Steps */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Steps Walked</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Footprints className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-stone-900 tracking-tight">
              {todaySteps.toLocaleString()}{' '}
              <span className="text-xs font-semibold text-stone-500">/ {stepGoal.toLocaleString()}</span>
            </span>
          </div>
          <div className="mt-2.5 w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, (todaySteps / stepGoal) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Blood Pressure & Sugar */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Blood Pressure & Sugar</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-stone-900 tracking-tight">
              {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '118/76'}{' '}
              <span className="text-xs font-semibold text-stone-500">mmHg</span>
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-stone-500">
              Sugar: <strong>{latestGlucose ? `${latestGlucose.glucose_mg_dl} mg/dL` : '92 mg/dL'}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
              {latestBP?.category || 'Normal'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Longitudinal Weight Trajectory */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200/80 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Weight & Health Progress Over Time</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Shows how your body weight has changed over recent days
              </p>
            </div>

            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setTrendRange('7')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  trendRange === '7' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTrendRange('30')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  trendRange === '30' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="indigoWeightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f4ef" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e7e5e4',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                  formatter={(val: any) => [`${val} kg`, 'Weight']}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#indigoWeightGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right (1 col): Today's Medicine Checklist */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-stone-900">Today's Medicines</h2>
                <p className="text-xs text-stone-500 mt-0.5">30-day compliance score: <strong>{adherenceScore}%</strong></p>
              </div>
              <button
                onClick={() => onNavigate('medications')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {medications.length > 0 ? (
                medications.map((med) => {
                  const logToday = medicationLogs.find(
                    (l) => l.medication_id === med.id && l.log_date === todayStr
                  );
                  const isTaken = logToday?.status === 'taken';
                  const isSkipped = logToday?.status === 'skipped';

                  return (
                    <div
                      key={med.id}
                      className="p-3.5 rounded-2xl border border-stone-100 bg-stone-50/60 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-stone-800">{med.name}</div>
                        <div className="text-xs text-stone-500">
                          {med.dosage} • {med.reminder_time || med.frequency}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => toggleMedicationLog(med.id, 'taken')}
                          className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                            isTaken
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-stone-200 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title="I took this medicine"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleMedicationLog(med.id, 'skipped')}
                          className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                            isSkipped
                              ? 'bg-rose-600 text-white'
                              : 'bg-white border border-stone-200 text-stone-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                          title="I skipped this medicine"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-stone-400">
                  No medicines scheduled. Add your prescriptions in the Prescriptions tab.
                </div>
              )}
            </div>
          </div>

          {/* Quick Help Footer */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">Immediate Help:</span>
            <a
              href="tel:112"
              className="text-rose-600 font-bold hover:underline flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" /> Call National Emergency 112 / 108
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
