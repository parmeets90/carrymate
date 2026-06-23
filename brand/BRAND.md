# CarryMate — Brand & Motion System

## Concept
The mark is a **flight route that forms the letter "C"**: a route begins at an
**origin point**, arcs left (the C), carries a **capsule marker**, and ends at a
**destination point**. It says *connection, travel, trust, movement, delivery* —
**without** airplanes, pins, or courier clipart. Story: **someone sends → a
trusted traveler carries → someone receives**.

## Construction grid (symbol)
- Canvas: **120 × 120**.
- Route arc: radius **40** about center **(62, 60)**; endpoints at **±60°** →
  origin **(82, 25.36)**, destination **(82, 94.64)**; major arc bulges left
  (SVG: `M82 25.36 A40 40 0 1 0 82 94.64`).
- Stroke: **12** units, **round** caps, gradient origin→destination.
- Capsule marker: **10 × 22**, corner radius **5**, on the route's left vertex
  **(22, 60)** (rendered x17 y49), 1.5 white keyline.
- Points: **r 6.5**, origin = primary, destination = accent.
- Clear space: ≥ **0.5 × symbol height** on all sides.
- Min size: **24 px** (app contexts), **16 px** monogram-only.

## Color
| Token | Hex | Use |
|---|---|---|
| Primary | `#1E40AF` | route start, origin point, wordmark on light |
| Secondary | `#3B82F6` | route mid, capsule fill |
| Accent | `#14B8A6` | route end, destination point, success |
| Ink | `#0F1629` | wordmark on light |
| White | `#FFFFFF` | wordmark on dark, capsule keyline, mark on brand |

Route stroke = linear gradient Primary → Secondary → Accent (origin→destination).

## Logo variants (this folder)
- `monogram.svg` — symbol only (120 grid).
- `app-icon.svg` — 1024 squircle, brand-gradient surface, white route + accent destination.
- `logo-light.svg` — horizontal lockup, ink wordmark (light backgrounds).
- `logo-dark.svg` — horizontal lockup, white wordmark (dark backgrounds).
- In-app: `apps/mobile/src/components/BrandMark.tsx` (react-native-svg, `mono` prop for monochrome).

> Wordmark is set in **Plus Jakarta Sans** (700, −1 letter-spacing). **Outline the
> text to paths before final production export** so it renders without the font.

## Do / Don't
- **Do** keep the route's round caps + gradient direction (origin→destination).
- **Do** use the capsule as the only marker on the route.
- **Don't** add airplanes/pins, recolor per-segment, square the caps, or rotate the C.

---

## Splash animation — `apps/mobile/src/assets/lottie/splash.json`
Generated (editable) by `apps/mobile/scripts/build-splash-lottie.cjs`.
**1080×1920, 60 fps, 7.0 s (420f), ~20 KB, vector-only.**

### Layer hierarchy (bottom → top)
1. `BG_Gradient` — soft radial light.
2. `Geo_UAE`, `Geo_India` — abstract geography blobs (no maps).
3. `Particles_1..6` — staggered drift + twinkle.
4. `Route_Base` — the C route, gradient stroke, **trim-draws in** (Scene 1).
5. `Route_Light` — accent overlay that **lights the route fully** (Scene 5).
6. `Origin_Point` — pulsing origin (Scene 1/2).
7. `Destination_Point` — illuminates on arrival (Scene 5).
8. `Token` — capsule (hero) → recolors to traveler token → settles on the route
   as the logo capsule (Scenes 2–6). Carries a glow throughout.
9. `Success_Glow` — radial bloom at destination (Scene 5).

### Scene timing (frames @60)
| Scene | Frames | Beat |
|---|---|---|
| 1 | 8–80 | route C draws; particles; geo hints |
| 2 | 78–148 | capsule glows + pulses at origin |
| 3 | 150–280 | capsule travels the C; geography reveals |
| 4 | 240–280 | capsule morphs → traveler token (recolor + ring) |
| 5 | 288–360 | destination illuminates; route lights; success bloom |
| 6 | 360–420 | token settles onto the route; mark locks. Wordmark + tagline = native overlay |

### Motion principles applied
Anticipation (capsule scale-in 0→100 back-ease), overshoot (points, token
settle), inertia/secondary motion (particles, glow scaling), smooth morph
(capsule→token via color + ring), trim-path reveals (route draw + light-up).

### After Effects comp structure (to rebuild/edit in AE → Bodymovin)
- Comp `CarryMate_Splash` 1080×1920 @60, 7s.
- Precomps optional: `Route` (shape + Trim Paths), `Token` (shape group +
  position keys along the route), `FX` (particles/glow). Match layer names above.
- Export via **Bodymovin/Lottie**: shapes only, no expressions/images,
  "Glyphs"/fonts off (text is the RN overlay).

## React Native implementation
- `lottie-react-native` `<LottieView source={require('splash.json')} autoPlay
  loop={false} onAnimationFinish={onDone} resizeMode="cover" />`.
- The CarryMate wordmark + tagline **"Delivered Through Trusted Travelers"** are a
  native `Animated` overlay (crisp text, no embedded font) revealed in the final
  beat — see `apps/mobile/src/screens/SplashScreen.tsx`.
- Splash mounts before the navigator in `App.tsx`; on finish it renders the app.
- Honor reduce-motion in future by shortening to the logo lock if needed.
