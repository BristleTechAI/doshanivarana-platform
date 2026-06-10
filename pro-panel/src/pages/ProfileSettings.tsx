import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { PageHeader } from '../components/PageHeader';

export function ProfileSettings() {
  const profile = db.getProfile();

  // Personal Info States
  const [fullName, setFullName] = useState(profile.fullName);
  const [mobile, setMobile] = useState(profile.mobile ?? profile.phone ?? '');
  const [email, setEmail] = useState(profile.email);
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Notification Preference States
  const [prefEmail1, setPrefEmail1] = useState(profile.prefEmail1 ?? true);
  const [prefEmail2, setPrefEmail2] = useState(profile.prefEmail2 ?? true);
  const [prefEmail3, setPrefEmail3] = useState(profile.prefEmail3 ?? false);
  const [prefSMS1, setPrefSMS1] = useState(profile.prefSMS1 ?? true);
  const [prefSMS2, setPrefSMS2] = useState(profile.prefSMS2 ?? true);
  const [prefPush1, setPrefPush1] = useState(profile.prefPush1 ?? true);
  const [prefPush2, setPrefPush2] = useState(profile.prefPush2 ?? true);

  // Success Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync state dynamically with in-memory db changes
  useEffect(() => {
    const handleUpdate = () => {
      const updatedProfile = db.getProfile();
      setFullName(updatedProfile.fullName);
      setMobile(updatedProfile.mobile ?? updatedProfile.phone ?? '');
      setEmail(updatedProfile.email);
      setPhotoUrl(updatedProfile.photoUrl);
      setPrefEmail1(updatedProfile.prefEmail1 ?? true);
      setPrefEmail2(updatedProfile.prefEmail2 ?? true);
      setPrefEmail3(updatedProfile.prefEmail3 ?? false);
      setPrefSMS1(updatedProfile.prefSMS1 ?? true);
      setPrefSMS2(updatedProfile.prefSMS2 ?? true);
      setPrefPush1(updatedProfile.prefPush1 ?? true);
      setPrefPush2(updatedProfile.prefPush2 ?? true);
    };

    window.addEventListener('focus', handleUpdate);
    window.addEventListener('doshanivarana_profile_updated', handleUpdate);

    return () => {
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('doshanivarana_profile_updated', handleUpdate);
    };
  }, []);

  // Password requirements calculation
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const matched = newPassword === confirmPassword && newPassword.length > 0;
  const strengthPercent = [hasMinLen, hasUpper, hasNumber, hasSpecial].filter(Boolean).length * 25;
  
  let strengthLabel = 'Weak';
  let strengthColor = 'bg-red-500';
  let strengthTextClass = 'text-red-500';

  if (strengthPercent === 50) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-yellow-500';
    strengthTextClass = 'text-yellow-600';
  } else if (strengthPercent >= 75) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-green-500';
    strengthTextClass = 'text-green-600';
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const currentProfile = db.getProfile();
    db.saveProfile({
      ...currentProfile,
      fullName,
      mobile,
      email
    });
    triggerToast('Profile updated successfully!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    const currentProfile = db.getProfile();
    const currentStoredPassword = currentProfile.password || 'password';

    if (currentPassword !== currentStoredPassword) {
      setPasswordError('Incorrect current password.');
      return;
    }

    if (strengthPercent < 75 || !matched) return;

    db.saveProfile({
      ...currentProfile,
      password: newPassword
    });

    triggerToast('Password changed successfully! Please log in again with your new password.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePreferences = () => {
    const currentProfile = db.getProfile();
    db.saveProfile({
      ...currentProfile,
      prefEmail1,
      prefEmail2,
      prefEmail3,
      prefSMS1,
      prefSMS2,
      prefPush1,
      prefPush2
    });
    triggerToast('Notification preferences updated!');
  };

  const nameParts = fullName.trim().split(/\s+/);
  const initials = nameParts.length >= 2 
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : (nameParts[0][0] || '').toUpperCase();

  return (
    <div className="max-w-[1440px] mx-auto pb-16 font-sans relative">
      <PageHeader title="Profile & Settings" />
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#261812] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center justify-between gap-3 max-w-sm animate-fade-in border border-[#F0E6D2]">
          <div className="flex items-center gap-2 font-semibold text-body-sm">
            <span className="material-symbols-outlined text-green-500">check_circle</span>
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)} 
            className="text-on-surface-variant hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">close</span>
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <p className="text-body-lg text-on-surface-variant font-medium mt-1">Manage your account and notification preferences</p>
      </div>

      {/* Profile Overview Card */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#F0E6D2] p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-[80px] h-[80px] rounded-full bg-primary flex items-center justify-center text-on-primary font-display text-headline-lg font-bold shadow-sm relative overflow-hidden group border border-outline-variant">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initials || 'RK'
            )}
            <label htmlFor="profile-photo-upload" className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
            </label>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="profile-photo-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const dataUrl = reader.result as string;
                    const currentProfile = db.getProfile();
                    db.saveProfile({ ...currentProfile, photoUrl: dataUrl });
                    triggerToast('Profile photo updated successfully!');
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <label 
            htmlFor="profile-photo-upload"
            className="font-button text-button text-primary hover:text-[#b04b00] transition-colors cursor-pointer font-bold"
          >
            Change Photo
          </label>
        </div>
        
        <div className="flex-1 flex flex-col items-center md:items-start gap-3 w-full">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <h3 className="font-display text-headline-md text-on-surface font-bold">{fullName}</h3>
            <span className="bg-primary text-on-primary font-label-md text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-bold">
              PRO — Public Relations Officer
            </span>
            <span className="bg-green-50 text-green-700 border border-green-200 font-label-md text-[10px] px-3 py-1 rounded-full flex items-center gap-1 font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div> Active
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-1 text-on-surface-variant font-medium text-body-sm">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">temple_hindu</span>
              <span>Sri Venkateswara Temple</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Member since: March 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Three Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* LEFT: Personal Information */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#F0E6D2] p-6 flex flex-col h-full justify-between">
          <div>
            <h3 className="font-display text-headline-sm text-on-surface mb-6 border-b border-outline-variant/30 pb-2 flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-primary">person</span>
              Personal Information
            </h3>
            
            <form onSubmit={handleSavePersonalInfo} className="flex flex-col gap-5 font-semibold text-on-surface text-body-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Full Name *</label>
                <input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  type="text" 
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Email</label>
                <div className="relative">
                  <input 
                    disabled
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 pr-10 text-on-surface-variant cursor-not-allowed opacity-75 outline-none font-medium"
                    type="email" 
                    value={email} 
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">lock</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wide">Contact Admin to change email</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Mobile *</label>
                <input 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  type="tel" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Temple Assigned</label>
                <div className="relative">
                  <input 
                    disabled
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 pr-10 text-on-surface-variant cursor-not-allowed opacity-75 outline-none font-medium"
                    type="text" 
                    value="Sri Venkateswara Temple" 
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">lock</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wide">Assigned by Admin</p>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-on-primary font-button text-button py-2.5 px-4 rounded-full hover:bg-[#b04b00] transition-colors shadow-sm cursor-pointer mt-4"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* CENTER: Change Password */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#F0E6D2] p-6 flex flex-col h-full justify-between">
          <div>
            <h3 className="font-display text-headline-sm text-on-surface mb-6 border-b border-outline-variant/30 pb-2 flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-primary">key</span>
              Change Password
            </h3>
            
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5 font-semibold text-on-surface text-body-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Current Password</label>
                <div className="relative">
                  <input 
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 pr-10 font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    placeholder="••••••••" 
                    type={showCurrent ? 'text' : 'password'}
                  />
                  <button 
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors cursor-pointer" 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showCurrent ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {passwordError && (
                  <span className="text-[10px] text-red-600 flex items-center gap-1 mt-1 font-bold uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[14px]">close</span> {passwordError}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">New Password</label>
                <div className="relative">
                  <input 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 pr-10 font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    type={showNew ? 'text' : 'password'}
                  />
                  <button 
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors cursor-pointer" 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showNew ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                
                {/* Strength */}
                <div className="mt-2 flex flex-col gap-1 font-semibold text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant uppercase tracking-wider">Password Strength</span>
                    <span className={`font-bold uppercase tracking-wider ${strengthTextClass}`}>{strengthLabel}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 rounded-full ${strengthColor}`} style={{ width: `${strengthPercent}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Confirm New Password</label>
                <input 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  type="password" 
                />
                {matched ? (
                  <span className="text-[10px] text-green-700 flex items-center gap-1 mt-1 font-bold uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[14px]">check</span> Passwords match
                  </span>
                ) : confirmPassword.length > 0 ? (
                  <span className="text-[10px] text-red-600 flex items-center gap-1 mt-1 font-bold uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[14px]">close</span> Passwords do not match
                  </span>
                ) : null}
              </div>

              {/* Requirements checklist */}
              <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30 font-medium text-[11px] text-on-surface-variant">
                <p className="font-bold mb-1.5 uppercase tracking-wide">Password Requirements:</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className={`material-symbols-outlined text-[14px] ${hasMinLen ? 'text-green-600 font-bold' : 'text-outline-variant'}`}>
                      {hasMinLen ? 'check' : 'circle'}
                    </span> 
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={`material-symbols-outlined text-[14px] ${hasUpper ? 'text-green-600 font-bold' : 'text-outline-variant'}`}>
                      {hasUpper ? 'check' : 'circle'}
                    </span> 
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={`material-symbols-outlined text-[14px] ${hasNumber ? 'text-green-600 font-bold' : 'text-outline-variant'}`}>
                      {hasNumber ? 'check' : 'circle'}
                    </span> 
                    One number
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={`material-symbols-outlined text-[14px] ${hasSpecial ? 'text-green-600 font-bold' : 'text-outline-variant'}`}>
                      {hasSpecial ? 'check' : 'circle'}
                    </span> 
                    One special character
                  </li>
                </ul>
              </div>

              <button 
                type="submit"
                disabled={strengthPercent < 75 || !matched}
                className={`w-full py-2.5 px-4 rounded-full font-button text-button transition-colors mt-2 font-bold ${
                  strengthPercent >= 75 && matched 
                    ? 'bg-primary text-on-primary hover:bg-[#b04b00] cursor-pointer shadow-sm' 
                    : 'bg-outline-variant/30 text-on-surface-variant/40 cursor-not-allowed'
                }`}
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Notification Preferences */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#F0E6D2] p-6 flex flex-col h-full justify-between">
          <div>
            <h3 className="font-display text-headline-sm text-on-surface mb-6 border-b border-outline-variant/30 pb-2 flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-primary">notifications_active</span>
              Notification Preferences
            </h3>
            
            <div className="flex flex-col gap-6 font-semibold text-body-sm text-on-surface">
              {/* Email Section */}
              <div className="flex flex-col gap-3">
                <h4 className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Email Notifications</h4>
                <div className="flex items-center justify-between">
                  <span>New booking received</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      checked={prefEmail1}
                      onChange={() => setPrefEmail1(!prefEmail1)}
                      className="sr-only peer" 
                      type="checkbox"
                    />
                    <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span>Booking cancellation</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      checked={prefEmail2}
                      onChange={() => setPrefEmail2(!prefEmail2)}
                      className="sr-only peer" 
                      type="checkbox"
                    />
                    <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery status updates</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      checked={prefEmail3}
                      onChange={() => setPrefEmail3(!prefEmail3)}
                      className="sr-only peer" 
                      type="checkbox"
                    />
                    <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="h-px bg-outline-variant/20 w-full"></div>

              {/* SMS Section */}
              <div className="flex flex-col gap-3">
                <h4 className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">SMS Notifications</h4>
                <div className="flex items-center justify-between">
                  <span>Booking reminders</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      checked={prefSMS1}
                      onChange={() => setPrefSMS1(!prefSMS1)}
                      className="sr-only peer" 
                      type="checkbox"
                    />
                    <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery updates</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      checked={prefSMS2}
                      onChange={() => setPrefSMS2(!prefSMS2)}
                      className="sr-only peer" 
                      type="checkbox"
                    />
                    <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              <div className="h-px bg-outline-variant/20 w-full"></div>

              {/* Push Section */}
              <div className="flex flex-col gap-3">
                <h4 className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Browser Push</h4>
                <div className="flex items-center justify-between">
                  <span>All platform alerts</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      checked={prefPush1}
                      onChange={() => setPrefPush1(!prefPush1)}
                      className="sr-only peer" 
                      type="checkbox"
                    />
                    <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span>Stream reminders</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      checked={prefPush2}
                      onChange={() => setPrefPush2(!prefPush2)}
                      className="sr-only peer" 
                      type="checkbox"
                    />
                    <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/30 mt-6">
            <button 
              onClick={handleSavePreferences}
              className="w-full bg-transparent text-primary border-2 border-primary font-button text-button py-2.5 px-4 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer font-bold"
            >
              Save Preferences
            </button>
          </div>
        </div>

      </div>

      {/* Danger Zone */}
      <section className="bg-error-container/20 rounded-xl border border-error/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6 font-semibold">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-error-container text-on-error-container rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
          <div>
            <h4 className="font-display text-headline-sm text-on-surface font-bold">Account Deactivation</h4>
            <p className="text-body-sm text-on-surface-variant mt-1 font-medium">
              Need to deactivate your account or change your assigned temple? Contact your platform Admin.
            </p>
          </div>
        </div>
        <button 
          onClick={() => triggerToast('Admin support request sent successfully.')}
          className="whitespace-nowrap bg-transparent text-error border-2 border-error font-button text-button py-2 px-6 rounded-full hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer font-bold"
        >
          Contact Admin
        </button>
      </section>

      {/* Footer session info */}
      <div className="mt-12 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-xs text-on-surface-variant font-bold uppercase tracking-wider">
        <span>Last login: 10 May 2026 9:15 AM from Hyderabad, India</span>
        <span>Session expires in: 45 minutes</span>
      </div>

    </div>
  );
}
