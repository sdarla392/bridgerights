import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { useEffect, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Pressable } from '@/components/pressable';
import { Section } from '@/components/section';
import { PLACES, placeById } from '@/features/relocation/data/places';
import { fetchGoogleHomes, type GoogleHome } from '@/features/relocation/homes';
import { cn } from '@/lib/cn';

type LoadState = 'loading' | 'unavailable' | 'done';

export default function AddressesScreen() {
  const muted = useThemeColor('muted');
  const { placeId: startId } = useLocalSearchParams<{ placeId?: string }>();
  const [placeId, setPlaceId] = useState(startId ?? 'san-jose');
  const [kind, setKind] = useState<'apartment' | 'house'>('apartment');
  const [state, setState] = useState<LoadState>('loading');
  const [places, setPlaces] = useState<GoogleHome[]>([]);
  const [tries, setTries] = useState(0);
  const place = placeById(placeId);

  useEffect(() => {
    let live = true;
    setState('loading');
    fetchGoogleHomes(place.lat, place.lng, kind, place.name).then((r) => {
      if (!live) return;
      if (!r.ok) return setState('unavailable');
      setPlaces(r.places);
      setState('done');
    });
    return () => {
      live = false;
    };
  }, [place.lat, place.lng, place.name, kind, tries]);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-5 pt-safe-offset-2 pb-safe-offset-4 gap-6">
      <View className="flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" className="size-11 items-center justify-center">
          <Ionicons name="chevron-back" size={26} color={muted} />
        </Pressable>
        <Text className="flex-1 font-serif text-2xl font-bold text-foreground">{`Addresses in ${place.name}`}</Text>
      </View>
      <Text className="text-base text-muted">Real residential buildings from OpenStreetMap. They do not list rents or what is available, so call or visit to ask, and check your suitability score on the previous page.</Text>

      <Section title="City">
        <View className="flex-row flex-wrap gap-2">
          {PLACES.map((p) => (
            <Pressable key={p.id} onPress={() => setPlaceId(p.id)} className={cn('rounded-full border px-3 py-2', p.id === placeId ? 'border-accent bg-accent/10' : 'border-border bg-surface')}>
              <Text className={cn('text-sm', p.id === placeId ? 'font-semibold text-foreground' : 'text-foreground')}>{p.name}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Type">
        <View className="flex-row gap-2">
          {(['apartment', 'house'] as const).map((k) => (
            <Pressable key={k} onPress={() => setKind(k)} className={cn('rounded-full border px-4 py-2', k === kind ? 'border-accent bg-accent/10' : 'border-border bg-surface')}>
              <Text className={cn('text-sm', k === kind ? 'font-semibold text-foreground' : 'text-foreground')}>{k === 'apartment' ? 'Apartments' : 'Houses'}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Buildings">
        <View className="gap-3">
          {state === 'loading' ? <Card><Text className="text-sm text-muted">Looking up buildings…</Text></Card> : null}
          {state === 'unavailable' ? (
            <Card>
              <Text className="text-sm text-danger">Could not load buildings. Try again in a moment.</Text>
              <Pressable onPress={() => setTries(tries + 1)} accessibilityRole="button" className="h-11 items-center justify-center rounded-xl border border-border">
                <Text className="text-sm font-semibold text-accent">Try again</Text>
              </Pressable>
            </Card>
          ) : null}
          {state === 'done' && places.length === 0 ? <Card><Text className="text-sm text-muted">No named buildings found here on the map. Try another city or type.</Text></Card> : null}
          {state === 'done'
            ? places.map((g, i) => (
                <Card key={g.id}>
                  <Pressable onPress={() => Linking.openURL(g.mapsUrl)} accessibilityRole="link" className="gap-0.5">
                    <Text className="text-base font-semibold text-foreground">{`${i + 1}. ${g.name}`}</Text>
                    <Text className="text-sm text-muted">{g.address || 'Street address not on the map'}</Text>
                    <Text className="text-xs font-semibold text-accent">See on the map</Text>
                  </Pressable>
                </Card>
              ))
            : null}
        </View>
      </Section>
    </ScrollView>
  );
}
