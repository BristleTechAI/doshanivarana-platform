// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { doc, getDoc, updateDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Booking } from '@devaseva/core';

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selectedPujari, setSelectedPujari] = useState('Not Assigned');
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
      try {
        const docRef = doc(db, 'bookings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const bData = docSnap.data() as Booking;
          setBooking({ id: docSnap.id, ...bData });
          setSelectedPujari(bData.priestName || 'Not Assigned');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

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
        await updateDoc(doc(db, 'bookings', id), {
          priestName: selectedPujari,
          updatedAt: serverTimestamp()
        });
        setBooking({ ...booking, priestName: selectedPujari });
        setNotification('Pujari assigned successfully!');
        setTimeout(() => setNotification(null), 3000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (loading) return <div className="p-xl text-center">Loading...</div>;

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
                <p className="text-body-lg text-on-background font-bold">{booking.id}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Booking Date</p>
                <p className="text-body-lg text-on-background font-medium">{booking.scheduledDate}</p>
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
                <p className="text-body-sm text-on-surface-variant break-all font-semibold">{booking.status}</p>
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
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">User ID</p>
                <p className="text-body-lg text-on-background font-bold">{booking.userId}</p>
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
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Pooja ID</p>
                <p className="text-headline-md text-primary font-bold">{booking.poojaId}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Temple ID</p>
                <p className="text-body-lg text-on-background font-medium">{booking.templeId}</p>
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
                selectedPujari === 'Not Assigned' 
                  ? 'bg-error-container text-on-error-container' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {selectedPujari === 'Not Assigned' ? 'Not Assigned' : 'Assigned'}
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
                <option value="Pandit Ramachandra">Pandit Ramachandra</option>
                <option value="Pandit Shivakumara">Pandit Shivakumara</option>
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
