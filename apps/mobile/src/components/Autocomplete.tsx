import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, type TextInputProps } from 'react-native';
import { colors, spacing, radius, typography, sizing } from '@/theme';

export interface Suggestion {
  /** What gets written into the field when picked. */
  value: string;
  /** Primary line shown in the dropdown. */
  label: string;
  /** Optional supporting line (e.g. airport name). */
  hint?: string;
  /** Free-text matched against the query in addition to label. */
  keywords?: string;
}

interface Props extends Omit<TextInputProps, 'onChange'> {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  suggestions: Suggestion[];
  onPick: (s: Suggestion) => void;
  error?: string;
  maxResults?: number;
}

/**
 * A text field with an inline suggestion dropdown. Filters `suggestions` by the
 * current text (label + keywords), shows up to `maxResults` while focused.
 * The dropdown floats over following content so it doesn't shift the layout.
 */
export function Autocomplete({
  label,
  value,
  onChangeText,
  suggestions,
  onPick,
  error,
  maxResults = 6,
  ...props
}: Props) {
  const [focused, setFocused] = useState(false);

  const q = value.trim().toLowerCase();
  const matches = q
    ? suggestions
        .filter((s) => `${s.label} ${s.keywords ?? ''}`.toLowerCase().includes(q))
        // Prefer prefix matches, then alphabetical.
        .sort((a, b) => {
          const ap = a.label.toLowerCase().startsWith(q) ? 0 : 1;
          const bp = b.label.toLowerCase().startsWith(q) ? 0 : 1;
          return ap - bp || a.label.localeCompare(b.label);
        })
        .slice(0, maxResults)
    : [];

  // Hide the list once the text exactly equals the chosen value.
  const exact = matches.length === 1 && matches[0]!.value.toLowerCase() === q;
  const open = focused && matches.length > 0 && !exact;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textHint}
        style={[styles.input, focused && styles.inputFocused, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        // Delay blur so a tap on a suggestion registers before the list unmounts.
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        autoCorrect={false}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {open && (
        <View style={styles.dropdown}>
          {matches.map((s, i) => (
            <Pressable
              key={`${s.value}-${i}`}
              style={[styles.row, i > 0 && styles.rowBorder]}
              onPress={() => {
                onPick(s);
                setFocused(false);
              }}
            >
              <Text style={styles.rowLabel}>{s.label}</Text>
              {s.hint ? <Text style={styles.rowHint}>{s.hint}</Text> : null}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, position: 'relative', zIndex: 10 },
  label: { ...typography.label, color: colors.textSecondary },
  input: {
    height: sizing.input,
    borderRadius: radius.input,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.md,
    ...typography.bodyL,
    color: colors.textPrimary,
  },
  inputFocused: { borderColor: colors.skyBlue },
  inputError: { borderColor: colors.dangerRed },
  errorText: { ...typography.caption, color: colors.dangerRed },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: colors.bgCard,
    borderRadius: radius.input,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 20,
  },
  row: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  rowBorder: { borderTopWidth: 0.5, borderTopColor: colors.borderLight },
  rowLabel: { ...typography.bodyM, color: colors.textPrimary, fontWeight: '600' },
  rowHint: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
});
