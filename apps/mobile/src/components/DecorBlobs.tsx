import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { colors } from '@/theme';

/**
 * Soft pastel decorative blobs as a non-interactive background layer (UI refresh).
 * Flat, low-saturation shapes — warmth, not colour. Pointer-events disabled so it
 * never blocks the content above it. Purely cosmetic; safe on any screen.
 */
type BlobSpec = { cx: number; cy: number; rx: number; ry: number; fill: string };

const FIELDS: Record<string, BlobSpec[]> = {
  // For the auth hero (top of screen).
  auth: [
    { cx: 70, cy: 90, rx: 130, ry: 120, fill: colors.softBlue },
    { cx: 330, cy: 60, rx: 110, ry: 100, fill: colors.softPeach },
    { cx: 300, cy: 300, rx: 140, ry: 130, fill: colors.softMint },
    { cx: 40, cy: 320, rx: 100, ry: 95, fill: colors.softLavender },
  ],
  // Gentler corner accents for content headers.
  header: [
    { cx: 360, cy: 10, rx: 120, ry: 90, fill: colors.softBlue },
    { cx: 10, cy: 70, rx: 90, ry: 80, fill: colors.softMint },
  ],
};

export function DecorBlobs({
  variant = 'auth',
  style,
}: {
  variant?: keyof typeof FIELDS;
  style?: StyleProp<ViewStyle>;
}) {
  const blobs = FIELDS[variant] ?? FIELDS.auth!;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        {blobs.map((b, i) => (
          <Ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={b.fill} opacity={0.7} />
        ))}
      </Svg>
    </View>
  );
}
