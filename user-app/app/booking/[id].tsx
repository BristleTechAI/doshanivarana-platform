import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, User, Star, ChevronRight, X, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { firestore } from '../../src/lib/firebase';
import { createBookingTransaction } from '../../src/lib/bookingService';
import { safeStorage } from '../../src/old_app/lib/storage';

interface BookingFormData {
  selectedSlotId: string;
  devoteeNames: string;
  gothram: string;
  nakshatra: string;
  specialRequests: string;
}

const nakshatraMap: Record<string, Record<string, string>> = {
  'Ashwini': { en: 'Ashwini', te: 'అశ్విని', hi: 'अश्विनी', gu: 'અશ્વિની' },
  'Bharani': { en: 'Bharani', te: 'భరణి', hi: 'भरणी', gu: 'ભરણી' },
  'Krittika': { en: 'Krittika', te: 'కృత్తిక', hi: 'कृत्तिका', gu: 'કૃતિકા' },
  'Rohini': { en: 'Rohini', te: 'రోహిణి', hi: 'रोहिणी', gu: 'રોહિણી' },
  'Mrigashira': { en: 'Mrigashira', te: 'మృగశిర', hi: 'मृगशिरा', gu: 'મૃગશીર્ષ' },
  'Ardra': { en: 'Ardra', te: 'ఆరుద్ర', hi: 'आर्द्रा', gu: 'આદ્રા' },
  'Punarvasu': { en: 'Punarvasu', te: 'పునర్వసు', hi: 'पुनर्वसु', gu: 'પુનર્વસુ' },
  'Pushya': { en: 'Pushya', te: 'పుష్యమి', hi: 'पुष्य', gu: 'પુષ્ય' },
  'Ashlesha': { en: 'Ashlesha', te: 'ఆశ్లేష', hi: 'आश्लेषा', gu: 'આશ્લેષા' },
  'Magha': { en: 'Magha', te: 'మఖ', hi: 'मघा', gu: 'મઘા' },
  'Purva Phalguni': { en: 'Purva Phalguni', te: 'పూర్వ ఫల్గుణి', hi: 'पूर्वाफाल्गुनी', gu: 'પૂર્વા ફાલ્ગુની' },
  'Uttara Phalguni': { en: 'Uttara Phalguni', te: 'ఉత్తర ఫల్గుణి', hi: 'उत्तराफाल्गुनी', gu: 'ઉત્તરા ફાલ્ગુની' },
  'Hasta': { en: 'Hasta', te: 'హస్త', hi: 'हस्त', gu: 'હસ્ત' },
  'Chitra': { en: 'Chitra', te: 'చిత్త', hi: 'चित्रा', gu: 'ચિત્રા' },
  'Swati': { en: 'Swati', te: 'స్వాతి', hi: 'स्वाती', gu: 'સ્વાતિ' },
  'Vishakha': { en: 'Vishakha', te: 'విశాఖ', hi: 'विशाखा', gu: 'વિశాఖ' },
  'Anuradha': { en: 'Anuradha', te: 'అనూరాధ', hi: 'अनुराधा', gu: 'અનુરાધા' },
  'Jyeshtha': { en: 'Jyeshtha', te: 'జ్యేష్ఠ', hi: 'ज्येष्ठा', gu: 'જ્યેષ્ઠા' },
  'Moola': { en: 'Moola', te: 'మూల', hi: 'मूल', gu: 'મૂળ' },
  'Purva Ashadha': { en: 'Purva Ashadha', te: 'పూర్వాషాఢ', hi: 'पूर्वाषाढ़ा', gu: 'પૂર્વાષાઢા' },
  'Uttara Ashadha': { en: 'Uttara Ashadha', te: 'ఉత్తరాషాఢ', hi: 'उत्तराषाढ़ा', gu: 'ఉત્તરાષાઢા' },
  'Shravana': { en: 'Shravana', te: 'శ్రవణం', hi: 'श्रवण', gu: 'શ્રવણ' },
  'Dhanishta': { en: 'Dhanishta', te: 'ధనిష్ఠ', hi: 'धनिष्ठा', gu: 'ધનિષ્ઠા' },
  'Shatabhisha': { en: 'Shatabhisha', te: 'శతభిషం', hi: 'शतभिषा', gu: 'શતભિષા' },
  'Purva Bhadrapada': { en: 'Purva Bhadrapada', te: 'పూర్వాభాద్ర', hi: 'पूर्वाभाद्रपद', gu: 'પૂર્વાભાદ્રપદ' },
  'Uttara Bhadrapada': { en: 'Uttara Bhadrapada', te: 'ఉత్తరాభాద్ర', hi: 'उत्तराभाद्रपद', gu: 'ઉત્તરાભાદ્રપદ' },
  'Revati': { en: 'Revati', te: 'రేవతి', hi: 'रेवती', gu: 'રેવતી' }
};

