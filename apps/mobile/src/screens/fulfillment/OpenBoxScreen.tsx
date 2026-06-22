import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { PrimaryButton } from '@/components/ui';
import { PhotoButton } from '@/components/PhotoButton';
import { api } from '@/lib/api';
import { getCurrentCoords } from '@/lib/location';
import type { ScreenProps } from '@/navigation/types';

interface InspectionPhoto {
  key: string;
  lat?: number;
  lng?: number;
  takenAt: string;
}

const ITEMS: { key: 'inspected' | 'contentsMatch' | 'noProhibited' | 'sealed'; label: string }[] = [
  { key: 'inspected', label: 'I inspected the package in the sender’s presence' },
  { key: 'contentsMatch', label: 'Contents match the declaration' },
  { key: 'noProhibited', label: 'No prohibited items found' },
  { key: 'sealed', label: 'Package properly sealed after inspection' },
];

export function OpenBoxScreen({ route, navigation }: ScreenProps<'OpenBox'>) {
  const { orderId, title } = route.params;
  const qc = useQueryClient();
  const [checks, setChecks] = useState({ inspected: false, contentsMatch: false, noProhibited: false, sealed: false });
  const [photos, setPhotos] = useState<InspectionPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const allChecked = ITEMS.every((i) => checks[i.key]);

  // Geotag + timestamp each photo as it's captured (best-effort location).
  const onPhotoUploaded = async (key: string) => {
    const coords = await getCurrentCoords();
    setPhotos((p) =>
      p.length < 5
        ? [...p, { key, lat: coords?.lat, lng: coords?.lng, takenAt: new Date().toISOString() }]
        : p,
    );
  };

  const submit = async () => {
    if (!allChecked) return setError('Please confirm all four items.');
    if (photos.length === 0) return setError('Add at least one photo of the sealed package.');
    setBusy(true);
    setError(undefined);
    try {
      await api.openBox(orderId, { checklist: checks, photos });
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
      <Text style={styles.title}>Open-box declaration</Text>
      <Text style={styles.sub}>{title}</Text>
      <Text style={styles.help}>This protects you at customs and on delivery. Confirm each item honestly.</Text>

      {ITEMS.map((i) => {
        const on = checks[i.key];
        return (
          <Pressable key={i.key} onPress={() => setChecks((c) => ({ ...c, [i.key]: !c[i.key] }))} style={styles.checkRow}>
            <View style={[styles.box, on && styles.boxOn]}>{on && <Text style={styles.tick}>✓</Text>}</View>
            <Text style={styles.checkLabel}>{i.label}</Text>
          </Pressable>
        );
      })}

      <PhotoButton purpose="openbox" label="Add package photo" count={photos.length} onUploaded={onPhotoUploaded} />
      {photos.some((p) => p.lat != null) && (
        <Text style={styles.geo}>📍 Photos geotagged for your inspection record</Text>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton label="Confirm & pick up" onPress={submit} loading={busy} disabled={!allChecked} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  title: { ...typography.titleL, color: colors.textPrimary },
  sub: { ...typography.bodyM, color: colors.textSecondary },
  help: { ...typography.bodyM, color: colors.textSecondary },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  box: { width: 24, height: 24, borderRadius: radius.input, borderWidth: 1.5, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.mintPrimary, borderColor: colors.mintPrimary },
  tick: { color: colors.white, fontWeight: '800' },
  checkLabel: { ...typography.bodyM, color: colors.textPrimary, flex: 1 },
  error: { ...typography.bodyM, color: colors.dangerRed },
  geo: { ...typography.caption, color: colors.mintPrimary, fontWeight: '600' },
});
