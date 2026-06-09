import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Circle, Clock, Package, PlayCircle, Truck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';

export default function PoojaJourneyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // Mock devotee details for this booking
  const devoteeInfo = {
    name: 'Raghavan Iyer',
    gothram: 'Bharadwaja',
    nakshatra: 'Shravana',
    poojaName: 'Rudrabhishek',
    date: '15 April 2026',
    temple: 'Sri Kalahasti Shivalayam, Tirupati',
  };

  const currentStage = 4; // Mock active stage: "Pooja Completed" is active, first 4 are completed

  const stages = [
    {
      id: 1,
      name: 'Seva Offered',
      desc: 'Your ritual request has been received with devotion.',
      timestamp: 'March 10, 2026 — 3:45 PM',
    },
    {
      id: 2,
      name: 'Pujari Assigned',
      desc: 'Pandit Ramesh Sharma has been assigned to conduct your seva.',
      timestamp: 'March 10, 2026 — 4:12 PM',
    },
    {
      id: 3,
      name: 'Scheduled',
      desc: 'Sankalpam timed for 15 April at 9:00 AM IST.',
      timestamp: 'March 11, 2026 — 10:00 AM',
    },
    {
      id: 4,
      name: 'Pooja Live',
      desc: 'Sacred live stream was broadcasted. Blessings shared.',
      timestamp: 'April 15, 2026 — 9:00 AM',
    },
    {
      id: 5,
      name: 'Completed',
      desc: 'Pooja performed successfully in your name and Gothram.',
      timestamp: 'April 15, 2026 — 11:00 AM',
    },
    {
      id: 6,
      name: 'Recording Ready',
      desc: 'Your dedicated pooja video archive is preparing.',
      cta: 'Watch Recording',
    },
    {
      id: 7,
      name: 'Prasad Packed',
      desc: 'Sacred elements packaged in the Devaseva blessing box.',
    },
    {
      id: 8,
      name: 'Dispatched',
      desc: 'Your Prasad is on the way. Tracking details pending.',
      cta: 'Track Delivery',
    },
    {
      id: 9,
      name: 'Delivered',
      desc: 'May the sacred offerings bring peace to your home.',
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
              Pooja Journey
            </Text>
            <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
              ID: {id || 'DS2026031801'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, paddingBottom: 120 }} className="flex-1">
        {/* Devotee Details Summary Card */}
        <View className="bg-card border border-border rounded-2xl p-5 mb-8">
          <Text className="font-bold text-primary text-xs uppercase tracking-wider mb-3">Sankalpam Details</Text>
          <View className="space-y-2.5">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-muted-foreground">Pooja Seva</Text>
              <Text className="text-xs font-semibold text-foreground">{devoteeInfo.poojaName}</Text>
            </View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-muted-foreground">Temple Location</Text>
              <Text className="text-xs font-semibold text-foreground text-right max-w-[180px]">{devoteeInfo.temple}</Text>
            </View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-muted-foreground">Devotee Name</Text>
              <Text className="text-xs font-semibold text-foreground">{devoteeInfo.name}</Text>
            </View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-muted-foreground">Gothram / Nakshatra</Text>
              <Text className="text-xs font-semibold text-foreground">{devoteeInfo.gothram} / {devoteeInfo.nakshatra}</Text>
            </View>
          </View>
        </View>

        {/* Timeline Timeline */}
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
                    className={`absolute left-[20px] top-[36px] w-[2px] h-full ${
                      isCompleted 
                        ? 'bg-primary' 
                        : isCurrent 
                        ? 'bg-gradient-to-b from-primary to-border' 
                        : 'bg-muted'
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
                      className={`font-bold text-sm ${
                        isCompleted || isCurrent ? 'text-foreground font-semibold' : 'text-muted-foreground'
                      } ${isCurrent ? 'text-primary' : ''}`}
                      style={{ fontFamily: 'System' }}
                    >
                      {stage.name}
                    </Text>
                    {isCompleted && (
                      <Text className="text-xs text-primary font-bold">✓</Text>
                    )}
                  </View>
                  <Text className="text-xs text-muted-foreground leading-relaxed mb-2" style={{ fontFamily: 'System' }}>
                    {stage.desc}
                  </Text>
                  {stage.timestamp && (
                    <Text className="text-[10px] text-muted-foreground/60" style={{ fontFamily: 'System' }}>
                      {stage.timestamp}
                    </Text>
                  )}

                  {/* CTA button if applicable */}
                  {stage.cta && isCompleted && (
                    <Pressable
                      onPress={() => {
                        if (stage.cta === 'Watch Recording') {
                          router.push(`/live/${id ? id.toString().replace('DS', '') : '1'}` as any);
                        }
                      }}
                      className="mt-2.5 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg self-start active:bg-primary/20"
                    >
                      <Text className="text-primary font-semibold text-xs">{stage.cta}</Text>
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
          <Text className="text-[#1A0A00] font-semibold text-sm">Watch Video Broadcast</Text>
        </Pressable>
        <Pressable 
          disabled
          className="flex-1 py-3.5 rounded-xl border border-border bg-card items-center justify-center opacity-50"
        >
          <Text className="text-muted-foreground font-semibold text-sm">Track Prasad Box</Text>
        </Pressable>
      </View>
    </View>
  );
}
