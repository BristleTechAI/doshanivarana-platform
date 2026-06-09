import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Share2, MapPin, Clock, Play, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';

export default function PoojaDetail() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'where' | 'how' | 'why'>('overview');
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-background pb-24">
      <ScrollView className="flex-1" stickyHeaderIndices={[1]}>
        {/* Hero Image */}
        <View className="relative h-52">
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080" }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Overlay Controls */}
          <View className="absolute left-4" style={{ top: insets.top > 0 ? insets.top : 12 }}>
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-background/80 items-center justify-center"
            >
              <ArrowLeft size={20} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
            </Pressable>
          </View>
          <View className="absolute right-4" style={{ top: insets.top > 0 ? insets.top : 12 }}>
            <Pressable className="w-10 h-10 rounded-full bg-background/80 items-center justify-center">
              <Share2 size={20} color={theme === 'dark' ? '#F5F5F0' : '#1C1917'} />
            </Pressable>
          </View>
        </View>

        {/* Tab Bar */}
        <View className="bg-background border-b border-border">
          <View className="flex-row">
            {(['overview', 'where', 'how', 'why'] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="flex-1 py-4 items-center justify-center relative"
              >
                <Text
                  className={`text-sm font-medium uppercase ${
                    activeTab === tab ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  style={{ fontFamily: 'System' }}
                >
                  {tab}
                </Text>
                {activeTab === tab && (
                  <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-6 py-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'where' && <WhereTab />}
          {activeTab === 'how' && <HowTab />}
          {activeTab === 'why' && <WhyTab />}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <Pressable
          onPress={() => router.push(`/booking/${id || '1'}` as any)}
          className="w-full py-4 rounded-xl bg-primary items-center justify-center active:bg-[#E05C10]"
        >
          <Text className="text-primary-foreground font-medium text-base" style={{ fontFamily: 'System' }}>
            Offer This Pooja — ₹1,100
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function OverviewTab() {
  const { theme } = useTheme();
  return (
    <View className="space-y-6">
      {/* Title */}
      <View>
        <Text className="text-3xl font-bold mb-2 text-foreground" style={{ fontFamily: 'System' }}>
          Rudrabhishek
        </Text>
        <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
          Sacred bathing of the Shivalinga with holy water, milk and bilva leaves.
        </Text>
      </View>

      {/* Pujari Card */}
      <View className="bg-card border border-border rounded-xl p-4 flex-row items-center gap-4">
        <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
          <Text className="text-2xl">🙏</Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-foreground" style={{ fontFamily: 'System' }}>
            Pandit Ramesh Sharma
          </Text>
          <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
            22 years experience • Telugu, Sanskrit
          </Text>
        </View>
      </View>

      {/* Temple Card */}
      <View className="bg-card border border-border rounded-xl p-4 flex-row items-center gap-3">
        <MapPin size={20} color="#F97316" />
        <View>
          <Text className="font-medium text-sm text-foreground" style={{ fontFamily: 'System' }}>
            Sri Kalahasti Shivalayam
          </Text>
          <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
            Prithvi Linga Shrine, Tirupati
          </Text>
        </View>
      </View>

      {/* Live Streaming Badge */}
      <View className="self-start flex-row items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
        <Play size={16} color="#F97316" />
        <Text className="text-sm font-medium text-primary" style={{ fontFamily: 'System' }}>
          Live Stream Available
        </Text>
      </View>

      {/* Video Thumbnail */}
      <View className="aspect-video bg-card border border-border rounded-xl overflow-hidden relative">
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080" }}
          className="w-full h-full absolute"
          resizeMode="cover"
        />
        <View className="flex-1 items-center justify-center z-10 bg-black/20">
          <View className="w-16 h-16 rounded-full bg-primary/90 items-center justify-center pl-1">
            <Play size={32} color={theme === 'dark' ? '#1A0A00' : '#F5F5F0'} />
          </View>
        </View>
      </View>

      {/* Price */}
      <View className="pt-4 border-t border-border mt-2">
        <Text className="text-sm text-muted-foreground mb-1" style={{ fontFamily: 'System' }}>
          Seva Amount
        </Text>
        <Text className="text-3xl font-bold text-primary" style={{ fontFamily: 'System' }}>
          ₹1,100
        </Text>
      </View>
    </View>
  );
}

function WhereTab() {
  return (
    <View className="space-y-6">
      <Text className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'System' }}>
        Where this pooja is conducted
      </Text>

      <View>
        <Text className="text-2xl font-bold mb-2 text-foreground" style={{ fontFamily: 'System' }}>
          Sri Kalahasti Shivalayam
        </Text>
        <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
          Prithvi Linga Shrine — one of the Pancha Bhuta Stalas
        </Text>
      </View>

      {/* Map Placeholder */}
      <View className="aspect-video bg-card border border-border rounded-xl items-center justify-center">
        <MapPin size={48} color="#78716C" />
      </View>

      <View>
        <Text className="text-xs text-muted-foreground mb-4" style={{ fontFamily: 'System' }}>
          Kailasa Kona, Sri Kalahasti, Tirupati, Andhra Pradesh — 517640
        </Text>
        <Text className="text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: 'System' }}>
          Sri Kalahasti is one of the five Pancha Bhuta Stalas representing the element of Air (Vayu). 
          The temple is renowned for its Rahu-Ketu pooja and is believed to be the place where the divine 
          spider Kala, serpent Hasti, and elephant worshipped Lord Shiva, giving the temple its name.
        </Text>
      </View>

      {/* Temple Photos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
        {[1, 2, 3].map((i) => (
          <Image
            key={i}
            source={{ uri: "https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080" }}
            className="w-48 h-32 rounded-xl mr-3"
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    </View>
  );
}

function HowTab() {
  const steps = [
    { name: 'Ganapathi Vandanam', desc: 'Invoking Lord Ganesha to remove obstacles.' },
    { name: 'Punyahavachanam', desc: 'Purification of the space and devotee.' },
    { name: 'Shivalinga Abhishekam', desc: 'Sacred bath with water, milk, curd, honey and ghee.' },
    { name: 'Sri Rudram Chanting', desc: 'The pujari chants all 11 anuvakas of Sri Rudram.' },
    { name: 'Bilvaarchana', desc: 'Offering of 108 bilva leaves chanting each name of Shiva.' },
    { name: 'Mangalarati', desc: 'Concluding aarti with camphor and conch.' },
  ];

  return (
    <View className="space-y-6">
      <Text className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'System' }}>
        How this pooja is conducted
      </Text>

      {/* Duration & Language */}
      <View className="flex-row gap-3">
        <View className="px-4 py-2 rounded-lg bg-primary/10 flex-row items-center gap-2">
          <Clock size={16} color="#F97316" />
          <Text className="text-sm font-medium text-primary" style={{ fontFamily: 'System' }}>
            2 Hours
          </Text>
        </View>
        <View className="px-4 py-2 rounded-lg bg-card border border-border flex-row items-center gap-2">
          <Text className="text-sm font-medium text-foreground" style={{ fontFamily: 'System' }}>
            Sanskrit + Telugu
          </Text>
        </View>
      </View>

      {/* Steps */}
      <View className="space-y-4">
        {steps.map((step, index) => (
          <View key={index} className="flex-row gap-4">
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
              <Text className="text-primary font-semibold">{index + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground mb-1" style={{ fontFamily: 'System' }}>
                {step.name}
              </Text>
              <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
                {step.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* What to do during stream */}
      <View className="bg-card border border-border rounded-xl p-4 mt-2">
        <Text className="font-semibold text-foreground mb-2" style={{ fontFamily: 'System' }}>
          What to do during the stream
        </Text>
        <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
          Have the stream open. Chant along if you know the mantras. Light a diya at home during the aarti.
        </Text>
      </View>
    </View>
  );
}

function WhyTab() {
  return (
    <View className="space-y-6">
      <Text className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'System' }}>
        Why devotees offer this pooja
      </Text>

      <Text className="text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: 'System' }}>
        The Rudrabhishek is one of the most sacred rituals in Hindu tradition. It is performed to invoke 
        Lord Shiva's blessings and to seek his grace for peace, prosperity, and spiritual growth. This 
        pooja is particularly powerful for removing negative energies and obstacles from one's life.
      </Text>

      {/* Puranic Reference */}
      <View className="bg-card border border-border rounded-xl p-4 mt-2">
        <Text className="text-xs text-muted-foreground italic" style={{ fontFamily: 'System' }}>
          The Shiva Purana describes the Rudrabhishek as equivalent to performing a thousand Ashwamedha Yagnas.
        </Text>
      </View>

      {/* Blessings */}
      <View className="mt-4">
        <Text className="font-medium text-foreground mb-3" style={{ fontFamily: 'System' }}>
          Blessings this pooja is said to bring
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <View className="px-4 py-2 rounded-full bg-green-500/10 mb-2 mr-2">
            <Text className="text-green-500 text-sm font-medium">Health and longevity</Text>
          </View>
          <View className="px-4 py-2 rounded-full bg-primary/10 mb-2 mr-2">
            <Text className="text-primary text-sm font-medium">Removal of obstacles</Text>
          </View>
          <View className="px-4 py-2 rounded-full bg-blue-500/10 mb-2">
            <Text className="text-blue-500 text-sm font-medium">Peace of mind</Text>
          </View>
        </View>
      </View>

      {/* Personalized Highlight */}
      <View className="bg-primary/5 border-2 border-primary/30 rounded-xl p-4 mt-4">
        <Text className="font-semibold text-primary mb-2" style={{ fontFamily: 'System' }}>
          Especially auspicious for you
        </Text>
        <Text className="text-sm text-muted-foreground" style={{ fontFamily: 'System' }}>
          This pooja is especially auspicious for your Shravana Nakshatra. Lord Vishnu, the ruling deity 
          of Shravana, is closely connected to Lord Shiva through this ritual.
        </Text>
      </View>

      {/* Suitable for Rashi */}
      <View className="mt-4">
        <Text className="text-sm font-medium text-muted-foreground mb-2" style={{ fontFamily: 'System' }}>
          Suitable for Rashi
        </Text>
        <View className="flex-row gap-2">
          {['Makara ✓', 'Kumbha ✓', 'Simha ✓'].map((rashi) => (
            <View
              key={rashi}
              className="px-3 py-1.5 rounded-full bg-card border border-border mr-2"
            >
              <Text className="text-xs font-medium text-foreground" style={{ fontFamily: 'System' }}>
                {rashi}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
