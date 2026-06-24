import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, typography, radius, gradients } from '@/theme';
import { Icon, type IconName } from './Icon';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** Gradient circle with initials. */
export function Avatar({ name, size = 44 }: { name?: string | null; size?: number }) {
  const initials = (name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <LinearGradient
      colors={[...gradients.brand]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ ...typography.bodyM, color: colors.white, fontWeight: '700' }}>{initials}</Text>
    </LinearGradient>
  );
}

const STEPS = ['MATCHED', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED'];
const LABELS = ['Matched', 'In transit', 'Delivered', 'Confirmed'];

/** The current step's node — a mint dot with a softly pulsing halo. */
function ActiveNode() {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, v]);
  return (
    <View style={[styles.node, styles.nodeDone, styles.nodeActiveRing]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] }) }],
          },
        ]}
      />
      <Icon name="check" size={13} color={colors.white} weight="bold" />
    </View>
  );
}

/** Premium 4-step delivery timeline driven by request status. */
export function Timeline({ status }: { status: string }) {
  const idx = STEPS.indexOf(status);
  return (
    <View style={styles.timeline}>
      {STEPS.map((s, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <View key={s} style={styles.col}>
            {i > 0 && <View style={[styles.line, done && styles.lineDone]} />}
            {active ? (
              <ActiveNode />
            ) : (
              <View style={[styles.node, done && styles.nodeDone]}>
                {done && <Icon name="check" size={12} color={colors.white} weight="bold" />}
              </View>
            )}
            <Text style={[styles.label, done && styles.labelDone, active && styles.labelActive]}>
              {LABELS[i]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function EmptyState({
  icon = 'star',
  title,
  body,
}: {
  icon?: IconName;
  title: string;
  body?: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={28} color={colors.skyBlue} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: { flexDirection: 'row', marginTop: spacing.md },
  col: { flex: 1, alignItems: 'center' },
  line: {
    position: 'absolute',
    top: 11,
    right: '50%',
    width: '100%',
    height: 2,
    backgroundColor: colors.borderLight,
  },
  lineDone: { backgroundColor: colors.mintPrimary },
  node: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.bgApp,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: { backgroundColor: colors.mintPrimary, borderColor: colors.mintPrimary },
  nodeActiveRing: { borderColor: '#0B8C57' },
  halo: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.mintPrimary,
  },
  label: { ...typography.caption, color: colors.textHint, marginTop: 6 },
  labelDone: { color: colors.textPrimary, fontWeight: '600' },
  labelActive: { color: '#096438', fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: spacing['3xl'], paddingHorizontal: spacing.xl, gap: spacing.sm },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.skyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGlyph: { fontSize: 26, color: colors.skyBlue },
  emptyTitle: { ...typography.titleM, color: colors.textPrimary, textAlign: 'center' },
  emptyBody: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 },
});
