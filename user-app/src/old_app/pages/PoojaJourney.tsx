import { ArrowLeft, CheckCircle2, Circle, Clock, Play, Package, Truck } from 'lucide-react';
import { useNavigate, Link } from 'react-router';

export function PoojaJourney() {
  const navigate = useNavigate();

  const stages = [
    {
      id: 1,
      icon: CheckCircle2,
      name: 'Seva Offered',
      desc: 'Your booking is confirmed. Booking ID: BKG-20260415-00001',
      status: 'completed',
      timestamp: 'March 10, 2026 — 3:45 PM',
    },
    {
      id: 2,
      icon: CheckCircle2,
      name: 'Pujari Assigned',
      desc: 'Pandit Ramesh Sharma has been assigned to your pooja.',
      status: 'completed',
      timestamp: 'March 10, 2026 — 4:12 PM',
    },
    {
      id: 3,
      icon: CheckCircle2,
      name: 'Pooja Scheduled',
      desc: 'Your pooja is confirmed for 15 April at 9:00 AM IST.',
      status: 'completed',
      timestamp: 'March 11, 2026 — 10:00 AM',
    },
    {
      id: 4,
      icon: CheckCircle2,
      name: 'Going Live',
      desc: 'Your pooja streamed live. 47 devotees joined.',
      status: 'completed',
      timestamp: 'April 15, 2026 — 9:00 AM',
    },
    {
      id: 5,
      icon: Circle,
      name: 'Pooja Completed',
      desc: 'Your pooja has been completed. Recording is being prepared.',
      status: 'current',
      timestamp: 'April 15, 2026 — 11:00 AM',
    },
    {
      id: 6,
      icon: Play,
      name: 'Recording Ready',
      desc: 'Your recording will be available within 2 hours.',
      status: 'upcoming',
      cta: 'Download Recording',
    },
    {
      id: 7,
      icon: Package,
      name: 'Prasad Packed',
      desc: 'Your prasad is being prepared for dispatch.',
      status: 'upcoming',
    },
    {
      id: 8,
      icon: Truck,
      name: 'Prasad Dispatched',
      desc: 'Your prasad is on its way to you.',
      status: 'upcoming',
      cta: 'Track Delivery',
    },
    {
      id: 9,
      icon: CheckCircle2,
      name: 'Prasad Delivered',
      desc: 'Your prasad has been delivered.',
      status: 'upcoming',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Rudrabhishek
              </h1>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                15 April 2026
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Timeline */}
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="relative">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.id} className="relative pb-8">
                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={`absolute left-[22px] top-[44px] w-0.5 h-full ${
                      isCompleted
                        ? 'bg-primary'
                        : isCurrent
                        ? 'bg-gradient-to-b from-primary to-border'
                        : 'border-l-2 border-dashed border-border'
                    }`}
                  />
                )}

                <div className="flex gap-4">
                  {/* Icon Circle */}
                  <div
                    className={`relative w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'bg-primary/20 text-primary ring-4 ring-primary/20'
                        : 'bg-card border-2 border-border text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3
                      className={`font-semibold mb-1 ${
                        isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                      } ${isCurrent ? 'text-primary' : ''}`}
                      style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
                    >
                      {stage.name}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground mb-2 leading-relaxed"
                      style={{ fontFamily: "'Noto Sans', sans-serif" }}
                    >
                      {stage.desc}
                    </p>
                    {stage.timestamp && (
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                        {stage.timestamp}
                      </p>
                    )}
                    {stage.cta && (
                      stage.cta === 'Track Delivery' ? (
                        <Link to={`/delivery/BKG-20260415-00001`}>
                          <button
                            className="mt-3 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-bold bg-primary/5 hover:bg-primary/10 transition-colors"
                            style={{ fontFamily: "'Noto Sans', sans-serif" }}
                          >
                            {stage.cta}
                          </button>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="mt-3 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground cursor-not-allowed"
                          style={{ fontFamily: "'Noto Sans', sans-serif" }}
                        >
                          {stage.cta}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom CTAs */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
        <div className="max-w-lg mx-auto space-y-3">
          <button
            disabled
            className="w-full py-3 rounded-xl bg-muted text-muted-foreground font-medium cursor-not-allowed"
            style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
          >
            Watch Recording
          </button>
          <Link to={`/delivery/BKG-20260415-00001`}>
            <button
              className="w-full mt-3 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors"
              style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
            >
              Track Prasad
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
