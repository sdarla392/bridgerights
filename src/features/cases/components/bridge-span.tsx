import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import type { Task } from '@/features/cases/types/case';
import { timing } from '@/lib/motion';

function Pier({ done }: { done: boolean }) {
  const fill = useSharedValue(done ? 1 : 0);
  useEffect(() => {
    fill.set(withTiming(done ? 1 : 0, timing.enter));
  }, [done, fill]);
  const style = useAnimatedStyle(() => ({ height: `${fill.get() * 100}%` }));
  return (
    <View className="h-10 flex-1 justify-end overflow-hidden rounded-md bg-border">
      <Animated.View className="w-full bg-accent" style={style} />
    </View>
  );
}

export function BridgeSpan({ tasks }: { tasks: Task[] }) {
  const doneCount = tasks.filter((t) => t.done).length;
  const complete = tasks.length > 0 && doneCount === tasks.length;
  return (
    <View className="gap-2" accessibilityLabel={`${doneCount} of ${tasks.length} steps done`}>
      <View className="flex-row items-end gap-1.5">
        {tasks.map((t) => (
          <Pier key={t.id} done={t.done} />
        ))}
      </View>
      <View className="h-1 rounded-full bg-foreground/80" />
      <Text className="text-sm text-muted">
        {complete ? 'Span complete. Every step is done.' : `${doneCount} of ${tasks.length} steps done`}
      </Text>
    </View>
  );
}
