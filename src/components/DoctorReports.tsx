// CareNova Doctor Reports View
// Dedicated medical records, vital summaries, doctor visit preparation, and PDF report generator
// Lead Architect: Aryan More

import React from 'react';
import {
  FileText,
  Download,
  Activity,
  Heart,
  Droplets,
  CheckCircle2,
  Pill,
  User,
  ClipboardList,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import { generateHealthSummaryPDF } from '../utils/pdfReportGenerator';

export const DoctorReports: React.FC = () => {
  const { user, profile } = useAuth();
  const {
    getLatestWeight,
    getLatestBloodPressure,
    getLatestGlucose,
    getTodaySteps,
    getTodayWaterGlasses,
    medications,
    getMedicationAdherenceRate,
  } = useHealthData();

  const latestWeight = getLatestWeight();
  const latestBP = getLatestBloodPressure();
  const latestGlucose = getLatestGlucose();
  const todaySteps = getTodaySteps();
  const todayWater = getTodayWaterGlasses();
  const adherence = getMedicationAdherenceRate();

  const handleDownload = () => {
    generateHealthSummaryPDF({
      profile,
      latestWeight,
      latestBP,
      latestGlucose,
      todaySteps,
      todayWaterGlasses: todayWater,
      medications,
      adherenceRate: adherence,
    });
  };

  // Helper interpretations
  const getBPSummary = () => {
    if (!latestBP) return 'No blood pressure logged recently';
    if (latestBP.systolic < 120 && latestBP.diastolic < 80) return 'Normal & healthy blood pressure';
    if (latestBP.systolic <= 129 && latestBP.diastolic < 80) return 'Slightly elevated (watch salt intake)';
    if (latestBP.systolic <= 139 || latestBP.diastolic <= 89) return 'Stage 1 High Blood Pressure (discuss with doctor)';
    return 'High Blood Pressure (share this with your doctor)';
  };

  const getGlucoseSummary = () => {
    if (!latestGlucose) return 'No blood sugar logged recently';
    if (latestGlucose.glucose_mg_dl < 70) return 'Low blood sugar level (hypoglycemia risk)';
    if (latestGlucose.glucose_mg_dl <= 99) return 'Normal fasting sugar level';
    if (latestGlucose.glucose_mg_dl <= 125) return 'Pre-diabetes range (discuss diet with doctor)';
    return 'Elevated sugar level (consult your doctor)';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Appointment Companion</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Doctor Reports & Medical Summary
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            Everything your doctor needs to see during your appointment. Review your vitals, current medications, and download a printable health summary.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleDownload}
          className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-105 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Main Download Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-stone-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <FileText className="w-3.5 h-3.5" />
            <span>Print-Ready A4 Document</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            Single-Sheet Clinical Health Summary
          </h2>
          <p className="text-xs md:text-sm text-stone-300 max-w-2xl leading-relaxed">
            Exports all your tracked blood pressure readings, blood sugar logs, adherence to prescribed medicines, and physical activity onto a clean, structured report designed specifically for your doctor.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-stone-900 hover:bg-stone-100 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Patient Profile Card & Quick Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Profile Overview */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400">
                Patient Profile
              </span>
              <h3 className="text-lg font-bold text-stone-900">
                {profile?.full_name || 'Patient'}
              </h3>
              <p className="text-xs text-stone-500">
                {user?.email || 'CareNova Member'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-stone-50">
              <span className="text-stone-500">Age:</span>
              <span className="font-semibold text-stone-800">{profile?.age ? `${profile.age} years` : 'Not specified'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-stone-50">
              <span className="text-stone-500">Gender:</span>
              <span className="font-semibold text-stone-800 capitalize">{profile?.gender || 'Not specified'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-stone-50">
              <span className="text-stone-500">Blood Group:</span>
              <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                {profile?.blood_group || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-stone-50">
              <span className="text-stone-500">Height:</span>
              <span className="font-semibold text-stone-800">{profile?.height ? `${profile.height} cm` : 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-stone-500">Known Allergies:</span>
              <span className="font-semibold text-stone-800">
                {profile?.allergies || 'None documented'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Vitals for Doctor */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-stone-900">
                Recent Tracked Vitals
              </h3>
            </div>
            <span className="text-xs text-stone-400">Included in PDF</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blood Pressure Card */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600">Blood Pressure</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-stone-900">
                {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'}
                <span className="text-xs font-normal text-stone-500 ml-1">mmHg</span>
              </div>
              <p className="text-xs text-stone-600 leading-snug">
                {getBPSummary()}
              </p>
            </div>

            {/* Blood Sugar Card */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600">Blood Sugar (Glucose)</span>
                <Droplets className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-stone-900">
                {latestGlucose ? `${latestGlucose.glucose_mg_dl}` : '--'}
                <span className="text-xs font-normal text-stone-500 ml-1">mg/dL</span>
              </div>
              <p className="text-xs text-stone-600 leading-snug">
                {getGlucoseSummary()}
              </p>
            </div>

            {/* Body Weight */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600">Body Weight</span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-stone-900">
                {latestWeight ? `${latestWeight.weight}` : '--'}
                <span className="text-xs font-normal text-stone-500 ml-1">kg</span>
              </div>
              <p className="text-xs text-stone-600 leading-snug">
                {latestWeight ? 'Logged recently in your weight tracker' : 'No recent weight logged'}
              </p>
            </div>

            {/* Medicine Compliance */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600">Medication On-Time Rate</span>
                <Pill className="w-4 h-4 text-violet-500" />
              </div>
              <div className="text-2xl font-black text-stone-900">
                {adherence}%
              </div>
              <p className="text-xs text-stone-600 leading-snug">
                {adherence >= 80 ? 'Excellent adherence to prescribed doses' : 'Some doses missed; helpful to review with doctor'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions & Doctor Visit Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Prescriptions */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-stone-900">
                Active Prescriptions
              </h3>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              {medications.length} total
            </span>
          </div>

          {medications.length === 0 ? (
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 text-center text-xs text-stone-500">
              No medications listed yet. Add your medications in the Prescriptions tab to have them included in your doctor report.
            </div>
          ) : (
            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-stone-900">{med.name}</h4>
                    <p className="text-stone-500 mt-0.5">
                      {med.dosage} • {med.frequency}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold">
                    {med.reminder_time || 'Daily'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doctor Visit Preparation Checklist */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-stone-900">
              Doctor Appointment Checklist
            </h3>
          </div>

          <div className="space-y-3 text-xs text-stone-600">
            <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-stone-900 block">Bring your printed CareNova PDF report</span>
                Doctors appreciate a clean, 1-page chronological overview of your blood pressure, sugar, and weight logs.
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-stone-900 block">List your questions in advance</span>
                Write down any side effects, changes in appetite, or specific questions so you don't forget during the consultation.
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-stone-900 block">Mention over-the-counter supplements</span>
                Tell your doctor about any vitamins, herbal products, or supplements you take alongside prescriptions.
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-stone-900 block">Fasting for blood tests</span>
                If getting fasting blood sugar or lipid profile tests, confirm fasting guidelines (usually 8-12 hours) with your clinic.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
