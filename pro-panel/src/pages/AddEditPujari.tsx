import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { collection, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AVAILABLE_SPECIALIZATIONS, AVAILABLE_LANGUAGES } from '../lib/db';
import { PageHeader } from '../components/PageHeader';

interface AddEditPujariProps {
  isEdit: boolean;
}

const parsePhone = (phoneStr: string) => {
  const cleaned = (phoneStr || '').trim();
  if (!cleaned) return { countryCode: '+91', number: '' };

  if (cleaned.startsWith('+')) {
    const match = cleaned.match(/^(\+\d+)\s*(.*)$/);
    if (match) {
      return {
        countryCode: match[1],
        number: match[2].replace(/\s+/g, '')
      };
    }
  }
  return { countryCode: '+91', number: cleaned.replace(/\s+/g, '') };
};

export function AddEditPujari({ isEdit }: AddEditPujariProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templeId: authTempleId } = useAuth();
  
  const [loading, setLoading] = useState(isEdit);
  const [existingPujari, setExistingPujari] = useState<any>(null);

  const [name, setName] = useState('');
  const [experience, setExperience] = useState('');
  const [contactCode, setContactCode] = useState('+91');
  const [contactNumber, setContactNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [status, setStatus] = useState('Active');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchPriest() {
      if (isEdit && id) {
        try {
          const docRef = doc(db, 'priests', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setExistingPujari(data);
            setName(data.name || '');
            setExperience(data.experience ? String(data.experience).replace(/\D/g, '') : '');
            
            const parsedContact = parsePhone(data.contact || '');
            setContactCode(parsedContact.countryCode);
            setContactNumber(parsedContact.number);
            
            setPhotoUrl(data.photoUrl || (data.photo && data.photo.length > 2 ? data.photo : ''));
            setStatus(data.status || 'Active');
            
            if (data.specialization) {
              setSpecializations(data.specialization.split(',').map((s: string) => s.trim()).filter(Boolean));
            } else if (data.specializations) {
              setSpecializations(data.specializations);
            }
            
            if (Array.isArray(data.languages)) {
              setLanguages(data.languages);
            } else if (data.languagesStr) {
              setLanguages(data.languagesStr.split(',').map((s: string) => s.trim()).filter(Boolean));
            }
          }
        } catch (error) {
          console.error("Error fetching priest:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    fetchPriest();
  }, [id, isEdit]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'File size must be less than 2MB' }));
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setErrors(prev => ({ ...prev, photo: 'Only JPG and PNG formats are supported' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          setErrors(prev => {
            const copy = { ...prev };
            delete copy.photo;
            return copy;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveSpec = (specToRemove: string) => {
    setSpecializations(specializations.filter(s => s !== specToRemove));
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setLanguages(languages.filter(l => l !== langToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!experience.trim()) newErrors.experience = 'Experience is required';
    else if (isNaN(Number(experience)) || Number(experience) < 0) {
      newErrors.experience = 'Experience must be a positive number';
    }

    const trimmedNumber = contactNumber.trim();
    if (!trimmedNumber) {
      newErrors.contact = 'Contact Number is required';
    } else if (!/^\d{10}$/.test(trimmedNumber)) {
      newErrors.contact = 'Contact Number must be a valid 10-digit number';
    }

    if (specializations.length === 0) {
      newErrors.specializations = 'At least one specialization is required';
    }

    if (languages.length === 0) {
      newErrors.languages = 'At least one language is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const nameParts = name.trim().split(/\s+/);
      const initials = nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : (nameParts[0][0] || '').toUpperCase();

      const fullContact = `${contactCode} ${contactNumber.trim()}`;
      
      const payload: any = {
        name: name.trim(),
        experience: `${experience} yrs`,
        contact: fullContact,
        status,
        specialization: specializations.join(', '),
        languages: languages,
      };

      if (photoUrl) {
        payload.photo = photoUrl;
        payload.photoUrl = photoUrl;
      } else if (!isEdit) {
        payload.photo = initials;
      }

      if (isEdit && id) {
        // Update existing priest
        await updateDoc(doc(db, 'priests', id), payload);
        setSuccessMsg('Pujari profile updated successfully!');
      } else {
        // Create new priest
        const priestColors = ["#C76A00", "#4A1259", "#D4A017", "#22C55E", "#6366F1", "#EF4444", "#F59E0B", "#14B8A6", "#8B5CF6", "#EC4899"];
        const color = priestColors[Math.floor(Math.random() * priestColors.length)];
        
        Object.assign(payload, {
          templeId: authTempleId || 'Unassigned',
          templeName: authTempleId === 'tmqar6jp5yk4t' ? 'Sri Venkateswara Temple' : 'Unassigned',
          location: 'Unknown',
          bookings: 0,
          rating: 5.0,
          color,
          since: new Date().toLocaleString('default', { month: 'short', year: 'numeric' }),
          isDeleted: false
        });

        await addDoc(collection(db, 'priests'), payload);
        setSuccessMsg('New Pujari added successfully!');
      }

      setTimeout(() => {
        navigate('/pujaris');
      }, 1500);
    } catch (error: any) {
      console.error("Error saving priest:", error);
      alert("Error saving priest: " + error.message);
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 font-sans font-medium">Loading priest data...</div>;
  }

  return (
    <div className="pb-12 font-sans">
      <PageHeader title={isEdit ? 'Edit Pujari Profile' : 'Add Pujari Profile'} backTo="/pujaris" />

      <div className="max-w-[720px] mx-auto">

      {successMsg && (
        <div className="mb-6 bg-green-100 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-2 font-semibold shadow-sm">
          <span className="material-symbols-outlined">check_circle</span>
          {successMsg}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl soft-shadow border border-[#F0E6D2] p-8">
        <form onSubmit={handleSave}>
          <div className="flex flex-col items-center justify-center mb-8 pb-8 border-b border-outline-variant/30">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-full border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer mb-4 bg-surface-container-low group relative overflow-hidden"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Pujari profile" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl mb-1 group-hover:scale-110 transition-transform">photo_camera</span>
                  <span className="font-label-md text-label-md font-bold uppercase tracking-wide">Upload</span>
                </>
              )}
            </div>
            <h3 className="font-display text-button text-on-surface font-bold">Upload Photo</h3>
            {photoUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-xs text-error font-bold hover:underline mb-2 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Remove Photo
              </button>
            )}
            <p className="text-body-sm text-on-surface-variant mb-1 font-medium">JPG or PNG max 2MB</p>
            {errors.photo && <p className="text-error text-xs mt-1 font-semibold">{errors.photo}</p>}
          </div>

          <div className="mb-6">
            <label className="block font-display text-button text-on-surface mb-2 font-bold">Full Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 bg-surface border rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-medium ${errors.name ? 'border-error' : 'border-outline-variant'}`}
              placeholder="Enter pujari's full name"
              type="text"
            />
            {errors.name && <p className="text-error text-xs mt-1 font-semibold">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <label className="block font-display text-button text-on-surface mb-2 font-bold">Experience (Years) *</label>
              <input
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={`w-full h-12 px-4 py-3 bg-surface border rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-medium ${errors.experience ? 'border-error' : 'border-outline-variant'}`}
                placeholder="e.g. 10"
                type="number"
                min="0"
              />
              {errors.experience && <p className="text-error text-xs mt-1 font-semibold">{errors.experience}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block font-display text-button text-on-surface mb-2 font-bold">Contact Number *</label>
              <div className="flex gap-2">
                <select
                  value={contactCode}
                  onChange={(e) => setContactCode(e.target.value)}
                  className="w-28 h-12 px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface outline-none focus:border-primary transition-colors font-semibold"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                </select>
                <input
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`w-full h-12 min-w-0 px-4 py-3 bg-surface border rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-medium ${errors.contact ? 'border-error' : 'border-outline-variant'}`}
                  placeholder="10-digit mobile number"
                  type="tel"
                />
              </div>
              {errors.contact && <p className="text-error text-xs mt-1 font-semibold">{errors.contact}</p>}
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-display text-button text-on-surface mb-2 font-bold">Specializations *</label>
            <div className="w-full p-2 bg-surface border border-outline-variant rounded-lg min-h-[56px] flex flex-wrap gap-2 items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
              {specializations.map(spec => (
                <div key={spec} className="flex items-center gap-1 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md font-bold">
                  {spec}
                  <span onClick={() => handleRemoveSpec(spec)} className="material-symbols-outlined text-[16px] cursor-pointer hover:text-white">close</span>
                </div>
              ))}
              <div className="flex-grow flex items-center min-w-[200px]">
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'ALL') {
                      setSpecializations(AVAILABLE_SPECIALIZATIONS);
                      setErrors(prev => { const copy = { ...prev }; delete copy.specializations; return copy; });
                    } else if (val && !specializations.includes(val)) {
                      setSpecializations([...specializations, val]);
                      setErrors(prev => { const copy = { ...prev }; delete copy.specializations; return copy; });
                    }
                    e.target.value = ''; 
                  }}
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-1 font-body-md font-semibold text-on-surface-variant cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>Select Specialization...</option>
                  {AVAILABLE_SPECIALIZATIONS.filter(s => !specializations.includes(s)).length > 0 && <option value="ALL">Select All</option>}
                  {AVAILABLE_SPECIALIZATIONS.filter(s => !specializations.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {errors.specializations && <p className="text-error text-xs mt-1 font-semibold">{errors.specializations}</p>}
          </div>

          <div className="mb-6">
            <label className="block font-display text-button text-on-surface mb-2 font-bold">Languages Known *</label>
            <div className="w-full p-2 bg-surface border border-outline-variant rounded-lg min-h-[56px] flex flex-wrap gap-2 items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
              {languages.map(lang => (
                <div key={lang} className="flex items-center gap-1 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md font-bold">
                  {lang}
                  <span onClick={() => handleRemoveLanguage(lang)} className="material-symbols-outlined text-[16px] cursor-pointer hover:text-white">close</span>
                </div>
              ))}
              <div className="flex-grow flex items-center min-w-[200px]">
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'ALL') {
                      setLanguages(AVAILABLE_LANGUAGES);
                      setErrors(prev => { const copy = { ...prev }; delete copy.languages; return copy; });
                    } else if (val && !languages.includes(val)) {
                      setLanguages([...languages, val]);
                      setErrors(prev => { const copy = { ...prev }; delete copy.languages; return copy; });
                    }
                    e.target.value = ''; 
                  }}
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-1 font-body-md font-semibold text-on-surface-variant cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>Select Languages...</option>
                  {AVAILABLE_LANGUAGES.filter(l => !languages.includes(l)).length > 0 && <option value="ALL">Select All</option>}
                  {AVAILABLE_LANGUAGES.filter(l => !languages.includes(l)).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            {errors.languages && <p className="text-error text-xs mt-1 font-semibold">{errors.languages}</p>}
          </div>

          <div className="mb-8 p-4 bg-surface-container-low rounded-lg flex items-center justify-between border border-outline-variant/30">
            <div>
              <h4 className="font-display text-button text-on-surface font-bold">Pujari Status</h4>
              <p className="text-label-md text-on-surface-variant font-semibold mt-1">
                Currently: <strong>{status}</strong>. Only toggle to change to Inactive.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-body-sm font-semibold ${status === 'Inactive' ? 'text-primary' : 'text-on-surface-variant'}`}>Inactive</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={status !== 'Inactive'}
                  onChange={() => setStatus(status !== 'Inactive' ? 'Inactive' : (existingPujari?.status !== 'Inactive' ? existingPujari?.status || 'Active' : 'Active'))}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span className={`font-body-sm font-semibold ${status !== 'Inactive' ? 'text-primary' : 'text-on-surface-variant'}`}>Active</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-outline-variant/30 font-semibold">
            <button
              onClick={() => navigate('/pujaris')}
              className="px-6 py-2.5 rounded-full border-2 border-outline-variant text-on-surface-variant font-button hover:bg-surface-container-low transition-colors cursor-pointer"
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-button hover:bg-[#b04b00] shadow-sm transition-colors flex items-center gap-2 cursor-pointer font-bold disabled:opacity-50"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Pujari'}
            </button>
          </div>
        </form>
      </div>

      {isEdit && existingPujari?.bookings > 0 && (
        <div className="mt-6 flex items-center gap-2 bg-yellow-50 text-yellow-800 border border-yellow-200 px-4 py-3 rounded-lg w-fit font-medium">
          <span className="material-symbols-outlined text-[20px]">info</span>
          <span className="text-body-sm">
            This pujari has <strong>{existingPujari.bookings} total bookings</strong> recorded. Deactivating may affect assignments.
          </span>
        </div>
      )}

      </div>
    </div>
  );
}
