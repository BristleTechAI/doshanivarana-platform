// @ts-nocheck
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { db, type Booking, type PoojaSlot, type DevoteeQuery } from '../lib/db';

export function Home() {
  const navigate = useNavigate();

  const [bookings] = useState<Booking[]>(() => db.getBookings());
  const [slots] = useState<PoojaSlot[]>(() => db.getSlots());
  const [queries] = useState<DevoteeQuery[]>(() => db.getQueries());
  const [profileName] = useState(() => {
    const profile = db.getProfile();
    if (profile && profile.fullName) {
      return profile.fullName.trim().split(/\s+/)[0] || 'Ravi';
    }
    return 'Ravi';
  });

  const handleStartStream = (id: string) => {
    navigate(`/stream-readiness/${id}`);
  };

  const handleAssignPujari = (id: string) => {
    navigate(`/bookings/${id}`);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayLabel = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowLabel = tomorrow.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  // Stats calculation
  const todaysPoojasCount = slots.filter(s => s.status && s.date === todayDateStr).length;
  const pendingPujariCount = bookings.filter(b => (b.status === 'COMPLETED' ? 'completed' : 'upcoming') === 'upcoming' && (b.priestName || 'Not Assigned') === 'Not Assigned').length;
  const pendingDeliveriesCount = bookings.filter(b => b.hasPrasadDelivery).length;
  const unreadQueriesCount = queries.filter(q => q.status === 'Open').length;

  // Filter bookings for today and tomorrow
  const activePoojas = bookings.filter(b => {
    const datePart = b.scheduledDate.split(',')[0].trim();
    return (b.status === 'COMPLETED' ? 'completed' : 'upcoming') === 'upcoming' && (datePart === todayLabel || datePart === tomorrowLabel);
  });

  const getBookingDateLabel = (dateTimeStr: string) => {
    const parts = dateTimeStr.split(',');
    const datePart = parts[0].trim();
    const timePart = parts[1] ? parts[1].trim() : '';

    if (datePart === todayLabel) return `Today ${timePart}`;
    if (datePart === tomorrowLabel) return `Tomorrow ${timePart}`;
    return dateTimeStr;
  };

  const recentBookings = bookings.filter(b => (b.status === 'COMPLETED' ? 'completed' : 'upcoming') === 'upcoming').slice(0, 4);

  return (
    <div className="p-xl min-h-[calc(100vh-104px)] relative mandala-watermark">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-headline-lg text-on-surface font-semibold mb-2">
          Good Morning, {profileName} 👋
        </h1>
        <p className="font-sans text-body-lg text-on-surface-variant font-medium">
          {today}
        </p>
      </div>

      {/* Alert Banner */}
      {pendingDeliveriesCount > 0 && (
        <div className="mb-8 bg-[#FFF4E5] border border-[#FFB266] rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-[#B06000]">
            <span className="material-symbols-outlined flex items-center justify-center">warning</span>
            <span className="font-sans text-body-md font-semibold">{pendingDeliveriesCount} parcels are packed and awaiting dispatch.</span>
          </div>
          <Link 
            to="/deliveries" 
            className="font-sans text-button text-[#B06000] hover:underline flex items-center gap-1 font-semibold"
          >
            Go to Delivery Manager 
            <span className="material-symbols-outlined text-[18px] flex items-center justify-center">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* Stats Row (Bento Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1 */}
        <Link to="/schedule" className="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-[#F0E6D2] border-l-4 border-l-primary flex items-start gap-4 hover:translate-y-[-2px] transition-all duration-200">
          <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary flex-shrink-0">
            <span className="material-symbols-outlined text-[24px]">calendar_today</span>
          </div>
          <div>
            <div className="font-sans text-body-sm text-on-surface-variant mb-1 font-semibold">Today's Poojas</div>
            <div className="font-display text-headline-md text-on-surface font-bold">{todaysPoojasCount}</div>
          </div>
        </Link>

        {/* Card 2 */}
        <Link to="/bookings" className="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-[#F0E6D2] border-l-4 border-l-[#f6be39] flex items-start gap-4 hover:translate-y-[-2px] transition-all duration-200">
          <div className="w-12 h-12 rounded-full bg-[#f6be39]/20 flex items-center justify-center text-[#795900] flex-shrink-0">
            <span className="material-symbols-outlined text-[24px]">person</span>
          </div>
          <div>
            <div className="font-sans text-body-sm text-on-surface-variant mb-1 font-semibold">Pending Pujari Assignments</div>
            <div className="font-display text-headline-md text-on-surface font-bold">{pendingPujariCount}</div>
          </div>
        </Link>

        {/* Card 3 */}
        <Link to="/deliveries" className="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-[#F0E6D2] border-l-4 border-l-tertiary flex items-start gap-4 hover:translate-y-[-2px] transition-all duration-200">
          <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary flex-shrink-0">
            <span className="material-symbols-outlined text-[24px]">inventory_2</span>
          </div>
          <div>
            <div className="font-sans text-body-sm text-on-surface-variant mb-1 font-semibold">Pending Deliveries</div>
            <div className="font-display text-headline-md text-on-surface font-bold">{pendingDeliveriesCount}</div>
          </div>
        </Link>

        {/* Card 4 */}
        <Link to="/queries" className="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-[#F0E6D2] border-l-4 border-l-[#2E7D32] flex items-start gap-4 hover:translate-y-[-2px] transition-all duration-200">
          <div className="w-12 h-12 rounded-full bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32] flex-shrink-0">
            <span className="material-symbols-outlined text-[24px]">chat</span>
          </div>
          <div>
            <div className="font-sans text-body-sm text-on-surface-variant mb-1 font-semibold">Unread Queries</div>
            <div className="font-display text-headline-md text-on-surface font-bold">{unreadQueriesCount}</div>
          </div>
        </Link>

      </div>

      {/* Main Sections (Table + Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upcoming Poojas Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-white">
            <h2 className="font-display text-headline-sm text-on-surface font-bold">Today's &amp; Tomorrow's Poojas</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            {activePoojas.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-sans text-label-md uppercase tracking-wider font-semibold">
                    <th className="p-4 border-b border-outline-variant">Pooja Name</th>
                    <th className="p-4 border-b border-outline-variant">Date &amp; Time</th>
                    <th className="p-4 border-b border-outline-variant text-center">Bookings</th>
                    <th className="p-4 border-b border-outline-variant">Pujari Assigned</th>
                    <th className="p-4 border-b border-outline-variant">Stream Status</th>
                    <th className="p-4 border-b border-outline-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-sans text-body-sm divide-y divide-outline-variant">
                  {activePoojas.map(pooja => (
                    <tr key={pooja.id} className="hover:bg-surface-container-lowest transition-colors bg-white">
                      <td className="p-4 font-semibold text-on-surface">{pooja.poojaName}</td>
                      <td className="p-4 text-on-surface-variant">{getBookingDateLabel(pooja.dateTime)}</td>
                      <td className="p-4 text-on-surface-variant text-center">{pooja.currentBookings}/{pooja.maxBookings}</td>
                      <td className="p-4">
                        {pooja.pujari === 'Not Assigned' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container">
                            Not Assigned
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#1B5E20]">
                            {pooja.pujari}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-on-surface-variant">{pooja.streamStatus}</td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {pooja.pujari === 'Not Assigned' && (
                            <button 
                              onClick={() => handleAssignPujari(pooja.id)}
                              className="font-sans text-button px-4 py-2 rounded-full border-2 border-primary text-primary hover:bg-primary-container/10 transition-colors whitespace-nowrap cursor-pointer font-bold"
                            >
                              Assign Pujari
                            </button>
                          )}
                          <button 
                            onClick={() => handleStartStream(pooja.id)}
                            className="font-sans text-button px-4 py-2 rounded-full bg-primary text-on-primary hover:bg-primary/90 transition-colors whitespace-nowrap shadow-sm cursor-pointer font-bold"
                          >
                            Start Stream
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-on-surface-variant font-medium">
                No poojas scheduled for today or tomorrow.
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-white">
            <h2 className="font-display text-headline-sm text-on-surface font-bold">Recent Bookings</h2>
            <Link 
              to="/bookings" 
              className="font-sans text-button text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              View All 
              <span className="material-symbols-outlined text-[16px] flex items-center justify-center">arrow_forward</span>
            </Link>
          </div>
          
          <div className="p-4 flex flex-col gap-4 bg-white flex-1 overflow-y-auto">
            {recentBookings.map(booking => (
              <Link 
                key={booking.id} 
                to={`/bookings/${booking.id}`} 
                className="flex items-start justify-between p-3 hover:bg-surface-container-low rounded-lg transition-colors border border-transparent hover:border-outline-variant"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-label-md text-on-surface-variant uppercase bg-surface-variant px-2 py-0.5 rounded font-semibold">
                      {booking.id}
                    </span>
                    <span className="font-sans text-body-md font-bold text-on-surface">{booking.devoteeDetails?.name}</span>
                  </div>
                  <div className="font-sans text-body-sm text-on-surface-variant">
                    {booking.poojaName} • {booking.scheduledDate.split(',')[0]}
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  booking.paymentStatus === 'COMPLETED' ? 'bg-[#E8F5E9] text-[#1B5E20]' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.paymentStatus}
                </span>
              </Link>
            ))}
            {recentBookings.length === 0 && (
              <div className="p-4 text-center text-on-surface-variant font-medium">
                No recent bookings.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

