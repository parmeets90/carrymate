import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Alert } from '@/components/AlertHost';
import { useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DeliveryRequestDto } from '@carrymate/shared';
import { ITEM_DECLARATIONS } from '@carrymate/shared';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { Autocomplete, type Suggestion } from '@/components/Autocomplete';
import { IN_AIRPORTS } from '@/data/airports';
import { DateField } from '@/components/DateField';
import { PhotoButton } from '@/components/PhotoButton';
import { Icon } from '@/components/Icon';
import { api, firstFieldError, type ApiClientError } from '@/lib/api';

const MIN_DEADLINE = new Date(Date.now() + 3 * 86_400_000); // 3+ days out (server rule)

const CATEGORIES = ['FOOD', 'DOCUMENTS', 'CLOTHING', 'GIFTS', 'OTHER'];
const CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah'];

// City suggestions (one entry per city; the first airport is the default).
const CITY_SUGGESTIONS: Suggestion[] = Array.from(
  IN_AIRPORTS.reduce((m, a) => (m.has(a.city) ? m : m.set(a.city, a)), new Map<string, (typeof IN_AIRPORTS)[number]>()).values(),
).map((a) => ({ value: a.city, label: a.city, hint: `${a.code} · ${a.name}`, keywords: a.code }));

// Airport suggestions keyed by IATA code.
const AIRPORT_SUGGESTIONS: Suggestion[] = IN_AIRPORTS.map((a) => ({
  value: a.code,
  label: `${a.code} — ${a.city}`,
  hint: a.name,
  keywords: `${a.city} ${a.name}`,
}));

