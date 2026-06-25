import { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '@/theme';

/**
 * Premium in-app alert — a themed replacement for React Native's OS-styled
 * Alert.alert. Mount <AlertHost/> once at the app root; call the exported
 * `Alert.alert(title, message?, buttons?)` from anywhere (same signature, so
 * it's a drop-in). Renders a single dialog at a time.
 */
export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}
interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

let _show: ((o: AlertOptions) => void) | null = null;

function appAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (_show) _show({ title, message, buttons });
}

/** Drop-in for `import { Alert } from 'react-native'`. */
export const Alert = { alert: appAlert };

export function AlertHost(): React.JSX.Element {
  const [opts, setOpts] = useState<AlertOptions | null>(null);
  const [visible, setVisible] = useState(false);
  const o = useRef(new Animated.Value(0)).current;
  const s = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    _show = (next) => {
      setOpts(next);
      setVisible(true);
    };
    return () => {
      _show = null;
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    o.setValue(0);
    s.setValue(0.92);
    Animated.parallel([
      Animated.timing(o, { toValue: 1, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(s, { toValue: 1, friction: 7, tension: 120, useNativeDriver: true }),
    ]).start();
  }, [visible, o, s]);

  const close = (cb?: () => void) => {
    Animated.timing(o, { toValue: 0, duration: 130, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      setVisible(false);
      setOpts(null);
      cb?.();
    });
  };

  const buttons: AlertButton[] = opts?.buttons?.length ? opts.buttons : [{ text: 'OK' }];
  // Only place two buttons side-by-side when both labels are short enough to fit a
  // half-width button on one line; otherwise stack them (e.g. "Delete account").
  const sideBySide = buttons.length === 2 && buttons.every((b) => b.text.length <= 10);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => close()} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: o }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} />
        <Animated.View style={[styles.card, { opacity: o, transform: [{ scale: s }] }]}>
          {opts?.title ? <Text style={styles.title}>{opts.title}</Text> : null}
          {opts?.message ? <Text style={styles.message}>{opts.message}</Text> : null}

          <View style={[styles.actions, sideBySide ? styles.row : styles.col]}>
            {buttons.map((b, i) => {
              const isPrimary = (b.style ?? 'default') === 'default';
              const isDestructive = b.style === 'destructive';
              return (
                <Pressable
                  key={`${b.text}-${i}`}
                  onPress={() => close(b.onPress)}
                  style={[
                    styles.btn,
                    sideBySide && styles.btnFlex,
                    isPrimary && styles.btnPrimary,
                    isDestructive && styles.btnDestructive,
                    !isPrimary && !isDestructive && styles.btnGhost,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.btnText,
                      isPrimary && styles.btnTextPrimary,
                      isDestructive && styles.btnTextDestructive,
                      !isPrimary && !isDestructive && styles.btnTextGhost,
                    ]}
                  >
                    {b.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,22,41,0.55)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  card: { width: '100%', maxWidth: 360, backgroundColor: colors.bgCard, borderRadius: radius.sheet, padding: spacing.xl, gap: spacing.sm, ...shadows.lg },
  title: { ...typography.titleM, fontWeight: '700', color: colors.textPrimary },
  message: { ...typography.bodyM, color: colors.textSecondary, lineHeight: 21 },
  actions: { marginTop: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm },
  col: { flexDirection: 'column', gap: spacing.sm },
  btn: { height: 46, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  btnFlex: { flex: 1 },
  btnPrimary: { backgroundColor: colors.skyBlue },
  btnDestructive: { backgroundColor: colors.dangerLight, borderWidth: 0.5, borderColor: '#F2C0C0' },
  btnGhost: { backgroundColor: colors.bgSecondary },
  btnText: { ...typography.bodyL, fontWeight: '700' },
  btnTextPrimary: { color: colors.white },
  btnTextDestructive: { color: colors.dangerRed },
  btnTextGhost: { color: colors.textPrimary },
});
