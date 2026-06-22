import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { Card, Badge } from '@/components/Card';
import { useAuth } from '@/store/auth';

export function ProfileTabScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.title}>Profile</Text>

      <Card style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <Text style={styles.name}>{user?.fullName ?? 'CarryMate user'}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
        <View style={styles.badges}>
          {user?.kycStatus === 'VERIFIED' && <Badge label="KYC verified" tone="gold" />}
          <Badge label={user?.role ?? 'SENDER'} tone="sky" />
        </View>
      </Card>

      <Pressable onPress={signOut} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  title: { ...typography.titleL, color: colors.textPrimary },
  name: { ...typography.titleM, color: colors.textPrimary },
  phone: { ...typography.bodyM, color: colors.textSecondary },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  signOut: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  signOutText: { ...typography.bodyL, color: colors.dangerRed, fontWeight: '600' },
});
