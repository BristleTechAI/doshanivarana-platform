// @ts-nocheck
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, Linking } from 'react-native';
import { Link } from 'expo-router';
import { MapPin, Star, Flame } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';
import { useLanguage } from '../../src/old_app/context/LanguageContext';
import { TemplesService } from '../../src/services/firebase/temples';
import { PoojasService } from '../../src/services/firebase/poojas';
import { buildGoogleMapsDirectionsUrl, buildGoogleMapsSearchUrl } from '@devaseva/core';

export default function Temples() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [expandedTemple, setExpandedTemple] = useState<string | null>(null);
  const [temples, setTemples] = useState<any[]>([]);
  const [allPoojas, setAllPoojas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubTemples = TemplesService.subscribeToTemples((templeList) => {
      setTemples(templeList);
    });

    const unsubPoojas = PoojasService.subscribeToPoojas((poojaList) => {
      setAllPoojas(poojaList);
      setLoading(false);
    });

    return () => {
      unsubTemples();
      unsubPoojas();
    };
  }, []);

  const getTempleKey = (name: string, id: string) => {
    const clean = name.toLowerCase();
    if (clean.includes('tirumala')) return 'tirumala';
    if (clean.includes('rameshwaram')) return 'rameshwaram';
    if (clean.includes('madurai')) return 'madurai';
    if (clean.includes('varanasi')) return 'varanasi';
    if (clean.includes('siddhi vinayak') || clean.includes('siddhivinayak')) return 'siddhiVinayak';
    return id;
  };

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
        className="px-6 pb-4 bg-background border-b border-border"
        style={{ paddingTop: insets.top > 0 ? insets.top + 8 : 16 }}
      >
        <Text className="text-2xl font-bold text-foreground" style={{ fontFamily: 'System' }}>
          {t('temples.title')}
        </Text>
        <Text className="text-sm mt-1" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>
          {t('temples.subtitle')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {temples.map((temple) => {
          const tKey = getTempleKey(temple.name, temple.id);
          const templePoojas = allPoojas.filter((p: any) => p.templeId === temple.id);
          const poojasCount = templePoojas.length;
          
          const rating = temple.rating || 4.8;
          const imageUrl = temple.imageUrl || 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080';

          const name = t('templeDb.' + tKey + '.name') === 'templeDb.' + tKey + '.name' ? temple.name : t('templeDb.' + tKey + '.name');
          const location = t('templeDb.' + tKey + '.location') === 'templeDb.' + tKey + '.location' ? temple.location || temple.city : t('templeDb.' + tKey + '.location');
          const deity = t('templeDb.' + tKey + '.deity') === 'templeDb.' + tKey + '.deity' ? temple.deity : t('templeDb.' + tKey + '.deity');
          const description = t('templeDb.' + tKey + '.description') === 'templeDb.' + tKey + '.description' ? temple.description : t('templeDb.' + tKey + '.description');

          // Fallback missing coordinates
          const latitude = temple.latitude ?? 0;
          const longitude = temple.longitude ?? 0;
          const hasLocation = !!(latitude && longitude);

          return (
            <View key={temple.id} className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
              {/* Image */}
              <View className="relative h-48">
                <Image
                  source={{ uri: imageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute top-4 right-4 flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-card/90">
                  <Star size={16} color="#EAB308" fill="#EAB308" />
                  <Text className="text-sm font-medium text-foreground" style={{ fontFamily: 'System' }}>
                    {rating}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <View className="p-5">
                <Text className="text-xl font-bold mb-1 text-foreground" style={{ fontFamily: 'System' }}>
                  {name}
                </Text>
                <View className="flex-row items-center gap-4 mb-3">
                  <View className="flex-row items-center gap-1">
                    <MapPin size={16} color={theme === 'dark' ? '#A8A29E' : '#78716C'} />
                    <Text className="text-sm" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>
                      {location}
                    </Text>
                  </View>
                  <Text style={{ color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>•</Text>
                  <Text className="text-sm" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>
                    {deity}
                  </Text>
                </View>
                <Text className="text-sm leading-relaxed mb-4" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#44403C' }}>
                  {description}
                </Text>

                <View className="flex-row items-center justify-between pt-4 border-t border-border">
                  <View className="flex-row items-center gap-2">
                    <Flame size={16} color="#F97316" />
                    <Text className="text-sm" style={{ fontFamily: 'System', color: theme === 'dark' ? '#A8A29E' : '#78716C' }}>
                      {poojasCount} {t('temples.availablePoojas')}
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
                    <View className="gap-y-2">
                      {templePoojas.map((pooja) => {
                        const poojaTitle = t('poojaDb.' + pooja.id + '.title') === 'poojaDb.' + pooja.id + '.title' ? pooja.name : t('poojaDb.' + pooja.id + '.title');
                        return (
                          <Link key={pooja.id} href={`/pooja/${pooja.id}` as any} asChild>
                            <Pressable className="flex-row items-center justify-between p-3 rounded-xl bg-muted/30 active:bg-muted/50 mb-2">
                              <Text className="text-sm font-medium text-foreground" style={{ fontFamily: 'System' }}>
                                {poojaTitle}
                              </Text>
                              <Text className="text-sm font-semibold text-primary" style={{ fontFamily: 'System' }}>
                                ₹{pooja.price}
                              </Text>
                            </Pressable>
                          </Link>
                        );
                      })}
                    </View>
                    
                    <View className="pt-4 mt-2 border-t border-border">
                      <Text className="text-sm font-semibold mb-3 text-foreground" style={{ fontFamily: 'System' }}>
                        Location & Maps
                      </Text>
                      {hasLocation ? (
                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={() => Linking.openURL(buildGoogleMapsSearchUrl(latitude, longitude))}
                            className="flex-1 px-3 py-2.5 rounded-xl border border-primary items-center"
                          >
                            <Text className="text-primary font-medium text-sm" style={{ fontFamily: 'System' }}>
                              Open in Maps
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => Linking.openURL(buildGoogleMapsDirectionsUrl(latitude, longitude))}
                            className="flex-1 px-3 py-2.5 rounded-xl bg-primary items-center active:bg-[#E05C10]"
                          >
                            <Text className="text-primary-foreground font-medium text-sm" style={{ fontFamily: 'System' }}>
                              Directions
                            </Text>
                          </Pressable>
                        </View>
                      ) : (
                        <View className="flex-row gap-2">
                          <Pressable
                            disabled={true}
                            className="flex-1 px-3 py-2.5 rounded-xl bg-muted items-center opacity-50"
                          >
                            <Text className="text-muted-foreground font-medium text-sm" style={{ fontFamily: 'System' }}>
                              Location not available
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
