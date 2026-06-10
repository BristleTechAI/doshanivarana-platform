import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Image, Modal, ActivityIndicator, TextInput } from 'react-native';
import { CheckCircle2, Clock, Package, PlayCircle, Video, CreditCard, AlertCircle, Check } from 'lucide-react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { safeStorage } from '../../src/old_app/lib/storage';
import { firestore } from '../../src/lib/firebase';
import type { Booking } from '@devaseva/core';
import { Star, X } from 'lucide-react-native';

const getBookingStage = (b: any) => {
  let stage = 1; // Seva Offered
  if (b.paymentStatus === 'PAID') stage = 2; // Confirmed
  if (b.status === 'SCHEDULED' || b.priestId) stage = 3; // Scheduled
  if (b.status === 'COMPLETED') stage = 5; // Completed
  return stage;
};

interface BookingItem {
  id: string;
  poojaId: string;
  poojaName: string;
  templeId: string;
  templeName: string;
  dateVal?: string;
  timeVal?: string;
  status: string;
  currentStage: number;
  imageUrl: string;
  totalAmount?: number;
}

export default function Bookings() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [bookingsList, setBookingsList] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Feedback Modal States
  const [feedbackModal, setFeedbackModal] = useState<{isOpen: boolean, booking: BookingItem | null}>({isOpen: false, booking: null});
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const userSession = safeStorage.getItem('doshanivarana_logged_in_user');
      const userId = userSession ? JSON.parse(userSession).id : 'anonymous_user';

      const snapshot = await firestore()
        .collection('bookings')
        .where('userId', '==', userId)
        .where('isDeleted', '==', false)
        .get();

      const loadedBookings = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          poojaId: data.poojaId,
          poojaName: data.poojaName || 'Pooja',
          templeId: data.templeId,
          templeName: data.templeName || 'Temple',
          dateVal: data.scheduledDate,
          timeVal: data.scheduledTime,
          status: data.status === 'COMPLETED' ? 'completed' : 'upcoming',
          currentStage: getBookingStage(data),
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
          totalAmount: data.amountPaid || 0,
        } as BookingItem;
      });

      // Sort by date descending
      loadedBookings.sort((a, b) => {
        if (!a.dateVal || !b.dateVal) return 0;
        return b.dateVal.localeCompare(a.dateVal);
      });

      setBookingsList(loadedBookings);
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  const filteredBookings = bookingsList.filter(booking => 
    activeTab === 'active' ? booking.status === 'upcoming' : booking.status === 'completed'
  );

  const handleFeedbackSubmit = async () => {
    if (!feedbackModal.booking) return;
    setSubmittingFeedback(true);
    try {
      const userSession = safeStorage.getItem('doshanivarana_logged_in_user');
      const userId = userSession ? JSON.parse(userSession).id : 'anonymous_user';
      const b = feedbackModal.booking;

      // 1. Create Feedback doc with bookingId as ID to prevent duplicates
      await firestore().collection('feedback').doc(b.id).set({
        bookingId: b.id,
        userId: userId,
        templeId: b.templeId,
        poojaId: b.poojaId,
        rating: rating,
        review: review,
        status: 'PENDING',
        createdAt: firestore.FieldValue.serverTimestamp()
      });

      // 2. Generate System Event
      await firestore().collection('systemEvents').doc().set({
        eventType: 'feedback.created',
        entityId: b.id,
        entityType: 'feedback',
        payload: {
          feedbackId: b.id,
          bookingId: b.id,
          userId: userId,
          templeId: b.templeId,
          rating: rating
        },
        status: 'PENDING',
        createdAt: firestore.FieldValue.serverTimestamp()
      });

      setFeedbackModal({isOpen: false, booking: null});
      setRating(5);
      setReview('');
      alert("Thank you for your feedback!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

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

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : filteredBookings.length === 0 ? (
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
              onFeedback={() => setFeedbackModal({isOpen: true, booking})}
            />
          ))
        )}
      </ScrollView>

      {/* Feedback Modal */}
      <Modal visible={feedbackModal.isOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-card rounded-t-3xl p-6 h-[70%]">
            <View className="flex-row items-center justify-between pb-4 border-b border-border mb-4">
              <Text className="text-xl font-bold text-foreground">Rate Experience</Text>
              <Pressable onPress={() => setFeedbackModal({isOpen: false, booking: null})} className="p-2">
                <X size={24} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
              </Pressable>
            </View>
            <ScrollView>
              <Text className="text-sm text-muted-foreground mb-4">How was your pooja experience for {feedbackModal.booking?.poojaName}?</Text>
              
              <View className="flex-row justify-center gap-4 mb-8 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setRating(star)}>
                    <Star 
                      size={40} 
                      color={star <= rating ? "#EAB308" : "#78716C"} 
                      fill={star <= rating ? "#EAB308" : "transparent"} 
                    />
                  </Pressable>
                ))}
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium block mb-2 text-foreground">Write a Review</Text>
                <View className="border border-border rounded-xl bg-background p-1">
                  <TextInput
                    multiline
                    numberOfLines={4}
                    value={review}
                    onChangeText={setReview}
                    placeholder="Tell us more about your experience..."
                    placeholderTextColor="#78716C"
                    style={{ minHeight: 100, textAlignVertical: 'top', padding: 12, color: theme === 'dark' ? '#F5F5F0' : '#1C1917' }}
                  />
                </View>
              </View>

              <Pressable 
                onPress={handleFeedbackSubmit}
                disabled={submittingFeedback}
                className={`w-full py-4 rounded-xl items-center justify-center flex-row gap-2 ${submittingFeedback ? 'bg-primary/50' : 'bg-primary active:bg-[#E05C10]'}`}
              >
                {submittingFeedback ? (
                  <ActivityIndicator color="#1A0A00" />
                ) : (
                  <Text className="text-[#1A0A00] font-bold text-base">Submit Feedback</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

function BookingCard({
  id,
  poojaName,
  templeName,
  dateVal,
  timeVal,
  status,
  currentStage,
  imageUrl,
  onFeedback,
}: BookingItem & { onFeedback: () => void }) {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const stages = [
    { labelKey: 'journey.sevaOffered', icon: CheckCircle2 },
    { labelKey: 'journey.confirmed', icon: CheckCircle2 },
    { labelKey: 'journey.poojaScheduled', icon: Clock },
    { labelKey: 'journey.goingLive', icon: PlayCircle },
    { labelKey: 'journey.poojaCompleted', icon: CheckCircle2 },
  ];

  const getDisplayDate = () => {
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
              {poojaName}
            </Text>
            <Text className="text-sm text-muted-foreground mb-2" style={{ fontFamily: 'System' }}>
              {templeName}
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
              status === 'upcoming'
                ? 'bg-primary/10'
                : 'bg-green-500/10'
            }`}
          >
            <Text className={`text-xs font-medium ${
              status === 'upcoming' ? 'text-primary' : 'text-green-500'
            }`}>
              {status === 'upcoming' ? t('common.upcoming') : t('common.completed')}
            </Text>
          </View>
          <Text className="text-xs text-muted-foreground mt-2" style={{ fontFamily: 'System' }}>
            {getDisplayDate()}
          </Text>
        </View>
      </View>

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

        {/* Feedback Button for Completed */}
        {status === 'completed' && (
          <Pressable 
            onPress={onFeedback}
            className="w-full mt-2 py-3 rounded-xl border border-border bg-card flex-row items-center justify-center gap-2 active:bg-muted/30"
          >
            <Star size={16} color="#EAB308" fill="#EAB308" />
            <Text className="font-medium text-sm text-foreground">Leave Feedback</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
