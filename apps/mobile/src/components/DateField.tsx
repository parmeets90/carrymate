import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { Icon } from './Icon';

/** Format a Date as the API's YYYY-MM-DD (local, no timezone shift). */
function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYMD(s?: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function pretty(s?: string): string | null {
  const d = parseYMD(s);
  if (!d) return null;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * A tappable date field backed by the native picker. Emits YYYY-MM-DD so it's a
 * drop-in replacement for the old free-text date inputs.
 */
export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
  minimumDate,
  maximumDate,
  error,
}: {
  label: string;
  value: string;
  onChange: (ymd: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseYMD(value);
  const display = pretty(value);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    // Android fires once and closes; iOS stays open (spinner) until dismissed.
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'set' && date) onChange(toYMD(date));
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.box, error ? styles.boxError : null]}
      >
        <Text style={[styles.value, !display && styles.placeholder]}>{display ?? placeholder}</Text>
        <Icon name="calendar" size={18} color={colors.textHint} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {open && (
        <DateTimePicker
          value={selected ?? minimumDate ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      )}
      {open && Platform.OS === 'ios' && (
        <Pressable onPress={() => setOpen(false)} style={styles.done}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { ...typography.label, color: colors.textSecondary },
  box: {
    height: sizing.input,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgCard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boxError: { borderColor: colors.dangerRed },
  value: { fontSize: 16, color: colors.textPrimary },
  placeholder: { color: colors.textHint },
  error: { ...typography.caption, color: colors.dangerRed },
  done: { alignSelf: 'flex-end', paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  doneText: { ...typography.bodyM, color: colors.skyBlue, fontWeight: '700' },
});
