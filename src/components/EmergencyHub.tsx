// CareNova Emergency Hub & Verified Helplines (India 112, 108, 102, 1075, KIRAN, etc.)
// Palette: Forest Teal (#0B343B), Deep Navy (#102D3E), Primary Teal (#168B83), Fresh Mint (#A8E6D5 / #64D8C1)
// Lead Architect: Aryan More

import React from 'react';
import { Phone, ShieldAlert, HeartHandshake, Baby, AlertTriangle, UserCheck, Flame, LifeBuoy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EmergencyHub: React.FC = () => {
  const { profile } = useAuth();

  const emergencyContacts = [
    {
      number: '112',
      title: 'National Emergency Number',
      category: 'Police, Fire, Medical',
      description: 'The single toll-free number for any immediate emergency anywhere in India.',
      icon: ShieldAlert,
      badge: 'Immediate Response',
      color: 'bg-rose-600 text-white',
    },
    {
      number: '108',
      title: 'Ambulance & Disaster Service',
      category: 'Medical Emergency',
      description: 'Emergency medical transport for heart issues, critical injury, accidents, or acute distress.',
      icon: Phone,
      badge: '24/7 Ambulance',
      color: 'bg-rose-700 text-white',
    },
    {
      number: '102',
      title: 'Maternity & Infant Transport',
      category: 'Mother & Child Care',
      description: 'Free hospital pickup and transfer for expecting mothers and newborn babies.',
      icon: Baby,
      badge: 'Maternal Care',
      color: 'bg-amber-600 text-white',
    },
    {
      number: '1075',
      title: 'National Health Advice Helpline',
      category: 'Medical Information',
      description: 'Central government helpline for seasonal diseases, vaccination queries, and official health advice.',
      icon: AlertTriangle,
      badge: 'Govt. Helpline',
      color: 'bg-[#168B83] text-white',
    },
    {
      number: '1800-599-0019',
      title: 'KIRAN Mental Health Helpline',
      category: 'Emotional & Mental Wellbeing',
      description: 'Toll-free, confidential 24/7 support for stress, anxiety, emotional crises, and counseling.',
      icon: HeartHandshake,
      badge: 'Toll-Free Counseling',
      color: 'bg-[#102D3E] dark:bg-[#163B38] text-white',
    },
    {
      number: '101',
      title: 'Fire & Rescue Services',
      category: 'Fire Emergency',
      description: 'Immediate fire brigade dispatch and structural rescue operations.',
      icon: Flame,
      badge: 'Fire & Rescue',
      color: 'bg-orange-600 text-white',
    },
    {
      number: '1091',
      title: "Women's Safety Helpline",
      category: 'Safety & Protection',
      description: 'Dedicated 24/7 emergency assistance, support, and quick response for women.',
      icon: LifeBuoy,
      badge: 'Women Safety',
      color: 'bg-pink-600 text-white',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-[#183447] dark:text-[#EAF7F4]">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Emergency Support Directory</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B343B] dark:text-[#EAF7F4]">
          Emergency Helplines
        </h1>
        <p className="text-sm text-[#476A76] dark:text-[#A9C5C1] mt-1 max-w-2xl">
          Quickly dial verified emergency services and ambulances in India. If you or someone around you is in immediate danger, call 112 directly.
        </p>
      </div>

      {/* Personal Contact Quick Card */}
      {profile?.emergency_contact_phone ? (
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-800 dark:text-amber-300">
                Your Saved Emergency Contact
              </span>
              <h3 className="text-lg font-bold text-[#0B343B] dark:text-[#EAF7F4]">
                {profile.emergency_contact_name || 'Primary Emergency Contact'}
              </h3>
              <p className="text-sm text-[#476A76] dark:text-[#A9C5C1] font-medium">{profile.emergency_contact_phone}</p>
            </div>
          </div>

          <a
            href={`tel:${profile.emergency_contact_phone}`}
            className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <Phone className="w-4 h-4" />
            <span>Call Personal Contact</span>
          </a>
        </div>
      ) : (
        <div className="bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] rounded-3xl p-5 flex items-center justify-between gap-4">
          <div className="text-xs text-[#476A76] dark:text-[#A9C5C1]">
            <span className="font-semibold text-[#0B343B] dark:text-[#EAF7F4]">Tip:</span> You haven't added a personal emergency contact yet. You can save your family doctor or family member's phone number in your profile.
          </div>
        </div>
      )}

      {/* Emergency Numbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emergencyContacts.map((contact, idx) => {
          const Icon = contact.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#17363A] rounded-3xl p-6 border border-[#D8ECE7] dark:border-[#234E54] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-2xl ${contact.color} flex items-center justify-center font-extrabold shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#0B343B] dark:text-[#EAF7F4] tracking-tight">{contact.number}</span>
                    <span className="block text-[11px] font-semibold text-[#7E9FA8] dark:text-[#789B96]">{contact.badge}</span>
                  </div>
                </div>
                <h4 className="text-base font-bold text-[#0B343B] dark:text-[#EAF7F4]">{contact.title}</h4>
                <p className="text-xs font-medium text-[#168B83] dark:text-[#64D8C1] mb-1">{contact.category}</p>
                <p className="text-xs text-[#476A76] dark:text-[#A9C5C1] leading-relaxed">{contact.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#D8ECE7] dark:border-[#234E54]">
                <a
                  href={`tel:${contact.number}`}
                  className="w-full py-3 rounded-xl bg-[#0B343B] dark:bg-[#122B2F] hover:bg-[#168B83] dark:hover:bg-[#168B83] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Phone className="w-4 h-4 text-[#A8E6D5]" />
                  <span>Call {contact.number}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Notice */}
      <div className="bg-[#F7FCFA] dark:bg-[#122B2F] border border-[#D8ECE7] dark:border-[#234E54] rounded-2xl p-4 text-center text-xs text-[#476A76] dark:text-[#A9C5C1]">
        Emergency calls to 112 and 108 are toll-free and work even without balance or active mobile network roaming across India.
      </div>
    </div>
  );
};
