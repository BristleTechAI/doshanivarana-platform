import { useState } from 'react';
import { MapPin, BookOpen, Lightbulb } from 'lucide-react';

export function TransparencyTabs() {
  const [activeTab, setActiveTab] = useState<'where' | 'how' | 'why'>('where');

  const tabs = [
    { id: 'where' as const, label: 'WHERE', icon: MapPin },
    { id: 'how' as const, label: 'HOW', icon: BookOpen },
    { id: 'why' as const, label: 'WHY', icon: Lightbulb },
  ];

  const content = {
    where: {
      title: 'Exact Location & Shrine',
      description: 'We show you the specific shrine inside the temple where your pooja will be conducted. Know the exact deity, altar, and sacred space.',
      details: [
        'Specific shrine and deity name',
        'Photos and videos of the location',
        'Temple history and significance',
        'Pujari credentials and experience'
      ]
    },
    how: {
      title: 'Step-by-Step Process',
      description: 'See the complete ritual process with detailed explanations of each step, mantras chanted, and offerings made during your pooja.',
      details: [
        'Complete ritual timeline',
        'Mantras and their meanings',
        'Sacred offerings used',
        'Live streaming option available'
      ]
    },
    why: {
      title: 'Spiritual Significance',
      description: 'Understand the deeper spiritual meaning and benefits of the pooja, rooted in ancient scriptures and traditions.',
      details: [
        'Scriptural references',
        'Spiritual benefits explained',
        'Auspicious timing guidance',
        'Traditional significance'
      ]
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl">
      {/* Tab buttons */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-6 px-6 flex items-center justify-center gap-3 transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold text-lg">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-10 space-y-6">
        <div>
          <h3 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            {content[activeTab].title}
          </h3>
          <p className="text-lg text-muted-foreground leading-relaxed" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {content[activeTab].description}
          </p>
        </div>

        <ul className="space-y-3">
          {content[activeTab].details.map((detail, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span className="text-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                {detail}
              </span>
            </li>
          ))}
        </ul>

        <div className="pt-6">
          <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-[#E05C10] transition-colors font-medium">
            View Sample Pooja Details
          </button>
        </div>
      </div>
    </div>
  );
}
