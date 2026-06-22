import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { Screen, ScreenHeader } from '@/components/Screen';
import { PrimaryButton, SecondaryButton, Field } from '@/components/ui';
import { Card, Badge } from '@/components/Card';
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
    api.kycStatus().then((r) => setStatus(r.kycStatus)).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (docNumber.trim().length < 4) return setError('Enter a valid document number.');
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
      setUser(me);
      setStatus(me.kycStatus);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.skyBlue} style={{ marginTop: spacing['3xl'] }} />
      </Screen>
    );
  }

  const pending = status === 'IN_REVIEW';

  return (
    <Screen scroll>
      <ScreenHeader
        title={pending ? 'Verification in progress' : 'Verify your identity'}
        subtitle={
          pending
            ? "We're reviewing your documents — we'll let you know."
            : 'CarryMate is trust-first. Verify your ID to send or carry.'
        }
      />

      {pending ? (
        <Card style={{ gap: spacing.md }}>
          <Badge label="Under review" tone="amber" />
          <Text style={styles.body}>Check back here once your ID is approved.</Text>
          <PrimaryButton label="Check status" onPress={refreshStatus} loading={busy} />
        </Card>
      ) : (
        <>
          {status === 'REJECTED' && (
            <Card style={{ borderColor: '#F2C0C0', backgroundColor: colors.dangerLight }}>
              <Text style={styles.rejected}>Previous submission was rejected. Please re-submit a valid document.</Text>
            </Card>
          )}
          <Text style={styles.sectionLabel}>Document type</Text>
          <View style={styles.docs}>
            {options.map((o) => {
              const active = docType === o.value;
              return (
                <Pressable key={o.value} onPress={() => setDocType(o.value)} style={[styles.doc, active && styles.docActive]}>
                  <Text style={[styles.docText, active && { color: colors.navyMid }]}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Field label="Document number" value={docNumber} onChangeText={setDocNumber} autoCapitalize="characters" placeholder="Enter number" error={error} />
          <PhotoButton purpose="kyc" label={fileKey ? 'Document photo added ✓' : 'Upload document photo'} count={fileKey ? 1 : 0} onUploaded={setFileKey} />
          <View style={{ marginTop: spacing.sm }}>
            <PrimaryButton label="Submit for verification" onPress={submit} loading={busy} />
          </View>
        </>
      )}

      <View style={{ marginTop: spacing.xl }}>
        <SecondaryButton label="Sign out" onPress={signOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { ...typography.bodyM, color: colors.textSecondary },
  sectionLabel: { ...typography.label, color: colors.textSecondary },
  docs: { flexDirection: 'row', gap: spacing.sm },
  doc: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.chip, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: colors.bgCard },
  docActive: { borderColor: colors.skyBlue, backgroundColor: colors.skyLight, ...shadows.sm },
  docText: { ...typography.bodyM, fontWeight: '600', color: colors.textPrimary },
  rejected: { ...typography.bodyM, color: '#921010' },
});
