import { ChevronRight, User, Star, Calendar, Settings, Bell, HelpCircle, LogOut, Sparkles, Moon, Sun, Edit2, X, Camera, MapPin, Phone, Mail, Languages } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { Link } from 'react-router';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  nakshatra: string;
  rashi: string;
  dateOfBirth: string;
  gothram: string;
  profileImage?: string;
}

export function Profile() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Raghavan Iyer',
    email: 'raghavan.iyer@example.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, Karnataka',
    nakshatra: 'Shravana',
    rashi: 'Makara (Capricorn)',
    dateOfBirth: 'Jan 15, 1990',
    gothram: 'Bharadwaja',
  });

  const [notifications, setNotifications] = useState({
    poojaReminders: true,
    liveStreams: true,
    prasadUpdates: true,
    festivalAlerts: true,
  });

  const stats = {
    totalPoojas: 12,
    upcoming: 3,
    devotionScore: 5.0,
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile({ ...profile, ...updates });
    setIsEditingProfile(false);
    setIsEditingPersonal(false);
  };

  return (
    <div className="min-h-full pb-20">
      {/* Header */}
      <header className="bg-gradient-to-b from-primary/20 to-transparent border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-[#E05C10] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                {profile.name}
              </h1>
              <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                {profile.email}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span style={{ fontFamily: "'Noto Sans', sans-serif" }}>{profile.location}</span>
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={<Star className="w-5 h-5" />} value={stats.totalPoojas.toString()} label="Poojas" />
            <StatCard icon={<Calendar className="w-5 h-5" />} value={stats.upcoming.toString()} label="Upcoming" />
            <StatCard icon={<Sparkles className="w-5 h-5" />} value={stats.devotionScore.toString()} label="Devotion" />
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Personalization Section */}
        <section>
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Personalisation
            </h2>
            <button
              onClick={() => setIsEditingPersonal(true)}
              className="text-primary hover:text-[#E05C10] transition-colors text-sm font-medium flex items-center gap-1"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <ProfileItem
              icon={<Star className="w-5 h-5" />}
              label="Nakshatra"
              value={profile.nakshatra}
              showChevron={false}
            />
            <ProfileItem
              icon={<Star className="w-5 h-5" />}
              label="Rashi"
              value={profile.rashi}
              showChevron={false}
            />
            <ProfileItem
              icon={<Calendar className="w-5 h-5" />}
              label="Date of Birth"
              value={profile.dateOfBirth}
              showChevron={false}
            />
            <ProfileItem
              icon={<User className="w-5 h-5" />}
              label="Gothram"
              value={profile.gothram}
              showChevron={false}
            />
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="text-lg font-semibold mb-3 px-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            AI Recommendations
          </h2>
          <Link to="/poojas">
            <div className="bg-card border border-border rounded-2xl p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                    Based on Your {profile.nakshatra} Nakshatra
                  </h3>
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                    Personalised pooja recommendations just for you
                  </p>
                </div>
              </div>
              <button className="w-full py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm">
                View Recommendations
              </button>
            </div>
          </Link>
        </section>

        {/* Settings Section */}
        <section>
          <h2 className="text-lg font-semibold mb-3 px-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            Settings
          </h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <SettingsItem 
              icon={<Bell className="w-5 h-5" />} 
              label="Notifications" 
              onClick={() => setShowNotifications(true)}
            />
            <SettingsItem 
              icon={<Calendar className="w-5 h-5" />} 
              label="Hindu Calendar" 
              onClick={() => setShowCalendar(true)}
            />
            <SettingsItem 
              icon={<HelpCircle className="w-5 h-5" />} 
              label="Help & Support" 
              onClick={() => setShowHelp(true)}
            />
            <Link to="/settings">
              <SettingsItem icon={<Settings className="w-5 h-5" />} label="App Settings" />
            </Link>
            <SettingsItem
              icon={<Languages className="w-5 h-5" />}
              label="Language"
              onClick={toggleLanguage}
            />
          </div>
        </section>

        {/* Logout */}
        <button className="w-full py-3 rounded-xl border-2 border-destructive text-destructive hover:bg-destructive/5 transition-colors font-medium flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          DEVASEVA v1.0.0 • Made with devotion 🙏
        </p>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <EditProfileModal
          profile={profile}
          onSave={updateProfile}
          onClose={() => setIsEditingProfile(false)}
        />
      )}

      {/* Edit Personal Info Modal */}
      {isEditingPersonal && (
        <EditPersonalModal
          profile={profile}
          onSave={updateProfile}
          onClose={() => setIsEditingPersonal(false)}
        />
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <NotificationsModal
          notifications={notifications}
          onSave={setNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <CalendarModal onClose={() => setShowCalendar(false)} />
      )}

      {/* Help Modal */}
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center">
      <div className="flex justify-center mb-2 text-primary">{icon}</div>
      <div className="text-2xl font-bold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
        {label}
      </div>
    </div>
  );
}

