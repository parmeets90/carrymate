import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius, shadows } from '@/theme';
import { PrimaryButton } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { DecorBlobs } from '@/components/DecorBlobs';
import { AuthIllustration } from '@/components/AuthIllustration';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { ScreenProps } from '@/navigation/types';

const CODE_LENGTH = 6;

export function OtpScreen({ route, navigation }: ScreenProps<'Otp'>) {
  const insets = useSafeAreaInsets();
  const { phone } = route.params;
  const completeLogin = useAuth((s) => s.completeLogin);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const verify = async (value: string) => {
    setBusy(true);
    setError(undefined);
    try {
      const result = await api.verifyOtp(phone, value.trim());
      await completeLogin(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onChange = (next: string) => {
    setCode(next);
    if (error) setError(undefined);
    if (next.length === CODE_LENGTH) verify(next); // auto-submit on the last digit
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      {/* Hero — same pastel language as the phone screen */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
        <DecorBlobs variant="auth" />
        <View style={styles.heroTop}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.back}>
            <Icon name="back" size={22} color={colors.navyDark} />
          </Pressable>
          <Text style={styles.wordmark}>CarryMate</Text>
          <View style={styles.backSpacer} />
        </View>
        <View style={styles.heroCenter}>
          <AuthIllustration name="trust" size={170} />
          <Text style={styles.heroTitle}>Enter the code</Text>
          <Text style={styles.heroSub}>Sent to {phone}</Text>
        </View>
      </View>

      {/* Form sheet */}
      <View style={[styles.formCard, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <OtpBoxes value={code} onChange={onChange} error={!!error} />
        {error ? (
          <View style={styles.errorRow}>
            <Icon name="warning" size={15} color={colors.dangerRed} weight="fill" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <PrimaryButton
          label="Verify & continue"
          onPress={() => verify(code)}
          loading={busy}
          disabled={code.length < CODE_LENGTH}
        />
        <Text style={styles.note}>In dev, the code prints in the API server console.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

/** Segmented 6-digit code input: visible boxes over one hidden field; taps open the keyboard. */
function OtpBoxes({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable style={styles.boxes} onPress={() => ref.current?.focus()}>
      {Array.from({ length: CODE_LENGTH }).map((_, i) => {
        const char = value[i] ?? '';
        const active = focused && i === value.length;
        return (
          <View
            key={i}
            style={[
              styles.box,
              char !== '' && styles.boxFilled,
              active && styles.boxActive,
              error && styles.boxError,
            ]}
          >
            <Text style={styles.boxText}>{char}</Text>
          </View>
        );
      })}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.hiddenInput}
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  hero: { flex: 1, backgroundColor: colors.white, alignItems: 'center' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: spacing.lg },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backSpacer: { width: 40 },
  wordmark: { ...typography.titleM, fontFamily: typography.display.fontFamily, fontWeight: '700', color: colors.navyDark, letterSpacing: 0.2 },
  heroCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingHorizontal: spacing.xl },
  heroTitle: { ...typography.titleL, fontSize: 24, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.sm },
  heroSub: { ...typography.bodyM, fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
  formCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
    ...shadows.lg,
  },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  box: {
    flex: 1,
    height: 56,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { borderColor: colors.skyBlue, backgroundColor: colors.white },
  boxActive: { borderColor: colors.skyBlue, borderWidth: 2, backgroundColor: colors.white, ...shadows.sm },
  boxError: { borderColor: colors.dangerRed },
  boxText: { ...typography.titleL, color: colors.textPrimary, fontWeight: '700' },
  hiddenInput: { position: 'absolute', opacity: 0, width: '100%', height: '100%' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { ...typography.bodyM, color: colors.dangerRed, flex: 1 },
  note: { ...typography.caption, color: colors.textHint, textAlign: 'center' },
});
