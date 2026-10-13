// CareNova Interactive Symptom Checker & Emergency Guidance
// Simplified user experience: everyday symptom descriptions, clear emergency buttons
// Palette: Forest Teal (#0B343B), Deep Navy (#102D3E), Primary Teal (#168B83), Fresh Mint (#A8E6D5 / #64D8C1)
// Lead Architect: Aryan More

import React, { useState } from 'react';
import { Phone, ShieldAlert, CheckCircle2, Info, ArrowRight } from 'lucide-react';

interface SymptomOption {
  id: string;
  label: string;
  description: string;
  category: string;
  isRedFlag: boolean;
}

const COMMON_SYMPTOMS: SymptomOption[] = [
  // Red Flag Symptoms (Urgent Emergency)
  {
    id: 's-chest-pain',
    label: 'Heavy or crushing chest pain',
    description: 'Pain or tightness in chest spreading to left arm, neck, or jaw',
    category: 'Emergency',
    isRedFlag: true,
  },
  {
    id: 's-severe-dyspnea',
    label: 'Severe shortness of breath',
    description: 'Struggling to breathe or unable to speak full sentences',
    category: 'Emergency',
    isRedFlag: true,
  },
  {
    id: 's-stroke-signs',
    label: 'Face drooping or arm weakness',
    description: 'Sudden weakness on one side of face/body or slurred speech',
    category: 'Emergency',
    isRedFlag: true,
  },
  {
    id: 's-anaphylaxis',
    label: 'Swollen lips, tongue or wheezing',
    description: 'Sudden severe allergic reaction with throat tightness',
    category: 'Emergency',
    isRedFlag: true,
  },
  {
    id: 's-syncope',
    label: 'Sudden fainting or collapse',
    description: 'Unexplained loss of consciousness or sudden blackout',
    category: 'Emergency',
    isRedFlag: true,
  },

  // Everyday Symptoms
  {
    id: 's-fever',
    label: 'Fever or chills',
    description: 'Body temperature feeling warm, with shivering or sweating',
    category: 'Common',
    isRedFlag: false,
  },
  {
    id: 's-cough',
    label: 'Dry or chesty cough',
    description: 'Throat tickle, dry hacking, or coughing up clear phlegm',
    category: 'Common',
    isRedFlag: false,
  },
  {
    id: 's-headache',
    label: 'Throbbing or tight headache',
    description: 'Dull ache across forehead, temples, or back of the head',
    category: 'Common',
    isRedFlag: false,
  },
  {
    id: 's-fatigue',
    label: 'Feeling tired or low energy',
    description: 'Lethargy, muscle sluggishness, or difficulty waking up',
    category: 'Common',
    isRedFlag: false,
  },
  {
    id: 's-nausea',
    label: 'Upset stomach or nausea',
    description: 'Queasy stomach, mild cramping, or loss of appetite',
    category: 'Common',
    isRedFlag: false,
  },
  {
    id: 's-sore-throat',
    label: 'Scratchy or sore throat',
    description: 'Discomfort when swallowing or dry raspy voice',
    category: 'Common',
    isRedFlag: false,
  },
  {
    id: 's-joint-pain',
    label: 'Aching joints or muscles',
    description: 'Stiffness in knees, lower back, shoulders, or neck',
    category: 'Common',
    isRedFlag: false,
  },
  {
    id: 's-rash',
    label: 'Mild skin rash or itching',
    description: 'Redness, dry patches, or minor hives on skin',
    category: 'Common',
    isRedFlag: false,
  },
];

