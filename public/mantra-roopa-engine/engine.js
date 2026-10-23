/*
 * Mahamrityunjaya Mantra-rupa: a living specimen.
 *
 * A spindle torus of glass (the form of the original SanskritTorus): 54 nadis run through
 * its poles and close round an Om at the heart. The mantra rides the nadis as small gilded
 * reliefs, lit from the Om. Chant pulses climb the core and pour down the outside; sparks of
 * prana circulate the same way; the form breathes. Rare events: spanda (a tremor rippling
 * over the skin), abhisheka (milk-white light poured from the crown), bindu (the Om flares at
 * the top of each breath and the camera pulls focus to it).
 *
 * mount(container, options) -> { renderAt(t), start(), stop(), dispose() }
 *   options.mantra:  the mantra's settings (syllables, lines, form, labels); see src/components/mantras.js
 *   options.quality: 'high' | 'low'   (low: phones; fewer layers and sparks, cheaper post)
 *   options.manual:  true to run it yourself: start()/stop(), or renderAt(t) for video capture
 *   options.capture: true when frames will be read back (video capture)
 *   options.events:  { spanda: [t...], abhisheka: [t...] } to fix the event times
 *   options.patina:  url of the stone texture
 */
import * as THREE from './vendor/three/build/three.module.min.js';
import { EffectComposer } from './vendor/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from './vendor/three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from './vendor/three/examples/jsm/postprocessing/OutputPass.js';

const DEVA = '"Tiro Devanagari Sanskrit", "Noto Serif Devanagari", serif';
const PALETTE = {
  gold: '#e9c46a', goldDeep: '#8a5a22', goldHot: '#fff1c8', jade: '#4fa58a', milk: '#fffaf0',
  film: ['#4a2a0c', '#a8692a', '#e0a24e', '#f3d48c', '#fff0cc'],
  shimmer: ['#5fe0b0', '#7fd0e8', '#9a7cff', '#e48cf0'],
  thread: '#d9b26a', verm: '#ec6b40', violet: '#b49cff', jadeHi: '#8fd6b8',
};

// ---------------------------------------------------------------- shared GLSL
const glslCommon = ({ R, RT, NADIS, CHANT_START, TOP }) => /* glsl */`
  #define PI 3.141592653589793
  #define TAU 6.283185307179586
  const float RR = ${R.toFixed(3)};
  const float RT = ${RT.toFixed(3)};
  const float NADIS = ${NADIS.toFixed(1)};
  uniform float uTime, uBreath, uSpin, uChantPeriod;
  uniform vec4 uSpanda;     // phi, theta, start, amplitude (0 when idle)
  uniform vec2 uAbhi;       // start, active
  uniform float uBindu;

  float wrapPi(float a) { return mod(a + PI, TAU) - PI; }
  float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
  }
  float spandaAt(float phi, float th) {
    if (uSpanda.w <= 0.0) return 0.0;
    float dp = wrapPi(phi - uSpanda.x), dt = wrapPi(th - uSpanda.y);
    float d = sqrt(dp * dp + dt * dt), e = uTime - uSpanda.z;
    return exp(-pow((d - e * 1.5) / 0.38, 2.0)) * clamp(1.0 - e / 3.4, 0.0, 1.0) * smoothstep(0.0, 0.25, e);
  }
  vec3 surf(float phi, float th) {
    float rr = RT * (1.0 + 0.03 * sin(6.0 * phi + 1.5 + uTime * 0.4) * cos(2.0 * th + 0.7)
                   + 0.012 * sin(11.0 * phi - 3.0 * th - uTime * 0.7) + uSpanda.w * spandaAt(phi, th));
    float ring = RR + rr * cos(th);
    float s = 1.0 + 0.022 * uBreath;
    float a = phi + uSpin;
    return s * vec3(ring * cos(a), rr * sin(th), ring * sin(a));
  }
  void surfFrame(float phi, float th, out vec3 P, out vec3 Tp, out vec3 Tt, out vec3 N) {
    float e = 0.0025;
    P = surf(phi, th);
    Tp = (surf(phi + e, th) - P) / e;
    Tt = (surf(phi, th + e) - P) / e;
    N = normalize(cross(Tt, Tp));            // outward
  }
  // a chant climbs from below up through the core (or the inner wall), over the crown, and down the outside
  float chantAt(float nadi, float th) {
    float ph = fract(uTime / uChantPeriod + nadi * 3.0 / NADIS + hash11(nadi * 7.7) * 0.12);
    float d = wrapPi(th - (${CHANT_START.toFixed(3)} - ph * TAU));
    return exp(-d * d / 0.09) * (1.0 + 0.6 * uBindu);
  }
  // abhisheka: milk-white light poured from the crown, running down every nadi, unevenly
  float abhiAt(float nadi, float th) {
    if (uAbhi.y <= 0.0) return 0.0;
    float e = uTime - uAbhi.x;
    float front = ${(TOP - 0.04).toFixed(3)} - e * 1.25 - hash11(nadi * 3.1) * 0.35 - pow(hash11(nadi * 9.3), 2.0) * 0.5;
    float tw = wrapPi(th);
    float since = (tw - front) / 1.25;
    float g = since < 0.0 ? 0.0 : (since < 0.1 ? since / 0.1 : exp(-(since - 0.1) * 2.6));
    return g * step(-1.75, tw) * step(tw, ${(TOP + 0.06).toFixed(3)}) * clamp(1.0 - (e - 4.0) / 2.0, 0.0, 1.0);
  }
`;

// ---------------------------------------------------------------- glyph atlas
function buildAtlas(list, cell, cols) {
  const size = cell * cols;
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = size; return c; };
  const sharp = mk(), sg = sharp.getContext('2d');
  sg.fillStyle = '#000'; sg.fillRect(0, 0, size, size); sg.fillStyle = '#fff';
  list.forEach((ch, i) => {
    const cx = (i % cols) * cell + cell / 2, cy = Math.floor(i / cols) * cell + cell / 2;
    let px = cell * 0.78;
    sg.font = `${px}px ${DEVA}`;
    let m = sg.measureText(ch);
    let w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const k = Math.min(1, (cell * 0.74) / w, (cell * 0.74) / h);
    px *= k; sg.font = `${px}px ${DEVA}`; m = sg.measureText(ch);
    w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight; h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    sg.textAlign = 'left'; sg.textBaseline = 'alphabetic';
    sg.fillText(ch, cx - w / 2 + m.actualBoundingBoxLeft, cy + h / 2 - m.actualBoundingBoxDescent);
  });
  const blurred = (px) => {
    const c = mk(), g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, size, size);
    g.filter = `blur(${px}px)`; g.drawImage(sharp, 0, 0); g.filter = 'none';
    return g.getImageData(0, 0, size, size).data;
  };
  const A = sharp.getContext('2d').getImageData(0, 0, size, size).data;
  const Hd = blurred(cell * 0.03), Gd = blurred(cell * 0.11);
  const out = mk(), og = out.getContext('2d'), img = og.createImageData(size, size);
  for (let i = 0; i < A.length; i += 4) {
    img.data[i] = A[i]; img.data[i + 1] = Math.min(255, Hd[i] * 1.6); img.data[i + 2] = Math.min(255, Gd[i] * 2.2); img.data[i + 3] = 255;
  }
  og.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(out);
  tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = 4;
  return tex;
}

