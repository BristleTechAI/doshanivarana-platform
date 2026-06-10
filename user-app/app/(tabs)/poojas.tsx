// @ts-nocheck
import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Image } from 'react-native';
import { Search, SlidersHorizontal, Clock, MapPin } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';

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

  const poojas = [
    // Abhishekam Category
    {
      id: 1,
      title: 'Rudrabhishekam',
      temple: 'Rameshwaram Temple',
      deity: 'Lord Shiva',
      duration: '45 mins',
      price: '₹1,200',
      purpose: 'Sacred bathing ritual for Lord Shiva for spiritual purification',
      category: 'Abhishekam',
      imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 2,
      title: 'Vishnu Abhishekam',
      temple: 'Tirumala Temple',
      deity: 'Lord Vishnu',
      duration: '40 mins',
      price: '₹1,100',
      purpose: 'Divine bathing ceremony for Lord Vishnu for prosperity and peace',
      category: 'Abhishekam',
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 3,
      title: 'Lakshmi Abhishekam',
      temple: 'Madurai Temple',
      deity: 'Goddess Lakshmi',
      duration: '35 mins',
      price: '₹900',
      purpose: 'Sacred bathing ritual for Goddess Lakshmi to attract wealth',
      category: 'Abhishekam',
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 4,
      title: 'Ganesha Abhishekam',
      temple: 'Siddhi Vinayak Temple',
      deity: 'Lord Ganesha',
      duration: '30 mins',
      price: '₹800',
      purpose: 'Remove obstacles and invoke blessings for new beginnings',
      category: 'Abhishekam',
      imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 5,
      title: 'Saraswati Abhishekam',
      temple: 'Varanasi Temple',
      deity: 'Goddess Saraswati',
      duration: '35 mins',
      price: '₹850',
      purpose: 'Enhance knowledge, wisdom, and artistic abilities',
      category: 'Abhishekam',
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    
    // Homam Category
    {
      id: 6,
      title: 'Ganapathi Homam',
      temple: 'Siddhi Vinayak Temple',
      deity: 'Lord Ganesha',
      duration: '90 mins',
      price: '₹2,500',
      purpose: 'Fire ritual to remove obstacles and ensure success in endeavors',
      category: 'Homam',
      imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 7,
      title: 'Navagraha Homam',
      temple: 'Kumbakonam Temple',
      deity: 'Nine Planets',
      duration: '120 mins',
      price: '₹3,500',
      purpose: 'Balances planetary influences and removes doshas',
      category: 'Homam',
      imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 8,
      title: 'Lakshmi Kubera Homam',
      temple: 'Madurai Temple',
      deity: 'Goddess Lakshmi',
      duration: '100 mins',
      price: '₹2,800',
      purpose: 'Attracts wealth, prosperity, and financial abundance',
      category: 'Homam',
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 9,
      title: 'Sudarshana Homam',
      temple: 'Tirumala Temple',
      deity: 'Lord Vishnu',
      duration: '85 mins',
      price: '₹2,200',
      purpose: 'Protection from negative energies and evil forces',
      category: 'Homam',
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 10,
      title: 'Maha Mrityunjaya Homam',
      temple: 'Rameshwaram Temple',
      deity: 'Lord Shiva',
      duration: '110 mins',
      price: '₹3,000',
      purpose: 'Promotes health, longevity, and victory over death',
      category: 'Homam',
      imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    },

    // Archana Category
    {
      id: 11,
      title: 'Sahasranama Archana',
      temple: 'Tirumala Temple',
      deity: 'Lord Vishnu',
      duration: '30 mins',
      price: '₹500',
      purpose: 'Chanting 1000 names of Lord Vishnu for divine blessings',
      category: 'Archana',
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 12,
      title: 'Lalita Sahasranama Archana',
      temple: 'Madurai Temple',
      deity: 'Goddess Lalita',
      duration: '35 mins',
      price: '₹600',
      purpose: 'Invoke divine feminine energy and blessings',
      category: 'Archana',
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 13,
      title: 'Ashtottara Shatanamavali',
      temple: 'Siddhi Vinayak Temple',
      deity: 'Lord Ganesha',
      duration: '25 mins',
      price: '₹400',
      purpose: 'Offering 108 names for quick blessings and obstacle removal',
      category: 'Archana',
      imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 14,
      title: 'Hanuman Chalisa Archana',
      temple: 'Varanasi Temple',
      deity: 'Lord Hanuman',
      duration: '20 mins',
      price: '₹350',
      purpose: 'Gain strength, courage, and protection from difficulties',
      category: 'Archana',
      imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 15,
      title: 'Durga Ashtottara Archana',
      temple: 'Kolkata Temple',
      deity: 'Goddess Durga',
      duration: '30 mins',
      price: '₹550',
      purpose: 'Divine mother\'s blessings for protection and strength',
      category: 'Archana',
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },

    // Special Poojas Category
    {
      id: 16,
      title: 'Satyanarayana Vratam',
      temple: 'Tirumala Temple',
      deity: 'Lord Satyanarayan',
      duration: '120 mins',
      price: '₹1,800',
      purpose: 'Complete vratam for fulfillment of wishes and prosperity',
      category: 'Special Poojas',
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 17,
      title: 'Varalakshmi Vratam',
      temple: 'Madurai Temple',
      deity: 'Goddess Lakshmi',
      duration: '90 mins',
      price: '₹1,500',
      purpose: 'Special vratam for family well-being and abundance',
      category: 'Special Poojas',
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 18,
      title: 'Kalasabhishekam',
      temple: 'Rameshwaram Temple',
      deity: 'Lord Shiva',
      duration: '75 mins',
      price: '₹2,000',
      purpose: 'Grand abhishekam with sacred pots for complete purification',
      category: 'Special Poojas',
      imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 19,
      title: 'Pradosham Special Pooja',
      temple: 'Chidambaram Temple',
      deity: 'Lord Shiva',
      duration: '60 mins',
      price: '₹1,300',
      purpose: 'Performed during pradosham time for liberation from sins',
      category: 'Special Poojas',
      imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 20,
      title: 'Ekadashi Special Pooja',
      temple: 'Tirupati Temple',
      deity: 'Lord Vishnu',
      duration: '80 mins',
      price: '₹1,600',
      purpose: 'Auspicious pooja on Ekadashi for spiritual elevation',
      category: 'Special Poojas',
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const categories: Category[] = ['All', 'Abhishekam', 'Homam', 'Archana', 'Special Poojas'];

  const filteredPoojas = poojas.filter(pooja => {
    const matchesCategory = activeCategory === 'All' || pooja.category === activeCategory;
    const matchesSearch = pooja.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pooja.deity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pooja.temple.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <Search size={20} color="#78716C" />
          </View>
          <TextInput
            placeholder={t('poojas.searchPlaceholder')}
            placeholderTextColor="hsl(var(--muted-foreground))"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground"
            style={{ fontFamily: 'System' }}
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
        <View className="space-y-4">
          {filteredPoojas.map((pooja) => (
            <PoojaListCard key={pooja.id} {...pooja} />
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
                {t('poojaDb.' + id + '.title')}
              </Text>
              <View className="px-2 py-1 rounded-lg bg-accent/10 ml-2">
                <Text className="text-accent text-xs font-medium">{getTranslatedDeity(deity, t)}</Text>
              </View>
            </View>
            <Text className="text-sm text-muted-foreground mb-3" numberOfLines={2} style={{ fontFamily: 'System' }}>
              {t('poojaDb.' + id + '.purpose')}
            </Text>
            <View className="flex-row items-center gap-3 mb-2">
              <View className="flex-row items-center gap-1">
                <MapPin size={14} color="#78716C" />
                <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>{getTranslatedTemple(temple, t)}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Clock size={14} color="#78716C" />
                <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>{duration.replace('mins', t('poojas.min'))}</Text>
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
