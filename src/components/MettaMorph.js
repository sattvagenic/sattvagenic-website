// Metta-Morph: a contemplative instrument for finding where liking turns to resistance.
// Everything happens on this device: images are never uploaded, and nothing is stored after the page closes.
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './MettaMorph.css';
import { prepareFaceMorph } from './MettaMorphGeometry';
import { MorphRenderer, coverCanvas, VIEW_W, VIEW_H } from './MettaMorphRenderer';
import BodyChart, { SENSATIONS, BRUSHES, STRENGTHS, describeMarks } from './MettaMorphBody';
import { EquanimityAudio } from './MettaMorphAudio';

const MODES = {
  compassion: {
    name: 'Compassion', a: 'Someone dear', b: 'Someone difficult',
    aHint: 'A face you feel warmly towards', bHint: 'A face you find hard to like',
    intro: 'A face you love slowly becomes one you find difficult. Watch for the moment the warmth begins to close, and where you feel it.',
    prompts: ['Rest with this face as it is.', 'Where does the warmth begin to close?', 'Can kindness reach this face too?'],
  },
  equanimity: {
    name: 'Equanimity', a: 'Something pleasant', b: 'Something repellent',
    aHint: 'An image you are drawn to', bHint: 'An image you would rather not look at',
    intro: 'Something you are drawn to slowly becomes something you resist. Watch for the moment wanting turns into pushing away, and where you feel it.',
    prompts: ['Rest with the image as it is.', 'Where does wanting turn to pushing away?', 'Can it be just as it is?'],
  },
};
const PACES = [[20, 'Brisk'], [40, 'Steady'], [80, 'Slow']];
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
const roman = n => ROMAN[n] || String(n);
const clock = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function loadImage(url) {
  return new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = url; });
}
function toCanvas(img, max = 2048) {
  const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, s = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c;
}
function thumbOf(canvas, width = 320) {
  const c = document.createElement('canvas'); c.width = width; c.height = Math.round(width * canvas.height / canvas.width);
  c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.85);
}

/* A worn glyph after the woodblock marks in the reference: a rail, rungs, a stack of bars and one rust triangle. */
function Glyph({ className = '' }) {
  return (
    <svg className={`mm-glyph ${className}`} viewBox="0 0 44 130" aria-hidden="true">
      <g fill="currentColor" filter="url(#mm-worn)">
        <rect x="6" y="6" width="32" height="5" rx="1.5" /><rect x="6" y="6" width="5" height="92" rx="1.5" />
        <rect x="15" y="18" width="16" height="3" /><rect x="15" y="27" width="10" height="3" /><rect x="15" y="36" width="19" height="3" />
        <rect x="15" y="45" width="6" height="3" /><rect x="24" y="45" width="9" height="3" /><rect x="15" y="54" width="14" height="3" />
        <circle cx="35" cy="28" r="1.8" /><circle cx="35" cy="56" r="1.8" /><circle cx="32" cy="64" r="1.5" />
        <rect x="15" y="64" width="11" height="3" /><rect x="15" y="73" width="17" height="3" /><rect x="15" y="82" width="8" height="3" />
        <rect x="6" y="104" width="32" height="4" rx="1" /><rect x="6" y="111" width="28" height="4" rx="1" /><rect x="6" y="118" width="32" height="4" rx="1" />
      </g>
      <path d="M15 9 L22 14 L15 14 Z" className="mm-glyph-tri" transform="translate(0 2)" />
    </svg>
  );
}

function StepHead({ n, title, hint }) {
  return (
    <header className="mm-step-head">
      <span className="mm-num">{n}</span>
      <div><h2>{title}</h2>{hint && <p>{hint}</p>}</div>
    </header>
  );
}

