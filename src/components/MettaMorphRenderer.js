// Metta-Morph renderer: draws the transition between two images into one canvas.
//   face  : both photographs are warped along a shared facial mesh and mixed in linear light,
//           so at every point there is one face, never two faces superimposed.
//   erode : the second image appears through a slowly spreading grain, like weathered stone.
//           Each point is wholly one image or the other, so there is no blurred middle.
// WebGL when available, with a Canvas 2D fallback that produces the same result.
import { warpFace } from './MettaMorphGeometry';

export const VIEW_W = 1200, VIEW_H = 800;
const BACKDROP = [0.075, 0.068, 0.062];     // the stone behind the face, in 0..1
const EDGE = [0.56, 0.84, 0.72];            // faint phosphor on the erosion front
const EDGE_WIDTH = 0.03;

/* ---------- a tileable, histogram-equalised grain field ---------- */
// Equalised so that the slider reads honestly: at 40% the second image covers 40% of the frame.
function makeNoise(size = 256, seed = 7) {
  let s = seed >>> 0;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const field = new Float32Array(size * size);
  const octaves = [[6, 1], [12, 0.55], [24, 0.3], [48, 0.16], [96, 0.08]];
  for (const [cells, weight] of octaves) {
    const grid = new Float32Array(cells * cells).map(() => rand());
    const at = (x, y) => grid[((y % cells + cells) % cells) * cells + ((x % cells + cells) % cells)];
    const fade = t => t * t * (3 - 2 * t);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const gx = x / size * cells, gy = y / size * cells, x0 = Math.floor(gx), y0 = Math.floor(gy);
      const fx = fade(gx - x0), fy = fade(gy - y0);
      const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * fx;
      const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * fx;
      field[y * size + x] += weight * (top + (bottom - top) * fy);
    }
  }
  const order = Array.from(field.keys()).sort((a, b) => field[a] - field[b]);
  const out = new Uint8Array(size * size);
  order.forEach((index, rank) => { out[index] = Math.round(rank / (order.length - 1) * 255); });
  return { size, data: out };
}
let NOISE = null;
const noise = () => NOISE || (NOISE = makeNoise());

/* ---------- image helpers ---------- */
export function coverCanvas(source, width = VIEW_W, height = VIEW_H) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  const scale = Math.max(width / source.width, height / source.height);
  const w = source.width * scale, h = source.height * scale;
  ctx.drawImage(source, (width - w) / 2, (height - h) / 2, w, h);
  return canvas;
}

/* ---------- WebGL ---------- */
const FACE_VS = `attribute vec2 aA; attribute vec2 aB; uniform mediump float uT; uniform vec2 uSize; varying vec2 vA; varying vec2 vB;
void main(){ vec2 p = mix(aA, aB, uT); vA = aA / uSize; vB = aB / uSize; vec2 c = p / uSize * 2.0 - 1.0; gl_Position = vec4(c.x, -c.y, 0.0, 1.0); }`;
const FACE_FS = `precision mediump float; uniform sampler2D uA; uniform sampler2D uB; uniform float uT; varying vec2 vA; varying vec2 vB;
vec3 lin(vec3 c){ return pow(c, vec3(2.2)); } vec3 enc(vec3 c){ return pow(c, vec3(1.0 / 2.2)); }
void main(){ vec3 a = texture2D(uA, vA).rgb; vec3 b = texture2D(uB, vB).rgb; gl_FragColor = vec4(enc(mix(lin(a), lin(b), uT)), 1.0); }`;
const QUAD_VS = `attribute vec2 aPos; varying vec2 vUv; void main(){ vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); gl_Position = vec4(aPos, 0.0, 1.0); }`;
const ERODE_FS = `precision mediump float; uniform sampler2D uA; uniform sampler2D uB; uniform sampler2D uN; uniform float uT; uniform vec3 uEdge; varying vec2 vUv;
void main(){
  float n = texture2D(uN, vUv * vec2(1.5, 1.0)).r;
  float w = ${EDGE_WIDTH.toFixed(3)};
  float t = uT * (1.0 + 2.0 * w) - w;
  float m = smoothstep(t - 0.004, t + 0.004, n);
  vec3 col = mix(texture2D(uB, vUv).rgb, texture2D(uA, vUv).rgb, m);
  float e = 1.0 - smoothstep(0.0, w, abs(n - t));
  gl_FragColor = vec4(col + uEdge * e * e * 0.45, 1.0);
}`;

