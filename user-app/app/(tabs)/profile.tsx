// @ts-nocheck
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, Switch } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ChevronRight, User, Star, Calendar, Settings, Bell, HelpCircle, LogOut, Sparkles, Edit2, X, MapPin, Phone, Mail, Languages, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { safeStorage } from '../../src/old_app/lib/storage';

const deitiesList = [
  { id: 'ganesha', name: 'Ganesha', emoji: '🐘' },
  { id: 'lakshmi', name: 'Lakshmi', emoji: '💰' },
  { id: 'shiva', name: 'Shiva', emoji: '🔱' },
  { id: 'vishnu', name: 'Vishnu', emoji: '🦅' },
  { id: 'durga', name: 'Durga', emoji: '🦁' },
  { id: 'saraswati', name: 'Saraswati', emoji: '📿' },
  { id: 'hanuman', name: 'Hanuman', emoji: '🐵' },
  { id: 'murugan', name: 'Murugan', emoji: '🦚' },
];

const termTranslations: Record<string, Record<string, string>> = {
  // Nakshatras
  ashwini: { en: 'Ashwini', te: 'అశ్విని', hi: 'अश्विनी', gu: 'અશ્વિની' },
  bharani: { en: 'Bharani', te: 'భరణి', hi: 'भरणी', gu: 'ભરણી' },
  krittika: { en: 'Krittika', te: 'కృత్తిక', hi: 'कृत्तिका', gu: 'કૃતિકા' },
  rohini: { en: 'Rohini', te: 'రోహిణి', hi: 'रोहिणी', gu: 'રોહિણી' },
  mrigashira: { en: 'Mrigashira', te: 'మృగశిర', hi: 'मृगशिरा', gu: 'મૃગશીર્ષ' },
  ardra: { en: 'Ardra', te: 'ఆర్ద్ర', hi: 'आर्द्रा', gu: 'આદ્રા' },
  punarvasu: { en: 'Punarvasu', te: 'పునర్వసు', hi: 'पुनर्वसु', gu: 'પુનર્વસુ' },
  pushya: { en: 'Pushya', te: 'పుష్యమి', hi: 'पुष्य', gu: 'પુષ્ય' },
  ashlesha: { en: 'Ashlesha', te: 'ఆశ్లేష', hi: 'श्लेषा', gu: 'આશ્લેષા' },
  magha: { en: 'Magha', te: 'మఖ', hi: 'मघा', gu: 'મઘા' },
  'purva phalguni': { en: 'Purva Phalguni', te: 'పూర్వ ఫల్గుణి', hi: 'पूर्वाफाल्गुनी', gu: 'પૂર્વા ફાલ્ગુની' },
  'uttara phalguni': { en: 'Uttara Phalguni', te: 'ఉత్తర ఫల్గుణి', hi: 'उत्तराफाल्गुनी', gu: 'ઉત્તરા ફાલ્ગુની' },
  hasta: { en: 'Hasta', te: 'హస్త', hi: 'हस्त', gu: 'હસ્ત' },
  chitra: { en: 'Chitra', te: 'చిత్ర', hi: 'चित્રા', gu: 'ચિત્રા' },
  swati: { en: 'Swati', te: 'స్వాతి', hi: 'स्वाति', gu: 'સ્વાતિ' },
  vishakha: { en: 'Vishakha', te: 'విశాఖ', hi: 'विशाखा', gu: 'વિశాखा' },
  anuradha: { en: 'Anuradha', te: 'అనూరాధ', hi: 'अनुराधा', gu: 'અનુરાધા' },
  jyeshtha: { en: 'Jyeshtha', te: 'జ్యేష్ఠ', hi: 'ज्येष्ठा', gu: 'જ્યેષ્ઠા' },
  mula: { en: 'Mula', te: 'మూల', hi: 'मूल', gu: 'મૂળ' },
  'purva ashadha': { en: 'Purva Ashadha', te: 'పూర్వాషాఢ', hi: 'पूर्वाषाढ़ा', gu: 'પૂર્વાષાઢા' },
  'uttara ashadha': { en: 'Uttara Ashadha', te: 'ఉత్తరాషాఢ', hi: 'उत्तराषाढ़ा', gu: 'ઉત્તરાષાઢા' },
  shravana: { en: 'Shravana', te: 'శ్రవణ', hi: 'श्रवण', gu: 'શ્રવણ' },
  dhanishta: { en: 'Dhanishta', te: 'ధనిష్ఠ', hi: 'धनिष्ठा', gu: 'ધનિષ્ઠા' },
  shatabhisha: { en: 'Shatabhisha', te: 'శతభిషం', hi: 'शतभिषा', gu: 'શતભિષા' },
  'purva bhadrapada': { en: 'Purva Bhadrapada', te: 'పూర్వాభాద్ర', hi: 'पूर्वाभाद्रपद', gu: 'પૂર્વાભાદ્રપદ' },
  'uttara bhadrapada': { en: 'Uttara Bhadrapada', te: 'ఉత్తరాభాద్ర', hi: 'उत्तराभाद्रपद', gu: 'ઉત્તરાભાદ્રપદ' },
  revati: { en: 'Revati', te: 'రేవతి', hi: 'रेवती', gu: 'રેવતી' },
  mohini: { en: 'Mohini', te: 'మోహిని', hi: 'मोहिनी', gu: 'મોહિની' },

  // Rashis
  'mesha (aries)': { en: 'Mesha (Aries)', te: 'మేషం (Mesha)', hi: 'मेष (Aries)', gu: 'મેષ (Aries)' },
  'vrishabha (taurus)': { en: 'Vrishabha (Taurus)', te: 'వృషభం (Vrishabha)', hi: 'वृषभ (Taurus)', gu: 'વૃષભ (Taurus)' },
  'mithuna (gemini)': { en: 'Mithuna (Gemini)', te: 'మిథునం (Mithuna)', hi: 'मिथुन (Gemini)', gu: 'મિથુન (Gemini)' },
  'karka (cancer)': { en: 'Karka (Cancer)', te: 'కర్కాటకం (Karka)', hi: 'कर्क (Cancer)', gu: 'કર્ક (Cancer)' },
  'karkatakam': { en: 'Karkatakam', te: 'కర్కాటకం', hi: 'कर्कट', gu: 'કર્કટ' },
  'simha (leo)': { en: 'Simha (Leo)', te: 'సింహం (Simha)', hi: 'सिंह (Leo)', gu: 'સિંહ (Leo)' },
  'kanya (virgo)': { en: 'Kanya (Virgo)', te: 'కన్యా (Kanya)', hi: 'कन्या (Virgo)', gu: 'કન્યા (Virgo)' },
  'tula (libra)': { en: 'Tula (Libra)', te: 'తులా (Tula)', hi: 'तुला (Libra)', gu: 'તુલા (Libra)' },
  'vrishchika (scorpio)': { en: 'Vrishchika (Scorpio)', te: 'వృశ్చికం (Vrishchika)', hi: 'वृश्चिक (Scorpio)', gu: 'વૃશ્ચિક (Scorpio)' },
  'dhanu (sagittarius)': { en: 'Dhanu (Sagittarius)', te: 'ధనుస్సు (Dhanu)', hi: 'धनु (Sagittarius)', gu: 'ધનુ (Sagittarius)' },
  'makara (capricorn)': { en: 'Makara (Capricorn)', te: 'మకరం (మకర రాశి)', hi: 'मकर राशि (मकर)', gu: 'મકર (મકર રાશિ)' },
  'kumbha (aquarius)': { en: 'Kumbha (Aquarius)', te: 'కుంభం (Kumbha)', hi: 'कुंभ (Aquarius)', gu: 'કુંભ (Aquarius)' },
  'meena (pisces)': { en: 'Meena (Pisces)', te: 'మీనం (Meena)', hi: 'मीन (Pisces)', gu: 'મીન (Pisces)' },

  // Gothrams
  bharadwaja: { en: 'Bharadwaja', te: 'భరద్వాజ', hi: 'भारद्वाज', gu: 'ભારદ્વાજ' },
  kashyapa: { en: 'Kashyapa', te: 'కశ్యప', hi: 'कश्यप', gu: 'కશ્યપ' },
  vashishta: { en: 'Vashishta', te: 'వశిష్ట', hi: 'वशिष्ठ', gu: 'વસિષ્ઠ' },
  gautama: { en: 'Gautama', te: 'గౌతమ', hi: 'गौतम', gu: 'ગૌતમ' },
  vishwamitra: { en: 'Vishwamitra', te: 'విశ్వామిత్ర', hi: 'विश्वामित्र', gu: 'વિશ્વામિત્ર' },
  jamadagni: { en: 'Jamadagni', te: 'జమదగ్ని', hi: 'जमदग्नि', gu: 'જમદગ્નિ' },
  atri: { en: 'Atri', te: 'అత్రి', hi: 'अत्रि', gu: 'અત્રિ' },
  agastya: { en: 'Agastya', te: 'అగస్త్య', hi: 'अगस्त्य', gu: 'અગસ્ત્ય' },
  angirasa: { en: 'Angirasa', te: 'ఆంగీరస', hi: 'अंगिरस', gu: 'અંગિરસ' },
  haritasa: { en: 'Haritasa', te: 'హరితస', hi: 'हारितस', gu: 'હારિતસ' },
  srivatsa: { en: 'Srivatsa', te: 'శ్రీవత్స', hi: 'श्रीवत्स', gu: 'શ્રીવત્સ' },
  kaushika: { en: 'Kaushika', te: 'కౌశిక', hi: 'कौशिक', gu: 'કૌશિક' },
  shandilya: { en: 'Shandilya', te: 'శాండిల్య', hi: 'શાંડિલ્ય', gu: 'શાંડિલ્ય' },
  midhunukula: { en: 'Midhunukula', te: 'మిథునకులా', hi: 'मिथुनुकुला', gu: 'મિથુનુકુલા' },

  // Names / Default Text
  'raghavan iyer': { en: 'Raghavan Iyer', te: 'రాఘవన్ అయ్యర్', hi: 'राघवन अय्यर', gu: 'રાઘવન અય્યર' },
  'bangalore, karnataka': { en: 'Bangalore, Karnataka', te: 'బెంగళూరు, కర్ణాటక', hi: 'बेंगलुरु, कर्नाटक', gu: 'બેંગલુરુ, કર્ણાટક' },
  'jan 15, 1990': { en: 'Jan 15, 1990', te: 'జనవరి 15, 1990', hi: '15 जनवरी 1990', gu: '15 જાન્યુઆરી 1990' },
  '15 january 1990': { en: 'Jan 15, 1990', te: 'జనవరి 15, 1990', hi: '15 जनवरी 1990', gu: '15 જાન્યુઆરી 1990' }
};

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  nakshatra: string;
  rashi: string;
  dateOfBirth: string;
  gothram: string;
}

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingDeities, setIsEditingDeities] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  const [selectedDeities, setSelectedDeities] = useState<string[]>(['shiva', 'lakshmi']);
  const [tempSelectedDeities, setTempSelectedDeities] = useState<string[]>(['shiva', 'lakshmi']);
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    const userSession = safeStorage.getItem('doshanivarana_logged_in_user');
    const mobile = userSession ? JSON.parse(userSession).mobile : '+91 98765 43216';
    
    const bookingsData = safeStorage.getItem('doshanivarana_bookings');
    const bookings = bookingsData ? JSON.parse(bookingsData) : [];
    
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
    const userBooking = bookings.find((b: any) => b.mobile && b.mobile.replace(/[^0-9]/g, '').slice(-10) === cleanMobile);
    
    if (userBooking) {
      return {
        name: userBooking.devoteeName,
        email: userBooking.email || 'devotee@doshanivarana.in',
        phone: userBooking.mobile,
        location: userBooking.deliveryAddress && userBooking.deliveryAddress !== 'N/A' ? userBooking.deliveryAddress : 'Bangalore, Karnataka',
        nakshatra: userBooking.nakshatra || 'Shravana',
        rashi: 'Makara (Capricorn)',
        dateOfBirth: 'Jan 15, 1990',
        gothram: userBooking.gotra || 'Bharadwaja',
      };
    }
    
    return {
      name: mobile.includes('9876543216') || mobile.includes('98765 43216') ? 'Suresh Raina' : 'Raghavan Iyer',
      email: 'suresh.raina@example.com',
      phone: mobile,
      location: 'Delhi, India',
      nakshatra: 'Swati',
      rashi: 'Thula (Libra)',
      dateOfBirth: 'Nov 27, 1986',
      gothram: 'Bharadwaja',
    };
  });

  const [stats, setStats] = useState({
    totalPoojas: 12,
    upcoming: 3,
    devotionScore: 5.0,
  });

  const getProfileValue = (key: keyof UserProfile, val: string) => {
    if (!val) return '';
    const cleanVal = val.trim().toLowerCase();
    if (termTranslations[cleanVal]) {
      return termTranslations[cleanVal][language] || val;
    }
    return val;
  };

  useEffect(() => {
    const fetchProfile = () => {
      const userSession = safeStorage.getItem('doshanivarana_logged_in_user');
      const mobile = userSession ? JSON.parse(userSession).mobile : '+91 98765 43216'; // default Suresh Raina for demo
      
      const bookingsData = safeStorage.getItem('doshanivarana_bookings');
      const bookings = bookingsData ? JSON.parse(bookingsData) : [];
      
      const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
      const userBooking = bookings.find((b: any) => b.mobile && b.mobile.replace(/[^0-9]/g, '').slice(-10) === cleanMobile);
      const userBookings = bookings.filter((b: any) => b.mobile && b.mobile.replace(/[^0-9]/g, '').slice(-10) === cleanMobile);
      
      const upcomingCount = userBookings.filter((b: any) => b.streamStatus !== 'Ended' && b.tab !== 'completed').length;
      setStats({
        totalPoojas: userBookings.length,
        upcoming: upcomingCount,
        devotionScore: userBookings.length > 0 ? 5.0 : 0.0,
      });

      if (userBooking) {
        setProfile({
          name: userBooking.devoteeName,
          email: userBooking.email || 'devotee@doshanivarana.in',
          phone: userBooking.mobile,
          location: userBooking.deliveryAddress && userBooking.deliveryAddress !== 'N/A' ? userBooking.deliveryAddress : 'Bangalore, Karnataka',
          nakshatra: userBooking.nakshatra || 'Shravana',
          rashi: 'Makara (Capricorn)',
          dateOfBirth: 'Jan 15, 1990',
          gothram: userBooking.gotra || 'Bharadwaja',
        });
      } else {
        setProfile({
          name: mobile.includes('9876543216') || mobile.includes('98765 43216') ? 'Suresh Raina' : 'Raghavan Iyer',
          email: 'suresh.raina@example.com',
          phone: mobile,
          location: 'Delhi, India',
          nakshatra: 'Swati',
          rashi: 'Thula (Libra)',
          dateOfBirth: 'Nov 27, 1986',
          gothram: 'Bharadwaja',
        });
      }
    };

    fetchProfile();
    
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('storage', fetchProfile);
      window.addEventListener('focus', fetchProfile);
      window.addEventListener('doshanivarana_bookings_updated', fetchProfile);
    }

    return () => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('storage', fetchProfile);
        window.removeEventListener('focus', fetchProfile);
        window.removeEventListener('doshanivarana_bookings_updated', fetchProfile);
      }
    };
  }, []);

  const [notifications, setNotifications] = useState({
    poojaReminders: true,
    liveStreams: true,
    prasadUpdates: true,
    festivalAlerts: true,
  });

  const handleSignOut = () => {
    // Clear state or simple navigate back to welcome/login
    safeStorage.removeItem('doshanivarana_logged_in_user');
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
      window.dispatchEvent(new Event('doshanivarana_bookings_updated'));
    }
    router.replace('/welcome');
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View 
          className="bg-card/40 border-b border-border/40 pb-6 px-6"
          style={{ paddingTop: insets.top > 0 ? insets.top + 8 : 16 }}
        >
          <View className="flex-row items-center gap-4 mb-6">
            <View className="relative">
              <View className="w-20 h-20 rounded-full bg-primary/5 border border-primary items-center justify-center">
                <User size={40} color="#F97316" />
              </View>
              <Pressable 
                onPress={() => setIsEditingProfile(true)}
                className="absolute -bottom-0 -right-0 w-8 h-8 bg-primary rounded-full items-center justify-center active:bg-[#E05C10]"
              >
                <Edit2 size={14} color="#1A0A00" />
              </Pressable>
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: 'System' }}>
                {getProfileValue('name', profile.name)}
              </Text>
              <Text className="text-sm text-muted-foreground mb-1" style={{ fontFamily: 'System' }}>
                {profile.email}
              </Text>
              <View className="flex-row items-center gap-1">
                <MapPin size={12} color="#78716C" />
                <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
                  {getProfileValue('location', profile.location)}
                </Text>
              </View>
            </View>
          </View>

          {/* Profile Stats */}
          <View className="flex-row justify-between gap-3">
            <StatCard icon={<Star size={20} color="#F97316" />} value={stats.totalPoojas.toString()} label={t('profile.totalPoojas')} />
            <StatCard icon={<Calendar size={20} color="#F97316" />} value={stats.upcoming.toString()} label={t('profile.upcomingCount')} />
            <StatCard icon={<Sparkles size={20} color="#F97316" />} value={stats.devotionScore.toFixed(1)} label={t('profile.devotionScore')} />
          </View>
        </View>

        <View className="px-6 py-6 space-y-6">
          {/* Personalization Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3 px-2">
              <Text className="text-lg font-semibold text-foreground" style={{ fontFamily: 'System' }}>
                {t('profile.personalisation')}
              </Text>
              <Pressable
                onPress={() => setIsEditingPersonal(true)}
                className="flex-row items-center gap-1"
              >
                <Edit2 size={14} color="#F97316" />
                <Text className="text-primary text-sm font-medium">{t('common.edit')}</Text>
              </Pressable>
            </View>
            <View className="bg-card border border-border rounded-2xl overflow-hidden">
              <ProfileItem
                icon={<Star size={20} color="#78716C" />}
                label={t('profile.nakshatra')}
                value={getProfileValue('nakshatra', profile.nakshatra)}
              />
              <ProfileItem
                icon={<Star size={20} color="#78716C" />}
                label={t('profile.rashi')}
                value={getProfileValue('rashi', profile.rashi)}
              />
              <ProfileItem
                icon={<Calendar size={20} color="#78716C" />}
                label={t('profile.dateOfBirth')}
                value={getProfileValue('dateOfBirth', profile.dateOfBirth)}
              />
              <ProfileItem
                icon={<User size={20} color="#78716C" />}
                label={t('profile.gothram')}
                value={getProfileValue('gothram', profile.gothram)}
              />
            </View>
          </View>

          {/* Deity Preferences Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3 px-2">
              <Text className="text-lg font-semibold text-foreground" style={{ fontFamily: 'System' }}>
                {t('profile.ishtaDevatas')}
              </Text>
              <Pressable
                onPress={() => {
                  setTempSelectedDeities(selectedDeities);
                  setIsEditingDeities(true);
                }}
                className="flex-row items-center gap-1"
              >
                <Edit2 size={14} color="#F97316" />
                <Text className="text-primary text-sm font-medium">{t('common.edit')}</Text>
              </Pressable>
            </View>
            <View className="bg-card border border-border rounded-2xl p-4 flex-row flex-wrap gap-2">
              {selectedDeities.length === 0 ? (
                <Text className="text-sm text-muted-foreground italic px-1">{t('profile.noDeities')}</Text>
              ) : (
                selectedDeities.map((id) => {
                  const deity = deitiesList.find((d) => d.id === id);
                  return deity ? (
                    <View key={id} className="flex-row items-center gap-1 bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-full">
                      <Text className="text-base">{deity.emoji}</Text>
                      <Text className="text-xs text-primary font-medium">{t('deity.' + deity.id)}</Text>
                    </View>
                  ) : null;
                })
              )}
            </View>
          </View>

          {/* Recommendations */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3 px-2 text-foreground" style={{ fontFamily: 'System' }}>
              {t('profile.aiRecommendations')}
            </Text>
            <Link href="/(tabs)/poojas" asChild>
              <Pressable className="bg-card border border-border rounded-2xl p-4 active:border-primary/50">
                <View className="flex-row items-start gap-3 mb-4">
                  <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                    <Sparkles size={20} color="#F97316" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground mb-1" style={{ fontFamily: 'System' }}>
                      {t('profile.recommendationsTitle')} ({getProfileValue('nakshatra', profile.nakshatra)})
                    </Text>
                    <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
                      {t('profile.recommendationsDesc')}
                    </Text>
                  </View>
                </View>
                <View className="w-full py-2.5 rounded-xl bg-primary/10 items-center justify-center">
                  <Text className="text-primary font-medium text-sm">{t('profile.viewRecommendations')}</Text>
                </View>
              </Pressable>
            </Link>
          </View>

          {/* Settings Section */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3 px-2 text-foreground" style={{ fontFamily: 'System' }}>
              {t('profile.settings')}
            </Text>
            <View className="bg-card border border-border rounded-2xl overflow-hidden">


              <SettingsItem 
                icon={<Bell size={20} color="#78716C" />} 
                label={t('profile.notifications')} 
                onClick={() => setShowNotifications(true)}
              />
              <SettingsItem 
                icon={<Calendar size={20} color="#78716C" />} 
                label={t('profile.hinduCalendar')} 
                onClick={() => router.push('/calendar')}
              />
              <SettingsItem 
                icon={<HelpCircle size={20} color="#78716C" />} 
                label={t('profile.helpSupport')} 
                onClick={() => setShowHelp(true)}
              />
              <SettingsItem
                icon={<Languages size={20} color="#78716C" />}
                label={`${t('language.label')} (${language.toUpperCase()})`}
                onClick={() => setShowLanguageModal(true)}
              />
            </View>
          </View>

          {/* Logout */}
          <Pressable 
            onPress={handleSignOut}
            className="w-full py-3 rounded-xl border-2 border-destructive items-center justify-center flex-row gap-2 active:bg-destructive/5"
          >
            <LogOut size={20} color="#EF4444" />
            <Text className="text-destructive font-medium" style={{ fontFamily: 'System' }}>{t('profile.signOut')}</Text>
          </Pressable>

          {/* Version */}
          <Text className="text-center text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
            DOSHANIVARANA v1.0.0 • {t('profile.version')} 🙏
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditingProfile} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between pb-4 border-b border-border mb-4">
              <Text className="text-xl font-bold text-foreground">{t('profile.editProfile')}</Text>
              <Pressable onPress={() => setIsEditingProfile(false)} className="p-2">
                <X size={24} color="#F5F5F0" />
              </Pressable>
            </View>
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium mb-2 text-foreground">{t('profile.fullName')}</Text>
                <TextInput
                  value={getProfileValue('name', profile.name)}
                  onChangeText={(text) => setProfile({ ...profile, name: text })}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                />
              </View>
              <View className="mt-3">
                <Text className="text-sm font-medium mb-2 text-foreground">{t('profile.email')}</Text>
                <TextInput
                  value={profile.email}
                  onChangeText={(text) => setProfile({ ...profile, email: text })}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                  keyboardType="email-address"
                />
              </View>
              <View className="mt-3">
                <Text className="text-sm font-medium mb-2 text-foreground">{t('profile.location')}</Text>
                <TextInput
                  value={getProfileValue('location', profile.location)}
                  onChangeText={(text) => setProfile({ ...profile, location: text })}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                />
              </View>
              <Pressable
                onPress={() => setIsEditingProfile(false)}
                className="w-full py-4 bg-primary rounded-xl items-center justify-center mt-6"
              >
                <Text className="text-[#1A0A00] font-semibold">{t('profile.saveChanges')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Personal Info Modal */}
      <Modal visible={isEditingPersonal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between pb-4 border-b border-border mb-4">
              <Text className="text-xl font-bold text-foreground">{t('profile.editPersonalInfo')}</Text>
              <Pressable onPress={() => setIsEditingPersonal(false)} className="p-2">
                <X size={24} color="#F5F5F0" />
              </Pressable>
            </View>
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium mb-2 text-foreground">{t('profile.nakshatra')}</Text>
                <TextInput
                  value={getProfileValue('nakshatra', profile.nakshatra)}
                  onChangeText={(text) => setProfile({ ...profile, nakshatra: text })}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                />
              </View>
              <View className="mt-3">
                <Text className="text-sm font-medium mb-2 text-foreground">{t('profile.gothram')}</Text>
                <TextInput
                  value={getProfileValue('gothram', profile.gothram)}
                  onChangeText={(text) => setProfile({ ...profile, gothram: text })}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                />
              </View>
              <View className="mt-3">
                <Text className="text-sm font-medium mb-2 text-foreground">{t('profile.dateOfBirth')}</Text>
                <TextInput
                  value={getProfileValue('dateOfBirth', profile.dateOfBirth)}
                  onChangeText={(text) => setProfile({ ...profile, dateOfBirth: text })}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                />
              </View>
              <Pressable
                onPress={() => setIsEditingPersonal(false)}
                className="w-full py-4 bg-primary rounded-xl items-center justify-center mt-6"
              >
                <Text className="text-[#1A0A00] font-semibold">{t('profile.saveChanges')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={showNotifications} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between pb-4 border-b border-border mb-4">
              <Text className="text-xl font-bold text-foreground">{t('notifications.title')}</Text>
              <Pressable onPress={() => setShowNotifications(false)} className="p-2">
                <X size={24} color="#F5F5F0" />
              </Pressable>
            </View>
            <View className="space-y-4">
              <NotificationToggleItem
                label={t('notifications.poojaReminders')}
                value={notifications.poojaReminders}
                onValueChange={(val) => setNotifications({ ...notifications, poojaReminders: val })}
              />
              <NotificationToggleItem
                label={t('notifications.liveStreams')}
                value={notifications.liveStreams}
                onValueChange={(val) => setNotifications({ ...notifications, liveStreams: val })}
              />
              <NotificationToggleItem
                label={t('notifications.prasadUpdates')}
                value={notifications.prasadUpdates}
                onValueChange={(val) => setNotifications({ ...notifications, prasadUpdates: val })}
              />
              <NotificationToggleItem
                label={t('notifications.festivalAlerts')}
                value={notifications.festivalAlerts}
                onValueChange={(val) => setNotifications({ ...notifications, festivalAlerts: val })}
              />
              <Pressable
                onPress={() => setShowNotifications(false)}
                className="w-full py-4 bg-primary rounded-xl items-center justify-center mt-6"
              >
                <Text className="text-[#1A0A00] font-semibold">{t('notifications.saveSettings')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6 h-[70%]">
            <View className="flex-row items-center justify-between pb-4 border-b border-border mb-4">
              <Text className="text-xl font-bold text-foreground">{t('calendar.title')}</Text>
              <Pressable onPress={() => setShowCalendar(false)} className="p-2">
                <X size={24} color="#F5F5F0" />
              </Pressable>
            </View>
            <ScrollView>
              <View className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
                <Text className="text-sm font-medium text-primary mb-1">{t('calendar.todayTithi')}</Text>
                <Text className="text-lg font-bold text-foreground">{t('calendar.shuklaPakshaChaturthi')}</Text>
              </View>
              <Text className="font-semibold mb-3 text-foreground">{t('calendar.upcomingFestivals')}</Text>
              <CalendarEventItem date="Mar 21, 2026" event={t('festival.ugadi')} description={t('festival.ugadiDesc')} />
              <CalendarEventItem date="Mar 25, 2026" event={t('festival.ramNavami')} description={t('festival.ramNavamiDesc')} />
              <CalendarEventItem date="Apr 14, 2026" event={t('festival.vishu')} description={t('festival.vishuDesc')} />
              <CalendarEventItem date="Apr 17, 2026" event={t('festival.hanumanJayanti')} description={t('festival.hanumanJayantiDesc')} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Help Modal */}
      <Modal visible={showHelp} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6 h-[70%]">
            <View className="flex-row items-center justify-between pb-4 border-b border-border mb-4">
              <Text className="text-xl font-bold text-foreground">{t('help.title')}</Text>
              <Pressable onPress={() => setShowHelp(false)} className="p-2">
                <X size={24} color="#F5F5F0" />
              </Pressable>
            </View>
            <ScrollView>
              <View className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
                <Text className="font-semibold mb-2 text-foreground">{t('help.contactSupport')}</Text>
                <View className="flex-row items-center gap-2 mb-2">
                  <Mail size={16} color="#F97316" />
                  <Text className="text-foreground">support@doshanivarana.in</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Phone size={16} color="#F97316" />
                  <Text className="text-foreground">+91 80 1234 5678</Text>
                </View>
              </View>
              <Text className="font-semibold mb-3 text-foreground">{t('help.faq')}</Text>
              <FAQItem q={t('help.faq1Q')} a={t('help.faq1A')} />
              <FAQItem q={t('help.faq2Q')} a={t('help.faq2A')} />
              <FAQItem q={t('help.faq3Q')} a={t('help.faq3A')} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Deities Modal */}
      <Modal visible={isEditingDeities} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="absolute inset-0" onPress={() => setIsEditingDeities(false)} />
          <View className="bg-background rounded-t-3xl p-6 h-[65%] border-t border-border">
            <View className="flex-row items-center justify-between pb-4 border-b border-border mb-4">
              <Text className="text-xl font-bold text-foreground">{t('profile.selectIshtaDevatas')}</Text>
              <Pressable onPress={() => setIsEditingDeities(false)} className="p-2">
                <X size={24} color="#F5F5F0" />
              </Pressable>
            </View>
            <ScrollView className="mb-4">
              <View className="flex-row flex-wrap justify-between pb-4">
                {deitiesList.map((deity) => {
                  const isSelected = tempSelectedDeities.includes(deity.id);
                  return (
                    <Pressable
                      key={deity.id}
                      onPress={() => {
                        if (isSelected) {
                          setTempSelectedDeities(tempSelectedDeities.filter(id => id !== deity.id));
                        } else {
                          setTempSelectedDeities([...tempSelectedDeities, deity.id]);
                        }
                      }}
                      className={`w-[48%] rounded-2xl p-4 mb-4 flex-col items-center justify-center border ${
                        isSelected
                          ? 'bg-primary/5 border-2 border-primary'
                          : 'bg-card border border-border'
                      }`}
                      style={{ aspectRatio: 1.2 }}
                    >
                      {/* Checkmark */}
                      {isSelected && (
                        <View className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check size={12} color="#1A0A00" />
                        </View>
                      )}
                      <Text className="text-3xl mb-2">{deity.emoji}</Text>
                      <Text className="text-sm font-semibold text-foreground">{t('deity.' + deity.id)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <Pressable
              onPress={() => {
                setSelectedDeities(tempSelectedDeities);
                setIsEditingDeities(false);
              }}
              className="w-full py-4 bg-primary rounded-xl items-center justify-center active:bg-[#E05C10]"
            >
              <Text className="text-[#1A0A00] font-semibold text-base">{t('profile.savePreferences')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Language Selector Modal */}
      <Modal visible={showLanguageModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable className="absolute inset-0" onPress={() => setShowLanguageModal(false)} />
          <View className="bg-card rounded-t-3xl p-6 border-t border-border">
            <View className="flex-row items-center justify-between border-b border-border pb-4 mb-4">
              <Text className="font-semibold text-lg text-foreground">Select Language / భాష / भाषा</Text>
              <Pressable onPress={() => setShowLanguageModal(false)} className="p-1">
                <X size={24} color="#F5F5F0" />
              </Pressable>
            </View>
            <View className="space-y-3">
              {[
                { code: 'en', name: 'English', nativeName: 'English' },
                { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
                { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
                { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
              ].map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => {
                      setLanguage(lang.code as any);
                      setShowLanguageModal(false);
                    }}
                    className={`flex-row items-center justify-between p-4 rounded-xl border ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-transparent'
                    }`}
                  >
                    <View>
                      <Text className={`font-semibold text-base ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {lang.nativeName}
                      </Text>
                      <Text className="text-xs text-muted-foreground">{lang.name}</Text>
                    </View>
                    {isSelected && (
                      <Check size={18} color="#F97316" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View className="flex-grow bg-card border border-border rounded-xl p-4 items-center justify-center w-[30%]">
      <View className="mb-2">{icon}</View>
      <Text className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: 'System' }}>
        {value}
      </Text>
      <Text className="text-[10px] text-muted-foreground" style={{ fontFamily: 'System' }}>
        {label}
      </Text>
    </View>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-4 p-4 border-b border-border last:border-b-0">
      <View>{icon}</View>
      <View className="flex-1">
        <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
          {label}
        </Text>
        <Text className="font-medium text-foreground" style={{ fontFamily: 'System' }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function SettingsItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Pressable 
      onPress={onClick}
      className="flex-row items-center gap-4 p-4 border-b border-border last:border-b-0 active:bg-muted/30"
    >
      <View>{icon}</View>
      <Text className="flex-1 font-medium text-foreground text-sm" style={{ fontFamily: 'System' }}>
        {label}
      </Text>
      <ChevronRight size={20} color="#78716C" />
    </Pressable>
  );
}

function NotificationToggleItem({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (val: boolean) => void }) {
  return (
    <View className="flex-row items-center justify-between p-4 bg-card border border-border rounded-xl mb-3">
      <Text className="font-medium text-foreground" style={{ fontFamily: 'System' }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#F97316' }}
      />
    </View>
  );
}

function CalendarEventItem({ date, event, description }: { date: string; event: string; description: string }) {
  return (
    <View className="bg-card border border-border rounded-xl p-4 mb-3">
      <Text className="font-bold text-foreground text-base mb-1">{event}</Text>
      <Text className="text-sm text-muted-foreground mb-1">{description}</Text>
      <Text className="text-xs text-primary font-semibold">{date}</Text>
    </View>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <View className="bg-card border border-border rounded-xl p-4 mb-3">
      <Text className="font-semibold text-foreground mb-1">{q}</Text>
      <Text className="text-sm text-muted-foreground">{a}</Text>
    </View>
  );
}
