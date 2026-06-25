import { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AuthIllustration, type IllustrationName } from './AuthIllustration';

export interface OnboardingSlide {
  key: string;
  illustration: IllustrationName;
  title: string;
  description: string;
}

/**
 * Auto-sliding onboarding carousel for the auth hero (UI refresh). Paging FlatList
 * + page indicator; advances every few seconds (paused under reduce-motion). Purely
 * presentational — no auth logic here.
 */
export function OnboardingCarousel({ slides }: { slides: OnboardingSlide[] }) {
  const { width } = useWindowDimensions();
  const ref = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || slides.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % slides.length;
        ref.current?.scrollToOffset({ offset: next * width, animated: true });
        return next;
      });
    }, 3800);
    return () => clearInterval(t);
  }, [reduced, slides.length, width]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={ref}
        data={slides}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <AuthIllustration name={item.illustration} size={Math.min(width * 0.58, 230)} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
        )}
      />
      <View style={styles.dots}>
        {slides.map((s, i) => (
          <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm },
  title: {
    ...typography.titleL,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  desc: {
    ...typography.bodyM,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: spacing.lg },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.borderLight },
  dotActive: { width: 20, backgroundColor: colors.skyBlue },
});
