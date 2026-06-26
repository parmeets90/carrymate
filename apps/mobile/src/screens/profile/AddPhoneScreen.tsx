import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { colors, spacing, typography, sizing, radius } from '@/theme';
import { PrimaryButton } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { CountryCodePicker, COUNTRIES, type Country } from '@/components/CountryCodePicker';
import { api, firstFieldError } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { ScreenProps } from '@/navigation/types';

function ErrorRow({ message }: { message: string }) {
  return (
    <View style={styles.errorRow}>
      <Icon name="warning" size={15} color={colors.dangerRed} weight="fill" />
      <Text style={styles.error}>{message}</Text>
    </View>
  );
}

export function AddPhoneScreen({ navigation }: ScreenProps<'AddPhone'>) {
  const setUser = useAuth((s) => s.setUser);
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [national, setNational] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const fullPhone = `${country.code}${national.replace(/\D/g, '')}`;

  const sendCode = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await api.startPhoneVerify(fullPhone);
      setStep('code');
    } catch (e) {
      setError(firstFieldError(e) ?? (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const user = await api.confirmPhoneVerify(fullPhone, code.trim());
      setUser(user);
      navigation.goBack();
    } catch (e) {
      setError(firstFieldError(e) ?? (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md }}>
      <Text style={styles.title}>Add your phone</Text>
      <View style={styles.trustHint}>
        <Icon name="verified" size={15} color={colors.primary} weight="fill" />
        <Text style={styles.trustHintText}>
          A verified phone is required to post, bid, and pay — it keeps the community reachable and accountable.
        </Text>
      </View>

      {step === 'phone' ? (
        <>
          <Text style={styles.label}>Phone number</Text>
          <View style={styles.phoneRow}>
            <CountryCodePicker value={country} onChange={setCountry} />
            <TextInput
              value={national}
              onChangeText={setNational}
              keyboardType="phone-pad"
              autoFocus
              placeholder="98XXXXXXXX"
              placeholderTextColor={colors.textHint}
              style={styles.numInput}
            />
          </View>
          {error ? <ErrorRow message={error} /> : null}
          <PrimaryButton label="Send code" onPress={sendCode} loading={busy} />
        </>
      ) : (
        <>
          <Text style={styles.label}>Enter the code sent to {fullPhone}</Text>
          <TextInput
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
            keyboardType="number-pad"
            autoFocus
            maxLength={8}
            placeholder="••••••"
            placeholderTextColor={colors.textHint}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            style={styles.codeInput}
          />
          {error ? <ErrorRow message={error} /> : null}
          <PrimaryButton label="Verify phone" onPress={verify} loading={busy} />
          <Text style={styles.resend} onPress={() => setStep('phone')}>
            Change number
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  title: { ...typography.titleL, color: colors.textPrimary },
  trustHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.skyLight,
    borderRadius: radius.input,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  trustHintText: { ...typography.caption, color: colors.primary, lineHeight: 16, flex: 1, fontWeight: '600' },
  label: { ...typography.label, color: colors.textSecondary },
  phoneRow: { flexDirection: 'row', gap: spacing.sm },
  numInput: {
    flex: 1,
    height: sizing.input,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.bgCard,
  },
  codeInput: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.skyBlue,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 10,
    textAlign: 'center',
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  error: { ...typography.bodyM, color: colors.dangerRed, flex: 1 },
  resend: { ...typography.bodyM, color: colors.skyBlue, fontWeight: '600', textAlign: 'center', marginTop: spacing.sm },
});
