/* eslint-disable */
/**
 * CarryMate splash — Lottie generator.
 *
 * Produces a schema-valid, vector-only Lottie at src/assets/lottie/splash.json.
 * Hand-authoring 400+ frames of raw JSON is error-prone, so we build the doc
 * programmatically with helpers (easing, keyframes, shapes) — this is the
 * "editable AE-style structure + layer naming + export settings" deliverable.
 *
 * Run:  node scripts/build-splash-lottie.cjs
 *
 * Timeline (60fps, portrait 1080x1920):
 *   Scene1 0.0–1.5s  origin marker pulses, gift (hero) appears with glow
 *   Scene2 1.5–3.0s  plane enters, gift snaps magnetically under the plane
 *   Scene3 3.0–5.0s  plane arcs across; flight path trails in; clouds + particles
 *   Scene4 5.0–6.5s  arrival at destination marker; gift descends; success glow
 *   Scene5 6.5–8.0s  illustration settles/fades (RN overlay reveals logo+tagline)
 */
const fs = require('fs');
const path = require('path');

const FR = 60;
const OP = 480; // 8.0s
const W = 1080;
const H = 1920;

// ── Brand palette (0..1 rgba) ───────────────────────────────
const C = {
  primary: [0.118, 0.251, 0.686, 1], // #1E40AF
  secondary: [0.231, 0.51, 0.965, 1], // #3B82F6
  accent: [0.078, 0.722, 0.651, 1], // #14B8A6
  success: [0.063, 0.725, 0.506, 1], // #10B981
  neutral: [0.392, 0.455, 0.545, 1], // #64748B
  white: [1, 1, 1, 1],
  paleBlue: [0.965, 0.976, 1, 1],
  giftGlow: [0.231, 0.51, 0.965, 1],
};

// ── Easing presets (Lottie bezier handles) ─────────────────
const EASE = {
  inOut: { o: { x: [0.42], y: [0] }, i: { x: [0.58], y: [1] } },
  out: { o: { x: [0.16], y: [0.84] }, i: { x: [0.3], y: [1] } },
  in: { o: { x: [0.7], y: [0] }, i: { x: [0.84], y: [1] } },
  overshoot: { o: { x: [0.34], y: [0] }, i: { x: [0.22], y: [1.4] } }, // back-out
  linear: { o: { x: [0.33], y: [0.33] }, i: { x: [0.66], y: [0.66] } },
};

// keyframe: time, value(array), easing preset name
function kf(t, s, ease = 'inOut') {
  return { t, s, ...EASE[ease] };
}
/** animated property from keyframes */
const anim = (keyframes) => ({ a: 1, k: keyframes });
/** static property */
const val = (k) => ({ a: 0, k });

// ── Shape primitives ───────────────────────────────────────
const fill = (c, o = 100) => ({ ty: 'fl', c: val(c), o: val(o), r: 1, nm: 'Fill' });
const stroke = (c, w, o = 100) => ({
  ty: 'st', c: val(c), o: val(o), w: val(w), lc: 2, lj: 2, ml: 4, nm: 'Stroke',
});
const ellipse = (s, p = [0, 0]) => ({ ty: 'el', p: val(p), s: val(s), nm: 'Ellipse' });
const rect = (s, r = 0, p = [0, 0]) => ({ ty: 'rc', p: val(p), s: val(s), r: val(r), nm: 'Rect' });
const trGroup = (extra = {}) => ({
  ty: 'tr',
  p: extra.p ?? val([0, 0]),
  a: extra.a ?? val([0, 0]),
  s: extra.s ?? val([100, 100]),
  r: extra.r ?? val(0),
  o: extra.o ?? val(100),
  nm: 'Transform',
});
const group = (nm, items) => ({ ty: 'gr', nm, it: items });

function pathShape(vertices, inT, outT, closed = true) {
  return {
    ty: 'sh',
    nm: 'Path',
    ks: val({ i: inT, o: outT, v: vertices, c: closed }),
  };
}

