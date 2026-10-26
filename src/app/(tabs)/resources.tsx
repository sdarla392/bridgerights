import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from 'heroui-native';
import { router } from 'expo-router';
import { Linking, ScrollView, Text } from 'react-native';

import { Card } from '@/components/card';
import { ListRow } from '@/components/list-row';
import { Section } from '@/components/section';
import { RESOURCES, SOURCES } from '@/features/cases/data/jurisdictions';

export default function ResourcesScreen() {
  const muted = useThemeColor('muted');
  const open = (url: string) => Linking.openURL(url);
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-safe-offset-2 pb-safe-offset-22 gap-6"
      showsVerticalScrollIndicator={false}>
      <Text className="font-serif text-3xl font-bold text-foreground">Help near you</Text>
      <Text className="text-base text-muted">If you have court papers or a deadline close by, contact one of these today.</Text>
      <ListRow title="Ask the AI helper" subtitle="Get plain-words answers to any question" onPress={() => router.push('/ask')} />
      <Section title="Get support">
        <Card list>
          {RESOURCES.map((r) => (
            <ListRow
              key={r.id}
              title={r.name}
              subtitle={`${r.kind} · ${r.blurb}`}
              right={<Ionicons name="open-outline" size={16} color={muted} />}
              onPress={() => open(r.url)}
            />
          ))}
        </Card>
      </Section>
      <Section title="Official sources used">
        <Card list>
          {SOURCES.map((s) => (
            <ListRow key={s.id} title={s.title} subtitle={`${s.type} · ${s.jurisdiction}`} onPress={() => open(s.url)} />
          ))}
        </Card>
      </Section>
    </ScrollView>
  );
}