const gothramMap: Record<string, Record<string, string>> = {
  'Bharadwaja': { en: 'Bharadwaja', te: 'భరద్వాజ', hi: 'भारद्वाज', gu: 'ભરદ્વાજ' },
  'Kashyapa': { en: 'Kashyapa', te: 'కశ్యప', hi: 'कश्यप', gu: 'કશ્યપ' },
  'Vashishta': { en: 'Vashishta', te: 'వశిష్ట', hi: 'वशिष्ठ', gu: 'વસિષ્ઠ' },
  'Vishwamitra': { en: 'Vishwamitra', te: 'విశ్వామిత్ర', hi: 'विश्वामित्र', gu: 'વિશ્વામિત્ર' },
  'Gautama': { en: 'Gautama', te: 'గౌతమ', hi: 'गौतम', gu: 'ગૌતમ' },
  'Jamadagni': { en: 'Jamadagni', te: 'జమదగ్ని', hi: 'जमदग्नि', gu: 'જમદગ્નિ' },
  'Atri': { en: 'Atri', te: 'అత్రి', hi: 'अत्रि', gu: 'અત્રિ' },
  'Angirasa': { en: 'Angirasa', te: 'అంగీరస', hi: 'अंगिरस', gu: 'અંગિરસ' }
};

const translateNakshatra = (val: string, lang: string): string => {
  if (nakshatraMap[val]) {
    return nakshatraMap[val][lang] || val;
  }
  for (const key of Object.keys(nakshatraMap)) {
    const translations = nakshatraMap[key];
    for (const l of Object.keys(translations)) {
      if (translations[l].toLowerCase() === val.toLowerCase()) {
        return translations[lang] || val;
      }
    }
  }
  return val;
};

const translateGothram = (val: string, lang: string): string => {
  if (gothramMap[val]) {
    return gothramMap[val][lang] || val;
  }
  for (const key of Object.keys(gothramMap)) {
    const translations = gothramMap[key];
    for (const l of Object.keys(translations)) {
      if (translations[l].toLowerCase() === val.toLowerCase()) {
        return translations[lang] || val;
      }
    }
  }
  return val;
};

