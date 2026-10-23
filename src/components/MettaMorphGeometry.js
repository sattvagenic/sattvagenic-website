// Facial geometry only. No network calls or biometric identity comparison.
export const FACE_ANCHORS = [
  ['leftEye', 'Left eye in image'], ['rightEye', 'Right eye in image'],
  ['nose', 'Nose tip'], ['mouthLeft', 'Left mouth corner'], ['mouthRight', 'Right mouth corner'],
  ['chin', 'Chin'], ['cheekLeft', 'Left cheek'], ['cheekRight', 'Right cheek'], ['forehead', 'Top of forehead'],
];
const mean = points => [0, 1].map(k => points.reduce((s, p) => s + p[k], 0) / points.length);
const mix = (a, b, t) => a.map((v, k) => v + (b[k] - v) * t);
export function faceAnchors(face) {
  const p = face.points, leftEye = mean(p.slice(36, 42)), rightEye = mean(p.slice(42, 48));
  const mid = mean([leftEye, rightEye]), aspect = face.aspect || 1;
  const dx = (rightEye[0] - leftEye[0]) * aspect, dy = rightEye[1] - leftEye[1];
  return { leftEye, rightEye, nose: p[30], mouthLeft: p[48], mouthRight: p[54], chin: p[8], cheekLeft: p[0], cheekRight: p[16], forehead: face.forehead || [mid[0] + dy * .95 / aspect, mid[1] - dx * .95] };
}
export function seedManualFace(aspect = 1) {
  const p = [];
  for (let i = 0; i < 17; i++) { const a = Math.PI * i / 16; p.push([.5 - .24 * Math.cos(a), .50 + .38 * Math.sin(a)]); }
  for (const cx of [.38, .62]) for (let i = 0; i < 5; i++) p.push([cx + (i - 2) * .035, .30 - .018 * Math.sin(Math.PI * i / 4)]);
  for (let i = 0; i < 4; i++) p.push([.5, .40 + i * .05]);
  for (let i = 0; i < 5; i++) p.push([.44 + i * .03, .55 + .025 * Math.sin(Math.PI * i / 4)]);
  for (const cx of [.38, .62]) for (let i = 0; i < 6; i++) { const a = Math.PI + i * Math.PI / 3; p.push([cx + .065 * Math.cos(a), .37 + .027 * Math.sin(a)]); }
  for (let i = 0; i < 12; i++) { const a = Math.PI + i * Math.PI / 6; p.push([.5 + .10 * Math.cos(a), .69 + .033 * Math.sin(a)]); }
  for (let i = 0; i < 8; i++) { const a = Math.PI + i * Math.PI / 4; p.push([.5 + .075 * Math.cos(a), .69 + .015 * Math.sin(a)]); }
  return { points: p, forehead: [.5, .11], aspect, source: 'manual' };
}
export function moveFaceAnchor(face, key, target) {
  const anchors = faceAnchors(face), origin = anchors[key];
  if (key === 'forehead') return { ...face, forehead: target, source: 'adjusted' };
  const delta = target.map((v, i) => v - origin[i]);
  const groups = { leftEye: [36, 37, 38, 39, 40, 41], rightEye: [42, 43, 44, 45, 46, 47], nose: [30], mouthLeft: [48], mouthRight: [54], chin: [8], cheekLeft: [0], cheekRight: [16] };
  const radius = Math.max(.07, Math.hypot(anchors.leftEye[0] - anchors.rightEye[0], anchors.leftEye[1] - anchors.rightEye[1]) * .55);
  const points = face.points.map((p, i) => {
    const weight = groups[key].includes(i) ? 1 : Math.exp(-((p[0] - origin[0]) ** 2 + (p[1] - origin[1]) ** 2) / (radius * radius * .36));
    return p.map((v, k) => v + delta[k] * weight);
  });
  return { ...face, points, source: 'adjusted' };
}
export function eyeTransform(face, width, height, viewWidth = 1200, viewHeight = 800) {
  const anchors = faceAnchors(face);
  const left = [anchors.leftEye[0] * width, anchors.leftEye[1] * height], right = [anchors.rightEye[0] * width, anchors.rightEye[1] * height];
  const dx = right[0] - left[0], dy = right[1] - left[1], distance = Math.hypot(dx, dy);
  if (distance < Math.min(width, height) * .025) throw new Error('Keep the two eye points separate.');
  const scale = viewWidth * .20 / distance, angle = -Math.atan2(dy, dx);
  const a = Math.cos(angle) * scale, b = Math.sin(angle) * scale, c = -b, d = a;
  const mid = mean([left, right]);
  return [a, b, c, d, viewWidth / 2 - a * mid[0] - c * mid[1], viewHeight * .36 - b * mid[0] - d * mid[1]];
}
function project(point, transform, width, height) {
  const [a, b, c, d, e, f] = transform, x = point[0] * width, y = point[1] * height;
  return [a * x + c * y + e, b * x + d * y + f];
}
function foreheadPoints(face) {
  const a = faceAnchors(face), center = mean([a.cheekLeft, a.cheekRight]);
  const side = a.cheekRight.map((v, i) => (v - a.cheekLeft[i]) / 2);
  const top = a.forehead.map((v, i) => v - center[i]);
  return [1, 2, 3, 4, 5].map(i => { const theta = Math.PI * i / 6; return center.map((v, k) => v - side[k] * Math.cos(theta) + top[k] * Math.sin(theta)); });
}
export function triangulate(points) {
  const count = points.length, all = [...points, [-50000, -50000], [50000, -50000], [0, 50000]];
  function triangle(ids) {
    const [a, b, c] = ids.map(i => all[i]);
    const denominator = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
    if (Math.abs(denominator) < .000001) return null;
    const squares = [a, b, c].map(p => p[0] ** 2 + p[1] ** 2);
    const x = (squares[0] * (b[1] - c[1]) + squares[1] * (c[1] - a[1]) + squares[2] * (a[1] - b[1])) / denominator;
    const y = (squares[0] * (c[0] - b[0]) + squares[1] * (a[0] - c[0]) + squares[2] * (b[0] - a[0])) / denominator;
    return { ids, x, y, radius: (a[0] - x) ** 2 + (a[1] - y) ** 2 };
  }
  let triangles = [triangle([count, count + 1, count + 2])];
  for (let i = 0; i < count; i++) {
    const point = all[i], bad = triangles.filter(t => (point[0] - t.x) ** 2 + (point[1] - t.y) ** 2 < t.radius + .00001), edges = new Map();
    for (const t of bad) for (const edge of [[t.ids[0], t.ids[1]], [t.ids[1], t.ids[2]], [t.ids[2], t.ids[0]]]) {
      const key = [...edge].sort((a, b) => a - b).join(':'); if (edges.has(key)) edges.delete(key); else edges.set(key, edge);
    }
    const badSet = new Set(bad); triangles = triangles.filter(t => !badSet.has(t));
    for (const edge of edges.values()) { const t = triangle([...edge, i]); if (t) triangles.push(t); }
  }
  return triangles.filter(t => t.ids.every(i => i < count)).map(t => t.ids);
}
export function prepareFaceMorph(images, width = 1200, height = 800) {
  const border = [[0, 0], [width / 2, 0], [width, 0], [width, height / 2], [width, height], [width / 2, height], [0, height], [0, height / 2]];
  const data = images.map(image => {
    const transform = eyeTransform(image.face, image.img.width, image.img.height, width, height);
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#101315'; ctx.fillRect(0, 0, width, height);
    ctx.setTransform(...transform); ctx.drawImage(image.img, 0, 0); ctx.resetTransform();
    const a = faceAnchors(image.face), controls = [...image.face.points, ...foreheadPoints(image.face), a.leftEye, a.rightEye];
    return { canvas, points: [...controls.map(p => project(p, transform, image.img.width, image.img.height)), ...border] };
  });
  const middle = data[0].points.map((p, i) => mix(p, data[1].points[i], .5));
  // Remove coincident controls identically from both meshes before triangulating.
  const kept = middle.map((p, i) => i).filter(i => !middle.slice(0, i).some(p => Math.hypot(p[0] - middle[i][0], p[1] - middle[i][1]) < .025));
  const points = data.map(d => kept.map(i => d.points[i]));
  return { layers: data.map(d => d.canvas), mesh: { points, triangles: triangulate(kept.map(i => middle[i])), width, height } };
}
export function warpFace(context, source, from, to, triangles) {
  const width = source.width, height = source.height;
  context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, width, height); context.fillStyle = '#101315'; context.fillRect(0, 0, width, height);
  for (const ids of triangles) {
    const [s0, s1, s2] = ids.map(i => from[i]), [d0, d1, d2] = ids.map(i => to[i]);
    const sx1 = s1[0] - s0[0], sy1 = s1[1] - s0[1], sx2 = s2[0] - s0[0], sy2 = s2[1] - s0[1];
    const dx1 = d1[0] - d0[0], dy1 = d1[1] - d0[1], dx2 = d2[0] - d0[0], dy2 = d2[1] - d0[1];
    const det = sx1 * sy2 - sx2 * sy1;
    if (Math.abs(det) < .00001) continue;
    const a = (dx1 * sy2 - dx2 * sy1) / det, b = (dy1 * sy2 - dy2 * sy1) / det;
    const c = (dx2 * sx1 - dx1 * sx2) / det, d = (dy2 * sx1 - dy1 * sx2) / det;
    // Offset the edges, rather than moving vertices radially: even thin facial
    // triangles need subpixel overlap along their entire antialiased boundary.
    const destination = [d0, d1, d2], orientation = Math.sign(dx1 * dy2 - dx2 * dy1) || 1;
    const normals = destination.map((p, i) => {
      const next = destination[(i + 1) % 3], x = next[0] - p[0], y = next[1] - p[1], length = Math.hypot(x, y) || 1;
      return [orientation * y / length, -orientation * x / length];
    });
    const clip = destination.map((p, i) => {
      const a = normals[(i + 2) % 3], b = normals[i], denominator = Math.max(.001, 1 + a[0] * b[0] + a[1] * b[1]);
      const delta = [(a[0] + b[0]) * .65 / denominator, (a[1] + b[1]) * .65 / denominator], length = Math.hypot(...delta);
      return p.map((v, k) => v + delta[k] * Math.min(1, 4 / (length || 1)));
    });
    context.save(); context.beginPath(); context.moveTo(...clip[0]); context.lineTo(...clip[1]); context.lineTo(...clip[2]); context.closePath(); context.clip();
    context.setTransform(a, b, c, d, d0[0] - a * s0[0] - c * s0[1], d0[1] - b * s0[0] - d * s0[1]);
    context.drawImage(source, 0, 0); context.restore();
  }
}
