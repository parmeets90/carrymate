import { View, Text, ScrollView, StyleSheet, StatusBar, Pressable, type ViewStyle, type StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import type { ReactNode } from 'react';
import { colors, spacing, typography, sizing, gradients } from '@/theme';

/** Plain screen container: app background + safe-area top + horizontal padding. */
export function Screen({
  children,
  scroll,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + spacing.lg };
  if (scroll) {
    return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, pad, contentStyle]}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgApp} />
        {children}
      </ScrollView>
    );
  }
  return (
    <View style={[styles.flex, styles.padX, pad, contentStyle]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgApp} />
      {children}
    </View>
  );
}

/** Large title + optional subtitle, used at the top of content screens. */
export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/** Immersive gradient hero header (auth / onboarding / home). */
export function GradientHero({
  eyebrow,
  title,
  subtitle,
  onBack,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[...gradients.brand]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop: insets.top + spacing.md }]}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={styles.back}>
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
      ) : null}
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.heroTitle}>{title}</Text>
      {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgApp },
  padX: { paddingHorizontal: sizing.screenPaddingX },
  scrollContent: { paddingHorizontal: sizing.screenPaddingX, paddingBottom: spacing['3xl'], gap: spacing.md },
  header: { gap: 6, marginBottom: spacing.xs },
  title: { ...typography.display, color: colors.textPrimary },
  subtitle: { ...typography.bodyM, color: colors.textSecondary },
  hero: {
    paddingHorizontal: sizing.screenPaddingX,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radiusLg(),
    borderBottomRightRadius: radiusLg(),
  },
  back: { marginBottom: spacing.sm },
  backChevron: { color: colors.white, fontSize: 34, lineHeight: 34, marginLeft: -4 },
  eyebrow: {
    ...typography.label,
    color: '#9FC6EC',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  heroTitle: { ...typography.display, color: colors.white, fontSize: 30 },
  heroSubtitle: { ...typography.bodyL, color: 'rgba(255,255,255,0.78)', marginTop: spacing.sm, lineHeight: 24 },
});

function radiusLg(): number {
  return 28;
}
