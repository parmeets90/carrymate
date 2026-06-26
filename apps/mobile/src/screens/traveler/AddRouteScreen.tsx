import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Alert } from '@/components/AlertHost';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { Chip, ChipRow } from '@/components/Chip';
import { DateField } from '@/components/DateField';
import { PhotoButton } from '@/components/PhotoButton';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import type { ScreenProps } from '@/navigation/types';

const TODAY = new Date();

const ORIGINS = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'COK', 'AMD'];
const DESTS = ['DXB', 'AUH', 'SHJ'];

export function AddRouteScreen({ navigation, route }: ScreenProps<'AddRoute'>) {
  const qc = useQueryClient();
  const editing = route.params?.route;
  const [form, setForm] = useState({
    originAirport: editing?.originAirport ?? 'DEL',
    destinationAirport: editing?.destinationAirport ?? 'DXB',
    departureDate: editing?.departureDate ?? '',
    capacityKg: editing ? String(editing.capacityKg) : '5',
    flightNumber: editing?.flightNumber ?? '',
    airline: editing?.airline ?? '',
  });
  const [ticketFileKey, setTicketFileKey] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!editing && !ticketFileKey) return setError('Add a photo of your flight ticket to continue.');
    setBusy(true);
    setError(undefined);
    try {
      const payload: Record<string, unknown> = { ...form, capacityKg: Number(form.capacityKg) };
      if (ticketFileKey) payload.ticketFileKey = ticketFileKey;
      if (editing) {
        await api.updateRoute(editing.id, payload);
        qc.invalidateQueries({ queryKey: ['my-routes'] });
        navigation.goBack();
      } else {
        const created = await api.createRoute(payload);
        qc.invalidateQueries({ queryKey: ['my-routes'] });
        navigation.goBack();
        // Tell the traveler whether the flight auto-verified or needs review.
        Alert.alert(
          created.ticketVerified ? 'Trip added — flight confirmed ✈️' : 'Trip added',
          created.ticketVerified
            ? 'We matched your flight automatically. Your trip shows a “Flight confirmed” badge to senders.'
            : 'Your trip is live. We’ll verify your flight from the ticket shortly — it’ll show “Flight confirmed” once approved.',
        );
      }
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
      <Text style={styles.title}>{editing ? 'Edit trip' : 'Add a trip'}</Text>

      <Text style={styles.label}>From (India)</Text>
      <Pills options={ORIGINS} value={form.originAirport} onChange={set('originAirport')} />
      <Text style={styles.label}>To (UAE)</Text>
      <Pills options={DESTS} value={form.destinationAirport} onChange={set('destinationAirport')} />

      <DateField label="Departure date" value={form.departureDate} onChange={set('departureDate')} placeholder="Pick your departure" minimumDate={TODAY} />
      <Field label="Spare capacity (kg)" value={form.capacityKg} onChangeText={set('capacityKg')} keyboardType="decimal-pad" />
      <View style={styles.two}>
        <View style={styles.flex}><Field label="Flight no." value={form.flightNumber} onChangeText={set('flightNumber')} autoCapitalize="characters" placeholder="EK512" /></View>
        <View style={styles.flex}><Field label="Airline" value={form.airline} onChangeText={set('airline')} placeholder="Emirates" /></View>
      </View>
      <Text style={styles.label}>Flight ticket {editing ? '(re-upload to update)' : '(required)'}</Text>
      <View style={styles.trustHint}>
        <Icon name="trips" size={15} color={colors.goldPrimary} weight="fill" />
        <Text style={styles.trustHintText}>
          Verified flights earn a gold “Flight confirmed” badge — senders trust them and you get matched faster.
        </Text>
      </View>
      <PhotoButton
        purpose="ticket"
        label={ticketFileKey ? 'Ticket photo added' : 'Upload flight ticket photo'}
        count={ticketFileKey ? 1 : 0}
        onUploaded={setTicketFileKey}
      />
      {error ? (
        <View style={styles.errorRow}>
          <Icon name="warning" size={15} color={colors.dangerRed} weight="fill" />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <PrimaryButton label={editing ? 'Save changes' : 'Add trip'} onPress={submit} loading={busy} />
    </ScrollView>
  );
}

function Pills({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <ChipRow>
      {options.map((o) => (
        <Chip key={o} label={o} selected={value === o} onPress={() => onChange(o)} />
      ))}
    </ChipRow>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  title: { ...typography.titleL, color: colors.textPrimary },
  label: { ...typography.label, color: colors.textSecondary },
  two: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  trustHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.goldLight,
    borderWidth: 0.5,
    borderColor: colors.goldBorder,
    borderRadius: radius.input,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  trustHintText: { ...typography.caption, color: colors.goldPrimary, fontWeight: '600', flex: 1, lineHeight: 16 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  error: { ...typography.bodyM, color: colors.dangerRed, flex: 1 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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
