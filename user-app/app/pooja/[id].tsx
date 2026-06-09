import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Share2, MapPin, Clock, Play } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import {
  poojaCatalog,
  getTempleKey,
  getTranslatedDeity,
  getTranslatedTemple,
  getCategorySteps,
  getCategoryBlessings,
  getCategoryRashis,
} from '../../src/old_app/constants/catalog';

const rashiTranslations: Record<string, Record<string, string>> = {
  en: {
    Mesha: 'Mesha', Vrishabha: 'Vrishabha', Mithuna: 'Mithuna', Karka: 'Karka',
    Simha: 'Simha', Kanya: 'Kanya', Tula: 'Tula', Vrishchika: 'Vrishchika',
    Dhanu: 'Dhanu', Makara: 'Makara', Kumbha: 'Kumbha', Meena: 'Meena'
  },
  te: {
    Mesha: 'మేషం', Vrishabha: 'వృషభం', Mithuna: 'మిథునం', Karka: 'కర్కాటకం',
    Simha: 'సింహం', Kanya: 'కన్య', Tula: 'తులా', Vrishchika: 'వృశ్చికం',
    Dhanu: 'ధనుస్సు', Makara: 'మకరం', Kumbha: 'కుంభం', Meena: 'మీనం'
  },
  hi: {
    Mesha: 'मेष', Vrishabha: 'वृषभ', Mithuna: 'मिथुन', Karka: 'कर्क',
    Simha: 'सिंह', Kanya: 'कन्या', Tula: 'तुला', Vrishchika: 'वृश्चिक',
    Dhanu: 'धनु', Makara: 'मकर', Kumbha: 'कंभ', Meena: 'मीन'
  },
  gu: {
    Mesha: 'મેષ', Vrishabha: 'વૃષભ', Mithuna: 'મિથુન', Karka: 'કર્ક',
    Simha: 'સિંહ', Kanya: 'કન્યા', Tula: 'તુલા', Vrishchika: 'વૃશ્ચિક',
    Dhanu: 'ધનુ', Makara: 'મકર', Kumbha: 'કુંભ', Meena: 'મીન'
  }
};

