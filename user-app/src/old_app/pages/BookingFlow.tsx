import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Calendar, Clock, User, Star, ChevronRight, X } from 'lucide-react';
import { POOJAS } from '../lib/poojas';

interface BookingFormData {
  selectedDate: string;
  selectedTime: string;
  devoteeNames: string;
  gothram: string;
  nakshatra: string;
  specialRequests: string;
}

export function BookingFlow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    selectedDate: '',
    selectedTime: '',
    devoteeNames: '',
    gothram: 'Bharadwaja',
    nakshatra: 'Shravana',
    specialRequests: '',
  });

  const poojaData = POOJAS.find((p) => p.id.toString() === id) || POOJAS[0];

  // Helper to match pooja variations
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

  // Load and filter slots dynamically from localStorage
  const slotsData = localStorage.getItem('doshanivarana_slots');
  const allSlots: any[] = slotsData ? JSON.parse(slotsData) : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activePoojaSlots = allSlots.filter((slot) => {
    const matchesPooja = matchesPoojaName(slot.name, poojaData.title);
    const isActive = slot.status === true;
    const hasCapacity = slot.bookings < slot.maxBookings;
    const isFuture = new Date(slot.date) >= today;
    return matchesPooja && isActive && hasCapacity && isFuture;
  });

  // Derive unique available dates from active slots
  const uniqueDates = Array.from(new Set(activePoojaSlots.map((s) => s.date))).sort();
  const availableDates = uniqueDates.map((dateStr) => {
    const d = new Date(dateStr);
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if it's tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    return {
      date: dateStr,
      label: isTomorrow ? 'Tomorrow' : formattedDate,
      day: dayName,
    };
  });

  // Derive available times for selected date
  const availableTimes = activePoojaSlots
    .filter((s) => s.date === formData.selectedDate)
    .map((s) => s.time);

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

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Find the matched slot in localStorage and update bookings
      const updatedSlots = allSlots.map((slot) => {
        if (
          matchesPoojaName(slot.name, poojaData.title) &&
          slot.date === formData.selectedDate &&
          slot.time === formData.selectedTime
        ) {
          const newBookings = slot.bookings + 1;
          const isFull = newBookings >= slot.maxBookings;
          return {
            ...slot,
            bookings: newBookings,
            availability: isFull ? 'Full' : 'Open',
          };
        }
        return slot;
      });

      localStorage.setItem('doshanivarana_slots', JSON.stringify(updatedSlots));

      // Generate booking ID and write new booking to localStorage
      const bookingId = `BK-${Date.now().toString().slice(-6)}`;
      
      const newBooking = {
        id: bookingId,
        devoteeName: formData.devoteeNames,
        gotra: formData.gothram,
        nakshatra: formData.nakshatra || 'Shravana',
        mobile: '+91 98765 43210',
        email: 'devotee@email.com',
        poojaName: poojaData.title,
        temple: poojaData.temple,
        dateTime: `${formatDateString(formData.selectedDate)}, ${formData.selectedTime}`,
        paymentStatus: 'Confirmed',
        amount: poojaData.price,
        paymentMethod: 'UPI',
        orderId: `RZP-2026-${Date.now().toString().slice(-5)}`,
        pujari: 'Not Assigned',
        delivery: 'Yes',
        deliveryAddress: '42 MG Road, Bangalore, Karnataka 560001',
        deliveryStatus: 'Booked',
        streamStatus: 'Not Started',
        recordingStatus: 'Not Available',
        feedback: null,
        tab: 'upcoming'
      };

      // Fetch bookings list and append new booking
      const bookingsData = localStorage.getItem('doshanivarana_bookings');
      const bookings = bookingsData ? JSON.parse(bookingsData) : [];
      bookings.unshift(newBooking);
      localStorage.setItem('doshanivarana_bookings', JSON.stringify(bookings));

      navigate(`/booking-confirmation/${bookingId}`);
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return formData.selectedDate !== '' && formData.selectedTime !== '';
      case 2:
        return formData.devoteeNames.trim() !== '' && formData.gothram.trim() !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

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
        
        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
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
                {poojaData.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                {poojaData.temple} • {poojaData.deity}
              </p>
              <p className="text-primary font-semibold" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                {poojaData.price}
              </p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Select Date
              </label>
              {availableDates.length === 0 ? (
                <div className="p-6 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground italic">
                  Currently no active slots are available for booking this pooja. Please check back later.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableDates.map((dateOption) => (
                    <button
                      key={dateOption.date}
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedDate: dateOption.date, selectedTime: '' })}
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

            {/* Time Selection */}
            {formData.selectedDate && (
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedTime: time })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.selectedTime === time
                          ? 'border-primary bg-primary/5 text-primary font-semibold'
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ fontFamily: "'Noto Sans', sans-serif" }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Devotee Names */}
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
                onChange={(e) => setFormData({ ...formData, devoteeNames: e.target.value })}
                placeholder="e.g., Raghavan Iyer, Lakshmi Iyer"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
              />
            </div>

            {/* Gothram */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Gothram
              </label>
              <input
                type="text"
                value={formData.gothram}
                onChange={(e) => setFormData({ ...formData, gothram: e.target.value })}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
              />
            </div>

            {/* Nakshatra */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Nakshatra (Optional)
              </label>
              <select
                value={formData.nakshatra}
                onChange={(e) => setFormData({ ...formData, nakshatra: e.target.value })}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
              >
                <option value="">Select Nakshatra</option>
                {nakshatras.map((nakshatra) => (
                  <option key={nakshatra} value={nakshatra}>
                    {nakshatra}
                  </option>
                ))}
              </select>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Special Requests (Optional)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Any specific prayers or intentions..."
                rows={4}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {/* Review Details */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                  Pooja Details
                </h3>
              </div>
              <ReviewItem label="Date & Time" value={`${formData.selectedDate ? formatDateString(formData.selectedDate) : ''}, ${formData.selectedTime}`} />
              <ReviewItem label="Devotee(s)" value={formData.devoteeNames} />
              <ReviewItem label="Gothram" value={formData.gothram} />
              {formData.nakshatra && <ReviewItem label="Nakshatra" value={formData.nakshatra} />}
              {formData.specialRequests && <ReviewItem label="Special Requests" value={formData.specialRequests} />}
            </div>

            {/* Payment Summary */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="font-semibold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>Pooja Amount</span>
                  <span style={{ fontFamily: "'Noto Sans', sans-serif" }}>{poojaData.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>Prasad Delivery</span>
                  <span style={{ fontFamily: "'Noto Sans', sans-serif" }}>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>Live Stream</span>
                  <span style={{ fontFamily: "'Noto Sans', sans-serif" }}>Included</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Total Amount</span>
                    <span className="text-primary" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>{poojaData.price}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <p className="text-sm text-primary" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                <strong>Note:</strong> You will receive a confirmation with booking details and live stream link once payment is complete.
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
            {step === 3 ? 'Proceed to Payment' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 border-b border-border last:border-b-0">
      <p className="text-xs text-muted-foreground mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
        {label}
      </p>
      <p className="font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
        {value}
      </p>
    </div>
  );
}
