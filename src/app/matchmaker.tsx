import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Switch, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Card } from '@/components/card';
import { Pressable } from '@/components/pressable';
import { Section } from '@/components/section';
import { PLACES, placeById } from '@/features/relocation/data/places';
import { areaFit, minimumBedrooms, rankListings, type Match, type Needs } from '@/features/relocation/utils/stability';
import { cn } from '@/lib/cn';

const tier = (s: number) => (s >= 70 ? 'bg-success' : s >= 45 ? 'bg-warning' : 'bg-danger');
const tierText = (s: number) => (s >= 70 ? 'Strong fit' : s >= 45 ? 'Partial fit' : 'Weak fit');

function Stepper({ label, value, onChange, min, max }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number }) {
  const muted = useThemeColor('muted');
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-base text-foreground">{label}</Text>
      <View className="flex-row items-center gap-3">
        <Pressable onPress={() => onChange(Math.max(min, value - 1))} accessibilityLabel={`Fewer ${label}`} className="size-11 items-center justify-center rounded-full border border-border">
          <Ionicons name="remove" size={20} color={muted} />
        </Pressable>
        <Text className="w-6 text-center text-lg font-semibold text-foreground">{value}</Text>
        <Pressable onPress={() => onChange(Math.min(max, value + 1))} accessibilityLabel={`More ${label}`} className="size-11 items-center justify-center rounded-full border border-border">
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

function HeatMap({ needs }: { needs: Needs }) {
  const fit = areaFit(needs);
  const lats = PLACES.map((p) => p.lat);
  const lngs = PLACES.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const pos = PLACES.map((p) => ({
    id: p.id,
    x: 8 + ((p.lng - minLng) / (maxLng - minLng)) * 78,
    y: 6 + (1 - (p.lat - minLat) / (maxLat - minLat)) * 78,
  }));
  for (let round = 0; round < 60; round++) {
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[j].x - pos[i].x;
        const dy = (pos[j].y - pos[i].y) * 0.8;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (d >= 13) continue;
        const push = (13 - d) / 2;
        pos[i].x -= (dx / d) * push;
        pos[j].x += (dx / d) * push;
        pos[i].y -= ((dy / d) * push) / 0.8;
        pos[j].y += ((dy / d) * push) / 0.8;
      }
    }
    for (const q of pos) {
      q.x = Math.max(2, Math.min(88, q.x));
      q.y = Math.max(2, Math.min(88, q.y));
    }
  }
  return (
    <Card>
      <View className="h-72 w-full rounded-xl bg-accent/5">
        {fit.map((f) => {
          const q = pos.find((x) => x.id === f.placeId) ?? pos[0];
          const left = q.x;
          const top = q.y;
          return (
            <View
              key={f.placeId}
              className={cn('absolute size-6 items-center justify-center rounded-full', f.score === null ? 'bg-border' : tier(f.score))}
              style={{ left: `${left}%`, top: `${top}%`, opacity: f.score === null ? 0.6 : 0.5 + (f.score / 100) * 0.5 }}>
              <Text className="text-[9px] font-bold text-white">{f.score === null ? '–' : Math.min(9, Math.round(f.score / 10))}</Text>
            </View>
          );
        })}
      </View>
      <View className="gap-1">
        {fit.map((f) => (
          <View key={f.placeId} className="flex-row items-center justify-between">
            <Text className="text-sm text-foreground">{placeById(f.placeId).name}</Text>
            <Text className="text-sm text-muted">{f.score === null ? 'No sample listing' : `Best fit ${f.score}`}</Text>
          </View>
        ))}
      </View>
      <Text className="text-sm text-muted">Green: strong fit for your needs. Amber: partial. Red: weak. Grey: no sample listing. A simple map from sample data, not a street map.</Text>
    </Card>
  );
}

function MatchCard({ m }: { m: Match }) {
  const [open, setOpen] = useState(false);
  const place = placeById(m.listing.placeId);
  return (
    <Card>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" className="gap-2">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-0.5">
            <Text className="text-base font-semibold text-foreground">{m.listing.title}</Text>
            <Text className="text-sm text-muted">{`${place.name} · ${m.listing.bedrooms === 0 ? 'Studio' : `${m.listing.bedrooms} bed`} · $${m.listing.rent.toLocaleString('en-US')} rent`}</Text>
            <Text className="text-sm text-muted">{`About $${Math.round(m.totalMonthly).toLocaleString('en-US')} a month in total`}</Text>
          </View>
          <View className="items-center">
            <View className={cn('size-12 items-center justify-center rounded-full', tier(m.score))}>
              <Text className="text-lg font-bold text-white">{m.score}</Text>
            </View>
            <Text className="text-xs text-muted">{tierText(m.score)}</Text>
          </View>
        </View>
        <Text className="text-xs font-semibold text-accent">{open ? 'Hide why' : 'Why this score?'}</Text>
      </Pressable>
      {open ? (
        <View className="gap-3">
          {m.factors.map((f) => (
            <View key={f.id} className="gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground">{f.label}</Text>
                <Text className="text-sm text-muted">{f.score}/100</Text>
              </View>
              <View className="h-1.5 rounded-full bg-border">
                <View className={cn('h-1.5 rounded-full', tier(f.score))} style={{ width: `${f.score}%` }} />
              </View>
              <Text className="text-sm text-muted">{f.note}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
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
  const [shown, setShown] = useState(false);

  const needs: Needs = {
    budget: Number(budget.replace(/[^0-9]/g, '')) || 0,
    household,
    bedrooms,
    workPlaceId: work,
    familiarPlaceId: familiar,
    needsStepFree: stepFree,
    dailyCare,
  };
  const matches = shown ? rankListings(needs) : [];

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
      <Text className="text-base text-muted">Tell us what your household needs. We rank homes by how well they fit, and show why.</Text>

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

      {shown ? (
        <>
          <Section title="Bay Area fit map">
            <HeatMap needs={needs} />
          </Section>
          <Section title="Best matches">
            <View className="gap-3">
              {matches.slice(0, 8).map((m) => (
                <MatchCard key={m.listing.id} m={m} />
              ))}
            </View>
          </Section>
          <Card>
            <Text className="text-sm font-semibold text-foreground">About these scores</Text>
            <Text className="text-sm text-muted">
              The listings are samples, not live homes. A Stability Score estimates how well a home fits your budget and practical needs. It is not a guarantee that rent will stay the same. Rents can change, so ask any landlord about future increases and whether local rent rules cover the home.
            </Text>
          </Card>
        </>
      ) : null}

      <Pressable
        onPress={() => setShown(true)}
        accessibilityRole="button"
        className="h-14 items-center justify-center rounded-2xl bg-accent">
        <Text className="text-base font-semibold text-accent-foreground">{shown ? 'Update matches' : 'Find matches'}</Text>
      </Pressable>
    </KeyboardAwareScrollView>
  );
}
