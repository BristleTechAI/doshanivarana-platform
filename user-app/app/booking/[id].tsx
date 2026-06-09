import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, User, Star, ChevronRight, X, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { poojaCatalog, getTempleKey, getTranslatedDeity } from '../../src/old_app/constants/catalog';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BookingFormData {
  selectedDate: string;
  selectedTime: string;
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
    selectedDate: '',
    selectedTime: '',
    devoteeNames: '',
    gothram: 'Bharadwaja',
    nakshatra: 'Shravana',
    specialRequests: '',
  });
  const [showNakshatraModal, setShowNakshatraModal] = useState(false);

  // Map search param id to translated pooja info
  const poojaId = id || '1';
  const pooja = poojaCatalog.find(p => p.id.toString() === poojaId.toString()) || poojaCatalog[0];
  const templeKey = getTempleKey(pooja.temple);
  const poojaData = {
    title: t('poojaDb.' + pooja.id + '.title'),
    temple: t('templeDb.' + templeKey + '.name'),
    deity: getTranslatedDeity(pooja.deity, t),
    price: pooja.price,
  };

  const availableDates = [
    { date: '2026-03-20', label: t('common.tomorrow'), day: t('home.thu') },
    { date: '2026-03-21', label: 'Mar 21', day: t('home.fri') },
    { date: '2026-03-22', label: 'Mar 22', day: t('home.sat') },
    { date: '2026-03-23', label: 'Mar 23', day: t('home.sun') },
    { date: '2026-03-24', label: 'Mar 24', day: t('home.mon') },
  ];

  const availableTimes = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM',
    '11:00 AM', '4:00 PM', '5:00 PM', '6:00 PM'
  ];

  const handleContinue = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const bookingId = `DS${Date.now()}`;
      
      try {
        const newBooking = {
          id: bookingId,
          poojaId: parseInt(pooja.id.toString()),
          templeKey: templeKey,
          dateKey: formData.selectedDate === '2026-03-20' ? 'common.tomorrow' : '',
          dateVal: formData.selectedDate,
          timeVal: formData.selectedTime,
          status: 'upcoming',
          currentStage: 1, // Seva Offered
          imageUrl: pooja.imageUrl,
          devoteeNames: formData.devoteeNames,
          gothram: formData.gothram, // Store canonical
          nakshatra: formData.nakshatra, // Store canonical
          specialRequests: formData.specialRequests,
          totalAmount: parseInt(pooja.price.replace(/[^0-9]/g, '')) || 1100,
        };

        const existingBookingsStr = await AsyncStorage.getItem('doshanivarana_bookings');
        const existingBookings = existingBookingsStr ? JSON.parse(existingBookingsStr) : [];
        existingBookings.unshift(newBooking);
        await AsyncStorage.setItem('doshanivarana_bookings', JSON.stringify(existingBookings));
      } catch (err) {
        console.error('Failed to save booking:', err);
      }

      router.push(`/booking/confirmation?bookingId=${bookingId}&poojaId=${pooja.id}` as any);
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return formData.selectedDate !== '' && formData.selectedTime !== '';
      case 2:
        return formData.devoteeNames.trim() !== '' && formData.gothram.trim() !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

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
            <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
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
              {poojaData.title}
            </Text>
            <Text className="text-sm text-muted-foreground mb-2" style={{ fontFamily: 'System' }}>
              {poojaData.temple} • {poojaData.deity}
            </Text>
            <Text className="text-primary font-semibold" style={{ fontFamily: 'System' }}>
              {poojaData.price}
            </Text>
          </View>
        </View>

        {/* Step Content */}
        {step === 1 && (
          <View className="space-y-6">
            {/* Date Selection */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: 'System' }}>
                {t('booking.selectDate')}
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {availableDates.map((dateOption) => (
                  <Pressable
                    key={dateOption.date}
                    onPress={() => setFormData({ ...formData, selectedDate: dateOption.date })}
                    className={`w-[48%] p-4 rounded-xl border-2 mb-3 ${
                      formData.selectedDate === dateOption.date
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <View className="flex-row items-center gap-2 mb-1">
                      <Calendar size={16} color="#F97316" />
                      <Text className="font-semibold text-sm text-foreground" style={{ fontFamily: 'System' }}>
                        {dateOption.label}
                      </Text>
                    </View>
                    <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
                      {dateOption.day}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Time Selection */}
            {formData.selectedDate !== '' && (
              <View className="mt-4">
                <Text className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: 'System' }}>
                  {t('booking.selectTime')}
                </Text>
                <View className="flex-row flex-wrap justify-between gap-y-2">
                  {availableTimes.map((time) => (
                    <Pressable
                      key={time}
                      onPress={() => setFormData({ ...formData, selectedTime: time })}
                      className={`w-[31%] p-3 rounded-xl border-2 items-center justify-center ${
                        formData.selectedTime === time
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          formData.selectedTime === time
                            ? 'text-primary font-semibold'
                            : 'text-foreground'
                        }`}
                        style={{ fontFamily: 'System' }}
                      >
                        {time}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {step === 2 && (
          <View className="space-y-6">
            <View>
              <Text className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: 'System' }}>
                {t('booking.devoteeNames')}
              </Text>
              <Text className="text-xs text-muted-foreground mb-3" style={{ fontFamily: 'System' }}>
                {t('booking.devoteeNamesDesc')}
              </Text>
              <TextInput
                value={formData.devoteeNames}
                onChangeText={(text) => setFormData({ ...formData, devoteeNames: text })}
                placeholder={t('booking.devoteeNamesPlaceholder')}
                placeholderTextColor="hsl(var(--muted-foreground))"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                style={{ fontFamily: 'System' }}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
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
                placeholderTextColor="hsl(var(--muted-foreground))"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground"
                style={{ fontFamily: 'System' }}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
                {t('booking.nakshatra')} ({t('common.optional')})
              </Text>
              <Pressable
                onPress={() => setShowNakshatraModal(true)}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl flex-row items-center justify-between"
              >
                <Text className={formData.nakshatra ? 'text-foreground' : 'text-muted-foreground'} style={{ fontFamily: 'System' }}>
                  {formData.nakshatra ? translateNakshatra(formData.nakshatra, language) : t('booking.nakshatraPlaceholder')}
                </Text>
                <ChevronRight size={16} color="#78716C" />
              </Pressable>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
                {t('booking.specialRequests')} ({t('common.optional')})
              </Text>
              <TextInput
                value={formData.specialRequests}
                onChangeText={(text) => setFormData({ ...formData, specialRequests: text })}
                placeholder={t('booking.specialRequestsPlaceholder')}
                placeholderTextColor="hsl(var(--muted-foreground))"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground min-h-[100px]"
                style={{ fontFamily: 'System' }}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View className="space-y-6">
            <View className="bg-card border border-border rounded-2xl overflow-hidden">
              <View className="p-4 border-b border-border">
                <Text className="font-semibold text-foreground" style={{ fontFamily: 'System' }}>
                  {t('booking.poojaDetails')}
                </Text>
              </View>
              <ReviewItem label={t('booking.selectDateTime')} value={`${availableDates.find(d => d.date === formData.selectedDate)?.label}, ${formData.selectedTime}`} />
              <ReviewItem label={t('booking.devoteeNames')} value={formData.devoteeNames} />
              <ReviewItem label={t('booking.gothram')} value={translateGothram(formData.gothram, language)} />
              {formData.nakshatra !== '' && <ReviewItem label={t('booking.nakshatra')} value={translateNakshatra(formData.nakshatra, language)} />}
              {formData.specialRequests !== '' && <ReviewItem label={t('booking.specialRequests')} value={formData.specialRequests} />}
            </View>

            <View className="bg-card border border-border rounded-2xl p-4 mt-6">
              <Text className="font-semibold text-foreground mb-3" style={{ fontFamily: 'System' }}>
                {t('booking.paymentSummary')}
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>{t('booking.poojaAmount')}</Text>
                  <Text className="text-sm text-foreground" style={{ fontFamily: 'System' }}>{poojaData.price}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>{t('booking.prasadDelivery')}</Text>
                  <Text className="text-sm text-primary font-semibold" style={{ fontFamily: 'System' }}>{t('common.free')}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>{t('booking.liveStream')}</Text>
                  <Text className="text-sm text-primary font-semibold" style={{ fontFamily: 'System' }}>{t('common.included')}</Text>
                </View>
                <View className="border-t border-border pt-3 mt-3">
                  <View className="flex-row justify-between">
                    <Text className="font-semibold text-lg text-foreground" style={{ fontFamily: 'System' }}>{t('booking.totalAmount')}</Text>
                    <Text className="text-primary font-semibold text-lg" style={{ fontFamily: 'System' }}>{poojaData.price}</Text>
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
          disabled={!canContinue()}
          className={`w-full py-4 rounded-xl items-center justify-center ${
            canContinue()
              ? 'bg-primary active:bg-[#E05C10]'
              : 'bg-muted'
          }`}
        >
          <Text
            className={`font-semibold text-base ${
              canContinue() ? 'text-[#1A0A00]' : 'text-muted-foreground'
            }`}
            style={{ fontFamily: 'System' }}
          >
            {step === 3 ? t('booking.proceedToPayment') : t('common.continue')}
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
  return (
    <View className="p-4 border-b border-border">
      <Text className="text-xs text-muted-foreground mb-1" style={{ fontFamily: 'System' }}>
        {label}
      </Text>
      <Text className="font-medium text-foreground" style={{ fontFamily: 'System' }}>
        {value}
      </Text>
    </View>
  );
}
