import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button, useThemeColor } from 'heroui-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

import { Card } from '@/components/card';
import { Pressable, pressHaptic } from '@/components/pressable';
import { AskError, askAssistant, type Turn } from '@/features/assistant/ask';
import { useCasesStore } from '@/features/cases/store/cases-store';

const SUGGESTIONS = [
  'What is the difference between a notice and a court order?',
  'My landlord gave me a notice. What should I do first?',
  'Can my landlord lock me out or shut off my utilities?',
  'What does “relocation assistance” mean?',
];

const FAILURE_TEXT = {
  credits: 'The assistant is out of credits right now. Please try again later, or use the counselor numbers in your case plan.',
  offline: 'Could not reach the assistant. Check your connection and try again.',
  unavailable: 'The assistant could not answer just now. Please try again in a moment.',
} as const;

export default function AskScreen() {
  const muted = useThemeColor('muted');
  const latest = useCasesStore((s) => s.cases[0]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = useRef<FlatList<Turn>>(null);

  const context = latest ? JSON.stringify(latest.facts).slice(0, 1800) : '';

  const send = async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    pressHaptic();
    setError(null);
    setText('');
    const history = turns;
    setTurns([...history, { role: 'user', text: question }]);
    setBusy(true);
    try {
      const answer = await askAssistant(question, context, history);
      setTurns((t) => [...t, { role: 'assistant', text: answer }]);
    } catch (e) {
      setError(FAILURE_TEXT[e instanceof AskError ? e.kind : 'unavailable']);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-5 pt-safe-offset-2">
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" className="size-11 items-center justify-center">
          <Ionicons name="chevron-back" size={26} color={muted} />
        </Pressable>
        <Text className="font-serif text-2xl font-bold text-foreground">Ask a question</Text>
      </View>
      <FlatList
        ref={list}
        className="flex-1"
        data={turns}
        keyExtractor={(_, i) => String(i)}
        contentContainerClassName="px-5 pt-4 pb-6 gap-3"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={
          <View className="gap-3">
            <Card>
              <Text className="text-sm text-muted">
                This is an AI helper. It gives general information in plain words, not legal advice, and it can be wrong. It will never tell you to ignore a notice, stop paying rent or move out. Your question{latest ? ' and your case answers' : ''} are sent to an AI service to write a reply; do not share names or ID numbers.
              </Text>
            </Card>
            {turns.length === 0 ? (
              <View className="gap-2">
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s} onPress={() => send(s)} className="rounded-xl border border-border bg-surface px-4 py-3">
                    <Text className="text-base text-foreground">{s}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) =>
          item.role === 'user' ? (
            <View className="self-end max-w-[85%] rounded-2xl bg-accent px-4 py-3">
              <Text className="text-base text-accent-foreground">{item.text}</Text>
            </View>
          ) : (
            <View className="self-start max-w-[92%]"><Card>
              <Text className="text-base text-foreground" selectable>{item.text.replace(/\*\*/g, '')}</Text></Card>
            </View>
          )
        }
        ListFooterComponent={
          <View className="gap-3">
            {busy ? (
              <View className="self-start">
                <Card>
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator />
                    <Text className="text-base text-muted">Thinking…</Text>
                  </View>
                </Card>
              </View>
            ) : null}
            {error ? <Text className="text-sm text-danger">{error}</Text> : null}
          </View>
        }
      />
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <View className="flex-row items-end gap-2 border-t border-border bg-background px-5 pt-3 pb-safe-offset-2">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type your question"
            multiline
            className="max-h-32 min-h-12 flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
            placeholderTextColor={muted}
            accessibilityLabel="Your question"
          />
          <Button onPress={() => send(text)} isDisabled={busy || !text.trim()} accessibilityLabel="Send">
            <Button.Label>Send</Button.Label>
          </Button>
        </View>
      </KeyboardStickyView>
    </View>
  );
}
