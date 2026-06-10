// @ts-nocheck
import { View, Text, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';

interface TempleCardProps {
  name: string;
  deity: string;
  city: string;
  imageUrl: string;
}

export function TempleCard({ name, deity, city, imageUrl }: TempleCardProps) {
  return (
    <Link href="/(tabs)/temples" asChild>
      <Pressable className="w-48 rounded-2xl border border-border overflow-hidden bg-card active:border-primary/50 mr-4">
        <View className="aspect-[3/2]">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="p-3">
          <Text className="font-bold text-foreground text-sm mb-0.5" numberOfLines={1} style={{ fontFamily: 'System' }}>
            {name}
          </Text>
          <Text className="text-xs text-muted-foreground mb-0.5" numberOfLines={1} style={{ fontFamily: 'System' }}>
            {deity}
          </Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1} style={{ fontFamily: 'System' }}>
            {city}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
