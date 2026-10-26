import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { Card } from '@/components/card';
import { Pressable } from '@/components/pressable';
import { PLACES, placeById } from '@/features/relocation/data/places';
import { tier } from '@/features/relocation/utils/tier';
import { areaFit, type Needs } from '@/features/relocation/utils/stability';
import { cn } from '@/lib/cn';

export function HeatMap({ needs, selected, onSelect }: { needs: Needs; selected: string; onSelect: (id: string) => void }) {
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
