import React, { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial, Edges, PresentationControls, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useControls, folder } from 'leva';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════
//  PROCEDURAL TEXTURES
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a procedural normal map that simulates carved/weathered surface.
 * Combines multiple noise octaves for organic micro-detail.
 */
function createSurfaceNormalMap(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  // Simple value noise
  function hash(x, y) {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) & 0xffff) / 65535.0;
  }

  function smoothNoise(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    // Smoothstep
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);

    const a = hash(ix, iy);
    const b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1);
    const d = hash(ix + 1, iy + 1);

    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }

  function fbm(x, y, octaves = 5) {
    let val = 0, amp = 0.5, freq = 1;
    for (let i = 0; i < octaves; i++) {
      val += amp * smoothNoise(x * freq, y * freq);
      amp *= 0.5;
      freq *= 2.1;
    }
    return val;
  }

  // Build height map
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Combine scales for carved stone feel
      const coarse = fbm(x * 0.02, y * 0.02, 4) * 0.6;
      const fine = fbm(x * 0.08 + 100, y * 0.08 + 100, 3) * 0.25;
      const micro = fbm(x * 0.25 + 200, y * 0.25 + 200, 2) * 0.15;
      heights[y * size + x] = coarse + fine + micro;
    }
  }

  // Convert height map to normal map (Sobel filter)
  const strength = 2.5;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const xp = Math.min(x + 1, size - 1);
      const xm = Math.max(x - 1, 0);
      const yp = Math.min(y + 1, size - 1);
      const ym = Math.max(y - 1, 0);

      const dx = (heights[y * size + xp] - heights[y * size + xm]) * strength;
      const dy = (heights[yp * size + x] - heights[ym * size + x]) * strength;

      // Normal: (-dx, -dy, 1) normalized, mapped to 0-255
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      data[idx]     = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round(((-dy / len) * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural roughness map — subtle variation so surface isn't uniformly smooth.
 */
function createRoughnessMap(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  function hash(x, y) {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) & 0xffff) / 65535.0;
  }

  function smoothNoise(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy);
    const b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1);
    const d = hash(ix + 1, iy + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const n1 = smoothNoise(x * 0.03, y * 0.03);
      const n2 = smoothNoise(x * 0.1 + 50, y * 0.1 + 50) * 0.4;
      const v = Math.round((n1 + n2) * 0.7 * 255);
      data[idx] = data[idx + 1] = data[idx + 2] = v;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Sri Yantra Mount Meru — v4
 *
 * Uses drei's MeshTransmissionMaterial for realistic crystal/glass.
 * Features: chromatic aberration, temporal distortion, anisotropic blur.
 * transmissionSampler mode for performance (shared buffer).
 */

// ═══════════════════════════════════════════════════════════════
//  COORDINATE TRANSFORM
// ═══════════════════════════════════════════════════════════════

const CX = 216;
const CY = 216;
const S = 120;

function sp(sx, sy) {
  return [(sx - CX) / S, (CY - sy) / S];
}

// ═══════════════════════════════════════════════════════════════
//  TRIANGLE DATA (from SVG)
// ═══════════════════════════════════════════════════════════════

const DOWN_SVG = [
  [[216, 306.44], [302.69, 193.74], [129.31, 193.74]],
  [[216, 278.96], [277.88, 174.25], [154.12, 174.25]],
  [[216, 260.94], [245.09, 202.97], [186.91, 202.97]],
  [[216, 227.62], [267.15, 154.03], [164.85, 154.03]],
  [[216, 239.26], [237.51, 212.3],  [194.49, 212.3]],
];

const UP_SVG = [
  [[216, 126.55], [302.69, 239.26], [129.31, 239.26]],
  [[216, 154.03], [280.37, 260.94], [151.63, 260.94]],
  [[216, 193.74], [260.5,  278.96], [171.5,  278.96]],
  [[216, 174.25], [246.17, 227.62], [185.83, 227.62]],
];

const MERU_TRIS = [
  { svg: DOWN_SVG[0], h: 0.09 },
  { svg: UP_SVG[0],   h: 0.09 },
  { svg: DOWN_SVG[1], h: 0.18 },
  { svg: UP_SVG[1],   h: 0.18 },
  { svg: DOWN_SVG[3], h: 0.28 },
  { svg: UP_SVG[2],   h: 0.28 },
  { svg: DOWN_SVG[2], h: 0.40 },
  { svg: UP_SVG[3],   h: 0.40 },
  { svg: DOWN_SVG[4], h: 0.55 },
];

const CIRCLE_RINGS = [
  { r: 134.83, y: 0.020, tubeR: 0.008 },
  { r: 130.43, y: 0.028, tubeR: 0.008 },
  { r: 126.78, y: 0.036, tubeR: 0.008 },
  { r: 122.77, y: 0.044, tubeR: 0.008 },
  { r: 104.38, y: 0.055, tubeR: 0.009 },
  { r:  90.35, y: 0.068, tubeR: 0.009 },
];

// ═══════════════════════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  GEOMETRY BUILDER
// ═══════════════════════════════════════════════════════════════

function makeTriPrismGeo(svgTri, height) {
  const pts = svgTri.map(([sx, sy]) => sp(sx, sy));
  const shape = new THREE.Shape();
  shape.moveTo(pts[0][0], pts[0][1]);
  shape.lineTo(pts[1][0], pts[1][1]);
  shape.lineTo(pts[2][0], pts[2][1]);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function AmberMaterial({ config, normalMap, roughnessMap }) {
  const { _normalScale, ...matProps } = config;
  return (
    <MeshTransmissionMaterial
      {...matProps}
      normalMap={normalMap}
      normalScale={[_normalScale ?? 0.35, _normalScale ?? 0.35]}
      roughnessMap={roughnessMap}
      toneMapped={true}
    />
  );
}

function TriPrism({ svgTri, height, config, normalMap, roughnessMap, edgeColor, edgeOpacity }) {
  const geo = useMemo(() => makeTriPrismGeo(svgTri, height), [svgTri, height]);
  return (
    <mesh geometry={geo}>
      <AmberMaterial config={config} normalMap={normalMap} roughnessMap={roughnessMap} />
      <Edges
        threshold={15}
        color={edgeColor}
        opacity={edgeOpacity}
        transparent
        lineWidth={1.2}
      />
    </mesh>
  );
}

function BhupuraBox({ args, position, config, normalMap, roughnessMap }) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <AmberMaterial config={config} normalMap={normalMap} roughnessMap={roughnessMap} />
    </mesh>
  );
}

