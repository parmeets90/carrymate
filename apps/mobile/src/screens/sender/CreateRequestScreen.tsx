import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { PhotoButton } from '@/components/PhotoButton';
import { api, firstFieldError } from '@/lib/api';

const CATEGORIES = ['FOOD', 'DOCUMENTS', 'CLOTHING', 'GIFTS', 'OTHER'];
const CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah'];

export function CreateRequestScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'GIFTS',
    weightKg: '1',
    declaredValueInr: '',
    originCity: '',
    originAirport: 'DEL',
    destinationCity: 'Dubai',
    recipientName: '',
    recipientPhone: '+971',
    recipientAddress: '',
    deadlineDate: '',
  });
  const [itemPhotos, setItemPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await api.createRequest({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        originCity: form.originCity.trim(),
        originAirport: form.originAirport.trim().toUpperCase(),
        recipientName: form.recipientName.trim(),
        // Strip spaces/dashes a user may type into the phone (+971 50 123 4567).
        recipientPhone: form.recipientPhone.replace(/[\s-]/g, ''),
        recipientAddress: form.recipientAddress.trim(),
        deadlineDate: form.deadlineDate.trim(),
        weightKg: Number(form.weightKg),
        declaredValueInr: Number(form.declaredValueInr),
        itemPhotos,
      });
      qc.invalidateQueries({ queryKey: ['my-requests'] });
      Alert.alert('Request posted', 'Travelers on your route can now bid.');
      setForm((f) => ({ ...f, title: '', description: '', declaredValueInr: '', recipientName: '', recipientAddress: '', deadlineDate: '' }));
      setItemPhotos([]);
    } catch (e) {
      // Prefer the specific field error; fall back to the backend message.
      setError(firstFieldError(e) ?? (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.md }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Send a package</Text>

      <Field label="Title" value={form.title} onChangeText={set('title')} placeholder="e.g. Homemade pickle for Diwali" />
      <Field label="Description" value={form.description} onChangeText={set('description')} placeholder="What's inside?" multiline />

      <Text style={styles.sectionLabel}>Category</Text>
      <Pills options={CATEGORIES} value={form.category} onChange={set('category')} />

      <View style={styles.two}>
        <View style={styles.flex}><Field label="Weight (kg)" value={form.weightKg} onChangeText={set('weightKg')} keyboardType="decimal-pad" /></View>
        <View style={styles.flex}><Field label="Declared value (₹)" value={form.declaredValueInr} onChangeText={set('declaredValueInr')} keyboardType="number-pad" placeholder="max 10000" /></View>
      </View>

      <View style={styles.two}>
        <View style={styles.flex}><Field label="Origin city" value={form.originCity} onChangeText={set('originCity')} placeholder="Delhi" /></View>
        <View style={styles.flex}><Field label="Origin airport" value={form.originAirport} onChangeText={set('originAirport')} autoCapitalize="characters" maxLength={3} /></View>
      </View>

      <Text style={styles.sectionLabel}>Destination city (UAE)</Text>
      <Pills options={CITIES} value={form.destinationCity} onChange={set('destinationCity')} />

      <Field label="Recipient name" value={form.recipientName} onChangeText={set('recipientName')} />
      <Field label="Recipient phone (UAE)" value={form.recipientPhone} onChangeText={set('recipientPhone')} keyboardType="phone-pad" />
      <Field label="Recipient address" value={form.recipientAddress} onChangeText={set('recipientAddress')} multiline />
      <Field label="Deadline (YYYY-MM-DD)" value={form.deadlineDate} onChangeText={set('deadlineDate')} placeholder="at least 3 days away" />

      <Text style={styles.sectionLabel}>Item photos (optional, up to 5)</Text>
      <PhotoButton
        purpose="item"
        label="Add item photo"
        count={itemPhotos.length}
        onUploaded={(key) => setItemPhotos((p) => (p.length < 5 ? [...p, key] : p))}
      />

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <PrimaryButton label="Post request" onPress={submit} loading={busy} />
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
  sectionLabel: { ...typography.label, color: colors.textSecondary },
  two: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
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
  errorBanner: { backgroundColor: colors.dangerLight, borderRadius: radius.input, padding: spacing.md, borderWidth: 0.5, borderColor: '#F2C0C0' },
  errorText: { ...typography.bodyM, color: '#921010', fontWeight: '600' },
});
