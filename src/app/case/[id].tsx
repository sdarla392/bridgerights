import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Linking, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Presets } from 'react-native-pulsar';

import { Card } from '@/components/card';
import { Pressable, pressHaptic } from '@/components/pressable';
import { Section } from '@/components/section';
import { Segmented } from '@/components/segmented';
import { BridgeSpan } from '@/features/cases/components/bridge-span';
import { ChoiceGroup } from '@/features/cases/components/choice-group';
import { StatusPill } from '@/features/cases/components/status-pill';
import { DONT_KNOW, NOTICE_TYPES, REASONS } from '@/features/cases/data/questions';
import { useCasesStore } from '@/features/cases/store/cases-store';
import type { CheckState, NoticeFields } from '@/features/cases/types/case';
import { computeDeadlines, formatDate } from '@/features/cases/utils/dates';
import { runNoticeChecks } from '@/features/cases/utils/notice-checks';
import { coverageFor, evaluate } from '@/features/cases/utils/rules-engine';
import { cityName, reasonLabel } from '@/features/cases/utils/summary';
import { TASK_KIND_LABEL } from '@/features/cases/utils/tasks';
import { confirmDelete } from '@/lib/confirm';
import { cn } from '@/lib/cn';

type Tab = 'rights' | 'notice' | 'plan';

const EMPTY_NOTICE: NoticeFields = { noticeType: '', noticeDate: '', moveOutDate: '', statedReason: '', relocationStated: '' };

const NOTICE_INFO: Record<string, { title: string; body: string }> = {
  yes: {
    title: 'You have a written notice',
    body: 'A written notice matters because it shows the reason, the dates and how much time you have. Add its details in the Notice tab and we will check them for you. Keep the original and the envelope, and do not ignore it.',
  },
  no: {
    title: 'You have no written notice yet',
    body: 'Without a written notice, a landlord generally cannot make you leave. Spoken requests or texts are not the same as a proper notice. Write down what was said and when, keep any messages, and check in with a tenant counselor.',
  },
  unknown: {
    title: 'Not sure about a notice',
    body: 'Look for any paper, letter or posted sheet from your landlord. If you find one, add its details in the Notice tab. If you are unsure whether something counts, ask a tenant counselor.',
  },
};

const COUNSELORS = [
  { name: 'Law Foundation of Silicon Valley', note: 'Free legal help for lower-income renters in Santa Clara County', phone: '(408) 280-2424' },
  { name: 'Project Sentinel', note: 'Tenant counseling and landlord-tenant mediation', phone: '(408) 720-9888' },
  { name: '211 Santa Clara County', note: 'Free referrals to housing help, any time', phone: '211' },
];

const CHECK_LABEL: Record<CheckState, string> = {
  present: 'Found in the notice',
  absent: 'Not found, ask about it',
  unclear: 'Unclear, needs a closer look',
  not_applicable: 'May not apply here',
};

const RELO_OPTIONS = [
  { value: 'yes', label: 'Yes, an amount or help is listed' },
  { value: 'none', label: 'No, nothing is mentioned' },
  DONT_KNOW,
];

