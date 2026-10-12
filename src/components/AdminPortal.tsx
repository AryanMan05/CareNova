// Module L: Role-Protected Admin Governance Portal
// Clean layout, telemetry, user directory, and condition catalog CMS
// Lead Architect: Aryan More

import React, { useState } from 'react';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';

export const AdminPortal: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const {
    diseaseLibrary,
    addDiseaseItem,
    deleteDiseaseItem,
    waterLogs,
    weightLogs,
    medications,
  } = useHealthData();

  const [activeSection, setActiveSection] = useState<'telemetry' | 'catalog' | 'users'>('telemetry');
  const [modalOpen, setModalOpen] = useState(false);

  // New Disease Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Cardiology');
  const [newOverview, setNewOverview] = useState('');
  const [newSymptoms, setNewSymptoms] = useState('Fatigue, Dizziness, Shortness of breath');
  const [newCauses, setNewCauses] = useState('Genetic predisposition, Lifestyle');
  const [newTreatment, setNewTreatment] = useState('Consult physician for individualized treatment.');
  const [newEmergency, setNewEmergency] = useState('Seek immediate emergency room evaluation if acute onset occurs.');

  // User Directory
  const [usersList, setUsersList] = useState([
    { id: profile?.id || 'demo-user-aryan', name: profile?.full_name || 'Aryan More', email: 'aryan@carenova.health', role: 'admin', active: true },
    { id: 'u-2', name: 'Dr. Priya Sharma', email: 'priya.sharma@healthclinic.org', role: 'user', active: true },
    { id: 'u-3', name: 'Rahul Verma', email: 'rahul.v@domain.com', role: 'user', active: true },
    { id: 'u-4', name: 'Ananya Sen', email: 'ananya.sen@example.com', role: 'user', active: false },
  ]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-200 text-rose-800">
        <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto mb-2" />
        <h2 className="text-lg font-bold">Administrator Role Required</h2>
        <p className="text-xs text-rose-600 mt-1">
          This portal is protected by database Row Level Security policies. Only accounts with verified role 'admin' can access governance settings.
        </p>
      </div>
    );
  }

  const handleCreateDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newOverview) return;

    await addDiseaseItem({
      title: newTitle,
      category: newCategory,
      overview: newOverview,
      symptoms: newSymptoms.split(',').map((s) => s.trim()),
      causes: newCauses.split(',').map((c) => c.trim()),
      risk_factors: ['Sedentary habits', 'Age', 'Stress'],
      prevention: ['Balanced nutrition', 'Routine physical activity'],
      treatment: newTreatment,
      emergency_signs: newEmergency,
    });

    setNewTitle('');
    setNewOverview('');
    setModalOpen(false);
  };

  const toggleUserStatus = (userId: string) => {
    setUsersList(
      usersList.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">
              Admin Governance Portal
            </span>
            <span className="text-xs text-stone-400">Logged in as: {profile?.full_name}</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
            System Telemetry & Content Management
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('telemetry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              activeSection === 'telemetry' ? 'bg-indigo-600 text-white' : 'bg-white border text-stone-700'
            }`}
          >
            System Numbers
          </button>
          <button
            onClick={() => setActiveSection('catalog')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              activeSection === 'catalog' ? 'bg-indigo-600 text-white' : 'bg-white border text-stone-700'
            }`}
          >
            Condition Catalog
          </button>
          <button
            onClick={() => setActiveSection('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              activeSection === 'users' ? 'bg-indigo-600 text-white' : 'bg-white border text-stone-700'
            }`}
          >
            User Directory
          </button>
        </div>
      </div>

      {/* Section 1: Telemetry */}
      {activeSection === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs">
              <span className="text-xs text-stone-500 font-medium">Platform Users</span>
              <div className="text-2xl font-black text-stone-900 mt-2">1,248</div>
              <span className="text-[10px] text-emerald-600 font-semibold">+14% this month</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs">
              <span className="text-xs text-stone-500 font-medium">Logged Health Entries</span>
              <div className="text-2xl font-black text-stone-900 mt-2">
                {waterLogs.length + weightLogs.length + 84}
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold">Protected with Supabase RLS</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs">
              <span className="text-xs text-stone-500 font-medium">Prescriptions Tracked</span>
              <div className="text-2xl font-black text-stone-900 mt-2">{medications.length}</div>
              <span className="text-[10px] text-violet-600 font-semibold">Active Schedules</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs">
              <span className="text-xs text-stone-500 font-medium">Platform Health</span>
              <div className="text-2xl font-black text-emerald-600 mt-2">Operational</div>
              <span className="text-[10px] text-stone-400 font-semibold">Netlify CDN + Supabase</span>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Catalog CMS */}
      {activeSection === 'catalog' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-base font-bold text-stone-900">Health Library Content Catalog</h3>
              <p className="text-xs text-stone-400">Total verified conditions: {diseaseLibrary.length}</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Condition</span>
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {diseaseLibrary.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-800">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 font-semibold text-stone-600">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{item.overview}</p>
                </div>

                <button
                  onClick={() => deleteDiseaseItem(item.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Users */}
      {activeSection === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs">
          <h3 className="text-base font-bold text-stone-900 mb-4">User Directory</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5">User</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Role</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-stone-50">
                    <td className="py-3 font-bold text-stone-900">{usr.name}</td>
                    <td className="py-3 text-stone-500">{usr.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        usr.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {usr.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        usr.active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {usr.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {usr.id !== profile?.id && (
                        <button
                          onClick={() => toggleUserStatus(usr.id)}
                          className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100"
                        >
                          {usr.active ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-4">Add Condition to Health Library</h3>

            <form onSubmit={handleCreateDisease} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600 bg-white"
                >
                  <option value="Cardiology">Heart & Blood Vessels</option>
                  <option value="Endocrinology">Hormones & Diabetes</option>
                  <option value="Pulmonology">Lungs & Breathing</option>
                  <option value="Gastroenterology">Stomach & Digestion</option>
                  <option value="Neurology">Brain & Nerves</option>
                  <option value="Mental Health">Mental Wellbeing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Overview</label>
                <textarea
                  rows={2}
                  required
                  value={newOverview}
                  onChange={(e) => setNewOverview(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Symptoms (comma separated)</label>
                <input
                  type="text"
                  value={newSymptoms}
                  onChange={(e) => setNewSymptoms(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Treatment / Advice</label>
                <input
                  type="text"
                  value={newTreatment}
                  onChange={(e) => setNewTreatment(e.target.value)}
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
                  Save Condition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
