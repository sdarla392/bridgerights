import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

import { Pressable } from '@/components/pressable';
import type { Option } from '@/features/cases/data/questions';
import { cn } from '@/lib/cn';

interface ChoiceGroupProps {
  question: string;
  hint?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export function ChoiceGroup({ question, hint, options, value, onChange }: ChoiceGroupProps) {
  const accent = useThemeColor('accent');
  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text className="font-serif text-xl font-semibold text-foreground">{question}</Text>
        {hint ? <Text className="text-sm text-muted">{hint}</Text> : null}
      </View>
      <View className="gap-2">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              className={cn(
                'flex-row items-center gap-3 rounded-2xl border px-4 py-3',
                selected ? 'border-accent bg-accent/10' : 'border-border bg-surface',
              )}>
              <Text className={cn('flex-1 text-base', selected ? 'font-semibold text-foreground' : 'text-foreground')}>{o.label}</Text>
              {selected ? <Ionicons name="checkmark-circle" size={22} color={accent} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
