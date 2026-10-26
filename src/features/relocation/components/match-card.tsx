import { useState } from 'react';
import { Linking, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Pressable } from '@/components/pressable';
import { placeById } from '@/features/relocation/data/places';
import { type Match } from '@/features/relocation/utils/stability';
import { tier, tierText } from '@/features/relocation/utils/tier';
import { cn } from '@/lib/cn';

export function MatchCard({ m, rank, onAddresses }: { m: Match; rank?: number; onAddresses?: () => void }) {
  const [open, setOpen] = useState(false);
  const place = placeById(m.listing.placeId);
  const scored = m.factors.filter((f) => f.weight > 0);
  const best = scored.reduce((a, b) => (b.score > a.score ? b : a), scored[0]);
  const worst = scored.reduce((a, b) => (b.score < a.score ? b : a), scored[0]);
  return (
    <Card>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" className="gap-2">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-0.5">
            {rank ? <Text className="text-xs font-bold uppercase text-accent">{rank === 1 ? '#1 · Best fit' : `#${rank}`}</Text> : null}
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
        <Text className="text-sm text-muted">{`Strongest: ${best.label} (${best.score}). Weakest: ${worst.label} (${worst.score}).`}</Text>
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
          {onAddresses ? (
            <Pressable onPress={onAddresses} accessibilityRole="button" className="h-11 items-center justify-center rounded-xl bg-accent">
              <Text className="text-sm font-semibold text-accent-foreground">{`See addresses in ${place.name}`}</Text>
            </Pressable>
          ) : null}
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
