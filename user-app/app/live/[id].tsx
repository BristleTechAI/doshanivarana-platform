import { useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Volume2, VolumeX, Maximize2, Eye } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/old_app/context/ThemeContext';

export default function LiveStreamScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [isMuted, setIsMuted] = useState(false);

  // Mock details for the live broadcast
  const streamInfo = {
    title: 'Rudrabhishek',
    temple: 'Sri Kalahasti Shivalayam, Tirupati',
    devoteeName: 'Priya Sharma & Family',
    viewerCount: 312,
    videoUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  };

  return (
    <View className="flex-1 bg-[#1A0A00] flex-col justify-between">
      {/* Video Container (occupies majority of screen) */}
      <View className="flex-1 relative bg-[#2D0A2E] m-2 rounded-3xl overflow-hidden border border-primary/20">
        <Image
          source={{ uri: streamInfo.videoUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Video Overlay Top Controls */}
        <View 
          className="absolute top-0 left-0 right-0 flex-row items-center justify-between p-4"
          style={{ paddingTop: insets.top > 0 ? insets.top + 8 : 16 }}
        >
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#1A0A00]/80 items-center justify-center border border-border/20 active:bg-[#1A0A00]/95"
          >
            <ArrowLeft size={20} color="#F5F5F0" />
          </Pressable>

          {/* Title */}
          <View className="flex-1 px-4 items-center">
            <Text className="text-sm font-bold text-[#F5F5F0] text-center" style={{ fontFamily: 'System' }}>
              {streamInfo.title}
            </Text>
            <Text className="text-[10px] text-[#78716C] text-center" style={{ fontFamily: 'System' }} numberOfLines={1}>
              {streamInfo.temple}
            </Text>
          </View>

          {/* Live Badge */}
          <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-red-600">
            <View className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <Text className="text-[10px] font-bold text-white tracking-wider" style={{ fontFamily: 'System' }}>
              LIVE
            </Text>
          </View>
        </View>

        {/* Video Overlay Bottom Caption (Devotee dedication info) */}
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pt-12">
          <Text className="text-center text-xs text-[#78716C] mb-1" style={{ fontFamily: 'System' }}>
            This Seva is being conducted on behalf of:
          </Text>
          <Text className="text-center text-sm font-bold text-primary" style={{ fontFamily: 'System' }}>
            {streamInfo.devoteeName}
          </Text>
        </View>
      </View>

      {/* Control Area & Instructions */}
      <View 
        className="px-6 pb-6 pt-3 space-y-4"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24 }}
      >
        {/* Stream Metrics Info */}
        <View className="flex-row items-center justify-between text-xs mb-3">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full bg-green-500" />
            <Text className="text-[#78716C] text-xs" style={{ fontFamily: 'System' }}>720p HD • Smooth</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Eye size={14} color="#78716C" />
            <Text className="text-[#78716C] text-xs" style={{ fontFamily: 'System' }}>
              {streamInfo.viewerCount} Devotees Joined
            </Text>
          </View>
        </View>

        {/* Control Buttons */}
        <View className="flex-row items-center justify-center gap-6 mb-4">
          <Pressable 
            onPress={() => setIsMuted(!isMuted)}
            className="w-12 h-12 rounded-full bg-[#2D0A2E] border border-border/40 items-center justify-center active:bg-muted/40"
          >
            {isMuted ? (
              <VolumeX size={20} color="#F97316" />
            ) : (
              <Volume2 size={20} color="#F97316" />
            )}
          </Pressable>
          <Pressable 
            className="w-12 h-12 rounded-full bg-[#2D0A2E] border border-border/40 items-center justify-center active:bg-muted/40"
          >
            <Maximize2 size={20} color="#F5F5F0" />
          </Pressable>
        </View>

        {/* Brand/Devotional warning guidance */}
        <View className="bg-card border border-border/20 rounded-2xl p-4 items-center">
          <Text className="text-center text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: 'System' }}>
            🙏 Chant along with the pujari if you know the mantras. Feel free to light a diya at your home temple during the Mangalarati.
          </Text>
        </View>
      </View>
    </View>
  );
}
