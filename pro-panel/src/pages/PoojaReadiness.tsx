import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { db, type ChecklistItem } from '../lib/db';

const getDaysToGo = (dateTimeStr: string) => {
  try {
    const parts = dateTimeStr.split(',');
    if (parts.length > 0) {
      const dateVal = new Date(parts[0]);
      if (!isNaN(dateVal.getTime())) {
        const diffTime = dateVal.getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        return `${diffDays} days to go`;
      }
    }
  } catch {
    // Return fallback value if date parsing fails
  }
  return 'Scheduled';
};

export function PoojaReadiness() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const bookingId = id || 'BK-1001';
  const booking = db.getBookingById(bookingId) || db.getBookings()[0];

  const [items, setItems] = useState<ChecklistItem[]>(() => db.getReadinessChecklist(bookingId));

  const saveItems = (updated: ChecklistItem[]) => {
    setItems(updated);
    db.saveReadinessChecklist(bookingId, updated);
  };

  const [customItemName, setCustomItemName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const toggleItem = (itemId: string) => {
    const updated = items.map(item => 
      item.id === itemId ? { ...item, ready: !item.ready } : item
    );
    saveItems(updated);
  };

  const handleMarkAllReady = () => {
    const updated = items.map(item => ({ ...item, ready: true }));
    saveItems(updated);
    setNotification('All items marked as Ready!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleResetAll = () => {
    const updated = items.map(item => ({ ...item, ready: false }));
    saveItems(updated);
    setNotification('Checklist reset.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      name: customItemName.trim(),
      ready: false
    };

    const updated = [newItem, ...items];
    saveItems(updated);
    setCustomItemName('');
    setShowAddModal(false);
    setNotification(`Added item: ${newItem.name}`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConfirmReady = () => {
    setNotification('Pooja readiness confirmed!');
    setTimeout(() => {
      navigate(`/stream-readiness/${bookingId}`);
    }, 1500);
  };

  const handleFlagNotReady = () => {
    setNotification('Pooja flagged as NOT ready.');
    setTimeout(() => setNotification(null), 3000);
  };

  const readyCount = items.filter(i => i.ready).length;
  const totalCount = items.length;
  const percentage = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;
  const isFullyReady = percentage === 100;

  return (
    <div className="max-w-[1440px] mx-auto pb-32 relative font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-[#a04100] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transition-all duration-300">
          <span className="material-symbols-outlined text-[20px]">info</span>
          {notification}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="font-display text-headline-lg text-on-surface font-semibold">Pooja Readiness Checklist</h1>
          <p className="text-body-md text-on-surface-variant font-medium">
            Verify pujari materials list submission and confirm all pooja items are ready for {id || 'BK-1001'}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border font-semibold ${
          isFullyReady 
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-[#FFF4E5] border-[#FFB347] text-[#A0522D]'
        }`}>
          <span className="material-symbols-outlined">
            {isFullyReady ? 'check_circle' : 'warning'}
          </span>
          <span className="font-button text-button uppercase tracking-wide">
            {isFullyReady ? 'Fully Ready' : 'Partially Ready'}
          </span>
        </div>
      </div>

      {/* Slot Selector Bar */}
      <div className="bg-surface-container-lowest rounded-xl border-l-8 border-primary p-6 soft-shadow mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <label className="text-label-md text-on-surface-variant uppercase block mb-1 font-bold tracking-wider">
            Current Active Slot
          </label>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-headline-sm text-on-surface font-bold">
              {booking?.poojaName} — {booking?.dateTime} (Pujari: {booking?.pujari})
            </h3>
          </div>
          <div className="flex flex-wrap gap-3 mt-3 font-semibold">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs flex items-center gap-1 border border-blue-100">
              <span className="material-symbols-outlined text-[16px]">calendar_month</span> {booking ? getDaysToGo(booking.dateTime) : ''}
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs flex items-center gap-1 border border-green-100">
              <span className="material-symbols-outlined text-[16px]">person</span> Pujari: {booking?.pujari}
            </span>
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs flex items-center gap-1 border border-[#f6be39]">
              <span className="material-symbols-outlined text-[16px]">confirmation_number</span> {booking?.currentBookings} Bookings Confirmed
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Pujari Materials Submission */}
          <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-[#F0E6D2]">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <h4 className="font-display text-headline-sm flex items-center gap-2 font-bold text-on-surface">
                <span className="material-symbols-outlined text-primary">description</span>
                Pujari Materials Submission
              </h4>
              <div className="flex items-center gap-2 font-bold">
                <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Status:</span>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  Yes, Submitted
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/30 gap-4">
              <div>
                <p className="text-body-sm text-on-surface-variant font-medium">Submission Timestamp</p>
                <p className="text-body-md font-bold text-on-surface">12 May 2026 at 4:30 PM</p>
              </div>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setNotification('Opening materials checklist PDF...'); }}
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-primary text-primary rounded-full hover:bg-primary/5 transition-colors font-button text-button font-bold"
              >
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                View PDF List
              </a>
            </div>
          </div>

          {/* Materials Readiness Checklist Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-[#F0E6D2]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div className="w-full md:w-1/2">
                <h4 className="font-display text-headline-sm flex items-center gap-2 mb-2 font-bold text-on-surface">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                  Materials Readiness Checklist
                </h4>
                <div className="w-full bg-surface-container-highest rounded-full h-3">
                  <div 
                    className="bg-[#FF6B00] h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-on-surface-variant mt-2 font-bold">
                  {percentage}% Complete ({readyCount} of {totalCount} items ready)
                </p>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 font-bold">
                <button 
                  onClick={handleMarkAllReady}
                  className="px-3 py-1.5 border border-outline text-on-surface-variant rounded-lg text-xs hover:bg-surface-container transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">done_all</span> Mark All Ready
                </button>
                <button 
                  onClick={handleResetAll}
                  className="px-3 py-1.5 border border-outline text-on-surface-variant rounded-lg text-xs hover:bg-surface-container transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span> Reset All
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs hover:bg-[#b04b00] transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span> Add Custom Item
                </button>
              </div>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {items.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                    item.ready 
                      ? 'bg-surface-container-lowest border-outline-variant/30 opacity-70' 
                      : 'bg-red-50 border-red-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer transition-colors ${
                        item.ready 
                          ? 'bg-green-600 border-green-600' 
                          : 'border-red-300 bg-white hover:border-red-500'
                      }`}
                    >
                      {item.ready && (
                        <span className="material-symbols-outlined text-white text-xs font-bold flex items-center justify-center">
                          check
                        </span>
                      )}
                    </button>
                    <span className={`text-body-md font-semibold text-on-surface ${item.ready ? 'line-through text-on-surface-variant' : ''}`}>
                      {item.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      item.ready 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {item.ready ? 'Ready' : 'Not Ready'}
                    </span>
                    {item.notes && (
                      <span 
                        className="material-symbols-outlined text-on-surface-variant text-sm cursor-help flex items-center justify-center" 
                        title={item.notes}
                      >
                        info
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right sidebar details */}
        <div className="flex flex-col gap-6">
          
          {/* Readiness Summary */}
          <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-[#F0E6D2]">
            <h4 className="font-display text-headline-sm flex items-center gap-2 mb-6 font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Readiness Summary
            </h4>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase font-bold tracking-wider">Material Status</p>
                  <p className="font-display text-headline-sm font-bold text-on-surface">{readyCount}/{totalCount} Ready</p>
                </div>
                <span className="material-symbols-outlined text-[#FF6B00] text-3xl">pending_actions</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase font-bold tracking-wider">Pujari List</p>
                  <p className="font-display text-headline-sm font-bold text-green-700">Submitted ✅</p>
                </div>
                <span className="material-symbols-outlined text-green-600 text-3xl">fact_check</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase font-bold tracking-wider">Overall Readiness</p>
                  <p className={`font-display text-headline-sm font-bold ${isFullyReady ? 'text-green-700' : 'text-[#a04100]'}`}>
                    {percentage}% Complete
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-[10px] font-bold ${
                  isFullyReady 
                    ? 'border-green-200 border-t-green-600 text-green-700' 
                    : 'border-yellow-200 border-t-primary text-[#a04100]'
                }`}>
                  {percentage}%
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-primary-container/10 rounded-lg border border-primary-container/20">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                <div>
                  <p className="text-label-md text-primary font-bold uppercase tracking-wider">Admin Tip</p>
                  <p className="text-body-sm text-on-surface-variant font-semibold mt-0.5">
                    Procure missing materials at least 24 hours before the pooja to ensure smooth rituals.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sanctity Card */}
          <div className="bg-gradient-to-br from-primary to-[#ff6b00] rounded-xl p-6 shadow-md text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-[120px]">temple_hindu</span>
            </div>
            <h4 className="font-display text-headline-sm font-bold mb-2">Temple Sanctity</h4>
            <p className="text-body-sm opacity-90 mb-4 font-medium">
              Maintaining complete readiness ensures the spiritual efficacy and devotee satisfaction during sacred rituals.
            </p>
            <button 
              onClick={() => setNotification('Opening Ritual Guide...')}
              className="bg-white text-primary px-4 py-2 rounded-full font-button text-button hover:bg-surface-container transition-all font-bold cursor-pointer"
            >
              View Ritual Guide
            </button>
          </div>

        </div>
      </div>

      {/* Add Custom Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 modal-shadow border border-[#F0E6D2]">
            <h3 className="font-display text-headline-sm font-bold text-on-surface mb-4">Add Custom Pooja Item</h3>
            <form onSubmit={handleAddCustomItem}>
              <div className="mb-6">
                <label className="block text-body-sm text-on-surface-variant font-bold mb-2 uppercase tracking-wide">
                  Item Name
                </label>
                <input 
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-medium text-on-surface"
                  placeholder="e.g. Honey, Fresh Fruits" 
                  type="text"
                  autoFocus
                />
              </div>
              <div className="flex gap-4 justify-end font-semibold">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-outline-variant text-on-surface rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-full hover:bg-[#b04b00] transition-colors shadow-sm cursor-pointer"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 w-full md:w-[calc(100%-240px)] bg-surface-container-lowest border-t border-outline-variant/30 p-4 px-6 flex justify-between items-center z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] font-sans">
        <div className="flex items-center gap-2 font-medium">
          <span className="material-symbols-outlined text-[#a04100]">info</span>
          <p className="text-body-sm text-on-surface-variant">
            {isFullyReady ? 'All items are ready!' : `${totalCount - readyCount} items remaining to be marked as ready.`}
          </p>
        </div>
        <div className="flex gap-3 font-semibold">
          <button 
            onClick={() => setNotification('Checklist progress saved locally.')}
            className="px-6 py-2.5 bg-surface-container text-on-surface-variant rounded-full font-button text-button hover:bg-surface-container-high transition-all cursor-pointer"
          >
            Save Progress
          </button>
          <button 
            onClick={handleFlagNotReady}
            className="px-6 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-full font-button text-button hover:bg-red-100 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">flag</span>
            Flag as Not Ready
          </button>
          <button 
            onClick={handleConfirmReady}
            className="px-8 py-2.5 bg-primary text-white rounded-full font-button text-button hover:bg-[#b04b00] shadow-md flex items-center gap-2 group cursor-pointer"
          >
            Confirm Pooja Ready
            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
          </button>
        </div>
      </div>

    </div>
  );
}
