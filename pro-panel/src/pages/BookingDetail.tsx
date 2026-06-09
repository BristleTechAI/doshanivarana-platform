import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { db, type Booking } from '../lib/db';

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const initialBooking = id ? db.getBookingById(id) || null : null;
  const [booking, setBooking] = useState<Booking | null>(initialBooking);
  const [selectedPujari, setSelectedPujari] = useState(initialBooking?.pujari || 'Not Assigned');
  const [notification, setNotification] = useState<string | null>(null);

  const handleSaveAssignment = () => {
    if (booking) {
      const updated: Booking = { ...booking, pujari: selectedPujari };
      db.updateBooking(updated);
      setBooking(updated);
      setNotification('Pujari assigned successfully!');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (!booking) {
    return (
      <div className="p-xl text-center font-sans">
        <h2 className="text-headline-md font-bold text-on-surface">Booking not found</h2>
        <Link to="/bookings" className="text-primary hover:underline font-bold mt-4 inline-block">Back to Bookings</Link>
      </div>
    );
  }


  return (
    <div className="max-w-[1440px] mx-auto pb-24 relative">
      {/* Breadcrumbs & Back */}
      <div className="mb-6 font-sans">
        <Link 
          to="/bookings" 
          className="text-on-surface-variant font-body-sm hover:text-primary transition-colors inline-flex items-center gap-1 font-bold"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Bookings
        </Link>
        <p className="text-on-surface-variant text-body-sm mt-2 font-medium">
          Bookings &gt; <span className="text-on-surface">{booking.id} Detail</span>
        </p>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-green-100 border border-green-200 text-green-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-sans font-semibold transition-all duration-300">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          {notification}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 font-display">
        <div className="flex items-center gap-4">
          <h1 className="text-headline-lg text-on-background font-bold">Booking Detail — {booking.id}</h1>
          <span className={`font-label-md text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
            booking.paymentStatus === 'Confirmed' 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
          }`}>
            {booking.paymentStatus}
          </span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (60%) */}
        <div className="lg:col-span-7 flex flex-col gap-6 font-sans">
          
          {/* Booking Summary Card */}
          <div className="bg-surface-container-lowest rounded-xl soft-shadow p-6 border border-[#F0E6D2]">
            <h3 className="font-display text-headline-sm text-on-surface font-bold mb-4">Booking Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Booking ID</p>
                <p className="text-body-lg text-on-background font-bold">{booking.id}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Booking Date</p>
                <p className="text-body-lg text-on-background font-medium">08 May 2026</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Payment Status</p>
                <p className="text-body-lg text-green-700 font-bold">{booking.paymentStatus}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Amount Paid</p>
                <p className="text-body-lg text-on-background font-bold">{booking.amount}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Payment Method</p>
                <p className="text-body-lg text-on-background font-medium">{booking.paymentMethod}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Razorpay Order ID</p>
                <p className="text-body-sm text-on-surface-variant break-all font-semibold">{booking.orderId}</p>
              </div>
            </div>
          </div>

          {/* Devotee Details Card */}
          <div className="bg-surface-container-lowest rounded-xl soft-shadow p-6 border border-[#F0E6D2]">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">person</span>
              <h3 className="font-display text-headline-sm text-on-surface font-bold">Devotee Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Full Name</p>
                <p className="text-body-lg text-on-background font-bold">{booking.devoteeName}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Gotra</p>
                <p className="text-body-lg text-on-background font-medium">{booking.gotra}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Nakshatra</p>
                <p className="text-body-lg text-on-background font-medium">{booking.nakshatra}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Mobile</p>
                <p className="text-body-lg text-on-background font-medium">{booking.mobile}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Email</p>
                <p className="text-body-lg text-on-background font-medium">{booking.email}</p>
              </div>
            </div>
          </div>

          {/* Pooja & Slot Card */}
          <div className="bg-surface-container-lowest rounded-xl soft-shadow p-6 border border-[#F0E6D2]">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              <h3 className="font-display text-headline-sm text-on-surface font-bold">Pooja &amp; Slot Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div className="md:col-span-2">
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Pooja Name</p>
                <p className="text-headline-md text-primary font-bold">{booking.poojaName}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Temple</p>
                <p className="text-body-lg text-on-background font-medium">{booking.temple}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Slot Date &amp; Time</p>
                <p className="text-body-lg text-on-background font-semibold">{booking.dateTime}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Bookings Capacity</p>
                <p className="text-body-lg text-on-surface-variant font-semibold">
                  {booking.currentBookings} / {booking.maxBookings} Slots
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (40%) */}
        <div className="lg:col-span-5 flex flex-col gap-6 font-sans">
          
          {/* Pujari Assignment Card */}
          <div className="bg-surface-container-lowest rounded-xl soft-shadow p-6 border border-[#F0E6D2] border-t-4 border-t-primary">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_celebrate</span>
                <h3 className="font-display text-headline-sm text-on-surface font-bold">Pujari Assignment</h3>
              </div>
              <span className={`font-label-md text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                booking.pujari === 'Not Assigned' 
                  ? 'bg-error-container text-on-error-container' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {booking.pujari === 'Not Assigned' ? 'Not Assigned' : 'Assigned'}
              </span>
            </div>
            
            <div className="mb-4">
              <label className="text-label-md text-on-surface-variant block mb-2 font-bold uppercase tracking-wider">Select Pujari</label>
              <select 
                className="w-full border border-outline-variant rounded-lg p-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-bright font-semibold"
                value={selectedPujari}
                onChange={(e) => setSelectedPujari(e.target.value)}
              >
                <option value="Not Assigned">Select Pujari</option>
                <option value="Sharma Ji">Sharma Ji</option>
                <option value="Ravi Pandit">Ravi Pandit</option>
                <option value="Krishna Acharya">Krishna Acharya</option>
              </select>
            </div>
            
            <button 
              onClick={handleSaveAssignment}
              className="w-full bg-primary text-on-primary font-button text-button py-3 rounded-full hover:bg-[#b04b00] transition-colors mb-2 cursor-pointer font-bold shadow-sm"
            >
              Save Assignment
            </button>
            <p className="text-body-sm text-on-surface-variant text-center font-medium">Assign a pujari before the pooja date</p>
          </div>

          {/* Stream & Recording Card */}
          <div className="bg-surface-container-lowest rounded-xl soft-shadow p-6 border border-[#F0E6D2]">
            <h3 className="font-display text-headline-sm text-on-surface font-bold mb-4">Live Stream &amp; Recording</h3>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center font-medium">
                <p className="text-body-md text-on-surface">Stream Status</p>
                <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  {booking.streamStatus}
                </span>
              </div>
              <div className="flex justify-between items-center font-medium">
                <p className="text-body-md text-on-surface">Recording Status</p>
                <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  {booking.recordingStatus}
                </span>
              </div>
            </div>
            <Link 
              to="/live-stream" 
              className="font-button text-button text-primary hover:text-[#b04b00] transition-colors flex items-center gap-1 font-bold"
            >
              Go to Stream Control →
            </Link>
          </div>

          {/* Delivery Card */}
          {booking.delivery === 'Yes' ? (
            <div className="bg-surface-container-lowest rounded-xl soft-shadow p-6 border border-[#F0E6D2] border-l-4 border-l-secondary-container">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary-container-dim text-[#d4a017]">package_2</span>
                <h3 className="font-display text-headline-sm text-on-surface font-bold">Delivery Details</h3>
              </div>
              <div className="mb-4">
                <p className="text-label-md text-on-surface-variant uppercase mb-1 font-bold tracking-wider">Address</p>
                <p className="text-body-md text-on-background font-medium">{booking.deliveryAddress}</p>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <p className="text-label-md text-on-surface-variant uppercase font-bold tracking-wider">Status:</p>
                <span className="bg-secondary-container text-on-secondary-container font-label-md text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  {booking.deliveryStatus}
                </span>
              </div>
              <Link 
                to="/deliveries" 
                className="font-button text-button text-primary hover:text-[#b04b00] transition-colors flex items-center gap-1 font-bold"
              >
                Go to Delivery Manager →
              </Link>
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30 opacity-70">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-on-surface-variant">block</span>
                <h3 className="font-display text-headline-sm text-on-surface font-bold">No Delivery Requested</h3>
              </div>
              <p className="text-body-sm text-on-surface-variant font-medium">Devotee has opted for local pick up or does not require prasadam delivery.</p>
            </div>
          )}

          {/* Feedback Card */}
          <div className={`rounded-xl p-6 border ${
            booking.feedback 
              ? 'bg-surface-container-lowest border-[#F0E6D2] soft-shadow' 
              : 'bg-surface-container-low border-outline-variant/30 opacity-60'
          }`}>
            <h3 className="font-display text-headline-sm text-on-surface font-bold mb-4">Devotee Feedback</h3>
            {booking.feedback ? (
              <div className="bg-surface-bright p-4 rounded-lg border border-outline-variant/20 font-medium">
                <p className="text-body-md text-on-surface italic">"{booking.feedback}"</p>
                <div className="flex gap-1 mt-2 text-[#F6BE39]">
                  <span className="material-symbols-outlined text-[18px]">star</span>
                  <span className="material-symbols-outlined text-[18px]">star</span>
                  <span className="material-symbols-outlined text-[18px]">star</span>
                  <span className="material-symbols-outlined text-[18px]">star</span>
                  <span className="material-symbols-outlined text-[18px]">star</span>
                </div>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-lg">
                <p className="text-body-sm text-on-surface-variant text-center font-medium">
                  Feedback will appear here after pooja completion
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[240px] bg-surface-container-lowest border-t border-outline-variant/30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] p-4 z-40 flex justify-between items-center flex-wrap gap-4 font-sans">
        <Link 
          to="/bookings" 
          className="px-6 py-2 border-2 border-outline-variant text-on-surface font-button text-button rounded-full hover:bg-surface-container-low transition-colors font-bold"
        >
          ← Back to Bookings
        </Link>
        <div className="flex gap-4">
          <Link 
            to={`/pooja-readiness/${booking.id}`} 
            className="px-6 py-2 border-2 border-primary text-primary font-button text-button rounded-full hover:bg-primary-container/20 transition-colors font-bold"
          >
            Check Pooja Readiness
          </Link>
          {booking.delivery === 'Yes' && (
            <Link 
              to="/deliveries" 
              className="px-6 py-2 bg-primary text-on-primary font-button text-button rounded-full hover:bg-[#b04b00] transition-colors shadow-sm font-bold"
            >
              Go to Delivery Manager
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
