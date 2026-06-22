import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { ScreenProps } from '@/navigation/types';

export function OtpScreen({ route }: ScreenProps<'Otp'>) {
  const insets = useSafeAreaInsets();
  const { phone } = route.params;
  const completeLogin = useAuth((s) => s.completeLogin);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const onVerify = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const result = await api.verifyOtp(phone, code.trim());
      await completeLogin(result); // navigator switches stacks based on the new user
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top + spacing.xxl }]}
    >
      <View style={styles.header}>
        <Text style={typography.h1}>Enter the code</Text>
        <Text style={[typography.muted, styles.sub]}>
          Sent to {phone}. In dev, the code is printed in the API server console.
        </Text>
      </View>

      <Field
        label="6-digit code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        autoFocus
        maxLength={6}
        placeholder="000000"
        error={error}
      />

      <View style={styles.footer}>
        <PrimaryButton label="Verify" onPress={onVerify} loading={busy} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  header: { gap: spacing.sm, marginBottom: spacing.xl },
  sub: { lineHeight: 22 },
  footer: { marginTop: spacing.xl },
});
