// @ts-nocheck
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Check, ArrowLeft, Search, X, ChevronDown, User, Sparkles } from 'lucide-react-native';
import { View, Text, Pressable, ScrollView, TextInput, Modal, Image } from 'react-native';
import { useLanguage } from '../src/old_app/context/LanguageContext';
import { useTheme } from '../src/old_app/context/ThemeContext';
import { safeStorage } from '../src/old_app/lib/storage';

const deities = [
  { id: 'ganesha', image: require('../assets/deities/ganesha.png') },
  { id: 'lakshmi', image: require('../assets/deities/lakshmi.png') },
  { id: 'shiva', image: require('../assets/deities/shiva.png') },
  { id: 'vishnu', image: require('../assets/deities/vishnu.png') },
  { id: 'durga', image: require('../assets/deities/durga.png') },
  { id: 'saraswati', image: require('../assets/deities/saraswati.png') },
  { id: 'hanuman', image: require('../assets/deities/hanuman.png') },
  { id: 'murugan', image: require('../assets/deities/murugan.png') },
];

const languagesList = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'or', name: 'Odia', native: 'ଓડ଼િઆ' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬી' },
  { code: 'as', name: 'Assamese', native: 'অસમીયા' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली' },
];

const nakshatrasList = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const rashisList = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)',
  'Tula (Libra)', 'Vrishchika (Scorpio)', 'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
];

