import { useState } from 'react';
import { Link } from 'react-router';
import { db, type PoojaSlot } from '../lib/db';

export function Schedule() {
  const [selectedPooja, setSelectedPooja] = useState('All Poojas');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isPastExpanded, setIsPastExpanded] = useState(false);
  const [deactivatingSlot, setDeactivatingSlot] = useState<PoojaSlot | null>(null);

  const [slots, setSlots] = useState<PoojaSlot[]>(() => db.getSlots());

  const pastSlotsCount = 4;

  const handleToggleStatus = (id: string) => {
    setSlots(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = !s.status;
        const updated: PoojaSlot = { 
          ...s, 
          status: nextStatus,
          // If reactivated, set availability
          availability: s.bookings >= s.maxBookings ? 'Full' : 'Open'
        };
        db.updateSlot(updated);
        return updated;
      }
      return s;
    }));
  };


  const handleOpenDeactivateModal = (slot: PoojaSlot) => {
    setDeactivatingSlot(slot);
  };

  const confirmDeactivate = () => {
    if (deactivatingSlot) {
      setSlots(prev => prev.map(s => {
        if (s.id === deactivatingSlot.id) {
          const updated = { ...s, status: false };
          db.updateSlot(updated);
          return updated;
        }
        return s;
      }));
      setDeactivatingSlot(null);
    }
  };

  // Filter slots
  const filteredSlots = slots.filter(slot => {
    const poojaMatch = selectedPooja === 'All Poojas' || slot.name === selectedPooja;
    const statusMatch = selectedStatus === 'All Status' || 
      (selectedStatus === 'Active' && slot.status) || 
      (selectedStatus === 'Inactive' && !slot.status);
    
    let dateMatch = true;
    if (fromDate) {
      dateMatch = dateMatch && slot.date >= fromDate;
    }
    if (toDate) {
      dateMatch = dateMatch && slot.date <= toDate;
    }

    return poojaMatch && statusMatch && dateMatch;
  });

  const totalSlotsCount = filteredSlots.length + pastSlotsCount;
  const activeSlotsCount = filteredSlots.filter(s => s.status).length;
  const fullyBookedCount = filteredSlots.filter(s => s.bookings >= s.maxBookings).length;

  const formatDateString = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="font-display text-headline-lg text-on-surface font-semibold">Pooja Schedule</h2>
          <p className="font-sans text-on-surface-variant mt-1">Manage available dates and time slots for your temple's poojas</p>
        </div>
        <Link 
          to="/schedule/add"
          className="bg-primary text-on-primary font-sans text-button px-6 py-3 rounded-full hover:bg-primary/90 transition-colors flex items-center gap-2 font-bold cursor-pointer"
        >
          <span className="material-symbols-outlined flex items-center justify-center">add</span>
          Add New Slot
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest soft-shadow rounded-xl p-6 mb-8 border border-outline-variant/30 flex flex-wrap items-end gap-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block font-sans text-label-md text-on-surface-variant mb-2 font-semibold">Pooja Type</label>
          <select 
            className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            value={selectedPooja}
            onChange={(e) => setSelectedPooja(e.target.value)}
          >
            <option>All Poojas</option>
            <option>Satyanarayana Pooja</option>
            <option>Ganapathi Homam</option>
            <option>Lakshmi Pooja</option>
            <option>Navagraha Pooja</option>
          </select>
        </div>
        <div className="flex gap-4 flex-1 min-w-[300px]">
          <div className="flex-1">
            <label className="block font-sans text-label-md text-on-surface-variant mb-2 font-semibold">From Date</label>
            <div className="relative">
              <input 
                className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block font-sans text-label-md text-on-surface-variant mb-2 font-semibold">To Date</label>
            <div className="relative">
              <input 
                className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block font-sans text-label-md text-on-surface-variant mb-2 font-semibold">Status</label>
          <select 
            className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="flex gap-3 h-[42px]">
          <button 
            className="border-2 border-primary text-primary font-sans text-button px-6 rounded-full hover:bg-primary/5 transition-colors font-bold cursor-pointer"
            onClick={() => {}}
          >
            Apply Filters
          </button>
          <button 
            className="text-on-surface-variant font-sans text-button px-4 hover:text-on-surface transition-colors cursor-pointer font-semibold"
            onClick={() => {
              setSelectedPooja('All Poojas');
              setSelectedStatus('All Status');
              setFromDate('');
              setToDate('');
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex gap-4 mb-6">
        <div className="bg-surface-container px-4 py-2 rounded-full border border-outline-variant/50 text-on-surface-variant font-sans text-label-md flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-on-surface-variant"></span> 
          Total Slots: {totalSlotsCount}
        </div>
        <div className="bg-[#e8f5e9] px-4 py-2 rounded-full border border-[#c8e6c9] text-[#2e7d32] font-sans text-label-md flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#4caf50]"></span> 
          Active Slots: {activeSlotsCount}
        </div>
        <div className="bg-error-container px-4 py-2 rounded-full border border-error/20 text-error font-sans text-label-md flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-error"></span> 
          Fully Booked: {fullyBookedCount}
        </div>
      </div>

      {/* Slots Table Card */}
      <div className="bg-surface-container-lowest soft-shadow rounded-xl border border-[#F0E6D2] overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30 font-sans text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                <th className="p-4">Pooja Name</th>
                <th className="p-4">Date</th>
                <th className="p-4">Time</th>
                <th className="p-4">Bookings</th>
                <th className="p-4">Availability</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-sans text-body-sm">
              {filteredSlots.map(slot => {
                const percent = (slot.bookings / slot.maxBookings) * 100;
                return (
                  <tr 
                    key={slot.id} 
                    className={`hover:bg-surface-container-lowest transition-colors group ${
                      !slot.status ? 'bg-surface-container/30 opacity-65 grayscale' : slot.bookings >= slot.maxBookings ? 'bg-error-container/5' : 'bg-white'
                    }`}
                  >
                    <td className="p-4 font-semibold text-on-surface">
                      {slot.name}
                    </td>
                    <td className="p-4 text-on-surface-variant">{formatDateString(slot.date)}</td>
                    <td className="p-4 text-on-surface-variant">{slot.time}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${slot.bookings >= slot.maxBookings ? 'text-error' : 'text-on-surface'}`}>
                          {slot.bookings}
                        </span>
                        <span className="text-on-surface-variant">/ {slot.maxBookings}</span>
                        <span className="text-xs text-on-surface-variant block mt-0.5">({slot.maxBookings - slot.bookings} remaining)</span>
                        <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${slot.bookings >= slot.maxBookings ? 'bg-error' : 'bg-[#4caf50]'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        !slot.status 
                          ? 'bg-outline-variant/30 text-on-surface-variant'
                          : slot.bookings >= slot.maxBookings 
                          ? 'bg-error-container text-error' 
                          : 'bg-[#e8f5e9] text-[#2e7d32]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          !slot.status
                            ? 'bg-on-surface-variant'
                            : slot.bookings >= slot.maxBookings 
                            ? 'bg-error' 
                            : 'bg-[#4caf50]'
                        }`} />
                        {!slot.status ? 'Deactivated' : slot.bookings >= slot.maxBookings ? 'Full' : 'Open'}
                      </span>
                    </td>
                    <td className="p-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={slot.status}
                          onChange={() => handleToggleStatus(slot.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4caf50]"></div>
                      </label>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/schedule/edit/${slot.id}`}
                          className="border border-primary text-primary px-3 py-1.5 rounded-full text-xs font-bold hover:bg-primary/5 transition-colors cursor-pointer"
                        >
                          Edit
                        </Link>
                        {slot.status ? (
                          <button 
                            onClick={() => handleOpenDeactivateModal(slot)}
                            className="border border-error text-error px-3 py-1.5 rounded-full text-xs font-bold hover:bg-error/5 transition-colors cursor-pointer"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleStatus(slot.id)}
                            className="border border-[#4caf50] text-[#2e7d32] px-3 py-1.5 rounded-full text-xs font-bold hover:bg-[#4caf50]/10 transition-colors cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-outline-variant/30 p-4 flex items-center justify-between bg-surface-container-low font-sans">
          <p className="text-on-surface-variant text-sm">Showing <span className="font-semibold text-on-surface">1–6</span> of <span className="font-semibold text-on-surface">18</span> slots</p>
          <div className="flex items-center gap-2">
            <button className="text-on-surface-variant hover:text-primary px-3 py-1 rounded transition-colors disabled:opacity-50" disabled={true}>Previous</button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-on-primary font-semibold text-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container font-semibold text-sm transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container font-semibold text-sm transition-colors">3</button>
            </div>
            <button className="text-primary hover:text-primary/80 font-semibold px-3 py-1 rounded transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Past Slots Accordion */}
      <div className="bg-surface-container-lowest soft-shadow rounded-xl border border-outline-variant/30 overflow-hidden font-sans">
        <button 
          onClick={() => setIsPastExpanded(!isPastExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer outline-none"
        >
          <div className="flex items-center gap-2 font-display text-headline-sm font-bold">
            <span className={`material-symbols-outlined text-lg transition-transform ${isPastExpanded ? 'rotate-90' : ''}`}>
              play_arrow
            </span>
            Past Slots ({pastSlotsCount}) — Read Only
          </div>
        </button>

        {isPastExpanded && (
          <div className="p-6 bg-white border-t border-outline-variant/30">
            <p className="text-on-surface-variant text-sm italic">Past completed pooja slots are archived here and kept in read-only status.</p>
          </div>
        )}
      </div>

      {/* Deactivate Slot Modal Overlay */}
      {deactivatingSlot && (
        <div className="fixed inset-0 bg-on-surface/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl soft-shadow p-6 max-w-md w-full border border-outline-variant/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-error"></div>
            <h3 className="font-display text-headline-md text-on-surface mb-2 mt-2 font-bold">Deactivate Slot?</h3>
            <p className="font-sans text-on-surface-variant mb-6 text-sm leading-relaxed">
              Are you sure you want to deactivate <span className="font-semibold text-on-surface">{deactivatingSlot.name}</span> on <span className="font-semibold text-on-surface">{formatDateString(deactivatingSlot.date)}</span> at <span className="font-semibold text-on-surface">{deactivatingSlot.time}</span>? No new bookings will be accepted.
            </p>
            <div className="flex justify-end gap-3 font-sans">
              <button 
                onClick={() => setDeactivatingSlot(null)}
                className="px-5 py-2 rounded-full font-button text-button text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeactivate}
                className="px-5 py-2 rounded-full font-button text-button bg-error text-on-error hover:bg-error/90 transition-colors cursor-pointer font-semibold"
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
