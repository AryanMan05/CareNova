// Module M: User Profile Management & Permanent Synchronization
// Simple labels, easy inputs, clear categories, and instant save feedback
// Lead Architect: Aryan More

import React, { useState } from 'react';
import { User, Heart, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || 'Aryan More');
  const [age, setAge] = useState(profile?.age?.toString() || '26');
  const [gender, setGender] = useState(profile?.gender || 'Male');
  const [height, setHeight] = useState(profile?.height?.toString() || '175');
  const [weight, setWeight] = useState(profile?.weight?.toString() || '70');
  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group || 'O+');
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level || 'Moderate');
  const [allergies, setAllergies] = useState(profile?.allergies || 'None reported');
  const [emName, setEmName] = useState(profile?.emergency_contact_name || 'Family Contact');
  const [emPhone, setEmPhone] = useState(profile?.emergency_contact_phone || '+91 98765 43210');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const { error } = await updateProfile({
      full_name: fullName,
      age: parseInt(age) || null,
      gender: gender as any,
      height: parseFloat(height) || null,
      weight: parseFloat(weight) || null,
      blood_group: bloodGroup,
      activity_level: activityLevel,
      allergies,
      emergency_contact_name: emName,
      emergency_contact_phone: emPhone,
    });

    setSaving(false);
    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
          My Health Profile
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Keep your basic information and emergency contact up to date for your health calculations and doctor reports.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-6">
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-semibold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Your profile details were updated and saved successfully!</span>
          </div>
        )}

        {/* 1. Basic Info */}
        <div>
          <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Basic Personal Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Sex</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Height, Weight, Activity */}
        <div className="pt-4 border-t border-stone-100">
          <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-indigo-600" />
            <span>Height, Weight & Movement</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Daily Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium bg-white"
              >
                <option value="Sedentary">Sedentary (Little or no exercise)</option>
                <option value="Light">Light (Light walking 1-3 days)</option>
                <option value="Moderate">Moderate (Active 3-5 days)</option>
                <option value="Very Active">Very Active (Heavy workouts 6-7 days)</option>
                <option value="Extra Active">Extra Active (Very physical work)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Allergies & Emergency Contact */}
        <div className="pt-4 border-t border-stone-100">
          <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Allergies & Emergency Contact</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Any Known Allergies or Medicine Sensitivities</label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Peanuts, Sulfa, Dust, or none"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Parent, Spouse, or Sibling"
                  value={emName}
                  onChange={(e) => setEmName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={emPhone}
                  onChange={(e) => setEmPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-40 transition-all hover:scale-105"
          >
            {saving ? 'Saving...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  );
};
