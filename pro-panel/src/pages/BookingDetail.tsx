// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { doc, getDoc, getDocs, updateDoc, setDoc, collection, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PageHeader } from '../components/PageHeader';
import { buildGoogleMapsDirectionsUrl } from '@devaseva/core';

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selectedPujariId, setSelectedPujariId] = useState('Not Assigned');
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [priests, setPriests] = useState<any[]>([]);
  const [templeData, setTempleData] = useState<any>(null);
  const [displayId, setDisplayId] = useState<string>('');
  
  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
      try {
        const docRef = doc(db, 'bookings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const bData = docSnap.data() as Booking;
          setBooking({ id: docSnap.id, ...bData });
          setSelectedPujariId(bData.priestId || 'Not Assigned');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  useEffect(() => {
    if (!booking?.templeId) return;

    const fetchAllBookingsForSeq = async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('templeId', '==', booking.templeId),
          where('isDeleted', '==', false)
        );
        const snap = await getDocs(q);
        const allDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        const getSortTime = (b: any) => {
          if (b.createdAt) {
            if (typeof b.createdAt.toMillis === 'function') return b.createdAt.toMillis();
            if (typeof b.createdAt.seconds === 'number') {
              return b.createdAt.seconds * 1000 + (b.createdAt.nanoseconds || 0) / 1000000;
            }
            return new Date(b.createdAt).getTime();
          }
          if (b.scheduledDate) {
            return new Date(b.scheduledDate).getTime();
          }
          return 0;
        };

        allDocs.sort((a, b) => {
          const timeA = getSortTime(a);
          const timeB = getSortTime(b);
          if (timeA !== timeB) return timeA - timeB;
          return a.id.localeCompare(b.id);
        });

        const idx = allDocs.findIndex(d => d.id === booking.id);
        if (idx !== -1) {
          const seqStr = String(idx + 1).padStart(10, '0');
          setDisplayId(`BK_${seqStr}`);
        } else {
          setDisplayId(booking.id);
        }
      } catch (err) {
        console.error("Failed to map sequential ID:", err);
        setDisplayId(booking.id);
      }
    };

    fetchAllBookingsForSeq();
  }, [booking?.id, booking?.templeId]);

  useEffect(() => {
    if (!booking?.templeId) return;

    const q = query(
      collection(db, 'priests'),
      where('templeId', '==', booking.templeId),
      where('isDeleted', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Only show priests that are eligible for assignment
      setPriests(docs.filter(p => p.status !== 'Inactive' && p.status !== 'On Leave'));
    });

    getDoc(doc(db, 'temples', booking.templeId)).then(d => {
      if(d.exists()) setTempleData(d.data());
    });

    return () => unsubscribe();
  }, [booking?.templeId]);

  const rescheduleRequest = booking?.rescheduleRequest;

  const handleApproveReschedule = async () => {
    if (booking && rescheduleRequest && id) {
      try {
        const updatedDate = rescheduleRequest.newDate;
        const updatedTime = rescheduleRequest.newTime;

        // Update booking document
        await updateDoc(doc(db, 'bookings', id), {
          scheduledDate: updatedDate,
          scheduledTime: updatedTime,
          rescheduleRequest: null,
          updatedAt: serverTimestamp()
        });

        // Create System Event
        const eventRef = doc(collection(db, 'systemEvents'));
        await setDoc(eventRef, {
          eventType: 'reschedule.approved',
          entityId: id,
          entityType: 'booking',
          payload: {
            bookingId: id,
            userId: booking.userId,
            templeId: booking.templeId,
            newDate: updatedDate,
            newTime: updatedTime
          },
          status: 'PENDING',
          createdAt: serverTimestamp()
        });

        setBooking({ ...booking, scheduledDate: updatedDate, scheduledTime: updatedTime, rescheduleRequest: null });
        setNotification('Reschedule request approved!');
        setTimeout(() => setNotification(null), 3000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleRejectReschedule = async () => {
    if (booking && rescheduleRequest && id) {
      try {
        await updateDoc(doc(db, 'bookings', id), {
          rescheduleRequest: null,
          updatedAt: serverTimestamp()
        });

        const eventRef = doc(collection(db, 'systemEvents'));
        await setDoc(eventRef, {
          eventType: 'reschedule.rejected',
          entityId: id,
          entityType: 'booking',
          payload: {
            bookingId: id,
            userId: booking.userId,
            templeId: booking.templeId
          },
          status: 'PENDING',
          createdAt: serverTimestamp()
        });

        setBooking({ ...booking, rescheduleRequest: null });
        setNotification('Reschedule request rejected.');
        setTimeout(() => setNotification(null), 3000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveAssignment = async () => {
    if (booking && id) {
      try {
        const priestObj = priests.find(p => p.id === selectedPujariId);
        
        const updatePayload: any = {
          updatedAt: serverTimestamp()
        };

        if (priestObj) {
          updatePayload.priestId = priestObj.id;
          updatePayload.priestName = priestObj.name;
        } else {
          updatePayload.priestId = null;
          updatePayload.priestName = 'Not Assigned';
        }

        await updateDoc(doc(db, 'bookings', id), updatePayload);
        setBooking({ ...booking, priestId: updatePayload.priestId, priestName: updatePayload.priestName });

        // Create system event so user receives a real-time notification
        if (priestObj) {
          const eventRef = doc(collection(db, 'systemEvents'));
          await setDoc(eventRef, {
            eventType: 'pujari.assigned',
            entityId: id,
            entityType: 'booking',
            payload: {
              bookingId: id,
              userId: booking.userId,
              templeId: booking.templeId,
              priestId: priestObj.id,
              priestName: priestObj.name,
              poojaName: booking.poojaName || '',
            },
            status: 'PENDING',
            createdAt: serverTimestamp()
          });
        }

        setNotification('Pujari assigned successfully!');
        setTimeout(() => setNotification(null), 3000);
      } catch (e) {
        console.error(e);
      }
    }
  };


  if (loading) {
    return (
      <>
        <PageHeader title="Booking Detail" backTo="/bookings" />
        <div className="p-xl text-center">Loading...</div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <PageHeader title="Booking Detail" backTo="/bookings" />
        <div className="p-xl text-center font-sans">
          <h2 className="text-headline-md font-bold text-on-surface">Booking not found</h2>
          <Link to="/bookings" className="text-primary hover:underline font-bold mt-4 inline-block">Back to Bookings</Link>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto pb-24 relative">
      <PageHeader title={`Booking Detail — ${displayId || booking.id}`} backTo="/bookings" />

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
          <span className={`font-label-md text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
            booking.paymentStatus === 'PAID' 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
          }`}>
            {booking.paymentStatus || 'UNKNOWN'}
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
                <p className="text-body-lg text-on-background font-bold">{displayId || booking.id}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Booking Date</p>
                <p className="text-body-lg text-on-background font-medium">{booking.scheduledDate || 'N/A'}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Payment Status</p>
                <p className="text-body-lg text-green-700 font-bold">{booking.paymentStatus}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Amount Paid</p>
                <p className="text-body-lg text-on-background font-bold">₹{booking.amountPaid || booking.amount || 0}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Payment Method</p>
                <p className="text-body-lg text-on-background font-medium">Online</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Status</p>
                <p className="text-body-sm text-on-surface-variant break-all font-semibold">{booking.status || booking.bookingStatus}</p>
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
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Name</p>
                <p className="text-body-lg text-on-background font-bold">{booking.devoteeName || booking.devoteeDetails?.name || 'Guest'}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">User ID</p>
                <p className="text-body-lg text-on-background font-medium">{booking.userId}</p>
              </div>
              {booking.devoteeDetails?.gotra && (
                <div>
                  <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Gotra</p>
                  <p className="text-body-lg text-on-background font-medium">{booking.devoteeDetails.gotra}</p>
                </div>
              )}
              {booking.devoteeDetails?.nakshatra && (
                <div>
                  <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Nakshatra</p>
                  <p className="text-body-lg text-on-background font-medium">{booking.devoteeDetails.nakshatra}</p>
                </div>
              )}
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
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Pooja ID</p>
                <p className="text-headline-md text-primary font-bold">{booking.poojaId}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Temple ID</p>
                <div className="flex items-center justify-between">
                  <p className="text-body-lg text-on-background font-medium">{booking.templeId}</p>
                  {(() => {
                    const lat = templeData?.latitude ?? 0;
                    const lng = templeData?.longitude ?? 0;
                    const hasLocation = !!(lat && lng);

                    if (hasLocation) {
                      return (
                        <button 
                          onClick={() => window.open(buildGoogleMapsDirectionsUrl(lat, lng), '_blank')}
                          className="text-primary font-bold hover:underline flex items-center gap-1 text-sm bg-primary/10 px-3 py-1.5 rounded-lg"
                        >
                          <span className="material-symbols-outlined text-[16px]">directions</span>
                          Directions
                        </button>
                      );
                    }
                    return (
                      <button 
                        disabled
                        className="text-on-surface-variant font-bold flex items-center gap-1 text-sm bg-surface-container-high px-3 py-1.5 rounded-lg opacity-60 cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[16px]">location_off</span>
                        Location not available
                      </button>
                    );
                  })()}
                </div>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Slot Date &amp; Time</p>
                <p className="text-body-lg text-on-background font-semibold">{booking.scheduledDate} {booking.scheduledTime}</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (40%) */}
        <div className="lg:col-span-5 flex flex-col gap-6 font-sans">
          
          {/* Reschedule Request Approval Card */}
          {rescheduleRequest?.status === 'PENDING' && (
            <div className="bg-yellow-50 rounded-xl soft-shadow p-6 border border-yellow-200 border-t-4 border-t-yellow-500">
              <div className="flex items-center gap-2 mb-4 text-yellow-800">
                <span className="material-symbols-outlined">event_repeat</span>
                <h3 className="font-display text-headline-sm font-bold">Reschedule Request</h3>
              </div>
              <p className="text-body-sm text-yellow-900 mb-2 font-medium">The devotee has requested to change the pooja date.</p>
              
              <div className="bg-white/60 p-4 rounded-lg border border-yellow-200 mb-4">
                <p className="text-label-md text-yellow-800 font-bold uppercase tracking-wide mb-1">Requested Date & Time</p>
                <p className="text-body-lg text-yellow-900 font-bold mb-3">{rescheduleRequest.newDate} at {rescheduleRequest.newTime}</p>
                
                <p className="text-label-md text-yellow-800 font-bold uppercase tracking-wide mb-1">Reason</p>
                <p className="text-body-sm text-yellow-900 font-medium italic">"{rescheduleRequest.reason}"</p>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={handleRejectReschedule}
                  className="flex-1 bg-white text-red-600 border border-red-200 font-button text-button py-2.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer font-bold shadow-sm"
                >
                  Reject
                </button>
                <button 
                  onClick={handleApproveReschedule}
                  className="flex-1 bg-yellow-500 text-white font-button text-button py-2.5 rounded-full hover:bg-yellow-600 transition-colors cursor-pointer font-bold shadow-sm"
                >
                  Approve
                </button>
              </div>
            </div>
          )}

          {/* Pujari Assignment Card */}
          <div className="bg-surface-container-lowest rounded-xl soft-shadow p-6 border border-[#F0E6D2] border-t-4 border-t-primary">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_celebrate</span>
                <h3 className="font-display text-headline-sm text-on-surface font-bold">Pujari Assignment</h3>
              </div>
              <span className={`font-label-md text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                selectedPujariId === 'Not Assigned' 
                  ? 'bg-error-container text-on-error-container' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {selectedPujariId === 'Not Assigned' ? 'Not Assigned' : 'Assigned'}
              </span>
            </div>
            
            <div className="mb-4">
              <label className="text-label-md text-on-surface-variant block mb-2 font-bold uppercase tracking-wider">Select Pujari</label>
              <select 
                className="w-full border border-outline-variant rounded-lg p-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-bright font-semibold"
                value={selectedPujariId}
                onChange={(e) => setSelectedPujariId(e.target.value)}
              >
                <option value="Not Assigned">Select Pujari</option>
                {priests.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.experience})</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleSaveAssignment}
              className="w-full bg-primary text-on-primary font-button text-button py-3 rounded-full hover:bg-[#b04b00] transition-colors mb-2 cursor-pointer font-bold shadow-sm"
            >
              Save Assignment
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
