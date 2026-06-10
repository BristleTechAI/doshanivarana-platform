import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Slot, Pooja } from '@devaseva/core';
import { SlotStatus } from '@devaseva/core';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';

type UISlot = Slot & {
  poojaName: string;
};


export function Schedule() {
  const { templeId } = useAuth();
  const [selectedPooja, setSelectedPooja] = useState('All Poojas');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPastExpanded, setIsPastExpanded] = useState(false);
  const [deactivatingSlot, setDeactivatingSlot] = useState<UISlot | null>(null);

  const CACHE_KEY = `schedule_cache_${templeId}`;
  const POOJA_CACHE_KEY = `pooja_cache_${templeId}`;

  // Load from localStorage cache immediately (sync - no delay)
  const [slots, setSlots] = useState<UISlot[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [poojas, setPoojas] = useState<Record<string, Pooja>>(() => {
    try {
      const cached = localStorage.getItem(POOJA_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch { return {}; }
  });
  // Only show loading skeleton if there is NO cached data at all
  const [loading, setLoading] = useState<boolean>(() => {
    return !localStorage.getItem(CACHE_KEY);
  });

  const fetchScheduleData = async (background = false) => {
    if (!templeId) {
      setLoading(false);
      return;
    }
    if (!background) setLoading(true);
    try {
      // Fetch Poojas and Slots in parallel for speed
      const [pSnap, sSnap] = await Promise.all([
        getDocs(query(collection(db, "poojas"), where("templeId", "==", templeId), where("isDeleted", "==", false))),
        getDocs(query(collection(db, "slots"), where("templeId", "==", templeId), where("isDeleted", "==", false))),
      ]);

      const pMap: Record<string, Pooja> = {};
      pSnap.docs.forEach(d => {
        pMap[d.id] = { id: d.id, ...d.data() } as Pooja;
      });
      setPoojas(pMap);
      localStorage.setItem(POOJA_CACHE_KEY, JSON.stringify(pMap));

      const sData: UISlot[] = sSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          poojaName: pMap[data.poojaId]?.name || data.poojaId || 'Unknown Pooja',
        } as UISlot;
      });
      
      // Sort slots by date and time
      sData.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
      
      setSlots(sData);
      localStorage.setItem(CACHE_KEY, JSON.stringify(sData));
    } catch (error) {
      console.error("Failed to fetch schedule data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasCached = !!localStorage.getItem(CACHE_KEY);
    if (hasCached) {
      // Show cached data immediately, refresh in background
      fetchScheduleData(true);
    } else {
      fetchScheduleData(false);
    }
  }, [templeId]);

  const todayStr = new Date().toISOString().split('T')[0];
  const pastSlots = slots.filter(s => s.date < todayStr);
  const pastSlotsCount = pastSlots.length;

  const handleToggleStatus = async (slot: UISlot) => {
    try {
      const nextStatus = slot.status === SlotStatus.AVAILABLE ? SlotStatus.CANCELLED : SlotStatus.AVAILABLE;
      
      await updateDoc(doc(db, "slots", slot.id), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });
      
      setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, status: nextStatus } : s));
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleOpenDeactivateModal = (slot: UISlot) => {
    setDeactivatingSlot(slot);
  };

  const confirmDeactivate = async () => {
    if (deactivatingSlot) {
      try {
        await updateDoc(doc(db, "slots", deactivatingSlot.id), {
          status: SlotStatus.CANCELLED,
          updatedAt: serverTimestamp()
        });
        
        setSlots(prev => prev.map(s => s.id === deactivatingSlot.id ? { ...s, status: SlotStatus.CANCELLED } : s));
        setDeactivatingSlot(null);
      } catch (err) {
        console.error("Failed to deactivate slot", err);
      }
    }
  };

  // Filter slots
  const filteredSlots = slots.filter(slot => {
    const isPast = slot.date < todayStr;
    if (isPast) return false;

    const poojaMatch = selectedPooja === 'All Poojas' || slot.poojaId === selectedPooja;
    const statusMatch = selectedStatus === 'All Status' || 
      (selectedStatus === 'Active' && slot.status === SlotStatus.AVAILABLE) || 
      (selectedStatus === 'Inactive' && slot.status !== SlotStatus.AVAILABLE);
    
    let dateMatch = true;
    if (startDate) {
      dateMatch = dateMatch && slot.date >= startDate;
    }
    if (endDate) {
      dateMatch = dateMatch && slot.date <= endDate;
    }

    return poojaMatch && statusMatch && dateMatch;
  });

  const activeSlotsCount = filteredSlots.filter(s => s.status === SlotStatus.AVAILABLE).length;
  const fullyBookedCount = filteredSlots.filter(s => s.availableSeats <= 0).length;

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Pooja Schedule" />
        <div className="max-w-[1440px] mx-auto animate-pulse">
          {/* Header skeleton */}
          <div className="flex justify-between items-start mb-8 mt-4">
            <div className="h-4 bg-surface-container-highest rounded-full w-80 opacity-60"></div>
            <div className="h-10 bg-surface-container-highest rounded-full w-36 opacity-60"></div>
          </div>
          {/* Filter bar skeleton */}
          <div className="bg-surface-container-lowest rounded-xl p-6 mb-8 border border-outline-variant/30 flex flex-wrap gap-6">
            <div className="flex-1 min-w-[200px] h-10 bg-surface-container-highest rounded-lg opacity-60"></div>
            <div className="flex-1 min-w-[320px] h-10 bg-surface-container-highest rounded-lg opacity-60"></div>
            <div className="flex-1 min-w-[200px] h-10 bg-surface-container-highest rounded-lg opacity-60"></div>
            <div className="flex gap-3">
              <div className="w-24 h-10 bg-surface-container-highest rounded-lg opacity-60"></div>
              <div className="w-24 h-10 bg-surface-container-highest rounded-lg opacity-60"></div>
            </div>
          </div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1,2,3].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30">
                <div className="h-3 bg-surface-container-highest rounded w-24 mb-3 opacity-60"></div>
                <div className="h-7 bg-surface-container-highest rounded w-10 opacity-60"></div>
              </div>
            ))}
          </div>
          {/* Table skeleton */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            <div className="h-12 bg-surface-container-low border-b border-outline-variant/30 opacity-60"></div>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-outline-variant/20">
                <div className="h-4 bg-surface-container-highest rounded w-32 opacity-50"></div>
                <div className="h-4 bg-surface-container-highest rounded w-24 opacity-50"></div>
                <div className="h-4 bg-surface-container-highest rounded flex-1 opacity-50"></div>
                <div className="h-6 bg-surface-container-highest rounded-full w-20 opacity-50"></div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto">
      <PageHeader title="Pooja Schedule" />
      
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8 mt-4">
        <div>
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
            <option value="All Poojas">All Poojas</option>
            {Object.values(poojas).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[320px]">
          <label className="block font-sans text-label-md text-on-surface-variant mb-2 font-semibold">Date Range</label>
          <div className="flex items-center bg-surface border border-outline-variant/30 rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors px-2 h-[42px]">
            <input 
              className="w-full bg-transparent px-2 py-1 text-on-surface outline-none font-semibold text-sm" 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-on-surface-variant mx-1 font-semibold text-sm">to</span>
            <input 
              className="w-full bg-transparent px-2 py-1 text-on-surface outline-none font-semibold text-sm" 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="material-symbols-outlined text-on-surface-variant hover:text-on-surface ml-1 p-1 rounded-full hover:bg-surface-variant/20 text-[18px] cursor-pointer"
                title="Clear dates"
              >
                close
              </button>
            )}
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
            onClick={fetchScheduleData}
          >
            Refresh
          </button>
          <button 
            className="text-on-surface-variant font-sans text-button px-4 hover:text-on-surface transition-colors cursor-pointer font-semibold"
            onClick={() => {
              setSelectedPooja('All Poojas');
              setSelectedStatus('All Status');
              setStartDate('');
              setEndDate('');
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
          Total Upcoming Slots: {filteredSlots.length}
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
              {filteredSlots.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant">No upcoming slots found matching criteria.</td></tr>
              ) : filteredSlots.map(slot => {
                const percent = ((slot.capacity - slot.availableSeats) / slot.capacity) * 100;
                const isFull = slot.availableSeats <= 0;
                const isActive = slot.status === SlotStatus.AVAILABLE;
                
                return (
                  <tr 
                    key={slot.id} 
                    className={`hover:bg-surface-container-lowest transition-colors group ${
                      !isActive ? 'bg-surface-container/30 opacity-65 grayscale' : isFull ? 'bg-error-container/5' : 'bg-white'
                    }`}
                  >
                    <td className="p-4 font-semibold text-on-surface">
                      {slot.poojaName}
                    </td>
                    <td className="p-4 text-on-surface-variant">{formatDateString(slot.date)}</td>
                    <td className="p-4 text-on-surface-variant">{slot.startTime}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isFull ? 'text-error' : 'text-on-surface'}`}>
                          {(slot.capacity - slot.availableSeats)}
                        </span>
                        <span className="text-on-surface-variant">/ {slot.capacity}</span>
                        <span className="text-xs text-on-surface-variant block mt-0.5">({slot.availableSeats} remaining)</span>
                        <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${isFull ? 'bg-error' : 'bg-[#4caf50]'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        !isActive 
                          ? 'bg-outline-variant/30 text-on-surface-variant'
                          : isFull 
                          ? 'bg-error-container text-error' 
                          : 'bg-[#e8f5e9] text-[#2e7d32]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          !isActive
                            ? 'bg-on-surface-variant'
                            : isFull 
                            ? 'bg-error' 
                            : 'bg-[#4caf50]'
                        }`} />
                        {!isActive ? 'Deactivated' : isFull ? 'Full' : 'Open'}
                      </span>
                    </td>
                    <td className="p-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={isActive}
                          onChange={() => handleToggleStatus(slot)}
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
                        {isActive ? (
                          <button 
                            onClick={() => handleOpenDeactivateModal(slot)}
                            className="border border-error text-error px-3 py-1.5 rounded-full text-xs font-bold hover:bg-error/5 transition-colors cursor-pointer"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleStatus(slot)}
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
          <div className="p-6 bg-white border-t border-outline-variant/30 space-y-4">
            <p className="text-on-surface-variant text-sm italic">Past completed pooja slots are archived here and kept in read-only status.</p>
            {pastSlots.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic">No archived past slots.</p>
            ) : (
              <div className="overflow-x-auto border border-outline-variant/30 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/30 font-sans text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                      <th className="p-4">Pooja Name</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Time</th>
                      <th className="p-4">Bookings</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 font-sans text-body-sm">
                    {pastSlots.map(slot => (
                      <tr key={slot.id} className="bg-[#fcfcfc] opacity-75">
                        <td className="p-4 font-semibold text-on-surface">{slot.poojaName}</td>
                        <td className="p-4 text-on-surface-variant">{formatDateString(slot.date)}</td>
                        <td className="p-4 text-on-surface-variant">{slot.startTime}</td>
                        <td className="p-4 text-on-surface-variant">{(slot.capacity - slot.availableSeats)} / {slot.capacity}</td>
                        <td className="p-4 text-on-surface-variant">Archived</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
              Are you sure you want to deactivate <span className="font-semibold text-on-surface">{deactivatingSlot.poojaName}</span> on <span className="font-semibold text-on-surface">{formatDateString(deactivatingSlot.date)}</span> at <span className="font-semibold text-on-surface">{deactivatingSlot.startTime}</span>? No new bookings will be accepted.
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
