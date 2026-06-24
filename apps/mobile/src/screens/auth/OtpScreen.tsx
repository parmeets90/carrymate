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
import { colors, spacing, typography, sizing, radius, shadows } from '@/theme';
import { GradientHero } from '@/components/Screen';
import { PrimaryButton } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { ScreenProps } from '@/navigation/types';

const CODE_LENGTH = 6;

export function OtpScreen({ route, navigation }: ScreenProps<'Otp'>) {
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
      <GradientHero
        eyebrow="Verify"
        title="Enter the code"
        subtitle={`Sent to ${phone}`}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.body}>
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

/** Segmented 6-digit code input: visible boxes over one hidden, focused field. */
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
  const [focused, setFocused] = useState(true);

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
        autoFocus
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
  flex: { flex: 1, backgroundColor: colors.bgApp },
  body: { paddingHorizontal: sizing.screenPaddingX, paddingTop: spacing.xl, gap: spacing.lg },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  box: {
    flex: 1,
    height: 56,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { borderColor: colors.skyBlue },
  boxActive: { borderColor: colors.skyBlue, borderWidth: 2, backgroundColor: colors.white, ...shadows.sm },
  boxError: { borderColor: colors.dangerRed },
  boxText: { ...typography.titleL, color: colors.textPrimary, fontWeight: '700' },
  hiddenInput: { position: 'absolute', opacity: 0, width: '100%', height: '100%' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { ...typography.bodyM, color: colors.dangerRed, flex: 1 },
  note: { ...typography.caption, color: colors.textHint, textAlign: 'center' },
});
