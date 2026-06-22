import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, sizing } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';

type Role = 'SENDER' | 'TRAVELER' | 'BOTH';
const ROLES: { value: Role; title: string; desc: string }[] = [
  { value: 'SENDER', title: 'Send items', desc: 'I want to send things to people abroad.' },
  { value: 'TRAVELER', title: 'Carry items', desc: 'I travel and can carry items for others.' },
  { value: 'BOTH', title: 'Both', desc: 'I want to send and carry.' },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const setUser = useAuth((s) => s.setUser);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('SENDER');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const onSave = async () => {
    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const user = await api.updateProfile({ fullName: name.trim(), role });
      setUser(user); // navigator advances to KYC
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: spacing['3xl'] }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.sub}>Tell us your name and how you'll use CarryMate.</Text>
      </View>

      <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Anjali Sharma" />

      <Text style={styles.sectionLabel}>I want to…</Text>
      <View style={styles.roles}>
        {ROLES.map((r) => {
          const active = role === r.value;
          return (
            <Pressable
              key={r.value}
              onPress={() => setRole(r.value)}
              style={[styles.role, active && styles.roleActive]}
            >
              <Text style={[styles.roleTitle, active && styles.roleTitleActive]}>{r.title}</Text>
              <Text style={styles.roleDesc}>{r.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={onSave} loading={busy} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
    paddingHorizontal: sizing.screenPaddingX,
  },
  header: { gap: spacing.sm, marginBottom: spacing.lg },
  title: { ...typography.display, color: colors.textPrimary },
  sub: { ...typography.bodyM, color: colors.textSecondary },
  sectionLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  roles: { gap: spacing.sm },
  role: {
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    padding: spacing.md,
    backgroundColor: colors.bgCard,
  },
  roleActive: { borderColor: colors.skyBlue, backgroundColor: colors.skyLight },
  roleTitle: { ...typography.bodyL, fontWeight: '600', color: colors.textPrimary },
  roleTitleActive: { color: colors.navyMid },
  roleDesc: { ...typography.bodyM, color: colors.textSecondary, marginTop: 2 },
  error: { ...typography.bodyM, color: colors.dangerRed, marginTop: spacing.md },
  footer: { marginTop: spacing.xl },
});
