// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { buildGoogleMapsDirectionsUrl } from '@devaseva/core';

export function Home() {
  const navigate = useNavigate();
  const { currentUser, templeId } = useAuth();
  
  const profileName = currentUser?.name?.trim().split(/\s+/)[0] || 'PRO';

  const [activePoojas, setActivePoojas] = useState<any[]>([]);
  const [todaysPoojasCount, setTodaysPoojasCount] = useState(0);
  const [pendingPujariCount, setPendingPujariCount] = useState(0);
  const [pendingDeliveriesCount, setPendingDeliveriesCount] = useState(0);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [unreadQueriesCount, setUnreadQueriesCount] = useState(0);

  const [poojasMap, setPoojasMap] = useState<Record<string, string>>({});
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [templeData, setTempleData] = useState<any>(null);

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
  const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (!templeId) return;

    // Fetch Temple Data
    getDoc(doc(db, 'temples', templeId)).then(d => {
      if(d.exists()) setTempleData(d.data());
    });

    // Fetch Poojas for mapping pooja names
    const poojasQuery = query(collection(db, 'poojas'), where('templeId', '==', templeId));
    const unsubPoojas = onSnapshot(poojasQuery, (snapshot) => {
      const pMap: Record<string, string> = {};
      snapshot.forEach(doc => {
        pMap[doc.id] = doc.data().name || 'Unknown Pooja';
      });
      setPoojasMap(pMap);
    });

    // 1 & 5. Today's Poojas & Today's/Tomorrow's Poojas (Slots Collection)
    const slotsQuery = query(
      collection(db, 'slots'),
      where('templeId', '==', templeId)
    );
    const unsubSlots = onSnapshot(slotsQuery, (snapshot) => {
      const allSlots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Todays Count
      const todays = allSlots.filter(s => s.date === todayDateStr && s.status !== 'CANCELLED');
      setTodaysPoojasCount(todays.length);

      // Active Poojas (Today + Tomorrow)
      const active = allSlots.filter(s => (s.date === todayDateStr || s.date === tomorrowDateStr) && s.status !== 'CANCELLED');
      // Sort by date then time
      active.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || '').localeCompare(b.time || '');
      });
      setActivePoojas(active);
    });

    // 2. Pending Pujari Assignments (Bookings Collection)
    const pujariQuery = query(
      collection(db, 'bookings'),
      where('templeId', '==', templeId)
    );
    const unsubPujari = onSnapshot(pujariQuery, (snapshot) => {
      let pendingCount = 0;
      const bks: any[] = [];
      snapshot.forEach(doc => {
        const b = { id: doc.id, ...doc.data() };
        bks.push(b);
        if (b.status !== 'COMPLETED' && (!b.priestName || b.priestName === 'Not Assigned')) {
          pendingCount++;
        }
      });
      setPendingPujariCount(pendingCount);
      setAllBookings(bks);
    });

    // 3. Pending Deliveries (Deliveries Collection)
    const deliveriesQuery = query(
      collection(db, 'deliveries'),
      where('templeId', '==', templeId)
    );
    const unsubDeliveries = onSnapshot(deliveriesQuery, (snapshot) => {
      let pendingCount = 0;
      snapshot.forEach(doc => {
        const status = doc.data().status;
        if (['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(status)) {
          pendingCount++;
        }
      });
      setPendingDeliveriesCount(pendingCount);
    });

    // 4. Recent Bookings (Bookings Collection)
    const recentBookingsQuery = query(
      collection(db, 'bookings'),
      where('templeId', '==', templeId)
    );
    const unsubRecentBookings = onSnapshot(recentBookingsQuery, (snapshot) => {
      let recent = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort in memory by createdAt (or fallback to id if missing) to avoid index requirement
      recent.sort((a, b) => {
        let timeA = 0;
        let timeB = 0;
        
        if (a.createdAt) {
          timeA = typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
        }
        if (b.createdAt) {
          timeB = typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
        }
        return timeB - timeA;
      });
      
      setRecentBookings(recent.slice(0, 5));
    });

    // 6. Unread Queries (Queries Collection)
    // Note: The schema for queries may not have templeId, but we apply it in case it's added.
    const queriesQuery = query(
      collection(db, 'queries')
    );
    const unsubQueries = onSnapshot(queriesQuery, (snapshot) => {
      let unreadCount = 0;
      snapshot.forEach(doc => {
        const qData = doc.data();
        // Fallback global check since Admin schema lacks templeId currently
        if (qData.status === 'Open' || qData.unreadCount > 0) {
          unreadCount++;
        }
      });
      setUnreadQueriesCount(unreadCount);
    });

    return () => {
      unsubPoojas();
      unsubSlots();
      unsubPujari();
      unsubDeliveries();
      unsubRecentBookings();
      unsubQueries();
    };
  }, [templeId, todayDateStr, tomorrowDateStr]);

  const handleStartStream = (id: string) => {
    navigate(`/stream-readiness/${id}`);
  };

  const handleAssignPujari = (id: string) => {
    navigate(`/bookings/${id}`);
  };

  const getBookingDateLabel = (dateStr: string, timeStr?: string) => {
    if (!dateStr) return '';
    let label = dateStr;
    if (dateStr === todayDateStr) label = 'Today';
    if (dateStr === tomorrowDateStr) label = 'Tomorrow';
    return `${label} ${timeStr || ''}`.trim();
  };

  return (
    <div className="p-xl min-h-[calc(100vh-104px)] relative mandala-watermark">
      <PageHeader title={`Good Morning, ${profileName} 👋`} />
      
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <p className="font-sans text-body-lg text-on-surface-variant font-medium">
          {today}
        </p>
        {(() => {
          const lat = templeData?.latitude ?? 0;
          const lng = templeData?.longitude ?? 0;
          const hasLocation = !!(lat && lng);
          
          if (hasLocation) {
            return (
              <button 
                onClick={() => window.open(buildGoogleMapsDirectionsUrl(lat, lng), '_blank')}
                className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full font-bold shadow hover:bg-[#b04b00] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">directions</span>
                Directions to Temple
              </button>
            );
          }
          return (
            <button 
              disabled
              className="flex items-center gap-2 bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full font-bold shadow-sm opacity-60 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">location_off</span>
              Location not available
            </button>
          );
        })()}
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
                  {activePoojas.map(slot => {
                    const slotBookings = allBookings.filter(b => {
                      const bDate = b.scheduledDate || (b.createdAt?.toDate ? b.createdAt.toDate().toISOString().substring(0,10) : typeof b.createdAt === 'string' ? b.createdAt.substring(0,10) : '');
                      // Match Pooja ID
                      if (b.poojaId !== slot.poojaId) return false;
                      // Match Date
                      if (bDate !== slot.date) return false;
                      // Match Time (if specified, otherwise assume matched if date matches)
                      if (b.scheduledTime && slot.startTime && b.scheduledTime !== slot.startTime && b.scheduledTime !== slot.time) {
                        return false;
                      }
                      return true;
                    });
                    const priests = [...new Set(slotBookings.map(b => b.priestName).filter(n => n && n !== 'Not Assigned'))];
                    const unassignedBookings = slotBookings.filter(b => !b.priestName || b.priestName === 'Not Assigned');
                    
                    let priestLabel = 'Not Assigned';
                    let isAssigned = false;
                    let hasBookings = slotBookings.length > 0;
                    
                    if (priests.length > 0) {
                      priestLabel = priests.join(', ');
                      if (unassignedBookings.length > 0) {
                        priestLabel += ' (Partial)';
                      } else {
                        isAssigned = true;
                      }
                    } else if (!hasBookings) {
                      priestLabel = 'No Bookings';
                      isAssigned = true; // Use neutral/green state since it doesn't need attention
                    }

                    return (
                    <tr key={slot.id} className="hover:bg-surface-container-lowest transition-colors bg-white">
                      <td className="p-4 font-semibold text-on-surface">{poojasMap[slot.poojaId] || slot.poojaName || slot.poojaId || 'Unknown Pooja'}</td>
                      <td className="p-4 text-on-surface-variant">{getBookingDateLabel(slot.date, slot.startTime || slot.time)}</td>
                      <td className="p-4 text-on-surface-variant text-center">{slotBookings.length}/{slot.capacity || '-'}</td>
                      <td className="p-4">
                        {!isAssigned ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container">
                            {priestLabel}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${hasBookings ? 'bg-[#E8F5E9] text-[#1B5E20]' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            {priestLabel}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-on-surface-variant">{slot.streamStatus || 'Pending'}</td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {!isAssigned && unassignedBookings.length > 0 && (
                            <button 
                              onClick={() => handleAssignPujari(unassignedBookings[0].id)}
                              className="font-sans text-button px-4 py-2 rounded-full border-2 border-primary text-primary hover:bg-primary-container/10 transition-colors whitespace-nowrap cursor-pointer font-bold"
                            >
                              Assign Pujari
                            </button>
                          )}
                          <button 
                            onClick={() => handleStartStream(slot.id)}
                            className="font-sans text-button px-4 py-2 rounded-full bg-primary text-on-primary hover:bg-primary/90 transition-colors whitespace-nowrap shadow-sm cursor-pointer font-bold"
                          >
                            Start Stream
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
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
                      {booking.id.substring(0, 10)}...
                    </span>
                    <span className="font-sans text-body-md font-bold text-on-surface">{booking.userId || 'Guest'}</span>
                  </div>
                  <div className="font-sans text-body-sm text-on-surface-variant">
                    {booking.poojaName} • {booking.scheduledDate || (booking.createdAt?.toDate ? booking.createdAt.toDate().toISOString().substring(0,10) : typeof booking.createdAt === 'string' ? booking.createdAt.substring(0,10) : '')}
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  booking.paymentStatus === 'PAID' ? 'bg-[#E8F5E9] text-[#1B5E20]' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.paymentStatus || 'PENDING'}
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
