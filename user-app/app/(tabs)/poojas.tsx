// @ts-nocheck
import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { Search, SlidersHorizontal, Clock, MapPin } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { PoojasService } from '../../src/services/firebase/poojas';
import { TemplesService } from '../../src/services/firebase/temples';

export const getTranslatedDeity = (deityName: string, t: (k: string) => string) => {
  const clean = deityName.toLowerCase().replace('lord ', '').replace('goddess ', '').trim();
  if (clean === 'shiva') return t('deity.shiva');
  if (clean === 'vishnu') return t('deity.vishnu');
  if (clean === 'lakshmi') return t('deity.lakshmi');
  if (clean === 'ganesha') return t('deity.ganesha');
  if (clean === 'saraswati') return t('deity.saraswati');
  if (clean === 'hanuman') return t('deity.hanuman');
  if (clean === 'durga') return t('deity.durga');
  if (clean === 'murugan') return t('deity.murugan');
  if (clean === 'lalita') return t('deity.lalita');
  if (clean.includes('satyanarayan')) return t('deity.satyanarayan');
  if (clean.includes('planets')) return t('deity.ninePlanets');
  return deityName;
};

export const getTranslatedTemple = (templeName: string, t: (k: string) => string) => {
  const clean = templeName.toLowerCase().replace(' temple', '').trim();
  if (clean.includes('kalahasti') || clean.includes('shivalayam')) return t('templeDb.tirumala.name');
  if (clean.includes('kashi') || clean.includes('varanasi')) return t('templeDb.varanasi.name');
  if (clean.includes('tirumala')) return t('templeDb.tirumala.name');
  if (clean.includes('rameshwaram')) return t('templeDb.rameshwaram.name');
  if (clean.includes('madurai')) return t('templeDb.madurai.name');
  if (clean.includes('siddhi vinayak') || clean.includes('siddhivinayak')) return t('templeDb.siddhiVinayak.name');
  return templeName;
};

type Category = 'All' | 'Abhishekam' | 'Homam' | 'Archana' | 'Special Poojas';

