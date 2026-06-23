import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors, typography, spacing } from '@/theme';
import { Icon } from '@/components/Icon';
import splash from '@/assets/lottie/splash.json';

const { width } = Dimensions.get('window');

/**
 * Premium splash: the Lottie drives the illustrated journey (Scenes 1–4 + success
 * glow); the CarryMate wordmark + tagline + trust badge animate in as a crisp
 * native overlay during Scene 5. Plays once, then calls onDone.
 */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const logoO = useRef(new Animated.Value(0)).current;
  const logoS = useRef(new Animated.Value(0.82)).current;
  const tagO = useRef(new Animated.Value(0)).current;
  const badgeS = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const finished = useRef(false);

  const done = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  useEffect(() => {
    // Reveal the logo lockup during the final beat (~6.0s in).
    const seq = Animated.sequence([
      Animated.delay(6000),
      Animated.parallel([
        Animated.timing(logoO, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(logoS, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
      ]),
      Animated.timing(tagO, { toValue: 1, duration: 380, delay: 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(badgeS, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
    ]);
    seq.start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    // Start the trust-badge pulse slightly after it pops in.
    const t = setTimeout(() => loop.start(), 7000);

    // Safety net in case onAnimationFinish doesn't fire.
    const safety = setTimeout(done, 8600);
    return () => {
      seq.stop();
      loop.stop();
      clearTimeout(t);
      clearTimeout(safety);
    };
  }, []);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <View style={styles.container}>
      <LottieView
        source={splash}
        autoPlay
        loop={false}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        onAnimationFinish={done}
      />

      <View style={styles.overlay} pointerEvents="none">
        <Animated.View style={{ opacity: logoO, transform: [{ scale: logoS }], alignItems: 'center' }}>
          <View style={styles.badgeWrap}>
            <Animated.View style={[styles.pulseRing, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
            <Animated.View style={[styles.badge, { transform: [{ scale: badgeS }] }]}>
              <Icon name="verified" size={26} color={colors.white} weight="fill" />
            </Animated.View>
          </View>
          <Text style={styles.wordmark}>CarryMate</Text>
          <Animated.Text style={[styles.tagline, { opacity: tagO }]}>
            Connecting Travelers &amp; Deliveries
          </Animated.Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  badgeWrap: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  pulseRing: { position: 'absolute', width: 64, height: 64, borderRadius: 32, backgroundColor: colors.mintPrimary },
  badge: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.mintPrimary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.mintPrimary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  wordmark: {
    fontFamily: typography.display.fontFamily,
    fontSize: 40, fontWeight: '700', letterSpacing: -0.5,
    color: colors.navyDark,
  },
  tagline: {
    fontFamily: typography.bodyM.fontFamily,
    fontSize: 15, color: colors.textSecondary, marginTop: spacing.sm, letterSpacing: 0.2,
    maxWidth: width * 0.8, textAlign: 'center',
  },
});
