// @ts-nocheck
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Package, PlayCircle, Truck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { poojaCatalog, getTempleKey } from '../../src/old_app/constants/catalog';
import { firestoreProvider as firestore } from '../../src/lib/firebaseProvider';
import { DeliveriesService } from '../../src/services/firebase/deliveries';

export default function PoojaJourneyScreen() {
  const router = useRouter();
  const { id, poojaId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  
  const displayId = id ? id.toString() : '';
  const cleanId = displayId.replace('DS', '').replace('BK-', '');

  const [booking, setBooking] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mappedDisplayId, setMappedDisplayId] = useState<string>('');

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
          setMappedDisplayId(`BK_${seqStr}`);
        } else {
          setMappedDisplayId(booking.id);
        }
      } catch (err) {
        console.error("Failed to map sequential ID in journey screen:", err);
        setMappedDisplayId(booking.id);
      }
    };

    fetchAllBookingsForSeq();
  }, [booking?.id, booking?.templeId]);

  useEffect(() => {
    if (!cleanId) {
      setLoading(false);
      return;
    }

    let unsubDelivery = () => {};
    let unsubReadiness = () => {};

    const unsubBooking = firestore().collection('bookings').doc(cleanId)
      .onSnapshot((doc) => {
        if (doc && doc.exists) {
          const foundBooking = { id: doc.id, ...doc.data() };
          setBooking(foundBooking);
          
          unsubDelivery();
          unsubDelivery = firestore().collection('deliveries')
            .where('bookingId', '==', foundBooking.id)
            .limit(1)
            .onSnapshot((snap) => {
              if (snap && !snap.empty) {
                setDelivery({ id: snap.docs[0].id, ...snap.docs[0].data() });
              }
            });

          unsubReadiness();
          unsubReadiness = firestore().collection('streamReadiness').doc(foundBooking.id)
            .onSnapshot((readinessDoc) => {
              if (readinessDoc && readinessDoc.exists) {
                setReadiness(readinessDoc.data());
              } else {
                setReadiness(null);
              }
              setLoading(false);
            }, () => {
              setLoading(false);
            });
        } else {
          firestore().collection('bookings')
            .where('id', '==', displayId)
            .get()
            .then(q => {
              if (!q.empty) {
                const foundBooking = { id: q.docs[0].id, ...q.docs[0].data() };
                setBooking(foundBooking);

                unsubDelivery();
                unsubDelivery = firestore().collection('deliveries')
                  .where('bookingId', '==', foundBooking.id)
                  .limit(1)
                  .onSnapshot((snap) => {
                    if (snap && !snap.empty) {
                      setDelivery({ id: snap.docs[0].id, ...snap.docs[0].data() });
                    }
                  });

                unsubReadiness();
                unsubReadiness = firestore().collection('streamReadiness').doc(foundBooking.id)
                  .onSnapshot((readinessDoc) => {
                    if (readinessDoc && readinessDoc.exists) {
                      setReadiness(readinessDoc.data());
                    } else {
                      setReadiness(null);
                    }
                    setLoading(false);
                  }, () => {
                    setLoading(false);
                  });
              } else {
                setLoading(false);
              }
            });
        }
      });

    return () => {
      unsubBooking();
      unsubDelivery();
      unsubReadiness();
    };
  }, [cleanId, displayId]);

  const pooja = poojaCatalog.find(p => p.id.toString() === (booking?.poojaId?.toString() || poojaId?.toString() || '1')) || poojaCatalog[0];
  const templeKey = getTempleKey(pooja.templeName || pooja.temple || '');

  const translateNakshatraLocal = (val: string, lang: string): string => {
    return val; // Simplified for brevity in rewrite, usually comes from map
  };

  const translateGothramLocal = (val: string, lang: string): string => {
    return val; // Simplified for brevity
  };

  const getDisplayDate = () => {
    const dateVal = booking?.scheduledDate || booking?.dateVal || '2026-06-15';
    const timeVal = booking?.scheduledTime || booking?.timeVal || '9:00 AM';
    return `${dateVal} — ${timeVal}`;
  };

  const devoteeInfo = {
    name: booking?.devoteeName || booking?.devoteeDetails?.name || t('profile.val.raghavan'),
    gothram: translateGothramLocal(booking?.devoteeDetails?.gotra || booking?.gotra || booking?.gothram || 'Bharadwaja', language),
    nakshatra: translateNakshatraLocal(booking?.devoteeDetails?.nakshatra || booking?.nakshatra || 'Shravana', language),
    poojaName: booking?.poojaName || t('poojaDb.' + pooja.id + '.title'),
    date: getDisplayDate(),
    temple: booking?.templeName || t('templeDb.' + templeKey + '.name'),
  };

  const getBookingStage = (b: any, d: any) => {
    let stage = 1; // Seva Offered
    if (b.status === 'CONFIRMED' || b.paymentStatus === 'PAID' || b.paymentStatus === 'Confirmed') stage = 2; // Confirmed
    if (b.pujari || b.status === 'SCHEDULED') stage = 3; // Scheduled
    if (b.streamStatus === 'In Progress') stage = 4; // Pooja Live
    if (b.streamStatus === 'Ended') stage = 5; // Completed
    if (b.recordingStatus === 'Available') stage = 6; // Recording Ready
    
    // Delivery stages
    if (d?.status === 'PACKED' || b.deliveryStatus === 'Packed') stage = 7;
    if (d?.status === 'SHIPPED' || d?.status === 'OUT_FOR_DELIVERY' || b.deliveryStatus === 'Dispatched') stage = 8;
    if (d?.status === 'DELIVERED' || b.deliveryStatus === 'Delivered') stage = 9;
    
    return stage;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const b = booking || {};
  const d = delivery || null;

  const bStatus = (b.status || '').toUpperCase();
  const bStreamStatus = (b.streamStatus || '').toUpperCase();
  const bRecordingStatus = (b.recordingStatus || '').toUpperCase();
  const bDeliveryStatus = (b.deliveryStatus || '').toUpperCase();
  const dStatus = (d?.status || '').toUpperCase();

  // ---- Explicit PRO action flags ----
  // pujariAssigned: true only when PRO clicks "Save Assignment" in BookingDetail
  const pujariIsAssigned = b.pujariAssigned === true;
  // Prasad packed: only when PRO explicitly clicks "Mark as Packed" in DeliveryDetail
  const prasadPackedByPro = d?.prasadPackedByPro === true || bDeliveryStatus === 'PACKED';
  // Prasad shipped: when PRO clicks "Confirm Dispatch" 
  const prasadShipped = dStatus === 'SHIPPED' || dStatus === 'OUT_FOR_DELIVERY' || dStatus === 'DELIVERED'
                       || bDeliveryStatus === 'SHIPPED' || bDeliveryStatus === 'DISPATCHED';
  const prasadDelivered = dStatus === 'DELIVERED' || bDeliveryStatus === 'DELIVERED';

  // Stream / completion flags
  const poojaIsLive = bStreamStatus === 'LIVE' || bStatus === 'IN_PROGRESS';
  const poojaIsEnded = bStreamStatus === 'ENDED' || bStatus === 'COMPLETED';
  const recordingReady = bRecordingStatus === 'AVAILABLE' || bRecordingStatus === 'READY';

  const stages = [
    {
      id: 1,
      nameKey: 'journey.sevaOffered',
      descKey: 'journey.sevaOfferedDesc',
      isCompleted: true,
      isCurrent: false,
      timestamp: b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate().toLocaleString() : new Date(b.createdAt.seconds * 1000).toLocaleString()) : undefined,
    },
    {
      id: 2,
      nameKey: 'journey.pujariAssigned',
      descKey: 'journey.pujariAssignedDesc',
      // Completed only when PRO explicitly assigns via BookingDetail (sets pujariAssigned: true)
      isCompleted: pujariIsAssigned,
      isCurrent: !pujariIsAssigned && (bStatus === 'CONFIRMED' || bStatus === 'SCHEDULED'),
      timestamp: pujariIsAssigned ? `Assigned: ${b.priestName || b.pujari}` : undefined,
    },
    {
      id: 3,
      nameKey: 'journey.poojaScheduled',
      descKey: 'journey.poojaScheduledDesc',
      // Scheduled is confirmed once pujari is assigned (date/time always present from booking)
      isCompleted: pujariIsAssigned && !!(b.scheduledDate && b.scheduledTime),
      isCurrent: pujariIsAssigned && !(b.scheduledDate && b.scheduledTime),
      timestamp: (b.scheduledDate && b.scheduledTime) ? `${formatDateString(b.scheduledDate)} at ${b.scheduledTime}` : undefined,
    },
    {
      id: 4,
      nameKey: 'journey.goingLive',
      descKey: 'journey.goingLiveDesc',
      isCompleted: poojaIsLive || poojaIsEnded,
      isCurrent: pujariIsAssigned && !!(b.scheduledDate && b.scheduledTime) && !(poojaIsLive || poojaIsEnded),
      timestamp: poojaIsLive 
        ? 'Pooja is LIVE' 
        : readiness 
          ? `Preparation: ${readiness.progressPercent}% Ready` 
          : undefined,
    },
    {
      id: 5,
      nameKey: 'journey.poojaCompleted',
      descKey: 'journey.poojaCompletedDesc',
      isCompleted: poojaIsEnded,
      isCurrent: poojaIsLive,
      timestamp: poojaIsEnded ? 'Concluded' : undefined,
    },
    {
      id: 6,
      nameKey: 'journey.recordingReady',
      descKey: 'journey.recordingReadyDesc',
      isCompleted: recordingReady,
      isCurrent: poojaIsEnded && !recordingReady,
      ctaKey: 'bookings.watchRecording',
    },
    {
      id: 7,
      nameKey: 'journey.prasadPacked',
      descKey: 'journey.prasadPackedDesc',
      // Only mark as packed when PRO explicitly clicks "Mark as Packed" (sets prasadPackedByPro: true)
      isCompleted: prasadPackedByPro || prasadShipped || prasadDelivered,
      isCurrent: poojaIsEnded && !prasadPackedByPro && !prasadShipped && !prasadDelivered,
    },
    {
      id: 8,
      nameKey: 'journey.prasadDispatched',
      descKey: 'journey.prasadDispatchedDesc',
      isCompleted: prasadShipped || prasadDelivered,
      isCurrent: prasadPackedByPro && !prasadShipped && !prasadDelivered,
      ctaKey: 'bookings.trackPrasad',
    },
    {
      id: 9,
      nameKey: 'journey.prasadDelivered',
      descKey: 'journey.prasadDeliveredDesc',
      isCompleted: prasadDelivered,
      isCurrent: prasadShipped && !prasadDelivered,
    },
  ];

  const getIcon = (idx: number, isCompleted: boolean, isCurrent: boolean) => {
    const size = 18;
    const color = isCompleted
      ? (theme === 'dark' ? '#1A0A00' : '#F5F5F0')
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
            <Text 
              className="text-xs" 
              style={{ 
                color: theme === 'dark' ? '#A8A29E' : '#78716C', 
                fontFamily: 'System' 
              }}
            >
              {t('bookingConfirmation.bookingId')}: {mappedDisplayId || displayId}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, paddingBottom: 120 }} className="flex-1">
        {/* Devotee Details Summary Card */}
        <View className="bg-card border border-border rounded-2xl p-5 mb-8">
          <Text className="font-bold text-primary text-xs uppercase tracking-wider mb-3" style={{ fontFamily: 'System' }}>{t('journey.sankalpamDetails')}</Text>
          <View className="gap-y-2.5">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs" style={{ color: theme === 'dark' ? '#A8A29E' : '#78716C', fontFamily: 'System' }}>
                {t('journey.poojaSeva')}
              </Text>
              <Text className="text-xs font-semibold" style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}>
                {devoteeInfo.poojaName}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs" style={{ color: theme === 'dark' ? '#A8A29E' : '#78716C', fontFamily: 'System' }}>
                {t('journey.templeLocation')}
              </Text>
              <Text className="text-xs font-semibold text-right max-w-[180px]" style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}>
                {devoteeInfo.temple}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs" style={{ color: theme === 'dark' ? '#A8A29E' : '#78716C', fontFamily: 'System' }}>
                {t('journey.devoteeName')}
              </Text>
              <Text className="text-xs font-semibold" style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}>
                {devoteeInfo.name}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs" style={{ color: theme === 'dark' ? '#A8A29E' : '#78716C', fontFamily: 'System' }}>
                {t('journey.gothramNakshatra')}
              </Text>
              <Text className="text-xs font-semibold" style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}>
                {devoteeInfo.gothram} / {devoteeInfo.nakshatra}
              </Text>
            </View>
            {delivery?.trackingNumber && (
              <View className="flex-row justify-between mb-1.5 pt-2 border-t border-border/50">
                <Text className="text-xs text-muted-foreground">Tracking No.</Text>
                <Text className="text-xs font-bold text-secondary">{delivery.trackingNumber} ({delivery.courier})</Text>
              </View>
            )}
          </View>
        </View>

        {/* Timeline */}
        <View className="px-2">
          {stages.map((stage, index) => {
            const isCompleted = stage.isCompleted;
            const isCurrent = stage.isCurrent;
            const isLast = index === stages.length - 1;

            return (
              <View key={stage.id} className="flex-row relative pb-8">
                {/* Connector Line */}
                {!isLast && (
                  <View 
                    className={`absolute left-[20px] top-[36px] w-[2px] h-full ${
                      isCompleted && stages[index + 1]?.isCompleted ? 'bg-primary' : 'bg-muted'
                    }`} 
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
                      className="font-bold text-sm"
                      style={{ 
                        color: isCurrent 
                          ? '#F97316' 
                          : isCompleted 
                          ? (theme === 'dark' ? '#F5F5F0' : '#1C1917') 
                          : (theme === 'dark' ? '#A8A29E' : '#78716C'),
                        fontFamily: 'System',
                        fontWeight: isCompleted || isCurrent ? '600' : 'normal'
                      }}
                    >
                      {t(stage.nameKey)}
                    </Text>
                    {isCompleted && (
                      <Text className="text-xs text-primary font-bold">✓</Text>
                    )}
                  </View>
                  <Text 
                    className="text-xs leading-relaxed mb-2" 
                    style={{ 
                      color: isCompleted || isCurrent
                        ? (theme === 'dark' ? '#F5F5F0' : '#44403C')
                        : (theme === 'dark' ? '#A8A29E' : '#78716C'),
                      fontFamily: 'System' 
                    }}
                  >
                    {stage.id === 2 
                      ? (booking?.priestName || booking?.pujari
                          ? t(stage.descKey).replace('Pandit Ramesh Sharma', booking.priestName || booking.pujari)
                          : t(stage.descKey).replace('Pandit Ramesh Sharma has been assigned', 'A qualified pujari will be assigned').replace('Pandit Ramesh Sharma', 'A qualified pujari'))
                      : stage.id === 3 && booking?.scheduledDate
                      ? t(stage.descKey)
                          .replace('15 April', formatDateString(booking.scheduledDate))
                          .replace('9:00 AM', booking.scheduledTime || '9:00 AM')
                      : t(stage.descKey)}
                  </Text>
                  {stage.timestamp && (
                    <Text 
                      className="text-[10px]" 
                      style={{ 
                        color: isCompleted || isCurrent 
                          ? (theme === 'dark' ? '#A8A29E' : '#78716C') 
                          : (theme === 'dark' ? '#57524E' : '#CBD5E1'),
                        fontFamily: 'System' 
                      }}
                    >
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
                      <Text className="text-primary font-semibold text-xs" style={{ fontFamily: 'System' }} numberOfLines={1}>{t(stage.ctaKey)}</Text>
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
          onPress={() => router.push(`/live/${cleanId}?poojaId=${pooja.id}` as any)}
          className="flex-1 py-3.5 rounded-xl bg-primary items-center justify-center active:bg-[#E05C10]"
        >
          <Text className="text-primary-foreground font-semibold text-sm" style={{ fontFamily: 'System' }} numberOfLines={1}>{t('journey.watchBroadcast')}</Text>
        </Pressable>
        <Pressable 
          disabled
          className="flex-1 py-3.5 rounded-xl border border-border bg-card items-center justify-center opacity-50"
        >
          <Text className="font-semibold text-sm" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }} numberOfLines={1}>{t('journey.trackPrasad')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
