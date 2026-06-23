import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors, typography, spacing } from '@/theme';
import splash from '@/assets/lottie/splash.json';

const { width, height } = Dimensions.get('window');

/**
 * Premium splash: the Lottie drives the illustrated journey (Scenes 1–4 + success
 * glow); the CarryMate wordmark + tagline + trust badge animate in as a crisp
 * native overlay during Scene 5. Plays once, then calls onDone.
 */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const logoO = useRef(new Animated.Value(0)).current;
  const logoS = useRef(new Animated.Value(0.82)).current;
  const tagO = useRef(new Animated.Value(0)).current;
  const finished = useRef(false);

  const done = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  useEffect(() => {
    // Reveal the wordmark lockup as the route settles into the logo (~6.0s in).
    const seq = Animated.sequence([
      Animated.delay(6000),
      Animated.parallel([
        Animated.timing(logoO, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(logoS, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
      ]),
      Animated.timing(tagO, { toValue: 1, duration: 400, delay: 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);
    seq.start();

    // Safety net in case onAnimationFinish doesn't fire.
    const safety = setTimeout(done, 7600);
    return () => {
      seq.stop();
      clearTimeout(safety);
    };
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={splash}
        autoPlay
        loop={false}
        resizeMode="contain"
        style={StyleSheet.absoluteFill}
        onAnimationFinish={done}
      />

      {/* Wordmark sits below the Lottie route mark (which centers ~40% height). */}
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
  // Push the wordmark below the route mark (Lottie centers it ~40% of height).
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingTop: height * 0.34 },
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