// ── Layer factory ──────────────────────────────────────────
let LAYER_IDX = 1;
function layer(nm, shapes, ks, ip = 0, op = OP) {
  return {
    ddd: 0,
    ind: LAYER_IDX++,
    ty: 4,
    nm,
    sr: 1,
    ks: {
      o: ks.o ?? val(100),
      r: ks.r ?? val(0),
      p: ks.p ?? val([540, 960, 0]),
      a: ks.a ?? val([0, 0, 0]),
      s: ks.s ?? val([100, 100, 100]),
    },
    ao: 0,
    shapes,
    ip,
    op,
    st: 0,
    bm: 0,
  };
}

// ════════════════════════════════════════════════════════════
// LAYERS  (declared front→back, reversed before export)
// ════════════════════════════════════════════════════════════
const layers = [];

// BG_Gradient — soft radial light, static.
layers.push(
  layer(
    'BG_Gradient',
    [
      group('bg', [
        rect([W, H], 0, [0, 0]),
        {
          ty: 'gf', nm: 'Gradient', o: val(100), r: 1, t: 2,
          s: val([0, -260]), e: val([0, 760]), h: val(0), a: val(0),
          g: {
            p: 3,
            k: val([
              0, 0.965, 0.976, 1,
              0.5, 0.984, 0.99, 1,
              1, 1, 1, 1,
            ]),
          },
        },
        trGroup({ p: val([W / 2, H / 2]) }),
      ]),
    ],
    { p: val([540, 960, 0]) },
  ),
);

// Particles — staggered floating dots with drift + twinkle.
const particleSpecs = [
  { x: 180, y: 520, r: 7, c: C.secondary, delay: 0 },
  { x: 880, y: 420, r: 5, c: C.accent, delay: 18 },
  { x: 320, y: 1320, r: 6, c: C.secondary, delay: 30 },
  { x: 760, y: 1180, r: 5, c: C.primary, delay: 12 },
  { x: 540, y: 300, r: 4, c: C.accent, delay: 40 },
  { x: 960, y: 860, r: 6, c: C.secondary, delay: 24 },
  { x: 140, y: 980, r: 5, c: C.primary, delay: 48 },
];
particleSpecs.forEach((p, i) => {
  layers.push(
    layer(
      `Particles_${i + 1}`,
      [group('p', [ellipse([p.r * 2, p.r * 2]), fill(p.c, 60), trGroup()])],
      {
        o: anim([kf(p.delay, [0]), kf(p.delay + 40, [55]), kf(p.delay + 160, [55]), kf(p.delay + 220, [0], 'in')]),
        p: anim([kf(0, [p.x, p.y, 0], 'inOut'), kf(140, [p.x + 14, p.y - 40, 0], 'inOut'), kf(280, [p.x - 10, p.y - 90, 0], 'inOut')]),
        s: anim([kf(p.delay, [40, 40, 100], 'out'), kf(p.delay + 40, [100, 100, 100], 'out')]),
      },
    ),
  );
});

// Flight_Path — curved trail that draws in across Scene 3, fades in Scene 5.
layers.push(
  layer(
    'Flight_Path',
    [
      group('path', [
        pathShape(
          // v: anchor points; i/o: bezier tangents (relative)
          [[230, 1180], [540, 560], [880, 980]],
          [[0, 0], [-160, 0], [-120, 0]],
          [[160, 0], [160, 0], [0, 0]],
          false,
        ),
        stroke(C.secondary, 7, 90),
        { ty: 'tm', nm: 'Trim', s: val(0), e: anim([kf(170, [0], 'out'), kf(300, [100], 'out')]), o: val(0), m: 1 },
        { ty: 'd', nm: 'Dash', k: [{ n: 'd', nm: 'dash', v: val(2) }, { n: 'g', nm: 'gap', v: val(22) }, { n: 'o', nm: 'offset', v: val(0) }] },
        trGroup(),
      ]),
    ],
    { o: anim([kf(165, [0], 'out'), kf(185, [100]), kf(400, [100]), kf(450, [0], 'in')]) },
  ),
);

