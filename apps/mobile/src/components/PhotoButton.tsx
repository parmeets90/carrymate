import { useState } from 'react';
import { Text, Pressable, StyleSheet, ActivityIndicator, Alert, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors, spacing, radius, typography } from '@/theme';
import { uploadPhoto } from '@/lib/api';

/** Pick an image from the library, upload it, and return the stored key. */
export function PhotoButton({
  purpose,
  label = 'Add photo',
  count = 0,
  onUploaded,
}: {
  purpose: string;
  label?: string;
  count?: number;
  onUploaded: (key: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.7, selectionLimit: 1 });
    const asset = res.assets?.[0];
    if (!asset?.uri) return;
    setBusy(true);
    try {
      const key = await uploadPhoto(purpose, {
        uri: asset.uri,
        type: asset.type,
        fileName: asset.fileName,
      });
      onUploaded(key);
    } catch (e) {
      Alert.alert('Upload failed', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pressable onPress={pick} disabled={busy} style={styles.btn}>
      {busy ? (
        <ActivityIndicator color={colors.skyBlue} />
      ) : (
        <View style={styles.inner}>
          <Text style={styles.plus}>＋</Text>
          <Text style={styles.label}>
            {label}
            {count > 0 ? ` · ${count} added` : ''}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.skyBlue,
    borderRadius: radius.input,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.skyLight,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  plus: { ...typography.titleM, color: colors.skyBlue },
  label: { ...typography.bodyM, color: '#185FA5', fontWeight: '600' },
});
