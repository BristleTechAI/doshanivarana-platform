import { useState } from 'react';
import { useNavigate } from 'react-router';
import { db, type Booking } from '../lib/db';

export function Bookings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [poojaType, setPoojaType] = useState('All Poojas');
  const [pujariFilter, setPujariFilter] = useState('All');
  const [deliveryFilter, setDeliveryFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const [bookings] = useState<Booking[]>(() => db.getBookings());


  const handleViewDetails = (id: string) => {
    navigate(`/bookings/${id}`);
  };

  // Filters
  const filteredBookings = bookings.filter(b => {
    const tabMatch = activeTab === 'all' || b.tab === activeTab;
    const poojaMatch = poojaType === 'All Poojas' || b.poojaName === poojaType;
    const pujariMatch = pujariFilter === 'All' || 
      (pujariFilter === 'Yes' && b.pujari !== 'Not Assigned') || 
      (pujariFilter === 'No' && b.pujari === 'Not Assigned');
    const deliveryMatch = deliveryFilter === 'All' || b.delivery === deliveryFilter;
    const paymentMatch = paymentFilter === 'All' || b.paymentStatus === paymentFilter;

    return tabMatch && poojaMatch && pujariMatch && deliveryMatch && paymentMatch;
  });

  const unassignedCount = bookings.filter(b => b.tab === 'upcoming' && b.pujari === 'Not Assigned').length;

  return (
    <div className="max-w-[1440px] mx-auto relative">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-headline-lg text-on-surface font-semibold mb-2">Bookings Manager</h1>
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
          Upcoming ({bookings.filter(b => b.tab === 'upcoming').length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-3 border-b-2 text-headline-sm font-bold cursor-pointer transition-all duration-200 ${
            activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Completed ({bookings.filter(b => b.tab === 'completed').length})
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`pb-3 border-b-2 text-headline-sm font-bold cursor-pointer transition-all duration-200 ${
            activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          All ({bookings.length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest rounded-xl soft-shadow p-6 mb-8 border border-outline-variant/30 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md text-on-surface-variant font-semibold">Pooja Type</label>
            <select 
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-semibold"
              value={poojaType}
              onChange={(e) => setPoojaType(e.target.value)}
            >
              <option>All Poojas</option>
              <option>Satyanarayana Pooja</option>
              <option>Ganapathi Homam</option>
              <option>Lakshmi Pooja</option>
              <option>Navagraha Pooja</option>
              <option>Rudra Abhishekam</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md text-on-surface-variant font-semibold">Date Range</label>
            <input 
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-semibold" 
              placeholder="From - To" 
              type="text"
              readOnly
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md text-on-surface-variant font-semibold">Pujari Assigned</label>
            <select 
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-semibold"
              value={pujariFilter}
              onChange={(e) => setPujariFilter(e.target.value)}
            >
              <option>All</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md text-on-surface-variant font-semibold">Delivery</label>
            <select 
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-semibold"
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value as 'All' | 'Yes' | 'No')}
            >
              <option>All</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md text-on-surface-variant font-semibold">Payment Status</label>
            <select 
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-semibold"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option>All</option>
              <option>Confirmed</option>
              <option>Pending</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6 pt-6 border-t border-outline-variant/30 justify-end">
          <button 
            className="px-6 py-2 rounded-full font-button text-button text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer font-bold"
            onClick={() => {
              setPoojaType('All Poojas');
              setPujariFilter('All');
              setDeliveryFilter('All');
              setPaymentFilter('All');
            }}
          >
            Reset
          </button>
          <button className="px-6 py-2 rounded-full font-button text-button text-primary border-2 border-primary hover:bg-primary-container/20 transition-colors cursor-pointer font-bold">
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
              
              {filteredBookings.map(b => (
                <tr 
                  key={b.id} 
                  className={`border-b border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low transition-colors ${
                    b.tab === 'upcoming' && b.pujari === 'Not Assigned' ? 'border-l-4 border-l-error' : ''
                  }`}
                >
                  <td className="p-4 font-bold">{b.id}</td>
                  <td className="p-4 font-semibold">{b.devoteeName}</td>
                  <td className="p-4 font-semibold">{b.poojaName}</td>
                  <td className="p-4 text-on-surface-variant">{b.dateTime}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold tracking-wide">
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    {b.pujari === 'Not Assigned' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold tracking-wide gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span> 
                        Not Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
                        <span className="material-symbols-outlined text-[16px] flex items-center justify-center">check_circle</span> 
                        {b.pujari}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold ${
                      b.delivery === 'Yes' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {b.delivery}
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
