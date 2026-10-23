import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Presets } from 'react-native-pulsar';

import { Card } from '@/components/card';
import { Pressable, pressHaptic } from '@/components/pressable';
import { ChoiceGroup } from '@/features/cases/components/choice-group';
import { CITIES } from '@/features/cases/data/jurisdictions';
import {
  BUILT_ERAS,
  DONT_KNOW,
  NOFAULT_REASONS,
  PROPERTY_TYPES,
  REASONS,
  TENANCY_LENGTHS,
  TENANCY_TYPES,
  UNITS,
  YES_NO,
} from '@/features/cases/data/questions';
import { useCasesStore } from '@/features/cases/store/cases-store';
import type { Facts } from '@/features/cases/types/case';
import { coverageFor } from '@/features/cases/utils/rules-engine';

const EMPTY: Facts = {
  city: '',
  propertyType: '',
  units: '',
  builtEra: '',
  reason: '',
  hasNotice: '',
  noticeDate: '',
  tenancyType: '',
  tenancyLength: '',
  relocationOffered: '',
  court: '',
};

const STEPS = ['Where you live', 'What happened', 'Your tenancy'];

export default function CheckScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useCasesStore((s) => s.cases.find((c) => c.id === id));
  const createCase = useCasesStore((s) => s.createCase);
  const updateFacts = useCasesStore((s) => s.updateFacts);
  const [facts, setFacts] = useState<Facts>(existing?.facts ?? EMPTY);
  const [step, setStep] = useState(0);
  const muted = useThemeColor('muted');
  const set = <K extends keyof Facts>(key: K, value: Facts[K]) => setFacts((f) => ({ ...f, [key]: value }));

  const cityOptions = [...CITIES.map((c) => ({ value: c.id, label: c.name })), { value: 'other', label: 'Another city' }];
  const coverage = facts.city ? coverageFor(facts.city) : null;
  const ready = step === 0 ? facts.city !== '' : step === 1 ? facts.reason !== '' : true;

  const finish = () => {
    Presets.System.notificationSuccess();
    if (existing) {
      updateFacts(existing.id, facts);
      router.replace(`/case/${existing.id}`);
      return;
    }
    router.replace(`/case/${createCase(facts)}`);
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-safe-offset-2 pb-safe-offset-4 gap-6"
      keyboardShouldPersistTaps="handled">
      <View className="flex-row items-center gap-3">
        <Pressable onPress={() => (step === 0 ? router.back() : setStep(step - 1))} accessibilityLabel="Back" className="size-11 items-center justify-center">
          <Ionicons name="chevron-back" size={26} color={muted} />
        </Pressable>
        <View className="flex-1 flex-row gap-1.5">
          {STEPS.map((s, i) => (
            <View key={s} className={i <= step ? 'h-1.5 flex-1 rounded-full bg-accent' : 'h-1.5 flex-1 rounded-full bg-border'} />
          ))}
        </View>
      </View>

      <Text className="font-serif text-3xl font-bold text-foreground">{STEPS[step]}</Text>

      {step === 0 ? (
        <View className="gap-8">
          <ChoiceGroup question="Which city is your home in?" hint="We only need enough to pick the right laws." options={cityOptions} value={facts.city} onChange={(v) => set('city', v)} />
          {coverage ? (
            <Card>
              <Text className="text-sm text-foreground">{coverage.label}</Text>
            </Card>
          ) : null}
          <ChoiceGroup question="What kind of home?" options={[...PROPERTY_TYPES, DONT_KNOW]} value={facts.propertyType} onChange={(v) => set('propertyType', v)} />
          <ChoiceGroup question="How many homes are in the building?" hint="Some rules only cover buildings with several units." options={UNITS} value={facts.units} onChange={(v) => set('units', v)} />
          <ChoiceGroup question="When was the building built?" hint="Older buildings can have extra protections. A guess is fine, or skip." options={BUILT_ERAS} value={facts.builtEra} onChange={(v) => set('builtEra', v)} />
        </View>
      ) : null}

      {step === 1 ? (
        <ChoiceGroup question="What brings you here?" hint="Pick the closest one. You can change it later." options={REASONS} value={facts.reason} onChange={(v) => set('reason', v as Facts['reason'])} />
      ) : null}

      {step === 2 ? (
        <View className="gap-8">
          <ChoiceGroup question="Is your tenancy month to month or a lease?" options={TENANCY_TYPES} value={facts.tenancyType} onChange={(v) => set('tenancyType', v)} />
          <ChoiceGroup question="How long have you lived there?" hint="Many protections start after a year." options={TENANCY_LENGTHS} value={facts.tenancyLength} onChange={(v) => set('tenancyLength', v)} />
          <ChoiceGroup question="Do you have a written notice?" options={YES_NO} value={facts.hasNotice} onChange={(v) => set('hasNotice', v)} />
          {facts.hasNotice === 'yes' ? (
            <View className="gap-2">
              <Text className="text-base font-semibold text-foreground">Date on the notice</Text>
              <Text className="text-sm text-muted">Used to work out dates. Format: 03/15/2026. Leave blank if unsure.</Text>
              <TextInput
                value={facts.noticeDate}
                onChangeText={(v) => set('noticeDate', v)}
                placeholder="MM/DD/YYYY"
                keyboardType="numbers-and-punctuation"
                className="rounded-xl border border-border bg-surface px-4 py-3 text-base leading-none text-foreground"
                placeholderTextColor={muted}
              />
            </View>
          ) : null}
          {NOFAULT_REASONS.includes(facts.reason) ? (
            <ChoiceGroup question="Has the landlord offered relocation help?" options={YES_NO} value={facts.relocationOffered} onChange={(v) => set('relocationOffered', v)} />
          ) : null}
          <ChoiceGroup question="Do you have a court date or court papers?" hint="This changes what we recommend: court deadlines are short." options={YES_NO} value={facts.court} onChange={(v) => set('court', v)} />
        </View>
      ) : null}

      <Button
        size="lg"
        isDisabled={!ready}
        onPress={() => {
          pressHaptic();
          if (step < 2) setStep(step + 1);
          else finish();
        }}>
        <Button.Label>{step < 2 ? 'Continue' : existing ? 'Update my results' : 'See my results'}</Button.Label>
      </Button>
    </KeyboardAwareScrollView>
  );
}
