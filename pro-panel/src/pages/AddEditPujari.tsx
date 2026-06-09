import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { db, type Pujari } from '../lib/db';

interface AddEditPujariProps {
  isEdit: boolean;
}

export function AddEditPujari({ isEdit }: AddEditPujariProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const existingPujari = (isEdit && id) ? db.getPujaris().find(x => x.id === id) : null;

  const [name, setName] = useState(existingPujari?.name || '');
  const [experience, setExperience] = useState(() => existingPujari?.experience ? existingPujari.experience.replace(/\D/g, '') : '');
  const [contact, setContact] = useState(existingPujari?.contact || '');
  const [status, setStatus] = useState<'Active' | 'Inactive'>(existingPujari?.status || 'Active');
  const [specializations, setSpecializations] = useState<string[]>(existingPujari?.specializations || ['Satyanarayana Pooja', 'Ganapathi Homam']);
  const [newSpec, setNewSpec] = useState('');
  const bookingsCount = existingPujari?.bookingsCount || 0;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAddSpec = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSpec.trim()) {
      e.preventDefault();
      if (!specializations.includes(newSpec.trim())) {
        setSpecializations([...specializations, newSpec.trim()]);
      }
      setNewSpec('');
    }
  };

  const handleAddSpecClick = () => {
    if (newSpec.trim()) {
      if (!specializations.includes(newSpec.trim())) {
        setSpecializations([...specializations, newSpec.trim()]);
      }
      setNewSpec('');
    }
  };

  const handleRemoveSpec = (specToRemove: string) => {
    setSpecializations(specializations.filter(s => s !== specToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!experience.trim()) newErrors.experience = 'Experience is required';
    if (isNaN(Number(experience)) || Number(experience) < 0) {
      newErrors.experience = 'Experience must be a positive number';
    }
    if (!contact.trim()) newErrors.contact = 'Contact Number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const list = db.getPujaris();
    const existing = isEdit && id ? list.find(x => x.id === id) : null;
    
    const nameParts = name.trim().split(/\s+/);
    const avatarText = nameParts.length >= 2 
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : (nameParts[0][0] || '').toUpperCase();

    const avatarBgs = [
      'bg-primary text-on-primary',
      'bg-secondary-container text-on-secondary-container',
      'bg-tertiary text-on-tertiary',
      'bg-outline text-white'
    ];
    const avatarBg = existing?.avatarBg || avatarBgs[Math.floor(Math.random() * avatarBgs.length)];

    const updatedPujari: Pujari = {
      id: existing?.id || `PJ-${String(list.length + 1).padStart(3, '0')}`,
      name: name.trim(),
      experience: `${experience} years`,
      contact: contact.trim(),
      status,
      specializations,
      bookingsCount: existing?.bookingsCount || 0,
      avatarText,
      avatarBg
    };

    db.updatePujari(updatedPujari);

    setSuccessMsg(isEdit ? 'Pujari profile updated successfully!' : 'New Pujari added successfully!');
    
    setTimeout(() => {
      navigate('/pujaris');
    }, 1500);
  };

  return (
    <div className="max-w-[720px] mx-auto pb-12 font-sans">
      
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-on-surface-variant text-body-sm mb-2 font-medium">
          <Link to="/pujaris" className="hover:text-primary font-bold">Pujari Management</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-bold">{isEdit ? 'Edit Pujari' : 'Add New Pujari'}</span>
        </div>
        <h1 className="font-display text-headline-lg text-on-surface font-semibold mb-1">
          {isEdit ? 'Edit Pujari Profile' : 'Add New Pujari'}
        </h1>
        <p className="text-body-md text-on-surface-variant font-medium">
          {isEdit ? `Modify profile settings for ${name}` : 'Add a new priest profile for Sri Venkateswara Temple'}
        </p>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="mb-6 bg-green-100 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-2 font-semibold shadow-sm">
          <span className="material-symbols-outlined">check_circle</span>
          {successMsg}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] p-8">
        <form onSubmit={handleSave}>
          
          {/* Photo Upload */}
          <div className="flex flex-col items-center justify-center mb-8 pb-8 border-b border-outline-variant/30">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer mb-4 bg-surface-container-low group relative overflow-hidden">
              <span className="material-symbols-outlined text-3xl mb-1 group-hover:scale-110 transition-transform">photo_camera</span>
              <span className="font-label-md text-label-md font-bold uppercase tracking-wide">Upload</span>
            </div>
            <h3 className="font-display text-button text-on-surface font-bold">Upload Photo</h3>
            <p className="text-body-sm text-on-surface-variant mb-1 font-medium">JPG or PNG max 2MB</p>
            <p className="text-label-md text-[#8e7164] text-center font-semibold uppercase tracking-wider text-[10px]">
              Photo is shown to devotees on pooja booking page
            </p>
          </div>

          {/* Full Name */}
          <div className="mb-6">
            <label className="block font-display text-button text-on-surface mb-2 font-bold">Full Name *</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 bg-surface border rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-medium ${
                errors.name ? 'border-error' : 'border-outline-variant'
              }`}
              placeholder="Enter pujari's full name" 
              type="text"
            />
            {errors.name && <p className="text-error text-xs mt-1 font-semibold">{errors.name}</p>}
          </div>

          {/* Experience & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block font-display text-button text-on-surface mb-2 font-bold">Experience (Years) *</label>
              <input 
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={`w-full px-4 py-3 bg-surface border rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-medium ${
                  errors.experience ? 'border-error' : 'border-outline-variant'
                }`}
                placeholder="e.g. 10" 
                type="number"
                min="0"
              />
              {errors.experience && <p className="text-error text-xs mt-1 font-semibold">{errors.experience}</p>}
            </div>
            <div>
              <label className="block font-display text-button text-on-surface mb-2 font-bold">Contact Number *</label>
              <input 
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className={`w-full px-4 py-3 bg-surface border rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-medium ${
                  errors.contact ? 'border-error' : 'border-outline-variant'
                }`}
                placeholder="+91 XXXXX XXXXX" 
                type="tel"
              />
              {errors.contact && <p className="text-error text-xs mt-1 font-semibold">{errors.contact}</p>}
              <p className="text-label-md text-[#8e7164] mt-1 font-semibold uppercase tracking-wider text-[10px]">
                For internal use only — not shown to devotees
              </p>
            </div>
          </div>

          {/* Specializations */}
          <div className="mb-6">
            <label className="block font-display text-button text-on-surface mb-2 font-bold">Specializations *</label>
            <div className="w-full p-2 bg-surface border border-outline-variant rounded-lg min-h-[56px] flex flex-wrap gap-2 items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
              {specializations.map(spec => (
                <div key={spec} className="flex items-center gap-1 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md font-bold">
                  {spec}
                  <span 
                    onClick={() => handleRemoveSpec(spec)}
                    className="material-symbols-outlined text-[16px] cursor-pointer hover:text-white"
                  >
                    close
                  </span>
                </div>
              ))}
              <div className="flex-grow flex items-center min-w-[150px]">
                <input 
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  onKeyDown={handleAddSpec}
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-1 font-body-md font-semibold" 
                  placeholder="Type &amp; hit Enter or press add" 
                  type="text"
                />
                {newSpec.trim() && (
                  <button
                    type="button"
                    onClick={handleAddSpecClick}
                    className="material-symbols-outlined text-primary hover:text-[#b04b00] cursor-pointer ml-1 text-[20px]"
                  >
                    add_circle
                  </button>
                )}
              </div>
            </div>
            <p className="text-label-md text-[#8e7164] mt-1 font-semibold uppercase tracking-wider text-[10px]">
              Add specializations that this Pujari can perform
            </p>
          </div>

          {/* Status Toggle */}
          <div className="mb-8 p-4 bg-surface-container-low rounded-lg flex items-center justify-between border border-outline-variant/30">
            <div>
              <h4 className="font-display text-button text-on-surface font-bold">Pujari Status</h4>
              <p className="text-label-md text-on-surface-variant font-semibold mt-1">
                Inactive pujaris will not appear in assignment dropdowns
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-body-sm font-semibold ${status === 'Inactive' ? 'text-primary' : 'text-on-surface-variant'}`}>
                Inactive
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  checked={status === 'Active'}
                  onChange={() => setStatus(status === 'Active' ? 'Inactive' : 'Active')}
                  className="sr-only peer" 
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span className={`font-body-sm font-semibold ${status === 'Active' ? 'text-primary' : 'text-on-surface-variant'}`}>
                Active
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-outline-variant/30 font-semibold">
            <button 
              onClick={() => navigate('/pujaris')}
              className="px-6 py-2.5 rounded-full border-2 border-outline-variant text-on-surface-variant font-button hover:bg-surface-container-low transition-colors cursor-pointer" 
              type="button"
            >
              Cancel
            </button>
            <button 
              className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-button hover:bg-[#b04b00] shadow-sm transition-colors flex items-center gap-2 cursor-pointer font-bold" 
              type="submit"
            >
              Save Pujari
            </button>
          </div>
        </form>
      </div>

      {/* Info Card for Active Bookings */}
      {isEdit && bookingsCount > 0 && (
        <div className="mt-6 flex items-center gap-2 bg-yellow-50 text-yellow-800 border border-yellow-200 px-4 py-3 rounded-lg w-fit font-medium">
          <span className="material-symbols-outlined text-[20px]">info</span>
          <span className="text-body-sm">
            This pujari is currently assigned to <strong>{bookingsCount} upcoming bookings</strong>. Deactivating will require reassignment.
          </span>
        </div>
      )}

    </div>
  );
}