// ---------------------------------------------------------------- the HUD (DOM)
const HUD_CSS = `
.mr-hud { position: absolute; inset: 0; pointer-events: none; color: #e8dfcf; font-family: 'Share Tech Mono', ui-monospace, monospace; }
.mr-hud * { box-sizing: border-box; }
.mr-frame { position: absolute; inset: clamp(12px, 2.8%, 38px); border: 1px solid rgba(232,223,207,0.22); }
.mr-corner { position: absolute; width: 26px; height: 26px; border-color: rgba(232,223,207,0.8); border-style: solid; border-width: 0; }
.mr-corner.tl { left: -9px; top: -9px; border-left-width: 1.4px; border-top-width: 1.4px; }
.mr-corner.tr { right: -9px; top: -9px; border-right-width: 1.4px; border-top-width: 1.4px; }
.mr-corner.bl { left: -9px; bottom: -9px; border-left-width: 1.4px; border-bottom-width: 1.4px; }
.mr-corner.br { right: -9px; bottom: -9px; border-right-width: 1.4px; border-bottom-width: 1.4px; }
.mr-ticks-r { position: absolute; right: 0; top: 20px; bottom: 20px; width: 14px;
  background: repeating-linear-gradient(to bottom, rgba(232,223,207,0.35) 0 1px, transparent 1px 12px) right / 6px 100% no-repeat,
              repeating-linear-gradient(to bottom, rgba(232,223,207,0.35) 0 1px, transparent 1px 120px) right / 14px 100% no-repeat; }
.mr-ticks-b { position: absolute; bottom: 0; left: 20px; right: 20px; height: 14px;
  background: repeating-linear-gradient(to right, rgba(232,223,207,0.35) 0 1px, transparent 1px 12px) bottom / 100% 6px no-repeat,
              repeating-linear-gradient(to right, rgba(232,223,207,0.35) 0 1px, transparent 1px 120px) bottom / 100% 14px no-repeat; }
.mr-title { position: absolute; left: 4%; top: 3.2%; }
.mr-kicker { font-size: clamp(8px, 0.95vmin, 12px); letter-spacing: 0.28em; color: rgba(232,223,207,0.45); }
.mr-deva { font-family: ${DEVA}; color: #e2b95e; font-size: clamp(24px, 4.4vmin, 50px); line-height: 1.25; margin-top: 0.3em; }
.mr-sub { font-size: clamp(8px, 0.95vmin, 12px); letter-spacing: 0.18em; }
.mr-data { position: absolute; right: 4%; top: 3.4%; width: clamp(150px, 24vmin, 250px); font-size: clamp(8px, 0.9vmin, 11px); letter-spacing: 0.16em; }
.mr-row { display: flex; justify-content: space-between; line-height: 1.85; }
.mr-row span:first-child { color: rgba(232,223,207,0.45); }
.mr-row .hot { color: #ec6b40; }
.mr-trace { display: block; width: 100%; height: clamp(22px, 3.4vmin, 40px); margin-top: 6px; }
.mr-padas { position: absolute; left: 4%; bottom: 15%; font-family: ${DEVA}; font-size: clamp(12px, 1.75vmin, 20px); }
.mr-pada { display: flex; align-items: center; gap: 0.7em; margin-top: 0.55em; color: #e8dfcf; }
.mr-pada b { font-weight: 400; display: inline-grid; place-items: center; width: 1.6em; height: 1.6em; border: 1px solid rgba(232,223,207,0.4); border-radius: 50%; color: #e2b95e; font-size: 0.75em; }
.mr-grid { position: absolute; right: 4%; bottom: 15.5%; display: grid; grid-template-columns: repeat(8, clamp(9px, 1.5vmin, 16px)); gap: clamp(3px, 0.5vmin, 6px); }
.mr-grid i { aspect-ratio: 1; border: 1px solid rgba(232,223,207,0.35); display: block; position: relative; }
.mr-grid i.on::after { content: ''; position: absolute; inset: 28%; background: #8fd6b8; box-shadow: 0 0 6px #8fd6b8; }
.mr-grid-label { position: absolute; right: 4%; bottom: calc(15.5% + clamp(54px, 9vmin, 96px)); font-size: clamp(7px, 0.8vmin, 10px); letter-spacing: 0.2em; color: rgba(232,223,207,0.45); }
.mr-caption { position: absolute; left: 4%; bottom: 5.2%; right: 4%; }
.mr-caption em { font-family: 'Spectral', Georgia, serif; font-weight: 300; font-size: clamp(11px, 1.6vmin, 19px); display: block; }
.mr-caption small { display: block; margin-top: 0.7em; font-size: clamp(7px, 0.85vmin, 11px); letter-spacing: 0.28em; color: rgba(232,223,207,0.45); }
.mr-event { position: absolute; left: 50%; top: 13%; transform: translateX(-50%); font-size: clamp(8px, 1vmin, 12px); letter-spacing: 0.4em; color: #ec6b40; opacity: 0; white-space: nowrap; }
.mr-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.mr-svg line, .mr-svg polyline { stroke: rgba(232,223,207,0.42); stroke-width: 1; fill: none; }
.mr-svg circle.ring { stroke: rgba(232,223,207,0.55); fill: none; }
.mr-svg circle.dot { fill: #ec6b40; }
.mr-svg text { fill: #e8dfcf; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 0.16em; }
@media (max-width: 640px) {
  .mr-grid, .mr-grid-label, .mr-trace { display: none; }
  .mr-padas { bottom: 14%; }
  /* the readouts sit beside the four lines, below the form, rather than over it */
  .mr-data { top: auto; bottom: 14.5%; width: min(140px, 42%); }
  /* the figure line would wrap into the pause button: the caption carries the page on its own */
  .mr-caption small { display: none; }
  .mr-caption { bottom: 8%; }
  .mr-svg text { font-size: 9px; }
  .mr-frame { inset: 10px; }
  .mr-title { left: 22px; right: 22px; }
  .mr-kicker { letter-spacing: 0.16em; }
  .mr-sub { letter-spacing: 0.08em; }
}
`;

