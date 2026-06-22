import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '@/theme';
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
      contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: spacing.xxl }}
    >
      <View style={styles.header}>
        <Text style={typography.h1}>Set up your profile</Text>
        <Text style={[typography.muted, styles.sub]}>Tell us your name and how you'll use CarryMate.</Text>
      </View>

      <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Anjali Sharma" />

      <Text style={[styles.label]}>I want to…</Text>
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
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  header: { gap: spacing.sm, marginBottom: spacing.lg },
  sub: { lineHeight: 22 },
  label: { ...typography.muted, fontWeight: '600', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  roles: { gap: spacing.sm },
  role: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  roleActive: { borderColor: colors.primary, backgroundColor: '#fff5f7' },
  roleTitle: { ...typography.body, fontWeight: '700' },
  roleTitleActive: { color: colors.primary },
  roleDesc: { ...typography.muted, marginTop: 2 },
  error: { color: colors.danger, marginTop: spacing.md },
  footer: { marginTop: spacing.xl },
});