const termTranslations: Record<string, Record<string, string>> = {
  // Nakshatras
  ashwini: { en: 'Ashwini', te: 'అశ్విని', hi: 'अश्विनी', gu: 'અશ્વિની' },
  bharani: { en: 'Bharani', te: 'భరణి', hi: 'भरणी', gu: 'ભરણી' },
  krittika: { en: 'Krittika', te: 'కృత్తిక', hi: 'कृत्तिका', gu: 'કૃતિકા' },
  rohini: { en: 'Rohini', te: 'రోహిణి', hi: 'రోహిణి', gu: 'రోહિણી' },
  mrigashira: { en: 'Mrigashira', te: 'మృగశిర', hi: 'मृगशिरा', gu: 'મૃગશીર્ષ' },
  ardra: { en: 'Ardra', te: 'ఆర్ద్ర', hi: 'आर्द्रा', gu: 'આદ્રા' },
  punarvasu: { en: 'Punarvasu', te: 'పునర్వసు', hi: 'पुनर्वसु', gu: 'પુનર્వసు' },
  pushya: { en: 'Pushya', te: 'పుష్యమి', hi: 'पुष्य', gu: 'પુષ્ય' },
  ashlesha: { en: 'Ashlesha', te: 'ఆశ్లేష', hi: 'శ్లేषा', gu: 'ఆશ્લેષા' },
  magha: { en: 'Magha', te: 'మఖ', hi: 'मघा', gu: 'મઘా' },
  'purva phalguni': { en: 'Purva Phalguni', te: 'పూర్వ ఫల్గుణి', hi: 'पूर्वाफाल्गुनी', gu: 'પૂર્વા ఫાલ્ગુની' },
  'uttara phalguni': { en: 'Uttara Phalguni', te: 'ఉత్తర ఫల్గుణి', hi: 'उत्तराफाल्गुनी', gu: 'ఉత్తరా ఫాલ્గుની' },
  hasta: { en: 'Hasta', te: 'హస్త', hi: 'हस्त', gu: 'હસ્ત' },
  chitra: { en: 'Chitra', te: 'చిత్ర', hi: 'चित્રા', gu: 'ચિત્રા' },
  swati: { en: 'Swati', te: 'స్వాతి', hi: 'स्वाति', gu: 'સ્વાતિ' },
  vishakha: { en: 'Vishakha', te: 'విశాఖ', hi: 'विशाखा', gu: 'విశాખા' },
  anuradha: { en: 'Anuradha', te: 'అనూరాధ', hi: 'अनुराधा', gu: 'અનુરાધા' },
  jyeshtha: { en: 'Jyeshtha', te: 'జ్యేష్ఠ', hi: 'ज्येष्ठा', gu: 'જ્યેષ્ઠా' },
  moola: { en: 'Moola', te: 'మూల', hi: 'मूल', gu: 'મૂળ' },
  mula: { en: 'Mula', te: 'మూల', hi: 'मूल', gu: 'મૂળ' },
  'purva ashadha': { en: 'Purva Ashadha', te: 'పూర్వాషాఢ', hi: 'पूर्वाषाढ़ा', gu: 'પૂર્వాષાઢા' },
  'uttara ashadha': { en: 'Uttara Ashadha', te: 'ఉత్తరాషాఢ', hi: 'उत्तराषाढ़ा', gu: 'ఉత్తరాషాఢా' },
  shravana: { en: 'Shravana', te: 'శ్రవణం', hi: 'श्रवण', gu: 'શ્રવણ' },
  dhanishta: { en: 'Dhanishta', te: 'ధనిష్ఠ', hi: 'धनिष्ठा', gu: 'ધનિષ્ઠా' },
  shatabhisha: { en: 'Shatabhisha', te: 'శతభిషం', hi: 'शतभिषा', gu: 'શતભિષા' },
  'purva bhadrapada': { en: 'Purva Bhadrapada', te: 'పూర్వాభాద్ర', hi: 'पूर्वाभाद्रपद', gu: 'પૂર્વાભાદ્રપદ' },
  'uttara bhadrapada': { en: 'Uttara Bhadrapada', te: 'ఉత్తరాభాద్ర', hi: 'उत्तराभाद्रपद', gu: 'ఉત્તరాભાદ્રપદ' },
  revati: { en: 'Revati', te: 'రేవతి', hi: 'रेवती', gu: 'રેવતી' },

  // Rashis
  'mesha (aries)': { en: 'Mesha (Aries)', te: 'మేషం (Mesha)', hi: 'मेष (Aries)', gu: 'મેષ (Aries)' },
  'vrishabha (taurus)': { en: 'Vrishabha (Taurus)', te: 'వృషభం (Vrishabha)', hi: 'वृषभ (Taurus)', gu: 'વૃષભ (Taurus)' },
  'mithuna (gemini)': { en: 'Mithuna (Gemini)', te: 'మిథునం (Mithuna)', hi: 'मिथुन (Gemini)', gu: 'મિથుન (Gemini)' },
  'karka (cancer)': { en: 'Karka (Cancer)', te: 'కర్కాటకం (Karka)', hi: 'कर्क (Cancer)', gu: 'કર્ક (Cancer)' },
  'simha (leo)': { en: 'Simha (Leo)', te: 'సింహం (Simha)', hi: 'सिंह (Leo)', gu: 'સિંહ (Leo)' },
  'kanya (virgo)': { en: 'Kanya (Virgo)', te: 'కన్యా (Kanya)', hi: 'कन्या (Virgo)', gu: 'કન્યા (Virgo)' },
  'tula (libra)': { en: 'Tula (Libra)', te: 'తులా (Tula)', hi: 'तुला (Libra)', gu: 'તુલા (Libra)' },
  'vrishchika (scorpio)': { en: 'Vrishchika (Scorpio)', te: 'వృశ్చికం (Vrishchika)', hi: 'वृश्चिक (Scorpio)', gu: 'વૃશ્ચિક (Scorpio)' },
  'dhanu (sagittarius)': { en: 'Dhanu (Sagittarius)', te: 'ధనుస్సు (Dhanu)', hi: 'धनु (Sagittarius)', gu: 'ધનુ (Sagittarius)' },
  'makara (capricorn)': { en: 'Makara (Capricorn)', te: 'మకరం (మకర రాశి)', hi: 'मकर राशि (मकर)', gu: 'મકર (મકર राशि)' },
  'kumbha (aquarius)': { en: 'Kumbha (Aquarius)', te: 'కుంభం (Kumbha)', hi: 'कुंभ (Aquarius)', gu: 'કુંભ (Aquarius)' },
  'meena (pisces)': { en: 'Meena (Pisces)', te: 'మీనం (Meena)', hi: 'मीन (Pisces)', gu: 'મીન (Pisces)' }
};

const getTranslation = (val: string, lang: string): string => {
  if (!val) return '';
  const cleanVal = val.trim().toLowerCase();
  if (termTranslations[cleanVal]) {
    return termTranslations[cleanVal][lang] || val;
  }
  return val;
};

