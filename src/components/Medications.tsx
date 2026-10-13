// CareNova Medication & Prescription Management
// Simple, friendly checklist: Daily medicines, taken/skipped toggles, reminders
// Palette: Forest Teal (#0B343B), Deep Navy (#102D3E), Primary Teal (#168B83), Fresh Mint (#A8E6D5 / #64D8C1)
// Lead Architect: Aryan More

import React, { useState } from 'react';
import { Pill, Plus, CheckCircle2, XCircle, Trash2, Clock, X } from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';

export const Medications: React.FC = () => {
  const {
    medications,
    medicationLogs,
    addMedication,
    deleteMedication,
    toggleMedicationLog,
    getMedicationAdherenceRate,
  } = useHealthData();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [instructions, setInstructions] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const adherenceScore = getMedicationAdherenceRate();

  const handleCreateMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage) return;

    await addMedication({
      name,
      dosage,
      frequency,
      reminder_time: reminderTime,
      instructions,
      is_active: true,
    });

    setName('');
    setDosage('');
    setInstructions('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#183447] dark:text-[#EAF7F4]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B343B] dark:text-[#EAF7F4]">
            Prescriptions & Daily Medicine Checklist
          </h1>
          <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-1">
            Keep track of your daily medicine times, log taken doses, and keep a clean schedule.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#168B83] hover:bg-[#12726B] text-white font-semibold text-xs shadow-md shadow-[#168B83]/20 transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add a Medicine</span>
        </button>
      </div>

      {/* Adherence Rate Banner */}
      <div className="bg-gradient-to-r from-[#0B343B] via-[#102D3E] to-[#0B343B] dark:from-[#09141C] dark:via-[#102D32] dark:to-[#09141C] text-white p-6 rounded-3xl shadow-lg border border-[#134B54] dark:border-[#14353B] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#A8E6D5]">
            30-Day Medicine Habit Score
          </span>
          <div className="text-3xl font-black mt-1">{adherenceScore}% Doses Taken</div>
          <p className="text-xs text-[#EAF7F4]/80 mt-1 max-w-lg">
            Taking your doctor-prescribed medicines consistently each day is one of the most effective habits for long-term health.
          </p>
        </div>

        <div className="w-36 bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#64D8C1] h-3 rounded-full transition-all duration-500"
            style={{ width: `${adherenceScore}%` }}
          />
        </div>
      </div>

      {/* Active Medications List */}
      <div className="bg-white dark:bg-[#17363A] rounded-3xl border border-[#D8ECE7] dark:border-[#234E54] p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#0B343B] dark:text-[#EAF7F4] mb-4">Today's Schedule</h3>

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
                  className="p-4 rounded-2xl border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E0F7F1] dark:bg-[#163B38] text-[#168B83] dark:text-[#64D8C1] flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4]">{med.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-[#476A76] dark:text-[#A9C5C1] mt-0.5">
                        <span className="font-semibold text-[#0B343B] dark:text-[#EAF7F4]">{med.dosage}</span>
                        <span>•</span>
                        <span>{med.frequency}</span>
                        {med.reminder_time && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[#168B83] dark:text-[#64D8C1] font-medium">
                              <Clock className="w-3 h-3" /> {med.reminder_time}
                            </span>
                          </>
                        )}
                      </div>
                      {med.instructions && (
                        <p className="text-xs text-[#7E9FA8] dark:text-[#789B96] mt-1 italic">Doctor note: {med.instructions}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => toggleMedicationLog(med.id, 'taken')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isTaken
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-[#17363A] border border-[#D8ECE7] dark:border-[#234E54] text-[#476A76] dark:text-[#A9C5C1] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isTaken ? 'Taken Today' : 'Mark Taken'}</span>
                    </button>

                    <button
                      onClick={() => toggleMedicationLog(med.id, 'skipped')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isSkipped
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white dark:bg-[#17363A] border border-[#D8ECE7] dark:border-[#234E54] text-[#476A76] dark:text-[#A9C5C1] hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{isSkipped ? 'Skipped' : 'Skip'}</span>
                    </button>

                    <button
                      onClick={() => deleteMedication(med.id)}
                      className="p-2 text-[#7E9FA8] hover:text-rose-600 rounded-xl transition-colors"
                      title="Remove from list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#7E9FA8] dark:text-[#789B96] text-xs">
              No prescriptions added yet. Click "Add a Medicine" above to keep track of your schedule.
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#D8ECE7] dark:border-[#234E54] text-[#183447] dark:text-[#EAF7F4] animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8ECE7] dark:border-[#234E54] mb-4">
              <h3 className="text-base font-bold text-[#0B343B] dark:text-[#EAF7F4]">Add a New Prescription</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-[#7E9FA8] hover:text-[#0B343B] dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMed} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol or Metformin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">Dose / Strength</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg or 1 tablet"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">How often?</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83]"
                  >
                    <option value="Once daily">Once a day</option>
                    <option value="Twice daily">Twice a day</option>
                    <option value="Thrice daily">Three times a day</option>
                    <option value="As needed (PRN)">Only as needed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">Reminder Time</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">Instructions / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Take right after breakfast with water"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#D8ECE7] dark:border-[#234E54]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] hover:bg-stone-100 dark:hover:bg-[#10434C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#168B83] hover:bg-[#12726B] text-white shadow-xs"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
