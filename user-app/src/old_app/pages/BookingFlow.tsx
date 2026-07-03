import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { SlotsService } from '../../services/firebase/slots';
import { BookingsService } from '../../services/firebase/bookings';
import { useAuth } from '../../contexts/AuthContext';

interface BookingFormData {
  selectedSlotId: string;
  selectedDate: string;
  selectedTime: string;
  devoteeNames: string;
  gothram: string;
  nakshatra: string;
  specialRequests: string;
}

export function BookingFlow() {
  const navigate = useNavigate();
  const { id: poojaId } = useParams();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pooja info fetched from Firestore
  const [poojaData, setPoojaData] = useState<any>(null);
  // Slots from Firestore, real-time
  const [slots, setSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  const [formData, setFormData] = useState<BookingFormData>({
    selectedSlotId: '',
    selectedDate: '',
    selectedTime: '',
    devoteeNames: '',
    gothram: '',
    nakshatra: 'Shravana',
    specialRequests: '',
  });

  // Fetch Pooja details from Firestore
  useEffect(() => {
    if (!poojaId) return;
    import('../../services/firebase/poojas').then(({ PoojasService }) => {
      PoojasService.getPoojaById(poojaId).then(p => {
        if (p) setPoojaData(p);
      });
    });
  }, [poojaId]);

  // Real-time slots subscription
  useEffect(() => {
    if (!poojaId) return;
    setSlotsLoading(true);
    const unsubscribe = SlotsService.subscribeToSlotsByPooja(poojaId, (fetchedSlots) => {
      setSlots(fetchedSlots);
      setSlotsLoading(false);
    });
    return () => unsubscribe();
  }, [poojaId]);

  // Derive unique available dates from slots
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeSlots = slots.filter(s => {
    const slotDate = new Date(s.date);
    return slotDate >= today && (s.availableSeats > 0);
  });

  const uniqueDates = Array.from(new Set(activeSlots.map(s => s.date))).sort();
  const availableDates = uniqueDates.map(dateStr => {
    const d = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    return {
      date: dateStr,
      label: isTomorrow
        ? 'Tomorrow'
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      day: d.toLocaleDateString('en-US', { weekday: 'long' }),
    };
  });

  // Times for selected date
  const slotsForDate = activeSlots.filter(s => s.date === formData.selectedDate);
  const availableTimes = slotsForDate.map(s => ({ id: s.id, time: s.startTime, seats: s.availableSeats }));

  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya',
    'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
    'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
    'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  const formatDateString = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleContinue = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Step 3 — Submit Booking to Firestore
    if (!user) {
      setError('Please log in to book a pooja.');
      return;
    }
    if (!formData.selectedSlotId) {
      setError('No slot selected.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const bookingData = {
        poojaId: poojaId || '',
        poojaName: poojaData?.name || '',
        templeId: poojaData?.templeId || '',
        templeName: poojaData?.templeName || '',
        devoteeName: formData.devoteeNames,
        gothram: formData.gothram,
        nakshatra: formData.nakshatra,
        specialRequests: formData.specialRequests,
        amountPaid: poojaData?.price || 0,
        paymentMethod: 'UPI',
        hasPrasadDelivery: true,
        isDeleted: false,
      };

      const bookingId = await BookingsService.createBooking(
        user.uid,
        formData.selectedSlotId,
        bookingData
      );

      navigate(`/booking-confirmation/${bookingId}`);
    } catch (e: any) {
      setError(e.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canContinue = () => {
    if (loading) return false;
    switch (step) {
      case 1: return formData.selectedDate !== '' && formData.selectedSlotId !== '';
      case 2: return formData.devoteeNames.trim() !== '' && formData.gothram.trim() !== '';
      case 3: return true;
      default: return false;
    }
  };

  const priceFmt = poojaData?.price
    ? `₹${poojaData.price.toLocaleString()}`
    : '₹—';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="w-10 h-10 rounded-xl hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              {step === 1 && 'Select Date & Time'}
              {step === 2 && 'Your Details'}
              {step === 3 && 'Review & Confirm'}
            </h1>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Step {step} of 3
            </p>
          </div>
        </div>
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6 pb-32">
        {/* Pooja Summary Card */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6">
          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🕉️</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                {poojaData?.name || 'Loading…'}
              </h3>
              <p className="text-sm text-muted-foreground mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                {poojaData?.templeName || poojaData?.templeId || '—'} • {poojaData?.deity || '—'}
              </p>
              <p className="text-primary font-semibold" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                {priceFmt}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {error}
          </div>
        )}

        {/* Step 1 — Date & Time */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Select Date
              </label>
              {slotsLoading ? (
                <div className="p-6 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
                  Loading available slots…
                </div>
              ) : availableDates.length === 0 ? (
                <div className="p-6 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground italic">
                  No slots available for this pooja. Please check back later.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableDates.map(dateOption => (
                    <button
                      key={dateOption.date}
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedDate: dateOption.date, selectedSlotId: '', selectedTime: '' })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.selectedDate === dateOption.date
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                          {dateOption.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                        {dateOption.day}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {formData.selectedDate && (
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map(slotOption => (
                    <button
                      key={slotOption.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedSlotId: slotOption.id, selectedTime: slotOption.time })}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        formData.selectedSlotId === slotOption.id
                          ? 'border-primary bg-primary/5 text-primary font-semibold'
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ fontFamily: "'Noto Sans', sans-serif" }}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{slotOption.time}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{slotOption.seats} seats left</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Devotee Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Devotee Name(s)
              </label>
              <p className="text-xs text-muted-foreground mb-3" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                The pooja will be performed in these names
              </p>
              <input
                type="text"
                value={formData.devoteeNames}
                onChange={e => setFormData({ ...formData, devoteeNames: e.target.value })}
                placeholder="e.g., Raghavan Iyer, Lakshmi Iyer"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Gothram
              </label>
              <input
                type="text"
                value={formData.gothram}
                onChange={e => setFormData({ ...formData, gothram: e.target.value })}
                placeholder="e.g., Bharadwaja"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Nakshatra (Optional)
              </label>
              <select
                value={formData.nakshatra}
                onChange={e => setFormData({ ...formData, nakshatra: e.target.value })}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
              >
                <option value="">Select Nakshatra</option>
                {nakshatras.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Special Requests (Optional)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Any specific prayers or intentions…"
                rows={4}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
              />
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Pooja Details</h3>
              </div>
              <ReviewItem label="Date & Time" value={`${formatDateString(formData.selectedDate)}, ${formData.selectedTime}`} />
              <ReviewItem label="Devotee(s)" value={formData.devoteeNames} />
              <ReviewItem label="Gothram" value={formData.gothram} />
              {formData.nakshatra && <ReviewItem label="Nakshatra" value={formData.nakshatra} />}
              {formData.specialRequests && <ReviewItem label="Special Requests" value={formData.specialRequests} />}
            </div>

            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="font-semibold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pooja Amount</span>
                  <span>{priceFmt}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prasad Delivery</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Live Stream</span>
                  <span>Included</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Total Amount</span>
                    <span className="text-primary" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>{priceFmt}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <p className="text-sm text-primary" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                <strong>Note:</strong> You will receive a confirmation with booking details and live stream link once the booking is placed.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleContinue}
            disabled={!canContinue()}
            className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
              canContinue()
                ? 'bg-primary text-primary-foreground hover:bg-[#E05C10]'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
          >
            {loading ? 'Booking…' : step === 3 ? 'Confirm Booking' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 border-b border-border last:border-b-0">
      <p className="text-xs text-muted-foreground mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>{label}</p>
      <p className="font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>{value}</p>
    </div>
  );
}
