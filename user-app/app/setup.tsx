import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { View, Text, Pressable, ScrollView } from 'react-native';

const deities = [
  { id: 'ganesha', name: 'Ganesha', emoji: '🐘' },
  { id: 'lakshmi', name: 'Lakshmi', emoji: '💰' },
  { id: 'shiva', name: 'Shiva', emoji: '🔱' },
  { id: 'vishnu', name: 'Vishnu', emoji: '🦅' },
  { id: 'durga', name: 'Durga', emoji: '🦁' },
  { id: 'saraswati', name: 'Saraswati', emoji: '📿' },
  { id: 'hanuman', name: 'Hanuman', emoji: '🐵' },
  { id: 'murugan', name: 'Murugan', emoji: '🦚' },
];

export default function ProfileSetup() {
  const [selected, setSelected] = useState<string[]>(['lakshmi', 'shiva']);
  const router = useRouter();

  const toggleDeity = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <ScrollView className="flex-1 bg-[#1A0A00]" contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}>
      {/* Progress Indicator */}
      <View className="flex-row items-center justify-center gap-2 mb-8">
        <View className="w-3 h-3 rounded-full bg-primary" />
        <View className="w-3 h-3 rounded-full bg-muted-foreground/30" />
      </View>

      {/* Heading */}
      <Text
        className="text-2xl font-bold mb-3"
        style={{ fontFamily: 'System', color: '#F5F5F0' }}
      >
        Which deities do you hold closest?
      </Text>

      {/* Subtitle */}
      <Text
        className="text-sm mb-8"
        style={{ fontFamily: 'System', color: '#78716C' }}
      >
        We will personalise your pooja suggestions based on your answer.
      </Text>

      {/* Deity Grid */}
      <View className="flex-row flex-wrap justify-between mb-8">
        {deities.map((deity) => {
          const isSelected = selected.includes(deity.id);
          return (
            <Pressable
              key={deity.id}
              onPress={() => toggleDeity(deity.id)}
              className={`relative aspect-square w-[48%] rounded-xl p-6 mb-4 flex-col items-center justify-center ${
                isSelected
                  ? 'bg-[#2D0A2E] border-2 border-primary'
                  : 'bg-[#2D0A2E] border border-border'
              }`}
            >
              {/* Checkmark */}
              {isSelected && (
                <View className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check size={16} color="#1A0A00" />
                </View>
              )}

              {/* Deity Illustration */}
              <Text className="text-5xl mb-3">{deity.emoji}</Text>

              {/* Deity Name */}
              <Text
                className="text-sm font-medium"
                style={{ fontFamily: 'System', color: '#F5F5F0' }}
              >
                {deity.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* CTAs */}
      <View className="space-y-4 pb-8">
        <Pressable
          onPress={handleContinue}
          disabled={selected.length === 0}
          className={`w-full py-4 rounded-xl items-center justify-center ${
            selected.length === 0
              ? 'bg-muted'
              : 'bg-primary active:bg-[#E05C10]'
          }`}
        >
          <Text
            className={`font-medium text-base ${
              selected.length === 0 ? 'text-muted-foreground' : 'text-[#1A0A00]'
            }`}
            style={{ fontFamily: 'System' }}
          >
            Continue
          </Text>
        </Pressable>

        <Pressable
          onPress={handleContinue}
          className="w-full py-2 mt-2 items-center justify-center"
        >
          <Text
            className="text-sm text-muted-foreground"
            style={{ fontFamily: 'System' }}
          >
            Skip for now
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
