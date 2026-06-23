import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, StyleSheet, AccessibilityInfo, type StyleProp, type ViewStyle } from 'react-native';
import { BrandMark } from './BrandMark';

/**
 * Brand loader — the CarryMate route-mark flipping like a coin on a flat surface.
 * Spins continuously around its vertical axis (rotateY + perspective) so the disc
 * turns edge-on and back. Used in place of ActivityIndicator across the app.
 * Honours reduce-motion: shows a static mark instead of spinning.
 */
export function BrandLoader({
  size = 44,
  style,
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const spin = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => mounted && setReduceMotion(v));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, spin]);

  const rotateY = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[styles.center, style]}>
      <Animated.View style={{ transform: [{ perspective: size * 18 }, { rotateY }] }}>
        <BrandMark size={size} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
