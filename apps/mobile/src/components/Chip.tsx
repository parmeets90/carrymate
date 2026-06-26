import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '@/theme';
import { Icon, type IconName } from './Icon';
import { haptics } from '@/lib/haptics';

/**
 * Selectable pill (DS v2) — tags, filters, single/multi-pick. Selected uses the
 * primary tint; unselected is a flat hairline pill. Replaces the ad-hoc inline
 * "Pills" scattered across the forms.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress?.();
      }}
      hitSlop={6}
      style={[styles.chip, selected ? styles.selected : styles.idle]}
    >
      {icon ? <Icon name={icon} size={14} color={selected ? colors.primary : colors.inkSecondary} weight={selected ? 'fill' : 'regular'} /> : null}
      <Text style={[styles.label, selected ? styles.labelSel : styles.labelIdle]}>{label}</Text>
    </Pressable>
  );
}

/** Read-only chip row container. */
export function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.chip,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  idle: { backgroundColor: colors.surface, borderColor: colors.hairline },
  selected: { backgroundColor: colors.primarySurface, borderColor: '#BBD2F4' },
  label: { ...typography.bodyM, fontWeight: '600' },
  labelIdle: { color: colors.inkSecondary },
  labelSel: { color: colors.primary },
});
