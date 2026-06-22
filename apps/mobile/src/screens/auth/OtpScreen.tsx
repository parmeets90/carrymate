import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, typography, sizing } from '@/theme';
import { GradientHero } from '@/components/Screen';
import { PrimaryButton, Field } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { ScreenProps } from '@/navigation/types';

export function OtpScreen({ route }: ScreenProps<'Otp'>) {
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
      await completeLogin(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <GradientHero eyebrow="Verify" title="Enter the code" subtitle={`Sent to ${phone}`} />
      <View style={styles.body}>
        <Field
          label="6-digit code"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          autoFocus
          maxLength={6}
          placeholder="••••••"
          error={error}
        />
        <PrimaryButton label="Verify & continue" onPress={onVerify} loading={busy} />
        <Text style={styles.note}>In dev, the code prints in the API server console.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgApp },
  body: { paddingHorizontal: sizing.screenPaddingX, paddingTop: spacing.xl, gap: spacing.lg },
  note: { ...typography.caption, color: colors.textHint, textAlign: 'center' },
});
