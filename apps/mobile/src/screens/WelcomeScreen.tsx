import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '@/theme';

/**
 * Phase 0 placeholder home. Replaced by the real auth/onboarding flow in Phase 1.
 * Built to the design-system tokens so it sets the visual bar from day one.
 */
export function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.brandRow}>
        <View style={styles.logo}>
          <Text style={styles.logoGlyph}>✈</Text>
        </View>
        <Text style={styles.brand}>CarryMate</Text>
      </View>

      <View style={styles.hero}>
        <Text style={typography.h1}>Send anything,{'\n'}with someone flying there.</Text>
        <Text style={[typography.muted, styles.subtitle]}>
          Cross-border delivery along travelers' existing routes — cheaper and faster than courier,
          with trust built into every step.
        </Text>

        <View style={styles.pillRow}>
          <Text style={styles.pill}>India → UAE</Text>
          <Text style={styles.pill}>Verified travelers</Text>
          <Text style={styles.pill}>Escrow protected</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.primaryBtn} android_ripple={{ color: colors.primaryDark }}>
          <Text style={typography.button}>Get started</Text>
        </Pressable>
        <Text style={styles.note}>Phase 0 scaffold · auth & onboarding arrive in Phase 1</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyph: { color: colors.white, fontSize: 20 },
  brand: { ...typography.h2, fontSize: 20 },
  hero: { gap: spacing.md },
  subtitle: { lineHeight: 22, marginTop: spacing.xs },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  pill: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  footer: { gap: spacing.md },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  note: { ...typography.muted, fontSize: 12, textAlign: 'center' },
});
