import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function HinduCalendar() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<number | null>(14);

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // April 2026 calendar data
  const calendarDays = [
    { date: null }, { date: null }, { date: 1 }, { date: 2 }, { date: 3, event: 'pournami' },
    { date: 4 }, { date: 5 }, { date: 6, event: 'ekadashi' }, { date: 7 }, { date: 8 },
    { date: 9 }, { date: 10 }, { date: 11 }, { date: 12 }, { date: 13 },
    { date: 14, event: 'festival' }, { date: 15 }, { date: 16 }, { date: 17, event: 'festival' },
    { date: 18, event: 'amavasya' }, { date: 19 }, { date: 20 }, { date: 21, event: 'ekadashi' },
    { date: 22 }, { date: 23 }, { date: 24 }, { date: 25 }, { date: 26 },
    { date: 27 }, { date: 28 }, { date: 29 }, { date: 30 },
  ];

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Hindu Calendar
            </h1>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                March 2026
              </span>
              <span className="font-semibold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                April 2026
              </span>
            </div>
            <button className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Festival</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Ekadashi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9A1515' }} />
              <span className="text-muted-foreground">Amavasya</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">Pournami</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6">
        {/* Calendar Grid */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {daysOfWeek.map((day, i) => (
              <div
                key={i}
                className="text-center text-xs text-muted-foreground font-medium"
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, i) => {
              if (!day.date) {
                return <div key={i} />;
              }

              const isToday = day.date === 18;
              const isSelected = day.date === selectedDay;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day.date)}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : isToday
                      ? 'ring-2 ring-primary bg-background'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  <span className="text-sm font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                    {day.date}
                  </span>
                  {day.event && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        day.event === 'festival'
                          ? 'bg-primary'
                          : day.event === 'ekadashi'
                          ? 'bg-yellow-500'
                          : day.event === 'amavasya'
                          ? 'bg-[#9A1515]'
                          : 'bg-amber-500'
                      } ${isSelected ? 'bg-primary-foreground' : ''}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail */}
        {selectedDay && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                14 April — Ugadi
              </h2>
              <p className="text-sm" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
                Telugu New Year. A deeply auspicious day for new beginnings.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Poojas recommended for this day
              </h3>
              <div className="space-y-3">
                <PoojaRecommendationCard
                  name="Satyanarayana Pooja"
                  temple="Tirumala Temple"
                  price="₹800"
                  imageUrl="https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                />
                <PoojaRecommendationCard
                  name="Lakshmi Pooja"
                  temple="Madurai Temple"
                  price="₹600"
                  imageUrl="https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PoojaRecommendationCard({
  name,
  temple,
  price,
  imageUrl,
}: {
  name: string;
  temple: string;
  price: string;
  imageUrl: string;
}) {
  return (
    <div className="flex gap-3 bg-background border border-border rounded-xl p-3 hover:border-primary/50 transition-all">
      <ImageWithFallback
        src={imageUrl}
        alt={name}
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-0.5" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
          {name}
        </h4>
        <p className="text-xs text-muted-foreground mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          {temple}
        </p>
        <p className="text-sm font-medium text-primary" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          {price}
        </p>
      </div>
      <button className="self-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-[#E05C10] transition-colors">
        Offer
      </button>
    </div>
  );
}
