// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, Modal, Image } from 'react-native';
import { Link } from 'expo-router';
import { User, Bell, X, Languages, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { safeStorage } from '../../src/old_app/lib/storage';
import { firestoreProvider as firestore } from '../../src/lib/firebaseProvider';
import { DashboardService } from '../../src/services/firebase/dashboard';
import { TemplesService } from '../../src/services/firebase/temples';
import { PoojasService } from '../../src/services/firebase/poojas';
import { BookingsService } from '../../src/services/firebase/bookings';
import { PoojaCard } from '../../components/PoojaCard';
import { TempleCard } from '../../components/TempleCard';
import { CategoryCard } from '../../components/CategoryCard';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { language, setLanguage, t } = useLanguage();
  const { theme } = useTheme();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userName, setUserName] = useState('Devotee');
  const [temples, setTemples] = useState<any[]>([]);
  const [recommendedPoojas, setRecommendedPoojas] = useState<any[]>([]);
  const [nextPooja, setNextPooja] = useState<any>(null);
  const [countdownText, setCountdownText] = useState('02:34:18');

  const [categoriesList, setCategoriesList] = useState<any[]>([
    {
      id: 'abhishekam',
      titleKey: 'categories.abhishekam',
      countKey: '12',
      icon: require('../../assets/categories/abhishekam.png'),
      color: '#F97316'
    },
    {
      id: 'homam',
      titleKey: 'categories.homam',
      countKey: '8',
      icon: require('../../assets/categories/homam.png'),
      color: '#EF4444'
    },
    {
      id: 'archana',
      titleKey: 'categories.archana',
      countKey: '15',
      icon: require('../../assets/categories/archana.png'),
      color: '#EC4899'
    },
    {
      id: 'specialPoojas',
      titleKey: 'categories.specialPoojas',
      countKey: '10',
      icon: require('../../assets/categories/special.png'),
      color: '#8B5CF6'
    }
  ]);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const fetchNotifications = async () => {
      try {
        const userSession = safeStorage.getItem('doshanivarana_logged_in_user');
        const userId = userSession ? JSON.parse(userSession).id : 'anonymous_user';

        if (userId === 'anonymous_user') return;

        unsubscribe = firestore()
          .collection('notifications')
          .where('recipientId', '==', userId)
          .where('recipientType', '==', 'USER')
          .orderBy('createdAt', 'desc')
          .limit(20)
          .onSnapshot((snapshot) => {
            if (snapshot) {
              const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setNotifications(notifs);
            }
          });
      } catch (e) {
        console.error('Error fetching notifications:', e);
      }
    };
    fetchNotifications();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('categories')
      .orderBy('sortOrder', 'asc')
      .onSnapshot((snap) => {
        if (snap && !snap.empty) {
          const list = snap.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              titleKey: data.titleKey || `categories.${doc.id}`,
              countKey: data.countKey || data.count || '0',
              icon: data.icon || '🪔',
              color: data.color || '#F97316'
            };
          });
          setCategoriesList(list);
        }
      }, (e) => {
        console.error('Error fetching categories:', e);
      });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const userSession = safeStorage.getItem('doshanivarana_logged_in_user');
    const session = userSession ? JSON.parse(userSession) : null;
    const userId = session?.id || 'anonymous_user';
    setUserName(session?.name || 'Devotee');

    // 1. Subscribe to temples
    const unsubTemples = TemplesService.subscribeToTemples((templeList) => {
      setTemples(templeList);
    });

    // 2. Subscribe to poojas
    const unsubPoojas = PoojasService.subscribeToPoojas((poojaList) => {
      setRecommendedPoojas(poojaList.slice(0, 5));
    });

    // 3. Subscribe to bookings for next/upcoming pooja
    let unsubBookings = () => {};
    if (userId !== 'anonymous_user') {
      unsubBookings = BookingsService.subscribeToUserBookings(userId, (bookingsList) => {
        const upcoming = bookingsList.filter((b: any) => b.status === 'CONFIRMED');
        if (upcoming && upcoming.length > 0) {
          const sorted = [...upcoming].sort((a: any, b: any) => {
            return (a.scheduledDate || '').localeCompare(b.scheduledDate || '');
          });
          setNextPooja(sorted[0]);
        } else {
          setNextPooja(null);
        }
      });
    }

    return () => {
      unsubTemples();
      unsubPoojas();
      unsubBookings();
    };
  }, []);

  useEffect(() => {
    if (!nextPooja) {
      setCountdownText('02:34:18'); // Default fallback
      return;
    }
    
    const interval = setInterval(() => {
      let targetTime = new Date(nextPooja.scheduledDate).getTime();
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setCountdownText('00:00:00');
        clearInterval(interval);
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdownText(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [nextPooja]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await firestore().collection('notifications').doc(id).update({ isRead: true });
    } catch (e) {
      console.error(e);
    }
  };

  const clearNotification = async (id: string) => {
    try {
      await firestore().collection('notifications').doc(id).delete();
    } catch (e) {
      console.error(e);
    }
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
            <Pressable className="w-10 h-10 rounded-full border border-primary bg-primary/5 items-center justify-center active:bg-primary/20 overflow-hidden">
              <User size={18} color="#F97316" />
            </Pressable>
          </Link>
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 140, height: 38 }}
            resizeMode="contain"
          />
        </View>
        <View className="flex-row items-center gap-2">
          {/* Language Selector */}
          <Pressable 
            onPress={() => setShowLanguageModal(true)} 
            className="w-10 h-10 rounded-xl flex items-center justify-center active:bg-muted/40"
            accessibilityLabel="Change Language"
          >
            <Languages size={20} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
          </Pressable>
 
          {/* Notification Button */}
          <Pressable 
            onPress={() => setShowNotifications(true)} 
            className="w-10 h-10 rounded-xl flex items-center justify-center relative active:bg-muted/40"
            accessibilityLabel="Notifications"
          >
            <Bell size={20} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
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
                <X size={24} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
              </Pressable>
            </View>
            <ScrollView>
              {notifications.length === 0 ? (
                <View className="p-8 items-center justify-center">
                  <Bell size={48} color={theme === 'dark' ? '#A8A29E' : '#78716C'} className="opacity-30 mb-2" />
                  <Text className="text-sm text-muted-foreground">{t('home.noNotifications')}</Text>
                </View>
              ) : (
                notifications.map(n => (
                  <View key={n.id} className={`p-4 border-b border-border flex-row items-start justify-between ${!n.isRead ? 'bg-primary/5' : ''}`}>
                    <Pressable onPress={() => markAsRead(n.id)} className="flex-1 mr-4">
                      <Text className="font-medium text-sm text-foreground mb-1">{n.title}</Text>
                      <Text className="text-sm text-muted-foreground mb-1">{n.message}</Text>
                      <Text className="text-xs text-muted-foreground">{new Date(n.createdAt?.toDate() || Date.now()).toLocaleTimeString()}</Text>
                    </Pressable>
                    <Pressable onPress={() => clearNotification(n.id)} className="p-1">
                      <X size={16} color={theme === 'dark' ? '#A8A29E' : '#78716C'} />
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>
            {notifications.length > 0 && (
              <Pressable
                onPress={() => {
                  notifications.forEach(n => clearNotification(n.id));
                }}
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
                <X size={24} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
              </Pressable>
            </View>
            <View className="gap-y-3 text-foreground">
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
            {t('home.greeting')}, {userName} 🙏
          </Text>
          <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
            {t('home.subtitle')}
          </Text>
        </View>
 
        {/* Live Pooja Countdown Card */}
        <Link href={nextPooja ? (`/journey/${nextPooja.id}` as any) : "/pooja/1"} asChild>
          <Pressable className="rounded-2xl p-5 border-l-4 border-primary mb-8 bg-card border border-border/50 relative overflow-hidden">
            <View className="absolute top-3 right-3">
              <View className="px-3 py-1 rounded-full bg-red-600">
                <Text className="text-white text-[10px] font-bold">{t('home.upcoming')}</Text>
              </View>
            </View>
            
            <Text className="text-base font-semibold mb-1 text-foreground" style={{ fontFamily: 'System' }}>
              {t('home.nextLivePooja')}
            </Text>
            <Text className="text-xl font-bold mb-3 text-foreground" style={{ fontFamily: 'System' }}>
              {nextPooja ? nextPooja.poojaName : t('home.nextLivePoojaName')}
            </Text>
            
            <Text className="text-3xl font-bold text-primary mb-4" style={{ fontFamily: 'System' }}>
              {countdownText}
            </Text>
            
            <View className="px-5 py-2 rounded-lg bg-primary items-center self-start">
              <Text className="text-primary-foreground font-medium text-sm">
                {nextPooja ? t('common.viewDetails') : t('home.offerSevaAmount')}
              </Text>
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
            {recommendedPoojas.length > 0 ? (
              recommendedPoojas.map((pooja) => {
                const title = t('poojaDb.' + pooja.id + '.title') === 'poojaDb.' + pooja.id + '.title' ? pooja.name : t('poojaDb.' + pooja.id + '.title');
                const temple = t('templeDb.' + pooja.templeId + '.name') === 'templeDb.' + pooja.templeId + '.name' ? pooja.templeName || 'Temple' : t('templeDb.' + pooja.templeId + '.name');
                return (
                  <PoojaCard
                    key={pooja.id}
                    id={pooja.id}
                    title={title}
                    temple={temple}
                    price={`₹${pooja.price}`}
                    imageUrl={pooja.imageUrl}
                    badge={pooja.category || pooja.categoryName}
                  />
                );
              })
            ) : (
              <>
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
                  imageUrl="https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3borsaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080"
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
              </>
            )}
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
            {temples.length > 0 ? (
              temples.map((temple) => {
                const name = t('templeDb.' + temple.id + '.name') === 'templeDb.' + temple.id + '.name' ? temple.name : t('templeDb.' + temple.id + '.name');
                const deity = t('templeDb.' + temple.id + '.deity') === 'templeDb.' + temple.id + '.deity' ? temple.deity : t('templeDb.' + temple.id + '.deity');
                const city = temple.city || temple.location || '';
                return (
                  <TempleCard
                    key={temple.id}
                    name={name}
                    deity={deity}
                    city={city}
                    imageUrl={temple.imageUrl}
                  />
                );
              })
            ) : (
              <>
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
              </>
            )}
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
            {categoriesList.map((item) => (
              <CategoryCard
                key={item.id}
                title={t(item.titleKey)}
                count={t('home.poojasCount').replace('{count}', item.countKey)}
                icon={item.icon}
                color={item.color}
              />
            ))}
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
