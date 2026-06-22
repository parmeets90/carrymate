import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { api } from '@/lib/api';
import type { ScreenProps } from '@/navigation/types';

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
      <View style={styles.payoutRow}>
        <Text style={styles.payoutText}>Platform fee 15%: ₹{commission}</Text>
        <Text style={styles.payoutText}>You receive: ₹{payout}</Text>
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

      <Field label="Estimated delivery (YYYY-MM-DD)" value={estimatedDeliveryDate} onChangeText={setEta} placeholder="2026-07-03" />
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
  payoutRow: { flexDirection: 'row', justifyContent: 'space-between' },
  payoutText: { ...typography.bodyM, color: colors.textSecondary },
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
