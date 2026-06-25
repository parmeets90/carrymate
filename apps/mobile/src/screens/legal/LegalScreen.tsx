import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing } from '@/theme';
import { LEGAL_DOCS } from '@/content/legal';
import type { ScreenProps } from '@/navigation/types';

/** Renders the in-app Terms / Privacy content with the app's typography. */
export function LegalScreen({ route }: ScreenProps<'Legal'>) {
  const insets = useSafeAreaInsets();
  const doc = LEGAL_DOCS[route.params.doc];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: sizing.screenPaddingX, paddingBottom: insets.bottom + spacing['3xl'] }}
    >
      <Text style={styles.title}>{doc.title}</Text>
      <Text style={styles.updated}>Last updated {doc.updated}</Text>
      <Text style={styles.intro}>{doc.intro}</Text>

      {doc.sections.map((s) => (
        <View key={s.heading} style={styles.section}>
          <Text style={styles.heading}>{s.heading}</Text>
          {s.paragraphs?.map((p, i) => (
            <Text key={i} style={styles.paragraph}>
              {p}
            </Text>
          ))}
          {s.bullets?.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      ))}

      <Text style={styles.footer}>
        This summary reflects how CarryMate works during the pilot and is being finalised. Reach us with any questions.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
  title: { ...typography.display, color: colors.textPrimary },
  updated: { ...typography.caption, color: colors.textHint, marginTop: spacing.xs },
  intro: { ...typography.bodyM, color: colors.textSecondary, lineHeight: 22, marginTop: spacing.md },
  section: { marginTop: spacing.xl, gap: spacing.sm },
  heading: { ...typography.titleM, color: colors.textPrimary },
  paragraph: { ...typography.bodyM, color: colors.textSecondary, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.sm },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.skyBlue, marginTop: 7 },
  bulletText: { ...typography.bodyM, color: colors.textSecondary, lineHeight: 22, flex: 1 },
  footer: { ...typography.caption, color: colors.textHint, lineHeight: 17, marginTop: spacing['2xl'], fontStyle: 'italic' },
});
