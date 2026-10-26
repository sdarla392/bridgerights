import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Switch, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Card } from '@/components/card';
import { Pressable } from '@/components/pressable';
import { Section } from '@/components/section';
import { PLACES } from '@/features/relocation/data/places';
import { minimumBedrooms, type Needs } from '@/features/relocation/utils/stability';
import { cn } from '@/lib/cn';


function Stepper({ label, value, onChange, min, max, step = 1 }: { step?: number; label: string; value: number; onChange: (n: number) => void; min: number; max: number }) {
  const muted = useThemeColor('muted');
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-base text-foreground">{label}</Text>
      <View className="flex-row items-center gap-3">
        <Pressable onPress={() => onChange(Math.max(min, value - step))} accessibilityLabel={`Fewer ${label}`} className="size-11 items-center justify-center rounded-full border border-border">
          <Ionicons name="remove" size={20} color={muted} />
        </Pressable>
        <Text className="w-6 text-center text-lg font-semibold text-foreground">{value}</Text>
        <Pressable onPress={() => onChange(Math.min(max, value + step))} accessibilityLabel={`More ${label}`} className="size-11 items-center justify-center rounded-full border border-border">
          <Ionicons name="add" size={20} color={muted} />
        </Pressable>
      </View>
    </View>
  );
}

function PlaceChips({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {PLACES.map((p) => (
        <Pressable
          key={p.id}
          onPress={() => onChange(p.id)}
          className={cn('rounded-full border px-3 py-2', p.id === value ? 'border-accent bg-accent/10' : 'border-border bg-surface')}>
          <Text className={cn('text-sm', p.id === value ? 'font-semibold text-foreground' : 'text-foreground')}>{p.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="flex-1 text-base text-foreground">{label}</Text>
      <Switch isSelected={on} onSelectedChange={set} />
    </View>
  );
}

export default function MatchmakerScreen() {
  const muted = useThemeColor('muted');
  const [budget, setBudget] = useState('3200');
  const [household, setHousehold] = useState(2);
  const [bedrooms, setBedrooms] = useState(1);
  const [work, setWork] = useState('san-jose');
  const [familiar, setFamiliar] = useState('san-jose');
  const [stepFree, setStepFree] = useState(false);
  const [dailyCare, setDailyCare] = useState(false);
  const [types, setTypes] = useState<string[]>([]);
  const [pets, setPets] = useState(false);
  const [parking, setParking] = useState(false);
  const [laundry, setLaundry] = useState(false);
  const [transit, setTransit] = useState(false);
  const [baths, setBaths] = useState(0);
  const [maxCommute, setMaxCommute] = useState(45);

  const needs: Needs = {
    budget: Number(budget.replace(/[^0-9]/g, '')) || 0,
    household,
    bedrooms,
    workPlaceId: work,
    familiarPlaceId: familiar,
    needsStepFree: stepFree,
    dailyCare,
    types,
    pets,
    parking,
    laundry,
    transit,
    minBaths: baths,
    maxCommuteMin: maxCommute,
  };
  const toggleType = (t: string) => setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t]);

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-safe-offset-2 pb-safe-offset-4 gap-6"
      keyboardShouldPersistTaps="handled">
      <View className="flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" className="size-11 items-center justify-center">
          <Ionicons name="chevron-back" size={26} color={muted} />
        </Pressable>
        <Text className="flex-1 font-serif text-2xl font-bold text-foreground">Relocation Matchmaker</Text>
      </View>
      <Text className="text-base text-muted">Tell us what your household needs, then submit to see your top 15 homes ranked by suitability score.</Text>

      <Section title="Your household">
        <Card>
          <View className="gap-2">
            <Text className="text-base text-foreground">Total monthly budget (rent, utilities, travel)</Text>
            <TextInput
              value={budget}
              onChangeText={setBudget}
              keyboardType="number-pad"
              className="h-12 rounded-xl border border-border bg-surface px-4 text-base leading-none text-foreground"
              placeholder="3200"
              placeholderTextColor={muted}
              accessibilityLabel="Monthly budget"
            />
          </View>
          <Stepper label="People" value={household} onChange={setHousehold} min={1} max={8} />
          <Stepper label="Bedrooms" value={bedrooms} onChange={setBedrooms} min={0} max={5} />
          <Text className="text-xs text-muted">{`For ${household} ${household === 1 ? 'person' : 'people'}, about ${minimumBedrooms(household)} bedroom${minimumBedrooms(household) === 1 ? '' : 's'} is a common minimum.`}</Text>
        </Card>
      </Section>

      <Section title="Where do you travel to for work or school?">
        <PlaceChips value={work} onChange={setWork} />
      </Section>
      <Section title="Where are your familiar community services?">
        <PlaceChips value={familiar} onChange={setFamiliar} />
      </Section>

      <Section title="Type of home">
        <View className="flex-row flex-wrap gap-2">
          {['apartment', 'house', 'townhome'].map((t) => (
            <Pressable key={t} onPress={() => toggleType(t)} className={cn('rounded-full border px-4 py-2', types.includes(t) ? 'border-accent bg-accent/10' : 'border-border bg-surface')}>
              <Text className={cn('text-sm capitalize', types.includes(t) ? 'font-semibold text-foreground' : 'text-foreground')}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <Text className="text-xs text-muted">Pick none to see all types.</Text>
      </Section>

      <Section title="Must-haves">
        <Card>
          <Toggle label="Pets allowed" on={pets} set={setPets} />
          <Toggle label="Parking" on={parking} set={setParking} />
          <Toggle label="Laundry in the home" on={laundry} set={setLaundry} />
          <Toggle label="Near public transit" on={transit} set={setTransit} />
          <Stepper label="Bathrooms (at least)" value={baths} onChange={setBaths} min={0} max={4} />
          <Stepper label="Longest commute (min)" value={maxCommute} onChange={(n) => setMaxCommute(n)} min={15} max={90} step={5} />
        </Card>
      </Section>

      <Section title="Practical needs">
        <Card>
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 text-base text-foreground">I need step-free access</Text>
            <Switch isSelected={stepFree} onSelectedChange={setStepFree} />
          </View>
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 text-base text-foreground">Daily school or caregiving trips</Text>
            <Switch isSelected={dailyCare} onSelectedChange={setDailyCare} />
          </View>
        </Card>
      </Section>

      <Text className="text-sm text-muted">When you submit, you get your top 15 homes with a suitability score for each, then the street addresses for the area you pick.</Text>
      <Pressable
        onPress={() => router.push(`/matches?needs=${encodeURIComponent(JSON.stringify(needs))}`)}
        accessibilityRole="button"
        className="h-14 items-center justify-center rounded-2xl bg-accent">
        <Text className="text-base font-semibold text-accent-foreground">Submit my selections</Text>
      </Pressable>
    </KeyboardAwareScrollView>
  );
}
