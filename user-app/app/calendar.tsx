// @ts-nocheck
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Calendar, Flame } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/old_app/context/ThemeContext';
import { useLanguage } from '../src/old_app/context/LanguageContext';

interface CalendarDay {
  dayNum: number;
  month: 'prev' | 'current' | 'next';
  isToday?: boolean;
  type?: 'festival' | 'ekadashi' | 'amavasya' | 'pournami';
  label?: string;
}

export default function HinduCalendarScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState<number>(14); // Default to April 14 (Ugadi)

  const calendarDays: CalendarDay[] = [
    // Row 1
    { dayNum: 29, month: 'prev' },
    { dayNum: 30, month: 'prev' },
    { dayNum: 31, month: 'prev' },
    { dayNum: 1, month: 'current' },
    { dayNum: 2, month: 'current' },
    { dayNum: 3, month: 'current', type: 'pournami', label: 'Pournami' },
    { dayNum: 4, month: 'current' },
    // Row 2
    { dayNum: 5, month: 'current' },
    { dayNum: 6, month: 'current', type: 'ekadashi', label: 'Ekadashi' },
    { dayNum: 7, month: 'current' },
    { dayNum: 8, month: 'current' },
    { dayNum: 9, month: 'current' },
    { dayNum: 10, month: 'current' },
    { dayNum: 11, month: 'current' },
    // Row 3
    { dayNum: 12, month: 'current' },
    { dayNum: 13, month: 'current' },
    { dayNum: 14, month: 'current', type: 'festival', label: 'Ugadi' },
    { dayNum: 15, month: 'current' },
    { dayNum: 16, month: 'current' },
    { dayNum: 17, month: 'current', type: 'festival', label: 'Ram Navami' },
    { dayNum: 18, month: 'current', isToday: true, type: 'amavasya', label: 'Amavasya' },
    // Row 4
    { dayNum: 19, month: 'current' },
    { dayNum: 20, month: 'current' },
    { dayNum: 21, month: 'current', type: 'ekadashi', label: 'Ekadashi' },
    { dayNum: 22, month: 'current' },
    { dayNum: 23, month: 'current' },
    { dayNum: 24, month: 'current' },
    { dayNum: 25, month: 'current' },
    // Row 5
    { dayNum: 26, month: 'current' },
    { dayNum: 27, month: 'current' },
    { dayNum: 28, month: 'current' },
    { dayNum: 29, month: 'current' },
    { dayNum: 30, month: 'current' },
    { dayNum: 1, month: 'next' },
    { dayNum: 2, month: 'next' },
  ];

  const getDayDetails = (dayNum: number) => {
    switch (dayNum) {
      case 14:
        return {
          title: t('calendar.eventUgadiTitle'),
          significance: t('calendar.eventUgadiDesc'),
          poojas: [
            {
              id: '16',
              templeKey: 'tirumala',
              price: '₹1,800',
              imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
            },
            {
              id: '3',
              templeKey: 'madurai',
              price: '₹900',
              imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
            },
          ],
        };
      case 17:
        return {
          title: t('calendar.eventRamNavamiTitle'),
          significance: t('calendar.eventRamNavamiDesc'),
          poojas: [
            {
              id: '14',
              templeKey: 'varanasi',
              price: '₹350',
              imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
            },
          ],
        };
      case 18:
        return {
          title: t('calendar.eventAmavasyaTitle'),
          significance: t('calendar.eventAmavasyaDesc'),
          poojas: [
            {
              id: '7',
              templeKey: 'varanasi',
              price: '₹3,500',
              imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
            },
          ],
        };
      case 3:
        return {
          title: t('calendar.eventPournamiTitle'),
          significance: t('calendar.eventPournamiDesc'),
          poojas: [
            {
              id: '16',
              templeKey: 'tirumala',
              price: '₹1,800',
              imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
            },
          ],
        };
      case 6:
      case 21:
        return {
          title: t('calendar.eventEkadashiTitle').replace('{day}', dayNum.toString()),
          significance: t('calendar.eventEkadashiDesc'),
          poojas: [
            {
              id: '11',
              templeKey: 'tirumala',
              price: '₹500',
              imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
            },
          ],
        };
      default:
        return {
          title: t('calendar.dayTitle').replace('{day}', dayNum.toString()),
          significance: t('calendar.dayDesc'),
          poojas: [
            {
              id: '11',
              templeKey: 'tirumala',
              price: '₹500',
              imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
            },
          ],
        };
    }
  };

  const details = getDayDetails(selectedDay);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View 
        className="flex-row items-center gap-4 px-6 pb-4 border-b border-border/40 bg-background"
        style={{ paddingTop: insets.top > 0 ? insets.top + 8 : 16 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl items-center justify-center bg-card/40 border border-border/40 active:bg-muted/40"
        >
          <ArrowLeft size={20} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
        </Pressable>
        <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'System' }}>
          {t('calendar.title')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, paddingBottom: 60 }} className="flex-1">
        
        {/* Month Selector */}
        <View className="flex-row items-center justify-between mb-6 bg-card border border-border/40 rounded-2xl px-5 py-4">
          <Pressable className="p-1.5 rounded-lg bg-muted/30 border border-border/20 active:bg-muted/50">
            <ChevronLeft size={18} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
          </Pressable>
          <Text className="text-base font-bold text-foreground" style={{ fontFamily: 'System' }}>
            {t('calendar.april')} 2026
          </Text>
          <Pressable className="p-1.5 rounded-lg bg-muted/30 border border-border/20 active:bg-muted/50">
            <ChevronRight size={18} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
          </Pressable>
        </View>

        {/* Legend */}
        <View className="flex-row flex-wrap gap-x-4 gap-y-2 mb-6 justify-center">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-primary" />
            <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>{t('calendar.legendFestival')}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>{t('calendar.legendEkadashi')}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-accent" />
            <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>{t('calendar.legendAmavasya')}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>{t('calendar.legendPournami')}</Text>
          </View>
        </View>

        {/* Calendar Grid Container */}
        <View className="bg-card border border-border/40 rounded-3xl p-5 mb-6">
          {/* Weekday Headers */}
          <View className="flex-row justify-between mb-4 px-1">
            {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
              <Text key={idx} className="w-[12%] text-center text-xs font-semibold text-muted-foreground" style={{ fontFamily: 'System' }}>
                {t(`calendar.weekday${idx}`)}
              </Text>
            ))}
          </View>

          {/* Grid Rows */}
          <View className="flex-row flex-wrap justify-between">
            {calendarDays.map((day, index) => {
              const isSelected = selectedDay === day.dayNum && day.month === 'current';
              const isCurrentMonth = day.month === 'current';
              
              let dotColorClass = '';
              if (day.type === 'festival') dotColorClass = 'bg-primary';
              else if (day.type === 'ekadashi') dotColorClass = 'bg-amber-500';
              else if (day.type === 'amavasya') dotColorClass = 'bg-accent';
              else if (day.type === 'pournami') dotColorClass = 'bg-yellow-400';

              return (
                <Pressable
                  key={index}
                  onPress={() => isCurrentMonth && setSelectedDay(day.dayNum)}
                  className={`w-[13%] aspect-square items-center justify-center rounded-xl mb-2.5 relative ${
                    isSelected
                      ? 'bg-primary'
                      : day.isToday
                      ? 'border border-primary bg-primary/5'
                      : 'bg-transparent active:bg-muted/10'
                  }`}
                  disabled={!isCurrentMonth}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected
                        ? 'text-[#1A0A00]'
                        : isCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground/30'
                    }`}
                    style={{ fontFamily: 'System' }}
                  >
                    {day.dayNum}
                  </Text>
                  {day.type && isCurrentMonth && (
                    <View 
                      className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                        isSelected ? 'bg-[#1A0A00]' : dotColorClass
                      }`} 
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Selected Day Details Panel */}
        <View className="bg-card border border-border/40 rounded-3xl p-6">
          <Text className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'System' }}>
            {details.title}
          </Text>
          <Text className="text-sm text-muted-foreground leading-relaxed mb-6" style={{ fontFamily: 'System' }}>
            {details.significance}
          </Text>

          <Text className="text-sm font-bold text-foreground mb-4" style={{ fontFamily: 'System' }}>
            {t('calendar.recommendedPoojas')}
          </Text>

          {/* Recommended Pooja Cards */}
          <View className="space-y-4">
            {details.poojas.map((pooja) => (
              <View key={pooja.id} className="bg-background border border-border/30 rounded-2xl overflow-hidden flex-row">
                <Image 
                  source={{ uri: pooja.imageUrl }} 
                  className="w-24 h-24"
                  resizeMode="cover"
                />
                <View className="flex-1 p-3.5 justify-between">
                  <View>
                    <Text className="font-semibold text-foreground text-sm mb-1" style={{ fontFamily: 'System' }}>
                      {t('poojaDb.' + pooja.id + '.title')}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <MapPin size={12} color="#78716C" />
                      <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
                        {t('templeDb.' + pooja.templeKey + '.name')}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between pt-1">
                    <Text className="font-bold text-primary text-sm" style={{ fontFamily: 'System' }}>
                      {pooja.price}
                    </Text>
                    <Link href={`/pooja/${pooja.id}` as any} asChild>
                      <Pressable className="px-3 py-1.5 rounded-lg bg-primary active:bg-[#E05C10]">
                        <Text className="text-[#1A0A00] font-semibold text-[10px]" style={{ fontFamily: 'System' }}>
                          {t('calendar.offerSeva')}
                        </Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
