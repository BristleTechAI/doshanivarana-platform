import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

interface CategoryCardProps {
  title: string;
  count: string;
  icon: string;
  color: string;
}

export function CategoryCard({ title, count, icon, color }: CategoryCardProps) {
  return (
    <Link href="/(tabs)/poojas" asChild>
      <Pressable className="w-[48%] bg-card border border-border rounded-2xl overflow-hidden active:border-primary/50 mb-4">
        <View 
          className="aspect-[4/3] items-center justify-center" 
          style={{ backgroundColor: `${color}15` }}
        >
          <Text className="text-4xl">{icon}</Text>
        </View>
        <View className="p-4">
          <Text className="font-semibold text-foreground text-sm mb-1" style={{ fontFamily: 'System' }}>
            {title}
          </Text>
          <Text className="text-xs text-muted-foreground" style={{ fontFamily: 'System' }}>
            {count}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
