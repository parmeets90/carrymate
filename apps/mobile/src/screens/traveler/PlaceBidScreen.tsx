import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { DateField } from '@/components/DateField';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import type { ScreenProps } from '@/navigation/types';

const inr = (n: number) => `₹${(Number.isFinite(n) ? n : 0).toLocaleString('en-IN')}`;

const PICKUPS = ['AIRPORT', 'DOORSTEP', 'MEETUP'];

export function PlaceBidScreen({ route, navigation }: ScreenProps<'PlaceBid'>) {
  const { requestId, routeId, title } = route.params;
  const qc = useQueryClient();
  const [carryFeeInr, setFee] = useState('500');
  const [pickupPreference, setPickup] = useState('AIRPORT');
  const [estimatedDeliveryDate, setEta] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const commission = Math.round(Number(carryFeeInr) * 0.15);
  const payout = Number(carryFeeInr) - commission || 0;

  const submit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await api.createBid({
        requestId,
        routeId,
        carryFeeInr: Number(carryFeeInr),
        pickupPreference,
        estimatedDeliveryDate,
        message: message || undefined,
      });
      qc.invalidateQueries({ queryKey: ['available', routeId] });
      qc.invalidateQueries({ queryKey: ['my-bids'] });
      navigation.goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.md }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Bid to carry</Text>
      <Text style={styles.sub} numberOfLines={1}>{title}</Text>

      <Field label="Your fee (₹200–3000)" value={carryFeeInr} onChangeText={setFee} keyboardType="number-pad" />
      <View style={styles.breakdown}>
        <View style={styles.bdRow}>
          <Text style={styles.bdLabel}>Carry fee</Text>
          <Text style={styles.bdValue}>{inr(Number(carryFeeInr))}</Text>
        </View>
        <View style={styles.bdRow}>
          <Text style={styles.bdLabel}>Platform fee (15%)</Text>
          <Text style={styles.bdMuted}>−{inr(commission)}</Text>
        </View>
        <View style={styles.bdDivider} />
        <View style={styles.bdRow}>
          <View style={styles.bdReceiveLabel}>
            <Icon name="wallet" size={15} color="#096438" weight="fill" />
            <Text style={styles.bdReceiveText}>You receive</Text>
          </View>
          <Text style={styles.bdReceiveValue}>{inr(payout)}</Text>
        </View>
      </View>

      <Text style={styles.label}>Pickup preference</Text>
      <View style={styles.pills}>
        {PICKUPS.map((o) => {
          const active = pickupPreference === o;
          return (
            <Pressable key={o} onPress={() => setPickup(o)} style={[styles.pill, active && styles.pillActive]}>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{o}</Text>
            </Pressable>
          );
        })}
      </View>

      <DateField label="Estimated delivery date" value={estimatedDeliveryDate} onChange={setEta} placeholder="Pick a delivery date" minimumDate={new Date()} />
      <Field label="Message to sender (optional)" value={message} onChangeText={setMessage} multiline placeholder="Happy to carry this!" error={error} />

      <PrimaryButton label="Submit bid" onPress={submit} loading={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  title: { ...typography.titleL, color: colors.textPrimary },
  sub: { ...typography.bodyM, color: colors.textSecondary },
  label: { ...typography.label, color: colors.textSecondary },
  breakdown: {
    backgroundColor: colors.mintLight,
    borderWidth: 0.5,
    borderColor: colors.mintBorder,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  bdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bdLabel: { ...typography.bodyM, color: colors.textSecondary },
  bdValue: { ...typography.bodyM, color: colors.textPrimary, fontWeight: '600' },
  bdMuted: { ...typography.bodyM, color: colors.textSecondary },
  bdDivider: { height: 0.5, backgroundColor: colors.mintBorder },
  bdReceiveLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bdReceiveText: { ...typography.bodyM, color: '#096438', fontWeight: '700' },
  bdReceiveValue: { ...typography.titleM, color: '#096438', fontWeight: '700' },
  pills: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    borderRadius: radius.chip,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgCard,
  },
  pillActive: { borderColor: colors.skyBlue, backgroundColor: colors.skyLight },
  pillText: { ...typography.bodyM, color: colors.textSecondary },
  pillTextActive: { color: colors.navyMid, fontWeight: '600' },
});
