import { router } from 'expo-router';
import { Button } from 'heroui-native';
import { ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { ListRow } from '@/components/list-row';
import { pressHaptic } from '@/components/pressable';
import { Section } from '@/components/section';
import { useCasesStore } from '@/features/cases/store/cases-store';
import { reasonLabel, cityName } from '@/features/cases/utils/summary';

const HOW = [
  { title: 'Answer a few questions', body: 'Say where you live and what happened. Skip anything with “I don’t know”.' },
  { title: 'Read what may apply', body: 'See protections in plain words, and what to ask a counselor.' },
  { title: 'Work through your steps', body: 'Tick off tasks and watch the bridge fill as you go.' },
];

function SpanArt() {
  return (
    <View className="gap-1" accessibilityElementsHidden>
      <View className="h-14 flex-row items-end justify-between px-2">
        {[0.5, 0.8, 1, 0.8, 0.5].map((h, i) => (
          <View key={i} className="w-2 rounded-t-sm bg-accent" style={{ height: `${h * 100}%` }} />
        ))}
      </View>
      <View className="h-1.5 rounded-full bg-foreground" />
      <View className="flex-row justify-between px-6">
        <View className="h-5 w-3 bg-foreground/70" />
        <View className="h-5 w-3 bg-foreground/70" />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const cases = useCasesStore((s) => s.cases);
  const latest = cases[0];
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-safe-offset-6 pb-safe-offset-22 gap-6"
      showsVerticalScrollIndicator={false}>
      <View className="gap-4">
        <Text className="text-sm font-semibold text-accent">BridgeRights · Santa Clara County</Text>
        <Text className="font-serif text-4xl font-bold leading-tight text-foreground">Understand my housing situation.</Text>
        <Text className="text-base text-muted">
          Answer a few questions, see which tenant protections may apply, check your notice, and keep track of every step.
        </Text>
        <SpanArt />
      </View>

      <View className="gap-3">
        <Button
          size="lg"
          onPress={() => {
            pressHaptic();
            router.push('/check');
          }}>
          <Button.Label>Start a new case</Button.Label>
        </Button>
        {latest ? (
          <Button
            size="lg"
            variant="secondary"
            onPress={() => {
              pressHaptic();
              router.push(`/case/${latest.id}`);
            }}>
            <Button.Label>{`Resume: ${cityName(latest.facts.city)}, ${reasonLabel(latest.facts.reason).toLowerCase()}`}</Button.Label>
          </Button>
        ) : null}
      </View>

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

      <Card>
        <Text className="text-base font-semibold text-foreground">Information, not legal advice</Text>
        <Text className="text-sm text-muted">
          BridgeRights is not a lawyer or a court, and it never says you will or will not win. Your case stays on your phone unless you ask the AI helper a question.
        </Text>
      </Card>

      <ListRow title="Ask a question" subtitle="An AI helper answers in plain words" onPress={() => router.push('/ask')} />
      <ListRow title="Browse tenant resources" subtitle="Legal aid, counselors, official guides" onPress={() => router.push('/resources')} />
    </ScrollView>
  );
}