function BhupuraFrame({ halfSizeSvg, gateWidthSvg, gateDepthSvg, height, tabWidthSvg, config, normalMap, roughnessMap }) {
  const hs = halfSizeSvg / S;
  const gw = gateWidthSvg / S;
  const gd = gateDepthSvg / S;
  const tw = tabWidthSvg / S;
  const wallW = 0.014;
  const y = height / 2;
  const p = { config, normalMap, roughnessMap };

  return (
    <group>
      <BhupuraBox args={[hs * 2, height, wallW]} position={[0, y, -hs]} {...p} />
      <BhupuraBox args={[hs * 2, height, wallW]} position={[0, y, hs]} {...p} />
      <BhupuraBox args={[wallW, height, hs * 2]} position={[-hs, y, 0]} {...p} />
      <BhupuraBox args={[wallW, height, hs * 2]} position={[hs, y, 0]} {...p} />
      <BhupuraBox args={[gw, height, gd]} position={[0, y, -(hs + gd / 2)]} {...p} />
      <BhupuraBox args={[tw, height, wallW]} position={[0, y, -(hs + gd)]} {...p} />
      <BhupuraBox args={[gw, height, gd]} position={[0, y, hs + gd / 2]} {...p} />
      <BhupuraBox args={[tw, height, wallW]} position={[0, y, hs + gd]} {...p} />
      <BhupuraBox args={[gd, height, gw]} position={[-(hs + gd / 2), y, 0]} {...p} />
      <BhupuraBox args={[wallW, height, tw]} position={[-(hs + gd), y, 0]} {...p} />
      <BhupuraBox args={[gd, height, gw]} position={[hs + gd / 2, y, 0]} {...p} />
      <BhupuraBox args={[wallW, height, tw]} position={[hs + gd, y, 0]} {...p} />
    </group>
  );
}

function CircleRing({ svgRadius, tubeR = 0.008, y = 0.042, config, normalMap, roughnessMap }) {
  const r = svgRadius / S;
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[r, tubeR, 8, 128]} />
      <AmberMaterial config={config} normalMap={normalMap} roughnessMap={roughnessMap} />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MERU ASSEMBLY
