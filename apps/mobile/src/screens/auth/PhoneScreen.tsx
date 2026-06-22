import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { api } from '@/lib/api';
import type { ScreenProps } from '@/navigation/types';

export function PhoneScreen({ navigation }: ScreenProps<'Phone'>) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('+91');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const onContinue = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await api.sendOtp(phone.trim());
      navigation.navigate('Otp', { phone: phone.trim() });
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
        <Text style={typography.h1}>What's your number?</Text>
        <Text style={[typography.muted, styles.sub]}>
          We'll text you a code to verify it. Standard rates may apply.
        </Text>
      </View>

      <Field
        label="Phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoFocus
        placeholder="+9198XXXXXXXX"
        error={error}
      />

      <View style={styles.footer}>
        <PrimaryButton label="Send code" onPress={onContinue} loading={busy} />
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
