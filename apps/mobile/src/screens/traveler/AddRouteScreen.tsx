import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { api } from '@/lib/api';
import type { ScreenProps } from '@/navigation/types';

const ORIGINS = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'COK', 'AMD'];
const DESTS = ['DXB', 'AUH', 'SHJ'];

export function AddRouteScreen({ navigation }: ScreenProps<'AddRoute'>) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    originAirport: 'DEL',
    destinationAirport: 'DXB',
    departureDate: '',
    capacityKg: '5',
    flightNumber: '',
    airline: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await api.createRoute({ ...form, capacityKg: Number(form.capacityKg) });
      qc.invalidateQueries({ queryKey: ['my-routes'] });
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
      <Text style={styles.title}>Add a trip</Text>

      <Text style={styles.label}>From (India)</Text>
      <Pills options={ORIGINS} value={form.originAirport} onChange={set('originAirport')} />
      <Text style={styles.label}>To (UAE)</Text>
      <Pills options={DESTS} value={form.destinationAirport} onChange={set('destinationAirport')} />

      <Field label="Departure (YYYY-MM-DD)" value={form.departureDate} onChangeText={set('departureDate')} placeholder="2026-07-01" />
      <Field label="Spare capacity (kg)" value={form.capacityKg} onChangeText={set('capacityKg')} keyboardType="decimal-pad" />
      <View style={styles.two}>
        <View style={styles.flex}><Field label="Flight no." value={form.flightNumber} onChangeText={set('flightNumber')} autoCapitalize="characters" placeholder="EK512" /></View>
        <View style={styles.flex}><Field label="Airline" value={form.airline} onChangeText={set('airline')} placeholder="Emirates" /></View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton label="Add trip" onPress={submit} loading={busy} />
    </ScrollView>
  );
}

function Pills({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.pills}>
      {options.map((o) => {
        const active = value === o;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[styles.pill, active && styles.pillActive]}>
            <Text style={[styles.pillText, active && styles.pillTextActive]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  title: { ...typography.titleL, color: colors.textPrimary },
  label: { ...typography.label, color: colors.textSecondary },
  two: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  error: { ...typography.bodyM, color: colors.dangerRed },
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
