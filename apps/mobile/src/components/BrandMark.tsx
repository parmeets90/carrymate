import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@/theme';

/**
 * CarryMate brand symbol — a flight route that forms a "C":
 * origin point (top-right) → curved route arcing left → destination point
 * (bottom-right), with a capsule marker resting on the route.
 * Construction grid: 120×120 viewBox, route arc r=40 about (62,60),
 * endpoints at ±60° (82,25.4)/(82,94.6), capsule at the 180° left vertex (22,60).
 */
export function BrandMark({
  size = 96,
  mono,
}: {
  size?: number;
  /** Render in a single color (e.g. white on dark surfaces) instead of brand gradient. */
  mono?: string;
}) {
  const routeStroke = mono ?? 'url(#cmRoute)';
  const originColor = mono ?? colors.navyMid;
  const destColor = mono ?? colors.mintPrimary;
  const capFill = mono ?? colors.skyBlue;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <LinearGradient id="cmRoute" x1="82" y1="25" x2="82" y2="95" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#1E40AF" />
          <Stop offset="0.5" stopColor="#3B82F6" />
          <Stop offset="1" stopColor="#14B8A6" />
        </LinearGradient>
      </Defs>

      {/* The route forming the C */}
      <Path
        d="M82 25.36 A40 40 0 1 0 82 94.64"
        stroke={routeStroke}
        strokeWidth={12}
        strokeLinecap="round"
        fill="none"
      />

      {/* Capsule marker resting on the route (left) */}
      <Rect x={17} y={49} width={10} height={22} rx={5} fill={capFill} stroke={colors.white} strokeWidth={1.5} />

      {/* Origin + destination points */}
      <Circle cx={82} cy={25.36} r={6.5} fill={originColor} />
      <Circle cx={82} cy={94.64} r={6.5} fill={destColor} />
    </Svg>
  );
}
