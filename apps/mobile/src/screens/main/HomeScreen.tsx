import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { useAuth } from '@/store/auth';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: spacing['3xl'] }}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.name}>{user?.fullName ?? 'there'}</Text>
        </View>
        <View style={styles.verified}>
          <Text style={styles.verifiedText}>✓ Verified</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>You're all set</Text>
        <Text style={styles.cardBody}>
          Your identity is verified. The marketplace — posting requests and finding travelers —
          arrives in the next update.
        </Text>
        <View style={styles.pillRow}>
          <Text style={styles.pill}>India → UAE</Text>
          <Text style={styles.pill}>{user?.role}</Text>
        </View>
      </View>

      <Pressable onPress={signOut} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
    paddingHorizontal: sizing.screenPaddingX,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: { ...typography.bodyM, color: colors.textSecondary },
  name: { ...typography.titleL, color: colors.textPrimary },
  verified: {
    backgroundColor: colors.mintLight,
    borderWidth: 0.5,
    borderColor: colors.mintBorder,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.chip,
  },
  verifiedText: { ...typography.caption, fontWeight: '700', color: '#096438' },
  card: {
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
  },
  cardTitle: { ...typography.titleM, color: colors.textPrimary },
  cardBody: { ...typography.bodyM, color: colors.textSecondary },
  pillRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  pill: {
    backgroundColor: colors.bgSecondary,
    color: colors.textSecondary,
    ...typography.label,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.chip,
    overflow: 'hidden',
  },
  signOut: { marginTop: spacing.xl, alignItems: 'center' },
  signOutText: { ...typography.bodyM, color: colors.textSecondary },
});
