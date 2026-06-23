import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable, TextInput } from 'react-native';
import { Alert } from '@/components/AlertHost';
import { colors, spacing, typography, sizing, radius } from '@/theme';
import { GradientHero } from '@/components/Screen';
import { PrimaryButton } from '@/components/ui';
import { Badge } from '@/components/Card';
import { CountryCodePicker, COUNTRIES, type Country } from '@/components/CountryCodePicker';
import { api } from '@/lib/api';
import { signInWithGoogle } from '@/lib/googleAuth';
import { useAuth } from '@/store/auth';
import type { ScreenProps } from '@/navigation/types';

export function PhoneScreen({ navigation }: ScreenProps<'Phone'>) {
  const completeLogin = useAuth((s) => s.completeLogin);
  const [country, setCountry] = useState<Country>(COUNTRIES[0]); // India
  const [national, setNational] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string>();

  const fullPhone = `${country.code}${national.replace(/\D/g, '')}`;

  const onContinue = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await api.sendOtp(fullPhone);
      navigation.navigate('Otp', { phone: fullPhone });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setGoogleBusy(true);
    try {
      const idToken = await signInWithGoogle();
      const result = await api.googleAuth(idToken);
      await completeLogin(result); // RootNavigator routes to onboarding/KYC/app
    } catch (e) {
      Alert.alert('Google sign-in', (e as Error).message);
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <GradientHero
        eyebrow="CarryMate"
        title="Send personal items with a traveler heading there."
        subtitle="Connect with trusted community members flying your route — with trust built into every step."
      />
      <View style={styles.body}>
        <View style={styles.pills}>
          <Badge label="India → UAE" tone="sky" />
          <Badge label="Verified travelers" tone="gold" />
          <Badge label="Escrow protected" tone="mint" />
        </View>

        <Text style={styles.label}>Phone number</Text>
        <View style={styles.phoneRow}>
          <CountryCodePicker value={country} onChange={setCountry} />
          <TextInputBox value={national} onChangeText={setNational} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton label="Send code" onPress={onContinue} loading={busy} />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        <Pressable style={styles.google} onPress={onGoogle} disabled={googleBusy}>
          <Text style={styles.googleG}>G</Text>
          <Text style={styles.googleText}>{googleBusy ? 'Please wait…' : 'Continue with Google'}</Text>
        </Pressable>

        <Text style={styles.terms}>We'll text you a 6-digit code. Standard rates may apply.</Text>
        <Text style={styles.disclaimer}>
          CarryMate is a technology platform connecting individuals. It is not a courier company,
          freight forwarder, or customs agent. The traveler assumes full responsibility for items
          carried as personal luggage. By continuing you agree to our Terms.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// Small inline numeric input to keep the phone row tidy.
function TextInputBox({ value, onChangeText }: { value: string; onChangeText: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType="phone-pad"
      autoFocus
      placeholder="98XXXXXXXX"
      placeholderTextColor={colors.textHint}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[styles.numInput, focused && styles.numInputFocused]}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgApp },
  body: { paddingHorizontal: sizing.screenPaddingX, paddingTop: spacing.xl, gap: spacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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
  numInputFocused: { borderColor: colors.skyBlue, backgroundColor: colors.white },
  error: { ...typography.caption, color: colors.dangerRed },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xs },
  line: { flex: 1, height: 0.5, backgroundColor: colors.borderLight },
  or: { ...typography.caption, color: colors.textHint },
  google: {
    height: sizing.buttonPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  googleG: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleText: { ...typography.bodyL, fontWeight: '700', color: colors.textPrimary },
  terms: { ...typography.caption, color: colors.textHint, textAlign: 'center' },
  disclaimer: { ...typography.caption, color: colors.textHint, textAlign: 'center', lineHeight: 15, fontSize: 10 },
});