function Plate({ slot, label, hint, image, onFile, onClear }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const status = !image ? null : image.status === 'reading' ? 'Reading the image…' : image.face ? 'Face found' : 'No face found';
  return (
    <div className={`mm-plate${image ? ' is-loaded' : ''}${over ? ' is-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files[0], slot); }}>
      <div className="mm-plate-top">
        <span className={`mm-pole mm-pole-${slot ? 'b' : 'a'}`} aria-hidden="true" />
        <span className="mm-plate-label">{label}</span>
        {image && <button type="button" className="mm-x" onClick={() => onClear(slot)} aria-label={`Remove ${label.toLowerCase()}`}>×</button>}
      </div>
      <button type="button" className="mm-plate-frame" onClick={() => input.current.click()}
        aria-label={image ? `Change ${label.toLowerCase()}` : `Choose ${label.toLowerCase()}`}>
        {image ? <img src={image.thumb} alt="" /> : (
          <span className="mm-plate-empty"><span className="mm-plus" aria-hidden="true">+</span><span>{hint}</span><small>Choose or drop an image</small></span>
        )}
      </button>
      <p className="mm-plate-status" aria-live="polite">{status || ' '}</p>
      <input ref={input} type="file" accept="image/*" hidden onChange={e => { onFile(e.target.files[0], slot); e.target.value = ''; }} />
    </div>
  );
}

export default function MettaMorph() {
  const [mode, setMode] = useState('compassion');
  const [images, setImages] = useState([null, null]);
  const [choice, setChoice] = useState(null);            // the person's own choice of transition, if any
  const [amount, setAmount] = useState(0);
  const [cycling, setCycling] = useState(false);
  const [pace, setPace] = useState(40);
  const [pending, setPending] = useState(null);           // the shift marked on this crossing
  const [strokes, setStrokes] = useState([]);
  const [sensation, setSensation] = useState('clench');
  const [size, setSize] = useState(9);
  const [strength, setStrength] = useState(0.34);
  const [note, setNote] = useState('');
  const [log, setLog] = useState([]);
  const [open, setOpen] = useState(null);
  const [sound, setSound] = useState(false);
  const [volume, setVolume] = useState(25);
  const [message, setMessage] = useState('');
  const [invite, setInvite] = useState(false);

  const hostRef = useRef(null), rendererRef = useRef(null), amountRef = useRef(0), phaseRef = useRef(0);
  const audioRef = useRef(null), faceModule = useRef(null), tokens = useRef([0, 0]), bodyRef = useRef(null);
  const M = MODES[mode];

  /* ---------- images ---------- */
  const onFile = useCallback(async (file, slot) => {
    if (!file || !file.type || !file.type.startsWith('image/')) { if (file) setMessage('Please choose an image file.'); return; }
    const token = ++tokens.current[slot];
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const canvas = toCanvas(img); URL.revokeObjectURL(url);
      if (token !== tokens.current[slot]) return;
      setMessage('');
      setImages(prev => { const n = [...prev]; n[slot] = { canvas, thumb: thumbOf(canvas), face: null, status: 'reading' }; return n; });
      let face = null;
      try {
        faceModule.current = faceModule.current || import('./MettaMorphFace');
        face = await (await faceModule.current).detectFace(canvas);
      } catch (_) { face = null; }
      if (token !== tokens.current[slot]) return;
      setImages(prev => {
        if (!prev[slot] || prev[slot].canvas !== canvas) return prev;
        const n = [...prev]; n[slot] = { ...prev[slot], face, status: face ? 'face' : 'none' }; return n;
      });
    } catch (_) { URL.revokeObjectURL(url); setMessage('That image could not be opened.'); }
  }, []);
  const onClear = useCallback(slot => {
    tokens.current[slot]++;
    setImages(prev => { const n = [...prev]; n[slot] = null; return n; });
  }, []);

  const ready = !!(images[0] && images[1] && images[0].status !== 'reading' && images[1].status !== 'reading');
  const bothFaces = ready && !!images[0].face && !!images[1].face;
  const want = choice || (mode === 'compassion' ? 'face' : 'erode');
  const transition = !ready ? null : (want === 'face' && bothFaces ? 'face' : 'erode');

  /* ---------- renderer ---------- */
  useEffect(() => {
    const r = new MorphRenderer(hostRef.current);
    rendererRef.current = r;
    return () => { r.dispose(); rendererRef.current = null; };
  }, []);
  useEffect(() => {
    const r = rendererRef.current; if (!r) return;
    if (!transition) { r.clear(); return; }
    try {
      if (transition === 'face') {
        const prep = prepareFaceMorph([{ img: images[0].canvas, face: images[0].face }, { img: images[1].canvas, face: images[1].face }], VIEW_W, VIEW_H);
        r.setFace(prep.layers, prep.mesh);
      } else r.setErode(coverCanvas(images[0].canvas), coverCanvas(images[1].canvas));
      r.render(amountRef.current / 100);
    } catch (_) {
      setMessage('These faces could not be aligned, so the images will erode into each other instead.');
      setChoice('erode');
    }
  }, [transition, images]);
  useEffect(() => {
    amountRef.current = amount;
    if (rendererRef.current) rendererRef.current.render(amount / 100);
    if (audioRef.current) audioRef.current.setAmount(amount);
  }, [amount]);

  /* ---------- the slow cycle ---------- */
  useEffect(() => {
    if (!cycling) return undefined;
    let raf = 0, last = performance.now();
    const step = now => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      phaseRef.current = (phaseRef.current + dt / pace) % 2;
      const p = phaseRef.current < 1 ? phaseRef.current : 2 - phaseRef.current;
      setAmount(Math.round((50 - 50 * Math.cos(Math.PI * p)) * 10) / 10);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [cycling, pace]);
  useEffect(() => {
    const away = () => {
      if (!document.hidden) return;
      setCycling(false);
      if (audioRef.current) { audioRef.current.dispose(); audioRef.current = null; setSound(false); }
    };
    document.addEventListener('visibilitychange', away);
    return () => document.removeEventListener('visibilitychange', away);
  }, []);
  const syncPhase = v => {
    // Continue the cycle from wherever the slider was left, in the same direction.
    const p = Math.acos(Math.max(-1, Math.min(1, 1 - v / 50))) / Math.PI;
    phaseRef.current = phaseRef.current > 1 ? 2 - p : p;
  };
  const onSlide = e => { const v = Number(e.target.value) / 10; setCycling(false); syncPhase(v); setAmount(v); };
  const backToStart = () => { setCycling(false); phaseRef.current = 0; setAmount(0); };
  const markShift = () => {
    setCycling(false);
    const pct = Math.round(amountRef.current);
    setPending(pct);
    setMessage(`Marked at ${pct}%. Now find it in the body, and put a word to it.`);
    setInvite(true);
    setTimeout(() => setInvite(false), 2600);
  };

  /* ---------- sound (Equanimity) ---------- */
  const stopSound = () => { if (audioRef.current) { audioRef.current.dispose(); audioRef.current = null; } setSound(false); };
  const toggleSound = async () => {
    if (audioRef.current) { stopSound(); return; }
    try {
      const a = new EquanimityAudio({ amount: amountRef.current });
      audioRef.current = a;
      await a.start(volume);
      setSound(true);
    } catch (_) { stopSound(); setMessage('Sound could not start in this browser.'); }
  };
  useEffect(() => { if (audioRef.current) audioRef.current.setVolume(volume); }, [volume]);
  useEffect(() => {
    if (mode !== 'equanimity' && audioRef.current) { audioRef.current.dispose(); audioRef.current = null; setSound(false); }
  }, [mode]);
  useEffect(() => () => { if (audioRef.current) audioRef.current.dispose(); }, []);

  /* ---------- body, words and the record ---------- */
  const brush = useMemo(() => ({ cat: sensation, size, k: strength }), [sensation, size, strength]);
  const onStroke = useCallback(s => setStrokes(prev => [...prev, s]), []);
  const areas = useMemo(() => describeMarks(strokes), [strokes]);
  const canSave = pending !== null || strokes.length > 0 || note.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    const entry = {
      n: log.length + 1, at: new Date(), mode, transition: transition || 'none',
      pct: pending !== null ? pending : Math.round(amount), marked: pending !== null,
      strokes, areas, note: note.trim(), snap: rendererRef.current && transition ? rendererRef.current.snapshot() : null,
    };
    setLog(prev => [...prev, entry]);
    setPending(null); setStrokes([]); setNote('');
    setMessage(`Saved as ${roman(entry.n)}. Cross again whenever you are ready.`);
  };
  const download = () => {
    const lines = [`Metta-Morph · record of ${new Date().toLocaleString()}`, ''];
    for (const o of log) {
      lines.push(`${roman(o.n)}.  ${clock(o.at)} · ${MODES[o.mode].name} · ${o.transition === 'face' ? 'faces morphing' : 'erosion'} · ${o.marked ? 'shift marked at' : 'paused at'} ${o.pct}%`);
      if (o.areas.length) lines.push(`    Body: ${o.areas.join('; ')}`);
      if (o.note) lines.push(`    Notes: ${o.note.replace(/\n/g, '\n           ')}`);
      lines.push('');
    }
    lines.push('Data, for your own analysis (JSON):');
    lines.push(JSON.stringify(log.map(({ snap, ...o }) => ({ ...o, at: o.at.toISOString() }))));
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `metta-morph-${new Date().toISOString().slice(0, 10)}.txt`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const prompt = amount < 12 ? M.prompts[0] : amount > 88 ? M.prompts[2] : M.prompts[1];
  const past = log.filter(o => o.mode === mode && o.marked).map(o => o.pct);
  const shown = Math.round(amount);

  return (
    <div className="mm-root">
      <svg className="mm-defs" aria-hidden="true" focusable="false">
        <filter id="mm-worn"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" /></filter>
      </svg>

      <header className="mm-head">
        <Glyph />
        <div className="mm-head-text">
          <p className="mm-kicker">Sattvagenic · contemplative instruments</p>
          <h1 className="mm-title">Metta-Morph</h1>
          <p className="mm-deva" lang="sa">मैत्री रूप</p>
        </div>
        <p className="mm-lede">Change the image.<br />Notice where the feeling turns.</p>
      </header>

      <section className="mm-intent" aria-label="Intention">
        <div className="mm-seg" role="radiogroup" aria-label="Intention">
          {Object.entries(MODES).map(([id, m]) => (
            <button key={id} type="button" role="radio" aria-checked={mode === id} className={mode === id ? 'is-on' : ''}
              onClick={() => { setMode(id); setChoice(null); }}>{m.name}</button>
          ))}
        </div>
        <p className="mm-intro">{M.intro}</p>
      </section>

      <section className="mm-step">
        <StepHead n="I" title="Offer two images" hint="They stay on this device. Nothing is uploaded." />
        <div className="mm-plates">
          <Plate slot={0} label={M.a} hint={M.aHint} image={images[0]} onFile={onFile} onClear={onClear} />
          <div className="mm-plates-arrow" aria-hidden="true">⟶</div>
          <Plate slot={1} label={M.b} hint={M.bHint} image={images[1]} onFile={onFile} onClear={onClear} />
        </div>
      </section>

      <section className="mm-step">
        <StepHead n="II" title="Cross the threshold" hint="Move slowly, or let it cycle. Mark the moment something shifts." />
        <div className="mm-stage">
          <span className="mm-tick tl" aria-hidden="true" /><span className="mm-tick tr" aria-hidden="true" />
          <span className="mm-tick bl" aria-hidden="true" /><span className="mm-tick br" aria-hidden="true" />
          <div className={`mm-window ${transition || 'is-empty'}`}>
            <div ref={hostRef} className="mm-canvas-host" role="img"
              aria-label={transition ? `${M.a} becoming ${M.b.toLowerCase()}, ${shown}% of the way` : 'Empty until two images are offered'} />
            <div className="mm-vignette" aria-hidden="true" />
            {!transition && (
              <div className="mm-empty">
                <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="22" /><circle cx="30" cy="30" r="13" /><circle cx="30" cy="30" r="2.2" className="dot" /></svg>
                <p>{images[0] || images[1] ? (ready ? '' : 'Reading…') : 'Offer two images to begin'}</p>
              </div>
            )}
          </div>
          <span className="mm-readout" aria-hidden="true">{String(shown).padStart(3, '0')}<small>%</small></span>
          <span className="mm-stage-label" aria-hidden="true">{transition === 'face' ? 'Faces · mesh' : transition === 'erode' ? 'Erosion' : ''}</span>
        </div>

        <div className="mm-scale">
          <div className="mm-ends"><span className="mm-end-a">{M.a}</span><span className="mm-end-b">{M.b}</span></div>
          <div className="mm-track">
            <div className="mm-marks" aria-hidden="true">
              {past.map((p, i) => <span key={i} className="mm-mark is-past" style={{ left: `${p}%` }} />)}
              {pending !== null && <span className="mm-mark" style={{ left: `${pending}%` }} />}
            </div>
            <input type="range" min="0" max="1000" step="1" value={Math.round(amount * 10)} onChange={onSlide}
              disabled={!transition} aria-label={`From ${M.a.toLowerCase()} to ${M.b.toLowerCase()}`} aria-valuetext={`${shown}%`}
              className={cycling ? 'is-live' : ''} />
            <div className="mm-rule" aria-hidden="true">{Array.from({ length: 11 }, (_, i) => <i key={i} />)}</div>
          </div>
        </div>

        <div className="mm-controls">
          <div className="mm-controls-left">
            <button type="button" className="mm-btn" disabled={!transition} onClick={() => setCycling(c => !c)} aria-pressed={cycling}>
              {cycling ? '❙❙  Pause' : '▷  Slow cycle'}
            </button>
            <label className="mm-select"><span className="sr">Cycle pace</span>
              <select value={pace} onChange={e => setPace(Number(e.target.value))}>
                {PACES.map(([s, n]) => <option key={s} value={s}>{n} · {s}s each way</option>)}
              </select>
            </label>
            <button type="button" className="mm-btn is-quiet" disabled={!transition || amount === 0} onClick={backToStart}>↺  Back to start</button>
          </div>
          <button type="button" className="mm-btn is-mark" disabled={!transition} onClick={markShift}>
            <span className="mm-tri" aria-hidden="true" />Mark the shift
          </button>
        </div>

        {(bothFaces || mode === 'equanimity') && (
          <div className="mm-options">
            {bothFaces && (
              <div className="mm-seg is-small" role="radiogroup" aria-label="Transition">
                <button type="button" role="radio" aria-checked={transition === 'face'} className={transition === 'face' ? 'is-on' : ''} onClick={() => setChoice('face')}>Morph the faces</button>
                <button type="button" role="radio" aria-checked={transition === 'erode'} className={transition === 'erode' ? 'is-on' : ''} onClick={() => setChoice('erode')}>Erode</button>
              </div>
            )}
            {mode === 'equanimity' && (
              <div className="mm-sound">
                <button type="button" className={`mm-btn is-quiet${sound ? ' is-on' : ''}`} onClick={toggleSound} aria-pressed={sound}>{sound ? '◉  Sound on' : '○  Sound'}</button>
                {sound && <label className="mm-vol"><span>Volume</span><input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} /></label>}
              </div>
            )}
          </div>
        )}

        <p className="mm-prompt">{prompt}</p>
        <p className="mm-message" role="status">{message}</p>
      </section>

      <div className="mm-pair">
        <section className={`mm-step mm-locate${invite ? ' is-invited' : ''}`} ref={bodyRef}>
          <StepHead n="III" title="Locate it in the body" hint="Paint where the response shows up. It can stay empty." />
          <div className="mm-locate-grid">
            <BodyChart strokes={strokes} onStroke={onStroke} brush={brush} />
            <div className="mm-tools">
              <p className="mm-label">What do you notice?</p>
              <div className="mm-sensations" role="radiogroup" aria-label="Sensation">
                {SENSATIONS.map(s => (
                  <button key={s.id} type="button" role="radio" aria-checked={sensation === s.id} className={sensation === s.id ? 'is-on' : ''}
                    onClick={() => setSensation(s.id)} style={{ '--c': s.colour }}>
                    <i aria-hidden="true" />{s.label}
                  </button>
                ))}
              </div>
              <p className="mm-label">Brush</p>
              <div className="mm-seg is-small" role="radiogroup" aria-label="Brush size">
                {BRUSHES.map(([n, v]) => <button key={n} type="button" role="radio" aria-checked={size === v} className={size === v ? 'is-on' : ''} onClick={() => setSize(v)}>{n}</button>)}
              </div>
              <p className="mm-label">Intensity</p>
              <div className="mm-seg is-small" role="radiogroup" aria-label="Intensity">
                {STRENGTHS.map(([n, v]) => <button key={n} type="button" role="radio" aria-checked={strength === v} className={strength === v ? 'is-on' : ''} onClick={() => setStrength(v)}>{n}</button>)}
              </div>
              <div className="mm-tool-row">
                <button type="button" className="mm-link" disabled={!strokes.length} onClick={() => setStrokes(s => s.slice(0, -1))}>Undo</button>
                <button type="button" className="mm-link" disabled={!strokes.length} onClick={() => setStrokes([])}>Clear</button>
              </div>
            </div>
          </div>
        </section>

        <section className="mm-step mm-words">
          <StepHead n="IV" title="Put it into words" hint="What happened at the moment of change?" />
          <textarea value={note} onChange={e => { setNote(e.target.value); if (cycling) setCycling(false); }}
            placeholder="A sensation, an emotion, a thought… or something harder to name. “Nothing clear” is useful too." aria-label="Notes" />
          <dl className="mm-summary">
            <div><dt>Intention</dt><dd>{M.name}</dd></div>
            <div><dt>Shift</dt><dd>{pending !== null ? `marked at ${pending}%` : 'not marked yet'}</dd></div>
            <div><dt>Body</dt><dd>{areas.length ? areas.join('; ') : 'no marks yet'}</dd></div>
          </dl>
          <button type="button" className="mm-btn is-save" disabled={!canSave} onClick={save}>Save to the record</button>
        </section>
      </div>

      <section className="mm-ledger" aria-label="Record">
        <div className="mm-ledger-head">
          <h2>Record <small>{String(log.length).padStart(2, '0')}</small></h2>
          <button type="button" className="mm-btn is-quiet" disabled={!log.length} onClick={download}>↓  Download the record</button>
        </div>
        {log.length === 0 ? (
          <p className="mm-ledger-empty">Each saved crossing appears here: where it turned, where you felt it, what you noticed. It lasts until you close the page, so download it to keep it.</p>
        ) : (
          <ol className="mm-entries">
            {log.map(o => (
              <li key={o.n} className={open === o.n ? 'is-open' : ''}>
                <button type="button" className="mm-entry" onClick={() => setOpen(open === o.n ? null : o.n)} aria-expanded={open === o.n}>
                  <span className="mm-entry-n">{roman(o.n)}</span>
                  {o.snap ? <img src={o.snap} alt="" /> : <span className="mm-entry-blank" />}
                  <span className="mm-entry-main">
                    <span className="mm-entry-top">{MODES[o.mode].name} · {o.marked ? 'shifted at' : 'paused at'} <b>{o.pct}%</b> · {clock(o.at)}</span>
                    <span className="mm-entry-note">{o.note || (o.areas[0] || 'no notes')}</span>
                  </span>
                  <span className="mm-entry-bar" aria-hidden="true"><i style={{ left: `${o.pct}%` }} /></span>
                </button>
                {open === o.n && (
                  <div className="mm-entry-detail">
                    <BodyChart strokes={o.strokes} editable={false} compact brush={brush} onStroke={onStroke} />
                    <div>
                      {o.areas.length > 0 && <p><b>Body</b> {o.areas.join('; ')}</p>}
                      {o.note && <p><b>Notes</b> {o.note}</p>}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <details className="mm-guide">
        <summary>How to practise</summary>
        <ol>
          <li>Choose an intention. <b>Compassion</b> works with faces: someone you love and someone you find difficult. <b>Equanimity</b> works with anything: something you are drawn to and something you would rather not see.</li>
          <li>Offer the two images. Faces are aligned on their features and morph through a shared shape, so at every point you see one face, never two. Other images erode into each other through a weathered grain.</li>
          <li>Move the slider slowly, or let it cycle. Keep your attention on your own response more than on the picture.</li>
          <li>When something shifts (warmth closing, a flinch, a tightening, or the reverse) press <b>Mark the shift</b>. Then paint where you feel it, and put a few words to it.</li>
          <li>Save it, and cross again. Over a session the record shows where your threshold sits and how it moves.</li>
        </ol>
        <p>Strong images can bring up strong feelings. Go gently, and stop whenever you need to.</p>
      </details>
      <p className="mm-foot">Metta-Morph runs entirely in your browser. Images and notes are never uploaded or stored.</p>
    </div>
  );
}
