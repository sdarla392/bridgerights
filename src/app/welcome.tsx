import { useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Card } from '@/components/card';
import { Pressable } from '@/components/pressable';
import { authClient } from '@/lib/auth';

const input = 'h-12 rounded-xl border border-border bg-surface px-4 text-base leading-none text-foreground';

export default function WelcomeScreen() {
  const muted = useThemeColor('muted');
  const [mode, setMode] = useState<'create' | 'back'>('create');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const creating = mode === 'create';

  const submit = async () => {
    setError('');
    if (creating && !name.trim()) return setError('Please enter your name.');
    if (!email.includes('@')) return setError('Please enter a valid email.');
    if (password.length < 8) return setError('Use a password of at least 8 characters.');
    setBusy(true);
    try {
      const res = creating
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (res.error) setError(res.error.message ?? 'That did not work. Please try again.');
    } catch {
      setError('Could not reach the service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-safe-offset-10 pb-safe-offset-4 gap-6"
      keyboardShouldPersistTaps="handled">
      <View className="gap-3">
        <Text className="text-sm font-semibold text-accent">BridgeRights · Santa Clara County</Text>
        <Text className="font-serif text-4xl font-bold leading-tight text-foreground">
          {creating ? 'Create your account' : 'Welcome back'}
        </Text>
        <Text className="text-base text-muted">
          {creating ? 'An account keeps your cases and tasks safe and ready when you return.' : 'Sign in to pick up where you left off.'}
        </Text>
      </View>

      <Card>
        {creating ? (
          <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={muted} autoComplete="name" className={input} accessibilityLabel="Your name" />
        ) : null}
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={muted} autoCapitalize="none" keyboardType="email-address" autoComplete="email" className={input} accessibilityLabel="Email" />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password (8+ characters)" placeholderTextColor={muted} secureTextEntry autoCapitalize="none" className={input} accessibilityLabel="Password" />
        {error ? <Text className="text-sm text-danger">{error}</Text> : null}
      </Card>

      <Pressable onPress={submit} accessibilityRole="button" className="h-14 items-center justify-center rounded-2xl bg-accent">
        <Text className="text-base font-semibold text-accent-foreground">{busy ? 'One moment…' : creating ? 'Create account' : 'Sign in'}</Text>
      </Pressable>

      <Pressable onPress={() => { setError(''); setMode(creating ? 'back' : 'create'); }} accessibilityRole="button" className="items-center py-2">
        <Text className="text-base text-accent">{creating ? 'Already have an account? Sign in' : 'New here? Create an account'}</Text>
      </Pressable>

      <Text className="text-xs text-muted">BridgeRights gives information, not legal advice.</Text>
    </KeyboardAwareScrollView>
  );
}
