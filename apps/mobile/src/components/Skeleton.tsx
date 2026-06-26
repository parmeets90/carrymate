import { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { colors, spacing, radius } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const BASE = '#E6E9EF';

/** A single shimmering placeholder block (DS v2). Reduce-motion → static. */
export function Skeleton({
  width = '100%',
  height = 14,
  rounded = 8,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const o = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (reduced) {
      o.setValue(0.75);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(o, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(o, { toValue: 0.6, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, o]);

  return <Animated.View style={[{ width, height, borderRadius: rounded, backgroundColor: BASE, opacity: o }, style]} />;
}

/** A few text lines; the last is shorter for realism. */
export function SkeletonText({ lines = 2, width = '100%' }: { lines?: number; width?: DimensionValue }) {
  return (
    <View style={{ gap: spacing.sm }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={i === lines - 1 ? '55%' : width} />
      ))}
    </View>
  );
}

/** A card-shaped placeholder matching the list-row layout. */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Skeleton width={44} height={44} rounded={radius.avatar} />
        <View style={{ flex: 1, gap: spacing.sm }}>
          <Skeleton height={14} width="65%" />
          <Skeleton height={11} width="40%" />
        </View>
        <Skeleton width={56} height={22} rounded={radius.chip} />
      </View>
      <Skeleton height={12} width="80%" style={{ marginTop: spacing.md }} />
    </View>
  );
}

/** A vertical stack of skeleton cards for list loading states. */
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: spacing.md, paddingVertical: spacing.lg }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    padding: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
