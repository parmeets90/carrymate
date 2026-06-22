import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, typography, sizing } from '@/theme';
import { GradientHero } from '@/components/Screen';
import { PrimaryButton, Field } from '@/components/ui';
import { Badge } from '@/components/Card';
import { api } from '@/lib/api';
import type { ScreenProps } from '@/navigation/types';

export function PhoneScreen({ navigation }: ScreenProps<'Phone'>) {
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <GradientHero
        eyebrow="CarryMate"
        title="Send anything, with someone flying there."
        subtitle="Cheaper and faster than courier — trust built into every step."
      />
      <View style={styles.body}>
        <View style={styles.pills}>
          <Badge label="India → UAE" tone="sky" />
          <Badge label="Verified travelers" tone="gold" />
          <Badge label="Escrow protected" tone="mint" />
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
        <PrimaryButton label="Send code" onPress={onContinue} loading={busy} />
        <Text style={styles.terms}>We'll text you a 6-digit code. Standard rates may apply.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgApp },
  body: { paddingHorizontal: sizing.screenPaddingX, paddingTop: spacing.xl, gap: spacing.lg },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  terms: { ...typography.caption, color: colors.textHint, textAlign: 'center' },
});
