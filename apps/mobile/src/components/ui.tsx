import { useRef, useState } from 'react';
import {
  Text,
  TextInput,
  Pressable,
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { colors, spacing, radius, typography, sizing, elevations, border } from '@/theme';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { haptics } from '@/lib/haptics';

/** Pressable with a subtle scale-down on press (premium tactile feel). */
export function Pressable3D({
  onPress,
  disabled,
  children,
  style,
  haptic = false,
}: {
  onPress?: () => void;
  disabled?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Fire a light haptic on press (cards/buttons). Off by default. */
  haptic?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  return (
    <Pressable
      onPress={() => {
        if (haptic) haptics.light();
        onPress?.();
      }}
      disabled={disabled}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}

type ButtonTone = 'sky' | 'gold' | 'mint' | 'danger';

// DS v2 — solid semantic fills (no gradients). `sky` is the default brand action.
const BUTTON_FILL: Record<ButtonTone, string> = {
  sky: colors.primary,
  gold: colors.goldPrimary,
  mint: colors.mintPrimary,
  danger: colors.dangerRed,
};

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
  tone = 'sky',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Leading glyph — e.g. `lock` on the escrow CTA. */
  icon?: IconName;
  /** Semantic CTA color: sky=action (default), gold=trust, mint=money, danger. */
  tone?: ButtonTone;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable3D onPress={onPress} disabled={isDisabled} haptic={!isDisabled}>
      <View
        style={[
          styles.btn,
          { backgroundColor: isDisabled ? '#AEB6C2' : BUTTON_FILL[tone] },
          !isDisabled && elevations.e1,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <View style={styles.btnRow}>
            {icon ? <Icon name={icon} size={18} color={colors.onPrimary} weight="bold" /> : null}
            <Text style={styles.btnLabel}>{label}</Text>
          </View>
        )}
      </View>
    </Pressable3D>
  );
}

export function SecondaryButton({
  label,
  onPress,
  tone = 'neutral',
}: {
  label: string;
  onPress: () => void;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <Pressable3D onPress={onPress} haptic>
      <View style={[styles.secondaryBtn, tone === 'danger' && styles.secondaryDanger]}>
        <Text style={[styles.secondaryLabel, tone === 'danger' && { color: colors.dangerRed }]}>
          {label}
        </Text>
      </View>
    </Pressable3D>
  );
}

/** Tertiary / text button — link-styled, no fill. */
export function TextButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.textBtn}>
      <Text style={styles.textBtnLabel}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  error,
  helper,
  ...props
}: TextInputProps & { label: string; error?: string; helper?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.inkTertiary}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
          props.multiline ? styles.inputMultiline : null,
        ]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: sizing.buttonPrimary,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btnLabel: { ...typography.bodyL, fontWeight: '700', color: colors.onPrimary, letterSpacing: 0.2 },
  secondaryBtn: {
    height: sizing.buttonSecondary,
    borderRadius: radius.button,
    ...border.default,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryDanger: { borderColor: '#F2C0C0', backgroundColor: colors.dangerSurface },
  secondaryLabel: { ...typography.bodyM, fontWeight: '700', color: colors.ink },
  textBtn: { alignSelf: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  textBtnLabel: { ...typography.bodyM, fontWeight: '700', color: colors.link },
  fieldWrap: { gap: spacing.xs },
  fieldLabel: { ...typography.label, color: colors.inkSecondary },
  input: {
    height: sizing.input,
    ...border.default,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surfaceSunken,
  },
  inputFocused: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: colors.surface },
  inputMultiline: { height: 96, paddingTop: spacing.md, textAlignVertical: 'top' },
  inputError: { borderColor: colors.dangerRed, borderWidth: 1.5 },
  errorText: { ...typography.caption, color: colors.dangerRed },
  helperText: { ...typography.caption, color: colors.inkTertiary },
});
