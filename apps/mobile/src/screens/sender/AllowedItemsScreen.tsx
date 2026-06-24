import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, sizing, radius } from '@/theme';
import { Icon, type IconName } from '@/components/Icon';

const SECTIONS = [
  {
    tone: 'mint' as const,
    heading: 'Allowed',
    items: [
      'Home-cooked non-perishable food',
      'Packaged sweets & Indian spices',
      'Sarees & clothing',
      'Books & documents',
      'Festival gifts under ₹5,000',
    ],
  },
  {
    tone: 'danger' as const,
    heading: 'Not allowed',
    items: [
      'Electronics & electrical devices',
      'Medicines, vitamins & supplements',
      'Liquids & aerosols',
      'Anything worth more than ₹10,000',
      'Commercial or resale goods',
    ],
  },
  {
    tone: 'amber' as const,
    heading: "Carrier's discretion",
    items: ['Homemade perishables', 'Ceremonial or religious items'],
  },
];

const TONE: Record<'mint' | 'danger' | 'amber', { bg: string; fg: string; border: string; icon: IconName }> = {
  mint: { bg: colors.mintLight, fg: '#096438', border: colors.mintBorder, icon: 'check' },
  danger: { bg: colors.dangerLight, fg: '#921010', border: '#FF9090', icon: 'cross' },
  amber: { bg: colors.cautionLight, fg: '#946A00', border: '#FFE066', icon: 'warning' },
};

export function AllowedItemsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md }}>
      <Text style={styles.title}>What can I send?</Text>
      <Text style={styles.intro}>
        CarryMate is for personal items only — homemade food, gifts and documents carried as a
        traveler's personal luggage. Travelers may decline anything at their discretion.
      </Text>

      {SECTIONS.map((s) => {
        const t = TONE[s.tone];
        return (
          <View key={s.heading} style={[styles.card, { backgroundColor: t.bg, borderColor: t.border }]}>
            <View style={styles.headingRow}>
              <Icon name={t.icon} size={18} color={t.fg} weight="fill" />
              <Text style={[styles.heading, { color: t.fg }]}>{s.heading}</Text>
            </View>
            {s.items.map((i) => (
              <View key={i} style={styles.itemRow}>
                <Icon name={t.icon} size={14} color={t.fg} />
                <Text style={[styles.item, { color: t.fg }]}>{i}</Text>
              </View>
            ))}
          </View>
        );
      })}

      <Text style={styles.footer}>
        Prohibited items are blocked at posting. Misdeclaring an item may lead to seizure at customs
        and removal from CarryMate.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  title: { ...typography.titleL, color: colors.textPrimary },
  intro: { ...typography.bodyM, color: colors.textSecondary, lineHeight: 21 },
  card: { borderRadius: radius.card, borderWidth: 0.5, padding: spacing.lg, gap: spacing.xs },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  heading: { ...typography.titleM, fontWeight: '700' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  item: { ...typography.bodyM, lineHeight: 22, flex: 1 },
  footer: { ...typography.caption, color: colors.textHint, lineHeight: 16, marginTop: spacing.sm },
});