export const SymptomChecker: React.FC = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('1-3 Days');
  const [severity, setSeverity] = useState<string>('Moderate');
  const [assessmentRun, setAssessmentRun] = useState(false);

  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
    setAssessmentRun(false);
  };

  const hasRedFlag = selectedSymptoms.some((id) => {
    const item = COMMON_SYMPTOMS.find((s) => s.id === id);
    return item?.isRedFlag;
  });

  const handleRunAssessment = () => {
    if (selectedSymptoms.length === 0) return;
    setAssessmentRun(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#183447] dark:text-[#EAF7F4]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B343B] dark:text-[#EAF7F4]">
          Check Your Symptoms & Emergency Guidance
        </h1>
        <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-1">
          Pick what you are feeling to see gentle home-care tips, find out when to visit a clinic, and screen for urgent red flags.
        </p>
      </div>

      {/* Red-Flag Urgent Banner */}
      {hasRedFlag && (
        <div className="bg-rose-600 text-white p-6 rounded-3xl shadow-xl shadow-rose-900/15 border border-rose-700 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-200 shrink-0" />
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  PLEASE CALL FOR EMERGENCY MEDICAL HELP
                </h3>
                <p className="text-xs text-rose-100 mt-1 max-w-xl leading-relaxed">
                  One or more symptoms you selected can be signs of an urgent condition (like a heart or breathing problem). Please do not wait or drive yourself—call for an ambulance right away.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="tel:112"
                className="px-5 py-2.5 rounded-xl bg-white text-rose-700 font-black text-xs shadow-md hover:bg-rose-50 flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Phone className="w-4 h-4 text-rose-600" />
                <span>Call 112 (National)</span>
              </a>
              <a
                href="tel:108"
                className="px-5 py-2.5 rounded-xl bg-rose-800 text-white font-black text-xs border border-white/20 hover:bg-rose-900 flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Phone className="w-4 h-4 text-rose-300" />
                <span>Call 108 (Ambulance)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Symptom Picker Grid */}
      <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4] mb-1">
            Step 1: What are you experiencing right now? ({selectedSymptoms.length} selected)
          </h3>
          <p className="text-xs text-[#476A76] dark:text-[#A9C5C1]">
            Click on any symptoms below to select them:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMMON_SYMPTOMS.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom.id);
            return (
              <button
                key={symptom.id}
                type="button"
                onClick={() => toggleSymptom(symptom.id)}
                className={`p-4 rounded-2xl text-left border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? symptom.isRedFlag
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                      : 'bg-[#E0F7F1] dark:bg-[#163B38] border-[#168B83] text-[#0B343B] dark:text-[#EAF7F4]'
                    : 'bg-[#F7FCFA] dark:bg-[#122B2F] border-[#D8ECE7] dark:border-[#234E54] text-[#0B343B] dark:text-[#EAF7F4] hover:border-[#168B83]'
                }`}
              >
                <div>
                  <span className={`block text-[10px] uppercase tracking-wider font-bold mb-0.5 ${
                    symptom.isRedFlag ? 'text-rose-600 dark:text-rose-400' : 'text-[#7E9FA8] dark:text-[#789B96]'
                  }`}>
                    {symptom.isRedFlag ? '⚠️ Urgent Warning' : symptom.category}
                  </span>
                  <span className="text-xs font-bold block">{symptom.label}</span>
                  <span className="text-[11px] text-[#476A76] dark:text-[#A9C5C1] mt-0.5 block leading-relaxed">
                    {symptom.description}
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${symptom.isRedFlag ? 'text-rose-600' : 'text-[#168B83] dark:text-[#64D8C1]'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Step 2: How long and how strong? */}
        <div className="pt-4 border-t border-[#D8ECE7] dark:border-[#234E54] grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0B343B] dark:text-[#EAF7F4] mb-1">
              How long have you had this?
            </label>
            <select
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setAssessmentRun(false);
              }}
              className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs font-medium outline-none focus:border-[#168B83]"
            >
              <option value="< 24 Hours">Started today (&lt; 24 Hours ago)</option>
              <option value="1-3 Days">1 to 3 Days</option>
              <option value="1 Week">About 1 Week</option>
              <option value="Chronic (> 2 Weeks)">More than 2 Weeks (Ongoing)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B343B] dark:text-[#EAF7F4] mb-1">
              How strong does it feel?
            </label>
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setAssessmentRun(false);
              }}
              className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs font-medium outline-none focus:border-[#168B83]"
            >
              <option value="Mild">Mild (Noticeable, but I can go about my day)</option>
              <option value="Moderate">Moderate (Uncomfortable, makes it hard to focus)</option>
              <option value="Severe">Severe (Very uncomfortable or hard to bear)</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunAssessment}
            disabled={selectedSymptoms.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#168B83] hover:bg-[#12726B] text-white font-bold text-xs shadow-md shadow-[#168B83]/20 disabled:opacity-40 transition-all hover:scale-105"
          >
            <span>Check My Symptoms</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Assessment Summary in Simple English */}
      {assessmentRun && (
        <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 md:p-8 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0B343B] dark:text-[#EAF7F4] flex items-center gap-2">
            <Info className="w-5 h-5 text-[#168B83] dark:text-[#64D8C1]" />
            <span>Helpful Guidance & Recommended Next Steps</span>
          </h3>

          <div className="p-4 rounded-2xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] text-xs text-[#183447] dark:text-[#EAF7F4] leading-relaxed space-y-2">
            <p>
              You selected <strong>{selectedSymptoms.length} symptom(s)</strong> that have been present for <strong>{duration}</strong> with <strong>{severity}</strong> discomfort.
            </p>
            {hasRedFlag ? (
              <p className="text-rose-700 dark:text-rose-300 font-bold">
                ⚠️ Urgent Advice: Please visit the nearest hospital or emergency room right away, or call 112 / 108.
              </p>
            ) : severity === 'Severe' || duration === 'Chronic (> 2 Weeks)' ? (
              <p className="text-amber-800 dark:text-amber-300 font-semibold">
                Advice: Because this has lasted for several days or feels strong, we recommend booking a routine appointment with your local doctor or clinic.
              </p>
            ) : (
              <p className="text-emerald-800 dark:text-emerald-300 font-medium">
                Advice: For mild everyday symptoms, prioritize drinking warm water, resting, eating nourishing meals, and getting 8 hours of sleep. If you feel worse over the next 24 to 48 hours, consult a healthcare professional.
              </p>
            )}
          </div>

          <div className="pt-2 text-[11px] text-[#7E9FA8] dark:text-[#789B96] italic">
            Friendly Reminder: This symptom tool provides educational guidance only. It is not an official medical diagnosis.
          </div>
        </div>
      )}
    </div>
  );
};
