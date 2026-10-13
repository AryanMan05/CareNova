// CareNova Disease & Health Awareness Library
// Everyday language explanations, clear categories, live search, and modal details
// Palette: Forest Teal (#0B343B), Deep Navy (#102D3E), Primary Teal (#168B83), Fresh Mint (#A8E6D5 / #64D8C1)
// Lead Architect: Aryan More

import React, { useState } from 'react';
import { Search, ChevronRight, X, BookOpen } from 'lucide-react';
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
    <div className="space-y-6 animate-fadeIn text-[#183447] dark:text-[#EAF7F4]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B343B] dark:text-[#EAF7F4]">
          Health & Condition Library
        </h1>
        <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-1">
          Learn about common health conditions, their symptoms, and simple lifestyle habits in plain English.
        </p>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#7E9FA8] dark:text-[#789B96]" />
          <input
            type="text"
            placeholder="Search any condition (e.g. blood pressure, diabetes, asthma, acidity)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#17363A] border border-[#D8ECE7] dark:border-[#234E54] text-[#0B343B] dark:text-[#EAF7F4] placeholder-[#7E9FA8] dark:placeholder-[#789B96] rounded-2xl text-xs outline-none focus:border-[#168B83] shadow-xs font-medium"
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
                  ? 'bg-[#168B83] text-white shadow-sm'
                  : 'bg-white dark:bg-[#17363A] text-[#476A76] dark:text-[#A9C5C1] border border-[#D8ECE7] dark:border-[#234E54] hover:bg-[#F7FCFA] dark:hover:bg-[#122B2F]'
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
            className="bg-white dark:bg-[#17363A] rounded-3xl p-5 border border-[#D8ECE7] dark:border-[#234E54] hover:border-[#168B83] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E0F7F1] dark:bg-[#163B38] text-[#168B83] dark:text-[#64D8C1] border border-[#A8E6D5] dark:border-[#234E54]">
                  {mapDbCategoryToDisplay(item.category)}
                </span>
                <ChevronRight className="w-4 h-4 text-[#7E9FA8] group-hover:text-[#168B83] dark:group-hover:text-[#64D8C1] group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-base font-bold text-[#0B343B] dark:text-[#EAF7F4] group-hover:text-[#168B83] dark:group-hover:text-[#64D8C1] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] mt-2 line-clamp-3 leading-relaxed">
                {item.overview}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#D8ECE7] dark:border-[#234E54] flex items-center justify-between text-xs text-[#168B83] dark:text-[#64D8C1] font-bold">
              <span>Read guide →</span>
              <span className="text-[#7E9FA8] dark:text-[#789B96] font-normal">{item.symptoms.length} symptoms</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal Dialog */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#17363A] rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#D8ECE7] dark:border-[#234E54] text-[#183447] dark:text-[#EAF7F4] animate-fadeIn">
            <div className="flex items-start justify-between pb-4 border-b border-[#D8ECE7] dark:border-[#234E54]">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E0F7F1] dark:bg-[#163B38] text-[#168B83] dark:text-[#64D8C1] border border-[#A8E6D5] dark:border-[#234E54]">
                  {mapDbCategoryToDisplay(activeItem.category)}
                </span>
                <h2 className="text-xl font-bold text-[#0B343B] dark:text-[#EAF7F4] mt-1">{activeItem.title}</h2>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 text-[#7E9FA8] hover:text-[#0B343B] dark:hover:text-white rounded-xl hover:bg-stone-100 dark:hover:bg-[#10434C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6 text-xs text-[#183447] dark:text-[#EAF7F4]">
              {/* Overview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E9FA8] dark:text-[#789B96] mb-1">
                  What is this condition?
                </h4>
                <p className="text-[#476A76] dark:text-[#A9C5C1] leading-relaxed text-sm">{activeItem.overview}</p>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E9FA8] dark:text-[#789B96] mb-2">
                  Common Signs & Symptoms
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeItem.symptoms.map((sym, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] text-[#0B343B] dark:text-[#EAF7F4] font-semibold text-xs"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Causes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E9FA8] dark:text-[#789B96] mb-1">
                  Why does this happen?
                </h4>
                <ul className="list-disc list-inside space-y-1 text-[#476A76] dark:text-[#A9C5C1] leading-relaxed">
                  {activeItem.causes.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Prevention & Treatments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#E0F7F1]/60 dark:bg-[#163B38]/60 border border-[#A8E6D5] dark:border-[#234E54]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#168B83] dark:text-[#64D8C1] mb-1.5">
                    Everyday Prevention Tips
                  </h4>
                  <ul className="space-y-1 text-xs text-[#0B343B] dark:text-[#EAF7F4]">
                    {activeItem.prevention.map((p, idx) => (
                      <li key={idx}>• {p}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#476A76] dark:text-[#A9C5C1] mb-1.5">
                    Standard Medical Care
                  </h4>
                  <p className="text-xs text-[#0B343B] dark:text-[#EAF7F4] leading-relaxed">{activeItem.treatment}</p>
                </div>
              </div>

              {/* Emergency Warning Signs */}
              {activeItem.emergency_signs && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-1">
                    When to Seek Immediate Care
                  </h4>
                  <p className="text-xs leading-relaxed">{activeItem.emergency_signs}</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-[#D8ECE7] dark:border-[#234E54] flex items-center justify-between text-xs text-[#7E9FA8] dark:text-[#789B96]">
              <span>CareNova Everyday Health Library</span>
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 rounded-xl bg-[#168B83] text-white font-semibold hover:bg-[#12726B]"
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
