/* eslint-disable */
/**
 * CarryMate splash — Lottie generator (logo-as-story).
 *
 * The brand symbol is a flight ROUTE that forms a "C": an origin point, a curved
 * route arcing left (the C), a capsule marker on the route, and a destination
 * point. The splash literally draws that logo, sends a capsule along it, morphs
 * it into a traveler token, lights the destination, then settles into the mark.
 *
 * Schema-valid, vector-only. Run: node scripts/build-splash-lottie.cjs
 *
 * Timeline (60fps, 1080x1920, 7.0s = 420f):
 *   S1 0.0–1.3  route "C" draws in; particles; geo hints
 *   S2 1.3–2.2  capsule glows at origin
 *   S3 2.2–4.0  capsule travels the C route
 *   S4 4.0–4.8  capsule morphs to traveler token
 *   S5 4.8–6.0  destination illuminates; route lights up fully; success bloom
 *   S6 6.0–7.0  settles into the logo mark (wordmark+tagline = RN overlay)
 */
const fs = require('fs');
const path = require('path');

const FR = 60, OP = 420, W = 1080, H = 1920;

const C = {
  primary: [0.118, 0.251, 0.686, 1],
  secondary: [0.231, 0.51, 0.965, 1],
  accent: [0.078, 0.722, 0.651, 1],
  white: [1, 1, 1, 1],
  pale: [0.965, 0.976, 1, 1],
};

const EASE = {
  inOut: { o: { x: [0.42], y: [0] }, i: { x: [0.58], y: [1] } },
  out: { o: { x: [0.16], y: [0.84] }, i: { x: [0.3], y: [1] } },
  in: { o: { x: [0.7], y: [0] }, i: { x: [0.84], y: [1] } },
  overshoot: { o: { x: [0.34], y: [0] }, i: { x: [0.22], y: [1.4] } },
};
const kf = (t, s, ease = 'inOut') => ({ t, s, ...EASE[ease] });
const anim = (k) => ({ a: 1, k });
const val = (k) => ({ a: 0, k });

const fill = (c, o = 100) => ({ ty: 'fl', c: val(c), o: val(o), r: 1, nm: 'Fill' });
const stroke = (c, w, o = 100) => ({ ty: 'st', c: val(c), o: val(o), w: val(w), lc: 2, lj: 2, ml: 4, nm: 'Stroke' });
const ellipse = (s, p = [0, 0]) => ({ ty: 'el', p: val(p), s: val(s), nm: 'Ellipse' });
const rect = (s, r = 0, p = [0, 0]) => ({ ty: 'rc', p: val(p), s: val(s), r: val(r), nm: 'Rect' });
const trGroup = (e = {}) => ({ ty: 'tr', p: e.p ?? val([0, 0]), a: e.a ?? val([0, 0]), s: e.s ?? val([100, 100]), r: e.r ?? val(0), o: e.o ?? val(100), nm: 'Transform' });
const group = (nm, it) => ({ ty: 'gr', nm, it });

// ── C-route geometry (the brand symbol) ────────────────────
const CX = 540, CY = 770, R = 210;
const D2R = Math.PI / 180;
// Descending angles 300→60 (y-down): right-up → top → left → bottom → right-down.
// This is the "C" opening to the right.
const ANGLES = [300, 255, 210, 180, 150, 105, 60];
function pt(a) {
  return [Math.round(CX + R * Math.cos(a * D2R)), Math.round(CY + R * Math.sin(a * D2R))];
}
function routePath() {
  const v = [], iT = [], oT = [];
  const h = R * 0.42; // tangent handle length
  ANGLES.forEach((a) => {
    v.push(pt(a));
    // travel direction for decreasing angle = (sin, -cos)
    const tx = Math.sin(a * D2R), ty = -Math.cos(a * D2R);
    oT.push([Math.round(tx * h), Math.round(ty * h)]);
    iT.push([Math.round(-tx * h), Math.round(-ty * h)]);
  });
  return { i: iT, o: oT, v, c: false };
}
const ORIGIN = pt(300); // top-right tip
const DEST = pt(60); // bottom-right tip
// Capsule waypoints along the C (origin → around left → destination).
const WAY = ANGLES.map(pt);

let IDX = 1;
const layer = (nm, shapes, ks, ip = 0, op = OP) => ({
  ddd: 0, ind: IDX++, ty: 4, nm, sr: 1,
  ks: { o: ks.o ?? val(100), r: ks.r ?? val(0), p: ks.p ?? val([CX, CY, 0]), a: ks.a ?? val([0, 0, 0]), s: ks.s ?? val([100, 100, 100]) },
  ao: 0, shapes, ip, op, st: 0, bm: 0,
});

const layers = [];

// BG_Gradient
layers.push(layer('BG_Gradient', [group('bg', [
  rect([W, H], 0, [0, 0]),
  { ty: 'gf', nm: 'Grad', o: val(100), r: 1, t: 2, s: val([0, -200]), e: val([0, 820]), h: val(0), a: val(0),
    g: { p: 3, k: val([0, 0.965, 0.976, 1, 0.5, 0.985, 0.99, 1, 1, 1, 1, 1]) } },
  trGroup({ p: val([W / 2, H / 2]) }),
])], { p: val([540, 960, 0]) }));

