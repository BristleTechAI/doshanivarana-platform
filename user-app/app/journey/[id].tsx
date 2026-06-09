import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Package, PlayCircle, Truck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { poojaCatalog, getTempleKey } from '../../src/old_app/constants/catalog';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PoojaJourneyScreen() {
  const router = useRouter();
  const { id, poojaId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  
  const displayId = id ? id.toString() : 'DS2026031801';
  let currentPoojaId = '1';
  if (poojaId) {
    currentPoojaId = poojaId.toString();
  } else if (id) {
    const cleanId = id.toString();
    if (parseInt(cleanId) > 0 && parseInt(cleanId) <= 20) {
      currentPoojaId = cleanId;
    } else {
      if (cleanId.includes('2026031502')) {
        currentPoojaId = '1';
      } else if (cleanId.includes('2026032203')) {
        currentPoojaId = '10';
      } else if (cleanId.includes('2026031801')) {
        currentPoojaId = '16';
      }
    }
  }

  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await AsyncStorage.getItem('doshanivarana_bookings');
        if (data) {
          const list = JSON.parse(data);
          const found = list.find((b: any) => b.id === displayId);
          if (found) {
            setBooking(found);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooking();
  }, [displayId]);

  const pooja = poojaCatalog.find(p => p.id.toString() === (booking?.poojaId?.toString() || currentPoojaId)) || poojaCatalog[0];
  const templeKey = getTempleKey(pooja.temple);

  const translateNakshatraLocal = (val: string, lang: string): string => {
    const nakshatraMap: Record<string, Record<string, string>> = {
      'Ashwini': { en: 'Ashwini', te: 'అశ్విని', hi: 'अश्विनी', gu: 'અશ્વિની' },
      'Bharani': { en: 'Bharani', te: 'భరణి', hi: 'भरणी', gu: 'భరણી' },
      'Krittika': { en: 'Krittika', te: 'కృత్తిక', hi: 'कृत्तिका', gu: 'કૃતિકા' },
      'Rohini': { en: 'Rohini', te: 'రోహిణి', hi: 'रोहिणी', gu: 'రోహిణి' },
      'Mrigashira': { en: 'Mrigashira', te: 'మృగశిర', hi: 'मृगशिरा', gu: 'మૃગશીર્ષ' },
      'Ardra': { en: 'Ardra', te: 'ఆరుద్ర', hi: 'आर्द्रा', gu: 'આદ્રા' },
      'Punarvasu': { en: 'Punarvasu', te: 'పునర్వసు', hi: 'पुनर्वसु', gu: 'పుનર્વసు' },
      'Pushya': { en: 'Pushya', te: 'పుష్యమి', hi: 'पुष्य', gu: 'पुष्य' },
      'Ashlesha': { en: 'Ashlesha', te: 'ఆశ్లేష', hi: 'आश्लेषा', gu: 'ఆశ్లేષા' },
      'Magha': { en: 'Magha', te: 'మఖ', hi: 'मघा', gu: 'మઘా' },
      'Purva Phalguni': { en: 'Purva Phalguni', te: 'పూర్వ ఫల్గుణి', hi: 'पूर्वाफाल्गुनी', gu: 'પૂર્વા ఫાલ્ગુની' },
      'Uttara Phalguni': { en: 'Uttara Phalguni', te: 'ఉత్తర ఫల్గుణి', hi: 'उत्तराफाल्गुनी', gu: 'ఉત્તરા ఫાલ્ગુની' },
      'Hasta': { en: 'Hasta', te: 'హస్త', hi: 'हस्त', gu: 'హస్త' },
      'Chitra': { en: 'Chitra', te: 'చిత్త', hi: 'చిత్రా', gu: 'ચિત્રા' },
      'Swati': { en: 'Swati', te: 'స్వాతి', hi: 'स्वाती', gu: 'સ્વાતિ' },
      'Vishakha': { en: 'Vishakha', te: 'విశాఖ', hi: 'विशाखा', gu: 'વિશાખા' },
      'Anuradha': { en: 'Anuradha', te: 'అనూరాధ', hi: 'अनुराधा', gu: 'અનુરાધા' },
      'Jyeshtha': { en: 'Jyeshtha', te: 'జ్యేష్ఠ', hi: 'ज्येष्ठा', gu: 'જ્યેષ્ઠા' },
      'Moola': { en: 'Moola', te: 'మూల', hi: 'मूल', gu: 'મૂળ' },
      'Purva Ashadha': { en: 'Purva Ashadha', te: 'పూర్వాషాఢ', hi: 'पूर्वाषाढ़ा', gu: 'પૂર્વાષાઢા' },
      'Uttara Ashadha': { en: 'Uttara Ashadha', te: 'ఉత్తరాషాఢ', hi: 'उत्तराषाढ़ा', gu: 'ఉત્તરાષાઢા' },
      'Shravana': { en: 'Shravana', te: 'శ్రవణం', hi: 'श्रवण', gu: 'શ્રવણ' },
      'Dhanishta': { en: 'Dhanishta', te: 'ధనిష్ఠ', hi: 'धनिष्ठा', gu: 'ધનિષ્ઠા' },
      'Shatabhisha': { en: 'Shatabhisha', te: 'శतభిషం', hi: 'शतभिषा', gu: 'શતભિષા' },
      'Purva Bhadrapada': { en: 'Purva Bhadrapada', te: 'పూర్వాభాద్ర', hi: 'पूर्वाभाद्रपद', gu: 'પૂર્વાભાદ્રપદ' },
      'Uttara Bhadrapada': { en: 'Uttara Bhadrapada', te: 'ఉత్తరాభాద్ర', hi: 'उत्तराभाद्रपद', gu: 'ઉત્તરાભાદ્રપદ' },
      'Revati': { en: 'Revati', te: 'రేవతి', hi: 'रेवती', gu: 'રેવતી' }
    };
    if (nakshatraMap[val]) return nakshatraMap[val][lang] || val;
    for (const key of Object.keys(nakshatraMap)) {
      const trans = nakshatraMap[key];
      for (const l of Object.keys(trans)) {
        if (trans[l].toLowerCase() === val.toLowerCase()) return trans[lang] || val;
      }
    }
    return val;
  };

  const translateGothramLocal = (val: string, lang: string): string => {
    const gothramMap: Record<string, Record<string, string>> = {
      'Bharadwaja': { en: 'Bharadwaja', te: 'భరద్వాజ', hi: 'भारद्वाज', gu: 'ભરદ્વાજ' },
      'Kashyapa': { en: 'Kashyapa', te: 'కశ్యప', hi: 'कश्यप', gu: 'કશ્યપ' },
      'Vashishta': { en: 'Vashishta', te: 'వశిష్ట', hi: 'वशिष्ठ', gu: 'વસિષ્ઠ' },
      'Vishwamitra': { en: 'Vishwamitra', te: 'విశ్వామిత్ర', hi: 'विश्वामित्र', gu: 'વિશ્વામિત્ર' },
      'Gautama': { en: 'Gautama', te: 'గౌతమ', hi: 'गौतम', gu: 'ગૌતમ' },
      'Jamadagni': { en: 'Jamadagni', te: 'జమదగ్ని', hi: 'जमदग्नि', gu: 'જમదગ્નિ' },
      'Atri': { en: 'Atri', te: 'అత్రి', hi: 'अत्रि', gu: 'అત્રિ' },
      'Angirasa': { en: 'Angirasa', te: 'అంగీరస', hi: 'अंगरस', gu: 'અંગિરસ' }
    };
    if (gothramMap[val]) return gothramMap[val][lang] || val;
    for (const key of Object.keys(gothramMap)) {
      const trans = gothramMap[key];
      for (const l of Object.keys(trans)) {
        if (trans[l].toLowerCase() === val.toLowerCase()) return trans[lang] || val;
      }
    }
    return val;
  };

  const getDisplayDate = () => {
    if (booking?.dateKey && booking.dateKey.startsWith('booking.date')) {
      return t(booking.dateKey);
    }
    const dateVal = booking?.dateVal || '2026-04-15';
    const timeVal = booking?.timeVal || '9:00 AM';
    
    const monthMap: Record<string, Record<string, string>> = {
      '03': { en: 'March', te: 'మార్చి', hi: 'मार्च', gu: 'માર્ચ' },
      '04': { en: 'April', te: 'ఏప్రిల్', hi: 'अप्रैल', gu: 'એપ્રિલ' }
    };
    
    const parts = dateVal.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parseInt(parts[2]).toString();
      const monthName = monthMap[month]?.[language] || 'April';
      return `${day} ${monthName} ${year}${timeVal ? ' — ' + timeVal : ''}`;
    }
    return `${dateVal}${timeVal ? ' — ' + timeVal : ''}`;
  };

  const devoteeInfo = {
    name: booking?.devoteeNames || t('profile.val.raghavan'),
    gothram: translateGothramLocal(booking?.gothram || 'Bharadwaja', language),
    nakshatra: translateNakshatraLocal(booking?.nakshatra || 'Shravana', language),
    poojaName: t('poojaDb.' + pooja.id + '.title'),
    date: getDisplayDate(),
    temple: t('templeDb.' + templeKey + '.name'),
  };

  const currentStage = booking?.currentStage ?? 4;

  const stages = [
    {
      id: 1,
      nameKey: 'journey.sevaOffered',
      descKey: 'journey.sevaOfferedDesc',
      timestamp: 'March 10, 2026 — 3:45 PM',
    },
    {
      id: 2,
      nameKey: 'journey.pujariAssigned',
      descKey: 'journey.pujariAssignedDesc',
      timestamp: 'March 10, 2026 — 4:12 PM',
    },
    {
      id: 3,
      nameKey: 'journey.poojaScheduled',
      descKey: 'journey.poojaScheduledDesc',
      timestamp: 'March 11, 2026 — 10:00 AM',
    },
    {
      id: 4,
      nameKey: 'journey.goingLive',
      descKey: 'journey.goingLiveDesc',
      timestamp: 'April 15, 2026 — 9:00 AM',
    },
    {
      id: 5,
      nameKey: 'journey.poojaCompleted',
      descKey: 'journey.poojaCompletedDesc',
      timestamp: 'April 15, 2026 — 11:00 AM',
    },
    {
      id: 6,
      nameKey: 'journey.recordingReady',
      descKey: 'journey.recordingReadyDesc',
      ctaKey: 'bookings.watchRecording',
    },
    {
      id: 7,
      nameKey: 'journey.prasadPacked',
      descKey: 'journey.prasadPackedDesc',
    },
    {
      id: 8,
      nameKey: 'journey.prasadDispatched',
      descKey: 'journey.prasadDispatchedDesc',
      ctaKey: 'bookings.trackPrasad',
    },
    {
      id: 9,
      nameKey: 'journey.prasadDelivered',
      descKey: 'journey.prasadDeliveredDesc',
    },
  ];

  const getIcon = (idx: number, isCompleted: boolean, isCurrent: boolean) => {
    const size = 18;
    const color = isCompleted
      ? '#1A0A00'
      : isCurrent
      ? '#F97316'
      : '#78716C';

    if (idx < 5) {
      return <CheckCircle2 size={size} color={color} />;
    } else if (idx === 5) {
      return <PlayCircle size={size} color={color} />;
    } else if (idx >= 6 && idx <= 7) {
      return <Package size={size} color={color} />;
    } else {
      return <Truck size={size} color={color} />;
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-6 pb-4 border-b border-border/40 bg-background"
        style={{ paddingTop: insets.top > 0 ? insets.top + 8 : 16 }}
      >
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl items-center justify-center bg-card/40 border border-border/40 active:bg-muted/40"
          >
            <ArrowLeft size={20} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
          </Pressable>
          <View>
            <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'System' }}>
              {t('journey.title')}
            </Text>
            <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
              {t('bookingConfirmation.bookingId')}: {displayId}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, paddingBottom: 120 }} className="flex-1">
        {/* Devotee Details Summary Card */}
        <View className="bg-card border border-border rounded-2xl p-5 mb-8">
          <Text className="font-bold text-primary text-xs uppercase tracking-wider mb-3">{t('journey.sankalpamDetails')}</Text>
          <View className="space-y-2.5">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-muted-foreground">{t('journey.poojaSeva')}</Text>
              <Text className="text-xs font-semibold text-foreground">{devoteeInfo.poojaName}</Text>
            </View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-muted-foreground">{t('journey.templeLocation')}</Text>
              <Text className="text-xs font-semibold text-foreground text-right max-w-[180px]">{devoteeInfo.temple}</Text>
            </View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-muted-foreground">{t('journey.devoteeName')}</Text>
              <Text className="text-xs font-semibold text-foreground">{devoteeInfo.name}</Text>
            </View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-muted-foreground">{t('journey.gothramNakshatra')}</Text>
              <Text className="text-xs font-semibold text-foreground">{devoteeInfo.gothram} / {devoteeInfo.nakshatra}</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View className="px-2">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStage;
            const isCurrent = index === currentStage;
            const isLast = index === stages.length - 1;

            return (
              <View key={stage.id} className="flex-row relative pb-8">
                {/* Connector Line */}
                {!isLast && (
                  <View 
                    className={`absolute left-[20px] top-[36px] w-[2px] h-full bg-muted`} 
                  />
                )}

                {/* Icon Circle */}
                <View 
                  className={`w-10 h-10 rounded-full items-center justify-center z-10 mr-4 ${
                    isCompleted 
                      ? 'bg-primary' 
                      : isCurrent 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-card border border-border'
                  }`}
                >
                  {getIcon(index, isCompleted, isCurrent)}
                </View>

                {/* Content */}
                <View className="flex-1 pt-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text 
                      className={`font-bold text-sm ${
                        isCompleted || isCurrent ? 'text-foreground font-semibold' : 'text-muted-foreground'
                      } ${isCurrent ? 'text-primary' : ''}`}
                      style={{ fontFamily: 'System' }}
                    >
                      {t(stage.nameKey)}
                    </Text>
                    {isCompleted && (
                      <Text className="text-xs text-primary font-bold">✓</Text>
                    )}
                  </View>
                  <Text className="text-xs text-muted-foreground leading-relaxed mb-2" style={{ fontFamily: 'System' }}>
                    {t(stage.descKey)}
                  </Text>
                  {stage.timestamp && (
                    <Text className="text-[10px] text-muted-foreground/60" style={{ fontFamily: 'System' }}>
                      {stage.timestamp}
                    </Text>
                  )}

                  {/* CTA button if applicable */}
                  {stage.ctaKey && isCompleted && (
                    <Pressable
                      onPress={() => {
                        if (stage.ctaKey === 'bookings.watchRecording') {
                          router.push(`/live/${displayId.replace('DS', '')}?poojaId=${pooja.id}` as any);
                        }
                      }}
                      className="mt-2.5 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg self-start active:bg-primary/20"
                    >
                      <Text className="text-primary font-semibold text-xs">{t(stage.ctaKey)}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar with Action buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border/40 p-4 flex-row gap-3">
        <Pressable 
          onPress={() => router.push(`/live/${displayId.replace('DS', '')}?poojaId=${pooja.id}` as any)}
          className="flex-1 py-3.5 rounded-xl bg-primary items-center justify-center active:bg-[#E05C10]"
        >
          <Text className="text-[#1A0A00] font-semibold text-sm">{t('journey.watchBroadcast')}</Text>
        </Pressable>
        <Pressable 
          disabled
          className="flex-1 py-3.5 rounded-xl border border-border bg-card items-center justify-center opacity-50"
        >
          <Text className="text-muted-foreground font-semibold text-sm">{t('journey.trackPrasad')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
