import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { db } from '../lib/db';

interface AddEditSlotProps {
  isEdit: boolean;
}

export function AddEditSlot({ isEdit }: AddEditSlotProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const existingSlot = (isEdit && id) ? db.getSlots().find(s => s.id === id) : null;
  const bookingsCount = existingSlot ? existingSlot.bookings : 0;
  const initialPooja = existingSlot ? (existingSlot.name === 'Satyanarayana Pooja' ? 'satyanarayana' : existingSlot.name === 'Rudra Abhishekam' ? 'rudrabhishekam' : 'archana') : '';
  const initialTime = existingSlot ? existingSlot.time : '';

  const [pooja, setPooja] = useState(initialPooja);
  const [date, setDate] = useState(existingSlot?.date || '');
  const [selectedTime, setSelectedTime] = useState<string>(initialTime);
  const [maxBookings, setMaxBookings] = useState<number | ''>(existingSlot?.maxBookings || 15);
  const [status, setStatus] = useState(existingSlot ? existingSlot.status : true);
  const [showToast, setShowToast] = useState(false);
  const [dateError, setDateError] = useState(false);

  const TIME_SLOTS = [
    '06:00 AM',
    '07:00 AM',
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
    '08:00 PM'
  ];

  const handlePoojaChange = (val: string) => {
    setPooja(val);
  };

  const handleDateChange = (val: string) => {
    setDate(val);
    const selectedDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setDateError(true);
    } else {
      setDateError(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pooja || !date || dateError || !selectedTime) return;

    const slotName = pooja === 'satyanarayana' ? 'Satyanarayana Pooja' : pooja === 'rudrabhishekam' ? 'Rudra Abhishekam' : 'Special Seva';
    const slotId = isEdit && id ? id : Date.now().toString();

    const newSlot = {
      id: slotId,
      name: slotName,
      date: date,
      time: selectedTime,
      bookings: bookingsCount,
      maxBookings: maxBookings === '' ? 1 : maxBookings,
      availability: bookingsCount >= (maxBookings === '' ? 1 : maxBookings) ? 'Full' : 'Open' as 'Open' | 'Full',
      status: status
    };

    db.updateSlot(newSlot);

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate('/schedule');
    }, 2000);
  };

  const selectedPoojaName = pooja === 'satyanarayana' ? 'Satyanarayana Pooja' : pooja === 'rudrabhishekam' ? 'Rudra Abhishekam' : pooja === 'archana' ? 'Special Seva' : '';

  const occupiedTimes = db.getSlots()
    .filter(s => s.status && s.date === date && s.name === selectedPoojaName && (!isEdit || s.id !== id))
    .map(s => s.time);

  const canSave = pooja && date && !dateError && selectedTime !== '' && maxBookings !== '' && maxBookings > 0;

  return (
    <div className="max-w-[720px] mx-auto pb-12 font-sans relative">
      
      {/* Success Toast Notification */}
      {showToast && (
        <div className="fixed top-[120px] right-gutter z-50 flex items-center gap-3 bg-surface-container-lowest border border-[#4CAF50]/30 shadow-lg rounded-lg px-4 py-3 max-w-md animate-fade-in-down font-sans">
          <span className="material-symbols-outlined text-[#4CAF50] flex items-center justify-center">check_circle</span>
          <div>
            <p className="font-body-sm text-body-sm text-on-surface font-semibold">
              Slot {isEdit ? 'updated' : 'created'} successfully!
            </p>
            <p className="font-label-md text-label-md text-on-surface-variant">
              {pooja === 'satyanarayana' ? 'Satyanarayana Pooja' : pooja === 'rudrabhishekam' ? 'Rudrabhishekam' : 'Special Seva'} — {date} at {selectedTime}
            </p>
          </div>
          <button 
            className="ml-auto text-on-surface-variant hover:text-on-surface cursor-pointer"
            onClick={() => setShowToast(false)}
          >
            <span className="material-symbols-outlined text-sm flex items-center justify-center">close</span>
          </button>
        </div>
      )}

      {/* Breadcrumbs & Header */}
      <div className="max-w-[700px] mx-auto mb-6">
        <nav className="flex items-center gap-2 text-on-surface-variant mb-4 font-sans text-body-sm font-semibold">
          <Link to="/schedule" className="hover:text-primary transition-colors">
            Pooja Schedule
          </Link>
          <span className="material-symbols-outlined text-[16px] flex items-center justify-center">chevron_right</span>
          <span className="text-on-surface font-medium">
            {isEdit ? 'Edit Slot' : 'Add New Slot'}
          </span>
        </nav>
        
        <div>
          <h2 className="font-display text-headline-lg text-on-surface font-semibold mb-1">
            {isEdit ? 'Edit Slot' : 'Add New Slot'}
          </h2>
          <p className="font-sans text-body-md text-on-surface-variant">
            {isEdit ? 'Modify slot scheduling or maximum devotee bookings' : 'Create a new available date and time slot for a pooja'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSave} className="max-w-[700px] mx-auto bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] overflow-hidden">
        
        {isEdit && (
          <div className="bg-tertiary-fixed border-b border-tertiary-fixed-dim px-6 py-3 flex items-center gap-2 text-tertiary-fixed-dim bg-[#d0e4ff] text-[#003357] font-sans">
            <span className="material-symbols-outlined text-sm flex items-center justify-center">info</span>
            <span className="text-xs font-semibold">This slot has {bookingsCount} confirmed bookings</span>
          </div>
        )}

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Field 1: Select Pooja */}
          <div className="space-y-1 font-sans">
            <label className="text-label-md text-on-surface block font-semibold">
              Select Pooja <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select 
                className="w-full bg-surface border border-[#D4A017]/30 rounded-lg px-4 py-3 text-body-sm text-on-surface appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors pr-10 font-semibold cursor-pointer"
                value={pooja}
                onChange={(e) => handlePoojaChange(e.target.value)}
                required
              >
                <option value="" disabled>Choose a pooja from your temple</option>
                <option value="satyanarayana">Satyanarayana Pooja</option>
                <option value="rudrabhishekam">Rudra Abhishekam</option>
                <option value="archana">Special Archana</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none flex items-center justify-center">
                expand_more
              </span>
            </div>
            <p className="text-[12px] text-on-surface-variant">Only poojas from Sri Venkateswara Temple are shown</p>
          </div>

          {/* Field 2: Slot Date */}
          <div className="space-y-1 font-sans">
            <label className="text-label-md text-on-surface block font-semibold">
              Slot Date <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none flex items-center justify-center">
                calendar_month
              </span>
              <input 
                className={`w-full bg-surface border rounded-lg pl-11 pr-4 py-3 text-body-sm text-on-surface focus:outline-none focus:ring-1 transition-colors ${
                  dateError 
                    ? 'border-error text-error focus:ring-error' 
                    : 'border-[#D4A017]/30 focus:border-primary focus:ring-primary'
                }`}
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between items-start">
              {dateError ? (
                <p className="text-[12px] text-error font-semibold">Please select a future date</p>
              ) : (
                <p className="text-[12px] text-on-surface-variant">Cannot be a past date</p>
              )}
            </div>
          </div>

          {/* Field 3: Time Slot Grid */}
          <div className="space-y-2 font-sans">
            <label className="text-label-md text-on-surface block font-semibold">
              Select Time Slot <span className="text-error">*</span>
            </label>
            
            {!date ? (
              <div className="p-4 border border-dashed border-outline-variant rounded-lg text-center text-on-surface-variant text-body-sm font-medium bg-surface-container-low">
                Please select a slot date first to view available time slots.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {TIME_SLOTS.map((t) => {
                  const isOccupied = occupiedTimes.includes(t);
                  const isSelected = selectedTime === t;
                  
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                        isOccupied
                          ? 'bg-[#f4f4f4] border-outline-variant/30 text-on-surface-variant/40 cursor-not-allowed flex flex-col items-center justify-center gap-0.5'
                          : isSelected
                            ? 'bg-primary border-primary text-on-primary shadow-sm scale-[0.98]'
                            : 'bg-surface border-outline hover:border-primary hover:text-primary cursor-pointer'
                      }`}
                    >
                      <span>{t}</span>
                      {isOccupied && (
                        <span className="text-[9px] uppercase tracking-wider text-red-500 font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px]">lock</span> Blocked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Field 4: Maximum Bookings */}
          <div className="space-y-1 font-sans">
            <label className="text-label-md text-on-surface block font-semibold">
              Maximum Bookings <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <input 
                className="w-full bg-surface border border-[#D4A017]/30 border-r-0 rounded-l-lg px-4 py-3 text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none font-semibold"
                type="number"
                min="1"
                value={maxBookings}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setMaxBookings('');
                  } else {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed)) {
                      setMaxBookings(parsed);
                    }
                  }
                }}
                required
              />
              <div className="flex flex-col border border-[#D4A017]/30 border-l-0 rounded-r-lg bg-surface-container-low w-10">
                <button 
                  type="button"
                  onClick={() => setMaxBookings(prev => (prev === '' ? 1 : prev + 1))}
                  className="h-6 border-b border-[#D4A017]/30 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest rounded-tr-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] flex items-center justify-center">expand_less</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setMaxBookings(prev => Math.max(1, (prev === '' ? 1 : prev - 1)))}
                  className="h-6 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest rounded-br-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] flex items-center justify-center">expand_more</span>
                </button>
              </div>
            </div>
            <p className="text-[12px] text-on-surface-variant">Maximum number of devotees allowed for this slot</p>
          </div>

          <hr className="border-t border-outline-variant/50 my-2"/>

          {/* Field 5: Slot Status */}
          <div className="flex items-start justify-between font-sans">
            <div>
              <label className="text-[16px] text-on-surface block mb-1 font-bold">Slot Status</label>
              <p className="text-[12px] text-on-surface-variant">Inactive slots will not accept new bookings</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-label-md text-on-surface-variant uppercase font-semibold">
                {status ? 'Active' : 'Inactive'}
              </span>
              {/* Toggle Switch */}
              <button 
                type="button"
                onClick={() => setStatus(!status)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                  status ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  status ? 'translate-x-6' : 'translate-x-1'
                }`}></span>
              </button>
            </div>
          </div>

        </div>

        {/* Card Footer / Actions */}
        <div className="bg-surface-container-low border-t border-outline-variant/50 p-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 font-sans">
          <Link 
            to="/schedule"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full font-sans text-button text-on-surface bg-transparent hover:bg-surface-variant transition-colors border border-outline text-center font-bold"
          >
            Cancel
          </Link>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            {isEdit && (
              <button 
                type="button"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full font-sans text-button text-primary border-2 border-primary hover:bg-primary/5 transition-colors text-center font-bold cursor-pointer"
              >
                Duplicate This Slot
              </button>
            )}
            <button 
              type="submit"
              disabled={!canSave}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-sans text-button text-on-primary bg-primary hover:bg-primary/90 shadow-sm transition-colors text-center font-bold ${
                canSave ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Save Slot
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
