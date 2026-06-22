import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography, sizing } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { api } from '@/lib/api';
import type { ScreenProps } from '@/navigation/types';

export function DeliverScreen({ route, navigation }: ScreenProps<'Deliver'>) {
  const { orderId, title } = route.params;
  const qc = useQueryClient();
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      // Photo capture/upload is a follow-up (needs image-picker + presigned upload).
      await api.deliverOrder(orderId, { otp: otp.trim(), photos: ['pending-upload'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      navigation.goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm delivery</Text>
      <Text style={styles.sub}>{title}</Text>
      <Text style={styles.help}>Ask the recipient for the 6-digit handover code shown in the sender's app.</Text>

      <Field
        label="Handover code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
        autoFocus
        error={error}
      />
      <Text style={styles.note}>Photo proof capture arrives in an upcoming update.</Text>

      <View style={styles.footer}>
        <PrimaryButton label="Mark as delivered" onPress={submit} loading={busy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX, paddingTop: spacing.lg },
  title: { ...typography.titleL, color: colors.textPrimary },
  sub: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.md },
  help: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.lg },
  note: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  footer: { marginTop: spacing.xl },
});
