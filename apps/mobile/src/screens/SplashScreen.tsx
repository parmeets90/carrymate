import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, AccessibilityInfo } from 'react-native';
import { AirplaneTilt, Gift } from 'phosphor-react-native';
import { colors, typography, spacing } from '@/theme';

const { width, height } = Dimensions.get('window');

const PLANE_Y = height * 0.4; // flight path, just above the wordmark
const PLANE_SIZE = 56;
const GIFT_SIZE = 64;

/**
 * Splash story (native, no Lottie):
 *  1. A plane flies left → right across the screen.
 *  2. As it crosses the centre it drops a gift, which settles then fades away.
 *  3. The CarryMate wordmark + tagline fade in. Then onDone().
 * Honours reduce-motion: skips straight to the wordmark.
 */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const planeX = useRef(new Animated.Value(0)).current; // 0 → 1 across the screen
  const giftO = useRef(new Animated.Value(0)).current;
  const giftDrop = useRef(new Animated.Value(-60)).current;
  const giftScale = useRef(new Animated.Value(0.6)).current;
  const logoO = useRef(new Animated.Value(0)).current;
  const logoS = useRef(new Animated.Value(0.85)).current;
  const tagO = useRef(new Animated.Value(0)).current;
  const finished = useRef(false);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  const done = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion === null) return;

    if (reduceMotion) {
      logoO.setValue(1);
      logoS.setValue(1);
      tagO.setValue(1);
      const t = setTimeout(done, 1400);
      return () => clearTimeout(t);
    }

    const plane = Animated.timing(planeX, {
      toValue: 1,
      duration: 2200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });

    // Gift drops as the plane crosses the centre (~mid-flight), settles, then fades.
    const gift = Animated.sequence([
      Animated.delay(950),
      Animated.parallel([
        Animated.timing(giftO, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(giftScale, { toValue: 1, duration: 420, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
        Animated.timing(giftDrop, { toValue: 0, duration: 520, easing: Easing.bounce, useNativeDriver: true }),
      ]),
      Animated.delay(420),
      Animated.parallel([
        Animated.timing(giftO, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(giftScale, { toValue: 0.7, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    ]);

    // Wordmark reveals once the gift has dispersed.
    const wordmark = Animated.sequence([
      Animated.delay(2150),
      Animated.parallel([
        Animated.timing(logoO, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(logoS, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
      ]),
      Animated.timing(tagO, { toValue: 1, duration: 380, delay: 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);

    const all = Animated.parallel([plane, gift, wordmark]);
    all.start();

    const safety = setTimeout(done, 3500);
    return () => {
      all.stop();
      clearTimeout(safety);
    };
  }, [reduceMotion]);

  const planeTranslate = planeX.interpolate({
    inputRange: [0, 1],
    outputRange: [-PLANE_SIZE - 40, width + 40],
  });
  // A gentle dip as it passes the centre.
  const planeLift = planeX.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 14, 0],
  });

  if (reduceMotion === null) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      {/* Plane */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.plane,
          { transform: [{ translateX: planeTranslate }, { translateY: planeLift }] },
        ]}
      >
        <AirplaneTilt size={PLANE_SIZE} color={colors.skyBlue} weight="fill" />
      </Animated.View>

      {/* Gift dropped at centre */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.gift,
          { opacity: giftO, transform: [{ translateY: giftDrop }, { scale: giftScale }] },
        ]}
      >
        <Gift size={GIFT_SIZE} color={colors.goldPrimary} weight="fill" />
      </Animated.View>

      {/* Wordmark */}
      <View style={styles.overlay} pointerEvents="none">
        <Animated.View style={{ opacity: logoO, transform: [{ scale: logoS }], alignItems: 'center' }}>
          <Text style={styles.wordmark}>CarryMate</Text>
          <Animated.Text style={[styles.tagline, { opacity: tagO }]}>
            Delivered Through Trusted Travelers
          </Animated.Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  plane: {
    position: 'absolute',
    top: PLANE_Y,
    left: 0,
  },
  gift: {
    position: 'absolute',
    top: height * 0.5 - GIFT_SIZE / 2,
    left: width / 2 - GIFT_SIZE / 2,
  },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  wordmark: {
    fontFamily: typography.display.fontFamily,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.navyDark,
  },
  tagline: {
    fontFamily: typography.bodyM.fontFamily,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    letterSpacing: 0.2,
    maxWidth: width * 0.8,
    textAlign: 'center',
  },
});