export default function PoojaDetail() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'where' | 'how' | 'why'>('overview');
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();

  const poojaId = id ? id.toString() : '1';
  const pooja = poojaCatalog.find(p => p.id.toString() === poojaId) || poojaCatalog[0];

  return (
    <View className="flex-1 bg-background pb-24">
      <ScrollView className="flex-1" stickyHeaderIndices={[1]}>
        {/* Hero Image */}
        <View className="relative h-52">
          <Image
            source={{ uri: pooja.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Overlay Controls */}
          <View className="absolute left-4" style={{ top: insets.top > 0 ? insets.top : 12 }}>
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-background/80 items-center justify-center"
            >
              <ArrowLeft size={20} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
            </Pressable>
          </View>
          <View className="absolute right-4" style={{ top: insets.top > 0 ? insets.top : 12 }}>
            <Pressable className="w-10 h-10 rounded-full bg-background/80 items-center justify-center">
              <Share2 size={20} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
            </Pressable>
          </View>
        </View>

        {/* Tab Bar */}
        <View className="bg-background border-b border-border">
          <View className="flex-row">
            {(['overview', 'where', 'how', 'why'] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="flex-1 py-4 items-center justify-center relative"
              >
                <Text
                  className={`text-sm font-medium uppercase ${
                    activeTab === tab ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  style={{ fontFamily: 'System' }}
                >
                  {t('poojaDetail.' + tab)}
                </Text>
                {activeTab === tab && (
                  <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-6 py-6">
          {activeTab === 'overview' && <OverviewTab poojaId={pooja.id.toString()} pooja={pooja} />}
          {activeTab === 'where' && <WhereTab pooja={pooja} />}
          {activeTab === 'how' && <HowTab pooja={pooja} />}
          {activeTab === 'why' && <WhyTab poojaId={pooja.id.toString()} pooja={pooja} />}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <Pressable
          onPress={() => router.push(`/booking/${pooja.id}` as any)}
          className="w-full py-4 rounded-xl bg-primary items-center justify-center active:bg-[#E05C10]"
        >
          <Text className="text-[#1A0A00] font-semibold text-base" style={{ fontFamily: 'System' }}>
            {t('poojaDetail.offerPooja')} — {pooja.price}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function OverviewTab({ poojaId, pooja }: { poojaId: string; pooja: any }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const tKey = getTempleKey(pooja.temple);

  return (
    <View>
      {/* Title */}
      <View className="mb-4">
        <Text className="text-3xl font-bold mb-2 text-foreground" style={{ fontFamily: 'System' }}>
          {t('poojaDb.' + poojaId + '.title')}
        </Text>
        <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
          {t('poojaDb.' + poojaId + '.purpose')}
        </Text>
      </View>

      {/* Pujari Card */}
      <View className="bg-card border border-border rounded-xl p-4 flex-row items-center gap-4 mb-4">
        <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
          <Text className="text-2xl">🙏</Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-foreground" style={{ fontFamily: 'System' }}>
            {t('poojaDetail.pujariName')}
          </Text>
          <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
            {t('poojaDetail.pujariInfo')}
          </Text>
        </View>
      </View>

      {/* Temple Card */}
      <View className="bg-card border border-border rounded-xl p-4 flex-row items-center gap-3 mb-4">
        <MapPin size={20} color="#F97316" />
        <View className="flex-1">
          <Text className="font-medium text-sm text-foreground" style={{ fontFamily: 'System' }}>
            {t('templeDb.' + tKey + '.name')}
          </Text>
          <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
            {t('templeDb.' + tKey + '.location')}
          </Text>
        </View>
      </View>

      {/* Live Streaming Badge */}
      <View className="self-start flex-row items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
        <Play size={16} color="#F97316" />
        <Text className="text-sm font-medium text-primary" style={{ fontFamily: 'System' }}>
          {t('poojaDetail.liveStreamAvailable')}
        </Text>
      </View>

      {/* Video Thumbnail */}
      <View className="aspect-video bg-card border border-border rounded-xl overflow-hidden relative mb-6">
        <Image
          source={{ uri: pooja.imageUrl }}
          className="w-full h-full absolute"
          resizeMode="cover"
        />
        <View className="flex-1 items-center justify-center z-10 bg-black/20">
          <View className="w-16 h-16 rounded-full bg-primary/90 items-center justify-center pl-1">
            <Play size={32} color={theme === 'dark' ? '#1A0A00' : '#F5F5F0'} />
          </View>
        </View>
      </View>

      {/* About Pooja Section */}
      <View className="mt-4 pt-4 border-t border-border mb-6">
        <Text className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: 'System' }}>
          {t('poojaDetail.overview')}
        </Text>
        <Text className="text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: 'System' }}>
          {t('poojaDb.' + poojaId + '.purpose')}
        </Text>
      </View>

      {/* Requirements Section */}
      <View className="p-4 rounded-xl bg-card border border-border mb-4">
        <Text className="text-base font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
          {t('poojaDetail.requirementsTitle')}
        </Text>
        <Text className="text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: 'System' }}>
          {t('poojaDetail.requirementsDesc')}
        </Text>
      </View>

      {/* Important Notes Section */}
      <View className="p-4 rounded-xl bg-card border border-border mb-6">
        <Text className="text-base font-semibold text-primary mb-2" style={{ fontFamily: 'System' }}>
          {t('poojaDetail.notesTitle')}
        </Text>
        <Text className="text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: 'System' }}>
          {t('poojaDetail.notesDesc')}
        </Text>
      </View>

      {/* Price */}
      <View className="pt-4 border-t border-border">
        <Text className="text-sm text-muted-foreground mb-1" style={{ fontFamily: 'System' }}>
          {t('poojaDetail.sevaAmount')}
        </Text>
        <Text className="text-3xl font-bold text-primary" style={{ fontFamily: 'System' }}>
          {pooja.price}
        </Text>
      </View>
    </View>
  );
}

function WhereTab({ pooja }: { pooja: any }) {
  const { t } = useLanguage();
  const tKey = getTempleKey(pooja.temple);

  return (
    <View>
      <Text className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'System' }}>
        {t('poojaDetail.whereTitle')}
      </Text>

      <View className="mb-4">
        <Text className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: 'System' }}>
          {t('templeDb.' + tKey + '.name')}
        </Text>
        <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
          {t('templeDb.' + tKey + '.location')}
        </Text>
      </View>

      {/* Map Placeholder */}
      <View className="aspect-video bg-card border border-border rounded-xl items-center justify-center mb-4">
        <MapPin size={48} color="#78716C" />
      </View>

      <View className="mb-6">
        <Text className="text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: 'System' }}>
          {t('templeDb.' + tKey + '.description')}
        </Text>
      </View>

      {/* Temple Photos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
        {[1, 2, 3].map((i) => (
          <Image
            key={i}
            source={{ uri: pooja.imageUrl }}
            className="w-48 h-32 rounded-xl mr-3"
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    </View>
  );
}

function HowTab({ pooja }: { pooja: any }) {
  const { t, language } = useLanguage();
  const steps = getCategorySteps(pooja.category);
  const formattedDuration = pooja.duration.replace(' mins', ' ' + t('poojas.min')).replace(' min', ' ' + t('poojas.min'));

  const getLanguageText = () => {
    switch (language) {
      case 'te': return 'సంస్కృతం + తెలుగు';
      case 'hi': return 'संस्कृत + हिंदी';
      case 'gu': return 'સંસ્કૃત + ગુજરાતી';
      default: return 'Sanskrit + English';
    }
  };

  return (
    <View>
      <Text className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'System' }}>
        {t('poojaDetail.howTitle')}
      </Text>

      {/* Duration & Language */}
      <View className="flex-row gap-3 mb-6 mt-1">
        <View className="px-4 py-2 rounded-full bg-[#2A1305] border border-[#52290B] flex-row items-center gap-2">
          <Clock size={16} color="#F97316" />
          <Text className="text-xs font-semibold text-[#F97316]" style={{ fontFamily: 'System' }}>
            {formattedDuration}
          </Text>
        </View>
        <View className="px-4 py-2 rounded-full bg-[#250F26] border border-[#501F52] flex-row items-center gap-2">
          <Text className="text-xs font-semibold text-[#D47FF2]" style={{ fontFamily: 'System' }}>
            {getLanguageText()}
          </Text>
        </View>
      </View>

      {/* Steps / Procedure */}
      <View className="mb-4">
        {steps.map((step, index) => (
          <View key={index} className="flex-row items-start gap-4 mb-6">
            <View className="w-9 h-9 rounded-full bg-[#2A1305] border border-[#4E260A] items-center justify-center mt-0.5">
              <Text className="text-[#F97316] font-semibold text-sm">{index + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-[#F5F5F0] text-[15px] mb-1" style={{ fontFamily: 'System' }}>
                {t(step.nameKey)}
              </Text>
              <Text className="text-sm text-[#78716C] leading-relaxed" style={{ fontFamily: 'System' }}>
                {t(step.descKey)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Instructions: What to do during stream */}
      <View className="bg-card border border-border rounded-xl p-4 mb-6 mt-2">
        <Text className="font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
          {t('journey.watchBroadcast')}
        </Text>
        <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
          {t('live.guidance')}
        </Text>
      </View>

      {/* FAQ Section */}
      <View className="bg-card border border-border rounded-xl p-4">
        <Text className="font-semibold text-foreground mb-3" style={{ fontFamily: 'System' }}>
          {t('poojaDetail.faqTitle')}
        </Text>
        <View className="space-y-2">
          <Text className="text-sm font-semibold text-foreground" style={{ fontFamily: 'System' }}>
            Q: {t('poojaDetail.faqQ1')}
          </Text>
          <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
            A: {t('poojaDetail.faqA1')}
          </Text>
        </View>
      </View>
    </View>
  );
}

function WhyTab({ poojaId, pooja }: { poojaId: string; pooja: any }) {
  const { t, language } = useLanguage();
  const blessingKeys = getCategoryBlessings(pooja.category);
  const rashis = getCategoryRashis(pooja.category);

  const colors = [
    { bg: 'bg-green-500/10', text: 'text-green-500' },
    { bg: 'bg-primary/10', text: 'text-primary' },
    { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  ];

  return (
    <View>
      <Text className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'System' }}>
        {t('poojaDetail.whyTitle')}
      </Text>

      <Text className="text-sm leading-relaxed text-muted-foreground mb-6" style={{ fontFamily: 'System' }}>
        {t('poojaDb.' + poojaId + '.purpose')}
      </Text>

      {/* Blessings / Benefits */}
      <View className="mb-6">
        <Text className="font-medium text-foreground mb-3" style={{ fontFamily: 'System' }}>
          {t('poojaDetail.blessings')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {blessingKeys.map((key, index) => {
            const color = colors[index % colors.length];
            return (
              <View key={key} className={`px-4 py-2 rounded-full mb-2 mr-2 ${color.bg}`}>
                <Text className={`text-sm font-medium ${color.text}`}>
                  {t('poojaDetail.' + key)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Suitable for Rashi */}
      <View>
        <Text className="text-sm font-medium text-muted-foreground mb-3" style={{ fontFamily: 'System' }}>
          {t('poojaDetail.suitableForRashi')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {rashis.map((rashi) => {
            const translatedRashi = rashiTranslations[language]?.[rashi] || rashi;
            return (
              <View
                key={rashi}
                className="px-3 py-1.5 rounded-full bg-card border border-border mb-2 mr-2"
              >
                <Text className="text-xs font-medium text-foreground" style={{ fontFamily: 'System' }}>
                  {translatedRashi} ✓
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
