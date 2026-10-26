import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Pressable } from '@/components/pressable';
import { Section } from '@/components/section';
import { HeatMap } from '@/features/relocation/components/heat-map';
import { MatchCard } from '@/features/relocation/components/match-card';
import { rankListings, type Needs } from '@/features/relocation/utils/stability';

const DEFAULT_NEEDS: Needs = {
  budget: 3200,
  household: 2,
  bedrooms: 1,
  workPlaceId: 'san-jose',
  familiarPlaceId: 'san-jose',
  needsStepFree: false,
  dailyCare: false,
  types: [],
  pets: false,
  parking: false,
  laundry: false,
  transit: false,
  minBaths: 0,
  maxCommuteMin: 45,
};

function parseNeeds(raw: string | undefined): Needs {
  if (!raw) return DEFAULT_NEEDS;
  try {
    return { ...DEFAULT_NEEDS, ...(JSON.parse(raw) as Partial<Needs>) };
  } catch {
    return DEFAULT_NEEDS;
  }
}

export default function MatchesScreen() {
  const muted = useThemeColor('muted');
  const { needs: raw } = useLocalSearchParams<{ needs?: string }>();
  const needs = parseNeeds(raw);
  const top = rankListings(needs).slice(0, 15);
  const [selected, setSelected] = useState(top[0]?.listing.placeId ?? 'san-jose');

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-5 pt-safe-offset-2 pb-safe-offset-4 gap-6">
      <View className="flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" className="size-11 items-center justify-center">
          <Ionicons name="chevron-back" size={26} color={muted} />
        </Pressable>
        <Text className="flex-1 font-serif text-2xl font-bold text-foreground">Your top 15 homes</Text>
      </View>
      <Text className="text-base text-muted">Ranked by suitability score, best fit first. Tap a home to see why it scored that way, or open its addresses.</Text>

      <Section title="Homes ranked by suitability score">
        <View className="gap-3">
          {top.map((m, i) => (
            <MatchCard
              key={m.listing.id}
              m={m}
              rank={i + 1}
              onAddresses={() => router.push(`/addresses?placeId=${m.listing.placeId}`)}
            />
          ))}
        </View>
      </Section>

      <Section title="Bay Area fit map">
        <HeatMap needs={needs} selected={selected} onSelect={setSelected} />
        <Pressable
          onPress={() => router.push(`/addresses?placeId=${selected}`)}
          accessibilityRole="button"
          className="h-12 items-center justify-center rounded-xl border border-border">
          <Text className="text-sm font-semibold text-accent">See addresses for the selected city</Text>
        </Pressable>
      </Section>

      <Card>
        <Text className="text-sm font-semibold text-foreground">About these scores</Text>
        <Text className="text-sm text-muted">
          The homes are samples, not live listings. A Stability Score estimates how well a home fits your budget and practical needs. It is not a guarantee that rent will stay the same. Rents can change, so ask any landlord about future increases and whether local rent rules cover the home.
        </Text>
      </Card>

      <Pressable onPress={() => router.back()} accessibilityRole="button" className="h-14 items-center justify-center rounded-2xl border border-border">
        <Text className="text-base font-semibold text-accent">Change my selections</Text>
      </Pressable>
    </ScrollView>
  );
}
