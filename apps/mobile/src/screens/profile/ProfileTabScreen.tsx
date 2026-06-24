import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { BrandLoader } from '@/components/BrandLoader';
import { Alert } from '@/components/AlertHost';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing, radius } from '@/theme';
import { Card, Badge, TrustBadge } from '@/components/Card';
import { Avatar } from '@/components/widgets';
import { Icon } from '@/components/Icon';
import { SecondaryButton } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { RootStackParamList } from '@/navigation/types';

type Role = 'SENDER' | 'TRAVELER';

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: 'SENDER', label: 'Sender', hint: 'Send packages with travelers' },
  { value: 'TRAVELER', label: 'Traveler', hint: 'Carry items on your trips' },
];

export function ProfileTabScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const qc = useQueryClient();
  const { user, setUser, signOut } = useAuth();
  const [saving, setSaving] = useState<Role | null>(null);

  const current = (user?.role as Role) ?? 'SENDER';

  const switchRole = async (role: Role) => {
    if (role === current || saving) return;
    setSaving(role);
    try {
      const updated = await api.updateProfile({ role });
      setUser(updated);
      // Role drives tabs + listings — clear cached lists so they refetch fresh.
      qc.invalidateQueries();
    } catch (e) {
      Alert.alert('Could not switch role', (e as Error).message);
    } finally {
      setSaving(null);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing['3xl'] }}
    >
      <Text style={styles.heading}>Profile</Text>

      <Card style={{ alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, paddingVertical: spacing.xl }}>
        <Avatar name={user?.fullName} size={72} />
        <Text style={styles.name}>{user?.fullName ?? 'CarryMate user'}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
        <View style={styles.badges}>
          {user?.kycStatus === 'VERIFIED' && <TrustBadge variant="kycVerified" />}
          <Badge label={current} tone="sky" />
          {typeof user?.ratingAvg === 'number' && user.ratingCount > 0 && (
            <Badge label={user.ratingAvg.toFixed(1)} tone="neutral" icon="star" />
          )}
        </View>
      </Card>

      <Text style={styles.sectionLabel}>PHONE NUMBER</Text>
      {user?.phoneVerified ? (
        <Card style={styles.phoneRow}>
          <Icon name="verified" size={20} color={colors.mintPrimary} weight="fill" />
          <Text style={styles.phoneText}>{user.phone} · verified</Text>
        </Card>
      ) : (
        <Pressable onPress={() => nav.navigate('AddPhone')}>
          <Card style={styles.phoneRow}>
            <Icon name="alert" size={20} color={colors.cautionAmber} weight="fill" />
            <View style={{ flex: 1 }}>
              <Text style={styles.phoneText}>Add &amp; verify your phone</Text>
              <Text style={styles.phoneHint}>Required to post, bid, or pay</Text>
            </View>
            <Icon name="chevronRight" size={18} color={colors.textHint} />
          </Card>
        </Pressable>
      )}

      <Text style={styles.sectionLabel}>WALLET</Text>
      <Pressable onPress={() => nav.navigate('Transactions')}>
        <Card style={styles.linkRow}>
          <View style={styles.linkIcon}>
            <Icon name="wallet" size={20} color={colors.skyBlue} weight="fill" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.linkText}>Transaction history</Text>
            <Text style={styles.linkHint}>Payments, payouts & escrow activity</Text>
          </View>
          <Icon name="chevronRight" size={18} color={colors.textHint} />
        </Card>
      </Pressable>

      <Text style={styles.sectionLabel}>YOUR ROLE</Text>
      <Card style={{ gap: spacing.sm }}>
        {ROLES.map((r) => {
          const active = current === r.value;
          const busy = saving === r.value;
          return (
            <Pressable
              key={r.value}
              onPress={() => switchRole(r.value)}
              style={[styles.roleRow, active && styles.roleRowActive]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>{r.label}</Text>
                <Text style={styles.roleHint}>{r.hint}</Text>
              </View>
              {busy ? (
                <BrandLoader size={32} />
              ) : (
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && <View style={styles.radioDot} />}
                </View>
              )}
            </Pressable>
          );
        })}
      </Card>
      <Text style={styles.note}>Switching changes which tabs and listings you see.</Text>

      <View style={{ marginTop: spacing.xl }}>
        <SecondaryButton label="Sign out" onPress={signOut} tone="danger" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  heading: { ...typography.display, color: colors.textPrimary },
  name: { ...typography.titleL, color: colors.textPrimary, marginTop: spacing.sm },
  phone: { ...typography.bodyM, color: colors.textSecondary },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm, justifyContent: 'center' },
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginTop: spacing.xl, marginBottom: spacing.sm, marginLeft: spacing.xs },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  phoneText: { ...typography.bodyL, fontWeight: '600', color: colors.textPrimary },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  linkIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.skyLight, alignItems: 'center', justifyContent: 'center' },
  linkText: { ...typography.bodyL, fontWeight: '600', color: colors.textPrimary },
  linkHint: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
  phoneHint: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  roleRowActive: { borderColor: colors.skyBlue, backgroundColor: colors.skyLight },
  roleLabel: { ...typography.bodyL, fontWeight: '700', color: colors.textPrimary },
  roleLabelActive: { color: colors.navyMid },
  roleHint: { ...typography.bodyM, color: colors.textSecondary, marginTop: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.skyBlue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.skyBlue },
  note: { ...typography.caption, color: colors.textHint, marginTop: spacing.sm, marginLeft: spacing.xs },
});
