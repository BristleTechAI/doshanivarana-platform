import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Image, Modal, ActivityIndicator } from 'react-native';
import { CheckCircle2, Clock, Package, PlayCircle, Video, CreditCard, AlertCircle, Check } from 'lucide-react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { getTranslatedTemple } from './poojas';
import { safeStorage } from '../../src/old_app/lib/storage';

const getPoojaDetails = (poojaName: string) => {
  const nameLower = poojaName.toLowerCase();
  if (nameLower.includes('rudra')) {
    return { id: 1, key: 'rameshwaram', imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNDQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080' };
  }
  if (nameLower.includes('ganapathi') || nameLower.includes('ganesha')) {
    return { id: 6, key: 'siddhiVinayak', imageUrl: 'https://images.unsplash.com/photo-1609137144814-7e77a28e75cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlJTIwYWx0YXIlMjBob21hbXxlbnwxfHx8fDE3NzM4MjU0NTR8MA&ixlib=rb-4.1.0&q=80&w=1080' };
  }
  if (nameLower.includes('lakshmi')) {
    return { id: 8, key: 'madurai', imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyBGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080' };
  }
  if (nameLower.includes('navagraha')) {
    return { id: 7, key: 'siddhiVinayak', imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNDQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080' };
  }
  if (nameLower.includes('satyanarayana')) {
    return { id: 16, key: 'tirumala', imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080' };
  }
  return { id: 16, key: 'tirumala', imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080' };
};

const getBookingStage = (b: any) => {
  let stage = 1; // Seva Offered
  if (b.paymentStatus === 'Confirmed') stage = 2; // Confirmed
  if (b.pujari !== 'Not Assigned') stage = 3; // Scheduled
  if (b.streamStatus === 'In Progress') stage = 4; // Pooja Live
  if (b.streamStatus === 'Ended') stage = 5; // Completed
  if (b.recordingStatus === 'Available') stage = 6; // Recording Ready
  if (b.deliveryStatus === 'Packed') stage = 7; // Prasad Packed
  if (b.deliveryStatus === 'Dispatched' || b.deliveryStatus === 'In Transit' || b.deliveryStatus === 'Out for Delivery') stage = 8; // Dispatched / In Transit / Out for Delivery
  if (b.deliveryStatus === 'Delivered') stage = 9; // Delivered
  return stage;
};

interface BookingItem {
  id: string;
  poojaId: number;
  templeKey: string;
  dateKey: string;
  dateVal?: string;
  timeVal?: string;
  status: string;
  currentStage: number;
  imageUrl: string;
  hasRecording?: boolean;
  totalAmount?: number;
  paidAmount?: number;
  remainingBalance?: number;
  balanceDue?: boolean;
}

const defaultBookings: BookingItem[] = [
  {
    id: 'DS2026031801',
    poojaId: 16,
    templeKey: 'tirumala',
    dateKey: 'booking.date1',
    status: 'upcoming',
    currentStage: 2,
    imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'DS2026032203',
    poojaId: 10,
    templeKey: 'varanasi',
    dateKey: 'booking.date2',
    status: 'upcoming',
    currentStage: 1,
    imageUrl: 'https://images.unsplash.com/photo-1609137144814-7e77a28e75cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlJTIwYWx0YXIlMjBob21hbXxlbnwxfHx8fDE3NzM4MjU0NTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    totalAmount: 2500,
    paidAmount: 1000,
    remainingBalance: 1500,
    balanceDue: true,
  },
  {
    id: 'DS2026031502',
    poojaId: 1,
    templeKey: 'rameshwaram',
    dateKey: 'booking.date3',
    status: 'completed',
    currentStage: 9,
    hasRecording: true,
    imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export default function Bookings() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [currentUserMobile, setCurrentUserMobile] = useState<string | null>(null);
  const [bookingsList, setBookingsList] = useState<BookingItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingBooking, setPayingBooking] = useState<BookingItem | null>(null);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');

  const fetchBookings = useCallback(() => {
    const userSession = safeStorage.getItem('doshanivarana_logged_in_user');
    const mobile = userSession ? JSON.parse(userSession).mobile : '+91 98765 43216'; // default to Suresh Raina for demo
    setCurrentUserMobile(mobile);

    let bookingsData = safeStorage.getItem('doshanivarana_bookings');
    if (!bookingsData) {
      const initialBookings = [
        {
          id: 'BK-1007',
          devoteeName: 'Suresh Raina',
          mobile: '+91 98765 43216',
          poojaName: 'Rudra Abhishekam',
          temple: 'Sri Venkateswara Temple',
          dateTime: '05 Jun 2026, 10:00 AM',
          paymentStatus: 'Confirmed',
          amount: '₹1,500',
          pujari: 'Pt. Sharma Ji',
          deliveryStatus: 'Delivered',
          streamStatus: 'Ended',
          recordingStatus: 'Available'
        },
        {
          id: 'BK-0990',
          devoteeName: 'Suresh Raina',
          mobile: '+91 98765 43216',
          poojaName: 'Satyanarayana Pooja',
          temple: 'Sri Venkateswara Temple',
          dateTime: '01 Jun 2026, 08:00 AM',
          paymentStatus: 'Confirmed',
          amount: '₹2,000',
          pujari: 'Pt. Sharma Ji',
          deliveryStatus: 'Delivered',
          streamStatus: 'Ended',
          recordingStatus: 'Available'
        }
      ];
      safeStorage.setItem('doshanivarana_bookings', JSON.stringify(initialBookings));
      bookingsData = JSON.stringify(initialBookings);
    }
    
    const allBookings = bookingsData ? JSON.parse(bookingsData) : [];

    // Filter bookings belonging to this mobile number using normalized 10-digit matching
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
    const userBookings = allBookings.filter((b: any) => 
      b.mobile && b.mobile.replace(/[^0-9]/g, '').slice(-10) === cleanMobile
    );

    // Map to the BookingItem format
    const mapped = userBookings.map((b: any) => {
      const details = getPoojaDetails(b.poojaName);
      const status = b.tab || (b.streamStatus === 'Ended' ? 'completed' : 'upcoming');
      const amountNum = parseInt(b.amount?.replace(/[^0-9]/g, '') || '0') || 0;
      
      const totalAmount = b.totalAmount !== undefined ? b.totalAmount : amountNum;
      const paidAmount = b.paidAmount !== undefined ? b.paidAmount : (b.balanceDue ? Math.floor(amountNum * 0.4) : amountNum);
      const remainingBalance = b.remainingBalance !== undefined ? b.remainingBalance : (b.balanceDue ? (totalAmount - paidAmount) : 0);
      const balanceDue = b.balanceDue !== undefined ? b.balanceDue : false;

      return {
        id: b.id,
        poojaId: details.id,
        templeKey: details.key,
        dateKey: b.dateTime, // Treated as direct display string by t() translation fallback
        status: status,
        currentStage: getBookingStage(b),
        imageUrl: details.imageUrl,
        hasRecording: b.recordingStatus === 'Available',
        totalAmount,
        paidAmount,
        remainingBalance,
        balanceDue,
      };
    });

    setBookingsList(mapped);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('storage', fetchBookings);
      window.addEventListener('focus', fetchBookings);
      window.addEventListener('doshanivarana_bookings_updated', fetchBookings);
    }

    return () => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('storage', fetchBookings);
        window.removeEventListener('focus', fetchBookings);
        window.removeEventListener('doshanivarana_bookings_updated', fetchBookings);
      }
    };
  }, [fetchBookings]);

  const processPayment = async () => {
    if (!payingBooking) return;
    setPaymentStep('processing');
    try {
      const bookingsData = safeStorage.getItem('doshanivarana_bookings');
      const allBookings = bookingsData ? JSON.parse(bookingsData) : [];
      const updatedAllBookings = allBookings.map((b: any) => {
        if (b.id === payingBooking.id) {
          return {
            ...b,
            paymentStatus: 'Confirmed',
            totalAmount: payingBooking.totalAmount,
            paidAmount: payingBooking.totalAmount,
            remainingBalance: 0,
            balanceDue: false
          };
        }
        return b;
      });
      safeStorage.setItem('doshanivarana_bookings', JSON.stringify(updatedAllBookings));

      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new Event('doshanivarana_bookings_updated'));
      }

      fetchBookings();

      setTimeout(() => {
        setPaymentStep('success');
      }, 1500);
    } catch (err) {
      console.error('Failed to process payment:', err);
    }
  };

  const filteredBookings = bookingsList.filter(booking => 
    activeTab === 'active' ? booking.status === 'upcoming' : booking.status === 'completed'
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View 
        className="pb-4 bg-background/95 border-b border-border z-40 px-6"
        style={{ paddingTop: insets.top > 0 ? insets.top + 8 : 16 }}
      >
        <Text className="text-2xl font-bold text-foreground" style={{ fontFamily: 'System' }}>
          {t('bookings.title')}
        </Text>
        <Text className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'System' }}>
          {t('bookings.subtitle')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} className="flex-1 space-y-6">
        {/* Tabs */}
        <View className="flex-row gap-2 p-1 bg-card rounded-xl border border-border mb-6">
          <Pressable 
            onPress={() => setActiveTab('active')}
            className={`flex-1 py-2.5 rounded-lg items-center justify-center ${
              activeTab === 'active' 
                ? 'bg-primary' 
                : 'bg-transparent'
            }`}
          >
            <Text className={`font-medium text-sm ${
              activeTab === 'active' ? 'text-primary-foreground' : 'text-muted-foreground'
            }`} style={{ fontFamily: 'System' }}>
              {t('common.active')}
            </Text>
          </Pressable>
          <Pressable 
            onPress={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 rounded-lg items-center justify-center ${
              activeTab === 'completed' 
                ? 'bg-primary' 
                : 'bg-transparent'
            }`}
          >
            <Text className={`font-medium text-sm ${
              activeTab === 'completed' ? 'text-primary-foreground' : 'text-muted-foreground'
            }`} style={{ fontFamily: 'System' }}>
              {t('common.completed')}
            </Text>
          </Pressable>
        </View>

        {/* Bookings */}
        <View className="space-y-4">
          {filteredBookings.length === 0 ? (
            <View className="items-center py-12">
              <View className="w-16 h-16 bg-muted/30 rounded-full items-center justify-center mb-4">
                <Package size={32} color="#78716C" />
              </View>
              <Text className="font-semibold text-lg text-foreground mb-1" style={{ fontFamily: 'System' }}>
                {activeTab === 'active' ? t('bookings.noActive') : t('bookings.noCompleted')}
              </Text>
              <Text className="text-sm text-muted-foreground text-center" style={{ fontFamily: 'System' }}>
                {activeTab === 'active' 
                  ? t('bookings.noActiveDesc') 
                  : t('bookings.noCompletedDesc')}
              </Text>
            </View>
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                {...booking} 
                onPayBalance={(id) => {
                  const target = bookingsList.find(b => b.id === id);
                  if (target) {
                    setPayingBooking(target);
                    setPaymentStep('details');
                    setShowPaymentModal(true);
                  }
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <Pressable className="absolute inset-0" onPress={() => paymentStep !== 'processing' && setShowPaymentModal(false)} />
          <View className="bg-card rounded-t-3xl p-6 border-t border-border/40">
            {paymentStep === 'details' && payingBooking && (
              <View className="space-y-4">
                <View className="flex-row items-center justify-between border-b border-border pb-4">
                  <Text className="font-bold text-lg text-foreground" style={{ fontFamily: 'System' }}>
                    {t('booking.completePayment')}
                  </Text>
                  <Pressable onPress={() => setShowPaymentModal(false)} className="p-1">
                    <Text className="text-muted-foreground text-sm font-semibold">{t('common.cancel')}</Text>
                  </Pressable>
                </View>

                <View className="bg-muted/30 p-4 rounded-xl space-y-2 mt-2">
                  <Text className="text-xs text-muted-foreground uppercase tracking-wider font-semibold" style={{ fontFamily: 'System' }}>
                    {t('booking.sevaDetails')}
                  </Text>
                  <Text className="font-bold text-base text-foreground" style={{ fontFamily: 'System' }}>
                    {t('poojaDb.' + payingBooking.poojaId + '.title')}
                  </Text>
                  <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
                    {t('templeDb.' + payingBooking.templeKey + '.name')}
                  </Text>
                  <View className="flex-row justify-between pt-2 border-t border-border/20 text-xs">
                    <Text className="text-muted-foreground">{t('bookingConfirmation.bookingId')}</Text>
                    <Text className="font-semibold text-foreground">{payingBooking.id}</Text>
                  </View>
                </View>

                <View className="space-y-2.5 mt-2">
                  <View className="flex-row justify-between text-sm">
                    <Text className="text-muted-foreground">{t('booking.totalPrice')}</Text>
                    <Text className="text-foreground">₹{payingBooking.totalAmount}</Text>
                  </View>
                  <View className="flex-row justify-between text-sm">
                    <Text className="text-muted-foreground">{t('booking.paidAdvance')}</Text>
                    <Text className="text-green-500">-₹{payingBooking.paidAmount}</Text>
                  </View>
                  <View className="flex-row justify-between pt-3 border-t border-border/40">
                    <Text className="font-bold text-base text-foreground">{t('booking.remainingBalanceDue')}</Text>
                    <Text className="font-bold text-lg text-primary">₹{payingBooking.remainingBalance}</Text>
                  </View>
                </View>

                <Pressable
                  onPress={processPayment}
                  className="w-full mt-6 py-4 rounded-xl bg-primary active:bg-[#E05C10] items-center justify-center"
                >
                  <Text className="text-primary-foreground font-semibold text-base" style={{ fontFamily: 'System' }}>
                    {t('booking.payBalanceAmount').replace('{amount}', payingBooking.remainingBalance?.toString() ?? '0')}
                  </Text>
                </Pressable>
              </View>
            )}

            {paymentStep === 'processing' && (
              <View className="py-12 items-center justify-center space-y-4">
                <ActivityIndicator size="large" color="#F97316" />
                <Text className="font-bold text-lg text-foreground mt-4" style={{ fontFamily: 'System' }}>
                  {t('booking.processingOffering')}
                </Text>
                <Text className="text-xs text-muted-foreground text-center px-6" style={{ fontFamily: 'System' }}>
                  {t('booking.processingDesc')}
                </Text>
              </View>
            )}

            {paymentStep === 'success' && payingBooking && (
              <View className="py-8 items-center justify-center space-y-4">
                <View className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full items-center justify-center mb-2">
                  <Check size={32} color="#22C55E" />
                </View>
                <Text className="font-bold text-2xl text-green-500 text-center" style={{ fontFamily: 'System' }}>
                  {t('booking.paymentSuccess')}
                </Text>
                <Text className="text-sm text-foreground text-center font-medium px-4" style={{ fontFamily: 'System' }}>
                  {t('booking.confirmSuccess').replace('{title}', t('poojaDb.' + payingBooking.poojaId + '.title'))}
                </Text>
                <Text className="text-xs text-muted-foreground text-center px-8" style={{ fontFamily: 'System' }}>
                  {t('booking.sankalpamNote')}
                </Text>
                <Pressable
                  onPress={() => setShowPaymentModal(false)}
                  className="w-full mt-6 py-3.5 rounded-xl bg-primary active:bg-[#E05C10] items-center justify-center"
                >
                  <Text className="text-[#1A0A00] font-semibold text-sm">{t('common.close')}</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function BookingCard({
  id,
  poojaId,
  templeKey,
  dateKey,
  dateVal,
  timeVal,
  status,
  currentStage,
  imageUrl,
  hasRecording,
  totalAmount,
  paidAmount,
  remainingBalance,
  balanceDue,
  onPayBalance,
}: {
  id: string;
  poojaId: number;
  templeKey: string;
  dateKey: string;
  dateVal?: string;
  timeVal?: string;
  status: string;
  currentStage: number;
  imageUrl: string;
  hasRecording?: boolean;
  totalAmount?: number;
  paidAmount?: number;
  remainingBalance?: number;
  balanceDue?: boolean;
  onPayBalance?: (id: string) => void;
}) {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const stages = [
    { labelKey: 'journey.sevaOffered', icon: CheckCircle2 },
    { labelKey: 'journey.confirmed', icon: CheckCircle2 },
    { labelKey: 'journey.poojaScheduled', icon: Clock },
    { labelKey: 'journey.goingLive', icon: PlayCircle },
    { labelKey: 'journey.poojaCompleted', icon: CheckCircle2 },
    { labelKey: 'journey.recordingReady', icon: PlayCircle },
    { labelKey: 'journey.prasadPacked', icon: Package },
    { labelKey: 'journey.prasadDispatched', icon: Package },
    { labelKey: 'journey.prasadDelivered', icon: CheckCircle2 },
  ];

  const getDisplayDate = () => {
    if (dateKey && dateKey.startsWith('booking.date')) {
      return t(dateKey);
    }
    if (dateVal) {
      const monthMap: Record<string, Record<string, string>> = {
        '03': { en: 'March', te: 'మార్చి', hi: 'मार्च', gu: 'માર્ચ' },
        '04': { en: 'April', te: 'ఏప్రిల్', hi: 'अप्रैल', gu: 'એપ્રિલ' }
      };
      
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parseInt(parts[2]).toString();
        const monthName = monthMap[month]?.[language] || 'March';
        return `${day} ${monthName} ${year}${timeVal ? ' — ' + timeVal : ''}`;
      }
      return dateVal;
    }
    return '';
  };

  return (
    <View className="bg-card border border-border rounded-2xl overflow-hidden mb-4">
      {/* Header */}
      <View className="flex-row gap-4 p-4 border-b border-border">
        <Image
          source={{ uri: imageUrl }}
          className="w-20 h-20 rounded-xl"
          resizeMode="cover"
        />
        <View className="flex-1 justify-between">
          <View>
            <Text className="font-semibold text-lg text-foreground mb-1" style={{ fontFamily: 'System' }}>
              {t('poojaDb.' + poojaId + '.title')}
            </Text>
            <Text className="text-sm text-muted-foreground mb-2" style={{ fontFamily: 'System' }}>
              {t('templeDb.' + templeKey + '.name')}
            </Text>
            <View className="self-start px-2 py-1 bg-muted/50 rounded">
              <Text
                className="text-xs text-muted-foreground"
                style={{ fontFamily: 'System' }}
              >
                {id}
              </Text>
            </View>
          </View>
        </View>
        <View className="items-end justify-between">
          <View
            className={`px-3 py-1 rounded-full ${
              balanceDue
                ? 'bg-red-500/10'
                : status === 'upcoming'
                ? 'bg-primary/10'
                : 'bg-green-500/10'
            }`}
          >
            <Text className={`text-xs font-medium ${
              balanceDue ? 'text-red-500' : status === 'upcoming' ? 'text-primary' : 'text-green-500'
            }`}>
              {balanceDue ? t('booking.remainingBalanceDue') : status === 'upcoming' ? t('common.upcoming') : t('common.completed')}
            </Text>
          </View>
          <Text className="text-xs text-muted-foreground mt-2" style={{ fontFamily: 'System' }}>
            {getDisplayDate()}
          </Text>
        </View>
      </View>

      {/* Remaining Balance Info Section */}
      {balanceDue && remainingBalance && (
        <View className="px-4 py-4 bg-red-500/5 border-b border-border">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-1.5">
              <AlertCircle size={14} color="#EF4444" />
              <Text className="text-xs font-bold text-red-500" style={{ fontFamily: 'System' }}>
                {t('booking.remainingBalanceDue')}
              </Text>
            </View>
            <Text className="text-base font-bold text-red-500" style={{ fontFamily: 'System' }}>
              ₹{remainingBalance}
            </Text>
          </View>
          
          <View className="flex-row justify-between mb-3 text-xs text-muted-foreground">
            <Text style={{ fontFamily: 'System' }}>{t('booking.totalPrice')}: ₹{totalAmount}</Text>
            <Text style={{ fontFamily: 'System' }}>{t('booking.paidAdvance')}: ₹{paidAmount}</Text>
          </View>

          <Pressable 
            onPress={() => onPayBalance?.(id)}
            className="w-full py-2.5 rounded-xl bg-primary active:bg-[#E05C10] items-center justify-center flex-row gap-2"
          >
            <CreditCard size={15} color={theme === 'dark' ? '#1A0A00' : '#F5F5F0'} />
            <Text className="text-primary-foreground font-semibold text-xs" style={{ fontFamily: 'System' }}>
              {t('booking.payBalanceAmount').replace('{amount}', remainingBalance.toString())}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Journey Timeline */}
      <View className="p-4">
        <Text className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: 'System' }}>
          {t('bookings.poojaJourney')}
        </Text>
        <View className="space-y-3 mb-4">
          {stages.slice(0, 5).map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = index < currentStage;
            const isCurrent = index === currentStage;

            return (
              <View key={index} className="flex-row items-center gap-3 mt-2">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    isCompleted
                      ? 'bg-primary'
                      : isCurrent
                      ? 'bg-primary/20 border-2 border-primary/40'
                      : 'bg-muted'
                  }`}
                >
                  <Icon size={16} color={
                    isCompleted ? (theme === 'dark' ? '#1A0A00' : '#F5F5F0') : 
                    isCurrent ? '#F97316' : 
                    '#78716C'
                  } />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-sm font-medium ${
                      isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                    style={{ fontFamily: 'System' }}
                  >
                    {t(stage.labelKey)}
                  </Text>
                </View>
                {isCompleted && (
                  <Text className="text-xs text-muted-foreground">✓</Text>
                )}
              </View>
            );
          })}
        </View>
        
        <Link href={`/journey/${id}`} asChild>
          <Pressable className="w-full mt-4 py-2.5 rounded-xl border-2 border-primary items-center justify-center active:bg-primary/5">
            <Text className="text-primary font-medium text-sm">
              {t('bookings.viewJourney')}
            </Text>
          </Pressable>
        </Link>
        
        {/* Recording Button for Completed Bookings */}
        {hasRecording && (
          <Link href={`/live/${id.replace('DS', '')}`} asChild>
            <Pressable className="w-full mt-3 py-2.5 rounded-xl bg-primary active:bg-[#E05C10] items-center justify-center flex-row gap-2">
              <Video size={16} color={theme === 'dark' ? '#1A0A00' : '#F5F5F0'} />
              <Text className="text-primary-foreground font-medium text-sm">
                {t('bookings.watchRecording')}
              </Text>
            </Pressable>
          </Link>
        )}
      </View>
    </View>
  );
}
