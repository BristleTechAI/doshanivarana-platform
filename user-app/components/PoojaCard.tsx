// @ts-nocheck
import { View, Text, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';

interface PoojaCardProps {
  id?: string;
  title: string;
  temple: string;
  price: string;
  imageUrl: string;
  badge?: string;
  isLive?: boolean;
}

export function PoojaCard({
  id = '1',
  title,
  temple,
  price,
  imageUrl,
  badge,
  isLive,
}: PoojaCardProps) {
  return (
    <Link href={`/pooja/${id}` as any} asChild>
      <Pressable className="w-56 bg-card border border-border rounded-2xl overflow-hidden active:border-primary/50 mr-4">
        <View className="relative aspect-video">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {badge && (
            <View className={`absolute top-3 left-3 px-3 py-1 rounded-full ${
              isLive ? 'bg-red-600' : 'bg-primary'
            }`}>
              <Text className={`text-xs font-bold ${
                isLive ? 'text-white' : 'text-primary-foreground'
              }`}>
                {badge}
              </Text>
            </View>
          )}
        </View>
        <View className="p-4">
          <Text className="font-semibold text-foreground mb-1 text-base" numberOfLines={1} style={{ fontFamily: 'System' }}>
            {title}
          </Text>
          <Text className="text-xs text-muted-foreground mb-2" numberOfLines={1} style={{ fontFamily: 'System' }}>
            {temple}
          </Text>
          <Text className="font-semibold text-primary" style={{ fontFamily: 'System' }}>
            {price}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
