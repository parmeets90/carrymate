import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { Screen, ScreenHeader } from '@/components/Screen';
import { PrimaryButton, Field } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';

type Role = 'SENDER' | 'TRAVELER' | 'BOTH';
const ROLES: { value: Role; icon: IconName; title: string; desc: string }[] = [
  { value: 'SENDER', icon: 'package', title: 'Send items', desc: 'Send things to people abroad.' },
  { value: 'TRAVELER', icon: 'trips', title: 'Carry items', desc: 'Earn on trips you already take.' },
  { value: 'BOTH', icon: 'handshake', title: 'Both', desc: 'Send and carry.' },
];

export function ProfileScreen() {
  const setUser = useAuth((s) => s.setUser);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('SENDER');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const onSave = async () => {
    if (name.trim().length < 2) return setError('Please enter your full name.');
    setBusy(true);
    setError(undefined);
    try {
      setUser(await api.updateProfile({ fullName: name.trim(), role }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Set up your profile" subtitle="Tell us your name and how you'll use CarryMate." />
      <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Anjali Sharma" error={error} />

      <Text style={styles.sectionLabel}>I want to…</Text>
      {ROLES.map((r) => {
        const active = role === r.value;
        return (
          <Pressable key={r.value} onPress={() => setRole(r.value)} style={[styles.role, active && styles.roleActive]}>
            <View style={[styles.roleIcon, active && styles.roleIconActive]}>
              <Icon name={r.icon} size={22} color={active ? colors.skyBlue : colors.textSecondary} weight={active ? 'fill' : 'regular'} />
            </View>
            <View style={styles.roleText}>
              <Text style={[styles.roleTitle, active && { color: colors.navyMid }]}>{r.title}</Text>
              <Text style={styles.roleDesc}>{r.desc}</Text>
            </View>
            <View style={[styles.radio, active && styles.radioOn]}>{active && <View style={styles.radioDot} />}</View>
          </Pressable>
        );
      })}

      <View style={{ marginTop: spacing.lg }}>
        <PrimaryButton label="Continue" onPress={onSave} loading={busy} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginTop: spacing.sm },
  role: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.card + 4,
    padding: spacing.md,
    backgroundColor: colors.bgCard,
  },
  roleActive: { borderColor: colors.skyBlue, backgroundColor: colors.skyLight, ...shadows.sm },
  roleIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bgSecondary, alignItems: 'center', justifyContent: 'center' },
  roleIconActive: { backgroundColor: colors.white },
  roleText: { flex: 1 },
  roleTitle: { ...typography.bodyL, fontWeight: '700', color: colors.textPrimary },
  roleDesc: { ...typography.bodyM, color: colors.textSecondary, marginTop: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.skyBlue },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.skyBlue },
});
