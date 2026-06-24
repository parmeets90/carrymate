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
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, radius, typography, sizing, gradients, shadows } from '@/theme';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

/** Pressable with a subtle scale-down on press (premium tactile feel). */
export function Pressable3D({
  onPress,
  disabled,
  children,
  style,
}: {
  onPress?: () => void;
  disabled?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}

type ButtonTone = 'sky' | 'gold' | 'mint' | 'danger';

const BUTTON_GRADIENT: Record<ButtonTone, readonly [string, string]> = {
  sky: gradients.sky,
  gold: gradients.gold,
  mint: gradients.mint,
  danger: ['#F0584F', '#D8392F'],
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
  /** Semantic CTA color: sky (default), gold=trust, mint=money, danger. */
  tone?: ButtonTone;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable3D onPress={onPress} disabled={isDisabled}>
      <LinearGradient
        colors={isDisabled ? ['#AEB6C2', '#AEB6C2'] : [...BUTTON_GRADIENT[tone]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btn, !isDisabled && shadows.sm]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <View style={styles.btnRow}>
            {icon ? <Icon name={icon} size={18} color={colors.white} weight="bold" /> : null}
            <Text style={styles.btnLabel}>{label}</Text>
          </View>
        )}
      </LinearGradient>
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
    <Pressable3D onPress={onPress}>
      <View style={[styles.secondaryBtn, tone === 'danger' && styles.secondaryDanger]}>
        <Text style={[styles.secondaryLabel, tone === 'danger' && { color: colors.dangerRed }]}>
          {label}
        </Text>
      </View>
    </Pressable3D>
  );
}

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textHint}
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
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  btnLabel: { ...typography.bodyL, fontWeight: '700', color: colors.white, letterSpacing: 0.2 },
  secondaryBtn: {
    height: sizing.buttonSecondary,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryDanger: { borderColor: '#F2C0C0', backgroundColor: colors.dangerLight },
  secondaryLabel: { ...typography.bodyM, fontWeight: '700', color: colors.textPrimary },
  fieldWrap: { gap: spacing.xs },
  fieldLabel: { ...typography.label, color: colors.textSecondary },
  input: {
    height: sizing.input,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.bgCard,
  },
  inputFocused: { borderColor: colors.skyBlue, backgroundColor: colors.white, ...shadows.sm },
  inputMultiline: { height: 96, paddingTop: spacing.md, textAlignVertical: 'top' },
  inputError: { borderColor: colors.dangerRed },
  errorText: { ...typography.caption, color: colors.dangerRed },
});
