import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from 'heroui-native';
import { ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Pressable } from '@/components/pressable';
import { Section } from '@/components/section';
import { useCasesStore } from '@/features/cases/store/cases-store';
import { authClient } from '@/lib/auth';

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

function HubBox({ accent, icon, title, body, onPress }: { accent: string; icon: keyof typeof Ionicons.glyphMap; title: string; body: string; onPress: () => void }) {
  return (
    <Card>
      <Pressable onPress={onPress} accessibilityRole="button" className="flex-row items-center gap-4">
        <View className="size-12 items-center justify-center rounded-2xl bg-accent/10">
          <Ionicons name={icon} size={24} color={accent} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-semibold text-foreground">{title}</Text>
          <Text className="text-sm text-muted">{body}</Text>
        </View>
      </Pressable>
    </Card>
  );
}

export default function HomeScreen() {
  const accent = useThemeColor('accent');
  const { data: session } = authClient.useSession();
  const cases = useCasesStore((s) => s.cases);
  const pending = cases.flatMap((c) => c.tasks.filter((t) => !t.done).map((t) => ({ ...t, caseId: c.id })));
  const first = session?.user?.name?.split(' ')[0] ?? '';
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-safe-offset-6 pb-safe-offset-22 gap-6"
      showsVerticalScrollIndicator={false}>
      <View className="gap-3">
        <Text className="text-sm font-semibold text-accent">BridgeRights · Santa Clara County</Text>
        <Text className="font-serif text-4xl font-bold leading-tight text-foreground">{first ? `Welcome back, ${first}` : 'Welcome back'}</Text>
        <SpanArt />
      </View>

      <View className="gap-3">
        <HubBox accent={accent} icon="chatbubbles-outline" title="Counselor" body="Ask the AI chatbot a question in plain words" onPress={() => router.push('/ask')} />
        <HubBox accent={accent} icon="home-outline" title="Your housing case" body={cases.length ? 'Open your rights, notice and plan' : 'Check your rights and start a plan'} onPress={() => router.push(cases[0] ? `/case/${cases[0].id}` : '/check')} />
        <HubBox accent={accent} icon="map-outline" title="Relocation services" body="Relocation Matchmaker: homes that fit your household, with a Stability Score" onPress={() => router.push('/matchmaker')} />
      </View>

      <Section title="Upcoming">
        <Card>
          <Text className="text-base font-semibold text-foreground">{pending.length ? `Tasks pending (${pending.length})` : 'Tasks pending'}</Text>
          {pending.length ? (
            pending.slice(0, 4).map((t) => (
              <Pressable key={t.id} onPress={() => router.push(`/case/${t.caseId}`)} className="flex-row items-center gap-3 py-1">
                <View className="size-2 rounded-full bg-accent" />
                <Text className="flex-1 text-sm text-foreground" numberOfLines={2}>{t.title}</Text>
              </Pressable>
            ))
          ) : (
            <Text className="text-sm text-muted">Nothing pending. Start a case and your steps will appear here.</Text>
          )}
        </Card>
      </Section>

      <Card>
        <Text className="text-base font-semibold text-foreground">Information, not legal advice</Text>
        <Text className="text-sm text-muted">
          BridgeRights is not a lawyer or a court, and it never says you will or will not win. Your case stays on your phone unless you ask the AI helper a question.
        </Text>
      </Card>
    </ScrollView>
  );
}
