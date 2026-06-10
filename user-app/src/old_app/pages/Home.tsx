import { Sparkles, Clock, TrendingUp, CalendarDays, Bell, Play, User, X } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Link } from 'react-router';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function Home() {
  const { t } = useLanguage();
  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <User className="w-6 h-6 text-primary" />
                </div>
              </Link>
              <h2 className="text-xl font-bold text-primary" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                DEVASEVA
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <div className="relative">
                <Link 
                  to="/notifications"
                  className="relative hover:bg-muted/30 p-2 rounded-full transition-colors inline-block"
                >
                  <Bell className="w-6 h-6 text-foreground" />
                  <div className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">2</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-8">
        {/* Greeting Strip */}
        <section>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif", color: '#F5F5F0' }}>
            {t('home.greeting')}, Priya 🙏
          </h1>
          <p className="text-sm" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
            {t('home.subtitle')}
          </p>
        </section>

        {/* Live Pooja Countdown Card */}
        <Link to="/pooja/1">
          <section 
            className="rounded-2xl p-5 border-l-4 border-primary relative overflow-hidden"
            style={{ backgroundColor: '#2D0A2E' }}
          >
            <div className="absolute top-3 right-3">
              <div className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                {t('common.upcoming').toUpperCase()}
              </div>
            </div>
            
            <h3 className="text-base font-semibold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif", color: '#F5F5F0' }}>
              Next Live Pooja
            </h3>
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif", color: '#F5F5F0' }}>
              Rudrabhishek at Sri Kalahasti
            </h2>
            
            <div className="text-3xl font-bold text-primary mb-4" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              02h  34m  18s
            </div>
            
            <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-[#E05C10] transition-colors">
              Book Your Spot — ₹1,100
            </button>
          </section>
        </Link>

        {/* AI Recommendations */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-0.5" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#F5F5F0' }}>
              {t('home.recommendedForYou')}
            </h2>
            <p className="text-xs" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
              {t('home.basedOnNakshatra')}
            </p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            <PoojaCard
              title="Lakshmi Pooja"
              temple="Madurai Temple"
              price="₹800"
              imageUrl="https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
              badge="For You"
            />
            <PoojaCard
              title="Abhishekam"
              temple="Rameshwaram Temple"
              price="₹1,200"
              imageUrl="https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080"
              badge="Live"
              isLive
            />
            <PoojaCard
              title="Satyanarayana Pooja"
              temple="Tirumala Temple"
              price="₹900"
              imageUrl="https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
            />
          </div>
        </section>

        {/* Featured Temples */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#F5F5F0' }}>
              Temples
            </h2>
            <Link to="/temples" className="text-sm text-primary font-medium">View All</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            <TempleCard 
              name="Tirumala" 
              deity="Lord Venkateswara"
              city="Tirupati"
              imageUrl="https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080" 
            />
            <TempleCard 
              name="Rameshwaram" 
              deity="Lord Shiva"
              city="Tamil Nadu"
              imageUrl="https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080" 
            />
            <TempleCard 
              name="Madurai" 
              deity="Goddess Meenakshi"
              city="Tamil Nadu"
              imageUrl="https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080" 
            />
          </div>
        </section>

        {/* Pooja Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#F5F5F0' }}>
              Pooja Categories
            </h2>
            <Link to="/poojas" className="text-sm text-primary font-medium">View All</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CategoryCard
              title="Abhishekam"
              count="12 Poojas"
              icon="🪔"
              color="#F97316"
            />
            <CategoryCard
              title="Homam"
              count="8 Poojas"
              icon="🔥"
              color="#EF4444"
            />
            <CategoryCard
              title="Archana"
              count="15 Poojas"
              icon="🌺"
              color="#EC4899"
            />
            <CategoryCard
              title="Special Poojas"
              count="10 Poojas"
              icon="✨"
              color="#8B5CF6"
            />
          </div>
        </section>

        {/* Upcoming Festivals */}
        <section>
          <Link to="/calendar">
            <h2 className="text-lg font-medium mb-4" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#F5F5F0' }}>
              Upcoming Festivals
            </h2>
          </Link>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {[
              { date: 18, day: 'Wed', name: 'Today', isToday: true },
              { date: 19, day: 'Thu', name: '' },
              { date: 20, day: 'Fri', name: 'Ekadashi', isFestival: true },
              { date: 21, day: 'Sat', name: '' },
              { date: 22, day: 'Sun', name: 'Purnima', isFestival: true },
              { date: 23, day: 'Mon', name: '' },
              { date: 24, day: 'Tue', name: '' },
            ].map((day, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-16 py-3 rounded-xl text-center ${
                  day.isToday
                    ? 'bg-primary text-primary-foreground'
                    : day.isFestival
                    ? 'bg-card border-2 border-primary'
                    : 'bg-card border border-border'
                }`}
              >
                <div className="text-xs mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                  {day.day}
                </div>
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                  {day.date}
                </div>
                {day.isFestival && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto" />
                )}
                {day.name && !day.isToday && (
                  <div className="text-[10px] text-primary font-medium mt-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                    {day.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function PoojaCard({ 
  title, 
  temple, 
  price, 
  imageUrl, 
  badge, 
  isLive 
}: { 
  title: string; 
  temple: string; 
  price: string; 
  imageUrl: string; 
  badge?: string;
  isLive?: boolean;
}) {
  return (
    <Link to="/pooja/1">
      <div className="flex-shrink-0 w-56 bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all">
        <div className="relative aspect-video">
          <ImageWithFallback
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          {badge && (
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
              isLive ? 'bg-red-600 text-white' : 'bg-primary text-primary-foreground'
            }`}>
              {badge}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {temple}
          </p>
          <p className="font-medium text-primary" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {price}
          </p>
        </div>
      </div>
    </Link>
  );
}

function TempleCard({ name, deity, city, imageUrl }: { name: string; deity: string; city: string; imageUrl: string }) {
  return (
    <div className="flex-shrink-0 w-48 rounded-2xl border border-border overflow-hidden bg-card hover:border-primary/50 transition-all">
      <div className="aspect-[3/2]">
        <ImageWithFallback
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold mb-0.5" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
          {name}
        </h3>
        <p className="text-xs text-muted-foreground mb-0.5" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          {deity}
        </p>
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          {city}
        </p>
      </div>
    </div>
  );
}

function CategoryCard({ title, count, icon, color }: { title: string; count: string; icon: string; color: string }) {
  return (
    <Link to="/poojas">
      <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer">
        <div className="aspect-[4/3] flex items-center justify-center text-5xl" style={{ backgroundColor: `${color}15` }}>
          {icon}
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            {title}
          </h3>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {count}
          </p>
        </div>
      </div>
    </Link>
  );
}