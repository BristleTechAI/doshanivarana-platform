import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Bell, Share2 } from 'lucide-react';

export function BookingConfirmation() {
  const { id } = useParams();

  // Load bookings from localStorage
  const [bookings, setBookings] = useState<any[]>(() => {
    const bookingsData = localStorage.getItem('doshanivarana_bookings');
    return bookingsData ? JSON.parse(bookingsData) : [];
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'doshanivarana_bookings') {
        const data = localStorage.getItem('doshanivarana_bookings');
        setBookings(data ? JSON.parse(data) : []);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const handleCustomUpdate = () => {
      const data = localStorage.getItem('doshanivarana_bookings');
      setBookings(data ? JSON.parse(data) : []);
    };
    window.addEventListener('doshanivarana_bookings_updated', handleCustomUpdate);
    window.addEventListener('focus', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('doshanivarana_bookings_updated', handleCustomUpdate);
      window.removeEventListener('focus', handleCustomUpdate);
    };
  }, []);

  const booking = bookings.find((b: any) => b.id === id);

  // Fallback defaults
  const poojaName = booking ? booking.poojaName : 'Rudrabhishekam';
  const temple = booking ? booking.temple : 'Sri Kalahasti Shivalayam, Tirupati';
  const dateTime = booking ? booking.dateTime : '15 April 2026 — 9:00 AM';
  const bookingId = id || 'BK-1001';

  return (
    <div className="min-h-screen bg-[#1A0A00] px-6 py-12 flex flex-col items-center justify-center">
      {/* Diya Animation */}
      <div className="mb-8 relative">
        <div className="text-8xl animate-pulse">🪔</div>
        <div
          className="absolute inset-0 blur-2xl opacity-30 rounded-full"
          style={{
            background: 'radial-gradient(circle, #F97316 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Headline */}
      <h1
        className="text-3xl font-bold text-center mb-4"
        style={{ fontFamily: "'Anek Devanagari', sans-serif", color: '#F5F5F0' }}
      >
        Your Seva Has Been Offered
      </h1>

      {/* Subtitle */}
      <p
        className="text-center text-sm mb-8 max-w-md"
        style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}
      >
        The pooja will be performed in your name and Gothram. May the blessings of the Lord be with you and your family.
      </p>

      {/* Booking ID Card */}
      <div
        className="w-full max-w-md rounded-xl p-5 mb-6"
        style={{ backgroundColor: '#2D0A2E', border: '1px solid #F97316' }}
      >
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-primary" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            DEVASEVA
          </div>
          <div className="text-xs" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
            Booking Confirmed
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-primary mb-4" />

        {/* Pooja Details */}
        <h2
          className="text-xl font-bold mb-2"
          style={{ fontFamily: "'Anek Devanagari', sans-serif", color: '#F5F5F0' }}
        >
          {poojaName}
        </h2>
        <p className="text-xs mb-1" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
          {temple}
        </p>
        <p className="text-xs mb-4" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
          {dateTime}
        </p>

        {/* Divider */}
        <div className="border-t border-dashed border-border mb-4" />

        {/* Booking ID */}
        <div>
          <p className="text-xs mb-1" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
            Booking ID
          </p>
          <p
            className="text-sm font-mono text-primary"
            style={{ fontFamily: "'Noto Sans Mono', monospace" }}
          >
            {bookingId}
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="w-full max-w-md space-y-3 mb-8">
        <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-[#E05C10] transition-colors">
          <Bell className="w-5 h-5" />
          <span style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Set Reminder</span>
        </button>

        <button className="w-full py-3 rounded-xl border-2 border-primary text-primary bg-transparent font-medium flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
          <Share2 className="w-5 h-5" />
          <span style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Share Blessing</span>
        </button>
      </div>

      {/* Journey Preview */}
      <div className="w-full max-w-md mb-6">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs text-primary-foreground">✓</span>
            </div>
            <span className="text-xs" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
              Seva Offered
            </span>
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-border" />
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Pujari Assigned
            </span>
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-border" />
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Scheduled
            </span>
          </div>
        </div>
      </div>

      {/* View Bookings Link */}
      <Link to="/bookings" className="text-primary text-sm font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
        View My Bookings
      </Link>
    </div>
  );
}
