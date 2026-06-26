import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { PrimaryButton } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { PhotoButton } from '@/components/PhotoButton';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { toast } from '@/components/Toast';
import { getCurrentCoords } from '@/lib/location';
import { smartScanImage, setScanRules, type ScanVerdict } from '@/lib/smartScan';
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
  const { orderId, title, category } = route.params;
  const qc = useQueryClient();
  const [checks, setChecks] = useState({ inspected: false, contentsMatch: false, noProhibited: false, sealed: false });
  const [photos, setPhotos] = useState<InspectionPhoto[]>([]);
  const [scans, setScans] = useState<ScanVerdict[]>([]);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  // Pull the latest admin-managed scan rules once; ignore failure (built-in
  // defaults stay active so the scan always works offline).
  useEffect(() => {
    api
      .scanRules()
      .then(setScanRules)
      .catch(() => {});
  }, []);

  const allChecked = ITEMS.every((i) => checks[i.key]);
  const flagged = scans.filter((s) => !s.ok);
  const flaggedMessages = [...new Set(flagged.map((f) => f.message))];
  // Top labels the on-device model saw across all photos (transparency + lets
  // you spot a miss and add that exact label in the admin Smart Scan tab).
  const detectedLabels = [...new Set(scans.flatMap((s) => s.labels))].slice(0, 6);

  // On-device AI Smart Scan runs the moment a photo is captured (offline, private).
  const onPhotoPicked = async (uri: string) => {
    setScanning(true);
    const verdict = await smartScanImage(uri, category);
    setScans((s) => [...s, verdict]);
    setScanning(false);
    if (!verdict.ok) haptics.warning();
  };

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
      haptics.success();
      toast.success('Open-box recorded');
      qc.invalidateQueries({ queryKey: ['orders'] });
      navigation.goBack();
    } catch (e) {
      haptics.error();
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
          <Pressable
            key={i.key}
            onPress={() => setChecks((c) => ({ ...c, [i.key]: !c[i.key] }))}
            style={[styles.checkRow, on && styles.checkRowOn]}
          >
            <View style={[styles.box, on && styles.boxOn]}>
              {on && <Icon name="check" size={15} color={colors.white} weight="bold" />}
            </View>
            <Text style={styles.checkLabel}>{i.label}</Text>
          </Pressable>
        );
      })}

      <Text style={styles.scanHint}>
        <Text style={{ fontWeight: '700' }}>AI Smart Scan</Text> checks each photo on your device for obvious prohibited
        items. It’s a helper, not a guarantee — always inspect the contents yourself.
      </Text>
      <PhotoButton
        purpose="openbox"
        label="Add & scan package photo"
        count={photos.length}
        onUploaded={onPhotoUploaded}
        onPicked={onPhotoPicked}
      />

      {scanning && (
        <View style={styles.scanRow}>
          <Icon name="search" size={15} color={colors.primary} />
          <Text style={styles.scanText}>Smart Scan: checking photo…</Text>
        </View>
      )}
      {!scanning && flagged.length > 0 ? (
        <View style={styles.scanWarn}>
          <Icon name="alert" size={18} color={colors.dangerRed} weight="fill" />
          <View style={{ flex: 1 }}>
            <Text style={styles.scanWarnTitle}>Smart Scan flagged a photo</Text>
            {flaggedMessages.map((m, i) => (
              <Text key={i} style={styles.scanWarnText}>{m}</Text>
            ))}
            <Text style={styles.scanWarnHint}>If the contents really are prohibited, do not accept this package.</Text>
          </View>
        </View>
      ) : !scanning && scans.length > 0 ? (
        <View style={styles.scanOk}>
          <Icon name="verified" size={16} color={colors.mintPrimary} weight="fill" />
          <Text style={styles.scanOkText}>Smart Scan: nothing prohibited detected.</Text>
        </View>
      ) : null}
      {!scanning && detectedLabels.length > 0 && (
        <Text style={styles.detected}>Detected: {detectedLabels.join(', ')}</Text>
      )}

      {photos.some((p) => p.lat != null) && (
        <View style={styles.geoRow}>
          <Icon name="location" size={14} color={colors.mintPrimary} weight="fill" />
          <Text style={styles.geo}>Photos geotagged for your inspection record</Text>
        </View>
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
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  checkRowOn: { borderColor: colors.mintBorder, backgroundColor: colors.mintLight },
  box: { width: 24, height: 24, borderRadius: radius.input, borderWidth: 1.5, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.mintPrimary, borderColor: colors.mintPrimary },
  checkLabel: { ...typography.bodyM, color: colors.textPrimary, flex: 1 },
  error: { ...typography.bodyM, color: colors.dangerRed },
  geoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  geo: { ...typography.caption, color: colors.mintPrimary, fontWeight: '600' },
  scanHint: { ...typography.caption, color: colors.inkTertiary, lineHeight: 16 },
  detected: { ...typography.caption, color: colors.inkTertiary, fontStyle: 'italic' },
  scanRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  scanText: { ...typography.bodyM, color: colors.primary, fontWeight: '600' },
  scanWarn: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.dangerSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#F2C0C0',
    borderRadius: radius.card,
    padding: spacing.md,
  },
  scanWarnTitle: { ...typography.bodyM, fontWeight: '700', color: '#921010' },
  scanWarnText: { ...typography.bodyM, color: '#921010', marginTop: 2, lineHeight: 19 },
  scanWarnHint: { ...typography.caption, color: '#921010', marginTop: spacing.xs, fontWeight: '600' },
  scanOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSurface,
    borderRadius: radius.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scanOkText: { ...typography.bodyM, color: '#096438', fontWeight: '600', flex: 1 },
});
