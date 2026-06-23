import { useState } from 'react';
import { Text, Pressable, StyleSheet, View, Linking, Platform, PermissionsAndroid } from 'react-native';
import { BrandLoader } from './BrandLoader';
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

  return (
    <Pressable onPress={pick} disabled={busy} style={styles.btn}>
      {busy ? (
        <BrandLoader size={24} />
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