export function CreateRequestScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const nav = useNavigation();
  const editing = (useRoute().params as { request?: DeliveryRequestDto } | undefined)?.request;

  const [form, setForm] = useState({
    title: editing?.title ?? '',
    description: editing?.description ?? '',
    category: editing?.category ?? 'GIFTS',
    weightKg: editing ? String(editing.weightKg) : '1',
    declaredValueInr: editing ? String(editing.declaredValueInr) : '',
    originCity: editing?.originCity ?? '',
    originAirport: editing?.originAirport ?? 'DEL',
    destinationCity: editing?.destinationCity ?? 'Dubai',
    recipientName: editing?.recipientName ?? '',
    recipientPhone: editing?.recipientPhone ?? '+971',
    recipientAddress: editing?.recipientAddress ?? '',
    deadlineDate: editing?.deadlineDate ?? '',
  });
  const [itemPhotos, setItemPhotos] = useState<string[]>(editing?.itemPhotos ?? []);
  // Editing an existing request implies the declaration was accepted on creation.
  const [declared, setDeclared] = useState<boolean>(!!editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (forceReview = false) => {
    if (!declared) return setError('Please accept the item declaration to post.');
    setBusy(true);
    setError(undefined);
    try {
      const payload = {
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
        declarationAccepted: true,
        requestReview: forceReview,
      };
      if (editing) {
        await api.updateRequest(editing.id, payload);
        qc.invalidateQueries({ queryKey: ['my-requests'] });
        Alert.alert('Request updated', 'Your changes have been saved.');
        nav.goBack();
        return;
      }
      const created = await api.createRequest(payload);
      qc.invalidateQueries({ queryKey: ['my-requests'] });
      Alert.alert(
        forceReview ? 'Sent for review' : 'Request posted',
        created.status === 'PENDING_REVIEW'
          ? 'Our team will review your item and approve it shortly.'
          : 'Travelers on your route can now bid.',
      );
      setForm((f) => ({ ...f, title: '', description: '', declaredValueInr: '', recipientName: '', recipientAddress: '', deadlineDate: '' }));
      setItemPhotos([]);
      setDeclared(false);
    } catch (e) {
      const err = e as ApiClientError;
      // Prohibited-item recovery: explain + offer a manual review (Challenge 08).
      if (err.code === 'ITEM_PROHIBITED' && !forceReview && !editing) {
        Alert.alert('This item needs a check', err.message, [
          { text: 'Edit item', style: 'cancel' },
          { text: 'Request review', onPress: () => void submit(true) },
        ]);
      } else {
        setError(firstFieldError(e) ?? err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: (editing ? 0 : insets.top) + spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.md }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{editing ? 'Edit request' : 'Send a package'}</Text>
      <Pressable onPress={() => nav.navigate('AllowedItems' as never)}>
        <Text style={styles.guideLink}>What can I send? →</Text>
      </Pressable>

      <Field label="Title" value={form.title} onChangeText={set('title')} placeholder="e.g. Homemade pickle for Diwali" />
      <Field label="Description" value={form.description} onChangeText={set('description')} placeholder="What's inside?" multiline />

      <Text style={styles.sectionLabel}>Category</Text>
      <Pills options={CATEGORIES} value={form.category} onChange={set('category')} />

      <View style={styles.two}>
        <View style={styles.flex}><Field label="Weight (kg)" value={form.weightKg} onChangeText={set('weightKg')} keyboardType="decimal-pad" /></View>
        <View style={styles.flex}><Field label="Declared value (₹)" value={form.declaredValueInr} onChangeText={set('declaredValueInr')} keyboardType="number-pad" placeholder="max 10000" /></View>
      </View>

      <View style={styles.two}>
        <View style={styles.flex}>
          <Autocomplete
            label="Origin city"
            value={form.originCity}
            onChangeText={set('originCity')}
            suggestions={CITY_SUGGESTIONS}
            onPick={(s) => {
              const airport = IN_AIRPORTS.find((a) => a.city === s.value);
              setForm((f) => ({ ...f, originCity: s.value, originAirport: airport?.code ?? f.originAirport }));
            }}
            placeholder="Delhi"
          />
        </View>
        <View style={styles.flex}>
          <Autocomplete
            label="Origin airport"
            value={form.originAirport}
            onChangeText={(v) => set('originAirport')(v.toUpperCase())}
            suggestions={AIRPORT_SUGGESTIONS}
            onPick={(s) => {
              const ap = IN_AIRPORTS.find((a) => a.code === s.value);
              setForm((f) => ({ ...f, originAirport: s.value, originCity: f.originCity || ap?.city || '' }));
            }}
            autoCapitalize="characters"
            maxLength={3}
          />
        </View>
      </View>

      <Text style={styles.sectionLabel}>Destination city (UAE)</Text>
      <Pills options={CITIES} value={form.destinationCity} onChange={set('destinationCity')} />

      <Field label="Recipient name" value={form.recipientName} onChangeText={set('recipientName')} />
      <Field label="Recipient phone (UAE)" value={form.recipientPhone} onChangeText={set('recipientPhone')} keyboardType="phone-pad" />
      <Field label="Recipient address" value={form.recipientAddress} onChangeText={set('recipientAddress')} multiline />
      <DateField
        label="Deadline"
        value={form.deadlineDate}
        onChange={set('deadlineDate')}
        placeholder="Pick a deadline (3+ days away)"
        minimumDate={MIN_DEADLINE}
      />

      <Text style={styles.sectionLabel}>Item photos (optional, up to 5)</Text>
      <PhotoButton
        purpose="item"
        label="Add item photo"
        count={itemPhotos.length}
        onUploaded={(key) => setItemPhotos((p) => (p.length < 5 ? [...p, key] : p))}
      />

      {!editing && (
        <View style={styles.declaration}>
          {ITEM_DECLARATIONS.map((d) => (
            <Text key={d} style={styles.declItem}>
              •  {d}
            </Text>
          ))}
          <Pressable style={styles.declAccept} onPress={() => setDeclared((v) => !v)}>
            <View style={[styles.declBox, declared && styles.declBoxOn]}>
              {declared && <Icon name="check" size={14} color={colors.white} weight="fill" />}
            </View>
            <Text style={styles.declAcceptText}>I confirm all of the above is accurate</Text>
          </Pressable>
        </View>
      )}

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <PrimaryButton label={editing ? 'Save changes' : 'Post request'} onPress={() => submit()} loading={busy} />
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
  guideLink: { ...typography.bodyM, color: colors.skyBlue, fontWeight: '600' },
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
  declaration: { backgroundColor: colors.bgSecondary, borderRadius: radius.card, padding: spacing.md, gap: 4 },
  declItem: { ...typography.caption, color: colors.textSecondary, lineHeight: 16 },
  declAccept: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  declBox: { width: 22, height: 22, borderRadius: radius.input, borderWidth: 1.5, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgCard },
  declBoxOn: { backgroundColor: colors.mintPrimary, borderColor: colors.mintPrimary },
  declAcceptText: { ...typography.bodyM, color: colors.textPrimary, fontWeight: '600', flex: 1 },
});
