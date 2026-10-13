// CareNova User Profile & Permanent Health Information
// Forest Teal & Mint Wellness Palette with Instant Turso/SQLite Synchronization
// Lead Architect: Aryan More

import React, { useState, useEffect } from 'react';
import { User, Heart, ShieldCheck, CheckCircle2, Save, Phone, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileView: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || user?.full_name || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [gender, setGender] = useState(profile?.gender || 'Male');
  const [height, setHeight] = useState(profile?.height?.toString() || '');
  const [weight, setWeight] = useState(profile?.weight?.toString() || '');
  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group || '');
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level || 'Moderate');
  const [allergies, setAllergies] = useState(profile?.allergies || '');
  const [emName, setEmName] = useState(profile?.emergency_contact_name || '');
  const [emPhone, setEmPhone] = useState(profile?.emergency_contact_phone || '');
  const [waterGoal, setWaterGoal] = useState(profile?.water_goal_glasses?.toString() || '8');
  const [stepGoal, setStepGoal] = useState(profile?.step_goal?.toString() || '10000');
  const [sleepGoal, setSleepGoal] = useState(profile?.sleep_goal_hours?.toString() || '8.0');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize form fields whenever profile loads or updates
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.age !== undefined && profile.age !== null) setAge(profile.age.toString());
      if (profile.gender) setGender(profile.gender);
      if (profile.height !== undefined && profile.height !== null) setHeight(profile.height.toString());
      if (profile.weight !== undefined && profile.weight !== null) setWeight(profile.weight.toString());
      if (profile.blood_group) setBloodGroup(profile.blood_group);
      if (profile.activity_level) setActivityLevel(profile.activity_level);
      if (profile.allergies) setAllergies(profile.allergies);
      if (profile.emergency_contact_name) setEmName(profile.emergency_contact_name);
      if (profile.emergency_contact_phone) setEmPhone(profile.emergency_contact_phone);
      if (profile.water_goal_glasses) setWaterGoal(profile.water_goal_glasses.toString());
      if (profile.step_goal) setStepGoal(profile.step_goal.toString());
      if (profile.sleep_goal_hours) setSleepGoal(profile.sleep_goal_hours.toString());
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const { error } = await updateProfile({
      full_name: fullName.trim() || user?.full_name || 'Patient',
      age: age ? parseInt(age) : null,
      gender: gender as any,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      blood_group: bloodGroup || null,
      activity_level: activityLevel,
      allergies: allergies || null,
      emergency_contact_name: emName || null,
      emergency_contact_phone: emPhone || null,
      water_goal_glasses: waterGoal ? parseInt(waterGoal) : 8,
      step_goal: stepGoal ? parseInt(stepGoal) : 10000,
      sleep_goal_hours: sleepGoal ? parseFloat(sleepGoal) : 8.0,
    });

    setSaving(false);
    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn text-[#183447] dark:text-[#EAF7F4]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B343B] dark:text-[#EAF7F4]">
          My Health Profile
        </h1>
        <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-1">
          Keep your permanent health information and emergency contacts up to date. These details are stored permanently in your private record and automatically populate your doctor reports.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#17363A] rounded-3xl p-6 md:p-8 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs space-y-6"
      >
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300 font-semibold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Your personal health details were updated and saved successfully!</span>
          </div>
        )}

        {/* 1. Basic Info */}
        <div>
          <h3 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4] mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-[#168B83] dark:text-[#64D8C1]" />
            <span>Basic Personal Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                placeholder="e.g. 28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Blood Group (Saved for Doctor Reports)
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              >
                <option value="">Select Blood Group</option>
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

            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Body Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              />
            </div>
          </div>
        </div>

        {/* 2. Medical Background */}
        <div className="pt-4 border-t border-[#D8ECE7] dark:border-[#234E54]">
          <h3 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4] mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#168B83] dark:text-[#64D8C1]" />
            <span>Health & Activity Habits</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Daily Physical Activity
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              >
                <option value="Sedentary">Sedentary (Little or no exercise)</option>
                <option value="Light">Lightly Active (1-3 days per week)</option>
                <option value="Moderate">Moderately Active (3-5 days per week)</option>
                <option value="Active">Very Active (6-7 days intense)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Known Allergies or Sensitivities
              </label>
              <input
                type="text"
                placeholder="e.g. Dust, Penicillin, Peanuts, None"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              />
            </div>
          </div>
        </div>

        {/* 3. Daily Goals */}
        <div className="pt-4 border-t border-[#D8ECE7] dark:border-[#234E54]">
          <h3 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4] mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#168B83] dark:text-[#64D8C1]" />
            <span>Personal Daily Goals</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Daily Water Target (Glasses)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={waterGoal}
                onChange={(e) => setWaterGoal(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Daily Step Target (Steps)
              </label>
              <input
                type="number"
                step="500"
                value={stepGoal}
                onChange={(e) => setStepGoal(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Daily Sleep Target (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                value={sleepGoal}
                onChange={(e) => setSleepGoal(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              />
            </div>
          </div>
        </div>

        {/* 4. Emergency Contacts */}
        <div className="pt-4 border-t border-[#D8ECE7] dark:border-[#234E54]">
          <h3 className="text-sm font-bold text-[#0B343B] dark:text-[#EAF7F4] mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#168B83] dark:text-[#64D8C1]" />
            <span>Emergency Contact Person</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Contact Name / Relationship
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe (Brother)"
                value={emName}
                onChange={(e) => setEmName(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#476A76] dark:text-[#A9C5C1] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={emPhone}
                onChange={(e) => setEmPhone(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8ECE7] dark:border-[#234E54] bg-[#F7FCFA] dark:bg-[#122B2F] text-[#0B343B] dark:text-[#EAF7F4] rounded-xl text-xs outline-none focus:border-[#168B83] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#168B83] hover:bg-[#12726B] text-white font-bold text-xs shadow-md shadow-[#168B83]/25 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Details'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
