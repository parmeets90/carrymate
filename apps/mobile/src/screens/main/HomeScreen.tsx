import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '@/theme';
import { useAuth } from '@/store/auth';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: spacing.xxl }}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={typography.muted}>Welcome back</Text>
          <Text style={typography.h2}>{user?.fullName ?? 'there'}</Text>
        </View>
        <View style={styles.verified}>
          <Text style={styles.verifiedText}>✓ Verified</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>You're all set</Text>
        <Text style={typography.muted}>
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
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  verified: {
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  verifiedText: { color: '#166534', fontWeight: '700', fontSize: 13 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  cardTitle: { ...typography.body, fontWeight: '700', fontSize: 17 },
  pillRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  pill: {
    backgroundColor: colors.background,
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
  signOut: { marginTop: spacing.xl, alignItems: 'center' },
  signOutText: { ...typography.muted, color: colors.textMuted },
});
