import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Linking } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { Screen, ScreenHeader } from '@/components/Screen';
import { PrimaryButton, SecondaryButton, Field } from '@/components/ui';
import { Card, Badge } from '@/components/Card';
import { PhotoButton } from '@/components/PhotoButton';
import { Icon } from '@/components/Icon';
import { Alert } from '@/components/AlertHost';
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
  const [provider, setProvider] = useState<'didit' | 'manual'>('manual');
  const [docType, setDocType] = useState(options[0]!.value);
  const [docNumber, setDocNumber] = useState('');
  const [fileKey, setFileKey] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([api.kycProvider().catch(() => ({ provider: 'manual' as const })), api.kycStatus().catch(() => null)])
      .then(([p, s]) => {
        setProvider(p.provider);
        if (s) setStatus(s.kycStatus);
      })
      .finally(() => setLoading(false));
  }, []);

  // While a hosted verification is in flight, poll until it resolves.
  useEffect(() => {
    if (status !== 'VERIFYING') return;
    pollRef.current = setInterval(async () => {
      try {
        const me = await api.me();
        if (me.kycStatus !== 'VERIFYING') {
          setUser(me); // VERIFIED flips the navigator; IN_REVIEW shows the review card
          setStatus(me.kycStatus);
        }
      } catch {
        /* keep polling */
      }
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, setUser]);

  const startVerify = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const { url } = await api.startKycVerification();
      setStatus('VERIFYING');
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Could not start verification', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

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

  return (
    <Screen scroll>
      <ScreenHeader
        title={status === 'IN_REVIEW' ? 'Verification in progress' : 'Verify your identity'}
        subtitle={
          status === 'IN_REVIEW'
            ? "We're reviewing your verification — we'll let you know."
            : 'CarryMate is trust-first. Verify your ID to send or carry.'
        }
      />

      {status === 'VERIFYING' ? (
        <Card style={{ gap: spacing.md, alignItems: 'center', paddingVertical: spacing.xl }}>
          <ActivityIndicator color={colors.skyBlue} />
          <Text style={styles.center}>Complete the verification in your browser. This screen updates automatically when you're done.</Text>
          <PrimaryButton label="I've finished — check status" onPress={refreshStatus} loading={busy} />
        </Card>
      ) : status === 'IN_REVIEW' ? (
        <Card style={{ gap: spacing.md }}>
          <Badge label="Under review" tone="amber" />
          <Text style={styles.body}>Our team will confirm your verification shortly.</Text>
          <PrimaryButton label="Check status" onPress={refreshStatus} loading={busy} />
        </Card>
      ) : provider === 'didit' ? (
        <Card style={{ gap: spacing.md }}>
          {status === 'REJECTED' && (
            <Text style={styles.rejected}>Your last attempt wasn't approved. Please try again.</Text>
          )}
          <View style={styles.featRow}><Icon name="identity" size={20} color={colors.skyBlue} /><Text style={styles.feat}>Scan a government ID</Text></View>
          <View style={styles.featRow}><Icon name="verified" size={20} color={colors.mintPrimary} /><Text style={styles.feat}>Quick selfie liveness check</Text></View>
          <View style={styles.featRow}><Icon name="lock" size={20} color={colors.navyMid} /><Text style={styles.feat}>Bank-grade, encrypted, ~2 minutes</Text></View>
          <View style={{ marginTop: spacing.sm }}>
            <PrimaryButton label="Verify my identity" onPress={startVerify} loading={busy} />
          </View>
          <Text style={styles.fine}>Opens a secure verification page. Come back when you're done.</Text>
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
  center: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 },
  sectionLabel: { ...typography.label, color: colors.textSecondary },
  docs: { flexDirection: 'row', gap: spacing.sm },
  doc: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.chip, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: colors.bgCard },
  docActive: { borderColor: colors.skyBlue, backgroundColor: colors.skyLight, ...shadows.sm },
  docText: { ...typography.bodyM, fontWeight: '600', color: colors.textPrimary },
  rejected: { ...typography.bodyM, color: '#921010' },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  feat: { ...typography.bodyM, color: colors.textPrimary },
  fine: { ...typography.caption, color: colors.textHint, textAlign: 'center' },
});