function ProfileItem({
  icon,
  label,
  value,
  showChevron = true,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  showChevron?: boolean;
}) {
  return (
    <div className="w-full flex items-center gap-4 p-4 border-b border-border last:border-b-0">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1 text-left">
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          {label}
        </p>
        <p className="font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          {value}
        </p>
      </div>
      {showChevron && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
    </div>
  );
}

function SettingsItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
    >
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1 text-left">
        <p className="font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          {label}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  return (
    <div className="w-full flex items-center gap-4 p-4 border-b border-border">
      <div className="text-muted-foreground">
        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <p className="font-medium mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          Theme
        </p>
        <p className="text-xs text-muted-foreground capitalize" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          {theme} mode
        </p>
      </div>
      <button
        onClick={onToggle}
        className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        style={{ backgroundColor: theme === 'dark' ? '#F97316' : '#E7E5E4' }}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center ${
            theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
          }`}
        >
          {theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </span>
      </button>
    </div>
  );
}

// Edit Profile Modal
function EditProfileModal({
  profile,
  onSave,
  onClose,
}: {
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-background w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-border text-foreground hover:bg-muted/30 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-[#E05C10] transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Personal Info Modal
function EditPersonalModal({
  profile,
  onSave,
  onClose,
}: {
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    nakshatra: profile.nakshatra,
    rashi: profile.rashi,
    dateOfBirth: profile.dateOfBirth,
    gothram: profile.gothram,
  });

  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya',
    'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
    'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
    'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  const rashis = [
    'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
    'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
    'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-background w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            Edit Personal Information
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Nakshatra
            </label>
            <select
              value={formData.nakshatra}
              onChange={(e) => setFormData({ ...formData, nakshatra: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            >
              {nakshatras.map((nakshatra) => (
                <option key={nakshatra} value={nakshatra}>
                  {nakshatra}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Rashi
            </label>
            <select
              value={formData.rashi}
              onChange={(e) => setFormData({ ...formData, rashi: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            >
              {rashis.map((rashi) => (
                <option key={rashi} value={rashi}>
                  {rashi}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Date of Birth
            </label>
            <input
              type="text"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              placeholder="e.g., Jan 15, 1990"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Gothram
            </label>
            <input
              type="text"
              value={formData.gothram}
              onChange={(e) => setFormData({ ...formData, gothram: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-border text-foreground hover:bg-muted/30 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-[#E05C10] transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Notifications Modal
function NotificationsModal({
  notifications,
  onSave,
  onClose,
}: {
  notifications: {
    poojaReminders: boolean;
    liveStreams: boolean;
    prasadUpdates: boolean;
    festivalAlerts: boolean;
  };
  onSave: (notifications: any) => void;
  onClose: () => void;
}) {
  const [settings, setSettings] = useState(notifications);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-background w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            Notification Settings
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <NotificationToggle
            label="Pooja Reminders"
            description="Get reminded before your scheduled poojas"
            checked={settings.poojaReminders}
            onChange={(checked) => setSettings({ ...settings, poojaReminders: checked })}
          />
          <NotificationToggle
            label="Live Streams"
            description="Notification when your pooja starts streaming"
            checked={settings.liveStreams}
            onChange={(checked) => setSettings({ ...settings, liveStreams: checked })}
          />
          <NotificationToggle
            label="Prasad Updates"
            description="Track your prasad delivery status"
            checked={settings.prasadUpdates}
            onChange={(checked) => setSettings({ ...settings, prasadUpdates: checked })}
          />
          <NotificationToggle
            label="Festival Alerts"
            description="Special poojas and festival notifications"
            checked={settings.festivalAlerts}
            onChange={(checked) => setSettings({ ...settings, festivalAlerts: checked })}
          />

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-border text-foreground hover:bg-muted/30 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-[#E05C10] transition-colors font-medium"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 bg-card border border-border rounded-xl">
      <div className="flex-1">
        <p className="font-medium mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          {label}
        </p>
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          {description}
        </p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none"
        style={{ backgroundColor: checked ? '#F97316' : '#E7E5E4' }}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// Calendar Modal
function CalendarModal({ onClose }: { onClose: () => void }) {
  const upcomingEvents = [
    { date: 'Mar 21, 2026', event: 'Ugadi', description: 'Telugu & Kannada New Year' },
    { date: 'Mar 25, 2026', event: 'Ram Navami', description: 'Birth of Lord Rama' },
    { date: 'Apr 14, 2026', event: 'Vishu', description: 'Malayalam New Year' },
    { date: 'Apr 17, 2026', event: 'Hanuman Jayanti', description: 'Birth of Lord Hanuman' },
    { date: 'May 23, 2026', event: 'Akshaya Tritiya', description: 'Auspicious day for new beginnings' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-background w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            Hindu Calendar
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <p className="text-sm font-medium text-primary mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Today's Tithi
            </p>
            <p className="text-lg font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Shukla Paksha Chaturthi
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Upcoming Festivals
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                        {event.event}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                        {event.description}
                      </p>
                      <p className="text-xs text-primary" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                        {event.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Help Modal
function HelpModal({ onClose }: { onClose: () => void }) {
  const helpTopics = [
    {
      question: 'How do I book a pooja?',
      answer: 'Browse poojas, select your preferred temple and time, then click "Offer This Pooja" to complete your booking.'
    },
    {
      question: 'Can I watch the pooja live?',
      answer: 'Yes! When your pooja begins, you\'ll receive a notification. Click "View Live" in your bookings to watch in real-time.'
    },
    {
      question: 'How is prasad delivered?',
      answer: 'After your pooja is completed, prasad is carefully packed and shipped to your address. Track delivery in your bookings.'
    },
    {
      question: 'What is the Devotion Score?',
      answer: 'Your devotion score reflects your engagement with temple services. It increases with each pooja you offer.'
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-background w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            Help & Support
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <h3 className="font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Contact Support
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span style={{ fontFamily: "'Noto Sans', sans-serif" }}>support@devaseva.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span style={{ fontFamily: "'Noto Sans', sans-serif" }}>+91 80 1234 5678</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Frequently Asked Questions
            </h3>
            <div className="space-y-3">
              {helpTopics.map((topic, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-4">
                  <p className="font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                    {topic.question}
                  </p>
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                    {topic.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}