// ═══════════════════════════════════════════════════════════════

function MeruMesh() {
  const groupRef = useRef();

  // Generate procedural textures once
  const normalMap = useMemo(() => createSurfaceNormalMap(512), []);
  const roughnessMap = useMemo(() => createRoughnessMap(256), []);

  // ─── Live controls ──────────────────────────────────
  const config = useControls({
    'Transmission': folder({
      transmission:        { value: 0.95, min: 0, max: 1, step: 0.01 },
      thickness:           { value: 1.8,  min: 0, max: 5, step: 0.1 },
      roughness:           { value: 0.12, min: 0, max: 1, step: 0.01 },
      ior:                 { value: 1.55, min: 1, max: 2.5, step: 0.01 },
      transmissionSampler: true,
    }),
    'Refraction FX': folder({
      chromaticAberration: { value: 0.27, min: 0, max: 0.5, step: 0.005 },
      distortion:          { value: 0.47, min: 0, max: 1, step: 0.01 },
      distortionScale:     { value: 1.65, min: 0, max: 2, step: 0.05 },
      temporalDistortion:  { value: 0.71, min: 0, max: 1, step: 0.01 },
      anisotropy:          { value: 0.46, min: 0, max: 1, step: 0.01 },
    }),
    'Surface': folder({
      clearcoat:           { value: 0.50, min: 0, max: 1, step: 0.01 },
      clearcoatRoughness:  { value: 0.21, min: 0, max: 1, step: 0.01 },
      _normalScale:        { value: 0.30, min: 0, max: 2, step: 0.05, label: 'normalScale' },
      iridescence:         { value: 0.56, min: 0, max: 1, step: 0.01 },
      iridescenceIOR:      { value: 2.20, min: 1, max: 2.5, step: 0.01 },
      envMapIntensity:     { value: 1.9,  min: 0, max: 3, step: 0.1 },
      backside:            false,
    }),
    'Colour': folder({
      color:               '#3a6a47',
      attenuationDistance:  { value: 2.0, min: 0.1, max: 3, step: 0.05 },
      attenuationColor:    '#00096b',
    }),
  });

  const edgeControls = useControls('Edges', {
    edgeColor:   '#598781',
    edgeOpacity: { value: 0.55, min: 0, max: 1, step: 0.01 },
  });

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Slow auto-rotate (user can override via drag)
    groupRef.current.rotation.y += 0.002;
    // Gentle hover bob
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.03 + 0.65;
  });

  const shared = { config, normalMap, roughnessMap };

  return (
    <group ref={groupRef} scale={0.62}>
      {MERU_TRIS.map((tri, i) => (
        <TriPrism
          key={`tri-${i}`}
          svgTri={tri.svg}
          height={tri.h}
          edgeColor={edgeControls.edgeColor}
          edgeOpacity={edgeControls.edgeOpacity}
          {...shared}
        />
      ))}

      <BhupuraFrame halfSizeSvg={145} gateWidthSvg={55} gateDepthSvg={37} height={0.015} tabWidthSvg={155} {...shared} />
      <BhupuraFrame halfSizeSvg={140} gateWidthSvg={50} gateDepthSvg={32} height={0.025} tabWidthSvg={142} {...shared} />
      <BhupuraFrame halfSizeSvg={135} gateWidthSvg={45} gateDepthSvg={28} height={0.04}  tabWidthSvg={130} {...shared} />

      {CIRCLE_RINGS.map((ring, i) => (
        <CircleRing key={`ring-${i}`} svgRadius={ring.r} tubeR={ring.tubeR} y={ring.y} {...shared} />
      ))}

      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.028, 16, 12]} />
        <AmberMaterial {...shared} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STONE ALTAR
// ═══════════════════════════════════════════════════════════════

/**
 * Procedural stone normal map — coarser, craggier than crystal texture.
 */
