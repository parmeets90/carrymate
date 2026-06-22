import {
  Text,
  TextInput,
  Pressable,
  View,
  ActivityIndicator,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { colors, spacing, radius, typography, sizing } from '@/theme';

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        pressed && styles.btnPressed,
        isDisabled && styles.btnDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.btnLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textHint}
        style={[styles.input, error ? styles.inputError : null]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.skyBlue,
    height: sizing.buttonPrimary,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: { opacity: 0.9 },
  btnDisabled: { opacity: 0.5 },
  btnLabel: { ...typography.bodyL, fontWeight: '600', color: colors.white },
  fieldWrap: { gap: spacing.xs },
  fieldLabel: { ...typography.label, color: colors.textSecondary },
  input: {
    height: sizing.input,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.bgSecondary,
  },
  inputError: { borderColor: colors.dangerRed },
  errorText: { ...typography.caption, color: colors.dangerRed },
});
