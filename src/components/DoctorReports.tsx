// CareNova Doctor Reports & Medical Summary
// Dedicated medical records, permanent health details management, vitals summaries, and print-ready PDF generator
// Palette: Forest Teal (#0B343B), Deep Navy (#102D3E), Primary Teal (#168B83), Fresh Mint (#A8E6D5 / #64D8C1)
// Lead Architect: Aryan More

import React, { useState, useEffect } from 'react';
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
  Edit3,
  X,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import { generateHealthSummaryPDF } from '../utils/pdfReportGenerator';

interface DoctorReportsProps {
  onNavigate?: (tab: string) => void;
}

export const DoctorReports: React.FC<DoctorReportsProps> = ({ onNavigate }) => {
  const { user, profile, updateProfile } = useAuth();
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

  // Edit Information Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [gender, setGender] = useState(profile?.gender || 'Male');
  const [height, setHeight] = useState(profile?.height?.toString() || '');
  const [allergies, setAllergies] = useState(profile?.allergies || '');
  const [savingDetails, setSavingDetails] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Sync modal form with profile whenever profile updates
  useEffect(() => {
    if (profile) {
      setBloodGroup(profile.blood_group || '');
      setAge(profile.age ? profile.age.toString() : '');
      setGender(profile.gender || 'Male');
      setHeight(profile.height ? profile.height.toString() : '');
      setAllergies(profile.allergies || '');
    }
  }, [profile]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);

    const { error } = await updateProfile({
      blood_group: bloodGroup || null,
      age: age ? parseInt(age) : null,
      gender: gender as any,
      height: height ? parseFloat(height) : null,
      allergies: allergies || null,
    });

    setSavingDetails(false);
    if (!error) {
      setSaveSuccessMsg(true);
      setTimeout(() => {
        setSaveSuccessMsg(false);
        setEditModalOpen(false);
      }, 1500);
    }
  };

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

  const hasEnteredHealthDetails = !!(profile?.blood_group || profile?.age || profile?.height);

  return (
    <div className="space-y-6 animate-fadeIn text-[#183447] dark:text-[#EAF7F4]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F7F1] dark:bg-[#163B38] border border-[#A8E6D5] dark:border-[#234E54] text-[#168B83] dark:text-[#64D8C1] text-xs font-semibold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Appointment Companion</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B343B] dark:text-[#EAF7F4]">
            Doctor Reports & Medical Summary
          </h1>
          <p className="text-sm text-[#476A76] dark:text-[#A9C5C1] mt-1 max-w-2xl">
            Everything your doctor needs to see during your appointment. Review your baseline vitals, current medications, and download a printable health summary.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleDownload}
          className="px-6 py-3.5 rounded-2xl bg-[#168B83] hover:bg-[#12726B] text-white font-bold text-sm shadow-md shadow-[#168B83]/25 flex items-center justify-center gap-2.5 transition-all hover:scale-105 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Main Download Banner */}
      <div className="bg-gradient-to-r from-[#0B343B] via-[#102D3E] to-[#0B343B] dark:from-[#09141C] dark:via-[#102D32] dark:to-[#09141C] rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-[#134B54] dark:border-[#14353B]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#168B83]/30 text-[#A8E6D5] text-xs font-semibold border border-[#168B83]/40">
            <FileText className="w-3.5 h-3.5" />
            <span>Print-Ready A4 Document</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            Single-Sheet Clinical Health Summary
          </h2>
          <p className="text-xs md:text-sm text-[#EAF7F4]/80 max-w-2xl leading-relaxed">
            Exports all your tracked blood pressure readings, blood sugar logs, adherence to prescribed medicines, and physical activity onto a clean, structured report designed specifically for your doctor.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white dark:bg-[#17363A] text-[#0B343B] dark:text-[#64D8C1] hover:bg-[#E0F7F1] dark:hover:bg-[#10434C] font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4 text-[#168B83] dark:text-[#64D8C1]" />
            <span>Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Patient Profile Card & Quick Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Profile Overview */}
        <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E0F7F1] dark:bg-[#163B38] border border-[#A8E6D5] dark:border-[#234E54] text-[#168B83] dark:text-[#64D8C1] flex items-center justify-center font-bold">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#7E9FA8] dark:text-[#789B96]">
                  Patient Profile
                </span>
                <h3 className="text-lg font-bold text-[#0B343B] dark:text-[#EAF7F4]">
                  {profile?.full_name || user?.full_name || 'Patient'}
                </h3>
                <p className="text-xs text-[#476A76] dark:text-[#A9C5C1]">
                  {user?.email || 'CareNova Member'}
                </p>
              </div>
            </div>

            {/* Edit Information Option */}
            <button
              onClick={() => setEditModalOpen(true)}
              className="p-2 rounded-xl text-[#168B83] dark:text-[#64D8C1] bg-[#E0F7F1] dark:bg-[#163B38] hover:bg-[#A8E6D5]/40 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Edit personal health information"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {/* First Time Prompt if Blood Group is Not Entered */}
          {!hasEnteredHealthDetails && (
            <div className="p-3 rounded-2xl bg-[#E0F7F1] dark:bg-[#163B38] border border-[#A8E6D5] dark:border-[#234E54] text-xs text-[#0B343B] dark:text-[#EAF7F4] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#168B83] dark:text-[#64D8C1] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Permanent Health Details</p>
                <p className="text-[11px] text-[#476A76] dark:text-[#A9C5C1] mt-0.5">
                  Enter your blood group once so it automatically appears on all your reports and doctor summaries.
                </p>
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="mt-2 px-3 py-1 bg-[#168B83] text-white rounded-lg font-semibold text-[11px] hover:bg-[#12726B]"
                >
                  + Add Information Now
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#D8ECE7] dark:border-[#234E54] space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#E8F5F2] dark:border-[#1C3E43]">
              <span className="text-[#476A76] dark:text-[#A9C5C1]">Blood Group:</span>
              <span className="font-bold text-[#168B83] dark:text-[#64D8C1] bg-[#E0F7F1] dark:bg-[#163B38] px-2.5 py-0.5 rounded-md border border-[#A8E6D5] dark:border-[#234E54]">
                {profile?.blood_group || 'Not entered yet'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#E8F5F2] dark:border-[#1C3E43]">
              <span className="text-[#476A76] dark:text-[#A9C5C1]">Age:</span>
              <span className="font-semibold text-[#0B343B] dark:text-[#EAF7F4]">
                {profile?.age ? `${profile.age} years` : 'Not specified'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#E8F5F2] dark:border-[#1C3E43]">
              <span className="text-[#476A76] dark:text-[#A9C5C1]">Gender:</span>
              <span className="font-semibold text-[#0B343B] dark:text-[#EAF7F4] capitalize">
                {profile?.gender || 'Not specified'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#E8F5F2] dark:border-[#1C3E43]">
              <span className="text-[#476A76] dark:text-[#A9C5C1]">Height:</span>
              <span className="font-semibold text-[#0B343B] dark:text-[#EAF7F4]">
                {profile?.height ? `${profile.height} cm` : 'Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[#476A76] dark:text-[#A9C5C1]">Known Allergies:</span>
              <span className="font-semibold text-[#0B343B] dark:text-[#EAF7F4]">
                {profile?.allergies || 'None documented'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Vitals for Doctor */}
        <div className="lg:col-span-2 bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#168B83] dark:text-[#64D8C1]" />
              <h3 className="text-base font-bold text-[#0B343B] dark:text-[#EAF7F4]">
                Recent Tracked Vitals
              </h3>
            </div>
            <span className="text-xs text-[#7E9FA8] dark:text-[#789B96]">Included in PDF Summary</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blood Pressure Card */}
            <div className="p-4 rounded-2xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1]">Blood Pressure</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-[#0B343B] dark:text-[#EAF7F4]">
                {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'}
                <span className="text-xs font-normal text-[#7E9FA8] dark:text-[#789B96] ml-1">mmHg</span>
              </div>
              <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] leading-snug">
                {getBPSummary()}
              </p>
            </div>

            {/* Blood Sugar Card */}
            <div className="p-4 rounded-2xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1]">Blood Sugar (Glucose)</span>
                <Droplets className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-[#0B343B] dark:text-[#EAF7F4]">
                {latestGlucose ? `${latestGlucose.glucose_mg_dl}` : '--'}
                <span className="text-xs font-normal text-[#7E9FA8] dark:text-[#789B96] ml-1">mg/dL</span>
              </div>
              <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] leading-snug">
                {getGlucoseSummary()}
              </p>
            </div>

            {/* Body Weight */}
            <div className="p-4 rounded-2xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1]">Body Weight</span>
                <Activity className="w-4 h-4 text-[#168B83] dark:text-[#64D8C1]" />
              </div>
              <div className="text-2xl font-black text-[#0B343B] dark:text-[#EAF7F4]">
                {latestWeight ? `${latestWeight.weight}` : '--'}
                <span className="text-xs font-normal text-[#7E9FA8] dark:text-[#789B96] ml-1">kg</span>
              </div>
              <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] leading-snug">
                {latestWeight ? 'Logged recently in your weight tracker' : 'No recent weight logged'}
              </p>
            </div>

            {/* Medicine Compliance */}
            <div className="p-4 rounded-2xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1]">Prescription On-Time Rate</span>
                <Pill className="w-4 h-4 text-[#168B83] dark:text-[#64D8C1]" />
              </div>
              <div className="text-2xl font-black text-[#0B343B] dark:text-[#EAF7F4]">
                {adherence}%
              </div>
              <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] leading-snug">
                {adherence >= 80 ? 'Excellent adherence to prescribed doses' : 'Some doses missed; helpful to review with doctor'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions & Doctor Visit Preparation Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Prescriptions */}
        <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#168B83] dark:text-[#64D8C1]" />
              <h3 className="text-base font-bold text-[#0B343B] dark:text-[#EAF7F4]">
                Active Prescriptions
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1]">
              {medications.length} total
            </span>
          </div>

          {medications.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] text-center text-xs text-[#476A76] dark:text-[#A9C5C1]">
              No medications listed yet. Add your medications in the Prescriptions tab to have them included in your doctor report.
            </div>
          ) : (
            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-2xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-[#0B343B] dark:text-[#EAF7F4]">{med.name}</h4>
                    <p className="text-[#476A76] dark:text-[#A9C5C1] mt-0.5">
                      {med.dosage} • {med.frequency}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#E0F7F1] dark:bg-[#163B38] border border-[#A8E6D5] dark:border-[#234E54] text-[#168B83] dark:text-[#64D8C1] font-semibold">
                    {med.reminder_time || 'Daily'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doctor Visit Preparation Checklist */}
        <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#168B83] dark:text-[#64D8C1]" />
            <h3 className="text-base font-bold text-[#0B343B] dark:text-[#EAF7F4]">
              Doctor Appointment Checklist
            </h3>
          </div>

          <div className="space-y-3 text-xs text-[#476A76] dark:text-[#A9C5C1]">
            <div className="p-3 rounded-2xl bg-[#E0F7F1]/60 dark:bg-[#163B38]/60 border border-[#A8E6D5] dark:border-[#234E54] flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#168B83] dark:text-[#64D8C1] mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-[#0B343B] dark:text-[#EAF7F4] block">Bring your printed CareNova PDF report</span>
                Doctors appreciate a clean, 1-page chronological overview of your blood pressure, sugar, and weight logs.
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#7E9FA8] dark:text-[#789B96] mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-[#0B343B] dark:text-[#EAF7F4] block">List your questions in advance</span>
                Write down any side effects, changes in appetite, or specific questions so you don't forget during the consultation.
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#7E9FA8] dark:text-[#789B96] mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-[#0B343B] dark:text-[#EAF7F4] block">Mention over-the-counter supplements</span>
                Tell your doctor about any vitamins, herbal products, or supplements you take alongside prescriptions.
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-[#0B343B] dark:text-[#EAF7F4] block">Fasting for blood tests</span>
                If getting fasting blood sugar or lipid profile tests, confirm fasting guidelines (usually 8-12 hours) with your clinic.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          EDIT PERSONAL HEALTH INFORMATION MODAL
          ───────────────────────────────────────────────────────────── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#17363A] rounded-3xl max-w-md w-full border border-[#D8ECE7] dark:border-[#234E54] shadow-2xl p-6 text-[#183447] dark:text-[#EAF7F4] space-y-5 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D8ECE7] dark:border-[#234E54]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E0F7F1] dark:bg-[#163B38] text-[#168B83] dark:text-[#64D8C1] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0B343B] dark:text-[#EAF7F4]">
                    Edit Health Details
                  </h3>
                  <p className="text-[11px] text-[#476A76] dark:text-[#A9C5C1]">
                    Permanent information saved safely in your account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7E9FA8] hover:text-[#0B343B] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#10434C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccessMsg ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-emerald-700 dark:text-emerald-400">
                  Health Details Saved!
                </h4>
                <p className="text-xs text-[#476A76] dark:text-[#A9C5C1]">
                  Your blood group and health records are updated and will stay saved permanently.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveDetails} className="space-y-4">
                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-semibold text-[#0B343B] dark:text-[#EAF7F4] mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-xs font-semibold text-[#0B343B] dark:text-[#EAF7F4] outline-none focus:border-[#168B83]"
                  >
                    <option value="">Select your Blood Group</option>
                    <option value="A+">A Positive (A+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                    <option value="O+">O Positive (O+)</option>
                    <option value="O-">O Negative (O-)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Age */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0B343B] dark:text-[#EAF7F4] mb-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 28"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-xs text-[#0B343B] dark:text-[#EAF7F4] outline-none focus:border-[#168B83]"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0B343B] dark:text-[#EAF7F4] mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-xs text-[#0B343B] dark:text-[#EAF7F4] outline-none focus:border-[#168B83]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Height */}
                <div>
                  <label className="block text-xs font-semibold text-[#0B343B] dark:text-[#EAF7F4] mb-1">
                    Height in Centimeters (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 172"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-xs text-[#0B343B] dark:text-[#EAF7F4] outline-none focus:border-[#168B83]"
                  />
                </div>

                {/* Known Allergies */}
                <div>
                  <label className="block text-xs font-semibold text-[#0B343B] dark:text-[#EAF7F4] mb-1">
                    Known Allergies or Reactions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts, None"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-xs text-[#0B343B] dark:text-[#EAF7F4] outline-none focus:border-[#168B83]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] hover:bg-stone-100 dark:hover:bg-[#10434C]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingDetails}
                    className="px-5 py-2.5 rounded-xl bg-[#168B83] hover:bg-[#12726B] text-white font-bold text-xs shadow-md shadow-[#168B83]/25 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingDetails ? 'Saving...' : 'Save Health Details'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