export default function BookingFlow() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t, language } = useLanguage();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    selectedSlotId: '',
    devoteeNames: '',
    gothram: 'Bharadwaja',
    nakshatra: 'Shravana',
    specialRequests: '',
  });
  
  const [showNakshatraModal, setShowNakshatraModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [poojaData, setPoojaData] = useState<any>(null);
  const [templeData, setTempleData] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  
  const poojaId = id?.toString() || '';

  const placeholderColor = theme === 'dark' ? '#A8A29E' : '#78716C';

  useEffect(() => {
    const loadData = async () => {
      try {
        const poojaDoc = await firestore().collection('poojas').doc(poojaId).get();
        if (!poojaDoc.exists) return;
        
        const pData = poojaDoc.data();
        setPoojaData({ id: poojaDoc.id, ...pData });
        
        const templeDoc = await firestore().collection('temples').doc(pData?.templeId).get();
        if (templeDoc.exists) {
          setTempleData({ id: templeDoc.id, ...templeDoc.data() });
        }
        
        // Load active slots
        const slotsSnap = await firestore()
          .collection('slots')
          .where('poojaId', '==', poojaId)
          .where('status', '==', 'AVAILABLE')
          .where('isDeleted', '==', false)
          .get();
          
        const loadedSlots = slotsSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((s: any) => s.availableSeats > 0);
          
        // Sort slots by date and time
        loadedSlots.sort((a: any, b: any) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.startTime.localeCompare(b.startTime);
        });
        
        setSlots(loadedSlots);
      } catch (err) {
        console.error("Failed to load booking data", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (poojaId) loadData();
  }, [poojaId]);

  const handleContinue = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    } 
    
    // Process Booking Transaction
    setProcessing(true);
    try {
      const userSession = safeStorage.getItem('doshanivarana_logged_in_user');
      const userId = userSession ? JSON.parse(userSession).id : 'anonymous_user';
      
      const selectedSlot = slots.find(s => s.id === formData.selectedSlotId);
      if (!selectedSlot) throw new Error("Slot not found");

      const bookingData = {
        poojaName: poojaData.name,
        templeName: templeData ? templeData.name : 'Unknown Temple',
        devoteeDetails: {
          name: formData.devoteeNames,
          gotra: formData.gothram,
          nakshatra: formData.nakshatra,
        },
        hasPrasadDelivery: poojaData.prasad ?? true,
        amountPaid: poojaData.price || 1200,
        specialRequests: formData.specialRequests,
        imageUrl: poojaData.imageUrl || 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080'
      };

      const newBookingId = await createBookingTransaction(
        formData.selectedSlotId,
        userId,
        bookingData
      );

      router.push(`/booking/confirmation?bookingId=${newBookingId}&poojaId=${poojaId}` as any);
    } catch (err: any) {
      console.error('Failed to save booking:', err);
      Alert.alert('Booking Failed', err.message || 'An error occurred during booking.');
    } finally {
      setProcessing(false);
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return formData.selectedSlotId !== '';
      case 2:
        return formData.devoteeNames.trim() !== '' && formData.gothram.trim() !== '';
      case 3:
        return !processing;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!poojaData) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground">Pooja not found</Text>
      </View>
    );
  }

  const selectedSlot = slots.find(s => s.id === formData.selectedSlotId);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View 
        className="pb-4 bg-background/95 border-b border-border z-40 px-6"
        style={{ paddingTop: insets.top > 0 ? insets.top + 8 : 16 }}
      >
        <View className="flex-row items-center gap-4 mb-4">
          <Pressable
            onPress={() => step > 1 ? setStep(step - 1) : router.back()}
            className="w-10 h-10 rounded-xl items-center justify-center active:bg-muted/50"
          >
            <ArrowLeft size={20} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'System' }}>
              {step === 1 && t('booking.selectDateTime')}
              {step === 2 && t('booking.yourDetails')}
              {step === 3 && t('booking.reviewConfirm')}
            </Text>
            <Text className="text-xs" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>
              {t('booking.stepInfo').replace('{step}', step.toString())}
            </Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View className="h-1 bg-muted rounded-full overflow-hidden">
          <View 
            className="h-full bg-primary"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 132 }}>
        {/* Pooja Summary Card */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-6 flex-row gap-3">
          <View className="w-16 h-16 rounded-xl bg-primary/10 items-center justify-center">
            <Text className="text-2xl">🕉️</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-foreground mb-1" style={{ fontFamily: 'System' }}>
              {poojaData.name}
            </Text>
            <Text className="text-sm mb-2" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>
              {templeData?.name || 'Unknown Temple'}{poojaData?.deity ? ` • ${poojaData.deity}` : ''}
            </Text>
            <Text className="text-primary font-semibold" style={{ fontFamily: 'System' }}>
              ₹{poojaData.price}
            </Text>
          </View>
        </View>

        {/* Step Content */}
        {step === 1 && (
          <View className="gap-y-6">
            <View>
              <Text className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: 'System' }}>
                Select Available Slot
              </Text>
              {slots.length === 0 ? (
                <View className="p-4 bg-card border border-border rounded-xl">
                  <Text className="text-muted-foreground text-center font-medium">No available slots for this pooja currently.</Text>
                </View>
              ) : (
                <View className="gap-y-3">
                  {slots.map((slot) => {
                    const isSelected = formData.selectedSlotId === slot.id;
                    const dateObj = new Date(slot.date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    
                    return (
                      <Pressable
                        key={slot.id}
                        onPress={() => setFormData({ ...formData, selectedSlotId: slot.id })}
                        className={`p-4 rounded-xl border-2 flex-row items-center justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card'
                        }`}
                      >
                        <View>
                          <View className="flex-row items-center gap-2 mb-1">
                            <Calendar size={16} color={isSelected ? '#F97316' : '#78716C'} />
                            <Text className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`} style={{ fontFamily: 'System' }}>
                              {formattedDate}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2 ml-6">
                            <Clock size={14} color="#78716C" />
                            <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
                              {slot.startTime}
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="text-xs text-muted-foreground font-medium mb-1">Available</Text>
                          <View className="bg-green-500/10 px-2 py-0.5 rounded-full">
                            <Text className="text-green-600 font-bold text-xs">{slot.availableSeats} Seats</Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}

        {step === 2 && (
          <View className="gap-y-6">
            <View>
              <Text className="text-sm font-semibold mb-1" style={{ fontFamily: 'System', color: theme === 'dark' ? '#F5F5F0' : '#1C1917' }}>
                {t('booking.devoteeNames')}
              </Text>
              <Text className="text-xs mb-3" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>
                {t('booking.devoteeNamesDesc')}
              </Text>
              <TextInput
                value={formData.devoteeNames}
                onChangeText={(text) => setFormData({ ...formData, devoteeNames: text })}
                placeholder={t('booking.devoteeNamesPlaceholder')}
                placeholderTextColor={placeholderColor}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold mb-2" style={{ fontFamily: 'System', color: theme === 'dark' ? '#F5F5F0' : '#1C1917' }}>
                {t('booking.gothram')}
              </Text>
              <TextInput
                value={translateGothram(formData.gothram, language)}
                onChangeText={(text) => {
                  let canonicalGothram = text;
                  for (const key of Object.keys(gothramMap)) {
                    const trans = gothramMap[key];
                    if (trans[language] && trans[language].toLowerCase() === text.trim().toLowerCase()) {
                      canonicalGothram = key;
                      break;
                    }
                  }
                  setFormData({ ...formData, gothram: canonicalGothram });
                }}
                placeholder={t('booking.gothramPlaceholder')}
                placeholderTextColor={placeholderColor}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold mb-2" style={{ fontFamily: 'System', color: theme === 'dark' ? '#F5F5F0' : '#1C1917' }}>
                {t('booking.nakshatra')} ({t('common.optional')})
              </Text>
              <Pressable
                onPress={() => setShowNakshatraModal(true)}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl flex-row items-center justify-between"
              >
                <Text style={{ fontFamily: 'System', color: !formData.nakshatra ? (theme === 'dark' ? '#A8A29E' : '#78716C') : (theme === 'dark' ? '#F5F5F0' : '#1C1917') }}>
                  {formData.nakshatra ? translateNakshatra(formData.nakshatra, language) : t('booking.nakshatraPlaceholder')}
                </Text>
                <ChevronRight size={16} color={theme === 'dark' ? '#A8A29E' : '#78716C'} />
              </Pressable>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold mb-2" style={{ fontFamily: 'System', color: theme === 'dark' ? '#F5F5F0' : '#1C1917' }}>
                {t('booking.specialRequests')} ({t('common.optional')})
              </Text>
              <TextInput
                value={formData.specialRequests}
                onChangeText={(text) => setFormData({ ...formData, specialRequests: text })}
                placeholder={t('booking.specialRequestsPlaceholder')}
                placeholderTextColor={placeholderColor}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground min-h-[100px]"
                style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}
              />
            </View>
          </View>
        )}

        {step === 3 && selectedSlot && (
          <View className="gap-y-6">
            <View className="bg-card border border-border rounded-2xl overflow-hidden">
              <View className="p-4 border-b border-border">
                <Text className="font-semibold text-foreground" style={{ fontFamily: 'System' }}>
                  {t('booking.poojaDetails')}
                </Text>
              </View>
              <ReviewItem label={t('booking.selectDateTime')} value={`${selectedSlot.date}, ${selectedSlot.startTime}`} />
              <ReviewItem label={t('booking.devoteeNames')} value={formData.devoteeNames} />
              <ReviewItem label={t('booking.gothram')} value={translateGothram(formData.gothram, language)} />
              {formData.nakshatra !== '' && <ReviewItem label={t('booking.nakshatra')} value={translateNakshatra(formData.nakshatra, language)} />}
              {formData.specialRequests !== '' && <ReviewItem label={t('booking.specialRequests')} value={formData.specialRequests} />}
            </View>

            <View className="bg-card border border-border rounded-2xl p-4 mt-6">
              <Text className="font-semibold text-foreground mb-3" style={{ fontFamily: 'System' }}>
                {t('booking.paymentSummary')}
              </Text>
              <View className="gap-y-2">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>{t('booking.poojaAmount')}</Text>
                  <Text className="text-sm text-foreground" style={{ fontFamily: 'System' }}>₹{poojaData.price}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>{t('booking.prasadDelivery')}</Text>
                  <Text className="text-sm text-primary font-semibold" style={{ fontFamily: 'System' }}>{poojaData.prasad ? t('common.free') : 'Not Included'}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>{t('booking.liveStream')}</Text>
                  <Text className="text-sm text-primary font-semibold" style={{ fontFamily: 'System' }}>{poojaData.liveStream ? t('common.included') : 'Not Included'}</Text>
                </View>
                <View className="border-t border-border pt-3 mt-3">
                  <View className="flex-row justify-between">
                    <Text className="font-semibold text-lg text-foreground" style={{ fontFamily: 'System' }}>{t('booking.totalAmount')}</Text>
                    <Text className="text-primary font-semibold text-lg" style={{ fontFamily: 'System' }}>₹{poojaData.price}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="bg-primary/10 border border-primary/30 rounded-xl p-4 mt-6">
              <Text className="text-sm text-primary" style={{ fontFamily: 'System' }}>
                <Text className="font-bold">{t('booking.note')}:</Text> {t('booking.confirmationNote')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <Pressable
          onPress={handleContinue}
          disabled={!canContinue() || processing}
          className={`w-full py-4 rounded-xl items-center justify-center flex-row gap-2 ${
            canContinue()
              ? 'bg-primary active:bg-[#E05C10]'
              : 'bg-muted'
          }`}
        >
          {processing && <ActivityIndicator size="small" color="#1A0A00" />}
          <Text
            className={`font-semibold text-base ${
              canContinue() ? 'text-primary-foreground' : ''
            }`}
            style={{ fontFamily: 'System', color: !canContinue() ? (theme === 'dark' ? '#A8A29E' : '#78716C') : undefined }}
          >
            {processing ? 'Processing...' : step === 3 ? t('booking.proceedToPayment') : t('common.continue')}
          </Text>
        </Pressable>
      </View>

      {/* Nakshatra Selection Modal */}
      <Modal visible={showNakshatraModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl h-[70%]">
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Text className="font-semibold text-lg text-foreground" style={{ fontFamily: 'System' }}>{t('booking.nakshatraPlaceholder')}</Text>
              <Pressable onPress={() => setShowNakshatraModal(false)} className="p-2">
                <X size={24} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
              </Pressable>
            </View>
            <ScrollView>
              {Object.keys(nakshatraMap).map((key) => {
                const translatedName = nakshatraMap[key][language] || key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => {
                      setFormData({ ...formData, nakshatra: key });
                      setShowNakshatraModal(false);
                    }}
                    className="p-4 border-b border-border active:bg-muted/50"
                  >
                    <Text className="text-foreground" style={{ fontFamily: 'System' }}>{translatedName}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View className="p-4 border-b border-border">
      <Text className="text-xs mb-1" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>
        {label}
      </Text>
      <Text className="font-medium text-foreground" style={{ fontFamily: 'System' }}>
        {value}
      </Text>
    </View>
  );
}