function createStoneNormalMap(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  function hash(x, y) {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) & 0xffff) / 65535.0;
  }

  function smoothNoise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy), b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }

  function fbm(x, y, octaves) {
    let val = 0, amp = 0.5, freq = 1;
    for (let i = 0; i < octaves; i++) {
      val += amp * smoothNoise(x * freq, y * freq);
      amp *= 0.5; freq *= 2.2;
    }
    return val;
  }

  // Height map — large cracks + pitted surface
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const coarse = fbm(x * 0.008, y * 0.008, 3) * 0.5;
      const medium = fbm(x * 0.03 + 50, y * 0.03 + 50, 4) * 0.3;
      const fine = fbm(x * 0.12 + 100, y * 0.12 + 100, 3) * 0.2;
      // Occasional deep pits
      const pit = smoothNoise(x * 0.05 + 200, y * 0.05 + 200);
      const pitMask = pit < 0.3 ? (0.3 - pit) * 0.8 : 0;
      heights[y * size + x] = coarse + medium + fine - pitMask;
    }
  }

  const strength = 4.0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const xp = Math.min(x + 1, size - 1), xm = Math.max(x - 1, 0);
      const yp = Math.min(y + 1, size - 1), ym = Math.max(y - 1, 0);
      const dx = (heights[y * size + xp] - heights[y * size + xm]) * strength;
      const dy = (heights[yp * size + x] - heights[ym * size + x]) * strength;
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      data[idx]     = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round(((-dy / len) * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural stone color map — dark basalt with subtle variation.
 */
function createStoneColorMap(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  function hash(x, y) {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) & 0xffff) / 65535.0;
  }

  function smoothNoise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy), b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const n = smoothNoise(x * 0.02, y * 0.02) * 0.5
              + smoothNoise(x * 0.06 + 30, y * 0.06 + 30) * 0.3
              + smoothNoise(x * 0.15 + 60, y * 0.15 + 60) * 0.2;

      // Dark basalt: base ~30-50 brightness, slight warm/cool variation
      const base = 30 + n * 25;
      const warm = smoothNoise(x * 0.01 + 100, y * 0.01 + 100);
      data[idx]     = Math.round(base + warm * 8);       // R — slightly warm
      data[idx + 1] = Math.round(base - 2 + warm * 3);   // G
      data[idx + 2] = Math.round(base - 1);               // B — slightly cool
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

function StoneAltar() {
  const stoneNormal = useMemo(() => createStoneNormalMap(512), []);
  const stoneColor = useMemo(() => createStoneColorMap(256), []);

  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: stoneColor,
    normalMap: stoneNormal,
    normalScale: new THREE.Vector2(1.2, 1.2),
    roughness: 0.85,
    metalness: 0.05,
    color: new THREE.Color('#2a2520'),
    envMapIntensity: 0.3,
  }), [stoneColor, stoneNormal]);

  const topMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: stoneColor,
    normalMap: stoneNormal,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughness: 0.72,
    metalness: 0.04,
    color: new THREE.Color('#1e1a16'),
    envMapIntensity: 0.3,
  }), [stoneColor, stoneNormal]);

  // Carved band material — slightly different tone for the decorative ring
  const bandMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: stoneColor,
    normalMap: stoneNormal,
    normalScale: new THREE.Vector2(1.5, 1.5),
    roughness: 0.75,
    metalness: 0.1,
    color: new THREE.Color('#1a1815'),
    envMapIntensity: 0.4,
  }), [stoneColor, stoneNormal]);

  return (
    <group position={[0, -0.6, 0]}>
      {/* Top disc — polished ritual surface */}
      <mesh material={topMat} position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.06, 48]} />
      </mesh>

      {/* Lip/rim around top */}
      <mesh material={bandMat} position={[0, 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.87, 0.04, 8, 48]} />
      </mesh>

      {/* Upper decorative band */}
      <mesh material={bandMat} position={[0, 0.30, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.12, 48]} />
      </mesh>

      {/* Main column body */}
      <mesh material={stoneMat} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.82, 0.88, 0.40, 48]} />
      </mesh>

      {/* Lower decorative band */}
      <mesh material={bandMat} position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.92, 0.95, 0.08, 48]} />
      </mesh>

      {/* Base — wider, slightly tapered */}
      <mesh material={stoneMat} position={[0, -0.30, 0]}>
        <cylinderGeometry args={[0.95, 1.05, 0.16, 48]} />
      </mesh>

      {/* Ground plane — extends into darkness */}
      <mesh material={stoneMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.39, 0]}>
        <planeGeometry args={[24, 24]} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════
//  GOD RAY — volumetric light shaft
// ═══════════════════════════════════════════════════════════════

const godRayVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const godRayFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  // Simple 2D noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      val += amp * noise(p);
      p *= 2.1;
      amp *= 0.5;
    }
    return val;
  }

  void main() {
    // Radial fade — strongest at centre, fades to edges
    float dist = length(vUv - vec2(0.5)) * 2.0;
    float radial = smoothstep(1.0, 0.0, dist);
    radial = pow(radial, 1.5);

    // Vertical fade — strongest at top, fades downward
    float vertical = pow(vUv.y, 0.4);

    // Animated caustic/dust patterns
    vec2 noiseCoord = vec2(vUv.x * 3.0, vUv.y * 8.0 - uTime * 0.15);
    float dust = fbm(noiseCoord);
    float caustic = fbm(noiseCoord * 2.5 + vec2(uTime * 0.08, 0.0));

    // Combine
    float pattern = 0.6 + dust * 0.3 + caustic * 0.15;
    float alpha = radial * vertical * pattern * uIntensity;

    // Soft particles / dust motes
    float motes = smoothstep(0.62, 0.65, noise(noiseCoord * 6.0 + uTime * 0.1));
    alpha += motes * radial * vertical * 0.15 * uIntensity;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

function GodRay() {
  const meshRef = useRef();

  const { rayColor, rayIntensity, rayWidth, rayHeight } = useControls('God Ray', {
    rayColor:     '#f0d8a0',
    rayIntensity: { value: 0.35, min: 0, max: 1, step: 0.01 },
    rayWidth:     { value: 1.4, min: 0.3, max: 4, step: 0.1 },
    rayHeight:    { value: 8.0, min: 2, max: 15, step: 0.5 },
  });

  const shaderMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: godRayVertexShader,
    fragmentShader: godRayFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#f0d8a0') },
      uIntensity: { value: 0.35 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), []);

  useFrame(({ clock }) => {
    if (!shaderMat) return;
    shaderMat.uniforms.uTime.value = clock.getElapsedTime();
    shaderMat.uniforms.uColor.value.set(rayColor);
    shaderMat.uniforms.uIntensity.value = rayIntensity;
  });

  return (
    <mesh
      ref={meshRef}
      material={shaderMat}
      position={[0.3, rayHeight / 2 - 0.5, -0.2]}
    >
      <cylinderGeometry args={[rayWidth * 0.15, rayWidth, rayHeight, 32, 1, true]} />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════
//  BACKGROUND IMAGE
// ═══════════════════════════════════════════════════════════════

/**
 * Loads a JPEG and displays it on a large plane behind the scene.
 * Place your image at: public/images/temple-bg.jpg
 * (or change the path below)
 */
function BackgroundImageInner() {
  const texture = useTexture('/images/temple-bg.png');

  const aspect = texture.image ? texture.image.width / texture.image.height : 16 / 9;
  const height = 14;
  const width = height * aspect;

  return (
    <mesh position={[0, 2, -8]} renderOrder={-1}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        toneMapped={false}
        color="#666060"
        fog={true}
      />
    </mesh>
  );
}

function BackgroundImage() {
  return (
    <Suspense fallback={null}>
      <BackgroundImageInner />
    </Suspense>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SCENE
// ═══════════════════════════════════════════════════════════════

export default function SriYantraMeru() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{ position: [0, 1.0, 4.5], fov: 35, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <color attach="background" args={['#050302']} />
        <fog attach="fog" args={['#050302', 6, 16]} />

        {/* Key light — warm golden, pulled back */}
        <directionalLight position={[3, 6, 2]} intensity={1.8} color="#f0c060" />

        {/* Fill — cool blue from left */}
        <directionalLight position={[-4, 3, -1]} intensity={0.35} color="#6080b0" />

        {/* Rim light from behind */}
        <pointLight position={[0, 2, -4]} intensity={0.5} color="#d08030" distance={10} />

        {/* Under-glow through transmission */}
        <pointLight position={[0, -2, 0]} intensity={0.25} color="#f0a040" distance={6} />

        {/* Ambient */}
        <ambientLight intensity={0.06} />

        {/* Rich environment for reflections */}
        <Environment preset="studio" backgroundIntensity={0} environmentIntensity={0.5} />

        <PresentationControls
          global={false}
          snap={false}
          speed={1.5}
          zoom={1}
          rotation={[0.15, 0, 0]}
          polar={[-Math.PI / 5, Math.PI / 5]}
          azimuth={[-Infinity, Infinity]}
        >
          <MeruMesh />
        </PresentationControls>
        <StoneAltar />
        <GodRay />
        <BackgroundImage />

        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.9}
            radius={0.5}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
