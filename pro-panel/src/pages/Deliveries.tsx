import { useState } from 'react';
import { useNavigate } from 'react-router';
import { db } from '../lib/db';

interface DeliveryRecord {
  bookingId: string;
  devoteeName: string;
  poojaName: string;
  destination: string;
  status: 'Booked' | 'Packed' | 'Dispatched' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  daysPending: number;
  isUrgent?: boolean;
}

export function Deliveries() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'action' | 'ready' | 'transit' | 'completed'>('action');
  
  const [records] = useState<DeliveryRecord[]>(() => {
    const bookings = db.getBookings();
    const deliveryBookings = bookings.filter(b => b.delivery === 'Yes');
    return deliveryBookings.map(b => {
      const address = b.deliveryAddress;
      let destination = address;
      if (address.includes(',')) {
        const parts = address.split(',');
        const stateAndPin = parts[parts.length - 1].trim();
        const city = parts[parts.length - 2].trim();
        const state = stateAndPin.replace(/\s+\d{6}$/, '').replace(/\d{6}$/, '').trim();
        destination = `${city}, ${state}`;
      }

      return {
        bookingId: b.id,
        devoteeName: b.devoteeName,
        poojaName: b.poojaName,
        destination,
        status: (b.deliveryStatus === 'Not Applicable' ? 'Booked' : b.deliveryStatus) as DeliveryRecord['status'],
        daysPending: b.deliveryDaysPending || 0,
        isUrgent: b.deliveryIsUrgent || false
      };
    });
  });

  const handleViewDetails = (bookingId: string) => {
    navigate(`/deliveries/${bookingId}`);
  };

  // Stats calculation
  const actionRequiredCount = records.filter(r => r.status === 'Booked').length;
  const readyToDispatchCount = records.filter(r => r.status === 'Packed').length;
  const inTransitCount = records.filter(r => r.status === 'Dispatched' || r.status === 'In Transit' || r.status === 'Out for Delivery').length;
  const completedCount = records.filter(r => r.status === 'Delivered').length;

  const getFilteredRecords = () => {
    switch (activeTab) {
      case 'action':
        return records.filter(r => r.status === 'Booked');
      case 'ready':
        return records.filter(r => r.status === 'Packed');
      case 'transit':
        return records.filter(r => r.status === 'Dispatched' || r.status === 'In Transit' || r.status === 'Out for Delivery');
      case 'completed':
        return records.filter(r => r.status === 'Delivered');
      default:
        return [];
    }
  };

  const filteredRecords = getFilteredRecords();

  return (
    <div className="max-w-[1440px] mx-auto pb-12 font-sans relative">
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-display text-headline-lg text-on-surface font-semibold">Delivery Manager</h1>
        <p className="text-body-lg text-on-surface-variant font-medium">Pack and dispatch prasad parcels to devotees</p>
      </div>

      {/* Urgent Alert Banner */}
      {actionRequiredCount > 0 && (
        <div className="bg-error-container text-on-error-container p-4 rounded-lg flex items-center gap-3 border border-error/20 shadow-sm mb-8 font-medium">
          <span className="text-error text-xl shrink-0">🔴</span>
          <p className="text-body-md">
            {actionRequiredCount} parcels have been booked and require packing or dispatch today to avoid delay.
          </p>
        </div>
      )}

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
          <p className="font-display text-headline-lg text-on-surface font-bold leading-none">{readyToDispatchCount}</p>
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
          onClick={() => setActiveTab('ready')}
          className={`pb-3 border-b-2 font-bold text-headline-sm cursor-pointer transition-colors ${
            activeTab === 'ready' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Ready to Dispatch ({readyToDispatchCount})
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
                <th className="py-3.5 px-6">Days Pending</th>
                <th className="py-3.5 px-6 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-sans text-body-sm text-on-surface divide-y divide-outline-variant/20 font-medium">
              {filteredRecords.map(rec => {
                const rowClass = rec.isUrgent ? 'bg-red-50 hover:bg-red-100/60 text-red-900 border-l-4 border-l-error' : 'hover:bg-surface-container-low/40';
                
                return (
                  <tr key={rec.bookingId} className={`transition-colors ${rowClass}`}>
                    <td className="py-4 px-6 font-bold">{rec.bookingId}</td>
                    <td className="py-4 px-6 font-bold">{rec.devoteeName}</td>
                    <td className="py-4 px-6">{rec.poojaName}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{rec.destination}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        rec.status === 'Booked' 
                          ? 'bg-yellow-50 text-yellow-800 border-yellow-200' 
                          : rec.status === 'Packed' 
                            ? 'bg-blue-50 text-blue-800 border-blue-200' 
                            : rec.status === 'Delivered' 
                              ? 'bg-green-50 text-green-800 border-green-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      {rec.daysPending === 0 ? 'Today' : `${rec.daysPending} ${rec.daysPending === 1 ? 'day' : 'days'}`}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {rec.isUrgent ? (
                        <button 
                          onClick={() => handleViewDetails(rec.bookingId)}
                          className="font-button text-button bg-primary text-on-primary rounded-full px-4 py-1.5 transition-colors shadow-sm hover:bg-[#b04b00] cursor-pointer font-bold"
                        >
                          View &amp; Update
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleViewDetails(rec.bookingId)}
                          className="font-button text-button text-primary hover:text-[#b04b00] border border-primary/30 hover:border-primary rounded-full px-4 py-1.5 transition-colors cursor-pointer font-bold"
                        >
                          View &amp; Update
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant text-body-md font-semibold">
                    No parcels in this status category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Flow pipeline visual */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-[#F0E6D2] mt-6 overflow-x-auto">
        <h4 className="text-label-md text-on-surface-variant uppercase mb-6 tracking-wider font-bold">Delivery Flow</h4>
        <div className="flex items-center justify-between min-w-[700px] relative px-4">
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-outline-variant/30 z-0 rounded-full"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-2 group font-semibold">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm font-bold">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <span className="text-label-md text-primary font-bold">Booked</span>
          </div>

          <div className="absolute left-8 w-[20%] top-1/2 -translate-y-1/2 h-1 bg-primary z-0 rounded-full"></div>

          <div className="relative z-10 flex flex-col items-center gap-2 group font-semibold">
            <div className="w-8 h-8 rounded-full bg-surface-container-lowest border-2 border-primary flex items-center justify-center text-primary shadow-sm relative font-bold">
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></span>
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            </div>
            <span className="text-label-md text-on-surface font-bold">Packed</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-2 opacity-50 font-semibold">
            <div className="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            </div>
            <span className="text-label-md text-on-surface-variant">Dispatched</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-2 opacity-50 font-semibold">
            <div className="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">route</span>
            </div>
            <span className="text-label-md text-on-surface-variant">In Transit</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-2 opacity-50 font-semibold">
            <div className="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">map</span>
            </div>
            <span className="text-label-md text-on-surface-variant">Out for Delivery</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-2 opacity-50 font-semibold">
            <div className="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">home</span>
            </div>
            <span className="text-label-md text-on-surface-variant">Delivered</span>
          </div>
        </div>
      </div>

    </div>
  );
}
