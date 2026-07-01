import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AVAILABLE_SPECIALIZATIONS } from '../lib/db';
import { PageHeader } from '../components/PageHeader';

export function PujariManager() {
  const navigate = useNavigate();
  const { templeId } = useAuth();

  const [pujaris, setPujaris] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [specFilter, setSpecFilter] = useState('All');
  
  // Deactivation Modal State
  const [deactivatingPujari, setDeactivatingPujari] = useState<any | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    if (!templeId) return;

    const q = query(
      collection(db, 'priests'),
      where('templeId', '==', templeId),
      where('isDeleted', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setPujaris(docs);
    });

    return () => unsubscribe();
  }, [templeId]);

  const handleApplyFilters = () => {};

  const handleResetFilters = () => {
    setStatusFilter('All');
    setSpecFilter('All');
  };

  const handleToggleStatus = async (pujari: any) => {
    if (pujari.status !== 'Inactive') {
      // If active/available/etc, show deactivation flow
      if (pujari.bookings > 0) {
        setDeactivatingPujari(pujari);
        setShowWarningModal(true);
      } else {
        await updateDoc(doc(db, 'priests', pujari.id), { status: 'Inactive' });
      }
    } else {
      // Reactivate (default to Active)
      await updateDoc(doc(db, 'priests', pujari.id), { status: 'Active' });
    }
  };

  const confirmDeactivate = async () => {
    if (deactivatingPujari) {
      await updateDoc(doc(db, 'priests', deactivatingPujari.id), { status: 'Inactive' });
      // We no longer manually mutate bookings since Bookings relies on Firestore.
      setShowWarningModal(false);
      setDeactivatingPujari(null);
    }
  };

  // Filter Logic
  const filteredPujaris = pujaris.filter(p => {
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesSpec = specFilter === 'All' || (p.specialization && p.specialization.includes(specFilter));
    return matchesStatus && matchesSpec;
  });

  const totalCount = pujaris.length;
  const activeCount = pujaris.filter(p => p.status === 'Active' || p.status === 'Available' || p.status === 'Seasonal').length;
  const inactiveCount = pujaris.filter(p => p.status === 'Inactive' || p.status === 'On Leave').length;

  // Unique statuses from Firestore
  const allStatuses = Array.from(new Set(pujaris.map(p => p.status || 'Active')));

  return (
    <div className="max-w-[1440px] mx-auto pb-12 relative font-sans">
      <PageHeader title="Pujari Management" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 mt-4 gap-4">
        <div>
          <p className="text-body-md text-on-surface-variant mt-1 font-medium">Manage priests assigned to {templeId === 'tmqar6jp5yk4t' ? 'Sri Venkateswara Temple' : 'your temple'}</p>
        </div>
        <button 
          onClick={() => navigate('/pujaris/add')}
          className="bg-primary text-on-primary font-button text-button px-6 py-3 rounded-full hover:bg-[#b04b00] transition-colors shadow-sm flex items-center gap-2 w-fit cursor-pointer font-bold"
        >
          <span className="material-symbols-outlined">add</span>
          Add New Pujari
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-4 mb-8 soft-shadow border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-surface-bright border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-[40px] font-semibold"
            >
              <option value="All">Status: All</option>
              {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">arrow_drop_down</span>
          </div>

          <div className="relative">
            <select 
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="appearance-none bg-surface-bright border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-[40px] font-semibold"
            >
              <option value="All">All Specializations</option>
              {AVAILABLE_SPECIALIZATIONS.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">arrow_drop_down</span>
          </div>

          <button 
            onClick={handleApplyFilters}
            className="bg-primary text-on-primary font-button text-button px-4 py-2 rounded-lg hover:bg-[#b04b00] transition-colors h-[40px] font-bold cursor-pointer"
          >
            Apply
          </button>
          <button 
            onClick={handleResetFilters}
            className="text-on-surface-variant font-button text-button px-4 py-2 rounded-lg hover:bg-surface-variant transition-colors h-[40px] font-bold cursor-pointer"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap font-semibold">
          <span className="bg-surface-variant text-on-surface-variant font-label-md text-label-md px-3 py-1 rounded-full border border-outline-variant/50">
            Total Pujaris: {totalCount}
          </span>
          <span className="bg-green-50 text-green-700 font-label-md text-label-md px-3 py-1 rounded-full border border-green-200">
            Active: {activeCount}
          </span>
          <span className="bg-red-50 text-red-700 font-label-md text-label-md px-3 py-1 rounded-full border border-red-200">
            Inactive: {inactiveCount}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPujaris.map(pujari => {
          const isInactive = pujari.status === 'Inactive' || pujari.status === 'On Leave';
          const specializationsList = pujari.specialization ? pujari.specialization.split(',').map((s: string) => s.trim()) : [];
          const languagesList = Array.isArray(pujari.languages) ? pujari.languages : (pujari.languagesStr ? pujari.languagesStr.split(',') : []);

          return (
            <div 
              key={pujari.id} 
              className={`bg-surface-container-lowest rounded-xl p-6 soft-shadow border flex flex-col relative overflow-hidden transition-all duration-200 hover:scale-[1.01] ${
                isInactive 
                  ? 'border-outline-variant/50 opacity-75 grayscale-[20%]' 
                  : 'border-[#F0E6D2]'
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-10"></div>
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {pujari.photo && pujari.photo.length > 2 ? (
                    <img 
                      src={pujari.photo} 
                      alt={pujari.name} 
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display text-headline-sm font-bold shadow-sm text-white`} style={{ backgroundColor: pujari.color || '#C76A00' }}>
                      {pujari.photo || pujari.name?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className={`font-display text-headline-sm font-bold ${isInactive ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                      {pujari.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`w-2 h-2 rounded-full ${isInactive ? 'bg-[#ea4335]' : 'bg-[#34a853]'}`}></span>
                      <span className={`font-label-md text-[10px] font-bold uppercase ${isInactive ? 'text-red-600' : 'text-green-600'}`}>
                        {pujari.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {specializationsList.map((spec: string) => (
                    <span 
                      key={spec}
                      className={`border px-2 py-0.5 rounded font-label-md text-[9px] uppercase tracking-wider font-bold ${
                        isInactive 
                          ? 'bg-surface-variant text-on-surface-variant border-outline-variant/50' 
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
 
              <div className="mb-4 flex items-center gap-1.5 font-sans text-body-sm text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-[18px] text-primary">translate</span>
                <span>{languagesList.join(', ') || 'No languages configured'}</span>
              </div>

              <div className={`grid grid-cols-2 gap-4 mb-6 p-3 rounded-lg border font-sans ${
                isInactive 
                  ? 'bg-surface-bright/50 border-outline-variant/30 opacity-80' 
                  : 'bg-surface-bright border-outline-variant/30'
              }`}>
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase text-[10px] font-bold tracking-wider">Experience</p>
                  <p className="text-body-md text-on-surface font-bold">{pujari.experience}</p>
                </div>
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase text-[10px] font-bold tracking-wider">Bookings</p>
                  <p className="text-body-md text-on-surface font-bold">{pujari.bookings || 0}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-auto pt-4 border-t border-outline-variant/30 font-semibold">
                <button 
                  onClick={() => navigate(`/pujaris/edit/${pujari.id}`)}
                  className={`flex-1 border-2 py-2 rounded-full font-button text-button transition-colors cursor-pointer text-center ${
                    isInactive 
                      ? 'border-outline-variant text-on-surface-variant hover:bg-surface-variant' 
                      : 'border-primary text-primary hover:bg-primary/5'
                  }`}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleToggleStatus(pujari)}
                  className={`flex-1 border-2 py-2 rounded-full font-button text-button transition-colors cursor-pointer text-center ${
                    isInactive 
                      ? 'border-[#34a853] text-[#34a853] hover:bg-[#34a853]/5' 
                      : 'border-error text-error hover:bg-error/5'
                  }`}
                >
                  {isInactive ? 'Reactivate' : 'Deactivate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showWarningModal && deactivatingPujari && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 modal-shadow border border-[#F0E6D2] font-sans">
            <div className="flex items-center gap-3 text-error mb-4">
              <span className="material-symbols-outlined text-[32px]">warning</span>
              <h3 className="font-display text-headline-sm text-on-surface font-bold">Active Bookings Alert</h3>
            </div>
            
            <p className="text-body-md text-on-surface-variant font-medium mb-4">
              <strong className="text-on-surface">{deactivatingPujari.name}</strong> has <strong className="text-on-surface">{deactivatingPujari.bookings} total bookings</strong>. Deactivating this priest might affect upcoming schedules.
            </p>

            <div className="flex gap-4 justify-end font-semibold">
              <button 
                onClick={() => {
                  setShowWarningModal(false);
                  setDeactivatingPujari(null);
                }}
                className="px-6 py-2 border-2 border-outline-variant text-on-surface font-button text-button rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeactivate}
                className="px-6 py-2 bg-error text-white font-button text-button rounded-full hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
              >
                Force Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
