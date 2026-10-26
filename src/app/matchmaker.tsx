import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Switch, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Linking, Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Card } from '@/components/card';
import { Pressable } from '@/components/pressable';
import { Section } from '@/components/section';
import { fetchGoogleHomes, type GoogleHome } from '@/features/relocation/homes';
import { PLACES, placeById } from '@/features/relocation/data/places';
import { areaFit, minimumBedrooms, rankListings, type Match, type Needs } from '@/features/relocation/utils/stability';
import { cn } from '@/lib/cn';

const tier = (s: number) => (s >= 70 ? 'bg-success' : s >= 45 ? 'bg-warning' : 'bg-danger');
const tierText = (s: number) => (s >= 70 ? 'Strong fit' : s >= 45 ? 'Partial fit' : 'Weak fit');

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

function HeatMap({ needs, selected, onSelect }: { needs: Needs; selected: string; onSelect: (id: string) => void }) {
  const muted = useThemeColor('muted');
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

  const scale = useSharedValue(1);
  const saved = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.set(Math.max(1, Math.min(4, saved.get() * e.scale)));
    })
    .onEnd(() => {
      saved.set(scale.get());
    });
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      tx.set(sx.get() + e.translationX);
      ty.set(sy.get() + e.translationY);
    })
    .onEnd(() => {
      sx.set(tx.get());
      sy.set(ty.get());
    });
  const layer = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.get() }, { translateY: ty.get() }, { scale: scale.get() }],
  }));
  const zoomBy = (f: number) => {
    const next = Math.max(1, Math.min(4, saved.get() * f));
    saved.set(next);
    scale.set(next);
    if (next === 1) {
      tx.set(0);
      ty.set(0);
      sx.set(0);
      sy.set(0);
    }
  };

  return (
    <Card>
      <View className="h-80 w-full overflow-hidden rounded-xl bg-accent/5">
        <GestureDetector gesture={Gesture.Simultaneous(pinch, pan)}>
          <Animated.View className="h-full w-full" style={layer}>
            {fit.map((f) => {
              const q = pos.find((x) => x.id === f.placeId) ?? pos[0];
              return (
                <Pressable
                  key={f.placeId}
                  onPress={() => onSelect(f.placeId)}
                  accessibilityLabel={`${placeById(f.placeId).name}, fit ${f.score ?? 'none'}`}
                  className={cn(
                    'absolute size-7 items-center justify-center rounded-full',
                    f.score === null ? 'bg-border' : tier(f.score),
                    f.placeId === selected ? 'border-2 border-foreground' : '',
                  )}
                  style={{ left: `${q.x}%`, top: `${q.y}%`, opacity: f.score === null ? 0.6 : 0.55 + (f.score / 100) * 0.45 }}>
                  <Text className="text-[10px] font-bold text-white">{f.score === null ? '–' : Math.min(9, Math.round(f.score / 10))}</Text>
                </Pressable>
              );
            })}
          </Animated.View>
        </GestureDetector>
        <View className="absolute right-2 top-2 gap-2">
          <Pressable onPress={() => zoomBy(1.6)} accessibilityLabel="Zoom in" className="size-10 items-center justify-center rounded-full bg-surface">
            <Ionicons name="add" size={20} color={muted} />
          </Pressable>
          <Pressable onPress={() => zoomBy(1 / 1.6)} accessibilityLabel="Zoom out" className="size-10 items-center justify-center rounded-full bg-surface">
            <Ionicons name="remove" size={20} color={muted} />
          </Pressable>
        </View>
      </View>
      <Text className="text-sm text-muted">Pinch or use + and − to zoom, drag to move, tap a dot to see homes in that city. Green is a strong fit, amber partial, red weak. This is a simple fit map from the sample homes, not a street map.</Text>
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
        <Text className="text-sm text-muted">{[m.listing.type, `${m.listing.baths} bath`, m.listing.pets ? 'pets ok' : null, m.listing.parking ? 'parking' : null, m.listing.laundry ? 'laundry' : null, m.listing.transit ? 'near transit' : null, m.listing.stepFree ? 'step-free' : null].filter(Boolean).join(' · ')}</Text>
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
          <Pressable
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${m.listing.title} ${place.name} CA`)}`)}
            accessibilityRole="link"
            className="h-11 items-center justify-center rounded-xl border border-border">
            <Text className="text-sm font-semibold text-accent">See the area in Google Maps</Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
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

function GoogleHomes({ placeId, kind }: { placeId: string; kind: 'apartment' | 'house' }) {
  const [state, setState] = useState<'idle' | 'loading' | 'not_configured' | 'unavailable' | 'done'>('idle');
  const [places, setPlaces] = useState<GoogleHome[]>([]);
  const place = placeById(placeId);
  const load = async () => {
    setState('loading');
    const r = await fetchGoogleHomes(place.lat, place.lng, kind, place.name);
    if (!r.ok) return setState(r.reason);
    setPlaces(r.places);
    setState('done');
  };
  return (
    <Card>
      <Text className="text-base font-semibold text-foreground">{`Real rental buildings near ${place.name}`}</Text>
      <Text className="text-sm text-muted">From OpenStreetMap. It does not share rents or what is available, so call or visit to ask.</Text>
      {state === 'not_configured' ? <Text className="text-sm text-danger">Building search is not available right now.</Text> : null}
      {state === 'unavailable' ? <Text className="text-sm text-danger">Could not load buildings. Try again in a moment.</Text> : null}
      {state === 'done' && places.length === 0 ? <Text className="text-sm text-muted">No named buildings found here on the map.</Text> : null}
      {places.map((g) => (
        <Pressable key={g.id} onPress={() => g.mapsUrl && Linking.openURL(g.mapsUrl)} accessibilityRole="link" className="gap-0.5 py-1">
          <Text className="text-sm font-semibold text-foreground">{g.name}</Text>
          {g.address ? <Text className="text-sm text-muted">{g.address}</Text> : null}
          <Text className="text-xs text-accent">See on the map</Text>
        </Pressable>
      ))}
      <Pressable onPress={load} accessibilityRole="button" className="h-11 items-center justify-center rounded-xl border border-border">
        <Text className="text-sm font-semibold text-accent">{state === 'loading' ? 'Searching…' : state === 'done' ? 'Search again' : 'Find real buildings nearby'}</Text>
      </Pressable>
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
  const [types, setTypes] = useState<string[]>([]);
  const [pets, setPets] = useState(false);
  const [parking, setParking] = useState(false);
  const [laundry, setLaundry] = useState(false);
  const [transit, setTransit] = useState(false);
  const [baths, setBaths] = useState(0);
  const [maxCommute, setMaxCommute] = useState(45);
  const [selected, setSelected] = useState('san-jose');

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
  const matches = shown ? rankListings(needs) : [];
  const inCity = matches.filter((m) => m.listing.placeId === selected);
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

      {shown ? (
        <>
          <Section title="Bay Area fit map">
            <HeatMap needs={needs} selected={selected} onSelect={setSelected} />
          </Section>
          <Section title={`Homes in ${placeById(selected).name}`}>
            <View className="gap-3">
              {inCity.length ? inCity.map((m) => <MatchCard key={m.listing.id} m={m} />) : <Card><Text className="text-sm text-muted">No sample homes here. Try the Google search below.</Text></Card>}
              <GoogleHomes placeId={selected} kind={types.length === 1 && types[0] === 'house' ? 'house' : 'apartment'} />
            </View>
          </Section>
          <Section title="Best matches overall">
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
