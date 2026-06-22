import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing } from '@/theme';
import { Card, Badge } from '@/components/Card';
import { Avatar } from '@/components/widgets';
import { SecondaryButton } from '@/components/ui';
import { useAuth } from '@/store/auth';

export function ProfileTabScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.heading}>Profile</Text>

      <Card style={{ alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, paddingVertical: spacing.xl }}>
        <Avatar name={user?.fullName} size={72} />
        <Text style={styles.name}>{user?.fullName ?? 'CarryMate user'}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
        <View style={styles.badges}>
          {user?.kycStatus === 'VERIFIED' && <Badge label="KYC verified" tone="gold" />}
          <Badge label={user?.role ?? 'SENDER'} tone="sky" />
          {typeof user?.ratingAvg === 'number' && user.ratingCount > 0 && (
            <Badge label={`★ ${user.ratingAvg.toFixed(1)}`} tone="neutral" />
          )}
        </View>
      </Card>

      <View style={{ marginTop: spacing.xl }}>
        <SecondaryButton label="Sign out" onPress={signOut} tone="danger" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  heading: { ...typography.display, color: colors.textPrimary },
  name: { ...typography.titleL, color: colors.textPrimary, marginTop: spacing.sm },
  phone: { ...typography.bodyM, color: colors.textSecondary },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm, justifyContent: 'center' },
});
