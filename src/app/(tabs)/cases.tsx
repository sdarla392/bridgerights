import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button, useThemeColor } from 'heroui-native';
import { ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { ListRow } from '@/components/list-row';
import { pressHaptic } from '@/components/pressable';
import { useCasesStore } from '@/features/cases/store/cases-store';
import { formatDate } from '@/features/cases/utils/dates';
import { cityName, reasonLabel } from '@/features/cases/utils/summary';

export default function CasesScreen() {
  const cases = useCasesStore((s) => s.cases);
  const accent = useThemeColor('accent');
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-safe-offset-2 pb-safe-offset-22 gap-6"
      showsVerticalScrollIndicator={false}>
      <Text className="font-serif text-3xl font-bold text-foreground">Your cases</Text>
      {cases.length === 0 ? (
        <Card>
          <Ionicons name="folder-open-outline" size={28} color={accent} />
          <Text className="text-base text-foreground">No cases yet. Start one and your answers, notice checks and steps are saved here.</Text>
          <Button
            onPress={() => {
              pressHaptic();
              router.push('/check');
            }}>
            <Button.Label>Start a new case</Button.Label>
          </Button>
        </Card>
      ) : (
        <Card list>
          {cases.map((c) => {
            const done = c.tasks.filter((t) => t.done).length;
            return (
              <ListRow
                key={c.id}
                title={`${cityName(c.facts.city)}: ${reasonLabel(c.facts.reason)}`}
                subtitle={`${done} of ${c.tasks.length} steps done · started ${formatDate(c.createdAt.slice(0, 10))}`}
                onPress={() => router.push(`/case/${c.id}`)}
              />
            );
          })}
        </Card>
      )}
      <View />
    </ScrollView>
  );
}
