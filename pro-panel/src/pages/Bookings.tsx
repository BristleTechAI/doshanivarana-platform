import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Booking } from '@devaseva/core';
import { PageHeader } from '../components/PageHeader';

// Helper to get sort time from booking
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

// Helper to check if a booking is completed
const isCompleted = (b: any) => {
  const statusStr = (b.status || b.bookingStatus || '').toUpperCase();
  return statusStr === 'COMPLETED';
};

export function Bookings() {
  const navigate = useNavigate();
  const { templeId } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [poojaType, setPoojaType] = useState('All Poojas');
  const [pujariFilter, setPujariFilter] = useState('All');
  const [deliveryFilter, setDeliveryFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const [bookings, setBookings] = useState<Booking[]>([]);

  // Custom Dropdown states
  const [isPoojaOpen, setIsPoojaOpen] = useState(false);
  const [isPujariOpen, setIsPujariOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const poojaRef = useRef<HTMLDivElement>(null);
  const pujariRef = useRef<HTMLDivElement>(null);
  const deliveryRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (poojaRef.current && !poojaRef.current.contains(event.target as Node)) setIsPoojaOpen(false);
      if (pujariRef.current && !pujariRef.current.contains(event.target as Node)) setIsPujariOpen(false);
      if (deliveryRef.current && !deliveryRef.current.contains(event.target as Node)) setIsDeliveryOpen(false);
      if (paymentRef.current && !paymentRef.current.contains(event.target as Node)) setIsPaymentOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!templeId) return;
      try {
        const q = query(
          collection(db, "bookings"),
          where("templeId", "==", templeId),
          where("isDeleted", "==", false)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        
        // Sort by date descending (newest first)
        data.sort((a, b) => {
          const timeA = getSortTime(a);
          const timeB = getSortTime(b);
          if (timeA !== timeB) return timeB - timeA;
          return b.id.localeCompare(a.id);
        });
        
        setBookings(data);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      }
    };
    fetchBookings();
  }, [templeId]);

  const handleViewDetails = (id: string) => {
    navigate(`/bookings/${id}`);
  };

  // Map Firestore ID to sequence string (BK_0000000001 format) chronologically (oldest first)
  const displayIdMap = useMemo(() => {
    const sortedChronologically = [...bookings].sort((a, b) => {
      const timeA = getSortTime(a);
      const timeB = getSortTime(b);
      if (timeA !== timeB) return timeA - timeB;
      return a.id.localeCompare(b.id);
    });
    
    const map = new Map<string, string>();
    sortedChronologically.forEach((b, index) => {
      const seqStr = String(index + 1).padStart(10, '0');
      map.set(b.id, `BK_${seqStr}`);
    });
    return map;
  }, [bookings]);

  // Filters
  const filteredBookings = bookings.filter(b => {
    const tabMatch = activeTab === 'all' || (isCompleted(b) ? 'completed' : 'upcoming') === activeTab;
    const poojaMatch = poojaType === 'All Poojas' || b.poojaName === poojaType;
    const pujariMatch = pujariFilter === 'All' || 
      (pujariFilter === 'Yes' && (b.priestName || 'Not Assigned') !== 'Not Assigned') || 
      (pujariFilter === 'No' && (b.priestName || 'Not Assigned') === 'Not Assigned');
    const deliveryMatch = deliveryFilter === 'All' || (b.hasPrasadDelivery ? 'Yes' : 'No') === deliveryFilter;
    const paymentMatch = paymentFilter === 'All' || b.paymentStatus === paymentFilter;

    return tabMatch && poojaMatch && pujariMatch && deliveryMatch && paymentMatch;
  });

  const unassignedCount = bookings.filter(b => !isCompleted(b) && (b.priestName || 'Not Assigned') === 'Not Assigned').length;

  const getTabCount = (tab: 'upcoming' | 'completed' | 'all') => {
    return bookings.filter(b => {
      const tabMatch = tab === 'all' || (isCompleted(b) ? 'completed' : 'upcoming') === tab;
      const poojaMatch = poojaType === 'All Poojas' || b.poojaName === poojaType;
      const pujariMatch = pujariFilter === 'All' || 
        (pujariFilter === 'Yes' && (b.priestName || 'Not Assigned') !== 'Not Assigned') || 
        (pujariFilter === 'No' && (b.priestName || 'Not Assigned') === 'Not Assigned');
      const deliveryMatch = deliveryFilter === 'All' || (b.hasPrasadDelivery ? 'Yes' : 'No') === deliveryFilter;
      const paymentMatch = paymentFilter === 'All' || b.paymentStatus === paymentFilter;

      return tabMatch && poojaMatch && pujariMatch && deliveryMatch && paymentMatch;
    }).length;
  };

  return (
    <div className="max-w-[1440px] mx-auto relative">
      <PageHeader title="Bookings Manager" />
      
      {/* Page Header */}
      <div className="mb-8">
        <p className="font-sans text-body-lg text-on-surface-variant font-medium">View and manage all devotee bookings for your temple</p>
      </div>

      {/* Attention Banner */}
      {unassignedCount > 0 && (
        <div className="bg-error-container text-on-error-container p-4 rounded-lg flex items-center gap-3 mb-8 shadow-sm font-sans">
          <span className="material-symbols-outlined flex items-center justify-center">warning</span>
          <p className="text-body-md font-semibold">
            {unassignedCount} bookings have no pujari assigned. Please assign pujaris before the pooja date.
          </p>
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-8 border-b border-outline-variant mb-6 font-display">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 border-b-2 text-headline-sm font-bold cursor-pointer transition-all duration-200 ${
            activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Upcoming ({getTabCount('upcoming')})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-3 border-b-2 text-headline-sm font-bold cursor-pointer transition-all duration-200 ${
            activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Completed ({getTabCount('completed')})
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`pb-3 border-b-2 text-headline-sm font-bold cursor-pointer transition-all duration-200 ${
            activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          All ({getTabCount('all')})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest rounded-xl soft-shadow p-4 sm:p-6 mb-8 border border-outline-variant/30 font-sans flex flex-col xl:flex-row items-start xl:items-end justify-between gap-4 sm:gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:flex-1">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-label-md text-on-surface-variant font-semibold">Pooja Type</label>
            <div className="w-full relative" ref={poojaRef}>
              <div 
                className="w-full bg-surface border border-outline-variant rounded-lg pl-3 pr-8 py-2 text-body-sm text-on-surface cursor-pointer flex items-center justify-between transition-colors hover:border-primary focus-within:border-primary focus-within:ring-1 focus-within:ring-primary font-semibold"
                onClick={() => {
                  setIsPoojaOpen(!isPoojaOpen);
                  setIsPujariOpen(false); setIsDeliveryOpen(false); setIsPaymentOpen(false);
                }}
                tabIndex={0}
              >
                <span className="truncate">{poojaType}</span>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm transition-transform" style={{ transform: isPoojaOpen ? 'rotate(180deg)' : 'none' }}>arrow_drop_down</span>
              </div>
              {isPoojaOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-surface border border-outline-variant/30 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto font-sans text-body-sm animate-in fade-in slide-in-from-top-2 duration-200">
                  {['All Poojas', 'Satyanarayana Pooja', 'Ganapathi Homam', 'Lakshmi Pooja', 'Navagraha Pooja', 'Rudra Abhishekam'].map(opt => (
                    <div 
                      key={opt}
                      className={`px-3 py-2.5 cursor-pointer hover:bg-primary/5 transition-colors truncate ${poojaType === opt ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface'}`}
                      onClick={() => { setPoojaType(opt); setIsPoojaOpen(false); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-label-md text-on-surface-variant font-semibold">Pujari Assigned</label>
            <div className="w-full relative" ref={pujariRef}>
              <div 
                className="w-full bg-surface border border-outline-variant rounded-lg pl-3 pr-8 py-2 text-body-sm text-on-surface cursor-pointer flex items-center justify-between transition-colors hover:border-primary focus-within:border-primary focus-within:ring-1 focus-within:ring-primary font-semibold"
                onClick={() => {
                  setIsPujariOpen(!isPujariOpen);
                  setIsPoojaOpen(false); setIsDeliveryOpen(false); setIsPaymentOpen(false);
                }}
                tabIndex={0}
              >
                <span className="truncate">{pujariFilter}</span>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm transition-transform" style={{ transform: isPujariOpen ? 'rotate(180deg)' : 'none' }}>arrow_drop_down</span>
              </div>
              {isPujariOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-surface border border-outline-variant/30 rounded-lg shadow-lg z-50 overflow-y-auto font-sans text-body-sm animate-in fade-in slide-in-from-top-2 duration-200">
                  {['All', 'Yes', 'No'].map(opt => (
                    <div 
                      key={opt}
                      className={`px-3 py-2.5 cursor-pointer hover:bg-primary/5 transition-colors truncate ${pujariFilter === opt ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface'}`}
                      onClick={() => { setPujariFilter(opt); setIsPujariOpen(false); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-label-md text-on-surface-variant font-semibold">Delivery</label>
            <div className="w-full relative" ref={deliveryRef}>
              <div 
                className="w-full bg-surface border border-outline-variant rounded-lg pl-3 pr-8 py-2 text-body-sm text-on-surface cursor-pointer flex items-center justify-between transition-colors hover:border-primary focus-within:border-primary focus-within:ring-1 focus-within:ring-primary font-semibold"
                onClick={() => {
                  setIsDeliveryOpen(!isDeliveryOpen);
                  setIsPoojaOpen(false); setIsPujariOpen(false); setIsPaymentOpen(false);
                }}
                tabIndex={0}
              >
                <span className="truncate">{deliveryFilter}</span>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm transition-transform" style={{ transform: isDeliveryOpen ? 'rotate(180deg)' : 'none' }}>arrow_drop_down</span>
              </div>
              {isDeliveryOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-surface border border-outline-variant/30 rounded-lg shadow-lg z-50 overflow-y-auto font-sans text-body-sm animate-in fade-in slide-in-from-top-2 duration-200">
                  {['All', 'Yes', 'No'].map(opt => (
                    <div 
                      key={opt}
                      className={`px-3 py-2.5 cursor-pointer hover:bg-primary/5 transition-colors truncate ${deliveryFilter === opt ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface'}`}
                      onClick={() => { setDeliveryFilter(opt as 'All' | 'Yes' | 'No'); setIsDeliveryOpen(false); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-label-md text-on-surface-variant font-semibold">Payment Status</label>
            <div className="w-full relative" ref={paymentRef}>
              <div 
                className="w-full bg-surface border border-outline-variant rounded-lg pl-3 pr-8 py-2 text-body-sm text-on-surface cursor-pointer flex items-center justify-between transition-colors hover:border-primary focus-within:border-primary focus-within:ring-1 focus-within:ring-primary font-semibold"
                onClick={() => {
                  setIsPaymentOpen(!isPaymentOpen);
                  setIsPoojaOpen(false); setIsPujariOpen(false); setIsDeliveryOpen(false);
                }}
                tabIndex={0}
              >
                <span className="truncate">{paymentFilter}</span>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm transition-transform" style={{ transform: isPaymentOpen ? 'rotate(180deg)' : 'none' }}>arrow_drop_down</span>
              </div>
              {isPaymentOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-surface border border-outline-variant/30 rounded-lg shadow-lg z-50 overflow-y-auto font-sans text-body-sm animate-in fade-in slide-in-from-top-2 duration-200">
                  {['All', 'PAID', 'PENDING'].map(opt => (
                    <div 
                      key={opt}
                      className={`px-3 py-2.5 cursor-pointer hover:bg-primary/5 transition-colors truncate ${paymentFilter === opt ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface'}`}
                      onClick={() => { setPaymentFilter(opt); setIsPaymentOpen(false); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center shrink-0 w-full xl:w-auto mt-2 xl:mt-0">
          <button 
            className="w-full sm:w-auto px-6 py-2 rounded-full font-button text-button text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer font-bold border border-outline-variant/50"
            onClick={() => {
              setPoojaType('All Poojas');
              setPujariFilter('All');
              setDeliveryFilter('All');
              setPaymentFilter('All');
            }}
          >
            Reset
          </button>
          <button className="w-full sm:w-auto px-6 py-2 rounded-full font-button text-button text-primary border-2 border-primary hover:bg-primary-container/20 transition-colors cursor-pointer font-bold whitespace-nowrap">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <p className="font-sans text-body-md text-on-surface-variant mb-4 font-semibold">
        Showing {filteredBookings.length} bookings
      </p>

      {/* Bookings Table */}
      <div className="bg-surface-container-lowest rounded-xl soft-shadow overflow-hidden border border-[#F0E6D2]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container-low text-on-surface-variant font-sans text-label-md font-semibold uppercase tracking-wider">
                <th className="p-4 whitespace-nowrap">Booking ID</th>
                <th className="p-4 whitespace-nowrap">Devotee Name</th>
                <th className="p-4 whitespace-nowrap">Pooja Name</th>
                <th className="p-4 whitespace-nowrap">Slot Date &amp; Time</th>
                <th className="p-4 whitespace-nowrap">Payment</th>
                <th className="p-4 whitespace-nowrap">Pujari Assigned</th>
                <th className="p-4 whitespace-nowrap">Delivery</th>
                <th className="p-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-sans text-body-sm text-on-surface divide-y divide-outline-variant/20">
              
              {filteredBookings.map((b: any) => (
                <tr 
                  key={b.id} 
                  className={`border-b border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low transition-colors ${
                    !isCompleted(b) && (b.priestName || 'Not Assigned') === 'Not Assigned' ? 'border-l-4 border-l-error' : ''
                  }`}
                >
                  <td className="p-4 font-bold">{displayIdMap.get(b.id) || b.id}</td>
                  <td className="p-4 font-semibold">{b.devoteeName || b.devoteeDetails?.name || 'Guest'}</td>
                  <td className="p-4 font-semibold">{b.poojaName}</td>
                  <td className="p-4 text-on-surface-variant">{b.scheduledDate} {b.scheduledTime}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold tracking-wide">
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    {(b.priestName || 'Not Assigned') === 'Not Assigned' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold tracking-wide gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span> 
                        Not Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
                        <span className="material-symbols-outlined text-[16px] flex items-center justify-center">check_circle</span> 
                        {(b.priestName || 'Not Assigned')}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold ${
                      (b.hasPrasadDelivery ? 'Yes' : 'No') === 'Yes' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {(b.hasPrasadDelivery ? 'Yes' : 'No')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleViewDetails(b.id)}
                      className="text-primary font-sans text-button hover:underline cursor-pointer font-bold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant font-medium">
                    No bookings found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest font-sans">
          <span className="text-body-sm text-on-surface-variant">Showing 1–{filteredBookings.length} of {filteredBookings.length} bookings</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 font-button text-button text-on-surface-variant hover:text-on-surface disabled:opacity-50" disabled={true}>Previous</button>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-full bg-primary text-on-primary font-button text-button flex items-center justify-center font-bold">1</button>
            </div>
            <button className="px-3 py-1 font-button text-button text-primary hover:bg-primary-container/20 rounded-md transition-colors font-bold" disabled={true}>Next</button>
          </div>
        </div>

      </div>

    </div>
  );
}