function compile(gl, vs, fs) {
  const make = (type, src) => {
    const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  };
  const p = gl.createProgram();
  gl.attachShader(p, make(gl.VERTEX_SHADER, vs)); gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}
function texture(gl, source, repeat = false) {
  const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  const wrap = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (source.data) gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, source.size, source.size, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, source.data);
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  return t;
}

export class MorphRenderer {
  // The renderer owns its canvas, so that if WebGL fails it can start again with a fresh 2D canvas.
  constructor(host) {
    this.host = host;
    const make = () => { const c = document.createElement('canvas'); c.width = VIEW_W; c.height = VIEW_H; c.className = 'mm-canvas'; host.appendChild(c); return c; };
    let canvas = make();
    this.canvas = canvas;
    this.kind = null; this.t = 0;
    let gl = null;
    try { gl = canvas.getContext('webgl', { alpha: false, antialias: true, preserveDrawingBuffer: true }); } catch (_) { gl = null; }
    if (gl) {
      try {
        this.gl = gl;
        this.face = compile(gl, FACE_VS, FACE_FS);
        this.erode = compile(gl, QUAD_VS, ERODE_FS);
        this.quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        this.mesh = gl.createBuffer();
        this.noiseTex = texture(gl, noise(), true);
      } catch (_) { this.gl = null; }
    }
    if (!this.gl) {
      if (gl) { canvas.remove(); canvas = make(); this.canvas = canvas; }
      this.ctx = canvas.getContext('2d');
    }
    this.clear();
  }
  get webgl() { return !!this.gl; }

  clear() {
    this.kind = null;
    if (this.gl) { const g = this.gl; g.viewport(0, 0, VIEW_W, VIEW_H); g.clearColor(...BACKDROP, 1); g.clear(g.COLOR_BUFFER_BIT); }
    else { this.ctx.fillStyle = '#13110f'; this.ctx.fillRect(0, 0, VIEW_W, VIEW_H); }
  }

  freeTextures() {
    if (this.gl && this.tex) this.tex.forEach(t => this.gl.deleteTexture(t));
    this.tex = null;
  }

  // layers: two VIEW-sized canvases aligned on the eyes; mesh: { points: [a, b], triangles }
  setFace(layers, mesh) {
    this.freeTextures();
    this.kind = 'face';
    if (this.gl) {
      const g = this.gl, [pa, pb] = mesh.points, v = [];
      for (const tri of mesh.triangles) for (const i of tri) v.push(pa[i][0], pa[i][1], pb[i][0], pb[i][1]);
      this.count = v.length / 4;
      g.bindBuffer(g.ARRAY_BUFFER, this.mesh); g.bufferData(g.ARRAY_BUFFER, new Float32Array(v), g.STATIC_DRAW);
      this.tex = layers.map(l => texture(g, l));
    } else {
      this.layers = layers; this.meshData = mesh;
      this.warped = layers.map(() => { const c = document.createElement('canvas'); c.width = VIEW_W; c.height = VIEW_H; return c; });
    }
  }

