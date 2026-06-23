import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, sizing, radius } from '@/theme';

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

const TONE: Record<'mint' | 'danger' | 'amber', { bg: string; fg: string }> = {
  mint: { bg: colors.mintLight, fg: '#096438' },
  danger: { bg: colors.dangerLight, fg: '#921010' },
  amber: { bg: colors.cautionLight, fg: '#946A00' },
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
          <View key={s.heading} style={[styles.card, { backgroundColor: t.bg }]}>
            <Text style={[styles.heading, { color: t.fg }]}>{s.heading}</Text>
            {s.items.map((i) => (
              <Text key={i} style={[styles.item, { color: t.fg }]}>
                •  {i}
              </Text>
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
  card: { borderRadius: radius.card, padding: spacing.lg, gap: 4 },
  heading: { ...typography.titleM, fontWeight: '700', marginBottom: spacing.xs },
  item: { ...typography.bodyM, lineHeight: 22 },
  footer: { ...typography.caption, color: colors.textHint, lineHeight: 16, marginTop: spacing.sm },
});
