import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Share2, MapPin, Clock, Play } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { POOJAS } from '../lib/poojas';

export function PoojaDetail() {
  const [activeTab, setActiveTab] = useState<'overview' | 'where' | 'how' | 'why'>('overview');
  const navigate = useNavigate();
  const { id } = useParams();

  const [allSlots, setAllSlots] = useState<any[]>(() => {
    const slotsData = localStorage.getItem('doshanivarana_slots');
    return slotsData ? JSON.parse(slotsData) : [];
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'doshanivarana_slots') {
        const data = localStorage.getItem('doshanivarana_slots');
        setAllSlots(data ? JSON.parse(data) : []);
      }
    };
    
    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for same-window updates if needed
    const handleCustomUpdate = () => {
      const data = localStorage.getItem('doshanivarana_slots');
      setAllSlots(data ? JSON.parse(data) : []);
    };
    window.addEventListener('doshanivarana_slots_updated', handleCustomUpdate);
    
    // Also re-fetch on focus to ensure we have the latest
    window.addEventListener('focus', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('doshanivarana_slots_updated', handleCustomUpdate);
      window.removeEventListener('focus', handleCustomUpdate);
    };
  }, []);

  const pooja = POOJAS.find((p) => p.id.toString() === id) || POOJAS[0];



  const matchesPoojaName = (slotName: string, poojaTitle: string): boolean => {
    const s = slotName.toLowerCase();
    const p = poojaTitle.toLowerCase();
    if (s === p) return true;
    if (s.includes('satyanarayana') && p.includes('satyanarayana')) return true;
    if (s.includes('rudra') && p.includes('rudra')) return true;
    if (s.includes('ganapathi') && p.includes('ganapathi')) return true;
    if (s.includes('lakshmi') && p.includes('lakshmi')) return true;
    if (s.includes('navagraha') && p.includes('navagraha')) return true;
    return false;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeSlots = allSlots.filter((slot: any) => {
    const matchesPooja = matchesPoojaName(slot.name, pooja.title);
    const isActive = slot.status === true;
    const hasCapacity = slot.bookings < slot.maxBookings;
    const isFuture = new Date(slot.date) >= today;
    return matchesPooja && isActive && hasCapacity && isFuture;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-52">
        <ImageWithFallback
          src={pooja.imageUrl}
          alt={pooja.title}
          className="w-full h-full object-cover"
        />

        {/* Overlay Controls */}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute top-4 right-4">
          <button className="w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center">
          {(['overview', 'where', 'how', 'why'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-medium uppercase transition-colors relative ${
                activeTab === tab ? 'text-primary' : 'text-muted-foreground'
              }`}
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {activeTab === 'overview' && <OverviewTab pooja={pooja} activeSlots={activeSlots} />}
        {activeTab === 'where' && <WhereTab pooja={pooja} />}
        {activeTab === 'how' && <HowTab />}
        {activeTab === 'why' && <WhyTab />}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
        <button
          onClick={() => navigate(`/booking/${id || '1'}`)}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:bg-[#E05C10] transition-colors"
          style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
        >
          Offer This Pooja — {pooja.price}
        </button>
      </div>
    </div>
  );
}

function OverviewTab({ pooja, activeSlots }: { pooja: any; activeSlots: any[] }) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
          {pooja.title}
        </h1>
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          {pooja.purpose}
        </p>
      </div>

      {/* Pujari Card */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🙏</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            Pandit Ramesh Sharma
          </h3>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            22 years experience • Telugu, Sanskrit
          </p>
        </div>
      </div>

      {/* Temple Card */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
        <div>
          <h3 className="font-medium text-sm" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            {pooja.temple}
          </h3>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {pooja.deity} Shrine
          </p>
        </div>
      </div>

      {/* Live Streaming Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/30">
        <Play className="w-4 h-4" />
        <span className="text-sm font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          Live Stream Available
        </span>
      </div>

      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-card border border-border rounded-xl overflow-hidden">
        <ImageWithFallback
          src={pooja.imageUrl}
          alt={pooja.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="w-8 h-8 text-primary-foreground ml-1" />
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          Seva Amount
        </p>
        <p className="text-3xl font-bold text-primary" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
          {pooja.price}
        </p>
      </div>

      {/* Available Slots Section */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
          Available Slots
        </h3>
        {activeSlots.length === 0 ? (
          <div className="p-4 bg-muted/20 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground italic">
            Currently no active slots are available. Please check back later.
          </div>
        ) : (
          <div className="space-y-2">
            {activeSlots.slice(0, 4).map((slot: any) => (
              <div key={slot.id} className="flex justify-between items-center p-3 bg-card border border-border rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📅</span>
                  <span className="text-sm font-semibold" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                    {formatDate(slot.date)}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-sm font-semibold" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                    {slot.time}
                  </span>
                </div>
                <span className="text-xs bg-green-500/10 text-green-500 px-3 py-1 rounded-full font-semibold">
                  {slot.maxBookings - slot.bookings} spots left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WhereTab({ pooja }: { pooja: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
        Where this pooja is conducted
      </h2>

      <div>
        <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
          {pooja.temple}
        </h3>
        <p className="text-sm" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
          {pooja.deity} Shrine
        </p>
      </div>

      {/* Map Placeholder */}
      <div className="aspect-video bg-card border border-border rounded-xl flex items-center justify-center">
        <MapPin className="w-12 h-12 text-muted-foreground" />
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-4" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          Temple Area, {pooja.temple}
        </p>
        <p className="text-sm leading-relaxed" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
          This holy temple is renowned for its spiritual aura and traditional rituals performed in accordance with ancient Vedic rites.
        </p>
      </div>

      {/* Temple Photos */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[1, 2, 3].map((i) => (
          <ImageWithFallback
            key={i}
            src={pooja.imageUrl}
            alt={`Temple ${i}`}
            className="w-48 h-32 rounded-xl object-cover flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

function HowTab() {
  const steps = [
    {
      name: 'Ganapathi Vandanam',
      desc: 'Invoking Lord Ganesha to remove obstacles.',
    },
    {
      name: 'Punyahavachanam',
      desc: 'Purification of the space and devotee.',
    },
    {
      name: 'Shivalinga Abhishekam',
      desc: 'Sacred bath with water, milk, curd, honey and ghee.',
    },
    {
      name: 'Sri Rudram Chanting',
      desc: 'The pujari chants all 11 anuvakas of Sri Rudram.',
    },
    {
      name: 'Bilvaarchana',
      desc: 'Offering of 108 bilva leaves chanting each name of Shiva.',
    },
    {
      name: 'Mangalarati',
      desc: 'Concluding aarti with camphor and conch.',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
        How this pooja is conducted
      </h2>

      {/* Duration & Language */}
      <div className="flex gap-3">
        <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary flex items-center gap-2">
          <span className="text-sm font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            2 Hours
          </span>
        </div>
        <div className="px-4 py-2 rounded-lg bg-card border border-border flex items-center gap-2">
          <span className="text-sm font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            Sanskrit + Telugu
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                {step.name}
              </h4>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* What to do during stream */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
          What to do during the stream
        </h4>
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          Have the stream open. Chant along if you know the mantras. Light a diya at home during the aarti.
        </p>
      </div>
    </div>
  );
}

function WhyTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
        Why devotees offer this pooja
      </h2>

      <p className="text-sm leading-relaxed" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
        Rituals are performed to invoke divine blessings and to seek grace for peace, prosperity, and spiritual growth. This pooja is particularly powerful for removing negative energies and obstacles from one's life.
      </p>

      {/* Puranic Reference */}
      <div className="bg-card border border-border rounded-xl p-4 italic">
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          Traditional texts describe the Abhishek as equivalent to performing a thousand yagnas.
        </p>
      </div>

      {/* Blessings */}
      <div>
        <h3 className="font-medium mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
          Blessings this pooja is said to bring
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
            Health and longevity
          </span>
          <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Removal of obstacles
          </span>
          <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium">
            Peace of mind
          </span>
        </div>
      </div>
    </div>
  );
}