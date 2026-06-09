import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { Link } from 'expo-router';
import { User, Bell, X, Languages, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { PoojaCard } from '../../components/PoojaCard';
import { TempleCard } from '../../components/TempleCard';
import { CategoryCard } from '../../components/CategoryCard';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'live',
      titleKey: 'home.notificationLiveTitle',
      messageKey: 'home.notificationLiveMessage',
      timeKey: 'home.notificationLiveTime',
      read: false
    },
    {
      id: 2,
      type: 'confirmation',
      titleKey: 'home.notificationConfirmationTitle',
      messageKey: 'home.notificationConfirmationMessage',
      timeKey: 'home.notificationConfirmationTime',
      read: false
    },
    {
      id: 3,
      type: 'festival',
      titleKey: 'home.notificationFestivalTitle',
      messageKey: 'home.notificationFestivalMessage',
      timeKey: 'home.notificationFestivalTime',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const clearNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-6 pb-4 bg-background border-b border-border/40"
        style={{ paddingTop: insets.top > 0 ? insets.top + 8 : 16 }}
      >
        <View className="flex-row items-center gap-3">
          <Link href="/(tabs)/profile" asChild>
            <Pressable className="w-10 h-10 rounded-full border border-primary bg-primary/5 items-center justify-center active:bg-primary/20">
              <User size={18} color="#F97316" />
            </Pressable>
          </Link>
          <Text className="text-xl font-bold text-primary tracking-wider" style={{ fontFamily: 'System' }}>
            DOSHANIVARANA
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {/* Language Selector */}
          <Pressable 
            onPress={() => setShowLanguageModal(true)} 
            className="w-10 h-10 rounded-xl flex items-center justify-center active:bg-muted/40"
            accessibilityLabel="Change Language"
          >
            <Languages size={20} color="#F5F5F0" />
          </Pressable>
 
          {/* Notification Button */}
          <Pressable 
            onPress={() => setShowNotifications(true)} 
            className="w-10 h-10 rounded-xl flex items-center justify-center relative active:bg-muted/40"
            accessibilityLabel="Notifications"
          >
            <Bell size={20} color="#F5F5F0" />
            {unreadCount > 0 && (
              <View className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full items-center justify-center border border-background">
                <Text className="text-[10px] text-white font-bold">{unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
 
      {/* Notifications Modal */}
      <Modal visible={showNotifications} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-card rounded-t-3xl h-[60%] p-4">
            <View className="flex-row items-center justify-between border-b border-border pb-4 mb-4">
              <Text className="font-semibold text-lg text-foreground">{t('home.notifications')}</Text>
              <Pressable onPress={() => setShowNotifications(false)}>
                <X size={24} color="#F5F5F0" />
              </Pressable>
            </View>
            <ScrollView>
              {notifications.length === 0 ? (
                <View className="p-8 items-center justify-center">
                  <Bell size={48} color="#78716C" className="opacity-30 mb-2" />
                  <Text className="text-sm text-muted-foreground">{t('home.noNotifications')}</Text>
                </View>
              ) : (
                notifications.map(n => (
                  <View key={n.id} className={`p-4 border-b border-border flex-row items-start justify-between ${!n.read ? 'bg-primary/5' : ''}`}>
                    <Pressable onPress={() => markAsRead(n.id)} className="flex-1 mr-4">
                      <Text className="font-medium text-sm text-foreground mb-1">{t(n.titleKey)}</Text>
                      <Text className="text-sm text-muted-foreground mb-1">{t(n.messageKey)}</Text>
                      <Text className="text-xs text-muted-foreground">{t(n.timeKey)}</Text>
                    </Pressable>
                    <Pressable onPress={() => clearNotification(n.id)} className="p-1">
                      <X size={16} color="#78716C" />
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>
            {notifications.length > 0 && (
              <Pressable
                onPress={() => setNotifications([])}
                className="mt-4 py-3 bg-muted rounded-xl items-center justify-center"
              >
                <Text className="text-primary font-medium text-sm">{t('common.clearAll')}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
 
      {/* Language Selector Modal */}
      <Modal visible={showLanguageModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable className="absolute inset-0" onPress={() => setShowLanguageModal(false)} />
          <View className="bg-card rounded-t-3xl p-6 border-t border-border">
            <View className="flex-row items-center justify-between border-b border-border pb-4 mb-4">
              <Text className="font-semibold text-lg text-foreground">Select Language / భాష / भाषा / ભાષા</Text>
              <Pressable onPress={() => setShowLanguageModal(false)} className="p-1">
                <X size={24} color="#F5F5F0" />
              </Pressable>
            </View>
            <View className="space-y-3 text-foreground">
              {[
                { code: 'en', name: 'English', nativeName: 'English' },
                { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
                { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
                { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
              ].map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => {
                      setLanguage(lang.code as any);
                      setShowLanguageModal(false);
                    }}
                    className={`flex-row items-center justify-between p-4 rounded-xl border ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-transparent'
                    }`}
                  >
                    <View>
                      <Text className={`font-semibold text-base ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {lang.nativeName}
                      </Text>
                      <Text className="text-xs text-muted-foreground">{lang.name}</Text>
                    </View>
                    {isSelected && (
                      <Check size={18} color="#F97316" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 24, paddingBottom: 100 }}>
        {/* Greeting */}
        <View className="mb-8">
          <Text className="text-2xl font-bold mb-1 text-foreground" style={{ fontFamily: 'System' }}>
            {t('home.greeting')}, {t('profile.val.priya')} 🙏
          </Text>
          <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
            {t('home.subtitle')}
          </Text>
        </View>

        {/* Live Pooja Countdown Card */}
        <Link href="/pooja/1" asChild>
          <Pressable className="rounded-2xl p-5 border-l-4 border-primary mb-8 relative overflow-hidden" style={{ backgroundColor: '#2D0A2E' }}>
            <View className="absolute top-3 right-3">
              <View className="px-3 py-1 rounded-full bg-red-600">
                <Text className="text-white text-[10px] font-bold">{t('home.upcoming')}</Text>
              </View>
            </View>
            
            <Text className="text-base font-semibold mb-1 text-[#F5F5F0]" style={{ fontFamily: 'System' }}>
              {t('home.nextLivePooja')}
            </Text>
            <Text className="text-xl font-bold mb-3 text-[#F5F5F0]" style={{ fontFamily: 'System' }}>
              {t('home.nextLivePoojaName')}
            </Text>
            
            <Text className="text-3xl font-bold text-primary mb-4" style={{ fontFamily: 'System' }}>
              02:34:18
            </Text>
            
            <View className="px-5 py-2 rounded-lg bg-primary items-center self-start">
              <Text className="text-primary-foreground font-medium text-sm">{t('home.offerSevaAmount')}</Text>
            </View>
          </Pressable>
        </Link>

        {/* AI Recommendations */}
        <View className="mb-8">
          <View className="mb-4">
            <Text className="text-lg font-bold text-foreground mb-0.5" style={{ fontFamily: 'System' }}>
              {t('home.recommendedForYou')}
            </Text>
            <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
              {t('home.basedOnNakshatra')}
            </Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
            <PoojaCard
              id="1"
              title={t('home.lakshmiPooja')}
              temple={t('home.maduraiTemple')}
              price="₹800"
              imageUrl="https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
              badge={t('home.forYou')}
            />
            <PoojaCard
              id="2"
              title={t('categories.abhishekam')}
              temple={t('home.rameshwaramTemple')}
              price="₹1,200"
              imageUrl="https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080"
              badge={t('home.live')}
              isLive
            />
            <PoojaCard
              id="3"
              title={t('home.satyanarayanaPooja')}
              temple={t('home.tirumalaTemple')}
              price="₹900"
              imageUrl="https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
            />
          </ScrollView>
        </View>

        {/* Featured Temples */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-foreground" style={{ fontFamily: 'System' }}>
              {t('home.temples')}
            </Text>
            <Link href="/(tabs)/temples" asChild>
              <Pressable>
                <Text className="text-sm text-primary font-medium">{t('common.viewAll')}</Text>
              </Pressable>
            </Link>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
            <TempleCard 
              name={t('home.tirumala')} 
              deity={t('home.lordVenkateswara')}
              city={t('home.tirupati')}
              imageUrl="https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080" 
            />
            <TempleCard 
              name={t('home.rameshwaram')} 
              deity={t('home.lordShiva')}
              city={t('home.tamilNadu')}
              imageUrl="https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080" 
            />
            <TempleCard 
              name={t('home.madurai')} 
              deity={t('home.goddessMeenakshi')}
              city={t('home.tamilNadu')}
              imageUrl="https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080" 
            />
          </ScrollView>
        </View>

        {/* Pooja Categories */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-foreground" style={{ fontFamily: 'System' }}>
              {t('home.categories')}
            </Text>
            <Link href="/(tabs)/poojas" asChild>
              <Pressable>
                <Text className="text-sm text-primary font-medium">{t('common.viewAll')}</Text>
              </Pressable>
            </Link>
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            <CategoryCard
              title={t('categories.abhishekam')}
              count={t('home.poojasCount').replace('{count}', '12')}
              icon="🪔"
              color="#F97316"
            />
            <CategoryCard
              title={t('categories.homam')}
              count={t('home.poojasCount').replace('{count}', '8')}
              icon="🔥"
              color="#EF4444"
            />
            <CategoryCard
              title={t('categories.archana')}
              count={t('home.poojasCount').replace('{count}', '15')}
              icon="🌺"
              color="#EC4899"
            />
            <CategoryCard
              title={t('categories.specialPoojas')}
              count={t('home.poojasCount').replace('{count}', '10')}
              icon="✨"
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Upcoming Festivals */}
        <View className="mb-8">
          <Link href="/calendar" asChild>
            <Pressable className="mb-4">
              <Text className="text-lg font-bold text-foreground" style={{ fontFamily: 'System' }}>
                {t('calendar.upcomingFestivals')}
              </Text>
            </Pressable>
          </Link>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
            {[
              { date: 18, day: t('home.wed'), name: t('home.today'), isToday: true },
              { date: 19, day: t('home.thu'), name: '' },
              { date: 20, day: t('home.fri'), name: t('home.ekadashi'), isFestival: true },
              { date: 21, day: t('home.sat'), name: '' },
              { date: 22, day: t('home.sun'), name: t('home.purnima'), isFestival: true },
              { date: 23, day: t('home.mon'), name: '' },
              { date: 24, day: t('home.tue'), name: '' },
            ].map((day, i) => (
              <View
                key={i}
                className={`w-16 py-3 rounded-xl items-center justify-center mr-3 ${
                  day.isToday
                    ? 'bg-primary'
                    : day.isFestival
                    ? 'bg-card border-2 border-primary'
                    : 'bg-card border border-border'
                }`}
              >
                <Text 
                  className={`text-xs mb-1 ${
                    day.isToday ? 'text-primary-foreground font-semibold' : 'text-muted-foreground'
                  }`}
                  style={{ fontFamily: 'System' }}
                >
                  {day.day}
                </Text>
                <Text 
                  className={`text-2xl font-bold mb-1 ${
                    day.isToday ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                  style={{ fontFamily: 'System' }}
                >
                  {day.date}
                </Text>
                {day.isFestival && !day.isToday && (
                  <View className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
                {day.name !== '' && !day.isToday && (
                  <Text className="text-[10px] text-primary font-medium mt-1" style={{ fontFamily: 'System' }}>
                    {day.name}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
