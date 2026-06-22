import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { PhotoButton } from '@/components/PhotoButton';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';

const DOC_OPTIONS: Record<string, { value: string; label: string }[]> = {
  TRAVELER: [{ value: 'PASSPORT', label: 'Passport' }],
  SENDER: [
    { value: 'AADHAAR', label: 'Aadhaar' },
    { value: 'PAN', label: 'PAN' },
  ],
};

export function KycScreen() {
  const insets = useSafeAreaInsets();
  const { user, setUser, signOut } = useAuth();
  const options = DOC_OPTIONS[user?.role === 'TRAVELER' ? 'TRAVELER' : 'SENDER']!;

  const [status, setStatus] = useState<string>(user?.kycStatus ?? 'PENDING');
  const [docType, setDocType] = useState(options[0]!.value);
  const [docNumber, setDocNumber] = useState('');
  const [fileKey, setFileKey] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    api
      .kycStatus()
      .then((r) => setStatus(r.kycStatus))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (docNumber.trim().length < 4) {
      setError('Enter a valid document number.');
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const res = await api.submitKyc({ docType, docNumber: docNumber.trim(), fileKey });
      setStatus(res.kycStatus);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const refreshStatus = async () => {
    setBusy(true);
    try {
      const me = await api.me();
      setUser(me); // if VERIFIED, the navigator advances to Home
      setStatus(me.kycStatus);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.skyBlue} />
      </View>
    );
  }

  const pending = status === 'IN_REVIEW';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: spacing['3xl'] }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{pending ? 'Verification in progress' : 'Verify your identity'}</Text>
        <Text style={styles.sub}>
          {pending
            ? "We're reviewing your documents. This usually takes a little while — we'll let you know."
            : 'CarryMate is a trust-first marketplace. Verify your ID to send or carry items.'}
        </Text>
      </View>

      {pending ? (
        <View style={styles.pendingCard}>
          <Text style={styles.pendingBadge}>UNDER REVIEW</Text>
          <Text style={styles.sub}>You can check back here once your ID is approved.</Text>
          <PrimaryButton label="Check status" onPress={refreshStatus} loading={busy} />
        </View>
      ) : (
        <>
          {status === 'REJECTED' && (
            <Text style={styles.rejected}>
              Your previous submission was rejected. Please re-submit a valid document.
            </Text>
          )}
          <Text style={styles.sectionLabel}>Document type</Text>
          <View style={styles.docs}>
            {options.map((o) => {
              const active = docType === o.value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => setDocType(o.value)}
                  style={[styles.doc, active && styles.docActive]}
                >
                  <Text style={[styles.docText, active && styles.docTextActive]}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Field
            label="Document number"
            value={docNumber}
            onChangeText={setDocNumber}
            autoCapitalize="characters"
            placeholder="Enter number"
            error={error}
          />

          <View style={{ marginTop: spacing.md }}>
            <PhotoButton
              purpose="kyc"
              label={fileKey ? 'Document photo added' : 'Upload document photo'}
              count={fileKey ? 1 : 0}
              onUploaded={setFileKey}
            />
          </View>

          <View style={styles.footer}>
            <PrimaryButton label="Submit for verification" onPress={submit} loading={busy} />
          </View>
        </>
      )}

      <Pressable onPress={signOut} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgApp },
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
    paddingHorizontal: sizing.screenPaddingX,
  },
  header: { gap: spacing.sm, marginBottom: spacing.lg },
  title: { ...typography.display, color: colors.textPrimary },
  sub: { ...typography.bodyM, color: colors.textSecondary },
  sectionLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  docs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  doc: {
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    borderRadius: radius.chip,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bgCard,
  },
  docActive: { borderColor: colors.skyBlue, backgroundColor: colors.skyLight },
  docText: { ...typography.bodyM, fontWeight: '600', color: colors.textPrimary },
  docTextActive: { color: colors.navyMid },
  note: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  rejected: { ...typography.bodyM, color: colors.dangerRed, marginBottom: spacing.md },
  footer: { marginTop: spacing.xl },
  pendingCard: {
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.bgCard,
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cautionLight,
    color: colors.cautionAmber,
    ...typography.label,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.input,
    overflow: 'hidden',
  },
  signOut: { marginTop: spacing.xl, alignItems: 'center' },
  signOutText: { ...typography.bodyM, color: colors.textSecondary },
});