// Geo_Hints — abstract India (left) + UAE (right) soft blobs behind the route.
const geo = (nm, p, color, appear) => layer(nm, [group('g', [
  ellipse([320, 220]), fill(color, 12), trGroup(),
])], {
  p: val([p[0], p[1], 0]),
  o: anim([kf(appear, [0], 'out'), kf(appear + 40, [100]), kf(360, [100]), kf(400, [0], 'in')]),
  s: anim([kf(appear, [70, 70, 100], 'out'), kf(appear + 50, [100, 100, 100], 'out')]),
}, appear);
layers.push(geo('Geo_UAE', [DEST[0] + 40, DEST[1] + 30], C.accent, 150));
layers.push(geo('Geo_India', [ORIGIN[0] + 40, ORIGIN[1] - 30], C.primary, 30));

// Particles
const PS = [
  { x: 300, y: 480, r: 7, c: C.secondary, d: 0 }, { x: 820, y: 520, r: 5, c: C.accent, d: 20 },
  { x: 360, y: 1180, r: 6, c: C.secondary, d: 34 }, { x: 760, y: 1120, r: 5, c: C.primary, d: 14 },
  { x: 520, y: 360, r: 4, c: C.accent, d: 44 }, { x: 900, y: 900, r: 6, c: C.secondary, d: 26 },
];
PS.forEach((p, i) => layers.push(layer(`Particles_${i + 1}`, [group('p', [ellipse([p.r * 2, p.r * 2]), fill(p.c, 55), trGroup()])], {
  o: anim([kf(p.d, [0]), kf(p.d + 36, [55]), kf(360, [55]), kf(410, [0], 'in')]),
  p: anim([kf(0, [p.x, p.y, 0]), kf(260, [p.x + 12, p.y - 70, 0])]),
  s: anim([kf(p.d, [40, 40, 100], 'out'), kf(p.d + 40, [100, 100, 100], 'out')]),
})));

// Route_Base — the "C" route drawing in (Scene 1), gradient stroke.
layers.push(layer('Route_Base', [group('route', [
  { ...{ ty: 'sh', nm: 'C', ks: val(routePath()) } },
  { ty: 'gs', nm: 'GradStroke', o: val(100), w: val(34), lc: 2, lj: 2, ml: 4, t: 1,
    s: val([ORIGIN[0], ORIGIN[1]]), e: val([DEST[0], DEST[1]]), h: val(0), a: val(0),
    g: { p: 3, k: val([0, 0.118, 0.251, 0.686, 0.5, 0.231, 0.51, 0.965, 1, 0.078, 0.722, 0.651]) } },
  { ty: 'tm', nm: 'Draw', s: val(0), e: anim([kf(10, [0], 'out'), kf(80, [100], 'out')]), o: val(0), m: 1 },
  trGroup(),
])], { o: anim([kf(8, [0], 'out'), kf(20, [100])]) }, 8));

// Route_Light — bright accent overlay that lights the route fully in Scene 5.
layers.push(layer('Route_Light', [group('routeL', [
  { ty: 'sh', nm: 'C', ks: val(routePath()) },
  stroke(C.accent, 34, 100),
  { ty: 'tm', nm: 'Light', s: val(0), e: anim([kf(288, [0], 'out'), kf(340, [100], 'out')]), o: val(0), m: 1 },
  trGroup(),
])], { o: anim([kf(288, [0], 'out'), kf(300, [80]), kf(360, [80]), kf(395, [0], 'in')]) }, 288));

// Origin_Point
layers.push(layer('Origin_Point', [
  group('ring', [ellipse([70, 70]), stroke(C.primary, 5), trGroup({
    s: anim([kf(60, [50, 50], 'overshoot'), kf(95, [125, 125], 'out'), kf(150, [60, 60], 'inOut')]),
    o: anim([kf(60, [0]), kf(80, [70]), kf(150, [0], 'inOut')]) })]),
  group('dot', [ellipse([30, 30]), fill(C.primary), trGroup()]),
], {
  p: val([ORIGIN[0], ORIGIN[1], 0]),
  o: anim([kf(55, [0], 'out'), kf(75, [100])]),
  s: anim([kf(55, [0, 0, 100], 'overshoot'), kf(80, [100, 100, 100], 'out')]),
}, 55));

// Destination_Point — illuminates on arrival (Scene 5).
layers.push(layer('Destination_Point', [
  group('ring', [ellipse([70, 70]), stroke(C.accent, 5), trGroup({
    s: anim([kf(288, [50, 50], 'overshoot'), kf(330, [140, 140], 'out'), kf(380, [70, 70], 'inOut')]),
    o: anim([kf(288, [0]), kf(305, [80]), kf(380, [10], 'inOut')]) })]),
  group('dot', [ellipse([30, 30]), fill(C.accent), trGroup()]),
], {
  p: val([DEST[0], DEST[1], 0]),
  o: anim([kf(150, [0], 'out'), kf(175, [55]), kf(288, [55]), kf(305, [100], 'out')]),
  s: anim([kf(150, [60, 60, 100], 'out'), kf(288, [70, 70, 100], 'inOut'), kf(310, [100, 100, 100], 'overshoot')]),
}, 150));

