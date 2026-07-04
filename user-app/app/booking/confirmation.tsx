// @ts-nocheck
import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { Bell, Share2 } from 'lucide-react-native';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { poojaCatalog, getTempleKey } from '../../src/old_app/constants/catalog';
import { firestoreProvider as firestore } from '../../src/lib/firebaseProvider';

export default function BookingConfirmation() {
  const { bookingId, poojaId } = useLocalSearchParams();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const displayId = bookingId ? bookingId.toString() : 'DS2026031801';
  const currentPoojaId = poojaId ? poojaId.toString() : '1';
  
  const [booking, setBooking] = useState<any>(null);
  const [mappedId, setMappedId] = useState<string>('');

  useEffect(() => {
    const unsubscribe = firestore().collection('bookings').doc(displayId)
      .onSnapshot((doc) => {
        if (doc && doc.exists) {
          setBooking({ id: doc.id, ...doc.data() });
        }
      }, (err) => {
        console.error(err);
      });
    return () => unsubscribe();
  }, [displayId]);

  useEffect(() => {
    if (!booking?.templeId) return;

    const fetchAllBookingsForSeq = async () => {
      try {
        const snap = await firestore().collection('bookings')
          .where('templeId', '==', booking.templeId)
          .where('isDeleted', '==', false)
          .get();
        const allDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        const getSortTime = (b: any) => {
          if (b.createdAt) {
            if (typeof b.createdAt.toMillis === 'function') return b.createdAt.toMillis();
            if (typeof b.createdAt.seconds === 'number') {
              return b.createdAt.seconds * 1000 + (b.createdAt.nanoseconds || 0) / 1000000;
            }
            return new Date(b.createdAt).getTime();
          }
          if (b.scheduledDate) {
            return new Date(b.scheduledDate).getTime();
          }
          return 0;
        };

        allDocs.sort((a, b) => {
          const timeA = getSortTime(a);
          const timeB = getSortTime(b);
          if (timeA !== timeB) return timeA - timeB;
          return a.id.localeCompare(b.id);
        });

        const idx = allDocs.findIndex(d => d.id === booking.id);
        if (idx !== -1) {
          const seqStr = String(idx + 1).padStart(10, '0');
          setMappedId(`BK_${seqStr}`);
        } else {
          setMappedId(booking.id);
        }
      } catch (err) {
        console.error("Failed to map sequential ID in confirmation:", err);
        setMappedId(booking.id);
      }
    };

    fetchAllBookingsForSeq();
  }, [booking?.id, booking?.templeId]);

  const pooja = poojaCatalog.find(p => p.id.toString() === (booking?.poojaId?.toString() || currentPoojaId)) || poojaCatalog[0];
  const templeKey = getTempleKey(pooja.templeName || pooja.temple || '');

  const getDisplayDate = () => {
    if (booking?.dateKey && booking.dateKey.startsWith('booking.date')) {
      return t(booking.dateKey);
    }
    const dateVal = booking?.scheduledDate || booking?.dateVal || '2026-04-15';
    const timeVal = booking?.scheduledTime || booking?.timeVal || '9:00 AM';
    
    const monthMap: Record<string, Record<string, string>> = {
      '03': { en: 'March', te: 'మార్చి', hi: 'मार्च', gu: 'માર્ચ' },
      '04': { en: 'April', te: 'ఏప్రిల్', hi: 'अप्रैल', gu: 'એప్రిల్' }
    };
    
    const parts = dateVal.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parseInt(parts[2]).toString();
      const monthName = monthMap[month]?.[language] || 'April';
      return `${day} ${monthName} ${year} — ${timeVal}`;
    }
    return `${dateVal} — ${timeVal}`;
  };

  const primaryForeground = theme === 'dark' ? '#1A0A00' : '#F5F5F0';

  return (
    <View className="flex-1 bg-background px-6 py-12 flex-col items-center justify-center">
      {/* Diya Animation Placeholder */}
      <View className="mb-8 relative items-center justify-center">
        <Text className="text-8xl">🪔</Text>
        <View
          className="absolute inset-0 opacity-30 rounded-full bg-primary"
          style={{
            transform: [{ scale: 1.5 }],
            zIndex: -1
          }}
        />
      </View>

      {/* Headline */}
      <Text
        className="text-3xl font-bold text-center mb-4 text-foreground"
        style={{ fontFamily: 'System' }}
      >
        {t('bookingConfirmation.title')}
      </Text>

      {/* Subtitle */}
      <Text
        className="text-center text-sm mb-8 max-w-md"
        style={{ 
          color: theme === 'dark' ? '#A8A29E' : '#44403C', 
          fontFamily: 'System' 
        }}
      >
        {t('bookingConfirmation.subtitle')}
      </Text>

      {/* Booking ID Card */}
      <View
        className="w-full max-w-md rounded-xl p-5 mb-6 bg-card border border-primary"
      >
        {/* Top Row */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xs font-bold text-primary" style={{ fontFamily: 'System' }}>
            DOSHANIVARANA
          </Text>
          <Text 
            className="text-xs" 
            style={{ 
              color: theme === 'dark' ? '#A8A29E' : '#78716C', 
              fontFamily: 'System' 
            }}
          >
            {t('bookingConfirmation.bookingConfirmed')}
          </Text>
        </View>

        {/* Divider */}
        <View className="border-t border-dashed border-primary mb-4" />

        {/* Pooja Details */}
        <Text
          className="text-xl font-bold mb-2 text-foreground"
          style={{ fontFamily: 'System' }}
        >
          {booking?.poojaName || t('poojaDb.' + pooja.id + '.title')}
        </Text>
        <Text 
          className="text-xs mb-1" 
          style={{ 
            color: theme === 'dark' ? '#A8A29E' : '#78716C', 
            fontFamily: 'System' 
          }}
        >
          {booking?.templeName || `${t('templeDb.' + templeKey + '.name')}, ${t('templeDb.' + templeKey + '.location')}`}
        </Text>
        <Text 
          className="text-xs mb-4" 
          style={{ 
            color: theme === 'dark' ? '#A8A29E' : '#78716C', 
            fontFamily: 'System' 
          }}
        >
          {getDisplayDate()}
        </Text>

        {/* Divider */}
        <View className="border-t border-dashed border-border mb-4" />

        {/* Booking ID */}
        <View>
          <Text 
            className="text-xs mb-1" 
            style={{ 
              color: theme === 'dark' ? '#A8A29E' : '#78716C', 
              fontFamily: 'System' 
            }}
          >
            {t('bookingConfirmation.bookingId')}
          </Text>
          <Text
            className="text-sm text-primary font-bold"
            style={{ fontFamily: 'System' }}
          >
            {mappedId || displayId}
          </Text>
        </View>
      </View>

      {/* CTAs */}
      <View className="w-full max-w-md gap-y-3 mb-8">
        <Pressable className="w-full py-3 rounded-xl bg-primary items-center justify-center flex-row gap-2 active:bg-[#E05C10] mb-3">
          <Bell size={20} color={primaryForeground} />
          <Text className="text-primary-foreground font-medium" style={{ fontFamily: 'System' }}>
            {t('bookingConfirmation.setReminder')}
          </Text>
        </Pressable>

        <Pressable className="w-full py-3 rounded-xl border-2 border-primary bg-transparent items-center justify-center flex-row gap-2 active:bg-primary/5">
          <Share2 size={20} color="#F97316" />
          <Text className="text-primary font-medium" style={{ fontFamily: 'System' }}>
            {t('bookingConfirmation.shareBlessing')}
          </Text>
        </Pressable>
      </View>

      {/* Journey Preview */}
      <View className="w-full max-w-md mb-6">
        <View className="flex-row items-center justify-center gap-3">
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
              <Text className="text-xs text-primary-foreground font-bold">✓</Text>
            </View>
            <Text 
              className="text-xs" 
              style={{ 
                color: theme === 'dark' ? '#A8A29E' : '#78716C', 
                fontFamily: 'System' 
              }}
            >
              {t('journey.sevaOffered')}
            </Text>
          </View>
          <View className="w-8 h-0.5 bg-border" />
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full border border-border" />
            <Text 
              className="text-xs" 
              style={{ 
                color: theme === 'dark' ? '#A8A29E' : '#78716C', 
                fontFamily: 'System' 
              }}
            >
              {t('journey.pujariAssigned')}
            </Text>
          </View>
          <View className="w-8 h-0.5 bg-border" />
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full border border-border" />
            <Text 
              className="text-xs" 
              style={{ 
                color: theme === 'dark' ? '#A8A29E' : '#78716C', 
                fontFamily: 'System' 
              }}
            >
              {t('journey.poojaScheduled')}
            </Text>
          </View>
        </View>
      </View>

      {/* View Bookings Link */}
      <Link href="/(tabs)/bookings" asChild>
        <Pressable className="p-2">
          <Text className="text-primary text-sm font-medium" style={{ fontFamily: 'System' }} numberOfLines={1}>
            {t('bookingConfirmation.viewJourney')}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
