import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography, sizing, radius } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { PhotoButton } from '@/components/PhotoButton';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import type { ScreenProps } from '@/navigation/types';

export function DeliverScreen({ route, navigation }: ScreenProps<'Deliver'>) {
  const { orderId, title } = route.params;
  const qc = useQueryClient();
  const [otp, setOtp] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    if (photos.length === 0) {
      setError('Add at least one delivery photo.');
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await api.deliverOrder(orderId, { otp: otp.trim(), photos });
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
      <View style={{ marginTop: spacing.md }}>
        <PhotoButton
          purpose="delivery"
          label="Add delivery photo"
          count={photos.length}
          onUploaded={(key) => setPhotos((p) => (p.length < 3 ? [...p, key] : p))}
        />
      </View>

      <View style={styles.escrow}>
        <Icon name="wallet" size={15} color="#096438" weight="fill" />
        <Text style={styles.escrowText}>Escrow releases to you once the sender confirms receipt.</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Mark as delivered" icon="check" tone="mint" onPress={submit} loading={busy} />
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
  escrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
    backgroundColor: colors.mintLight,
    borderRadius: radius.input,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  escrowText: { ...typography.caption, color: '#096438', fontWeight: '600', flex: 1 },
  footer: { marginTop: spacing.xl },
});