export default function ProfileSetup() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { theme } = useTheme();

  // Multi-step Wizard States
  const [step, setStep] = useState(1); // 1: Personal & Mother Tongue, 2: Deities, 3: Astrology

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [motherTongue, setMotherTongue] = useState('en');
  const [selectedDeities, setSelectedDeities] = useState<string[]>(['lakshmi', 'shiva']);
  const [gothram, setGothram] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [rashi, setRashi] = useState('');

  // Dropdown Modal States
  const [showNakshatraModal, setShowNakshatraModal] = useState(false);
  const [showRashiModal, setShowRashiModal] = useState(false);
  const [nakshatraSearch, setNakshatraSearch] = useState('');

  const toggleDeity = (id: string) => {
    setSelectedDeities((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSelectLanguage = (code: string) => {
    setMotherTongue(code);
    // If it's one of our 4 supported translation UI languages, apply it
    if (['en', 'te', 'hi', 'gu'].includes(code)) {
      setLanguage(code as any);
    } else {
      // Fallback UI language to English for unsupported regional languages
      setLanguage('en');
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    const userProfile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName} ${lastName}`.trim() || 'Devotee',
      appUiLanguage: language,
      communicationLanguage: motherTongue,
      ishtaDevatas: selectedDeities,
      gothram: gothram.trim(),
      nakshatra: nakshatra,
      rashi: rashi,
      email: 'devotee@doshanivarana.in', // Default placeholder
      phone: '+91 98765 43216', // Fallback or retrieve from active session
      location: 'Bangalore, India',
      dateOfBirth: 'Jan 15, 1990',
    };

    // Retrieve active session to preserve verified mobile number
    const userSession = safeStorage.getItem('doshanivarana_logged_in_user');
    if (userSession) {
      try {
        const sessionObj = JSON.parse(userSession);
        userProfile.phone = sessionObj.mobile || userProfile.phone;
      } catch (e) {}
    }

    // Persist full profile
    safeStorage.setItem('doshanivarana_user_profile', JSON.stringify(userProfile));

    // Update logged in user session summary
    safeStorage.setItem(
      'doshanivarana_logged_in_user',
      JSON.stringify({ mobile: userProfile.phone, name: userProfile.name, id: 'anonymous_user' })
    );

    // Notify listeners
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
      window.dispatchEvent(new Event('doshanivarana_bookings_updated'));
    }

    router.replace('/(tabs)');
  };

  const isStepValid = () => {
    if (step === 1) {
      return firstName.trim() !== '' && lastName.trim() !== '' && motherTongue !== '';
    }
    if (step === 2) {
      return selectedDeities.length > 0;
    }
    return true; // Step 3 is optional
  };

  const filteredNakshatras = nakshatrasList.filter(n => {
    const englishMatch = n.toLowerCase().includes(nakshatraSearch.toLowerCase());
    const translated = getTranslation(n, language);
    const translationMatch = translated.toLowerCase().includes(nakshatraSearch.toLowerCase());
    return englishMatch || translationMatch;
  });

  const placeholderColor = theme === 'dark' ? '#A8A29E' : '#78716C';
  const primaryForeground = theme === 'dark' ? '#1A0A00' : '#F5F5F0';

  return (
    <View className="flex-1 bg-background">
      {/* Custom Header with Back Button and Progress */}
      <View className="flex-row items-center justify-between px-6 pt-12 pb-4 bg-background border-b border-border/10">
        <Pressable
          onPress={handleBack}
          disabled={step === 1}
          className={`w-10 h-10 rounded-xl items-center justify-center bg-card border border-primary/20 ${step === 1 ? 'opacity-0' : 'active:bg-muted/50'}`}
        >
          <ArrowLeft size={20} color="#F97316" />
        </Pressable>
        <View className="flex-row items-center gap-1.5">
          <View className={`w-6 h-1.5 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
          <View className={`w-6 h-1.5 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
          <View className={`w-6 h-1.5 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
        </View>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 120 }}>
        {/* STEP 1: PERSONAL DETAILS & MOTHER TONGUE */}
        {step === 1 && (
          <View className="gap-y-6">
            <View>
              <Text className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: 'System' }}>
                {t('setup.personalInfoTitle')}
              </Text>
              <Text className="text-sm text-muted-foreground mb-6" style={{ fontFamily: 'System' }}>
                {t('setup.personalInfoSubtitle')}
              </Text>
            </View>

            {/* First Name & Last Name Inputs */}
            <View className="flex-row justify-between gap-x-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
                  {t('setup.firstNameLabel')}
                </Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={t('setup.firstNamePlaceholder')}
                  placeholderTextColor={placeholderColor}
                  className="px-4 py-3 bg-card border border-border rounded-xl text-foreground text-base focus:border-primary"
                  style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
                  {t('setup.lastNameLabel')}
                </Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={t('setup.lastNamePlaceholder')}
                  placeholderTextColor={placeholderColor}
                  className="px-4 py-3 bg-card border border-border rounded-xl text-foreground text-base focus:border-primary"
                  style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}
                />
              </View>
            </View>

            {/* Mother Tongue Language Selection Grid */}
            <View className="mt-4">
              <Text className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: 'System' }}>
                {t('setup.motherTongueLabel')}
              </Text>
              <Text className="text-xs text-muted-foreground mb-4" style={{ fontFamily: 'System' }}>
                {t('setup.motherTonguePlaceholder')}
              </Text>

              <View className="flex-row flex-wrap justify-between">
                {languagesList.map((lang) => {
                  const isSelected = motherTongue === lang.code;
                  return (
                    <Pressable
                      key={lang.code}
                      onPress={() => handleSelectLanguage(lang.code)}
                      className={`w-[31%] aspect-[1.1] rounded-xl p-2 mb-3 items-center justify-center border-2 ${
                        isSelected
                          ? 'bg-primary/5 border-primary'
                          : 'bg-card border-border'
                      }`}
                    >
                      <Text className={`font-bold text-base ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {lang.native}
                      </Text>
                      <Text className="text-[10px] text-muted-foreground mt-1">
                        {lang.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* STEP 2: DEITY PREFERENCES */}
        {step === 2 && (
          <View className="gap-y-6">
            <View>
              <Text className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: 'System' }}>
                {t('setup.deityTitle')}
              </Text>
              <Text className="text-sm text-muted-foreground mb-6" style={{ fontFamily: 'System' }}>
                {t('setup.deitySubtitle')}
              </Text>
            </View>

            {/* Deity Grid */}
            <View className="flex-row flex-wrap justify-between">
              {deities.map((deity) => {
                const isSelected = selectedDeities.includes(deity.id);
                return (
                  <Pressable
                    key={deity.id}
                    onPress={() => toggleDeity(deity.id)}
                    className={`relative aspect-[1.1] w-[48%] rounded-xl p-4 mb-4 flex-col items-center justify-center border-2 ${
                      isSelected
                        ? 'bg-card border-primary'
                        : 'bg-card border-border'
                    }`}
                  >
                    {/* Checkmark */}
                    {isSelected && (
                      <View className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check size={12} color={primaryForeground} />
                      </View>
                    )}

                    {/* Deity Image */}
                    <Image source={deity.image} className="w-16 h-16 mb-2" style={{ width: 64, height: 64 }} resizeMode="contain" />

                    {/* Deity Name */}
                    <Text
                      className="text-xs font-semibold text-foreground"
                      style={{ fontFamily: 'System' }}
                    >
                      {t('deity.' + deity.id)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 3: ASTROLOGY DETAILS */}
        {step === 3 && (
          <View className="gap-y-6">
            <View>
              <Text className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: 'System' }}>
                {t('setup.astroTitle')}
              </Text>
              <Text className="text-sm text-muted-foreground mb-6" style={{ fontFamily: 'System' }}>
                {t('setup.astroSubtitle')}
              </Text>
            </View>

            {/* Gothram Input */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
                {t('setup.gothramLabel')}
              </Text>
              <TextInput
                value={gothram}
                onChangeText={setGothram}
                placeholder={t('setup.gothramPlaceholder')}
                placeholderTextColor={placeholderColor}
                className="px-4 py-3 bg-card border border-border rounded-xl text-foreground text-base focus:border-primary"
                style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}
              />
            </View>

            {/* Nakshatra Selection Dropdown */}
            <View className="mt-2">
              <Text className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
                {t('setup.nakshatraLabel')}
              </Text>
              <Pressable
                onPress={() => setShowNakshatraModal(true)}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl flex-row items-center justify-between active:bg-muted/30"
              >
                <Text style={{ fontFamily: 'System', color: !nakshatra ? placeholderColor : (theme === 'dark' ? '#F5F5F0' : '#1C1917'), fontSize: 16 }}>
                  {getTranslation(nakshatra, language) || t('setup.nakshatraPlaceholder')}
                </Text>
                <ChevronDown size={18} color={theme === 'dark' ? '#A8A29E' : '#78716C'} />
              </Pressable>
            </View>

            {/* Rashi Selection Dropdown */}
            <View className="mt-2">
              <Text className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
                {t('setup.rashiLabel')}
              </Text>
              <Pressable
                onPress={() => setShowRashiModal(true)}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl flex-row items-center justify-between active:bg-muted/30"
              >
                <Text style={{ fontFamily: 'System', color: !rashi ? placeholderColor : (theme === 'dark' ? '#F5F5F0' : '#1C1917'), fontSize: 16 }}>
                  {getTranslation(rashi, language) || t('setup.rashiPlaceholder')}
                </Text>
                <ChevronDown size={18} color={theme === 'dark' ? '#A8A29E' : '#78716C'} />
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom CTA Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/95 border-t border-border/30 p-4">
        <Pressable
          onPress={handleNext}
          disabled={!isStepValid()}
          className={`w-full py-4 rounded-xl items-center justify-center ${
            isStepValid()
              ? 'bg-primary active:bg-[#E05C10]'
              : 'bg-muted'
          }`}
        >
          <Text
            className={`font-semibold text-base ${
              isStepValid() ? 'text-primary-foreground' : ''
            }`}
            style={{ fontFamily: 'System', color: !isStepValid() ? (theme === 'dark' ? '#A8A29E' : '#78716C') : undefined }}
          >
            {step === 3 ? t('setup.complete') : t('common.continue')}
          </Text>
        </Pressable>

        {step === 3 && (
          <Pressable
            onPress={handleComplete}
            className="w-full py-2 mt-3 items-center justify-center active:opacity-50"
          >
            <Text
              className="text-sm font-medium"
              style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}
            >
              {t('setup.skip')}
            </Text>
          </Pressable>
        )}
      </View>

      {/* NAKSHATRA SELECTION MODAL */}
      <Modal visible={showNakshatraModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl h-[70%] border-t border-border">
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Text className="font-semibold text-lg text-foreground" style={{ fontFamily: 'System' }}>{t('setup.nakshatraPlaceholder')}</Text>
              <Pressable onPress={() => { setShowNakshatraModal(false); setNakshatraSearch(''); }} className="p-2">
                <X size={24} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
              </Pressable>
            </View>

            {/* Search Box */}
            <View className="p-4 flex-row items-center bg-card border-b border-border/40">
              <Search size={18} color="#78716C" className="mr-2" />
              <TextInput
                value={nakshatraSearch}
                onChangeText={setNakshatraSearch}
                placeholder="Search Star..."
                placeholderTextColor={placeholderColor}
                className="flex-1 text-foreground text-base py-1"
                style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917' }}
              />
            </View>

            <ScrollView>
              {filteredNakshatras.map((n) => (
                <Pressable
                  key={n}
                  onPress={() => {
                    setNakshatra(n);
                    setShowNakshatraModal(false);
                    setNakshatraSearch('');
                  }}
                  className="p-4 border-b border-border active:bg-muted/50"
                >
                  <Text className="text-foreground text-base" style={{ fontFamily: 'System' }}>{getTranslation(n, language)}</Text>
                </Pressable>
              ))}
              {filteredNakshatras.length === 0 && (
                <Text className="text-center text-muted-foreground p-8">No Nakshatras found</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* RASHI SELECTION MODAL */}
      <Modal visible={showRashiModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl h-[60%] border-t border-border">
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Text className="font-semibold text-lg text-foreground" style={{ fontFamily: 'System' }}>{t('setup.rashiPlaceholder')}</Text>
              <Pressable onPress={() => setShowRashiModal(false)} className="p-2">
                <X size={24} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
              </Pressable>
            </View>
            <ScrollView>
              {rashisList.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => {
                    setRashi(r);
                    setShowRashiModal(false);
                  }}
                  className="p-4 border-b border-border active:bg-muted/50"
                >
                  <Text className="text-foreground text-base" style={{ fontFamily: 'System' }}>{getTranslation(r, language)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
