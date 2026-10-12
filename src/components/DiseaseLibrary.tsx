// Module D: Disease & Health Awareness Library (22 Clinical Categories)
// Simple everyday language explanations, clear categories, and search
// Lead Architect: Aryan More

import React, { useState } from 'react';
import { Search, ChevronRight, X } from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';
import { DiseaseLibraryItem } from '../types/health';

export const DiseaseLibrary: React.FC = () => {
  const { diseaseLibrary } = useHealthData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<DiseaseLibraryItem | null>(null);

  const categories = [
    'All',
    'Heart & Blood Vessels',
    'Hormones & Diabetes',
    'Lungs & Breathing',
    'Stomach & Digestion',
    'Brain & Nerves',
    'Skin Health',
    'Bones & Joints',
    'Mental Wellbeing',
    'Immunity & Allergies',
    'Eye Care',
    'Kidneys & Urinary',
    'Infections & Fevers',
  ];

  // Category mapper to keep database compatibility while showing simple names
  const mapDbCategoryToDisplay = (dbCat: string) => {
    switch (dbCat) {
      case 'Cardiology': return 'Heart & Blood Vessels';
      case 'Endocrinology': return 'Hormones & Diabetes';
      case 'Pulmonology': return 'Lungs & Breathing';
      case 'Gastroenterology': return 'Stomach & Digestion';
      case 'Neurology': return 'Brain & Nerves';
      case 'Dermatology': return 'Skin Health';
      case 'Orthopedics': return 'Bones & Joints';
      case 'Mental Health': return 'Mental Wellbeing';
      case 'Immunology': return 'Immunity & Allergies';
      case 'Ophthalmology': return 'Eye Care';
      case 'Nephrology': return 'Kidneys & Urinary';
      case 'Infectious Diseases': return 'Infections & Fevers';
      default: return dbCat;
    }
  };

  const filteredItems = diseaseLibrary.filter((item) => {
    const displayCat = mapDbCategoryToDisplay(item.category);
    const matchesCategory =
      selectedCategory === 'All' ||
      item.category === selectedCategory ||
      displayCat === selectedCategory;

    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symptoms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
          Health & Condition Library
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Learn about common health conditions, their symptoms, and simple lifestyle habits in plain English.
        </p>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search any condition (e.g. blood pressure, diabetes, asthma, acidity)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs outline-none focus:border-indigo-600 shadow-2xs font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="bg-white rounded-3xl p-5 border border-stone-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {mapDbCategoryToDisplay(item.category)}
                </span>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-base font-bold text-stone-900 group-hover:text-indigo-900 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-stone-500 mt-2 line-clamp-3 leading-relaxed">
                {item.overview}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
              <span>Read simple guide →</span>
              <span className="text-stone-400 font-normal">{item.symptoms.length} symptoms noted</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal Dialog */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {mapDbCategoryToDisplay(activeItem.category)}
                </span>
                <h2 className="text-xl font-bold text-stone-900 mt-1">{activeItem.title}</h2>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6 text-xs text-stone-700">
              {/* Overview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">What is this condition?</h4>
                <p className="text-stone-700 leading-relaxed text-sm">{activeItem.overview}</p>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Common Signs & Symptoms</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeItem.symptoms.map((sym, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-stone-100 text-stone-800 font-semibold text-xs">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Causes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Why does this happen?</h4>
                <ul className="list-disc list-inside space-y-1 text-stone-600 leading-relaxed">
                  {activeItem.causes.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Prevention & Treatments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1.5">Everyday Prevention Tips</h4>
                  <ul className="space-y-1 text-xs text-indigo-950">
                    {activeItem.prevention.map((p, idx) => (
                      <li key={idx}>• {p}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">Standard Medical Care</h4>
                  <p className="text-xs text-stone-700 leading-relaxed">{activeItem.treatment}</p>
                </div>
              </div>

              {/* Emergency Warning Signs */}
              {activeItem.emergency_signs && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-rose-700 mb-1">
                    When to Seek Immediate Care
                  </h4>
                  <p className="text-xs leading-relaxed">{activeItem.emergency_signs}</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
              <span>CareNova Everyday Health Library</span>
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
