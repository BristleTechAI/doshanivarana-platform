import { useState, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Volume2, VolumeX, Maximize2, Eye } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { poojaCatalog, getTempleKey } from '../../src/old_app/constants/catalog';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LiveStreamScreen() {
  const router = useRouter();
  const { id, poojaId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();

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
  const displayId = id ? `DS${id.toString()}` : 'DS2026031801';

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await AsyncStorage.getItem('doshanivarana_bookings');
        if (data) {
          const list = JSON.parse(data);
          const found = list.find((b: any) => b.id === displayId || b.id.replace('DS', '') === id?.toString());
          if (found) {
            setBooking(found);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooking();
  }, [id, displayId]);

  const pooja = poojaCatalog.find(p => p.id.toString() === (booking?.poojaId?.toString() || currentPoojaId)) || poojaCatalog[0];
  const templeKey = getTempleKey(pooja.temple);

  const [isMuted, setIsMuted] = useState(false);

  const streamInfo = {
    title: t('poojaDb.' + pooja.id + '.title'),
    temple: t('templeDb.' + templeKey + '.name'),
    devoteeName: booking?.devoteeNames ? `${booking.devoteeNames} & Family` : 'Priya Sharma & Family',
    viewerCount: 312,
    videoUrl: pooja.imageUrl,
  };

  return (
    <View className="flex-1 bg-[#1A0A00] flex-col justify-between">
      {/* Video Container (occupies majority of screen) */}
      <View className="flex-1 relative bg-[#2D0A2E] m-2 rounded-3xl overflow-hidden border border-primary/20">
        <Image
          source={{ uri: streamInfo.videoUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Video Overlay Top Controls */}
        <View 
          className="absolute top-0 left-0 right-0 flex-row items-center justify-between p-4"
          style={{ paddingTop: insets.top > 0 ? insets.top + 8 : 16 }}
        >
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#1A0A00]/80 items-center justify-center border border-border/20 active:bg-[#1A0A00]/95"
          >
            <ArrowLeft size={20} color="#F5F5F0" />
          </Pressable>

          {/* Title */}
          <View className="flex-1 px-4 items-center">
            <Text className="text-sm font-bold text-[#F5F5F0] text-center" style={{ fontFamily: 'System' }}>
              {streamInfo.title}
            </Text>
            <Text className="text-[10px] text-[#78716C] text-center" style={{ fontFamily: 'System' }} numberOfLines={1}>
              {streamInfo.temple}
            </Text>
          </View>

          {/* Live Badge */}
          <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-red-600">
            <View className="w-1.5 h-1.5 rounded-full bg-white" />
            <Text className="text-[10px] font-bold text-white tracking-wider" style={{ fontFamily: 'System' }}>
              {t('home.live').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Video Overlay Bottom Caption (Devotee dedication info) */}
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pt-12">
          <Text className="text-center text-xs text-[#78716C] mb-1" style={{ fontFamily: 'System' }}>
            {t('live.onBehalfOf')}
          </Text>
          <Text className="text-center text-sm font-bold text-primary" style={{ fontFamily: 'System' }}>
            {streamInfo.devoteeName}
          </Text>
        </View>
      </View>

      {/* Control Area & Instructions */}
      <View 
        className="px-6 pb-6 pt-3 space-y-4"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24 }}
      >
        {/* Stream Metrics Info */}
        <View className="flex-row items-center justify-between text-xs mb-3">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full bg-green-500" />
            <Text className="text-[#78716C] text-xs" style={{ fontFamily: 'System' }}>720p HD • {t('live.smooth')}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Eye size={14} color="#78716C" />
            <Text className="text-[#78716C] text-xs" style={{ fontFamily: 'System' }}>
              {t('live.devoteesJoined').replace('{count}', streamInfo.viewerCount.toString())}
            </Text>
          </View>
        </View>

        {/* Control Buttons */}
        <View className="flex-row items-center justify-center gap-6 mb-4">
          <Pressable 
            onPress={() => setIsMuted(!isMuted)}
            className="w-12 h-12 rounded-full bg-[#2D0A2E] border border-border/40 items-center justify-center active:bg-muted/40"
          >
            {isMuted ? (
              <VolumeX size={20} color="#F97316" />
            ) : (
              <Volume2 size={20} color="#F97316" />
            )}
          </Pressable>
          <Pressable 
            className="w-12 h-12 rounded-full bg-[#2D0A2E] border border-border/40 items-center justify-center active:bg-muted/40"
          >
            <Maximize2 size={20} color="#F5F5F0" />
          </Pressable>
        </View>

        {/* Brand/Devotional warning guidance */}
        <View className="bg-card border border-border/20 rounded-2xl p-4 items-center">
          <Text className="text-center text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: 'System' }}>
            {t('live.guidance')}
          </Text>
        </View>
      </View>
    </View>
  );
}