// Origin_Marker — pulsing ring + dot (India side).
const marker = (nm, pos, color, appearFrame) =>
  layer(
    nm,
    [
      group('ring', [
        ellipse([60, 60]),
        stroke(color, 5, 100),
        trGroup({ s: anim([kf(appearFrame, [40, 40], 'overshoot'), kf(appearFrame + 30, [120, 120], 'out'), kf(appearFrame + 90, [40, 40], 'inOut'), kf(appearFrame + 150, [120, 120], 'out')]), o: anim([kf(appearFrame, [0]), kf(appearFrame + 20, [80]), kf(appearFrame + 90, [10], 'inOut'), kf(appearFrame + 150, [80])]) }),
      ]),
      group('dot', [ellipse([26, 26]), fill(color), trGroup()]),
    ],
    {
      p: val([pos[0], pos[1], 0]),
      o: anim([kf(appearFrame, [0], 'out'), kf(appearFrame + 18, [100])]),
      s: anim([kf(appearFrame, [0, 0, 100], 'overshoot'), kf(appearFrame + 22, [100, 100, 100], 'out')]),
    },
    appearFrame,
  );
layers.push(marker('Destination_Marker', [880, 980], C.accent, 250));
layers.push(marker('Origin_Marker', [230, 1180], C.primary, 12));

// Clouds — soft drifting rounded blobs (parallax).
const cloud = (nm, y, scale, speed, color, op) =>
  layer(
    nm,
    [
      group('c', [
        ellipse([180, 90], [-70, 0]),
        ellipse([200, 120], [40, -10]),
        ellipse([160, 90], [150, 0]),
        fill(color, op),
        trGroup(),
      ]),
    ],
    {
      s: val([scale, scale, 100]),
      o: anim([kf(150, [0], 'out'), kf(200, [100]), kf(420, [100]), kf(460, [0])]),
      p: anim([kf(150, [1200, y, 0], 'inOut'), kf(380, [1200 - speed, y, 0], 'inOut')]),
    },
    150,
  );
layers.push(cloud('Clouds_2', 720, 70, 1500, C.paleBlue, 90));
layers.push(cloud('Clouds_1', 480, 100, 1900, C.white, 100));

// Gift (HERO) — glow + box + ribbon. Appears at origin, snaps to plane, rides, descends.
const giftPos = anim([
  kf(20, [230, 1190, 0], 'overshoot'), // appear at sender
  kf(60, [230, 1180, 0], 'inOut'),
  kf(150, [230, 1180, 0], 'inOut'), // held
  kf(178, [250, 820, 0], 'out'), // magnetic snap under plane
  kf(210, [430, 620, 0], 'inOut'),
  kf(270, [650, 600, 0], 'inOut'),
  kf(315, [860, 820, 0], 'inOut'),
  kf(345, [880, 980, 0], 'out'), // descend onto destination
  kf(420, [880, 980, 0], 'inOut'),
]);
layers.push(
  layer(
    'Gift',
    [
      // soft glow halo (hero emphasis)
      group('glow', [
        ellipse([150, 150]),
        fill(C.giftGlow, 24),
        trGroup({ s: anim([kf(20, [70, 70], 'out'), kf(70, [120, 120], 'inOut'), kf(160, [150, 150], 'inOut'), kf(250, [120, 120], 'inOut'), kf(345, [170, 170], 'out')]), o: anim([kf(20, [0]), kf(60, [70]), kf(345, [90]), kf(400, [40])]) }),
      ]),
      // box
      group('box', [rect([84, 70], 12), fill(C.secondary), trGroup()]),
      // lid
      group('lid', [rect([92, 22], 6, [0, -34]), fill(C.primary), trGroup()]),
      // ribbon vertical
      group('ribbonV', [rect([14, 70], 2), fill(C.white, 95), trGroup()]),
      // bow
      group('bow', [ellipse([22, 18], [-12, -40]), ellipse([22, 18], [12, -40]), fill(C.accent), trGroup()]),
    ],
    {
      p: giftPos,
      a: val([0, 0, 0]),
      // gentle squash on snap + settle
      s: anim([kf(150, [100, 100, 100], 'inOut'), kf(176, [88, 112, 100], 'out'), kf(190, [104, 96, 100], 'inOut'), kf(205, [100, 100, 100], 'out'), kf(340, [100, 100, 100], 'inOut'), kf(352, [112, 88, 100], 'out'), kf(366, [100, 100, 100], 'overshoot')]),
      r: anim([kf(178, [-6], 'out'), kf(210, [2], 'inOut'), kf(315, [0], 'inOut')]),
    },
    20,
  ),
);

