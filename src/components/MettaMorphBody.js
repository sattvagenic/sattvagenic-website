// The somatic chart: front and back figures you paint with soft marks of light.
import React, { useEffect, useRef, memo } from 'react';
import { BODY_PATH, HEAD_PATH, FRONT_DETAIL, BACK_DETAIL } from './MettaMorphBodyPaths';

export const VIEW = { w: 200, h: 446 };
export const SENSATIONS = [
  { id: 'clench',   label: 'Clenching',      colour: '#C8703E' },
  { id: 'aversion', label: 'Aversion',       colour: '#A2526A' },
  { id: 'ease',     label: 'Release / ease', colour: '#86CDB0' },
  { id: 'warmth',   label: 'Warmth / joy',   colour: '#D9AA4E' },
  { id: 'other',    label: 'Something else', colour: '#B7B0D6' },
];
export const BRUSHES = [['Fine', 5], ['Medium', 9], ['Wide', 16]];
export const STRENGTHS = [['Faint', 0.2], ['Clear', 0.34], ['Strong', 0.52]];
const colourOf = id => (SENSATIONS.find(s => s.id === id) || SENSATIONS[4]).colour;
const silhouette = (() => { let p = null; return () => p || (p = (() => { const q = new Path2D(BODY_PATH); q.addPath(new Path2D(HEAD_PATH)); return q; })()); })();
// Hit-testing in viewBox units on an untransformed context.
let probe = null;
const insideBody = (x, y) => { probe = probe || document.createElement('canvas').getContext('2d'); return probe.isPointInPath(silhouette(), x, y); };

/* Name the area a mark sits in, for the written record. Coordinates are in the chart's viewBox. */
export function areaOf(view, x, y) {
  const dx = x - 100, side = view === 'front' ? (dx < 0 ? 'right' : 'left') : (dx < 0 ? 'left' : 'right');
  if (y < 57) return 'head';
  if (y < 74) return view === 'front' ? 'throat' : 'neck';
  if (Math.abs(dx) > 29 && y < 268) return `${side} ${y < 170 ? 'upper arm' : y < 226 ? 'forearm' : 'hand'}`;
  if (y > 238) return `${side} ${y < 310 ? 'thigh' : y < 400 ? 'lower leg' : 'foot'}`;
  if (view === 'front') return y < 124 ? 'chest' : y < 168 ? 'upper belly' : y < 206 ? 'lower belly' : 'pelvis';
  return y < 124 ? 'upper back' : y < 168 ? 'middle back' : y < 206 ? 'lower back' : 'sacrum';
}
export function describeMarks(strokes) {
  const seen = new Map();
  for (const s of strokes) {
    const mid = s.pts[Math.floor(s.pts.length / 2)];
    const key = `${s.view === 'back' ? 'back · ' : ''}${areaOf(s.view, mid[0], mid[1])}`;
    const label = (SENSATIONS.find(c => c.id === s.cat) || SENSATIONS[4]).label.toLowerCase();
    if (!seen.has(key)) seen.set(key, new Set());
    seen.get(key).add(label);
  }
  return [...seen].map(([area, labels]) => `${area}: ${[...labels].join(', ')}`);
}

function paint(canvas, strokes, view, live) {
  const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, w, h);
  ctx.setTransform(w / VIEW.w, 0, 0, h / VIEW.h, 0, 0);
  ctx.save(); ctx.clip(silhouette());
  ctx.globalCompositeOperation = 'screen';
  const all = live && live.view === view ? [...strokes, live] : strokes;
  for (const s of all) {
    if (s.view !== view) continue;
    const c = colourOf(s.cat), step = Math.max(1.2, s.size / 3.2);
    const stamp = (x, y) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, s.size);
      g.addColorStop(0, hexA(c, s.k)); g.addColorStop(0.55, hexA(c, s.k * 0.45)); g.addColorStop(1, hexA(c, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s.size, 0, Math.PI * 2); ctx.fill();
    };
    let prev = null;
    for (const p of s.pts) {
      if (!prev) { stamp(p[0], p[1]); prev = p; continue; }
      const d = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      if (d < step) continue;
      const n = Math.floor(d / step);
      for (let i = 1; i <= n; i++) stamp(prev[0] + (p[0] - prev[0]) * i / n, prev[1] + (p[1] - prev[1]) * i / n);
      prev = p;
    }
  }
  ctx.restore();
}
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}

const Figure = memo(function Figure({ view, strokes, editable, brush, onStroke }) {
  const canvasRef = useRef(null), live = useRef(null), boxRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current, box = boxRef.current;
    const fit = () => {
      const r = box.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
      paint(canvas, strokes, view, live.current);
    };
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(box);
    return () => ro && ro.disconnect();
  }, [strokes, view]);

  const toView = e => {
    const r = canvasRef.current.getBoundingClientRect();
    const round = v => Math.round(v * 10) / 10;
    return [round((e.clientX - r.left) / r.width * VIEW.w), round((e.clientY - r.top) / r.height * VIEW.h)];
  };
  const down = e => {
    if (!editable) return;
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    live.current = { view, cat: brush.cat, size: brush.size, k: brush.k, pts: [toView(e)] };
    paint(canvasRef.current, strokes, view, live.current);
  };
  const move = e => {
    if (!live.current) return;
    const p = toView(e), last = live.current.pts[live.current.pts.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.8) return;
    live.current.pts.push(p);
    paint(canvasRef.current, strokes, view, live.current);
  };
  const up = () => {
    if (!live.current) return;
    const s = live.current; live.current = null;
    if (s.pts.some(p => insideBody(p[0], p[1]))) onStroke(s);
    else paint(canvasRef.current, strokes, view, null);
  };

  return (
    <figure className="mm-figure">
      <div className="mm-figure-box" ref={boxRef}>
        <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} aria-hidden="true">
          <path d={BODY_PATH} className="mm-sil" /><path d={HEAD_PATH} className="mm-sil" />
          <g className="mm-det" dangerouslySetInnerHTML={{ __html: view === 'front' ? FRONT_DETAIL : BACK_DETAIL }} />
        </svg>
        <canvas ref={canvasRef} className={editable ? 'mm-paint' : 'mm-paint is-static'}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          aria-label={editable ? `${view === 'front' ? 'Front' : 'Back'} of the body: press and drag to mark where you feel it` : undefined}
          role={editable ? 'img' : undefined} />
      </div>
      <figcaption>{view === 'front' ? 'Anterior' : 'Posterior'}</figcaption>
    </figure>
  );
});

function BodyChart({ strokes, onStroke, brush, editable = true, compact = false }) {
  return (
    <div className={`mm-body${compact ? ' is-compact' : ''}`}>
      <Figure view="front" strokes={strokes} editable={editable} brush={brush} onStroke={onStroke} />
      <Figure view="back" strokes={strokes} editable={editable} brush={brush} onStroke={onStroke} />
    </div>
  );
}
export default memo(BodyChart);