  setErode(a, b) {
    this.freeTextures();
    this.kind = 'erode';
    if (this.gl) this.tex = [a, b].map(c => texture(this.gl, c));
    else {
      // Software path at half resolution: cache both images and the grain as flat arrays.
      const w = VIEW_W / 2, h = VIEW_H / 2, read = c => { const s = document.createElement('canvas'); s.width = w; s.height = h; const x = s.getContext('2d'); x.drawImage(c, 0, 0, w, h); return x.getImageData(0, 0, w, h); };
      this.soft = { w, h, a: read(a), b: read(b), out: new ImageData(w, h), scratch: document.createElement('canvas') };
      this.soft.scratch.width = w; this.soft.scratch.height = h;
      const n = noise(), grain = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const u = (x / w * 1.5 * n.size) % n.size, vv = (y / h * n.size) % n.size;
        grain[y * w + x] = n.data[Math.floor(vv) * n.size + Math.floor(u)];
      }
      this.soft.grain = grain;
    }
  }

  render(t) {
    this.t = Math.max(0, Math.min(1, t));
    if (!this.kind) return;
    if (this.gl) {
      const g = this.gl; g.viewport(0, 0, VIEW_W, VIEW_H); g.clearColor(...BACKDROP, 1); g.clear(g.COLOR_BUFFER_BIT);
      const prog = this.kind === 'face' ? this.face : this.erode; g.useProgram(prog);
      const bind = (name, tex, unit) => { g.activeTexture(g.TEXTURE0 + unit); g.bindTexture(g.TEXTURE_2D, tex); g.uniform1i(g.getUniformLocation(prog, name), unit); };
      bind('uA', this.tex[0], 0); bind('uB', this.tex[1], 1);
      g.uniform1f(g.getUniformLocation(prog, 'uT'), this.t);
      if (this.kind === 'face') {
        g.uniform2f(g.getUniformLocation(prog, 'uSize'), VIEW_W, VIEW_H);
        g.bindBuffer(g.ARRAY_BUFFER, this.mesh);
        const la = g.getAttribLocation(prog, 'aA'), lb = g.getAttribLocation(prog, 'aB');
        g.enableVertexAttribArray(la); g.vertexAttribPointer(la, 2, g.FLOAT, false, 16, 0);
        g.enableVertexAttribArray(lb); g.vertexAttribPointer(lb, 2, g.FLOAT, false, 16, 8);
        g.drawArrays(g.TRIANGLES, 0, this.count);
        g.disableVertexAttribArray(lb);
      } else {
        bind('uN', this.noiseTex, 2);
        g.uniform3f(g.getUniformLocation(prog, 'uEdge'), ...EDGE);
        g.bindBuffer(g.ARRAY_BUFFER, this.quad);
        const lp = g.getAttribLocation(prog, 'aPos'); g.enableVertexAttribArray(lp); g.vertexAttribPointer(lp, 2, g.FLOAT, false, 0, 0);
        g.drawArrays(g.TRIANGLES, 0, 6);
      }
      return;
    }
    const ctx = this.ctx;
    if (this.kind === 'face') {
      const [pa, pb] = this.meshData.points, to = pa.map((p, i) => [p[0] + (pb[i][0] - p[0]) * this.t, p[1] + (pb[i][1] - p[1]) * this.t]);
      this.layers.forEach((layer, i) => warpFace(this.warped[i].getContext('2d'), layer, this.meshData.points[i], to, this.meshData.triangles));
      ctx.globalAlpha = 1; ctx.drawImage(this.warped[0], 0, 0);
      ctx.globalAlpha = this.t; ctx.drawImage(this.warped[1], 0, 0); ctx.globalAlpha = 1;
    } else {
      const { w, h, a, b, out, grain, scratch } = this.soft, wEdge = EDGE_WIDTH * 255;
      const t = (this.t * (1 + 2 * EDGE_WIDTH) - EDGE_WIDTH) * 255;
      for (let i = 0, p = 0; i < w * h; i++, p += 4) {
        const n = grain[i], src = n < t ? b.data : a.data, d = Math.abs(n - t);
        const e = d < wEdge ? (1 - d / wEdge) ** 2 * 0.45 * 255 : 0;
        out.data[p] = Math.min(255, src[p] + EDGE[0] * e); out.data[p + 1] = Math.min(255, src[p + 1] + EDGE[1] * e);
        out.data[p + 2] = Math.min(255, src[p + 2] + EDGE[2] * e); out.data[p + 3] = 255;
      }
      scratch.getContext('2d').putImageData(out, 0, 0);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(scratch, 0, 0, VIEW_W, VIEW_H);
    }
  }

  // A small picture of the current moment, for the record. Faces are cropped to the portrait window.
  snapshot(width = 240) {
    const crop = this.kind === 'face' ? [VIEW_W * 0.25, 0, VIEW_W * 0.5, VIEW_H] : [0, 0, VIEW_W, VIEW_H];
    const c = document.createElement('canvas'); c.width = width; c.height = Math.round(width * crop[3] / crop[2]);
    try { c.getContext('2d').drawImage(this.canvas, ...crop, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.82); }
    catch (_) { return null; }
  }

  dispose() {
    this.freeTextures();
    if (this.gl) {
      const g = this.gl;
      [this.face, this.erode].forEach(p => p && g.deleteProgram(p));
      [this.quad, this.mesh].forEach(b => b && g.deleteBuffer(b));
      if (this.noiseTex) g.deleteTexture(this.noiseTex);
    }
    this.canvas.remove();
  }
}
