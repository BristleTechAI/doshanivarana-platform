import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Package, PlayCircle, Truck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { safeStorage } from '../../src/old_app/lib/storage';

export default function PoojaJourneyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Load database dynamically
  const bookingsData = safeStorage.getItem('doshanivarana_bookings');
  const bookings = bookingsData ? JSON.parse(bookingsData) : [];

  // Match ID
  const cleanedId = id ? id.toString() : '';
  const booking = bookings.find((b: any) => 
    b.id === cleanedId || 
    b.id === `BK-${cleanedId}` || 
    b.id.replace('BK-', '') === cleanedId ||
    b.id.replace('DS', '') === cleanedId
  );

  const getBookingStage = (b: any) => {
    let stage = 1; // Seva Offered
    if (b.paymentStatus === 'Confirmed') stage = 2; // Confirmed
    if (b.pujari !== 'Not Assigned') stage = 3; // Scheduled
    if (b.streamStatus === 'In Progress') stage = 4; // Pooja Live
    if (b.streamStatus === 'Ended') stage = 5; // Completed
    if (b.recordingStatus === 'Available') stage = 6; // Recording Ready
    if (b.deliveryStatus === 'Packed') stage = 7; // Prasad Packed
    if (b.deliveryStatus === 'Dispatched') stage = 8; // Dispatched
    if (b.deliveryStatus === 'Delivered') stage = 9; // Delivered
    return stage;
  };

  const currentStage = booking ? getBookingStage(booking) : 4;

  const devoteeInfo = {
    name: booking ? booking.devoteeName : 'Raghavan Iyer',
    gothram: booking ? booking.gotra : 'Bharadwaja',
    nakshatra: booking ? booking.nakshatra : 'Shravana',
    poojaName: booking ? booking.poojaName : t('poojaDb.1.title'),
    date: booking ? booking.dateTime : '15 April 2026',
    temple: booking ? booking.temple : t('templeDb.rameshwaram.name'),
  };

  const stages = [
    {
      id: 1,
      nameKey: 'journey.sevaOffered',
      descKey: 'journey.sevaOfferedDesc',
      timestamp: booking ? 'Received successfully' : 'March 10, 2026 — 3:45 PM',
    },
    {
      id: 2,
      nameKey: 'journey.pujariAssigned',
      descKey: 'journey.pujariAssignedDesc',
      timestamp: booking && booking.pujari !== 'Not Assigned' ? `Assigned: ${booking.pujari}` : undefined,
    },
    {
      id: 3,
      nameKey: 'journey.poojaScheduled',
      descKey: 'journey.poojaScheduledDesc',
      timestamp: booking ? booking.dateTime : 'April 15, 2026 — 9:00 AM',
    },
    {
      id: 4,
      nameKey: 'journey.goingLive',
      descKey: 'journey.goingLiveDesc',
      timestamp: booking && booking.streamStatus === 'In Progress' ? 'Pooja is LIVE' : undefined,
    },
    {
      id: 5,
      nameKey: 'journey.poojaCompleted',
      descKey: 'journey.poojaCompletedDesc',
      timestamp: booking && booking.streamStatus === 'Ended' ? 'Concluded' : undefined,
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
              {t('bookingConfirmation.bookingId')}: {id || 'DS2026031801'}
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
                    {stage.id === 2 && booking && booking.pujari !== 'Not Assigned'
                      ? t(stage.descKey).replace('Pandit Ramesh Sharma', booking.pujari)
                      : t(stage.descKey)}
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
                          router.push(`/live/${id ? id.toString().replace('DS', '') : '1'}` as any);
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
          onPress={() => router.push(`/live/${id ? id.toString().replace('DS', '') : '1'}` as any)}
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