function buildHud(container, M) {
  if (!document.getElementById('mr-hud-css')) {
    const st = document.createElement('style'); st.id = 'mr-hud-css'; st.textContent = HUD_CSS; document.head.appendChild(st);
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const DEVA_NUM = '०१२३४५६७८९';
  const devaNum = n => String(n).split('').map(d => DEVA_NUM[+d]).join('');
  const hud = document.createElement('div'); hud.className = 'mr-hud';
  hud.innerHTML = `
    <div class="mr-frame"><span class="mr-corner tl"></span><span class="mr-corner tr"></span><span class="mr-corner bl"></span><span class="mr-corner br"></span>
      <span class="mr-ticks-r"></span><span class="mr-ticks-b"></span></div>
    <div class="mr-title"><div class="mr-kicker">${esc(M.kicker)}</div>
      <div class="mr-deva" lang="sa">${esc(M.deva)}</div>
      <div class="mr-sub">${esc(M.sub)}</div></div>
    <div class="mr-data">
      ${M.rows.map(([k, v]) => `<div class="mr-row"><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join('')}
      <div class="mr-row"><span>AVRITTI</span><span class="hot" data-k="avritti">001 / 108</span></div>
      <div class="mr-row"><span>PRANA</span><span data-k="prana">+0.00</span></div>
      <canvas class="mr-trace" width="250" height="40"></canvas></div>
    <div class="mr-event" data-k="event"></div>
    <div class="mr-padas">
      ${M.lines.map((t, i) => `<div class="mr-pada" lang="sa"><b>${devaNum(i + 1)}</b>${esc(t)}</div>`).join('')}</div>
    <div class="mr-grid-label">${esc(M.gridLabel || 'AKSHARA')}</div>
    <div class="mr-grid">${'<i></i>'.repeat(M.syllableCount)}</div>
    <div class="mr-caption"><em>${esc(M.caption)}</em>
      <small>${esc(M.figure)}</small></div>
    <svg class="mr-svg"></svg>`;
  container.appendChild(hud);
  const q = k => hud.querySelector(`[data-k="${k}"]`);
  return { el: hud, avritti: q('avritti'), prana: q('prana'), event: q('event'), trace: hud.querySelector('.mr-trace'),
           padas: [...hud.querySelectorAll('.mr-pada')], cells: [...hud.querySelectorAll('.mr-grid i')], svg: hud.querySelector('.mr-svg') };
}

// ---------------------------------------------------------------- mount
export function mount(container, options = {}) {
  const M = options.mantra;
  const AK = M.syllables;
  const R = M.form.ring, RT = M.form.tube;              // ring radius, tube radius (tube wider than ring: a spindle torus)
  const NADIS = M.form.nadis || 54, PER = M.form.perNadi || 46;
  const CHANT_PERIOD = M.chantSeconds || 8;
  const spindle = R < RT;
  const CUSP = spindle ? Math.acos(-R / RT) : Math.PI / 2;  // where the nadis cross the axis (spindle) or the crown
  const CHANT_START = spindle ? Math.PI * 2 - CUSP : Math.PI;
  const GLSL_COMMON = glslCommon({ R, RT, NADIS, CHANT_START, TOP: CUSP });
  const quality = options.quality || (Math.min(window.innerWidth, window.innerHeight) < 700 ? 'low' : 'high');
  const low = quality === 'low';
  const manual = !!options.manual;
  const layers = low ? 2 : 3;

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!options.capture });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.pixelRatio || (low ? 1.25 : 1.6)));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const C = c => new THREE.Color(c);

  const common = {
    uTime: { value: 0 }, uBreath: { value: 0 }, uSpin: { value: 0 }, uChantPeriod: { value: CHANT_PERIOD },
    uSpanda: { value: new THREE.Vector4(0, 0, -99, 0) }, uAbhi: { value: new THREE.Vector2(-99, 0) }, uBindu: { value: 0 },
    uFocus: { value: 8 }, uAperture: { value: 0.6 },
  };

  // ---- background: the patina stone, a faint measuring grid
  const patina = new THREE.TextureLoader().load(options.patina || 'patina.jpg');
  patina.colorSpace = THREE.SRGBColorSpace; patina.wrapS = patina.wrapT = THREE.RepeatWrapping;
  const bgMat = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: patina }, uAspect: { value: 1 }, uPx: { value: new THREE.Vector2(1, 1) }, uDrift: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`,
    fragmentShader: `
      uniform sampler2D uTex; uniform float uAspect, uDrift; uniform vec2 uPx; varying vec2 vUv;
      void main(){
        vec2 uv = (vUv - 0.5) * vec2(uAspect, 1.0) * 1.1 + vec2(0.5 + uDrift, 0.5);
        vec3 c = texture2D(uTex, uv).rgb * 0.95;
        vec2 g = abs(fract(gl_FragCoord.xy / (40.0 * uPx.x)) - 0.5);
        float line = 1.0 - smoothstep(0.0, 0.5 / (40.0 * uPx.x) * 1.5, min(g.x, g.y));
        c += vec3(0.9, 0.86, 0.8) * line * 0.0045;
        float v = length((vUv - 0.5) * vec2(uAspect, 1.0));
        c *= mix(1.0, 0.28, smoothstep(0.25, 0.95, v));
        gl_FragColor = vec4(c, 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bg.frustumCulled = false; bg.renderOrder = -10; scene.add(bg);

  // ---- distant bokeh: dust far behind, out of focus
  {
    const n = low ? 70 : 140, pos = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16; pos[i * 3 + 1] = (Math.random() - 0.5) * 12; pos[i * 3 + 2] = -4 - Math.random() * 10;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { ...common, uPx: { value: 1 }, uGold: { value: C(PALETTE.gold) }, uJade: { value: C(PALETTE.jadeHi) } },
      vertexShader: `uniform float uTime, uPx; attribute float aSeed; varying float vA, vS;
        void main(){ vec3 p = position + vec3(sin(uTime*0.05 + aSeed*20.0)*0.6, cos(uTime*0.04 + aSeed*13.0)*0.4, 0.0);
          vec4 mv = viewMatrix * vec4(p, 1.0); gl_PointSize = (30.0 + 50.0*aSeed) * uPx * (8.0 / -mv.z);
          vA = 0.02 + 0.03*pow(0.5 + 0.5*sin(uTime*0.3 + aSeed*40.0), 2.0); vS = aSeed; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uGold, uJade; varying float vA, vS;
        void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.75, d) * (0.7 + 0.3*smoothstep(0.75, 0.95, d));
          gl_FragColor = vec4(mix(uGold, uJade, step(0.7, vS)), a * vA); }`,
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(g, m); dust.frustumCulled = false; dust.renderOrder = -5; scene.add(dust);
    dust.userData.mat = m;
    scene.userData.dust = dust;
  }

  // ---- the glass membrane
  const memGeo = new THREE.PlaneGeometry(1, 1, low ? 180 : 260, low ? 120 : 170);
  const memMat = new THREE.ShaderMaterial({
    uniforms: { ...common,
      uFilm: { value: PALETTE.film.map(C) }, uShim: { value: PALETTE.shimmer.map(C) }, uMilk: { value: C(PALETTE.milk) }, uGain: { value: 1 } },
    vertexShader: GLSL_COMMON + `
      varying vec3 vN, vW; varying float vPhi, vTh, vRho, vAbhi, vChant;
      void main(){
        float phi = uv.x * TAU, th = uv.y * TAU;
        vec3 P, Tp, Tt, N; surfFrame(phi, th, P, Tp, Tt, N);
        vN = N; vW = P; vPhi = phi; vTh = th; vRho = RR + RT * cos(th);
        float nadi = floor(phi / TAU * NADIS + 0.5);
        vAbhi = abhiAt(nadi, th);
        vChant = chantAt(nadi, th) * (1.0 - smoothstep(0.0, 0.05, abs(sin(phi * NADIS * 0.5))));
        gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
      }`,
    fragmentShader: GLSL_COMMON + `
      uniform vec3 uFilm[5]; uniform vec3 uShim[4]; uniform vec3 uMilk; uniform float uGain;
      varying vec3 vN, vW; varying float vPhi, vTh, vRho, vAbhi, vChant;
      vec3 ramp5(float t){ t = clamp(t, 0.0, 0.999) * 4.0; int i = int(t); float f = fract(t);
        vec3 a = uFilm[0], b = uFilm[1];
        if (i == 1) { a = uFilm[1]; b = uFilm[2]; } else if (i == 2) { a = uFilm[2]; b = uFilm[3]; } else if (i == 3) { a = uFilm[3]; b = uFilm[4]; }
        return mix(a, b, f); }
      vec3 ramp4(float t){ t = fract(t) * 3.0; int i = int(t); float f = fract(t);
        vec3 a = uShim[0], b = uShim[1];
        if (i == 1) { a = uShim[1]; b = uShim[2]; } else if (i == 2) { a = uShim[2]; b = uShim[3]; }
        return mix(a, b, f); }
      void main(){
        vec3 V = normalize(cameraPosition - vW);
        float facing = dot(normalize(vN), V), edge = 1.0 - abs(facing);
        float core = (vRho < 0.0 ? 0.45 : 1.0) * (0.22 + 0.78 * smoothstep(0.0, 0.45, abs(vRho)));
        float band = 0.5 + 0.5 * sin(3.0 * vPhi + 2.0 * vTh + uTime * 0.22) * cos(1.3 * vPhi - vTh);
        vec3 c = ramp5(0.45 * edge + 0.4 * band + 0.15);
        float sh = pow(edge, 5.0) * 0.95;
        c = mix(c, ramp4(band * 0.7 + 0.3 * pow(sin(vPhi * 2.0 + vTh), 2.0) + uTime * 0.015), sh);
        float fib = 1.0 - smoothstep(0.0, 0.07, abs(sin(vPhi * NADIS * 0.5)));
        float caust = vnoise(vec2(vPhi * 7.0 + uTime * 0.05, vTh * 3.5 - uTime * 0.08));
        float a = ((facing < 0.0 ? 0.0025 : 0.0045) + pow(edge, 4.0) * 0.22 + fib * 0.016 + caust * caust * 0.014) * core;
        float fibA = 1.0 - smoothstep(0.0, 0.18, abs(sin(vPhi * NADIS * 0.5)));
        c = mix(c, uMilk, clamp(vAbhi * fibA, 0.0, 1.0));
        a += vAbhi * fibA * 0.08 * core + vChant * 0.04;
        gl_FragColor = vec4(c * uGain, a);
      }`,
    side: THREE.DoubleSide, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  });
  const membrane = new THREE.Mesh(memGeo, memMat);
  membrane.frustumCulled = false; membrane.renderOrder = 7; scene.add(membrane);

  // ---- nadi threads
  {
    const SEG = low ? 160 : 240, n = NADIS * SEG * 2;
    const pt = new Float32Array(n * 2), nd = new Float32Array(n), pos = new Float32Array(n * 3);
    let k = 0;
    for (let i = 0; i < NADIS; i++) {
      const phi = (i / NADIS) * Math.PI * 2;
      for (let s = 0; s < SEG; s++) for (const ss of [s, s + 1]) {
        pt[k * 2] = phi; pt[k * 2 + 1] = (ss / SEG) * Math.PI * 2; nd[k] = i; k++;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aPT', new THREE.BufferAttribute(pt, 2)); g.setAttribute('aNadi', new THREE.BufferAttribute(nd, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { ...common, uThread: { value: C(PALETTE.thread) }, uHot: { value: C(PALETTE.goldHot) }, uMilk: { value: C(PALETTE.milk) } },
      vertexShader: GLSL_COMMON + `
        attribute vec2 aPT; attribute float aNadi; varying float vA, vChant, vAbhi;
        void main(){
          vec3 P, Tp, Tt, N; surfFrame(aPT.x, aPT.y, P, Tp, Tt, N);
          float rho = RR + RT * cos(aPT.y);
          float facing = dot(N, normalize(cameraPosition - P));
          vA = ((facing < 0.0 ? 0.05 : 0.12) + 0.08 * (1.0 - abs(facing))) * smoothstep(-0.05, 0.35, abs(rho));
          vChant = chantAt(aNadi, aPT.y); vAbhi = abhiAt(aNadi, aPT.y);
          gl_Position = projectionMatrix * viewMatrix * vec4(P * 1.002, 1.0);
        }`,
      fragmentShader: `uniform vec3 uThread, uHot, uMilk; varying float vA, vChant, vAbhi;
        void main(){ vec3 c = mix(uThread, uHot * 1.8, vChant); c = mix(c, uMilk * 1.8, clamp(vAbhi, 0.0, 1.0));
          gl_FragColor = vec4(c, vA + vChant * 0.4 + vAbhi * 0.35); }`,
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    });
    const threads = new THREE.LineSegments(g, m); threads.frustumCulled = false; threads.renderOrder = 3; scene.add(threads);
  }

  // ---- the glyphs: gilded reliefs with thickness, in two halves (far wall, then near wall)
  const uniq = [...new Set(AK)];
  const atlasCols = 8;
  const atlas = buildAtlas(uniq, 128, atlasCols);
  const glyphData = [];
  for (let i = 0; i < NADIS; i++) {
    const phi = (i / NADIS) * Math.PI * 2;
    const offset = Math.floor((Math.sin(phi * 4) + 1) * AK.length / 2);       // the original's pattern
    for (let j = 0; j < PER; j++) {
      const th = (j / PER) * Math.PI * 2 + (i % 2) * (Math.PI / PER);
      const cell = uniq.indexOf(AK[(j + offset) % AK.length]);
      glyphData.push([phi, th, cell % atlasCols, Math.floor(cell / atlasCols), i, Math.random()]);
    }
  }
  function glyphGeometry(layerList) {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]), 3));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    const n = glyphData.length * layerList.length;
    const pt = new Float32Array(n * 2), cell = new Float32Array(n * 2), meta = new Float32Array(n * 3);
    let k = 0;
    for (const L of layerList) for (const d of glyphData) {
      pt[k * 2] = d[0]; pt[k * 2 + 1] = d[1]; cell[k * 2] = d[2]; cell[k * 2 + 1] = d[3];
      meta[k * 3] = d[4]; meta[k * 3 + 1] = d[5]; meta[k * 3 + 2] = L; k++;
    }
    g.setAttribute('aPT', new THREE.InstancedBufferAttribute(pt, 2));
    g.setAttribute('aCell', new THREE.InstancedBufferAttribute(cell, 2));
    g.setAttribute('aMeta', new THREE.InstancedBufferAttribute(meta, 3));
    g.instanceCount = n;
    return g;
  }
  const GLYPH_VERT = GLSL_COMMON + `
    attribute vec2 aPT, aCell; attribute vec3 aMeta;
    uniform float uHalf, uSize, uThick, uFlow, uFocus, uAperture;
    varying vec2 vUv; varying vec3 vU, vV, vNf, vW;
    varying float vFacing, vChant, vAbhi, vSp, vLayer, vFade, vKeep, vCoc, vSeed; varying vec2 vQ;
    void main(){
      vQ = position.xy;
      float phi = aPT.x, th = aPT.y - uTime * uFlow;
      float nadi = aMeta.x, seed = aMeta.y, layer = aMeta.z;
      vec3 P, Tp, Tt, N; surfFrame(phi, th, P, Tp, Tt, N);
      float rho = RR + RT * cos(th);
      float chant = chantAt(nadi, th), abhi = abhiAt(nadi, th);
      float sp = uSpanda.w > 0.0 ? spandaAt(phi, th) : 0.0;
      float size = uSize * clamp(0.35 + 0.65 * rho / (RR + RT), 0.3, 1.0) * (1.0 + 0.24 * chant + 0.14 * sp + 0.12 * abhi);
      vec3 base = P + N * (0.004 + 0.045 * chant + 0.03 * sp - layer * uThick);
      vec3 u = normalize(Tp), v = normalize(Tt);
      mat4 vp = projectionMatrix * viewMatrix;
      vec4 c0 = vp * vec4(base, 1.0), cu = vp * vec4(base + u * size, 1.0), cv = vp * vec4(base + v * size, 1.0);
      vec2 s0 = c0.xy / c0.w, su = cu.xy / cu.w - s0, sv = cv.xy / cv.w - s0;
      if (su.x * sv.y - su.y * sv.x < 0.0) u = -u;            // never mirrored
      if (sv.y < 0.0) { u = -u; v = -v; }                      // never upside down
      vec3 w = base + (position.x * u + position.y * v) * size;
      vec3 Vd = normalize(cameraPosition - P);
      float facing = dot(N, Vd);
      vec4 mv = viewMatrix * vec4(w, 1.0);
      float depth = -mv.z, centre = -(viewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
      float near = step(depth, centre);
      vKeep = uHalf > 0.5 ? near : 1.0 - near;
      vCoc = clamp(abs(depth - uFocus) * uAperture, 0.0, 3.2);
      vUv = vec2((aCell.x + position.x + 0.5) / 8.0, (8.0 - aCell.y - 0.5 + position.y) / 8.0);
      vU = u; vV = v; vNf = facing >= 0.0 ? N : -N; vW = w;
      vFacing = facing; vChant = chant; vAbhi = abhi; vSp = sp; vLayer = layer; vSeed = seed;
      vFade = smoothstep(0.16, 0.55, rho);
      gl_Position = projectionMatrix * mv;
    }`;
  const glyphUniforms = (half) => ({
    ...common, uHalf: { value: half }, uSize: { value: 0.12 }, uThick: { value: 0.0065 }, uFlow: { value: 0.016 },
    uAtlas: { value: atlas }, uTexel: { value: 1 / 1024 },
    uGold: { value: C(PALETTE.gold) }, uGoldDeep: { value: C(PALETTE.goldDeep) }, uGoldHot: { value: C(PALETTE.goldHot) },
    uJade: { value: C(PALETTE.jade) }, uMilk: { value: C(PALETTE.milk) },
  });
  const BODY_FRAG = GLSL_COMMON + `
    uniform sampler2D uAtlas; uniform float uTexel; uniform vec3 uGold, uGoldDeep, uGoldHot, uJade, uMilk;
    varying vec2 vUv; varying vec3 vU, vV, vNf, vW;
    varying float vFacing, vChant, vAbhi, vSp, vLayer, vFade, vKeep, vCoc, vSeed; varying vec2 vQ;
    void main(){
      if (vKeep < 0.5 || vFade < 0.01) discard;
      float bias = min(vCoc, 0.9);
      vec4 tx = texture2D(uAtlas, vUv, bias);
      float a = smoothstep(0.22, 0.62, tx.r) * smoothstep(0.5, 0.4, max(abs(vQ.x), abs(vQ.y)));
      if (a < 0.01) discard;
      float t = uTexel * (2.0 + bias * 2.0);
      float hx = texture2D(uAtlas, vUv + vec2(t, 0.0), bias).g - texture2D(uAtlas, vUv - vec2(t, 0.0), bias).g;
      float hy = texture2D(uAtlas, vUv + vec2(0.0, t), bias).g - texture2D(uAtlas, vUv - vec2(0.0, t), bias).g;
      vec3 n = normalize(vNf - (vU * hx + vV * hy) * 2.6);
      vec3 V = normalize(cameraPosition - vW);
      vec3 L = normalize(-vW);                                   // the Om is the lamp
      vec3 K = normalize(vec3(cos(uTime * 0.07) * 0.7, 0.75, 0.55 + sin(uTime * 0.07) * 0.4));   // a slow key light
      float key = max(dot(n, K), 0.0), fill = max(dot(n, V), 0.0);
      float omWrap = pow(max(dot(n, L) * 0.5 + 0.5, 0.0), 3.0);
      float spec = pow(max(dot(n, normalize(K + V)), 0.0), 34.0) + 0.6 * pow(max(dot(n, normalize(L + V)), 0.0), 20.0);
      float rim = pow(1.0 - fill, 2.5);
      float wear = vnoise(vUv * 90.0 + vSeed * 17.0);
      vec3 gold = mix(uGoldDeep, uGold, 0.45 + 0.55 * wear);
      vec3 col = gold * (0.22 + 0.55 * key + 0.45 * fill + 0.55 * omWrap + 0.35 * rim) + vec3(1.0, 0.93, 0.78) * spec * 1.1;
      col *= mix(1.0, 0.38, vLayer / 2.0);                       // the cut sides are darker
      col = mix(col, uGoldHot * 1.2, vChant * 0.42 * (1.0 - vLayer * 0.35));
      col = mix(col, uMilk * 1.5, clamp(vAbhi, 0.0, 1.0) * 0.6);
      col += uGoldHot * vSp * 0.6;
      float far = step(vFacing, 0.0);
      col = mix(col, uJade * 0.5, far * 0.75);
      gl_FragColor = vec4(col, a * vFade * mix(1.0, 0.17, far) * smoothstep(0.0, 0.3, abs(vFacing)));
    }`;
  const GLOW_FRAG = GLSL_COMMON + `
    uniform sampler2D uAtlas; uniform vec3 uGoldHot, uMilk, uJade;
    varying vec2 vUv; varying vec3 vU, vV, vNf, vW;
    varying float vFacing, vChant, vAbhi, vSp, vLayer, vFade, vKeep, vCoc, vSeed; varying vec2 vQ;
    void main(){
      if (vKeep < 0.5 || vFade < 0.01) discard;
      float g = texture2D(uAtlas, vUv, min(vCoc, 1.5)).b * smoothstep(0.5, 0.25, length(vQ));
      float far = step(vFacing, 0.0);
      float e = 0.03 + vChant * 0.3 + vSp * 0.35 + uBindu * 0.08;
      vec3 c = mix(uGoldHot, uMilk, clamp(vAbhi, 0.0, 1.0));
      e += vAbhi * 0.45;
      c = mix(c, uJade, far * 0.6);
      gl_FragColor = vec4(c, g * e * vFade * mix(1.0, 0.4, far));
    }`;
  const bodyGeo = glyphGeometry(layers === 3 ? [2, 1, 0] : [1, 0]);
  const glowGeo = glyphGeometry([0]);
  const glyphMeshes = [];
  for (const half of [0, 1]) {
    const body = new THREE.Mesh(bodyGeo, new THREE.ShaderMaterial({
      uniforms: glyphUniforms(half), vertexShader: GLYPH_VERT, fragmentShader: BODY_FRAG,
      transparent: true, depthWrite: false, depthTest: false }));
    const glow = new THREE.Mesh(glowGeo, new THREE.ShaderMaterial({
      uniforms: glyphUniforms(half), vertexShader: GLYPH_VERT, fragmentShader: GLOW_FRAG,
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
    body.frustumCulled = glow.frustumCulled = false;
    body.renderOrder = half ? 8 : 1; glow.renderOrder = half ? 9 : 2;
    scene.add(body, glow); glyphMeshes.push(body, glow);
  }

  // ---- prana: sparks circulating the torus field, up the core and down the outside
  {
    const n = low ? 1400 : 3200;
    const p = new Float32Array(n * 4), s = new Float32Array(n * 2), pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const inner = Math.random() < 0.7;
      p[i * 4] = Math.random() * Math.PI * 2;
      p[i * 4 + 1] = Math.random() * Math.PI * 2;
      p[i * 4 + 2] = inner ? (spindle ? R / RT + 0.04 : 0.7) + Math.random() * 0.28 : 0.25 + Math.random() * 0.4;   // past R/RT the path crosses the core
      p[i * 4 + 3] = 0.05 + Math.random() * 0.09;
      s[i * 2] = Math.random(); const r = Math.random(); s[i * 2 + 1] = r < 0.72 ? 0 : r < 0.88 ? 1 : 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aP', new THREE.BufferAttribute(p, 4)); g.setAttribute('aS', new THREE.BufferAttribute(s, 2));
    const m = new THREE.ShaderMaterial({
      uniforms: { ...common, uPx: { value: 1 }, uC0: { value: C(PALETTE.verm) }, uC1: { value: C(PALETTE.violet) }, uC2: { value: C(PALETTE.jadeHi) } },
      vertexShader: GLSL_COMMON + `
        attribute vec4 aP; attribute vec2 aS; uniform float uPx, uFocus, uAperture;
        varying float vA, vType;
        void main(){
          float th = aP.y - uTime * aP.w * (1.0 + 0.8 * uBindu);
          float phi = aP.x + 0.18 * sin(uTime * 0.06 + aS.x * 30.0) + uSpin;
          float rr = RT * aP.z * (1.0 + 0.022 * uBreath), ring = RR + rr * cos(th);
          vec3 P = vec3(ring * cos(phi), rr * sin(th), ring * sin(phi));
          P += 0.035 * vec3(sin(uTime * 0.9 + aS.x * 91.0), cos(uTime * 0.7 + aS.x * 53.0), sin(uTime * 1.1 + aS.x * 17.0));
          vec4 mv = viewMatrix * vec4(P, 1.0);
          float coc = clamp(abs(-mv.z - uFocus) * uAperture, 0.0, 3.0);
          float axis = 1.0 - smoothstep(0.0, 0.55, length(P.xz));
          float tw = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * (1.0 + aS.x * 3.0) + aS.x * 100.0), 3.0);
          gl_PointSize = (1.3 + 2.4 * fract(aS.x * 7.3)) * (1.0 + coc * 1.6) * uPx * (9.0 / -mv.z);
          vA = tw * (0.45 + 0.9 * axis) / (1.0 + coc * 2.2) * (1.0 + uBindu);
          vType = aS.y;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `uniform vec3 uC0, uC1, uC2; varying float vA, vType;
        void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 1.6);
          vec3 c = vType < 0.5 ? uC0 : (vType < 1.5 ? uC1 : uC2);
          gl_FragColor = vec4(c * 1.6, a * vA); }`,
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(g, m); sparks.frustumCulled = false; sparks.renderOrder = 6; scene.add(sparks);
    scene.userData.sparks = sparks;
  }

  // ---- the Om: a gilded seal at the heart, always facing the viewer, with a halo
  const omTex = buildAtlas(['ॐ'], 512, 1);
  const omMat = (glow) => new THREE.ShaderMaterial({
    uniforms: { ...common, uTex: { value: omTex }, uGold: { value: C(PALETTE.gold) }, uHot: { value: C(PALETTE.goldHot) },
                uDeep: { value: C(PALETTE.goldDeep) }, uMilk: { value: C(PALETTE.milk) }, uGlow: { value: 1 }, uScale: { value: glow ? 1.25 : 0.62 } },
    vertexShader: `uniform float uScale; varying vec2 vUv; varying vec3 vW;
      void main(){ vUv = uv; vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vec3 w = (right * position.x + up * position.y) * uScale; vW = w;
        gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0); }`,
    fragmentShader: glow ? `
      uniform sampler2D uTex; uniform vec3 uHot, uMilk; uniform float uGlow, uBindu; uniform vec2 uAbhi; varying vec2 vUv;
      void main(){ vec2 uv = (vUv - 0.5) * 1.6 + 0.5; float g = texture2D(uTex, uv).b;
        float halo = exp(-pow(length(vUv - 0.5) * 3.2, 2.0));
        gl_FragColor = vec4(mix(uHot, uMilk, uBindu * 0.5), (g * 0.9 + halo * 0.35) * uGlow); }` : `
      uniform sampler2D uTex; uniform vec3 uGold, uHot, uDeep; uniform float uGlow, uTime; varying vec2 vUv; varying vec3 vW;
      void main(){
        vec4 tx = texture2D(uTex, vUv); float a = smoothstep(0.1, 0.6, tx.r); if (a < 0.01) discard;
        float t = 1.5 / 512.0;
        float hx = texture2D(uTex, vUv + vec2(t, 0.0)).g - texture2D(uTex, vUv - vec2(t, 0.0)).g;
        float hy = texture2D(uTex, vUv + vec2(0.0, t)).g - texture2D(uTex, vUv - vec2(0.0, t)).g;
        vec3 n = normalize(vec3(-hx * 3.0, -hy * 3.0, 1.0));
        vec3 K = normalize(vec3(cos(uTime * 0.11) * 0.6, 0.6, 0.8));
        float diff = max(dot(n, K), 0.0), spec = pow(max(dot(n, normalize(K + vec3(0.0, 0.0, 1.0))), 0.0), 30.0);
        float core = smoothstep(0.55, 1.0, tx.g);
        vec3 col = mix(uDeep, uGold, 0.6 + 0.4 * diff) * (0.55 + 0.6 * diff) + vec3(1.0, 0.95, 0.82) * spec * 1.4;
        col += uHot * core * 0.9 * uGlow;
        gl_FragColor = vec4(col * (0.9 + 0.5 * uGlow), a);
      }`,
    transparent: true, depthWrite: false, depthTest: false, blending: glow ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const omGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), omMat(true));
  const omBody = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), omMat(false));
  omGlow.frustumCulled = omBody.frustumCulled = false;
  omGlow.renderOrder = 4; omBody.renderOrder = 5;
  scene.add(omGlow, omBody);

  // ---- post: bloom, then light shafts from the Om, grade, vignette, grain, a little lens fringe
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), low ? 0.7 : 0.8, 0.55, 0.78);
  composer.addPass(bloom);
  const finish = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uOm: { value: new THREE.Vector2(0.5, 0.5) }, uRes: { value: new THREE.Vector2(1, 1) },
                uRays: { value: 0.2 }, uTime: { value: 0 }, uGrain: { value: 0.018 }, uCA: { value: 0.0025 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform vec2 uOm, uRes; uniform float uRays, uTime, uGrain, uCA; varying vec2 vUv;
      float h(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
      void main(){
        vec2 dir = vUv - 0.5; float d = length(dir * vec2(uRes.x / uRes.y, 1.0));
        vec3 col = vec3(texture2D(tDiffuse, vUv + dir * uCA * d).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - dir * uCA * d).b);
        vec2 delta = (vUv - uOm) / ${low ? '16.0' : '30.0'} * 0.6; vec2 p = vUv - delta * h(vUv * uRes + uTime); float decay = 1.0; vec3 rays = vec3(0.0);
        for (int i = 0; i < ${low ? 16 : 30}; i++) { p -= delta; vec3 s = texture2D(tDiffuse, p).rgb;
          rays += s * max(dot(s, vec3(0.3, 0.59, 0.11)) - 1.2, 0.0) * decay; decay *= 0.93; }
        col += rays * uRays / ${low ? '16.0' : '30.0'} * vec3(1.0, 0.82, 0.55);
        float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = mix(col, col * vec3(0.9, 1.05, 1.0) + vec3(0.003, 0.007, 0.006), 1.0 - smoothstep(0.0, 0.2, lum));
        col *= mix(1.0, 0.55, smoothstep(0.45, 1.05, d));
        col += (h(vUv * uRes + fract(uTime * 7.13) * 311.0) - 0.5) * uGrain * (0.5 + 0.5 * (1.0 - clamp(lum, 0.0, 1.0)));
        gl_FragColor = vec4(max(col, 0.0), 1.0);
      }`,
  });
  composer.addPass(finish);
  composer.addPass(new OutputPass());

  // ---- HUD
  const hud = options.hud === false ? null : buildHud(container, M);
  const traceCtx = hud ? hud.trace.getContext('2d') : null;
  const breathLog = [];

  // ---- events: spanda and abhisheka, at fixed or seeded times
  let seed = options.seed || 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ev = options.events || {};
  const spandas = ev.spanda ? ev.spanda.map(t => ({ t, phi: rnd() * 6.283, th: (rnd() - 0.5) * 2.2 })) : [];
  const abhis = ev.abhisheka ? [...ev.abhisheka] : [];
  if (!ev.spanda) { let t = 7; while (t < 7200) { spandas.push({ t, phi: rnd() * 6.283, th: (rnd() - 0.5) * 2.2 }); t += 18 + rnd() * 24; } }
  if (!ev.abhisheka) { let t = 16; while (t < 7200) { abhis.push(t); t += 28 + rnd() * 26; } }

  // ---- sizing
  let W = 1, H = 1;
  function resize() {
    W = Math.max(1, container.clientWidth); H = Math.max(1, container.clientHeight);
    renderer.setSize(W, H, false); composer.setSize(W, H);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const pr = renderer.getPixelRatio();
    bgMat.uniforms.uAspect.value = W / H; bgMat.uniforms.uPx.value.set(pr, pr);
    finish.uniforms.uRes.value.set(W * pr, H * pr);
    scene.userData.sparks.material.uniforms.uPx.value = pr * H / 900;
    scene.userData.dust.material.uniforms.uPx.value = pr * H / 900;
    if (hud) hud.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  }
  resize();

  // ---- one frame at time t (seconds)
  const PHI = 1.618033988749895;
  const omWorld = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let lastAv = -1, eventText = '', eventUntil = -1;
  function renderAt(t) {
    // breath: the original's layered golden-ratio sines, with its bindu moment at the top
    const b1 = Math.sin(t * 0.17), b2 = Math.sin(t * 0.17 * PHI) * 0.32, b3 = Math.sin(t * 0.17 * PHI * PHI) * 0.11, tide = Math.sin(t * 0.055) * 0.08;
    const breath = (b1 + b2 + b3 + tide) / 1.51;
    const bindu = breath > 0.72 ? Math.pow((breath - 0.72) / 0.28, 2.0) : 0;
    common.uTime.value = t; common.uBreath.value = breath; common.uBindu.value = bindu;
    common.uSpin.value = t * 0.022;

    // events in play
    let sp = null; for (const s of spandas) { if (s.t <= t && t - s.t < 3.6) sp = s; if (s.t > t) break; }
    common.uSpanda.value.set(sp ? sp.phi : 0, sp ? sp.th : 0, sp ? sp.t : -99, sp ? 0.075 : 0);
    let ab = -99; for (const a of abhis) { if (a <= t && t - a < 6.5) ab = a; if (a > t) break; }
    common.uAbhi.value.set(ab, ab > -99 ? 1 : 0);
    const abE = ab > -99 ? t - ab : 99;
    const abFlash = abE < 6 ? Math.exp(-abE * 1.4) * Math.min(1, abE * 5) * 0.6 : 0;

    // camera: slow drift, breathing dolly, focus that rests on the near wall and pulls to the Om at bindu
    const aspect = W / H, tanH = Math.tan(THREE.MathUtils.degToRad(15));
    const dist = (aspect >= 1 ? 0.925 : 1) * Math.max(RT / (tanH * 0.47), (R + RT) / (tanH * aspect * (aspect < 0.6 ? 0.95 : 0.8))) * (1.0 - 0.035 * Math.sin(t * 0.045) - 0.02 * bindu);
    const az = 0.35 * Math.sin(t * 0.019) + 0.12 * Math.sin(t * 0.047 + 1.3);
    const el = 0.2 + 0.07 * Math.sin(t * 0.031 + 0.8);
    const ty = aspect < 1 ? -0.16 : -0.05;
    camera.position.set(Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist + ty, Math.cos(az) * Math.cos(el) * dist);
    camera.lookAt(0, ty, 0);
    camera.updateMatrixWorld();
    const focusNear = dist - 1.05, focusOm = dist;
    const pull = Math.min(1, bindu * 1.6 + abFlash * 0.5);
    common.uFocus.value = focusNear + (focusOm - focusNear) * pull;
    common.uAperture.value = 0.28 + 0.16 * pull;

    // the Om
    const beat = 0.5 + 0.5 * Math.sin(t * 1.3);
    omBody.material.uniforms.uGlow.value = 0.35 + 0.2 * beat + 0.8 * bindu + 1.0 * abFlash;
    omGlow.material.uniforms.uGlow.value = 0.22 + 0.12 * beat + 0.7 * bindu + 0.9 * abFlash;
    omBody.material.uniforms.uScale.value = 0.6 * (1 + 0.02 * breath + 0.03 * bindu);
    memMat.uniforms.uGain.value = 1.0 + 0.2 * bindu + 0.25 * abFlash;

    // light shafts point from the Om
    omWorld.set(0, 0, 0).project(camera);
    finish.uniforms.uOm.value.set(omWorld.x * 0.5 + 0.5, omWorld.y * 0.5 + 0.5);
    finish.uniforms.uRays.value = 0.1 + 0.45 * bindu + 0.5 * abFlash;
    finish.uniforms.uTime.value = t;
    bgMat.uniforms.uDrift.value = az * 0.02;

    composer.render();
    if (hud) drawHudFrame(t, breath, bindu, sp, ab);
  }

  function project(v) { tmp.copy(v).project(camera); return [(tmp.x * 0.5 + 0.5) * W, (-tmp.y * 0.5 + 0.5) * H]; }
  function drawHudFrame(t, breath, bindu, sp, ab) {
    const av = Math.floor(t / CHANT_PERIOD) % 108 + 1;
    if (av !== lastAv) { hud.avritti.textContent = `${String(av).padStart(3, '0')} / 108`; lastAv = av; }
    hud.prana.textContent = (breath >= 0 ? '+' : '') + breath.toFixed(2);
    // which pada is being chanted: the chant takes CHANT_PERIOD for the whole mantra
    const ph = (t / CHANT_PERIOD) % 1;
    hud.padas.forEach((p, i) => {
      const n = hud.padas.length, on = Math.max(0, 1 - Math.abs(ph * n - (i + 0.5)) / 0.7);
      p.style.color = `rgb(${232 + 23 * on | 0},${223 + 18 * on | 0},${207 - 7 * on | 0})`;
      p.style.textShadow = on > 0.01 ? `0 0 ${14 * on}px rgba(233,196,106,${0.55 * on})` : 'none';
    });
    const syl = Math.floor(ph * hud.cells.length);
    hud.cells.forEach((c, i) => c.classList.toggle('on', i === syl));
    if (sp && sp.t > eventUntil - 4) { eventText = `SPANDA  //  PHI ${Math.round(sp.phi * 57.3)}  THETA ${Math.round(sp.th * 57.3)}`; eventUntil = sp.t + 3; }
    if (ab > -99 && t - ab < 0.1) { eventText = 'ABHISHEKA'; eventUntil = ab + 4; }
    if (bindu > 0.35 && t > eventUntil) { eventText = 'BINDU'; eventUntil = t + 0.5; }
    hud.event.textContent = eventText; hud.event.style.opacity = (0.9 * Math.max(0, Math.min(1, (eventUntil - t) / 0.8))).toFixed(3);
    // breath trace
    breathLog.push(breath); if (breathLog.length > 120) breathLog.shift();
    const g = traceCtx, w = g.canvas.width, h = g.canvas.height;
    g.clearRect(0, 0, w, h);
    g.strokeStyle = 'rgba(232,223,207,0.25)'; g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
    g.strokeStyle = 'rgba(232,223,207,0.7)'; g.beginPath();
    breathLog.forEach((b, i) => { const x = (i / 119) * w, y = h / 2 - b * h * 0.42; i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.stroke();
    const last = breathLog[breathLog.length - 1];
    g.fillStyle = bindu > 0 ? '#ec6b40' : '#8fd6b8'; g.beginPath(); g.arc(w - 3, h / 2 - last * h * 0.42, 2.5, 0, 6.3); g.fill();
    // callouts that track the form
    const om = project(new THREE.Vector3(0, 0, 0));
    const spin = t * 0.022;
    const nadiP = new THREE.Vector3((R + RT * Math.cos(0.5)) * Math.cos(2.9 + spin), RT * Math.sin(0.5), (R + RT * Math.cos(0.5)) * Math.sin(2.9 + spin));
    const outerP = new THREE.Vector3((R + RT * Math.cos(0.55)) * Math.cos(-0.25 + spin), RT * Math.sin(0.55), (R + RT * Math.cos(0.55)) * Math.sin(-0.25 + spin));
    const nd = project(nadiP), ou = project(outerP);
    const small = W < 640;
    const lab = (from, to, text, side) => {
      const shelf = side === 'left' ? -36 : 36;
      return `<circle class="ring" cx="${from[0]}" cy="${from[1]}" r="5"/>
        <polyline points="${from[0]},${from[1]} ${to[0]},${to[1]} ${to[0] + shelf},${to[1]}"/>
        <circle class="dot" cx="${to[0] + shelf}" cy="${to[1]}" r="2.2"/>
        <text x="${to[0] + shelf + (side === 'left' ? -8 : 8)}" y="${to[1] + 4}" text-anchor="${side === 'left' ? 'end' : 'start'}">${text}</text>`;
    };
    hud.svg.innerHTML =
      lab([om[0] + W * 0.05, om[1] - H * 0.028], [W * (small ? 0.6 : 0.66), H * (small ? 0.25 : 0.215)], small ? M.callouts.heartShort : M.callouts.heart, 'right') +
      lab(nd, [W * (small ? 0.38 : 0.2), H * 0.245], M.callouts.nadi, 'left') +
      (small ? '' : lab(ou, [W * 0.955, H * 0.31], M.callouts.outer, 'left'));   // up by the readouts, clear of the glass at any width
  }

  // ---- running
  let raf = 0, t0 = 0, running = false, lastFrame = 0, base = options.startAt || 0, simT = base;
  const cap = low ? 1000 / 30 : 1000 / 60;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - lastFrame < cap - 2) return;
    lastFrame = now;
    simT = (now - t0) / 1000 + base;
    renderAt(simT);
  }
  const ro = new ResizeObserver(resize); ro.observe(container);
  const start = () => { if (running) return; running = true; t0 = performance.now(); base = simT; raf = requestAnimationFrame(loop); };
  const stop = () => { if (!running) return; running = false; cancelAnimationFrame(raf); };
  const onVis = () => (document.hidden ? stop() : start());
  if (!manual) { document.addEventListener('visibilitychange', onVis); start(); }

  return {
    renderAt, start, stop,
    dispose() {
      stop(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis);
      renderer.dispose(); composer.dispose?.(); renderer.domElement.remove(); hud?.el.remove();
    },
  };
}
