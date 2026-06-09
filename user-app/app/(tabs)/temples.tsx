import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import { MapPin, Star, Flame } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';

export default function Temples() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [expandedTemple, setExpandedTemple] = useState<number | null>(null);

  const temples = [
    {
      id: 1,
      name: 'Tirumala Temple',
      location: 'Andhra Pradesh',
      deity: 'Lord Venkateswara',
      poojas: 12,
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'One of the richest and most visited pilgrimage centers in the world',
      availablePoojas: [
        { id: 2, name: 'Vishnu Abhishekam', price: '₹1,100' },
        { id: 11, name: 'Sahasranama Archana', price: '₹500' },
        { id: 9, name: 'Sudarshana Homam', price: '₹2,200' },
        { id: 16, name: 'Satyanarayana Vratam', price: '₹1,800' },
      ],
    },
    {
      id: 2,
      name: 'Rameshwaram Temple',
      location: 'Tamil Nadu',
      deity: 'Lord Shiva',
      poojas: 10,
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Sacred Jyotirlinga temple on the island of Rameshwaram',
      availablePoojas: [
        { id: 1, name: 'Rudrabhishekam', price: '₹1,200' },
        { id: 10, name: 'Maha Mrityunjaya Homam', price: '₹3,000' },
        { id: 18, name: 'Kalasabhishekam', price: '₹2,000' },
        { id: 19, name: 'Pradosham Special Pooja', price: '₹1,300' },
      ],
    },
    {
      id: 3,
      name: 'Madurai Temple',
      location: 'Tamil Nadu',
      deity: 'Goddess Meenakshi',
      poojas: 15,
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Historic temple dedicated to Goddess Parvati in the form of Meenakshi',
      availablePoojas: [
        { id: 3, name: 'Lakshmi Abhishekam', price: '₹900' },
        { id: 8, name: 'Lakshmi Kubera Homam', price: '₹2,800' },
        { id: 12, name: 'Lalita Sahasranama Archana', price: '₹600' },
        { id: 17, name: 'Varalakshmi Vratam', price: '₹1,500' },
      ],
    },
    {
      id: 4,
      name: 'Varanasi Temple',
      location: 'Uttar Pradesh',
      deity: 'Lord Shiva',
      poojas: 8,
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Ancient temple on the banks of the holy Ganges river',
      availablePoojas: [
        { id: 5, name: 'Saraswati Abhishekam', price: '₹850' },
        { id: 14, name: 'Hanuman Chalisa Archana', price: '₹350' },
        { id: 7, name: 'Navagraha Homam', price: '₹3,500' },
      ],
    },
    {
      id: 5,
      name: 'Siddhi Vinayak Temple',
      location: 'Maharashtra',
      deity: 'Lord Ganesha',
      poojas: 9,
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Famous temple dedicated to Lord Ganesha in Mumbai',
      availablePoojas: [
        { id: 4, name: 'Ganesha Abhishekam', price: '₹800' },
        { id: 6, name: 'Ganapathi Homam', price: '₹2,500' },
        { id: 13, name: 'Ashtottara Shatanamavali', price: '₹400' },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View 
        className="px-6 pb-4 bg-background border-b border-border"
        style={{ paddingTop: insets.top > 0 ? insets.top + 8 : 16 }}
      >
        <Text className="text-2xl font-bold text-foreground" style={{ fontFamily: 'System' }}>
          {t('temples.title')}
        </Text>
        <Text className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'System' }}>
          {t('temples.subtitle')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {temples.map((temple) => (
          <View key={temple.id} className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
            {/* Image */}
            <View className="relative h-48">
              <Image
                source={{ uri: temple.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute top-4 right-4 flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-card/90">
                <Star size={16} color="#EAB308" fill="#EAB308" />
                <Text className="text-sm font-medium text-foreground" style={{ fontFamily: 'System' }}>
                  {temple.rating}
                </Text>
              </View>
            </View>

            {/* Content */}
            <View className="p-5">
              <Text className="text-xl font-bold mb-1 text-foreground" style={{ fontFamily: 'System' }}>
                {temple.name}
              </Text>
              <View className="flex-row items-center gap-4 mb-3">
                <View className="flex-row items-center gap-1">
                  <MapPin size={16} color="#78716C" />
                  <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
                    {temple.location}
                  </Text>
                </View>
                <Text className="text-muted-foreground">•</Text>
                <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
                  {temple.deity}
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground leading-relaxed mb-4" style={{ fontFamily: 'System' }}>
                {temple.description}
              </Text>

              <View className="flex-row items-center justify-between pt-4 border-t border-border">
                <View className="flex-row items-center gap-2">
                  <Flame size={16} color="#F97316" />
                  <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
                    {temple.poojas} {t('temples.availablePoojas')}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setExpandedTemple(expandedTemple === temple.id ? null : temple.id)}
                  className="px-5 py-2 rounded-xl bg-primary active:bg-[#E05C10]"
                >
                  <Text className="text-primary-foreground font-medium text-sm" style={{ fontFamily: 'System' }}>
                    {expandedTemple === temple.id ? t('temples.hide') : t('temples.explore')}
                  </Text>
                </Pressable>
              </View>

              {/* Expanded Poojas List */}
              {expandedTemple === temple.id && (
                <View className="pt-4 mt-4 border-t border-border">
                  <Text className="text-sm font-semibold mb-3 text-foreground" style={{ fontFamily: 'System' }}>
                    {t('temples.availablePoojas')}
                  </Text>
                  <View className="space-y-2">
                    {temple.availablePoojas.map((pooja) => (
                      <Link key={pooja.id} href={`/pooja/${pooja.id}` as any} asChild>
                        <Pressable className="flex-row items-center justify-between p-3 rounded-xl bg-muted/30 active:bg-muted/50 mb-2">
                          <Text className="text-sm font-medium text-foreground" style={{ fontFamily: 'System' }}>
                            {pooja.name}
                          </Text>
                          <Text className="text-sm font-semibold text-primary" style={{ fontFamily: 'System' }}>
                            {pooja.price}
                          </Text>
                        </Pressable>
                      </Link>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
