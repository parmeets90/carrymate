import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import type { ScreenProps } from '@/navigation/types';

const REASONS = [
  { value: 'ITEM_NOT_DELIVERED', label: 'Not delivered' },
  { value: 'ITEM_DAMAGED', label: 'Damaged' },
  { value: 'WRONG_ITEM', label: 'Wrong item' },
  { value: 'FRAUD', label: 'Fraud' },
  { value: 'OTHER', label: 'Other' },
];

export function DisputeScreen({ route, navigation }: ScreenProps<'Dispute'>) {
  const { orderId, title } = route.params;
  const qc = useQueryClient();
  const [reason, setReason] = useState('ITEM_NOT_DELIVERED');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    if (description.trim().length < 10) {
      setError('Please describe the issue (at least 10 characters).');
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await api.disputeOrder(orderId, { reason, description: description.trim() });
      qc.invalidateQueries({ queryKey: ['orders'] });
      navigation.goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md }}>
      <Text style={styles.title}>Raise a dispute</Text>
      <Text style={styles.sub}>{title}</Text>

      <View style={styles.frozen}>
        <Icon name="lock" size={15} color="#946A00" weight="fill" />
        <Text style={styles.frozenText}>Your escrow is frozen — funds stay safe until an admin resolves this.</Text>
      </View>

      <Text style={styles.label}>Reason</Text>
      <View style={styles.pills}>
        {REASONS.map((r) => {
          const active = reason === r.value;
          return (
            <Pressable key={r.value} onPress={() => setReason(r.value)} style={[styles.pill, active && styles.pillActive]}>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{r.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Field label="What happened?" value={description} onChangeText={setDescription} multiline placeholder="Describe the issue" error={error} />
      <PrimaryButton label="Submit dispute" onPress={submit} loading={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  title: { ...typography.titleL, color: colors.textPrimary },
  sub: { ...typography.bodyM, color: colors.textSecondary },
  frozen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cautionLight,
    borderRadius: radius.input,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  frozenText: { ...typography.caption, color: '#946A00', fontWeight: '600', flex: 1 },
  label: { ...typography.label, color: colors.textSecondary },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: { borderWidth: 0.5, borderColor: colors.borderLight, borderRadius: radius.chip, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.bgCard },
  pillActive: { borderColor: colors.dangerRed, backgroundColor: colors.dangerLight },
  pillText: { ...typography.bodyM, color: colors.textSecondary },
  pillTextActive: { color: '#921010', fontWeight: '600' },
});
