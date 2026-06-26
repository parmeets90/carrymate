import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, elevations } from '@/theme';
import { Icon, type IconName } from './Icon';
import { haptics } from '@/lib/haptics';

/**
 * Non-blocking toast (DS v2) — brief success/error/info that needs no decision.
 * Imperative API like AlertHost: call `toast.success(...)` from anywhere; a single
 * <ToastHost/> mounted in App renders it. Auto-dismisses; tap to dismiss early.
 */
type ToastKind = 'success' | 'error' | 'info';
interface ToastOpts {
  kind: ToastKind;
  message: string;
  duration?: number;
}

const META: Record<ToastKind, { icon: IconName; fg: string; bg: string; border: string; haptic: () => void }> = {
  success: { icon: 'check', fg: '#096438', bg: colors.successSurface, border: colors.mintBorder, haptic: haptics.success },
  error: { icon: 'alert', fg: '#921010', bg: colors.dangerSurface, border: '#FF9090', haptic: haptics.error },
  info: { icon: 'bell', fg: colors.primary, bg: colors.primarySurface, border: '#BBD2F4', haptic: haptics.light },
};

let _show: ((o: ToastOpts) => void) | null = null;

export const toast = {
  success: (message: string, duration?: number) => _show?.({ kind: 'success', message, duration }),
  error: (message: string, duration?: number) => _show?.({ kind: 'error', message, duration }),
  info: (message: string, duration?: number) => _show?.({ kind: 'info', message, duration }),
};

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const [opts, setOpts] = useState<ToastOpts | null>(null);
  const y = useRef(new Animated.Value(-80)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    _show = (o) => {
      if (timer.current) clearTimeout(timer.current);
      setOpts(o);
      META[o.kind].haptic();
      Animated.spring(y, { toValue: 0, useNativeDriver: true, friction: 9, tension: 90 }).start();
      timer.current = setTimeout(dismiss, o.duration ?? 3200);
    };
    return () => {
      _show = null;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const dismiss = () => {
    Animated.timing(y, { toValue: -100, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(
      () => setOpts(null),
    );
  };

  if (!opts) return null;
  const m = META[opts.kind];
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + spacing.sm, transform: [{ translateY: y }] }]}
    >
      <Pressable onPress={dismiss} style={[styles.toast, { backgroundColor: m.bg, borderColor: m.border }]}>
        <Icon name={m.icon} size={18} color={m.fg} weight="fill" />
        <Text style={[styles.text, { color: m.fg }]} numberOfLines={2}>
          {opts.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, zIndex: 9999 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...elevations.e2,
  },
  text: { ...typography.bodyM, fontWeight: '600', flex: 1 },
});