// Token — capsule (sender's item) that morphs into a traveler token; rides the C.
const tokenPos = anim([
  kf(78, [ORIGIN[0], ORIGIN[1], 0], 'out'), // appear at origin
  kf(132, [ORIGIN[0], ORIGIN[1], 0], 'inOut'), // pulse/hold
  kf(150, [WAY[1][0], WAY[1][1], 0], 'out'), // start moving
  kf(190, [WAY[2][0], WAY[2][1], 0], 'inOut'),
  kf(220, [WAY[3][0], WAY[3][1], 0], 'inOut'),
  kf(250, [WAY[4][0], WAY[4][1], 0], 'inOut'),
  kf(280, [WAY[5][0], WAY[5][1], 0], 'inOut'),
  kf(305, [DEST[0], DEST[1], 0], 'out'), // arrive
  kf(330, [DEST[0], DEST[1], 0], 'inOut'), // hold during success
  kf(392, [WAY[3][0], WAY[3][1], 0], 'inOut'), // settle onto route as the logo capsule (left)
]);
layers.push(layer('Token', [
  // glow halo (hero emphasis throughout)
  group('glow', [ellipse([120, 120]), fill(C.secondary, 22), trGroup({
    s: anim([kf(78, [60, 60], 'out'), kf(130, [115, 115], 'inOut'), kf(240, [100, 100], 'inOut'), kf(305, [150, 150], 'out')]),
    o: anim([kf(78, [0]), kf(110, [70]), kf(305, [90]), kf(360, [40])]) })]),
  // capsule body (Scene 2-3) → recolors to accent "traveler token" (Scene 4)
  group('capsule', [rect([66, 40], 20), {
    ty: 'fl', nm: 'Fill', r: 1, o: val(100),
    c: anim([kf(0, C.secondary), kf(240, C.secondary), kf(262, C.accent, 'inOut'), kf(360, C.accent), kf(388, C.secondary, 'inOut')]) }, trGroup()]),
  // token "people" accent ring during the morph (Scene 4), fades before the logo lock
  group('ring', [ellipse([20, 20]), stroke(C.white, 4, 90), trGroup({
    o: anim([kf(240, [0], 'out'), kf(268, [100]), kf(360, [100]), kf(384, [0], 'in')]) })]),
], {
  p: tokenPos,
  // pulse at origin, squash through morph, settle
  s: anim([kf(78, [0, 0, 100], 'overshoot'), kf(104, [100, 100, 100], 'out'),
    kf(120, [108, 92, 100], 'inOut'), kf(134, [96, 108, 100], 'inOut'), kf(148, [100, 100, 100], 'out'),
    kf(248, [86, 114, 100], 'out'), kf(264, [112, 90, 100], 'inOut'), kf(280, [100, 100, 100], 'overshoot')]),
  o: anim([kf(78, [0], 'out'), kf(96, [100])]),
}, 78));

// Success_Glow — bloom at destination.
layers.push(layer('Success_Glow', [group('g', [
  ellipse([300, 300]),
  { ty: 'gf', nm: 'Grad', o: val(100), r: 1, t: 2, s: val([0, 0]), e: val([150, 0]), h: val(0), a: val(0),
    g: { p: 3, k: val([0, 0.078, 0.722, 0.651, 0.6, 0.231, 0.51, 0.965, 1, 1, 1, 1, 0, 0, 0]) } },
  trGroup(),
])], {
  p: val([DEST[0], DEST[1], 0]),
  o: anim([kf(292, [0], 'out'), kf(320, [70]), kf(350, [25], 'inOut'), kf(380, [50]), kf(410, [0], 'in')]),
  s: anim([kf(292, [20, 20, 100], 'out'), kf(330, [120, 120, 100], 'out'), kf(390, [150, 150, 100], 'inOut')]),
}, 292));

const doc = {
  v: '5.9.0', fr: FR, ip: 0, op: OP, w: W, h: H, nm: 'CarryMate Splash', ddd: 0, assets: [],
  layers: layers.reverse().map((l, i) => ({ ...l, ind: i + 1 })),
};

const outDir = path.join(__dirname, '..', 'src', 'assets', 'lottie');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'splash.json');
fs.writeFileSync(outFile, JSON.stringify(doc));
console.log(`✓ ${outFile} (${(fs.statSync(outFile).size / 1024).toFixed(1)} KB, ${doc.layers.length} layers, ${(OP / FR).toFixed(1)}s @ ${FR}fps)`);
console.log(`  origin ${ORIGIN}  dest ${DEST}  center ${[CX, CY]} r${R}`);
