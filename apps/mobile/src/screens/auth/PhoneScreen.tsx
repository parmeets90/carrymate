import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert } from '@/components/AlertHost';
import { colors, spacing, typography, sizing, radius, shadows } from '@/theme';
import { PrimaryButton } from '@/components/ui';
import { DecorBlobs } from '@/components/DecorBlobs';
import { OnboardingCarousel, type OnboardingSlide } from '@/components/OnboardingCarousel';
import { CountryCodePicker, COUNTRIES, type Country } from '@/components/CountryCodePicker';
import { api } from '@/lib/api';
import { signInWithGoogle } from '@/lib/googleAuth';
import { useAuth } from '@/store/auth';
import type { ScreenProps } from '@/navigation/types';

const SLIDES: OnboardingSlide[] = [
  { key: 'carry', illustration: 'carry', title: 'Carry Across Borders', description: 'Send gifts, documents and personal items through verified travelers.' },
  { key: 'earn', illustration: 'earn', title: 'Travel & Earn', description: 'Use your extra luggage space to earn while you travel.' },
  { key: 'trust', illustration: 'trust', title: 'Safe & Trusted', description: 'Verified travelers, secure payments and transparent tracking.' },
  { key: 'fast', illustration: 'fast', title: 'Fast & Affordable', description: 'Smarter than traditional courier services.' },
];

export function PhoneScreen({ navigation }: ScreenProps<'Phone'>) {
  const insets = useSafeAreaInsets();
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
      {/* Top ~60% — soft pastel hero with the auto-sliding onboarding carousel */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
        <DecorBlobs variant="auth" />
        <Text style={styles.wordmark}>CarryMate</Text>
        <OnboardingCarousel slides={SLIDES} />
      </View>

      {/* Bottom ~40% — existing login form, restyled into a rounded sheet */}
      <View style={[styles.formCard, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Text style={styles.formTitle}>Get started</Text>

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
  flex: { flex: 1, backgroundColor: colors.white },
  // Top hero (~60%) — soft pastel canvas behind the carousel.
  hero: { flex: 1, backgroundColor: colors.white, alignItems: 'center' },
  wordmark: { ...typography.titleM, fontFamily: typography.display.fontFamily, fontWeight: '700', color: colors.navyDark, letterSpacing: 0.2 },
  // Bottom sheet (~40%) — the login form on a rounded white card.
  formCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24, // lift the sheet slightly over the hero
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
    ...shadows.lg,
  },
  formTitle: { ...typography.titleL, color: colors.textPrimary },
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
    backgroundColor: colors.bgSecondary,
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