function Field({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const muted = useThemeColor('muted');
  return (
    <View className="gap-2">
      <Text className="font-serif text-xl font-semibold text-foreground">{label}</Text>
      <Text className="text-sm text-muted">{hint}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="MM/DD/YYYY"
        keyboardType="numbers-and-punctuation"
        className="rounded-xl border border-border bg-surface px-4 text-base leading-none h-12 text-foreground"
        placeholderTextColor={muted}
      />
    </View>
  );
}

export default function CaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useCasesStore((s) => s.cases.find((x) => x.id === id));
  const saveNotice = useCasesStore((s) => s.saveNotice);
  const toggleTask = useCasesStore((s) => s.toggleTask);
  const deleteCase = useCasesStore((s) => s.deleteCase);
  const [tab, setTab] = useState<Tab>('rights');
  const [draft, setDraft] = useState<NoticeFields>(c?.notice ?? EMPTY_NOTICE);
  const muted = useThemeColor('muted');
  const accent = useThemeColor('accent');

  if (!c) {
    return (
      <View className="flex-1 gap-4 bg-background px-5 pt-safe-offset-2">
        <Pressable onPress={() => router.replace('/')} accessibilityLabel="Back" className="size-11 items-center justify-center">
          <Ionicons name="chevron-back" size={26} color={muted} />
        </Pressable>
        <Text className="font-serif text-2xl font-bold text-foreground">This case is no longer here</Text>
      </View>
    );
  }

  const findings = evaluate(c.facts).filter((f) => f.applicability !== 'not_applicable');
  const coverage = coverageFor(c.facts.city);
  const unknowns = Array.from(new Set(findings.flatMap((f) => f.unresolved)));
  const deadlines = computeDeadlines(c.facts);
  const checks = c.notice ? runNoticeChecks(c, c.notice) : [];
  const kinds = Object.keys(TASK_KIND_LABEL) as (keyof typeof TASK_KIND_LABEL)[];
  const setN = <K extends keyof NoticeFields>(k: K, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const onToggle = (taskId: string) => {
    const t = c.tasks.find((x) => x.id === taskId);
    const willFinish = t ? !t.done && c.tasks.filter((x) => x.done).length === c.tasks.length - 1 : false;
    toggleTask(c.id, taskId);
    if (t && !t.done) Presets.System.notificationSuccess();
    if (willFinish) setTimeout(() => Presets.System.notificationSuccess(), 250);
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-safe-offset-2 pb-safe-offset-4 gap-6"
      keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.back()} accessibilityLabel="Back" className="size-11 items-start justify-center">
        <Ionicons name="chevron-back" size={26} color={muted} />
      </Pressable>
      <View className="gap-1">
        <Text className="font-serif text-3xl font-bold text-foreground">{cityName(c.facts.city)}</Text>
        <Text className="text-base text-muted">{reasonLabel(c.facts.reason)}</Text>
      </View>
      <BridgeSpan tasks={c.tasks} />
      <Segmented values={['rights', 'notice', 'plan'] as const} labels={['Rights', 'Notice', 'Plan']} value={tab} onChange={setTab} />

      {tab === 'rights' ? (
        <>
          {c.facts.court === 'yes' ? (
            <Card>
              <Text className="text-base font-semibold text-foreground">Court papers need a professional right away</Text>
              <Text className="text-sm text-foreground">
                Court deadlines are short. Please contact a tenant legal aid group today. These results are general information only.
              </Text>
            </Card>
          ) : null}
          <Card>
            <Text className="font-serif text-lg font-semibold text-foreground">{NOTICE_INFO[c.facts.hasNotice]?.title ?? NOTICE_INFO.unknown.title}</Text>
            <Text className="text-sm text-foreground">{NOTICE_INFO[c.facts.hasNotice]?.body ?? NOTICE_INFO.unknown.body}</Text>
          </Card>
          <Card>
            <Text className="text-sm text-foreground">{coverage.label}</Text>
          </Card>
          <Section title="What may apply to you">
            {findings.map((f) => (
              <Card key={f.ruleId}>
                <StatusPill status={f.applicability} />
                <Text className="font-serif text-lg font-semibold text-foreground">{f.title}</Text>
                <Text className="text-sm text-foreground">{f.summary}</Text>
                {f.unresolved.length > 0 ? (
                  <Text className="text-sm text-muted">We still need to know: {f.unresolved.join('; ')}.</Text>
                ) : null}
                {f.exceptions.length > 0 ? (
                  <Text className="text-sm text-muted">It might not cover you if: {f.exceptions.join('; ')}.</Text>
                ) : null}
                <Text className="text-sm font-semibold text-foreground">A good next step: {f.followUp}</Text>
              </Card>
            ))}
          </Section>
          {unknowns.length > 0 ? (
            <Section title="Answers that would help">
              <Card>
                {unknowns.map((u) => (
                  <Text key={u} className="text-sm text-foreground">• {u}</Text>
                ))}
              </Card>
            </Section>
          ) : null}
          <Button variant="secondary" size="lg" onPress={() => { pressHaptic(); router.push({ pathname: '/check', params: { id: c.id } }); }}>
            <Button.Label>Update my answers</Button.Label>
          </Button>
        </>
      ) : null}

      {tab === 'notice' ? (
        <>
          <Text className="text-sm text-muted">
            Copy what your notice says. Anything you leave blank is treated as unknown, never as a problem with the notice.
          </Text>
          <ChoiceGroup question="Type of notice" options={[...NOTICE_TYPES, DONT_KNOW]} value={draft.noticeType} onChange={(v) => setN('noticeType', v)} />
          <Field label="Date on the notice" hint="Or the date you received it." value={draft.noticeDate} onChange={(v) => setN('noticeDate', v)} />
          <Field label="Move-out date it states" hint="Leave blank if none is listed." value={draft.moveOutDate} onChange={(v) => setN('moveOutDate', v)} />
          <ChoiceGroup question="Reason it gives" options={REASONS} value={draft.statedReason} onChange={(v) => setN('statedReason', v)} />
          <ChoiceGroup question="Does it mention relocation help?" options={RELO_OPTIONS} value={draft.relocationStated} onChange={(v) => setN('relocationStated', v)} />
          <Button size="lg" onPress={() => { pressHaptic(); saveNotice(c.id, draft); }}>
            <Button.Label>Check this notice</Button.Label>
          </Button>
          {checks.length > 0 ? (
            <Section title="Check results">
              {checks.map((k) => (
                <Card key={k.id}>
                  <Text className="font-serif text-lg font-semibold text-foreground">{k.label}</Text>
                  <Text className={cn('self-start rounded-full px-3 py-1 text-xs font-semibold text-foreground', k.state === 'present' ? 'bg-success/25' : k.state === 'not_applicable' ? 'bg-border' : 'bg-warning/30')}>
                    {CHECK_LABEL[k.state]}
                  </Text>
                  <Text className="text-sm text-foreground">Usually required: {k.requirement}</Text>
                  <Text className="text-sm text-muted">Your notice: {k.compared}</Text>
                  <Text className="text-sm font-semibold text-foreground">Ask a counselor: {k.askProfessional}</Text>
                </Card>
              ))}
              <Text className="text-sm text-muted">
                A missing detail here does not mean the notice is invalid. Only a housing counselor or attorney can say that.
              </Text>
            </Section>
          ) : null}
        </>
      ) : null}

      {tab === 'plan' ? (
        <>
          {kinds.map((kind) => {
            const list = c.tasks.filter((t) => t.kind === kind);
            return list.length > 0 ? (
              <Section key={kind} title={TASK_KIND_LABEL[kind]}>
                <Card>
                  {list.map((t) => (
                    <Pressable key={t.id} onPress={() => onToggle(t.id)} accessibilityRole="checkbox" accessibilityState={{ checked: t.done }} className="flex-row items-start gap-3 py-1">
                      <Ionicons name={t.done ? 'checkmark-circle' : 'ellipse-outline'} size={26} color={t.done ? accent : muted} />
                      <View className="flex-1 gap-0.5">
                        <Text className={cn('text-base font-semibold text-foreground', t.done ? 'opacity-50' : '')}>{t.title}</Text>
                        <Text className="text-sm text-muted">{t.detail}</Text>
                      </View>
                    </Pressable>
                  ))}
                </Card>
              </Section>
            ) : null;
          })}
          <Section title="Dates">
            {deadlines.map((d) => (
              <Card key={d.label}>
                <Text className="text-base font-semibold text-foreground">{d.label}</Text>
                <Text className="text-lg font-semibold text-warning">{d.date ? formatDate(d.date) : 'Deadline not verified'}</Text>
                <Text className="text-sm text-muted">{d.trace}</Text>
              </Card>
            ))}
          </Section>
          <Section title="Talk to a counselor">
            <Card>
              {COUNSELORS.map((k) => (
                <Pressable key={k.name} onPress={() => Linking.openURL(`tel:${k.phone.replace(/[^0-9]/g, '')}`)} accessibilityLabel={`Call ${k.name}`} className="flex-row items-center gap-3 py-1">
                  <View className="flex-1 gap-0.5">
                    <Text className="text-base font-semibold text-foreground">{k.name}</Text>
                    <Text className="text-sm text-muted">{k.note}</Text>
                    <Text className="text-base font-semibold text-accent">{k.phone}</Text>
                  </View>
                  <Ionicons name="call" size={22} color={accent} />
                </Pressable>
              ))}
              <Text className="text-xs text-muted">These serve the whole county. Phone numbers can change, so check the Help tab if a call does not connect.</Text>
            </Card>
          </Section>
          <Button variant="danger-soft" onPress={() => confirmDelete({ title: 'Delete this case?', message: 'This removes it from this phone.', onConfirm: () => { deleteCase(c.id); router.replace('/'); } })}>
            <Button.Label>Delete case</Button.Label>
          </Button>
        </>
      ) : null}
    </KeyboardAwareScrollView>
  );
}
