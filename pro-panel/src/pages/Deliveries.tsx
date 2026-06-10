// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';

interface DeliveryRecord {
  id: string;
  bookingId: string;
  devoteeName: string;
  poojaName: string;
  destination: string;
  status: 'Booked' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  daysPending: number;
  isUrgent?: boolean;
}

export function Deliveries() {
  const navigate = useNavigate();
  const { templeId } = useAuth();
  const [activeTab, setActiveTab] = useState<'action' | 'ready' | 'transit' | 'completed'>('action');
  
  const [records, setRecords] = useState<DeliveryRecord[]>([]);

  useEffect(() => {
    if (!templeId) return;

    // Listen to deliveries for this temple
    const q = query(collection(db, 'deliveries'), where('templeId', '==', templeId));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const deliveryDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (deliveryDocs.length === 0) {
        setRecords([]);
        return;
      }

      // Fetch the corresponding bookings
      const bookingsQuery = query(collection(db, 'bookings'), where('templeId', '==', templeId));
      const bookingsSnap = await getDocs(bookingsQuery);
      
      const bookingsMap = new Map();
      bookingsSnap.docs.forEach(doc => {
        bookingsMap.set(doc.id, doc.data());
      });

      const updatedRecords = deliveryDocs.map(d => {
        const b = bookingsMap.get(d.bookingId) || {};
        const address = b.shippingAddress || 'Address not provided';
        
        let destination = address;
        if (address.includes(',')) {
          const parts = address.split(',');
          const stateAndPin = parts[parts.length - 1]?.trim() || '';
          const city = parts[parts.length - 2]?.trim() || '';
          const state = stateAndPin.replace(/\s+\d{6}$/, '').replace(/\d{6}$/, '').trim();
          destination = `${city}, ${state}`;
        }

        return {
          id: d.id,
          bookingId: d.bookingId,
          devoteeName: b.devoteeDetails?.name || b.userId || 'Unknown',
          poojaName: b.poojaName || 'Unknown Pooja',
          destination,
          status: d.status,
          daysPending: 0, // Mock for now
          isUrgent: false
        };
      });

      setRecords(updatedRecords);
    });

    return () => unsubscribe();
  }, [templeId]);

  const handleViewDetails = (deliveryId: string) => {
    navigate(`/deliveries/${deliveryId}`);
  };

  // Stats calculation
  const actionRequiredCount = records.filter(r => r.status === 'PACKED').length;
  const inTransitCount = records.filter(r => r.status === 'SHIPPED' || r.status === 'OUT_FOR_DELIVERY').length;
  const completedCount = records.filter(r => r.status === 'DELIVERED').length;

  const getFilteredRecords = () => {
    switch (activeTab) {
      case 'action':
      case 'ready':
        return records.filter(r => r.status === 'PACKED');
      case 'transit':
        return records.filter(r => r.status === 'SHIPPED' || r.status === 'OUT_FOR_DELIVERY');
      case 'completed':
        return records.filter(r => r.status === 'DELIVERED');
      default:
        return [];
    }
  };

  const filteredRecords = getFilteredRecords();

  return (
    <div className="max-w-[1440px] mx-auto pb-12 font-sans relative">
      <PageHeader title="Delivery Manager" />
      
      {/* Page Header */}
      <div className="mb-6">
        <p className="text-body-lg text-on-surface-variant font-medium">Pack and dispatch prasad parcels to devotees</p>
      </div>

      {/* Summary Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-semibold">
        {/* Action Required (Prominent) */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-2 border-error/50 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute inset-0 bg-error/5 animate-pulse rounded-xl"></div>
          <div className="relative z-10 flex items-center justify-between mb-2">
            <h3 className="text-label-md text-error font-bold uppercase tracking-wider text-[10px]">Action Required</h3>
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
          </div>
          <p className="relative z-10 font-display text-headline-lg text-error font-bold leading-none">{actionRequiredCount}</p>
        </div>
        
        {/* Ready to Dispatch */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-[#F0E6D2] flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Ready to Dispatch</h3>
            <span className="material-symbols-outlined text-secondary-fixed-dim text-[20px]">local_shipping</span>
          </div>
          <p className="font-display text-headline-lg text-on-surface font-bold leading-none">{actionRequiredCount}</p>
        </div>

        {/* In Transit */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-[#F0E6D2] flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">In Transit</h3>
            <span className="material-symbols-outlined text-primary text-[20px]">route</span>
          </div>
          <p className="font-display text-headline-lg text-on-surface font-bold leading-none">{inTransitCount}</p>
        </div>

        {/* Delivered */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-[#F0E6D2] flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Delivered</h3>
            <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
          </div>
          <p className="font-display text-headline-lg text-on-surface font-bold leading-none">{completedCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-outline-variant/30 pt-4 mb-6 font-display">
        <button 
          onClick={() => setActiveTab('action')}
          className={`pb-3 border-b-2 font-bold text-headline-sm cursor-pointer transition-colors ${
            activeTab === 'action' ? 'border-error text-error' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Action Required ({actionRequiredCount})
        </button>
        <button 
          onClick={() => setActiveTab('transit')}
          className={`pb-3 border-b-2 font-bold text-headline-sm cursor-pointer transition-colors ${
            activeTab === 'transit' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          In Transit ({inTransitCount})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-3 border-b-2 font-bold text-headline-sm cursor-pointer transition-colors ${
            activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Delivery Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#F0E6D2] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low text-on-surface-variant uppercase text-label-md font-bold tracking-wider">
                <th className="py-3.5 px-6">Booking ID</th>
                <th className="py-3.5 px-6">Devotee Name</th>
                <th className="py-3.5 px-6">Pooja Name</th>
                <th className="py-3.5 px-6">Destination</th>
                <th className="py-3.5 px-6">Parcel Status</th>
                <th className="py-3.5 px-6 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-sans text-body-sm text-on-surface divide-y divide-outline-variant/20 font-medium">
              {filteredRecords.map(rec => {
                const rowClass = 'hover:bg-surface-container-low/40';
                
                return (
                  <tr key={rec.id} className={`transition-colors ${rowClass}`}>
                    <td className="py-4 px-6 font-bold">{rec.bookingId}</td>
                    <td className="py-4 px-6 font-bold">{rec.devoteeName}</td>
                    <td className="py-4 px-6">{rec.poojaName}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{rec.destination}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        rec.status === 'PACKED' 
                          ? 'bg-yellow-50 text-yellow-800 border-yellow-200' 
                          : rec.status === 'SHIPPED' 
                            ? 'bg-blue-50 text-blue-800 border-blue-200' 
                            : rec.status === 'DELIVERED' 
                              ? 'bg-green-50 text-green-800 border-green-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleViewDetails(rec.id)}
                        className="font-button text-button text-primary hover:text-[#b04b00] border border-primary/30 hover:border-primary rounded-full px-4 py-1.5 transition-colors cursor-pointer font-bold"
                      >
                        View &amp; Update
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface-variant text-body-md font-semibold">
                    No parcels in this status category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
