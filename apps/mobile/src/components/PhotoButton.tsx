import { useState } from 'react';
import { Text, Pressable, StyleSheet, View, Linking, Platform, PermissionsAndroid } from 'react-native';
import { BrandLoader } from './BrandLoader';
import { Icon } from './Icon';
import { Alert } from './AlertHost';
import {
  launchImageLibrary,
  launchCamera,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import { colors, spacing, radius, typography } from '@/theme';
import { uploadPhoto } from '@/lib/api';

// Resizing forces re-encoding to JPEG — this is how we normalize iOS HEIC photos
// (Challenge 10, Fix 1) without a native image-manipulation dependency.
const PICKER_OPTS = {
  mediaType: 'photo' as const,
  quality: 0.7 as const,
  maxWidth: 1600,
  maxHeight: 1600,
};

/** Pick (camera or gallery), normalize to JPEG, upload, and return the stored key. */
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

  const handle = async (res: ImagePickerResponse) => {
    if (res.didCancel) return;
    // Permission denied → never a blank screen; point the user to Settings (Fix 2).
    if (res.errorCode === 'permission' || res.errorCode === 'camera_unavailable') {
      Alert.alert(
        'Permission needed',
        'CarryMate needs camera/photos access to upload this. Enable it in Settings.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => void Linking.openSettings() },
        ],
      );
      return;
    }
    if (res.errorCode) {
      Alert.alert('Could not get photo', res.errorMessage ?? 'Please try again.');
      return;
    }
    const asset = res.assets?.[0];
    if (!asset?.uri) return;

    setBusy(true);
    try {
      // After resize the asset is JPEG; force the name/type so HEIC never reaches the backend.
      const isHeic = /heic|heif/i.test(asset.type ?? asset.fileName ?? '');
      const key = await uploadPhoto(purpose, {
        uri: asset.uri,
        type: isHeic ? 'image/jpeg' : asset.type ?? 'image/jpeg',
        fileName: (asset.fileName ?? 'photo.jpg').replace(/\.(heic|heif)$/i, '.jpg'),
      });
      onUploaded(key);
    } catch (e) {
      Alert.alert('Upload failed', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // react-native-image-picker requires us to hold CAMERA at runtime whenever the
  // permission is declared in the manifest (it is, for ticket/open-box capture).
  const takePhoto = async () => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Camera access',
        message: 'CarryMate needs your camera to take this photo.',
        buttonPositive: 'Allow',
        buttonNegative: 'Not now',
      });
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Camera permission needed',
            'Enable camera access for CarryMate in Settings to take a photo.',
            [
              { text: 'Not now', style: 'cancel' },
              { text: 'Open Settings', onPress: () => void Linking.openSettings() },
            ],
          );
        }
        return;
      }
    }
    const res = await launchCamera(PICKER_OPTS);
    await handle(res);
  };

  const pick = () => {
    Alert.alert('Add photo', 'Choose a source', [
      { text: 'Take photo', onPress: () => void takePhoto() },
      { text: 'Choose from gallery', onPress: () => void launchImageLibrary(PICKER_OPTS).then(handle) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const added = count > 0;
  return (
    <Pressable onPress={pick} disabled={busy} style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}>
      {busy ? (
        <BrandLoader size={24} />
      ) : (
        <>
          <View style={[styles.iconCircle, added && styles.iconCircleDone]}>
            <Icon name={added ? 'check' : 'camera'} size={20} color={added ? colors.mintPrimary : colors.skyBlue} weight="fill" />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.label} numberOfLines={1}>
              {label}
              {added ? ` · ${count}` : ''}
            </Text>
            <Text style={styles.hint}>Take a photo or choose from gallery</Text>
          </View>
          <Icon name="chevronRight" size={16} color={colors.textHint} />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.skyLight,
    borderWidth: 0.5,
    borderColor: '#CFE0F2',
    minHeight: 56,
    justifyContent: 'center',
  },
  btnPressed: { opacity: 0.85 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleDone: { backgroundColor: colors.mintLight },
  textCol: { flex: 1 },
  label: { ...typography.bodyM, color: colors.primary, fontWeight: '700' },
  hint: { ...typography.caption, color: colors.textHint, marginTop: 1 },
});
