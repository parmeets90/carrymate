import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography, sizing } from '@/theme';
import { PrimaryButton, Field } from '@/components/ui';
import { api } from '@/lib/api';
import type { ScreenProps } from '@/navigation/types';

export function RateScreen({ route, navigation }: ScreenProps<'Rate'>) {
  const { orderId, counterparty } = route.params;
  const qc = useQueryClient();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await api.rateOrder(orderId, { stars, comment: comment.trim() || undefined });
      qc.invalidateQueries({ queryKey: ['orders'] });
      navigation.goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate {counterparty}</Text>
      <Text style={styles.sub}>How was the experience?</Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setStars(n)}>
            <Text style={[styles.star, { color: n <= stars ? colors.goldPrimary : colors.borderLight }]}>★</Text>
          </Pressable>
        ))}
      </View>

      <Field label="Comment (optional)" value={comment} onChangeText={setComment} multiline placeholder="Add a note" error={error} />
      <View style={styles.footer}>
        <PrimaryButton label="Submit rating" onPress={submit} loading={busy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX, paddingTop: spacing.lg },
  title: { ...typography.titleL, color: colors.textPrimary },
  sub: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.lg },
  stars: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  star: { fontSize: 40 },
  footer: { marginTop: spacing.xl },
});
