import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { colors, spacing, typography, radius } from '@/theme';
import { Icon } from './Icon';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Motion primitives from the CLAUDE.md Animation Spec, built on RN's core
 * Animated API (UI-thread transforms via useNativeDriver). Each honors
 * useReducedMotion() and falls back to a static state.
 */

/** Matching/“live” pulse — opacity 0.4→1 loop, ~1.2s (Animation Spec). */
export function Pulse({ size = 8, color = colors.mintPrimary }: { size?: number; color?: string }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.4, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, v]);
  return <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: v }} />;
}

/** In-transit plane gliding left→right on a track, with reassurance copy (UX rule 6). */
export function PlaneTrack({ label }: { label: string }) {
  const reduced = useReducedMotion();
  const x = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (reduced || !width) return;
    const loop = Animated.loop(
      Animated.timing(x, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, width, x]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(0, width - 22)] });

  return (
    <View style={styles.transit}>
      <View style={styles.track} onLayout={onLayout}>
        <View style={styles.dashes} />
        <Animated.View style={{ transform: [{ translateX }] }}>
          <Icon name="inTransit" size={18} color={colors.cautionAmber} weight="fill" />
        </Animated.View>
      </View>
      <Text style={styles.transitLabel}>{label}</Text>
    </View>
  );
}

/** Success entrance — scale 0.8→1 spring + fade (KYC milestone / delivery success). */
export function SuccessPop({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const s = useRef(new Animated.Value(reduced ? 1 : 0.8)).current;
  const o = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) return;
    Animated.parallel([
      Animated.spring(s, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      Animated.timing(o, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [reduced, s, o]);
  return <Animated.View style={{ opacity: o, transform: [{ scale: s }] }}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  transit: { marginTop: spacing.md, backgroundColor: colors.cautionLight, borderRadius: radius.input, padding: spacing.sm, gap: 6 },
  track: { height: 22, justifyContent: 'center' },
  dashes: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#FFE066', borderRadius: 1 },
  transitLabel: { ...typography.caption, color: '#946A00', fontWeight: '600' },
});