export default function Poojas() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [poojas, setPoojas] = useState<any[]>([]);
  const [templeMap, setTempleMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubTemples = TemplesService.subscribeToTemples((templeList) => {
      const map: Record<string, string> = {};
      templeList.forEach(t => {
        map[t.id] = t.name;
      });
      setTempleMap(map);
    });

    const unsubPoojas = PoojasService.subscribeToPoojas((poojaList) => {
      setPoojas(poojaList);
      setLoading(false);
    });

    return () => {
      unsubTemples();
      unsubPoojas();
    };
  }, []);

  const getCategoryLabel = (cat: Category) => {
    switch (cat) {
      case 'All': return t('categories.all');
      case 'Abhishekam': return t('categories.abhishekam');
      case 'Homam': return t('categories.homam');
      case 'Archana': return t('categories.archana');
      case 'Special Poojas': return t('categories.specialPoojas');
      default: return cat;
    }
  };

  const categories: Category[] = ['All', 'Abhishekam', 'Homam', 'Archana', 'Special Poojas'];

  const filteredPoojas = poojas.filter(pooja => {
    const categoryEnumMap = {
      'All': 'ALL',
      'Abhishekam': 'ABHISHEKAM',
      'Homam': 'HOMAM',
      'Archana': 'ARCHANA',
      'Special Poojas': 'SPECIAL_POOJAS'
    };
    const targetEnum = categoryEnumMap[activeCategory];
    const poojaTitle = t('poojaDb.' + pooja.id + '.title') === 'poojaDb.' + pooja.id + '.title' ? pooja.name : t('poojaDb.' + pooja.id + '.title');
    const poojaDeity = pooja.deity || '';
    const poojaTemple = templeMap[pooja.templeId] || 'Temple';

    const poojaCat = (pooja.category || pooja.categoryName || '').toUpperCase();
    const matchesCategory = activeCategory === 'All' || 
      poojaCat === targetEnum || 
      (targetEnum === 'ABHISHEKAM' && poojaCat.includes('ABHISHEKA')) ||
      (targetEnum === 'SPECIAL_POOJAS' && poojaCat.includes('SPECIAL'));
    const matchesSearch = poojaTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         poojaDeity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         poojaTemple.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View 
        className="pb-4 bg-background/95 border-b border-border z-40 px-6"
        style={{ paddingTop: insets.top > 0 ? insets.top + 8 : 16 }}
      >
        <Text className="text-2xl font-bold mb-4 text-foreground" style={{ fontFamily: 'System' }}>
          {t('categories.all')}
        </Text>

        {/* Search */}
        <View className="relative mb-4 justify-center">
          <View className="absolute left-4 z-10">
            <Search size={20} color={theme === 'dark' ? '#A8A29E' : '#78716C'} />
          </View>
          <TextInput
            placeholder={t('poojas.searchPlaceholder')}
            placeholderTextColor={theme === 'dark' ? '#A8A29E' : '#78716C'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground"
            style={{ color: theme === 'dark' ? '#F5F5F0' : '#1C1917', fontFamily: 'System' }}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2 -mx-6 px-6">
          <Pressable className="flex-row items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border mr-3">
            <SlidersHorizontal size={16} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
            <Text className="text-sm font-medium text-foreground" style={{ fontFamily: 'System' }}>{t('poojas.filters')}</Text>
          </Pressable>
          {categories.map((category) => (
            <Pressable
              key={category}
              onPress={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl border mr-3 ${
                activeCategory === category
                  ? 'bg-primary border-primary'
                  : 'bg-card border-border'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeCategory === category
                    ? 'text-primary-foreground'
                    : 'text-foreground'
                }`}
                style={{ fontFamily: 'System' }}
              >
                {getCategoryLabel(category)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Pooja List */}
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} className="flex-1">
        <View className="gap-y-4">
          {filteredPoojas.map((pooja) => (
            <PoojaListCard 
              key={pooja.id} 
              id={pooja.id}
              title={t('poojaDb.' + pooja.id + '.title') === 'poojaDb.' + pooja.id + '.title' ? pooja.name : t('poojaDb.' + pooja.id + '.title')}
              temple={templeMap[pooja.templeId] || 'Temple'}
              deity={pooja.deity || ''}
              duration={`${pooja.durationMinutes || pooja.duration || 30} mins`}
              purpose={t('poojaDb.' + pooja.id + '.purpose') === 'poojaDb.' + pooja.id + '.purpose' ? pooja.description : t('poojaDb.' + pooja.id + '.purpose')}
              imageUrl={pooja.imageUrl}
              price={`₹${pooja.price}`}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function PoojaListCard({
  id,
  title,
  temple,
  deity,
  duration,
  purpose,
  imageUrl,
  price,
}: {
  id: number;
  title: string;
  temple: string;
  deity: string;
  duration: string;
  purpose: string;
  imageUrl: string;
  price: string;
}) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  return (
    <Link href={`/pooja/${id}`} asChild>
      <Pressable className="bg-card border border-border rounded-2xl overflow-hidden mb-4 active:border-primary/50">
        <View className="flex-row gap-4 p-4">
          <Image
            source={{ uri: imageUrl }}
            className="w-24 h-24 rounded-xl"
            resizeMode="cover"
          />
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-2">
              <Text className="font-semibold text-lg text-foreground flex-1" style={{ fontFamily: 'System' }}>
                {title}
              </Text>
              <View className="px-2 py-1 rounded-lg bg-accent/10 ml-2">
                <Text className="text-accent text-xs font-medium">{getTranslatedDeity(deity, t)}</Text>
              </View>
            </View>
            <Text className="text-sm mb-3" numberOfLines={2} style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#44403C' }}>
              {purpose}
            </Text>
            <View className="flex-row items-center gap-3 mb-2">
              <View className="flex-row items-center gap-1">
                <MapPin size={14} color={theme === 'dark' ? '#A8A29E' : '#78716C'} />
                <Text className="text-xs" numberOfLines={1} ellipsizeMode="tail" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>{getTranslatedTemple(temple, t)}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Clock size={14} color={theme === 'dark' ? '#A8A29E' : '#78716C'} />
                <Text className="text-xs" numberOfLines={1} ellipsizeMode="tail" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>{duration.replace('mins', t('poojas.min'))}</Text>
              </View>
            </View>
            <Text className="text-primary font-semibold" style={{ fontFamily: 'System' }}>
              {price}
            </Text>
          </View>
        </View>
        <View className="px-4 pb-4">
          <View className="w-full py-2.5 rounded-xl bg-primary items-center justify-center">
            <Text className="text-primary-foreground font-medium text-sm" style={{ fontFamily: 'System' }}>
              {t('common.offerSeva')}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
