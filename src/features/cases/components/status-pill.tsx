import { Text, View } from 'react-native';

import type { Applicability } from '@/features/cases/types/case';
import { STATUS_LABEL } from '@/features/cases/utils/rules-engine';
import { cn } from '@/lib/cn';

const TONE: Record<Applicability, string> = {
  potentially_applicable: 'bg-accent/15',
  conditionally_applicable: 'bg-accent/10',
  not_enough_information: 'bg-border',
  professional_review_required: 'bg-warning/30',
  not_applicable: 'bg-border',
};

export function StatusPill({ status }: { status: Applicability }) {
  return (
    <View className={cn('self-start rounded-full px-3 py-1', TONE[status])}>
      <Text className="text-xs font-semibold text-foreground">{STATUS_LABEL[status]}</Text>
    </View>
  );
}
