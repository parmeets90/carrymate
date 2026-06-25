import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AirplaneTilt, Wallet, SealCheck, Lightning } from 'phosphor-react-native';
import { colors } from '@/theme';

/**
 * Onboarding slide illustrations (UI refresh). Premium vector style: a soft pastel
 * blob composition with a large duotone brand motif — clean, modern, not cartoon.
 * Reuses the Phosphor icon set; purely cosmetic.
 */
const SCENES = {
  carry: { Icon: AirplaneTilt, color: '#1E40AF', blob: colors.softBlue, accent: colors.softPeach, accent2: colors.softMint },
  earn: { Icon: Wallet, color: '#14B8A6', blob: colors.softMint, accent: colors.softLavender, accent2: colors.softPeach },
  trust: { Icon: SealCheck, color: '#3B82F6', blob: colors.softLavender, accent: colors.softMint, accent2: colors.softBlue },
  fast: { Icon: Lightning, color: '#1E40AF', blob: colors.softPeach, accent: colors.softBlue, accent2: colors.softLavender },
} as const;

export type IllustrationName = keyof typeof SCENES;

export function AuthIllustration({ name, size = 200 }: { name: IllustrationName; size?: number }) {
  const s = SCENES[name];
  const Icon = s.Icon;
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
        <Circle cx={100} cy={104} r={76} fill={s.blob} />
        <Circle cx={158} cy={48} r={24} fill={s.accent} />
        <Circle cx={40} cy={152} r={15} fill={s.accent2} />
        <Circle cx={46} cy={54} r={7} fill={s.accent} />
        <Circle cx={160} cy={150} r={9} fill={s.accent2} />
      </Svg>
      <Icon size={size * 0.4} color={s.color} weight="duotone" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