// Plane — sleek jet, enters left, arcs across, exits to destination.
const planePos = anim([
  kf(95, [-240, 760, 0], 'out'),
  kf(150, [250, 720, 0], 'inOut'), // pickup pass over origin
  kf(210, [430, 540, 0], 'inOut'),
  kf(270, [650, 520, 0], 'inOut'),
  kf(320, [860, 740, 0], 'inOut'),
  kf(360, [940, 900, 0], 'in'),
]);
layers.push(
  layer(
    'Plane',
    [
      group('jet', [
        // fuselage + wings as a single sleek path
        pathShape(
          [[-90, 0], [40, -14], [78, -6], [78, 6], [40, 14], [-90, 8], [-70, 30], [-92, 30], [-100, 6], [-100, -6], [-92, -30], [-70, -30], [-90, -8]],
          Array(13).fill([0, 0]),
          Array(13).fill([0, 0]),
          true,
        ),
        fill(C.primary),
      ]),
      group('wing', [
        pathShape([[-10, 0], [30, -40], [44, -36], [18, 4]], Array(4).fill([0, 0]), Array(4).fill([0, 0]), true),
        fill(C.secondary),
      ]),
      group('window', [ellipse([10, 10], [30, -2]), fill(C.white, 90), trGroup()]),
      trGroup({ s: val([120, 120]) }),
    ],
    {
      p: planePos,
      a: val([0, 0, 0]),
      o: anim([kf(90, [0], 'out'), kf(112, [100]), kf(352, [100]), kf(368, [0], 'in')]),
      r: anim([kf(95, [-8], 'out'), kf(210, [-14], 'inOut'), kf(270, [4], 'inOut'), kf(360, [20], 'in')]),
    },
    90,
  ),
);

// Success_Glow — radial bloom at destination on arrival.
layers.push(
  layer(
    'Success_Glow',
    [
      group('g', [
        ellipse([280, 280]),
        { ty: 'gf', nm: 'Grad', o: val(100), r: 1, t: 2, s: val([0, 0]), e: val([140, 0]), h: val(0), a: val(0),
          g: { p: 3, k: val([0, 0.063, 0.725, 0.506, 0.6, 0.078, 0.722, 0.651, 1, 1, 1, 1, 0, 0, 0]) } },
        trGroup(),
      ]),
    ],
    {
      p: val([880, 980, 0]),
      o: anim([kf(330, [0], 'out'), kf(352, [70]), kf(380, [22], 'inOut'), kf(405, [55]), kf(450, [0], 'in')]),
      s: anim([kf(330, [20, 20, 100], 'out'), kf(360, [120, 120, 100], 'out'), kf(405, [150, 150, 100], 'inOut')]),
    },
    330,
  ),
);

// Reverse so the array is back→front for Lottie (first drawn = bottom).
const doc = {
  v: '5.9.0',
  fr: FR,
  ip: 0,
  op: OP,
  w: W,
  h: H,
  nm: 'CarryMate Splash',
  ddd: 0,
  assets: [],
  layers: layers.reverse().map((l, i) => ({ ...l, ind: i + 1 })),
};

const outDir = path.join(__dirname, '..', 'src', 'assets', 'lottie');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'splash.json');
fs.writeFileSync(outFile, JSON.stringify(doc));
const kb = (fs.statSync(outFile).size / 1024).toFixed(1);
console.log(`✓ wrote ${outFile} (${kb} KB, ${doc.layers.length} layers, ${(OP / FR).toFixed(1)}s @ ${FR}fps)`);
