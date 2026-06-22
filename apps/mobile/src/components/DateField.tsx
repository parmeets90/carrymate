import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { colors, spacing, radius, typography, sizing, shadows } from '@/theme';
import { Icon } from './Icon';

/**
 * Pure-JS date field + calendar (no native module → can't crash on autolinking).
 * Emits YYYY-MM-DD so it's a drop-in for the old free-text date inputs.
 */

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function parseYMD(s?: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function pretty(s?: string): string | null {
  const d = parseYMD(s);
  return d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
}
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

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
  const selected = parseYMD(value);
  const [open, setOpen] = useState(false);
  // The month currently shown in the calendar.
  const [view, setView] = useState(() => selected ?? minimumDate ?? new Date());

  const display = pretty(value);
  const min = minimumDate ? startOfDay(minimumDate) : null;
  const max = maximumDate ? startOfDay(maximumDate) : null;

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const disabled = (d: Date) => (min && d < min) || (max && d > max);
  const isSelected = (d: Date) => selected && toYMD(d) === toYMD(selected);

  const goMonth = (delta: number) => setView(new Date(year, month + delta, 1));
  const openPicker = () => {
    setView(selected ?? minimumDate ?? new Date());
    setOpen(true);
  };
  const choose = (d: Date) => {
    onChange(toYMD(d));
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={openPicker} style={[styles.box, error ? styles.boxError : null]}>
        <Text style={[styles.value, !display && styles.placeholder]}>{display ?? placeholder}</Text>
        <Icon name="calendar" size={18} color={colors.textHint} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.headerRow}>
              <Pressable onPress={() => goMonth(-1)} hitSlop={10} style={styles.navBtn}>
                <Text style={styles.nav}>‹</Text>
              </Pressable>
              <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
              <Pressable onPress={() => goMonth(1)} hitSlop={10} style={styles.navBtn}>
                <Text style={styles.nav}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((w, i) => (
                <Text key={i} style={styles.weekday}>{w}</Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((d, i) => {
                if (!d) return <View key={i} style={styles.cell} />;
                const off = disabled(d);
                const sel = isSelected(d);
                return (
                  <Pressable
                    key={i}
                    disabled={!!off}
                    onPress={() => choose(d)}
                    style={[styles.cell, sel && styles.cellSelected]}
                  >
                    <Text style={[styles.day, off && styles.dayDisabled, sel && styles.daySelected]}>
                      {d.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable onPress={() => setOpen(false)} style={styles.close}>
              <Text style={styles.closeText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const CELL = '14.2857%' as const; // 100/7

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
  backdrop: { flex: 1, backgroundColor: 'rgba(15,22,41,0.45)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.bgCard, borderRadius: radius.sheet, padding: spacing.lg, ...shadows.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: colors.bgSecondary },
  nav: { fontSize: 24, color: colors.navyMid, lineHeight: 26 },
  monthLabel: { ...typography.titleM, fontWeight: '700', color: colors.textPrimary },
  weekRow: { flexDirection: 'row' },
  weekday: { width: CELL, textAlign: 'center', ...typography.caption, color: colors.textHint, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xs },
  cell: { width: CELL, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  cellSelected: { backgroundColor: colors.skyBlue },
  day: { ...typography.bodyM, color: colors.textPrimary },
  dayDisabled: { color: colors.borderLight },
  daySelected: { color: colors.white, fontWeight: '800' },
  close: { marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.sm },
  closeText: { ...typography.bodyM, color: colors.textSecondary, fontWeight: '700' },
});
