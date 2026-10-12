// Module G: Medication & Prescription Management
// Simple, friendly checklist: Daily medicines, taken/skipped toggles, reminders
// Lead Architect: Aryan More

import React, { useState } from 'react';
import { Pill, Plus, CheckCircle2, XCircle, Trash2, Clock } from 'lucide-react';
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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Prescriptions & Daily Medicine Checklist
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Keep track of your daily medicine times, log taken doses, and keep a clean schedule.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add a Medicine</span>
        </button>
      </div>

      {/* Adherence Rate Banner: Indigo & Lavender */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-200">
            30-Day Medicine Habit Score
          </span>
          <div className="text-3xl font-black mt-1">{adherenceScore}% Doses Taken</div>
          <p className="text-xs text-indigo-100/90 mt-1 max-w-lg">
            Taking your doctor-prescribed medicines consistently each day is one of the most effective habits for long-term health.
          </p>
        </div>

        <div className="w-36 bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${adherenceScore}%` }}
          />
        </div>
      </div>

      {/* Active Medications List */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-2xs">
        <h3 className="text-base font-bold text-stone-900 mb-4">Today's Schedule</h3>

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
                  className="p-4 rounded-2xl border border-stone-100 bg-stone-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{med.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                        <span className="font-semibold text-stone-700">{med.dosage}</span>
                        <span>•</span>
                        <span>{med.frequency}</span>
                        {med.reminder_time && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-indigo-600 font-medium">
                              <Clock className="w-3 h-3" /> {med.reminder_time}
                            </span>
                          </>
                        )}
                      </div>
                      {med.instructions && (
                        <p className="text-xs text-stone-500 mt-1 italic">Doctor note: {med.instructions}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => toggleMedicationLog(med.id, 'taken')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isTaken
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isTaken ? 'Taken Today' : 'Mark Taken'}</span>
                    </button>

                    <button
                      onClick={() => toggleMedicationLog(med.id, 'skipped')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isSkipped
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{isSkipped ? 'Skipped' : 'Skip'}</span>
                    </button>

                    <button
                      onClick={() => deleteMedication(med.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-xl transition-colors"
                      title="Remove from list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-stone-400 text-xs">
              No prescriptions added yet. Click "Add a Medicine" above to keep track of your schedule.
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-4">Add a New Prescription</h3>

            <form onSubmit={handleCreateMed} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol or Metformin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Dose / Strength</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg or 1 tablet"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">How often?</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600 bg-white"
                  >
                    <option value="Once daily">Once a day</option>
                    <option value="Twice daily">Twice a day</option>
                    <option value="Thrice daily">Three times a day</option>
                    <option value="As needed (PRN)">Only as needed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Reminder Time</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Instructions / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Take right after breakfast with water"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>

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
