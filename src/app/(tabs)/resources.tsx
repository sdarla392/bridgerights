import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from 'heroui-native';
import { router } from 'expo-router';
import { Linking, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { ListRow } from '@/components/list-row';
import { Section } from '@/components/section';
import { authClient } from '@/lib/auth';
import { RESOURCES, SOURCES } from '@/features/cases/data/jurisdictions';

const HOW = [
  { title: 'Answer a few questions', body: 'Say where you live and what happened. Skip anything with “I don’t know”.' },
  { title: 'Read what may apply', body: 'See protections in plain words, and what to ask a counselor.' },
  { title: 'Work through your steps', body: 'Tick off tasks and watch the bridge fill as you go.' },
];

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
      <Section title="How to use this app">
        <Card>
          {HOW.map((h, i) => (
            <View key={h.title} className="flex-row items-start gap-3">
              <Text className="w-6 font-serif text-xl font-bold text-accent">{i + 1}</Text>
              <View className="flex-1 gap-0.5">
                <Text className="text-base font-semibold text-foreground">{h.title}</Text>
                <Text className="text-sm text-muted">{h.body}</Text>
              </View>
            </View>
          ))}
        </Card>
      </Section>
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
      <ListRow title="Sign out" subtitle="Your cases stay on this phone" onPress={() => authClient.signOut()} />
    </ScrollView>
  );
}
